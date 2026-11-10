#!/usr/bin/env node
// Vocabulary checker for the Buhísimo prototype (every playable unit: 1.1 to 1.4).
//
//   node prototype/tools/check_vocab.mjs             (from the buhisimo repo root)
//   node prototype/tools/check_vocab.mjs --todo      also write prototype/audio/TODO_lines.json,
//                                                    prototype/audio/TODO_songs.json and docs/recording_list_1.4.md
//
// Collects every Spanish string the prototype can show:
//   * lesson-1-1.js and unit-1-x.js (through course.js): keys named `es` or ending in
//     `Es` (strings, arrays, and objects inside arrays), plus [[double-bracketed]] Spanish inside
//     English text; `spell: true` on a step or object marks a spelling line (bare letter names);
//     `lookalike: "seis/siete"` on a step marks a look-alike pair practised apart (the validator
//     fails it before both words are taught);
//   * the words of the number songs as sung (audio/songs/songs.json), at the lessons that use them;
//   * the Radio Búho episodes of the lessons (course.js RADIO) and radio/*.json (the 1.1 demo);
//   * *.html in prototype/: text inside elements marked lang="es";
//   * path-data.js textbook unit titles are listed but exempt (they are titles); map section
//     titles (split units) must match content/lessons_1.1-1.6.json "parts", and each lesson's
//     titleEs must equal the manifest's titleEs (which the repo validator checks at its lesson).
// Every string is tagged with its unit and lesson and checked by the repo validator,
// tools/check_vocab.mjs: the unit-level rule (only rows of that unit or before), the lesson-level
// rule (introduced before use), determiners (nouns are never bare), plural rules, and letter
// names only while spelling. Strings shown outside a lesson (tips, design-system examples, the
// Radio tab's demo) are checked at the last lesson of their unit.
// It also reports where each line comes from: a sentence of content/sentences_1.1-1.6.json,
// part of one, a lesson item, or "other" (not in the content plan: listed for Juan).
// With --todo it writes the manifest of every spoken line that has no recording yet, and the
// list of song clips (A0–A7, N0–N10, D0–D9) and songs that still have to be made, and the Unit 1.4
// recording list (lines, songs and pictures) for the GPU session: docs/recording_list_1.4.md.
// Unit 1.4 adds: `own: true` (a line said only by its speaker, not also in the neutral voices); the birthday
// canon (a cast line that gives a birthday must match js/calendar.js CANON); and every date of the year,
// as the "Your birthday" step builds it, checked at 1.4 L11.
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTO = join(HERE, "..");
const ROOT = join(PROTO, "..");
const WRITE_TODO = process.argv.includes("--todo");
const isSpellText = (t) => /se escribe|alfabeto/i.test(t);

// ---------------------------------------------------------------- collectors
// Each string: { where, text, unit, lesson, key, who, spoken, unitOnly, spell }
// qEs/valueEs: the ID card's questions and answers (1.3); aEs/bEs: the parts of a pattern row (only its result, cEs, is said).
// tagEs/tagsEs: what a character's bubble shows after a «Who is it?» answer (él / ella, a name); focusEs: its marked word. Shown, not said.
// whenEs: the day or month a Radio Búho caller says (1.4 calradio), shown as the answer.
const NOT_SPOKEN = new Set(["tilesEs", "optionsEs", "bucketsEs", "titleEs", "stampEs", "examplesEs", "specimenEs", "formsEs", "learnedEs", "maskEs", "linesEs", "qEs", "valueEs", "aEs", "bEs", "tagEs", "tagsEs", "focusEs", "whenEs"]);
function collect(obj, path, out, ctx) {
  if (obj == null || typeof obj !== "object") return;
  if (Array.isArray(obj)) { obj.forEach((v, i) => collect(v, `${path}[${i}]`, out, ctx)); return; }
  const who = obj.speaker || obj.character || obj.who || ctx.who;
  const spell = !!(obj.spell || ctx.spell);
  const lookalike = obj.lookalike || ctx.lookalike;
  const own = !!(obj.own || ctx.own);
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (k === "sayAs" || k === "story") continue; // pronunciation spellings; the story is collected on its own
    const isEs = k === "es" || /Es$/.test(k);
    if (isEs) {
      const list = Array.isArray(v) ? v : [v];
      const unitOnly = !!ctx.unitOnly || k === "examplesEs" || k === "specimenEs";
      list.forEach((s, i) => {
        const where = Array.isArray(v) ? `${p}[${i}]` : p;
        const spoken = !NOT_SPOKEN.has(k) && !(k === "answerEs" && Array.isArray(v)) && !unitOnly && !ctx.song;
        if (typeof s === "string") out.push({ where, text: s, unit: ctx.unit, lesson: ctx.lesson, key: k, who, spoken, unitOnly, spell: spell || isSpellText(s), ...(lookalike ? { lookalike } : {}), ...(own ? { own } : {}) });
        else if (s && typeof s === "object") collect(s, `${where}`, out, { ...ctx, who, spell, lookalike, own });
      });
    } else if (typeof v === "string") {
      for (const m of v.matchAll(/\[\[(.+?)\]\]/g)) out.push({ where: `${p} [[…]]`, text: m[1], unit: ctx.unit, lesson: ctx.lesson, key: "inline", who, spoken: false, unitOnly: k === "tipEn", spell: spell || isSpellText(m[1]) });
    } else collect(v, p, out, { ...ctx, who, spell, lookalike, own });
  }
}

function collectFromHTML(file, out, unit, lesson) {
  const html = readFileSync(file, "utf8");
  const re = /<([a-z0-9]+)[^>]*\blang="es"[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const m of html.matchAll(re)) {
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (text && !text.includes("${")) out.push({ where: relative(PROTO, file), text, unit, lesson, key: "html", spoken: false, unitOnly: true, spell: false });
  }
}

// ---------------------------------------------------------------- gather
const { LESSONS, ITEMS, RADIO, UNITS } = await import(pathToFileURL(join(PROTO, "course.js")).href);
const { unitsTextbookTitlesEs, units: pathUnits } = await import(pathToFileURL(join(PROTO, "path-data.js")).href);
const lastLesson = (unit) => Math.max(...LESSONS.filter((l) => l.unit === unit).map((l) => l.n));

const strings = [];
for (const l of LESSONS) {
  const { story, steps, ...rest } = l;
  collect(rest, `lesson ${l.id}`, strings, { unit: l.unit, lesson: l.n });
  steps.forEach((s, i) => collect(s, `lesson ${l.id}.steps[${i}]`, strings, { unit: l.unit, lesson: l.n, song: s.type === "clip" }));
  if (story) collect(story, `${l.id} story`, strings, { unit: l.unit, lesson: l.n });
}
// The number songs as sung (make_number_songs.py): their words are checked at every lesson that plays them.
const songsFile = join(PROTO, "audio", "songs", "songs.json");
const SUNG = existsSync(songsFile) ? JSON.parse(readFileSync(songsFile, "utf8")).songs : {};
for (const l of LESSONS) l.steps.forEach((s, i) => {
  for (const one of s.type === "song" ? [s] : s.type === "songset" ? s.songs : []) {
    const sung = SUNG[one.song];
    if (!sung) continue;
    if (sung.lines.join("|") !== one.linesEs.join("|")) console.log(`  note: lesson ${l.id} step ${s.id}: the song ${one.song} is sung with other words than its linesEs (the app shows the sung words)`);
    sung.lines.forEach((t, k) => strings.push({ where: `lesson ${l.id}.steps[${i}] song ${one.song} (sung) line ${k + 1}`, text: t, unit: l.unit, lesson: l.n, key: "linesEs", spoken: false, unitOnly: false, spell: false }));
  }
});
// Unit 1.4 L11 "Your birthday": the app builds «Mi cumpleaños es el … de ….» from any date the student taps
// (js/calendar.js allDates, 29 February included; «el uno» accepted for the 1st). Every one is checked at L11.
const { allDates, birthdaySentence, CANON, CANON_NAMES, MONTHS_ES } = await import(pathToFileURL(join(PROTO, "js", "calendar.js")).href);
const NUM_ES = (await import(pathToFileURL(join(PROTO, "js", "numbers.js")).href)).NUM_ES;
if (LESSONS.some((l) => l.id === "1.4-11")) for (const d of allDates()) for (const uno of d.d === 1 ? [false, true] : [false])
  strings.push({ where: `1.4-11 mydate (generated: ${d.d}/${d.m})`, text: birthdaySentence(d.d, d.m, { uno }), unit: "1.4", lesson: 11, key: "generated", spoken: false, unitOnly: false, spell: false });
for (const it of ITEMS) {
  if (it.letters) it.letters.forEach(([, name]) => strings.push({ where: `ITEMS.${it.id} (letters)`, text: name, unit: it.unit, lesson: it.lesson, key: "letter", spoken: false, unitOnly: false, spell: true }));
  else collect(it, `ITEMS.${it.id}`, strings, { unit: it.unit, lesson: it.lesson });
}
for (const ep of RADIO) {
  const [unit, n] = ep.lesson.split("-");
  ep.lines.forEach((ln, i) => strings.push({ where: `radio ${ep.id} line ${i + 1}`, text: ln.es, unit, lesson: +n, key: "radio", who: ln.who, voice: ln.voice, spoken: ln.who !== "song", unitOnly: false, spell: !!ep.spell || isSpellText(ln.es), clip: ln.clip }));
  if (ep.titleEs) strings.push({ where: `radio ${ep.id} title`, text: ep.titleEs, unit, lesson: +n, key: "titleEs", spoken: false, unitOnly: false, spell: false });
}
// The 1.1 Radio Búho demo episode (radio/*.json): reachable from the Radio tab after 1.1.
const radioDir = join(PROTO, "radio");
for (const f of existsSync(radioDir) ? readdirSync(radioDir) : []) {
  if (!f.endsWith(".json") || f === "episodes.json") continue;
  const ep = JSON.parse(readFileSync(join(radioDir, f), "utf8"));
  const unit = ep.unit || "1.1";
  if (ep.title) strings.push({ where: `radio/${f} title`, text: ep.title, unit, lesson: lastLesson(unit), key: "radio", spoken: false, unitOnly: true });
  ep.lines.forEach((l, i) => strings.push({ where: `radio/${f} line ${i + 1}`, text: l.text ?? l.words.map((w) => w.word ?? w.w).join(" "), unit, lesson: lastLesson(unit), key: "radio", spoken: false, unitOnly: true }));
}
for (const f of readdirSync(PROTO)) if (f.endsWith(".html")) collectFromHTML(join(PROTO, f), strings, "1.1", lastLesson("1.1"));

let failures = 0;
const unique = [...new Set(strings.map((s) => s.text))];
console.log(`Buhísimo prototype vocabulary check: units ${UNITS.map((u) => u.id).join(", ")}`);
console.log(`  checked: ${strings.length} Spanish strings (${unique.length} different) in lesson-1-1.js, ${UNITS.map((u) => `unit-${u.id.replace(".", "-")}.js`).join(", ")}, the Radio Búho episodes, the sung number songs and lang="es" in *.html`);
console.log(`  exempt textbook unit titles (path-data.js): ${Object.values(unitsTextbookTitlesEs).join(" | ")}`);

// ---------------------------------------------------------------- titles
const manifest = JSON.parse(readFileSync(join(ROOT, "content", "lessons_1.1-1.6.json"), "utf8"));
for (const u of pathUnits.filter((x) => x.titleEs)) {
  const part = (manifest.parts ?? []).find((p) => p.id === u.id);
  if (!part || part.titleEs !== u.titleEs || part.unit !== u.unit) { failures++; console.log(`FAIL  path-data.js section ${u.id}: "${u.titleEs}" doesn't match a part in content/lessons_1.1-1.6.json`); }
}
// Lesson titles (decision 2026-10-21): each prototype lesson's titleEs must be the manifest's titleEs.
for (const l of LESSONS) {
  const m = manifest.lessons.find((x) => x.unit === l.unit && x.lesson === l.n);
  if (!m) { failures++; console.log(`FAIL  lesson ${l.id}: not in content/lessons_1.1-1.6.json`); continue; }
  if ((l.titleEs || null) !== (m.titleEs || null)) { failures++; console.log(`FAIL  lesson ${l.id}: titleEs «${l.titleEs ?? "—"}» but the manifest says «${m.titleEs ?? "—"}»`); }
}
// Path nodes: every playable lesson has a node in its unit's section.
for (const l of LESSONS) if (!pathUnits.some((u) => (u.unit ?? u.id) === l.unit && u.nodes.some((n) => n.id === l.id))) { failures++; console.log(`FAIL  lesson ${l.id}: no node on the path (path-data.js)`); }
console.log(`  lesson titles: ${LESSONS.filter((l) => l.titleEs).length} Spanish titles, each equal to the manifest's titleEs; map sections: ${pathUnits.filter((x) => x.titleEs).map((x) => `${x.id} ${x.titleEs}`).join(" | ") || "none"}`);

// ---------------------------------------------------------------- the birthday canon (Unit 1.4, build plan §3 A5)
// A cast member who gives a birthday («Mi cumpleaños es…», «¿Mi cumpleaños? Junio.») must give their own, and
// «El cumpleaños de Matilda es…» must be Matilda's. Dates nobody owns are said only by neutral voices or callers.
{
  const base = (w = "") => (w.startsWith("owl") || w === "buho" ? "buho" : ["matilda", "max", "valentina", "samuel"].find((c) => w.startsWith(c)) || "");
  const NAME_OF = Object.fromEntries(Object.entries(CANON_NAMES).map(([k, v]) => [v, k]));
  const dayOf = (w) => (w === "primero" || w === "uno" ? 1 : NUM_ES.indexOf(w));
  const parse = (t) => {
    const low = t.toLowerCase();
    const m = MONTHS_ES.findIndex((x) => new RegExp(`(^|[^a-záéíóúñ])${x}([^a-záéíóúñ]|$)`).test(low)) + 1;
    const d = /\bel ((?:treinta y uno)|[a-záéíóú]+) de [a-z]+/.exec(low);
    return { m, d: d ? dayOf(d[1]) : null };
  };
  let canonChecked = 0;
  const bad = [];
  for (const s of strings) {
    if (!s.spoken) continue; // wrong options on purpose (a listening step's distractors) are not anyone's line
    const t = s.text;
    let owner = null;
    const named = /el cumpleaños de (Matilda|Max|Valentina|Samuel|Buhísimo)(?: es|\?)/i.exec(t);
    if (named) owner = NAME_OF[named[1]];
    else if (/mi cumpleaños/i.test(t) && base(String(s.who || ""))) owner = base(String(s.who));
    // «¿Cuándo es tu cumpleaños? — Es el uno de noviembre.» in a cast voice would be that character's answer.
    else if (/cuándo es tu cumpleaños\?.*—\s*es /i.test(t) && base(String(s.who || ""))) owner = base(String(s.who));
    if (!owner) continue;
    const seg = named ? t.slice(named.index) : /mi cumpleaños/i.test(t) ? t.slice(t.toLowerCase().indexOf("mi cumpleaños")) : t.slice(t.indexOf("—"));
    if (/— No\.$/.test(t)) continue; // «¿El cumpleaños de Samuel? ¿El primero de mayo? — No.»
    const { m, d } = parse(seg.split(/[.!]\s/)[0] + ".");
    if (!m) continue;
    canonChecked++;
    const c = CANON[owner];
    if (m !== c.m || (d != null && d > 0 && d !== c.d)) bad.push(`${s.where}: «${t}» (${CANON_NAMES[owner]}'s birthday is ${c.d}/${c.m})`);
  }
  for (const b of [...new Set(bad)]) { failures++; console.log(`FAIL  birthday canon: ${b}`); }
  if (canonChecked) console.log(`  birthday canon: ${canonChecked} lines give a cast member's birthday; ${bad.length ? `${bad.length} contradict it` : "all match the canon (Samuel 10/1, Max 29/2, Matilda 15/6, Valentina 20/7, Buhísimo 7/8)"}`);
}

// ---------------------------------------------------------------- provenance
const plan = JSON.parse(readFileSync(join(ROOT, "content", "sentences_1.1-1.6.json"), "utf8")).filter((s) => UNITS.some((u) => u.id === s.unit));
const norm = (t) => t.normalize("NFC").trim();
const planSet = new Set(plan.map((s) => norm(s.es)));
const planEn = new Map(plan.map((s) => [norm(s.es), s.en]));
const titleSet = new Set(manifest.lessons.flatMap((l) => (l.titleEs ? [norm(l.titleEs)] : [])));
const itemSet = new Set(ITEMS.flatMap((it) => [it.es, ...(it.formsEs || []), ...(it.letters || []).map((x) => x[1])]).filter(Boolean).map(norm));
const fragments = new Set();
for (const s of plan) {
  for (const side of s.es.split(/\s+—\s+/)) {
    fragments.add(norm(side));
    for (const q of side.split(/(?<=[.!?…])\s+(?=[¿¡A-ZÁÉÍÓÚ])/)) fragments.add(norm(q));
  }
  for (const t of s.es.split(/\s+/)) fragments.add(t.replace(/[¡!¿?.,;:…—«»]/g, "").toLowerCase());
}
const origin = (t) => (planSet.has(norm(t)) ? "sentence" : itemSet.has(norm(t)) || titleSet.has(norm(t)) ? "item"
  : fragments.has(norm(t)) || fragments.has(norm(t).toLowerCase()) ? "part" : "other");
const counts = { sentence: 0, item: 0, part: 0, other: 0 };
const others = new Map();
for (const t of unique) {
  const o = origin(t);
  counts[o]++;
  if (o === "other") others.set(t, [...new Set(strings.filter((s) => s.text === t).map((s) => s.where.replace(/\.steps.*|\.\w+(\[\d+\])?$/, "")))]);
}
console.log(`  where the ${unique.length} lines come from: ${counts.sentence} plan sentences, ${counts.item} lesson items or titles, ${counts.part} parts of plan sentences (one side of a "—", one sentence of two, a word-bank tile), ${counts.other} other`);
for (const [t, w] of others) console.log(`    other: "${t}"  (${w.join(", ")})`);

// ---------------------------------------------------------------- the repo validator (unit and lesson level)
const tmp = mkdtempSync(join(tmpdir(), "buho-vocab-"));
const tmpFile = join(tmp, "prototype_sentences.json");
const seen = new Set();
const forValidator = [];
for (const s of strings) {
  const lesson = s.unitOnly ? lastLesson(s.unit) : s.lesson; // tips and examples: at the end of their unit
  const k = `${s.unit}|${lesson}|${s.spell ? 1 : 0}|${s.lookalike || ""}|${s.text}`;
  if (seen.has(k)) continue;
  seen.add(k);
  forValidator.push({ unit: s.unit, lesson, kind: "prototype", es: s.text, en: planEn.get(norm(s.text)) || s.where, ...(s.spell ? { spell: true } : {}), ...(s.lookalike ? { lookalike: s.lookalike } : {}) });
}
writeFileSync(tmpFile, JSON.stringify(forValidator, null, 1));
const r = spawnSync(process.execPath, [join(ROOT, "tools", "check_vocab.mjs"), "--sentences", tmpFile], { encoding: "utf8" });
const out = (r.stdout || "") + (r.stderr || "");
for (const l of out.split("\n").filter((x) => /^FAIL/.test(x))) console.log(`  ${l}`);
for (const l of out.split("\n").filter((x) => /look-alike pairs practised/.test(x))) console.log(`  in the prototype:${l.replace(/^\s*/, " ")}`);
const summary = out.split("\n").find((l) => /^(✓ PASS|✗ FAIL)/.test(l)) || "(no summary)";
console.log(`  unit and lesson level (tools/check_vocab.mjs --sentences, ${forValidator.length} lines tagged with unit and lesson): ${summary}`);
if (r.status !== 0) failures++;

// ---------------------------------------------------------------- audio TODO
// Radio Búho callers: one synthetic voice each (Juan, 24 Oct 2026), named on the RADIO line as
// `voice`. Reference wavs in video_generation/conversations/voices (u12_audio.py records them).
const CALLER_REFS = { caller_argentina: "ar_m_35.wav", caller_cuba: "cu_f_old.wav", caller_espana: "es_m_20.wav",
  caller_peru: "pe_f_teen.wav", caller_chile: "cl_m_45.wav", caller_neutral_f: "neu_f_35.wav" };

let TODO_LINES = [], TODO_SONGS = null;
if (WRITE_TODO) { writeTodo(); writeSongs(); await writeRecordingList14(); }

function writeTodo() {
  const clips = {};
  for (const m of ["manifest.json", "manifest-extra.json", "manifest-l2.json", "manifest-max.json", "manifest-matilda.json", "manifest-callers.json", "manifest-u14.json"]) {
    const p = join(PROTO, "audio", m);
    if (existsSync(p)) for (const [t, by] of Object.entries(JSON.parse(readFileSync(p, "utf8")).clips)) clips[t] = { ...clips[t], ...by };
  }
  // Voice rules (Juan, Oct 2026; lesson_audio.py): every neutral line in both Marías and Raúl;
  // él / él es only in Raúl (and ella only in the Marías); Buhísimo's lines (and the Spanish praise)
  // also in his two voices; story, radio and passport lines in the speaker's voice: Matilda = her own
  // kid voice "matilda" (co_f_kid_matilda, Juan 24 Oct 2026), Max = his own kid voice "max" (co_m_kid_max,
  // Juan 21 Oct 2026), the traveller = Raúl; each Radio Búho caller in the voice named on the line
  // (`voice: "caller_<country>"`, neutral if none). Step lines that Matilda or Max actually say are
  // recorded in their kid voices from hand-made lists (video_generation/scripts/voice_tools/max_voice.py,
  // u12_audio.py): a step only shows the character, it doesn't say who speaks.
  // Unit 1.3: Valentina and Samuel speak in their own voices (planned: co_f_teen, co_m_teen; nothing recorded yet).
  const NEUTRAL = ["maria_bogota", "maria_paisa", "raul"], MARIA = ["maria_bogota", "maria_paisa"], RAUL = ["raul"], MAX = ["max"], MATILDA = ["matilda"], BUHO = ["buho_profesor", "buho_abuelo"];
  const VALENTINA = ["valentina"], SAMUEL = ["samuel"];
  const SPEAKER = { buho: "Buhísimo", matilda: "Matilda", max: "Max", valentina: "Valentina", samuel: "Samuel", traveller: "A traveller", caller: "a Radio Búho caller" };
  const want = new Map(); // text -> { voices, where, speaker, unit }
  const add = (text, voices, where, speaker, unit) => {
    if (!want.has(text)) want.set(text, { voices: new Set(), where: new Set(), speaker: new Set(), unit: new Set() });
    const w = want.get(text);
    voices.forEach((v) => w.voices.add(v));
    w.where.add(where);
    w.unit.add(unit);
    if (!w.units) w.units = new Set();
    w.units.add(unit);
    if (speaker) w.speaker.add(speaker);
  };
  const base = (who) => (who.startsWith("owl") || who === "buho" ? "buho" : who.startsWith("matilda") ? "matilda" : who.startsWith("max") ? "max" : who.startsWith("valentina") ? "valentina" : who.startsWith("samuel") ? "samuel" : who);
  const voicesOf = (who, voice) => (voice ? [voice] : { buho: BUHO, matilda: MATILDA, max: MAX, valentina: VALENTINA, samuel: SAMUEL, traveller: RAUL }[base(who)] || NEUTRAL);
  const CAST = new Set(["matilda", "max", "valentina", "samuel"]);
  for (const s of strings) {
    if (!s.spoken) continue;
    const who = String(s.who || "");
    const step = s.where.match(/^lesson (\S+)\.steps\[(\d+)\]/);
    const where = step ? `${step[1]} step ${+step[2] + 1}` : s.where.replace(/\.(es|\w+Es)(\[\d+\])?$/, "");
    const t = s.text, low = t.toLowerCase();
    const stepObj = step && LESSONS.find((l) => l.id === step[1])?.steps[+step[2]];
    const isPassport = stepObj?.type === "passport";
    if (/ story/.test(s.where) || s.key === "radio") add(t, voicesOf(who, s.voice), where, SPEAKER[base(who)], s.unit);
    else if (s.own) add(t, voicesOf(who), where, SPEAKER[base(who)] || "", s.unit); // 1.4 birthday wall: only its speaker's voice
    else if (s.key === "askEs") add(t, BUHO, where, "Buhísimo", s.unit);
    else if (isPassport && s.key === "answerEs") add(t, voicesOf(who), where, SPEAKER[base(who)] || who, s.unit);
    else if (s.key === "praiseEs") add(t, BUHO, where, "Buhísimo", s.unit);
    else if (low === "él" || low === "él es") add(t, RAUL, where, "", s.unit);
    else if (low === "ella") add(t, MARIA, where, "", s.unit);
    else {
      add(t, NEUTRAL, where, "", s.unit);
      if (who.startsWith("owl") && ["es", "promptEs"].includes(s.key)) add(t, BUHO, where, "Buhísimo", s.unit);
      // From 1.3, a sentence that a step's character says (the example on their card, their bubble, their
      // countdown, their speaking model) is listed in that character's voice too.
      const sentence = /[.?!…]$/.test(t.trim());
      if (s.unit >= "1.3" && CAST.has(base(who)) && sentence && ["es", "exampleEs", "promptEs", "sayEs"].includes(s.key)) add(t, voicesOf(who), where, SPEAKER[base(who)], s.unit);
    }
  }
  const sayAs = LESSONS[0].sayAs || {};
  const ttsText = (t) => {
    let x = t;
    for (const [w, say] of Object.entries(sayAs)) x = x.replaceAll(w, say);
    x = /^[a-záéíóúñ]/.test(x) ? x[0].toUpperCase() + x.slice(1) : x;
    return /[.?!…,]$/.test(x) ? x.replace(/,$/, ".") : `${x}.`;
  };
  const lines = [];
  let none = 0;
  const byUnit = {};
  for (const [text, w] of [...want].sort((a, b) => a[0].localeCompare(b[0], "es"))) {
    const voices = [...w.voices].sort();
    const missing = voices.filter((v) => !clips[text]?.[v]);
    if (missing.length === voices.length && !clips[text]) none++;
    for (const voice of missing) {
      const unit = [...w.unit].sort()[0];
      byUnit[unit] = (byUnit[unit] || 0) + 1;
      lines.push({ text, tts: ttsText(text), voice, role: voice.startsWith("buho") ? "buho" : voice.startsWith("caller_") ? "caller" : ["raul", "max", "matilda", "valentina", "samuel"].includes(voice) ? voice : "maria",
        speaker: [...w.speaker].join(", ") || "(any: lesson voice)", unit, units: [...w.unit].sort(), slug: slug(text), file: `audio/${voice}/${slug(text)}.mp3`, where: [...w.where].sort(),
        ...(isSpellText(text) || strings.some((x) => x.text === text && x.spell) ? { spelt: true } : {}) });
    }
  }
  const texts = new Set(lines.map((l) => l.text)).size;
  const outFile = join(PROTO, "audio", "TODO_lines.json");
  writeFileSync(outFile, JSON.stringify({
    _about: "Every Spanish line the prototype (Units 1.1 to 1.4) can say that has no recording yet, one entry per voice. Same fields as video_generation/scripts/voice_tools/lesson_audio.py clips.json (text, tts, voice, slug), plus the target file, the role, who says it, the unit and where it is used. Letter names (efe, eme…) and spellings (Ese, a, ele…) are said as letter names. Songs and chants are in TODO_songs.json, not here. Generated by prototype/tools/check_vocab.mjs --todo; do not edit by hand. Recording needs the GPU (Qwen3-TTS): ask Juan first.",
    voices: { maria_bogota: "co_f_adult_bogota.wav", maria_paisa: "co_f_adult_paisa.wav", raul: "co_m_30.wav", max: "co_m_kid_max.wav", matilda: "co_f_kid_matilda.wav", buho_profesor: "co_m_old_profesor.wav", buho_abuelo: "co_m_old_abuelo.wav", ...CALLER_REFS,
      valentina: "co_f_teen.wav (planned: quality to check before recording)", samuel: "co_m_teen.wav (planned: quality to check before recording)" },
    summary: { linesWithNoRecordingAtAll: none, linesMissingAtLeastOneVoice: texts, clipsToRecord: lines.length, clipsToRecordByUnit: byUnit },
    lines,
  }, null, 1) + "\n");
  console.log(`  audio TODO: ${none} lines have no recording at all; ${texts} lines miss at least one voice; ${lines.length} clips to record (${Object.entries(byUnit).map(([u, n]) => `${u}: ${n}`).join(", ")}) -> ${relative(ROOT, outFile)}`);
  TODO_LINES = lines;
}

// Song clips (content plan §11.3 A): each `clip` step and each clip-tagged radio line, with its lines.
function writeSongs() {
  const songs = new Map();
  const add = (clip, lines, where, unit, lesson) => {
    if (!songs.has(clip)) songs.set(clip, { clip, lines: [], usedIn: new Set(), unit, lesson });
    const s = songs.get(clip);
    for (const l of lines) if (!s.lines.includes(l)) s.lines.push(l);
    s.usedIn.add(where);
    if (lesson < s.lesson) s.lesson = lesson;
  };
  for (const l of LESSONS) l.steps.forEach((s) => { if (s.type === "clip") add(s.clip, s.linesEs, `${l.id} (${s.id})`, l.unit, l.n); });
  for (const ep of RADIO) ep.lines.forEach((ln) => { if (ln.clip) add(ln.clip, [ln.es], `radio ${ep.id}`, ep.unit, +ep.lesson.split("-")[1]); });
  const KIND = { A0: "spoken intro (Buhísimo), over the Radio Búho jingle", A6: "spoken call-in (callers, Matilda, Max)", A7: "spoken outro (Buhísimo)",
    N0: "spoken intro (Buhísimo), over the Radio Búho jingle", N7: "spoken: Max's countdown", N8: "spoken call-in (Buhísimo, Samuel, Valentina)", N10: "spoken outro (Buhísimo)",
    D0: "spoken intro (Buhísimo), over the Radio Búho jingle", D8: "spoken call-in (Valentina, Max, the Peru, Spain and Chile callers, Buhísimo)", D9: "spoken outro (Buhísimo)",
    D1: "sung: cut from the approved «La semana» (lines 1–2) by a make_calendar_songs.py like make_number_songs.py (Unit 1.4)",
    D2: "sung: cut from the approved «La semana» (lines 3–4) by make_calendar_songs.py (Unit 1.4)",
    D3: "sung: cut from the approved «El año» (lines 1–2) by make_calendar_songs.py (Unit 1.4)",
    D4: "sung: cut from the approved «El año» (lines 3–4) by make_calendar_songs.py (Unit 1.4)",
    D5: "sung: cut from the approved «El año» (lines 5–6) by make_calendar_songs.py (Unit 1.4)" };
  const NCLIP = "sung: cut from an approved number song by prototype/tools/make_number_songs.py (Unit 1.3)";
  const list = [...songs.values()].sort((a, b) => a.clip.localeCompare(b.clip, "en", { numeric: true })).map((s) => ({
    clip: s.clip, kind: KIND[s.clip] || (s.clip.startsWith("N") ? NCLIP : "sung: a simple repeated tune at about 90 BPM (A5 twice, the second time with gaps); a slow 70 BPM version for the first listen"),
    file: `audio/songs/${s.clip}.mp3`, exists: existsSync(join(PROTO, "audio", "songs", `${s.clip}.mp3`)), unit: s.unit, firstLesson: s.lesson, lines: s.lines, usedIn: [...s.usedIn],
  }));
  // The whole number songs (1.3): one entry per song, with the lessons that play it (letras / con números).
  const whole = new Map();
  for (const l of LESSONS) l.steps.forEach((s) => {
    for (const one of s.type === "song" ? [s] : s.type === "songset" ? s.songs : []) {
      if (!whole.has(one.song)) whole.set(one.song, { song: one.song, titleEs: one.titleEs, lines: SUNG[one.song]?.lines || one.linesEs, usedIn: new Set(), unit: l.unit });
      whole.get(one.song).usedIn.add(`${l.id} (${s.id}${s.numerals || one.numerals ? ", con números" : ""})`);
    }
  });
  const wholeSongs = [...whole.values()].map((w) => ({
    song: w.song, ...(w.titleEs ? { titleEs: w.titleEs } : {}), version: SUNG[w.song]?.version || null, file: `audio/songs/${w.song}.mp3`,
    exists: existsSync(join(PROTO, "audio", "songs", `${w.song}.mp3`)), unit: w.unit, lines: w.lines, usedIn: [...w.usedIn],
    ...(SUNG[w.song] ? {} : { todo: w.unit === "1.4"
      ? "New Unit 1.4 song (docs/build_plan_1.4.md §6, docs/recording_list_1.4.md): ACE-Step seeds (GPU) → Juan picks by ear → export with a make_calendar_songs.py like make_number_songs.py (CPU: the mp3, its timings in songs.json, the clips)."
      : "Juan chooses the version (round 2); set it in prototype/tools/make_number_songs.py SONGS and run it (CPU only)." }),
  }));
  const outFile = join(PROTO, "audio", "TODO_songs.json");
  writeFileSync(outFile, JSON.stringify({
    _about: "Radio Búho song and chant clips: «El alfabeto» (1.2, docs/content_plan_1.1-1.6.md §11.3 A), «Los números» (1.3, §11.3 N and §6) and the week and the year (1.4, §11.3 D; docs/build_plan_1.4.md §6), plus the whole songs (`songs`). Juan chose sung versions in the style of the ACE-Step counting-song samples (20 Oct 2026); the approved number songs are in video_generation/music/songs/number_songs_plan.md and are copied in by prototype/tools/make_number_songs.py. Colombian Spanish; letter names uve, doble ve and ye. Until a file exists at `file`, the prototype lights the words up on a 90 BPM beat and shows 'Song coming soon'. Generated by prototype/tools/check_vocab.mjs --todo.",
    clips: list,
    songs: wholeSongs,
  }, null, 1) + "\n");
  TODO_SONGS = { clips: list, songs: wholeSongs };
  console.log(`  song TODO: ${list.filter((c) => !c.exists).length} of ${list.length} clips still to make (${list.filter((c) => !c.exists).map((c) => c.clip).join(", ")}); ${wholeSongs.filter((s) => !s.exists).length} of ${wholeSongs.length} whole songs still to choose (${wholeSongs.filter((s) => !s.exists).map((s) => s.song).join(", ")}) -> ${relative(ROOT, outFile)}`);
}

// ---------------------------------------------------------------- Unit 1.4 recording list (docs/recording_list_1.4.md)
// Everything the one plugged-in GPU session for 1.4 has to make (build plan §8, Decision 14), so it can run straight
// from this file: every line with its speaker, voice, reference wav and target file; the songs and clips with their
// words; the pictures with their target file and what the app shows until then. Regenerate with --todo.
async function writeRecordingList14() {
  const U14 = await import(pathToFileURL(join(PROTO, "unit-1-4.js")).href);
  const REF = { maria_bogota: "co_f_adult_bogota.wav", maria_paisa: "co_f_adult_paisa.wav", raul: "co_m_30.wav", max: "co_m_kid_max.wav", matilda: "co_f_kid_matilda.wav",
    buho_profesor: "co_m_old_profesor.wav", buho_abuelo: "co_m_old_abuelo.wav", ...CALLER_REFS, valentina: "NOT CHOSEN YET (review round 4)", samuel: "NOT CHOSEN YET (review round 4)" };
  const lines = TODO_LINES.filter((l) => l.units.includes("1.4"));
  const lessonOf = (l) => Math.min(...l.where.map((w) => { const m = /^1\.4-(\d+)/.exec(w) || /radio 1\.4-(\d+)/.exec(w) || /^ITEMS/.exec(w); return m ? (m[1] ? +m[1] : 0) : 99; }));
  const voiceOrder = ["buho_profesor", "buho_abuelo", "matilda", "max", "valentina", "samuel", "maria_bogota", "maria_paisa", "raul"];
  const vo = (v) => (voiceOrder.includes(v) ? voiceOrder.indexOf(v) : 50);
  const byLesson = new Map();
  for (const l of lines) { const n = lessonOf(l); if (!byLesson.has(n)) byLesson.set(n, []); byLesson.get(n).push(l); }
  const esc = (t) => String(t).replace(/\|/g, "\\|");
  const texts = new Set(lines.map((l) => l.text));
  const perVoice = {};
  for (const l of lines) perVoice[l.voice] = (perVoice[l.voice] || 0) + 1;
  const shared = lines.filter((l) => l.units.some((u) => u !== "1.4"));
  const songs = TODO_SONGS.songs.filter((x) => x.unit === "1.4" && !x.exists);
  const clips = TODO_SONGS.clips.filter((c) => c.unit === "1.4" && !c.exists);
  const sungClips = clips.filter((c) => /^sung/.test(c.kind));
  const pics = Object.entries(U14.PICTURES);
  let md = `# Recording list: Unit 1.4 «¡…y que cumplas muchos más!»

*Generated by \`node prototype/tools/check_vocab.mjs --todo\` from the prototype as built (${new Date().toLocaleDateString("en-CA")}). Do not edit by hand: change the lessons, then run it again. Plan: \`docs/build_plan_1.4.md\` §8 (Juan approved all 14 decisions on 11 Nov 2026; Decision 14 = one plugged-in GPU session for all of this). **Everything here needs the GPU** except joining spelt letters, exporting songs and processing the one approved picture.*

**GPU rule (Juan):** plugged in = go (warn first); on battery below 60% = wait; 60% or more = ask first with a battery estimate. One GPU user at a time (WanGP and ComfyUI closed while the others run).

## Summary

| What | Count |
|---|---|
| Spoken clips to record (one per line per voice) | **${lines.length}** (${texts.size} different lines) |
| By voice | ${Object.entries(perVoice).sort((a, b) => vo(a[0]) - vo(b[0])).map(([v, n]) => `${v} ${n}`).join(" · ")} |
| Of them, lines also used in earlier units and still unrecorded there | ${shared.length} |
| Songs to make (ACE-Step, shortlist for Juan) | **${songs.length}** (${songs.map((x) => `«${x.titleEs}»`).join(", ")}) |
| Sung clips to cut from the approved songs | ${sungClips.length} (${sungClips.map((c) => c.clip).join(", ")}) |
| Pictures to make | **${pics.filter(([, p]) => !p.ready).length}** (${pics.filter(([, p]) => !p.ready && p.item === 6).length} to process from an approved pick, the rest new: 2–3 seeds each) |

## How the app finds each file (nothing else to wire)

- **Lines:** the app looks a line up by its exact Spanish text in the audio manifests (\`js/speech.js\`). Write each clip to its **target file** below and add it to \`prototype/audio/manifest-u14.json\` (already registered in \`js/speech.js\`, \`sw.js\`, the checker and the e2e test): \`"clips": { "<text>": { "<voice>": "audio/<voice>/<slug>.mp3" } }\`. Lines that must always be one character (the birthday wall, Valentina's and Samuel's lines) also go in \`"speakers": { "<text>": "<role>" }\`. Until a clip exists the line is shown to read ("Audio soon"), listening steps become read-and-choose, and nothing breaks.
- **Slug:** ascii-folded words + the first 6 hex of sha1(text) (\`lesson_audio.py\`); it is already in each target file name.
- **Voices** (\`video_generation/conversations/voices/\`): ${Object.entries(REF).filter(([v]) => perVoice[v]).map(([v, r]) => `\`${v}\` = ${r}`).join("; ")}.
- **Valentina and Samuel (Decision 12):** their voices are **not chosen yet** (review round 4). Record their lines only once Juan has chosen; until then the app plays nothing for them and shows the text (María / Raúl stand in only if Settings → computer voice is on).
- **Spelt lines** (marked *spelt*): build them the \`r3_audio.py\` way from the letter names already recorded, joined with the same 0.5 s gap; slow and even (Juan, 26 Oct). Spelling defaults to **María Paisa**; record the other voices only if the run makes them anyway.
- **Pronunciation watch list:** *miércoles* and *sábado* (stress on the first syllable), *septiembre* (say the p), *junio / julio* kept apart, *¡fenomenal!* not swallowed by the word before it.
- Then: \`node prototype/tools/check_vocab.mjs --todo\` again (the done clips drop off this list), bump the version in \`sw.js\` and \`js/app.js\`.

## 1. Spoken lines, lesson by lesson

`;
  const LNAME = { 0: "Words (intro cards, matching, Review) and lines used in several lessons", 99: "Elsewhere" };
  for (const n of [...byLesson.keys()].sort((a, b) => a - b)) {
    const l = U14.LESSONS.find((x) => x.n === n);
    md += `### ${n === 0 || n === 99 ? LNAME[n] : `L${n} · ${l.titleEs ? `${l.titleEs} · ` : ""}${l.titleEn}`}\n\n| # | Line (exact text) | Speaker · voice | Target file | Used in |\n|---|---|---|---|---|\n`;
    byLesson.get(n).sort((a, b) => a.text.localeCompare(b.text, "es") || vo(a.voice) - vo(b.voice)).forEach((x, k) => {
      md += `| ${k + 1} | «${esc(x.text)}»${x.spelt ? " *spelt*" : ""}${x.tts !== x.text ? `<br><small>TTS text: ${esc(x.tts)}</small>` : ""} | ${esc(x.speaker)} · \`${x.voice}\`${x.voice === "valentina" || x.voice === "samuel" ? " (voice not chosen)" : ""} | \`${x.file}\` | ${esc(x.where.slice(0, 4).join(", "))}${x.where.length > 4 ? ` +${x.where.length - 4}` : ""}${x.units.some((u) => u !== "1.4") ? ` (also ${x.units.filter((u) => u !== "1.4").join(", ")})` : ""} |\n`;
    });
    md += "\n";
  }
  md += `## 2. Songs and clips

Songs are **sung** (ACE-Step 1.5 via Wan2GP, \`scripts/make_song.py\`, \`--bpm 90\`, Colombian Spanish, "slow clear diction"), **short**, with **only these words and no filler** (no *la la*, *oh* or extra words: reject any version that adds one). Make 4 seeds each, Whisper-check them (\`scripts/song_set.py whisper / report\`), make karaoke review pages (\`song_set.py karaoke\`, and \`--numerals\` for the birthday song), and give Juan a **shortlist to pick by ear**. Then a \`prototype/tools/make_calendar_songs.py\` like \`make_number_songs.py\` (CPU: \`afade\`, \`loudnorm=I=-16:TP=-1.5:LRA=11\`, mono 24 kHz, MP3 64 kb/s) writes the mp3, adds its word timings to \`audio/songs/songs.json\` and cuts the clips. Until then each song step says "Song coming soon" and lights its words on a 90 BPM beat.

| Song | Target file | Lessons | Words (exactly as sung) |
|---|---|---|---|
`;
  for (const x of songs) md += `| «${x.titleEs}» \`${x.song}\` | \`prototype/${x.file}\` | ${x.usedIn.join(", ")} | ${x.lines.map(esc).join(" / ")} |\n`;
  md += `
**Numerals rule (23 Oct):** only the birthday song has numbers, so only it has a *con números* version (L11, the lesson after L10 taught the last thing it needs). The two approved number songs reused in 1.4 already exist.

| Clip | Target file | Kind | Lessons | Words |
|---|---|---|---|---|
`;
  for (const c of clips) md += `| ${c.clip} | \`prototype/${c.file}\` | ${esc(c.kind)} | ${c.usedIn.join(", ")} | ${c.lines.map(esc).join(" / ")} |\n`;
  md += `
D0, D8 and D9 are the Radio Búho talk: record them as spoken lines (section 1, L7) in their speakers' voices; the clip files are those lines over the existing jingle, as for 1.3's N0/N8/N10.

## 3. Pictures

Style rules: the flat, chunky, **no-outline** app style (Juan's favourite is the prototype's Max: Z-Image, NAG off); MOSS-Image is approved for poses and scenes; the owl prompt says no ear tufts and a pale belly; no sombrero vueltiao; never "houses" in the style text; **no words in painted art** (the calendar, dates and month names are drawn in code over the picture). 2–3 seeds each for Juan to choose. Pipeline: \`scripts/03_run.sh\` + \`scripts/make_moss.py "<prompt>" --out … --seeds 1 2 3\`, or \`Wan2GP/.venv/bin/python scripts/make_image.py\`; then \`prototype/tools/process_art*.py\` (CPU: crop, WebP) into \`prototype/assets/<id>.webp\`.

**To switch a picture on:** put the file at its target path, set \`ready: true\` for it in \`PICTURES\` in \`prototype/unit-1-4.js\`, and add it to \`PICTURES\` in \`prototype/sw.js\`. Until then the app shows the fallback (scenes with no fallback are simply left out).

| # | Picture | Target file | Lessons | What | Until then the app shows |
|---|---|---|---|---|---|
`;
  for (const [id, p] of pics) md += `| ${p.item} | \`${id}\`${p.ready ? " (ready)" : ""} | \`prototype/assets/${id}.webp\` | ${p.lessons} | ${esc(p.whatEn)} | ${p.fallback ? `\`${p.fallback}\`` : "nothing (the step's character instead)"} |\n`;
  md += `
Drawn in code, nothing to make: the week strip, the year, the month pages (2025, never shown; a leap-year February for Max), the party calendar with stickers, the birthday wall, the name-or-month card and the seasons culture card.
`;
  const out = join(ROOT, "docs", "recording_list_1.4.md");
  writeFileSync(out, md);
  console.log(`  recording list 1.4: ${lines.length} clips (${texts.size} lines), ${songs.length} songs + ${sungClips.length} sung clips, ${pics.filter(([, p]) => !p.ready).length} pictures -> ${relative(ROOT, out)}`);
}

function slug(text) {
  // Same slug as lesson_audio.py: ascii-folded words + the first 6 hex of sha1(text).
  const a = text.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\x00-\x7f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${a}-${createHash("sha1").update(text, "utf8").digest("hex").slice(0, 6)}`;
}

if (failures) { console.log(`\n✗ FAIL`); process.exit(1); }
console.log(`\n✓ PASS: every Spanish line in the prototype uses allowed words of its unit, introduced by its lesson.`);
