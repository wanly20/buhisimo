#!/usr/bin/env node
// Vocabulary checker for the Buhísimo prototype (all of Unit 1.1).
//
//   node prototype/tools/check_vocab.mjs             (from the buhisimo repo root)
//   node prototype/tools/check_vocab.mjs --todo      also write prototype/audio/TODO_lines.json
//
// Collects every Spanish string the prototype can show:
//   * lesson-1-1.js and unit-1-1.js: keys named `es` or ending in `Es` (strings, arrays,
//     and objects inside arrays), plus [[double-bracketed]] Spanish inside English text;
//   * radio/*.json episodes (line text);
//   * *.html in prototype/: text inside elements marked lang="es";
//   * path-data.js textbook unit titles are listed but exempt (they are titles); map section
//     titles (split units) must match content/lessons_1.1-1.6.json "parts", which the repo
//     validator checks at their own unit.
// Then runs two checks:
//   1. Unit level (this file): every token is a word of a 1.1 row of
//      vocabulary_database.csv, helper_words.csv or names.csv (o/a words: -o/-a/-os/-as).
//   2. Lesson level: the strings are written to a temporary sentences file, tagged with
//      the lesson that shows them, and checked by the repo validator tools/check_vocab.mjs
//      (introduced-before-use, determiners: nouns are never bare, plural rules).
// It also reports where each line comes from: a sentence of content/sentences_1.1-1.6.json,
// part of one, a lesson item, or "other" (not in the content plan: listed for Juan).
// With --todo it writes the manifest of every spoken line that has no recording yet.
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTO = join(HERE, "..");
const ROOT = join(PROTO, "..");
const DATA = join(ROOT, "data");
const SECTION = "1.1";
const MAX_PHRASE = 6;
const WRITE_TODO = process.argv.includes("--todo");

// ---------------------------------------------------------------- CSV parsing
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

// ---------------------------------------------------------------- tokeniser
export function tokens(text) {
  return text.normalize("NFC").toLowerCase().replace(/[¡!¿?.,;:"“”'‘’…()\[\]—–\-·=]/g, " ").split(/\s+/).filter(Boolean);
}

function expandForms(spanish) {
  const m = spanish.match(/^(.*)o\/a$/);
  if (m) return ["o", "a", "os", "as"].map((e) => m[1] + e);
  return [spanish];
}

function buildDictionary() {
  const entries = new Map();
  const add = (spanish, source) => {
    for (const form of expandForms(spanish)) {
      const key = tokens(form).join(" ");
      if (key && !entries.has(key)) entries.set(key, source);
    }
  };
  const load = (file) => parseCSV(readFileSync(join(DATA, file), "utf8")).filter((r) => (r.Section || "").startsWith(SECTION));
  for (const r of load("vocabulary_database.csv")) add(r.Spanish, "vocabulary");
  for (const r of load("helper_words.csv")) add(r.Spanish, "helper");
  for (const r of load("names.csv")) add(r.Name, "name");
  return entries;
}

export function check(text, dict) {
  const t = tokens(text);
  const bad = [], used = [];
  let i = 0;
  while (i < t.length) {
    let matched = 0;
    for (let n = Math.min(MAX_PHRASE, t.length - i); n >= 1; n--) {
      const phrase = t.slice(i, i + n).join(" ");
      if (dict.has(phrase)) { matched = n; used.push(phrase); break; }
    }
    if (matched) i += matched;
    else { if (!/^\d+$/.test(t[i])) bad.push(t[i]); i++; }
  }
  return { bad, used };
}

// ---------------------------------------------------------------- collectors
// Each string: { where, text, lesson, key, who, spoken, unitOnly }
const NOT_SPOKEN = new Set(["tilesEs", "optionsEs", "bucketsEs", "titleEs", "stampEs", "examplesEs", "specimenEs", "formsEs", "learnedEs"]);
function collect(obj, path, out, ctx) {
  if (obj == null || typeof obj !== "object") return;
  if (Array.isArray(obj)) { obj.forEach((v, i) => collect(v, `${path}[${i}]`, out, ctx)); return; }
  const who = obj.speaker || obj.character || obj.who || ctx.who;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (k === "sayAs") continue; // pronunciation spellings, never displayed
    const isEs = k === "es" || /Es$/.test(k);
    if (isEs) {
      const list = Array.isArray(v) ? v : [v];
      const unitOnly = !!ctx.unitOnly || k === "examplesEs" || k === "specimenEs";
      list.forEach((s, i) => {
        const where = Array.isArray(v) ? `${p}[${i}]` : p;
        const spoken = !NOT_SPOKEN.has(k) && !(k === "answerEs" && Array.isArray(v)) && !unitOnly;
        if (typeof s === "string") out.push({ where, text: s, lesson: ctx.lesson, key: k, who, spoken, unitOnly });
      });
    } else if (typeof v === "string") {
      for (const m of v.matchAll(/\[\[(.+?)\]\]/g)) out.push({ where: `${p} [[…]]`, text: m[1], lesson: ctx.lesson, key: "inline", who, spoken: false, unitOnly: k === "tipEn" });
    } else collect(v, p, out, { ...ctx, who });
  }
}

function collectFromHTML(file, out) {
  const html = readFileSync(file, "utf8");
  const re = /<([a-z0-9]+)[^>]*\blang="es"[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const m of html.matchAll(re)) {
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (text && !text.includes("${")) out.push({ where: relative(PROTO, file), text, lesson: 11, key: "html", spoken: false, unitOnly: true });
  }
}

// ---------------------------------------------------------------- gather
const dict = buildDictionary();
const { LESSONS, ITEMS, STORY } = await import(pathToFileURL(join(PROTO, "unit-1-1.js")).href);
const { unitsTextbookTitlesEs, units: pathUnits } = await import(pathToFileURL(join(PROTO, "path-data.js")).href);

const strings = [];
for (const l of LESSONS) {
  const { story, ...rest } = l;
  collect(rest, `lesson ${l.id}`, strings, { lesson: l.n });
}
collect(STORY, "STORY", strings, { lesson: 9 });
for (const it of ITEMS) collect(it, `ITEMS.${it.id}`, strings, { lesson: it.lesson });
// Radio Búho episodes: reachable from the Radio tab at any time, so checked at the end of 1.1.
const radioDir = join(PROTO, "radio");
for (const f of existsSync(radioDir) ? readdirSync(radioDir) : []) {
  if (!f.endsWith(".json") || f === "episodes.json") continue;
  const ep = JSON.parse(readFileSync(join(radioDir, f), "utf8"));
  if (ep.title) strings.push({ where: `radio/${f} title`, text: ep.title, lesson: 11, key: "radio", spoken: false });
  ep.lines.forEach((l, i) => strings.push({ where: `radio/${f} line ${i + 1}`, text: l.text ?? l.words.map((w) => w.word ?? w.w).join(" "), lesson: 11, key: "radio", spoken: false }));
}
for (const f of readdirSync(PROTO)) if (f.endsWith(".html")) collectFromHTML(join(PROTO, f), strings);

// ---------------------------------------------------------------- 1. unit level
let failures = 0;
const usage = new Map();
for (const s of strings) {
  const { bad, used } = check(s.text, dict);
  used.forEach((u) => usage.set(u, (usage.get(u) || 0) + 1));
  if (bad.length) { failures++; console.log(`FAIL  ${s.where}: "${s.text}"  ->  not allowed: ${bad.join(", ")}`); }
}
const unique = [...new Set(strings.map((s) => s.text))];
console.log(`Buhísimo prototype vocabulary check: unit ${SECTION}`);
console.log(`  dictionary: ${dict.size} allowed forms (vocabulary + helpers + names, Section ${SECTION}*)`);
console.log(`  checked:    ${strings.length} Spanish strings (${unique.length} different) in lesson-1-1.js, unit-1-1.js, radio/*.json and lang="es" in *.html`);
console.log(`  words used: ${[...usage.keys()].sort((a, b) => a.localeCompare(b, "es")).join(", ")}`);
console.log(`  exempt textbook unit titles (path-data.js): ${Object.values(unitsTextbookTitlesEs).join(" | ")}`);
// Map sections of a split unit (path-data.js titleEs): the repo validator checks each title at
// its own unit through content/lessons_1.1-1.6.json "parts"; here they must match that manifest.
const manifestParts = JSON.parse(readFileSync(join(ROOT, "content", "lessons_1.1-1.6.json"), "utf8")).parts ?? [];
for (const u of pathUnits.filter((x) => x.titleEs)) {
  const part = manifestParts.find((p) => p.id === u.id);
  if (!part || part.titleEs !== u.titleEs || part.unit !== u.unit) { failures++; console.log(`FAIL  path-data.js section ${u.id}: "${u.titleEs}" doesn't match a part in content/lessons_1.1-1.6.json`); }
}
console.log(`  map section titles (path-data.js = lessons manifest "parts", checked at their unit by tools/check_vocab.mjs): ${pathUnits.filter((x) => x.titleEs).map((x) => `${x.id} ${x.titleEs}`).join(" | ") || "none"}`);
console.log(failures ? `  ✗ unit level: ${failures} string(s) use words outside unit ${SECTION}` : `  ✓ unit level: every Spanish token is an allowed ${SECTION} word`);

// ---------------------------------------------------------------- provenance
const plan = JSON.parse(readFileSync(join(ROOT, "content", "sentences_1.1-1.6.json"), "utf8")).filter((s) => s.unit === "1.1");
const norm = (t) => t.normalize("NFC").trim();
const planSet = new Set(plan.map((s) => norm(s.es)));
const planEn = new Map(plan.map((s) => [norm(s.es), s.en]));
const itemSet = new Set(ITEMS.flatMap((it) => [it.es, ...(it.formsEs || [])]).map(norm));
const fragments = new Set();
for (const s of plan) {
  for (const side of s.es.split(/\s+—\s+/)) {
    fragments.add(norm(side));
    for (const q of side.split(/(?<=[.!?])\s+(?=[¿¡A-ZÁÉÍÓÚ])/)) fragments.add(norm(q));
  }
  for (const t of s.es.split(/\s+/)) fragments.add(t.replace(/[¡!¿?.,;:…—]/g, "").toLowerCase());
}
const origin = (t) => (planSet.has(norm(t)) ? "sentence" : itemSet.has(norm(t)) ? "item"
  : fragments.has(norm(t)) || fragments.has(norm(t).toLowerCase()) ? "part" : "other");
const counts = { sentence: 0, item: 0, part: 0, other: 0 };
const others = new Map();
for (const t of unique) {
  const o = origin(t);
  counts[o]++;
  if (o === "other") others.set(t, [...new Set(strings.filter((s) => s.text === t).map((s) => s.where.replace(/\.steps.*|\.\w+(\[\d+\])?$/, "")))]);
}
console.log(`  where the ${unique.length} lines come from: ${counts.sentence} plan sentences, ${counts.item} lesson items, ${counts.part} parts of plan sentences (one side of a "—", one sentence of two, a word-bank tile), ${counts.other} other`);
for (const [t, w] of others) console.log(`    other: "${t}"  (${w.join(", ")})`);

// ---------------------------------------------------------------- 2. lesson level (repo validator)
const tmp = mkdtempSync(join(tmpdir(), "buho-vocab-"));
const tmpFile = join(tmp, "prototype_sentences.json");
const seen = new Set();
const forValidator = [];
for (const s of strings) {
  if (s.unitOnly) continue; // design-system examples and tips: unit level only
  const k = `${s.lesson}|${s.text}`;
  if (seen.has(k)) continue;
  seen.add(k);
  forValidator.push({ unit: SECTION, lesson: s.lesson, kind: "prototype", es: s.text, en: planEn.get(norm(s.text)) || s.where });
}
writeFileSync(tmpFile, JSON.stringify(forValidator, null, 1));
const r = spawnSync(process.execPath, [join(ROOT, "tools", "check_vocab.mjs"), "--sentences", tmpFile], { encoding: "utf8" });
const out = (r.stdout || "") + (r.stderr || "");
for (const l of out.split("\n").filter((x) => /^FAIL/.test(x))) console.log(`  ${l}`);
const summary = out.split("\n").find((l) => /^(✓ PASS|✗ FAIL)/.test(l)) || "(no summary)";
console.log(`  lesson level (tools/check_vocab.mjs --sentences, ${forValidator.length} lesson-tagged lines): ${summary}`);
if (r.status !== 0) failures++;

// ---------------------------------------------------------------- audio TODO
if (WRITE_TODO) writeTodo();

function writeTodo() {
  const clips = {};
  for (const m of ["manifest.json", "manifest-extra.json", "manifest-l2.json"]) {
    const p = join(PROTO, "audio", m);
    if (existsSync(p)) for (const [t, by] of Object.entries(JSON.parse(readFileSync(p, "utf8")).clips)) clips[t] = { ...clips[t], ...by };
  }
  // Voice rules (Juan, Oct 2026; lesson_audio.py): every neutral line in both Marías and Raúl;
  // él / él es only in Raúl (and ella only in the Marías); Buhísimo's on-screen lines also in
  // his two voices; story lines and passport answers in the speaker's voice: Matilda = the
  // Marías, Max and the traveller = Raúl (no kid voices yet).
  const NEUTRAL = ["maria_bogota", "maria_paisa", "raul"], MARIA = ["maria_bogota", "maria_paisa"], RAUL = ["raul"], BUHO = ["buho_profesor", "buho_abuelo"];
  const SPEAKER = { buho: "Buhísimo", matilda: "Matilda", max: "Max", traveller: "A traveller" };
  const want = new Map(); // text -> { voices, where, speaker }
  const add = (text, voices, where, speaker) => {
    if (!want.has(text)) want.set(text, { voices: new Set(), where: new Set(), speaker: new Set() });
    const w = want.get(text);
    voices.forEach((v) => w.voices.add(v));
    w.where.add(where);
    if (speaker) w.speaker.add(speaker);
  };
  const voicesOf = (who) => (who.startsWith("owl") || who === "buho" ? BUHO : who.startsWith("matilda") ? MARIA : RAUL);
  for (const s of strings) {
    if (!s.spoken) continue;
    const who = String(s.who || "");
    const step = s.where.match(/^lesson (\S+)\.steps\[(\d+)\]/);
    const where = step ? `${step[1]} step ${+step[2] + 1}` : s.where.replace(/\.(es|\w+Es)(\[\d+\])?$/, "");
    const t = s.text, low = t.toLowerCase();
    const isPassport = step && /passport/.test(JSON.stringify(LESSONS.find((l) => l.id === step[1])?.steps[+step[2]]?.type || ""));
    if (s.where.startsWith("STORY")) add(t, voicesOf(who), where, SPEAKER[who]);
    else if (s.key === "askEs") add(t, BUHO, where, "Buhísimo");
    else if (isPassport && s.key === "answerEs") add(t, voicesOf(who), where, SPEAKER[who] || who);
    else if (s.key === "praiseEs") add(t, BUHO, where, "Buhísimo");
    else if (low === "él" || low === "él es") add(t, RAUL, where);
    else if (low === "ella") add(t, MARIA, where);
    else {
      add(t, NEUTRAL, where);
      if (who.startsWith("owl") && ["es", "promptEs"].includes(s.key)) add(t, BUHO, where, "Buhísimo");
    }
  }
  const sayAs = LESSONS[0].sayAs || {};
  const ttsText = (t) => {
    let x = t;
    for (const [w, say] of Object.entries(sayAs)) x = x.replaceAll(w, say);
    x = /^[a-záéíóúñ]/.test(x) ? x[0].toUpperCase() + x.slice(1) : x;
    return /[.?!…]$/.test(x) ? x : `${x}.`;
  };
  // Same slug as lesson_audio.py: ascii-folded words + the first 6 hex of sha1(text).
  const slug = (text) => {
    const a = text.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\x00-\x7f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
    return `${a}-${createHash("sha1").update(text, "utf8").digest("hex").slice(0, 6)}`;
  };
  const lines = [];
  let none = 0;
  for (const [text, w] of [...want].sort((a, b) => a[0].localeCompare(b[0], "es"))) {
    const voices = [...w.voices].sort();
    const missing = voices.filter((v) => !clips[text]?.[v]);
    if (missing.length === voices.length && !clips[text]) none++;
    for (const voice of missing) {
      lines.push({ text, tts: ttsText(text), voice, role: voice.startsWith("buho") ? "buho" : voice === "raul" ? "raul" : "maria",
        speaker: [...w.speaker].join(", ") || "(any: lesson voice)", slug: slug(text), file: `audio/${voice}/${slug(text)}.mp3`, where: [...w.where].sort() });
    }
  }
  const texts = new Set(lines.map((l) => l.text)).size;
  const outFile = join(PROTO, "audio", "TODO_lines.json");
  writeFileSync(outFile, JSON.stringify({
    _about: "Every Spanish line the Unit 1.1 prototype can say that has no recording yet, one entry per voice. Same fields as video_generation/scripts/voice_tools/lesson_audio.py clips.json (text, tts, voice, slug), plus the target file, the role, who says it and where it is used. Generated by prototype/tools/check_vocab.mjs --todo; do not edit by hand. Recording needs the GPU (Qwen3-TTS): ask Juan first.",
    voices: { maria_bogota: "co_f_adult_bogota.wav", maria_paisa: "co_f_adult_paisa.wav", raul: "co_m_30.wav", buho_profesor: "co_m_old_profesor.wav", buho_abuelo: "co_m_old_abuelo.wav" },
    summary: { linesWithNoRecordingAtAll: none, linesMissingAtLeastOneVoice: texts, clipsToRecord: lines.length },
    lines,
  }, null, 1) + "\n");
  console.log(`  audio TODO: ${none} lines have no recording at all; ${texts} lines miss at least one voice; ${lines.length} clips to record -> ${relative(ROOT, outFile)}`);
}

if (failures) { console.log(`\n✗ FAIL`); process.exit(1); }
console.log(`\n✓ PASS: every Spanish line in the prototype uses allowed 1.1 words, introduced by its lesson.`);
