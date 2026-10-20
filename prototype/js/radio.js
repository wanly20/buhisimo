// Radio Búho: a listening / podcast player with a karaoke transcript (the current
// line and the current word light up). Episode files use the word-timing format of
// video_generation/scripts/align_lyrics.py (as read by music/karaoke_demo.html):
//   {audio, duration, lines: [{text, section, start, end, words: [{word, start, end}]}]}
// Words may also be {w, start, end}. Optional extras: title, demo, note; per line
// speaker and en. Episodes are listed in radio/episodes.json.
import { icon } from "./icons.js";
import { $, $$, esc, charImg } from "./ui.js";
import { tts } from "./speech.js";
import { RADIO } from "../course.js";
import { audioSoon, hasAudio } from "./lesson.js";

let episodes = null;
async function loadEpisodes() {
  if (episodes) return episodes;
  try {
    const idx = await (await fetch("radio/episodes.json")).json();
    episodes = await Promise.all(idx.episodes.map(async (e) => {
      const data = normalise(await (await fetch(`radio/${e.json}`)).json());
      return { ...e, data, src: `radio/${data.audio}` };
    }));
  } catch {
    episodes = [];
  }
  return episodes;
}

/** Accept align_lyrics.py output (and {w,…} words); fill line text/start/end if missing. */
export function normalise(d) {
  const lines = (d.lines || []).map((l) => {
    const words = (l.words || []).map((w) => ({ word: w.word ?? w.w ?? "", start: +w.start || 0, end: +w.end || +w.start || 0 }));
    return { ...l, words, text: l.text ?? words.map((w) => w.word).join(" "), start: l.start ?? words[0]?.start ?? 0, end: l.end ?? words.at(-1)?.end ?? 0 };
  });
  return { ...d, lines };
}

const fmt = (t) => { t = Math.max(0, t || 0); return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`; };
const SPEAKER_ART = { "Buhísimo": "owl-explaining", Matilda: "matilda", Max: "max" };

let player = null; // the one live player (paused when the view goes away)

export function stopRadio() { player?.dispose(); player = null; }

/**
 * Render Radio Búho into `host` (the view area of the path screen): a list of episodes (the 1.1
 * demo, then each lesson episode, e.g. 1.2 «¡Hola, Buhísimo!», shown once its lesson is open:
 * isOpen(lessonId) comes from the path's locks) and the chosen one.
 */
export async function mountRadio(host, { isOpen = () => true, titleOf = (id) => id } = {}) {
  stopRadio();
  host.innerHTML = `<div class="view view-radio"><p class="radio-loading">${icon("radio", 20, 2.5)} Tuning in…</p></div>`;
  const recorded = await loadEpisodes();
  if (!host.isConnected) return;
  const lessonEps = RADIO.filter((e) => e.inTab !== false).map((e) => ({ ...e, kind: "lesson", open: isOpen(e.lesson) }));
  const eps = [...recorded.map((e) => ({ ...e, kind: "audio", open: true })), ...lessonEps];
  if (!eps.length) { host.innerHTML = `<div class="view view-radio"><p class="radio-loading">Radio Búho can't load right now. Check the internet and try again.</p></div>`; return; }
  const outer = $(".view-radio", host);
  outer.innerHTML = `${eps.length > 1 ? `<nav class="radio-eps" aria-label="Radio Búho episodes">${eps.map((e, i) => `
      <button class="radio-ep-chip" data-ep="${i}" aria-pressed="${i === 0}" ${e.open ? "" : "disabled"}>${icon(e.open ? "radio" : "lock", 16, 2.5)}<span>${e.kind === "audio" ? `Unit ${esc(e.unit)} · demo` : `Unit ${esc(e.unit)} · ${e.titleEs ? `<span lang="es">${esc(e.titleEs)}</span>` : esc(e.titleEn)}`}</span></button>`).join("")}</nav>` : ""}
    <div class="radio-ep"></div>`;
  const show = (i) => {
    stopRadio();
    $$(".radio-ep-chip", outer).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.ep === i)));
    const box = $(".radio-ep", outer);
    if (eps[i].kind === "audio") renderAudioEpisode(box, eps[i]);
    else renderLessonEpisode(box, eps[i], titleOf);
  };
  outer.addEventListener("click", (e) => { const b = e.target.closest(".radio-ep-chip"); if (b && !b.disabled) show(+b.dataset.ep); });
  const locked = lessonEps.filter((e) => !e.open);
  if (locked.length) outer.querySelector(".radio-eps")?.insertAdjacentHTML("beforeend", `<p class="radio-eps__note">${icon("lock", 14, 2.75)} New episodes open with their lessons.</p>`);
  show(0);
}

/** A lesson episode that isn't recorded yet: the transcript to read, a play button per recorded line. */
function renderLessonEpisode(view, ep, titleOf) {
  const NAME = { buho: "Buhísimo", matilda: "Matilda", max: "Max", song: "Song", caller: "Caller" };
  view.innerHTML = `
    <header class="view-hero view-hero--radio">
      ${charImg("owl-explaining", "view-hero__owl")}
      <div class="view-hero__text">
        <span class="panel-kicker">${icon("radio", 16, 2.75)} Radio Búho · Unit ${esc(ep.unit)}</span>
        <h1 class="h-title" tabindex="-1">${ep.titleEs ? `<span lang="es" class="es">${esc(ep.titleEs)}</span>` : esc(ep.titleEn)}</h1>
        <p class="view-sub">“${esc(ep.titleEn)}” From the lesson ${esc(titleOf(ep.lesson))}. Read along; tap EN for the English.</p>
        <p class="radio-demo">${audioSoon(true)}<span>This episode isn't recorded yet. ${ep.lines.some((l) => l.who === "song") ? "The song is on its way too." : ""}</span></p>
      </div>
    </header>
    <div class="tr-tools"><button class="radio-chip" data-radio="en" aria-pressed="false">EN</button></div>
    <ol class="karaoke karaoke--read" aria-label="Transcript">
      ${ep.lines.map((l, i) => `
        <li class="k-line" data-line="${i}">
          <span class="k-speaker">${SPEAKER_ART[NAME[l.who]] ? charImg(SPEAKER_ART[NAME[l.who]], "k-speaker__img") : `<span class="k-speaker__icon">${icon(l.who === "song" ? "radio" : "user", 16, 2.5)}</span>`}${esc(l.nameEn || NAME[l.who] || "")}</span>
          <p class="k-words" lang="es">${hasAudio(l.es) ? `<button class="radio-chip" data-say="${i}" aria-label="Play line ${i + 1}">${icon("volume-2", 16, 2.5)}</button> ` : ""}${esc(l.es)}</p>
          <p class="k-en" hidden>${esc(l.en)}</p>
        </li>`).join("")}
    </ol>`;
  view.addEventListener("click", (e) => {
    const b = e.target.closest("[data-radio=en]");
    if (b) { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); $$(".k-en", view).forEach((p) => (p.hidden = !on)); return; }
    const s = e.target.closest("[data-say]");
    if (s) { const l = ep.lines[+s.dataset.say]; tts.speak(l.es, { role: l.who === "buho" ? "buho" : l.who === "max" ? "raul" : "maria" }); }
  });
}

/** A recorded episode: the player with the karaoke transcript. */
function renderAudioEpisode(view, ep) {
  const { data } = ep;
  view.innerHTML = `
    <header class="view-hero view-hero--radio">
      ${charImg(ep.art || "owl-explaining", "view-hero__owl")}
      <div class="view-hero__text">
        <span class="panel-kicker">${icon("radio", 16, 2.75)} Radio Búho · Unit ${esc(ep.unit)}</span>
        <h1 class="h-title" tabindex="-1">${data.title ? `<span lang="es" class="es">${esc(data.title)}</span>` : esc(ep.titleEn)}</h1>
        <p class="view-sub">“${esc(ep.titleEn)}” Listen and read along: the words light up as Buhísimo and his callers say them.</p>
        ${ep.demo || data.demo ? `<p class="radio-demo">${icon("info", 16, 2.75)}<span><b>Demo episode.</b> ${esc(data.note || "Built from test recordings with estimated timings.")}</span></p>` : ""}
      </div>
    </header>
    <section class="radio-player" aria-label="Player">
      <button class="press icon-btn icon-btn--primary radio-play" data-radio="play" aria-label="Play"><span class="face">${icon("play", 34, 2.5)}</span></button>
      <div class="radio-controls">
        <input class="radio-seek" type="range" min="0" max="${Math.ceil(data.duration * 10)}" value="0" step="1" aria-label="Position">
        <div class="radio-row">
          <span class="radio-time" aria-live="off"><span data-t>0:00</span> / ${fmt(data.duration)}</span>
          <div class="radio-btns">
            <button class="radio-chip" data-radio="prev" aria-label="Previous line">${icon("skip-back", 18, 2.5)}</button>
            <button class="radio-chip" data-radio="next" aria-label="Next line">${icon("skip-forward", 18, 2.5)}</button>
            <button class="radio-chip" data-radio="rate" aria-label="Speed" aria-pressed="false">${icon("turtle", 18, 2.5)}<span>0.75×</span></button>
            <button class="radio-chip" data-radio="en" aria-pressed="false">EN</button>
          </div>
        </div>
      </div>
    </section>
    <ol class="karaoke" aria-label="Transcript">
      ${data.lines.map((l, i) => `
        <li class="k-line" data-line="${i}">
          ${l.speaker ? `<span class="k-speaker">${SPEAKER_ART[l.speaker] ? charImg(SPEAKER_ART[l.speaker], "k-speaker__img") : `<span class="k-speaker__icon">${icon("user", 16, 2.5)}</span>`}${esc(l.speaker)}</span>` : ""}
          ${l.section ? `<span class="k-section">${esc(l.section)}</span>` : ""}
          <p class="k-words" lang="${esc(data.language || "es")}">${l.words.map((w, j) => `<span class="k-w" data-w="${j}" style="--p:0%">${esc(w.word)}</span>`).join(" ")}</p>
          ${l.en ? `<p class="k-en" hidden>${esc(l.en)}</p>` : ""}
        </li>`).join("")}
    </ol>
    <p class="radio-keys">${icon("keyboard", 16, 2.5)} Space = play/pause · ← → = line before/after · tap a word to jump there</p>`;

  const audio = new Audio();
  audio.preload = "auto";
  // Load the whole file as a blob: it works offline from the service-worker cache
  // (media range requests aren't cached) and seeking is instant. Episodes are small.
  let blobUrl = null;
  audio.src = ep.src;
  fetch(ep.src).then((r) => (r.ok ? r.blob() : null)).then((b) => {
    if (!b || !view.isConnected || !audio.paused || audio.currentTime > 0) return;
    blobUrl = URL.createObjectURL(b);
    audio.src = blobUrl;
  }).catch(() => {});
  const lines = data.lines;
  const lineEls = $$(".k-line", view);
  const seek = $(".radio-seek", view);
  const tEl = $("[data-t]", view);
  const playBtn = $('[data-radio="play"]', view);
  let cur = -2, raf = 0, dragging = false;

  function lineAt(t) {
    let i = -1;
    for (let k = 0; k < lines.length; k++) if (t >= lines[k].start - 0.15) i = k; else break;
    return i;
  }
  function render() {
    const t = audio.currentTime || 0;
    const i = lineAt(t);
    if (i !== cur) {
      lineEls.forEach((el, k) => { el.classList.toggle("is-now", k === i); el.classList.toggle("is-past", k < i); });
      if (i >= 0 && !audio.paused) lineEls[i].scrollIntoView({ block: "center", behavior: "smooth" });
      cur = i;
    }
    if (i >= 0) {
      $$(".k-w", lineEls[i]).forEach((el, j) => {
        const w = lines[i].words[j];
        const p = t < w.start ? 0 : t >= w.end ? 1 : (t - w.start) / Math.max(0.05, w.end - w.start);
        el.style.setProperty("--p", `${(p * 100).toFixed(1)}%`);
        el.classList.toggle("is-now", p > 0 && p < 1);
        el.classList.toggle("is-done", p >= 1);
      });
    }
    if (!dragging) seek.value = Math.round(t * 10);
    tEl.textContent = fmt(t);
  }
  const loop = () => { render(); if (!audio.paused) raf = requestAnimationFrame(loop); };
  const setPlaying = (on) => {
    playBtn.querySelector(".face").innerHTML = icon(on ? "pause" : "play", 34, 2.5);
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    view.classList.toggle("is-playing", on);
  };
  audio.addEventListener("play", () => { setPlaying(true); cancelAnimationFrame(raf); loop(); });
  audio.addEventListener("pause", () => { setPlaying(false); render(); });
  audio.addEventListener("ended", () => { setPlaying(false); render(); });
  audio.addEventListener("seeked", render);
  audio.addEventListener("timeupdate", () => { if (audio.paused) render(); });

  const toggle = () => { if (audio.paused) { tts.stop(); audio.play().catch(() => {}); } else audio.pause(); };
  const jump = (t, play = false) => { audio.currentTime = Math.max(0, Math.min(data.duration, t)); render(); if (play && audio.paused) audio.play().catch(() => {}); };
  const go = (d) => { const i = Math.max(0, Math.min(lines.length - 1, (cur < 0 ? -1 : cur) + d)); jump(lines[i].start, !audio.paused); };

  view.addEventListener("click", (e) => {
    const b = e.target.closest("[data-radio]");
    const w = e.target.closest(".k-w");
    if (w) { const li = +w.closest(".k-line").dataset.line; jump(lines[li].words[+w.dataset.w].start, true); return; }
    if (!b) return;
    const a = b.dataset.radio;
    if (a === "play") toggle();
    if (a === "prev") go(-1);
    if (a === "next") go(1);
    if (a === "rate") { const slow = audio.playbackRate === 1; audio.playbackRate = slow ? 0.75 : 1; b.setAttribute("aria-pressed", String(slow)); }
    if (a === "en") { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); $$(".k-en", view).forEach((p) => (p.hidden = !on)); }
  });
  seek.addEventListener("input", () => { dragging = true; tEl.textContent = fmt(seek.value / 10); });
  seek.addEventListener("change", () => { dragging = false; jump(seek.value / 10); });
  const onKey = (e) => {
    if (!view.isConnected || document.querySelector(".modal") || e.target.closest?.("input, textarea")) return;
    if (e.code === "Space" && !e.target.closest?.("button")) { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };
  document.addEventListener("keydown", onKey);
  render();
  // Test hook: the player's audio element and the current line/word.
  window.__radio = { audio, now: () => ({ line: cur, word: $$(".k-line.is-now .k-w.is-now", view).map((x) => x.textContent) }), render, lines };
  player = { dispose() { audio.pause(); cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey); audio.removeAttribute("src"); audio.load(); if (blobUrl) URL.revokeObjectURL(blobUrl); } };
}
