// Lesson runner + exercise types for the prototype.
// Each exercise is a controller: { el, mount?(), check?() -> result, footer, destroy?() }.
// Results: { ok, nearly?, title?, body?, answerEs?, owl? }.
import { icon } from "./icons.js";
import { $, $$, esc, es, rich, el, button, audioButtons, charImg, flagImg, shuffle, pick, restartAnim, reducedMotion, toast, openModal } from "./ui.js";
import { tts, stt, fold, speechMatches } from "./speech.js";
import { sfx } from "./sound.js";
import { store } from "./store.js";

const MAX_RETRIES = 2;

export function runLesson(app, lesson, { onExit, onComplete, openSettings }) {
  // ------------------------------------------------------------ queue
  const unsupported = [];
  let queue = lesson.steps.filter((s) => {
    if (s.type === "speak" && !stt.available()) { unsupported.push("speaking"); return false; }
    if (s.type === "speak" && !store.speakOn()) return false;
    if (s.type === "listen" && (!tts.available() || !store.listenOn())) return false;
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
      <footer class="lesson-foot">${button("Check", { attrs: 'data-act="main"' })}</footer>
      <div class="sheet feedback" role="region" aria-live="polite" aria-label="Answer feedback">
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

  const api = {
    setFooter(label, { enabled = true, variant = "primary" } = {}) {
      mainBtn.querySelector(".face > span").textContent = label;
      mainBtn.className = `press btn btn--${variant} btn--block`;
      mainBtn.disabled = !enabled;
    },
    enableCheck(on) { mainBtn.disabled = !on; },
    complete(result) { showFeedback(result); },
    next() { advance(true); },
    skip(kind) { skipKind(kind); },
    speak: (text, slow) => tts.speak(text, { slow, sayAs: lesson.sayAs }),
    lesson,
  };

  function setProgress() {
    const p = Math.min(1, done / Math.max(1, total));
    fill.style.setProperty("--p", p);
    bar.setAttribute("aria-valuenow", Math.round(p * 100));
  }

  // ------------------------------------------------------------ flow
  function advance(countIt) {
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
    next.classList.add("step-enter");
    if (prev) {
      prev.classList.add("step-leave");
      prev.addEventListener("animationend", () => prev.remove(), { once: true });
      setTimeout(() => prev.remove(), 400);
    }
    body.appendChild(next);
    body.scrollTop = 0;
    const f = current.footer || { label: "Check", enabled: false };
    api.setFooter(f.label, f);
    current.mount?.();
  }

  function finish() {
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

  function showFeedback(result) {
    mode = "feedback";
    const step = queue[idx];
    stats.graded++;
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
      } else title = esc(pick(lesson.encourageEn));
    }
    $(".feedback__title", sheet).innerHTML = title;

    let bodyHtml = result.body || "";
    if (!result.ok && !result.body) bodyHtml += `<span class="feedback__tip">${esc(pick(lesson.kindEn))}</span>`;
    if (result.answerEs) {
      if (!result.ok) bodyHtml += `<span class="feedback__label">Correct answer:</span>`;
      bodyHtml += `<span class="feedback__answer">${es(result.answerEs)}
        <button class="press icon-btn icon-btn--sm" data-say="${esc(result.answerEs)}" aria-label="Play answer"><span class="face">${icon("volume-2", 22)}</span></button></span>`;
      if (result.answerEn) bodyHtml += `<span class="feedback__en">${esc(result.answerEn)}</span>`;
    }
    if (wrongAndRetry) bodyHtml += `<span class="feedback__later">${icon("rotate-ccw", 16, 2.75)} We'll come back to this one.</span>`;
    $(".feedback__body", sheet).innerHTML = bodyHtml;
    $(".feedback__body", sheet).hidden = !bodyHtml;
    contBtn.className = `press btn btn--${result.ok ? "correct" : "wrong"} btn--block`;
    // Wrong answers don't move the bar; the retry will.
    pendingCount = result.ok || !wrongAndRetry;
    sheet.classList.add("is-open");
    mainBtn.setAttribute("aria-hidden", "true");
    mainBtn.tabIndex = -1;
    setTimeout(() => contBtn.focus({ preventScroll: true }), 80);
  }
  let pendingCount = false;

  function hideSheet() {
    sheet.classList.remove("is-open");
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
  });

  function onKey(e) {
    if (document.querySelector(".modal")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "feedback") contBtn.click();
      else if (!mainBtn.disabled) mainBtn.click();
    } else if (e.key === "Escape") confirmQuit();
    else if (mode === "answer" && /^[1-9]$/.test(e.key) && current?.onKey && !e.target.matches("input")) current.onKey(+e.key);
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
    tts.stop(); stt.stop();
    document.removeEventListener("keydown", onKey);
    screen.remove();
    onExit();
  }

  setProgress();
  advance(false);
  if (unsupported.length) setTimeout(() => toast("Speaking practice isn't available in this browser, so it's skipped.", "mic-off", 3200), 500);
  return { destroy: exit, screen, dispose() { document.removeEventListener("keydown", onKey); tts.stop(); stt.stop(); } };
}

// =================================================================== exercises
const EXERCISES = { intro, pick: pickMeaning, listen, tiles, type: typeIt, match, speak };

function head(title, badge = "") {
  return `<div class="ex-head">${badge}<h1 class="h-title">${title}</h1></div>`;
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
    : `${charImg(step.character, "intro-char")}${step.flag ? flagImg(step.flag, "flag intro-flag") : ""}`;
  const node = el(`
    <div class="ex ex-intro">
      ${head("", `<span class="badge">${icon("sparkles", 16, 2.75)} New ${isPhrase ? "phrase" : "word"}</span>`)}
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
  wireAudio(node, api, step.es);
  node.querySelector("[data-ex]")?.addEventListener("click", () => api.speak(step.exampleEs));
  return {
    el: node,
    footer: { label: "Continue", enabled: true },
    mount() { setTimeout(() => node.querySelector('[data-audio="normal"]')?.click(), 420); },
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
  const btns = $$(".option", node);
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
    onKey(n) { const b = btns[n - 1]; if (b) choose(b); },
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
  wireAudio(node, api, step.promptEs);
  return choiceController(node, step, api, {
    result: (ok) => ({ ok, answerEs: step.promptEs, answerEn: step.options[step.answer] }),
    ctrl: { mount() { setTimeout(() => api.speak(step.promptEs), 350); } },
  });
}

// ------------------------------------------------------------ listen and choose
function listen(step, api) {
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
    ctrl: { mount() { setTimeout(() => node.querySelector(".listen-big").click(), 380); } },
  });
}

// ------------------------------------------------------------ build the sentence (tiles)
function tiles(step, api) {
  const order = shuffle(step.tilesEs.map((_, i) => i));
  const node = el(`
    <div class="ex ex-tiles">
      ${head("Write this in Spanish")}
      <div class="speaker-row">
        ${charImg(step.character)}
        <div class="bubble"><span class="en">${esc(step.en)}</span></div>
      </div>
      <div class="answer-lines" aria-label="Your answer" lang="es"></div>
      <div class="bank" aria-label="Word bank" lang="es">
        ${order.map((ti) => `<span class="tile-slot"><button class="press tile" data-ti="${ti}"><span class="face">${esc(step.tilesEs[ti])}</span></button></span>`).join("")}
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
    check() {
      node.classList.add("is-locked");
      const got = placed.map((i) => step.tilesEs[i].toLowerCase()).join(" ");
      const want = step.answerEs.map((w) => w.toLowerCase()).join(" ");
      const ok = got === want;
      answer.classList.add(ok ? "is-correct" : "is-wrong");
      if (!ok) restartAnim(answer, "shake");
      return { ok, answerEs: step.fullEs, answerEn: ok ? step.en : "" };
    },
  };
}

// ------------------------------------------------------------ type it (+ accent fix-up)
const ACCENT = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
const ARTICLES = ["el", "la", "los", "las"];
const normalize = (s) => s.normalize("NFC").toLowerCase().replace(/[¡!¿?.,;:"“”'‘’…]/g, " ").replace(/\s+/g, " ").trim();

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
  const keys = ["á", "é", "í", "ó", "ú", "ñ", "ü"];
  const node = el(`
    <div class="ex ex-type">
      ${head("Type this in Spanish")}
      <div class="type-prompt">
        ${step.flag ? flagImg(step.flag, "flag type-flag") : `<span class="type-prompt__icon">${icon("type", 28, 2.5)}</span>`}
        <span class="type-prompt__en">${esc(step.en)}</span>
      </div>
      <div class="type-field">
        <input class="type-input" type="text" lang="es" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
               aria-label="Type the Spanish for “${esc(step.en)}”" placeholder="Type in Spanish">
      </div>
      <div class="accent-bar" role="group" aria-label="Spanish letters">
        ${keys.map((k) => `<button class="press accent-key" data-k="${k}" tabindex="0"><span class="face">${k}</span></button>`).join("")}
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
    mount() { setTimeout(() => input.focus({ preventScroll: true }), 300); },
    onMain() {
      const g = grade(input.value, step.answerEs);
      input.readOnly = true;
      input.blur();
      if (g.verdict === "accents") return startFixup(g);
      const ok = g.verdict === "correct";
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
    api.setFooter("Tap the letters", { enabled: false });
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
      fix.classList.add("is-solved");
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

    fix.addEventListener("click", (e) => {
      if (e.target.closest("[data-show]")) {
        // Animate the needed fixes one by one.
        const need = cur.map((c, i) => (c !== want[i] ? i : -1)).filter((i) => i >= 0);
        need.forEach((i, k) => setTimeout(() => { cur[i] = want[i]; render(i); restartAnim(letters.get(i), "pop"); if (k === need.length - 1) win(true); }, 250 * k));
        return;
      }
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
        <div class="match-col">${left.map((x) => `<button class="press option match-card" data-side="es" data-i="${x.i}"><span class="face">${es(x.text, "label")}</span></button>`).join("")}</div>
        <div class="match-col">${right.map((x) => `<button class="press option match-card" data-side="en" data-i="${x.i}"><span class="face"><span class="label">${esc(x.text)}</span></span></button>`).join("")}</div>
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
  return { el: node, footer: { label: "Check", enabled: false } };
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
    // After two tries the footer becomes "Skip for now": no penalty, speaking never blocks progress.
    onMain() { stt.stop(); api.next(); },
    mount() { setTimeout(() => api.speak(step.es), 350); },
    destroy() { stt.stop(); },
  };
}
