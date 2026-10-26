// Unit 1.3 «Mi carnet de identidad»: the whole path (20 lessons in two map sections, 1.3a L1–L11 and
// 1.3b L12–L20), following docs/content_plan_1.1-1.6.md §6, docs/build_plan_1.3.md and
// content/lessons_1.1-1.6.json.
//
// Spanish conventions are the same as unit-1-1.js and unit-1-2.js (checked by tools/check_vocab.mjs):
//   * a key named `es`, or ending in `Es`, holds Spanish (a string, an array of strings, or an array
//     of objects whose `es` keys hold Spanish); English text may quote Spanish in [[double brackets]];
//   * `spell: true` marks a spelling line (bare letter names);
//   * `lookalike: "seis/siete"` marks a step that practises telling a look-alike pair apart (Juan,
//     21 Oct 2026): the validator fails it if either word isn't taught by that lesson.
// No bare nouns: the ID card's fields are questions («¿El nombre?»), never labels; años always
// follows a number. Song titles that start «Del… al…» are in English (del, al aren't taught).
import { buildStorySteps } from "./unit-1-1.js";
import { lesson as lesson1 } from "./lesson-1-1.js";
import { NUM_ES } from "./js/numbers.js";

const PRAISE = ["¡Muy bien!", "¡Fenomenal!", "¡Fantástico!", "¡Buhísimo!"];
const common = (n) => ({
  unit: "1.3", part: n <= 11 ? "1.3a" : "1.3b",
  sayAs: lesson1.sayAs, praiseEs: PRAISE, praiseEn: lesson1.praiseEn, encourageEn: lesson1.encourageEn, kindEn: lesson1.kindEn,
});

/** Number cards: [{ n: 6, es: "seis" }, …] */
const N = (...ns) => ns.map((n) => ({ n, es: NUM_ES[n] }));
const W = (n) => NUM_ES[n];
const EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four",
  "twenty-five", "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty", "thirty-one"];
/** A count step: tap the words of `seq` in order (count up, or a countdown that ends on cero). */
const COUNT = (id, sayEs, en, seq, extra = {}) => ({ id, type: "count", sayEs, en, seq, wordsEs: seq.map(W), ...extra });
const PICK = (id, n, nums, extra = {}) => ({ id, type: "numpick", sayEs: W(n), nums, answer: nums.indexOf(n), en: `${n} (${EN[n]})`, ...extra });
const TYPE = (id, n, extra = {}) => ({ id, type: "numtype", digit: n, answerEs: W(n), en: `${n} (${EN[n]})`, ...extra });
const MATCH = (id, ns) => ({ id, type: "match", pairs: ns.map((n) => ({ es: W(n), en: String(n) })) });

// ------------------------------------------------------------------ items
// Counted items of content/lessons_1.1-1.6.json (1.3), with English. Numbers carry their digit
// (Review asks them as a number pick). Names (Valentina, Samuel, Restrepo) are recognised, not
// recalled, so Review leaves them out, as in 1.1.
const NUM_ITEM = (n, lesson) => ({ id: `num-${n}`, unit: "1.3", es: W(n), en: `${EN[n]} · ${n}`, num: n, lesson });
export const ITEMS = [
  // L2
  { id: "me-llamo", unit: "1.3", es: "me llamo", en: "my name is · I'm called", lesson: 2 },
  { id: "te-llamas", unit: "1.3", es: "te llamas", en: "your name is · you're called", lesson: 2 },
  { id: "se-llama", unit: "1.3", es: "se llama", en: "his/her name is", lesson: 2 },
  { id: "como-te-llamas", unit: "1.3", es: "¿Cómo te llamas?", en: "What's your name?", lesson: 2 },
  { id: "como-se-llama", unit: "1.3", es: "¿Cómo se llama?", en: "What's his/her name?", lesson: 2 },
  // L4, L5, L7, L9, L13, L14: the numbers
  ...[0, 1, 2, 3, 4, 5].map((n) => NUM_ITEM(n, 4)),
  ...[6, 7, 8, 9, 10].map((n) => NUM_ITEM(n, 5)),
  ...[11, 12, 13, 14, 15].map((n) => NUM_ITEM(n, 7)),
  // L8 (años is always shown after a number: matchForms lets Review find it inside sentences)
  { id: "cuantos-anos", unit: "1.3", es: "¿Cuántos años tienes?", en: "How old are you?", lesson: 8 },
  { id: "tengo", unit: "1.3", es: "tengo", en: "I have", lesson: 8 },
  { id: "tienes", unit: "1.3", es: "tienes", en: "you have", lesson: 8 },
  { id: "tiene", unit: "1.3", es: "tiene", en: "he/she has", lesson: 8 },
  { id: "anos", unit: "1.3", es: "doce años", en: "twelve (years old)", matchForms: ["años"], lesson: 8 },
  ...[16, 17, 18, 19, 20].map((n) => NUM_ITEM(n, 9)),
  ...[21, 22, 23, 24, 25].map((n) => NUM_ITEM(n, 13)),
  ...[26, 27, 28, 29, 30, 31].map((n) => NUM_ITEM(n, 14)),
  // L16
  { id: "el-carnet", unit: "1.3", es: "el carnet de identidad", en: "the ID card", lesson: 16 },
  { id: "el-nombre", unit: "1.3", es: "el nombre", en: "the (first) name", lesson: 16 },
  { id: "el-apellido", unit: "1.3", es: "el apellido", en: "the surname", lesson: 16 },
  { id: "mi", unit: "1.3", es: "mi", en: "my", lesson: 16 },
  // L17
  { id: "la-edad", unit: "1.3", es: "la edad", en: "the age", lesson: 17 },
  { id: "el-amigo", unit: "1.3", es: "el amigo", en: "the friend", formsEs: ["el amigo", "la amiga"], lesson: 17 },
  { id: "el-lugar", unit: "1.3", es: "el lugar de nacimiento", en: "the place of birth", lesson: 17 },
];

// ------------------------------------------------------------------ the number songs
// Approved versions in prototype/tools/make_number_songs.py (audio/songs/songs.json has the words as
// sung and their timings). linesEs are shown until the song file exists, and are checked here at
// the lesson. «Dos, doce, veintidós» is still being chosen (round 2): its steps show "Song coming
// soon" with the words of the front-runner (v8h) until its version is set in make_number_songs.py.
export const SONGS = {
  numeros_1_10: { song: "numeros_1_10", titleEn: "1 to 10",
    linesEs: ["Uno, dos, tres,", "cuatro, cinco: ¡muy bien!", "Seis, siete, ocho,", "nueve, diez: ¡fenomenal!"] },
  numeros_10_20: { song: "numeros_10_20", titleEn: "10 to 20",
    linesEs: ["Diez, once, doce,", "trece, catorce, quince: ¡muy bien!", "Dieciséis, diecisiete,", "dieciocho, diecinueve, veinte: ¡fenomenal!"] },
  numeros_uno_once: { song: "numeros_uno_once", titleEs: "Uno, once · Dos, doce", titleEn: "One, eleven · two, twelve",
    linesEs: ["Uno, once. Dos, doce.", "Tres, trece. Cuatro, catorce.", "Cinco, quince: ¡muy bien!", "Seis, dieciséis. Siete, diecisiete.",
      "Ocho, dieciocho. Nueve, diecinueve.", "Diez, veinte: ¡fenomenal!", "Uno, once. Dos, doce.", "¡Fantástico!"] },
  numeros_dos_doce_veintidos: { song: "numeros_dos_doce_veintidos", titleEs: "Dos, doce, veintidós", titleEn: "Two, twelve, twenty-two",
    linesEs: ["Uno, dos, tres,", "cuatro, cinco: ¡muy bien!", "Once, doce, trece,", "catorce, quince…", "¡Fenomenal!",
      "Veintiuno, veintidós, veintitrés,", "veinticuatro, veinticinco: ¡fantástico!"] },
  numeros_20_31: { song: "numeros_20_31", titleEn: "20 to 31",
    linesEs: ["Veinte, veintiuno, veintidós,", "veintitrés, veinticuatro, veinticinco: ¡muy bien!", "Veintiséis, veintisiete, veintiocho,", "veintinueve, treinta… ¡treinta y uno!"] },
  numeros_uno_diez_once: { song: "numeros_uno_diez_once", titleEs: "Uno, diez, once… treinta y uno", titleEn: "One, ten, eleven… thirty-one",
    linesEs: ["Uno, diez, once,", "veintiuno: ¡muy bien!", "Treinta, treinta y uno,", "treinta y uno: ¡fenomenal!",
      "Uno, once, veintiuno,", "treinta y uno: ¡muy bien!", "Diez, veinte, treinta,", "treinta y uno: ¡fenomenal!"] },
};
const SONG = (id, key, numerals = false, extra = {}) => {
  const s = SONGS[key];
  return { id, type: "song", song: s.song, linesEs: s.linesEs, numerals, ...(s.titleEs ? { titleEs: s.titleEs } : {}),
    titleEn: numerals ? `Sing along with digits: ${s.titleEn}` : `Sing along: ${s.titleEn}`, ...extra };
};
const CLIP = (id, clip, linesEs, en) => ({ id, type: "clip", clip, titleEn: "Chant along: Radio Búho's number song", linesEs, en });

// Radio Búho «Los números» (1.3 L15) plays the set, in teaching order (number_songs_plan.md), not one long song.
const SONG_SET = ["numeros_1_10", "numeros_10_20", "numeros_uno_once", "numeros_dos_doce_veintidos", "numeros_20_31", "numeros_uno_diez_once"]
  .map((k) => ({ song: SONGS[k].song, linesEs: SONGS[k].linesEs, titleEn: `Song: ${SONGS[k].titleEn}`, ...(SONGS[k].titleEs ? { titleEs: SONGS[k].titleEs } : {}) }));

// ------------------------------------------------------------------ Radio Búho episodes
export const RADIO = [
  { id: "1.3-15", lesson: "1.3-15", unit: "1.3", titleEn: "Radio Búho: the numbers song", songs: SONG_SET,
    lines: [
      { who: "buho", clip: "N0", es: "¡Hola, hola! Me llamo Buhísimo. ¡Uno, dos, tres!", en: "Hello, hello! My name is Buhísimo. One, two, three!" },
      { who: "max", clip: "N7", es: "Diez, nueve, ocho, siete, seis, cinco, cuatro, tres, dos, uno… ¡cero! ¡Max!", en: "Ten, nine, eight, seven, six, five, four, three, two, one… zero! Max!" },
      { who: "buho", clip: "N8", es: "¿Cuántos años tienes, Samuel?", en: "How old are you, Samuel?" },
      { who: "samuel", clip: "N8", es: "Tengo trece años.", en: "I'm thirteen." },
      { who: "buho", clip: "N8", es: "¿Cómo te llamas?", en: "What's your name?" },
      { who: "valentina", clip: "N8", es: "Me llamo Valentina. Tengo doce años.", en: "My name is Valentina. I'm twelve." },
      { who: "buho", clip: "N10", es: "¡Muy bien! Uno, dos, tres… ¡hasta luego!", en: "Very good! One, two, three… see you later!" },
    ] },
  { id: "1.3-19", lesson: "1.3-19", unit: "1.3", titleEn: "Radio Búho: three ID cards",
    lines: [
      { who: "buho", es: "¡Buenas tardes! Me llamo Buhísimo. ¿Y tú?", en: "Good afternoon! My name is Buhísimo. And you?" },
      { who: "valentina", es: "Me llamo Valentina Restrepo. Tengo doce años. Soy de Salento.", en: "My name is Valentina Restrepo. I'm twelve. I'm from Salento." },
      { who: "buho", es: "¿Y tú? ¿Cuántos años tienes?", en: "And you? How old are you?" },
      { who: "samuel", es: "Me llamo Samuel Restrepo. Trece.", en: "My name is Samuel Restrepo. Thirteen." },
      { who: "matilda", es: "Me llamo Matilda. Soy de Australia. Doce.", en: "My name is Matilda. I'm from Australia. Twelve." },
      { who: "buho", es: "¡Muy bien! ¡Hasta luego!", en: "Very good! See you later!" },
    ] },
  { id: "1.3-20", lesson: "1.3-20", unit: "1.3", titleEn: "The ID card office", inTab: false,
    lines: [
      { who: "samuel", es: "Me llamo Samuel. Soy de Colombia.", en: "My name is Samuel. I'm from Colombia." },
      { who: "buho", es: "¿Cuántos años tienes?", en: "How old are you?" },
      { who: "samuel", es: "Trece.", en: "Thirteen." },
    ] },
];

// ID-card fields are questions, never bare labels (P7).
const Q = { nombre: "¿El nombre?", apellido: "¿El apellido?", edad: "¿La edad?", lugar: "¿El lugar de nacimiento?", de: "¿De dónde eres?" };
const ART4 = [{ art: "valentina", labelEn: "Valentina" }, { art: "samuel", labelEn: "Samuel" }, { art: "matilda", labelEn: "Matilda" }, { art: "max", labelEn: "Max" }];

// =================================================================== 1.3a «¿Cómo te llamas?»
const L1 = {
  ...common(1), id: "1.3-1", n: 1, kind: "repaso",
  titleEs: "Buenas tardes, ¿qué tal?", titleEn: "Review: greetings and spelling",
  storyEn: "Before the names and numbers: greetings, feelings, countries and spelling, mixed up.",
  canDoEn: "Units 1.1 and 1.2 are still fresh: greetings, feelings, countries and spelling.",
  xpBase: 10, learnedEs: [],
  steps: [
    { id: "r-pick-regular", type: "pick", character: "owl-explaining", promptEs: "Buenas tardes, Matilda. ¿Cómo estás? — Regular.",
      options: ["Good afternoon, Matilda. How are you? — So-so.", "Good morning, Matilda. How are you? — Great.", "Good afternoon, Matilda. Where are you from? — Australia.", "Goodbye, Matilda! — See you later."], answer: 0 },
    { id: "r-scene-pm", type: "choose", titleEn: "What do you say?", time: "afternoon", promptEn: "It's 4 in the afternoon. You meet Matilda.",
      optionsEs: ["Buenos días", "Buenas tardes", "¡Adiós!"], answer: 1, answerEs: "Buenas tardes, Matilda.", answerEn: "Good afternoon, Matilda." },
    { id: "r-face-fatal", type: "choose", titleEn: "Which face?", promptEs: "Fatal.", sayEs: "Fatal.",
      optionsFace: ["fenomenal", "bien", "regular", "fatal"], answer: 3, answerEs: "fatal", answerEn: "awful" },
    { id: "r-map-argentina", type: "maptap", sayEs: "Ella es de Argentina.", en: "She's from Argentina.", target: "ar", choices: ["ar", "cl", "pe", "co"] },
    { id: "r-gap-esta", type: "gap", es: "Max está fenomenal.", en: "Max is feeling great.", blank: "está", optionsEs: ["es", "está"] },
    { id: "r-listen-que-tal", type: "listen", sayEs: "¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú?", en: "Hi! How's it going? — Very well, thanks. And you?",
      optionsEs: ["¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú?", "¡Hola! ¿Qué tal? — Regular. ¿Y tú?", "Buenas tardes. ¿De dónde eres? — Soy de Perú.", "¡Adiós! ¡Hasta luego!"], answer: 0 },
    { id: "r-spell-cuba", type: "spell", spell: true, sayEs: "Ce, u, be, a.", answerEs: "Cuba", en: "a country (in the Caribbean)" },
    { id: "r-tiles-tardes", type: "tiles", character: "matilda", en: "Good afternoon, Matilda. How are you?",
      answerEs: ["buenas tardes", "Matilda", "cómo estás"], tilesEs: ["cómo estás", "buenos días", "Matilda", "buenas tardes", "qué tal"], fullEs: "Buenas tardes, Matilda. ¿Cómo estás?" },
    { id: "r-type-como-estas", type: "type", en: "How are you?", answerEs: "¿Cómo estás?" },
    { id: "r-letter-zeta", type: "letterpick", spell: true, sayEs: "zeta", letters: ["Z", "S", "C", "X"], answer: 0 },
    { id: "r-match", type: "match", pairs: [
      { es: "Buenos días", en: "Good morning" }, { es: "¡Hasta luego!", en: "See you later!" }, { es: "regular", en: "so-so" },
      { es: "fenomenal", en: "great" }, { es: "el país", en: "the country" }] },
    { id: "r-type-tardes", type: "type", en: "Good afternoon, Max.", answerEs: "Buenas tardes, Max." },
    { id: "r-speak", type: "speak", character: "owl-explaining", es: "Buenas tardes, Matilda. ¿Cómo estás? — Regular.", en: "Good afternoon, Matilda. How are you? — So-so." },
  ],
};

const L2 = {
  ...common(2), id: "1.3-2", n: 2, kind: "learn",
  titleEs: "Me llamo Valentina", titleEn: "My name is Valentina",
  storyEn: "Matilda and Max knock at the Restrepo house in Salento. Valentina (12) and Samuel (13) open the door.",
  canDoEn: "Now you can say your name and ask someone else's.",
  xpBase: 10, learnedEs: ["me llamo", "te llamas", "se llama", "¿Cómo te llamas?", "¿Cómo se llama?"],
  steps: [
    { id: "intro-me-llamo", type: "intro", character: "valentina", contextEn: "At the Restrepo house, a girl opens the door:",
      es: "me llamo", en: "my name is · I'm called", exampleEs: "¡Hola! Me llamo Valentina.", exampleEn: "Hi! My name is Valentina.",
      noteEn: "You met the verb [[llamarse]] (to be called) in Unit 1.2. [[Me llamo]] = I'm called: my name is." },
    { id: "pick-me-llamo", type: "pick", character: "valentina", promptEs: "¡Hola! Me llamo Valentina.",
      options: ["Hi! My name is Valentina.", "Hi! Her name is Valentina.", "Hi! I'm from Valentina.", "Goodbye, Valentina!"], answer: 0 },
    { id: "intro-samuel", type: "intro", character: "samuel", badgeEn: "Meet Samuel", contextEn: "Her brother comes to the door too:",
      es: "Me llamo Samuel. ¿Y tú?", en: "My name is Samuel. And you?" },
    { id: "who-samuel", type: "choose", titleEn: "Who is speaking?", promptEs: "Me llamo Samuel. ¿Y tú?", optionsArt: ART4, answer: 1,
      answerEs: "Me llamo Samuel. ¿Y tú?", answerEn: "My name is Samuel. And you?" },
    { id: "intro-como-te-llamas", type: "intro", character: "matilda", contextEn: "Matilda asks the girl:",
      es: "¿Cómo te llamas?", en: "What's your name?", exampleEs: "¿Cómo te llamas? — Me llamo Valentina.", exampleEn: "What's your name? — My name is Valentina." },
    { id: "intro-te-llamas", type: "intro", character: "samuel", contextEn: "Samuel isn't sure about the kangaroo's name:",
      es: "te llamas", en: "your name is · you're called", exampleEs: "¿Te llamas Max?", exampleEn: "Is your name Max?",
      noteEn: "[[me llamo]] (I) → [[te llamas]] (you). Just like [[soy]] → [[eres]]." },
    { id: "yn-samuel", type: "choose", titleEn: "Sí or no?", character: "samuel", promptEs: "¿Te llamas Samuel?",
      optionsEs: ["sí", "no"], answer: 0, answerEs: "¿Te llamas Samuel? — Sí, me llamo Samuel.", answerEn: "Is your name Samuel? — Yes, my name is Samuel." },
    { id: "intro-se-llama", type: "intro", character: "valentina", contextEn: "Valentina points at her brother:",
      es: "se llama", en: "his/her name is", exampleEs: "Él se llama Samuel.", exampleEn: "His name is Samuel.",
      noteEn: "For him or for her, it's [[se llama]]: [[Ella se llama Matilda.]]" },
    { id: "gap-se-llama", type: "gap", es: "Ella se llama Matilda.", en: "Her name is Matilda.", blank: "se llama", optionsEs: ["me llamo", "te llamas", "se llama"] },
    { id: "intro-como-se-llama", type: "intro", character: "max-thinking", contextEn: "Max asks about the boy:",
      es: "¿Cómo se llama?", en: "What's his/her name?", exampleEs: "¿Cómo se llama él? — Se llama Samuel.", exampleEn: "What's his name? — His name is Samuel." },
    { id: "sort-person", type: "sort", titleEn: "Who is it about?", bucketsEn: ["me (I)", "you", "he / she"],
      cards: [{ es: "Me llamo Max. Soy de Australia.", bucket: 0 }, { es: "¿Te llamas Max?", bucket: 1 }, { es: "Ella se llama Matilda.", bucket: 2 },
        { es: "Él se llama Samuel.", bucket: 2 }, { es: "¿Cómo te llamas?", bucket: 1 }, { es: "¡Hola! Me llamo Valentina.", bucket: 0 }] },
    { id: "listen-se-llama", type: "listen", sayEs: "¿Cómo se llama él? — Se llama Samuel.", en: "What's his name? — His name is Samuel.",
      optionsEs: ["¿Cómo se llama él? — Se llama Samuel.", "¿Cómo te llamas? — Me llamo Valentina.", "Ella se llama Matilda.", "¿Te llamas Max?"], answer: 0 },
    { id: "tiles-me-llamo", type: "tiles", character: "samuel", en: "My name is Samuel. And you?",
      answerEs: ["me llamo", "Samuel", "y tú"], tilesEs: ["se llama", "Samuel", "y tú", "me llamo", "te llamas"], fullEs: "Me llamo Samuel. ¿Y tú?" },
    { id: "type-como-te-llamas", type: "type", en: "What's your name?", answerEs: "¿Cómo te llamas?" },
    { id: "match-2", type: "match", pairs: [
      { es: "me llamo", en: "my name is" }, { es: "te llamas", en: "your name is" }, { es: "se llama", en: "his/her name is" },
      { es: "¿Cómo te llamas?", en: "What's your name?" }, { es: "¿Cómo se llama?", en: "What's his/her name?" }] },
    { id: "speak-me-llamo", type: "speak", character: "valentina", es: "¿Cómo te llamas? — Me llamo Valentina.", en: "What's your name? — My name is Valentina." },
  ],
};

const L3 = {
  ...common(3), id: "1.3-3", n: 3, kind: "conjugation",
  titleEs: "Me llamo, te llamas, se llama", titleEn: "Conjugation: llamarse",
  storyEn: "One verb, three people: me, you, him or her. Then the same pattern with soy, eres, es.",
  canDoEn: "You can use llamarse for me, you, and him or her, and you know it works like soy, eres, es.",
  xpBase: 10, learnedEs: ["Me llamo, te llamas, se llama."],
  steps: [
    { id: "table-llamarse", type: "table", titleEn: "llamarse: to be called", contextEn: "The verb [[llamarse]] changes with the person. Look at the start and the end.",
      rows: [
        { es: "me llamo", en: "I'm called", exampleEs: "Me llamo Matilda. Soy de Melbourne.", exampleEn: "My name is Matilda. I'm from Melbourne." },
        { es: "te llamas", en: "you're called", exampleEs: "Te llamas Samuel. Eres de Colombia.", exampleEn: "Your name is Samuel. You're from Colombia." },
        { es: "se llama", en: "he/she is called", exampleEs: "Se llama Buhísimo. Es de Salento.", exampleEn: "His name is Buhísimo. He's from Salento." },
      ],
      noteEn: "Say it as a chant: [[Me llamo, te llamas, se llama.]]" },
    { id: "choose-matilda", type: "choose", titleEn: "Matilda talks about herself", character: "matilda", promptEn: "Which one does Matilda say?",
      optionsEs: ["Me llamo Matilda.", "Te llamas Matilda.", "Se llama Matilda."], answer: 0, answerEs: "Me llamo Matilda. Soy de Melbourne.", answerEn: "My name is Matilda. I'm from Melbourne." },
    { id: "gap-te-llamas", type: "gap", es: "Te llamas Samuel. Eres de Colombia.", en: "Your name is Samuel. You're from Colombia.", blank: "Te llamas", optionsEs: ["Me llamo", "Te llamas", "Se llama"] },
    { id: "choose-buho", type: "choose", titleEn: "Talking about Buhísimo", character: "owl-celebrating", promptEn: "Max tells Valentina the owl's name.",
      optionsEs: ["Se llama Buhísimo.", "Me llamo Buhísimo.", "Te llamas Buhísimo."], answer: 0, answerEs: "Se llama Buhísimo. Es de Salento.", answerEn: "His name is Buhísimo. He's from Salento." },
    { id: "table-pattern", type: "table", titleEn: "Two verbs, one pattern", contextEn: "[[soy, eres, es]] from Unit 1.1 work the same way.",
      rows: [
        { es: "soy · me llamo", en: "I", exampleEs: "Me llamo Matilda. Soy de Melbourne.", exampleEn: "My name is Matilda. I'm from Melbourne." },
        { es: "eres · te llamas", en: "you", exampleEs: "Te llamas Samuel. Eres de Colombia.", exampleEn: "Your name is Samuel. You're from Colombia." },
        { es: "es · se llama", en: "he / she", exampleEs: "Ella se llama Valentina. Es de Colombia.", exampleEn: "Her name is Valentina. She's from Colombia." },
      ] },
    { id: "sort-pattern", type: "sort", titleEn: "I, you, or he/she?", bucketsEn: ["I", "you", "he / she"],
      cards: [{ es: "soy", bucket: 0 }, { es: "me llamo", bucket: 0 }, { es: "eres", bucket: 1 }, { es: "te llamas", bucket: 1 }, { es: "es", bucket: 2 }, { es: "se llama", bucket: 2 }] },
    { id: "gap-es", type: "gap", es: "Se llama Buhísimo. Es de Salento.", en: "His name is Buhísimo. He's from Salento.", blank: "Es", optionsEs: ["Soy", "Eres", "Es"] },
    { id: "tiles-valentina", type: "tiles", character: "valentina", en: "Her name is Valentina.",
      answerEs: ["ella", "se llama", "Valentina"], tilesEs: ["me llamo", "ella", "es", "se llama", "Valentina"], fullEs: "Ella se llama Valentina." },
    { id: "listen-te-llamas", type: "listen", sayEs: "Te llamas Samuel. Eres de Colombia.", en: "Your name is Samuel. You're from Colombia.",
      optionsEs: ["Te llamas Samuel. Eres de Colombia.", "Me llamo Samuel. Soy de Colombia.", "Se llama Samuel. Es de Colombia.", "Ella se llama Valentina. Es de Colombia."], answer: 0 },
    { id: "type-me-llamo", type: "type", en: "My name is Matilda. I'm from Melbourne.", answerEs: "Me llamo Matilda. Soy de Melbourne." },
    { id: "reply-como-te-llamas", type: "choose", titleEn: "Pick the best answer", character: "samuel", promptEs: "¿Cómo te llamas?",
      optionsEs: ["Me llamo Max.", "Se llama Max.", "Te llamas Max."], answer: 0, answerEs: "¿Cómo te llamas? — Me llamo Max.", answerEn: "What's your name? — My name is Max." },
    { id: "type-se-llama", type: "type", en: "His name is Buhísimo. He's from Salento.", answerEs: "Se llama Buhísimo. Es de Salento." },
    { id: "pick-chant", type: "pick", character: "owl-explaining", promptEs: "Me llamo, te llamas, se llama.",
      options: ["My name is, your name is, his/her name is.", "I am, you are, he/she is.", "What's your name? What's his name?", "I'm from, you're from, he's from."], answer: 0 },
    { id: "speak-chant", type: "speak", character: "owl-explaining", es: "Me llamo, te llamas, se llama.", en: "My name is, your name is, his/her name is." },
  ],
};

const L4 = {
  ...common(4), id: "1.3-4", n: 4, kind: "learn",
  titleEs: "Cero, uno, dos, tres", titleEn: "Numbers 0–5",
  storyEn: "Max counts everything: steps, palm trees, jumps. And before every jump, a countdown to zero.",
  canDoEn: "Now you can count from 0 to 5, forwards and backwards.",
  xpBase: 10, learnedEs: ["cero", "uno", "dos", "tres", "cuatro", "cinco"],
  steps: [
    { id: "nums-1-3", type: "numcard", titleEn: "Numbers 1, 2, 3", nums: N(1, 2, 3), noteEn: "Tap each number to hear it, then say it." },
    PICK("pick-dos", 2, [1, 2, 3]),
    PICK("pick-tres", 3, [3, 1, 2]),
    { id: "nums-4-5", type: "numcard", titleEn: "Numbers 4 and 5", nums: N(4, 5), noteEn: "In Colombia, the c in [[cinco]] sounds like an s." },
    PICK("pick-cuatro", 4, [4, 5, 1, 3]),
    COUNT("count-1-5", "Uno, dos, tres, cuatro, cinco.", "One, two, three, four, five.", [1, 2, 3, 4, 5], { contextEn: "Tap the numbers in order, from 1 to 5." }),
    { id: "intro-cero", type: "intro", digit: 0, contextEn: "Max always counts down before he jumps. He ends on:",
      es: "cero", en: "zero · 0", exampleEs: "Cinco, cuatro, tres, dos, uno… ¡cero!", exampleEn: "Five, four, three, two, one… zero!",
      noteEn: "[[cero]] = 0. A countdown ends on [[¡cero!]], and then Max jumps." },
    COUNT("countdown-5", "Cinco, cuatro, tres, dos, uno… ¡cero!", "Five, four, three, two, one… zero!", [5, 4, 3, 2, 1, 0],
      { character: "max", contextEn: "Max is ready to jump. Tap the numbers for his countdown, from 5 to 0." }),
    CLIP("clip-n1", "N1", ["Uno, dos, tres,", "cuatro, cinco: ¡muy bien!"], "One, two, three, four, five: very good!"),
    TYPE("type-tres", 3),
    { id: "gap-n1", type: "gap", es: "cuatro, cinco: ¡muy bien!", en: "four, five: very good!", blank: "cinco", optionsEs: ["cinco", "cuatro", "cero"] },
    { id: "dict-max", type: "dictation", character: "max", sayEs: "Tres, dos, uno… ¡Max!", en: "Three, two, one… Max!", answer: [3, 2, 1] },
    PICK("pick-cero", 0, [0, 2, 4, 5]),
    MATCH("match-4", [0, 1, 2, 3, 4]),
    TYPE("type-cinco", 5),
    { id: "speak-countdown", type: "speak", character: "max", es: "Cinco, cuatro, tres, dos, uno… ¡cero!", en: "Five, four, three, two, one… zero!" },
  ],
};

const L5 = {
  ...common(5), id: "1.3-5", n: 5, kind: "learn",
  titleEs: "Seis… diez", titleEn: "Numbers 6–10",
  storyEn: "Up to ten, and Radio Búho's first number song. Careful with seis and siete!",
  canDoEn: "Now you can count to ten, and you can tell seis and siete apart.",
  xpBase: 10, learnedEs: ["seis", "siete", "ocho", "nueve", "diez"],
  steps: [
    { id: "nums-6-7", type: "numcard", titleEn: "Numbers 6 and 7", nums: N(6, 7), lookalike: "seis/siete",
      noteEn: "Careful: [[seis]] and [[siete]] both start with s. [[seis]] (6) is one beat, “SAYS”. [[siete]] (7) is two, “SYEH-teh”." },
    PICK("pick-siete", 7, [6, 7, 5, 4], { lookalike: "seis/siete" }),
    { id: "seis-o-siete", type: "choose", titleEn: "6 or 7?", character: "max-thinking", promptEs: "¿Seis? No, siete.", optionsEn: ["6", "7"], answer: 1,
      answerEs: "¿Seis? No, siete.", answerEn: "Six? No, seven.", lookalike: "seis/siete" },
    PICK("pick-seis", 6, [7, 6, 5, 3], { lookalike: "seis/siete" }),
    { id: "nums-8-10", type: "numcard", titleEn: "Numbers 8, 9, 10", nums: N(8, 9, 10), noteEn: "[[ocho]], [[nueve]], [[diez]]. In Colombia, the z in [[diez]] sounds like an s." },
    PICK("pick-nueve", 9, [9, 10, 8, 6]),
    COUNT("count-6-10", "Seis, siete, ocho, nueve, diez.", "Six, seven, eight, nine, ten.", [6, 7, 8, 9, 10], { contextEn: "Tap the numbers in order, from 6 to 10." }),
    CLIP("clip-n2", "N2", ["Seis, siete, ocho,", "nueve, diez: ¡fenomenal!"], "Six, seven, eight, nine, ten: great!"),
    COUNT("count-twos", "Dos, cuatro, seis, ocho, diez.", "Two, four, six, eight, ten.", [2, 4, 6, 8, 10], { contextEn: "Count in twos: 2, 4, 6…", extra: [{ n: 5, es: "cinco" }, { n: 7, es: "siete" }] }),
    TYPE("type-ocho", 8),
    SONG("song-1-10", "numeros_1_10"),
    { id: "gap-song-siete", type: "gap", es: "Seis, siete, ocho, nueve, diez: ¡fenomenal!", en: "Six, seven, eight, nine, ten: great!", blank: "siete", optionsEs: ["seis", "siete", "diez"], lookalike: "seis/siete" },
    { id: "dict-seis-siete", type: "dictation", sayEs: "Seis, siete. Seis, siete, ocho.", en: "Six, seven. Six, seven, eight.", answer: [6, 7, 6, 7, 8], lookalike: "seis/siete" },
    TYPE("type-siete", 7, { lookalike: "seis/siete" }),
    MATCH("match-5", [6, 7, 8, 9, 10]),
    { id: "speak-6-10", type: "speak", character: "owl-explaining", es: "Seis, siete, ocho, nueve, diez.", en: "Six, seven, eight, nine, ten." },
  ],
};

const L6 = {
  ...common(6), id: "1.3-6", n: 6, kind: "game",
  titleEn: "Game: Number Invaders 0–10",
  storyEn: "Numbers are falling on Salento! Hear (or read) a number and tap its digit before it lands.",
  canDoEn: "You stopped the Number Invaders: every number from 0 to 10!",
  xpBase: 15, learnedEs: [], game: true,
  steps: [
    { id: "g-study", type: "numcard", study: true, titleEn: "Look first: 0 to 10", nums: N(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
      noteEn: "Tap a number to hear it. In the game, you only get the word!" },
    { id: "g-wave-odd", type: "invaders", titleEn: "Number Invaders: wave 1", rounds: [
      { sayEs: "uno", n: 1, choices: [1, 7, 4, 10] }, { sayEs: "tres", n: 3, choices: [3, 2, 6, 8] }, { sayEs: "cinco", n: 5, choices: [5, 4, 9, 0] },
      { sayEs: "siete", n: 7, choices: [7, 6, 1, 3] }, { sayEs: "nueve", n: 9, choices: [9, 10, 5, 2] }] },
    SONG("song-1-10-digits", "numeros_1_10", true),
    { id: "g-wave-down", type: "invaders", titleEn: "Number Invaders: wave 2 (the countdown)", rounds: [
      { sayEs: "diez", n: 10, choices: [10, 2, 6, 9] }, { sayEs: "ocho", n: 8, choices: [8, 3, 0, 4] }, { sayEs: "seis", n: 6, choices: [6, 7, 1, 5] },
      { sayEs: "cuatro", n: 4, choices: [4, 5, 8, 9] }, { sayEs: "dos", n: 2, choices: [2, 10, 3, 7] }, { sayEs: "cero", n: 0, choices: [0, 10, 6, 1] }] },
    { id: "g-dict-down", type: "dictation", sayEs: "Diez, ocho, seis, cuatro, dos, cero.", en: "Ten, eight, six, four, two, zero.", answer: [10, 8, 6, 4, 2, 0] },
    { id: "g-wave-lookalike", type: "invaders", titleEn: "Number Invaders: wave 3 (seis or siete?)", lookalike: "seis/siete", rounds: [
      { sayEs: "seis", n: 6, choices: [6, 7, 3, 9] }, { sayEs: "siete", n: 7, choices: [7, 6, 1, 4] },
      { sayEs: "seis", n: 6, choices: [6, 7, 10, 2] }, { sayEs: "siete", n: 7, choices: [7, 6, 0, 8] }] },
    { id: "g-dict-odd", type: "dictation", sayEs: "Uno, tres, cinco, siete, nueve.", en: "One, three, five, seven, nine.", answer: [1, 3, 5, 7, 9] },
  ],
};

const L7 = {
  ...common(7), id: "1.3-7", n: 7, kind: "learn",
  titleEs: "Once… quince", titleEn: "Numbers 11–15",
  storyEn: "Eleven to fifteen each have their own name. Listen to how they start.",
  canDoEn: "Now you can count to fifteen, and you can hear tres and trece apart.",
  xpBase: 10, learnedEs: ["once", "doce", "trece", "catorce", "quince"],
  steps: [
    { id: "intro-once", type: "intro", digit: 11, contextEn: "After [[diez]], a new set of numbers:",
      es: "once", en: "eleven · 11", noteEn: "11 to 15 have their own names. Learn each one by heart." },
    { id: "intro-doce", type: "intro", digit: 12, contextEn: "Matilda is twelve. Twelve is:",
      es: "doce", en: "twelve · 12", noteEn: "[[dos]] → [[doce]]: it starts like [[dos]]." },
    PICK("pick-doce", 12, [2, 12, 11, 10]),
    { id: "intro-trece", type: "intro", digit: 13, contextEn: "Max is thirteen. Thirteen is:",
      es: "trece", en: "thirteen · 13", noteEn: "[[tres]] → [[trece]]. Say both parts: TREH-seh. [[tres]] is short; [[trece]] is longer." },
    PICK("pick-trece", 13, [3, 13, 12, 11]),
    { id: "intro-catorce", type: "intro", digit: 14, contextEn: "Fourteen:",
      es: "catorce", en: "fourteen · 14", noteEn: "[[cuatro]] → [[catorce]]." },
    { id: "intro-quince", type: "intro", digit: 15, contextEn: "Fifteen:",
      es: "quince", en: "fifteen · 15", noteEn: "[[cinco]] → [[quince]]. QU sounds like k: KEEN-seh." },
    PICK("pick-quince", 15, [5, 15, 14, 13]),
    COUNT("count-11-15", "Once, doce, trece, catorce, quince.", "Eleven, twelve, thirteen, fourteen, fifteen.", [11, 12, 13, 14, 15], { contextEn: "Tap the numbers in order, from 11 to 15." }),
    CLIP("clip-n3", "N3", ["Diez, once, doce,", "trece, catorce, quince: ¡muy bien!"], "Ten, eleven, twelve, thirteen, fourteen, fifteen: very good!"),
    { id: "sort-1-15", type: "sort", titleEn: "1 to 5, or 11 to 15?", bucketsEn: ["1 to 5", "11 to 15"],
      cards: [{ es: "tres", bucket: 0 }, { es: "trece", bucket: 1 }, { es: "dos", bucket: 0 }, { es: "doce", bucket: 1 }, { es: "cinco", bucket: 0 }, { es: "quince", bucket: 1 }] },
    TYPE("type-catorce", 14),
    { id: "dict-once", type: "dictation", sayEs: "Diez, once, doce… ¡trece!", en: "Ten, eleven, twelve… thirteen!", answer: [10, 11, 12, 13] },
    MATCH("match-7", [11, 12, 13, 14, 15]),
    TYPE("type-quince", 15),
    { id: "speak-11-15", type: "speak", character: "owl-explaining", es: "Once, doce, trece, catorce, quince.", en: "Eleven, twelve, thirteen, fourteen, fifteen." },
  ],
};

const L8 = {
  ...common(8), id: "1.3-8", n: 8, kind: "learn",
  titleEs: "¿Cuántos años tienes?", titleEn: "How old are you?",
  storyEn: "Everyone in the Restrepo house wants to know how old everyone is.",
  canDoEn: "Now you can ask someone's age and say yours: Tengo doce años.",
  xpBase: 10, learnedEs: ["¿Cuántos años tienes?", "tengo", "tienes", "tiene", "doce años"],
  steps: [
    { id: "intro-tengo", type: "intro", character: "max", contextEn: "Max holds up Buhísimo's map:",
      es: "tengo", en: "I have", exampleEs: "Tengo el mapa.", exampleEn: "I have the map." },
    { id: "pick-tengo", type: "pick", character: "max", promptEs: "Tengo el mapa.",
      options: ["I have the map.", "You have the map.", "He has the map.", "Where is the map?"], answer: 0 },
    { id: "intro-tienes", type: "intro", character: "matilda", contextEn: "Matilda can't find the map:",
      es: "tienes", en: "you have", exampleEs: "¿Tienes el mapa, Max?", exampleEn: "Do you have the map, Max?",
      noteEn: "[[tengo]] (I have) → [[tienes]] (you have)." },
    { id: "intro-tiene", type: "intro", character: "valentina", contextEn: "And now Valentina has it:",
      es: "tiene", en: "he/she has", exampleEs: "Valentina tiene el mapa.", exampleEn: "Valentina has the map." },
    { id: "gap-tiene", type: "gap", es: "Valentina tiene el mapa.", en: "Valentina has the map.", blank: "tiene", optionsEs: ["tengo", "tienes", "tiene"] },
    { id: "intro-cuantos", type: "intro", character: "matilda", contextEn: "Matilda asks Valentina:",
      es: "¿Cuántos años tienes?", en: "How old are you?", exampleEs: "¿Cuántos años tienes? — Doce.", exampleEn: "How old are you? — Twelve.",
      noteEn: "Word for word: “How many years do you have?”" },
    { id: "table-anos", type: "table", titleEn: "In Spanish, you have years", contextEn: "[[tengo]] = I have. You have a map, and you have years too.",
      rows: [
        { es: "Tengo el mapa.", en: "I have the map.", exampleEs: "¿Tienes el mapa, Max?", exampleEn: "Do you have the map, Max?" },
        { es: "Tengo doce años.", en: "I'm twelve. (I have twelve years.)", exampleEs: "Samuel tiene trece años.", exampleEn: "Samuel is thirteen." },
      ],
      noteEn: "The word for years always comes after a number: [[doce años]], [[trece años]]." },
    { id: "pick-samuel-13", type: "pick", character: "samuel", promptEs: "Samuel tiene trece años.",
      options: ["Samuel is thirteen.", "Samuel is three.", "Samuel has thirteen maps.", "I'm thirteen, Samuel."], answer: 0 },
    { id: "yn-doce", type: "choose", titleEn: "Sí or no?", character: "valentina", promptEs: "¿Tienes doce años?", promptEn: "Valentina is twelve.",
      optionsEs: ["sí", "no"], answer: 0, answerEs: "¿Tienes doce años? — Sí, tengo doce años.", answerEn: "Are you twelve? — Yes, I'm twelve." },
    { id: "tiles-doce", type: "tiles", character: "valentina", en: "I'm twelve.",
      answerEs: ["tengo", "doce años"], tilesEs: ["tiene", "trece años", "doce años", "tengo", "tienes"], fullEs: "Tengo doce años." },
    { id: "listen-samuel", type: "listen", sayEs: "¿Cuántos años tienes, Samuel? — Trece.", en: "How old are you, Samuel? — Thirteen.",
      optionsEs: ["¿Cuántos años tienes, Samuel? — Trece.", "¿Cuántos años tienes? — Doce.", "Samuel tiene trece años.", "¿Tienes el mapa, Max?"], answer: 0 },
    { id: "age-samuel", type: "numpick", titleEn: "How old is he?", sayEs: "Samuel tiene trece años.", nums: [3, 13, 12, 14], answer: 1, en: "Samuel is thirteen." },
    { id: "type-cuantos", type: "type", en: "How old are you?", answerEs: "¿Cuántos años tienes?" },
    { id: "match-8", type: "match", pairs: [
      { es: "tengo", en: "I have" }, { es: "tienes", en: "you have" }, { es: "tiene", en: "he/she has" },
      { es: "¿Cuántos años tienes?", en: "How old are you?" }, { es: "Tengo doce años.", en: "I'm twelve." }] },
    { id: "type-trece", type: "type", en: "I'm thirteen.", answerEs: "Tengo trece años." },
    { id: "speak-doce", type: "speak", character: "valentina", es: "Tengo doce años.", en: "I'm twelve." },
  ],
};

const L9 = {
  ...common(9), id: "1.3-9", n: 9, kind: "learn",
  titleEs: "Dieciséis… veinte", titleEn: "Numbers 16–20",
  storyEn: "From sixteen, Spanish counts “ten and six”, all in one word. Then a new number: twenty.",
  canDoEn: "Now you can count to twenty, and you know how dieci- numbers are built.",
  xpBase: 10, learnedEs: ["dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"],
  steps: [
    { id: "pattern-dieci", type: "pattern", titleEn: "Ten and six: dieciséis", contextEn: "From 16 to 19, Spanish joins [[diez]] and the number into one word.",
      rows: [
        { aEs: "diez", a: 10, bEs: "seis", b: 6, cEs: "dieciséis", c: 16 },
        { aEs: "diez", a: 10, bEs: "siete", b: 7, cEs: "diecisiete", c: 17 },
        { aEs: "diez", a: 10, bEs: "ocho", b: 8, cEs: "dieciocho", c: 18 },
        { aEs: "diez", a: 10, bEs: "nueve", b: 9, cEs: "diecinueve", c: 19 },
      ],
      noteEn: "Ten, six: [[dieciséis]]. Watch the accent on [[dieciséis]]. Tap a row to hear it." },
    { id: "nums-16-17", type: "numcard", titleEn: "Numbers 16 and 17", nums: N(16, 17), lookalike: "seis/siete",
      noteEn: "Like [[seis]] and [[siete]]: [[dieciséis]] (16) and [[diecisiete]] (17). Listen to the end." },
    PICK("pick-17", 17, [16, 17, 6, 7], { lookalike: "seis/siete" }),
    { id: "nums-18-20", type: "numcard", titleEn: "Numbers 18, 19, 20", nums: N(18, 19, 20), noteEn: "[[veinte]] (20) is a new word, not ten and something." },
    PICK("pick-19", 19, [19, 9, 18, 10]),
    COUNT("count-16-20", "Dieciséis, diecisiete, dieciocho, diecinueve, veinte.", "Sixteen, seventeen, eighteen, nineteen, twenty.", [16, 17, 18, 19, 20], { contextEn: "Tap the numbers in order, from 16 to 20." }),
    CLIP("clip-n4", "N4", ["Dieciséis, diecisiete,", "dieciocho, diecinueve, veinte: ¡fenomenal!"], "Sixteen, seventeen, eighteen, nineteen, twenty: great!"),
    TYPE("type-16", 16),
    SONG("song-10-20", "numeros_10_20"),
    { id: "gap-dieciseis", type: "gap", es: "Quince, dieciséis, diecisiete.", en: "Fifteen, sixteen, seventeen.", blank: "dieciséis", optionsEs: ["diecisiete", "dieciséis", "seis"] },
    { id: "dict-15-17", type: "dictation", sayEs: "Quince, dieciséis, diecisiete.", en: "Fifteen, sixteen, seventeen.", answer: [15, 16, 17] },
    { id: "sort-10-20", type: "sort", titleEn: "0 to 10, or 11 to 20?", bucketsEn: ["0 to 10", "11 to 20"],
      cards: [{ es: "siete", bucket: 0 }, { es: "diecisiete", bucket: 1 }, { es: "nueve", bucket: 0 }, { es: "diecinueve", bucket: 1 }, { es: "ocho", bucket: 0 }, { es: "dieciocho", bucket: 1 }] },
    MATCH("match-9", [16, 17, 18, 19, 20]),
    TYPE("type-20", 20),
    TYPE("type-17", 17),
    { id: "speak-16-20", type: "speak", character: "owl-explaining", es: "Dieciséis, diecisiete, dieciocho, diecinueve, veinte.", en: "Sixteen, seventeen, eighteen, nineteen, twenty." },
  ],
};

const L10 = {
  ...common(10), id: "1.3-10", n: 10, kind: "practice",
  titleEs: "Tengo, tienes, tiene", titleEn: "I have, you have, he/she has",
  storyEn: "Names, ages and where everyone is from, with numbers up to twenty in between. Two songs, too.",
  canDoEn: "You can say anyone's name, age and where they're from.",
  xpBase: 10, learnedEs: ["Tengo, tienes, tiene."],
  steps: [
    { id: "table-tener", type: "table", titleEn: "tengo, tienes, tiene", contextEn: "Like [[me llamo, te llamas, se llama]] and [[soy, eres, es]]: one verb, three people.",
      rows: [
        { es: "tengo", en: "I have", exampleEs: "Me llamo Matilda. Tengo doce años.", exampleEn: "My name is Matilda. I'm twelve." },
        { es: "tienes", en: "you have", exampleEs: "¿Cuántos años tienes, Valentina? — Doce.", exampleEn: "How old are you, Valentina? — Twelve." },
        { es: "tiene", en: "he/she has", exampleEs: "Max tiene trece años. Es de Melbourne.", exampleEn: "Max is thirteen. He's from Melbourne." },
      ] },
    SONG("song-10-20-digits", "numeros_10_20", true),
    { id: "gap-tiene", type: "gap", es: "Max tiene trece años. Es de Melbourne.", en: "Max is thirteen. He's from Melbourne.", blank: "tiene", optionsEs: ["tengo", "tienes", "tiene"] },
    { id: "reply-doce", type: "choose", titleEn: "Pick the best answer", character: "matilda", promptEs: "¿Cuántos años tienes, Valentina?",
      optionsEs: ["Doce.", "Me llamo Valentina.", "Soy de Colombia."], answer: 0, answerEs: "¿Cuántos años tienes, Valentina? — Doce.", answerEn: "How old are you, Valentina? — Twelve." },
    { id: "tiles-matilda", type: "tiles", character: "matilda", en: "My name is Matilda. I'm twelve.",
      answerEs: ["me llamo", "Matilda", "tengo", "doce años"], tilesEs: ["tengo", "trece años", "Matilda", "tiene", "doce años", "me llamo", "se llama"], fullEs: "Me llamo Matilda. Tengo doce años." },
    SONG("song-uno-once", "numeros_uno_once"),
    { id: "sort-person", type: "sort", titleEn: "I, you, or he/she?", bucketsEn: ["I", "you", "he / she"],
      cards: [{ es: "tengo", bucket: 0 }, { es: "tienes", bucket: 1 }, { es: "tiene", bucket: 2 }, { es: "me llamo", bucket: 0 }, { es: "eres", bucket: 1 }, { es: "se llama", bucket: 2 }] },
    { id: "dict-uno-once", type: "dictation", sayEs: "Uno, once. Dos, doce.", en: "One, eleven. Two, twelve.", answer: [1, 11, 2, 12] },
    PICK("pick-14", 14, [4, 14, 13, 3]),
    SONG("song-uno-once-digits", "numeros_uno_once", true),
    { id: "type-max", type: "type", en: "Max is thirteen. He's from Melbourne.", answerEs: "Max tiene trece años. Es de Melbourne." },
    { id: "listen-valentina", type: "listen", sayEs: "¿Cuántos años tienes, Valentina? — Doce.", en: "How old are you, Valentina? — Twelve.",
      optionsEs: ["¿Cuántos años tienes, Valentina? — Doce.", "¿Cuántos años tienes, Samuel? — Trece.", "Max tiene trece años. Es de Melbourne.", "Me llamo Matilda. Tengo doce años."], answer: 0 },
    TYPE("type-12", 12),
    { id: "type-tener", type: "type", en: "I have, you have, he/she has.", answerEs: "Tengo, tienes, tiene." },
    { id: "speak-matilda", type: "speak", character: "matilda", es: "Me llamo Matilda. Tengo doce años.", en: "My name is Matilda. I'm twelve." },
  ],
};

const L11 = {
  ...common(11), id: "1.3-11", n: 11, kind: "check",
  titleEs: "¿Cómo te llamas? ¿Cuántos años tienes?", titleEn: "Section check 1.3a",
  storyEn: "Section check: names, ages and the numbers 0 to 20. No hints this time.",
  canDoEn: "Part A done! You can give names and ages, and every number from 0 to 20.",
  xpBase: 20, learnedEs: [], check: true,
  steps: [
    PICK("c-pick-17", 17, [7, 17, 16, 6], { lookalike: "seis/siete" }),
    { id: "c-dict-20", type: "dictation", sayEs: "Veinte, diecinueve, dieciocho, diecisiete, dieciséis.", en: "Twenty, nineteen, eighteen, seventeen, sixteen.", answer: [20, 19, 18, 17, 16] },
    { id: "c-who-max", type: "choose", titleEn: "Who is it?", promptEs: "¿Cómo se llama él? — Se llama Max. Tiene trece años.", optionsArt: ART4, answer: 3,
      answerEs: "¿Cómo se llama él? — Se llama Max. Tiene trece años.", answerEn: "What's his name? — His name is Max. He's thirteen." },
    { id: "c-siete", type: "choose", titleEn: "6 or 7?", character: "max-thinking", promptEs: "¿Siete? — No, seis.", optionsEn: ["6", "7"], answer: 0,
      answerEs: "¿Siete? — No, seis.", answerEn: "Seven? — No, six.", lookalike: "seis/siete" },
    { id: "c-listen-valentina", type: "listen", sayEs: "Valentina tiene doce años. Es de Salento.", en: "Valentina is twelve. She's from Salento.",
      optionsEs: ["Valentina tiene doce años. Es de Salento.", "Valentina tiene dos años. Es de Salento.", "Me llamo Valentina. Soy de Salento.", "Samuel tiene trece años."], answer: 0 },
    { id: "c-type-como", type: "type", en: "What's your name?", answerEs: "¿Cómo te llamas?" },
    TYPE("c-type-15", 15),
    { id: "c-dict-cero", type: "dictation", character: "max", sayEs: "Tres, dos, uno… ¡cero!", en: "Three, two, one… zero!", answer: [3, 2, 1, 0] },
    { id: "c-gap-tengo", type: "gap", es: "¿Cómo te llamas? — Me llamo Samuel. Tengo trece años.", en: "What's your name? — My name is Samuel. I'm thirteen.", blank: "Tengo", optionsEs: ["Tengo", "Tienes", "Tiene"] },
    { id: "c-type-cuantos", type: "type", en: "How old are you?", answerEs: "¿Cuántos años tienes?" },
    { id: "c-tiles-samuel", type: "tiles", character: "samuel", en: "My name is Samuel. I'm thirteen.",
      answerEs: ["me llamo", "Samuel", "tengo", "trece años"], tilesEs: ["tres", "me llamo", "trece años", "Samuel", "tiene", "tengo"], fullEs: "Me llamo Samuel. Tengo trece años." },
    { id: "c-type-valentina", type: "type", en: "Her name is Valentina. She's twelve. She's from Salento.", answerEs: "Se llama Valentina. Tiene doce años. Es de Salento." },
    { id: "c-speak", type: "speak", character: "samuel", es: "¿Cómo te llamas? — Me llamo Samuel. Tengo trece años.", en: "What's your name? — My name is Samuel. I'm thirteen." },
  ],
};

// =================================================================== 1.3b «Mi carnet de identidad»
const L12 = {
  ...common(12), id: "1.3-12", n: 12, kind: "repaso",
  titleEs: "Cinco, diez, quince, veinte", titleEn: "Review: names, ages and numbers 0–20",
  storyEn: "Before twenty-one to thirty-one: names, ages and the numbers so far, mixed up.",
  canDoEn: "Part A is still fresh: names, ages and numbers 0 to 20.",
  xpBase: 10, learnedEs: [],
  steps: [
    COUNT("r-count-fives", "Cinco, diez, quince, veinte.", "Five, ten, fifteen, twenty.", [5, 10, 15, 20], { contextEn: "Count in fives: 5, 10…", extra: [{ n: 12, es: "doce" }, { n: 14, es: "catorce" }] }),
    PICK("r-pick-9", 9, [9, 19, 1, 10]),
    { id: "r-pick-matilda", type: "pick", character: "matilda", promptEs: "¡Hola! Me llamo Matilda. Soy de Melbourne. Tengo doce años.",
      options: ["Hi! My name is Matilda. I'm from Melbourne. I'm twelve.", "Hi! Her name is Matilda. She's from Melbourne. She's twelve.", "Hi! My name is Matilda. I'm from Melbourne. I'm two.", "Hi! I'm Matilda. I have twelve maps."], answer: 0 },
    { id: "r-dict-5-7", type: "dictation", sayEs: "Cinco, seis, siete. ¡Muy bien!", en: "Five, six, seven. Very good!", answer: [5, 6, 7], lookalike: "seis/siete" },
    { id: "r-gap-te-llamas", type: "gap", es: "¿Te llamas Valentina? — Sí. ¿Y tú?", en: "Is your name Valentina? — Yes. And you?", blank: "Te llamas", optionsEs: ["Me llamo", "Te llamas", "Se llama"] },
    TYPE("r-type-19", 19),
    { id: "r-map-chile", type: "maptap", sayEs: "Él es de Chile.", en: "He's from Chile.", target: "cl", choices: ["cl", "ar", "pe", "pascua"] },
    { id: "r-scene-am", type: "choose", titleEn: "What do you say?", time: "morning", promptEn: "It's 8 in the morning. You meet Samuel.",
      optionsEs: ["Buenos días", "Buenas tardes"], answer: 0, answerEs: "Buenos días, Samuel.", answerEn: "Good morning, Samuel." },
    { id: "r-tiles-samuel", type: "tiles", character: "samuel", en: "My name is Samuel. I'm thirteen.",
      answerEs: ["me llamo", "Samuel", "tengo", "trece años"], tilesEs: ["doce años", "Samuel", "trece años", "tengo", "me llamo"], fullEs: "Me llamo Samuel. Tengo trece años." },
    PICK("r-pick-20", 20, [20, 12, 2, 10]),
    { id: "r-type-valentina", type: "type", en: "Valentina is twelve.", answerEs: "Valentina tiene doce años." },
    MATCH("r-match", [5, 15, 9, 19, 20]),
    { id: "r-speak", type: "speak", character: "matilda", es: "¡Hola! Me llamo Matilda. Soy de Melbourne. Tengo doce años.", en: "Hi! My name is Matilda. I'm from Melbourne. I'm twelve." },
  ],
};

const L13 = {
  ...common(13), id: "1.3-13", n: 13, kind: "learn",
  titleEs: "Veintiuno… veinticinco", titleEn: "Numbers 21–25",
  storyEn: "After twenty, Spanish joins veinte and the number into one word: veinti-.",
  canDoEn: "Now you can count to twenty-five, and you can hear veinticuatro and veinticinco apart.",
  xpBase: 10, learnedEs: ["veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco"],
  steps: [
    { id: "pattern-veinti", type: "pattern", titleEn: "Twenty and one: veintiuno", contextEn: "From 21, Spanish joins [[veinte]] and the number into one word: [[veintiuno]], [[veintidós]]…",
      rows: [
        { aEs: "veinte", a: 20, bEs: "uno", b: 1, cEs: "veintiuno", c: 21 },
        { aEs: "veinte", a: 20, bEs: "dos", b: 2, cEs: "veintidós", c: 22 },
        { aEs: "veinte", a: 20, bEs: "tres", b: 3, cEs: "veintitrés", c: 23 },
      ],
      noteEn: "Watch the accents: [[veintidós]], [[veintitrés]]. Tap a row to hear it." },
    { id: "nums-21-23", type: "numcard", titleEn: "Numbers 21, 22, 23", nums: N(21, 22, 23) },
    PICK("pick-22", 22, [22, 12, 2, 21]),
    { id: "nums-24-25", type: "numcard", titleEn: "Numbers 24 and 25", nums: N(24, 25), lookalike: "veinticuatro/veinticinco",
      noteEn: "Careful: [[veinticuatro]] (24) and [[veinticinco]] (25) start the same way. Listen to the end: [[cuatro]] or [[cinco]]." },
    PICK("pick-25", 25, [24, 25, 15, 5], { lookalike: "veinticuatro/veinticinco" }),
    { id: "24-o-25", type: "choose", titleEn: "24 or 25?", character: "max-thinking", promptEs: "¿Veinticuatro? No, veinticinco.", optionsEn: ["24", "25"], answer: 1,
      answerEs: "¿Veinticuatro? No, veinticinco.", answerEn: "Twenty-four? No, twenty-five.", lookalike: "veinticuatro/veinticinco" },
    COUNT("count-21-25", "Veintiuno, veintidós, veintitrés, veinticuatro, veinticinco.", "Twenty-one, twenty-two, twenty-three, twenty-four, twenty-five.", [21, 22, 23, 24, 25], { contextEn: "Tap the numbers in order, from 21 to 25." }),
    CLIP("clip-n5", "N5", ["Veinte, veintiuno, veintidós,", "veintitrés, veinticuatro, veinticinco: ¡muy bien!"], "Twenty, twenty-one, twenty-two, twenty-three, twenty-four, twenty-five: very good!"),
    TYPE("type-23", 23),
    SONG("song-dos-doce", "numeros_dos_doce_veintidos"),
    { id: "dict-20-22", type: "dictation", sayEs: "Veinte, veintiuno, veintidós…", en: "Twenty, twenty-one, twenty-two…", answer: [20, 21, 22] },
    { id: "sort-2-12-22", type: "sort", titleEn: "Which family?", bucketsEn: ["1 to 5", "11 to 15", "21 to 25"],
      cards: [{ es: "dos", bucket: 0 }, { es: "doce", bucket: 1 }, { es: "veintidós", bucket: 2 }, { es: "tres", bucket: 0 }, { es: "trece", bucket: 1 }, { es: "veintitrés", bucket: 2 }] },
    PICK("pick-24", 24, [24, 25, 14, 4], { lookalike: "veinticuatro/veinticinco" }),
    MATCH("match-13", [21, 22, 23, 24, 25]),
    TYPE("type-22", 22),
    { id: "speak-21-25", type: "speak", character: "owl-explaining", es: "Veintiuno, veintidós, veintitrés, veinticuatro, veinticinco.", en: "Twenty-one, twenty-two, twenty-three, twenty-four, twenty-five." },
  ],
};

const L14 = {
  ...common(14), id: "1.3-14", n: 14, kind: "learn",
  titleEs: "Veintiséis… treinta y uno", titleEn: "Numbers 26–31",
  storyEn: "Up to thirty-one, the last day of the longest months. Careful with veintiséis and veintisiete!",
  canDoEn: "Now you can count to thirty-one, and you can hear veintiséis and veintisiete apart.",
  xpBase: 10, learnedEs: ["veintiséis", "veintisiete", "veintiocho", "veintinueve", "treinta", "treinta y uno"],
  steps: [
    { id: "nums-26-27", type: "numcard", titleEn: "Numbers 26 and 27", nums: N(26, 27), lookalike: "veintiséis/veintisiete",
      noteEn: "Like [[seis]] and [[siete]]: [[veintiséis]] (26) and [[veintisiete]] (27). Listen to the end." },
    PICK("pick-27", 27, [26, 27, 17, 7], { lookalike: "veintiséis/veintisiete" }),
    { id: "26-o-27", type: "choose", titleEn: "26 or 27?", character: "max-thinking", promptEs: "¿Veintiséis? No, veintisiete.", optionsEn: ["26", "27"], answer: 1,
      answerEs: "¿Veintiséis? No, veintisiete.", answerEn: "Twenty-six? No, twenty-seven.", lookalike: "veintiséis/veintisiete" },
    { id: "nums-28-29", type: "numcard", titleEn: "Numbers 28 and 29", nums: N(28, 29) },
    PICK("pick-29", 29, [29, 19, 9, 28]),
    { id: "pattern-treinta", type: "pattern", titleEn: "30 and 31", contextEn: "[[treinta]] = 30. Then a change: 31 is three words.",
      rows: [
        { aEs: "veinte", a: 20, bEs: "uno", b: 1, cEs: "veintiuno", c: 21 },
        { aEs: "treinta", a: 30, bEs: "uno", b: 1, cEs: "treinta y uno", c: 31 },
      ],
      noteEn: "[[veintiuno]] is one word. [[treinta y uno]] is three." },
    COUNT("count-26-30", "Veintiséis, veintisiete, veintiocho, veintinueve, treinta.", "Twenty-six, twenty-seven, twenty-eight, twenty-nine, thirty.", [26, 27, 28, 29, 30], { contextEn: "Tap the numbers in order, from 26 to 30." }),
    CLIP("clip-n6", "N6", ["Veintiséis, veintisiete, veintiocho,", "veintinueve, treinta… ¡treinta y uno!"], "Twenty-six, twenty-seven, twenty-eight, twenty-nine, thirty… thirty-one!"),
    SONG("song-20-31", "numeros_20_31"),
    TYPE("type-31", 31),
    { id: "dict-29-31", type: "dictation", sayEs: "Veintinueve, treinta, treinta y uno.", en: "Twenty-nine, thirty, thirty-one.", answer: [29, 30, 31] },
    SONG("song-dos-doce-digits", "numeros_dos_doce_veintidos", true),
    TYPE("type-26", 26, { lookalike: "veintiséis/veintisiete" }),
    MATCH("match-14", [26, 27, 28, 29, 30]),
    { id: "tiles-29-31", type: "tiles", titleEn: "Put them in order", character: "owl-explaining", en: "29, 30, 31",
      answerEs: ["veintinueve", "treinta", "treinta y uno"], tilesEs: ["treinta y uno", "veintinueve", "veintiuno", "treinta"], fullEs: "Veintinueve, treinta, treinta y uno." },
    { id: "speak-29-31", type: "speak", character: "owl-explaining", es: "Veintinueve, treinta, treinta y uno.", en: "Twenty-nine, thirty, thirty-one." },
  ],
};

const L15 = {
  ...common(15), id: "1.3-15", n: 15, kind: "listen",
  titleEn: "Radio Búho: the numbers song",
  storyEn: "Radio Búho plays all the number songs, Max counts down, and two callers say how old they are.",
  canDoEn: "You sang every number from 1 to 31 and wrote down what the callers said!",
  xpBase: 15, learnedEs: [],
  steps: [
    { id: "songset", type: "songset", episode: "1.3-15", introLine: 0, titleEn: "Radio Búho: the number songs",
      songs: SONG_SET },
    SONG("song-20-31-digits", "numeros_20_31", true),
    SONG("song-uno-diez", "numeros_uno_diez_once"),
    { id: "gap-31", type: "gap", es: "Treinta, treinta y uno,", en: "Thirty, thirty-one,", blank: "treinta y uno", optionsEs: ["treinta y uno", "veintiuno", "trece"] },
    SONG("song-uno-diez-digits", "numeros_uno_diez_once", true),
    { id: "dict-max", type: "dictation", character: "max", titleEn: "Max's countdown: write the numbers", sayEs: RADIO[0].lines[1].es, en: RADIO[0].lines[1].en, answer: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] },
    { id: "radio-ages", type: "idcard", episode: "1.3-15", titleEn: "Radio Búho: how old are they?", contextEn: "Two callers say how old they are. Write each age as a number.",
      calls: [[2, 3], [4, 5]],
      cards: [
        { photo: "samuel", number: "1 094 233 017", fields: [{ qEs: "¿Cuántos años tienes?", kind: "digits", value: 13 }] },
        { photo: "valentina", number: "1 094 233 018", fields: [{ qEs: "¿Cuántos años tienes?", kind: "digits", value: 12 }] },
      ] },
    { id: "transcript-numeros", type: "transcript", episode: "1.3-15", contextEn: "The whole show. Tap a line to hear it; tap EN for the English." },
    { id: "pick-bye", type: "pick", character: "owl-celebrating", promptEs: "¡Muy bien! Uno, dos, tres… ¡hasta luego!",
      options: ["Very good! One, two, three… see you later!", "Very good! One, two, three… good morning!", "Thank you! Three, two, one… goodbye!", "Great! Twenty-one, twenty-two, twenty-three!"], answer: 0 },
  ],
};

const L16 = {
  ...common(16), id: "1.3-16", n: 16, kind: "learn",
  titleEs: "Mi carnet de identidad", titleEn: "My ID card",
  storyEn: "In Colombia, everyone has an ID card. Samuel and Valentina show theirs to Matilda and Max.",
  canDoEn: "Now you can read an ID card and say your name and surname: Mi nombre es…",
  xpBase: 10, learnedEs: ["el carnet de identidad", "el nombre", "el apellido", "mi"],
  steps: [
    { id: "intro-carnet", type: "intro", idcard: { photo: "samuel", number: "1 094 233 017", fields: [] }, contextEn: "Samuel shows his card:",
      es: "el carnet de identidad", en: "the ID card", exampleEs: "El carnet de identidad de Samuel.", exampleEn: "Samuel's ID card." },
    { id: "pick-carnet", type: "pick", character: "samuel", promptEs: "Tengo el carnet de identidad.",
      options: ["I have the ID card.", "Do you have the ID card?", "He has the ID card.", "I have the map."], answer: 0 },
    { id: "intro-nombre", type: "intro", idcard: { photo: "samuel", number: "1 094 233 017", fields: [{ qEs: Q.nombre, valueEs: "Samuel" }] }, contextEn: "The first line on the card:",
      es: "el nombre", en: "the (first) name", exampleEs: "¿El nombre? Samuel.", exampleEn: "Name? Samuel." },
    { id: "intro-apellido", type: "intro", idcard: { photo: "samuel", number: "1 094 233 017", fields: [{ qEs: Q.nombre, valueEs: "Samuel" }, { qEs: Q.apellido, valueEs: "Restrepo" }], highlight: 1 },
      contextEn: "And the family name:", es: "el apellido", en: "the surname", exampleEs: "El apellido de Samuel es Restrepo.", exampleEn: "Samuel's surname is Restrepo.",
      noteEn: "[[Restrepo]] is the family's surname: Valentina and Samuel Restrepo." },
    { id: "read-valentina", type: "idcard", mode: "read", titleEn: "Read the ID card",
      card: { photo: "valentina", number: "1 094 233 018", fields: [{ qEs: Q.nombre, valueEs: "Valentina" }, { qEs: Q.apellido, valueEs: "Restrepo" }] },
      promptEn: "What does the card say?",
      optionsEs: ["El nombre es Valentina. El apellido es Restrepo.", "El nombre es Restrepo. El apellido es Valentina.", "El nombre es Samuel. El apellido es Restrepo."], answer: 0,
      answerEn: "The name is Valentina. The surname is Restrepo." },
    { id: "intro-mi", type: "intro", character: "samuel", contextEn: "Samuel talks about his own card:",
      es: "mi", en: "my", exampleEs: "Mi nombre es Samuel. Mi apellido es Restrepo.", exampleEn: "My name is Samuel. My surname is Restrepo." },
    { id: "table-mi", type: "table", titleEn: "el nombre → mi nombre", contextEn: "[[mi]] takes the place of the little word in front. The word never stands on its own.",
      rows: [
        { es: "mi nombre", en: "my name (not: the name)", exampleEs: "Mi nombre es Samuel.", exampleEn: "My name is Samuel." },
        { es: "mi apellido", en: "my surname", exampleEs: "Mi apellido es Restrepo.", exampleEn: "My surname is Restrepo." },
        { es: "mi carnet de identidad", en: "my ID card", exampleEs: "¿Tienes mi carnet de identidad?", exampleEn: "Have you got my ID card?" },
      ] },
    { id: "gap-apellido", type: "gap", es: "Mi nombre es Samuel. Mi apellido es Restrepo.", en: "My name is Samuel. My surname is Restrepo.", blank: "Mi apellido", optionsEs: ["Mi nombre", "Mi apellido", "Mi carnet de identidad"] },
    { id: "fill-samuel", type: "idcard", titleEn: "Fill in Samuel's card", contextEn: "Tap the answer to each question.",
      cards: [{ photo: "samuel", number: "1 094 233 017", fields: [
        { qEs: Q.nombre, kind: "chips", optionsEs: ["Samuel", "Restrepo", "Salento"], valueEs: "Samuel" },
        { qEs: Q.apellido, kind: "chips", optionsEs: ["Max", "Restrepo", "Samuel"], valueEs: "Restrepo" }] }] },
    { id: "listen-mi", type: "listen", sayEs: "Mi nombre es Samuel. Mi apellido es Restrepo.", en: "My name is Samuel. My surname is Restrepo.",
      optionsEs: ["Mi nombre es Samuel. Mi apellido es Restrepo.", "Mi nombre es Valentina. Mi apellido es Restrepo.", "¿El nombre? Samuel. ¿El apellido? Restrepo.", "Tengo el carnet de identidad."], answer: 0 },
    { id: "tiles-valentina", type: "tiles", character: "valentina", en: "My surname is Restrepo.",
      answerEs: ["mi apellido", "es", "Restrepo"], tilesEs: ["mi apellido", "Restrepo", "es", "mi nombre", "Valentina"],
      fullEs: "Mi apellido es Restrepo." },
    { id: "type-apellido", type: "type", en: "the surname", answerEs: "el apellido" },
    { id: "pick-mi-carnet", type: "pick", character: "max-surprised", promptEs: "¿Tienes mi carnet de identidad?",
      options: ["Have you got my ID card?", "I have your ID card.", "Is that my name?", "Where is the map?"], answer: 0 },
    { id: "fill-valentina", type: "idcard", titleEn: "Fill in Valentina's card", contextEn: "Type the answers. Names start with a capital letter.",
      cards: [{ photo: "valentina", number: "1 094 233 018", fields: [
        { qEs: Q.nombre, kind: "text", valueEs: "Valentina" }, { qEs: Q.apellido, kind: "text", valueEs: "Restrepo" }] }] },
    { id: "match-16", type: "match", pairs: [
      { es: "el carnet de identidad", en: "the ID card" }, { es: "el nombre", en: "the name" }, { es: "el apellido", en: "the surname" },
      { es: "mi", en: "my" }, { es: "Mi nombre es Samuel.", en: "My name is Samuel." }] },
    { id: "type-mi-nombre", type: "type", en: "My name is Samuel.", answerEs: "Mi nombre es Samuel." },
    { id: "speak-mi", type: "speak", character: "valentina", es: "Mi nombre es Valentina. Mi apellido es Restrepo.", en: "My name is Valentina. My surname is Restrepo." },
  ],
};

const L17 = {
  ...common(17), id: "1.3-17", n: 17, kind: "learn",
  titleEs: "La amiga de Matilda", titleEn: "Matilda's friend",
  storyEn: "Matilda and Valentina are friends now, and so are Max and Samuel. Time to fill in a whole ID card.",
  canDoEn: "Now you can fill in a whole ID card: name, surname, age and place of birth.",
  xpBase: 10, learnedEs: ["la edad", "el amigo", "la amiga", "el lugar de nacimiento"],
  steps: [
    { id: "intro-amiga", type: "intro", character: "valentina", contextEn: "Valentina and Matilda are always together now:",
      es: "la amiga", en: "the friend (a girl)", exampleEs: "Valentina es la amiga de Matilda.", exampleEn: "Valentina is Matilda's friend." },
    { id: "intro-amigo", type: "intro", character: "samuel", contextEn: "And Samuel plays football with Max:",
      es: "el amigo", en: "the friend (a boy)", exampleEs: "Samuel es el amigo de Max.", exampleEn: "Samuel is Max's friend.",
      noteEn: "[[el amigo]] for a boy, [[la amiga]] for a girl, like [[famoso]] and [[famosa]]." },
    { id: "amigo-samuel", type: "choose", titleEn: "Amigo or amiga?", art: "samuel", promptEn: "Max's friend Samuel is…",
      optionsEs: ["el amigo", "la amiga"], answer: 0, answerEs: "Samuel es el amigo de Max.", answerEn: "Samuel is Max's friend." },
    { id: "amiga-valentina", type: "choose", titleEn: "Amigo or amiga?", art: "valentina", promptEn: "Matilda's friend Valentina is…",
      optionsEs: ["el amigo", "la amiga"], answer: 1, answerEs: "Valentina es la amiga de Matilda.", answerEn: "Valentina is Matilda's friend." },
    { id: "gap-amigo", type: "gap", es: "Samuel es el amigo de Max.", en: "Samuel is Max's friend.", blank: "el amigo", optionsEs: ["el amigo", "la amiga"] },
    { id: "intro-edad", type: "intro", idcard: { photo: "valentina", number: "1 094 233 018", fields: [{ qEs: Q.nombre, valueEs: "Valentina" }, { qEs: Q.edad, value: 12 }], highlight: 1 },
      contextEn: "A new line on the card:", es: "la edad", en: "the age", exampleEs: "¿La edad? Doce.", exampleEn: "Age? Twelve." },
    { id: "read-edad", type: "idcard", mode: "read", titleEn: "Read the ID card",
      card: { photo: "samuel", number: "1 094 233 017", fields: [{ qEs: Q.nombre, valueEs: "Samuel" }, { qEs: Q.apellido, valueEs: "Restrepo" }, { qEs: Q.edad, value: 13 }] },
      promptEn: "How old is Samuel?", optionsEs: ["Samuel tiene trece años.", "Samuel tiene tres años.", "Samuel tiene doce años."], answer: 0, answerEn: "Samuel is thirteen." },
    { id: "intro-lugar", type: "intro", idcard: { photo: "samuel", number: "1 094 233 017", fields: [{ qEs: Q.nombre, valueEs: "Samuel" }, { qEs: Q.lugar, valueEs: "Salento" }], highlight: 1 },
      contextEn: "And where Samuel was born:", es: "el lugar de nacimiento", en: "the place of birth", exampleEs: "El lugar de nacimiento de Samuel es Salento.", exampleEn: "Samuel's place of birth is Salento.",
      noteEn: "Word for word: “the place of birth”." },
    { id: "pick-max-lugar", type: "pick", character: "max", promptEs: "Mi lugar de nacimiento es Melbourne. Tengo trece años.",
      options: ["My place of birth is Melbourne. I'm thirteen.", "My friend is from Melbourne. He's thirteen.", "My name is Melbourne. I'm thirteen.", "My place of birth is Melbourne. I'm three."], answer: 0 },
    { id: "fill-samuel", type: "idcard", titleEn: "Fill in Samuel's card", contextEn: "Tap the answers. Write his age as a number.",
      cards: [{ photo: "samuel", number: "1 094 233 017", fields: [
        { qEs: Q.nombre, kind: "chips", optionsEs: ["Samuel", "Max", "Restrepo"], valueEs: "Samuel" },
        { qEs: Q.apellido, kind: "chips", optionsEs: ["Restrepo", "Salento", "Samuel"], valueEs: "Restrepo" },
        { qEs: Q.edad, kind: "digits", value: 13 },
        { qEs: Q.lugar, kind: "chips", optionsEs: ["Salento", "Melbourne", "Australia"], valueEs: "Salento" }] }] },
    { id: "listen-amiga", type: "listen", sayEs: "Mi amiga se llama Valentina.", en: "My friend's name is Valentina.",
      optionsEs: ["Mi amiga se llama Valentina.", "Mi amigo se llama Max.", "Valentina es la amiga de Matilda.", "Me llamo Valentina."], answer: 0 },
    { id: "tiles-amiga", type: "tiles", character: "matilda", en: "Valentina is Matilda's friend.",
      answerEs: ["Valentina", "es", "la amiga", "de", "Matilda"], tilesEs: ["la amiga", "Matilda", "es", "el amigo", "Valentina", "de"], fullEs: "Valentina es la amiga de Matilda." },
    { id: "type-edad", type: "type", en: "the age", answerEs: "la edad" },
    { id: "fill-matilda", type: "idcard", titleEn: "Fill in Matilda's card", contextEn: "Type the answers. Names start with a capital letter.",
      cards: [{ photo: "matilda", number: "AU 4 281 905", fields: [
        { qEs: Q.nombre, kind: "text", valueEs: "Matilda" }, { qEs: Q.edad, kind: "digits", value: 12 }, { qEs: Q.lugar, kind: "text", valueEs: "Melbourne" }] }] },
    { id: "match-17", type: "match", pairs: [
      { es: "la edad", en: "the age" }, { es: "el amigo", en: "the friend (boy)" }, { es: "la amiga", en: "the friend (girl)" },
      { es: "el lugar de nacimiento", en: "the place of birth" }, { es: "el apellido", en: "the surname" }] },
    { id: "type-mi-amigo", type: "type", en: "My friend's name is Max.", answerEs: "Mi amigo se llama Max." },
    { id: "speak-amiga", type: "speak", character: "matilda", es: "Valentina es la amiga de Matilda.", en: "Valentina is Matilda's friend." },
  ],
};

// L18: the story (content plan §6, 1.3 L18). Checks after lines 2 and 5, then Buhísimo's last lines in order.
export const STORY = {
  titleEn: "Max's ID card",
  sceneEn: "Max jumped a little too far in the Cocora valley, and his ID card fell out of his pouch.",
  scene: "salento-street", sceneAltEn: "A colourful street in Salento",
  cast: [
    { who: "samuel", nameEn: "Samuel", art: "samuel" },
    { who: "max", nameEn: "Max", art: "max-surprised" },
    { who: "matilda", nameEn: "Matilda", art: "matilda" },
    { who: "valentina", nameEn: "Valentina", art: "valentina" },
    { who: "buho", nameEn: "Buhísimo", art: "owl-explaining" },
  ],
  lines: [
    { who: "samuel", art: "samuel", actionEn: "Back in Salento after a day in the valley.", es: "Max, ¿tienes el carnet de identidad?", en: "Max, do you have your ID card?" },
    { who: "max", art: "max-surprised", actionEn: "Max looks in his pouch. Nothing!", es: "¿El carnet de identidad? … ¡Fatal!", en: "The ID card? … Oh no!" },
    { check: { titleEn: "What's Max's problem?", options: ["He can't find his ID card", "He has lost the map", "He's tired from jumping"], answer: 0, answerEn: "His ID card fell out of his pouch." } },
    { who: "matilda", art: "matilda", es: "Tengo el carnet de identidad. ¿Y tú, Max?", en: "I have my ID card. And you, Max?" },
    { who: "valentina", art: "valentina", es: "¿El mapa? ¿Tienes el mapa?", en: "The map? Do you have the map?" },
    { who: "buho", art: "owl-celebrating", actionEn: "Buhísimo flies in from the valley with something in his claws.", es: "¡Hola! Tengo el carnet de identidad de Max.", en: "Hi! I have Max's ID card." },
    { check: { titleEn: "Who has Max's ID card?", options: ["Buhísimo", "Valentina", "Matilda"], answer: 0, answerEn: "Buhísimo found it in the valley." } },
    { who: "buho", art: "owl-explaining", es: "El nombre: Max. ¿De dónde eres?", en: "Name: Max. Where are you from?" },
    { who: "max", art: "max", es: "Soy de Melbourne.", en: "I'm from Melbourne." },
    { who: "buho", art: "owl-thinking", es: "¿Cuántos años tienes?", en: "How old are you?" },
    { who: "max", art: "max-celebrate", es: "¡Trece!", en: "Thirteen!" },
    { who: "buho", art: "owl-celebrating", es: "¡Fenomenal! El carnet de identidad de Max.", en: "Great! Max's ID card." },
    { who: "max", art: "max-wave", es: "¡Gracias, Buhísimo!", en: "Thank you, Buhísimo!" },
  ],
};
// The last check (content plan): Buhísimo's three lines with Max, in order.
const BUHO_LINES = ["El nombre: Max. ¿De dónde eres?", "¿Cuántos años tienes?", "¡Fenomenal! El carnet de identidad de Max."];

const L18 = {
  ...common(18), id: "1.3-18", n: 18, kind: "story",
  titleEs: "El carnet de identidad de Max", titleEn: "Story: Max's ID card",
  storyEn: STORY.sceneEn, canDoEn: "You followed the whole story of Max's ID card in Spanish!",
  xpBase: 10, learnedEs: [], story: STORY,
  steps: [...buildStorySteps(STORY),
    { id: "s-order-buho", type: "tiles", lines: true, titleEn: "Put Buhísimo's three lines in order", en: "", answerEs: BUHO_LINES, tilesEs: [BUHO_LINES[2], BUHO_LINES[0], BUHO_LINES[1]] }],
};

const L19 = {
  ...common(19), id: "1.3-19", n: 19, kind: "listen",
  titleEn: "Radio Búho: three ID cards",
  storyEn: "Three callers phone Radio Búho and give their name, age and where they're from. Fill in their cards.",
  canDoEn: "You filled in three ID cards from Radio Búho on the first listen!",
  xpBase: 15, learnedEs: [],
  steps: [
    { id: "radio-cards", type: "idcard", episode: "1.3-19", titleEn: "Radio Búho: three ID cards", contextEn: "Fill in a card for each caller. Write the age as a number.",
      calls: [[1], [2, 3], [4]],
      cards: [
        { photo: "valentina", number: "1 094 233 018", fields: [
          { qEs: Q.nombre, kind: "chips", optionsEs: ["Valentina", "Matilda"], valueEs: "Valentina" },
          { qEs: Q.apellido, kind: "text", valueEs: "Restrepo" }, { qEs: Q.edad, kind: "digits", value: 12 },
          { qEs: Q.de, kind: "chips", optionsEs: ["Salento", "Australia"], valueEs: "Salento" }] },
        { photo: "samuel", number: "1 094 233 017", fields: [
          { qEs: Q.nombre, kind: "chips", optionsEs: ["Max", "Samuel"], valueEs: "Samuel" },
          { qEs: Q.apellido, kind: "text", valueEs: "Restrepo" }, { qEs: Q.edad, kind: "digits", value: 13 }] },
        { photo: "matilda", number: "AU 4 281 905", fields: [
          { qEs: Q.nombre, kind: "chips", optionsEs: ["Valentina", "Matilda"], valueEs: "Matilda" },
          { qEs: Q.edad, kind: "digits", value: 12 },
          { qEs: Q.de, kind: "chips", optionsEs: ["Salento", "Australia"], valueEs: "Australia" }] },
      ] },
    { id: "transcript-cards", type: "transcript", episode: "1.3-19", contextEn: "Listen again and read along. Tap a line to hear it; tap EN for the English." },
    { id: "pick-samuel-call", type: "pick", character: "samuel", promptEs: "Me llamo Samuel Restrepo. Trece.",
      options: ["My name is Samuel Restrepo. Thirteen.", "My name is Samuel Restrepo. Three.", "His name is Samuel Restrepo. He's thirteen.", "My friend is Samuel Restrepo."], answer: 0 },
    { id: "who-australia", type: "choose", titleEn: "Who is it?", promptEn: "Which caller is from Australia?", optionsArt: ART4.slice(0, 3), answer: 2,
      answerEs: "Me llamo Matilda. Soy de Australia. Doce.", answerEn: "My name is Matilda. I'm from Australia. Twelve." },
  ],
};

const L20 = {
  ...common(20), id: "1.3-20", n: 20, kind: "check",
  titleEn: "Unit check: the ID card office",
  storyEn: "Unit check at the ID card office in Salento: numbers to 31, ID cards, and introduce yourself as Max.",
  canDoEn: "Unit 1.3 done! You can count to 31, give names and ages, and fill in an ID card in Spanish.",
  xpBase: 20, learnedEs: [], check: true,
  steps: [
    { id: "c-dict-tens", type: "dictation", sayEs: "Diez, veinte, treinta.", en: "Ten, twenty, thirty.", answer: [10, 20, 30] },
    PICK("c-pick-27", 27, [26, 27, 17, 7], { lookalike: "veintiséis/veintisiete" }),
    PICK("c-pick-24", 24, [24, 25, 14, 4], { lookalike: "veinticuatro/veinticinco" }),
    { id: "c-dict-31", type: "dictation", sayEs: "Veintinueve, treinta, treinta y uno.", en: "Twenty-nine, thirty, thirty-one.", answer: [29, 30, 31] },
    { id: "c-card-samuel", type: "idcard", episode: "1.3-20", titleEn: "The ID card office", contextEn: "Samuel is at the office. Fill in his card from what he says.",
      calls: [[0, 1, 2]],
      cards: [{ photo: "samuel", number: "1 094 233 017", fields: [
        { qEs: Q.nombre, kind: "chips", optionsEs: ["Samuel", "Max", "Valentina"], valueEs: "Samuel" },
        { qEs: Q.de, kind: "chips", optionsEs: ["Colombia", "Australia", "Chile"], valueEs: "Colombia" },
        { qEs: Q.edad, kind: "digits", value: 13 }] }] },
    { id: "c-type-lugar", type: "type", en: "the place of birth", answerEs: "el lugar de nacimiento" },
    { id: "c-who-amigo", type: "choose", titleEn: "Who is it?", promptEs: "Samuel es el amigo de Matilda.", promptEn: "Who is Matilda's friend here?", optionsArt: ART4, answer: 1,
      answerEs: "Samuel es el amigo de Matilda.", answerEn: "Samuel is Matilda's friend." },
    { id: "c-gap-amigo", type: "gap", es: "Samuel es el amigo de Matilda.", en: "Samuel is Matilda's friend.", blank: "el amigo", optionsEs: ["el amigo", "la amiga"] },
    TYPE("c-type-31", 31),
    { id: "c-type-trece", type: "type", en: "How old are you? — Thirteen.", answerEs: "¿Cuántos años tienes? — Trece." },
    { id: "c-match", type: "match", pairs: [
      { es: "el nombre", en: "the name" }, { es: "el apellido", en: "the surname" }, { es: "la edad", en: "the age" },
      { es: "el carnet de identidad", en: "the ID card" }, { es: "mi", en: "my" }] },
    { id: "c-card-max", type: "idcard", titleEn: "Your card: you are Max", contextEn: "Fill in Max's card. Type the answers.",
      cards: [{ photo: "max", number: "AU 4 281 906", fields: [
        { qEs: Q.nombre, kind: "text", valueEs: "Max" }, { qEs: Q.edad, kind: "digits", value: 13 }, { qEs: Q.lugar, kind: "text", valueEs: "Melbourne" }] }] },
    { id: "c-tiles-max", type: "tiles", character: "max", en: "My name is Max. I'm thirteen.",
      answerEs: ["me llamo", "Max", "tengo", "trece años"], tilesEs: ["Max", "tengo", "tres", "trece años", "me llamo", "soy"],
      fullEs: "Me llamo Max. Tengo trece años." },
    { id: "c-type-max", type: "type", en: "My name is Max. I'm thirteen. I'm from Melbourne.", answerEs: "Me llamo Max. Tengo trece años. Soy de Melbourne." },
    { id: "c-speak", type: "speak", character: "max", es: "Me llamo Max. Tengo trece años. Soy de Melbourne.", en: "My name is Max. I'm thirteen. I'm from Melbourne." },
  ],
};

export const LESSONS = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20];
