// Design-system page: renders live examples from the same CSS and data as the app.
// All Spanish shown here comes from lesson-1-1.js / path-data.js (checked by the validator).
import { lesson } from "../lesson-1-1.js";
import { unitsTextbookTitlesEs } from "../path-data.js";
import { icon } from "./icons.js";
import { $, esc, es, button, footBar, charImg, flagImg, CHAR_ALT } from "./ui.js";
import { sideNav, pathPanel } from "./shell.js";
import { pairings, applyFont, loadPairing } from "./fonts.js";
import { store } from "./store.js";
import { tts } from "./speech.js";
import { sfx } from "./sound.js";

applyFont(store.get().font);
pairings.forEach((p) => loadPairing(p.id));
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// ---------------------------------------------------------------- fonts
function renderFonts() {
  const cur = store.get().font;
  $("#font-switcher").innerHTML = pairings.map((p) => `
    <button class="press font-card ds-font" role="radio" aria-checked="${p.id === cur}" data-font="${p.id}">
      <span class="face">
        <span class="font-card__name" style="font-family:'${p.display}';font-weight:700;font-size:1.375rem">${esc(p.display)} <small>+ ${esc(p.learn)}</small></span>
        <span class="font-card__sample" lang="es" style="font-family:'${p.learn}';font-size:1.5rem">${esc(lesson.specimenEs)}</span>
        <span class="font-card__glyphs" style="font-family:'${p.learn}';font-size:1.25rem;color:var(--ink)">I l 1 | O 0 | á é í ó ú ñ ü ¿ ¡ Á É Í Ó Ú Ñ</span>
        <span class="ds-small">${esc(p.why)}</span>
      </span>
    </button>`).join("");
}
renderFonts();
$("#font-switcher").addEventListener("click", (e) => {
  const b = e.target.closest("[data-font]");
  if (!b) return;
  store.set({ font: b.dataset.font });
  applyFont(b.dataset.font);
  renderFonts();
  sfx.select();
});

// ---------------------------------------------------------------- colour
const SCALES = {
  turquoise: [50, 100, 400, 500, 600, 700],
  magenta: [50, 400, 500, 600, 700],
  mustard: [50, 300, 400, 500, 600],
  emerald: [50, 100, 400, 500, 600, 700],
  terracotta: [50, 100, 400, 500, 600, 700],
};
const NEUTRALS = ["white", "cream", "sand-100", "sand-200", "sand-300", "ink-faint", "ink-soft", "ink", "mustard-ink"];
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const textOn = (hex) => (ratio(hex, "#ffffff") >= 4.5 ? "#ffffff" : css("--ink"));

$("#palette").innerHTML = [...Object.entries(SCALES).map(([name, steps]) => `
  <div class="ds-scale"><span class="ds-scale__name">${name}</span><div class="ds-scale__row">
    ${steps.map((s) => { const v = `--${name}-${s}`, hex = css(v); return `<div class="ds-swatch" style="background:${hex};color:${textOn(hex)}"><b>${s}</b><span>${hex}</span></div>`; }).join("")}
  </div></div>`),
  `<div class="ds-scale"><span class="ds-scale__name">neutrals</span><div class="ds-scale__row">
    ${NEUTRALS.map((n) => { const hex = css(`--${n}`); return `<div class="ds-swatch ds-swatch--n" style="background:${hex};color:${textOn(hex)}"><b>${n}</b><span>${hex}</span></div>`; }).join("")}
  </div></div>`].join("");

const ROLES = [
  ["Page", "--c-bg", "Warm cream, never stark white"],
  ["Surface", "--c-surface", "Cards, options, sheets"],
  ["Primary", "--c-primary", "CHECK, START, audio"],
  ["Correct", "--c-correct", "Right answers (emerald)"],
  ["Not yet", "--c-wrong", "Wrong answers (warm terracotta)"],
  ["Reward", "--mustard-400", "XP, completed nodes, new-word badge"],
  ["Focus", "--c-focus", "Keyboard focus ring (magenta)"],
];
$("#roles").innerHTML = ROLES.map(([n, v, d]) => `<div class="ds-role"><span class="ds-role__dot" style="background:var(${v})"></span><b>${n}</b><code>${v}</code><span class="ds-small">${d}</span></div>`).join("");

const PAIRS = [
  ["--ink", "--cream", "Body text"], ["--ink-soft", "--white", "Secondary text"],
  ["--white", "--turquoise-600", "Primary button"], ["--white", "--emerald-600", "Correct button"],
  ["--white", "--terracotta-600", "Not-yet button"], ["--white", "--magenta-600", "Magenta button"],
  ["--mustard-ink", "--mustard-400", "Mustard label"], ["--emerald-700", "--emerald-50", "Correct sheet"],
  ["--terracotta-700", "--terracotta-50", "Not-yet sheet"], ["--turquoise-700", "--turquoise-50", "Selected option"],
];
$("#contrast").innerHTML = PAIRS.map(([f, b, use]) => {
  const r = ratio(css(f), css(b));
  return `<div class="ds-ctr" style="color:var(${f});background:var(${b})"><b>${r.toFixed(1)}:1</b><span>${use}</span><span class="ds-ctr__ok">${r >= 4.5 ? "AA ✓" : "fail"}</span></div>`;
}).join("");

// ---------------------------------------------------------------- type
const TYPE = [
  ["Celebration", "--fs-3xl", "display", "Lesson complete!"],
  ["New word", "--fs-2xl", "learn-es", lesson.steps.find((s) => s.id === "intro-espana").es],
  ["Spanish prompt", "--fs-xl", "learn-es", lesson.steps[0].es],
  ["Instruction", "--fs-xl", "display", "Tap what you hear"],
  ["Option / tile", "--fs-lg", "learn-es", lesson.examplesEs[0]],
  ["Body", "--fs-md", "learn", "Tap a vowel to add an accent. Tap n to make ñ."],
  ["Secondary", "--fs-sm", "learn", "Speaking exercises are off for 15 minutes."],
  ["Label", "--fs-xs", "label", "Total XP"],
];
$("#typescale").innerHTML = TYPE.map(([name, v, kind, text]) => {
  const px = Math.round(parseFloat(css(v)) * 16);
  const sample = kind === "learn-es" ? es(text) : esc(text);
  const cls = { display: "ds-t-display", "learn-es": "ds-t-learn", learn: "ds-t-body", label: "ds-t-label" }[kind];
  return `<div class="ds-type"><div class="ds-type__meta"><b>${name}</b><span>${px}px · ${v}</span></div><div class="${cls}" style="font-size:var(${v})">${sample}</div></div>`;
}).join("");

// ---------------------------------------------------------------- components
const opt = (k, text, cls = "", pressed = false) => `<button class="press option ${cls}" aria-pressed="${pressed}"><span class="face"><span class="key">${k}</span><span class="label">${esc(text)}</span></span></button>`;
$("#components-demo").innerHTML = `
  <h3 class="ds-h3">Buttons</h3>
  <div class="ds-row">
    ${button("Check", { block: false })}
    ${button("Continue", { variant: "correct", block: false })}
    ${button("Continue", { variant: "wrong", block: false })}
    ${button("Keep learning", { variant: "secondary", block: false })}
    ${button("Start", { variant: "mustard", block: false })}
    ${button("Record", { variant: "magenta", block: false })}
    ${button("Check", { block: false, attrs: "disabled" })}
  </div>
  <div class="ds-row">
    <button class="btn-text">${icon("mic-off", 20, 2.5)} Can't speak now</button>
    <button class="btn-text">${icon("ear-off", 20, 2.5)} Can't listen now</button>
    <button class="btn-text">${icon("sparkles", 18, 2.5)} Show me</button>
  </div>
  <h3 class="ds-h3">Audio and microphone</h3>
  <div class="ds-row ds-row--center" id="audio-demo">
    <button class="press icon-btn icon-btn--primary" data-say aria-label="Play audio"><span class="face">${icon("volume-2", 28)}</span></button>
    <button class="press icon-btn icon-btn--secondary" data-say="slow" aria-label="Play slowly"><span class="face">${icon("turtle", 28)}</span></button>
    <button class="press icon-btn icon-btn--primary icon-btn--sm" data-say aria-label="Play audio"><span class="face">${icon("volume-2", 22)}</span></button>
    <button class="press icon-btn icon-btn--primary listen-big" data-say aria-label="Play audio"><span class="face">${icon("volume-2", 48, 2.5)}</span></button>
    <button class="press icon-btn icon-btn--magenta mic-btn" aria-label="Microphone"><span class="face">${icon("mic", 44, 2.5)}</span></button>
  </div>
  <h3 class="ds-h3">Option cards</h3>
  <div class="ds-grid-2">
    <div class="options">
      ${opt(1, "Where are you from?")}
      ${opt(2, "Where is he from?", "", true)}
    </div>
    <div class="options">
      ${opt(3, "Where are you from?", "is-correct")}
      ${opt(4, "I'm from Australia.", "is-wrong")}
    </div>
  </div>
  <h3 class="ds-h3">Word tiles</h3>
  <div class="ds-card">
    <div class="answer-lines" style="min-height:64px" lang="es">${lesson.steps.find((s) => s.type === "tiles").answerEs.map((w) => `<button class="press tile"><span class="face">${esc(w)}</span></button>`).join("")}</div>
    <div class="bank" lang="es">
      ${lesson.steps.find((s) => s.type === "tiles").tilesEs.map((w) => lesson.steps.find((s) => s.type === "tiles").answerEs.includes(w) ? `<span class="tile-slot"><button class="press tile is-ghost"><span class="face">${esc(w)}</span></button></span>` : `<span class="tile-slot"><button class="press tile"><span class="face">${esc(w)}</span></button></span>`).join("")}
    </div>
  </div>
  <h3 class="ds-h3">Typing with the accent bar, and the accent fix-up</h3>
  <div class="ds-grid-2">
    <div class="ds-card">
      <div class="type-field"><input class="type-input" lang="es" value="${esc(fold(lesson.steps.find((s) => s.id === "type-espana").answerEs))}" aria-label="Example answer" readonly></div>
      <div class="accent-bar" style="margin-top:12px">${["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"].map((k) => `<button class="press accent-key ${"¿¡".includes(k) ? "accent-key--wide" : ""}"><span class="face">${k}</span></button>`).join("")}</div>
      <p class="ds-small" style="margin:8px 0 0">¿ and ¡ join the bar from 700px wide.</p>
    </div>
    <div class="ds-card">
      <div class="fix-letters" lang="es">${[...lesson.steps.find((s) => s.id === "type-espana").answerEs.toLowerCase()].map((c) => `<button class="press fix-letter ${c === "ñ" ? "is-changed" : ""}"><span class="face">${c}</span></button>`).join("")}</div>
      <p class="fix-help" style="margin-top:12px">${icon("lightbulb", 18, 2.5)}<span>Tapped letters turn turquoise. When the word is right, they all turn green.</span></p>
    </div>
  </div>
  <h3 class="ds-h3">Progress, XP and streak</h3>
  <div class="ds-card">
    <div class="ds-row ds-row--center">
      <button class="bar-btn" aria-label="Close">${icon("x", 28, 3)}</button>
      <div class="progress" id="demo-progress"><div class="progress__fill" style="--p:0.35"></div></div>
      <button class="bar-btn" aria-label="Settings">${icon("sliders-horizontal", 26, 2.5)}</button>
    </div>
    <div class="ds-row ds-row--center" style="margin-top:12px">
      <span class="chip chip--streak">${icon("flame", 24, 2.25)}<span>3</span></span>
      <span class="chip chip--xp">${icon("zap", 22, 2.25)}<span>120</span></span>
      <span class="chip chip--streak is-zero">${icon("flame", 24, 2.25)}<span>0</span></span>
      <span class="badge">${icon("sparkles", 16, 2.75)} New word</span>
      <span class="combo is-on" style="position:static">${icon("flame", 16, 2.5)}<span>3 in a row</span></span>
      <button class="press btn btn--secondary" id="demo-advance"><span class="face">Fill it</span></button>
    </div>
  </div>
  <h3 class="ds-h3">Speech bubble and hint</h3>
  <div class="ds-grid-2">
    <div class="speaker-row">${charImg("matilda")}<div class="bubble"><button class="press icon-btn icon-btn--primary icon-btn--sm" aria-label="Play audio"><span class="face">${icon("volume-2", 22)}</span></button>${es(lesson.steps[1].es)}</div></div>
    <div><p class="note">${icon("lightbulb", 20, 2.5)}<span>Buhísimo loves the letter ñ! It sounds like the “ny” in canyon.</span></p></div>
  </div>
  <h3 class="ds-h3">Settings rows</h3>
  <div class="ds-card">
    <div class="setting"><span class="setting__icon">${icon("mic", 22, 2.5)}</span><span class="setting__text"><span class="setting__title">Speaking exercises</span><span class="setting__sub">On</span></span><button class="switch" role="switch" aria-checked="true" aria-label="Speaking exercises"></button></div>
    <div class="setting"><span class="setting__icon">${icon("headphones", 22, 2.5)}</span><span class="setting__text"><span class="setting__title">Listening exercises</span><span class="setting__sub">Off for 15 minutes</span></span><button class="switch" role="switch" aria-checked="false" aria-label="Listening exercises"></button></div>
  </div>`;

function fold(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, ""); }

let p = 0.35;
$("#demo-advance").addEventListener("click", () => {
  p = p >= 1 ? 0.1 : Math.min(1, p + 0.2);
  $("#demo-progress .progress__fill").style.setProperty("--p", p);
  sfx.tap();
});
document.addEventListener("click", (e) => {
  const sw = e.target.closest(".switch");
  if (sw) sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true"));
  const a = e.target.closest("#audio-demo [data-say]");
  if (a) tts.speak(lesson.specimenEs, { slow: a.dataset.say === "slow" });
});

// ---------------------------------------------------------------- feedback
const sheet = (ok) => `
  <div class="ds-phone-bottom">
    <div class="sheet feedback is-open is-static ${ok ? "" : "is-wrong"}">
      <img class="feedback__owl" alt="" src="assets/${ok ? "owl-celebrating" : "owl-encouraging"}.webp">
      <div class="feedback__head"><span class="feedback__icon">${icon(ok ? "check" : "x", 28, 3.5)}</span>
        <h3 class="feedback__title">${ok ? es(lesson.praiseEs[0]) : "Not quite"}</h3></div>
      <div class="feedback__body">
        ${ok ? "" : `<span class="feedback__tip">${esc(lesson.kindEn[0])}</span><span class="feedback__label">Correct answer:</span>`}
        <span class="feedback__answer">${es(lesson.steps[0].es)}<button class="press icon-btn icon-btn--sm" aria-label="Play"><span class="face">${icon("volume-2", 22)}</span></button></span>
        <span class="feedback__en">${esc(lesson.steps[0].en)}</span>
        ${ok ? "" : `<span class="feedback__later">${icon("rotate-ccw", 16, 2.75)} We'll come back to this one.</span>`}
      </div>
      ${button("Continue", { variant: ok ? "correct" : "wrong" })}
    </div>
  </div>`;
$("#feedback-demo").innerHTML = sheet(true) + sheet(false);

// ---------------------------------------------------------------- path
$("#path-demo").innerHTML = `
  <div class="ds-grid-2">
    <div class="unit unit--turquoise" style="margin:0">
      <div class="unit-banner" style="margin:0"><div class="unit-banner__text"><span class="unit-kicker">Unit 1.1</span><h3 class="unit-title" lang="es">${esc(unitsTextbookTitlesEs["1.1"])}</h3><p class="unit-sub">Countries and where people are from</p></div><button class="unit-guide" aria-label="Guidebook">${icon("book-open", 24, 2.5)}</button></div>
    </div>
    <div class="unit unit--magenta" style="margin:0">
      <div class="unit-banner" style="margin:0"><div class="unit-banner__text"><span class="unit-kicker">Unit 1.2</span><h3 class="unit-title" lang="es">${esc(unitsTextbookTitlesEs["1.2"])}</h3><p class="unit-sub">Greetings and feelings</p></div><button class="unit-guide" aria-label="Guidebook">${icon("book-open", 24, 2.5)}</button></div>
    </div>
  </div>
  <div class="ds-nodes unit--turquoise">
    <figure><div class="node-wrap is-current" style="--x:0px;margin:56px 0 0"><div class="start-bubble">Start</div><button class="press node node--turquoise is-current" aria-label="Current lesson"><span class="face">${icon("star", 34, 3)}</span></button></div><figcaption>Current</figcaption></figure>
    <figure><div class="node-wrap" style="--x:0px"><button class="press node is-done" aria-label="Completed"><span class="face">${icon("check", 34, 3)}</span></button></div><figcaption>Completed</figcaption></figure>
    <figure><div class="node-wrap" style="--x:0px"><button class="press node" aria-label="Story"><span class="face">${icon("book-open", 34, 3)}</span></button></div><figcaption>Story</figcaption></figure>
    <figure class="unit--magenta"><div class="node-wrap" style="--x:0px"><button class="press node" aria-label="Listen"><span class="face">${icon("headphones", 34, 3)}</span></button></div><figcaption>Listen</figcaption></figure>
    <figure class="unit--emerald"><div class="node-wrap" style="--x:0px"><button class="press node" aria-label="Game"><span class="face">${icon("gamepad-2", 34, 3)}</span></button></div><figcaption>Game</figcaption></figure>
    <figure class="unit--terracotta"><div class="node-wrap" style="--x:0px"><button class="press node" aria-label="Unit check"><span class="face">${icon("trophy", 34, 3)}</span></button></div><figcaption>Unit check</figcaption></figure>
  </div>`;

// ---------------------------------------------------------------- characters
const CHARS = ["owl-explaining", "owl-celebrating", "owl-encouraging", "owl-thinking", "matilda", "max", "family"];
const USE = {
  "owl-explaining": "New words, path, brand", "owl-celebrating": "Correct answers, lesson complete",
  "owl-encouraging": "Wrong answers, quit dialog", "owl-thinking": "Accent fix-up", matilda: "Visitor from Melbourne (koala)",
  max: "Visitor from Melbourne (kangaroo)", family: "Host family in Salento (from 1.3)",
};
$("#characters-demo").innerHTML = CHARS.map((c) => `<figure class="ds-char ${c === "family" ? "ds-char--wide" : ""}">${charImg(c, "ds-char__img")}<figcaption><b>${esc(CHAR_ALT[c])}</b><span>${USE[c]}</span></figcaption></figure>`).join("") +
  `<figure class="ds-char"><div class="ds-flags">${["co", "es", "au"].map((f) => flagImg(f, "flag")).join("")}</div><figcaption><b>Flags</b><span>Colombia, Spain, Australia</span></figcaption></figure>`;

// ---------------------------------------------------------------- tokens
const SP = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const R = ["sm", "md", "lg", "xl", "pill"];
const SH = ["sm", "md", "lg", "sheet"];
$("#tokens-demo").innerHTML = `
  <div class="ds-card"><h3 class="ds-h3" style="margin-top:0">Spacing (4px base)</h3>${SP.map((s) => `<div class="ds-space"><code>--sp-${s}</code><span style="width:var(--sp-${s})"></span><small>${css(`--sp-${s}`)}</small></div>`).join("")}</div>
  <div class="ds-card"><h3 class="ds-h3" style="margin-top:0">Radius</h3><div class="ds-row">${R.map((r) => `<div class="ds-radius" style="border-radius:var(--r-${r})"><code>${r}</code><small>${css(`--r-${r}`)}</small></div>`).join("")}</div>
    <h3 class="ds-h3">Shadow</h3><div class="ds-row">${SH.map((s) => `<div class="ds-shadow" style="box-shadow:var(--shadow-${s})"><code>${s}</code></div>`).join("")}</div>
    <h3 class="ds-h3">Motion</h3><p class="ds-small">Fast ${css("--dur-fast")} (press) · medium ${css("--dur-med")} (sheets, toggles) · slow ${css("--dur-slow")} (progress, screens). Only transform and opacity animate. With “reduce motion” switched on, every animation becomes instant and there's no confetti.</p></div>`;

// ---------------------------------------------------------------- desktop shell
const demoState = { xp: 30, streak: 3, completed: { "1.1-1": {} } };
$("#shell-demo").innerHTML = `
  <div class="ds-shell">
    ${sideNav("path").replaceAll('href="#/', 'href="index.html#/')}
    <div class="ds-shell__main">
      <div class="unit unit--turquoise ds-shell__unit">
        <div class="unit-banner"><div class="unit-banner__text"><span class="unit-kicker">Unit 1.1</span><h3 class="unit-title" lang="es">${esc(unitsTextbookTitlesEs["1.1"])}</h3><p class="unit-sub">Countries and where people are from</p></div><button class="unit-guide" aria-label="Guidebook">${icon("book-open", 24, 2.5)}</button></div>
        <div class="node-wrap is-current" style="--x:0px;margin:88px auto 0;width:fit-content"><div class="start-bubble">Start</div><button class="press node is-current" aria-label="Current lesson"><span class="face">${icon("star", 34, 3)}</span></button></div>
      </div>
      <p class="ds-shell__note">Path column (560px) over the Salento scene. Wide screens blur the same art on both sides, so it is never stretched.</p>
    </div>
    ${pathPanel(demoState)}
  </div>
  <div class="ds-grid-2" style="margin-top:16px">
    <p class="ds-small"><b>Sidebar</b> (<code>.side-nav</code>): logo; Path, Review, Radio Búho, Profile, Settings. Only Path works in the prototype; the others show a friendly “Coming soon” card. The current item is outlined like a selected option.</p>
    <p class="ds-small"><b>Right panel</b> (<code>.path-panel</code>): streak and XP, the weekly goal ring, the class catch-up card (placeholder: “Your class is up to 1.4”) and a tip from Buhísimo.</p>
  </div>`;

$("#bar-demo").innerHTML = `
  <div class="lesson ds-bar">
    ${footBar(button("Check", { attrs: "disabled" }), button("Skip", { variant: "secondary", block: false }) + `<button class="btn-text">${icon("ear-off", 20, 2.5)} Can't listen now</button>`)}
  </div>
  <div class="lesson ds-bar" style="margin-top:12px">
    <div class="sheet feedback is-open is-static">
      <img class="feedback__owl" alt="" src="assets/owl-celebrating.webp">
      <div class="feedback__head"><span class="feedback__icon">${icon("check", 28, 3.5)}</span><h3 class="feedback__title">${es(lesson.praiseEs[0])}</h3></div>
      <div class="feedback__body"><span class="feedback__answer">${es(lesson.steps[0].es)}<button class="press icon-btn icon-btn--sm" aria-label="Play"><span class="face">${icon("volume-2", 22)}</span></button></span><span class="feedback__en">${esc(lesson.steps[0].en)}</span></div>
      ${button("Continue", { variant: "correct" })}
    </div>
  </div>`;
