// Exercise types added for Unit 1.3 (numbers 0–31, the number songs, Number Invaders and the ID card).
// They plug into the same lesson runner (js/lesson.js) as 1.1 and 1.2 and reuse its helpers.
// Every step type returns the controller shape of js/lesson.js:
// { el, mount?(), check?() -> result, onMain?(), footer, aside?, onKey?(), onSkip?(), destroy?() }.
// Nothing is ever audio-only without audio: unrecorded lines are shown to read ("Audio soon").
import { icon } from "./icons.js";
import { $, $$, esc, es, rich, el, charImg, shuffle, pick, restartAnim, reducedMotion } from "./ui.js";
import { sfx } from "./sound.js";
import { digitArt, idCard } from "./art.js";
import { episodeById } from "../course.js";
import { hasAudio, audioSoon, head, choiceController, typeIt, grade } from "./lesson.js";
import { tokens } from "./numbers.js";

const BEAT_MS = 667; // 90 BPM, as the 1.2 clips: one word per beat while a song isn't there yet

/** Play buttons for a Spanish line, or the line itself to read while it isn't recorded. */
function cue(text, { big = false, read = "" } = {}) {
  return hasAudio(text)
    ? `<div class="cue cue--audio"><button class="press icon-btn icon-btn--primary ${big ? "listen-big" : ""}" data-cue="normal" aria-label="Play"><span class="face">${icon("volume-2", big ? 48 : 30, 2.5)}</span></button><button class="press icon-btn icon-btn--secondary" data-cue="slow" aria-label="Play slowly"><span class="face">${icon("turtle", 28)}</span></button></div>`
    : `<div class="cue cue--read">${read ? `<span class="cue__read">${esc(read)}</span>` : ""}${es(text, "cue__es")}${audioSoon(true)}</div>`;
}
function wireCue(node, api, text, who) {
  node.addEventListener("click", (e) => { const b = e.target.closest("[data-cue]"); if (b) api.speak(text, b.dataset.cue === "slow", who); });
}

// ------------------------------------------------------------ number card (show)
// Numbers with their Spanish names; tap one to hear it. A note points out look-alikes.
export function numcard(step, api) {
  const audible = step.nums.some((x) => hasAudio(x.es));
  const node = el(`
    <div class="ex ex-numcard">
      ${head(esc(step.titleEn || "New numbers"), `<span class="badge">${icon(step.study ? "map" : "sparkles", 16, 2.75)} ${step.study ? "Look first" : "New numbers"}</span>`)}
      <div class="num-grid ${step.nums.length > 6 ? "num-grid--many" : ""} ${step.nums.length <= 2 ? "num-grid--few" : ""}" role="group" aria-label="Numbers and their names">
        ${step.nums.map((x, k) => `
          <button class="press num-card" data-k="${k}" aria-label="${x.n}: ${esc(x.es)}">
            <span class="face"><span class="num-card__n" aria-hidden="true">${x.n}</span>${es(x.es, "num-card__es")}</span>
          </button>`).join("")}
      </div>
      ${audible ? "" : `<div class="letters-soon">${audioSoon(true)}<span>Say each number out loud yourself.</span></div>`}
      ${step.noteEn ? `<p class="note">${icon("lightbulb", 20, 2.5)}<span>${rich(step.noteEn)}</span></p>` : ""}
    </div>`);
  node.addEventListener("click", (e) => {
    const b = e.target.closest(".num-card");
    if (!b) return;
    sfx.select();
    restartAnim(b, "pop");
    b.classList.add("is-heard");
    api.speak(step.nums[+b.dataset.k].es);
  });
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    onMain() { sfx.tap(); api.next(); },
    onKey(n) { $$(".num-card", node)[n - 1]?.click(); },
  };
}

// ------------------------------------------------------------ number pick (practise)
// Hear (or read) a number, or a sentence with one, and tap its digit.
export function numpick(step, api) {
  const audible = hasAudio(step.sayEs);
  const node = el(`
    <div class="ex ex-numpick">
      ${head(esc(step.titleEn || (audible ? "Tap the number you hear" : "Which number is it?")))}
      <div class="numpick-stage">${cue(step.sayEs, { big: true })}</div>
      <div class="options num-options" role="group" style="--n:${step.nums.length}">
        ${step.nums.map((n, k) => `<button class="press option num-option" data-oi="${k}" aria-pressed="false" aria-label="${n}"><span class="face"><span class="key" aria-hidden="true">${k + 1}</span><span class="num-option__n">${n}</span></span></button>`).join("")}
      </div>
    </div>`);
  wireCue(node, api, step.sayEs, step.speaker);
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.sayEs, answerEn: step.en || `${step.nums[step.answer]}` }),
    ctrl: { mount() { if (audible) setTimeout(() => api.speak(step.sayEs, false, step.speaker), 350); } },
  });
}

// ------------------------------------------------------------ digit → word
// See 16, type dieciséis. The typing engine grades it (accent fix-up; capitals don't matter for one word).
export function numtype(step, api) {
  return typeIt({
    ...step, titleEn: step.titleEn || "Write the number in Spanish",
    headHtml: `<div class="numtype-prompt">${digitArt(step.digit, { label: String(step.digit) })}</div>`,
    en: step.en || `the number ${step.digit}`,
    onMount(node) { node.classList.add("ex-numtype"); },
  }, api);
}

// ------------------------------------------------------------ number dictation
// Hear (or read) a line of numbers and write each one as digits.
export function dictation(step, api) {
  const n = step.answer.length;
  const node = el(`
    <div class="ex ex-dictation">
      ${head(esc(step.titleEn || (hasAudio(step.sayEs) ? "Listen. Write the numbers." : "Read it. Write the numbers.")))}
      ${step.character ? `<div class="speaker-row dict-who">${charImg(step.character)}<div class="bubble">${cue(step.sayEs)}</div></div>` : `<div class="dict-stage">${cue(step.sayEs)}</div>`}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="dict-boxes ${n > 6 ? "dict-boxes--many" : ""}" role="group" aria-label="Your numbers">
        ${step.answer.map((_, k) => `<label class="dict-box"><input class="type-input dict-input" data-k="${k}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" aria-label="Number ${k + 1}"><span class="dict-box__ans" hidden></span></label>`).join("")}
      </div>
    </div>`);
  wireCue(node, api, step.sayEs, step.character);
  const inputs = $$(".dict-input", node);
  const enable = () => api.enableCheck(inputs.every((i) => i.value.trim() !== ""));
  node.addEventListener("input", (e) => {
    const i = e.target.closest(".dict-input");
    if (!i) return;
    i.value = i.value.replace(/\D/g, "");
    if (i.value.length === 2) inputs[+i.dataset.k + 1]?.focus({ preventScroll: true });
    enable();
  });
  node.addEventListener("keydown", (e) => {
    const i = e.target.closest(".dict-input");
    if (!i) return;
    const k = +i.dataset.k;
    if ((e.key === " " || e.key === ",") && inputs[k + 1]) { e.preventDefault(); inputs[k + 1].focus(); }
    if (e.key === "Backspace" && !i.value && inputs[k - 1]) { e.preventDefault(); inputs[k - 1].focus(); }
  });
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    mount() { setTimeout(() => inputs[0]?.focus({ preventScroll: true }), 300); if (hasAudio(step.sayEs)) setTimeout(() => api.speak(step.sayEs, false, step.character), 350); },
    check({ skipped = false } = {}) {
      let right = 0;
      inputs.forEach((i, k) => {
        i.readOnly = true;
        const ok = i.value.trim() !== "" && +i.value === step.answer[k];
        if (ok) right++;
        const box = i.closest(".dict-box");
        box.classList.add(ok ? "is-correct" : "is-wrong");
        if (!ok) { const a = box.querySelector(".dict-box__ans"); a.hidden = false; a.textContent = step.answer[k]; }
      });
      const all = right === n;
      if (!all && !skipped) restartAnim($(".dict-boxes", node), "shake");
      return { ok: all, title: all || skipped ? undefined : `${right} of ${n} right`, answerEs: step.sayEs, answerEn: step.answer.join(", ") };
    },
  };
}

// ------------------------------------------------------------ count up / countdown
// Tap the number words in order. The big number counts with you; a countdown ends on ¡cero! and Max jumps.
export function count(step, api) {
  const seq = step.seq;
  const down = seq.length > 1 && seq[1] < seq[0];
  const words = step.wordsEs;
  const bank = shuffle([...seq.map((n, i) => ({ n, w: words[i] })), ...(step.extra || []).map((x) => ({ n: x.n, w: x.es }))]);
  const art = step.character || (down ? "max" : "owl-explaining");
  const node = el(`
    <div class="ex ex-count ${down ? "ex-count--down" : ""}">
      ${head(esc(step.titleEn || (down ? "Countdown!" : "Count with Buhísimo")), `<span class="badge">${icon(down ? "zap" : "star", 16, 2.75)} ${down ? "Countdown" : "Count"}</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="count-stage">
        <div class="count-char">${charImg(art, "count-char__img")}</div>
        <div class="count-big" aria-live="polite">${digitArt(seq[0], { label: "" }).replace(/>\d+</, ">?<")}</div>
        <ol class="count-track" aria-label="Your numbers so far">${seq.map(() => `<li class="count-dot"></li>`).join("")}</ol>
      </div>
      <div class="bank count-bank" lang="es" role="group" aria-label="Number words">
        ${bank.map((b, k) => `<span class="tile-slot"><button class="press tile count-tile" data-n="${b.n}" data-b="${k}"><span class="face" data-key="${k + 1}">${esc(b.w)}</span></button></span>`).join("")}
      </div>
    </div>`);
  let k = 0, mixups = 0, busy = false;
  const big = $(".count-big", node), dots = $$(".count-dot", node);
  const tap = (b) => {
    if (busy || k >= seq.length || b.disabled) return;
    if (+b.dataset.n === seq[k]) {
      sfx.pair();
      b.disabled = true;
      b.classList.add("is-ghost");
      dots[k].textContent = seq[k];
      dots[k].classList.add("is-done");
      big.innerHTML = digitArt(seq[k], { label: String(seq[k]) });
      restartAnim(big, "pop");
      api.speak(words[k], false, step.character);
      k++;
      if (k === seq.length) finish();
    } else {
      mixups++;
      busy = true;
      sfx.wrong();
      b.classList.add("is-wrong");
      restartAnim(b, "shake");
      setTimeout(() => { b.classList.remove("is-wrong"); busy = false; }, 520);
    }
  };
  function finish() {
    if (down && seq.at(-1) === 0) {
      node.classList.add("is-launched");
      $(".count-char__img", node).src = "assets/max-jump.webp";
    }
    setTimeout(() => api.complete({
      ok: true, hinted: mixups > 0, title: es(pick(api.lesson.praiseEs)),
      body: `<span class="feedback__tip">${mixups ? `In order, with ${mixups} mix-up${mixups > 1 ? "s" : ""} on the way.` : "Every number in order, first time!"}${down && seq.at(-1) === 0 ? " ¡Cero! Max jumps." : ""}</span>`,
      answerEs: step.sayEs, answerEn: step.en,
    }), reducedMotion() ? 200 : 900);
  }
  node.addEventListener("click", (e) => { const b = e.target.closest(".count-tile"); if (b) tap(b); });
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onSkip() { api.next(); },
    onKey(n) { const b = $$(".count-tile", node)[n - 1]; if (b) tap(b); },
  };
}

// ------------------------------------------------------------ pattern card (worked example)
// diez + seis → dieciséis, with the digits under the words (a picture: no "y" before Unit 1.5).
export function pattern(step, api) {
  const node = el(`
    <div class="ex ex-pattern">
      ${head(esc(step.titleEn), `<span class="badge">${icon("lightbulb", 16, 2.75)} How it works</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="pattern-card">
        ${step.rows.map((r, i) => `
          <button class="press pattern-row" data-row="${i}" aria-label="${r.a} + ${r.b} = ${r.c}: ${esc(r.cEs)}">
            <span class="face">
              <span class="pattern-cell">${es(r.aEs)}<b>${r.a}</b></span><span class="pattern-op" aria-hidden="true">+</span>
              <span class="pattern-cell">${es(r.bEs)}<b>${r.b}</b></span><span class="pattern-op" aria-hidden="true">${icon("chevron-right", 22, 3)}</span>
              <span class="pattern-cell pattern-cell--out">${es(r.cEs)}<b>${r.c}</b></span>
            </span>
          </button>`).join("")}
      </div>
      ${step.noteEn ? `<p class="note">${icon("lightbulb", 20, 2.5)}<span>${rich(step.noteEn)}</span></p>` : ""}
    </div>`);
  node.addEventListener("click", (e) => { const b = e.target.closest("[data-row]"); if (b) { sfx.select(); restartAnim(b, "pop"); api.speak(step.rows[+b.dataset.row].cEs); } });
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); } };
}

// ------------------------------------------------------------ Number Invaders (game)
// Four digits drift down. Hear (or read) a number and tap its digit before it lands. Calm mode (on
// at the start) stops the falling: the same game without the clock. Keys 1–4 tap the lanes.
export function invaders(step, api) {
  const rounds = step.rounds.map((r, i) => ({ ...r, i }));
  let queue = [...rounds], cur = null, score = 0, misses = 0, firstTry = 0, missedThis = false, busy = false, done = 0;
  const total = rounds.length;
  let calm = true;
  const node = el(`
    <div class="ex ex-invaders">
      <div class="inv-top">
        ${head(esc(step.titleEn || "Number Invaders"), `<span class="badge">${icon("gamepad-2", 16, 2.75)} Game</span>`)}
        <button class="inv-calm" aria-pressed="true">${icon("turtle", 18, 2.5)}<span>Calm mode</span></button>
      </div>
      <div class="inv-cue" aria-live="polite"></div>
      <div class="inv-sky" role="group" aria-label="The invaders">
        ${[0, 1, 2, 3].map((l) => `<div class="inv-lane" data-lane="${l}"></div>`).join("")}
        <div class="inv-ground" aria-hidden="true"></div>
      </div>
      <div class="inv-score"><span class="inv-score__n">0</span> of ${total} · <span class="inv-score__left">${total}</span> to go</div>
    </div>`);
  const cueEl = $(".inv-cue", node), lanes = $$(".inv-lane", node);
  const calmBtn = $(".inv-calm", node);
  calmBtn.addEventListener("click", () => {
    calm = !calm;
    calmBtn.setAttribute("aria-pressed", String(calm));
    node.classList.toggle("is-arcade", !calm);
    sfx.tap();
  });
  function next() {
    if (!queue.length) return end();
    cur = queue.shift();
    missedThis = false; busy = false;
    node.dataset.answer = cur.n; // test hook (e2e): the digit of the round on screen
    const choices = shuffle(cur.choices);
    cueEl.innerHTML = cue(cur.sayEs, { read: "Shoot:" });
    lanes.forEach((ln, l) => {
      const n = choices[l];
      ln.innerHTML = n == null ? "" : `<button class="press inv-ship" data-n="${n}" aria-label="${n}"><span class="face"><span class="key" aria-hidden="true">${l + 1}</span>${n}</span></button>`;
      const ship = ln.firstElementChild;
      if (ship) {
        ship.style.setProperty("--fall", `${step.fallMs || 9000}ms`);
        ship.addEventListener("animationend", (e) => { if (e.animationName === "inv-fall" && !calm && !busy) landed(); });
      }
    });
    if (hasAudio(cur.sayEs)) setTimeout(() => api.speak(cur.sayEs), 250);
  }
  function landed() {
    busy = true; misses++; missedThis = true;
    sfx.wrong();
    node.classList.add("is-landed");
    $(`.inv-ship[data-n="${cur.n}"]`, node)?.classList.add("is-answer");
    if (!cur.again) queue.push({ ...cur, again: true });
    setTimeout(() => { node.classList.remove("is-landed"); next(); }, 1100);
  }
  function tap(b) {
    if (busy || !b) return;
    if (+b.dataset.n === cur.n) {
      busy = true; score++; done++;
      if (!missedThis && !cur.again) firstTry++;
      sfx.pair();
      b.classList.add("is-hit");
      $(".inv-score__n", node).textContent = score;
      $(".inv-score__left", node).textContent = Math.max(0, queue.length);
      setTimeout(next, reducedMotion() ? 150 : 450);
    } else {
      misses++; missedThis = true;
      sfx.wrong();
      restartAnim(b, "shake");
      b.disabled = true;
    }
  }
  function end() {
    delete node.dataset.answer;
    cueEl.innerHTML = `<span class="inv-win">${icon("trophy", 22, 2.5)} All the invaders!</span>`;
    lanes.forEach((ln) => (ln.innerHTML = ""));
    setTimeout(() => api.complete({
      ok: true, hinted: misses > 0, title: es(pick(api.lesson.praiseEs)),
      body: `<span class="feedback__tip">${firstTry} of ${total} on the first try${misses ? `; ${misses} miss${misses > 1 ? "es" : ""} on the way` : ". Perfect!"}</span>`,
    }), 400);
  }
  node.addEventListener("click", (e) => { const b = e.target.closest(".inv-ship"); if (b && !b.disabled) tap(b); });
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onSkip() { api.next(); },
    mount() { setTimeout(next, 300); },
    onKey(n) { const b = lanes[n - 1]?.querySelector(".inv-ship"); if (b && !b.disabled) tap(b); },
  };
}

// ------------------------------------------------------------ number songs (karaoke)
// A whole song from audio/songs/songs.json (make_number_songs.py): the recorded song plays and each
// word lights up on its aligned timing; a repeated block lights the same lines again. numerals:
// the «con números» version (digits on screen). No file yet: "Song coming soon", words on the beat.
let songsJson = null;
export const loadSongs = () => (songsJson ??= fetch("audio/songs/songs.json").then((r) => (r.ok ? r.json() : {})).then((d) => d.songs || {}).catch(() => ({})));
const blobs = new Map();
const blobUrl = (src) => {
  if (!blobs.has(src)) blobs.set(src, fetch(src).then((r) => (r.ok ? r.blob() : null)).then((b) => (b ? URL.createObjectURL(b) : src)).catch(() => src));
  return blobs.get(src);
};

/** A karaoke player for one song. Returns { el, ready, play(), stop(), destroy() }. */
export function songPlayer({ song, linesEs, numerals = false, onState = () => {} }) {
  const box = el(`<div class="song-box ${numerals ? "song-box--digits" : ""}">
      <div class="clip-top">
        <button class="press icon-btn icon-btn--magenta song-play" aria-label="Play the song"><span class="face">${icon("play", 30, 2.5)}</span></button>
        <span class="clip-status"><span class="audio-soon audio-soon--sm">${icon("clock", 16, 2.5)}<span>Song coming soon</span></span></span>
        <span class="clip-beat" aria-hidden="true">${[0, 1, 2, 3].map(() => `<i></i>`).join("")}</span>
      </div>
      <div class="song-lines" lang="es"></div>
    </div>`);
  const linesEl = $(".song-lines", box);
  let data = null, audio = null, raf = 0, timers = [], timeline = [], toks = [], playing = false;
  const render = (lines) => {
    linesEl.classList.toggle("song-lines--many", lines.length > 4);
    linesEl.innerHTML = lines.map((ln, li) => `<p class="clip-line song-line">${tokens(ln, numerals).map((t, ti) => `<span class="clip-w ${t.n != null ? "song-num" : ""}" data-l="${li}" data-t="${ti}">${esc(t.text)}</span>`).join(" ")}</p>`).join("");
    toks = lines.map((ln, li) => tokens(ln, numerals).map((t, ti) => ({ ...t, el: $(`.clip-w[data-l="${li}"][data-t="${ti}"]`, linesEl) })));
  };
  const tokenOf = (li, wi) => toks[li]?.find((t) => t.words.includes(wi))?.el;
  render(linesEs);
  const clear = () => $$(".clip-w", linesEl).forEach((w) => w.classList.remove("is-now", "is-done"));
  function frame() {
    const t = audio.currentTime;
    let k = -1;
    for (let j = 0; j < timeline.length && timeline[j].start <= t; j++) k = j;
    clear();
    if (k >= 0) {
      const pass = timeline[k].pass, now = timeline[k].el;
      for (let j = 0; j <= k; j++) if (timeline[j].pass === pass && timeline[j].el !== now) timeline[j].el.classList.add("is-done");
      now.classList.add(t < timeline[k].end + 0.3 ? "is-now" : "is-done");
    }
    if (!audio.paused) raf = requestAnimationFrame(frame);
  }
  const setPlaying = (on) => {
    playing = on;
    box.classList.toggle("is-playing", on);
    $(".song-play .face", box).innerHTML = icon(on ? "pause" : "play", 30, 2.5);
    $(".song-play", box).setAttribute("aria-label", on ? "Pause the song" : "Play the song");
    onState(on);
  };
  function stop() {
    timers.forEach(clearTimeout); timers = [];
    cancelAnimationFrame(raf);
    audio?.pause();
    $$(".clip-beat i", box).forEach((b) => b.classList.remove("is-on"));
    setPlaying(false);
  }
  function playBeat() {
    const all = toks.flat();
    clear();
    setPlaying(true);
    all.forEach((t, k) => timers.push(setTimeout(() => {
      all[k - 1]?.el.classList.replace("is-now", "is-done");
      t.el.classList.add("is-now");
      $$(".clip-beat i", box).forEach((b, j) => b.classList.toggle("is-on", j === k % 4));
    }, k * BEAT_MS)));
    timers.push(setTimeout(() => { all.at(-1)?.el.classList.replace("is-now", "is-done"); stop(); }, all.length * BEAT_MS));
  }
  function play() {
    if (playing) { stop(); return; }
    if (!audio) return playBeat();
    if (audio.ended || audio.currentTime >= (data.seconds || audio.duration) - 0.3) audio.currentTime = 0;
    setPlaying(true);
    audio.play().then(() => { cancelAnimationFrame(raf); frame(); }).catch(() => setPlaying(false));
  }
  $(".song-play", box).addEventListener("click", () => { sfx.tap(); play(); });
  const ready = loadSongs().then(async (songs) => {
    data = songs[song] || null;
    if (!data) return false;
    render(data.lines); // the chosen version's own words
    let pass = 0, last = -1;
    timeline = data.words.map(([li, wi, start, end]) => { if (li < last) pass++; last = li; return { el: tokenOf(li, wi), start, end, pass }; }).filter((x) => x.el);
    audio = new Audio();
    audio.preload = "auto";
    audio.src = await blobUrl(data.file);
    audio.addEventListener("ended", () => { stop(); $$(".clip-w", linesEl).forEach((w) => w.classList.add("is-done")); });
    $(".clip-status", box).innerHTML = `<span class="clip-ready">${icon("radio", 16, 2.5)} Radio Búho</span>`;
    box.classList.add("is-recorded");
    return true;
  });
  return { el: box, ready, play, stop, destroy() { stop(); if (audio) { audio.removeAttribute("src"); audio.load(); } }, get audio() { return audio; }, get recorded() { return !!data; } };
}

export function song(step, api) {
  const node = el(`
    <div class="ex ex-song">
      ${head(esc(step.titleEn || "Sing along"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Song${step.numerals ? " · digits" : ""}</span>`)}
      ${step.titleEs ? `<p class="song-title">${es(step.titleEs)}</p>` : ""}
      <div class="clip-card song-card"></div>
      <p class="context">${icon("mic", 16, 2.5)} ${esc(step.contextEn || (step.numerals ? "Now the numbers are digits: sing the Spanish word for each one as it lights up." : "Sing along: say each word as it lights up."))}</p>
    </div>`);
  const player = songPlayer({ song: step.song, linesEs: step.linesEs, numerals: !!step.numerals });
  $(".song-card", node).appendChild(player.el);
  // test hook (e2e): the player
  node.__song = player;
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    async mount() { await player.ready; if (node.isConnected) setTimeout(() => node.isConnected && player.play(), 400); },
    onMain() { player.stop(); sfx.tap(); api.next(); },
    destroy() { player.destroy(); },
  };
}

// ------------------------------------------------------------ Radio Búho's song set (1.3 L15)
// The number songs in teaching order; tap one to play it with its karaoke.
export function songset(step, api) {
  const ep = step.episode ? episodeById(step.episode) : null;
  const intro = ep && step.introLine != null ? ep.lines[step.introLine] : null;
  const node = el(`
    <div class="ex ex-songset">
      ${head(esc(step.titleEn || "Radio Búho: the number songs"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Radio Búho</span>`)}
      ${intro ? `<div class="speaker-row songset-intro">${charImg("owl-explaining")}<div class="bubble">${cue(intro.es)}</div></div>` : ""}
      <div class="songset">
        <ol class="songset-list">
          ${step.songs.map((s, k) => `
            <li><button class="press songset-item" data-k="${k}" aria-pressed="false"><span class="face">
              <span class="songset-item__n">${k + 1}</span>
              <span class="songset-item__t">${s.titleEs ? es(s.titleEs) : esc(s.titleEn)}${s.titleEs ? `<small>${esc(s.titleEn)}</small>` : ""}</span>
              <span class="songset-item__i">${icon("play", 20, 2.75)}</span>
            </span></button></li>`).join("")}
        </ol>
        <div class="clip-card songset-player"><p class="songset-pick">${icon("headphones", 20, 2.5)} Tap a song to play it.</p></div>
      </div>
    </div>`);
  if (intro) wireCue(node, api, intro.es, intro.who);
  let player = null;
  const open = async (k) => {
    player?.destroy();
    $$(".songset-item", node).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === k)));
    const s = step.songs[k];
    player = songPlayer({ song: s.song, linesEs: s.linesEs, numerals: !!s.numerals });
    const holder = $(".songset-player", node);
    holder.innerHTML = "";
    holder.appendChild(player.el);
    node.__song = player;
    await player.ready;
    if (node.isConnected) player.play();
  };
  node.addEventListener("click", (e) => { const b = e.target.closest(".songset-item"); if (b) { sfx.select(); open(+b.dataset.k); } });
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    mount() { if (intro && hasAudio(intro.es)) setTimeout(() => api.speak(intro.es, false, intro.who), 350); },
    onMain() { player?.stop(); sfx.tap(); api.next(); },
    onKey(n) { $$(".songset-item", node)[n - 1]?.click(); },
    destroy() { player?.destroy(); },
  };
}

// ------------------------------------------------------------ the ID card: read, fill, or fill from Radio Búho
// read: a filled card and a question about it. fill: tap (chips), write digits (digits) or type (text)
// each field; typed slips in capitals or accents count as right, but not first-try (as in the 1.2
// radio grid). With `episode`, the cards are filled from Radio Búho calls (read while unrecorded).
const fieldSlot = (f, c, k) => {
  if (f.kind === "chips") return `<div class="id-chips" role="radiogroup" aria-label="${esc(f.qEs)}">${f.optionsEs.map((o, j) => `<button class="press id-chip" role="radio" aria-checked="false" data-c="${c}" data-f="${k}" data-o="${j}"><span class="face">${es(o)}</span></button>`).join("")}</div>`;
  if (f.kind === "digits") return `<input class="type-input id-input id-input--num" data-c="${c}" data-f="${k}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" aria-label="${esc(f.qEs)}">`;
  return `<input class="type-input id-input" data-c="${c}" data-f="${k}" type="text" lang="es" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="${esc(f.qEs)}" placeholder="Type it">`;
};

export function idcard(step, api) {
  if (step.mode === "read") return idcardRead(step, api);
  const ep = step.episode ? episodeById(step.episode) : null;
  const callsOf = (c) => (step.calls?.[c] || []).map((i) => ep.lines[i]);
  const audible = !!ep && step.calls.flat().every((i) => hasAudio(ep.lines[i].es));
  const picked = step.cards.map((card) => card.fields.map(() => null));
  const node = el(`
    <div class="ex ex-idcard ${step.cards.length > 1 ? "ex-idcard--many" : ""}">
      ${head(esc(step.titleEn || "Fill in the ID card"), `<span class="badge ${ep ? "badge--magenta" : ""}">${icon(ep ? "radio" : "user", 16, 2.75)} ${ep ? "Radio Búho" : "ID card"}</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      ${ep ? (audible ? `<div class="radio-onair">${charImg("owl-explaining", "radio-onair__owl")}<button class="press btn btn--magenta radio-playall" data-playall><span class="face">${icon("play", 22, 2.75)}<span>Play the calls</span></span></button></div>`
        : `<p class="radio-read">${icon("clock", 16, 2.5)}<span>The calls aren't recorded yet, so read them.</span></p>`) : ""}
      <div class="idcards">
        ${step.cards.map((card, c) => `
          <div class="idcard-wrap" data-card="${c}">
            ${ep ? `<div class="idcard-call">${audible ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-call="${c}" aria-label="Play call ${c + 1}"><span class="face">${icon("volume-2", 20)}</span></button><span>Call ${c + 1}</span>` : callsOf(c).map((l) => es(l.es)).join(" ")}</div>` : ""}
            ${idCard({ photo: card.photo, number: card.number || "", fields: card.fields.map((f, k) => ({ qEs: f.qEs, slot: fieldSlot(f, c, k) })) })}
          </div>`).join("")}
      </div>
    </div>`);
  const fieldEl = (c, k) => $(`.idcard-wrap[data-card="${c}"] .idcard__field[data-field="${k}"]`, node);
  const enable = () => api.enableCheck(step.cards.every((card, c) => card.fields.every((f, k) => (f.kind === "chips" ? picked[c][k] != null : !!$(`.id-input[data-c="${c}"][data-f="${k}"]`, node)?.value.trim()))));
  const chip = (b) => {
    if (node.classList.contains("is-checked")) return;
    const c = +b.dataset.c, k = +b.dataset.f;
    picked[c][k] = +b.dataset.o;
    $$(`.id-chip[data-c="${c}"][data-f="${k}"]`, node).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    sfx.select(); restartAnim(b, "pop"); enable();
  };
  let playing = false;
  async function playCalls(cards = step.cards.map((_, c) => c)) {
    if (playing) return;
    playing = true;
    for (const c of cards) {
      const wrap = $(`.idcard-wrap[data-card="${c}"]`, node);
      wrap?.classList.add("is-playing");
      for (const l of callsOf(c)) { if (!node.isConnected) break; await api.speak(l.es, false, l.who); }
      wrap?.classList.remove("is-playing");
    }
    playing = false;
  }
  node.addEventListener("click", (e) => {
    const b = e.target.closest(".id-chip");
    if (b) { chip(b); return; }
    const call = e.target.closest("[data-call]");
    if (call) { playCalls([+call.dataset.call]); return; }
    if (e.target.closest("[data-playall]")) playCalls();
  });
  // Keyboard: Enter on an answer chip checks the card once every field has an answer (as on an option).
  node.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !e.target.closest?.(".id-chip")) return;
    const main = document.querySelector('.lesson-foot [data-act="main"]');
    if (main && !main.disabled) { e.preventDefault(); main.click(); }
  });
  node.addEventListener("input", (e) => {
    const i = e.target.closest(".id-input--num");
    if (i) i.value = i.value.replace(/\D/g, "");
    enable();
  });
  // Keys 1–n: the next field with options that has no answer yet.
  const onKey = (n) => {
    if (node.classList.contains("is-checked")) return;
    for (const [c, card] of step.cards.entries()) for (const [k, f] of card.fields.entries()) {
      if (f.kind === "chips" && picked[c][k] == null) { $$(`.id-chip[data-c="${c}"][data-f="${k}"]`, node)[n - 1]?.click(); return; }
    }
  };
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onKey,
    mount() {
      if (audible) setTimeout(() => playCalls(), 450);
      else setTimeout(() => $(".id-input", node)?.focus({ preventScroll: true }), 300);
    },
    check({ skipped = false } = {}) {
      node.classList.add("is-checked");
      let right = 0, slips = 0, n = 0;
      step.cards.forEach((card, c) => card.fields.forEach((f, k) => {
        n++;
        const fe = fieldEl(c, k);
        let ok, almost = false;
        if (f.kind === "chips") ok = picked[c][k] != null && f.optionsEs[picked[c][k]] === f.valueEs;
        else {
          const inp = $(`.id-input[data-c="${c}"][data-f="${k}"]`, node);
          inp.readOnly = true;
          if (f.kind === "digits") ok = inp.value.trim() !== "" && +inp.value === f.value;
          else { const g = grade(inp.value, f.valueEs); ok = ["correct", "accents", "caps"].includes(g.verdict); almost = ok && g.verdict !== "correct"; }
        }
        if (ok) right++;
        if (almost) slips++;
        fe.classList.add(ok ? (almost ? "is-almost" : "is-correct") : "is-wrong");
        if (!ok || almost) fe.querySelector("dd").insertAdjacentHTML("beforeend", `<span class="idcard__answer">${f.kind === "digits" ? `<span class="idcard__num">${f.value}</span>` : es(f.valueEs)}${almost ? `<small>Check the ${/[A-ZÁÉÍÓÚÑ]/.test(f.valueEs[0]) ? "capital letter and accents" : "accents"}</small>` : ""}</span>`);
      }));
      if (ep && audible) step.cards.forEach((_, c) => $(`.idcard-wrap[data-card="${c}"] .idcard-call`, node).insertAdjacentHTML("beforeend", callsOf(c).map((l) => es(l.es)).join(" ")));
      if (right < n && !skipped) restartAnim($(".idcards", node), "shake");
      const all = right === n;
      return {
        ok: all, hinted: all && slips > 0,
        title: all ? undefined : `${right} of ${n} right`,
        body: `<span class="feedback__tip">${all ? (slips ? "All right! Watch the capital letters and accents." : ep ? "Every card right on the first listen!" : "The whole card, right!") : "Look at the answers on the card."}</span>`,
      };
    },
    destroy() { playing = false; },
  };
}

function idcardRead(step, api) {
  const opts = step.optionsEs || step.optionsEn;
  const order = shuffle(opts.map((_, i) => i));
  const node = el(`
    <div class="ex ex-idcard ex-idcard--read">
      ${head(esc(step.titleEn || "Read the ID card"), `<span class="badge">${icon("user", 16, 2.75)} ID card</span>`)}
      <div class="idcard-read">
        ${idCard({ photo: step.card.photo, number: step.card.number || "", fields: step.card.fields })}
        <div class="idcard-q">
          <div class="bubble">${step.promptEs ? es(step.promptEs) : ""}${step.promptEn ? `<span class="en ${step.promptEs ? "en--sub" : ""}">${esc(step.promptEn)}</span>` : ""}</div>
          <div class="options" role="group">${order.map((oi, k) => `
            <button class="press option" data-oi="${oi}" aria-pressed="false"><span class="face"><span class="key" aria-hidden="true">${k + 1}</span>${step.optionsEs ? es(opts[oi], "label") : `<span class="label">${esc(opts[oi])}</span>`}</span></button>`).join("")}</div>
        </div>
      </div>
    </div>`);
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.answerEs ?? (step.optionsEs ? step.optionsEs[step.answer] : undefined), answerEn: step.answerEn ?? (step.optionsEn ? step.optionsEn[step.answer] : undefined) }),
  });
}

export const EXERCISES_1_3 = { numcard, numpick, numtype, dictation, count, pattern, invaders, song, songset, idcard };
