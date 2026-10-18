#!/usr/bin/env node
// Buhísimo vocabulary checker (unit-aware). Node 18+, no dependencies.
//
//   node tools/check_vocab.mjs                      check content/sentences_1.1-1.6.json
//   node tools/check_vocab.mjs --strict             also fail sentences that wait on a proposal
//   node tools/check_vocab.mjs --approve P11        treat these pending proposals as approved ("all" = every one)
//   node tools/check_vocab.mjs --unit 1.3 --text "Tengo doce años."   check one string (--spell = spelling context)
//   node tools/check_vocab.mjs --unit 1.3 --list    print every form allowed at 1.3
//   node tools/check_vocab.mjs --plurals            every CSV noun with its plural and plural rule; fails on unlisted irregulars
//   options: --sentences <file> --lessons <file> --proposals <file> --plurals-file <file> --data <dir> --verbose
//
// Rules implemented
//   * Allowed words: rows of data/vocabulary_database.csv (Spanish), data/helper_words.csv
//     (Spanish) and data/names.csv (Name). A row is allowed at unit U when its Section
//     is <= U, comparing "major.minor" numerically (1.2 < 1.10 < 2.1). Rows without a
//     Section are not allowed anywhere.
//   * Forms generated automatically from a row (nothing else is):
//       - o/a words: rojo/a -> rojo, roja (+ rojos, rojas, which are plurals: see below);
//       - el/la + o/a noun: el/la amigo/a -> el amigo, la amiga;
//       - optional parts: me gusta (mucho) -> me gusta, me gusta mucho;
//       - word(a) and x/y gender pairs: jugador(a) -> jugador, jugadora; actor/actriz;
//       - "…" is dropped: hay… -> hay.
//   * Determiners (rule P7, approved 2026-10-18). A CSV noun may swap its el/la for another
//     determiner standing directly before it: un, una, el, la, mi, tu, su, los, las, mis,
//     tus, sus, or a number (dos … treinta, or digits). Number and gender must agree
//     (un libro, una regla, dos cuadernos). A noun is NEVER bare: "mochila" on its own, or a
//     label such as "Nombre: Samuel", fails. The determiner must itself be an allowed word.
//   * Plurals (rule P8, approved 2026-10-18). Plurals of CSV nouns, of the adjectives in
//     content/plurals.json and of o/a adjectives are generated. Each plural has one or more
//     plural RULES (regular, z-ces, accent-loss, accent-gain, unchanged, compound,
//     plural-only, loanword, y-yes, …). A plural is allowed only once all of its rules are
//     taught: lessons declare "teaches": ["plural:z-ces", …] in the manifest; rules taught
//     after 1.6 take their unit from "ruleTaughtAt" in content/plurals.json. Irregular
//     plurals are listed in content/plurals.json (and docs/irregular_plurals.md); every
//     other noun is classified by pluralInfo(). Run --plurals after adding CSV nouns.
//   * Letter names (Type "letter" in helper_words.csv, e.g. "la eme"): "la eme" is an
//     ordinary noun phrase; the bare name ("eme") is allowed only in a spelling context:
//     the sentence has "spell": true, or contains "se escribe" or "alfabeto".
//   * Tokenising: NFC, lower case, punctuation removed (¡!¿?.,;:"'…()—–- etc.), accents
//     kept (si ≠ sí). Greedy longest match over phrases (up to 8 tokens). Digits are fine.
//   * Unit-level check: every sentence must tokenise with the words allowed at its unit.
//   * Pending proposals: a sentence may carry "needs": ["P11", ...] for a proposal in
//     content/proposals_*.json that is not approved yet. It passes as PENDING if it
//     tokenises once those words are added, and fails if anything else is missing.
//   * Lesson-level check (when a lessons manifest exists): walking the lessons in order,
//     a sentence may only use items introduced in its own or an earlier lesson, and only
//     the letters and plural rules taught by then. Also reports items introduced before
//     their CSV section, and coverage.
//   * Lesson size: counted items = "new" entries (a nested array such as ["soy", "de"] is
//     one chunk = one item; names are not counted) + letter groups + "teaches" rule cards.
//     More than 6 is a warning; more than 8 is a failure.
//   * Conjugation-lesson eligibility: >= 4 forms of a Lemma in helper_words.csv (verb
//     forms), counting the infinitive when it is itself a row (decision 2026-10-18).
// Exit code 1 on any failure.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const MAX_PHRASE = 8;
const SOFT_MAX_NEW = 6;  // warn above this
const HARD_MAX_NEW = 8;  // fail above this

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
const PLURALS = resolve(opt("plurals-file", join(ROOT, "content", "plurals.json")));
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
const NFC = (s) => String(s).normalize("NFC");

// ------------------------------------------------------------------ plurals
const ACCENTED = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
const unaccent = (s) => s.normalize("NFD").replace(/́/g, "").normalize("NFC");
const vowelGroups = (w) => w.toLowerCase().match(/[aeiouáéíóúü]+/g) || [];
// Written accent on the stressed vowel of the second-to-last vowel group (joven -> jóven-).
function accentPenult(w) {
  const re = /[aeiouü]+/gi; const groups = [];
  let m; while ((m = re.exec(w))) groups.push({ i: m.index, s: m[0] });
  const g = groups[groups.length - 2];
  if (!g) return w;
  let k = [...g.s].findIndex((c) => "aeoAEO".includes(c)); // strong vowel of a diphthong
  if (k < 0) k = g.s.length - 1;
  const at = g.i + k;
  return w.slice(0, at) + (ACCENTED[w[at].toLowerCase()] ?? w[at]) + w.slice(at + 1);
}

// Plural of a noun phrase; only the first word changes ("hoja de papel" -> "hojas de papel").
// Returns { plural, rules }. ["regular"] = vowel + s / consonant + es, no spelling change.
export function pluralInfo(phrase) {
  const [w, ...rest] = phrase.split(" ");
  const lower = w.toLowerCase();
  const groups = vowelGroups(lower).length;
  const hasAccent = /[áéíóú]/.test(lower);
  let p, rule;
  if (/[aeiouáéó]$/.test(lower)) { p = w + "s"; rule = "regular"; }
  else if (/[íú]$/.test(lower)) { p = w + "es"; rule = "stressed-vowel"; }
  else if (/z$/.test(lower)) { p = w.slice(0, -1) + "ces"; rule = "z-ces"; }                     // lápiz -> lápices
  else if (/[sx]$/.test(lower)) {
    if (groups <= 1) { p = w + "es"; rule = "regular"; }                                      // mes -> meses, país -> países
    else if (/[áéíóú][sx]$/.test(lower)) { p = unaccent(w) + "es"; rule = "accent-loss"; }     // autobús -> autobuses
    else { p = w; rule = "unchanged"; }                                                       // lunes, cumpleaños, sacapuntas
  } else if (/n$/.test(lower)) {
    if (/[áéíóú]n$/.test(lower)) { p = unaccent(w) + "es"; rule = "accent-loss"; }            // canción -> canciones
    else if (groups <= 1) { p = w + "es"; rule = "regular"; }                                 // tren -> trenes
    else if (!hasAccent) { p = accentPenult(w) + "es"; rule = "accent-gain"; }               // joven -> jóvenes
    else { p = w + "s"; rule = "other"; }                                                     // bádminton
  } else if (/y$/.test(lower)) { p = w + "es"; rule = "y-yes"; }                             // rey -> reyes
  else if (/[lrdj]$/.test(lower)) { p = w + "es"; rule = "regular"; }                        // capital -> capitales
  else { p = w + "s"; rule = "loanword"; }                                                   // carnet -> carnets
  const rules = [rule];
  if (rest.includes("de")) rules.push("compound");
  return { plural: [p, ...rest].join(" "), rules: rules.length > 1 ? rules.filter((r) => r !== "regular") : rules };
}

let pluralData = { words: [], adjectives: [], noPlural: [], ruleTaughtAt: {}, rules: {} };
if (existsSync(PLURALS)) pluralData = { ...pluralData, ...JSON.parse(readFileSync(PLURALS, "utf8")) };
const pluralOverride = new Map(pluralData.words.filter((w) => w.kind !== "adjective").map((w) => [NFC(w.es), w]));
const NO_PLURAL = new Set(pluralData.noPlural.map(NFC));
const ADJ_PLURALS = new Map([...pluralData.adjectives, ...pluralData.words.filter((w) => w.kind === "adjective")].map((a) => [NFC(a.es), a]));

// ------------------------------------------------------------------ form expansion
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
const product = (lists) => lists.reduce((acc, list) => acc.flatMap((a) => list.map((x) => [...a, x])), [[]]);

const ARTICLES = new Set(["el", "la", "los", "las"]);
const NOT_NOUNS = new Set(["el primero", "el uno"]); // "the first (of the month)": not nouns

// A data row -> { forms: [{form, n, rules?}], nouns: [{form, g, n, rules}] }.
// forms are free phrases (allowed wherever the row is allowed). nouns are the bare
// singular and the plural forms of a noun, which need a determiner (and plural rules).
function rowForms(spanish, { capitals = false } = {}) {
  const clean = NFC(spanish).replace(/…|\.\.\./g, "").replace(/\s+/g, " ").trim();
  const forms = [], nouns = [], seen = new Set();
  const addForm = (form, n, rules) => { const k = `f|${form}`; if (!seen.has(k)) { seen.add(k); forms.push({ form, n, rules }); } };
  const addNoun = (form, g, n, rules) => { const k = `n|${form}|${g}|${n}`; if (!seen.has(k)) { seen.add(k); nouns.push({ form, g, n, rules }); } };
  const isNoun = !NOT_NOUNS.has(clean.toLowerCase()) && !capitals;
  const ov = pluralOverride.get(clean);
  const ovBare = ov ? NFC(ov.es).replace(/^(el\/la|el|la|los|las) /, "") : null;
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
      if (!article) { addForm(phrase, n, n === "p" ? ["regular"] : undefined); continue; } // rojos: plural of rojo
      if (n === "p") continue; // the plural of an el/la noun is generated below
      const artG = article === "el" || article === "los" ? "m" : article === "la" || article === "las" ? "f" : null;
      const plRow = article === "los" || article === "las";
      if (article === "el/la") { if (g !== "f") addForm(`el ${phrase}`, "s"); if (g !== "m") addForm(`la ${phrase}`, "s"); }
      else addForm(`${article} ${phrase}`, plRow ? "p" : "s");
      if (!isNoun) continue;
      for (const gg of g ? [g] : artG ? [artG] : ["m", "f"]) {
        if (plRow) { addNoun(phrase, gg, "p", ov?.rules ?? ["regular"]); continue; } // las tijeras, los deportes
        addNoun(phrase, gg, "s", []);
        if (NO_PLURAL.has(clean)) continue;
        if (ov && phrase === ovBare && ov.plural) addNoun(ov.plural, ov.pluralGender ?? gg, "p", ov.rules);
        else if (ov?.plurals?.[phrase]) addNoun(ov.plurals[phrase], gg, "p", ov.rules);
        else { const pi = pluralInfo(phrase); addNoun(pi.plural, gg, "p", pi.rules); }
      }
    }
  }
  return { forms, nouns };
}

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
const items = new Map(); // itemKey -> {key, file, section, english, type, lemma, person, isName, isLetter}
const entries = [];      // {key, item, section, via: row|noun|letter|proposal, n?, g?, rules?, proposal?}
const unsectioned = [];

function addItem(file, spanish, row, extra = {}) {
  const section = parseSection(row.Section);
  if (!spanish) return;
  if (!section) { unsectioned.push(`${spanish} (${file})`); return; }
  const isLetter = (row.Type ?? "") === "letter";
  const itemKey = isLetter ? `letter:${NFC(spanish).replace(/^la /, "")}` : NFC(spanish);
  if (!items.has(itemKey) || cmpSec(section, items.get(itemKey).section) < 0) {
    items.set(itemKey, { key: itemKey, file, section, english: row.English ?? "", type: row.Type ?? "", lemma: row.Lemma ?? "", person: row.Person ?? "", isLetter, ...extra });
  }
  if (extra.isName) { entries.push({ key: keyOf(spanish), item: itemKey, section, via: "row" }); return; }
  if (isLetter) {
    entries.push({ key: keyOf(spanish), item: itemKey, section, via: "row", n: "s" });                   // "la eme"
    entries.push({ key: keyOf(NFC(spanish).replace(/^la /, "")), item: itemKey, section, via: "letter" }); // "eme" (spelling only)
    return;
  }
  const capitals = /^y/i.test(row.capitals ?? "");
  const pluralFormRow = /noun \(plural form\)/.test(row.Type ?? ""); // años: a plural noun, needs a number
  const { forms, nouns } = rowForms(spanish, { capitals });
  for (const f of forms) {
    if (pluralFormRow) entries.push({ key: keyOf(f.form), item: itemKey, section, via: "noun", g: "m", n: "p", rules: [] });
    else entries.push({ key: keyOf(f.form), item: itemKey, section, via: "row", n: f.n, rules: f.rules });
  }
  for (const nn of nouns) entries.push({ key: keyOf(nn.form), item: itemKey, section, via: "noun", g: nn.g, n: nn.n, rules: nn.rules });
  // plurals.json nouns without an article in the CSV (days: lunes -> los lunes)
  const ov = pluralOverride.get(NFC(spanish));
  if (ov && ov.kind === "noun" && !/^(el|la|los|las|el\/la) /.test(spanish)) {
    entries.push({ key: keyOf(ov.plural), item: itemKey, section, via: "noun", g: ov.gender ?? "m", n: "p", rules: ov.rules });
  }
  // adjective plurals (azul -> azules) from plurals.json
  const adj = ADJ_PLURALS.get(NFC(spanish));
  if (adj) for (const pl of [adj.plural, ...(adj.alsoPlural ?? [])]) entries.push({ key: keyOf(pl), item: itemKey, section, via: "row", n: "p", rules: adj.rules });
}
for (const r of vocabRows) addItem("vocabulary", r.Spanish, r);
for (const r of helperRows) addItem("helper", r.Spanish, r);
for (const r of nameRows) addItem("name", r.Name, r, { isName: true });

// ------------------------------------------------------------------ proposals (pending only)
const proposals = new Map();
if (existsSync(PROPOSALS)) {
  const doc = JSON.parse(readFileSync(PROPOSALS, "utf8"));
  for (const p of doc.proposals ?? []) {
    proposals.set(p.id, p);
    if (p.status === "approved") continue; // approved words now live in the CSVs; approved rules are built in
    for (const w of p.words ?? []) {
      const section = parseSection(w.section);
      const item = `${p.id}:${w.es}`;
      const { forms, nouns } = rowForms(w.es);
      for (const f of forms) entries.push({ key: keyOf(f.form), item, section, via: "proposal", proposal: p.id, n: f.n });
      for (const nn of nouns) entries.push({ key: keyOf(nn.form), item, section, via: "noun", proposal: p.id, g: nn.g, n: nn.n, rules: nn.rules });
    }
  }
}
const isPending = (pid) => proposals.has(pid) && proposals.get(pid).status !== "approved";
const approveArg = opt("approve", "");
const APPROVED = new Set(approveArg === "all" ? [...proposals.keys()].filter(isPending) : approveArg.split(",").map((s) => s.trim()).filter(Boolean));
for (const id of APPROVED) if (!proposals.has(id)) { console.error(`--approve: unknown proposal ${id}`); process.exit(2); }

// ------------------------------------------------------------------ manifest (teaching points)
const manifest = existsSync(LESSONS) ? JSON.parse(readFileSync(LESSONS, "utf8")).lessons : null;
const ruleTaughtUnit = new Map(); // plural rule -> first unit where it is taught
if (manifest) for (const l of manifest) for (const t of l.teaches ?? []) {
  const r = t.replace(/^plural:/, ""), s = parseSection(l.unit);
  if (!ruleTaughtUnit.has(r) || cmpSec(s, ruleTaughtUnit.get(r)) < 0) ruleTaughtUnit.set(r, s);
}
for (const [r, s] of Object.entries(pluralData.ruleTaughtAt ?? {})) if (!ruleTaughtUnit.has(r)) ruleTaughtUnit.set(r, parseSection(s));
const rulesTaughtBy = (sec) => new Set([...ruleTaughtUnit].filter(([, s]) => s && cmpSec(s, sec) <= 0).map(([r]) => r));

// ------------------------------------------------------------------ dictionaries
function buildDict({ maxSection, extra = new Set(), introduced = null }) {
  const dict = new Map(); // key -> [entries]
  for (const e of entries) {
    if (maxSection && e.section && cmpSec(e.section, maxSection) > 0) continue;
    if (e.proposal) { if (!extra.has(e.proposal)) continue; }
    else if (introduced && !introduced.has(e.item)) continue;
    if (!dict.has(e.key)) dict.set(e.key, []);
    dict.get(e.key).push(e);
  }
  return dict;
}

// Determiners: number and gender. Numbers 2–30 are plural determiners; uno, veintiuno and
// treinta y uno are not (they become un / veintiún / treinta y un before a noun).
const DETERMINERS = new Map([
  ["un", { n: "s", g: "m" }], ["una", { n: "s", g: "f" }], ["el", { n: "s", g: "m" }], ["la", { n: "s", g: "f" }],
  ["mi", { n: "s" }], ["tu", { n: "s" }], ["su", { n: "s" }],
  ["los", { n: "p", g: "m" }], ["las", { n: "p", g: "f" }], ["mis", { n: "p" }], ["tus", { n: "p" }], ["sus", { n: "p" }],
]);
for (const w of "dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte veintidós veintitrés veinticuatro veinticinco veintiséis veintisiete veintiocho veintinueve treinta".split(" ")) DETERMINERS.set(w, { n: "p" });
export const DETERMINER_WORDS = [...DETERMINERS.keys()];
const agrees = (det, e) => !!det && det.n === e.n && (!det.g || !e.g || det.g === e.g);

// ctx: { taught: Set(plural rule), letters: Set(letter item) | undefined (= all), spell: bool }
export function check(text, dict, ctx = {}) {
  const t = tokens(text);
  const bad = [], used = [], groups = [];
  let i = 0;
  while (i < t.length) {
    let matched = 0;
    for (let n = Math.min(MAX_PHRASE, t.length - i); n >= 1; n--) {
      const phrase = t.slice(i, i + n).join(" ");
      if (dict.has(phrase)) { matched = n; groups.push({ key: phrase, alts: dict.get(phrase) }); break; }
    }
    if (matched) i += matched;
    else { groups.push({ key: t[i], alts: [], digit: /^\d+$/.test(t[i]) }); i++; }
  }
  const taught = ctx.taught ?? new Set();
  const rulesOk = (e) => (e.rules ?? []).every((r) => taught.has(r));
  const missing = (alts) => [...new Set(alts.flatMap((e) => e.rules ?? []))].filter((r) => !taught.has(r)).join("+");
  for (let k = 0; k < groups.length; k++) {
    const gr = groups[k];
    if (gr.digit) continue;
    if (!gr.alts.length) { bad.push(gr.key); continue; }
    const prev = groups[k - 1];
    const det = !prev ? null : prev.digit ? { n: Number(prev.key) === 1 ? "s" : "p" } : prev.alts.length ? DETERMINERS.get(prev.key) ?? null : null;
    const nounAlts = gr.alts.filter((e) => e.via === "noun");
    // 1. after a plural determiner, a word with a plural-noun reading is that plural (los lunes, dos sacapuntas)
    const pluralNoun = det?.n === "p" ? nounAlts.filter((e) => e.n === "p" && agrees(det, e)) : [];
    if (pluralNoun.length) {
      const ok = pluralNoun.find(rulesOk);
      if (ok) used.push(ok); else bad.push(`${gr.key} (plural rule ${missing(pluralNoun)} not taught yet)`);
      continue;
    }
    // 2. a free form: a row, a pending proposal, or a letter name while spelling
    const free = gr.alts.filter((e) => e.via === "row" || e.via === "proposal" || (e.via === "letter" && ctx.spell && (!ctx.letters || ctx.letters.has(e.item))));
    if (free.length) {
      const ok = free.find(rulesOk);
      if (ok) used.push(ok); else bad.push(`${gr.key} (plural rule ${missing(free)} not taught yet)`);
      continue;
    }
    // 3. a noun without its own el/la: needs an agreeing determiner right before it
    if (nounAlts.length) {
      const withDet = nounAlts.filter((e) => agrees(det, e));
      const ok = withDet.find(rulesOk);
      if (ok) used.push(ok);
      else if (withDet.length) bad.push(`${gr.key} (plural rule ${missing(withDet)} not taught yet)`);
      else if (det) bad.push(`${gr.key} (does not agree with "${prev.key}")`);
      else bad.push(`${gr.key} (bare noun: needs un/una, el/la, mi/tu/su, los/las, mis/tus/sus or a number before it)`);
      continue;
    }
    if (gr.alts.some((e) => e.via === "letter")) { bad.push(`${gr.key} (letter name: ${ctx.spell ? "not taught yet" : "only when spelling"})`); continue; }
    bad.push(gr.key);
  }
  return { bad, used };
}

const isSpell = (s) => s.spell === true || /se escribe|alfabeto/i.test(s.es);

// Classify one sentence. Returns {status, bad, notes, used, needs?}.
function classify(s, makeDict, ctx) {
  const needsAll = s.needs ?? [];
  const unknown = needsAll.filter((p) => !proposals.has(p));
  if (unknown.length) return { status: "FAIL", bad: [], notes: [`unknown proposal ${unknown.join(", ")}`], used: [] };
  const stale = needsAll.filter((p) => !isPending(p));
  const needs = needsAll.filter((p) => isPending(p) && !APPROVED.has(p));
  const c = { ...ctx, spell: isSpell(s) };
  const notes = stale.length ? [`"needs" lists ${stale.join("+")}, which is approved: remove the tag`] : [];
  const base = check(s.es, makeDict(new Set(APPROVED)), c);
  if (!needs.length) return { status: base.bad.length ? "FAIL" : "OK", bad: base.bad, notes, used: base.used };
  const all = check(s.es, makeDict(new Set([...APPROVED, ...needs])), c);
  if (all.bad.length) return { status: "FAIL", bad: all.bad, notes: [...notes, `even with ${needs.join("+")}`], used: all.used };
  if (!base.bad.length) notes.push(`declares ${needs.join("+")} but passes without it`);
  return { status: base.bad.length ? "PENDING" : "OK", bad: base.bad, notes, used: all.used, needs };
}

// ------------------------------------------------------------------ --plurals report
if (flag("plurals")) {
  const listed = new Set(pluralData.words.map((w) => NFC(w.es)));
  let unlisted = 0;
  console.log("Plural of every CSV noun (rows starting el/la/los/las). * = listed in content/plurals.json, ! = irregular and NOT listed");
  for (const [, r] of [...vocabRows.map((r) => ["vocabulary", r]), ...helperRows.map((r) => ["helper", r])]) {
    if (!/^(el|la|los|las|el\/la) /.test(r.Spanish) || r.Type === "letter" || /^y/i.test(r.capitals ?? "")) continue;
    const pl = rowForms(r.Spanish).nouns.filter((n) => n.n === "p");
    const desc = pl.map((n) => `${n.form} [${n.rules.join("+")}]`).join(", ") || "(no plural)";
    const irregular = pl.some((n) => n.rules.some((x) => x !== "regular"));
    const star = listed.has(NFC(r.Spanish));
    if (irregular && !star) unlisted++;
    if (VERBOSE || irregular || star) console.log(`${star ? "*" : irregular ? "!" : " "} ${secStr(parseSection(r.Section)).padEnd(4)} ${r.Spanish} -> ${desc}`);
  }
  console.log(unlisted ? `\n${unlisted} irregular plural(s) not listed in content/plurals.json (marked !): add them there and to docs/irregular_plurals.md` : "\nEvery irregular noun plural is listed in content/plurals.json.");
  process.exit(unlisted ? 1 : 0);
}

// ------------------------------------------------------------------ ad-hoc modes
const unitArg = opt("unit");
if (unitArg && (opt("text") || flag("list"))) {
  const maxSection = parseSection(unitArg);
  if (!maxSection) { console.error(`--unit: expected something like 1.3`); process.exit(2); }
  const extra = new Set(APPROVED);
  const taught = rulesTaughtBy(maxSection);
  if (flag("list")) {
    const dict = buildDict({ maxSection, extra });
    const keys = [...dict].filter(([, alts]) => alts.some((e) => e.via !== "letter" && (e.rules ?? []).every((r) => taught.has(r))))
      .map(([k, alts]) => (alts.every((e) => e.via === "noun") ? `${k}  (after a determiner)` : k));
    console.log(keys.sort((a, b) => a.localeCompare(b, "es")).join("\n"));
    console.log(`\n${keys.length} forms allowed at unit ${unitArg}; plural rules taught by then: ${[...taught].join(", ") || "none"}`);
    process.exit(0);
  }
  const text = opt("text");
  const r = check(text, buildDict({ maxSection, extra }), { taught, spell: flag("spell") || isSpell({ es: text }) });
  console.log(`"${text}" at unit ${unitArg}`);
  console.log(`  matched: ${r.used.map((e) => `[${e.key}]`).join(" ") || "—"}`);
  if (r.bad.length) {
    for (const b of r.bad) {
      const later = b.includes("(") ? [] : entries.filter((e) => e.key === b && !e.proposal).map((e) => secStr(e.section));
      const prop = entries.filter((e) => e.key === b && e.proposal).map((e) => e.proposal);
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
const pendingCount = [...proposals.keys()].filter(isPending).length;

log(`Buhísimo vocabulary check: ${rel(SENTENCES)}`);
log(`  data: ${vocabRows.length} vocabulary rows, ${helperRows.length} helper rows, ${nameRows.length} names` +
    (unsectioned.length ? ` (${unsectioned.length} names have no Section and are never allowed)` : ""));
log(`  proposals: ${proposals.size} in ${rel(PROPOSALS)} (${proposals.size - pendingCount} approved, ${pendingCount} pending); approved for this run: ${APPROVED.size ? [...APPROVED].join(", ") : "none"}${STRICT ? "; --strict: pending counts as failure" : ""}`);
log(`  plural rules and where they are first taught: ${[...ruleTaughtUnit].map(([r, s]) => `${r} ${secStr(s)}`).join(", ") || "none"}`);

const seen = new Map();
for (const [i, s] of sentences.entries()) {
  if (!parseSection(s.unit) || !Number.isInteger(s.lesson) || !s.es || !s.en) {
    log(`FAIL  #${i + 1}: needs unit (e.g. "1.3"), integer lesson, es and en`); failures++;
  }
  const k = keyOf(s.es);
  if (seen.has(k)) log(`WARN  ${s.unit} L${s.lesson}: duplicate of ${seen.get(k)}: "${s.es}"`);
  else seen.set(k, `${s.unit} L${s.lesson}`);
}

// --- unit-level check (the hard rule)
log("");
log("Unit-level check: rows with Section ≤ the sentence's unit; a determiner before every noun that lost its el/la; plural rules taught by that unit");
const byUnit = new Map(), pendingBy = new Map(), pluralsUsed = new Map(), detNouns = new Set();
const unitDictCache = new Map();
const unitDict = (unit) => (extra) => {
  const k = `${unit}|${[...extra].sort().join(",")}`;
  if (!unitDictCache.has(k)) unitDictCache.set(k, buildDict({ maxSection: parseSection(unit), extra }));
  return unitDictCache.get(k);
};
for (const s of sentences) {
  const r = classify(s, unitDict(s.unit), { taught: rulesTaughtBy(parseSection(s.unit)) });
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
    if (e.via === "noun" && e.n === "p") pluralsUsed.set(e.key, (e.rules ?? []).join("+") || "—");
    if (e.via === "noun" && e.n === "s") detNouns.add(e.key);
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
if (detNouns.size) log(`  singular nouns after a determiner other than their own el/la (P7): ${[...detNouns].sort().join(", ")}`);
if (pluralsUsed.size) log(`  noun plurals used (P8) [rules]: ${[...pluralsUsed].sort().map(([k, r]) => `${k} [${r}]`).join(", ")}`);

// --- lesson-level check
if (manifest) {
  log("");
  log(`Lesson-level check (${rel(LESSONS)}): only items, letters and plural rules introduced in the sentence's lesson or before`);
  const order = new Map(manifest.map((l, i) => [`${l.unit}|${l.lesson}`, i]));
  const introduced = new Set(), introducedAt = new Map(), taught = new Set(), lettersIn = new Set();
  const lessonSentences = new Map();
  for (const s of sentences) {
    const k = `${s.unit}|${s.lesson}`;
    if (!order.has(k)) { failures++; log(`FAIL  ${s.unit} L${s.lesson}: lesson not in the manifest ("${s.es}")`); continue; }
    if (!lessonSentences.has(k)) lessonSentences.set(k, []);
    lessonSentences.get(k).push(s);
  }
  let lessonFails = 0, sizeWarnings = 0, sizeFails = 0;
  const firstIntro = new Map(), ruleAt = new Map();
  for (const l of manifest) {
    const at = `${l.unit} L${l.lesson}`;
    for (const it of (l.new ?? []).flat()) if (!firstIntro.has(NFC(it))) firstIntro.set(NFC(it), at);
    for (const g of l.letters ?? []) for (const x of g) if (!firstIntro.has(`letter:${x}`)) firstIntro.set(`letter:${x}`, at);
    for (const t of l.teaches ?? []) { const r = t.replace(/^plural:/, ""); if (!ruleAt.has(r)) ruleAt.set(r, at); }
  }
  const hint = (b) => {
    const m = /plural rule ([^ ]+) not taught/.exec(b);
    if (m) return `${b.slice(0, -1)}; taught in ${m[1].split("+").map((r) => ruleAt.get(r) ?? "a later unit").join(" / ")})`;
    if (b.includes("(")) return b;
    const at = [...new Set(entries.filter((e) => e.key === b).map((e) => firstIntro.get(e.item)).filter(Boolean))];
    return at.length ? `${b} (introduced in ${at.join(" / ")})` : b;
  };
  const sizes = [];
  for (const l of manifest) {
    const sec = parseSection(l.unit);
    const tag = `${l.unit} L${l.lesson}`;
    const counted = [];
    for (const entry of l.new ?? []) {
      const group = Array.isArray(entry) ? entry : [entry];
      let isCounted = false;
      for (const it of group) {
        const key = NFC(it);
        const item = items.get(key);
        if (!item) { failures++; lessonFails++; log(`FAIL  ${tag}: "${it}" is not a row in vocabulary, helper_words or names`); continue; }
        if (cmpSec(item.section, sec) > 0) { failures++; lessonFails++; log(`FAIL  ${tag}: "${it}" is a ${secStr(item.section)} word: move it to an earlier Section in the CSV first`); }
        if (introducedAt.has(key)) log(`WARN  ${tag}: "${it}" was already introduced in ${introducedAt.get(key)}`);
        introduced.add(key); introducedAt.set(key, tag);
        if (!item.isName) isCounted = true;
      }
      if (isCounted) counted.push(group.join(" + "));
    }
    for (const g of l.letters ?? []) {
      for (const x of g) {
        const key = `letter:${x}`, item = items.get(key);
        if (!item) { failures++; lessonFails++; log(`FAIL  ${tag}: letter "${x}" is not a helper row ("la ${x}", Type letter)`); continue; }
        if (cmpSec(item.section, sec) > 0) { failures++; lessonFails++; log(`FAIL  ${tag}: letter "${x}" is a ${secStr(item.section)} row`); }
        introduced.add(key); introducedAt.set(key, tag); lettersIn.add(key);
      }
      counted.push(`letters ${g.join("/")}`);
    }
    for (const t of l.teaches ?? []) {
      const r = t.replace(/^plural:/, "");
      if (taught.has(r)) log(`WARN  ${tag}: plural rule ${r} was already taught`);
      taught.add(r); counted.push(`rule card ${r}`);
    }
    sizes.push(counted.length);
    if (counted.length > HARD_MAX_NEW) { failures++; sizeFails++; log(`FAIL  ${tag}: ${counted.length} new items, above the hard limit of ${HARD_MAX_NEW}: ${counted.join(", ")}`); }
    else if (counted.length > SOFT_MAX_NEW) { sizeWarnings++; log(`WARN  ${tag}: ${counted.length} new items, above ${SOFT_MAX_NEW}: ${counted.join(", ")}`); }
    else if (VERBOSE && counted.length) log(`      ${tag}: ${counted.length} new: ${counted.join(", ")}`);
    const dictFor = (extra) => buildDict({ maxSection: sec, extra, introduced });
    for (const s of lessonSentences.get(`${l.unit}|${l.lesson}`) ?? []) {
      const r = classify(s, dictFor, { taught, letters: lettersIn });
      if (r.status === "FAIL") {
        failures++; lessonFails++;
        log(`FAIL  ${tag}: "${s.es}" -> not introduced yet: ${r.bad.map(hint).join(", ")}${r.notes.length ? ` (${r.notes.join("; ")})` : ""}`);
      }
    }
  }
  const secs = manifest.map((l) => parseSection(l.unit));
  const lo = secs.reduce((a, b) => (cmpSec(a, b) <= 0 ? a : b)), hi = secs.reduce((a, b) => (cmpSec(a, b) >= 0 ? a : b));
  const missing = [...items.values()].filter((it) => cmpSec(it.section, lo) >= 0 && cmpSec(it.section, hi) <= 0 && !introduced.has(it.key));
  const counts = manifest.reduce((m, l) => m.set(l.unit, (m.get(l.unit) ?? 0) + 1), new Map());
  const withNew = sizes.filter((n) => n > 0);
  log(`  lessons: ${manifest.length} (${[...counts].map(([u, n]) => `${u}: ${n}`).join(", ")}); items introduced: ${introduced.size}; plural rules taught: ${[...taught].join(", ") || "none"}`);
  log(`  lessons with new items: ${withNew.length}, average ${(withNew.reduce((a, b) => a + b, 0) / (withNew.length || 1)).toFixed(1)} counted items, largest ${Math.max(0, ...withNew)}`);
  log(`  lesson-level failures: ${lessonFails}; lessons above ${SOFT_MAX_NEW} items: ${sizeWarnings} (warning); above ${HARD_MAX_NEW}: ${sizeFails} (failure)`);
  if (missing.length) log(`  WARN not introduced in any lesson (${secStr(lo)}–${secStr(hi)} rows): ${missing.map((m) => `${m.key} [${secStr(m.section)} ${m.file}]`).join(", ")}`);
  else log(`  coverage: every vocabulary, helper, letter and name row in ${secStr(lo)}–${secStr(hi)} is introduced`);

  log("");
  log("Conjugation lessons (rule: once ≥ 4 forms of a Lemma are introduced; the infinitive counts when it is a row)");
  const lemmas = new Map();
  for (const it of items.values()) if (it.lemma && it.file === "helper" && /verb/.test(it.type)) {
    if (!lemmas.has(it.lemma)) lemmas.set(it.lemma, []);
    lemmas.get(it.lemma).push(it);
  }
  const pos = (f) => (introducedAt.has(f.key) ? order.get(introducedAt.get(f.key).replace(" L", "|")) : Infinity);
  for (const [lemma, forms] of lemmas) {
    const inf = items.get(lemma);
    const all = [...forms, ...(inf ? [{ ...inf, person: "infinitive" }] : [])].filter((f) => cmpSec(f.section, hi) <= 0);
    if (!all.length) continue;
    all.sort((a, b) => pos(a) - pos(b) || cmpSec(a.section, b.section));
    const fourth = all.length >= 4 ? all[3] : null;
    const where = fourth ? introducedAt.get(fourth.key) ?? secStr(fourth.section) : null;
    log(`  ${lemma.padEnd(9)} ${all.map((f) => `${f.key} (${introducedAt.get(f.key) ?? secStr(f.section)}${f.person ? ", " + f.person : ""})`).join(", ")}`);
    log(`  ${"".padEnd(9)} -> ${fourth ? `eligible from ${where}` : `${all.length} form${all.length === 1 ? "" : "s"} by ${secStr(hi)}: no conjugation lesson yet`}`);
  }
}

// ------------------------------------------------------------------ result
log("");
if (failures) log(`✗ FAIL: ${failures} problem(s). ${tot.ok} sentences ready, ${tot.pending} waiting on proposals.`);
else log(`✓ PASS: ${tot.ok} of ${tot.total} sentences use only approved words, determiners and taught plural rules${tot.pending ? `; ${tot.pending} wait on pending proposals${STRICT ? "" : " (run with --strict to count them as failures)"}` : ""}.`);
console.log(out.join("\n"));
process.exit(failures ? 1 : 0);
