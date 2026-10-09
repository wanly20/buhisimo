#!/usr/bin/env node
// Buhísimo vocabulary checker (unit-aware). Node 18+, no dependencies.
//
//   node tools/check_vocab.mjs                      check content/sentences_1.1-1.6.json
//   node tools/check_vocab.mjs --strict             also fail sentences that wait on a proposal
//   node tools/check_vocab.mjs --approve P6,P7      treat these proposals as approved ("all" = every one)
//   node tools/check_vocab.mjs --unit 1.3 --text "Tengo doce años."   check one string
//   node tools/check_vocab.mjs --unit 1.3 --list    print every form allowed at 1.3
//   options: --sentences <file> --lessons <file> --proposals <file> --data <dir> --verbose
//
// Rules implemented
//   * Allowed words: rows of data/vocabulary_database.csv (Spanish), data/helper_words.csv
//     (Spanish) and data/names.csv (Name). A row is allowed at unit U when its Section
//     is <= U, comparing "major.minor" numerically (1.2 < 1.10 < 2.1). Rows without a
//     Section are not allowed anywhere.
//   * Forms generated automatically from a row (nothing else is):
//       - o/a words: rojo/a -> rojo, roja, rojos, rojas (also inside phrases);
//       - el/la + o/a noun: el/la amigo/a -> el amigo, la amiga;
//       - optional parts: me gusta (mucho) -> me gusta, me gusta mucho;
//       - word(a) and x/y gender pairs: jugador(a) -> jugador, jugadora; actor/actriz;
//       - "…" is dropped: hay… -> hay.
//   * Tokenising: NFC, lower case, punctuation removed (¡!¿?.,;:"'…()—–- etc.), accents
//     kept (si ≠ sí). Greedy longest match over phrases (up to 8 tokens). Digits are fine.
//   * Unit-level check: every sentence must tokenise with the words allowed at its unit.
//   * Pending proposals: a sentence may carry "needs": ["P4", ...]. It then passes as
//     PENDING if it tokenises once those proposals (content/proposals_*.json) are added,
//     and fails if anything else is missing. Proposal rules "bare-nouns" (a CSV noun
//     without its article) and "noun-plurals" (regular plural of a CSV noun) are only
//     applied to sentences that name them.
//   * Lesson-level check (when a lessons manifest exists): walking the lessons in order,
//     a sentence may only use items introduced in its own or an earlier lesson. Also
//     reports items introduced before their CSV section, lesson sizes, coverage and
//     conjugation-lesson eligibility (>= 4 forms of a Lemma in helper_words.csv,
//     counting the infinitive when it is itself a row).
// Exit code 1 on any failure.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const MAX_PHRASE = 8;
const MAX_NEW_PER_LESSON = 7;

// ------------------------------------------------------------------ arguments
const argv = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);
const DATA = resolve(opt("data", join(ROOT, "data")));
const SENTENCES = resolve(opt("sentences", join(ROOT, "content", "sentences_1.1-1.6.json")));
const LESSONS = resolve(opt("lessons", join(ROOT, "content", "lessons_1.1-1.6.json")));
const PROPOSALS = resolve(opt("proposals", join(ROOT, "content", "proposals_1.1-1.6.json")));
const STRICT = flag("strict");
const VERBOSE = flag("verbose");
const rel = (p) => relative(ROOT, p) || p;

// ------------------------------------------------------------------ CSV parsing
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
  if (field || row.length) { row.push(field); if (row.some((f) => f !== "")) rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim().replace(/^﻿/, ""), (r[i] ?? "").trim()])));
}

// ------------------------------------------------------------------ sections
export function parseSection(s) {
  const m = /^\s*(\d+)\.(\d+)/.exec(String(s ?? ""));
  return m ? [Number(m[1]), Number(m[2])] : null;
}
const cmpSec = (a, b) => a[0] - b[0] || a[1] - b[1];
const secStr = (s) => (s ? `${s[0]}.${s[1]}` : "—");

// ------------------------------------------------------------------ tokeniser
export function tokens(text) {
  return String(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[¡!¿?.,;:"“”'‘’…()\[\]{}«»—–\-·=\/]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
const keyOf = (s) => tokens(s).join(" ");

// ------------------------------------------------------------------ form expansion
// "me gusta (mucho)" -> ["me gusta", "me gusta mucho"]. A "(…)" glued to a word, as in
// "jugador(a)", is a gender suffix and is left for wordForms().
function expandOptional(s) {
  const m = /(^|\s)\(([^)]*)\)/.exec(s);
  if (!m) return [s];
  const before = s.slice(0, m.index) + m[1];
  const after = s.slice(m.index + m[0].length);
  return [
    ...expandOptional((before + after).replace(/\s+/g, " ").trim()),
    ...expandOptional((before + m[2] + after).replace(/\s+/g, " ").trim()),
  ];
}

// One word -> its forms with gender/number tags (null = not marked).
function wordForms(w) {
  let m;
  if ((m = /^(.+)o\/a$/.exec(w))) {
    return [
      { form: m[1] + "o", g: "m", n: "s" }, { form: m[1] + "a", g: "f", n: "s" },
      { form: m[1] + "os", g: "m", n: "p" }, { form: m[1] + "as", g: "f", n: "p" },
    ];
  }
  if ((m = /^(.+)\(a\)$/.exec(w))) return [{ form: m[1], g: "m", n: "s" }, { form: m[1] + "a", g: "f", n: "s" }];
  if ((m = /^([^/]+)\/([^/]+)$/.exec(w)) && w !== "el/la") return [{ form: m[1], g: "m", n: "s" }, { form: m[2], g: "f", n: "s" }];
  return [{ form: w, g: null, n: null }];
}

function product(lists) {
  return lists.reduce((acc, list) => acc.flatMap((a) => list.map((x) => [...a, x])), [[]]);
}

const ARTICLES = new Set(["el", "la", "los", "las"]);
const NOT_NOUNS = new Set(["el primero", "el uno"]); // "the first (of the month)": not nouns

// A data row -> { forms: [phrase], bare: [phrase], plurals: [phrase] }.
// forms are always allowed; bare/plurals only under the proposal rules.
function rowForms(spanish, { capitals = false } = {}) {
  const clean = spanish.normalize("NFC").replace(/…|\.\.\./g, "").replace(/\s+/g, " ").trim();
  const forms = new Set(), bare = new Set(), plurals = new Set();
  for (const variant of expandOptional(clean)) {
    let words = variant.split(" ");
    let article = null;
    if (words[0].toLowerCase() === "el/la") { article = "el/la"; words = words.slice(1); }
    else if (ARTICLES.has(words[0].toLowerCase()) && words.length > 1) { article = words[0].toLowerCase(); words = words.slice(1); }
    for (const combo of product(words.map(wordForms))) {
      const gs = combo.map((c) => c.g).filter(Boolean), ns = combo.map((c) => c.n).filter(Boolean);
      if (new Set(gs).size > 1 || new Set(ns).size > 1) continue; // keep agreement inside a phrase
      const phrase = combo.map((c) => c.form).join(" ");
      const g = gs[0] ?? null, n = ns[0] ?? null;
      if (article === "el/la") {
        if (n !== "p") {
          if (g !== "f") forms.add(`el ${phrase}`);
          if (g !== "m") forms.add(`la ${phrase}`);
        }
      } else if (article) {
        if (n !== "p") forms.add(`${article} ${phrase}`);
      } else forms.add(phrase);
      if (article && !NOT_NOUNS.has(clean.toLowerCase())) {
        bare.add(phrase);
        const singularRow = article === "el" || article === "la" || article === "el/la";
        if (singularRow && n === null && !capitals) plurals.add(pluralise(phrase));
      }
    }
  }
  return { forms: [...forms], bare: [...bare], plurals: [...plurals].filter(Boolean) };
}

// Regular Spanish plural of the first word of a noun phrase ("hoja de papel" -> "hojas de papel").
export function pluralise(phrase) {
  const [w, ...rest] = phrase.split(" ");
  const lower = w.toLowerCase();
  const vowelGroups = (lower.match(/[aeiouáéíóúü]+/g) || []).length;
  let p;
  if (/[aeiouáéó]$/.test(lower)) p = w + "s";
  else if (/[íú]$/.test(lower)) p = w + "es";
  else if (/z$/.test(lower)) p = w.slice(0, -1) + "ces";
  else if (/[sx]$/.test(lower)) {
    if (/aís$/.test(lower)) p = w + "es";                                  // país -> países
    else if (/[áéó]s$/.test(lower)) p = w.slice(0, -2) + unaccent(w.slice(-2, -1)) + "ses";
    else if (vowelGroups <= 1) p = w + "es";                                // mes -> meses
    else p = w;                                                              // cumpleaños, sacapuntas
  } else if (/[áéíóú]n$/.test(lower)) p = w.slice(0, -2) + unaccent(w.slice(-2, -1)) + "nes";
  else if (/t$/.test(lower)) p = w + "s";                                   // carnet -> carnets
  else p = w + "es";                                                         // capital -> capitales
  return [p, ...rest].join(" ");
}
function unaccent(ch) { return ch.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }

// ------------------------------------------------------------------ load data
function loadCSV(file) {
  const p = join(DATA, file);
  if (!existsSync(p)) { console.error(`Missing ${rel(p)}`); process.exit(2); }
  return parseCSV(readFileSync(p, "utf8"));
}
const vocabRows = loadCSV("vocabulary_database.csv");
const helperRows = loadCSV("helper_words.csv");
const nameRows = loadCSV("names.csv");

// items: one per data row. entries: one per allowed surface form.
const items = new Map(); // itemKey -> {key, file, section, english, type, lemma, person, isName}
const entries = [];      // {key, item, section, via, rule?, proposal?}
const unsectioned = [];

function addItem(file, spanish, row, extra = {}) {
  const section = parseSection(row.Section);
  if (!spanish) return;
  if (!section) { unsectioned.push(`${spanish} (${file})`); return; }
  const itemKey = spanish.normalize("NFC");
  if (!items.has(itemKey) || cmpSec(section, items.get(itemKey).section) < 0) {
    items.set(itemKey, { key: itemKey, file, section, english: row.English ?? "", type: row.Type ?? "", lemma: row.Lemma ?? "", person: row.Person ?? "", ...extra });
  }
  const capitals = /^y/i.test(row.capitals ?? "") || !!extra.isName;
  const { forms, bare, plurals } = extra.isName ? { forms: [spanish], bare: [], plurals: [] } : rowForms(spanish, { capitals });
  for (const f of forms) entries.push({ key: keyOf(f), item: itemKey, section, via: "row" });
  for (const f of bare) entries.push({ key: keyOf(f), item: itemKey, section, via: "rule", rule: "bare-nouns" });
  for (const f of plurals) entries.push({ key: keyOf(f), item: itemKey, section, via: "rule", rule: "noun-plurals" });
}
for (const r of vocabRows) addItem("vocabulary", r.Spanish, r);
for (const r of helperRows) addItem("helper", r.Spanish, r);
for (const r of nameRows) addItem("name", r.Name, r, { isName: true });

// ------------------------------------------------------------------ proposals
const proposals = new Map();
if (existsSync(PROPOSALS)) {
  const doc = JSON.parse(readFileSync(PROPOSALS, "utf8"));
  for (const p of doc.proposals ?? []) {
    proposals.set(p.id, p);
    for (const w of p.words ?? []) {
      const section = parseSection(w.section);
      const item = `${p.id}:${w.es}`;
      const { forms, bare, plurals } = rowForms(w.es);
      for (const f of forms) entries.push({ key: keyOf(f), item, section, via: "proposal", proposal: p.id });
      for (const f of bare) entries.push({ key: keyOf(f), item, section, via: "rule", rule: "bare-nouns", proposal: p.id });
      for (const f of plurals) entries.push({ key: keyOf(f), item, section, via: "rule", rule: "noun-plurals", proposal: p.id });
    }
  }
}
const ruleOf = (pid) => proposals.get(pid)?.rule ?? null;
const approveArg = opt("approve", "");
const APPROVED = new Set(approveArg === "all" ? [...proposals.keys()] : approveArg.split(",").map((s) => s.trim()).filter(Boolean));
for (const id of APPROVED) if (!proposals.has(id)) { console.error(`--approve: unknown proposal ${id}`); process.exit(2); }

// ------------------------------------------------------------------ dictionaries
// ctx: { maxSection, extra: Set(pid), introduced?: Set(itemKey), introducedPending?: Set(pid) }
function buildDict({ maxSection, extra = new Set(), introduced = null, introducedPending = null }) {
  const dict = new Map();
  const rules = new Set([...extra].map(ruleOf).filter(Boolean));
  const pendingOk = (pid) => !introducedPending || introducedPending.has(pid) || APPROVED.has(pid);
  for (const e of entries) {
    if (maxSection && cmpSec(e.section, maxSection) > 0) continue;
    if (e.via === "row") { if (introduced && !introduced.has(e.item)) continue; }
    else if (e.via === "rule") {
      if (!rules.has(e.rule)) continue;
      const pid = [...extra].find((id) => ruleOf(id) === e.rule);
      if (!pendingOk(pid)) continue;
      if (e.proposal) { if (!extra.has(e.proposal) || !pendingOk(e.proposal)) continue; }
      else if (introduced && !introduced.has(e.item)) continue;
    } else if (e.via === "proposal") {
      if (!extra.has(e.proposal) || !pendingOk(e.proposal)) continue;
    }
    if (!dict.has(e.key)) dict.set(e.key, e);
  }
  return dict;
}

export function check(text, dict) {
  const t = tokens(text);
  const bad = [], used = [];
  let i = 0;
  while (i < t.length) {
    let matched = 0;
    for (let n = Math.min(MAX_PHRASE, t.length - i); n >= 1; n--) {
      const phrase = t.slice(i, i + n).join(" ");
      if (dict.has(phrase)) { matched = n; used.push(dict.get(phrase)); break; }
    }
    if (matched) i += matched;
    else { if (!/^\d+$/.test(t[i])) bad.push(t[i]); i++; }
  }
  return { bad, used };
}

// Classify one sentence against a dictionary factory. Returns {status, bad, notes, used}.
function classify(s, makeDict) {
  const needs = (s.needs ?? []).filter((p) => !APPROVED.has(p));
  const unknown = (s.needs ?? []).filter((p) => !proposals.has(p));
  if (unknown.length) return { status: "FAIL", bad: [], notes: [`unknown proposal ${unknown.join(", ")}`], used: [] };
  const base = check(s.es, makeDict(new Set(APPROVED)));
  if (!needs.length) return { status: base.bad.length ? "FAIL" : "OK", bad: base.bad, notes: [], used: base.used };
  const all = check(s.es, makeDict(new Set([...APPROVED, ...needs])));
  if (all.bad.length) return { status: "FAIL", bad: all.bad, notes: [`even with ${needs.join("+")}`], used: all.used };
  const notes = [];
  if (!base.bad.length) notes.push(`declares ${needs.join("+")} but passes without it`);
  else for (const p of needs) {
    const without = check(s.es, makeDict(new Set([...APPROVED, ...needs.filter((x) => x !== p)])));
    if (!without.bad.length) notes.push(`${p} not needed`);
  }
  return { status: base.bad.length ? "PENDING" : "OK", bad: base.bad, notes, used: all.used, needs };
}

// ------------------------------------------------------------------ ad-hoc modes
const unitArg = opt("unit");
if (unitArg && (opt("text") || flag("list"))) {
  const maxSection = parseSection(unitArg);
  if (!maxSection) { console.error(`--unit: expected something like 1.3`); process.exit(2); }
  const extra = new Set(APPROVED);
  if (flag("list")) {
    const dict = buildDict({ maxSection, extra });
    console.log([...dict.keys()].sort((a, b) => a.localeCompare(b, "es")).join("\n"));
    console.log(`\n${dict.size} forms allowed at unit ${unitArg}${APPROVED.size ? ` (with ${[...APPROVED].join(", ")})` : ""}`);
    process.exit(0);
  }
  const text = opt("text");
  const r = check(text, buildDict({ maxSection, extra }));
  console.log(`"${text}" at unit ${unitArg}`);
  console.log(`  matched: ${r.used.map((e) => `[${e.key}]`).join(" ") || "—"}`);
  if (r.bad.length) {
    for (const b of r.bad) {
      const later = entries.filter((e) => e.key === b && e.via === "row").map((e) => secStr(e.section));
      const prop = entries.filter((e) => e.key === b && e.via === "proposal").map((e) => e.proposal);
      console.log(`  ✗ ${b}${later.length ? ` (introduced in ${[...new Set(later)].join(", ")})` : ""}${prop.length ? ` (proposal ${[...new Set(prop)].join(", ")})` : ""}`);
    }
    process.exit(1);
  }
  console.log("  ✓ allowed");
  process.exit(0);
}

// ------------------------------------------------------------------ main check
if (!existsSync(SENTENCES)) { console.error(`Missing ${rel(SENTENCES)}`); process.exit(2); }
const sentences = JSON.parse(readFileSync(SENTENCES, "utf8"));
let failures = 0;
const out = [];
const log = (s = "") => out.push(s);

log(`Buhísimo vocabulary check: ${rel(SENTENCES)}`);
log(`  data: ${vocabRows.length} vocabulary rows, ${helperRows.length} helper rows, ${nameRows.length} names` +
    (unsectioned.length ? ` (${unsectioned.length} names have no Section and are never allowed)` : ""));
log(`  proposals: ${proposals.size} in ${rel(PROPOSALS)}; approved for this run: ${APPROVED.size ? [...APPROVED].join(", ") : "none"}${STRICT ? "; --strict: pending counts as failure" : ""}`);

// --- structural checks on the sentence file
const seen = new Map();
for (const [i, s] of sentences.entries()) {
  const where = `#${i + 1}`;
  if (!parseSection(s.unit) || !Number.isInteger(s.lesson) || !s.es || !s.en) {
    log(`FAIL  ${where}: needs unit (e.g. "1.3"), integer lesson, es and en`); failures++;
  }
  const k = keyOf(s.es);
  if (seen.has(k)) log(`WARN  ${s.unit} L${s.lesson}: duplicate of ${seen.get(k)}: "${s.es}"`);
  else seen.set(k, `${s.unit} L${s.lesson}`);
}

// --- unit-level check (the hard rule)
log("");
log("Unit-level check: each sentence may use rows whose Section ≤ its unit");
const byUnit = new Map();
const pendingBy = new Map();
const pluralsUsed = new Set(), bareUsed = new Set();
const unitDictCache = new Map();
const unitDict = (unit) => (extra) => {
  const k = `${unit}|${[...extra].sort().join(",")}`;
  if (!unitDictCache.has(k)) unitDictCache.set(k, buildDict({ maxSection: parseSection(unit), extra }));
  return unitDictCache.get(k);
};
const unitResults = [];
for (const s of sentences) {
  const r = classify(s, unitDict(s.unit));
  unitResults.push(r);
  if (!byUnit.has(s.unit)) byUnit.set(s.unit, { total: 0, ok: 0, pending: 0, fail: 0 });
  const u = byUnit.get(s.unit);
  u.total++;
  const tag = `${s.unit} L${s.lesson}`;
  if (r.status === "OK") u.ok++;
  else if (r.status === "PENDING") {
    u.pending++;
    for (const p of r.needs) pendingBy.set(p, (pendingBy.get(p) ?? 0) + 1);
    if (STRICT) { failures++; log(`FAIL  ${tag}: "${s.es}" -> waits on ${r.needs.join("+")} (not allowed yet: ${r.bad.join(", ")})`); }
    else if (VERBOSE) log(`PEND  ${tag}: "${s.es}" -> ${r.needs.join("+")} (${r.bad.join(", ")})`);
  } else {
    u.fail++; failures++;
    log(`FAIL  ${tag}: "${s.es}" -> not allowed at ${s.unit}: ${r.bad.join(", ") || "—"}${r.notes.length ? ` (${r.notes.join("; ")})` : ""}`);
  }
  for (const n of r.status !== "FAIL" ? r.notes : []) log(`WARN  ${tag}: "${s.es}" -> ${n}`);
  for (const e of r.used) {
    if (e.rule === "noun-plurals") pluralsUsed.add(e.key);
    if (e.rule === "bare-nouns") bareUsed.add(e.key);
  }
}
log("  unit  sentences  ready  pending  fail");
for (const [unit, u] of [...byUnit].sort((a, b) => cmpSec(parseSection(a[0]), parseSection(b[0])))) {
  log(`  ${unit.padEnd(4)}  ${String(u.total).padStart(9)}  ${String(u.ok).padStart(5)}  ${String(u.pending).padStart(7)}  ${String(u.fail).padStart(4)}`);
}
const tot = [...byUnit.values()].reduce((a, u) => ({ total: a.total + u.total, ok: a.ok + u.ok, pending: a.pending + u.pending, fail: a.fail + u.fail }), { total: 0, ok: 0, pending: 0, fail: 0 });
log(`  all   ${String(tot.total).padStart(9)}  ${String(tot.ok).padStart(5)}  ${String(tot.pending).padStart(7)}  ${String(tot.fail).padStart(4)}`);
if (pendingBy.size) {
  log(`  waiting on proposals (sentences per proposal; one sentence can wait on several):`);
  for (const [p, n] of [...pendingBy].sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))) log(`    ${p.padEnd(4)} ${String(n).padStart(3)}  ${proposals.get(p).title}`);
}
if (bareUsed.size) log(`  nouns used without article (P7): ${[...bareUsed].sort().join(", ")}`);
if (pluralsUsed.size) log(`  plural forms used (P8, please check): ${[...pluralsUsed].sort().join(", ")}`);

// --- lesson-level check
if (existsSync(LESSONS)) {
  const manifest = JSON.parse(readFileSync(LESSONS, "utf8")).lessons;
  log("");
  log(`Lesson-level check (${rel(LESSONS)}): each sentence may use only items introduced in its lesson or before`);
  const order = new Map(manifest.map((l, i) => [`${l.unit}|${l.lesson}`, i]));
  const introduced = new Set(), introducedPending = new Set(), introducedAt = new Map();
  const lessonSentences = new Map();
  for (const s of sentences) {
    const k = `${s.unit}|${s.lesson}`;
    if (!order.has(k)) { failures++; log(`FAIL  ${s.unit} L${s.lesson}: lesson not in the manifest ("${s.es}")`); continue; }
    if (!lessonSentences.has(k)) lessonSentences.set(k, []);
    lessonSentences.get(k).push(s);
  }
  let lessonFails = 0, sizeWarnings = 0;
  const firstIntro = new Map();
  for (const l of manifest) for (const it of l.new ?? []) if (!firstIntro.has(it.normalize("NFC"))) firstIntro.set(it.normalize("NFC"), `${l.unit} L${l.lesson}`);
  for (const l of manifest) for (const pid of l.pendingNew ?? []) if (!firstIntro.has(pid)) firstIntro.set(pid, `${l.unit} L${l.lesson}`);
  const hint = (b) => {
    const at = [...new Set(entries.filter((e) => e.key === b).map((e) => firstIntro.get(e.via === "row" ? e.item : e.proposal ?? e.item)).filter(Boolean))];
    return at.length ? `${b} (introduced in ${at.join(" / ")})` : b;
  };
  for (const l of manifest) {
    const sec = parseSection(l.unit);
    const tag = `${l.unit} L${l.lesson}`;
    const counted = [];
    for (const it of l.new ?? []) {
      const key = it.normalize("NFC");
      const item = items.get(key);
      if (!item) { failures++; lessonFails++; log(`FAIL  ${tag}: "${it}" is not a row in vocabulary, helper_words or names`); continue; }
      if (cmpSec(item.section, sec) > 0) { failures++; lessonFails++; log(`FAIL  ${tag}: "${it}" is a ${secStr(item.section)} word: move it to an earlier Section in the CSV first`); }
      if (introducedAt.has(key)) log(`WARN  ${tag}: "${it}" was already introduced in ${introducedAt.get(key)}`);
      introduced.add(key); introducedAt.set(key, tag);
      if (!item.isName) counted.push(it);
    }
    for (const pid of l.pendingNew ?? []) {
      if (!proposals.has(pid)) { failures++; lessonFails++; log(`FAIL  ${tag}: pendingNew ${pid} is not a proposal`); continue; }
      introducedPending.add(pid);
    }
    if (counted.length > MAX_NEW_PER_LESSON) { sizeWarnings++; log(`WARN  ${tag}: ${counted.length} new items (names not counted), above ${MAX_NEW_PER_LESSON}: ${counted.join(", ")}`); }
    const dictFor = (extra) => buildDict({ maxSection: sec, extra, introduced, introducedPending });
    for (const s of lessonSentences.get(`${l.unit}|${l.lesson}`) ?? []) {
      const r = classify(s, dictFor);
      if (r.status === "FAIL") {
        failures++; lessonFails++;
        log(`FAIL  ${tag}: "${s.es}" -> not introduced yet: ${r.bad.map(hint).join(", ")}${r.notes.length ? ` (${r.notes.join("; ")})` : ""}`);
      }
    }
  }
  // coverage: every row in the manifest's sections should be introduced somewhere
  const secs = manifest.map((l) => parseSection(l.unit));
  const lo = secs.reduce((a, b) => (cmpSec(a, b) <= 0 ? a : b)), hi = secs.reduce((a, b) => (cmpSec(a, b) >= 0 ? a : b));
  const missing = [...items.values()].filter((it) => cmpSec(it.section, lo) >= 0 && cmpSec(it.section, hi) <= 0 && !introduced.has(it.key));
  const counts = manifest.reduce((m, l) => m.set(l.unit, (m.get(l.unit) ?? 0) + 1), new Map());
  log(`  lessons: ${manifest.length} (${[...counts].map(([u, n]) => `${u}: ${n}`).join(", ")}); items introduced: ${introduced.size}`);
  log(`  lesson-level failures: ${lessonFails}; lessons above ${MAX_NEW_PER_LESSON} new items: ${sizeWarnings}`);
  if (missing.length) log(`  WARN not introduced in any lesson (${secStr(lo)}–${secStr(hi)} rows): ${missing.map((m) => `${m.key} [${secStr(m.section)} ${m.file}]`).join(", ")}`);
  else log(`  coverage: every vocabulary, helper and name row in ${secStr(lo)}–${secStr(hi)} is introduced`);

  // conjugation eligibility
  log("");
  log("Conjugation lessons (rule: once ≥ 4 forms of a Lemma are introduced; the infinitive counts when it is a row)");
  const lemmas = new Map();
  for (const it of items.values()) if (it.lemma && it.file === "helper") {
    if (!lemmas.has(it.lemma)) lemmas.set(it.lemma, []);
    lemmas.get(it.lemma).push(it);
  }
  for (const [lemma, forms] of lemmas) {
    const inf = items.get(lemma);
    const all = [...forms, ...(inf ? [{ ...inf, person: "infinitive" }] : [])].filter((f) => cmpSec(f.section, hi) <= 0);
    if (!all.length) continue;
    all.sort((a, b) => cmpSec(a.section, b.section));
    const fourth = all.length >= 4 ? all[3] : null;
    const where = fourth ? introducedAt.get(fourth.key) ?? secStr(fourth.section) : null;
    log(`  ${lemma.padEnd(9)} ${all.map((f) => `${f.key} (${secStr(f.section)}${f.person ? ", " + f.person : ""})`).join(", ")}`);
    log(`  ${"".padEnd(9)} -> ${fourth ? `eligible from ${where}` : `${all.length} form${all.length === 1 ? "" : "s"} by ${secStr(hi)}: no conjugation lesson yet`}`);
  }
}

// ------------------------------------------------------------------ result
log("");
const ready = tot.ok, pending = tot.pending;
if (failures) log(`✗ FAIL: ${failures} problem(s). ${ready} sentences ready, ${pending} waiting on proposals.`);
else log(`✓ PASS: no unapproved words. ${ready} of ${tot.total} sentences use only approved words today; ${pending} wait on the proposals listed above${STRICT ? "" : " (run with --strict to count them as failures)"}.`);
console.log(out.join("\n"));
process.exit(failures ? 1 : 0);
