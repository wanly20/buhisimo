// Buhísimo v2 design prototype: screens (path, lesson, complete) + settings.
import { lesson } from "../lesson-1-1.js";
import { units, unitsTextbookTitlesEs } from "../path-data.js";
import { icon } from "./icons.js";
import { $, $$, esc, es, el, button, footBar, charImg, toast, openModal, countUp, reducedMotion, restartAnim } from "./ui.js";
import { sideNav, pathPanel, soonCard, SOON } from "./shell.js";
import { store, untilLabel } from "./store.js";
import { applyFont, pairings, loadPairing } from "./fonts.js";
import { runLesson } from "./lesson.js";
import { sfx } from "./sound.js";
import { tts, stt } from "./speech.js";

const app = document.getElementById("app");
applyFont(store.get().font);

const NODE_ICON = { lesson: "star", story: "book-open", practice: "target", check: "trophy", listen: "headphones", game: "gamepad-2", speak: "mic", boss: "crown" };
const OFFSETS = [0, -56, -84, -56, 0, 56, 84, 56];
const PEEKS = {
  "1.1": { img: "owl-explaining", side: "right", at: 1 },
  "1.2": { img: "matilda", side: "left", at: 0 },
  "1.3": { img: "max", side: "right", at: 0 },
  "1.4": { img: "owl-thinking", side: "left", at: 0 },
  "1.5": { img: "owl-encouraging", side: "right", at: 0 },
  "1.6": { img: "max", side: "left", at: 0 },
};

let justCompleted = null;
let activeLesson = null;

// =================================================================== router
// #/ path · #/lesson/… lesson · #/review, #/radio, #/profile "coming soon" (sidebar)
const viewOf = (h) => (h.startsWith("#/lesson") ? "lesson" : SOON[h.slice(2)] ? h.slice(2) : "path");

function route() {
  const view = viewOf(location.hash);
  const pathScreen = app.querySelector(".screen.path");
  // Switching between path sections keeps the shell (sidebar, panel) in place.
  if (view !== "lesson" && pathScreen && !activeLesson) return setView(pathScreen, view);
  activeLesson?.dispose();
  activeLesson = null;
  app.querySelectorAll(".screen, .sheet, .scrim").forEach((n) => n.remove());
  if (view === "lesson") return showLesson();
  showPath(view);
}
window.addEventListener("hashchange", route);

// =================================================================== path
function showPath(view = "path") {
  const s = store.get();
  const done = (id) => !!s.completed[id];
  let g = 0;
  const unitHtml = units.map((u) => {
    const peek = PEEKS[u.id];
    const nodes = u.nodes.map((n, k) => {
      const x = OFFSETS[g++ % OFFSETS.length];
      const playable = n.id === lesson.id;
      const isDone = done(n.id);
      const current = playable && !isDone;
      const cls = ["press", "node", `node--${u.theme}`, isDone ? "is-done" : "", current ? "is-current" : "", justCompleted === n.id ? "just-done" : ""].join(" ");
      const ico = isDone ? "check" : NODE_ICON[n.kind];
      const label = `${n.labelEn}, unit ${u.id}${isDone ? ", completed" : current ? ", start here" : ", coming soon"}`;
      return `
        <div class="node-wrap ${current ? "is-current" : ""}" style="--x:${x}px">
          ${current ? `<div class="start-bubble" aria-hidden="true">Start</div>` : ""}
          <button class="${cls}" data-node="${n.id}" data-unit="${u.id}" aria-label="${esc(label)}">
            <span class="face">${icon(ico, 34, 3)}</span>
          </button>
          ${peek && peek.at === k ? `<img class="peek peek--${peek.side} ${peek.img.startsWith("owl") ? "peek--owl" : ""}" src="assets/${peek.img}.webp" alt="" draggable="false">` : ""}
        </div>`;
    }).join("");
    return `
      <section class="unit unit--${u.theme}" aria-labelledby="u-${u.id}">
        <div class="unit-banner">
          <div class="unit-banner__text">
            <span class="unit-kicker">Unit ${u.id}</span>
            <h2 id="u-${u.id}" lang="es" class="unit-title">${esc(unitsTextbookTitlesEs[u.id])}</h2>
            <p class="unit-sub">${esc(u.subtitleEn)}</p>
          </div>
          <button class="unit-guide" data-guide="${u.id}" aria-label="Unit ${u.id} guidebook">${icon("book-open", 24, 2.5)}</button>
        </div>
        <div class="unit-nodes">${nodes}</div>
      </section>`;
  }).join("");

  const screen = el(`
    <section class="screen path" aria-label="Learning path">
      ${sideNav(view)}
      <div class="path-bg" aria-hidden="true"><img src="assets/map-background.webp" alt=""></div>
      <header class="path-top">
        <div class="brand">
          <span class="brand__avatar">${charImg("owl-explaining", "brand__img")}</span>
          <span class="brand__name">Buhísimo</span>
        </div>
        <div class="path-stats">
          <span class="chip chip--streak ${s.streak ? "" : "is-zero"}" title="Day streak" aria-label="${s.streak} day streak">${icon("flame", 24, 2.25)}<span>${s.streak}</span></span>
          <span class="chip chip--xp" title="Total XP" aria-label="${s.xp} XP">${icon("zap", 22, 2.25)}<span>${s.xp}</span></span>
          <button class="bar-btn" data-act="settings" aria-label="Settings">${icon("settings", 26, 2.5)}</button>
        </div>
      </header>
      <main class="path-scroll">
        <div class="path-inner">${unitHtml}
          <p class="path-end">${icon("sparkles", 18, 2.5)} Units 2 and 3 are on their way.</p>
        </div>
        <div class="soon" hidden></div>
      </main>
      ${pathPanel(s)}
    </section>`);
  app.appendChild(screen);
  const scroller = $(".path-scroll", screen);

  // Parallax-free fixed background; keep the current node in view on load.
  setView(screen, view, { first: true });
  if (justCompleted) {
    const n = $(".just-done", screen);
    setTimeout(() => { n && restartAnim(n, "pop"); sfx.pair(); }, 450);
    $$(".chip--xp, .chip--streak, .pstat", screen).forEach((c) => restartAnim(c, "bump"));
    justCompleted = null;
  }

  screen.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest('[data-act="settings"], [data-nav="settings"]')) return openSettings();
    if (t.closest("[data-guide]")) return toast("Guidebooks are coming soon.", "book-open");
    if (t.closest("[data-start]")) { sfx.tap(); location.hash = "#/lesson/1.1-1"; return; }
    const node = t.closest("[data-node]");
    closePop();
    if (node) { sfx.select(); openPop(node, e.detail === 0); }
  });
  scroller.addEventListener("scroll", closePop, { passive: true });
  screen.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $(".node-pop", screen)) {
      const node = $(".node-pop", screen).closest(".node-wrap").querySelector(".node");
      closePop();
      node.focus({ preventScroll: true });
    }
  });

  function closePop() {
    $$(".node-pop", screen).forEach((p) => { p.classList.remove("is-open"); setTimeout(() => p.remove(), 200); });
  }

  function openPop(node, viaKeyboard = false) {
    const id = node.dataset.node;
    const unit = units.find((u) => u.id === node.dataset.unit);
    const meta = unit.nodes.find((n) => n.id === id);
    const playable = id === lesson.id;
    const isDone = !!store.get().completed[id];
    const wrap = node.closest(".node-wrap");
    const x = parseFloat(wrap.style.getPropertyValue("--x")) || 0;
    const pop = el(`
      <div class="node-pop ${playable ? `node-pop--${unit.theme}` : "node-pop--soon"}" style="--shift:${-x}px" role="dialog" aria-label="${esc(meta.labelEn)}">
        <span class="node-pop__arrow" style="--ax:${x}px"></span>
        ${playable
          ? `<h3 class="node-pop__title">${es(lesson.titleEs)}</h3>
             <p class="node-pop__meta">${esc(meta.labelEn)} of ${unit.nodes.length} · ${esc(lesson.titleEn)}</p>
             ${button(isDone ? `Practise again +${lesson.xpBase} XP` : `Start +${lesson.xpBase} XP`, { variant: "on-color", attrs: "data-start" })}`
          : `<h3 class="node-pop__title node-pop__title--en">${esc(meta.labelEn)}</h3>
             <p class="node-pop__meta">This part of the path isn't in the prototype yet.</p>
             ${button("Coming soon", { variant: "secondary", attrs: "disabled" })}`}
      </div>`);
    wrap.appendChild(pop);
    requestAnimationFrame(() => pop.classList.add("is-open"));
    if (viaKeyboard) setTimeout(() => pop.querySelector("button:not(:disabled)")?.focus({ preventScroll: true }), 80);
    // Keep the popover visible.
    setTimeout(() => {
      const r = pop.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
      if (r.bottom > sr.bottom - 12) scroller.scrollBy({ top: r.bottom - sr.bottom + 24, behavior: reducedMotion() ? "auto" : "smooth" });
    }, 60);
  }
}

/** Show the path or a "coming soon" section inside the path screen's shell. */
function setView(screen, view, { first = false } = {}) {
  const scroller = $(".path-scroll", screen);
  const soon = $(".soon", screen);
  $$(".side-item[data-view]", screen).forEach((a) => {
    if (a.dataset.view === view) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $$(".node-pop", screen).forEach((p) => p.remove());
  $(".path-inner", screen).hidden = view !== "path";
  soon.hidden = view === "path";
  screen.dataset.view = view;
  if (view === "path") {
    soon.innerHTML = "";
    // Keep the current (or just-finished) lesson in view.
    const focusNode = $(".just-done", screen) || $(".node.is-current", screen);
    if (focusNode) requestAnimationFrame(() => {
      const r = focusNode.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
      scroller.scrollTop += r.top - sr.top - sr.height * 0.4;
    });
  } else {
    soon.innerHTML = soonCard(view);
    scroller.scrollTop = 0;
    if (!first) restartAnim(soon.firstElementChild, "step-enter");
  }
}

// =================================================================== lesson
function showLesson() {
  activeLesson = runLesson(app, lesson, {
    onExit: () => { location.hash = "#/"; },
    onComplete: (result) => showComplete(result),
    openSettings,
  });
}

// =================================================================== complete
async function showComplete({ xp, accuracy }) {
  const s = store.finishLesson(lesson.id, xp, accuracy);
  justCompleted = lesson.id;
  const screen = el(`
    <section class="screen complete" aria-label="Lesson complete">
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="complete-hero">
        <img class="complete-scene" src="assets/salento-street.webp" alt="A colourful street in Salento, Colombia">
        <img class="complete-owl" src="assets/owl-celebrating.webp" alt="Buhísimo the owl, celebrating">
      </div>
      <div class="complete-body">
        <h1 class="complete-title">Lesson complete!</h1>
        <p class="complete-sub">${es(lesson.praiseEs[0], "complete-es")} Now you can ask and say where people are from.</p>
        <div class="stat-cards">
          <div class="stat stat--xp"><span class="stat__label">Total XP</span><span class="stat__value">${icon("zap", 22, 2.5)}<b data-count="${xp}">0</b></span></div>
          <div class="stat stat--acc"><span class="stat__label">${accuracy >= 90 ? "Amazing" : "Accuracy"}</span><span class="stat__value">${icon("target", 22, 2.5)}<span class="stat__num"><b data-count="${accuracy}">0</b>%</span></span></div>
          <div class="stat stat--streak"><span class="stat__label">Streak</span><span class="stat__value">${icon("flame", 22, 2.5)}<b data-count="${s.streak}">0</b>&nbsp;day${s.streak === 1 ? "" : "s"}</span></div>
        </div>
        <div class="learned">
          <span class="learned__label">Words you met</span>
          <div class="learned__chips">${lesson.learnedEs.map((w) => `<button class="learned__chip" data-say="${esc(w)}">${icon("volume-2", 16, 2.5)}${es(w)}</button>`).join("")}</div>
        </div>
      </div>
      ${footBar(button("Continue", { attrs: "data-done" }))}
    </section>`);
  app.appendChild(screen);
  sfx.complete();
  $$("[data-count]", screen).forEach((b, i) => setTimeout(() => countUp(b, +b.dataset.count, 900), 500 + i * 180));
  screen.addEventListener("click", (e) => { const w = e.target.closest("[data-say]"); if (w) tts.speak(w.dataset.say, { sayAs: lesson.sayAs }); });
  $("[data-done]", screen).addEventListener("click", () => { sfx.tap(); location.hash = "#/"; if (location.hash === "#/") route(); });
  setTimeout(() => $("[data-done]", screen).focus({ preventScroll: true }), 600);
  const onKey = (e) => { if (e.key === "Enter") { document.removeEventListener("keydown", onKey); $("[data-done]", screen)?.click(); } };
  document.addEventListener("keydown", onKey);

  if (!reducedMotion()) {
    try {
      const { default: confetti } = await import("https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/+esm");
      const fire = confetti.create($(".confetti", screen), { resize: true, useWorker: true });
      const colors = ["#14a39e", "#d6247a", "#f7b928", "#17a35a", "#d9643a", "#ffffff"];
      fire({ particleCount: 90, spread: 75, startVelocity: 42, origin: { y: 0.35 }, colors, scalar: 1.1 });
      setTimeout(() => fire({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.5 }, colors }), 250);
      setTimeout(() => fire({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, colors }), 400);
    } catch { /* offline: no confetti, still a happy screen */ }
  }
}

// =================================================================== settings
export function openSettings() {
  const s = store.get();
  pairings.forEach((p) => loadPairing(p.id)); // so each card previews its own fonts
  const speakOn = store.speakOn(), listenOn = store.listenOn();
  const node = el(`
    <div class="settings">
      <div class="modal__head">
        <h2 class="h-title">Settings</h2>
        <button class="bar-btn" data-close aria-label="Close settings">${icon("x", 26, 3)}</button>
      </div>
      <p class="modal__section" id="font-label">Letters</p>
      <div class="font-choice" role="radiogroup" aria-labelledby="font-label">
        ${pairings.map((p) => `
          <button class="press font-card" role="radio" aria-checked="${s.font === p.id}" data-font="${p.id}">
            <span class="face">
              <span class="font-card__name" style="font-family:'${p.display}';font-weight:700">${esc(p.display)}<small>+ ${esc(p.learn)}</small></span>
              <span class="font-card__sample" lang="es" style="font-family:'${p.learn}'">${esc(lesson.specimenEs)}</span>
              <span class="font-card__glyphs" style="font-family:'${p.learn}'">Il1 O0 á é í ó ú ñ ü ¿ ¡</span>
            </span>
          </button>`).join("")}
      </div>
      <p class="modal__section">Practice</p>
      ${row("sfx", "volume-2", "Sound effects", "Little sounds for right and wrong answers", s.sfx)}
      ${row("speak", "mic", "Speaking exercises", !stt.available() ? "Not available in this browser" : speakOn ? "On" : `Off until ${untilLabel(s.speakOffUntil)}`, speakOn && stt.available(), !stt.available())}
      ${row("listen", "headphones", "Listening exercises", listenOn ? "On" : `Off until ${untilLabel(s.listenOffUntil)}`, listenOn)}
      <p class="modal__section">Prototype</p>
      <button class="btn-text settings-reset" data-reset>${icon("rotate-ccw", 18, 2.75)} Reset prototype progress</button>
      <p class="settings-foot">Voice: ${esc(tts.voiceName())}. Real recordings come later.</p>
    </div>`);
  function row(key, ico, title, sub, on, disabled = false) {
    return `<div class="setting"><span class="setting__icon">${icon(ico, 22, 2.5)}</span>
      <span class="setting__text"><span class="setting__title" id="set-${key}">${title}</span><span class="setting__sub" data-sub="${key}">${sub}</span></span>
      <button class="switch" role="switch" aria-checked="${on}" aria-labelledby="set-${key}" data-switch="${key}" ${disabled ? "disabled" : ""}></button></div>`;
  }
  const m = openModal(node, { label: "Settings" });
  node.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-close]")) return m.close();
    const f = t.closest("[data-font]");
    if (f) {
      store.set({ font: f.dataset.font });
      applyFont(f.dataset.font);
      $$("[data-font]", node).forEach((b) => b.setAttribute("aria-checked", String(b === f)));
      sfx.select();
      return;
    }
    const sw = t.closest("[data-switch]");
    if (sw) {
      const key = sw.dataset.switch;
      const on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      const sub = $(`[data-sub="${key}"]`, node);
      if (key === "sfx") { store.set({ sfx: on }); sfx.tap(); }
      if (key === "speak") { on ? store.set({ speakOffUntil: 0 }) : store.snoozeSpeak(); sub.textContent = on ? "On" : `Off until ${untilLabel(store.get().speakOffUntil)}`; }
      if (key === "listen") { on ? store.set({ listenOffUntil: 0 }) : store.snoozeListen(); sub.textContent = on ? "On" : `Off until ${untilLabel(store.get().listenOffUntil)}`; }
      return;
    }
    if (t.closest("[data-reset]")) {
      if (confirm("Reset XP, streak and completed lessons for this prototype?")) {
        store.reset();
        m.close();
        toast("Progress reset.", "rotate-ccw");
        if (!location.hash.startsWith("#/lesson")) route();
      }
    }
  });
}

route();
