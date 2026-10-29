// End-to-end test for Units 1.1, 1.2 and 1.3 of the prototype (headless Chromium only,
// software rendering, never the GPU, never a visible window).
//
// Setup (outside the repo):  mkdir -p $PW && cd $PW && npm i playwright-core@1.48.2
// Serve:  cd prototype && python3 -m http.server 8765 --bind 127.0.0.1   (another port: BASE=http://127.0.0.1:8780/)
// Run:    NODE_PATH=$PW/node_modules node prototype/tools/e2e-unit.mjs <outDir>
//
// Covers: lesson locks (sequential, URL-proof, ?unlock=all / ?unlock=off), map questions
// (study map with names, questions without, 44px targets for small islands at 390×844), every 1.1 lesson played start to finish (keyboard on the Chromebook size, with
// wrong answers and the retry), "fits 1366×768 without scrolling" for every step, Review
// (spaced repetition + My knowledge), the story, Radio Búho karaoke highlighting, the
// phone tab bar, the progress file, offline mode and the service worker. Section U is Unit 1.2;
// section V is Unit 1.3 (numbers, number songs and their karaoke, Number Invaders, the ID card);
// section W is the «Who is it?» speech-bubble steps (1.1-2 and 1.3, four sizes, keyboard and touch).
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core"); // resolved through NODE_PATH
const OUT = process.argv[2] || "e2e-unit-shots";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || "http://127.0.0.1:8765/"; // e.g. BASE=http://127.0.0.1:8780/
const PROTO = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let OFFLINE = false;
const log = (...a) => console.log(...a);
const ok = (c, msg) => { if (!c) { errors.push("ASSERT: " + msg); log("  ✗", msg); } else log("  ✓", msg); return c; };
const shots = new Set();
// Every recorded clip (the six manifests js/speech.js merges): text -> voices.
const CLIPS = {};
for (const m of ["manifest.json", "manifest-extra.json", "manifest-l2.json", "manifest-max.json", "manifest-matilda.json", "manifest-callers.json"]) {
  try { for (const [t, by] of Object.entries(JSON.parse(readFileSync(join(PROTO, "audio", m), "utf8")).clips)) CLIPS[t] = { ...CLIPS[t], ...by }; } catch { /* optional */ }
}
const hasClip = (t) => !!CLIPS[t];
// "Audio coming soon" badges seen while playing: { where, texts } (texts = the lines the badge could stand for).
const badges = [];
const listenSteps = { audio: 0, readOnly: [], read12: 0 }; // listening steps: real (audio) vs fallen back to read-and-choose
async function collectBadges(page, where, s) {
  const found = await page.evaluate(() => [...document.querySelectorAll(".lesson-body .ex:not(.step-leave) .audio-soon")].map((b) => {
    const line = b.closest(".story-line");
    return line ? line.querySelector(".story-es")?.textContent.trim() : null;
  }));
  for (const lineText of found) {
    const texts = lineText ? [lineText] : ["es", "exampleEs", "promptEs", "sayEs", "fullEs"].map((k) => s[k]).filter((t) => typeof t === "string");
    badges.push({ where: `${where} ${s.id} (${s.type})`, texts });
  }
}
const shot = async (page, name) => { const f = `${OUT}/${name}.png`; await page.screenshot({ path: f }); shots.add(f); };

const MOCK_SPEECH = () => {
  class MockRec {
    start() {
      setTimeout(() => this.onstart && this.onstart(), 60);
      setTimeout(() => { this.onresult && this.onresult({ results: [[{ transcript: window.__heard || "soy de Australia", confidence: 0.9 }]] }); this.onend && this.onend(); }, 500);
    }
    stop() {} abort() {}
  }
  window.SpeechRecognition = MockRec;
  window.webkitSpeechRecognition = MockRec;
};

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--headless=new", "--ozone-platform=headless", "--disable-gpu", "--use-gl=swiftshader", "--autoplay-policy=no-user-gesture-required"],
});

async function newPage(viewport, { touch = false } = {}) {
  const ctx = await browser.newContext({ viewport, hasTouch: touch, acceptDownloads: true });
  await ctx.addInitScript(MOCK_SPEECH);
  const page = await ctx.newPage();
  // A missing file is reported by its URL (below); optional art may be missing (the scene falls back to a character).
  page.on("console", (m) => { if (m.type() === "error" && !/favicon|Failed to load resource: the server responded with a status of 404/.test(m.text()) && !(OFFLINE && /ERR_INTERNET_DISCONNECTED/.test(m.text()))) errors.push(`console.error: ${m.text()} (${m.location()?.url || ""})`); });
  page.on("response", (r) => { if (r.status() === 404 && !/favicon|assets\/cocora-valley\.webp$/.test(r.url())) errors.push(`404: ${r.url()}`); });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message} (${(e.stack || "").split("\n").slice(1, 3).join(" ").trim()})`));
  page.on("requestfailed", (r) => { if (!OFFLINE && !/canvas-confetti|fonts\.g/.test(r.url()) && !/ERR_ABORTED/.test(r.failure()?.errorText || "")) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`); });
  return { ctx, page };
}

const wait = (page, ms) => page.waitForTimeout(ms);
// SECTIONS=A,M runs only those sections (default: all).
const RUN = (k) => !process.env.SECTIONS || process.env.SECTIONS.split(",").includes(k);
const step = (page) => page.evaluate(() => {
  const s = window.__buho?.step();
  const ex = document.querySelector(".lesson-body .ex:not(.step-leave)");
  return { step: s ? JSON.parse(JSON.stringify(s)) : null, mode: window.__buho?.mode(), complete: !!document.querySelector(".screen.complete"), cls: ex ? [...ex.classList].join(" ") : "" };
});
const sheet = (page) => page.evaluate(() => { const s = document.querySelector(".feedback"); return s?.classList.contains("is-open") ? (s.classList.contains("is-wrong") ? "wrong" : "correct") : "closed"; });
const overflow = (page) => page.evaluate(() => { const b = document.querySelector(".lesson-body"); return b ? b.scrollHeight - b.clientHeight : 0; });

/** Press the number key for the option whose test() is true (keyboard play). */
async function pickByKey(page, selector, test, { useKeys = true } = {}) {
  const idx = await page.evaluate(([sel, src]) => {
    const f = new Function("b", `return (${src})(b)`);
    return [...document.querySelectorAll(sel)].findIndex((b) => f(b));
  }, [selector, test.toString()]);
  if (idx < 0) throw new Error(`no option matches in ${selector}`);
  if (useKeys) await page.keyboard.press(String((idx + 1) % 10));
  else if (selector.includes("map-pin")) await page.locator(selector).nth(idx).locator(".map-pin__label").click(); // the pin itself is a 0×0 anchor
  else await page.locator(selector).nth(idx).click();
  return idx;
}

/** Answer the current step. wrong = give a wrong answer if the type allows it. */
async function answer(page, s, { wrong = false, keys = true } = {}) {
  const t = s.type;
  const enter = async () => { if (keys) await page.keyboard.press("Enter"); else await page.click('.lesson-foot [data-act="main"]'); };
  if (["intro", "table", "storyintro", "storyline", "mapstudy", "letters", "clip", "transcript", "numcard", "pattern", "song", "songset"].includes(t)) { await enter(); return "next"; }
  // ---- Unit 1.3
  if (t === "numpick") {
    await pickByKey(page, ".lesson-body .ex-numpick .option", wrong ? `(b) => +b.dataset.oi !== ${s.answer}` : `(b) => +b.dataset.oi === ${s.answer}`, { useKeys: keys });
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "dictation") {
    for (const [k, n] of s.answer.entries()) {
      const sel = `.lesson-body .ex-dictation .dict-input[data-k="${k}"]`;
      const v = String(wrong && k === 0 ? (n + 1) % 32 : n);
      if (keys) { await page.focus(sel); await page.keyboard.type(v); if (v.length < 2 && k < s.answer.length - 1) await page.keyboard.press("Space"); }
      else await page.fill(sel, v);
    }
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "count") {
    for (const n of s.seq) {
      const idx = await page.evaluate((n) => [...document.querySelectorAll(".lesson-body .ex-count .count-tile")].findIndex((b) => +b.dataset.n === n), n);
      if (keys && idx < 9) await page.keyboard.press(String(idx + 1));
      else await page.locator(".lesson-body .ex-count .count-tile").nth(idx).click();
      await wait(page, 260);
    }
    await wait(page, 1200); return "graded";
  }
  if (t === "invaders") {
    for (let g = 0; g < 40; g++) {
      const a = await page.evaluate(() => document.querySelector(".lesson-body .ex-invaders")?.dataset.answer);
      if (a == null) break;
      const round = await page.evaluate(() => document.querySelector(".lesson-body .ex-invaders")?.dataset.round);
      const lane = await page.evaluate((a) => [...document.querySelectorAll(".lesson-body .inv-lane")].findIndex((l) => l.querySelector(`.inv-ship[data-n="${a}"]`)), a);
      if (keys) { // Left/Right move the cannon, Space fires
        const at = +(await page.getAttribute(".lesson-body .inv-cannon", "data-lane"));
        for (let k = at; k !== lane; k += lane > at ? 1 : -1) await page.keyboard.press(lane > at ? "ArrowRight" : "ArrowLeft");
        await page.keyboard.press("Space");
      } else await page.locator(`.lesson-body .inv-ship[data-n="${a}"]`).click({ force: true }); // the invaders never stop marching: no "stable" wait
      // Wait for the hit to clear the wave (the next round, or the end).
      await page.waitForFunction((r) => { const n = document.querySelector(".lesson-body .ex-invaders"); return !n || n.dataset.answer == null || n.dataset.round !== r; }, round, { timeout: 5000 }).catch(() => {});
      await wait(page, 150);
    }
    await wait(page, 700); return "graded";
  }
  if (t === "idcard" && s.mode === "read") {
    await pickByKey(page, ".lesson-body .ex-idcard .option", wrong ? `(b) => +b.dataset.oi !== ${s.answer}` : `(b) => +b.dataset.oi === ${s.answer}`, { useKeys: keys });
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "idcard") {
    let first = true;
    for (const [c, card] of s.cards.entries()) for (const [k, f] of card.fields.entries()) {
      const bad = wrong && first;
      first = false;
      if (f.kind === "chips") {
        const o = bad ? f.optionsEs.findIndex((x) => x !== f.valueEs) : f.optionsEs.indexOf(f.valueEs);
        await page.click(`.lesson-body .id-chip[data-c="${c}"][data-f="${k}"][data-o="${o}"]`);
      } else await page.fill(`.lesson-body .id-input[data-c="${c}"][data-f="${k}"]`, bad ? "no sé" : String(f.kind === "digits" ? f.value : f.valueEs));
      await wait(page, 100);
    }
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "letterpick") {
    await pickByKey(page, ".lesson-body .ex-letterpick .option", wrong ? `(b) => +b.dataset.oi !== ${s.answer}` : `(b) => +b.dataset.oi === ${s.answer}`, { useKeys: keys });
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "radio") {
    for (const [k, r] of s.rows.entries()) {
      if (s.mode === "faces") {
        const f = wrong && k === 0 ? s.options.find((o) => o !== r.answer) : r.answer;
        if (keys) await page.keyboard.press(String(s.options.indexOf(f) + 1));
        else await page.click(`.lesson-body .ex-radio .face-pick[data-row="${k}"][data-face="${f}"]`);
      } else await page.fill(`.lesson-body .ex-radio .radio-input[data-row="${k}"]`, wrong && k === 0 ? "no sé" : r.answerEs);
      await wait(page, 150);
    }
    await enter(); return "graded";
  }
  if (t === "pick" || t === "listen" || t === "choose") {
    const want = s.answer;
    await pickByKey(page, ".lesson-body .ex:not(.step-leave) .option", wrong ? `(b) => +b.dataset.oi !== ${want}` : `(b) => +b.dataset.oi === ${want}`, { useKeys: keys });
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "gap") {
    const blank = s.blank.toLowerCase();
    const want = s.optionsEs.findIndex((o) => o.toLowerCase() === blank);
    await pickByKey(page, ".lesson-body .ex-gap .option", wrong ? `(b) => +b.dataset.oi !== ${want}` : `(b) => +b.dataset.oi === ${want}`, { useKeys: keys });
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "maptap") {
    await pickByKey(page, ".lesson-body .ex-maptap .map-mark", wrong ? `(b) => b.dataset.place !== ${JSON.stringify(s.target)}` : `(b) => b.dataset.place === ${JSON.stringify(s.target)}`, { useKeys: keys });
    await wait(page, 150); await enter(); return "graded";
  }
  if (t === "tiles") {
    const words = wrong ? [...s.answerEs].reverse() : s.answerEs;
    for (const w of words) {
      const idx = await page.evaluate((w) => [...document.querySelectorAll(".lesson-body .ex-tiles .bank .tile")].findIndex((b) => !b.classList.contains("is-ghost") && b.textContent.trim() === w), w);
      if (idx < 0) throw new Error(`tile "${w}" not found`);
      if (keys && idx < 9) await page.keyboard.press(String(idx + 1));
      else await page.locator(".lesson-body .ex-tiles .bank .tile").nth(idx).click();
      await wait(page, 300);
    }
    await enter(); return "graded";
  }
  if (t === "type" || t === "passport" || t === "spell" || t === "numtype") {
    const text = wrong ? "no sé" : s.answerEs;
    await page.fill(".lesson-body .type-input", text);
    await wait(page, 100); await enter(); return "graded";
  }
  if (t === "match") {
    const exact = (t) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);
    for (const p of s.pairs) {
      await page.locator('.ex-match .match-card[data-side="es"]').filter({ hasText: exact(p.es) }).first().click();
      await wait(page, 120);
      await page.locator('.ex-match .match-card[data-side="en"]').filter({ hasText: exact(p.en) }).first().click();
      await wait(page, 520);
    }
    await wait(page, 500); return "graded";
  }
  if (t === "sort") {
    for (let k = 0; k < s.cards.length; k++) {
      const text = await page.locator(".sort-card .sort-card__es").innerText();
      const card = s.cards.find((c) => c.es === text);
      if (wrong && k === 0) { await page.keyboard.press(String(((card.bucket + 1) % (s.bucketsEs || s.bucketsEn).length) + 1)); await wait(page, 600); }
      await page.keyboard.press(String(card.bucket + 1));
      await wait(page, 380);
    }
    await wait(page, 500); return "graded";
  }
  if (t === "speak") {
    await page.evaluate((es) => { window.__heard = es; }, s.es);
    await page.click(".lesson-body .ex-speak .mic-btn");
    await wait(page, 1000); return "graded";
  }
  throw new Error(`unknown step type ${t}`);
}

/** Screenshot name suffix for the Unit 1.3 variants of a step type (one picture of each). */
function variant13(s) {
  if (s.type === "intro") return s.digit != null ? "-digit" : s.idcard ? "-card" : "";
  if (s.type === "song") return `${s.numerals ? "-digits" : "-words"}${["numeros_dos_doce_veintidos"].includes(s.song) ? "-soon" : s.linesEs.length > 4 ? "-long" : ""}`;
  if (s.type === "count") return s.seq[1] < s.seq[0] ? "-down" : "-up";
  if (s.type === "numcard") return s.study ? "-study" : s.nums.length > 2 ? "" : "-pair";
  if (s.type === "dictation") return s.answer.length > 6 ? "-long" : "";
  if (s.type === "idcard") return s.mode === "read" ? "-read" : s.cards.length > 1 ? "-radio3" : s.episode ? "-radio" : s.cards[0].fields.some((f) => f.kind === "text") ? "-typed" : "-chips";
  if (s.type === "choose" && s.optionsArt) return "-people";
  if (s.type === "storyline") return `-${s.line}`;
  return "";
}

/** Play the lesson that is on screen to the end. Returns stats. */
async function playLesson(page, tag, { keys = true, wrongOnce = true, checkFit = false, shotTypes = new Set(), shotPrefix = "" } = {}) {
  const seen = {};
  let wrongDone = !wrongOnce, guard = 0, retried = false, wrongId = null, fitIssues = [];
  const underBar = [];
  while (guard++ < 80) {
    await wait(page, 450);
    const st = await step(page);
    if (st.complete) break;
    if (!st.step) { await wait(page, 500); continue; }
    const s = st.step;
    seen[s.type] = (seen[s.type] || 0) + 1;
    await collectBadges(page, tag, s);
    // 1.1 lines are recorded: listening must be real. 1.2 and 1.3 aren't recorded yet: read-and-choose is expected.
    const later = /1\.[23]/.test(tag);
    if (s.type === "listen" && !later) { if (/\bex-listen\b/.test(st.cls)) listenSteps.audio++; else listenSteps.readOnly.push(`${tag} ${s.id}`); }
    if (s.type === "listen" && later) listenSteps.read12++;
    if (checkFit) { const o = await overflow(page); if (o > 1) fitIssues.push(`${s.id} (${s.type}) +${o}px`); }
    const shotName = `${shotPrefix}${s.type}${s.lines ? "-order" : ""}${s.time ? "-scene" : ""}${s.face ? "-face" : ""}${s.optionsFace ? "-faces" : ""}${s.type === "radio" ? `-${s.mode}` : ""}${variant13(s)}`;
    if (shotTypes.has(s.type) && !shots.has(`${OUT}/${shotName}.png`)) await shot(page, shotName);
    if (s.retry && s.id === wrongId) retried = true;
    const canWrong = ["pick", "choose", "gap", "maptap", "tiles", "type", "listen", "letterpick", "spell", "radio", "numpick", "numtype", "dictation", "idcard"].includes(s.type) && !s.retry;
    const doWrong = !wrongDone && canWrong;
    const res = await answer(page, s, { wrong: doWrong, keys });
    if (res === "graded") {
      await wait(page, 700);
      let sh = await sheet(page);
      if (sh === "closed" && (await page.locator(".ex-fixup").count())) { // accent fix-up: "Show me"
        await page.click("[data-show], [data-act='show']").catch(() => {});
        await wait(page, 2200);
        sh = await sheet(page);
      }
      if (doWrong) { ok(sh === "wrong", `${tag}: a wrong answer shows the kind "not yet" sheet (${s.type})`); wrongDone = true; wrongId = s.id; }
      else if (sh !== "correct") errors.push(`${tag}: step ${s.id} (${s.type}) expected correct, got ${sh}`);
      // Nothing may show under or behind the open feedback bar: no text of the step (or a leaving
      // step, a flying tile, a toast) inside the bar's area or below it.
      if (checkFit) {
        const under = await page.evaluate(() => {
          const bar = document.querySelector(".feedback.is-open");
          if (!bar) return [];
          const top = bar.getBoundingClientRect().top + 1;
          return [...document.querySelectorAll("#app *")].filter((e) => {
            if (e.closest(".feedback, .lesson-foot") || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
            const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
            return r.width > 0 && r.height > 0 && r.bottom > top && r.top < innerHeight + 40 && cs.visibility !== "hidden" && +cs.opacity > 0.05;
          }).map((e) => `«${e.textContent.trim().slice(0, 30)}» (${e.className || e.tagName})`);
        });
        if (under.length) underBar.push(`${s.id}: ${under.join(", ")}`);
      }
      const fb = `${shotPrefix}${s.type}${variant13(s)}-feedback${doWrong ? "-wrong" : ""}`;
      if (shotTypes.has(`${s.type}:feedback`) && !shots.has(`${OUT}/${fb}.png`)) await shot(page, fb);
      if (keys) await page.keyboard.press("Enter"); else await page.click('.feedback [data-act="continue"]');
    }
  }
  const complete = (await step(page)).complete;
  return { seen, complete, retried: wrongOnce ? retried : true, fitIssues, underBar };
}

const LESSON_IDS = Array.from({ length: 11 }, (_, i) => `1.1-${i + 1}`);

// ===================================================================== A. desktop 1366×768: the whole unit
log("A. Chromebook 1366×768: every 1.1 lesson in order, keyboard play");
if (RUN("A")) {
  const { ctx, page } = await newPage({ width: 1366, height: 768 });
  await page.goto(BASE + "index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await wait(page, 1500);
  ok(await page.locator('.node[data-unit="1.1"]').count() === 11, "the 1.1 path has 11 nodes");
  ok(await page.locator(".node.is-current").count() === 1, "one current node");
  ok(await page.locator(".tab-bar").isHidden(), "no tab bar on the Chromebook layout (sidebar instead)");
  await shot(page, "d01-path-start");
  await page.click('.node[data-node="1.1-3"]');
  await wait(page, 400);
  ok(/locked/i.test(await page.locator(".node-pop").innerText()), "a later lesson is locked until the one before is done");
  await page.keyboard.press("Escape");

  const shotTypes = new Set(["intro", "table", "choose", "gap", "sort", "maptap", "mapstudy", "storyintro", "storyline", "tiles", "passport", "match", "type", "speak", "pick", "listen", "maptap:feedback", "gap:feedback"]);
  for (const [i, id] of LESSON_IDS.entries()) {
    await page.goto(BASE + "index.html#/");
    await wait(page, 900);
    const node = page.locator(`.node[data-node="${id}"]`);
    ok(await node.evaluate((n) => n.classList.contains("is-current")), `${id} is the current node`);
    await node.focus();
    await page.keyboard.press("Enter");
    await wait(page, 400);
    await page.keyboard.press("Enter"); // START (focused in the popover)
    await wait(page, 1300);
    const r = await playLesson(page, id, { keys: true, wrongOnce: i !== 9, checkFit: true, shotTypes, shotPrefix: "d-" });
    ok(r.complete, `${id} played to the end (${Object.entries(r.seen).map(([k, v]) => `${k}×${v}`).join(", ")})`);
    ok(r.retried, `${id}: the missed question came back later`);
    ok(r.fitIssues.length === 0, `${id}: every step fits 1366×768 without scrolling${r.fitIssues.length ? ": " + r.fitIssues.join("; ") : ""}`);
    await wait(page, 700);
    if (i === 0 || id === "1.1-9" || id === "1.1-11") await shot(page, `d-complete-${id}`);
    await page.keyboard.press("Enter");
    await wait(page, 1200);
    ok(await page.locator(`.node[data-node="${id}"].is-done`).count() === 1, `${id} shows as done on the path`);
  }
  await shot(page, "d02-path-all-done");
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")));
  ok(Object.keys(prog.completed).length === 11, "progress saved: 11 lessons completed");
  ok(Object.keys(prog.items).length >= 30, `Review knows ${Object.keys(prog.items).length} items`);

  // ------------------------------------------------------------------- Review
  log("A2. Review (spaced repetition)");
  // Make a few items due (as if days had passed) and one weak.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("buhisimo.prototype.v1"));
    for (const id of ["el-pais", "hispanohablante", "la-capital", "eres"]) s.items[id] = { ...s.items[id], due: Date.now() - 864e5, box: 1, wrong: 1 };
    localStorage.setItem("buhisimo.prototype.v1", JSON.stringify(s));
  });
  await page.goto(BASE + "index.html#/review");
  await page.reload();
  await wait(page, 1200);
  ok((await page.locator(".view-review .h-title").innerText()).includes("to refresh"), "Review says how many words are due");
  ok(await page.locator(".kb-item:not(.is-locked)").count() >= 30, "My knowledge lists every word met");
  ok(await page.locator('.side-item--review .tab__badge').count() === 1, "the sidebar Review item shows a due badge");
  await shot(page, "d03-review");
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")).items["el-pais"]);
  await page.click("[data-start-review]");
  await wait(page, 1300);
  const rr = await playLesson(page, "review", { keys: true, wrongOnce: true, checkFit: true, shotTypes: new Set(["pick", "choose", "type", "match"]), shotPrefix: "d-review-" });
  ok(rr.complete, `review session played to the end (${Object.entries(rr.seen).map(([k, v]) => `${k}×${v}`).join(", ")})`);
  ok(rr.fitIssues.length === 0, `review steps fit 1366×768${rr.fitIssues.length ? ": " + rr.fitIssues.join("; ") : ""}`);
  ok((await page.locator(".complete-title").innerText()).includes("Review"), "“Review done!” screen");
  await shot(page, "d04-review-done");
  // The complete screen ignores Enter for its first 300 ms (a held key can't race past it) and focuses
  // Continue at 600 ms: press Enter once it has focus, as a student would.
  await page.waitForFunction(() => document.activeElement?.matches("[data-done]"), null, { timeout: 5000 }).catch(() => {});
  await page.keyboard.press("Enter");
  await wait(page, 1000);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")));
  ok(after.items["el-pais"].seen >= before.seen, "items are re-scheduled after review");
  ok(await page.evaluate(() => location.hash) === "#/review", "Continue goes back to Review");

  // ------------------------------------------------------------------- Radio Búho
  log("A3. Radio Búho karaoke");
  await page.goto(BASE + "index.html#/radio");
  await wait(page, 1500);
  ok(await page.locator(".radio-demo").count() === 1, "the demo episode is labelled as a demo");
  ok(await page.locator(".k-line").count() === 10, "the transcript shows 10 lines");
  const ep = JSON.parse(readFileSync(join(PROTO, "radio/demo-1-1.json"), "utf8"));
  await page.waitForFunction(() => window.__radio && window.__radio.audio.readyState >= 1, null, { timeout: 8000 }).catch(() => {});
  for (const [li, wi] of [[3, 3], [7, 0], [8, 3]]) {
    const w = ep.lines[li].words[wi];
    await page.evaluate((t) => { window.__radio.audio.currentTime = t; window.__radio.render(); }, (w.start + w.end) / 2);
    await wait(page, 250);
    const now = await page.evaluate(() => window.__radio.now());
    ok(now.line === li && now.word[0] === w.word, `seek to ${((w.start + w.end) / 2).toFixed(2)} s highlights line ${li + 1}, word “${w.word}” (got line ${now.line + 1}, ${JSON.stringify(now.word)})`);
  }
  await page.evaluate((t) => { window.__radio.audio.currentTime = t; }, ep.lines[3].start + 0.1);
  await page.click('[data-radio="play"]');
  await wait(page, 1600);
  const playing = await page.evaluate(() => ({ t: window.__radio.audio.currentTime, paused: window.__radio.audio.paused, now: window.__radio.now() }));
  ok(!playing.paused && playing.t > ep.lines[3].start + 0.6, `audio plays (t = ${playing.t.toFixed(2)} s)`);
  ok(playing.now.line >= 3, `the highlight follows playback (line ${playing.now.line + 1})`);
  await shot(page, "d05-radio-playing");
  await page.keyboard.press("Space");
  await wait(page, 300);
  ok(await page.evaluate(() => window.__radio.audio.paused), "Space pauses");
  await page.click(".k-line[data-line='6'] .k-w[data-w='0']");
  await wait(page, 300);
  ok((await page.evaluate(() => window.__radio.now())).line === 6, "tapping a word jumps there");
  await page.keyboard.press("Space");

  // ------------------------------------------------------------------- Me + progress file
  log("A4. Me: progress file download and load");
  await page.goto(BASE + "index.html#/profile");
  await wait(page, 900);
  await shot(page, "d06-me");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("[data-download]")]);
  const file = join(OUT, "progress.txt");
  await dl.saveAs(file);
  const txt = readFileSync(file, "utf8");
  ok(txt.startsWith("Buhísimo: progress file") && dl.suggestedFilename().startsWith("buhisimo-progress-") && dl.suggestedFilename().endsWith(".txt"), `progress downloads as ${dl.suggestedFilename()}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await wait(page, 900);
  await page.setInputFiles("[data-load]", file);
  await wait(page, 400);
  ok(/11 of \d+ lessons/.test(await page.locator(".load-msg").innerText()), "loading the file summarises it");
  await page.click("[data-load-yes]");
  await wait(page, 900);
  ok(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("buhisimo.prototype.v1")).completed).length) === 11, "progress restored from the file");

  // ------------------------------------------------------------------- service worker + offline
  log("A5. Offline app (service worker)");
  await page.goto(BASE + "index.html");
  const sw = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    await new Promise((r) => setTimeout(r, 1500));
    return { state: reg.active?.state, scope: reg.scope, caches: await caches.keys() };
  });
  const swVersion = readFileSync(join(PROTO, "sw.js"), "utf8").match(/const VERSION = "([^"]+)"/)[1];
  const appVersion = readFileSync(join(PROTO, "js/app.js"), "utf8").match(/APP_VERSION = "([^"]+)"/)[1];
  ok(sw.state === "activated", `service worker registered and active (scope ${sw.scope})`);
  ok(sw.caches.includes(`buhisimo-shell-${swVersion}`) && sw.caches.includes(`buhisimo-media-${swVersion}`), `versioned caches: ${sw.caches.join(", ")}`);
  ok(swVersion === appVersion, `sw.js VERSION matches APP_VERSION (${swVersion})`);
  const cached = await page.evaluate(async (v) => { const c = await caches.open(`buhisimo-media-${v}`); return (await c.keys()).filter((r) => r.url.endsWith(".mp3")).length; }, swVersion);
  ok(cached >= 50, `${cached} audio files cached for offline`);
  await page.reload();
  await wait(page, 800);
  ok(await page.evaluate(() => !!navigator.serviceWorker.controller), "the page is controlled by the service worker after reload");
  OFFLINE = true;
  await ctx.setOffline(true);
  await page.goto(BASE + "index.html#/lesson/1.1-2");
  await wait(page, 1800);
  ok(await page.locator(".screen.lesson").count() === 1, "offline: a lesson still opens");
  await page.goto(BASE + "index.html#/radio");
  await wait(page, 1500);
  ok(await page.locator(".k-line").count() === 10, "offline: Radio Búho still loads");
  await ctx.setOffline(false);
  OFFLINE = false;
  await ctx.close();
}

// ===================================================================== B. story details + tap to hear
log("B. Story lesson details (1366×768)");
if (RUN("B")) {
  const { ctx, page } = await newPage({ width: 1366, height: 768 });
  // Record what is spoken: recorded clips (HTMLMediaElement.play) and the computer voice.
  await page.addInitScript(() => {
    window.__spoken = []; window.__played = 0;
    const s = window.speechSynthesis; if (s) s.speak = (u) => { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 50); };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { if (this.src.startsWith("blob:")) window.__played++; return play.call(this); };
  });
  await page.goto(BASE + "index.html");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ unlockAll: true, robotVoice: false })); });
  await page.goto(BASE + "index.html?unlock=all#/lesson/1.1-9"); // a full load, so the stored unlockAll is read
  await page.reload();
  await wait(page, 1500);
  ok(await page.locator(".story-cover").count() === 1, "the story opens with its cover (plaza, cast)");
  await page.keyboard.press("Enter");
  let maxPanels = 0, checks = 0;
  for (let g = 0; g < 40; g++) {
    await wait(page, 500);
    const st = await step(page);
    if (st.complete) break;
    const s = st.step;
    await collectBadges(page, "story", s);
    if (s.type === "storyline") {
      maxPanels = Math.max(maxPanels, await page.locator(".story-line").count());
      if (s.line === 6) {
        await shot(page, "d07-story-line");
        await page.click(".story-line.is-new .story-en-btn");
        await wait(page, 200);
        ok(await page.locator(".story-line.is-new .story-en").isVisible(), "EN shows the line's English");
        const line7 = "¿Cocora? ¿Es Perú? ¿Es Cuba? ¿Es Chile?";
        ok(hasClip(line7) && await page.locator(".story-line.is-new [data-say-line]").count() === 1, "story line 7 has a recording and a play button");
        await wait(page, 1500); // let the automatic play finish
        const n0 = await page.evaluate(() => window.__played);
        await page.click(".story-line.is-new .story-es");
        await wait(page, 600);
        ok(await page.evaluate((n) => window.__played > n, n0), "tapping a line plays its recording");
        const n1 = await page.evaluate(() => window.__played);
        await page.click(".story-line.is-new [data-say-line]");
        await wait(page, 600);
        ok(await page.evaluate((n) => window.__played > n, n1), "the line's play button plays its recording");
        ok((await page.evaluate(() => window.__spoken)).length === 0, "no computer voice in the story");
        await shot(page, "d08-story-en");
        await page.evaluate(() => document.activeElement?.blur());
      }
    }
    if (s.type === "choose" && s.story) checks++;
    if (s.type === "tiles" && s.lines) await shot(page, "d09-story-order");
    const res = await answer(page, s);
    if (res === "graded") { await wait(page, 700); ok(await sheet(page) === "correct", `story ${s.type} answered`); await page.keyboard.press("Enter"); }
  }
  ok(maxPanels > 0 && maxPanels <= 3, `story shows at most 3 panels at a time (no scrolling): ${maxPanels}`);
  ok(checks === 2, "two comprehension questions plus the ordering task");
  ok((await step(page)).complete, "the story plays to the end");
  await ctx.close();
}

// ===================================================================== C. phone 390×844
log("C. Phone 390×844: tab bar, lessons with touch, views");
if (RUN("C")) {
  const { ctx, page } = await newPage({ width: 390, height: 844 }, { touch: true });
  await page.goto(BASE + "index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await wait(page, 1300);
  ok(await page.locator(".tab-bar").isVisible(), "phone: the bottom tab bar is visible");
  ok((await page.locator(".tab-bar .tab").allInnerTexts()).map((t) => t.trim().toUpperCase()).join("|") === "LEARN|REVIEW|RADIO|ME", "tabs: Learn / Review / Radio / Me");
  await shot(page, "p01-path");
  for (const [tab, view] of [["review", "review"], ["radio", "radio"], ["profile", "profile"], ["path", "path"]]) {
    await page.click(`.tab-bar [data-view="${tab}"]`);
    await wait(page, 900);
    ok(await page.evaluate((v) => document.querySelector(".screen.path").dataset.view === v, view) && (await page.locator(`.tab-bar [data-view="${tab}"][aria-current="page"]`).count()) === 1, `tab ${tab} opens the ${view} view`);
    if (tab !== "path") await shot(page, `p0${["review", "radio", "profile"].indexOf(tab) + 2}-${tab}`);
  }
  const hscroll = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
  ok(hscroll <= 0, "phone: no horizontal scrolling");
  // Play lessons 2, 3, 7–11 by touch (islands and Map tap included; unlocked via the teacher switch)
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("buhisimo.prototype.v1") || "{}"); s.unlockAll = true; localStorage.setItem("buhisimo.prototype.v1", JSON.stringify(s)); });
  await page.reload(); // locked lessons can't be opened by URL, so the app must read unlockAll first
  await wait(page, 900);
  const pshots = new Set(["intro", "maptap", "mapstudy", "gap", "sort", "table", "storyline", "passport", "choose", "tiles", "maptap:feedback"]);
  for (const id of ["1.1-2", "1.1-3", "1.1-7", "1.1-8", "1.1-9", "1.1-10", "1.1-11"]) {
    await page.goto(BASE + `index.html#/lesson/${id}`);
    await wait(page, 1300);
    const r = await playLesson(page, `phone ${id}`, { keys: false, wrongOnce: false, shotTypes: pshots, shotPrefix: "p-" });
    ok(r.complete, `phone: ${id} played by touch (${Object.keys(r.seen).join(", ")})`);
    const hs = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
    ok(hs <= 0, `phone: ${id} has no horizontal scrolling`);
    await page.click("[data-done]");
    await wait(page, 900);
  }
  await shot(page, "p06-path-progress");
  await ctx.close();
}

// ===================================================================== D. tablet 820×1180: tab bar too
log("D. Tablet 820×1180");
if (RUN("D")) {
  const { ctx, page } = await newPage({ width: 820, height: 1180 }, { touch: true });
  await page.goto(BASE + "index.html#/radio");
  await wait(page, 1300);
  ok(await page.locator(".tab-bar").isVisible(), "tablet: tab bar visible");
  await ctx.close();
}

// ===================================================================== L. lessons lock one after the other
log("L. Locks: sequential unlocking, no way round it by URL, the teacher override");
if (RUN("L")) for (const vp of [{ width: 1366, height: 768, tag: "d" }, { width: 390, height: 844, tag: "m" }]) {
  const { ctx, page } = await newPage({ width: vp.width, height: vp.height }, { touch: vp.tag === "m" });
  await page.goto(BASE + "index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await wait(page, 1300);
  const lockedIds = await page.$$eval('.node[data-unit="1.1"].is-locked', (ns) => ns.map((n) => n.dataset.node));
  ok(lockedIds.length === 10 && !lockedIds.includes("1.1-1"), `${vp.tag}: fresh start: lesson 1 open, the other 10 locked (${lockedIds.length})`);
  ok(await page.locator('.node[data-unit="1.1"] .node-lock').count() === 10, `${vp.tag}: every locked lesson shows a padlock`);
  ok(/locked/.test(await page.locator('.node[data-node="1.1-2"]').getAttribute("aria-label")), `${vp.tag}: the locked state is in the node's label`);
  await page.evaluate(() => document.querySelector('.node[data-node="1.1-4"]').scrollIntoView({ block: "center" }));
  await wait(page, 300);
  await shot(page, `${vp.tag}-lock-path`);
  await page.click('.node[data-node="1.1-4"]');
  await wait(page, 400);
  ok(await page.locator(".node-pop button:disabled").count() === 1, `${vp.tag}: a locked lesson's popover has no Start button`);
  await shot(page, `${vp.tag}-lock-popover`);
  // the address bar can't open a locked lesson
  await page.goto(BASE + "index.html#/lesson/1.1-7");
  await wait(page, 1200);
  ok(await page.locator(".screen.lesson").count() === 0 && await page.evaluate(() => location.hash === "#/"), `${vp.tag}: #/lesson/1.1-7 while locked goes back to the path`);
  ok(/locked/i.test(await page.locator(".toast").last().innerText().catch(() => "")), `${vp.tag}: and says the lesson is locked`);
  await shot(page, `${vp.tag}-lock-url-refused`);
  // finishing lesson 1 opens lesson 2 only
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("buhisimo.prototype.v1") || "{}"); s.completed = s.completed || {}; s.completed["1.1-1"] = { xp: 10, accuracy: 100, at: Date.now(), plays: 1 }; localStorage.setItem("buhisimo.prototype.v1", JSON.stringify(s)); });
  await page.reload();
  await wait(page, 900);
  await page.goto(BASE + "index.html#/lesson/1.1-3");
  await wait(page, 1200);
  ok(await page.locator(".screen.lesson").count() === 0, `${vp.tag}: after lesson 1, lesson 3 is still locked`);
  await page.goto(BASE + "index.html#/lesson/1.1-2");
  await wait(page, 1500);
  ok(await page.locator(".screen.lesson").count() === 1, `${vp.tag}: after lesson 1, lesson 2 opens`);
  // teacher settings are hidden from students
  await page.goto(BASE + "index.html#/");
  await wait(page, 900);
  await page.locator('[data-act="settings"]:visible, [data-nav="settings"]:visible').first().click();
  await wait(page, 500);
  ok(await page.locator('[data-switch="unlock"]').count() === 0, `${vp.tag}: students don't see the "Open every lesson" switch`);
  await page.keyboard.press("Escape");
  // ?unlock=all opens everything, shows the flag and the teacher settings; ?unlock=off relocks
  await page.goto(BASE + "index.html?unlock=all#/lesson/1.1-10");
  await wait(page, 1500);
  ok(await page.locator(".screen.lesson").count() === 1, `${vp.tag}: ?unlock=all opens a later lesson by URL`);
  ok(await page.evaluate(() => !location.search.includes("unlock")), `${vp.tag}: the override is removed from the address bar after use`);
  await page.goto(BASE + "index.html#/");
  await wait(page, 1000);
  ok(await page.locator(".teacher-flag").count() === 1 && await page.locator('.node[data-unit="1.1"].is-locked').count() === 0, `${vp.tag}: teacher preview flag shown, nothing locked`);
  await shot(page, `${vp.tag}-lock-teacher-preview`);
  await page.locator('[data-act="settings"]:visible, [data-nav="settings"]:visible').first().click();
  await wait(page, 500);
  ok(await page.locator('[data-switch="unlock"][aria-checked="true"]').count() === 1, `${vp.tag}: the teacher settings show "Open every lesson" on`);
  await page.keyboard.press("Escape");
  await page.goto(BASE + "index.html?unlock=off#/");
  await wait(page, 1200);
  ok(await page.locator('.node[data-unit="1.1"].is-locked').count() === 9 && await page.locator(".teacher-flag").count() === 0, `${vp.tag}: ?unlock=off locks lessons 3–11 again`);
  await ctx.close();
}

// ===================================================================== M. map questions
log("M. Map questions: a labelled study map first, then no names; small places tappable on a phone");
if (RUN("M")) for (const vp of [{ width: 1366, height: 768, tag: "d" }, { width: 390, height: 844, tag: "m" }]) {
  const { ctx, page } = await newPage({ width: vp.width, height: vp.height }, { touch: vp.tag === "m" });
  await page.goto(BASE + "index.html");
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + "index.html?unlock=all#/");
  await wait(page, 900);
  const SHOT = new Set(["study-l2", "study-l7", "g-study-north", "g-study-south", "g-study-world", "g-study-world-1", "g-study-world-2", "map-pascua", "map-baleares", "map-canarias", "map-gq", "map-filipinas", "map-rd", "g-espana", "g-canarias", "c-map-cuba"]);
  let maptaps = 0, studies = 0, hintDone = false;
  const worldMaps = [];
  const problems = [];
  for (const id of ["1.1-2", "1.1-3", "1.1-6", "1.1-7", "1.1-10", "1.1-11"]) {
    await page.goto(BASE + `index.html#/lesson/${id}`);
    await wait(page, 1300);
    for (let guard = 0; guard < 90; guard++) {
      await wait(page, 450);
      const st = await step(page);
      if (st.complete || !st.step) break;
      const s = st.step;
      if (s.type === "mapstudy") {
        studies++;
        if (s.id.startsWith("g-study-world")) worldMaps.push(s.id);
        await wait(page, 350); // labels are placed again after the entrance animation
        const labels = await page.$$eval(".ex-mapstudy .map-pin__label", (ls) => ls.filter((l) => l.getBoundingClientRect().width > 0).length);
        if (labels !== s.places.length) problems.push(`${id} ${s.id}: ${labels} of ${s.places.length} names shown`);
        const off = await page.evaluate(() => { const f = document.querySelector(".ex-mapstudy .map-frame").getBoundingClientRect(); return [...document.querySelectorAll(".ex-mapstudy .map-pin__label")].filter((l) => { const r = l.getBoundingClientRect(); return r.left < f.left - 1 || r.right > f.right + 1 || r.top < f.top - 1 || r.bottom > f.bottom + 1; }).map((l) => l.textContent.trim()); });
        if (off.length) problems.push(`${id} ${s.id}: labels outside the map: ${off.join(", ")}`);
        if (SHOT.has(s.id)) await shot(page, `${vp.tag}-map-${s.id}`);
      }
      if (s.type === "maptap" && !s.retry) {
        maptaps++;
        const info = await page.evaluate(() => {
          const f = document.querySelector(".ex-maptap .map-frame").getBoundingClientRect();
          const marks = [...document.querySelectorAll(".ex-maptap .map-mark")].map((m) => { const r = m.getBoundingClientRect(); return { place: m.dataset.place, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, inside: r.left >= f.left - 1 && r.right <= f.right + 1 && r.top >= f.top - 1 && r.bottom <= f.bottom + 1, named: getComputedStyle(m.querySelector(".map-mark__name")).display !== "none" }; });
          return { marks, pinLabels: document.querySelectorAll(".ex-maptap .map-pin__label").length };
        });
        if (info.pinLabels) problems.push(`${id} ${s.id}: labelled pins in a question`);
        for (const m of info.marks) {
          if (m.named) problems.push(`${id} ${s.id}: the name of ${m.place} shows before CHECK`);
          if (m.w < 44 || m.h < 44) problems.push(`${id} ${s.id}: ${m.place} target ${m.w}×${m.h}px (< 44)`);
          if (!m.inside) problems.push(`${id} ${s.id}: ${m.place} target outside the map`);
        }
        for (let i = 0; i < info.marks.length; i++) for (let j = i + 1; j < info.marks.length; j++) {
          const a = info.marks[i], b = info.marks[j];
          if (Math.hypot(a.x - b.x, a.y - b.y) < 44) problems.push(`${id} ${s.id}: ${a.place} and ${b.place} targets overlap`);
        }
        if (SHOT.has(s.id)) await shot(page, `${vp.tag}-map-${s.id}`);
        if (id === "1.1-11") ok(await page.locator(".ex-maptap [data-hint]").count() === 0, `${vp.tag}: no "Show the names" hint in the unit check`);
        if (id === "1.1-10" && !hintDone) {
          hintDone = true;
          await page.click(".ex-maptap [data-hint]");
          await wait(page, 300);
          ok(await page.evaluate(() => [...document.querySelectorAll(".ex-maptap .map-mark__name")].every((n) => getComputedStyle(n).display !== "none")), `${vp.tag}: "Show the names" shows every name`);
          await shot(page, `${vp.tag}-map-hint-names`);
          await answer(page, s, { keys: false });
          await wait(page, 700);
          ok(/without them/.test(await page.locator(".feedback").innerText()), `${vp.tag}: a hinted answer is right, with "try it without them" (no bonus XP)`);
          await shot(page, `${vp.tag}-map-hint-feedback`);
          await page.click('.feedback [data-act="continue"]');
          continue;
        }
        if (s.id === "map-baleares" || s.id === "g-canarias") {
          // wrong first, to see the feedback with names
          await answer(page, s, { keys: false, wrong: true });
          await wait(page, 700);
          await shot(page, `${vp.tag}-map-feedback-wrong-${s.id}`);
          await page.click('.feedback [data-act="continue"]');
          continue;
        }
      }
      const res = await answer(page, s, { keys: false });
      if (res === "graded") {
        await wait(page, 700);
        if (s.type === "maptap" && SHOT.has(s.id) && s.id.startsWith("map-p")) await shot(page, `${vp.tag}-map-feedback-${s.id}`);
        if (await page.locator(".ex-fixup").count()) { await page.click("[data-show], [data-act='show']").catch(() => {}); await wait(page, 2200); }
        await page.click('.feedback [data-act="continue"]').catch(() => {});
      }
    }
  }
  // Spain, Africa and Asia: one map on wide screens, two smaller ones on a phone (decision 2026-10-21)
  ok(vp.tag === "m" ? worldMaps.join() === "g-study-world-1,g-study-world-2" : worldMaps.join() === "g-study-world", `${vp.tag}: the Spain/Africa/Asia study map is ${vp.tag === "m" ? "split in two on a phone" : "one map"} (${worldMaps.join(", ")})`);
  ok(studies >= 7 && maptaps >= 20, `${vp.tag}: ${studies} study maps and ${maptaps} map questions seen`);
  ok(problems.length === 0, `${vp.tag}: every map question has no names before CHECK, 44px+ targets inside the map, no overlaps${problems.length ? ": " + problems.join("; ") : ""}`);
  await ctx.close();
}

// ===================================================================== U. Unit 1.2 «¿Qué tal?»
const U12 = Array.from({ length: 13 }, (_, i) => `1.2-${i + 1}`);
const NEW_TYPES = new Set(["letters", "letterpick", "spell", "clip", "radio", "transcript", "intro", "choose", "table", "sort", "tiles", "gap", "storyintro", "storyline", "type", "match", "pick", "listen", "radio:feedback", "spell:feedback", "letterpick:feedback", "choose:feedback"]);
const all11Done = () => { const c = {}; for (let i = 1; i <= 11; i++) c[`1.1-${i}`] = { xp: 10, accuracy: 100, at: Date.now(), plays: 1 }; return c; };
log("U. Unit 1.2: locked after 1.1, every lesson in order (keyboard, 1366×768), every lesson by touch (390×844), the Radio tab");
if (RUN("U")) {
  // U1. Chromebook, keyboard: 1.2 opens only after the 1.1 check.
  {
    const { ctx, page } = await newPage({ width: 1366, height: 768 });
    await page.goto(BASE + "index.html");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await wait(page, 1300);
    ok(await page.locator('.node[data-unit="1.2"]').count() === 13, "the 1.2 section has 13 nodes");
    ok(await page.locator('.node[data-unit="1.2"].is-locked').count() === 13, "fresh start: all of 1.2 is locked");
    await page.goto(BASE + "index.html#/lesson/1.2-1");
    await wait(page, 1200);
    ok(await page.locator(".screen.lesson").count() === 0, "#/lesson/1.2-1 is refused before 1.1 is done");
    await page.evaluate((c) => localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ completed: c })), all11Done());
    await page.goto(BASE + "index.html#/");
    await page.reload();
    await wait(page, 1300);
    ok(await page.locator('.node[data-node="1.2-1"].is-current').count() === 1 && await page.locator('.node[data-unit="1.2"].is-locked').count() === 12, "after the 1.1 check, 1.2 L1 is the current lesson and the rest of 1.2 is locked");
    await page.evaluate(() => document.querySelector('.node[data-node="1.2-1"]').scrollIntoView({ block: "center" }));
    await wait(page, 400);
    await shot(page, "u-d-path-1.2");
    for (const [i, id] of U12.entries()) {
      await page.goto(BASE + "index.html#/");
      await wait(page, 900);
      const node = page.locator(`.node[data-node="${id}"]`);
      ok(await node.evaluate((n) => n.classList.contains("is-current")), `${id} is the current node`);
      await node.focus();
      await page.keyboard.press("Enter");
      await wait(page, 450);
      if (i === 0) await shot(page, "u-d-popover-1.2-1");
      await page.keyboard.press("Enter");
      await wait(page, 1300);
      const r = await playLesson(page, id, { keys: true, wrongOnce: true, checkFit: true, shotTypes: NEW_TYPES, shotPrefix: "u-d-" });
      ok(r.complete, `${id} played to the end with the keyboard (${Object.entries(r.seen).map(([k, v]) => `${k}×${v}`).join(", ")})`);
      ok(r.retried, `${id}: the missed question came back later`);
      ok(r.fitIssues.length === 0, `${id}: every step fits 1366×768 without scrolling${r.fitIssues.length ? ": " + r.fitIssues.join("; ") : ""}`);
      await wait(page, 700);
      if (i === 6 || i === 12) await shot(page, `u-d-complete-${id}`);
      await page.keyboard.press("Enter");
      await wait(page, 1200);
      ok(await page.locator(`.node[data-node="${id}"].is-done`).count() === 1, `${id} shows as done`);
    }
    // Review knows the 1.2 words, including letter groups (asked as a letter pick).
    const prog = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")));
    ok(["hola", "que-tal", "esta", "letters-vowels", "letter-uve"].every((k) => prog.items[k]), "Review has met the 1.2 words and letters");
    await page.goto(BASE + "index.html#/review");
    await wait(page, 1200);
    ok(await page.locator(".kb-lesson").filter({ hasText: "¿Cómo se escribe Max?" }).count() === 1, "My knowledge lists the 1.2 lessons");
    await shot(page, "u-d-knowledge");
    // The Radio tab: the 1.1 demo first, then the 1.2 episodes (open now).
    await page.goto(BASE + "index.html#/radio");
    await wait(page, 1500);
    ok(await page.locator(".radio-ep-chip:not([disabled])").count() === 3, "Radio tab: the demo and two 1.2 episodes");
    await page.click('.radio-ep-chip[data-ep="2"]');
    await wait(page, 600);
    ok(await page.locator(".radio-ep .k-line").count() === 11 && await page.locator(".radio-ep .audio-soon").count() >= 1, "the spelling show: 11 lines to read, audio coming soon");
    await shot(page, "u-d-radio-tab");
    await page.goto(BASE + "index.html#/profile");
    await wait(page, 900);
    ok((await page.locator(".me-card").filter({ hasText: "Unit 1.2" }).innerText()).includes("13 of 13"), "Me: Unit 1.2, 13 of 13 lessons done");
    await ctx.close();
  }
  // U2. Phone, touch: every 1.2 lesson.
  {
    const { ctx, page } = await newPage({ width: 390, height: 844 }, { touch: true });
    await page.goto(BASE + "index.html");
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ unlockAll: true })); });
    await page.reload();
    await wait(page, 1000);
    await page.evaluate(() => document.querySelector('.node[data-node="1.2-1"]').scrollIntoView({ block: "center" }));
    await wait(page, 300);
    await shot(page, "u-m-path-1.2");
    for (const id of U12) {
      await page.goto(BASE + `index.html#/lesson/${id}`);
      await wait(page, 1300);
      const r = await playLesson(page, `phone ${id}`, { keys: false, wrongOnce: id === "1.2-8" || id === "1.2-12", shotTypes: NEW_TYPES, shotPrefix: "u-m-" });
      ok(r.complete, `phone: ${id} played by touch (${Object.keys(r.seen).join(", ")})`);
      const hs = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
      ok(hs <= 0, `phone: ${id} has no horizontal scrolling`);
      await page.click("[data-done]");
      await wait(page, 900);
    }
    await page.goto(BASE + "index.html#/radio");
    await wait(page, 1500);
    await page.click('.radio-ep-chip[data-ep="1"]');
    await wait(page, 500);
    await shot(page, "u-m-radio-tab");
    await ctx.close();
  }
}

// ===================================================================== V. Unit 1.3 «Mi carnet de identidad»
const U13 = Array.from({ length: 20 }, (_, i) => `1.3-${i + 1}`);
const NEW13 = new Set(["numcard", "numpick", "numtype", "dictation", "count", "pattern", "invaders", "song", "songset", "idcard", "intro", "choose", "storyintro", "storyline", "transcript", "clip", "tiles",
  "numpick:feedback", "numtype:feedback", "dictation:feedback", "count:feedback", "invaders:feedback", "idcard:feedback", "choose:feedback"]);
const all12Done = () => { const c = all11Done(); for (let i = 1; i <= 13; i++) c[`1.2-${i}`] = { xp: 10, accuracy: 100, at: Date.now(), plays: 1 }; return c; };
log("V. Unit 1.3: locked after 1.2, every lesson in order (keyboard, 1366×768), the songs' karaoke, every lesson by touch (390×844), the Radio tab");
if (RUN("V")) {
  // V1. Chromebook, keyboard: 1.3 opens only after the 1.2 check. (V13=d or V13=m runs one half only; V13=inv only V3.)
  if (!["m", "inv"].includes(process.env.V13)) {
    const { ctx, page } = await newPage({ width: 1366, height: 768 });
    await page.goto(BASE + "index.html");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await wait(page, 1300);
    ok(await page.locator('.node[data-unit="1.3a"]').count() === 11 && await page.locator('.node[data-unit="1.3b"]').count() === 9, "the 1.3 path: 11 nodes in part A, 9 in part B");
    ok(await page.locator('.node[data-unit^="1.3"].is-locked').count() === 20, "fresh start: all of 1.3 is locked");
    await page.evaluate((c) => localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ completed: c })), all11Done());
    await page.goto(BASE + "index.html#/lesson/1.3-1");
    await page.reload();
    await wait(page, 1300);
    ok(await page.locator(".screen.lesson").count() === 0, "#/lesson/1.3-1 is refused while 1.2 isn't done");
    await page.evaluate((c) => localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ completed: c })), all12Done());
    await page.goto(BASE + "index.html#/");
    await page.reload();
    await wait(page, 1300);
    ok(await page.locator('.node[data-node="1.3-1"].is-current').count() === 1 && await page.locator('.node[data-unit^="1.3"].is-locked').count() === 19, "after the 1.2 check, 1.3 L1 is current and the rest of 1.3 is locked");
    await page.evaluate(() => document.querySelector('.node[data-node="1.3-1"]').scrollIntoView({ block: "center" }));
    await wait(page, 400);
    await shot(page, "v-d-path-1.3a");
    for (const [i, id] of U13.entries()) {
      await page.goto(BASE + "index.html#/");
      await wait(page, 900);
      const node = page.locator(`.node[data-node="${id}"]`);
      ok(await node.evaluate((n) => n.classList.contains("is-current")), `${id} is the current node`);
      await node.focus();
      await page.keyboard.press("Enter");
      await wait(page, 450);
      if (id === "1.3-12") await shot(page, "v-d-popover-1.3-12");
      await page.keyboard.press("Enter");
      await wait(page, 1300);
      const r = await playLesson(page, id, { keys: true, wrongOnce: true, checkFit: true, shotTypes: NEW13, shotPrefix: "v-d-" });
      ok(r.complete, `${id} played to the end with the keyboard (${Object.entries(r.seen).map(([k, v]) => `${k}×${v}`).join(", ")})`);
      ok(r.retried, `${id}: the missed question came back later`);
      ok(r.fitIssues.length === 0, `${id}: every step fits 1366×768 without scrolling${r.fitIssues.length ? ": " + r.fitIssues.join("; ") : ""}`);
      ok(r.underBar.length === 0, `${id}: nothing shows under or behind the feedback bar${r.underBar.length ? ": " + r.underBar.join("; ") : ""}`);
      await wait(page, 700);
      const title = await page.locator(".complete-title").innerText().catch(() => "");
      if (id === "1.3-11") ok(/part A complete/i.test(title), `the 1.3a check closes part A (“${title}”)`);
      if (id === "1.3-20") ok(/Unit 1\.3 complete/.test(title), `the 1.3 check closes the unit (“${title}”)`);
      if (["1.3-11", "1.3-18", "1.3-20"].includes(id)) await shot(page, `v-d-complete-${id}`);
      await page.keyboard.press("Enter");
      await wait(page, 1200);
      ok(await page.locator(`.node[data-node="${id}"].is-done`).count() === 1, `${id} shows as done`);
    }
    await page.evaluate(() => document.querySelector('.node[data-node="1.3-15"]').scrollIntoView({ block: "center" }));
    await wait(page, 300);
    await shot(page, "v-d-path-1.3b-done");
    const prog = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")));
    ok(["me-llamo", "num-0", "num-7", "num-31", "anos", "el-carnet", "el-amigo"].every((k) => prog.items[k]), "Review has met the 1.3 words and numbers");
    // Review: number items come back as number picks / digit → word.
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("buhisimo.prototype.v1")); for (const id of ["num-6", "num-7", "num-26", "num-27"]) s.items[id] = { ...s.items[id], due: Date.now() - 864e5, box: 0, wrong: 2 }; localStorage.setItem("buhisimo.prototype.v1", JSON.stringify(s)); });
    await page.goto(BASE + "index.html#/review");
    await page.reload();
    await wait(page, 1200);
    ok(await page.locator(".kb-lesson").filter({ hasText: "Veintiséis… treinta y uno" }).count() === 1, "My knowledge lists the 1.3 lessons");
    ok(!(await page.locator(".view-review").innerText()).match(/(^|\n)años(\n|$)/), "My knowledge never shows años on its own");
    await shot(page, "v-d-knowledge");
    await page.click("[data-start-review]");
    await wait(page, 1300);
    const rr = await playLesson(page, "review-1.3", { keys: true, wrongOnce: false, checkFit: true, shotTypes: new Set(["numpick", "numtype"]), shotPrefix: "v-d-review-" });
    ok(rr.complete && ((rr.seen.numpick || 0) + (rr.seen.numtype || 0)) > 0, `a review session with the due numbers asks them as numbers (${Object.entries(rr.seen).map(([k, v]) => `${k}×${v}`).join(", ")})`);
    // The songs: real audio, words lit on the aligned timing, letras and con números; the placeholder says "Song coming soon".
    await page.goto(BASE + "index.html#/");
    await wait(page, 800);
    const karaoke = await page.evaluate(async () => {
      const { songPlayer } = await import("./js/exercises-1-3.js");
      const songs = (await (await fetch("audio/songs/songs.json")).json()).songs;
      const at = async (song, numerals, line, word) => {
        const p = songPlayer({ song, linesEs: [], numerals });
        document.body.appendChild(p.el);
        await p.ready;
        p.play();
        await new Promise((r) => setTimeout(r, 500));
        const w = songs[song].words.find((x) => x[0] === line && x[1] === word);
        // Seek just inside the word (the song keeps playing, so look at once).
        p.audio.currentTime = w[2] + 0.03;
        await new Promise((r) => setTimeout(r, 120));
        const now = [...p.el.querySelectorAll(".clip-w.is-now")].map((x) => x.textContent);
        const playing = !p.audio.paused && p.audio.currentTime > 0;
        p.destroy(); p.el.remove();
        return { now, playing };
      };
      // Every 1.3 song is chosen now (Dos, doce, veintidós = v8h s1, 26 Oct 2026): a song with no file (a 2.1 one) shows the placeholder.
      const soon = songPlayer({ song: "numeros_sesenta_setenta", linesEs: ["Seis, dieciséis, sesenta."] });
      document.body.appendChild(soon.el);
      const rec = await soon.ready;
      const soonText = soon.el.textContent;
      soon.destroy(); soon.el.remove();
      const dos = songPlayer({ song: "numeros_dos_doce_veintidos", linesEs: ["Uno, dos, tres,"] });
      document.body.appendChild(dos.el);
      const dosRec = await dos.ready;
      dos.destroy(); dos.el.remove();
      return { words: await at("numeros_1_10", false, 2, 1), digits: await at("numeros_20_31", true, 3, 2), digits2: await at("numeros_uno_once", true, 0, 3), soon: { rec, soonText }, dosRec };
    });
    ok(karaoke.words.playing && karaoke.words.now.join() === "siete,", `«1 to 10» plays and lights up “siete,” at its sung time (${JSON.stringify(karaoke.words)})`);
    ok(karaoke.digits.playing && karaoke.digits.now.join() === "¡31!", `«20 to 31» con números lights up ¡31! for «¡treinta y uno!» (${JSON.stringify(karaoke.digits)})`);
    ok(karaoke.digits2.now.join() === "12.", `«Uno, once · Dos, doce» con números shows doce as 12 (${JSON.stringify(karaoke.digits2)})`);
    ok(karaoke.soon.rec === false && /Song coming soon/.test(karaoke.soon.soonText), "a song with no file yet (2.1 «Sesenta, setenta») says “Song coming soon”");
    ok(karaoke.dosRec === true, "«Dos, doce, veintidós» (Juan's pick v8h s1) has its recording");
    // The Radio tab: the 1.3 episodes, with the number songs.
    await page.goto(BASE + "index.html#/radio");
    await wait(page, 1500);
    ok(await page.locator(".radio-ep-chip:not([disabled])").count() === 5, "Radio tab: the demo, two 1.2 and two 1.3 episodes");
    await page.click('.radio-ep-chip[data-ep="3"]');
    await wait(page, 600);
    ok(await page.locator(".radio-ep .radio-songs [data-song]").count() === 6, "the numbers episode lists the six songs");
    await page.click('.radio-ep [data-song="4"]');
    await wait(page, 2500);
    ok(await page.locator(".radio-ep .radio-song .clip-w.is-now, .radio-ep .radio-song .clip-w.is-done").count() > 0, "a song plays in the Radio tab with its words lighting up");
    await shot(page, "v-d-radio-tab-songs");
    await page.click('.radio-ep-chip[data-ep="4"]');
    await wait(page, 600);
    ok(await page.locator(".radio-ep .k-line").count() === 6, "the ID-card episode: 6 lines to read");
    await page.goto(BASE + "index.html#/profile");
    await wait(page, 900);
    ok((await page.locator(".me-card").filter({ hasText: "Unit 1.3" }).innerText()).includes("20 of 20"), "Me: Unit 1.3, 20 of 20 lessons done");
    await shot(page, "v-d-me");
    await ctx.close();
  }
  // V2. Phone, touch: every 1.3 lesson.
  if (!["d", "inv"].includes(process.env.V13)) {
    const { ctx, page } = await newPage({ width: 390, height: 844 }, { touch: true });
    await page.goto(BASE + "index.html");
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ unlockAll: true })); });
    await page.reload();
    await wait(page, 1000);
    await page.evaluate(() => document.querySelector('.node[data-node="1.3-1"]').scrollIntoView({ block: "center" }));
    await wait(page, 300);
    await shot(page, "v-m-path-1.3a");
    for (const id of U13) {
      await page.goto(BASE + `index.html#/lesson/${id}`);
      await wait(page, 1300);
      const r = await playLesson(page, `phone ${id}`, { keys: false, wrongOnce: true, shotTypes: NEW13, shotPrefix: "v-m-" });
      ok(r.complete, `phone: ${id} played by touch (${Object.keys(r.seen).join(", ")})`);
      const hs = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
      ok(hs <= 0, `phone: ${id} has no horizontal scrolling`);
      await page.click("[data-done]");
      await wait(page, 900);
    }
    await page.goto(BASE + "index.html#/radio");
    await wait(page, 1500);
    await page.click('.radio-ep-chip[data-ep="3"]');
    await wait(page, 500);
    await page.click('.radio-ep [data-song="0"]');
    await wait(page, 2500);
    await shot(page, "v-m-radio-tab-songs");
    await ctx.close();
  }
  // V3. Number Invaders up close (375×667, touch): the aliens march, no stray small numbers, a wrong
  // hit puts that alien out, a landing is a miss that comes back at the end, "Slower" halves the speed.
  if (process.env.V13 !== "d") {
    const { ctx, page } = await newPage({ width: 375, height: 667 }, { touch: true });
    await page.goto(BASE + "index.html");
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem("buhisimo.prototype.v1", JSON.stringify({ unlockAll: true })); });
    await page.reload();
    await wait(page, 1000);
    await page.goto(BASE + "index.html#/lesson/1.3-6");
    await wait(page, 1300);
    await page.click('.lesson-foot [data-act="main"]'); // past the study card
    await wait(page, 1200);
    const inv = (fn, arg) => page.evaluate(fn, arg);
    const y = () => inv(() => parseFloat(getComputedStyle(document.querySelector(".lesson-body .inv-sky")).getPropertyValue("--y")) || 0);
    ok(await page.locator(".lesson-body .inv-ship").count() === 4, "Number Invaders: four invaders in the sky");
    ok(await page.locator(".lesson-body .inv-cannon").count() === 1, "Number Invaders: a cannon at the bottom");
    ok(await page.locator('.lesson-body .inv-slow[aria-pressed="false"]').count() === 1, "Number Invaders: arcade speed from the start (Slower is off)");
    const stray = await inv(() => [...document.querySelectorAll(".lesson-body .ex-invaders *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && /\d/.test(n.textContent)))
      .filter((e) => !e.closest(".inv-plate, .inv-score")).map((e) => `«${e.textContent.trim()}» (${e.className})`));
    ok(stray.length === 0, `Number Invaders: no numbers but the invaders' digits and the score${stray.length ? ": " + stray.join(", ") : ""}`);
    ok(await inv(() => [...document.querySelectorAll(".lesson-body .inv-ship")].every((b) => b.getAttribute("aria-label") === b.dataset.n && b.textContent.trim() === b.dataset.n)), "Number Invaders: each invader shows and is labelled by its digit only");
    const y0 = await y(); await wait(page, 1000); const y1 = await y();
    ok(y1 > y0 + 2, `Number Invaders: the invaders march down (${y0.toFixed(1)} → ${y1.toFixed(1)} px in 1 s)`);
    const a = await inv(() => document.querySelector(".lesson-body .ex-invaders").dataset.answer);
    const bad = await inv((a) => [...document.querySelectorAll(".lesson-body .inv-ship")].find((b) => b.dataset.n !== a).dataset.n, a);
    await page.locator(`.lesson-body .inv-ship[data-n="${bad}"]`).click({ force: true });
    await wait(page, 260);
    await shot(page, "v-m-invaders-shot");
    await wait(page, 600);
    ok(await page.locator(`.lesson-body .inv-ship[data-n="${bad}"][aria-disabled="true"]`).count() === 1, "Number Invaders: a wrong hit puts that invader out for the round");
    const landed = await page.waitForFunction(() => document.querySelector(".lesson-body .inv-sky.is-landed"), null, { timeout: 30000 }).then(() => true).catch(() => false);
    ok(landed, "Number Invaders: left alone, the invaders land");
    await shot(page, "v-m-invaders-landed");
    await page.waitForFunction(() => !document.querySelector(".lesson-body .inv-sky.is-landed"), null, { timeout: 4000 }).catch(() => {});
    await wait(page, 500);
    const f0 = await y(); await wait(page, 1000); const f1 = await y();
    await page.click(".lesson-body .inv-slow");
    const s0 = await y(); await wait(page, 1000); const s1 = await y();
    const ratio = (s1 - s0) / Math.max(0.1, f1 - f0);
    ok(ratio > 0.3 && ratio < 0.7, `Number Invaders: Slower halves the speed (${(f1 - f0).toFixed(1)} → ${(s1 - s0).toFixed(1)} px/s)`);
    let rounds = 0;
    for (let g = 0; g < 12; g++) {
      const st = await inv(() => { const n = document.querySelector(".lesson-body .ex-invaders"); return n && n.dataset.answer != null ? [n.dataset.answer, n.dataset.round] : null; });
      if (!st) break;
      await page.locator(`.lesson-body .inv-ship[data-n="${st[0]}"]`).click({ force: true });
      if (g === 0) { await wait(page, 330); await shot(page, "v-m-invaders-boom"); }
      await page.waitForFunction((r) => { const n = document.querySelector(".lesson-body .ex-invaders"); return !n || n.dataset.answer == null || n.dataset.round !== r; }, st[1], { timeout: 5000 }).catch(() => {});
      rounds++;
    }
    ok(rounds === 5, `Number Invaders: the landed round came back once at the end (5 more rounds after the landing, got ${rounds})`);
    await wait(page, 900);
    const tip = await page.locator(".feedback.is-open .feedback__tip").innerText().catch(() => "");
    ok(/^4 of 5 on the first try; 2 misses on the way/.test(tip), `Number Invaders: the result counts first tries and misses (“${tip}”)`);
    await shot(page, "v-m-invaders-end");
    await ctx.close();
  }
}

// ===================================================================== K. capital letters in typed answers
log("K. Capital letters: names and sentences need them; languages, days and months don't");
if (RUN("K")) for (const vp of [{ width: 1366, height: 768, tag: "d" }, { width: 390, height: 844, tag: "m" }]) {
  const { ctx, page } = await newPage({ width: vp.width, height: vp.height }, { touch: vp.tag === "m" });
  await page.goto(BASE + "index.html");
  await page.evaluate(() => localStorage.clear());
  if (vp.tag === "d") {
    const cases = await page.evaluate(async () => {
      const { grade } = await import("./js/lesson.js");
      const t = [["soy de australia", "Soy de Australia."], ["Soy de Australia", "Soy de Australia."], ["el Español", "el español"], ["El español", "el español"],
        ["Hispanohablante", "hispanohablante"], ["el destino", "el destino"], ["El destino", "el destino"], ["españa", "España"], ["¿de dónde eres?", "¿De dónde eres?"],
        ["De dónde eres", "¿De dónde eres?"], ["Soy De Australia.", "Soy de Australia."], ["peru", "Perú"], ["buenos días", "Buenos días"], ["salento", "Salento"]];
      return t.map(([a, b]) => [a, b, grade(a, b).verdict]);
    });
    const want = { "soy de australia": "caps", "Soy de Australia": "correct", "el Español": "caps", "El español": "correct", "Hispanohablante": "caps", "el destino": "correct",
      "El destino": "correct", "españa": "caps", "¿de dónde eres?": "caps", "De dónde eres": "correct", "Soy De Australia.": "caps", "peru": "accents", "buenos días": "correct", salento: "caps" };
    for (const [a, b, v] of cases) ok(v === want[a], `grade("${a}", "${b}") → ${v} (want ${want[a]})`);
  }
  // In a lesson: the 1.1 check opens on "Spain"; type "españa".
  await page.goto(BASE + "index.html?unlock=all#/lesson/1.1-11");
  await page.reload();
  await wait(page, 1500);
  await page.fill(".lesson-body .type-input", "españa");
  await page.click('.lesson-foot [data-act="main"]');
  await wait(page, 700);
  ok(await page.locator(".ex-fixup").count() === 1 && /Capital letters/.test(await page.locator(".fix-ask").innerText()), `${vp.tag}: “españa” is not accepted: the fix-up names the capital-letter rule`);
  ok(await page.locator(".fix-letter.is-hint").count() === 1, `${vp.tag}: the letter that needs a capital is highlighted`);
  await shot(page, `${vp.tag}-caps-fixup`);
  await page.locator(".fix-letter.is-hint").first().click();
  await wait(page, 1200);
  ok(await sheet(page) === "correct" && (await page.locator(".feedback__answer .es").innerText()) === "España", `${vp.tag}: tapping it makes España: right, with the rule repeated`);
  await shot(page, `${vp.tag}-caps-feedback`);
  const it = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")).items.espana);
  ok(it && it.box === 0 && it.wrong >= 1, `${vp.tag}: not a first-try answer, so Review brings España back soon (box ${it?.box})`);
  await ctx.close();
}

// ===================================================================== W. «Who is it?» with speech bubbles
// Every choose step with layout "bubbles" (1.1-2 who-el / who-ella; 1.3 who-samuel, c-who-max, amigo-samuel,
// amiga-valentina, who-australia, c-who-amigo), opened with ?step= at four sizes: keyboard on the wide ones,
// touch on the phones; a right and a wrong answer each. The speaker's line has its deciding word marked; after
// the answer every bubble shows what tells the people apart, and the feedback says why under the answer.
log("W. «Who is it?»: speech-bubble layout (8 steps, keyboard and touch, four sizes)");
if (RUN("W")) {
  const WHO = [["who-el", "1.1-2"], ["who-ella", "1.1-2"], ["who-samuel", "1.3-2"], ["c-who-max", "1.3-11"], ["amigo-samuel", "1.3-17"],
    ["amiga-valentina", "1.3-17"], ["who-australia", "1.3-19"], ["c-who-amigo", "1.3-20"]];
  const POSED = /^(owl|matilda|max)/;
  const plain = (t) => (t || "").replace(/\[\[|\]\]/g, "");
  const whoState = (page) => page.evaluate(() => {
    const ex = document.querySelector(".lesson-body .ex-who:not(.step-leave)");
    if (!ex) return null;
    const body = document.querySelector(".lesson-body");
    const cast = ex.querySelector(".who-cast");
    return {
      step: window.__buho.step(),
      labels: [...ex.querySelectorAll(".who-char")].map((b) => b.getAttribute("aria-label")),
      pressed: [...ex.querySelectorAll(".who-char")].map((b) => b.getAttribute("aria-pressed")),
      bubbles: [...ex.querySelectorAll(".who-bubble")].map((b) => ({ cls: b.className, text: b.textContent.trim() })),
      names: [...ex.querySelectorAll(".who-name")].map((n) => getComputedStyle(n).visibility),
      imgs: [...ex.querySelectorAll(".who-img")].map((i) => i.getAttribute("src").replace(/^assets\/|\.webp$/g, "")),
      cols: getComputedStyle(cast).gridTemplateColumns.split(" ").length,
      over: body.scrollHeight - body.clientHeight, sideways: document.scrollingElement.scrollWidth - innerWidth,
      speaker: !!ex.querySelector(".who-speaker"), focus: ex.querySelector(".who-focus")?.textContent || "",
      why: document.querySelector(".feedback.is-open .feedback__why")?.textContent.trim() || "",
    };
  });
  const underBar = (page) => page.evaluate(() => {
    const bar = document.querySelector(".feedback.is-open");
    if (!bar) return ["(no feedback bar)"];
    const top = bar.getBoundingClientRect().top + 1;
    return [...document.querySelectorAll("#app *")].filter((e) => {
      if (e.closest(".feedback, .lesson-foot") || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && r.bottom > top && r.top < innerHeight + 40 && cs.visibility !== "hidden" && +cs.opacity > 0.05;
    }).map((e) => `«${e.textContent.trim().slice(0, 24)}»`);
  });
  const open = async (page, id, lesson) => {
    await page.goto(BASE + `index.html?step=${id}#/lesson/${lesson}`);
    await page.reload();
    await wait(page, 1200);
    return whoState(page);
  };
  for (const vp of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }]) {
    const touch = vp.width < 700, tag = `${vp.width}×${vp.height}`;
    const { ctx, page } = await newPage(vp, { touch });
    await page.goto(BASE + "index.html?unlock=all");
    await page.reload();
    await wait(page, 700);
    for (const [id, lesson] of WHO) for (const wrong of [false, true]) {
      const name = `${tag} ${id}${wrong ? " (wrong)" : ""}`;
      let st = await open(page, id, lesson);
      if (!ok(st && st.step.id === id, `${name}: opens in the bubbles layout`)) continue;
      const s = st.step, n = s.optionsArt.length, names = s.optionsArt.map((o) => o.labelEn);
      const tags = s.optionsArt.map((o, k) => s.tagsEs?.[k] ?? o.tagEs);
      const pick = wrong ? (s.answer + 1) % n : s.answer;
      ok(st.labels.join("|") === names.join("|"), `${name}: the people are buttons named ${names.join(", ")}`);
      ok(st.over <= 1 && st.sideways <= 0, `${name}: fits without scrolling (${st.over}px, sideways ${st.sideways}px)`);
      ok(st.speaker === !!s.speaker, `${name}: ${s.speaker ? `${s.speaker} says the line` : "the line sits in a plain bubble (the speaker is the one to find)"}`);
      ok(s.focusEs ? st.focus === s.focusEs : /^(él|ella)$/i.test(st.focus), `${name}: the deciding word «${st.focus}» is marked`);
      ok(st.bubbles.every((b) => b.text === "…"), `${name}: an empty bubble «…» for each person`);
      if (s.namesAfter) ok(st.names.every((v) => v === "hidden"), `${name}: no names under the pictures before the answer (the name decides)`);
      if (n === 4) ok(st.cols === (touch ? 2 : 4), `${name}: four people in ${touch ? "a 2×2 grid" : "one row"} (${st.cols} columns)`);
      if (touch) await page.locator(".lesson-body .who-char").nth(pick).tap();
      else {
        await page.keyboard.press(String(pick + 1));
        const ring = await page.evaluate(() => { const a = document.activeElement; return a?.matches(".who-char") ? getComputedStyle(a).outlineStyle : "not focused"; });
        ok(ring === "solid", `${name}: key ${pick + 1} picks and focuses ${names[pick]} with a focus ring (${ring})`);
      }
      await wait(page, 250);
      st = await whoState(page);
      ok(st.pressed.every((p, k) => p === String(k === pick)), `${name}: ${names[pick]} is selected`);
      if (touch) await page.click('.lesson-foot [data-act="main"]'); else await page.keyboard.press("Enter");
      await wait(page, 900);
      ok(await sheet(page) === (wrong ? "wrong" : "correct"), `${name}: the feedback bar says ${wrong ? "not yet" : "right"}`);
      st = await whoState(page);
      ok(st.bubbles.map((b) => b.text).join("|") === tags.join("|") && /is-right/.test(st.bubbles[s.answer].cls), `${name}: the bubbles show ${tags.join(" / ")}`);
      if (POSED.test(s.optionsArt[s.answer].art)) ok(/celebrat/.test(st.imgs[s.answer]), `${name}: ${names[s.answer]} celebrates (${st.imgs[s.answer]})`);
      if (wrong && POSED.test(s.optionsArt[pick].art)) ok(/thinking/.test(st.imgs[pick]), `${name}: ${names[pick]} looks puzzled (${st.imgs[pick]})`);
      const want = plain(wrong ? s.whyEn.replaceAll("{picked}", names[pick]) : s.rightEn);
      ok(st.why === want, `${name}: the feedback says why: «${st.why}»`);
      const under = await underBar(page);
      ok(under.length === 0, `${name}: nothing under the feedback bar${under.length ? ": " + under.join(", ") : ""}`);
      if (vp.width === 390 || (vp.width === 1366 && id === "who-el")) await shot(page, `w-${vp.width}-${id}${wrong ? "-wrong" : "-right"}`);
      if (touch) await page.click('.feedback [data-act="continue"]'); else await page.keyboard.press("Enter");
      await wait(page, 700);
      const nx = await step(page); // the last step of a lesson ends it (or comes back once, after a wrong answer)
      ok(nx.complete || (nx.step && (nx.step.id !== id || nx.step.retry)), `${name}: Continue moves on (${nx.complete ? "lesson complete" : nx.step?.id + (nx.step?.retry ? ", again" : "")})`);
    }
    if (!touch) { // Skip (wide screens): shows the answer and the reason, no «?»
      const st0 = await open(page, "who-el", "1.1-2");
      await page.click('.lesson-foot [data-act="skip"]');
      await wait(page, 800);
      const st = await whoState(page);
      ok(await sheet(page) === "wrong" && /is-right/.test(st.bubbles[0].cls) && st.why === plain(st0.step.rightEn), `${tag}: Skip shows the answer and why («${st.why}»)`);
    }
    await ctx.close();
  }
}

// ===================================================================== E. audio coverage
log("E. Audio coverage");
if (RUN("E")) {
  const wrongBadges = badges.filter((b) => b.texts.length && b.texts.every(hasClip));
  ok(wrongBadges.length === 0, `no "Audio coming soon" badge for a line that has a recording${wrongBadges.length ? ": " + [...new Set(wrongBadges.map((b) => `${b.where}: ${b.texts.join(" / ")}`))].join("; ") : ""}`);
  const still = [...new Set(badges.filter((b) => !b.texts.every(hasClip)).flatMap((b) => b.texts.filter((t) => !hasClip(t))))];
  log(`  lines still showing "Audio coming soon": ${still.length ? still.join(" | ") : "none"} (${badges.length} badge(s) seen in all)`);
  if (RUN("A") || RUN("C")) ok(listenSteps.audio > 0 && listenSteps.readOnly.length === 0, `1.1 listening steps are real listening (${listenSteps.audio} with audio${listenSteps.readOnly.length ? "; read-only: " + listenSteps.readOnly.join(", ") : ""})`);
  log(`  1.2 listening steps shown as read-and-choose until they are recorded: ${listenSteps.read12}`);
  const missingFiles = Object.values(CLIPS).flatMap((by) => Object.values(by)).filter((p) => { try { readFileSync(join(PROTO, p)); return false; } catch { return true; } });
  ok(missingFiles.length === 0, `every clip in the manifests exists on disk${missingFiles.length ? ": " + missingFiles.join(", ") : ""}`);
}

await browser.close();
log(`\nScreenshots: ${shots.size} in ${OUT}`);
if (errors.length) { log(`\n✗ ${errors.length} problem(s):\n  ` + errors.join("\n  ")); process.exit(1); }
log("\n✓ PASS: Units 1.1, 1.2 and 1.3 end to end");
