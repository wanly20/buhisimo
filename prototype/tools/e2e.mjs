// End-to-end test for the prototype (headless Chromium via playwright-core).
// Setup (outside the repo):  mkdir /tmp/pw && cd /tmp/pw && npm i playwright-core@1.48.2
// Serve:  cd prototype && python3 -m http.server 8765 --bind 127.0.0.1
// Run:    cp prototype/tools/e2e.mjs /tmp/pw/ && node /tmp/pw/e2e.mjs /tmp/shots [deviceScaleFactor]
// It plays the whole lesson (right/wrong answers, accent fix-up, tiles, match, mocked speech,
// can't speak/listen), checks persistence, fonts, desktop + design-system pages, and console errors.
// End-to-end test of the Buhísimo prototype in headless Chromium.
// node e2e.mjs <outDir> [dsf]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const OUT = process.argv[2] || "shots";
const DSF = +(process.argv[3] || 1);
mkdirSync(OUT, { recursive: true });
const BASE = "http://127.0.0.1:8765/";
const errors = [];
const log = (...a) => console.log(...a);
let n = 0;
const shot = async (page, name) => { const f = `${OUT}/${String(++n).padStart(2, "0")}-${name}.png`; await page.screenshot({ path: f }); log("  shot", f); };
const assert = (c, msg) => { if (!c) { errors.push("ASSERT: " + msg); log("  ✗", msg); } else log("  ✓", msg); };

const MOCK_SPEECH = () => {
  class MockRec {
    start() {
      setTimeout(() => this.onstart && this.onstart(), 60);
      setTimeout(() => {
        const res = [{ transcript: window.__heard || "soy de Australia", confidence: 0.9 }];
        this.onresult && this.onresult({ results: [res] });
        this.onend && this.onend();
      }, 700);
    }
    stop() {}
    abort() {}
  }
  window.SpeechRecognition = MockRec;
  window.webkitSpeechRecognition = MockRec;
};

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--autoplay-policy=no-user-gesture-required"] });

async function newPage(viewport = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: DSF, hasTouch: viewport.width < 600 });
  await ctx.addInitScript(MOCK_SPEECH);
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console.error: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  return { ctx, page };
}

const stepType = (page) => page.evaluate(() => {
  const ex = document.querySelector(".lesson-body .ex:not(.step-leave)");
  if (!ex) return document.querySelector(".complete") ? "complete" : "none";
  return [...ex.classList].find((c) => c.startsWith("ex-") && c !== "ex-head").slice(3);
});
const settle = (page, ms = 700) => page.waitForTimeout(ms);
const main = (page) => page.click('.lesson-foot [data-act="main"]');
const cont = async (page) => { await page.click('.feedback [data-act="continue"]'); await settle(page, 600); };
const sheetState = (page) => page.evaluate(() => {
  const s = document.querySelector(".feedback");
  return s.classList.contains("is-open") ? (s.classList.contains("is-wrong") ? "wrong" : "correct") : "closed";
});

// ===================================================================== RUN A: full lesson
log("RUN A: full lesson with right, wrong, accent fix-up, tiles, match, speech");
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + "index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await settle(page, 1500);
  await shot(page, "path-start");
  assert(await page.locator(".node.is-current").count() === 1, "path shows one current node");

  await page.click(".node.is-current");
  await settle(page, 500);
  await shot(page, "path-popover");
  await page.click("[data-start]");
  await settle(page, 1000);

  const seen = {};
  let pickWrongDone = false, guard = 0;
  while (guard++ < 30) {
    const t = await stepType(page);
    if (t === "complete" || t === "none") break;
    seen[t] = (seen[t] || 0) + 1;
    const tag = `${t}${seen[t] > 1 ? seen[t] : ""}`;
    log(`step: ${tag}`);
    if (t === "intro") {
      await shot(page, `lesson-${tag}`);
      await main(page);
      await settle(page);
      continue;
    }
    if (t === "pick") {
      const btn = page.locator(".lesson-body .ex-pick .option");
      const labels = await btn.allInnerTexts();
      const wantIdx = labels.findIndex((l) => l.includes("Where are you from?"));
      const choose = !pickWrongDone ? labels.findIndex((l) => l.includes("Where is he from?")) : wantIdx;
      await btn.nth(choose).click();
      await shot(page, `lesson-${tag}-selected`);
      await main(page);
      await settle(page, 600);
      const st = await sheetState(page);
      if (!pickWrongDone) { assert(st === "wrong", "wrong answer shows the red feedback sheet"); await shot(page, `lesson-${tag}-feedback-wrong`); pickWrongDone = true; }
      else { assert(st === "correct", "retried pick question answered correctly"); await shot(page, `lesson-${tag}-feedback-correct`); }
      await cont(page);
      continue;
    }
    if (t === "listen") {
      await shot(page, `lesson-${tag}`);
      const btn = page.locator(".lesson-body .ex-listen .option");
      const labels = await btn.allInnerTexts();
      await btn.nth(labels.findIndex((l) => l.trim().endsWith("Él es de Colombia.") || l.includes("Él es de Colombia."))).click();
      await main(page);
      await settle(page, 600);
      assert(await sheetState(page) === "correct", "listen-and-choose correct");
      await shot(page, `lesson-${tag}-feedback`);
      await cont(page);
      continue;
    }
    if (t === "tiles") {
      await shot(page, `lesson-${tag}`);
      // place a wrong tile, remove it, then build the right answer
      await page.locator(".bank .tile", { hasText: /^eres$/ }).click();
      await settle(page, 350);
      await page.locator(".answer-lines .tile", { hasText: /^eres$/ }).click();
      await settle(page, 350);
      for (const w of ["soy", "de", "Colombia"]) { await page.locator(".bank .tile", { hasText: new RegExp(`^${w}$`) }).click(); await settle(page, 320); }
      await shot(page, `lesson-${tag}-built`);
      await main(page);
      await settle(page, 600);
      assert(await sheetState(page) === "correct", "tiles sentence built correctly (after removing a tile)");
      await shot(page, `lesson-${tag}-feedback`);
      await cont(page);
      continue;
    }
    if (t === "type") {
      const prompt = await page.locator(".type-prompt__en").innerText();
      const typed = prompt === "Spain" ? "Espana" : "el pais";
      await page.fill(".type-input", typed);
      await shot(page, `lesson-${tag}-typed`);
      await main(page);
      await settle(page, 600);
      assert(await page.locator(".ex-fixup").count() === 1, `accent fix-up appears for "${typed}"`);
      await shot(page, `lesson-${tag}-fixup`);
      // tap a wrong letter first (adds a wrong accent), undo it, then fix the right one
      const letters = page.locator(".fix-letter:not([disabled])");
      const chars = await letters.allInnerTexts();
      if (prompt === "Spain") {
        await letters.nth(chars.indexOf("a")).click(); await settle(page, 250);
        await letters.nth(chars.indexOf("a")).click(); await settle(page, 250);
        await letters.nth(chars.indexOf("n")).click();
      } else {
        await letters.nth(chars.indexOf("i")).click();
      }
      await settle(page, 400);
      await shot(page, `lesson-${tag}-fixup-solved`);
      await settle(page, 700);
      assert(await sheetState(page) === "correct", "fix-up solved → green sheet");
      const ans = await page.locator(".feedback__answer .es").innerText();
      assert(ans === (prompt === "Spain" ? "España" : "el país"), `corrected word shown: ${ans}`);
      await shot(page, `lesson-${tag}-feedback`);
      await cont(page);
      continue;
    }
    if (t === "match") {
      await shot(page, `lesson-${tag}`);
      const pairs = { "España": "Spain", "el país": "the country", "soy": "I am", "eres": "you are", "él": "he" };
      // one deliberate mix-up
      await page.locator('.match-card[data-side="es"]', { hasText: /^soy$/ }).click();
      await page.locator('.match-card[data-side="en"]', { hasText: /^you are$/ }).click();
      await settle(page, 200);
      await shot(page, `lesson-${tag}-mixup`);
      await settle(page, 500);
      let k = 0;
      for (const [es, en] of Object.entries(pairs)) {
        await page.locator('.match-card[data-side="es"]', { hasText: new RegExp(`^${es}$`) }).click();
        await page.locator('.match-card[data-side="en"]', { hasText: new RegExp(`^${en}$`) }).click();
        await settle(page, 250);
        if (++k === 2) await shot(page, `lesson-${tag}-progress`);
      }
      await settle(page, 900);
      assert(await sheetState(page) === "correct", "match pairs complete");
      await shot(page, `lesson-${tag}-feedback`);
      await cont(page);
      continue;
    }
    if (t === "speak") {
      await shot(page, `lesson-${tag}`);
      await page.click(".mic-btn");
      await settle(page, 300);
      await shot(page, `lesson-${tag}-listening`);
      await settle(page, 1000);
      assert(await sheetState(page) === "correct", "speech (mocked recogniser) accepted");
      await shot(page, `lesson-${tag}-feedback`);
      await cont(page);
      continue;
    }
    log("unknown step", t);
    break;
  }
  assert(seen.pick === 2, "the wrong pick question came back later in the lesson");
  for (const ty of ["intro", "pick", "listen", "tiles", "type", "match", "speak"]) assert(seen[ty] >= 1, `exercise type seen: ${ty}`);

  await settle(page, 2200);
  await shot(page, "complete");
  const xp = await page.locator(".stat--xp b").innerText();
  const acc = await page.locator(".stat--acc b").innerText();
  log(`  complete screen: XP ${xp}, accuracy ${acc}%`);
  await page.click("[data-done]");
  await settle(page, 1600);
  await shot(page, "path-after");
  assert(await page.locator(".node.is-done").count() === 1, "path shows the node completed");

  await page.reload();
  await settle(page, 1500);
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")));
  assert(persisted.xp === +xp && persisted.streak === 1 && persisted.completed["1.1-1"], `progress persisted after reload (xp ${persisted.xp}, streak ${persisted.streak})`);
  assert(await page.locator(".node.is-done").count() === 1, "completed node still shown after reload");
  assert(+(await page.locator(".chip--xp span").innerText()) === +xp, "XP chip shows persisted XP");

  // settings + font switch
  await page.click('[data-act="settings"]');
  await settle(page, 600);
  await shot(page, "settings");
  await page.click('[data-font="baloo"]');
  await settle(page, 900);
  await shot(page, "settings-baloo");
  await page.keyboard.press("Escape");
  await settle(page, 400);
  await page.reload();
  await settle(page, 1200);
  assert(await page.evaluate(() => document.documentElement.dataset.font) === "baloo", "font choice persisted after reload");
  await page.click(".node.is-done");
  await settle(page, 300);
  await page.click("[data-start]");
  await settle(page, 1200);
  await shot(page, "lesson-intro-baloo");
  await page.click('[data-act="close"]');
  await settle(page, 500);
  await shot(page, "quit-confirm");
  await page.click('[data-q="leave"]');
  await settle(page, 600);
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("buhisimo.prototype.v1")); s.font = "nunito"; localStorage.setItem("buhisimo.prototype.v1", JSON.stringify(s)); });
  await page.reload();
  await settle(page, 1200);
  await shot(page, "path-nunito");
  await ctx.close();
}

// ===================================================================== RUN B: can't speak / can't listen
log("RUN B: Can't listen now + Can't speak now");
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + "index.html#/lesson/1.1-1");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await settle(page, 1200);
  let guard = 0, listenSkipped = false, speakSkipped = false;
  while (guard++ < 30) {
    const t = await stepType(page);
    if (t === "complete" || t === "none") break;
    if (t === "intro") { await main(page); await settle(page); continue; }
    if (t === "listen") { await page.click('[data-cant="listen"]'); listenSkipped = true; await settle(page, 600); await shot(page, "cant-listen-toast"); continue; }
    if (t === "speak") { await page.click('[data-cant="speak"]'); speakSkipped = true; await settle(page, 700); continue; }
    if (t === "pick") { const b = page.locator(".lesson-body .ex-pick .option"); const l = await b.allInnerTexts(); await b.nth(l.findIndex((x) => x.includes("Where are you from?"))).click(); await main(page); await settle(page, 500); await cont(page); continue; }
    if (t === "tiles") { for (const w of ["soy", "de", "Colombia"]) { await page.locator(".bank .tile", { hasText: new RegExp(`^${w}$`) }).click(); await settle(page, 300); } await main(page); await settle(page, 500); await cont(page); continue; }
    if (t === "type") {
      const prompt = await page.locator(".type-prompt__en").innerText();
      // keyboard path: type with accent bar + Enter
      if (prompt === "Spain") { await page.type(".type-input", "Espa"); await page.click('.accent-key[data-k="ñ"]'); await page.type(".type-input", "a"); }
      else { await page.type(".type-input", "pais"); }
      await page.keyboard.press("Enter");
      await settle(page, 600);
      if (await page.locator(".ex-fixup").count()) {
        await shot(page, "fixup-missing-article");
        await page.click("[data-show]");
        await settle(page, 1800);
      }
      const st = await sheetState(page);
      if (prompt === "Spain") assert(st === "correct", "accent bar + Enter key: España accepted straight away");
      await page.keyboard.press("Enter");
      await settle(page, 600);
      continue;
    }
    if (t === "match") {
      for (const [es, en] of Object.entries({ "España": "Spain", "el país": "the country", "soy": "I am", "eres": "you are", "él": "he" })) {
        await page.locator('.match-card[data-side="es"]', { hasText: new RegExp(`^${es}$`) }).click();
        await page.locator('.match-card[data-side="en"]', { hasText: new RegExp(`^${en}$`) }).click();
        await settle(page, 200);
      }
      await settle(page, 900); await cont(page); continue;
    }
    break;
  }
  assert(listenSkipped && speakSkipped, "both 'can't' buttons were used");
  await settle(page, 2000);
  assert(await page.locator(".complete").count() === 1, "lesson still completes after skipping");
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem("buhisimo.prototype.v1")));
  const now = Date.now();
  assert(st.speakOffUntil > now + 14 * 60e3 && st.speakOffUntil <= now + 15 * 60e3 + 5e3, "speaking snoozed ~15 min (timestamp stored)");
  assert(st.listenOffUntil > now + 14 * 60e3, "listening snoozed ~15 min (timestamp stored)");
  // A new lesson within 15 minutes has no speak/listen steps
  await page.goto(BASE + "index.html#/");
  await page.goto(BASE + "index.html#/lesson/1.1-1");
  await page.reload();
  await settle(page, 1000);
  const types = await page.evaluate(() => 0);
  await page.click('[data-act="settings"]');
  await settle(page, 600);
  await shot(page, "settings-snoozed");
  await ctx.close();
}

// ===================================================================== RUN C: desktop + reduced motion + design system
log("RUN C: desktop view, design system");
{
  const { ctx, page } = await newPage({ width: 1280, height: 860 });
  await page.goto(BASE + "index.html");
  await settle(page, 1500);
  await shot(page, "desktop-path");
  await page.goto(BASE + "design-system.html");
  await settle(page, 2000);
  await page.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-design-system-full.png`, fullPage: true });
  log("  shot design-system-full");
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + "design-system.html");
  await settle(page, 2000);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(over <= 0, `design-system page has no horizontal scroll at 390px (overflow ${over}px)`);
  await page.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-design-system-phone.png`, fullPage: true });
  await ctx.close();
}

// ===================================================================== RUN D: reduced motion, real (unmocked) speech APIs
log("RUN D: reduced motion + no speech mock");
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console.error: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(BASE + "index.html");
  await settle(page, 800);
  const over = await page.evaluate(() => document.querySelector(".path-scroll").scrollWidth - document.querySelector(".path-scroll").clientWidth);
  assert(over <= 0, `path has no horizontal scroll (overflow ${over}px)`);
  await page.click(".node.is-current");
  await page.click("[data-start]");
  await settle(page, 600);
  assert(await stepType(page) === "intro", "lesson starts with reduced motion and the browser's own speech APIs");
  await ctx.close();
}

await browser.close();
const real = errors.filter((e) => !e.includes("favicon"));
log(real.length ? `\nPROBLEMS (${real.length}):\n` + real.join("\n") : "\nALL CHECKS PASSED, no console errors");
process.exit(real.length ? 1 : 0);
