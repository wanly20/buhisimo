// Exercise types added for Unit 1.2 (the alphabet, spelling, songs and Radio Búho in a lesson).
// They plug into the 1.1 lesson runner (js/lesson.js) and reuse its helpers, so the engine is
// shared, not forked. Every step type returns the same controller shape as js/lesson.js:
// { el, mount?(), check?() -> result, onMain?(), footer, aside?, onKey?(), destroy?() }.
import { icon } from "./icons.js";
import { $, $$, esc, es, rich, el, charImg, restartAnim, reducedMotion } from "./ui.js";
import { sfx } from "./sound.js";
import { face, faceEn } from "./art.js";
import { episodeById } from "../course.js";
import { hasAudio, audioSoon, head, choiceController, typeIt, grade } from "./lesson.js";

const BEAT_MS = 667; // 90 BPM (content plan §11.3): one word per beat

// ------------------------------------------------------------ letter card (show)
// A group of letters with their Spanish names; tap a letter to hear its name.
export function letters(step, api) {
  const audible = step.letters.some((x) => hasAudio(x.es));
  const node = el(`
    <div class="ex ex-letters">
      ${head(esc(step.titleEn || "New letters"), `<span class="badge">${icon("sparkles", 16, 2.75)} New letters</span>`)}
      <div class="letter-grid ${step.letters.length > 6 ? "letter-grid--many" : ""}" role="group" aria-label="Letters and their names">
        ${step.letters.map((x, k) => `
          <button class="press letter-card" data-k="${k}" aria-label="${esc(x.l)}: ${esc(x.es)}">
            <span class="face"><span class="letter-card__l" aria-hidden="true">${esc(x.l)}</span>${es(x.es, "letter-card__es")}</span>
          </button>`).join("")}
      </div>
      ${audible ? "" : `<div class="letters-soon">${audioSoon(true)}<span>Say each name out loud yourself.</span></div>`}
      ${step.noteEn ? `<p class="note">${icon("lightbulb", 20, 2.5)}<span>${rich(step.noteEn)}</span></p>` : ""}
    </div>`);
  node.addEventListener("click", (e) => {
    const b = e.target.closest(".letter-card");
    if (!b) return;
    sfx.select();
    restartAnim(b, "pop");
    b.classList.add("is-heard");
    api.speak(step.letters[+b.dataset.k].es);
  });
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    onMain() { sfx.tap(); api.next(); },
    onKey(n) { $$(".letter-card", node)[n - 1]?.click(); },
  };
}

// ------------------------------------------------------------ letter pick (practise)
// Hear a letter name (or read it, while it isn't recorded) → tap the letter.
export function letterpick(step, api) {
  const audible = hasAudio(step.sayEs);
  const node = el(`
    <div class="ex ex-letterpick">
      ${head(audible ? "Tap the letter you hear" : "Which letter is it?")}
      <div class="letterpick-stage">
        ${audible
          ? `<button class="press icon-btn icon-btn--primary listen-big" data-audio="normal" aria-label="Play the letter name"><span class="face">${icon("volume-2", 48, 2.5)}</span></button>`
          : `<span class="letterpick-name">${es(step.sayEs)}</span>${audioSoon(true)}`}
      </div>
      <div class="options letter-options" role="group">
        ${step.letters.map((l, k) => `<button class="press option letter-option" data-oi="${k}" aria-pressed="false" aria-label="${esc(l)}"><span class="face"><span class="key" aria-hidden="true">${k + 1}</span><span class="letter-option__l">${esc(l)}</span></span></button>`).join("")}
      </div>
    </div>`);
  node.addEventListener("click", (e) => { if (e.target.closest("[data-audio]")) api.speak(step.sayEs); });
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.sayEs, answerEn: `the letter ${step.letters[step.answer]}` }),
    ctrl: { mount() { if (audible) setTimeout(() => api.speak(step.sayEs), 350); } },
  });
}

// ------------------------------------------------------------ spelling dictation
// Hear a word spelt letter by letter (or read the spelling) → type the word. The typing engine
// (accent fix-up, capital letters) does the grading.
export function spell(step, api) {
  const audible = hasAudio(step.sayEs);
  const headHtml = `
    <div class="spell-prompt">
      ${audible
        ? `<div class="spell-audio"><button class="press icon-btn icon-btn--primary" data-spell="normal" aria-label="Play the spelling"><span class="face">${icon("volume-2", 30)}</span></button><button class="press icon-btn icon-btn--secondary" data-spell="slow" aria-label="Play slowly"><span class="face">${icon("turtle", 28)}</span></button></div>`
        : `<p class="spell-letters">${es(step.sayEs)}</p>${audioSoon(true)}`}
      <p class="spell-hint">${icon("info", 16, 2.5)}<span>${esc(step.en)}</span></p>
    </div>`;
  return typeIt({
    ...step, titleEn: audible ? "Listen to the spelling. Write the word." : "Read the spelling. Write the word.", headHtml,
    onMount(node) {
      node.classList.add("ex-spell");
      node.addEventListener("click", (e) => { const b = e.target.closest("[data-spell]"); if (b) api.speak(step.sayEs, b.dataset.spell === "slow"); });
      if (audible) setTimeout(() => api.speak(step.sayEs), 350);
    },
  }, api);
}

// ------------------------------------------------------------ song clip
// Songs (content plan §11): the words light up on a 90 BPM beat so students can chant along;
// the recorded song plays with them once it exists (audio/TODO_songs.json lists the clips).
// When audio/songs/clips.json has the sung timing of a clip's words (alphabet_songs.py), the words
// light up as they are sung instead.
let songList = null, songTimes = null;
const wordTimes = () => (songTimes ??= fetch("audio/songs/clips.json").then((r) => (r.ok ? r.json() : {})).then((d) => d.clips || {}).catch(() => ({})));
const songs = () => (songList ??= fetch("audio/TODO_songs.json").then((r) => (r.ok ? r.json() : { clips: [] })).then((d) => new Map(d.clips.filter((c) => c.exists).map((c) => [c.clip, c.file]))).catch(() => new Map()));

export function clip(step, api) {
  const words = step.linesEs.map((l) => l.split(/\s+/));
  const node = el(`
    <div class="ex ex-clip">
      ${head(esc(step.titleEn || "Chant along"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Song</span>`)}
      <div class="clip-card">
        <div class="clip-top">
          <button class="press icon-btn icon-btn--magenta clip-play" aria-label="Play the song"><span class="face">${icon("play", 30, 2.5)}</span></button>
          <span class="clip-status"><span class="audio-soon audio-soon--sm">${icon("clock", 16, 2.5)}<span>Song coming soon</span></span></span>
          <span class="clip-beat" aria-hidden="true">${[0, 1, 2, 3].map(() => `<i></i>`).join("")}</span>
        </div>
        <div class="clip-lines" lang="es">${words.map((ws, li) => `<p class="clip-line">${ws.map((w, wi) => `<span class="clip-w" data-l="${li}" data-w="${wi}">${esc(w)}</span>`).join(" ")}</p>`).join("")}</div>
        <p class="clip-en">${esc(step.en || "")}</p>
      </div>
      <p class="context">${icon("mic", 16, 2.5)} Chant along: say each word as it lights up.</p>
    </div>`);
  const wordEls = $$(".clip-w", node);
  const beats = $$(".clip-beat i", node);
  let timers = [], audio = null, src = null, times = null;
  const at = (k) => (times ? times[k][0] * 1000 : k * BEAT_MS);
  const stop = () => { timers.forEach(clearTimeout); timers = []; audio?.pause(); node.classList.remove("is-playing"); };
  const play = () => {
    stop();
    wordEls.forEach((w) => w.classList.remove("is-now", "is-done"));
    if (reducedMotion()) { wordEls.forEach((w) => w.classList.add("is-done")); return; }
    node.classList.add("is-playing");
    if (src) { audio = audio || new Audio(src); audio.currentTime = 0; audio.play().catch(() => {}); }
    wordEls.forEach((w, k) => timers.push(setTimeout(() => {
      wordEls[k - 1]?.classList.replace("is-now", "is-done");
      w.classList.add("is-now");
      beats.forEach((b, j) => b.classList.toggle("is-on", j === k % 4));
    }, at(k))));
    timers.push(setTimeout(() => { wordEls.at(-1)?.classList.replace("is-now", "is-done"); beats.forEach((b) => b.classList.remove("is-on")); node.classList.remove("is-playing"); }, times ? times.at(-1)[1] * 1000 : wordEls.length * BEAT_MS));
  };
  node.querySelector(".clip-play").addEventListener("click", () => { sfx.tap(); play(); });
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    async mount() {
      src = (await songs()).get(step.clip) || null;
      const t = src && (await wordTimes())[step.clip]?.words;
      times = t?.length === wordEls.length ? t : null;
      if (src) node.querySelector(".clip-status").innerHTML = `<span class="clip-ready">${icon("radio", 16, 2.5)} Radio Búho</span>`;
      setTimeout(play, 400);
    },
    onMain() { stop(); sfx.tap(); api.next(); },
    destroy: stop,
  };
}

// ------------------------------------------------------------ Radio Búho call-in grid
// Rows are callers; each row is a face to tap (how they are) or a word to write (the spelling show).
// First listen without the transcript. While the calls aren't recorded they are shown to read,
// so nothing is ever audio-only without audio. After CHECK every call is shown with its row.
const mask = (text, word) => (word ? text.replace(word, "___") : text);

export function radio(step, api) {
  const ep = episodeById(step.episode);
  const lines = ep.lines;
  const audible = step.rows.every((r) => hasAudio(lines[r.line].es));
  const faces = step.mode === "faces";
  const picked = step.rows.map(() => null);
  const node = el(`
    <div class="ex ex-radio ex-radio--${step.mode}">
      ${head(esc(step.titleEn || "Radio Búho"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Radio Búho</span>`)}
      <p class="context">${rich(step.contextEn || "")}</p>
      ${audible ? `<div class="radio-onair">${charImg("owl-explaining", "radio-onair__owl")}<button class="press btn btn--magenta radio-playall" data-playall><span class="face">${icon("play", 22, 2.75)}<span>Play the calls</span></span></button></div>`
        : `<p class="radio-read">${icon("clock", 16, 2.5)}<span>The calls aren't recorded yet, so read them.</span></p>`}
      <div class="radio-grid" role="group" aria-label="Your answers">
        ${step.rows.map((r, k) => {
          const ln = lines[r.line];
          const call = audible
            ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-call="${k}" aria-label="Play call ${k + 1}"><span class="face">${icon("volume-2", 20)}</span></button>`
            : `<span class="radio-row__call">${es(step.mode === "spell" ? mask(ln.es, ln.maskEs) : ln.es)}</span>`;
          return `<div class="radio-row" data-row="${k}">
            <div class="radio-row__head"><span class="radio-row__n">${k + 1}</span><span class="radio-row__label">${esc(r.labelEn)}</span>${call}</div>
            ${faces
              ? `<div class="radio-faces" role="radiogroup" aria-label="${esc(r.labelEn)}: how are they?">${step.options.map((f, j) => `<button class="press face-pick" role="radio" aria-checked="false" data-row="${k}" data-face="${f}" aria-label="${esc(faceEn(f))}"><span class="face">${face(f)}<span class="face-pick__key" aria-hidden="true">${j + 1}</span></span></button>`).join("")}</div>`
              : `<input class="type-input radio-input" data-row="${k}" type="text" lang="es" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Call ${k + 1}: the word spelt" placeholder="Write the word">`}
            <span class="radio-row__answer" hidden></span>
          </div>`;
        }).join("")}
      </div>
    </div>`);
  const enable = () => api.enableCheck(faces ? picked.every((p) => p) : $$(".radio-input", node).every((i) => i.value.trim()));
  const say = (k) => api.speak(lines[step.rows[k].line].es, false, lines[step.rows[k].line].who);
  let playing = false;
  async function playAll() {
    if (playing) return;
    playing = true;
    for (let k = 0; k < step.rows.length && node.isConnected; k++) {
      const row = $(`.radio-row[data-row="${k}"]`, node);
      row.classList.add("is-playing");
      await say(k);
      row.classList.remove("is-playing");
    }
    playing = false;
  }
  node.addEventListener("click", (e) => {
    if (node.classList.contains("is-checked")) return;
    const f = e.target.closest(".face-pick");
    if (f) {
      const k = +f.dataset.row;
      picked[k] = f.dataset.face;
      $$(`.face-pick[data-row="${k}"]`, node).forEach((b) => b.setAttribute("aria-checked", String(b === f)));
      sfx.select(); restartAnim(f, "pop"); enable(); return;
    }
    const c = e.target.closest("[data-call]");
    if (c) { say(+c.dataset.call); return; }
    if (e.target.closest("[data-playall]")) playAll();
  });
  node.addEventListener("input", enable);
  // Keyboard: 1–4 pick a face for the first row that has none yet.
  const onKey = (n) => {
    if (!faces || node.classList.contains("is-checked")) return;
    const k = picked.findIndex((p) => !p);
    const row = k < 0 ? picked.length - 1 : k;
    $$(`.face-pick[data-row="${row}"]`, node)[n - 1]?.click();
  };
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onKey,
    mount() { if (audible) setTimeout(playAll, 450); else if (!faces) setTimeout(() => $(".radio-input", node)?.focus({ preventScroll: true }), 300); },
    check({ skipped = false } = {}) {
      node.classList.add("is-checked");
      let right = 0, slips = 0;
      step.rows.forEach((r, k) => {
        const row = $(`.radio-row[data-row="${k}"]`, node);
        let ok, almost = false;
        if (faces) ok = picked[k] === r.answer;
        else {
          const inp = $(`.radio-input[data-row="${k}"]`, node);
          inp.readOnly = true;
          const g = grade(inp.value, r.answerEs);
          ok = g.verdict === "correct" || g.verdict === "accents" || g.verdict === "caps";
          almost = ok && g.verdict !== "correct";
        }
        if (ok) right++;
        if (almost) slips++;
        row.classList.add(ok ? (almost ? "is-almost" : "is-correct") : "is-wrong");
        const ans = row.querySelector(".radio-row__answer");
        ans.hidden = false;
        ans.innerHTML = faces ? `${face(r.answer)}<span>${esc(faceEn(r.answer))}</span>` : `${es(r.answerEs)}${almost ? `<small>Check the ${/[A-ZÁÉÍÓÚÑ]/.test(r.answerEs[0]) ? "capital letter and accents" : "accents"}</small>` : ""}`;
        // Recorded calls were heard, not read: now show what each caller said, on the answer line.
        if (audible) ans.insertAdjacentHTML("beforeend", `<span class="radio-row__call">${es(lines[r.line].es)}</span>`);
        if (!ok && !skipped) restartAnim(row, "shake");
      });
      const all = right === step.rows.length;
      return {
        ok: all, hinted: all && slips > 0,
        title: all ? undefined : `${right} of ${step.rows.length} right`,
        body: `<span class="feedback__tip">${all ? (slips ? "All right! Watch the capital letters and accents." : "Every call right on the first listen!") : "Look at the answers on the grid, then listen again."}</span>`,
      };
    },
    destroy() { playing = false; },
  };
}

// ------------------------------------------------------------ transcript (listen again)
export function transcript(step, api) {
  const ep = episodeById(step.episode);
  const NAME = { buho: "Buhísimo", matilda: "Matilda", max: "Max", song: "Song", caller: "Caller" };
  const ART = { buho: "owl-explaining", matilda: "matilda", max: "max" };
  const node = el(`
    <div class="ex ex-transcript">
      ${head(esc(step.titleEn || "Listen again with the words"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Radio Búho</span>`)}
      <p class="context">${rich(step.contextEn || "")}</p>
      <div class="tr-tools"><button class="radio-chip" data-en-all aria-pressed="false">EN</button></div>
      <ol class="tr-lines ${ep.lines.length > 7 ? "tr-lines--many" : ""}">
        ${ep.lines.map((ln, k) => `
          <li class="tr-line tr-line--${ln.who}">
            <span class="tr-who">${ART[ln.who] ? charImg(ART[ln.who], "tr-who__img") : `<span class="tr-who__icon">${icon(ln.who === "song" ? "radio" : "user", 16, 2.5)}</span>`}<span>${esc(ln.nameEn || NAME[ln.who] || "")}</span></span>
            <span class="tr-text">
              ${hasAudio(ln.es) ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-line="${k}" aria-label="Play line ${k + 1}"><span class="face">${icon("volume-2", 18)}</span></button>` : ""}
              ${es(ln.es, "tr-es")}<span class="tr-en" hidden>${esc(ln.en)}</span>
            </span>
          </li>`).join("")}
      </ol>
      ${ep.lines.some((ln) => !hasAudio(ln.es)) ? `<p class="radio-read">${audioSoon(true)}<span>Read along now; the recording is on its way.</span></p>` : ""}
    </div>`);
  node.addEventListener("click", (e) => {
    const b = e.target.closest("[data-line]");
    if (b) { const ln = ep.lines[+b.dataset.line]; api.speak(ln.es, false, ln.who); return; }
    const en = e.target.closest("[data-en-all]");
    if (en) { const on = en.getAttribute("aria-pressed") !== "true"; en.setAttribute("aria-pressed", String(on)); $$(".tr-en", node).forEach((x) => (x.hidden = !on)); }
  });
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); } };
}

export const EXERCISES_1_2 = { letters, letterpick, spell, clip, radio, transcript };
