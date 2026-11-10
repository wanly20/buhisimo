// Unit 1.4 «¡…y que cumplas muchos más!»: days, months, dates and birthdays. 13 lessons, following
// docs/build_plan_1.4.md (approved by Juan on 11 Nov 2026, all 14 decisions as recommended),
// docs/content_plan_1.1-1.6.md §8 and content/lessons_1.1-1.6.json.
//
// Spanish conventions are the same as unit-1-1.js … unit-1-3.js (checked by tools/check_vocab.mjs):
//   * a key named `es`, or ending in `Es`, holds Spanish; English text may quote Spanish in [[…]];
//   * `spell: true` marks a spelling line; `lookalike: "junio/julio"` a step that practises a look-alike pair;
//   * `own: true` marks lines said only by their speaker (the birthday wall), not also in the neutral voices.
// The Spanish We Do order in every learn lesson (CLAUDE.md, Decision 9): builder ES→EN, then EN→ES →
// "What does it mean?" (pick) → "Now in Spanish" (type) → Show Me (speak the whole sentence or chant).
// Calendars: Monday first, X for miércoles, one real calendar (2025, never shown) and a leap-year February
// for Max's 29th (js/calendar.js). Cast lines that give a birthday must match the canon (the checker
// holds them to js/calendar.js CANON). No bare nouns; days and months always in small letters.
//
// Audio, songs and pictures that don't exist yet fall back as in 1.3: lines are shown to read ("Audio soon"),
// songs say "Song coming soon" and light their words on the beat, and pictures use an existing picture
// (PICTURES below: set `ready: true` once the file is in assets/). docs/recording_list_1.4.md lists them all.
import { buildStorySteps } from "./unit-1-1.js";
import { lesson as lesson1 } from "./lesson-1-1.js";
import { SONGS as SONGS_13 } from "./unit-1-3.js";
import { NUM_ES } from "./js/numbers.js";
import { DAYS_ES, DAYS_EN, MONTHS_ES, MONTHS_EN, dateEs } from "./js/calendar.js";

const PRAISE = ["¡Muy bien!", "¡Fenomenal!", "¡Fantástico!", "¡Buhísimo!"];

// ------------------------------------------------------------------ pictures still to make (GPU)
// docs/build_plan_1.4.md §8.3. Until a picture exists, the app shows `fallback` (an existing picture).
// The art session sets `ready: true` (one word) when it puts `assets/<id>.webp` in place.
export const PICTURES = {
  "matilda-sleepy": { ready: false, fallback: "matilda-thinking", item: 6, lessons: "L2, L3, L7", whatEn: "Matilda sleepy on a Monday (Juan's round-2 pick s3: crop and convert only, CPU)" },
  "valentina-wave": { ready: false, fallback: "valentina", item: 7, lessons: "L5, L9, L12", whatEn: "Valentina waving (purple, mochila wayuu)" },
  "valentina-thinking": { ready: false, fallback: "valentina", item: 7, lessons: "L4, L9", whatEn: "Valentina thinking" },
  "valentina-celebrate": { ready: false, fallback: "valentina", item: 7, lessons: "L5, L7, L12", whatEn: "Valentina celebrating" },
  "valentina-asking": { ready: false, fallback: "valentina", item: 7, lessons: "L9", whatEn: "Valentina asking a question (hand up)" },
  "samuel-wave": { ready: false, fallback: "samuel", item: 8, lessons: "L2, L4, L10", whatEn: "Samuel waving (carriel)" },
  "samuel-thinking": { ready: false, fallback: "samuel", item: 8, lessons: "L6, L12", whatEn: "Samuel thinking" },
  "samuel-celebrate": { ready: false, fallback: "samuel", item: 8, lessons: "L10", whatEn: "Samuel celebrating" },
  "samuel-calendar": { ready: false, fallback: "samuel", item: 8, lessons: "L4, L10", whatEn: "Samuel pointing at a (blank) wall calendar" },
  "max-counting": { ready: false, fallback: "max-thinking", item: 9, lessons: "L12", whatEn: "Max counting uno, dos, tres on his fingers" },
  "scene-20-julio": { ready: false, fallback: null, item: 10, lessons: "L10, L12", whatEn: "Scene: 20 July in Salento's plaza, Colombian flags and fireworks at dusk (no words)" },
  "scene-kitchen-calendar": { ready: false, fallback: "salento-street", item: 11, lessons: "L12", whatEn: "Scene: the Restrepo kitchen with a BLANK wall calendar (the code draws junio and the 15th)" },
  "scene-party": { ready: false, fallback: null, item: 12, lessons: "L9, L12, L13", whatEn: "Scene: Matilda's birthday party, green eucalyptus cake, the whole cast" },
  "owl-mic": { ready: false, fallback: "owl-explaining", item: 13, lessons: "L7", whatEn: "Buhísimo at the Radio Búho microphone (the redo Juan asked for, rounder like our owl)" },
  "max-tired": { ready: false, fallback: "max-thinking", item: 14, lessons: "L7", whatEn: "Max tired (redo: Max's face, plain black circle eyes)" },
};
/** The picture to show: the new one once it's ready, its fallback until then. */
export const pic = (id) => (PICTURES[id]?.ready ? id : PICTURES[id]?.fallback ?? id);
/** A scene picture, only once it exists (a step without one shows its character instead). */
const scene = (id) => (PICTURES[id]?.ready ? id : undefined);

const common = (n, host) => ({
  unit: "1.4", host, sayAs: lesson1.sayAs, praiseEs: PRAISE, praiseEn: lesson1.praiseEn, encourageEn: lesson1.encourageEn, kindEn: lesson1.kindEn,
});

// ------------------------------------------------------------------ helpers
const W = (n) => NUM_ES[n];
const D = (i) => DAYS_ES[i];
const M = (m) => MONTHS_ES[m - 1];
/** Calendar tap on the week (only `days` active) / the year (only `months` active). */
const TAP_DAY = (id, i, days, extra = {}) => ({ id, type: "calendar", mode: "tap", view: "week", sayEs: `Es ${D(i)}.`, target: i, days, en: `It's ${DAYS_EN[i]}.`, ...extra });
const TAP_MONTH = (id, m, months, extra = {}) => ({ id, type: "calendar", mode: "tap", view: "year", sayEs: `Es ${M(m)}.`, target: m, months, en: `It's ${MONTHS_EN[m - 1]}.`, ...extra });
const ORDER_DAYS = (id, from, to, extra = {}) => {
  const seq = Array.from({ length: to - from + 1 }, (_, k) => from + k);
  return { id, type: "order", view: "week", seq, wordsEs: seq.map(D), titleEn: "Put the days in order", contextEn: "Tap the days in order, from Monday.", ...extra };
};
const ORDER_MONTHS = (id, from, to, extra = {}) => {
  const seq = Array.from({ length: to - from + 1 }, (_, k) => from + k);
  return { id, type: "order", view: "year", seq, wordsEs: seq.map(M), titleEn: "Put the months in order", contextEn: `Tap the months in order, from ${MONTHS_EN[from - 1]}.`, ...extra };
};
const SONG = (id, s, numerals = false, extra = {}) => ({ id, type: "song", song: s.song, linesEs: s.linesEs, numerals, ...(s.titleEs ? { titleEs: s.titleEs } : {}),
  titleEn: numerals ? `Sing along with digits: ${s.titleEn}` : `Sing along: ${s.titleEn}`, ...extra });
const CLIP = (id, clip, linesEs, en, titleEn) => ({ id, type: "clip", clip, titleEn, linesEs, en });
/** The cast for «Who is it?» (bubbles layout, js/lesson.js chooseWho), in this order. */
const ART4 = [{ art: "valentina", labelEn: "Valentina" }, { art: "samuel", labelEn: "Samuel" }, { art: "matilda", labelEn: "Matilda" }, { art: "max", labelEn: "Max" }];
const BDAY4 = [dateEs(20, 7), dateEs(10, 1), dateEs(15, 6), dateEs(29, 2)];
const DP = (d, m) => ({ d, m, es: dateEs(d, m) });

// ------------------------------------------------------------------ items
// Counted items of content/lessons_1.1-1.6.json (1.4). Days and months carry their place on the
// calendar (Review asks them as a calendar tap). tu and el are matched inside sentences, never asked bare.
const DAY_ITEM = (i, lesson) => ({ id: `day-${i}`, unit: "1.4", es: D(i), en: DAYS_EN[i], day: i, lesson });
const MONTH_ITEM = (m, lesson) => ({ id: `month-${m}`, unit: "1.4", es: M(m), en: MONTHS_EN[m - 1], month: m, lesson });
export const ITEMS = [
  { id: "la-semana", unit: "1.4", es: "la semana", en: "the week", lesson: 2 },
  ...[0, 1, 2, 3].map((i) => DAY_ITEM(i, 2)),
  ...[4, 5, 6].map((i) => DAY_ITEM(i, 3)),
  { id: "el-mes", unit: "1.4", es: "el mes", en: "the month", lesson: 4 },
  ...[1, 2, 3, 4].map((m) => MONTH_ITEM(m, 4)),
  ...[5, 6, 7, 8].map((m) => MONTH_ITEM(m, 5)),
  ...[9, 10, 11, 12].map((m) => MONTH_ITEM(m, 6)),
  { id: "el-ano", unit: "1.4", es: "el año", en: "the year", lesson: 6 },
  { id: "cuando-cumple", unit: "1.4", es: "¿Cuándo es tu cumpleaños?", en: "When is your birthday?", lesson: 9 },
  { id: "el-cumpleanos", unit: "1.4", es: "el cumpleaños", en: "the birthday", lesson: 9 },
  { id: "tu", unit: "1.4", es: "tu", formsEs: ["tu cumpleaños"], matchForms: ["tu"], en: "your birthday", lesson: 9 },
  { id: "el-primero", unit: "1.4", es: "el primero", en: "the 1st (Colombia)", lesson: 9 },
  { id: "el-uno", unit: "1.4", es: "el uno", en: "the 1st (often in Spain)", lesson: 9 },
  { id: "el-fecha", unit: "1.4", es: "el", formsEs: ["el veinte de julio"], en: "the 20th of July", lesson: 10 },
  { id: "la-fecha", unit: "1.4", es: "la fecha", en: "the date", lesson: 10 },
  { id: "feliz-cumple", unit: "1.4", es: "¡Feliz cumpleaños!", en: "Happy birthday!", lesson: 10 },
];

// ------------------------------------------------------------------ songs (all three still to make: GPU)
// Juan's rules: sung (ACE-Step), short, only taught words, no filler; he picks each from a shortlist.
// Until audio/songs/<song>.mp3 and its timings are in audio/songs/songs.json, the steps say "Song coming
// soon" and light the words on a 90 BPM beat. The clips D1–D5 are cut from «La semana» and «El año».
export const SONGS = {
  la_semana: { song: "la_semana", titleEs: "La semana", titleEn: "The week",
    linesEs: ["Lunes, martes,", "miércoles, jueves: ¡la semana!", "Viernes, sábado…", "¡domingo! ¡Fenomenal!", "La semana: lunes, martes, miércoles,", "jueves, viernes, sábado, domingo."] },
  el_ano: { song: "el_ano", titleEs: "El año", titleEn: "The year",
    linesEs: ["Enero, febrero,", "marzo, abril… ¡muy bien!", "Mayo, junio,", "julio, agosto… ¡fantástico!", "Septiembre, octubre,", "noviembre, diciembre: ¡el año!",
      "El año: enero, febrero, marzo, abril,", "mayo, junio, julio, agosto,", "septiembre, octubre, noviembre, diciembre."] },
  cuando_es_tu_cumpleanos: { song: "cuando_es_tu_cumpleanos", titleEs: "¿Cuándo es tu cumpleaños?", titleEn: "When is your birthday?",
    linesEs: ["¿Cuándo es tu cumpleaños?", "El diez de enero.", "¿Cuándo es tu cumpleaños?", "¡El veintinueve de febrero!", "¿Cuándo es tu cumpleaños?", "El quince de junio.",
      "¿Cuándo es tu cumpleaños?", "El veinte de julio.", "¿Cuándo es tu cumpleaños?", "El siete de agosto: ¡fenomenal!"] },
};
const SONG_SET_7 = ["la_semana", "el_ano"].map((k) => ({ song: SONGS[k].song, linesEs: SONGS[k].linesEs, titleEs: SONGS[k].titleEs, titleEn: `Song: ${SONGS[k].titleEn}` }));

// ------------------------------------------------------------------ Radio Búho
// The callers keep their own synthetic voices (24 Oct 2026); people who aren't in the cast are voices only.
// Kindness rule: the feelings are about the day or the weather, never about people.
export const RADIO = [
  { id: "1.4-7", lesson: "1.4-7", unit: "1.4", titleEn: "Radio Búho: the week and the months", songs: SONG_SET_7,
    lines: [
      { who: "buho", clip: "D0", es: "¡Buenos días! Soy Buhísimo. ¿Cómo estás?", en: "Good morning! I'm Buhísimo. How are you?" },
      { who: "valentina", clip: "D8", es: "¡Hola, Buhísimo! Me llamo Valentina. ¡Es sábado! ¡Fantástico!", en: "Hi, Buhísimo! My name is Valentina. It's Saturday! Fantastic!" },
      { who: "caller", nameEn: "Caller from Peru", voice: "caller_peru", clip: "D8", es: "¡Hola, Buhísimo! ¿Es martes?", en: "Hi, Buhísimo! Is it Tuesday?" },
      { who: "buho", clip: "D8", es: "No, es miércoles.", en: "No, it's Wednesday." },
      { who: "caller", nameEn: "Caller from Peru", voice: "caller_peru", clip: "D8", es: "¿Miércoles? ¡Fenomenal!", en: "Wednesday? Great!" },
      { who: "max", clip: "D8", es: "¡Hola, Buhísimo! Soy Max. ¿Lunes? Matilda está regular.", en: "Hi, Buhísimo! I'm Max. Monday? Matilda is so-so." },
      { who: "caller", nameEn: "Caller from Spain", voice: "caller_espana", clip: "D8", es: "¡Hola, Buhísimo! Soy de España. Es domingo. ¡Fenomenal!", en: "Hi, Buhísimo! I'm from Spain. It's Sunday. Great!" },
      { who: "caller", nameEn: "Caller from Chile", voice: "caller_chile", clip: "D8", es: "¡Hola! Soy de Chile. ¿Julio? Regular.", en: "Hi! I'm from Chile. July? So-so." },
      { who: "buho", clip: "D9", es: "¡Muy bien! La semana, el mes, el año… ¡hasta luego!", en: "Very good! The week, the month, the year… see you later!" },
    ] },
  // The L13 call-in (like 1.3 L20): not in the Radio tab. The Spain caller says «el uno», the Colombian «el primero».
  { id: "1.4-13", lesson: "1.4-13", unit: "1.4", titleEn: "The party calendar", inTab: false,
    lines: [
      { who: "caller", nameEn: "Caller from Spain", voice: "caller_espana", es: "Hola, Buhísimo. Soy de España. Mi cumpleaños es el uno de mayo.", en: "Hello, Buhísimo. I'm from Spain. My birthday is the 1st of May." },
      { who: "caller", nameEn: "Caller from Colombia", voice: "caller_neutral_f", es: "Hola, Buhísimo. Soy de Colombia. Mi cumpleaños es el primero de octubre.", en: "Hello, Buhísimo. I'm from Colombia. My birthday is the 1st of October." },
      { who: "caller", nameEn: "Caller from Argentina", voice: "caller_argentina", es: "¡Hola, Buhísimo! Soy de Argentina. Mi cumpleaños es el doce de noviembre.", en: "Hi, Buhísimo! I'm from Argentina. My birthday is the 12th of November." },
    ] },
];

// =================================================================== L1 · repaso (host: Buhísimo)
const L1 = {
  ...common(1, "owl-explaining"), id: "1.4-1", n: 1, kind: "repaso",
  titleEs: "Veinte, veinticinco, treinta", titleEn: "Review: numbers 0–31",
  storyEn: "Dates need every number up to 31. Before the days and months: numbers, names and ages, mixed up.",
  canDoEn: "Unit 1.3 is still fresh: every number to 31, names and ages.",
  xpBase: 10, learnedEs: [],
  steps: [
    { id: "r-count-fives", type: "count", sayEs: "Cinco, diez, quince, veinte, veinticinco, treinta.", en: "Five, ten, fifteen, twenty, twenty-five, thirty.",
      seq: [5, 10, 15, 20, 25, 30], wordsEs: [5, 10, 15, 20, 25, 30].map(W), contextEn: "Count in fives: 5, 10, 15…", extra: [{ n: 24, es: W(24) }, { n: 13, es: W(13) }] },
    { id: "r-pick-25", type: "numpick", sayEs: W(25), nums: [24, 25, 15, 5], answer: 1, en: "25 (twenty-five)", lookalike: "veinticuatro/veinticinco" },
    SONG("r-song-20-31-digits", SONGS_13.numeros_20_31, true),
    { id: "r-dict-fives", type: "dictation", sayEs: "Uno, cinco, diez, quince, veinte, veinticinco, treinta.", en: "One, five, ten, fifteen, twenty, twenty-five, thirty.", answer: [1, 5, 10, 15, 20, 25, 30] },
    { id: "r-pick-27", type: "numpick", sayEs: W(27), nums: [26, 27, 17, 7], answer: 1, en: "27 (twenty-seven)", lookalike: "veintiséis/veintisiete" },
    { id: "r-card-max", type: "idcard", mode: "read", titleEn: "Read the ID card",
      card: { photo: "max", number: "AU 4 281 906", fields: [{ qEs: "¿El nombre?", valueEs: "Max" }, { qEs: "¿La edad?", value: 13 }] },
      promptEn: "How old is Max?", optionsEs: ["Max tiene trece años.", "Max tiene tres años.", "Max tiene doce años."], answer: 0, answerEn: "Max is thirteen." },
    { id: "r-who-amigo", type: "choose", layout: "bubbles", speaker: "matilda", speakerArt: "matilda-wave", titleEn: "Who is it?", promptEs: "Es el amigo de Max.", focusEs: "el amigo",
      optionsArt: [{ art: "samuel", labelEn: "Samuel" }, { art: "valentina", labelEn: "Valentina" }], tagsEs: ["el amigo", "la amiga"], answer: 0,
      answerEs: "Samuel es el amigo de Max.", answerEn: "Samuel is Max's friend.",
      rightEn: "[[el amigo]] is a friend who's a boy: Samuel.", whyEn: "[[el amigo]] is a friend who's a boy. Valentina is [[la amiga]] (a girl), so it's Samuel." },
    { id: "r-gap-apellido", type: "gap", es: "Mi apellido es Restrepo.", en: "My surname is Restrepo.", blank: "Mi apellido", optionsEs: ["Mi nombre", "Mi apellido", "Mi carnet de identidad"] },
    { id: "r-type-31", type: "numtype", digit: 31, answerEs: W(31), en: "31 (thirty-one)" },
    { id: "r-tiles-samuel", type: "tiles", character: "samuel", en: "My name is Samuel. I'm thirteen.",
      answerEs: ["me llamo", "Samuel", "tengo", "trece años"], tilesEs: ["tres", "Samuel", "trece años", "tengo", "me llamo", "tiene"], fullEs: "Me llamo Samuel. Tengo trece años." },
    { id: "r-type-cuantos", type: "type", en: "How old are you?", answerEs: "¿Cuántos años tienes?" },
    { id: "r-match", type: "match", pairs: [15, 20, 25, 30, 31].map((n) => ({ es: W(n), en: String(n) })) },
    { id: "r-speak", type: "speak", speaker: "neutral", character: "owl-explaining", es: "Uno, cinco, diez, quince, veinte, veinticinco, treinta.", en: "One, five, ten, fifteen, twenty, twenty-five, thirty." },
  ],
};

// =================================================================== L2 · La semana (host: Matilda)
const L2 = {
  ...common(2, pic("matilda-sleepy")), id: "1.4-2", n: 2, kind: "learn",
  titleEs: "La semana", titleEn: "The week",
  storyEn: "It's Monday in Salento, and Matilda is sleepy. The first four days of the week.",
  canDoEn: "Now you can say Monday to Thursday, and you know days take a small letter.",
  xpBase: 10, learnedEs: ["la semana", "lunes", "martes", "miércoles", "jueves"],
  steps: [
    { id: "intro-lunes", type: "intro", cal: { view: "week", lit: [0], names: "lit" }, contextEn: "Matilda yawns. It's the first day of the week:",
      es: "lunes", en: "Monday", exampleEs: "Es lunes.", exampleEn: "It's Monday.", character: pic("matilda-sleepy"),
      noteEn: "[[Es lunes.]] = It's Monday. Spanish needs no word for “it”, so [[es]] here means “it is” (in Unit 1.1 it meant “he is” or “she is”)." },
    { id: "table-small", type: "table", titleEn: "Small letters for days", contextEn: "In Spanish, days take a small letter. But the first word of a sentence still takes a capital, even a day.",
      rows: [
        { es: "Es lunes.", en: "✓ It's Monday: a small l", exampleEs: "Es lunes.", exampleEn: "Not [Es Lunes]: that's “Almost”." },
        { es: "Lunes, martes…", en: "✓ The first word: a capital, even a day", exampleEs: "Lunes, martes, miércoles, jueves.", exampleEn: "Monday, Tuesday, Wednesday, Thursday." },
      ],
      noteEn: "Small letter inside a sentence ([[Es lunes.]]), capital at the start ([[Lunes, martes…]])." },
    { id: "intro-martes", type: "intro", character: "matilda", cal: { view: "week", lit: [1], names: "lit" }, contextEn: "The next day:", es: "martes", en: "Tuesday", exampleEs: "Es martes.", exampleEn: "It's Tuesday." },
    TAP_DAY("tap-martes", 1, [0, 1]),
    { id: "intro-miercoles", type: "intro", character: "max", cal: { view: "week", lit: [2], names: "lit" }, contextEn: "Max knows the third day:", es: "miércoles", en: "Wednesday",
      exampleEs: "Es miércoles.", exampleEn: "It's Wednesday.",
      noteEn: "The accent is on the é: MIÉR-co-les. Spanish calendars write X for [[miércoles]], because M is [[martes]]." },
    { id: "pick-miercoles", type: "pick", character: "max", promptEs: "Es miércoles.", options: ["It's Wednesday.", "It's Tuesday.", "It's Monday.", "It's March."], answer: 0 },
    { id: "intro-jueves", type: "intro", character: pic("samuel-wave"), cal: { view: "week", lit: [3], names: "lit" }, contextEn: "Samuel likes this one:", es: "jueves", en: "Thursday",
      exampleEs: "Es jueves. ¡Fenomenal!", exampleEn: "It's Thursday. Great!" },
    TAP_DAY("tap-jueves", 3, [0, 1, 2, 3]),
    { id: "intro-semana", type: "intro", character: "owl-explaining", cal: { view: "week", lit: [0, 1, 2, 3], names: "lit" }, contextEn: "Buhísimo puts them together:",
      es: "la semana", en: "the week", exampleEs: "La semana: lunes, martes, miércoles, jueves…", exampleEn: "The week: Monday, Tuesday, Wednesday, Thursday…",
      noteEn: "The week has seven days. The other three come next lesson." },
    CLIP("clip-d1", "D1", ["Lunes, martes,", "miércoles, jueves: ¡la semana!"], "Monday, Tuesday, Wednesday, Thursday: the week!", "Chant along: Radio Búho's week song"),
    { id: "gap-d1", type: "gap", es: "Lunes, martes, miércoles, jueves: ¡la semana!", en: "Monday, Tuesday, Wednesday, Thursday: the week!", blank: "miércoles", optionsEs: ["martes", "miércoles", "jueves"] },
    ORDER_DAYS("order-l-j", 0, 3),
    { id: "listen-martes", type: "listen", sayEs: "Es martes.", en: "It's Tuesday.", optionsEs: ["Es martes.", "Es miércoles.", "Es lunes.", "Es jueves."], answer: 0 },
    { id: "b-es-en-jueves", type: "tiles", dir: "es-en", character: pic("samuel-wave"), promptEs: "Es jueves. ¡Fenomenal!", en: "It's Thursday. Great!",
      answerEn: ["It's", "Thursday.", "Great!"], tilesEn: ["Great!", "Tuesday.", "It's", "Thursday.", "Monday."] },
    { id: "b-en-es-miercoles", type: "tiles", character: "max", en: "It's Wednesday.", answerEs: ["es", "miércoles"], tilesEs: ["martes", "es", "miércoles", "jueves", "está"], fullEs: "Es miércoles." },
    { id: "pick-chant", type: "pick", titleEn: "What does it mean?", character: "owl-explaining", promptEs: "Lunes, martes, miércoles, jueves.",
      options: ["Monday, Tuesday, Wednesday, Thursday.", "Tuesday, Wednesday, Thursday, Friday.", "Monday, Thursday, Wednesday, Tuesday.", "January, February, March, April."], answer: 0 },
    { id: "type-es-lunes", type: "type", titleEn: "Now in Spanish", en: "It's Monday.", answerEs: "Es lunes." },
    { id: "type-jueves", type: "type", en: "Thursday", answerEs: "jueves" },
    { id: "match-2", type: "match", pairs: [{ es: "la semana", en: "the week" }, { es: "lunes", en: "Monday" }, { es: "martes", en: "Tuesday" }, { es: "miércoles", en: "Wednesday" }, { es: "jueves", en: "Thursday" }] },
    { id: "speak-semana", type: "speak", speaker: "neutral", character: "matilda", es: "Lunes, martes, miércoles, jueves: ¡la semana!", en: "Monday, Tuesday, Wednesday, Thursday: the week!" },
  ],
};

// =================================================================== L3 · ¡Sábado! (host: Max)
const L3 = {
  ...common(3, "max-jump"), id: "1.4-3", n: 3, kind: "learn",
  titleEs: "¡Sábado!", titleEn: "Friday, Saturday, Sunday",
  storyEn: "The end of the week: Max jumps on Saturdays, and Matilda dozes in the sun on Sundays.",
  canDoEn: "Now you can say the whole week, and you can read a Spanish calendar: L M X J V S D.",
  xpBase: 10, learnedEs: ["viernes", "sábado", "domingo"],
  steps: [
    ORDER_DAYS("warm-order", 0, 3, { titleEn: "Warm-up: Monday to Thursday" }),
    { id: "intro-viernes", type: "intro", character: "max-wave", cal: { view: "week", lit: [4], names: "lit" }, contextEn: "Max waves to Samuel:", es: "viernes", en: "Friday",
      exampleEs: "Es viernes. ¿Qué tal, Samuel?", exampleEn: "It's Friday. How's it going, Samuel?" },
    TAP_DAY("tap-viernes", 4, [0, 1, 2, 3, 4]),
    { id: "intro-sabado", type: "intro", character: "max-jump", cal: { view: "week", lit: [5], names: "lit" }, contextEn: "Max's favourite day:", es: "sábado", en: "Saturday",
      exampleEs: "Es sábado. ¡Fantástico!", exampleEn: "It's Saturday. Fantastic!", noteEn: "SÁ-ba-do: the accent is on the first á." },
    { id: "pick-sabado", type: "pick", speaker: "neutral", character: "max-celebrate", promptEs: "Es sábado. Max está fenomenal.",
      options: ["It's Saturday. Max is feeling great.", "It's Sunday. Max is feeling great.", "It's Saturday. Max is from Melbourne.", "It's Friday. Max is so-so."], answer: 0 },
    { id: "intro-domingo", type: "intro", character: "owl-explaining", cal: { view: "week", lit: [6], names: "lit" }, contextEn: "Matilda dozes in the sun. Buhísimo says:", es: "domingo", en: "Sunday",
      exampleEs: "Es domingo. Matilda está muy bien.", exampleEn: "It's Sunday. Matilda is very well." },
    { id: "card-week", type: "calendar", mode: "card", view: "week", titleEn: "A Spanish calendar: L M X J V S D",
      contextEn: "Spanish calendars start on Monday, and write X for [[miércoles]] (M is [[martes]]). Tap a day to hear it." },
    CLIP("clip-d2", "D2", ["Viernes, sábado…", "¡domingo! ¡Fenomenal!"], "Friday, Saturday… Sunday! Great!", "Chant along: Radio Búho's week song"),
    SONG("song-semana", SONGS.la_semana),
    ORDER_DAYS("order-week", 0, 6, { titleEn: "The whole week, in order" }),
    { id: "sort-weekend", type: "sort", titleEn: "School day or weekend?", bucketsEn: ["school days", "weekend"],
      cards: [{ es: "lunes", bucket: 0 }, { es: "sábado", bucket: 1 }, { es: "miércoles", bucket: 0 }, { es: "domingo", bucket: 1 }, { es: "viernes", bucket: 0 }, { es: "jueves", bucket: 0 }, { es: "martes", bucket: 0 }] },
    { id: "listen-domingo", type: "listen", sayEs: "Es domingo.", en: "It's Sunday.", optionsEs: ["Es domingo.", "Es sábado.", "Es lunes.", "Es viernes."], answer: 0 },
    { id: "gap-sabado", type: "gap", es: "Viernes, sábado, domingo.", en: "Friday, Saturday, Sunday.", blank: "sábado", optionsEs: ["jueves", "sábado", "domingo"] },
    { id: "b-es-en-viernes", type: "tiles", dir: "es-en", character: "max-wave", promptEs: "Es viernes. ¿Qué tal, Samuel?", en: "It's Friday. How's it going, Samuel?",
      answerEn: ["It's", "Friday.", "How's it going,", "Samuel?"], tilesEn: ["Samuel?", "Thursday.", "It's", "How's it going,", "Friday."] },
    { id: "b-en-es-domingo", type: "tiles", character: "owl-explaining", en: "It's Sunday. Matilda is very well.",
      answerEs: ["es", "domingo", "Matilda", "está", "muy bien"], tilesEs: ["sábado", "muy bien", "es", "Matilda", "domingo", "está"], fullEs: "Es domingo. Matilda está muy bien." },
    { id: "pick-sabado-2", type: "pick", titleEn: "What does it mean?", character: "owl-explaining", promptEs: "Viernes, sábado, domingo.",
      options: ["Friday, Saturday, Sunday.", "Thursday, Friday, Saturday.", "Saturday, Sunday, Monday.", "Friday, Sunday, Saturday."], answer: 0 },
    { id: "type-sabado", type: "type", titleEn: "Now in Spanish", en: "It's Saturday.", answerEs: "Es sábado." },
    { id: "type-viernes", type: "type", en: "Friday", answerEs: "viernes" },
    { id: "match-3", type: "match", pairs: [{ es: "viernes", en: "Friday" }, { es: "sábado", en: "Saturday" }, { es: "domingo", en: "Sunday" }, { es: "jueves", en: "Thursday" }, { es: "la semana", en: "the week" }] },
    { id: "speak-week", type: "speak", speaker: "neutral", character: "max", es: "La semana: lunes, martes, miércoles, jueves, viernes, sábado, domingo.", en: "The week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday." },
  ],
};

// =================================================================== L4 · Enero… abril (host: Samuel)
const L4 = {
  ...common(4, pic("samuel-calendar")), id: "1.4-4", n: 4, kind: "learn",
  titleEs: "Enero… abril", titleEn: "January to April",
  storyEn: "Samuel's birthday month comes first in the year. And Max is grinning about February…",
  canDoEn: "Now you can say January to April, and you won't mix up martes and marzo.",
  xpBase: 10, learnedEs: ["el mes", "enero", "febrero", "marzo", "abril"],
  steps: [
    TAP_DAY("warm-viernes", 4, [0, 1, 2, 3, 4, 5, 6], { titleEn: "Warm-up: tap the day" }),
    { id: "intro-enero", type: "intro", character: pic("samuel-calendar"), cal: { view: "year", lit: [1], names: "lit" }, contextEn: "Samuel shows the first page of the calendar:",
      es: "enero", en: "January", exampleEs: "Es enero.", exampleEn: "It's January.", noteEn: "Months take a small letter too, like the days: [[enero]]." },
    { id: "intro-febrero", type: "intro", character: "max", cal: { view: "year", lit: [2], names: "lit" }, contextEn: "Max grins. He has a secret about this month:",
      es: "febrero", en: "February", exampleEs: "Es febrero.", exampleEn: "It's February." },
    TAP_MONTH("tap-febrero", 2, [1, 2]),
    { id: "intro-marzo", type: "intro", character: pic("valentina-thinking"), cal: { view: "year", lit: [3], names: "lit" }, contextEn: "Valentina turns the page:",
      es: "marzo", en: "March", exampleEs: "Es marzo.", exampleEn: "It's March.",
      noteEn: "[[marzo]] (a month) and [[martes]] (a day) both start with mar-. Listen to the end: mar-ZO, MAR-tes." },
    { id: "sort-day-month", type: "sort", titleEn: "A day or a month?", bucketsEn: ["a day", "a month"],
      cards: [{ es: "lunes", bucket: 0 }, { es: "marzo", bucket: 1 }, { es: "martes", bucket: 0 }, { es: "enero", bucket: 1 }, { es: "jueves", bucket: 0 }, { es: "febrero", bucket: 1 }] },
    { id: "intro-abril", type: "intro", character: "matilda", cal: { view: "year", lit: [4], names: "lit" }, contextEn: "Matilda turns one more page:",
      es: "abril", en: "April", exampleEs: "Es abril.", exampleEn: "It's April." },
    { id: "intro-mes", type: "intro", character: "owl-explaining", cal: { view: "year", lit: [1, 2, 3, 4], names: "lit" }, contextEn: "Buhísimo asks Max which month it is:",
      es: "el mes", en: "the month", exampleEs: "¿El mes? Febrero.", exampleEn: "The month? February." },
    CLIP("clip-d3", "D3", ["Enero, febrero,", "marzo, abril… ¡muy bien!"], "January, February, March, April… very good!", "Chant along: Radio Búho's year song"),
    ORDER_MONTHS("order-ene-abr", 1, 4),
    { id: "spell-marzo", type: "spell", spell: true, sayEs: "Eme, a, erre, zeta, o.", answerEs: "marzo", en: "a month (the third one)" },
    { id: "listen-mes", type: "listen", sayEs: "¿El mes? Marzo.", en: "The month? March.", optionsEs: ["¿El mes? Marzo.", "¿El mes? Martes.", "¿El mes? Abril.", "¿El mes? Enero."], answer: 0 },
    { id: "b-es-en-abril", type: "tiles", speaker: "neutral", dir: "es-en", character: "max-celebrate", promptEs: "Es abril. Max está fenomenal.", en: "It's April. Max is feeling great.",
      answerEn: ["It's", "April.", "Max", "is feeling great."], tilesEn: ["is feeling great.", "Max", "August.", "It's", "April.", "is so-so."] },
    { id: "b-en-es-mes", type: "tiles", character: "owl-explaining", en: "The month? January.", answerEs: ["el mes", "enero"], tilesEs: ["febrero", "el mes", "es", "enero"], fullEs: "¿El mes? Enero." },
    { id: "pick-mes", type: "pick", speaker: "neutral", titleEn: "What does it mean?", character: "owl-explaining", promptEs: "¿El mes? Febrero. ¡Fantástico!",
      options: ["The month? February. Fantastic!", "The month? January. Fantastic!", "The week? February. Fantastic!", "The year? February. Fantastic!"], answer: 0 },
    { id: "type-marzo", type: "type", titleEn: "Now in Spanish", en: "It's March.", answerEs: "Es marzo." },
    { id: "type-el-mes", type: "type", en: "the month", answerEs: "el mes" },
    { id: "match-4", type: "match", pairs: [{ es: "el mes", en: "the month" }, { es: "enero", en: "January" }, { es: "febrero", en: "February" }, { es: "marzo", en: "March" }, { es: "abril", en: "April" }] },
    { id: "speak-ene-abr", type: "speak", speaker: "neutral", character: pic("samuel-wave"), es: "Enero, febrero, marzo, abril… ¡muy bien!", en: "January, February, March, April… very good!" },
  ],
};

// =================================================================== L5 · Mayo… agosto (host: Valentina)
const L5 = {
  ...common(5, pic("valentina-wave")), id: "1.4-5", n: 5, kind: "learn",
  titleEs: "Mayo… agosto", titleEn: "May to August",
  storyEn: "Valentina's birthday month is here, and two months that sound almost the same: junio and julio.",
  canDoEn: "Now you can say May to August, and you can hear junio and julio apart.",
  xpBase: 10, learnedEs: ["mayo", "junio", "julio", "agosto"],
  steps: [
    ORDER_MONTHS("warm-order", 1, 4, { titleEn: "Warm-up: January to April" }),
    { id: "intro-mayo", type: "intro", character: pic("valentina-wave"), cal: { view: "year", lit: [5], names: "lit" }, contextEn: "Valentina turns to the fifth month:",
      es: "mayo", en: "May", exampleEs: "Es mayo.", exampleEn: "It's May." },
    { id: "intro-junio", type: "intro", character: "matilda", cal: { view: "year", lit: [6], names: "lit" }, contextEn: "Matilda smiles. This one is hers:",
      es: "junio", en: "June", exampleEs: "Es junio.", exampleEn: "It's June." },
    TAP_MONTH("tap-mayo", 5, [1, 2, 3, 4, 5, 6]),
    { id: "intro-julio", type: "intro", character: pic("valentina-celebrate"), cal: { view: "pair", months: [6, 7] }, contextEn: "And this one is Valentina's:",
      es: "julio", en: "July", exampleEs: "Es julio. ¡Fantástico!", exampleEn: "It's July. Fantastic!", lookalike: "junio/julio",
      noteEn: "Careful: [[junio]] (with n) and [[julio]] (with l) are one letter apart. Listen for the n or the l." },
    { id: "pick-junio-julio", type: "pick", speaker: "neutral", character: "max-thinking", titleEn: "Listen for the n and the l", promptEs: "Junio, julio. ¡Junio! ¡Julio!", lookalike: "junio/julio",
      options: ["June, July. June! July!", "July, June. July! June!", "June, June. June! July!", "July, July. June! June!"], answer: 0 },
    { id: "junio-o-julio", type: "choose", titleEn: "June or July?", character: "max-thinking", promptEs: "¿Junio? No, julio.", optionsEn: ["June", "July"], answer: 1,
      answerEs: "¿Junio? No, julio.", answerEn: "June? No, July.", lookalike: "junio/julio" },
    { id: "pages-junio", type: "calendar", mode: "tap", view: "pages", pages: [6, 7], sayEs: "Es junio.", target: 6, en: "It's June.", lookalike: "junio/julio",
      titleEn: "Which page is it?" },
    { id: "spell-junio", type: "spell", spell: true, sayEs: "Jota, u, ene, i, o.", answerEs: "junio", en: "a month (with an n)", lookalike: "junio/julio" },
    { id: "intro-agosto", type: "intro", character: "owl-celebrating", cal: { view: "year", lit: [8], names: "lit" }, contextEn: "Buhísimo's birthday month:",
      es: "agosto", en: "August", exampleEs: "Es agosto. ¡Muy bien!", exampleEn: "It's August. Very good!" },
    { id: "culture-seasons", type: "culture", art: "seasons", titleEn: "Is July cold?", es: "Es julio.", en: "It's July.",
      textEn: "Colombia is near the equator, so it has no summer or winter: Salento feels much the same all year, with rainy and dry spells. In Melbourne (and in Chile) July is winter: beanies and rain!" },
    CLIP("clip-d4", "D4", ["Mayo, junio,", "julio, agosto… ¡fantástico!"], "May, June, July, August… fantastic!", "Chant along: Radio Búho's year song"),
    ORDER_MONTHS("order-may-ago", 5, 8),
    { id: "gap-julio", type: "gap", es: "Mayo, junio, julio, agosto.", en: "May, June, July, August.", blank: "julio", optionsEs: ["junio", "julio"], lookalike: "junio/julio" },
    { id: "b-es-en-julio", type: "tiles", dir: "es-en", character: "max-thinking", promptEs: "¿Junio? No, julio.", en: "June? No, July.", lookalike: "junio/julio",
      answerEn: ["June?", "No,", "July."], tilesEn: ["July.", "June?", "No,", "Yes,", "January?"] },
    { id: "b-en-es-julio", type: "tiles", character: "owl-celebrating", en: "It's July. Buhísimo is feeling great.",
      answerEs: ["es", "julio", "Buhísimo", "está", "fenomenal"], tilesEs: ["junio", "fenomenal", "es", "Buhísimo", "julio", "está"], fullEs: "Es julio. Buhísimo está fenomenal.", lookalike: "junio/julio" },
    { id: "pick-junio", type: "pick", titleEn: "What does it mean?", character: "max-celebrate", promptEs: "¿Junio? ¡Fantástico!",
      options: ["June? Fantastic!", "July? Fantastic!", "June? So-so.", "January? Fantastic!"], answer: 0, lookalike: "junio/julio" },
    { id: "type-julio", type: "type", titleEn: "Now in Spanish", en: "It's July.", answerEs: "Es julio." },
    { id: "type-junio", type: "type", en: "June", answerEs: "junio" },
    { id: "match-5", type: "match", pairs: [{ es: "mayo", en: "May" }, { es: "junio", en: "June" }, { es: "julio", en: "July" }, { es: "agosto", en: "August" }, { es: "el mes", en: "the month" }] },
    { id: "speak-may-ago", type: "speak", speaker: "neutral", character: pic("valentina-celebrate"), es: "Mayo, junio, julio, agosto… ¡fantástico!", en: "May, June, July, August… fantastic!" },
  ],
};

// =================================================================== L6 · Septiembre… diciembre (host: Matilda)
const L6 = {
  ...common(6, "matilda-wave"), id: "1.4-6", n: 6, kind: "learn",
  titleEs: "Septiembre… diciembre", titleEn: "September to December",
  storyEn: "The last four months, the whole year, and a month that looks like a word from your ID card.",
  canDoEn: "Now you can say every month of the year, and you won't mix up el nombre and noviembre.",
  xpBase: 10, learnedEs: ["septiembre", "octubre", "noviembre", "diciembre", "el año"],
  steps: [
    TAP_MONTH("warm-julio", 7, [1, 2, 3, 4, 5, 6, 7, 8], { titleEn: "Warm-up: junio or julio?", lookalike: "junio/julio" }),
    { id: "intro-septiembre", type: "intro", character: "matilda-wave", cal: { view: "year", lit: [9], names: "lit" }, contextEn: "Matilda turns to the ninth month:",
      es: "septiembre", en: "September", exampleEs: "Es septiembre.", exampleEn: "It's September.", noteEn: "Say the p: sep-TIEM-bre." },
    { id: "intro-octubre", type: "intro", character: pic("samuel-wave"), cal: { view: "year", lit: [10], names: "lit" }, contextEn: "Samuel:",
      es: "octubre", en: "October", exampleEs: "Es octubre.", exampleEn: "It's October." },
    TAP_MONTH("tap-octubre", 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    { id: "intro-noviembre", type: "intro", character: "matilda", cal: { view: "namecard" }, contextEn: "Matilda holds Samuel's ID card next to the calendar:",
      es: "noviembre", en: "November", exampleEs: "¿El nombre? Samuel. ¿El mes? Noviembre.", exampleEn: "The name? Samuel. The month? November.", lookalike: "nombre/noviembre",
      noteEn: "Careful: [[el nombre]] is on the ID card (NOM-bre); [[noviembre]] is on the calendar (no-VIEM-bre)." },
    { id: "nm-noviembre", type: "calendar", mode: "tap", view: "namemonth", sayEs: "noviembre", target: 1, en: "November (a month)", titleEn: "A name or a month?", lookalike: "nombre/noviembre",
      rightEn: "[[noviembre]] is a month: the calendar.", whyEn: "[[noviembre]] (no-VIEM-bre) is a month, so it's the calendar. [[el nombre]] is on the ID card." },
    { id: "nm-nombre", type: "calendar", mode: "tap", view: "namemonth", sayEs: "el nombre", target: 0, en: "the name", titleEn: "A name or a month?", lookalike: "nombre/noviembre",
      rightEn: "[[el nombre]] is on the ID card.", whyEn: "[[el nombre]] (NOM-bre) is the name on the ID card, not a month." },
    { id: "intro-diciembre", type: "intro", character: "max-celebrate", cal: { view: "year", lit: [12], names: "lit" }, contextEn: "Max shouts the last month:",
      es: "diciembre", en: "December", exampleEs: "Es diciembre. ¡Fenomenal!", exampleEn: "It's December. Great!" },
    { id: "intro-ano", type: "intro", character: "owl-explaining", cal: { view: "year", lit: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], names: "lit" }, contextEn: "All twelve months:",
      es: "el año", en: "the year", exampleEs: "El año: enero, febrero, marzo…", exampleEn: "The year: January, February, March…",
      noteEn: "You already know it from [[tengo doce años]]. The ñ matters: write [[el año]], with ñ." },
    CLIP("clip-d5", "D5", ["Septiembre, octubre,", "noviembre, diciembre: ¡el año!"], "September, October, November, December: the year!", "Chant along: Radio Búho's year song"),
    SONG("song-ano", SONGS.el_ano),
    ORDER_MONTHS("order-year", 1, 12, { titleEn: "The whole year, in order" }),
    { id: "listen-diciembre", type: "listen", sayEs: "Es diciembre. ¡Fenomenal!", en: "It's December. Great!",
      optionsEs: ["Es diciembre. ¡Fenomenal!", "Es domingo. ¡Fenomenal!", "Es noviembre. ¡Fenomenal!", "Es diciembre. Regular."], answer: 0 },
    { id: "gap-noviembre", type: "gap", es: "¿El nombre? Samuel. ¿El mes? Noviembre.", en: "The name? Samuel. The month? November.", blank: "Noviembre", optionsEs: ["Noviembre", "El nombre"], lookalike: "nombre/noviembre" },
    { id: "b-es-en-diciembre", type: "tiles", dir: "es-en", character: "max-celebrate", promptEs: "Es diciembre. ¡Fenomenal!", en: "It's December. Great!",
      answerEn: ["It's", "December.", "Great!"], tilesEn: ["Great!", "November.", "It's", "December.", "Sunday."] },
    { id: "b-en-es-nombre", type: "tiles", character: "matilda", en: "The name? Samuel. The month? November.", lookalike: "nombre/noviembre",
      answerEs: ["el nombre", "Samuel", "el mes", "noviembre"], tilesEs: ["noviembre", "el mes", "Samuel", "el nombre", "octubre", "el año"], fullEs: "¿El nombre? Samuel. ¿El mes? Noviembre." },
    { id: "pick-ano", type: "pick", titleEn: "What does it mean?", character: "owl-explaining", promptEs: "El año: enero, febrero, marzo…",
      options: ["The year: January, February, March…", "The week: Monday, Tuesday, Wednesday…", "The month: January, February, March…", "The year: June, July, August…"], answer: 0 },
    { id: "type-octubre", type: "type", titleEn: "Now in Spanish", en: "It's October.", answerEs: "Es octubre." },
    { id: "type-ano", type: "type", en: "the year", answerEs: "el año" },
    { id: "match-6", type: "match", pairs: [{ es: "septiembre", en: "September" }, { es: "octubre", en: "October" }, { es: "noviembre", en: "November" }, { es: "diciembre", en: "December" }, { es: "el año", en: "the year" }] },
    { id: "speak-sep-dic", type: "speak", speaker: "neutral", character: "matilda", es: "Septiembre, octubre, noviembre, diciembre: ¡el año!", en: "September, October, November, December: the year!" },
  ],
};

// =================================================================== L7 · Radio Búho (host: Buhísimo)
const L7 = {
  ...common(7, pic("owl-mic")), id: "1.4-7", n: 7, kind: "listen",
  titleEn: "Radio Búho: the week and the months",
  storyEn: "Radio Búho plays the week song and the year song, then five callers say what day or month it is, and how they are.",
  canDoEn: "You sang the week and the year, and understood five callers!",
  xpBase: 15, learnedEs: [],
  steps: [
    { id: "songset", type: "songset", episode: "1.4-7", introLine: 0, titleEn: "Radio Búho: the week and the year", songs: SONG_SET_7 },
    SONG("song-semana", SONGS.la_semana),
    { id: "gap-song-miercoles", type: "gap", es: "Lunes, martes, miércoles, jueves: ¡la semana!", en: "Monday, Tuesday, Wednesday, Thursday: the week!", blank: "miércoles", optionsEs: ["martes", "miércoles", "marzo"] },
    SONG("song-ano", SONGS.el_ano),
    { id: "gap-song-julio", type: "gap", es: "Mayo, junio, julio, agosto… ¡fantástico!", en: "May, June, July, August… fantastic!", blank: "julio", optionsEs: ["junio", "julio"], lookalike: "junio/julio" },
    { id: "radio-calls-1", type: "calradio", episode: "1.4-7", titleEn: "Radio Búho: what day is it? (calls 1–3)", contextEn: "For each caller, tap the day they say, and how they are.",
      faces: ["fenomenal", "regular", "fatal"],
      rows: [
        { lines: [1], labelEn: "Valentina", whenEs: "sábado", optionsEs: ["sábado", "domingo", "lunes"], face: "fenomenal" },
        { lines: [2, 3, 4], labelEn: "Caller from Peru", whenEs: "miércoles", optionsEs: ["martes", "miércoles", "marzo"], face: "fenomenal" },
        { lines: [5], labelEn: "Max", whenEs: "lunes", optionsEs: ["lunes", "martes", "julio"], face: "regular" },
      ] },
    { id: "radio-calls-2", type: "calradio", episode: "1.4-7", titleEn: "Radio Búho: the last two calls", contextEn: "Tap the day or month each caller says, and how they are.",
      faces: ["fenomenal", "regular", "fatal"], lookalike: "junio/julio",
      rows: [
        { lines: [6], labelEn: "Caller from Spain", whenEs: "domingo", optionsEs: ["sábado", "domingo", "diciembre"], face: "fenomenal" },
        { lines: [7], labelEn: "Caller from Chile", whenEs: "julio", optionsEs: ["junio", "julio", "jueves"], face: "regular" },
      ] },
    { id: "transcript-calendario", type: "transcript", episode: "1.4-7", contextEn: "The whole show. Tap a line to hear it; tap EN for the English." },
    { id: "who-sabado", type: "choose", layout: "bubbles", speaker: "owl", speakerArt: "owl-explaining", titleEn: "Who phoned?", promptEs: "¡Es sábado! ¡Fantástico!", focusEs: "sábado",
      optionsArt: [{ art: "valentina", labelEn: "Valentina" }, { art: pic("max-tired"), labelEn: "Max" }], tagsEs: ["sábado", "lunes"], answer: 0,
      answerEs: "¡Hola, Buhísimo! Me llamo Valentina. ¡Es sábado! ¡Fantástico!", answerEn: "Hi, Buhísimo! My name is Valentina. It's Saturday! Fantastic!",
      rightEn: "On the radio Valentina said [[¡Es sábado!]].", whyEn: "On the radio Max said [[¿Lunes?]]. It was Valentina who said [[¡Es sábado!]]." },
    { id: "pick-martes", type: "pick", speaker: "neutral", character: "owl-thinking", promptEs: "¿Es martes? — No, es miércoles.",
      options: ["Is it Tuesday? — No, it's Wednesday.", "Is it Tuesday? — Yes, it's Tuesday.", "Is it March? — No, it's Wednesday.", "Is it Wednesday? — No, it's Tuesday."], answer: 0 },
    { id: "pick-bye", type: "pick", character: "owl-celebrating", promptEs: "¡Muy bien! La semana, el mes, el año… ¡hasta luego!",
      options: ["Very good! The week, the month, the year… see you later!", "Very good! The week, the name, the year… see you later!", "Great! Monday, March, the year… goodbye!", "Very good! The day, the month, the year… good morning!"], answer: 0 },
  ],
};

// =================================================================== L8 · Game: Calendar tap (host: Max)
// Days and months only (Decision 5): full dates wait for L11 and L13.
const L8 = {
  ...common(8, "max-jump"), id: "1.4-8", n: 8, kind: "game",
  titleEn: "Game: calendar tap",
  storyEn: "Max is hopping all over the wall calendar! Hear (or read) a day or a month and tap it before he lands on it.",
  canDoEn: "You beat Max at Calendar tap: every day and every month!",
  xpBase: 15, learnedEs: [], game: true,
  steps: [
    { id: "g-study", type: "calendar", mode: "card", view: "both", titleEn: "Look first: the week and the year",
      contextEn: "Tap a day or a month to hear it. In the game you only hear it (or read it), so look carefully!" },
    { id: "g-caltap", type: "caltap", titleEn: "Calendar tap",
      waves: [
        { titleEs: "la semana", board: "week", roundMs: 6500, rounds: [4, 0, 6, 2, 5, 1, 3].map((i) => ({ sayEs: `Es ${D(i)}.`, day: i })) },
        { titleEs: "el año", board: "year", roundMs: 7500, rounds: [7, 1, 11, 4, 9, 2, 12, 5, 10, 3, 8, 6].map((m) => ({ sayEs: `Es ${M(m)}.`, month: m })) },
        { titleEn: "Look-alikes!", board: "mix", roundMs: 8000, lookalike: "junio/julio, nombre/noviembre", rounds: [
          { sayEs: "Es junio. — No, es julio.", month: 7 }, { sayEs: "Es martes.", day: 1 }, { sayEs: "Es marzo.", month: 3 },
          { sayEs: "el nombre", card: true }, { sayEs: "Es noviembre.", month: 11 }, { sayEs: "Es junio.", month: 6 }] },
      ] },
    { id: "g-spell-julio", type: "spell", spell: true, sayEs: "Jota, u, ele, i, o.", answerEs: "julio", en: "a month (with an l)", lookalike: "junio/julio" },
    ORDER_DAYS("g-order-week", 0, 6, { titleEn: "The whole week, against the clock", timed: true }),
    { id: "g-listen-julio", type: "listen", sayEs: "Es junio. — No, es julio.", en: "It's June. — No, it's July.", lookalike: "junio/julio",
      optionsEs: ["Es junio. — No, es julio.", "Es julio. — No, es junio.", "Es junio. — Sí, es junio.", "Es jueves. — No, es julio."], answer: 0 },
  ],
};

// =================================================================== L9 · ¿Cuándo es tu cumpleaños? (host: Valentina)
// Only «el primero / el uno + de + month» here: el + any other number waits for L10, so the cast give
// only their month (canon: Samuel enero, Max febrero, Matilda junio, Valentina julio, Buhísimo agosto).
const L9 = {
  ...common(9, pic("valentina-asking")), id: "1.4-9", n: 9, kind: "learn",
  titleEs: "¿Cuándo es tu cumpleaños?", titleEn: "When is your birthday?",
  storyEn: "Valentina wants to know everyone's birthday month. And the first of the month has two names.",
  canDoEn: "Now you can ask someone's birthday and give your birthday month.",
  xpBase: 10, learnedEs: ["¿Cuándo es tu cumpleaños?", "el cumpleaños", "tu cumpleaños", "el primero", "el uno"],
  steps: [
    TAP_MONTH("warm-enero", 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], { titleEn: "Warm-up: tap the month" }),
    { id: "intro-cumpleanos", type: "intro", character: pic("valentina-wave"), scene: scene("scene-party"), contextEn: "Valentina is making a birthday list:",
      es: "el cumpleaños", en: "the birthday", exampleEs: "¿El cumpleaños de Samuel? Enero.", exampleEn: "Samuel's birthday? January.",
      noteEn: "[[el cumpleaños]] is one birthday, even though it ends in -s." },
    { id: "intro-cuando", type: "intro", character: pic("valentina-asking"), contextEn: "Valentina asks Max:",
      es: "¿Cuándo es tu cumpleaños?", en: "When is your birthday?", exampleEs: "¿Cuándo es tu cumpleaños?", exampleEn: "When is your birthday?",
      noteEn: "Learn it as one question. Word for word: “When is your birthday?”" },
    { id: "table-mi-tu", type: "table", titleEn: "mi and tu", contextEn: "[[mi]] = my (Unit 1.3). [[tu]] = your. Look at the accent!", lookalike: "tu/tú",
      rows: [
        { es: "mi cumpleaños", en: "my birthday", exampleEs: "¿Mi cumpleaños? Julio.", exampleEn: "My birthday? July." },
        { es: "tu cumpleaños", en: "your birthday", exampleEs: "¿Y tú, Max? ¿Tu cumpleaños?", exampleEn: "And you, Max? Your birthday?" },
      ],
      noteEn: "[[tu]] (your) has no accent. [[tú]] (you, as in [[¿Y tú?]]) has one: [[¿Y tú, Max? ¿Tu cumpleaños?]]" },
    { id: "gap-tu", type: "gap", es: "¿Cuándo es tu cumpleaños?", en: "When is your birthday?", blank: "tu", optionsEs: ["tu", "tú", "mi"], lookalike: "tu/tú" },
    { id: "wall-months", type: "wall", titleEn: "The birthday wall: the months", own: true,
      contextEn: "Valentina asks everyone [[¿Cuándo es tu cumpleaños?]] Tap a bubble to hear the answer.",
      people: [
        { who: "samuel", art: "samuel", labelEn: "Samuel", es: "¿Mi cumpleaños? Enero.", en: "My birthday? January." },
        { who: "max", art: "max", labelEn: "Max", es: "¿Mi cumpleaños? Febrero.", en: "My birthday? February." },
        { who: "matilda", art: "matilda", labelEn: "Matilda", es: "¿Mi cumpleaños? Junio.", en: "My birthday? June." },
        { who: "valentina", art: "valentina", labelEn: "Valentina", es: "¿Mi cumpleaños? Julio.", en: "My birthday? July." },
        { who: "buho", art: "owl-explaining", labelEn: "Buhísimo", es: "¿Mi cumpleaños? Agosto.", en: "My birthday? August." },
      ] },
    { id: "who-julio", type: "choose", layout: "bubbles", speaker: "owl", speakerArt: "owl-explaining", titleEn: "Whose birthday month is it?", promptEs: "¿El cumpleaños? Julio.", focusEs: "Julio",
      optionsArt: ART4, tagsEs: ["julio", "enero", "junio", "febrero"], answer: 0, lookalike: "junio/julio",
      answerEs: "¿El cumpleaños de Valentina? Julio.", answerEn: "Valentina's birthday? July.",
      rightEn: "[[julio]] (with an l) is Valentina's month. Matilda's is [[junio]] (with an n).",
      whyEn: "{picked}'s birthday isn't in [[julio]]. [[Julio]] (with an l) is Valentina's; Matilda's is [[junio]] (with an n)." },
    { id: "intro-primero", type: "intro", character: "owl-explaining", cal: { view: "month", month: 3, circle: [1] }, contextEn: "The first day of the month:",
      es: "el primero", en: "the 1st (of the month)", exampleEs: "El primero de marzo.", exampleEn: "The 1st of March.",
      noteEn: "In Colombia the 1st is [[el primero]]: [[el primero de]] + the month." },
    { id: "intro-uno", type: "intro", character: "owl-explaining", cal: { view: "month", month: 3, circle: [1] }, contextEn: "In Spain you will often hear:",
      es: "el uno", en: "the 1st (often in Spain)", exampleEs: "El uno de marzo, el primero de marzo: ¡muy bien!", exampleEn: "The 1st of March, the 1st of March: very good! (both mean the same)",
      noteEn: "[[el uno de marzo]] = [[el primero de marzo]]. Both mean the 1st." },
    { id: "pages-mayo", type: "calendar", mode: "tap", view: "pages", pages: [3, 5, 8, 10], circle: 1, sayEs: "Es el primero de mayo.", target: 5, en: "It's the 1st of May.", titleEn: "Which page is it?" },
    { id: "pick-samuel-mayo", type: "pick", speaker: "neutral", character: "owl-thinking", promptEs: "¿El cumpleaños de Samuel? ¿El primero de mayo? — No.",
      options: ["Samuel's birthday? The 1st of May? — No.", "Samuel's birthday? The 1st of March? — No.", "My birthday? The 1st of May? — Yes.", "Samuel's name? May? — No."], answer: 0 },
    { id: "listen-primero-junio", type: "listen", sayEs: "¿Cuándo es tu cumpleaños? — Es el primero de junio.", en: "When is your birthday? — It's the 1st of June.", lookalike: "junio/julio",
      optionsEs: ["¿Cuándo es tu cumpleaños? — Es el primero de junio.", "¿Cuándo es tu cumpleaños? — Es el primero de julio.", "¿Cuándo es tu cumpleaños? — ¿Mi cumpleaños? Junio.", "¿Cuándo es tu cumpleaños? — Es el primero de enero."], answer: 0 },
    { id: "b-es-en-agosto", type: "tiles", speaker: "neutral", dir: "es-en", character: "owl-explaining", promptEs: "¿Cuándo es tu cumpleaños, Buhísimo? — ¿Mi cumpleaños? Agosto.",
      en: "When is your birthday, Buhísimo? — My birthday? August.",
      answerEn: ["When is your birthday,", "Buhísimo?", "My birthday?", "August."], tilesEn: ["August.", "Your birthday?", "Buhísimo?", "My birthday?", "When is your birthday,", "April."] },
    { id: "b-en-es-max", type: "tiles", character: "max", en: "When is your birthday, Max? — My birthday? February.",
      answerEs: ["cuándo es tu cumpleaños", "Max", "mi cumpleaños", "febrero"], tilesEs: ["mi cumpleaños", "febrero", "Max", "tu cumpleaños", "cuándo es tu cumpleaños"],
      fullEs: "¿Cuándo es tu cumpleaños, Max? — ¿Mi cumpleaños? Febrero." },
    { id: "pick-y-tu", type: "pick", titleEn: "What does it mean?", character: pic("valentina-asking"), promptEs: "¿Y tú, Max? ¿Tu cumpleaños?", lookalike: "tu/tú",
      options: ["And you, Max? Your birthday?", "And you, Max? My birthday?", "How are you, Max? Your birthday?", "And you, Max? Your name?"], answer: 0 },
    { id: "type-cuando", type: "type", titleEn: "Now in Spanish", en: "When is your birthday?", answerEs: "¿Cuándo es tu cumpleaños?" },
    { id: "type-mi-enero", type: "type", en: "My birthday? January.", answerEs: "¿Mi cumpleaños? Enero." },
    { id: "match-9", type: "match", pairs: [{ es: "el cumpleaños", en: "the birthday" }, { es: "tu cumpleaños", en: "your birthday" }, { es: "el primero", en: "the 1st (Colombia)" },
      { es: "el uno", en: "the 1st (Spain)" }, { es: "¿Cuándo es tu cumpleaños?", en: "When is your birthday?" }] },
    { id: "speak-max", type: "speak", character: "max", es: "¿Cuándo es tu cumpleaños? — ¿Mi cumpleaños? Febrero.", en: "When is your birthday? — My birthday? February." },
  ],
};

// =================================================================== L10 · La fecha (host: Samuel)
const L10 = {
  ...common(10, pic("samuel-celebrate")), id: "1.4-10", n: 10, kind: "learn",
  titleEs: "La fecha: el veinte de julio", titleEn: "The date",
  storyEn: "Every date of the year: el + number + de + month. And a birthday wish for Valentina.",
  canDoEn: "Now you can say and write any date, and wish someone a happy birthday.",
  xpBase: 10, learnedEs: ["el veinte de julio", "la fecha", "¡Feliz cumpleaños!"],
  steps: [
    SONG("song-uno-diez-digits", SONGS_13.numeros_uno_diez_once, true, { contextEn: "Dates are written in digits. Sing the Spanish word for each one as it lights up." }),
    { id: "pattern-fecha", type: "datepattern", titleEn: "el + veinte + de + julio", contextEn: "From [[el primero de marzo]] to every date: [[el]], the number, [[de]], the month.",
      rows: [DP(1, 3), DP(10, 1), DP(20, 7)],
      noteEn: "Numbers from Unit 1.3. Written the Australian way, day then month: 20/7. Tap a row to hear it." },
    { id: "intro-el", type: "intro", character: pic("samuel-wave"), cal: { view: "month", month: 7, circle: [20] }, contextEn: "Samuel points at the calendar:",
      es: "el", en: "the (before a date)", exampleEs: "Es el veinte de julio.", exampleEn: "It's the 20th of July.",
      noteEn: "You met [[el]] inside [[el nombre]] and [[el mes]]. Now it goes before a number: [[el veinte de julio]]." },
    { id: "intro-fecha", type: "intro", character: pic("samuel-calendar"), cal: { view: "month", month: 4, circle: [1] }, contextEn: "Samuel reads the date:",
      es: "la fecha", en: "the date", exampleEs: "La fecha es el uno de abril.", exampleEn: "The date is the 1st of April." },
    { id: "read-20-julio", type: "calendar", mode: "read", view: "month", month: 7, circle: [20], lookalike: "junio/julio",
      optionsEs: [dateEs(20, 7), dateEs(20, 6), dateEs(12, 7)], answer: 0, en: "the 20th of July", whyEn: "The page says [[julio]] (with an l), and 20 is [[veinte]]." },
    { id: "tap-12-marzo", type: "calendar", mode: "tap", view: "month", month: 3, sayEs: "Es miércoles, el doce de marzo.", target: 12, en: "It's Wednesday, the 12th of March.", titleEn: "Tap the date" },
    { id: "tap-1-sep", type: "calendar", mode: "tap", view: "month", month: 9, sayEs: "La fecha: lunes, el primero de septiembre.", target: 1, en: "The date: Monday, the 1st of September.", titleEn: "Tap the date" },
    { id: "tap-1-ago", type: "calendar", mode: "tap", view: "month", month: 8, sayEs: "¿La fecha? Viernes, el uno de agosto.", target: 1, en: "The date? Friday, the 1st of August.", titleEn: "Tap the date" },
    { id: "wall-dates", type: "wall", titleEn: "The birthday wall: the dates", own: true,
      contextEn: "Now everyone gives the whole date. Tap a bubble to hear it.",
      people: [
        { who: "samuel", art: "samuel", labelEn: "Samuel", es: "Mi cumpleaños es el diez de enero.", en: "My birthday is the 10th of January." },
        { who: "", art: "max", labelEn: "Max", es: "El cumpleaños de Max es el veintinueve de febrero.", en: "Max's birthday is the 29th of February." },
        { who: "", art: "matilda", labelEn: "Matilda", es: "El cumpleaños de Matilda es el quince de junio.", en: "Matilda's birthday is the 15th of June." },
        { who: "", art: "valentina", labelEn: "Valentina", es: "El cumpleaños de Valentina es el veinte de julio.", en: "Valentina's birthday is the 20th of July." },
        { who: "buho", art: "owl-celebrating", labelEn: "Buhísimo", es: "Mi cumpleaños es el siete de agosto. ¡Fenomenal!", en: "My birthday is the 7th of August. Great!" },
      ] },
    { id: "who-20-julio", type: "choose", layout: "bubbles", speaker: "owl", speakerArt: "owl-explaining", titleEn: "Whose birthday is it?", promptEs: "¡El veinte de julio!", focusEs: "julio",
      optionsArt: ART4, tagsEs: BDAY4, answer: 0, lookalike: "junio/julio",
      answerEs: "El cumpleaños de Valentina es el veinte de julio.", answerEn: "Valentina's birthday is the 20th of July.",
      rightEn: "[[El veinte de julio]] is Valentina's birthday. Matilda's is [[el quince de junio]].",
      whyEn: "{picked}'s birthday is another date. [[El veinte de julio]] (with an l) is Valentina's; Matilda's is [[el quince de junio]] (with an n)." },
    { id: "intro-feliz", type: "intro", character: "matilda-celebrate", scene: scene("scene-20-julio"), contextEn: "It's Valentina's birthday! Matilda says:",
      es: "¡Feliz cumpleaños!", en: "Happy birthday!", exampleEs: "¡Feliz cumpleaños, Valentina!", exampleEn: "Happy birthday, Valentina!",
      noteEn: "20 July is Colombia's Independence Day, so Valentina shares her birthday with the whole country: flags and fireworks in Salento's plaza!" },
    { id: "dict-29-2", type: "datedict", sayEs: "El cumpleaños de Max es el veintinueve de febrero.", d: 29, m: 2, en: "Max's birthday is the 29th of February." },
    { id: "card-valentina", type: "idcard", mode: "read", titleEn: "Read the ID card", lookalike: "nombre/noviembre, junio/julio",
      card: { photo: "valentina", number: "1 094 233 018", fields: [{ qEs: "¿El nombre?", valueEs: "Valentina" }, { qEs: "¿El cumpleaños?", value: "20/7" }] },
      promptEn: "When is Valentina's birthday? Read the date in Spanish.", optionsEs: [dateEs(20, 7), dateEs(20, 6), dateEs(12, 7)], answer: 0,
      answerEs: "Mi nombre es Valentina. Mi cumpleaños es el veinte de julio.", answerEn: "My name is Valentina. My birthday is the 20th of July." },
    { id: "b-es-en-valentina", type: "tiles", speaker: "neutral", dir: "es-en", character: "owl-explaining", promptEs: "El cumpleaños de Valentina es el veinte de julio.", en: "Valentina's birthday is the 20th of July.",
      answerEn: ["Valentina's birthday", "is", "the 20th", "of July."], tilesEn: ["of July.", "is", "the 12th", "Valentina's birthday", "the 20th", "of June."] },
    { id: "b-en-es-fecha", type: "tiles", character: pic("samuel-wave"), en: "The date is the 31st of December.",
      answerEs: ["la fecha", "es", "el", "treinta y uno", "de", "diciembre"], tilesEs: ["de", "treinta y uno", "la fecha", "noviembre", "el", "es", "diciembre"], fullEs: "La fecha es el treinta y uno de diciembre." },
    { id: "pick-12-marzo", type: "pick", speaker: "neutral", titleEn: "What does it mean?", character: "owl-thinking", promptEs: "Es miércoles, el doce de marzo.",
      options: ["It's Wednesday, the 12th of March.", "It's Tuesday, the 12th of March.", "It's Wednesday, the 2nd of March.", "It's Wednesday, the 12th of May."], answer: 0 },
    { id: "type-15-junio", type: "type", titleEn: "Now in Spanish", en: "It's the 15th of June.", answerEs: "Es el quince de junio." },
    { id: "type-samuel", type: "type", en: "Samuel's birthday is the 10th of January.", answerEs: "El cumpleaños de Samuel es el diez de enero." },
    SONG("song-cumple", SONGS.cuando_es_tu_cumpleanos),
    { id: "match-10", type: "match", pairs: [{ es: "la fecha", en: "the date" }, { es: "el cumpleaños", en: "the birthday" }, { es: dateEs(20, 7), en: "20 July" },
      { es: dateEs(10, 1), en: "10 January" }, { es: dateEs(1, 3), en: "1 March" }] },
    { id: "speak-valentina", type: "speak", speaker: "neutral", character: pic("samuel-wave"), es: "El cumpleaños de Valentina es el veinte de julio.", en: "Valentina's birthday is the 20th of July." },
  ],
};

// =================================================================== L11 · Speak: say the date (host: Matilda)
// A speaking lesson: with speaking off, each speak step (and the calendar "say it") becomes a sentence
// builder on the same sentence (`tiles`), so the lesson still practises the date.
const SAY = (id, es, en, answerEs, extraEs) => ({ id, type: "speak", character: "matilda", speaker: "neutral", es, en, tiles: { answerEs, tilesEs: [...answerEs.slice().reverse(), ...extraEs] } });
const L11 = {
  ...common(11, "matilda-wave"), id: "1.4-11", n: 11, kind: "speak",
  titleEn: "Speak: say the date",
  storyEn: "Say dates out loud, find them on the calendar, then say your own birthday.",
  canDoEn: "You can say any date, and your own birthday, in Spanish!",
  xpBase: 15, learnedEs: [],
  steps: [
    SONG("song-cumple-digits", SONGS.cuando_es_tu_cumpleanos, true),
    SAY("say-1-jul", "Es martes, el primero de julio.", "It's Tuesday, the 1st of July.", ["es", "martes", "el primero", "de", "julio"], ["jueves", "junio"]),
    SAY("say-1-nov", "¿Cuándo es tu cumpleaños? — Es el uno de noviembre.", "When is your birthday? — It's the 1st of November.", ["cuándo es tu cumpleaños", "es", "el uno", "de", "noviembre"], ["el nombre", "octubre"]),
    SAY("say-15-sep", "Es el quince de septiembre.", "It's the 15th of September.", ["es", "el", "quince", "de", "septiembre"], ["cinco", "diciembre"]),
    SAY("say-22-sep", "Es lunes, el veintidós de septiembre.", "It's Monday, the 22nd of September.", ["es", "lunes", "el", "veintidós", "de", "septiembre"], ["martes", "doce"]),
    SAY("say-1-nov-sab", "Es sábado, el primero de noviembre.", "It's Saturday, the 1st of November.", ["es", "sábado", "el primero", "de", "noviembre"], ["domingo", "octubre"]),
    { id: "cal-say", type: "calendar", speaker: "neutral", mode: "say", view: "month", month: 11, circle: [1], character: "matilda",
      es: "Es sábado, el primero de noviembre.", alsoEs: ["Es sábado, el uno de noviembre."], en: "It's Saturday, the 1st of November.",
      contextEn: "Say the circled date, with its day: it's a Saturday ([[sábado]]).",
      tiles: { answerEs: ["es", "sábado", "el primero", "de", "noviembre"], tilesEs: ["noviembre", "de", "el primero", "sábado", "es", "domingo", "octubre"] } },
    { id: "g-caltap-dates", type: "caltap", titleEn: "Calendar tap: whole dates",
      waves: [{ titleEn: "Flip to the month, tap the day", board: "date", roundMs: 15000, rounds: [
        { sayEs: "Es el veinte de julio.", d: 20, month: 7 }, { sayEs: "Es el diez de enero.", d: 10, month: 1 },
        { sayEs: "Es el siete de agosto.", d: 7, month: 8 }, { sayEs: "Es el veintinueve de febrero.", d: 29, month: 2, leap: true }] }] },
    { id: "b-15-junio", type: "tiles", character: "matilda", cal: { view: "month", month: 6, circle: [15] }, en: "The circled date: 15 June",
      answerEs: ["el", "quince", "de", "junio"], tilesEs: ["junio", "de", "cinco", "quince", "el", "julio"], fullEs: "el quince de junio", lookalike: "junio/julio" },
    { id: "type-15-junio", type: "type", cal: { view: "month", month: 6, circle: [15] }, en: "The circled date: 15 June", answerEs: "el quince de junio" },
    { id: "my-pick", type: "mydate", stage: "pick", titleEn: "Your birthday" },
    { id: "my-tiles", type: "mydate", stage: "tiles", character: "matilda" },
    { id: "my-type", type: "mydate", stage: "type" },
    { id: "my-say", type: "mydate", stage: "say", character: "matilda" },
  ],
};

// =================================================================== L12 · the story (cast)
// Decisions 2 and 3: Max's line counts his real birthdays; the dates take «el». The story year is 2025
// and is never shown: 15 June 2025 is a Sunday; Max (born 29 Feb 2012) has had three real birthdays.
export const STORY = {
  titleEn: "Max's birthday",
  sceneEn: "In the Restrepo kitchen, a wall calendar shows June with the 15th circled. Valentina has a question for everyone.",
  scene: scene("scene-kitchen-calendar") || "salento-street", sceneAltEn: "The Restrepo kitchen in Salento",
  cast: [
    { who: "valentina", nameEn: "Valentina", art: "valentina" },
    { who: "matilda", nameEn: "Matilda", art: "matilda" },
    { who: "samuel", nameEn: "Samuel", art: "samuel" },
    { who: "max", nameEn: "Max", art: "max" },
    { who: "buho", nameEn: "Buhísimo", art: "owl-explaining" },
  ],
  lines: [
    { who: "valentina", art: pic("valentina-asking"), actionEn: "Valentina has a pen and a list.", es: "¿Cuándo es tu cumpleaños, Matilda?", en: "When is your birthday, Matilda?" },
    { who: "matilda", art: "matilda", es: "Es el quince de junio. ¿Y tú, Valentina?", en: "It's the 15th of June. And you, Valentina?" },
    { who: "valentina", art: pic("valentina-celebrate"), es: "Julio. ¡El veinte de julio!", en: "July. The 20th of July!" },
    { check: { titleEn: "Why is Valentina's birthday special?", options: ["It's Colombia's national day: fireworks!", "It's on the first of the month", "It's the same day as Max's"], answer: 0,
      answerEn: "20 July is Colombia's Independence Day." } },
    { who: "samuel", art: "samuel", es: "¿Y tú, Max? ¿Cuándo es tu cumpleaños?", en: "And you, Max? When is your birthday?" },
    { who: "max", art: "max-surprised", es: "Febrero. ¡El veintinueve de febrero!", en: "February. The 29th of February!" },
    { who: "samuel", art: pic("samuel-thinking"), es: "¿El veintinueve de febrero? ¿Cuántos años tienes, Max?", en: "The 29th of February? How old are you, Max?" },
    { who: "max", art: pic("max-counting"), actionEn: "Max counts on his fingers.", es: "Trece. ¿El veintinueve de febrero? Uno, dos, tres… ¡tres!", en: "Thirteen. The 29th of February? One, two, three… three!" },
    { check: { titleEn: "Why does Max only count to three?", options: ["29 February comes only once every four years", "He is three years old", "He can't count past three"], answer: 0,
      answerEn: "29 February only comes in a leap year: Max has had three real birthdays." } },
    { who: "buho", art: "owl-celebrating", es: "¡Max es fantástico!", en: "Max is fantastic!" },
    { who: "valentina", art: pic("valentina-wave"), es: "La fecha: domingo, el quince de junio. ¡El cumpleaños de Matilda!", en: "The date: Sunday, the 15th of June. Matilda's birthday!" },
    { who: "matilda", art: "matilda-celebrate", es: "¡Fenomenal! ¡Gracias!", en: "Great! Thank you!" },
    { who: "max", art: "max-celebrate", actionEn: "Sunday 15 June: a green eucalyptus cake!", es: "¡Feliz cumpleaños, Matilda!", en: "Happy birthday, Matilda!" },
    { check: { titleEn: "What do they celebrate on Sunday 15 June?", options: ["Matilda's birthday", "Valentina's birthday", "Max's birthday"], answer: 0, answerEn: "15 June is Matilda's birthday." } },
  ],
};
const LAST3 = ["La fecha: domingo, el quince de junio. ¡El cumpleaños de Matilda!", "¡Fenomenal! ¡Gracias!", "¡Feliz cumpleaños, Matilda!"];
const L12 = {
  ...common(12, "matilda-celebrate"), id: "1.4-12", n: 12, kind: "story",
  titleEs: "El cumpleaños de Max", titleEn: "Story: Max's birthday",
  storyEn: STORY.sceneEn, canDoEn: "You followed the whole birthday story in Spanish!",
  xpBase: 10, learnedEs: [], story: STORY,
  steps: [...buildStorySteps(STORY),
    { id: "s-order-last", type: "tiles", lines: true, titleEn: "Put the last three lines in order", en: "", answerEs: LAST3, tilesEs: [LAST3[2], LAST3[0], LAST3[1]] }],
};

// =================================================================== L13 · Unit check: the party calendar (host: Buhísimo)
const L13 = {
  ...common(13, "owl-celebrating"), id: "1.4-13", n: 13, kind: "check",
  titleEn: "Unit check: the party calendar",
  storyEn: "Unit check: Buhísimo is planning birthday parties. The week, the months, dates and birthdays. No hints this time.",
  canDoEn: "Unit 1.4 done! You can say the days, the months, any date and your birthday in Spanish.",
  xpBase: 20, learnedEs: [], check: true,
  steps: [
    ORDER_DAYS("c-order-week", 0, 6, { titleEn: "The whole week, in order" }),
    { id: "c-caltap-julio", type: "caltap", titleEn: "Calendar tap: one round", lookalike: "junio/julio",
      waves: [{ titleEs: "el año", board: "year", roundMs: 8000, rounds: [{ sayEs: "Es julio.", month: 7 }] }] },
    { id: "c-nombre-mes", type: "choose", speaker: "neutral", titleEn: "Which word is the month?", character: "owl-thinking", promptEs: "Mi nombre es Samuel. ¿El mes? Noviembre.",
      optionsEs: ["noviembre", "el nombre"], answer: 0, answerEs: "Mi nombre es Samuel. ¿El mes? Noviembre.", answerEn: "My name is Samuel. The month? November.", lookalike: "nombre/noviembre" },
    { id: "c-dict-22-5", type: "datedict", sayEs: "Es jueves, el veintidós de mayo.", d: 22, m: 5, en: "It's Thursday, the 22nd of May." },
    { id: "c-dict-1-3", type: "datedict", sayEs: "Es sábado, el uno de marzo.", d: 1, m: 3, en: "It's Saturday, the 1st of March." },
    { id: "c-party", type: "partycal", episode: "1.4-13", titleEn: "The party calendar", startMonth: 1,
      contextEn: "Three people phone Buhísimo with their birthdays. Flip to the month and tap each date: it gets a party sticker.",
      calls: [{ lines: [0], d: 1, m: 5, labelEn: "Caller from Spain" }, { lines: [1], d: 1, m: 10, labelEn: "Caller from Colombia" }, { lines: [2], d: 12, m: 11, labelEn: "Caller from Argentina" }] },
    { id: "c-gap-tu", type: "gap", es: "¿Cuándo es tu cumpleaños?", en: "When is your birthday?", blank: "tu", optionsEs: ["tu", "tú"], lookalike: "tu/tú" },
    { id: "c-who-15-junio", type: "choose", layout: "bubbles", speaker: "owl", speakerArt: "owl-explaining", titleEn: "Whose birthday is it?", promptEs: "¡El quince de junio!", focusEs: "junio",
      optionsArt: ART4, tagsEs: BDAY4, answer: 2, lookalike: "junio/julio",
      answerEs: "El cumpleaños de Matilda es el quince de junio.", answerEn: "Matilda's birthday is the 15th of June.",
      rightEn: "[[El quince de junio]] (with an n) is Matilda's birthday. Valentina's is [[el veinte de julio]].",
      whyEn: "{picked}'s birthday is another date. [[El quince de junio]] (with an n) is Matilda's; Valentina's is [[el veinte de julio]] (with an l)." },
    { id: "c-listen-agosto", type: "listen", sayEs: "¿Cuándo es tu cumpleaños? — Es el primero de agosto.", en: "When is your birthday? — It's the 1st of August.",
      optionsEs: ["¿Cuándo es tu cumpleaños? — Es el primero de agosto.", "¿Cuándo es tu cumpleaños? — Es el primero de abril.", "¿Cuándo es tu cumpleaños? — Es el siete de agosto.", "¿Mi cumpleaños? Agosto."], answer: 0 },
    { id: "c-type-lmv", type: "type", en: "Monday, Wednesday, Friday.", answerEs: "Lunes, miércoles, viernes." },
    { id: "c-type-cuando", type: "type", en: "When is your birthday?", answerEs: "¿Cuándo es tu cumpleaños?" },
    { id: "c-match", type: "match", pairs: [{ es: "enero", en: "January" }, { es: "junio", en: "June" }, { es: "julio", en: "July" }, { es: dateEs(29, 2), en: "29 February" }, { es: dateEs(7, 8), en: "7 August" }] },
    { id: "c-listen-both", type: "listen", sayEs: "El cumpleaños de Matilda es el quince de junio. El cumpleaños de Valentina es el veinte de julio.", lookalike: "junio/julio",
      en: "Matilda's birthday is the 15th of June. Valentina's birthday is the 20th of July.",
      optionsEs: ["El cumpleaños de Matilda es el quince de junio. El cumpleaños de Valentina es el veinte de julio.",
        "El cumpleaños de Matilda es el quince de julio. El cumpleaños de Valentina es el veinte de junio.",
        "El cumpleaños de Matilda es el cinco de junio. El cumpleaños de Valentina es el veinte de julio."], answer: 0 },
    { id: "c-tiles-max", type: "tiles", character: "max", en: "You are Max: My birthday is the 29th of February.",
      answerEs: ["mi cumpleaños", "es", "el", "veintinueve", "de", "febrero"],
      tilesEs: ["febrero", "veintinueve", "es", "mi cumpleaños", "de", "el", "tu cumpleaños", "veintiuno"],
      fullEs: "Mi cumpleaños es el veintinueve de febrero." },
    { id: "c-type-max", type: "type", en: "My birthday is the 29th of February.", answerEs: "Mi cumpleaños es el veintinueve de febrero." },
    { id: "c-speak-max", type: "speak", character: "max", es: "¿Cuándo es tu cumpleaños? — Mi cumpleaños es el veintinueve de febrero.", en: "When is your birthday? — My birthday is the 29th of February." },
  ],
};

export const LESSONS = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13];
