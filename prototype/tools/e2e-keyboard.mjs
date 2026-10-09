// Keyboard-only end-to-end test for the Chromebook / desktop layout (headless Chromium).
// Setup and serving are the same as e2e.mjs; then:
//   cp prototype/tools/e2e-keyboard.mjs /tmp/pw/ && node /tmp/pw/e2e-keyboard.mjs /tmp/kb-shots 1366x768
// Plays the whole lesson with keys only: Tab to the node, Enter to start, Esc for the
// quit dialog, number keys for options/tiles/pairs, Backspace for tiles, the accent bar
// by Tab + Enter, real accented letters, Space on the microphone (mocked recogniser).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const [W, H] = (process.argv[3] || "1366x768").split("x").map(Number);
const MOCK = () => { class R { start() { setTimeout(() => this.onstart && this.onstart(), 60); setTimeout(() => { this.onresult && this.onresult({ results: [[{ transcript: "soy de Australia", confidence: .9 }]] }); this.onend && this.onend(); }, 700); } stop() {} abort() {} } window.SpeechRecognition = R; window.webkitSpeechRecognition = R; };
const b = await chromium.launch({ executablePath: "/usr/bin/chromium" });
const ctx = await b.newContext({ viewport: { width: W, height: H } });
await ctx.addInitScript(MOCK);
const p = await ctx.newPage();
const errors = []; p.on("console", (m) => m.type() === "error" && errors.push(m.text())); p.on("pageerror", (e) => errors.push(e.message));
const ok = (c, m) => { console.log(c ? "  ✓" : "  ✗", m); if (!c) errors.push("ASSERT " + m); };
const wait = (ms) => p.waitForTimeout(ms);
const key = (k) => p.keyboard.press(k);
const active = () => p.evaluate(() => { const a = document.activeElement; return a ? (a.className?.baseVal ?? a.className) + "|" + (a.textContent || "").trim().slice(0, 30) : ""; });
await p.goto("http://127.0.0.1:8765/index.html"); await p.evaluate(() => localStorage.clear()); await p.reload(); await wait(1300);
let n = 0; while (n++ < 40 && !(await active()).includes("is-current")) await key("Tab");
ok((await active()).includes("is-current"), `Tab reaches the current lesson node (${n} presses)`);
const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + " " + getComputedStyle(document.activeElement).outlineColor);
ok(ring.startsWith("solid"), `focus ring visible on node (${ring})`);
await p.screenshot({ path: `${OUT}/k01-path-focus.png` });
await key("Enter"); await wait(500);
ok((await active()).includes("btn"), "Enter opens the popover and focuses START: " + await active());
await key("Enter"); await wait(1200);
const type = () => p.evaluate(() => { const ex = document.querySelector(".lesson-body .ex:not(.step-leave)"); if (!ex) return document.querySelector(".complete") ? "complete" : "none"; return [...ex.classList].find((c) => c.startsWith("ex-") && c !== "ex-head").slice(3); });
const sheet = () => p.evaluate(() => { const s = document.querySelector(".feedback"); return s.classList.contains("is-open") ? (s.classList.contains("is-wrong") ? "wrong" : "correct") : "closed"; });
const keyFor = (sel, re) => p.evaluate(([sel, re]) => { const els = [...document.querySelectorAll(sel)]; const i = els.findIndex((e) => new RegExp(re).test(e.textContent.trim().replace(/^\d\s*/, "").trim())); return i; }, [sel, re]);
let guard = 0, pickWrong = false, escTested = false; const seen = {};
while (guard++ < 30) {
  const t = await type(); if (t === "complete" || t === "none") break;
  seen[t] = (seen[t] || 0) + 1; console.log("step", t);
  if (t === "intro") {
    if (!escTested) { await key("Escape"); await wait(500); ok(await p.locator(".modal").count() === 1, "Esc opens the quit dialog"); await p.screenshot({ path: `${OUT}/k02-quit.png` }); await key("Escape"); await wait(500); ok(await p.locator(".modal").count() === 0, "Esc closes it again"); escTested = true; }
    await key("Enter"); await wait(800); continue;
  }
  if (t === "pick" || t === "listen") {
    const re = t === "pick" ? (pickWrong ? "^Where are you from\\?$" : "^Where is he from\\?$") : "^Él es de Colombia\\.$";
    const i = await keyFor(`.ex-${t} .option`, re);
    await key(String(i + 1)); await wait(200);
    if (seen[t] === 1 && t === "pick") await p.screenshot({ path: `${OUT}/k03-pick-key.png` });
    await key("Enter"); await wait(600);
    const st = await sheet(); ok(st === (t === "pick" && !pickWrong ? "wrong" : "correct"), `${t}: number key + Enter → ${st}`);
    if (t === "pick") pickWrong = true;
    await key("Enter"); await wait(700); continue;
  }
  if (t === "tiles") {
    const press = async (w) => { const i = await keyFor(".bank .tile", `^${w}$`); await key(String(i + 1)); await wait(330); };
    await press("eres"); await key("Backspace"); await wait(400);
    ok(await p.locator(".answer-lines .tile").count() === 0, "Backspace takes the tile back");
    for (const w of ["soy", "de", "Colombia"]) await press(w);
    await p.screenshot({ path: `${OUT}/k04-tiles.png` });
    await key("Enter"); await wait(600); ok(await sheet() === "correct", "tiles by number keys"); await key("Enter"); await wait(700); continue;
  }
  if (t === "type") {
    const prompt = await p.locator(".type-prompt__en").innerText(); await wait(350);
    if (prompt === "Spain") {
      await p.keyboard.type("Espa");
      for (let k = 0; k < 6; k++) await key("Tab"); // á é í ó ú ñ
      ok((await active()).includes("ñ"), "Tab reaches the ñ key on the accent bar: " + await active());
      await wait(400); await p.screenshot({ path: `${OUT}/k05-accent-focus.png` });
      await key("Enter"); await wait(150);
      ok((await active()).includes("type-input"), "accent key returns focus to the input");
      await p.keyboard.type("a");
      ok(await p.inputValue(".type-input") === "España", "typed España with the accent bar: " + await p.inputValue(".type-input"));
    } else {
      await p.keyboard.type("el país");
    }
    await key("Enter"); await wait(600);
    ok(await sheet() === "correct", `type "${prompt}" accepted straight away`);
    await key("Enter"); await wait(700); continue;
  }
  if (t === "match") {
    const pairs = { "España": "Spain", "el país": "the country", "soy": "I am", "eres": "you are", "él": "he" };
    for (const [es, en] of Object.entries(pairs)) {
      const a = await keyFor('.match-card[data-side="es"]', `^${es}$`), c = await keyFor('.match-card[data-side="en"]', `^${en}$`);
      await key(String(a + 1)); await key(String((5 + c + 1) % 10)); await wait(300);
    }
    await wait(900); ok(await sheet() === "correct", "match pairs by number keys"); await key("Enter"); await wait(700); continue;
  }
  if (t === "speak") {
    let k = 0; while (k++ < 15 && !(await active()).includes("mic-btn")) await key("Tab");
    ok((await active()).includes("mic-btn"), `Tab reaches the microphone (${k})`);
    await key("Space"); await wait(1300); ok(await sheet() === "correct", "speak via keyboard (mocked recogniser)"); await key("Enter"); await wait(700); continue;
  }
  break;
}
await wait(2200);
ok(await p.locator(".complete").count() === 1, "lesson completed with the keyboard only");
await p.screenshot({ path: `${OUT}/k06-complete.png` });
await key("Enter"); await wait(1500);
ok(await p.locator(".node.is-done").count() === 1, "Enter on the complete screen returns to the path");
console.log(errors.length ? "PROBLEMS:\n" + errors.join("\n") : "KEYBOARD RUN PASSED, no console errors");
await b.close();
