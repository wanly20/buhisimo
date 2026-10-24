// Unit 1.2 «¿Qué tal?»: the whole path (13 lessons), following docs/content_plan_1.1-1.6.md §5,
// docs/build_plan_1.2.md and content/lessons_1.1-1.6.json.
//
// Spanish conventions are the same as unit-1-1.js (checked by tools/check_vocab.mjs):
//   * a key named `es`, or ending in `Es`, holds Spanish (a string, an array of strings,
//     or an array of objects whose `es` keys hold Spanish);
//   * English text may quote Spanish in [[double brackets]];
//   * `spell: true` on a step (or object) marks a spelling line: bare letter names (efe, eme)
//     are allowed there, and only there, once their letter group is taught.
// Every Spanish line is a sentence of content/sentences_1.1-1.6.json, a part of one, or a
// lesson item. The checker lists anything else.
// P13 (el abecedario) was rejected on 21 Oct 2026: the unit says el alfabeto only.
import { buildStorySteps } from "./unit-1-1.js";
import { lesson as lesson1 } from "./lesson-1-1.js";

// Praise in Spanish grows with what has been taught (Buhísimo says it): 1.1 had only his name.
const PRAISE = {
  early: ["¡Buhísimo!"],                                         // L1–L2
  bien: ["¡Bien!", "¡Buhísimo!"],                                 // from L3 (bien)
  full: ["¡Muy bien!", "¡Fenomenal!", "¡Fantástico!", "¡Buhísimo!"], // from L4 (muy, fenomenal, fantástico)
};
const common = (n) => ({
  unit: "1.2",
  sayAs: lesson1.sayAs,
  praiseEs: n >= 4 ? PRAISE.full : n === 3 ? PRAISE.bien : PRAISE.early,
  praiseEn: lesson1.praiseEn,
  encourageEn: lesson1.encourageEn,
  kindEn: lesson1.kindEn,
});

// ------------------------------------------------------------------ items
// Counted items of content/lessons_1.1-1.6.json (1.2), with English. Letter groups are items too
// (one per group); their names are only ever said while spelling, so Review asks for them
// with a letter pick, never as a bare word.
export const ITEMS = [
  // L2
  { id: "hola", unit: "1.2", es: "¡Hola!", en: "Hello! · Hi!", lesson: 2 },
  { id: "buenos-dias", unit: "1.2", es: "Buenos días", en: "Good morning", lesson: 2 },
  { id: "buenas-tardes", unit: "1.2", es: "Buenas tardes", en: "Good afternoon", lesson: 2 },
  { id: "adios", unit: "1.2", es: "¡Adiós!", en: "Goodbye!", lesson: 2 },
  { id: "hasta-luego", unit: "1.2", es: "¡Hasta luego!", en: "See you later!", lesson: 2 },
  // L3
  { id: "que-tal", unit: "1.2", es: "¿Qué tal?", en: "How's it going?", lesson: 3 },
  { id: "bien", unit: "1.2", es: "bien", en: "good · well", lesson: 3 },
  { id: "mal", unit: "1.2", es: "mal", en: "bad · not good", lesson: 3 },
  { id: "regular", unit: "1.2", es: "regular", en: "so-so", lesson: 3 },
  { id: "y-tu", unit: "1.2", es: "¿Y tú?", en: "And you?", lesson: 3 },
  // L4
  { id: "como-estas", unit: "1.2", es: "¿Cómo estás?", en: "How are you?", lesson: 4 },
  { id: "muy", unit: "1.2", es: "muy", en: "very", lesson: 4 },
  { id: "gracias", unit: "1.2", es: "gracias", en: "thank you", lesson: 4 },
  { id: "fatal", unit: "1.2", es: "fatal", en: "awful", lesson: 4 },
  { id: "fenomenal", unit: "1.2", es: "fenomenal", en: "great", lesson: 4 },
  { id: "fantastico", unit: "1.2", es: "fantástico", en: "fantastic", lesson: 4, formsEs: ["fantástico", "fantástica"] },
  // L6
  { id: "esta", unit: "1.2", es: "está", en: "is (how someone is)", lesson: 6 },
  // L9
  { id: "el-alfabeto", unit: "1.2", es: "el alfabeto", en: "the alphabet", lesson: 9 },
  { id: "como-se-escribe", unit: "1.2", es: "¿Cómo se escribe?", en: "How do you spell it?", lesson: 9 },
  { id: "letters-vowels", unit: "1.2", letters: [["A", "a"], ["E", "e"], ["I", "i"], ["O", "o"], ["U", "u"]], en: "the vowels: A E I O U", lesson: 9 },
  { id: "letters-e", unit: "1.2", letters: [["F", "efe"], ["L", "ele"], ["M", "eme"], ["N", "ene"], ["Ñ", "eñe"], ["S", "ese"], ["R", "erre"]], en: "F L M N Ñ S R", lesson: 9 },
  { id: "letters-jota", unit: "1.2", letters: [["J", "jota"]], en: "J", lesson: 9 },
  // L10
  { id: "escribir", unit: "1.2", es: "escribir", en: "to write", lesson: 10 },
  { id: "llamarse", unit: "1.2", es: "llamarse", en: "to be called", lesson: 10 },
  { id: "letters-be", unit: "1.2", letters: [["B", "be"], ["C", "ce"], ["D", "de"], ["G", "ge"], ["P", "pe"], ["T", "te"]], en: "B C D G P T", lesson: 10 },
  { id: "letters-hache", unit: "1.2", letters: [["H", "hache"]], en: "H", lesson: 10 },
  { id: "letters-cu", unit: "1.2", letters: [["Q", "cu"]], en: "Q", lesson: 10 },
  // L11: each rare letter is its own item
  { id: "letter-ka", unit: "1.2", letters: [["K", "ka"]], en: "K", lesson: 11 },
  { id: "letter-uve", unit: "1.2", letters: [["V", "uve"]], en: "V", lesson: 11 },
  { id: "letter-doble-ve", unit: "1.2", letters: [["W", "doble ve"]], en: "W", lesson: 11 },
  { id: "letter-equis", unit: "1.2", letters: [["X", "equis"]], en: "X", lesson: 11 },
  { id: "letter-ye", unit: "1.2", letters: [["Y", "ye"]], en: "Y", lesson: 11 },
  { id: "letter-zeta", unit: "1.2", letters: [["Z", "zeta"]], en: "Z", lesson: 11 },
];

const L = (l, n) => l.map(([letter, es]) => ({ l: letter, es, n }));
const LETTERS = Object.fromEntries(ITEMS.filter((it) => it.letters).map((it) => [it.id, L(it.letters, it.lesson)]));

// ------------------------------------------------------------------ Radio Búho episodes
// Played inside their lessons (call-in grid, then the transcript) and listed in the Radio tab
// once their lesson is open. Unrecorded lines are shown to read. Each caller has a voice of their
// own (`voice`, Juan 24 Oct 2026: a synthetic voice from their country where there is one).
export const RADIO = [
  { id: "1.2-8", lesson: "1.2-8", unit: "1.2", titleEs: "¡Hola, Buhísimo!", titleEn: "Radio Búho: how are the callers?",
    lines: [
      { who: "buho", es: "¡Buenas tardes! Soy Buhísimo. ¿Qué tal?", en: "Good afternoon! I'm Buhísimo. How's it going?" },
      { who: "caller", nameEn: "Caller 1", voice: "caller_argentina", es: "¡Hola, Buhísimo! Soy de Argentina. Muy bien, gracias.", en: "Hi, Buhísimo! I'm from Argentina. Very well, thanks." },
      { who: "caller", nameEn: "Caller 2", voice: "caller_cuba", es: "¡Hola! Soy de Cuba. Regular.", en: "Hi! I'm from Cuba. So-so." },
      { who: "caller", nameEn: "Caller 3", voice: "caller_espana", es: "Buenas tardes. Soy de España. ¡Fenomenal!", en: "Good afternoon. I'm from Spain. Great!" },
      { who: "caller", nameEn: "Caller 4", voice: "caller_peru", es: "¡Hola! Soy de Perú. Fatal.", en: "Hi! I'm from Peru. Awful." },
      { who: "buho", es: "¡Hasta luego, Argentina, Cuba, España, Perú!", en: "See you later, Argentina, Cuba, Spain, Peru!" },
    ] },
  { id: "1.2-12", lesson: "1.2-12", unit: "1.2", spell: true, titleEs: "¡El alfabeto!", titleEn: "Radio Búho: the spelling show",
    lines: [
      { who: "buho", clip: "A0", es: "¡Buenas tardes! Soy Buhísimo. ¡El alfabeto!", en: "Good afternoon! I'm Buhísimo. It's alphabet time!" },
      { who: "song", clip: "A5", es: "A, be, ce, de, e, efe, ge,", en: "A, B, C, D, E, F, G," },
      { who: "song", clip: "A5", es: "hache, i, jota, ka, ele, eme,", en: "H, I, J, K, L, M," },
      { who: "song", clip: "A5", es: "ene, eñe, o, pe, cu, erre,", en: "N, Ñ, O, P, Q, R," },
      { who: "song", clip: "A5", es: "ese, te, u, uve, doble ve,", en: "S, T, U, V, W," },
      { who: "song", clip: "A5", es: "equis, ye, zeta. ¡El alfabeto!", en: "X, Y, Z. The alphabet!" },
      { who: "caller", nameEn: "Caller 1", voice: "caller_chile", clip: "A6", es: "¡Hola, Buhísimo! Soy de Chile. Ce, hache, i, ele, e.", maskEs: "Chile", en: "Hi, Buhísimo! I'm from Chile. C, H, I, L, E." },
      { who: "caller", nameEn: "Caller 2", voice: "caller_neutral_f", clip: "A6", es: "¿Cómo se escribe Colombia? — Ce, o, ele, o, eme, be, i, a.", maskEs: "Colombia", en: "How do you spell Colombia? — C, O, L, O, M, B, I, A." },
      { who: "matilda", clip: "A6", es: "¿Cómo se escribe Melbourne? — Eme, e, ele, be, o, u, erre, ene, e.", maskEs: "Melbourne", en: "How do you spell Melbourne? — M, E, L, B, O, U, R, N, E." },
      { who: "max", clip: "A6", es: "¿Cómo se escribe Max? — ¡Eme, a, equis! ¡Fenomenal!", maskEs: "Max", en: "How do you spell Max? — M, A, X! Great!" },
      { who: "buho", clip: "A7", es: "¡Muy bien! ¡Fenomenal! ¡Hasta luego!", en: "Very good! Great! See you later!" },
    ] },
  { id: "1.2-13", lesson: "1.2-13", unit: "1.2", titleEn: "The plaza: how is everyone?", inTab: false,
    lines: [
      { who: "buho", es: "Matilda está regular.", en: "Matilda is so-so." },
      { who: "buho", es: "Max está fenomenal.", en: "Max is feeling great." },
      { who: "matilda", es: "¿Qué tal Buhísimo? — Está muy bien.", en: "How's Buhísimo? — He's very well." },
    ] },
];
const FACES4 = ["fenomenal", "muybien", "regular", "fatal"];

// ------------------------------------------------------------------ lessons
const L1 = {
  ...common(1), id: "1.2-1", n: 1, kind: "repaso",
  titleEs: "¿De dónde es Max?", titleEn: "Review: where is everyone from?",
  storyEn: "Before the greetings: everything from Unit 1.1, mixed up.",
  canDoEn: "Unit 1.1 is still fresh: countries, soy, eres, es, sí and no.",
  xpBase: 10, learnedEs: [],
  steps: [
    { id: "r-pick-max", type: "pick", character: "owl-thinking", promptEs: "¿De dónde es Max? — Es de Australia.",
      options: ["Where is Max from? — He's from Australia.", "Where are you from, Max? — I'm from Australia.", "Is Max from Australia? — Yes.", "Max is from Austria."], answer: 0 },
    { id: "r-listen-colombia", type: "listen", sayEs: "Él es de Colombia.", en: "He's from Colombia.",
      optionsEs: ["Él es de Colombia.", "Ella es de Colombia.", "Soy de Colombia.", "Él es de Chile."], answer: 0 },
    { id: "r-gap-eres", type: "gap", es: "Tú eres de Australia.", en: "You're from Australia.", blank: "eres", optionsEs: ["soy", "eres", "es"] },
    { id: "r-map-peru", type: "maptap", sayEs: "Él es de Perú.", en: "He's from Peru.", target: "pe", choices: ["pe", "cl", "ar", "co"] },
    { id: "r-yn", type: "choose", titleEn: "Sí or no?", character: "max", flag: "au", promptEs: "¿Max es de Chile?",
      optionsEs: ["sí", "no"], answer: 1, answerEs: "¿Max es de Chile? — No, es de Australia.", answerEn: "Is Max from Chile? — No, he's from Australia." },
    { id: "r-tiles-argentina", type: "tiles", character: "matilda", en: "She's from Argentina.",
      answerEs: ["ella", "es", "de", "Argentina"], tilesEs: ["Argentina", "él", "es", "soy", "ella", "de", "Chile"], fullEs: "Ella es de Argentina." },
    { id: "r-type-pais", type: "type", en: "the country", answerEs: "el país" },
    { id: "r-pick-lengua", type: "pick", character: "owl-explaining", promptEs: "La lengua de Perú es el español.",
      options: ["The language of Peru is Spanish.", "Peru is Spanish-speaking.", "Spanish is the language of Spain.", "The capital of Peru is famous."], answer: 0 },
    { id: "r-map-canarias", type: "maptap", sayEs: "Ella es de las Islas Canarias.", en: "She's from the Canary Islands.", target: "canarias", choices: ["canarias", "baleares", "es", "gq"] },
    { id: "r-type-soy", type: "type", en: "I'm from Australia.", answerEs: "Soy de Australia." },
    { id: "r-match", type: "match", pairs: [
      { es: "el país", en: "the country" }, { es: "el mundo", en: "the world" }, { es: "la capital", en: "the capital" },
      { es: "el destino", en: "the destination" }, { es: "hispanohablante", en: "Spanish-speaking" }] },
    { id: "r-speak", type: "speak", character: "matilda", es: "¿Eres de España? — No, soy de Australia.", en: "Are you from Spain? — No, I'm from Australia." },
  ],
};

const L2 = {
  ...common(2), id: "1.2-2", n: 2, kind: "learn",
  titleEs: "¡Hola!", titleEn: "Hello and goodbye",
  storyEn: "Morning in the plaza. By the afternoon the Cocora fog rolls in: time for buenas tardes.",
  canDoEn: "Now you can say hello and goodbye at the right time of day.",
  xpBase: 10, learnedEs: ["¡Hola!", "Buenos días", "Buenas tardes", "¡Adiós!", "¡Hasta luego!"],
  steps: [
    { id: "intro-hola", type: "intro", character: "max-wave", contextEn: "Max sees Matilda in the plaza:",
      es: "¡Hola!", en: "Hello! · Hi!", exampleEs: "¡Hola, Matilda!", exampleEn: "Hi, Matilda!",
      noteEn: "The h is silent in Spanish: [[hola]] sounds like “OH-la”." },
    { id: "pick-hola", type: "pick", character: "max", promptEs: "¡Hola, Matilda!",
      options: ["Hi, Matilda!", "Goodbye, Matilda!", "Good morning, Max!", "Where are you from, Matilda?"], answer: 0 },
    { id: "intro-buenos-dias", type: "intro", time: "morning", contextEn: "Early in Salento, the sun is just up:",
      es: "Buenos días", en: "Good morning", exampleEs: "Buenos días, Buhísimo.", exampleEn: "Good morning, Buhísimo.",
      noteEn: "Say [[Buenos días]] in the morning, until lunchtime." },
    { id: "scene-am", type: "choose", titleEn: "What do you say?", time: "morning", promptEn: "It's 8 in the morning. You meet Buhísimo.",
      optionsEs: ["Buenos días", "Buenas tardes"], answer: 0, answerEs: "Buenos días, Buhísimo.", answerEn: "Good morning, Buhísimo." },
    { id: "intro-buenas-tardes", type: "intro", time: "afternoon", contextEn: "After lunch the fog rolls into the valley:",
      es: "Buenas tardes", en: "Good afternoon", exampleEs: "Buenas tardes, Max.", exampleEn: "Good afternoon, Max.",
      noteEn: "After lunch: [[Buenas tardes]]. Look: [[Buenos días]] but [[Buenas tardes]], like [[famoso]] and [[famosa]]." },
    { id: "scene-pm", type: "choose", titleEn: "What do you say?", time: "afternoon", promptEn: "It's 3 in the afternoon. You meet Max.",
      optionsEs: ["Buenos días", "Buenas tardes"], answer: 1, answerEs: "Buenas tardes, Max.", answerEn: "Good afternoon, Max." },
    { id: "gap-buenas", type: "gap", es: "Buenas tardes, Max.", en: "Good afternoon, Max.", blank: "Buenas tardes", optionsEs: ["Buenos días", "Buenas tardes"] },
    { id: "intro-adios", type: "intro", character: "matilda-wave", contextEn: "Max is off to the next country on his map. Matilda says:",
      es: "¡Adiós!", en: "Goodbye!", exampleEs: "¡Adiós, Max!", exampleEn: "Goodbye, Max!" },
    { id: "intro-hasta-luego", type: "intro", character: "max-wave", contextEn: "Max will be back soon:",
      es: "¡Hasta luego!", en: "See you later!", exampleEs: "¡Hasta luego, Matilda!", exampleEn: "See you later, Matilda!",
      noteEn: "[[¡Adiós!]] is goodbye. [[¡Hasta luego!]] means you'll see them again soon." },
    { id: "sort-hello", type: "sort", titleEn: "Hello or goodbye?", bucketsEn: ["hello", "goodbye"],
      cards: [{ es: "¡Hola!", bucket: 0 }, { es: "¡Adiós!", bucket: 1 }, { es: "Buenos días", bucket: 0 }, { es: "¡Hasta luego!", bucket: 1 }, { es: "Buenas tardes", bucket: 0 }] },
    { id: "listen-tardes", type: "listen", sayEs: "Buenas tardes, Max.", en: "Good afternoon, Max.",
      optionsEs: ["Buenas tardes, Max.", "Buenos días, Buhísimo.", "¡Hasta luego, Matilda!", "¡Hola, Matilda!"], answer: 0 },
    { id: "tiles-hola-max", type: "tiles", character: "max", en: "Hi! I'm Max. I'm from Australia.",
      answerEs: ["hola", "soy", "Max", "soy", "de", "Australia"], tilesEs: ["soy", "Australia", "hola", "de", "Max", "soy", "adiós", "es"],
      fullEs: "¡Hola! Soy Max. Soy de Australia." },
    { id: "type-buenos-dias", type: "type", en: "Good morning", answerEs: "Buenos días" },
    { id: "match-2", type: "match", pairs: [
      { es: "¡Hola!", en: "Hi!" }, { es: "Buenos días", en: "Good morning" }, { es: "Buenas tardes", en: "Good afternoon" },
      { es: "¡Adiós!", en: "Goodbye!" }, { es: "¡Hasta luego!", en: "See you later!" }] },
    { id: "speak-hasta-luego", type: "speak", character: "max", es: "¡Hasta luego, Matilda!", en: "See you later, Matilda!" },
  ],
};

const L3 = {
  ...common(3), id: "1.2-3", n: 3, kind: "learn",
  titleEs: "¿Qué tal?", titleEn: "How's it going?",
  storyEn: "Buhísimo asks everyone in the plaza how they are.",
  canDoEn: "Now you can ask how someone is, and answer: bien, regular, mal.",
  xpBase: 10, learnedEs: ["¿Qué tal?", "bien", "regular", "mal", "¿Y tú?"],
  steps: [
    { id: "intro-que-tal", type: "intro", character: "owl-explaining", contextEn: "Buhísimo greets Max:",
      es: "¿Qué tal?", en: "How's it going?", exampleEs: "¡Hola, Max! ¿Qué tal?", exampleEn: "Hi, Max! How's it going?" },
    { id: "intro-bien", type: "intro", face: "bien", contextEn: "A good day:",
      es: "bien", en: "good · well", exampleEs: "¿Qué tal? — Bien. ¿Y tú?", exampleEn: "How's it going? — Good. And you?" },
    { id: "pick-que-tal", type: "pick", character: "owl-explaining", promptEs: "¡Hola, Max! ¿Qué tal?",
      options: ["Hi, Max! How's it going?", "Hi, Max! Where are you from?", "Goodbye, Max!", "Hi, Max! I'm fine."], answer: 0 },
    { id: "intro-regular", type: "intro", face: "regular", contextEn: "Matilda has just woken up:",
      es: "regular", en: "so-so", exampleEs: "Regular. ¿Y tú?", exampleEn: "So-so. And you?",
      noteEn: "Careful: [[regular]] looks like English “regular”, but it means so-so." },
    { id: "intro-mal", type: "intro", face: "mal", contextEn: "A bad day:",
      es: "mal", en: "bad · not good", exampleEs: "¿Qué tal, Matilda? — Mal.", exampleEn: "How's it going, Matilda? — Not good." },
    { id: "face-regular", type: "choose", titleEn: "Which face?", promptEs: "Regular.", sayEs: "Regular. ¿Y tú?",
      optionsFace: ["bien", "regular", "mal"], answer: 1, answerEs: "regular", answerEn: "so-so" },
    { id: "intro-y-tu", type: "intro", character: "matilda", contextEn: "Matilda answers, then asks back:",
      es: "¿Y tú?", en: "And you?", exampleEs: "Bien. ¿Y tú, Buhísimo?", exampleEn: "Good. And you, Buhísimo?",
      noteEn: "You know [[tú]] from Unit 1.1: you." },
    { id: "sort-feel", type: "sort", titleEn: "Good, so-so or bad?", bucketsEn: ["good", "so-so", "bad"],
      cards: [{ es: "bien", bucket: 0 }, { es: "regular", bucket: 1 }, { es: "mal", bucket: 2 }, { es: "Regular. ¿Y tú?", bucket: 1 }, { es: "¿Qué tal, Matilda? — Mal.", bucket: 2 }, { es: "¿Qué tal? — Bien. ¿Y tú?", bucket: 0 }] },
    { id: "listen-regular", type: "listen", sayEs: "Regular. ¿Y tú?", en: "So-so. And you?",
      optionsEs: ["Regular. ¿Y tú?", "Bien. ¿Y tú, Buhísimo?", "¿Qué tal, Matilda? — Mal.", "¡Hola, Max! ¿Qué tal?"], answer: 0 },
    { id: "tiles-que-tal", type: "tiles", character: "owl-explaining", en: "How's it going? — Good. And you?",
      answerEs: ["qué tal", "bien", "y tú"], tilesEs: ["bien", "y tú", "mal", "qué tal", "hola"], fullEs: "¿Qué tal? — Bien. ¿Y tú?" },
    { id: "type-regular", type: "type", en: "so-so", answerEs: "regular" },
    { id: "match-3", type: "match", pairs: [
      { es: "¿Qué tal?", en: "How's it going?" }, { es: "bien", en: "good" }, { es: "mal", en: "bad" },
      { es: "regular", en: "so-so" }, { es: "¿Y tú?", en: "And you?" }] },
    { id: "speak-que-tal", type: "speak", character: "matilda", es: "¿Qué tal? — Bien. ¿Y tú?", en: "How's it going? — Good. And you?" },
  ],
};

const L4 = {
  ...common(4), id: "1.2-4", n: 4, kind: "learn",
  titleEs: "¿Cómo estás?", titleEn: "How are you?",
  storyEn: "Max is up at 5 a.m. and feeling fantastic. Everyone else needs more words.",
  canDoEn: "Now you can say how you are, from fatal to fenomenal, and say thank you.",
  xpBase: 10, learnedEs: ["¿Cómo estás?", "muy", "gracias", "fatal", "fenomenal", "fantástico"],
  steps: [
    { id: "intro-como-estas", type: "intro", character: "owl-explaining", contextEn: "Another way to ask:",
      es: "¿Cómo estás?", en: "How are you?", exampleEs: "Buenos días, Matilda. ¿Cómo estás?", exampleEn: "Good morning, Matilda. How are you?",
      noteEn: "[[¿Qué tal?]] and [[¿Cómo estás?]] ask the same thing." },
    { id: "intro-fenomenal", type: "intro", face: "fenomenal", contextEn: "Max, at 5 in the morning:",
      es: "fenomenal", en: "great", exampleEs: "¡Fenomenal! ¿Y tú?", exampleEn: "Great! And you?" },
    { id: "intro-fantastico", type: "intro", character: "max-celebrate", contextEn: "And Max again:",
      es: "fantástico", en: "fantastic", exampleEs: "¡Fantástico, gracias!", exampleEn: "Fantastic, thanks!",
      noteEn: "Like [[famoso]] / [[famosa]]: [[fantástico]] for Max, [[fantástica]] for Matilda." },
    { id: "intro-fatal", type: "intro", face: "fatal", contextEn: "A really bad afternoon:",
      es: "fatal", en: "awful", exampleEs: "Buenas tardes. ¿Cómo estás? — Fatal.", exampleEn: "Good afternoon. How are you? — Awful.",
      noteEn: "Careful: [[fatal]] looks like English “fatal”, but it only means awful." },
    { id: "pick-fatal", type: "pick", character: "owl-thinking", promptEs: "Buenas tardes. ¿Cómo estás? — Fatal.",
      options: ["Good afternoon. How are you? — Awful.", "Good afternoon. How are you? — Great.", "Good morning. Where are you from? — Peru.", "Goodbye. See you later."], answer: 0 },
    { id: "intro-gracias", type: "intro", character: "matilda", contextEn: "Matilda is polite:",
      es: "gracias", en: "thank you", exampleEs: "¿Cómo estás? — Muy bien, gracias.", exampleEn: "How are you? — Very well, thank you.",
      noteEn: "[[muy]] = very. [[Muy bien]] = very well." },
    { id: "intro-muy", type: "intro", face: "mal", contextEn: "And on a bad day:",
      es: "muy", en: "very", exampleEs: "Muy mal.", exampleEn: "Very bad." },
    { id: "order-scale", type: "tiles", titleEn: "From worst to best", character: "owl-explaining", en: "awful → so-so → great",
      answerEs: ["fatal", "mal", "regular", "bien", "fenomenal"], tilesEs: ["bien", "fatal", "fenomenal", "regular", "mal"], fullEs: "fatal, mal, regular, bien, fenomenal" },
    { id: "face-fenomenal", type: "choose", titleEn: "Which face?", promptEs: "¡Fenomenal!", sayEs: "¡Fenomenal! ¿Y tú?",
      optionsFace: ["fenomenal", "regular", "mal", "fatal"], answer: 0, answerEs: "fenomenal", answerEn: "great" },
    { id: "gap-gracias", type: "gap", es: "¿Cómo estás? — Muy bien, gracias.", en: "How are you? — Very well, thank you.", blank: "gracias", optionsEs: ["gracias", "fatal", "tú"] },
    { id: "listen-fenomenal", type: "listen", sayEs: "¡Fenomenal! ¿Y tú?", en: "Great! And you?",
      optionsEs: ["¡Fenomenal! ¿Y tú?", "¡Fantástico, gracias!", "Regular. ¿Y tú?", "Muy mal."], answer: 0 },
    { id: "type-gracias", type: "type", en: "thank you", answerEs: "gracias" },
    { id: "match-4", type: "match", pairs: [
      { es: "¿Cómo estás?", en: "How are you?" }, { es: "gracias", en: "thank you" }, { es: "fatal", en: "awful" },
      { es: "fenomenal", en: "great" }, { es: "muy", en: "very" }] },
    { id: "speak-muy-bien", type: "speak", character: "matilda", es: "¿Cómo estás? — Muy bien, gracias.", en: "How are you? — Very well, thank you." },
  ],
};

const L5 = {
  ...common(5), id: "1.2-5", n: 5, kind: "practice",
  titleEs: "Hola, ¿qué tal?", titleEn: "Practice: little conversations",
  storyEn: "Whole little conversations: first the model, then you fill in more and more.",
  canDoEn: "You can hold a whole greeting conversation, both sides.",
  xpBase: 10, learnedEs: ["¡Hola! ¿Qué tal?", "Muy bien, gracias.", "¿Y tú?"],
  steps: [
    { id: "model-1", type: "intro", character: "owl-explaining", badgeEn: "Model", contextEn: "Buhísimo meets a friend:",
      es: "¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú?", en: "Hi! How's it going? — Very well, thanks. And you?" },
    { id: "gap-1", type: "gap", es: "¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú?", en: "Hi! How's it going? — Very well, thanks. And you?", blank: "tú", optionsEs: ["tú", "Max", "eres"] },
    { id: "tiles-1", type: "tiles", character: "matilda", en: "Hi! How's it going? — Very well, thanks. And you?",
      answerEs: ["hola", "qué tal", "muy", "bien", "gracias", "y tú"], tilesEs: ["gracias", "qué tal", "y tú", "bien", "muy", "hola", "mal", "adiós"],
      fullEs: "¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú?" },
    { id: "model-2", type: "intro", character: "max", badgeEn: "Model", contextEn: "Max meets a traveller:",
      es: "Buenas tardes. ¿De dónde eres? — Soy de Perú.", en: "Good afternoon. Where are you from? — I'm from Peru." },
    { id: "gap-2", type: "gap", es: "Buenas tardes. ¿De dónde eres? — Soy de Perú.", en: "Good afternoon. Where are you from? — I'm from Peru.", blank: "Buenas tardes", optionsEs: ["Buenos días", "Buenas tardes"] },
    { id: "reply", type: "choose", titleEn: "Pick the best answer", character: "owl-explaining", promptEs: "¿Cómo estás?",
      optionsEs: ["Muy bien, gracias.", "Soy de Perú.", "¡Adiós, Max!"], answer: 0, answerEs: "¿Cómo estás? — Muy bien, gracias.", answerEn: "How are you? — Very well, thank you." },
    { id: "tiles-bye", type: "tiles", character: "max", en: "See you later, Buhísimo! — Bye, Max!",
      answerEs: ["hasta luego", "Buhísimo", "adiós", "Max"], tilesEs: ["Max", "adiós", "hola", "Buhísimo", "hasta luego"],
      fullEs: "¡Hasta luego, Buhísimo! — ¡Adiós, Max!" },
    { id: "listen-matilda", type: "listen", sayEs: "¡Hola! Soy Matilda. Soy de Melbourne.", en: "Hi! I'm Matilda. I'm from Melbourne.",
      optionsEs: ["¡Hola! Soy Matilda. Soy de Melbourne.", "¡Hola! Soy Max. Soy de Australia.", "Buenas tardes. ¿De dónde eres? — Soy de Perú.", "¡Adiós, Max!"], answer: 0 },
    { id: "type-tardes", type: "type", en: "Good afternoon. Where are you from?", answerEs: "Buenas tardes. ¿De dónde eres?" },
    { id: "speak-a", type: "speak", character: "owl-explaining", es: "¡Hola! ¿Qué tal?", en: "Hi! How's it going?" },
    { id: "speak-b", type: "speak", character: "matilda", es: "Muy bien, gracias. ¿Y tú?", en: "Very well, thanks. And you?" },
  ],
};

const L6 = {
  ...common(6), id: "1.2-6", n: 6, kind: "learn",
  titleEs: "Max está fenomenal", titleEn: "Max is feeling great: es and está",
  storyEn: "Two kinds of “is”: where someone is from, and how they feel today.",
  canDoEn: "Now you can say how someone else is: Max está fenomenal.",
  xpBase: 10, learnedEs: ["está", "Max está fenomenal.", "Matilda está regular."],
  steps: [
    { id: "table-es-esta", type: "table", titleEn: "es or está?", contextEn: "Both mean “is”. They do different jobs.",
      rows: [
        { es: "es de", en: "is from (always)", exampleEs: "Max es de Australia.", exampleEn: "Max is from Australia." },
        { es: "está", en: "is (how they feel now)", exampleEs: "Max está fenomenal.", exampleEn: "Max is feeling great." },
      ],
      noteEn: "Max is always from Australia: [[es de]]. How he feels changes all day: [[está]]." },
    { id: "intro-esta", type: "intro", character: "matilda-thinking", contextEn: "Matilda, before her nap:",
      es: "Matilda está regular.", en: "Matilda is so-so." },
    { id: "gap-esta", type: "gap", es: "Matilda está regular.", en: "Matilda is so-so.", blank: "está", optionsEs: ["es", "está"] },
    { id: "gap-es", type: "gap", es: "Max es de Australia. Está fenomenal.", en: "Max is from Australia. He's feeling great.", blank: "es", optionsEs: ["es", "está"] },
    { id: "sort-es-esta", type: "sort", titleEn: "Where from, or how they feel?", bucketsEn: ["where from (es)", "how they feel (está)"],
      cards: [{ es: "Max es de Australia.", bucket: 0 }, { es: "Matilda está regular.", bucket: 1 }, { es: "Ella está bien, gracias.", bucket: 1 },
        { es: "Él es de Colombia.", bucket: 0 }, { es: "Max está fenomenal.", bucket: 1 }, { es: "Ella es de Melbourne.", bucket: 0 }] },
    { id: "pick-buho", type: "pick", character: "owl-celebrating", promptEs: "¿Qué tal Buhísimo? — Está muy bien.",
      options: ["How's Buhísimo? — He's very well.", "Where is Buhísimo from? — Salento.", "How are you? — Very well.", "Is Buhísimo from Colombia? — Yes."], answer: 0 },
    { id: "listen-ella", type: "listen", sayEs: "Ella está bien, gracias.", en: "She's fine, thanks.",
      optionsEs: ["Ella está bien, gracias.", "Ella es de Melbourne.", "Matilda está regular.", "Max está fenomenal."], answer: 0 },
    { id: "tiles-max", type: "tiles", character: "max-celebrate", en: "Max is feeling great.",
      answerEs: ["Max", "está", "fenomenal"], tilesEs: ["es", "fenomenal", "está", "Max", "de"], fullEs: "Max está fenomenal." },
    { id: "type-matilda", type: "type", en: "Matilda is so-so.", answerEs: "Matilda está regular." },
    { id: "match-6", type: "match", pairs: [
      { es: "está", en: "is (feeling)" }, { es: "es", en: "is" }, { es: "fenomenal", en: "great" },
      { es: "regular", en: "so-so" }, { es: "gracias", en: "thank you" }] },
    { id: "speak-max", type: "speak", character: "max", es: "Max es de Australia. Está fenomenal.", en: "Max is from Australia. He's feeling great." },
  ],
};

// L7: the story (content plan §5, 1.2 L7). Checks after lines 3, 6 and 10.
export const STORY = {
  titleEn: "Good morning, Salento",
  sceneEn: "The first morning in Salento, in the Cocora fog. Matilda the koala is sleepy; Max has been jumping since 5 a.m.",
  scene: "salento-street",
  cast: [
    { who: "buho", nameEn: "Buhísimo", art: "owl-explaining" },
    { who: "matilda", nameEn: "Matilda", art: "matilda-thinking" },
    { who: "max", nameEn: "Max", art: "max-jump" },
  ],
  lines: [
    { who: "buho", art: "owl-explaining", es: "¡Buenos días, Matilda! ¿Qué tal?", en: "Good morning, Matilda! How's it going?" },
    { who: "matilda", art: "matilda-thinking", actionEn: "Matilda yawns. Koalas are not morning people.", es: "Regular… ¿Y tú, Buhísimo?", en: "So-so… And you, Buhísimo?" },
    { who: "buho", art: "owl-celebrating", es: "¡Muy bien, gracias!", en: "Very well, thank you!" },
    { check: { titleEn: "How is Matilda this morning?", options: ["So-so", "Great", "Awful"], answer: 0, answerEn: "Regular: so-so. She's still sleepy." } },
    { who: "max", art: "max-jump", actionEn: "Max bounces into the plaza.", es: "¡Hola, Buhísimo! ¡Hola, Matilda!", en: "Hi, Buhísimo! Hi, Matilda!" },
    { who: "buho", art: "owl-explaining", es: "¿Cómo estás, Max?", en: "How are you, Max?" },
    { who: "max", art: "max-celebrate", es: "¡Fenomenal! ¡Fantástico! ¡Muy, muy bien!", en: "Great! Fantastic! Very, very good!" },
    { check: { titleEn: "How is Max?", options: ["Great", "So-so", "Not good"], answer: 0, answerEn: "Fenomenal, fantástico: great!" } },
    { who: "buho", art: "owl-explaining", es: "Max está fenomenal. Matilda está regular.", en: "Max is feeling great. Matilda is so-so." },
    { who: "matilda", art: "matilda-celebrate", actionEn: "The afternoon. Matilda has had a long koala nap.", es: "¡Buenas tardes! ¡Muy bien, gracias!", en: "Good afternoon! Very well, thank you!" },
    { who: "buho", art: "owl-thinking", es: "¿Y tú, Max? ¿Qué tal?", en: "And you, Max? How's it going?" },
    { who: "max", art: "max-surprised", actionEn: "Max has been jumping since 5 a.m.", es: "Mal… muy mal.", en: "Not good… really not good." },
    { check: { titleEn: "Why has everything changed?", options: ["Matilda slept; Max has been jumping since 5 a.m.", "It's raining in Salento", "Max lost his map"], answer: 0,
      answerEn: "Matilda had a nap, and Max is worn out from jumping all day." } },
    { who: "buho", art: "owl-celebrating", es: "¡Hasta luego, Max!", en: "See you later, Max!" },
    { order: { titleEn: "Put the last three lines in order", last: 3 } },
  ],
};

const L7 = {
  ...common(7), id: "1.2-7", n: 7, kind: "story",
  titleEs: "Buenos días, Salento", titleEn: "Story: good morning, Salento",
  storyEn: STORY.sceneEn, canDoEn: "You followed a whole day in Salento in Spanish!",
  xpBase: 10, learnedEs: [], story: STORY, steps: buildStorySteps(STORY),
};

const L8 = {
  ...common(8), id: "1.2-8", n: 8, kind: "listen",
  titleEs: "¡Hola, Buhísimo!", titleEn: "Radio Búho: how are the callers?",
  storyEn: "Buhísimo takes four calls from four countries. How is each caller?",
  canDoEn: "You understood four callers on Radio Búho!",
  xpBase: 15, learnedEs: [],
  steps: [
    { id: "radio-que-tal", type: "radio", episode: "1.2-8", mode: "faces", options: FACES4,
      titleEn: "Radio Búho: how is each caller?", contextEn: "Listen to the four calls. For each country, tap the face.",
      rows: [{ labelEn: "Argentina", line: 1, answer: "muybien" }, { labelEn: "Cuba", line: 2, answer: "regular" }, { labelEn: "Spain", line: 3, answer: "fenomenal" }, { labelEn: "Peru", line: 4, answer: "fatal" }] },
    { id: "transcript-que-tal", type: "transcript", episode: "1.2-8", contextEn: "Listen again and read along. Tap a line to hear it; tap EN for the English." },
    { id: "pick-cuba", type: "pick", character: "owl-thinking", promptEs: "¡Hola! Soy de Cuba. Regular.",
      options: ["Hi! I'm from Cuba. So-so.", "Hi! I'm from Cuba. Very well.", "Hi! She's from Cuba.", "Goodbye, Cuba!"], answer: 0 },
    { id: "who-fatal", type: "choose", titleEn: "Who is feeling awful?", character: "owl-encouraging", promptEn: "One caller says “Fatal”. Where is that caller from?",
      optionsEs: ["Argentina", "Cuba", "España", "Perú"], answer: 3, answerEs: "¡Hola! Soy de Perú. Fatal.", answerEn: "Hi! I'm from Peru. Awful." },
  ],
};

const L9 = {
  ...common(9), id: "1.2-9", n: 9, kind: "learn",
  titleEs: "El alfabeto: a, e, i, o, u", titleEn: "The alphabet: vowels and the e family",
  storyEn: "Buhísimo's spelling show starts with the vowels and the letters that all sound like “e + letter + e”.",
  canDoEn: "Now you can say the vowels and the e family, and spell short words.",
  xpBase: 10, learnedEs: ["el alfabeto", "¿Cómo se escribe?"],
  steps: [
    { id: "intro-alfabeto", type: "intro", character: "owl-explaining", contextEn: "Buhísimo has a new show on Radio Búho:",
      es: "el alfabeto", en: "the alphabet", exampleEs: "El alfabeto: a, e, i, o, u.", exampleEn: "The alphabet: A, E, I, O, U.", spell: true },
    { id: "letters-vowels", type: "letters", spell: true, titleEn: "The vowels", letters: LETTERS["letters-vowels"],
      noteEn: "Spanish vowels are short and always sound the same. Tap each letter to hear its name." },
    { id: "clip-a1", type: "clip", clip: "A1", spell: true, titleEn: "Chant along: the vowels", linesEs: ["A, e, i, o, u."], en: "A, E, I, O, U." },
    { id: "pick-o", type: "letterpick", spell: true, sayEs: "o", letters: ["O", "U", "A", "E"], answer: 0 },
    { id: "letters-e", type: "letters", spell: true, titleEn: "The e family", letters: [...LETTERS["letters-e"], ...LETTERS["letters-jota"]],
      noteEn: "Seven of them sound like “e + letter + e”: [[efe, ele, eme…]]. J is [[jota]], a breathy h sound. Look closely: M, N and Ñ." },
    { id: "clip-a2", type: "clip", clip: "A2", spell: true, titleEn: "Chant along: the e family", linesEs: ["Efe, ele, eme, ene, eñe, ese, erre.", "Jota, jota, jota."], en: "F, L, M, N, Ñ, S, R. J, J, J." },
    { id: "gap-a2", type: "gap", spell: true, es: "Efe, ele, eme, ene, eñe, ese, erre.", en: "F, L, M, N, Ñ, S, R.", blank: "eñe", optionsEs: ["eñe", "ene", "eme"] },
    { id: "pick-eme", type: "letterpick", spell: true, sayEs: "eme", letters: ["M", "N", "Ñ", "L"], answer: 0 },
    { id: "pick-ene", type: "letterpick", spell: true, sayEs: "eñe", letters: ["N", "Ñ", "M", "R"], answer: 1 },
    { id: "intro-como-se-escribe", type: "intro", character: "owl-explaining", contextEn: "The question of the show:",
      es: "¿Cómo se escribe?", en: "How do you spell it?", exampleEs: "¿Cómo se escribe «ella»? — E, ele, ele, a.", exampleEn: "How do you spell “ella”? — E, L, L, A." },
    { id: "tiles-mal", type: "tiles", spell: true, titleEn: "Spell it with letter names", character: "owl-thinking", en: "How do you spell “mal”?",
      answerEs: ["eme", "a", "ele"], tilesEs: ["ele", "eme", "ene", "a", "e"], fullEs: "¿Cómo se escribe «mal»? — Eme, a, ele." },
    { id: "spell-eres", type: "spell", spell: true, sayEs: "E, erre, e, ese.", answerEs: "eres", en: "a word from Unit 1.1 (you are)" },
    { id: "spell-fenomenal", type: "spell", spell: true, sayEs: "Efe, e, ene, o, eme, e, ene, a, ele.", answerEs: "fenomenal", en: "a word from this unit (great)" },
    { id: "match-9", type: "match", spell: true, pairs: [
      { es: "efe", en: "F" }, { es: "ele", en: "L" }, { es: "eme", en: "M" }, { es: "jota", en: "J" }, { es: "erre", en: "R" }] },
    { id: "speak-ella", type: "speak", character: "owl-explaining", es: "¿Cómo se escribe «ella»? — E, ele, ele, a.", en: "How do you spell “ella”? — E, L, L, A." },
  ],
};

const L10 = {
  ...common(10), id: "1.2-10", n: 10, kind: "learn",
  titleEs: "¿Cómo se escribe Matilda?", titleEn: "Spelling: B, C, D, G, P, T, H, Q",
  storyEn: "More letters, then spell the names from Unit 1.1, accents and all.",
  canDoEn: "Now you can spell names from Unit 1.1, and you know escribir and llamarse.",
  xpBase: 10, learnedEs: ["escribir", "llamarse"],
  steps: [
    { id: "letters-be", type: "letters", spell: true, titleEn: "Letter + e", letters: LETTERS["letters-be"],
      noteEn: "All of them: letter + e. In Colombia, C before e or i sounds like S. G before e or i sounds like [[jota]]." },
    { id: "clip-a3", type: "clip", clip: "A3", spell: true, titleEn: "Chant along: be, ce, de…", linesEs: ["Be, ce, de, ge, pe, te."], en: "B, C, D, G, P, T." },
    { id: "pick-ge", type: "letterpick", spell: true, sayEs: "ge", letters: ["G", "J", "C", "D"], answer: 0 },
    { id: "letters-hache-cu", type: "letters", spell: true, titleEn: "Two special letters", letters: [...LETTERS["letters-hache"], ...LETTERS["letters-cu"]],
      noteEn: "H is called [[hache]], but it's silent in words: [[hola]]. Q is [[cu]], and in Spanish words it always comes with u." },
    { id: "intro-hola-spelt", type: "intro", character: "owl-explaining", badgeEn: "How to spell it", contextEn: "Buhísimo spells a word you know:",
      es: "¿Cómo se escribe «hola»? — Hache, o, ele, a.", en: "How do you spell “hola”? — H, O, L, A." },
    { id: "spell-salento", type: "spell", spell: true, sayEs: "Ese, a, ele, e, ene, te, o.", answerEs: "Salento", en: "Buhísimo's town" },
    { id: "tiles-matilda", type: "tiles", spell: true, titleEn: "Spell it with letter names", character: "matilda", en: "How do you spell Matilda?",
      answerEs: ["eme", "a", "te", "i", "ele", "de", "a"], tilesEs: ["a", "ele", "te", "eme", "de", "i", "a", "ene", "be"],
      fullEs: "¿Cómo se escribe Matilda? — Eme, a, te, i, ele, de, a." },
    { id: "intro-escribir", type: "intro", character: "owl-explaining", contextEn: "The verb inside [[¿Cómo se escribe?]]:",
      es: "escribir", en: "to write", exampleEs: "¿Cómo se escribe «escribir»? — E, ese, ce, erre, i, be, i, erre.", exampleEn: "How do you spell “escribir” (to write)? — E, S, C, R, I, B, I, R." },
    { id: "intro-llamarse", type: "intro", spell: true, character: "matilda", contextEn: "A verb for names (more in Unit 1.3):",
      es: "llamarse", en: "to be called", exampleEs: "¿Cómo se escribe «llamarse»? — Ele, ele, a, eme, a, erre, ese, e.", exampleEn: "How do you spell “llamarse” (to be called)? — L, L, A, M, A, R, S, E.",
      noteEn: "LL is two letters when you spell: [[ele, ele]]." },
    { id: "spell-peru", type: "spell", spell: true, sayEs: "Pe, e, erre, u.", answerEs: "Perú", en: "a country (with an accent on the U)" },
    { id: "spell-buhisimo", type: "spell", spell: true, sayEs: "Be, u, hache, i, ese, i, eme, o.", answerEs: "Buhísimo", en: "our owl (an accent on the first I)" },
    { id: "pick-hache", type: "letterpick", spell: true, sayEs: "hache", letters: ["H", "J", "G", "C"], answer: 0 },
    { id: "pick-cuba", type: "pick", character: "owl-thinking", promptEs: "¿Cómo se escribe Cuba? — Ce, u, be, a.",
      options: ["How do you spell Cuba? — C, U, B, A.", "How do you spell Cuba? — Q, U, B, A.", "Where is Cuba?", "Is she from Cuba?"], answer: 0 },
    { id: "match-10", type: "match", spell: true, pairs: [
      { es: "be", en: "B" }, { es: "ce", en: "C" }, { es: "ge", en: "G" }, { es: "hache", en: "H" }, { es: "cu", en: "Q" }] },
    { id: "speak-hola", type: "speak", character: "owl-explaining", es: "¿Cómo se escribe «hola»? — Hache, o, ele, a.", en: "How do you spell “hola”? — H, O, L, A." },
  ],
};

const L11 = {
  ...common(11), id: "1.2-11", n: 11, kind: "learn",
  titleEs: "¿Cómo se escribe Max?", titleEn: "The rare letters: K, V, W, X, Y, Z",
  storyEn: "The last six letters. Max is very proud that his name has an X.",
  canDoEn: "Now you know the whole alphabet!",
  xpBase: 10, learnedEs: [],
  steps: [
    { id: "letters-rare", type: "letters", spell: true, titleEn: "The rare letters",
      letters: [...LETTERS["letter-ka"], ...LETTERS["letter-uve"], ...LETTERS["letter-doble-ve"], ...LETTERS["letter-equis"], ...LETTERS["letter-ye"], ...LETTERS["letter-zeta"]],
      noteEn: "Careful: [[uve]] (V) sounds just like [[be]] (B) in Spanish. Y is [[ye]]. In Colombia, Z ([[zeta]]) sounds like S." },
    { id: "clip-a4", type: "clip", clip: "A4", spell: true, titleEn: "Chant along: the rare letters", linesEs: ["Ka, uve, doble ve, equis, ye, zeta."], en: "K, V, W, X, Y, Z." },
    { id: "intro-max-spelt", type: "intro", character: "max-celebrate", badgeEn: "How to spell it", contextEn: "Max's favourite letter is in his name:",
      es: "¿Cómo se escribe Max? — Eme, a, equis.", en: "How do you spell Max? — M, A, X.", spell: true },
    { id: "pick-uve", type: "letterpick", spell: true, sayEs: "uve", letters: ["V", "B", "W", "U"], answer: 0 },
    { id: "pick-ye", type: "letterpick", spell: true, sayEs: "ye", letters: ["Y", "I", "J", "E"], answer: 0 },
    { id: "spell-soy", type: "spell", spell: true, sayEs: "Ese, o, ye.", answerEs: "soy", en: "a word from Unit 1.1 (I am)" },
    { id: "tiles-max", type: "tiles", spell: true, titleEn: "Spell it with letter names", character: "max", en: "How do you spell Max?",
      answerEs: ["eme", "a", "equis"], tilesEs: ["equis", "ene", "a", "eme", "ese", "ka"], fullEs: "¿Cómo se escribe Max? — Eme, a, equis." },
    { id: "pick-zeta", type: "letterpick", spell: true, sayEs: "zeta", letters: ["Z", "S", "C", "X"], answer: 0 },
    { id: "spell-muy", type: "spell", spell: true, sayEs: "Eme, u, ye.", answerEs: "muy", en: "a word from this unit (very)" },
    { id: "match-11", type: "match", spell: true, pairs: [
      { es: "ka", en: "K" }, { es: "uve", en: "V" }, { es: "doble ve", en: "W" }, { es: "equis", en: "X" }, { es: "zeta", en: "Z" }] },
    { id: "speak-soy", type: "speak", character: "owl-explaining", es: "¿Cómo se escribe «soy»? — Ese, o, ye.", en: "How do you spell “soy”? — S, O, Y." },
  ],
};

const L12 = {
  ...common(12), id: "1.2-12", n: 12, kind: "listen",
  titleEs: "¡El alfabeto!", titleEn: "Radio Búho: the spelling show",
  storyEn: "The whole alphabet song, then listeners phone in and spell their country or name.",
  canDoEn: "You sang the whole alphabet and wrote down every word the callers spelt!",
  xpBase: 15, learnedEs: [],
  steps: [
    { id: "radio-spelling", type: "radio", episode: "1.2-12", mode: "spell", spell: true,
      titleEn: "Radio Búho: the spelling show", contextEn: "Four callers spell a word. Write each word.",
      rows: [{ labelEn: "Caller 1", line: 6, answerEs: "Chile" }, { labelEn: "Caller 2", line: 7, answerEs: "Colombia" }, { labelEn: "Caller 3", line: 8, answerEs: "Melbourne" }, { labelEn: "Caller 4", line: 9, answerEs: "Max" }] },
    { id: "clip-a5", type: "clip", clip: "A5", spell: true, titleEn: "Sing the whole alphabet",
      linesEs: ["A, be, ce, de, e, efe, ge,", "hache, i, jota, ka, ele, eme,", "ene, eñe, o, pe, cu, erre,", "ese, te, u, uve, doble ve,", "equis, ye, zeta. ¡El alfabeto!"], en: "A to Z." },
    { id: "gap-a5", type: "gap", spell: true, es: "hache, i, jota, ka, ele, eme,", en: "H, I, J, K, L, M,", blank: "jota", optionsEs: ["jota", "ge", "ye"] },
    { id: "transcript-alfabeto", type: "transcript", episode: "1.2-12", contextEn: "The whole show. Tap a line to hear it; tap EN for the English." },
  ],
};

const L13 = {
  ...common(13), id: "1.2-13", n: 13, kind: "check",
  titleEn: "Unit check: the plaza",
  storyEn: "Unit check: a whole day in the plaza. Greet everyone at the right time, ask how they are, and spell.",
  canDoEn: "Unit 1.2 done! You can greet anyone, any time of day, ask how they are, and spell in Spanish.",
  xpBase: 20, learnedEs: [], check: true,
  steps: [
    { id: "c-scene-pm", type: "choose", titleEn: "What do you say?", time: "afternoon", promptEn: "It's 3 in the afternoon. You meet Max.",
      optionsEs: ["Buenos días", "Buenas tardes", "¡Adiós!"], answer: 1, answerEs: "Buenas tardes, Max.", answerEn: "Good afternoon, Max." },
    { id: "c-type-como-estas", type: "type", en: "How are you?", answerEs: "¿Cómo estás?" },
    { id: "c-listen-check", type: "listen", sayEs: "¡Hola! ¿Cómo estás? — Muy bien, gracias. ¿Y tú?", en: "Hi! How are you? — Very well, thank you. And you?",
      optionsEs: ["¡Hola! ¿Cómo estás? — Muy bien, gracias. ¿Y tú?", "¡Hola! ¿Qué tal? — Regular. ¿Y tú?", "Buenas tardes. ¿De dónde eres? — Soy de Perú.", "¡Adiós! ¡Hasta luego!"], answer: 0 },
    { id: "c-gap-esta", type: "gap", es: "Matilda está muy bien.", en: "Matilda is very well.", blank: "está", optionsEs: ["es", "está"] },
    { id: "c-radio", type: "radio", episode: "1.2-13", mode: "faces", options: FACES4,
      titleEn: "How is everyone?", contextEn: "Listen. Tap the face for each one.",
      rows: [{ labelEn: "Matilda", line: 0, answer: "regular" }, { labelEn: "Max", line: 1, answer: "fenomenal" }, { labelEn: "Buhísimo", line: 2, answer: "muybien" }] },
    { id: "c-pick-uve", type: "letterpick", spell: true, sayEs: "uve", letters: ["V", "B", "U", "Y"], answer: 0 },
    { id: "c-spell-espana", type: "spell", spell: true, sayEs: "E, ese, pe, a, eñe, a.", answerEs: "España", en: "a country" },
    { id: "c-type-gracias", type: "type", en: "Very well, thank you.", answerEs: "Muy bien, gracias." },
    { id: "c-face", type: "choose", titleEn: "Which face?", promptEs: "Fatal.", sayEs: "Fatal.",
      optionsFace: ["fenomenal", "bien", "regular", "fatal"], answer: 3, answerEs: "fatal", answerEn: "awful" },
    { id: "c-type-max", type: "type", en: "Max is from Australia. He's feeling great.", answerEs: "Max es de Australia. Está fenomenal." },
    { id: "c-match", type: "match", pairs: [
      { es: "¡Hasta luego!", en: "See you later!" }, { es: "¿Qué tal?", en: "How's it going?" }, { es: "regular", en: "so-so" },
      { es: "fenomenal", en: "great" }, { es: "el alfabeto", en: "the alphabet" }] },
    { id: "c-build", type: "tiles", time: "afternoon", titleEn: "Greet Max: it's the afternoon", character: "max", en: "Good afternoon, Max. How's it going?",
      answerEs: ["buenas tardes", "Max", "qué tal"], tilesEs: ["qué tal", "buenos días", "Max", "buenas tardes", "adiós"], fullEs: "Buenas tardes, Max. ¿Qué tal?" },
    { id: "c-speak", type: "speak", character: "owl-explaining", es: "Buenas tardes, Max. ¿Qué tal?", en: "Good afternoon, Max. How's it going?" },
  ],
};

export const LESSONS = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13];
