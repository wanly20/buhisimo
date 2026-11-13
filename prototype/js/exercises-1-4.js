// Exercise types added for Unit 1.4 (days, months, dates and birthdays), built around a calendar
// drawn in code (js/art.js weekStrip, yearView, monthPage; js/calendar.js has the data and the 2025
// calendar). They plug into the same lesson runner (js/lesson.js) and reuse its helpers:
//   calendar   card (look and listen) · tap (hear or read → tap a day, month, date or page) ·
//              read (a circled date → pick its Spanish) · say (a circled date → say it)
//   order      tap the days or months in order; the calendar lights up as you go (timed: against the clock)
//   caltap     the L8 game «Calendar tap»: waves of prompts, tap before Max lands on the square
//   datedict   date dictation: hear (or read) a date, write it as day / month digits
//   wall       the birthday wall: the cast with speech bubbles (months in L9, dates in L10)
//   datepattern  el + veinte + de + julio → el veinte de julio (20/7)
//   culture    an English culture card with a code-drawn picture
//   calradio   a Radio Búho call-in grid: the day or month each caller says, and how they are
//   partycal   the L13 party calendar: three callers give their birthdays, tap each on the calendar
//   mydate     "Your birthday" (L11 You Do): tap your own date, then build, type and say the sentence.
//              NOTHING IS SAVED: the date lives in memory for that lesson only (Juan, decision 11).
// Nothing is ever audio-only without audio: unrecorded lines are shown to read ("Audio soon").
import { icon } from "./icons.js";
import { $, $$, esc, es, rich, el, charImg, shuffle, pick, restartAnim, reducedMotion } from "./ui.js";
import { sfx } from "./sound.js";
import { weekStrip, yearView, monthPage, idCard, seasonsArt, face, faceEn } from "./art.js";
import { episodeById } from "../course.js";
import { hasAudio, audioSoon, head, choiceController, typeIt, tiles, speak } from "./lesson.js";
import { cue, wireCue } from "./exercises-1-3.js";
import { stt, speechMatches } from "./speech.js";
import { store } from "./store.js";
import { DAYS_ES, MONTHS_ES, dateEn, dateEnLong, birthdaySentence, weekdayOf } from "./calendar.js";
import { NUM_ES } from "./numbers.js";

const who = (step) => step.speaker || step.character;
const speakingOn = () => stt.available() && store.speakOn();
const noteHtml = (t) => (t ? `<p class="note">${icon("lightbulb", 20, 2.5)}<span>${rich(t)}</span></p>` : "");
const wrap = (m) => ((m - 1 + 12) % 12) + 1;

// ------------------------------------------------------------ the calendar board for a step
function board(step, { tap }) {
  const v = step.view;
  if (v === "week") return weekStrip({ active: step.days, lit: step.lit || [], tap, names: step.names || (tap ? "active" : "all"), cls: "cal-week--big" });
  if (v === "year") return yearView({ active: step.months, lit: step.lit || [], tap, names: step.names || (tap ? "active" : "all") });
  if (v === "both") return `${weekStrip({ active: step.days, names: "active", tap })}${yearView({ active: step.months, names: "active", tap })}`;
  if (v === "month") return monthPage(step.month, { leap: !!step.leap, circle: step.circle || [], tap, small: step.mode === "say" });
  if (v === "pages") return `<div class="cal-pages cal-pages--n${step.pages.length}" role="group">${step.pages.map((m, k) => tap
    ? `<button class="press cal-hit cal-pagebtn" data-oi="${m}" aria-label="${esc(MONTHS_ES[m - 1])}"><span class="face">${monthPage(m, { small: true, circle: step.circle ? [step.circle] : [], cls: `cal-page--tone${(k % 4) + 1}` })}</span></button>`
    : monthPage(m, { small: true, circle: step.circle ? [step.circle] : [], cls: `cal-page--tone${(k % 4) + 1}` })).join("")}</div>`;
  if (v === "namemonth") return `<div class="cal-namemonth" role="group">
      <button class="press cal-hit cal-pagebtn" data-oi="0" aria-label="The ID card"><span class="face">${idCard({ photo: "samuel", fields: [{ qEs: "¿El nombre?", valueEs: "Samuel" }], cls: "idcard--mini" })}</span></button>
      <button class="press cal-hit cal-pagebtn" data-oi="1" aria-label="The calendar"><span class="face">${monthPage(11, { small: true })}</span></button>
    </div>`;
  throw new Error(`calendar: unknown view ${v}`);
}

// ------------------------------------------------------------ calendar
export function calendar(step, api) {
  if (step.mode === "card") return calCard(step, api);
  if (step.mode === "read") return calRead(step, api);
  if (step.mode === "say") return calSay(step, api);
  return calTap(step, api);
}

/** Look and listen: tap a day or a month to hear it. */
function calCard(step, api) {
  const views = step.view === "both" ? ["week", "year"] : [step.view];
  const names = (v) => (v === "week" ? DAYS_ES : MONTHS_ES);
  const audible = views.some((v) => names(v).some((w) => hasAudio(w)));
  const node = el(`
    <div class="ex ex-cal ex-cal--card ex-cal--${step.view}">
      ${head(esc(step.titleEn || "Look first: the calendar"), `<span class="badge">${icon("calendar", 16, 2.75)} Calendar</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="cal-board">${views.map((v) => (v === "week" ? weekStrip({ tap: true, names: "all", cls: "cal-week--big" }) : yearView({ tap: true, names: "all" }))).join("")}</div>
      ${audible ? "" : `<div class="letters-soon">${audioSoon(true)}<span>Say each one out loud yourself.</span></div>`}
      ${noteHtml(step.noteEn)}
    </div>`);
  node.addEventListener("click", (e) => {
    const b = e.target.closest(".cal-hit");
    if (!b) return;
    sfx.select(); restartAnim(b, "pop"); b.classList.add("is-heard");
    api.speak((b.closest(".cal-week") ? DAYS_ES : MONTHS_ES)[b.closest(".cal-week") ? +b.dataset.oi : +b.dataset.oi - 1]);
  });
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); }, onKey(n) { $$(".cal-hit", node)[n - 1]?.click(); } };
}

/** Hear (or read) a day, a month, a date or a page → tap it. */
function calTap(step, api) {
  const audible = hasAudio(step.sayEs);
  const prompt = step.character
    ? `<div class="speaker-row cal-who">${charImg(step.character)}<div class="bubble">${cue(step.sayEs)}</div></div>`
    : `<div class="cal-cue">${cue(step.sayEs, { read: step.view === "namemonth" ? "" : "Tap:" })}</div>`;
  const node = el(`
    <div class="ex ex-cal ex-cal--tap ex-cal--${step.view}">
      ${head(esc(step.titleEn || (audible ? "Tap what you hear" : "Read it. Tap it on the calendar.")), `<span class="badge">${icon("calendar", 16, 2.75)} Calendar</span>`)}
      ${prompt}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="cal-board">${board(step, { tap: true })}</div>
    </div>`);
  wireCue(node, api, step.sayEs, who(step));
  node.addEventListener("keydown", (e) => arrowMove(e, node));
  // A date on a month page: its weekday column lights up too (L10: «Es miércoles, el doce de marzo.»).
  const lightColumn = (d) => {
    if (step.view !== "month") return;
    const dow = weekdayOf(d, step.month, { leap: !!step.leap });
    $$(".cal-page__dow", node).forEach((x) => x.classList.toggle("is-lit", +x.dataset.dow === dow));
  };
  return choiceController(node, { ...step, answer: step.target }, api, {
    selector: ".cal-hit",
    onChoose: (v) => lightColumn(v),
    result: (ok) => { lightColumn(step.target); return { ok, answerEs: step.answerEs || step.sayEs, answerEn: step.en, why: ok ? step.rightEn : step.whyEn }; },
    ctrl: { mount() { if (audible) setTimeout(() => api.speak(step.sayEs, false, who(step)), 350); } },
  });
}

/** A circled date on a month page → pick its Spanish. */
function calRead(step, api) {
  const order = shuffle(step.optionsEs.map((_, i) => i));
  const node = el(`
    <div class="ex ex-cal ex-cal--read">
      ${head(esc(step.titleEn || "Which date is circled?"), `<span class="badge">${icon("calendar", 16, 2.75)} Calendar</span>`)}
      <div class="cal-read">
        <div class="cal-board">${board(step, { tap: false })}</div>
        <div class="options" role="group">${order.map((oi, k) => `
          <button class="press option" data-oi="${oi}" aria-pressed="false"><span class="face"><span class="key" aria-hidden="true">${k + 1}</span>${es(step.optionsEs[oi], "label")}</span></button>`).join("")}</div>
      </div>
      ${noteHtml(step.noteEn)}
    </div>`);
  return choiceController(node, step, api, { result: (ok) => ({ ok, answerEs: step.optionsEs[step.answer], answerEn: step.en, why: ok ? "" : step.whyEn }) });
}

/** A circled date → say it (speech check against `es`, or `alsoEs`). Speaking off: build it with tiles instead. */
function calSay(step, api) {
  if (!speakingOn()) return tiles({ ...step.tiles, id: step.id, type: "tiles", character: step.character, en: step.en, fullEs: step.es }, api);
  const node = el(`
    <div class="ex ex-cal ex-cal--say">
      ${head(esc(step.titleEn || "Say the date in Spanish"), `<span class="badge">${icon("mic", 16, 2.75)} Speak</span>`)}
      <div class="cal-board">${board(step, { tap: false })}</div>
      <p class="context">${rich(step.contextEn || "Say the circled date, with its day.")}</p>
      <div class="mic-stage">
        <button class="press icon-btn icon-btn--magenta mic-btn" aria-label="Tap and speak"><span class="face">${icon("mic", 44, 2.5)}</span></button>
        <p class="mic-status" aria-live="polite">Tap the microphone, then say it.</p>
      </div>
      <div class="ex-escape"><button class="btn-text" data-cant="speak">${icon("mic-off", 20, 2.5)} Can't speak now</button></div>
    </div>`);
  const mic = $(".mic-btn", node), status = $(".mic-status", node);
  let tries = 0, busy = false;
  node.querySelector("[data-cant]").addEventListener("click", () => { stt.stop(); api.skip("speak"); });
  mic.addEventListener("click", async () => {
    if (busy) { stt.stop(); return; }
    busy = true; sfx.select();
    status.textContent = "Getting the microphone ready…";
    const r = await stt.listen({ onStart: () => { node.classList.add("is-listening"); status.textContent = "Listening… say it now!"; } });
    node.classList.remove("is-listening"); busy = false;
    if (r.ok && [step.es, ...(step.alsoEs || [])].some((t) => speechMatches(t, r.heard))) {
      status.innerHTML = `Buhísimo heard: “${esc(r.heard[0])}”`;
      api.complete({ ok: true, answerEs: step.es, answerEn: step.en });
      return;
    }
    tries++;
    status.innerHTML = r.ok ? `Buhísimo heard: “${esc(r.heard[0])}”. Let's try again!` : "I didn't catch that. Tap the mic and try again.";
    restartAnim(mic, "shake");
    if (tries >= 2) {
      status.innerHTML = `Here it is: ${es(step.es)}. Say it once more, or go on.`;
      api.setFooter("Continue", { enabled: true, variant: "secondary" });
    }
  });
  return { el: node, footer: { label: "Check", enabled: false }, aside: ["cant-speak", "skip"], onSkip() { stt.stop(); api.next(); }, onMain() { stt.stop(); api.next(); }, destroy() { stt.stop(); } };
}

// ------------------------------------------------------------ order the days or months
export function order(step, api) {
  const words = step.wordsEs, seq = step.seq;
  const bank = shuffle([...seq.map((v, i) => ({ v, w: words[i] })), ...(step.extraEs || []).map((w) => ({ v: -1, w }))]);
  const pic = (lit) => (step.view === "week" ? weekStrip({ lit, names: "lit", cls: "cal-week--big" }) : yearView({ lit, names: "lit" }));
  const node = el(`
    <div class="ex ex-order ex-order--${step.view}">
      ${head(esc(step.titleEn || "Put them in order"), `<span class="badge">${icon(step.timed ? "timer" : "calendar", 16, 2.75)} ${step.timed ? "Against the clock" : "In order"}</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      ${step.timed ? `<p class="order-clock" aria-live="off">${icon("timer", 18, 2.5)} <b>0.0</b> s${best() ? ` · best ${best().toFixed(1)} s` : ""}</p>` : ""}
      <div class="cal-board order-board">${pic([])}</div>
      <div class="bank order-bank" lang="es" role="group" aria-label="Words">
        ${bank.map((b, k) => `<span class="tile-slot"><button class="press tile order-tile" data-v="${b.v}" data-b="${k}"><span class="face" data-key="${k + 1}">${esc(b.w)}</span></button></span>`).join("")}
      </div>
    </div>`);
  function best() { try { return +localStorage.getItem(`buhisimo.order.best.${step.id}`) || 0; } catch { return 0; } }
  let k = 0, mixups = 0, busy = false, t0 = 0, clock = 0;
  const lit = [];
  const tick = () => { const b = $(".order-clock b", node); if (b) b.textContent = ((performance.now() - t0) / 1000).toFixed(1); clock = requestAnimationFrame(tick); };
  const tap = (b) => {
    if (busy || k >= seq.length || b.disabled) return;
    if (step.timed && !t0) { t0 = performance.now(); tick(); }
    if (+b.dataset.v === seq[k]) {
      sfx.pair();
      b.disabled = true; b.classList.add("is-ghost");
      lit.push(seq[k]);
      $(".order-board", node).innerHTML = pic(lit);
      api.speak(words[k]);
      k++;
      if (k === seq.length) finish();
    } else {
      mixups++; busy = true; sfx.wrong();
      b.classList.add("is-wrong"); restartAnim(b, "shake");
      setTimeout(() => { b.classList.remove("is-wrong"); busy = false; }, 520);
    }
  };
  function finish() {
    cancelAnimationFrame(clock);
    let timeTip = "";
    if (step.timed && t0) {
      const s = (performance.now() - t0) / 1000, prev = best();
      if (!prev || s < prev) { try { localStorage.setItem(`buhisimo.order.best.${step.id}`, s.toFixed(1)); } catch { /* private window */ } }
      timeTip = ` ${s.toFixed(1)} seconds${!prev || s < prev ? ": your best time!" : `; your best is ${prev.toFixed(1)} s.`}`;
    }
    setTimeout(() => api.complete({
      ok: true, hinted: mixups > 0, title: es(pick(api.lesson.praiseEs)),
      body: `<span class="feedback__tip">${mixups ? `In order, with ${mixups} mix-up${mixups > 1 ? "s" : ""} on the way.` : "Every one in order, first time!"}${timeTip}</span>`,
      answerEs: step.sayEs || undefined, answerEn: step.en || undefined,
    }), reducedMotion() ? 200 : 700);
  }
  node.addEventListener("click", (e) => { const b = e.target.closest(".order-tile"); if (b) tap(b); });
  return {
    el: node, footer: { label: "Check", enabled: false }, aside: ["skip"],
    onSkip() { cancelAnimationFrame(clock); api.next(); },
    onKey(n) { const b = $$(".order-tile", node)[n - 1]; if (b) tap(b); },
    destroy() { cancelAnimationFrame(clock); },
  };
}

// ------------------------------------------------------------ Calendar tap (the L8 game)
// A wall calendar. Hear (or read) a day, a month or a date and tap it before Max lands on it: Max hops
// from square to square while the bar runs down, and his last hop lands on the answer (a miss; that
// round comes back once at the end). Waves: `board` "week" | "year" | "mix" (a day strip, the year and an
// ID-card tile: the look-alikes) | "date" (a month page with ‹ › to flip to the month, then tap the day).
// "Slower" halves the speed (on from the start under reduced motion, which also stops the hopping
// animation). Keys: 1–7 tap a day (1–9, 0 a month), arrows move between squares, Enter or Space taps.
const keyOfRound = (r) => (r.card ? "card" : r.day != null ? `d${r.day}` : r.d != null ? `p${r.d}/${r.month}` : `m${r.month}`);

export function caltap(step, api) {
  const rounds = step.waves.flatMap((w, wi) => w.rounds.map((r, ri) => ({ ...r, wave: wi, firstOfWave: ri === 0 })));
  const total = rounds.length;
  let queue = [...rounds], cur = null, score = 0, misses = 0, firstTry = 0, streak = 0, bestStreak = 0, missedThis = false, busy = true, over = false;
  const still = reducedMotion();
  let slow = still, prog = 0, last = 0, raf = 0, nextHop = 0, page = 1, waveShown = -1;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const bestKey = `buhisimo.caltap.best.${step.id}`;
  const readBest = () => { try { return +localStorage.getItem(bestKey) || 0; } catch { return 0; } };
  const node = el(`
    <div class="ex ex-caltap${still ? " is-still" : ""}">
      <div class="ex-head inv-head">
        <div class="inv-head__row">
          <span class="badge">${icon("gamepad-2", 16, 2.75)} Game</span>
          <button class="inv-slow" aria-pressed="${slow}">${icon("turtle", 18, 2.5)}<span>Slower</span></button>
        </div>
        <h1 class="h-title">${esc(step.titleEn || "Calendar tap")}</h1>
      </div>
      <div class="ct-hud" aria-live="polite">
        <span class="ct-wave"></span>
        <span class="ct-score"><b class="ct-score__n">0</b> of ${total}</span>
        <span class="ct-streak">${icon("flame", 16, 2.5)} <b class="ct-streak__n">0</b></span>
        <span class="ct-best">Best ${icon("trophy", 14, 2.5)} <b>${readBest()}</b></span>
      </div>
      <div class="inv-cue ct-cue" aria-live="polite"></div>
      <div class="ct-timer" aria-hidden="true"><i></i></div>
      <div class="ct-board"><div class="ct-squares"></div><img class="ct-max" src="assets/max-jump.webp" alt="" draggable="false"></div>
    </div>`);
  const cueEl = $(".ct-cue", node), squares = $(".ct-squares", node), maxImg = $(".ct-max", node), bar = $(".ct-timer i", node), slowBtn = $(".inv-slow", node);
  slowBtn.addEventListener("click", () => { slow = !slow; slowBtn.setAttribute("aria-pressed", String(slow)); sfx.tap(); });

  const wave = () => step.waves[cur.wave];
  const roundMs = () => (cur.ms || wave().roundMs || 7000) * (slow ? 2 : 1);
  function renderBoard() {
    const b = wave().board;
    if (b === "week") squares.innerHTML = weekStrip({ tap: true, names: "all", cls: "cal-week--big" });
    else if (b === "year") squares.innerHTML = yearView({ tap: true, names: "all" });
    else if (b === "mix") squares.innerHTML = `${weekStrip({ tap: true, names: "all" })}<div class="ct-mixrow">${yearView({ tap: true, names: "all" })}
      <button class="press cal-hit ct-card" data-k="card" aria-label="The ID card"><span class="face">${idCard({ photo: "samuel", fields: [{ qEs: "¿El nombre?", valueEs: "Samuel" }], cls: "idcard--mini" })}</span></button></div>`;
    else squares.innerHTML = monthPage(page, { tap: true, flip: true, leap: !!cur.leap && page === 2 });
    squares.dataset.board = b;
    node.dataset.page = b === "date" ? page : "";
  }
  const keyOf = (b) => b.dataset.k || (b.closest(".cal-week") ? `d${b.dataset.oi}` : b.closest(".cal-page") ? `p${b.dataset.oi}/${page}` : `m${b.dataset.oi}`);
  const hits = () => $$(".cal-hit", squares).filter((b) => !b.disabled);
  const answerBtn = () => hits().find((b) => keyOf(b) === keyOfRound(cur));
  let hopKey = "";
  function hopTo(b, { land = false } = {}) {
    if (!b) return;
    const box = node.querySelector(".ct-board").getBoundingClientRect(), r = b.getBoundingClientRect();
    maxImg.style.setProperty("--mx", `${(r.left - box.left + r.width / 2).toFixed(0)}px`);
    maxImg.style.setProperty("--my", `${(r.top - box.top + (land ? r.height * 0.15 : 0)).toFixed(0)}px`);
    if (!still) restartAnim(maxImg, "hop");
  }
  function frame(now) {
    raf = 0;
    if (over || !node.isConnected) return;
    const dt = Math.min(100, now - (last || now));
    last = now;
    if (!busy && cur) {
      prog += dt / roundMs();
      nextHop -= dt;
      if (nextHop <= 0 && prog < 0.92) {
        // Never the answer, and never the square he is already on, so every hop visibly moves him.
        const all = hits().filter((b) => keyOf(b) !== keyOfRound(cur));
        const opts = all.length > 1 ? all.filter((b) => keyOf(b) !== hopKey) : all;
        const to = opts[Math.floor(Math.random() * opts.length)];
        if (to) hopKey = keyOf(to);
        hopTo(to);
        nextHop = roundMs() / 6;
      }
      if (prog >= 1) landed();
    }
    bar.style.transform = `scaleX(${Math.max(0, 1 - prog).toFixed(3)})`;
    raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

  function next() {
    if (!queue.length) return end();
    cur = queue.shift();
    missedThis = false; prog = 0; nextHop = 0;
    if (wave().board === "date") page = cur.startMonth || (cur.month === 1 ? 2 : cur.month - 1);
    renderBoard();
    maxImg.src = "assets/max-jump.webp";
    node.dataset.answer = keyOfRound(cur); // test hooks (e2e)
    node.dataset.round = (+node.dataset.round || 0) + 1;
    const announce = cur.wave !== waveShown;
    waveShown = cur.wave;
    $(".ct-wave", node).innerHTML = `Wave ${cur.wave + 1} of ${step.waves.length}: ${wave().titleEs ? es(wave().titleEs) : esc(wave().titleEn || "")}`;
    cueEl.innerHTML = cue(cur.sayEs, { read: "Tap:" });
    hopTo(hits()[0]);
    const go = () => { busy = false; if (hasAudio(cur.sayEs)) later(() => api.speak(cur.sayEs), 150); run(); };
    if (announce && step.waves.length > 1) { restartAnim($(".ct-wave", node), "pop"); later(go, still ? 300 : 900); } else go();
  }
  function landed() {
    busy = true; misses++; missedThis = true; streak = 0;
    sfx.wrong();
    $(".ct-streak__n", node).textContent = streak;
    const b = answerBtn();
    b?.classList.add("is-answer");
    hopTo(b, { land: true });
    maxImg.src = "assets/max-celebrate.webp";
    node.classList.add("is-landed");
    if (!cur.again) queue.push({ ...cur, again: true });
    later(() => { node.classList.remove("is-landed"); next(); }, 1500);
  }
  function tapSquare(b) {
    if (busy || over || !cur || b.disabled || b.getAttribute("aria-disabled") === "true") return;
    if (keyOf(b) === keyOfRound(cur)) {
      busy = true; score++; streak++; bestStreak = Math.max(bestStreak, streak);
      if (!missedThis && !cur.again) firstTry++;
      sfx.pair();
      b.classList.add("is-hit"); restartAnim(b, "pop");
      $(".ct-score__n", node).textContent = score;
      $(".ct-streak__n", node).textContent = streak;
      if (!still) restartAnim($(".ct-hud", node), "pop");
      later(next, still ? 250 : 650);
    } else {
      sfx.wrong(); misses++; missedThis = true; streak = 0;
      $(".ct-streak__n", node).textContent = streak;
      b.setAttribute("aria-disabled", "true");
      if (!still) restartAnim(b, "shake");
    }
  }
  function end() {
    over = true; busy = true;
    delete node.dataset.answer;
    cancelAnimationFrame(raf); raf = 0;
    const prev = readBest();
    if (bestStreak > prev) { try { localStorage.setItem(bestKey, String(bestStreak)); } catch { /* private window */ } }
    cueEl.innerHTML = `<span class="inv-win">${icon("trophy", 22, 2.5)} The whole calendar!</span>`;
    later(() => api.complete({
      ok: true, hinted: misses > 0, title: es(pick(api.lesson.praiseEs)),
      body: `<span class="feedback__tip">${firstTry} of ${total} on the first try${misses ? `; ${misses} miss${misses > 1 ? "es" : ""} on the way` : ". Perfect!"} Best streak: ${bestStreak}${bestStreak > prev ? " (a new record!)" : ""}.</span>`,
    }), 400);
  }
  node.addEventListener("click", (e) => {
    const f = e.target.closest(".cal-flip");
    if (f && !over) { page = wrap(page + +f.dataset.flip); sfx.tap(); renderBoard(); return; }
    const b = e.target.closest(".cal-hit");
    if (b) tapSquare(b);
    else if (e.target.closest("[data-cue]") && cur) api.speak(cur.sayEs, e.target.closest("[data-cue]").dataset.cue === "slow");
  });
  node.addEventListener("keydown", (e) => arrowMove(e, squares));
  const stop = () => { over = true; cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers.clear(); };
  return {
    el: node, footer: { label: "Check", enabled: false }, aside: ["skip"],
    onSkip() { stop(); api.next(); },
    onKey(n) {
      if (!cur || busy) return;
      const b = wave().board === "week" ? $$(".cal-week .cal-hit", squares)[n - 1] : wave().board === "year" ? $$(".cal-year .cal-hit", squares)[n - 1] : null;
      if (b) { b.focus({ preventScroll: true }); tapSquare(b); }
    },
    mount() { later(next, 300); },
    destroy: stop,
  };
}

/** Arrow keys move the focus between the squares of a board (nearest square in that direction). */
function arrowMove(e, root) {
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (!dir) return;
  const all = $$(".cal-hit:not(:disabled), .cal-flip", root);
  const cur = document.activeElement && all.includes(document.activeElement) ? document.activeElement : null;
  e.preventDefault();
  if (!cur) { all[0]?.focus({ preventScroll: true }); return; }
  const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  let best = null, bestD = Infinity;
  for (const b of all) {
    if (b === cur) continue;
    const r = b.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
    const along = dx * dir[0] + dy * dir[1];
    if (along <= 4) continue;
    const d = along + Math.abs(dir[0] ? dy : dx) * 2.5;
    if (d < bestD) { bestD = d; best = b; }
  }
  best?.focus({ preventScroll: true });
}

// ------------------------------------------------------------ date dictation
export function datedict(step, api) {
  const node = el(`
    <div class="ex ex-dictation ex-datedict">
      ${head(esc(step.titleEn || (hasAudio(step.sayEs) ? "Listen. Write the date." : "Read it. Write the date.")))}
      ${step.character ? `<div class="speaker-row dict-who">${charImg(step.character)}<div class="bubble">${cue(step.sayEs)}</div></div>` : `<div class="dict-stage">${cue(step.sayEs)}</div>`}
      <p class="context">Write it the Australian way, as numbers: the day, then the month.</p>
      <div class="dict-boxes date-boxes" role="group" aria-label="The date">
        <label class="dict-box"><input class="type-input dict-input" data-k="0" type="text" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Day"><span class="dict-box__lbl">day</span><span class="dict-box__ans" hidden></span></label>
        <span class="date-slash" aria-hidden="true">/</span>
        <label class="dict-box"><input class="type-input dict-input" data-k="1" type="text" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Month"><span class="dict-box__lbl">month</span><span class="dict-box__ans" hidden></span></label>
      </div>
    </div>`);
  wireCue(node, api, step.sayEs, step.character);
  const inputs = $$(".dict-input", node);
  const want = [step.d, step.m];
  node.addEventListener("input", (e) => {
    const i = e.target.closest(".dict-input");
    if (!i) return;
    i.value = i.value.replace(/\D/g, "");
    if (i.value.length === 2 && i.dataset.k === "0") inputs[1].focus({ preventScroll: true });
    api.enableCheck(inputs.every((x) => x.value.trim() !== ""));
  });
  node.addEventListener("keydown", (e) => {
    const i = e.target.closest(".dict-input");
    if (!i) return;
    if ((e.key === "/" || e.key === " ") && i.dataset.k === "0") { e.preventDefault(); inputs[1].focus(); }
    if (e.key === "Backspace" && !i.value && i.dataset.k === "1") { e.preventDefault(); inputs[0].focus(); }
  });
  return {
    el: node, footer: { label: "Check", enabled: false }, aside: ["skip"],
    mount() { setTimeout(() => inputs[0].focus({ preventScroll: true }), 300); if (hasAudio(step.sayEs)) setTimeout(() => api.speak(step.sayEs, false, step.character), 350); },
    check({ skipped = false } = {}) {
      let right = 0;
      inputs.forEach((i, k) => {
        i.readOnly = true;
        const ok = i.value.trim() !== "" && +i.value === want[k];
        if (ok) right++;
        const box = i.closest(".dict-box");
        box.classList.add(ok ? "is-correct" : "is-wrong");
        if (!ok) { const a = box.querySelector(".dict-box__ans"); a.hidden = false; a.textContent = want[k]; }
      });
      if (right < 2 && !skipped) restartAnim($(".date-boxes", node), "shake");
      return { ok: right === 2, answerEs: step.sayEs, answerEn: `${step.d}/${step.m} (${dateEn(step.d, step.m)})` };
    },
  };
}

// ------------------------------------------------------------ the birthday wall
export function wall(step, api) {
  const node = el(`
    <div class="ex ex-wall">
      ${head(esc(step.titleEn || "The birthday wall"), `<span class="badge">${icon("cake", 16, 2.75)} Birthdays</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="tr-tools"><button class="radio-chip" data-en-all aria-pressed="false">EN</button></div>
      <div class="wall-grid wall-grid--n${step.people.length}">
        ${step.people.map((p, k) => `
          <figure class="wall-card">
            <div class="bubble wall-bubble">
              ${hasAudio(p.es) ? `<button class="press icon-btn icon-btn--primary icon-btn--sm" data-p="${k}" aria-label="Play ${esc(p.labelEn)}"><span class="face">${icon("volume-2", 20)}</span></button>` : audioSoon(true)}
              <span>${es(p.es, "wall-es")}<span class="wall-en" hidden>${esc(p.en)}</span></span>
            </div>
            <img class="wall-img" src="assets/${p.art}.webp" alt="" draggable="false">
            <figcaption>${esc(p.labelEn)}</figcaption>
          </figure>`).join("")}
      </div>
      ${noteHtml(step.noteEn)}
    </div>`);
  node.addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]");
    if (b) { const p = step.people[+b.dataset.p]; api.speak(p.es, false, p.who); return; }
    const en = e.target.closest("[data-en-all]");
    if (en) { const on = en.getAttribute("aria-pressed") !== "true"; en.setAttribute("aria-pressed", String(on)); $$(".wall-en", node).forEach((x) => (x.hidden = !on)); }
  });
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); }, onKey(n) { $$("[data-p]", node)[n - 1]?.click(); } };
}

// ------------------------------------------------------------ el + veinte + de + julio
export function datepattern(step, api) {
  const parts = (r) => {
    const num = r.es.replace(/^el /, "").replace(/ de \S+$/, "");
    return { num, month: MONTHS_ES[r.m - 1] };
  };
  const node = el(`
    <div class="ex ex-pattern ex-datepattern">
      ${head(esc(step.titleEn), `<span class="badge">${icon("lightbulb", 16, 2.75)} How it works</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="pattern-card">
        ${step.rows.map((r, i) => { const p = parts(r); return `
          <button class="press pattern-row" data-row="${i}" aria-label="${r.d}/${r.m}: ${esc(r.es)}">
            <span class="face">
              <span class="pattern-cell pattern-cell--el">${es("el")}</span>
              <span class="pattern-cell">${es(p.num)}<b>${r.d}</b></span>
              <span class="pattern-cell pattern-cell--el">${es("de")}</span>
              <span class="pattern-cell">${es(p.month)}<b>${r.m}</b></span>
              <span class="pattern-op" aria-hidden="true">${icon("chevron-right", 22, 3)}</span>
              <span class="pattern-cell pattern-cell--out"><b>${r.d}/${r.m}</b></span>
            </span>
          </button>`; }).join("")}
      </div>
      ${noteHtml(step.noteEn)}
    </div>`);
  node.addEventListener("click", (e) => { const b = e.target.closest("[data-row]"); if (b) { sfx.select(); restartAnim(b, "pop"); api.speak(step.rows[+b.dataset.row].es); } });
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); } };
}

// ------------------------------------------------------------ culture card
export function culture(step, api) {
  const art = step.art === "seasons" ? seasonsArt() : `<img class="culture-img" src="assets/${step.art}.webp" alt="${esc(step.altEn || "")}" draggable="false">`;
  const node = el(`
    <div class="ex ex-culture">
      ${head(esc(step.titleEn), `<span class="badge badge--magenta">${icon("globe", 16, 2.75)} Culture</span>`)}
      <div class="culture-card">
        <div class="culture-art">${art}</div>
        <div class="culture-text">
          <p>${rich(step.textEn)}</p>
          ${step.es ? `<p class="culture-es">${hasAudio(step.es) ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-say-es aria-label="Play"><span class="face">${icon("volume-2", 20)}</span></button>` : ""}${es(step.es)} <span class="muted">${esc(step.en || "")}</span></p>` : ""}
        </div>
      </div>
    </div>`);
  node.querySelector("[data-say-es]")?.addEventListener("click", () => api.speak(step.es, false, step.character));
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); } };
}

// ------------------------------------------------------------ Radio Búho: the day or month each caller says
export function calradio(step, api) {
  const ep = episodeById(step.episode);
  const linesOf = (r) => r.lines.map((i) => ep.lines[i]);
  const audible = step.rows.every((r) => linesOf(r).every((l) => hasAudio(l.es)));
  const picked = step.rows.map(() => ({ when: null, face: null }));
  const node = el(`
    <div class="ex ex-radio ex-radio--faces ex-calradio">
      ${head(esc(step.titleEn || "Radio Búho"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Radio Búho</span>`)}
      <p class="context">${rich(step.contextEn || "")}</p>
      ${audible ? `<div class="radio-onair">${charImg("owl-explaining", "radio-onair__owl")}<button class="press btn btn--magenta radio-playall" data-playall><span class="face">${icon("play", 22, 2.75)}<span>Play the calls</span></span></button></div>`
        : `<p class="radio-read">${icon("clock", 16, 2.5)}<span>The calls aren't recorded yet, so read them.</span></p>`}
      <div class="radio-grid" role="group" aria-label="Your answers">
        ${step.rows.map((r, k) => `
          <div class="radio-row" data-row="${k}">
            <div class="radio-row__head"><span class="radio-row__n">${k + 1}</span><span class="radio-row__label">${esc(r.labelEn)}</span>
              ${audible ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-call="${k}" aria-label="Play call ${k + 1}"><span class="face">${icon("volume-2", 20)}</span></button>`
                : `<span class="radio-row__call">${linesOf(r).map((l) => es(l.es)).join(" ")}</span>`}</div>
            <div class="radio-row__picks"><div class="id-chips calradio-when" role="radiogroup" aria-label="Which day or month?">${r.optionsEs.map((o, j) => `<button class="press id-chip" role="radio" aria-checked="false" data-row="${k}" data-o="${j}"><span class="face">${es(o)}</span></button>`).join("")}</div>
            <div class="radio-faces" role="radiogroup" aria-label="How are they?">${step.faces.map((f) => `<button class="press face-pick" role="radio" aria-checked="false" data-row="${k}" data-face="${f}" aria-label="${esc(faceEn(f))}"><span class="face">${face(f)}</span></button>`).join("")}</div></div>
            <span class="radio-row__answer" hidden></span>
          </div>`).join("")}
      </div>
    </div>`);
  const enable = () => api.enableCheck(picked.every((p) => p.when != null && p.face));
  let playing = false;
  async function play(rows = step.rows.map((_, k) => k)) {
    if (playing) return;
    playing = true;
    for (const k of rows) {
      const row = $(`.radio-row[data-row="${k}"]`, node);
      row?.classList.add("is-playing");
      for (const l of linesOf(step.rows[k])) { if (!node.isConnected) break; await api.speak(l.es, false, l.who); }
      row?.classList.remove("is-playing");
    }
    playing = false;
  }
  node.addEventListener("click", (e) => {
    if (node.classList.contains("is-checked")) return;
    const c = e.target.closest(".id-chip");
    if (c) { const k = +c.dataset.row; picked[k].when = +c.dataset.o; $$(`.id-chip[data-row="${k}"]`, node).forEach((x) => x.setAttribute("aria-checked", String(x === c))); sfx.select(); restartAnim(c, "pop"); enable(); return; }
    const f = e.target.closest(".face-pick");
    if (f) { const k = +f.dataset.row; picked[k].face = f.dataset.face; $$(`.face-pick[data-row="${k}"]`, node).forEach((x) => x.setAttribute("aria-checked", String(x === f))); sfx.select(); restartAnim(f, "pop"); enable(); return; }
    const call = e.target.closest("[data-call]");
    if (call) { play([+call.dataset.call]); return; }
    if (e.target.closest("[data-playall]")) play();
  });
  return {
    el: node, footer: { label: "Check", enabled: false }, aside: ["skip"],
    mount() { if (audible) setTimeout(() => play(), 450); },
    check({ skipped = false } = {}) {
      node.classList.add("is-checked");
      let right = 0;
      step.rows.forEach((r, k) => {
        const row = $(`.radio-row[data-row="${k}"]`, node);
        const ok = r.optionsEs[picked[k].when] === r.whenEs && picked[k].face === r.face;
        if (ok) right++;
        row.classList.add(ok ? "is-correct" : "is-wrong");
        const ans = row.querySelector(".radio-row__answer");
        ans.hidden = false;
        ans.innerHTML = `${es(r.whenEs)} · ${face(r.face)}<span>${esc(faceEn(r.face))}</span>${audible ? `<span class="radio-row__call">${linesOf(r).map((l) => es(l.es)).join(" ")}</span>` : ""}`;
        if (!ok && !skipped) restartAnim(row, "shake");
      });
      const all = right === step.rows.length;
      return { ok: all, title: all ? undefined : `${right} of ${step.rows.length} right`,
        body: `<span class="feedback__tip">${all ? "Every call right!" : "Look at the answers on the grid, then listen again."}</span>` };
    },
    destroy() { playing = false; },
  };
}

// ------------------------------------------------------------ the party calendar (L13)
export function partycal(step, api) {
  const ep = episodeById(step.episode);
  const linesOf = (c) => c.lines.map((i) => ep.lines[i]);
  const audible = step.calls.every((c) => linesOf(c).every((l) => hasAudio(l.es)));
  let k = 0, page = step.startMonth || 1, tries = 0, reveals = 0;
  const stickers = new Map(); // month -> [days]
  const node = el(`
    <div class="ex ex-partycal">
      ${head(esc(step.titleEn || "The party calendar"), `<span class="badge badge--magenta">${icon("radio", 16, 2.75)} Radio Búho</span>`)}
      <p class="context">${rich(step.contextEn || "")}</p>
      <ol class="party-calls">${step.calls.map((c, j) => `
        <li class="party-call" data-call="${j}">
          <span class="radio-row__n">${j + 1}</span>
          ${audible ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-play="${j}" aria-label="Play call ${j + 1}"><span class="face">${icon("volume-2", 20)}</span></button><span class="party-call__label">${esc(c.labelEn)}</span>`
            : `<span class="party-call__text">${linesOf(c).map((l) => es(l.es)).join(" ")}</span>`}
          <span class="party-call__done" hidden>${icon("check", 18, 3)}</span>
        </li>`).join("")}</ol>
      <div class="cal-board party-board"></div>
    </div>`);
  const boardEl = $(".party-board", node);
  const render = () => { boardEl.innerHTML = monthPage(page, { tap: true, flip: true, stickers: stickers.get(page) || [] }); node.dataset.page = page; };
  const setCall = () => {
    $$(".party-call", node).forEach((li, j) => li.classList.toggle("is-now", j === k));
    node.dataset.answer = k < step.calls.length ? `${step.calls[k].d}/${step.calls[k].m}` : "";
    tries = 0;
  };
  const say = async (j) => { for (const l of linesOf(step.calls[j])) { if (!node.isConnected) return; await api.speak(l.es, false, l.who); } };
  const place = (c) => { stickers.set(c.m, [...(stickers.get(c.m) || []), c.d]); };
  function advance() {
    $(`.party-call[data-call="${k}"] .party-call__done`, node).hidden = false;
    k++;
    setCall();
    if (k >= step.calls.length) {
      setTimeout(() => api.complete({ ok: reveals === 0, title: reveals ? `${step.calls.length - reveals} of ${step.calls.length} right` : es(pick(api.lesson.praiseEs)),
        body: `<span class="feedback__tip">${reveals ? "Listen again to the calls you missed." : "Every birthday on the party calendar!"}</span>`,
        answerEn: step.calls.map((c) => `${c.labelEn}: ${dateEn(c.d, c.m)}`).join(" · ") }), 600);
    } else if (audible) setTimeout(() => say(k), 600);
  }
  node.addEventListener("click", (e) => {
    const f = e.target.closest(".cal-flip");
    if (f) { page = wrap(page + +f.dataset.flip); sfx.tap(); render(); return; }
    const p = e.target.closest("[data-play]");
    if (p) { say(+p.dataset.play); return; }
    const b = e.target.closest(".cal-hit");
    if (!b || k >= step.calls.length) return;
    const c = step.calls[k];
    if (page === c.m && +b.dataset.oi === c.d) {
      sfx.pair(); place(c); render(); restartAnim($(`.cal-page__day.cal-hit[data-oi="${c.d}"]`, boardEl), "pop"); advance();
    } else {
      sfx.wrong(); restartAnim(b, "shake"); tries++;
      if (tries >= 2) { reveals++; page = c.m; place(c); render(); boardEl.querySelector(`.cal-hit[data-oi="${c.d}"]`)?.classList.add("is-answer"); advance(); }
    }
  });
  node.addEventListener("keydown", (e) => arrowMove(e, boardEl));
  render(); setCall();
  return {
    el: node, footer: { label: "Check", enabled: false }, aside: ["skip"],
    onSkip() { api.next(); },
    mount() { if (audible) setTimeout(() => say(0), 450); },
  };
}

// ------------------------------------------------------------ "Your birthday" (L11 You Do)
// stage "pick": tap your own birthday (any date is fine) → stage "tiles" → "type" → "say" build the
// sentence «Mi cumpleaños es el … de ….» from it. The date is kept in memory for this lesson only
// (a WeakMap keyed by the lesson): never in localStorage, never in the progress file.
const MYDATE = new WeakMap();
const myDate = (api) => MYDATE.get(api) || { d: 20, m: 7 };
const sentenceTiles = (d, m) => {
  const num = d === 1 ? "primero" : NUM_ES[d];
  const otherNum = NUM_ES[d === 31 ? 30 : d + 1];
  return { answerEs: ["mi cumpleaños", "es", "el", num, "de", MONTHS_ES[m - 1]], tilesEs: shuffle(["mi cumpleaños", "es", "el", num, "de", MONTHS_ES[m - 1], "tu cumpleaños", otherNum, MONTHS_ES[m % 12]]) };
};
export function mydate(step, api) {
  if (step.stage === "pick") return mydatePick(step, api);
  const { d, m } = myDate(api);
  const sentence = birthdaySentence(d, m);
  const en = `My birthday is ${dateEnLong(d, m)}.`;
  const built = { ...sentenceTiles(d, m), id: step.id, type: "tiles", character: step.character || "matilda", titleEn: "Your birthday: build the sentence", en, fullEs: sentence };
  if (step.stage === "tiles" || (step.stage === "say" && !speakingOn())) return tiles(built, api);
  if (step.stage === "type") return typeIt({ id: step.id, type: "type", titleEn: "Your birthday: type it", en, answerEs: sentence, altEs: d === 1 ? [birthdaySentence(d, m, { uno: true })] : [] }, api);
  const ctrl = speak({ id: step.id, type: "speak", character: step.character || "matilda", es: sentence, en }, api);
  // No model audio for this step (366 possible dates): no "audio soon" chip either.
  ctrl.el.querySelectorAll(".audio-soon, [data-audio]").forEach((x) => x.remove());
  return ctrl;
}
function mydatePick(step, api) {
  MYDATE.delete(api);
  let page = 1, chosen = null;
  const node = el(`
    <div class="ex ex-mydate">
      ${head(esc(step.titleEn || "Your birthday"), `<span class="badge">${icon("cake", 16, 2.75)} You do</span>`)}
      <p class="context">${rich(step.contextEn || "Flip to your birthday month and tap the day. Any date is fine: nothing is saved, and the app forgets it when this lesson ends.")}</p>
      <div class="cal-board mydate-board"></div>
      <p class="mydate-chosen" aria-live="polite"></p>
    </div>`);
  const boardEl = $(".mydate-board", node);
  const render = () => {
    boardEl.innerHTML = monthPage(page, { tap: true, flip: true, leap: true, circle: chosen && chosen.m === page ? [chosen.d] : [] });
    node.dataset.page = page;
  };
  node.addEventListener("click", (e) => {
    const f = e.target.closest(".cal-flip");
    if (f) { page = wrap(page + +f.dataset.flip); sfx.tap(); render(); return; }
    const b = e.target.closest(".cal-hit");
    if (!b) return;
    chosen = { d: +b.dataset.oi, m: page };
    sfx.select(); render();
    $(".mydate-chosen", node).innerHTML = `${icon("cake", 18, 2.5)} ${esc(dateEn(chosen.d, chosen.m))}`;
    api.enableCheck(true);
  });
  node.addEventListener("keydown", (e) => arrowMove(e, boardEl));
  render();
  return {
    el: node, footer: { label: "Continue", enabled: false },
    onMain() { if (!chosen) return; MYDATE.set(api, chosen); sfx.tap(); api.next(); },
  };
}

export const EXERCISES_1_4 = { calendar, order, caltap, datedict, wall, datepattern, culture, calradio, partycal, mydate };
