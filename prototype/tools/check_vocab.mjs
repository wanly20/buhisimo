#!/usr/bin/env node
// Vocabulary checker for the Buhísimo prototype (unit 1.1, lesson 1).
//
//   node prototype/tools/check_vocab.mjs        (from the buhisimo repo root)
//
// Collects every Spanish string in the prototype and fails (exit 1) on any token
// that is not an allowed 1.1 word:
//   * lesson-1-1.js: keys named `es` or ending in `Es` (strings or arrays), plus
//     [[double-bracketed]] Spanish inside any other string;
//   * *.html in prototype/: text inside elements marked lang="es";
//   * path-data.js textbook unit titles are listed but exempt (they are titles).
// Allowed words: rows of data/vocabulary_database.csv, data/helper_words.csv and
// data/names.csv whose Section starts with "1.1". "x/a" adjectives allow
// -o/-a/-os/-as. Matching is case- and punctuation-insensitive, keeps accents,
// and matches the longest multi-word phrase first.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTO = join(HERE, "..");
const DATA = join(PROTO, "..", "data");
const SECTION = "1.1";
const MAX_PHRASE = 6;

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
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[¡!¿?.,;:"“”'‘’…()\[\]—–\-·=]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function expandForms(spanish) {
  // "famoso/a" -> famoso, famosa, famosos, famosas
  const m = spanish.match(/^(.*)o\/a$/);
  if (m) return ["o", "a", "os", "as"].map((e) => m[1] + e);
  return [spanish];
}

function buildDictionary() {
  const entries = new Map(); // phrase (normalised tokens joined by space) -> source
  const add = (spanish, source) => {
    for (const form of expandForms(spanish)) {
      const key = tokens(form).join(" ");
      if (key && !entries.has(key)) entries.set(key, source);
    }
  };
  const load = (file, col = "Spanish") =>
    parseCSV(readFileSync(join(DATA, file), "utf8")).filter((r) => (r.Section || "").startsWith(SECTION));
  for (const r of load("vocabulary_database.csv")) add(r.Spanish, "vocabulary");
  for (const r of load("helper_words.csv")) add(r.Spanish, "helper");
  for (const r of load("names.csv")) add(r.Name, "name");
  return entries;
}

export function check(text, dict) {
  const t = tokens(text);
  const bad = [];
  const used = [];
  let i = 0;
  while (i < t.length) {
    let matched = 0;
    for (let n = Math.min(MAX_PHRASE, t.length - i); n >= 1; n--) {
      const phrase = t.slice(i, i + n).join(" ");
      if (dict.has(phrase)) { matched = n; used.push(phrase); break; }
    }
    if (matched) i += matched;
    else {
      if (!/^\d+$/.test(t[i])) bad.push(t[i]);
      i++;
    }
  }
  return { bad, used };
}

// ---------------------------------------------------------------- collectors
function collectFromObject(obj, path, out) {
  if (typeof obj === "string") return;
  if (Array.isArray(obj)) { obj.forEach((v, i) => collectFromObject(v, `${path}[${i}]`, out)); return; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const p = path ? `${path}.${k}` : k;
      const isEs = k === "es" || /Es$/.test(k);
      if (k === "sayAs") continue; // pronunciation spellings, never displayed
      if (isEs) {
        const list = Array.isArray(v) ? v : [v];
        list.forEach((s, i) => typeof s === "string" && out.push({ where: Array.isArray(v) ? `${p}[${i}]` : p, text: s }));
      } else if (typeof v === "string") {
        for (const m of v.matchAll(/\[\[(.+?)\]\]/g)) out.push({ where: `${p} [[…]]`, text: m[1] });
      } else collectFromObject(v, p, out);
    }
  }
}

function collectFromHTML(file, out) {
  const html = readFileSync(file, "utf8");
  const re = /<([a-z0-9]+)[^>]*\blang="es"[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const m of html.matchAll(re)) {
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (text) out.push({ where: `${relative(PROTO, file)}`, text });
  }
}

// ---------------------------------------------------------------- main
const dict = buildDictionary();
const { lesson } = await import(pathToFileURL(join(PROTO, "lesson-1-1.js")).href);
const { unitsTextbookTitlesEs } = await import(pathToFileURL(join(PROTO, "path-data.js")).href);

const strings = [];
collectFromObject(lesson, "lesson", strings);
for (const f of readdirSync(PROTO)) if (f.endsWith(".html")) collectFromHTML(join(PROTO, f), strings);

let failures = 0;
const usage = new Map();
for (const s of strings) {
  const { bad, used } = check(s.text, dict);
  used.forEach((u) => usage.set(u, (usage.get(u) || 0) + 1));
  if (bad.length) {
    failures++;
    console.log(`FAIL  ${s.where}: "${s.text}"  ->  not allowed: ${bad.join(", ")}`);
  }
}

console.log(`Buhísimo vocabulary check: unit ${SECTION}`);
console.log(`  dictionary: ${dict.size} allowed forms (vocabulary + helpers + names, Section ${SECTION}*)`);
console.log(`  checked:    ${strings.length} Spanish strings (lesson-1-1.js + lang="es" in *.html)`);
console.log(`  words used: ${[...usage.keys()].sort().join(", ")}`);
console.log(`  exempt textbook unit titles (path-data.js): ${Object.values(unitsTextbookTitlesEs).join(" | ")}`);
if (failures) {
  console.log(`\n✗ ${failures} string(s) use words outside unit ${SECTION}.`);
  process.exit(1);
}
console.log(`\n✓ PASS: every Spanish token is an allowed ${SECTION} word.`);
