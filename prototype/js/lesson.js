// Lesson runner + exercise types for the prototype.
// Each exercise is a controller: { el, mount?(), check?() -> result, footer, destroy?() }.
// Results: { ok, nearly?, title?, body?, answerEs?, owl? }.
import { icon } from "./icons.js";
import { $, $$, esc, es, rich, el, button, footBar, audioButtons, charImg, flagImg, shuffle, pick, restartAnim, reducedMotion, toast, openModal } from "./ui.js";
import { tts, stt, fold, speechMatches } from "./speech.js";
import { sfx } from "./sound.js";
import { store } from "./store.js";
import { mapFrame, wireMapPins, placeName } from "./worldmap.js";

const MAX_RETRIES = 2;

/** Does this Spanish line have a recorded clip? Lines without one show "audio coming"
 *  (no computer voice, unless the teacher switches it on in Settings). */
export const hasAudio = (text) => !!text && (tts.hasClip(text) || store.get().robotVoice);

export function runLesson(app, lesson, { onExit, onComplete, openSettings, onGraded }) {
  // ------------------------------------------------------------ queue
  const unsupported = [];
  let queue = lesson.steps.filter((s) => {
    if (s.type === "speak" && !stt.available()) { unsupported.push("speaking"); return false; }
    if (s.type === "speak" && !store.speakOn()) return false;
    // Listening is never audio-only without a recording: those steps become
    // "read and choose" (see listen()). Snoozed listening drops recorded ones.
    if (s.type === "listen" && hasAudio(s.sayEs) && (!tts.available() || !store.listenOn())) return false;
    return true;
  }).map((s) => ({ ...s, tries: 0 }));
  let total = queue.length;
  let done = 0;
  let idx = -1;
  let current = null;
  let mode = "answer"; // answer | feedback
  const stats = { graded: 0, correct: 0, firstTry: 0, streak: 0, bestStreak: 0 };
  let praiseCount = 0;

  // ------------------------------------------------------------ frame
  const screen = el(`
    <section class="screen lesson" aria-label="Lesson: ${esc(lesson.titleEn)}">
      <header class="lesson-top">
        <button class="bar-btn" data-act="close" aria-label="Quit lesson">${icon("x", 28, 3)}</button>
        <div class="progress" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress__fill"></div>
        </div>
        <button class="bar-btn" data-act="settings" aria-label="Settings">${icon("sliders-horizontal", 26, 2.5)}</button>
        <div class="combo" aria-hidden="true">${icon("flame", 16, 2.5)}<span></span></div>
      </header>
      <main class="lesson-body" tabindex="-1"></main>
      ${footBar(button("Check", { attrs: 'data-act="main"' }))}
      <div class="sheet feedback" role="region" aria-live="polite" aria-label="Answer feedback" inert>
        <img class="feedback__owl" alt="" src="assets/owl-celebrating.webp">
        <div class="feedback__head">
          <span class="feedback__icon"></span>
          <h2 class="feedback__title"></h2>
        </div>
        <div class="feedback__body"></div>
        ${button("Continue", { variant: "correct", attrs: 'data-act="continue"' })}
      </div>
    </section>`);
  app.appendChild(screen);

  const body = $(".lesson-body", screen);
  const mainBtn = $('[data-act="main"]', screen);
  const sheet = $(".feedback", screen);
  const contBtn = $('[data-act="continue"]', screen);
  const fill = $(".progress__fill", screen);
  const bar = $(".progress", screen);
  const combo = $(".combo", screen);
  const foot = $(".lesson-foot", screen);
  const aside = $(".lesson-foot__aside", screen);

  // Secondary actions shown on the left of the bottom bar from 700px wide.
  // (Phones keep them inside the exercise, as before.)
  const ASIDE = {
    skip: () => button("Skip", { variant: "secondary", block: false, attrs: 'data-act="skip"' }),
    "cant-listen": () => `<button class="btn-text" data-act="cant-listen">${icon("ear-off", 20, 2.5)} Can't listen now</button>`,
    "cant-speak": () => `<button class="btn-text" data-act="cant-speak">${icon("mic-off", 20, 2.5)} Can't speak now</button>`,
    show: () => `<button class="btn-text" data-act="show">${icon("sparkles", 18, 2.5)} Show me</button>`,
  };

  const api = {
    setFooter(label, { enabled = true, variant = "primary" } = {}) {
      mainBtn.querySelector(".face > span").textContent = label;
      mainBtn.className = `press btn btn--${variant} btn--block`;
      mainBtn.disabled = !enabled;
    },
    enableCheck(on) { mainBtn.disabled = !on; },
    setAside(keys = []) { aside.innerHTML = keys.map((k) => ASIDE[k]()).join(""); },
    complete(result) { showFeedback(result); },
    next() { advance(true); },
    skip(kind) { skipKind(kind); },
    speak: (text, slow, who) => (hasAudio(text) ? tts.speak(text, { slow, sayAs: lesson.sayAs, role: who ? roleOf(who) : roleFor(queue[idx], idx) }) : Promise.resolve(false)),
    lesson,
    index: () => idx,
  };

  // Which recorded voice says this step: Buhísimo's own lines in his voice,
  // Matilda in María's and Max in Raúl's (no kid voices yet); everything else
  // alternates María / Raúl from one exercise to the next.
  function roleFor(step, i) {
    return roleOf(step?.speaker || step?.character || "") || (i % 2 ? "raul" : "maria");
  }
  let praiseTimer = 0;

  function setProgress() {
    const p = Math.min(1, done / Math.max(1, total));
    fill.style.setProperty("--p", p);
    bar.setAttribute("aria-valuenow", Math.round(p * 100));
  }

  // ------------------------------------------------------------ flow
  function advance(countIt) {
    clearTimeout(praiseTimer);
    if (countIt) done++;
    setProgress();
    hideSheet();
    current?.destroy?.();
    idx++;
    if (idx >= queue.length) return finish();
    const step = queue[idx];
    mode = "answer";
    current = EXERCISES[step.type](step, api);
    const prev = body.firstElementChild;
    const next = current.el;
    const calm = step.type === "storyline" && queue[idx - 1]?.type === "storyline";
    if (!calm) next.classList.add("step-enter");
    if (prev && calm) prev.remove();
    else if (prev) {
      prev.classList.add("step-leave");
      prev.addEventListener("animationend", () => prev.remove(), { once: true });
      setTimeout(() => prev.remove(), 400);
    }
    body.appendChild(next);
    body.scrollTop = 0;
    const f = current.footer || { label: "Check", enabled: false };
    api.setFooter(f.label, f);
    api.setAside(current.aside);
    // Focus was on CONTINUE (now hidden): park it on the exercise, not the page.
    if (!screen.contains(document.activeElement) || sheet.contains(document.activeElement) || document.activeElement === document.body) body.focus({ preventScroll: true });
    current.mount?.();
  }

  function finish() {
    clearTimeout(praiseTimer);
    tts.stop();
    document.removeEventListener("keydown", onKey);
    const accuracy = stats.graded ? Math.round((stats.correct / stats.graded) * 100) : 100;
    const xp = lesson.xpBase + stats.firstTry;
    screen.classList.add("is-leaving");
    setTimeout(() => { screen.remove(); onComplete({ xp, accuracy, bestStreak: stats.bestStreak }); }, reducedMotion() ? 0 : 220);
  }

  function skipKind(kind) {
    // Remove the current step and every later step of that kind; they don't count against the student.
    const later = queue.slice(idx + 1).filter((s) => s.type === kind && !s.retry).length;
    queue = queue.filter((s, i) => i <= idx || s.type !== kind);
    total -= later;
    if (kind === "speak") { store.snoozeSpeak(); toast("Speaking exercises are off for 15 minutes.", "mic-off"); }
    if (kind === "listen") { store.snoozeListen(); toast("Listening exercises are off for 15 minutes.", "ear-off"); }
    advance(true);
  }

  // "Skip" (tablet/desktop bar): show the answer, and the question comes back later.
  function skipStep() {
    if (mode !== "answer" || !current) return;
    sfx.tap();
    if (current.onSkip) return current.onSkip();
    const r = current.check?.({ skipped: true });
    if (r) showFeedback({ ...r, ok: false, skipped: true, answerEn: r.answerEn || queue[idx].en || "" });
  }

  function showFeedback(result) {
    mode = "feedback";
    const step = queue[idx];
    stats.graded++;
    if (!step.retry && !result.skipped) onGraded?.(step, !!result.ok, result);
    if (result.ok) {
      stats.correct++;
      if (!step.retry) stats.firstTry++;
      stats.streak++;
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
      sfx.correct();
    } else {
      stats.streak = 0;
      sfx.wrong();
      if (step.tries < MAX_RETRIES) {
        // Duolingo-style: the same exercise comes back a few steps later.
        const again = { ...step, retry: true, tries: step.tries + 1 };
        queue.splice(Math.min(queue.length, idx + 3), 0, again);
      }
    }
    updateCombo();

    const wrongAndRetry = !result.ok && step.tries < MAX_RETRIES;
    sheet.classList.toggle("is-wrong", !result.ok);
    const owl = result.owl || (result.ok ? "owl-celebrating" : "owl-encouraging");
    $(".feedback__owl", sheet).src = `assets/${owl}.webp`;
    $(".feedback__icon", sheet).innerHTML = icon(result.ok ? "check" : "x", 28, 3.5);

    let title = result.title;
    if (!title) {
      if (result.ok) {
        praiseCount++;
        title = praiseCount === 1 || Math.random() < 0.35 ? es(pick(lesson.praiseEs)) : esc(pick(lesson.praiseEn));
      } else title = result.skipped ? "Here's the answer" : esc(pick(lesson.encourageEn));
    }
    $(".feedback__title", sheet).innerHTML = title;
    // Spanish praise is Buhísimo's catchphrase: he says it (unless listening is off).
    const praise = lesson.praiseEs.find((p) => title === es(p));
    if (praise && store.listenOn()) praiseTimer = setTimeout(() => tts.speak(praise, { role: "buho" }), 300);

    let bodyHtml = result.body || "";
    if (!result.ok && !result.body && !result.skipped) bodyHtml += `<span class="feedback__tip">${esc(pick(lesson.kindEn))}</span>`;
    if (result.answerEs) {
      if (!result.ok) bodyHtml += `<span class="feedback__label">Correct answer:</span>`;
      bodyHtml += `<span class="feedback__answer">${es(result.answerEs)}
        ${hasAudio(result.answerEs) ? `<button class="press icon-btn icon-btn--sm" data-say="${esc(result.answerEs)}" aria-label="Play answer"><span class="face">${icon("volume-2", 22)}</span></button>` : ""}</span>`;
      if (result.answerEn) bodyHtml += `<span class="feedback__en">${esc(result.answerEn)}</span>`;
    }
    if (wrongAndRetry) bodyHtml += `<span class="feedback__later">${icon("rotate-ccw", 16, 2.75)} We'll come back to this one.</span>`;
    $(".feedback__body", sheet).innerHTML = bodyHtml;
    $(".feedback__body", sheet).hidden = !bodyHtml;
    contBtn.className = `press btn btn--${result.ok ? "correct" : "wrong"} btn--block`;
    // Wrong answers don't move the bar; the retry will.
    pendingCount = result.ok || !wrongAndRetry;
    sheet.inert = false;
    sheet.classList.add("is-open");
    foot.inert = true;
    mainBtn.setAttribute("aria-hidden", "true");
    mainBtn.tabIndex = -1;
    setTimeout(() => contBtn.focus({ preventScroll: true }), 80);
  }
  let pendingCount = false;

  function hideSheet() {
    sheet.classList.remove("is-open");
    sheet.inert = true;
    foot.inert = false;
    mainBtn.removeAttribute("aria-hidden");
    mainBtn.tabIndex = 0;
  }

  function updateCombo() {
    if (stats.streak >= 3) {
      combo.querySelector("span").textContent = `${stats.streak} in a row`;
      combo.classList.add("is-on");
      restartAnim(combo, "pop");
    } else combo.classList.remove("is-on");
  }

  // ------------------------------------------------------------ events
  screen.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act], [data-say]");
    if (!t) return;
    if (t.dataset.say) { api.speak(t.dataset.say, false); return; }
    const act = t.dataset.act;
    if (act === "main" && !mainBtn.disabled) {
      if (current.onMain) return current.onMain();
      const r = current.check?.();
      if (r) showFeedback(r);
    } else if (act === "continue") {
      advance(pendingCount);
    } else if (act === "close") confirmQuit();
    else if (act === "settings") openSettings?.();
    else if (act === "skip") skipStep();
    else if (act === "cant-listen") api.skip("listen");
    else if (act === "cant-speak") { stt.stop(); api.skip("speak"); }
    else if (act === "show") current?.showMe?.();
  });

  // Keyboard: Enter = CHECK / CONTINUE, Esc = quit dialog, 1–9 (and 0) pick an
  // option, tile or card, Backspace takes the last tile back.
  function onKey(e) {
    if (document.querySelector(".modal") || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target instanceof Element ? e.target : null;
    if (e.key === "Enter") {
      if (e.repeat) { e.preventDefault(); return; } // holding Enter never races through steps
      if (mode === "feedback") { e.preventDefault(); contBtn.click(); return; }
      // A focused button (tile, letter, audio, Skip…) does its own thing, except
      // an answer option once CHECK is ready: then Enter checks, as on Duolingo.
      const isButton = t?.matches("button, a[href]") && t !== mainBtn;
      if (isButton && !(t.matches(".option") && !mainBtn.disabled)) return;
      e.preventDefault();
      if (!mainBtn.disabled) mainBtn.click();
    } else if (e.key === "Escape") confirmQuit();
    else if (mode === "answer" && current?.onKey && !t?.matches("input, textarea")) {
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); current.onKey(e.key === "0" ? 10 : +e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); current.onKey("Backspace"); }
    }
  }
  document.addEventListener("keydown", onKey);

  function confirmQuit() {
    const m = openModal(`
      <div class="quit">
        ${charImg("owl-encouraging", "quit__owl")}
        <h2 class="h-title">Leave the lesson?</h2>
        <p class="muted">You're doing well! If you leave now, this lesson's progress won't be saved.</p>
        <div class="quit__actions">
          ${button("Keep learning", { attrs: 'data-q="stay"' })}
          <button class="btn-text quit__leave" data-q="leave">End lesson</button>
        </div>
      </div>`, { label: "Leave the lesson?" });
    m.sheet.addEventListener("click", (e) => {
      const q = e.target.closest("[data-q]")?.dataset.q;
      if (q === "stay") m.close();
      if (q === "leave") { m.close(); exit(); }
    });
  }

  function exit() {
    clearTimeout(praiseTimer);
    tts.stop(); stt.stop();
    document.removeEventListener("keydown", onKey);
    screen.remove();
    onExit();
  }

  // Test hook (headless e2e): the current step and mode. Harmless for students.
  window.__buho = { step: () => queue[idx], mode: () => mode, lesson };
  setProgress();
  advance(false);
  if (unsupported.length) setTimeout(() => toast("Speaking practice isn't available in this browser, so it's skipped.", "mic-off", 3200), 500);
  return { destroy: exit, screen, dispose() { clearTimeout(praiseTimer); document.removeEventListener("keydown", onKey); tts.stop(); stt.stop(); } };
}

// =================================================================== exercises
const EXERCISES = { intro, pick: pickMeaning, listen, tiles, type: typeIt, match, speak,
  choose, gap, sort, maptap, table, storyintro, storyline, passport };

/** Which recorded voice role says a line by this character. */
export function roleOf(who = "") {
  if (who === "owl" || who === "buho" || who.startsWith("owl")) return "buho";
  if (who.startsWith("matilda")) return "maria";
  if (who.startsWith("max") || who === "traveller") return "raul";
  return "";
}

function head(title, badge = "") {
  return `<div class="ex-head">${badge}<h1 class="h-title">${title}</h1></div>`;
}

/** Picture for a step: a character, a noun picture, or a locator map. */
function artHtml(step, cls = "intro-char") {
  if (step.map) return `<div class="intro-map">${mapFrame({ focus: step.map, aspect: 1, pins: false })}</div>`;
  if (step.art) return `<img class="${cls} intro-noun" src="assets/${step.art}.webp" alt="" draggable="false">`;
  return `${charImg(step.character, cls)}${step.flag ? flagImg(step.flag, "flag intro-flag") : ""}`;
}

/** The "audio coming soon" chip shown where a recording doesn't exist yet. */
export const audioSoon = (small = false) =>
  `<span class="audio-soon ${small ? "audio-soon--sm" : ""}" title="The recording for this line is coming soon">${icon("clock", small ? 16 : 18, 2.5)}<span>${small ? "Audio soon" : "Audio coming soon"}</span></span>`;

/** Replace audio buttons with the "coming soon" chip when `text` has no recording. */
function markAudio(root, text) {
  if (hasAudio(text)) return true;
  const btns = $$("[data-audio]", root);
  if (!btns.length) return false;
  const group = btns[0].closest(".intro-audio, .listen-stage");
  if (group) group.innerHTML = audioSoon();
  else btns.forEach((b) => b.replaceWith(el(audioSoon(true))));
  return false;
}

function wireAudio(root, api, text) {
  root.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-audio]");
    if (!b) return;
    b.classList.add("is-playing");
    await api.speak(text, b.dataset.audio === "slow");
    b.classList.remove("is-playing");
  });
}

// ------------------------------------------------------------ new word card
function intro(step, api) {
  const isPhrase = /[.?!]$/.test(step.es); // a sentence or question, not a single word
  const art = step.flags
    ? `<div class="intro-flags">${step.flags.map((f, i) => flagImg(f, `flag flag--fan flag--${i}`)).join("")}</div>`
    : artHtml(step);
  const badge = step.badgeEn ? `${icon("sparkles", 16, 2.75)} ${esc(step.badgeEn)}` : `${icon("sparkles", 16, 2.75)} New ${isPhrase ? "phrase" : step.map && step.map !== "hispanic" && !/^(el|la|las|los) /.test(step.es) ? "place" : "word"}`;
  const node = el(`
    <div class="ex ex-intro ${step.map ? "ex-intro--map" : ""}">
      ${head("", `<span class="badge">${badge}</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="intro-card">
        <div class="intro-art">${art}</div>
        <div class="intro-text">
          ${es(step.es, "intro-es")}
          <p class="intro-en">${esc(step.en)}</p>
        </div>
        <div class="intro-audio">${audioButtons()}</div>
      </div>
      ${step.exampleEs ? `<div class="example"><button class="press icon-btn icon-btn--secondary icon-btn--sm" data-ex aria-label="Play example"><span class="face">${icon("volume-2", 22)}</span></button><div>${es(step.exampleEs, "example-es")}<span class="example-en">${esc(step.exampleEn)}</span></div></div>` : ""}
      ${step.noteEn ? `<p class="note">${icon("lightbulb", 20, 2.5)}<span>${rich(step.noteEn)}</span></p>` : ""}
    </div>`);
  node.querySelector(".ex-head .h-title").remove();
  const audible = markAudio(node, step.es);
  wireAudio(node, api, step.es);
  if (step.exampleEs && !hasAudio(step.exampleEs)) node.querySelector("[data-ex]")?.replaceWith(el(audioSoon(true)));
  node.querySelector("[data-ex]")?.addEventListener("click", () => api.speak(step.exampleEs));
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    mount() { if (audible) setTimeout(() => node.querySelector('[data-audio="normal"]')?.click(), 420); },
    onMain() { sfx.tap(); api.next(); },
  };
}

// ------------------------------------------------------------ options (shared)
function optionList(options, { spanish = false }) {
  const order = shuffle(options.map((_, i) => i));
  return {
    order,
    html: `<div class="options" role="group">${order.map((oi, k) => `
      <button class="press option" data-oi="${oi}" aria-pressed="false">
        <span class="face"><span class="key" aria-hidden="true">${k + 1}</span>
        ${spanish ? es(options[oi], "label") : `<span class="label">${esc(options[oi])}</span>`}</span>
      </button>`).join("")}</div>`,
  };
}

function choiceController(node, step, api, extra = {}) {
  let chosen = null;
  const btns = $$(extra.selector || ".option", node);
  const choose = (b) => {
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    chosen = +b.dataset.oi;
    sfx.select();
    api.enableCheck(true);
    extra.onChoose?.(chosen);
  };
  btns.forEach((b) => b.addEventListener("click", () => choose(b)));
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onKey(n) { const b = btns[n - 1]; if (b && !b.disabled) { choose(b); b.focus({ preventScroll: true }); } },
    check() {
      const ok = chosen === step.answer;
      btns.forEach((b) => {
        b.disabled = true;
        const oi = +b.dataset.oi;
        if (oi === step.answer) b.classList.add("is-correct");
        else if (oi === chosen) b.classList.add("is-wrong");
      });
      return extra.result(ok);
    },
    ...extra.ctrl,
  };
}

// ------------------------------------------------------------ pick the meaning
function pickMeaning(step, api) {
  const { html } = optionList(step.options, { spanish: false });
  const node = el(`
    <div class="ex ex-pick">
      ${head("What does this mean?")}
      <div class="speaker-row">
        ${charImg(step.character)}
        <div class="bubble">
          <button class="press icon-btn icon-btn--primary icon-btn--sm" data-audio="normal" aria-label="Play audio"><span class="face">${icon("volume-2", 22)}</span></button>
          ${es(step.promptEs)}
        </div>
      </div>
      ${html}
    </div>`);
  const audible = markAudio(node, step.promptEs);
  wireAudio(node, api, step.promptEs);
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.promptEs, answerEn: step.options[step.answer] }),
    ctrl: { mount() { if (audible) setTimeout(() => api.speak(step.promptEs), 350); } },
  });
}

// ------------------------------------------------------------ listen and choose
function listen(step, api) {
  if (!hasAudio(step.sayEs)) return readChoose(step, api);
  const { html } = optionList(step.optionsEs, { spanish: true });
  const node = el(`
    <div class="ex ex-listen">
      ${head("Tap what you hear")}
      <div class="listen-stage">
        <button class="press icon-btn icon-btn--primary listen-big" data-audio="normal" aria-label="Play audio"><span class="face">${icon("volume-2", 48, 2.5)}</span></button>
        <button class="press icon-btn icon-btn--secondary listen-slow" data-audio="slow" aria-label="Play slowly"><span class="face">${icon("turtle", 32, 2.5)}</span></button>
      </div>
      ${html}
      <div class="ex-escape"><button class="btn-text" data-cant="listen">${icon("ear-off", 20, 2.5)} Can't listen now</button></div>
    </div>`);
  wireAudio(node, api, step.sayEs);
  node.querySelector("[data-cant]").addEventListener("click", () => api.skip("listen"));
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.optionsEs[step.answer] }),
    ctrl: { aside: ["cant-listen", "skip"], mount() { setTimeout(() => node.querySelector(".listen-big").click(), 380); } },
  });
}

// ------------------------------------------------------------ build the sentence (tiles)
function tiles(step, api) {
  const order = shuffle(step.tilesEs.map((_, i) => i));
  const node = el(`
    <div class="ex ex-tiles ${step.lines ? "ex-tiles--lines" : ""}">
      ${head(esc(step.titleEn || "Write this in Spanish"))}
      ${step.lines ? `<p class="context">Tap the lines in the order you heard them.</p>` : `<div class="speaker-row">
        ${charImg(step.character)}
        <div class="bubble"><span class="en">${esc(step.en)}</span></div>
      </div>`}
      <div class="answer-lines" aria-label="Your answer" lang="es"></div>
      <div class="bank" aria-label="Word bank" lang="es">
        ${order.map((ti, k) => `<span class="tile-slot"><button class="press tile" data-ti="${ti}"><span class="face" data-key="${k + 1}">${esc(step.tilesEs[ti])}</span></button></span>`).join("")}
      </div>
    </div>`);
  const answer = $(".answer-lines", node);
  const placed = [];
  const screenRoot = () => node.closest(".lesson");

  function fly(fromEl, toEl, text, then) {
    const root = screenRoot();
    if (!root || reducedMotion()) { then(); return; }
    const rr = root.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const ghost = el(`<span class="press tile tile-fly"><span class="face">${esc(text)}</span></span>`);
    ghost.style.left = `${a.left - rr.left}px`;
    ghost.style.top = `${a.top - rr.top}px`;
    ghost.style.width = `${a.width}px`;
    root.appendChild(ghost);
    const anim = ghost.animate(
      [{ transform: "translate(0,0)" }, { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px)` }],
      { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    anim.onfinish = () => { ghost.remove(); then(); };
  }

  function flipSiblings(mutate) {
    const els = $$(".tile", answer);
    const before = new Map(els.map((x) => [x, x.getBoundingClientRect()]));
    mutate();
    if (reducedMotion()) return;
    for (const x of $$(".tile", answer)) {
      const a = before.get(x);
      if (!a) continue;
      const b = x.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) x.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    }
  }

  node.addEventListener("click", (e) => {
    const t = e.target.closest(".tile");
    if (!t || node.classList.contains("is-locked")) return;
    sfx.tap();
    const ti = +t.dataset.ti;
    if (t.closest(".bank")) {
      if (t.classList.contains("is-ghost")) return;
      t.classList.add("is-ghost");
      t.setAttribute("aria-hidden", "true");
      const nt = el(`<button class="press tile is-ghost" data-ti="${ti}"><span class="face">${esc(step.tilesEs[ti])}</span></button>`);
      answer.appendChild(nt);
      placed.push(ti);
      fly(t, nt, step.tilesEs[ti], () => nt.classList.remove("is-ghost"));
    } else {
      const src = $(`.bank .tile[data-ti="${ti}"]`, node);
      const from = t.getBoundingClientRect();
      const proxy = { getBoundingClientRect: () => from };
      placed.splice(placed.indexOf(ti), 1);
      flipSiblings(() => t.remove());
      fly(proxy, src, step.tilesEs[ti], () => { src.classList.remove("is-ghost"); src.removeAttribute("aria-hidden"); });
    }
    api.enableCheck(placed.length > 0);
  });

  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onKey(k) {
      if (node.classList.contains("is-locked")) return;
      if (k === "Backspace") { $$(".tile", answer).at(-1)?.click(); return; }
      const t = $$(".bank .tile", node)[k - 1];
      if (t && !t.classList.contains("is-ghost")) t.click();
    },
    check({ skipped = false } = {}) {
      node.classList.add("is-locked");
      const got = placed.map((i) => step.tilesEs[i].toLowerCase()).join(" ");
      const want = step.answerEs.map((w) => w.toLowerCase()).join(" ");
      const ok = got === want;
      answer.classList.add(ok ? "is-correct" : "is-wrong");
      if (!ok && !skipped) restartAnim(answer, "shake");
      return { ok, answerEs: step.lines ? undefined : step.fullEs, answerEn: ok ? step.en : "",
        body: step.lines && !ok ? `<span class="feedback__tip">The order was: ${step.answerEs.map((l, i) => `${i + 1}. ${es(l)}`).join(" ")}</span>` : "" };
    },
  };
}

// ------------------------------------------------------------ type it (+ accent fix-up)
const ACCENT = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
const ARTICLES = ["el", "la", "los", "las"];
const normalize = (s) => s.normalize("NFC").toLowerCase().replace(/[¡!¿?.,;:"“”'‘’…—–]/g, " ").replace(/\s+/g, " ").trim();

export function grade(input, target) {
  const a = normalize(input), t = normalize(target);
  if (!a) return { verdict: "empty" };
  if (a === t) return { verdict: "correct" };
  let full = a, missingArticle = false;
  const tw = t.split(" ");
  if (ARTICLES.includes(tw[0]) && fold(a) === fold(tw.slice(1).join(" "))) {
    full = `${tw[0]} ${a}`;
    missingArticle = true;
  }
  if (full === t) return { verdict: "correct", missingArticle };
  if (fold(full) === fold(t)) return { verdict: "accents", full, missingArticle };
  return { verdict: "wrong" };
}

function typeIt(step, api) {
  const keys = ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"]; // ¿ and ¡ show from 700px wide
  const node = el(`
    <div class="ex ex-type">
      ${head(esc(step.titleEn || "Type this in Spanish"))}
      ${step.headHtml || `<div class="type-prompt">
        ${step.flag ? flagImg(step.flag, "flag type-flag") : `<span class="type-prompt__icon">${icon("type", 28, 2.5)}</span>`}
        <span class="type-prompt__en">${esc(step.en)}</span>
      </div>`}
      <div class="type-field">
        <input class="type-input" type="text" lang="es" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
               aria-label="Type the Spanish for “${esc(step.en)}”" placeholder="Type in Spanish">
      </div>
      <div class="accent-bar" role="group" aria-label="Spanish letters">
        ${keys.map((k) => `<button class="press accent-key ${"¿¡".includes(k) ? "accent-key--wide" : ""}" data-k="${k}" aria-label="Type ${k}"><span class="face">${k}</span></button>`).join("")}
      </div>
    </div>`);
  const input = $(".type-input", node);
  input.addEventListener("input", () => api.enableCheck(input.value.trim().length > 0));
  node.querySelector(".accent-bar").addEventListener("pointerdown", (e) => { if (e.target.closest(".accent-key")) e.preventDefault(); });
  node.querySelector(".accent-bar").addEventListener("click", (e) => {
    const k = e.target.closest(".accent-key");
    if (!k) return;
    sfx.tap();
    const s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? s;
    input.value = input.value.slice(0, s) + k.dataset.k + input.value.slice(en);
    input.setSelectionRange(s + 1, s + 1);
    input.focus({ preventScroll: true });
    input.dispatchEvent(new Event("input"));
  });

  const ctrl = {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    mount() { step.onMount?.(node); setTimeout(() => input.focus({ preventScroll: true }), 300); },
    onSkip() {
      input.readOnly = true;
      input.blur();
      api.complete({ ok: false, skipped: true, answerEs: step.answerEs, answerEn: step.en });
    },
    onMain() {
      const g = grade(input.value, step.answerEs);
      input.readOnly = true;
      input.blur();
      if (g.verdict === "accents") return startFixup(g);
      const ok = g.verdict === "correct";
      step.onResult?.(ok, node);
      node.querySelector(".type-field").classList.add(ok ? "is-correct" : "is-wrong");
      if (!ok) restartAnim(node.querySelector(".type-field"), "shake");
      api.complete({
        ok,
        answerEs: step.answerEs,
        answerEn: ok ? step.en : "",
        body: g.missingArticle ? `<span class="feedback__tip">Remember the little word in front: ${es(step.answerEs)}</span>` : "",
      });
    },
  };

  function startFixup(g) {
    const target = step.answerEs;
    const typed = g.full;
    const lockedUpTo = g.missingArticle ? typed.indexOf(" ") : -1; // article we added for them
    const cur = [...typed];
    const want = [...target.toLowerCase()];
    let misses = 0;
    const fix = el(`
      <div class="ex ex-fixup">
        <div class="speaker-row">
          ${charImg("owl-thinking")}
          <div class="bubble"><span class="en">So close! Tap the letters that need an accent or ñ.</span></div>
        </div>
        <div class="fix-letters" lang="es" role="group" aria-label="Your answer, letter by letter">
          ${cur.map((c, i) => c === " " ? `<span class="fix-space"></span>` :
            `<button class="press fix-letter ${i <= lockedUpTo ? "is-added" : ""}" data-i="${i}" ${i <= lockedUpTo ? "disabled" : ""} aria-label="${c}"><span class="face">${c}</span></button>`).join("")}
        </div>
        <p class="fix-help">${icon("lightbulb", 18, 2.5)}<span>Tap a vowel to add an accent (a → á). Tap n to make ñ. Tap again to undo.${g.missingArticle ? " We added the little word in front for you." : ""}</span></p>
        <div class="fix-result" aria-live="polite"></div>
        <div class="ex-escape"><button class="btn-text" data-show>${icon("sparkles", 18, 2.5)} Show me</button></div>
      </div>`);
    node.replaceWith(fix);
    ctrl.el = fix;
    delete ctrl.onSkip;
    api.setFooter("Tap the letters", { enabled: false });
    api.setAside(["show"]);
    sfx.select();

    const letters = new Map($$(".fix-letter", fix).map((b) => [+b.dataset.i, b]));
    const render = (i) => {
      const b = letters.get(i);
      b.querySelector(".face").textContent = cur[i];
      b.setAttribute("aria-label", cur[i]);
      b.classList.toggle("is-changed", cur[i] !== typed[i]);
    };
    const solved = () => cur.join("") === want.join("");
    const toggle = (i) => {
      const c = cur[i], base = fold(c);
      if (base === "n") cur[i] = c === "ñ" ? "n" : "ñ";
      else if (ACCENT[base]) cur[i] = c === base ? ACCENT[base] : base;
      else return false;
      return true;
    };

    function win(shown) {
      step.onResult?.(true, fix);
      fix.classList.add("is-solved");
      api.setAside([]);
      $$(".fix-letter", fix).forEach((b, k) => { b.disabled = true; setTimeout(() => restartAnim(b, "pop"), k * 45); });
      fix.querySelector(".fix-result").innerHTML = `${icon("check", 22, 3)} ${es(target)}`;
      fix.querySelector("[data-show]").hidden = true;
      sfx.fix();
      setTimeout(() => api.complete({
        ok: true,
        nearly: true,
        owl: "owl-celebrating",
        title: shown ? "Now you know!" : es(api.lesson.praiseEs[0]),
        body: `<span class="feedback__tip">Accents and ñ matter: they change how a word sounds.${g.missingArticle ? " Remember the little word in front, too." : ""}</span>`,
        answerEs: target,
        answerEn: step.en,
      }), reducedMotion() ? 200 : 750);
    }

    let showing = false;
    ctrl.showMe = () => {
      if (showing || fix.classList.contains("is-solved")) return;
      showing = true;
      api.setAside([]);
      // Animate the needed fixes one by one.
      const need = cur.map((c, i) => (c !== want[i] ? i : -1)).filter((i) => i >= 0);
      need.forEach((i, k) => setTimeout(() => { cur[i] = want[i]; render(i); restartAnim(letters.get(i), "pop"); if (k === need.length - 1) win(true); }, 250 * k));
    };
    setTimeout(() => fix.querySelector(".fix-letter:not([disabled])")?.focus({ preventScroll: true }), 120);

    fix.addEventListener("click", (e) => {
      if (e.target.closest("[data-show]")) { ctrl.showMe(); return; }
      const b = e.target.closest(".fix-letter");
      if (!b || fix.classList.contains("is-solved")) return;
      const i = +b.dataset.i;
      const wasRight = cur[i] === want[i];
      if (!toggle(i)) {
        restartAnim(b, "shake");
        sfx.wrong();
        fix.querySelector(".fix-help").classList.add("is-flash");
        return;
      }
      sfx.tap();
      render(i);
      restartAnim(b, "pop");
      if (wasRight && cur[i] !== want[i]) misses++;
      if (misses >= 2) $$(".fix-letter", fix).forEach((x) => x.classList.toggle("is-hint", cur[+x.dataset.i] !== want[+x.dataset.i]));
      if (solved()) win(false);
    });
  }

  return ctrl;
}

// ------------------------------------------------------------ match pairs
function match(step, api) {
  const left = shuffle(step.pairs.map((p, i) => ({ i, text: p.es })));
  const right = shuffle(step.pairs.map((p, i) => ({ i, text: p.en })));
  const node = el(`
    <div class="ex ex-match">
      ${head("Tap the matching pairs")}
      <div class="match-grid">
        <div class="match-col">${left.map((x, k) => `<button class="press option match-card" data-side="es" data-i="${x.i}"><span class="face" data-key="${k + 1}">${es(x.text, "label")}</span></button>`).join("")}</div>
        <div class="match-col">${right.map((x, k) => `<button class="press option match-card" data-side="en" data-i="${x.i}"><span class="face" data-key="${(left.length + k + 1) % 10}"><span class="label">${esc(x.text)}</span></span></button>`).join("")}</div>
      </div>
    </div>`);
  let sel = { es: null, en: null };
  let matched = 0, mixups = 0;
  node.addEventListener("click", (e) => {
    const b = e.target.closest(".match-card");
    if (!b || b.disabled || b.classList.contains("is-busy")) return;
    const side = b.dataset.side;
    if (side === "es") api.speak(step.pairs[+b.dataset.i].es);
    if (sel[side] === b) { b.setAttribute("aria-pressed", "false"); sel[side] = null; return; }
    sel[side]?.setAttribute("aria-pressed", "false");
    sel[side] = b;
    b.setAttribute("aria-pressed", "true");
    sfx.select();
    if (sel.es && sel.en) {
      const a = sel.es, c = sel.en;
      sel = { es: null, en: null };
      if (a.dataset.i === c.dataset.i) {
        matched++;
        sfx.pair();
        [a, c].forEach((x) => { x.setAttribute("aria-pressed", "false"); x.classList.add("is-correct"); restartAnim(x, "pop"); x.disabled = true; });
        setTimeout(() => [a, c].forEach((x) => x.classList.add("is-done")), 450);
        if (matched === step.pairs.length) {
          setTimeout(() => api.complete({
            ok: true,
            title: es(api.lesson.praiseEs[0]),
            body: mixups ? `<span class="feedback__tip">All pairs matched. You sorted out ${mixups} mix-up${mixups > 1 ? "s" : ""} on the way, which is how learning works.</span>` : `<span class="feedback__tip">All pairs matched on the first go!</span>`,
          }), 600);
        }
      } else {
        mixups++;
        sfx.wrong();
        [a, c].forEach((x) => { x.classList.add("is-wrong", "is-busy"); restartAnim(x, "shake"); });
        setTimeout(() => [a, c].forEach((x) => { x.classList.remove("is-wrong", "is-busy"); x.setAttribute("aria-pressed", "false"); }), 520);
      }
    }
  });
  const cards = [...$$('.match-card[data-side="es"]', node), ...$$('.match-card[data-side="en"]', node)];
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onSkip() { api.next(); },
    // Keys 1–5 pick a Spanish card, 6–9 and 0 an English one (as on Duolingo).
    onKey(k) { const b = cards[k - 1]; if (b && !b.disabled) { b.click(); b.focus({ preventScroll: true }); } },
  };
}

// ------------------------------------------------------------ say it
function speak(step, api) {
  const node = el(`
    <div class="ex ex-speak">
      ${head("Say this out loud")}
      <div class="speaker-row">
        ${charImg(step.character)}
        <div class="bubble">
          <button class="press icon-btn icon-btn--primary icon-btn--sm" data-audio="normal" aria-label="Play audio"><span class="face">${icon("volume-2", 22)}</span></button>
          ${es(step.es)}
        </div>
      </div>
      <div class="mic-stage">
        <button class="press icon-btn icon-btn--magenta mic-btn" aria-label="Tap and speak"><span class="face">${icon("mic", 44, 2.5)}</span></button>
        <p class="mic-status" aria-live="polite">Tap the microphone, then say it.</p>
      </div>
      <div class="ex-escape"><button class="btn-text" data-cant="speak">${icon("mic-off", 20, 2.5)} Can't speak now</button></div>
    </div>`);
  const audible = markAudio(node, step.es);
  wireAudio(node, api, step.es);
  const mic = $(".mic-btn", node);
  const status = $(".mic-status", node);
  let tries = 0, busy = false;
  node.querySelector("[data-cant]").addEventListener("click", () => { stt.stop(); api.skip("speak"); });
  mic.addEventListener("click", async () => {
    if (busy) { stt.stop(); return; }
    busy = true;
    tts.stop();
    sfx.select();
    status.textContent = "Getting the microphone ready…";
    const r = await stt.listen({ onStart: () => { node.classList.add("is-listening"); status.textContent = "Listening… say it now!"; } });
    node.classList.remove("is-listening");
    busy = false;
    if (r.ok && speechMatches(step.es, r.heard)) {
      status.innerHTML = `Buhísimo heard: “${esc(r.heard[0])}”`;
      api.complete({ ok: true, answerEs: step.es, answerEn: step.en });
      return;
    }
    tries++;
    if (r.ok) status.innerHTML = `Buhísimo heard: “${esc(r.heard[0])}”. Let's try again!`;
    else if (r.error === "not-allowed" || r.error === "service-not-allowed") status.textContent = "The microphone is blocked. Tap “Can't speak now” to skip.";
    else if (r.error === "no-speech") status.textContent = "I didn't hear anything. Tap the mic and try again.";
    else status.textContent = "Speech recognition isn't working right now. You can skip this one.";
    restartAnim(mic, "shake");
    if (tries >= 2) api.setFooter("Skip for now", { enabled: true, variant: "secondary" });
  });
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["cant-speak", "skip"],
    onSkip() { stt.stop(); api.next(); },
    // After two tries the footer becomes "Skip for now": no penalty, speaking never blocks progress.
    onMain() { stt.stop(); api.next(); },
    mount() { if (audible) setTimeout(() => api.speak(step.es), 350); },
    destroy() { stt.stop(); },
  };
}

// =================================================================== Unit 1.1 additions
// ------------------------------------------------------------ read and choose
// A listening step whose line isn't recorded yet: never audio-only, so the student
// reads the English and picks the Spanish (a recognition question on the same line).
function readChoose(step, api) {
  return choose({ ...step, titleEn: "Which one means this?", promptEn: step.en, optionsEs: step.optionsEs, answer: step.answer,
    answerEs: step.optionsEs[step.answer], answerEn: step.en, readOnly: true }, api);
}

// ------------------------------------------------------------ choose (generic)
// Prompt: Spanish (promptEs, with audio) and/or English (promptEn), with a character,
// noun picture or map. Options: Spanish (optionsEs), English (optionsEn) or pictures (optionsArt).
function choose(step, api) {
  const picture = !!step.optionsArt;
  const opts = step.optionsEs || step.optionsEn || (step.optionsArt || []).map((o) => o.labelEn);
  const { html } = picture ? { html: "" } : optionList(opts, { spanish: !!step.optionsEs });
  const art = picture ? "" : step.map || step.art ? `<div class="choose-art">${artHtml(step, "char")}</div>` : step.character ? charImg(step.character) : "";
  const sayable = step.sayEs || step.promptEs;
  const bubble = step.promptEs || step.promptEn ? `
      <div class="speaker-row ${art ? "" : "speaker-row--solo"}">
        ${art}
        <div class="bubble">
          ${step.promptEs ? `<button class="press icon-btn icon-btn--primary icon-btn--sm" data-audio="normal" aria-label="Play audio"><span class="face">${icon("volume-2", 22)}</span></button>${es(step.promptEs)}` : ""}
          ${step.promptEn ? `<span class="en ${step.promptEs ? "en--sub" : ""}">${esc(step.promptEn)}</span>` : ""}
        </div>
      </div>` : "";
  const pics = picture ? `<div class="pic-options" role="group">${step.optionsArt.map((o, k) => `
      <button class="press option pic-option" data-oi="${k}" aria-pressed="false" aria-label="${esc(o.labelEn)}">
        <span class="face"><span class="key" aria-hidden="true">${k + 1}</span><img src="assets/${o.art}.webp" alt="" draggable="false"></span>
      </button>`).join("")}</div>` : "";
  const node = el(`
    <div class="ex ex-choose ${step.story ? "ex-choose--story" : ""}">
      ${head(esc(step.titleEn || "Choose"), step.story ? `<span class="badge badge--magenta">${icon("book-open", 16, 2.75)} Story check</span>` : "")}
      ${bubble}
      ${pics}${html}
    </div>`);
  const audible = step.promptEs ? markAudio(node, sayable) : false;
  if (step.promptEs) wireAudio(node, api, sayable);
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.answerEs ?? (step.optionsEs ? step.optionsEs[step.answer] : undefined), answerEn: step.answerEn ?? (step.optionsEn ? step.optionsEn[step.answer] : undefined) }),
    ctrl: { mount() { if (audible) setTimeout(() => api.speak(sayable), 350); } },
  });
}

// ------------------------------------------------------------ gap fill
const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function gapParts(sentence, word) {
  const m = new RegExp(`(^|[\\s¿¡—])(${reEsc(word)})(?=[\\s.,?!…]|$)`, "u").exec(sentence);
  if (!m) throw new Error(`gap: "${word}" is not in "${sentence}"`);
  const at = m.index + m[1].length;
  return [sentence.slice(0, at), sentence.slice(at + word.length)];
}
function gap(step, api) {
  const [before, after] = gapParts(step.es, step.blank);
  const answer = step.optionsEs.findIndex((o) => o.toLowerCase() === step.blank.toLowerCase());
  const { html } = optionList(step.optionsEs, { spanish: true });
  const node = el(`
    <div class="ex ex-gap">
      ${head("Fill the gap")}
      <div class="gap-card">
        <p class="gap-sentence" lang="es">${esc(before)}<span class="gap-slot" aria-label="gap"><span class="gap-slot__word">&nbsp;</span></span>${esc(after)}</p>
        <p class="gap-en">${esc(step.en)}</p>
      </div>
      ${html}
    </div>`);
  const slot = $(".gap-slot__word", node);
  return choiceController(node, { ...step, answer }, api, {
    onChoose: (i) => { slot.textContent = step.optionsEs[i]; slot.parentElement.classList.add("is-filled"); restartAnim(slot.parentElement, "pop"); },
    result: (ok) => {
      slot.parentElement.classList.add(ok ? "is-correct" : "is-wrong");
      return { ok, answerEs: step.es, answerEn: step.en };
    },
  });
}

// ------------------------------------------------------------ sort into buckets
function sort(step, api) {
  const cards = shuffle(step.cards.map((c, i) => ({ ...c, i })));
  const labels = step.bucketsEs || step.bucketsEn;
  let k = 0, mixups = 0, busy = false;
  const counts = labels.map(() => 0);
  const node = el(`
    <div class="ex ex-sort">
      ${head(esc(step.titleEn || "Sort them"))}
      <div class="sort-stage">
        <div class="sort-progress" aria-hidden="true">${cards.map(() => `<span class="sort-dot"></span>`).join("")}</div>
        <div class="sort-card" aria-live="polite"></div>
      </div>
      <div class="sort-buckets" role="group" aria-label="Choose where it goes">
        ${labels.map((b, j) => `<button class="press option sort-bucket" data-b="${j}"><span class="face"><span class="key" aria-hidden="true">${j + 1}</span>${step.bucketsEs ? es(b, "label") : `<span class="label">${esc(b)}</span>`}<span class="sort-count" aria-hidden="true">0</span></span></button>`).join("")}
      </div>
    </div>`);
  const cardEl = $(".sort-card", node);
  const dots = $$(".sort-dot", node);
  const show = () => {
    const c = cards[k];
    cardEl.innerHTML = `${es(c.es, "sort-card__es")}${hasAudio(c.es) ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-say-card aria-label="Play audio"><span class="face">${icon("volume-2", 20)}</span></button>` : ""}`;
    dots.forEach((d, j) => d.classList.toggle("is-now", j === k));
    restartAnim(cardEl, "pop");
  };
  cardEl.addEventListener("click", (e) => { if (e.target.closest("[data-say-card]")) api.speak(cards[k].es); });
  const pickBucket = (j) => {
    if (busy || k >= cards.length) return;
    const b = $$(".sort-bucket", node)[j];
    if (j === cards[k].bucket) {
      sfx.pair();
      counts[j]++;
      b.querySelector(".sort-count").textContent = counts[j];
      restartAnim(b, "pop");
      dots[k].classList.add("is-done");
      k++;
      if (k === cards.length) {
        cardEl.innerHTML = `${icon("check", 28, 3)}<span>All sorted!</span>`;
        cardEl.classList.add("is-done");
        setTimeout(() => api.complete({ ok: true, title: es(api.lesson.praiseEs[0]),
          body: mixups ? `<span class="feedback__tip">All sorted. You fixed ${mixups} mix-up${mixups > 1 ? "s" : ""} on the way.</span>` : `<span class="feedback__tip">All sorted on the first go!</span>` }), 450);
      } else setTimeout(show, 160);
    } else {
      mixups++;
      busy = true;
      sfx.wrong();
      b.classList.add("is-wrong");
      restartAnim(b, "shake");
      setTimeout(() => { b.classList.remove("is-wrong"); busy = false; }, 520);
    }
  };
  $$(".sort-bucket", node).forEach((b, j) => b.addEventListener("click", () => pickBucket(j)));
  show();
  return {
    el: node,
    footer: { label: "Check", enabled: false },
    aside: ["skip"],
    onSkip() { api.next(); },
    onKey(n) { if (n >= 1 && n <= labels.length) pickBucket(n - 1); },
  };
}

// ------------------------------------------------------------ map tap
function maptap(step, api) {
  const choices = shuffle(step.choices);
  const answer = choices.indexOf(step.target);
  const node = el(`
    <div class="ex ex-maptap">
      ${head(api.lesson.game ? "Where is it?" : "Tap the place on the map")}
      <div class="speaker-row speaker-row--solo">
        <div class="bubble">
          <button class="press icon-btn icon-btn--primary icon-btn--sm" data-audio="normal" aria-label="Play audio"><span class="face">${icon("volume-2", 22)}</span></button>
          ${es(step.sayEs)}
        </div>
      </div>
      ${mapFrame({ choices, highlight: choices, pins: true, aspect: window.innerWidth < 700 ? 1.2 : 1.6 })}
    </div>`);
  const audible = markAudio(node, step.sayEs);
  wireAudio(node, api, step.sayEs);
  const ctrl = choiceController(node, { ...step, answer }, api, {
    selector: ".map-pin",
    result: (ok) => ({ ok, answerEs: step.sayEs, answerEn: ok ? step.en : `${step.en} (${placeName(step.target)})` }),
    ctrl: { mount() { wireMapPins(node); if (audible) setTimeout(() => api.speak(step.sayEs), 350); } },
  });
  return ctrl;
}

// ------------------------------------------------------------ table (worked example)
function table(step, api) {
  const node = el(`
    <div class="ex ex-table">
      ${head(esc(step.titleEn), `<span class="badge">${icon("lightbulb", 16, 2.75)} How it works</span>`)}
      ${step.contextEn ? `<p class="context">${rich(step.contextEn)}</p>` : ""}
      <div class="rule-card" role="table">
        ${step.rows.map((r, i) => `
          <div class="rule-row" role="row">
            <span class="rule-es" role="cell">${es(r.es)}</span>
            <span class="rule-en" role="cell">${esc(r.en)}</span>
            <span class="rule-ex" role="cell">${hasAudio(r.exampleEs) ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm" data-row="${i}" aria-label="Play example"><span class="face">${icon("volume-2", 20)}</span></button>` : ""}<span>${es(r.exampleEs, "rule-ex__es")}<span class="rule-ex__en">${esc(r.exampleEn)}</span></span></span>
          </div>`).join("")}
      </div>
      ${step.noteEn ? `<p class="note">${icon("lightbulb", 20, 2.5)}<span>${rich(step.noteEn)}</span></p>` : ""}
    </div>`);
  node.addEventListener("click", (e) => { const b = e.target.closest("[data-row]"); if (b) api.speak(step.rows[+b.dataset.row].exampleEs); });
  return { el: node, footer: { label: "Continue", enabled: true }, onMain() { sfx.tap(); api.next(); } };
}

// ------------------------------------------------------------ story
const STORY_NAME = { buho: "Buhísimo", matilda: "Matilda", max: "Max" };
function storyintro(step, api) {
  const st = api.lesson.story;
  const node = el(`
    <div class="ex ex-story-intro">
      <div class="story-cover">
        <img class="story-cover__scene" src="assets/${st.scene}.webp" alt="The plaza in Salento">
        <div class="story-cover__cast">${st.cast.map((c) => `<img src="assets/${c.art}.webp" alt="${esc(c.nameEn)}" draggable="false">`).join("")}</div>
      </div>
      <span class="badge badge--magenta">${icon("book-open", 16, 2.75)} Story</span>
      <h1 class="h-title story-title">${esc(st.titleEn)}</h1>
      <p class="context">${esc(st.sceneEn)}</p>
      <p class="story-help">${icon("volume-2", 18, 2.5)}<span>Tap a line to hear it. Tap <b>EN</b> to check what it means.</span></p>
    </div>`);
  return { el: node, footer: { label: "Start the story", enabled: true }, onMain() { sfx.tap(); api.next(); } };
}

function storyPanel(line, n, { isNew }) {
  const audible = hasAudio(line.es);
  return `
    <article class="story-line story-line--${line.who} ${isNew ? "is-new" : "is-old"}" data-line="${n}">
      <img class="story-line__art" src="assets/${line.art}.webp" alt="" draggable="false">
      <div class="story-line__body">
        <span class="story-line__name">${esc(STORY_NAME[line.who] || "")}</span>
        ${line.actionEn ? `<p class="story-line__action">${icon("sparkles", 14, 2.75)} ${esc(line.actionEn)}</p>` : ""}
        <div class="bubble story-bubble">
          ${audible ? `<button class="press icon-btn icon-btn--primary icon-btn--sm" data-say-line="${n}" aria-label="Play line"><span class="face">${icon("volume-2", 20)}</span></button>` : audioSoon(true)}
          <span class="story-es-wrap">${es(line.es, "story-es")}<span class="story-en" hidden>${esc(line.en)}</span></span>
          <button class="story-en-btn" data-en="${n}" aria-pressed="false" aria-label="Show the English">EN</button>
        </div>
      </div>
    </article>`;
}

function storyline(step, api) {
  const lines = api.lesson.story.lines.filter((l) => l.es);
  const from = Math.max(0, step.line - 2); // the last three lines: no scrolling, even at 1366×768
  const node = el(`
    <div class="ex ex-story">
      <p class="story-head">${icon("book-open", 16, 2.75)}<span>${esc(api.lesson.story.titleEn)}</span><span class="story-head__n">Line ${step.line + 1} of ${lines.length}</span></p>
      <div class="story-feed">
        ${from > 0 ? `<p class="story-earlier">${icon("book-open", 14, 2.75)} ${from} earlier line${from > 1 ? "s" : ""}</p>` : ""}
        ${lines.slice(from, step.line + 1).map((l, k) => storyPanel(l, from + k, { isNew: from + k === step.line })).join("")}
      </div>
    </div>`);
  const say = (n) => api.speak(lines[n].es, false, lines[n].who);
  node.addEventListener("click", (e) => {
    const en = e.target.closest("[data-en]");
    if (en) {
      const on = en.getAttribute("aria-pressed") !== "true";
      en.setAttribute("aria-pressed", String(on));
      en.closest(".story-bubble").querySelector(".story-en").hidden = !on;
      return;
    }
    const b = e.target.closest("[data-say-line]");
    if (b) { say(+b.dataset.sayLine); return; }
    const es_ = e.target.closest(".story-es");
    if (es_) say(+es_.closest("[data-line]").dataset.line);
  });
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    mount() { if (hasAudio(lines[step.line].es)) setTimeout(() => say(step.line), 300); },
    onMain() { sfx.tap(); api.next(); },
    onKey(n) { if (n === 0 || n > 3) return; }, // story lines have no options
  };
}

// ------------------------------------------------------------ passport control (unit check finale)
function passport(step, api) {
  const listenable = hasAudio(step.answerEs);
  const who = step.character === "traveller"
    ? `<span class="passport__traveller">${icon("user", 44, 2.25)}</span>`
    : charImg(step.character, "passport__char");
  const headHtml = `
    <div class="passport">
      <div class="passport__scene">
        <div class="passport__ask">${charImg("owl-explaining", "passport__owl")}
          <div class="bubble"><button class="press icon-btn icon-btn--primary icon-btn--sm" data-ask aria-label="Play question"><span class="face">${icon("volume-2", 20)}</span></button>${es(step.askEs)}</div></div>
        <div class="passport__who">${who}<span class="passport__name">${esc(step.nameEn)}</span></div>
      </div>
      <div class="passport__book" aria-hidden="true">
        <span class="passport__label">Passport</span>
        <span class="passport__stamp" lang="es">${esc(step.stampEs)}</span>
      </div>
      <p class="passport__task">${listenable
        ? `<button class="press icon-btn icon-btn--primary icon-btn--sm" data-answer aria-label="Play the answer"><span class="face">${icon("volume-2", 20)}</span></button><span>Listen to ${esc(step.nameEn)}'s answer and type it.</span>`
        : `<span class="type-prompt__en type-prompt__en--sm">“${esc(step.en)}”</span><span>Type ${esc(step.nameEn === "A traveller" ? "the traveller's" : step.nameEn + "'s")} answer in Spanish.</span>`}</p>
    </div>`;
  const ctrl = typeIt({
    ...step, titleEn: "Passport control", headHtml,
    onResult(ok, node) { if (ok) { const p = node.querySelector(".passport__book") || document.querySelector(".ex-passport .passport__book"); p?.classList.add("is-stamped"); sfx.pair(); } },
    onMount(node) {
      node.classList.add("ex-passport");
      node.addEventListener("click", (e) => {
        if (e.target.closest("[data-ask]")) api.speak(step.askEs, false, "owl");
        if (e.target.closest("[data-answer]")) api.speak(step.answerEs, false, step.character);
      });
      if (hasAudio(step.askEs)) setTimeout(async () => { await api.speak(step.askEs, false, "owl"); if (listenable) api.speak(step.answerEs, false, step.character); }, 350);
    },
  }, api);
  return ctrl;
}
