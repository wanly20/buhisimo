// Buhísimo v2 prototype: screens (path, lesson, complete), the Review, Radio Búho
// and Me views, settings, and the offline app (service worker).
import { LESSONS, lessonById } from "../unit-1-1.js";
import { units, unitsTextbookTitlesEs } from "../path-data.js";
import { icon } from "./icons.js";
import { $, $$, esc, es, el, button, footBar, charImg, toast, openModal, countUp, reducedMotion, restartAnim } from "./ui.js";
import { sideNav, pathPanel, tabBar } from "./shell.js";
import { store, untilLabel, readProgressFile, dayKey } from "./store.js";
import { applyFont, pairings, loadPairing } from "./fonts.js";
import { runLesson, hasAudio } from "./lesson.js";
import { sfx } from "./sound.js";
import { tts, stt, VOICE_OPTIONS } from "./speech.js";
import { gradeStep, meetLesson, buildReview, reviewViewHtml, dueItems, metItems } from "./review.js";
import { mountRadio, stopRadio } from "./radio.js";

// Bump together with VERSION in sw.js for every release (tools/e2e-unit.mjs checks they match).
export const APP_VERSION = "2026-10-21.caps";

const app = document.getElementById("app");
applyFont(store.get().font);
const lesson1 = LESSONS[0];

const NODE_ICON = { lesson: "star", story: "book-open", practice: "dumbbell", check: "trophy", listen: "headphones", game: "gamepad-2", speak: "mic", boss: "crown" };
const OFFSETS = [0, -56, -84, -56, 0, 56, 84, 56];
const PEEKS = {
  "1.1": { img: "owl-explaining", side: "right", at: 1 },
  "1.2": { img: "matilda", side: "left", at: 0 },
  "1.3a": { img: "max", side: "right", at: 0 },
  "1.3b": { img: "matilda", side: "left", at: 1 },
  "1.4": { img: "owl-thinking", side: "left", at: 0 },
  "1.5": { img: "owl-encouraging", side: "right", at: 0 },
  "1.6": { img: "max", side: "left", at: 0 },
};
const VIEWS = ["path", "review", "radio", "profile"];

let justCompleted = null;
let activeLesson = null;
let reloadWhenFree = false;

// =================================================================== teacher override
// Lessons unlock one after the other: each one's vocabulary is the next one's prerequisite
// (Juan, 20 Oct 2026; docs/content_plan_1.1-1.6.md §1). For testing, a hidden teacher switch
// opens every lesson. It is set from the address bar and remembered on this device:
//   ?unlock=all   open every lesson (and show the "For teachers" settings)
//   ?unlock=off   lock them again (sequential, as students see it)
//   ?teacher=1    only show the "For teachers" settings; ?teacher=0 hides them and relocks
(function teacherOverride() {
  let q;
  try { q = new URLSearchParams(location.search); } catch { return; }
  if (!q.has("unlock") && !q.has("teacher")) return;
  const u = (q.get("unlock") || "").toLowerCase(), t = q.get("teacher");
  if (u === "all" || u === "1" || u === "on") store.set({ unlockAll: true, teacher: true });
  if (u === "off" || u === "0" || u === "none") store.set({ unlockAll: false });
  if (t === "1" || t === "on" || t === "") store.set({ teacher: true });
  if (t === "0" || t === "off") store.set({ teacher: false, unlockAll: false });
  q.delete("unlock"); q.delete("teacher");
  const rest = q.toString();
  try { history.replaceState(null, "", location.pathname + (rest ? `?${rest}` : "") + location.hash); } catch { /* file:// */ }
})();

// =================================================================== progress helpers
const isDone = (id) => !!store.get().completed[id];
/** Index of the first unfinished 1.1 lesson (the "current" node). */
const currentIndex = () => { const i = LESSONS.findIndex((l) => !isDone(l.id)); return i < 0 ? LESSONS.length : i; };
/** Open = the current lesson, any lesson before it, or one already finished (replay). Everything after the current one is locked. */
const isOpen = (id) => {
  const i = LESSONS.findIndex((l) => l.id === id);
  if (i < 0) return false;
  return !!store.get().unlockAll || isDone(id) || i <= currentIndex();
};
const titleHtml = (l) => (l.titleEs ? es(l.titleEs) : esc(l.titleEn));
/** Spanish titles get a small English line underneath (decision 2026-10-21). */
const enLine = (l, cls = "node-pop__en") => (l.titleEs ? `<p class="${cls}">${esc(l.titleEn)}</p>` : "");
const unitSize = (l) => LESSONS.filter((x) => x.unit === l.unit).length;

// =================================================================== router
// #/ path · #/review · #/radio · #/profile (views inside the path screen)
// #/lesson/<id> a lesson · #/review/play a review session
function viewOf(h) {
  if (h.startsWith("#/lesson/")) return "lesson";
  if (h === "#/review/play") return "reviewplay";
  if (h === "#/knowledge") return "review";
  const v = h.slice(2);
  return VIEWS.includes(v) ? v : "path";
}

function route() {
  const view = viewOf(location.hash);
  if (reloadWhenFree && view !== "lesson" && view !== "reviewplay") { location.reload(); return; }
  const pathScreen = app.querySelector(".screen.path");
  // Switching between views keeps the shell (sidebar, panel, tab bar) in place.
  if (VIEWS.includes(view) && pathScreen && !activeLesson) return setView(pathScreen, view);
  activeLesson?.dispose();
  activeLesson = null;
  stopRadio();
  app.querySelectorAll(".screen, .sheet, .scrim").forEach((n) => n.remove());
  if (view === "lesson") return showLesson(decodeURIComponent(location.hash.slice("#/lesson/".length)));
  if (view === "reviewplay") return showReview();
  showPath(view);
}
window.addEventListener("hashchange", route);

// =================================================================== path
function showPath(view = "path") {
  const s = store.get();
  const cur = currentIndex();
  let g = 0;
  const unitHtml = units.map((u) => {
    const peek = PEEKS[u.id];
    const nodes = u.nodes.map((n, k) => {
      const x = OFFSETS[g++ % OFFSETS.length];
      const l = lessonById(n.id);
      const done = isDone(n.id);
      const current = !!l && LESSONS.indexOf(l) === cur;
      const locked = !l || !isOpen(n.id);
      const cls = ["press", "node", `node--${u.theme}`, done ? "is-done" : "", current ? "is-current" : "", locked ? "is-locked" : "", justCompleted === n.id ? "just-done" : ""].join(" ");
      const ico = done ? "check" : NODE_ICON[n.kind];
      const lockBadge = l && locked && !done ? `<span class="node-lock" aria-hidden="true">${icon("lock", 16, 3)}</span>` : "";
      const label = `${n.labelEn}${l ? `: ${l.titleEn}` : ""}, unit ${u.id}${done ? ", completed" : current ? ", start here" : !l ? ", coming soon" : locked ? ", locked" : ""}`;
      return `
        <div class="node-wrap ${current ? "is-current" : ""}" style="--x:${x}px">
          ${current ? `<div class="start-bubble" aria-hidden="true">${cur === 0 ? "Start" : "Next"}</div>` : ""}
          <button class="${cls}" data-node="${n.id}" data-unit="${u.id}" aria-label="${esc(label)}">
            <span class="face">${icon(ico, 34, 3)}</span>${lockBadge}
          </button>
          ${peek && peek.at === k ? `<img class="peek peek--${peek.side} ${peek.img.startsWith("owl") ? "peek--owl" : ""}" src="assets/${peek.img}.webp" alt="" draggable="false">` : ""}
        </div>`;
    }).join("");
    return `
      <section class="unit unit--${u.theme}" aria-labelledby="u-${u.id}">
        <div class="unit-banner">
          <div class="unit-banner__text">
            <span class="unit-kicker">${u.unit ? `Unit ${esc(u.unit)} · Part ${esc(u.id.slice(u.unit.length).toUpperCase())}` : `Unit ${u.id}`}</span>
            <h2 id="u-${u.id}" lang="es" class="unit-title">${esc(u.titleEs ?? unitsTextbookTitlesEs[u.id])}</h2>
            <p class="unit-sub">${esc(u.subtitleEn)}</p>
          </div>
          <button class="unit-guide" data-guide="${u.id}" aria-label="Unit ${u.id} guidebook">${icon("book-open", 24, 2.5)}</button>
        </div>
        <div class="unit-nodes">${nodes}</div>
      </section>`;
  }).join("");

  const due = dueItems().length;
  const screen = el(`
    <section class="screen path" aria-label="Buhísimo">
      ${sideNav(view, due)}
      <div class="path-bg" aria-hidden="true"><img src="assets/map-background.webp" alt=""></div>
      <header class="path-top">
        <div class="brand">
          <span class="brand__avatar">${charImg("owl-explaining", "brand__img")}</span>
          <span class="brand__name">Buhísimo</span>
        </div>
        <div class="path-stats">
          <span class="chip chip--streak ${s.streak ? "" : "is-zero"}" title="Day streak" aria-label="${s.streak} day streak">${icon("flame", 24, 2.25)}<span>${s.streak}</span></span>
          <span class="chip chip--xp" title="Total XP" aria-label="${s.xp} XP">${icon("zap", 22, 2.25)}<span>${s.xp}</span></span>
          ${s.unlockAll ? `<button class="chip teacher-flag" data-act="relock" title="Teacher preview: every lesson is open. Tap to lock them again." aria-label="Teacher preview: every lesson is open. Lock them again">${icon("lock-open", 22, 2.5)}<span>Teacher</span></button>` : ""}
          <button class="bar-btn" data-act="settings" aria-label="Settings">${icon("settings", 26, 2.5)}</button>
        </div>
      </header>
      <main class="path-scroll">
        <div class="path-inner">${unitHtml}
          <p class="path-end">${icon("sparkles", 18, 2.5)} Units 2 and 3 are on their way.</p>
        </div>
        <div class="view-area" hidden></div>
      </main>
      ${pathPanel(s)}
      ${tabBar(view, due)}
    </section>`);
  app.appendChild(screen);
  const scroller = $(".path-scroll", screen);

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
    if (t.closest('[data-act="relock"]')) { store.set({ unlockAll: false }); toast("Lessons lock one after the other again.", "lock"); return route.force(); }
    if (t.closest("[data-guide]")) return toast("Guidebooks are coming soon.", "book-open");
    const st = t.closest("[data-start]");
    if (st) { sfx.tap(); location.hash = `#/lesson/${st.dataset.start}`; return; }
    if (t.closest("[data-start-review]")) { sfx.tap(); location.hash = "#/review/play"; return; }
    const say = t.closest("[data-say]");
    if (say) { tts.speak(say.dataset.say, { role: "maria", sayAs: lesson1.sayAs }); return; }
    const node = t.closest("[data-node]");
    closePop();
    if (node) { sfx.select(); openPop(node, e.detail === 0); }
  });
  // Scrolling closes the popover, except the scroll we start ourselves to bring a popover into view.
  let ownScrollUntil = 0;
  scroller.addEventListener("scroll", () => { if (Date.now() > ownScrollUntil) closePop(); }, { passive: true });
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
    const l = lessonById(id);
    const done = isDone(id);
    const open = l && isOpen(id);
    const wrap = node.closest(".node-wrap");
    const x = parseFloat(wrap.style.getPropertyValue("--x")) || 0;
    const prevL = l && LESSONS[LESSONS.indexOf(l) - 1];
    const pop = el(`
      <div class="node-pop ${open ? `node-pop--${unit.theme}` : "node-pop--soon"}" style="--shift:${-x}px" role="dialog" aria-label="${esc(meta.labelEn)}">
        <span class="node-pop__arrow" style="--ax:${x}px"></span>
        ${open
          ? `<h3 class="node-pop__title">${titleHtml(l)}</h3>${enLine(l)}
             <p class="node-pop__meta">${esc(meta.labelEn)} · ${l.n} of ${unitSize(l)}</p>
             ${button(done ? `Practise again +${l.xpBase} XP` : `Start +${l.xpBase} XP`, { variant: "on-color", attrs: `data-start="${id}"` })}`
          : l
            ? `<h3 class="node-pop__title">${titleHtml(l)}</h3>${enLine(l)}
               <p class="node-pop__meta">${icon("lock", 14, 2.75)} Finish “${esc(prevL.titleEs || prevL.titleEn)}” first. One step at a time!</p>
               ${button("Locked", { variant: "secondary", attrs: "disabled" })}`
            : `<h3 class="node-pop__title node-pop__title--en">${esc(meta.labelEn)}</h3>
               <p class="node-pop__meta">This part of the path isn't in the prototype yet.</p>
               ${button("Coming soon", { variant: "secondary", attrs: "disabled" })}`}
      </div>`);
    wrap.appendChild(pop);
    requestAnimationFrame(() => pop.classList.add("is-open"));
    if (viaKeyboard) setTimeout(() => pop.querySelector("button:not(:disabled)")?.focus({ preventScroll: true }), 80);
    setTimeout(() => {
      const r = pop.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
      if (r.bottom > sr.bottom - 12) ownScrollUntil = Date.now() + 900, scroller.scrollBy({ top: r.bottom - sr.bottom + 24, behavior: reducedMotion() ? "auto" : "smooth" });
    }, 60);
  }
}

/** Show the path or one of the views inside the path screen's shell. */
function setView(screen, view, { first = false } = {}) {
  const scroller = $(".path-scroll", screen);
  const area = $(".view-area", screen);
  $$("[data-view]", screen).forEach((a) => {
    if (a.dataset.view === view) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $$(".node-pop", screen).forEach((p) => p.remove());
  if (view !== "radio") stopRadio();
  $(".path-inner", screen).hidden = view !== "path";
  area.hidden = view === "path";
  screen.dataset.view = view;
  if (view === "path") {
    area.innerHTML = "";
    const focusNode = $(".just-done", screen) || $(".node.is-current", screen);
    if (focusNode) requestAnimationFrame(() => {
      const r = focusNode.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
      scroller.scrollTop += r.top - sr.top - sr.height * 0.4;
    });
    return;
  }
  scroller.scrollTop = 0;
  if (view === "review") area.innerHTML = reviewViewHtml();
  if (view === "profile") { area.innerHTML = profileHtml(); wireProfile(area); }
  if (view === "radio") mountRadio(area);
  if (!first && area.firstElementChild) restartAnim(area.firstElementChild, "step-enter");
}

// =================================================================== lesson + review
async function showLesson(id) {
  const lesson = lessonById(id);
  if (!lesson) { location.replace("#/"); return; }
  if (!isOpen(id)) {
    // A locked lesson can't be opened from the address bar or an old link either.
    const prev = LESSONS[currentIndex()] || LESSONS[LESSONS.indexOf(lesson) - 1];
    toast(`That lesson is locked. Finish “${esc(prev.titleEs || prev.titleEn)}” first.`, "lock", 3200);
    location.replace("#/");
    return;
  }
  await tts.ready();
  if (viewOf(location.hash) !== "lesson") return; // navigated away while loading
  activeLesson = runLesson(app, lesson, {
    onExit: () => { location.hash = "#/"; },
    onComplete: (result) => showComplete(lesson, result),
    onGraded: (step, ok) => gradeStep(step, ok),
    openSettings,
  });
}

async function showReview() {
  await tts.ready();
  if (!metItems().length) { toast("Finish a lesson first. Then Review brings back the tricky words.", "repeat", 3200); location.hash = "#/review"; return; }
  const session = buildReview();
  activeLesson = runLesson(app, session, {
    onExit: () => { location.hash = "#/review"; },
    onComplete: (result) => showComplete(session, result),
    onGraded: (step, ok) => gradeStep(step, ok),
    openSettings,
  });
}

// =================================================================== complete
const COMPLETE_TITLE = { learn: "Lesson complete!", practice: "Practice complete!", story: "Story complete!", game: "Game complete!", check: "Unit 1.1 complete!", review: "Review done!" };

async function showComplete(lesson, { xp, accuracy }) {
  activeLesson = null;
  if (lesson.id) meetLesson(lesson);
  const s = store.finishLesson(lesson.id, xp, accuracy);
  if (lesson.id) justCompleted = lesson.id;
  const back = lesson.kind === "review" ? "#/review" : "#/";
  const chips = lesson.learnedEs || [];
  const screen = el(`
    <section class="screen complete complete--${lesson.kind}" aria-label="${esc(COMPLETE_TITLE[lesson.kind] || "Lesson complete!")}">
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="complete-hero">
        <img class="complete-scene" src="assets/salento-street.webp" alt="A colourful street in Salento, Colombia">
        <img class="complete-owl" src="assets/owl-celebrating.webp" alt="Buhísimo the owl, celebrating">
      </div>
      <div class="complete-body">
        <h1 class="complete-title">${esc(COMPLETE_TITLE[lesson.kind] || "Lesson complete!")}</h1>
        <p class="complete-sub">${es(lesson.praiseEs[0], "complete-es")} ${esc(lesson.canDoEn || "")}</p>
        <div class="stat-cards">
          <div class="stat stat--xp"><span class="stat__label">Total XP</span><span class="stat__value">${icon("zap", 22, 2.5)}<b data-count="${xp}">0</b></span></div>
          <div class="stat stat--acc"><span class="stat__label">${accuracy >= 90 ? "Amazing" : "Accuracy"}</span><span class="stat__value">${icon("target", 22, 2.5)}<span class="stat__num"><b data-count="${accuracy}">0</b>%</span></span></div>
          <div class="stat stat--streak"><span class="stat__label">Streak</span><span class="stat__value">${icon("flame", 22, 2.5)}<b data-count="${s.streak}">0</b>&nbsp;day${s.streak === 1 ? "" : "s"}</span></div>
        </div>
        ${chips.length ? `<div class="learned">
          <span class="learned__label">${lesson.kind === "review" ? "Words you practised" : "Words you met"}</span>
          <div class="learned__chips">${chips.map((w, i) => hasAudio(w)
            ? `<button class="learned__chip" data-say="${esc(w)}" data-role="${i % 2 ? "raul" : "maria"}">${icon("volume-2", 16, 2.5)}${es(w)}</button>`
            : `<span class="learned__chip learned__chip--quiet">${es(w)}</span>`).join("")}</div>
        </div>` : ""}
        ${s.sessions % 3 === 0 ? `<p class="backup-tip">${icon("lightbulb", 18, 2.5)} Tip: download your progress in <b>Me</b> to keep it safe.</p>` : ""}
      </div>
      ${footBar(button("Continue", { attrs: "data-done" }))}
    </section>`);
  app.appendChild(screen);
  sfx.complete();
  $$("[data-count]", screen).forEach((b, i) => setTimeout(() => countUp(b, +b.dataset.count, 900), 500 + i * 180));
  screen.addEventListener("click", (e) => { const w = e.target.closest("[data-say]"); if (w) tts.speak(w.dataset.say, { sayAs: lesson.sayAs, role: w.dataset.role }); });
  $("[data-done]", screen).addEventListener("click", () => { sfx.tap(); document.removeEventListener("keydown", onKey); location.hash = back; if (location.hash === back) route(); });
  setTimeout(() => $("[data-done]", screen)?.focus({ preventScroll: true }), 600);
  const onKey = (e) => { if (e.key === "Enter" && !e.repeat) { document.removeEventListener("keydown", onKey); $("[data-done]", screen)?.click(); } };
  setTimeout(() => document.addEventListener("keydown", onKey), 300);

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

// =================================================================== Me (profile)
let installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; });

function profileHtml() {
  const s = store.get();
  const done = LESSONS.filter((l) => isDone(l.id)).length;
  const words = metItems().length;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
  return `
    <div class="view view-profile">
      <header class="view-hero view-hero--profile">
        ${charImg("owl-celebrating", "view-hero__owl")}
        <div class="view-hero__text">
          <span class="panel-kicker">${icon("user", 16, 2.75)} Me</span>
          <h1 class="h-title" tabindex="-1">Your Spanish so far</h1>
          <p class="view-sub">Every lesson, every word. Your progress stays on this device.</p>
        </div>
      </header>
      <div class="me-stats">
        <div class="pstat pstat--streak ${s.streak ? "" : "is-zero"}">${icon("flame", 28, 2.25)}<span><b>${s.streak}</b><small>day streak</small></span></div>
        <div class="pstat pstat--xp">${icon("zap", 26, 2.25)}<span><b>${s.xp}</b><small>total XP</small></span></div>
        <div class="pstat pstat--words">${icon("book-open", 26, 2.25)}<span><b>${words}</b><small>words met</small></span></div>
      </div>
      <section class="me-card" aria-labelledby="me-unit">
        <h2 class="panel-title" id="me-unit">Unit 1.1 · <span lang="es">${esc(unitsTextbookTitlesEs["1.1"])}</span></h2>
        <div class="me-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${LESSONS.length}" aria-valuenow="${done}" aria-label="${done} of ${LESSONS.length} lessons done"><span style="--p:${done / LESSONS.length}"></span></div>
        <p class="panel-small">${done} of ${LESSONS.length} lessons done${done === LESSONS.length ? ". The whole unit. Brilliant!" : ""}</p>
        <ol class="me-lessons">${LESSONS.map((l) => `<li class="${isDone(l.id) ? "is-done" : ""}">${icon(isDone(l.id) ? "check" : NODE_ICON[l.kind === "learn" ? "lesson" : l.kind], 16, 2.75)}<span>${titleHtml(l)}</span></li>`).join("")}</ol>
      </section>
      <section class="me-card" aria-labelledby="me-file">
        <h2 class="panel-title" id="me-file">Your progress file</h2>
        <p class="panel-small">There are no accounts and nothing is sent anywhere. To keep your progress safe, or move it to another device, download it and load it there.</p>
        <div class="progress-file">
          ${button("Download my progress", { variant: "secondary", block: false, attrs: "data-download", ico: "download" })}
          <label class="press btn btn--secondary progress-file__load"><span class="face">${icon("upload", 22, 2.75)}<span>Load my progress</span></span>
            <input type="file" accept=".txt,.json,text/plain,application/json" data-load class="sr-only"></label>
        </div>
        <div class="load-msg" role="status" aria-live="polite" hidden></div>
      </section>
      <section class="me-card me-card--row">
        ${installPrompt && !standalone ? button("Install Buhísimo", { variant: "primary", block: false, attrs: "data-install", ico: "smartphone" }) : `<p class="panel-small">${icon("smartphone", 16, 2.5)} ${standalone ? "Buhísimo is installed on this device." : "Works offline once it has loaded. To install it, use your browser's “Install app” or “Add to Home Screen”."}</p>`}
        ${button("Settings", { variant: "secondary", block: false, attrs: 'data-act="settings"', ico: "settings" })}
      </section>
    </div>`;
}

function summarise(p, saved) {
  const n = LESSONS.filter((l) => p.completed[l.id]).length;
  const when = saved ? ` (saved ${new Date(saved).toLocaleDateString(undefined, { day: "numeric", month: "short" })})` : "";
  return `This file${when} has ${n} of ${LESSONS.length} lessons done, ${Object.keys(p.items).length} words and ${p.xp} XP.`;
}

function wireProfile(root) {
  const msg = $(".load-msg", root);
  let pending = null;
  $("[data-load]", root).addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const r = readProgressFile(f.size > 2e6 ? "" : await f.text());
    msg.hidden = false;
    if (r.error) {
      pending = null;
      msg.className = "load-msg is-error";
      msg.innerHTML = `${icon("info", 20, 2.5)}<span>${esc(r.error)}</span>`;
      sfx.wrong();
      return;
    }
    pending = r.progress;
    msg.className = "load-msg is-ok";
    msg.innerHTML = `<p>${esc(summarise(r.progress, r.saved))} Replace your progress on this device with it?</p>
      <div class="load-msg__actions">${button("Replace my progress", { attrs: "data-load-yes", block: false })}<button class="btn-text" data-load-no>Cancel</button></div>`;
    sfx.select();
  });
  root.addEventListener("click", async (e) => {
    const t = e.target;
    if (t.closest("[data-download]")) {
      const blob = new Blob([store.progressFileText()], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `buhisimo-progress-${dayKey(new Date())}.txt`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast("Progress downloaded. Keep the file somewhere safe.", "download");
      return;
    }
    if (t.closest("[data-load-no]")) { pending = null; msg.hidden = true; return; }
    if (t.closest("[data-load-yes]") && pending) {
      store.replace(pending);
      pending = null;
      toast("Progress loaded. Welcome back!", "check");
      route.force();
      return;
    }
    if (t.closest("[data-install]") && installPrompt) {
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch { /* dismissed */ }
      installPrompt = null;
      route.force();
    }
  });
}

/** Rebuild the current screen from scratch (after progress changes). */
route.force = () => { app.querySelectorAll(".screen").forEach((n) => n.remove()); activeLesson = null; stopRadio(); route(); };

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
              <span class="font-card__sample" lang="es" style="font-family:'${p.learn}'">${esc(lesson1.specimenEs)}</span>
              <span class="font-card__glyphs" style="font-family:'${p.learn}'">Il1 O0 á é í ó ú ñ ü ¿ ¡</span>
            </span>
          </button>`).join("")}
      </div>
      <p class="modal__section">Practice</p>
      ${row("sfx", "volume-2", "Sound effects", "Little sounds for right and wrong answers", s.sfx)}
      ${row("speak", "mic", "Speaking exercises", !stt.available() ? "Not available in this browser" : speakOn ? "On" : `Off until ${untilLabel(s.speakOffUntil)}`, speakOn && stt.available(), !stt.available())}
      ${row("listen", "headphones", "Listening exercises", listenOn ? "On" : `Off until ${untilLabel(s.listenOffUntil)}`, listenOn)}
      <p class="modal__section" id="voices-label">Voices (test)</p>
      ${voiceRow("maria", "María (Mamá)", lesson1.titleEs)}
      ${voiceRow("buho", "Buhísimo", lesson1.praiseEs[0])}
      ${s.teacher || s.unlockAll ? `<p class="modal__section">For teachers (prototype)</p>
      ${row("unlock", "lock", "Open every lesson", "Students unlock lessons one at a time. Address bar: ?unlock=all / ?unlock=off", s.unlockAll)}
      ${row("robot", "volume-2", "Computer voice for unrecorded lines", "Off: those lines show “Audio coming soon”", s.robotVoice)}` : ""}
      <button class="btn-text settings-reset" data-reset>${icon("rotate-ccw", 18, 2.75)} Reset prototype progress</button>
      <p class="settings-foot">Version ${APP_VERSION}. Recorded voices are Qwen3 test recordings; Raúl (Papá) has one voice.</p>
    </div>`);
  function voiceRow(role, title, sample) {
    const cur = role === "buho" ? s.voiceBuho : s.voiceMaria;
    return `<div class="setting"><span class="setting__icon">${icon(role === "buho" ? "sparkles" : "volume-2", 22, 2.5)}</span>
      <span class="setting__text"><span class="setting__title" id="voice-${role}">${title}</span><span class="setting__sub">Tap a voice to hear it</span></span>
      <span class="voice-pick" role="radiogroup" aria-labelledby="voice-${role}">${VOICE_OPTIONS[role].map((v) => `
        <button class="press font-card voice-pick__opt" role="radio" aria-checked="${cur === v.id}" data-voice="${v.id}" data-role="${role}" data-sample="${esc(sample)}"><span class="face">${esc(v.label)}</span></button>`).join("")}</span></div>`;
  }
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
    const vb = t.closest("[data-voice]");
    if (vb) {
      const role = vb.dataset.role;
      store.set(role === "buho" ? { voiceBuho: vb.dataset.voice } : { voiceMaria: vb.dataset.voice });
      $$(`[data-voice][data-role="${role}"]`, node).forEach((b) => b.setAttribute("aria-checked", String(b === vb)));
      tts.speak(vb.dataset.sample, { role });
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
      if (key === "unlock") { store.set({ unlockAll: on }); if (!location.hash.startsWith("#/lesson")) route.force(); }
      if (key === "robot") store.set({ robotVoice: on });
      return;
    }
    if (t.closest("[data-reset]")) {
      if (confirm("Reset XP, streak, completed lessons and Review for this prototype?")) {
        store.reset();
        m.close();
        toast("Progress reset.", "rotate-ccw");
        if (!location.hash.startsWith("#/lesson") && location.hash !== "#/review/play") route.force();
      }
    }
  });
}

// =================================================================== offline app (service worker)
// Network-first for code, cache-first for audio and pictures (sw.js). A new version
// installs in the background; it takes over straight away unless a lesson is running,
// in which case it waits until the lesson ends, so nobody gets stuck on an old version
// and nobody loses a lesson half-way.
function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) { hadController = true; return; } // first install: nothing to reload
    if (activeLesson) { reloadWhenFree = true; toast("Buhísimo has an update. It loads after this lesson.", "refresh-cw", 3000); }
    else location.reload();
  });
  navigator.serviceWorker.register("sw.js").then((reg) => {
    const offer = (w) => w && navigator.serviceWorker.controller && w.postMessage({ type: "SKIP_WAITING" });
    offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w?.addEventListener("statechange", () => { if (w.state === "installed") offer(w); });
    });
    // Long-open tabs (a Chromebook lid closed for days): check again when the app comes back.
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
  }).catch(() => { /* no offline mode (e.g. private window): the app still works online */ });
}
registerServiceWorker();
window.__app = { version: APP_VERSION };

route();
