// Unit 1.1 "El español global": the whole path (11 lessons), following
// docs/content_plan_1.1-1.6.md §4 and content/lessons_1.1-1.6.json.
//
// Spanish conventions are the same as lesson-1-1.js (checked by tools/check_vocab.mjs):
//   * a key named `es`, or ending in `Es`, holds Spanish (a string, an array of strings,
//     or an array of objects whose `es` keys hold Spanish);
//   * English text may quote Spanish in [[double brackets]].
// Every Spanish line is a sentence from content/sentences_1.1-1.6.json, a part of one
// (one side of a "—" exchange, one sentence of two, or a word-bank tile), or a lesson
// item from content/lessons_1.1-1.6.json. The checker lists anything else.
// Lesson 1 lives in lesson-1-1.js (the original prototype lesson).
import { lesson as lesson1 } from "./lesson-1-1.js";

// Shared feedback text (1.1 praise in Spanish is Buhísimo's own name).
const common = {
  unit: "1.1",
  sayAs: lesson1.sayAs,
  praiseEs: lesson1.praiseEs,
  praiseEn: lesson1.praiseEn,
  encourageEn: lesson1.encourageEn,
  kindEn: lesson1.kindEn,
};

// ------------------------------------------------------------------ items
// Every counted item and name the unit introduces (lessons_1.1-1.6.json "new"), with
// its English (vocabulary_database.csv / helper_words.csv). Review uses the items;
// names are recognised, not recalled, so Review leaves them out.
export const ITEMS = [
  // L1
  { id: "de-donde-eres", es: "¿De dónde eres?", en: "Where are you from?", lesson: 1 },
  { id: "soy-de", es: "soy de", en: "I'm from", lesson: 1 },
  { id: "el", es: "él", en: "he", lesson: 1 },
  { id: "es", es: "es", en: "is · he is · she is", lesson: 1 },
  { id: "colombia", es: "Colombia", en: "Colombia", lesson: 1, map: "co" },
  { id: "espana", es: "España", en: "Spain", lesson: 1, map: "es" },
  // L2
  { id: "ella", es: "ella", en: "she", lesson: 2 },
  { id: "de-donde-es", es: "¿De dónde es?", en: "Where is he/she from?", lesson: 2 },
  { id: "el-pais", es: "el país", en: "the country", lesson: 2 },
  { id: "argentina", es: "Argentina", en: "Argentina", lesson: 2, map: "ar" },
  { id: "chile", es: "Chile", en: "Chile", lesson: 2, map: "cl" },
  { id: "peru", es: "Perú", en: "Peru", lesson: 2, map: "pe" },
  // L3
  { id: "tu", es: "tú", en: "you", lesson: 3 },
  { id: "eres", es: "eres", en: "you are", lesson: 3 },
  { id: "cuba", es: "Cuba", en: "Cuba", lesson: 3, map: "cu" },
  { id: "estados-unidos", es: "Estados Unidos", en: "the United States", lesson: 3, map: "us" },
  { id: "republica-dominicana", es: "República Dominicana", en: "the Dominican Republic", lesson: 3, map: "do" },
  // L4
  { id: "si", es: "sí", en: "yes", lesson: 4 },
  { id: "no", es: "no", en: "no · not", lesson: 4 },
  // L6
  { id: "el-mundo", es: "el mundo", en: "the world", lesson: 6, art: "noun-mundo" },
  { id: "el-mapa", es: "el mapa", en: "the map", lesson: 6, art: "noun-mapa" },
  { id: "hispanohablante", es: "hispanohablante", en: "Spanish-speaking", lesson: 6, map: "hispanic" },
  { id: "guinea-ecuatorial", es: "Guinea Ecuatorial", en: "Equatorial Guinea", lesson: 6, map: "gq" },
  { id: "la-lengua", es: "la lengua", en: "the language", lesson: 6 },
  { id: "el-espanol", es: "el español", en: "Spanish (the language)", lesson: 6 },
  // L7
  { id: "isla-de-pascua", es: "la Isla de Pascua", en: "Easter Island", lesson: 7, map: "pascua" },
  { id: "islas-canarias", es: "las Islas Canarias", en: "the Canary Islands", lesson: 7, map: "canarias" },
  { id: "islas-baleares", es: "las Islas Baleares", en: "the Balearic Islands", lesson: 7, map: "baleares" },
  { id: "islas-filipinas", es: "las Islas Filipinas", en: "the Philippines", lesson: 7, map: "ph" },
  { id: "el-destino", es: "el destino", en: "the destination", lesson: 7 },
  // L8
  { id: "famoso", es: "famoso", en: "famous", lesson: 8, formsEs: ["famoso", "famosa"] },
  { id: "historico", es: "histórico", en: "historic", lesson: 8, formsEs: ["histórico", "histórica"] },
  { id: "el-monumento", es: "el monumento", en: "the monument", lesson: 8, art: "noun-monumento" },
  { id: "la-capital", es: "la capital", en: "the capital", lesson: 8, art: "noun-capital" },
];

// ------------------------------------------------------------------ lessons 2–11
const L2 = {
  ...common,
  id: "1.1-2", n: 2, kind: "learn",
  titleEs: "¿De dónde es?",
  titleEn: "Where is he/she from?",
  storyEn: "Tourists cross the plaza in Salento. Max asks Buhísimo where each one is from.",
  canDoEn: "Now you can ask where someone else is from, and say “she” and “he”.",
  xpBase: 10,
  learnedEs: ["¿De dónde es?", "ella", "el país", "Argentina", "Chile", "Perú"],
  steps: [
    { id: "intro-donde-es", type: "intro", character: "max", contextEn: "Max asks Buhísimo about Matilda:",
      es: "¿De dónde es?", en: "Where is he/she from?",
      exampleEs: "¿De dónde es Matilda?", exampleEn: "Where is Matilda from?",
      noteEn: "[[¿De dónde es…?]] asks about someone else. [[¿De dónde eres?]] asks “you”." },
    { id: "intro-ella", type: "intro", character: "matilda", speaker: "owl", flag: "au", contextEn: "Buhísimo points at Matilda:",
      es: "Ella es de Melbourne.", en: "She's from Melbourne.",
      noteEn: "[[ella]] = she · [[él]] = he" },
    { id: "pick-donde-es", type: "pick", character: "max", promptEs: "¿De dónde es Matilda?",
      options: ["Where is Matilda from?", "Where are you from?", "Matilda is from Melbourne.", "Where is Max from?"], answer: 0 },
    { id: "who-el", type: "choose", titleEn: "Who is it?", promptEs: "Él es de Salento.", promptEn: "He's from Salento.",
      optionsArt: [{ art: "owl-explaining", labelEn: "Buhísimo" }, { art: "matilda", labelEn: "Matilda" }], answer: 0,
      answerEs: "Él es de Salento.", answerEn: "He's from Salento. Buhísimo is from Salento!" },
    { id: "intro-pais", type: "intro", character: "owl-explaining", flag: "co", contextEn: "Buhísimo is proud of his country:",
      es: "el país", en: "the country",
      exampleEs: "Colombia es el país de Buhísimo.", exampleEn: "Colombia is Buhísimo's country.",
      noteEn: "Always learn the little word too: [[el país]]." },
    { id: "listen-pais", type: "listen", sayEs: "Colombia es el país de Buhísimo.", en: "Colombia is Buhísimo's country.",
      optionsEs: ["Colombia es el país de Buhísimo.", "Australia es el país de Matilda.", "Él es de Colombia.", "¿El país de Max? Australia."], answer: 0 },
    { id: "intro-argentina", type: "intro", map: "ar", contextEn: "A new country on Max's map:", es: "Argentina", en: "Argentina" },
    { id: "map-argentina", type: "maptap", sayEs: "Ella es de Argentina.", en: "She's from Argentina.", target: "ar", choices: ["ar", "cl", "co"] },
    { id: "intro-chile", type: "intro", map: "cl", contextEn: "Next door to Argentina:", es: "Chile", en: "Chile",
      noteEn: "Chile is long and thin: about 4,300 km from top to bottom!" },
    { id: "intro-peru", type: "intro", map: "pe", contextEn: "And one more:", es: "Perú", en: "Peru",
      noteEn: "Watch the accent: [[Perú]]." },
    { id: "study-l2", type: "mapstudy", places: ["co", "pe", "cl", "ar"], contextEn: "Four countries side by side. Tap each one to hear it. Then find them on a map without names." },
    { id: "map-chile", type: "maptap", sayEs: "Él es de Chile.", en: "He's from Chile.", target: "cl", choices: ["cl", "ar", "pe"] },
    { id: "tiles-argentina", type: "tiles", character: "matilda", en: "She's from Argentina.",
      answerEs: ["ella", "es", "de", "Argentina"], tilesEs: ["Argentina", "él", "es", "soy", "ella", "de", "Chile"], fullEs: "Ella es de Argentina." },
    { id: "map-peru", type: "maptap", sayEs: "¿De dónde es? — Es de Perú.", en: "Where is he/she from? — He's/She's from Peru.", target: "pe", choices: ["pe", "cl", "co"] },
    { id: "type-pais", type: "type", en: "the country", answerEs: "el país" },
    { id: "pick-max", type: "pick", character: "owl-explaining", promptEs: "Max es de Australia.",
      options: ["Max is from Australia.", "Max is from Austria.", "Matilda is from Australia.", "I'm from Australia."], answer: 0 },
    { id: "tiles-pais-matilda", type: "tiles", character: "matilda", en: "Australia is Matilda's country.",
      answerEs: ["Australia", "es", "el país", "de", "Matilda"], tilesEs: ["el país", "Matilda", "soy", "Australia", "de", "es", "ella"], fullEs: "Australia es el país de Matilda." },
    { id: "match-2", type: "match", pairs: [
      { es: "ella", en: "she" }, { es: "él", en: "he" }, { es: "el país", en: "the country" },
      { es: "¿De dónde es?", en: "Where is he/she from?" }, { es: "Perú", en: "Peru" }] },
    { id: "speak-donde-es", type: "speak", character: "max", es: "¿De dónde es Matilda?", en: "Where is Matilda from?" },
  ],
};

const L3 = {
  ...common,
  id: "1.1-3", n: 3, kind: "learn",
  titleEs: "Tú eres…",
  titleEn: "You are…",
  storyEn: "Buhísimo plays a guessing game in the plaza: “Tú eres… Matilda!”",
  canDoEn: "Now you can tell soy, eres and es apart, and name three more countries.",
  xpBase: 10,
  learnedEs: ["tú", "eres", "Cuba", "Estados Unidos", "República Dominicana"],
  steps: [
    { id: "table-ser", type: "table", titleEn: "I am, you are, he/she is",
      contextEn: "One verb, three people. You already know two of them!",
      rows: [
        { es: "soy", en: "I am", exampleEs: "Soy de Colombia.", exampleEn: "I'm from Colombia." },
        { es: "eres", en: "you are", exampleEs: "Tú eres de Australia.", exampleEn: "You're from Australia." },
        { es: "es", en: "he is · she is", exampleEs: "Ella es de Melbourne.", exampleEn: "She's from Melbourne." },
      ],
      noteEn: "[[eres]] was hiding inside [[¿De dónde eres?]]: “Where are you from?”" },
    { id: "intro-tu", type: "intro", character: "owl-explaining", contextEn: "Buhísimo's guessing game:",
      es: "Soy Buhísimo. Tú eres Matilda.", en: "I'm Buhísimo. You're Matilda.",
      noteEn: "[[tú]] = you (one friend). The accent matters: [[tú]]." },
    { id: "intro-tu-eres", type: "intro", character: "owl-explaining", contextEn: "Then he turns to Matilda:",
      es: "Tú eres de Australia.", en: "You're from Australia.", flag: "au" },
    { id: "gap-eres", type: "gap", es: "Tú eres de Australia.", en: "You're from Australia.", blank: "eres", optionsEs: ["soy", "eres", "es"] },
    { id: "sort-ser", type: "sort", titleEn: "Who is it about?", bucketsEn: ["me (soy)", "you (eres)", "him or her (es)"],
      cards: [
        { es: "Soy de Colombia.", bucket: 0 }, { es: "Tú eres de Australia.", bucket: 1 }, { es: "Él es de Colombia.", bucket: 2 },
        { es: "Ella es de Melbourne.", bucket: 2 }, { es: "¿De dónde eres?", bucket: 1 }, { es: "Soy de Australia.", bucket: 0 }] },
    { id: "intro-cuba", type: "intro", map: "cu", contextEn: "An island in the Caribbean:", es: "Cuba", en: "Cuba" },
    { id: "map-cuba", type: "maptap", sayEs: "Ella es de Cuba.", en: "She's from Cuba.", target: "cu", choices: ["cu", "do", "co"] },
    { id: "intro-eeuu", type: "intro", map: "us", contextEn: "Millions of people speak Spanish here:", es: "Estados Unidos", en: "the United States" },
    { id: "intro-rd", type: "intro", map: "do", contextEn: "Cuba's neighbour in the Caribbean:", es: "República Dominicana", en: "the Dominican Republic",
      noteEn: "Watch the accent: [[República Dominicana]]." },
    { id: "study-l3", type: "mapstudy", places: ["us", "cu", "do", "co"], contextEn: "Cuba and its neighbours. Tap each place to hear it. Then find them on a map without names." },
    { id: "map-eeuu", type: "maptap", sayEs: "Él es de Estados Unidos.", en: "He's from the United States.", target: "us", choices: ["us", "cu", "do"] },
    { id: "map-rd", type: "maptap", sayEs: "Ella es de República Dominicana.", en: "She's from the Dominican Republic.", target: "do", choices: ["do", "cu", "co"] },
    { id: "gap-es", type: "gap", es: "Ella es de Cuba.", en: "She's from Cuba.", blank: "es", optionsEs: ["soy", "eres", "es"] },
    { id: "choose-tu", type: "choose", titleEn: "Which one means this?", promptEn: "You're from Australia.", character: "owl-explaining",
      optionsEs: ["Tú eres de Australia.", "Soy de Australia.", "Max es de Australia.", "Matilda es de Melbourne."], answer: 0 },
    { id: "type-rd", type: "type", en: "the Dominican Republic", answerEs: "República Dominicana" },
    { id: "tiles-eeuu", type: "tiles", character: "max", en: "He's from the United States.",
      answerEs: ["él", "es", "de", "Estados Unidos"], tilesEs: ["Estados Unidos", "eres", "él", "de", "tú", "es", "Cuba"], fullEs: "Él es de Estados Unidos." },
    { id: "match-3", type: "match", pairs: [
      { es: "tú", en: "you" }, { es: "eres", en: "you are" }, { es: "soy", en: "I am" },
      { es: "Estados Unidos", en: "the United States" }, { es: "República Dominicana", en: "the Dominican Republic" }] },
    { id: "pick-peru", type: "pick", character: "owl-thinking", promptEs: "¿De dónde es? — Es de Perú.",
      options: ["Where is he from? — He's from Peru.", "Where are you from? — I'm from Peru.", "Is he from Peru? — Yes.", "Where is Peru?"], answer: 0 },
    { id: "speak-tu", type: "speak", character: "owl-explaining", es: "Tú eres de Australia.", en: "You're from Australia." },
  ],
};

const L4 = {
  ...common,
  id: "1.1-4", n: 4, kind: "learn",
  // Titles use only words the lesson has taught (decision 2026-10-21): not «¿Sí o no?» (o is 1.5).
  titleEs: "¿Sí? ¿No?",
  titleEn: "Yes or no?",
  storyEn: "Max and Matilda quiz each other: is it sí or no?",
  canDoEn: "Now you can answer yes/no questions, and say what you're not.",
  xpBase: 10,
  learnedEs: ["sí", "no"],
  steps: [
    { id: "intro-si", type: "intro", character: "matilda", flag: "au", contextEn: "Max asks about Matilda. The answer:",
      es: "¿Matilda es de Australia? — Sí.", en: "Is Matilda from Australia? — Yes.",
      noteEn: "[[sí]] = yes. It always has an accent." },
    { id: "intro-no", type: "intro", character: "max", flag: "au", contextEn: "Now a question about Max:",
      es: "¿Max es de Chile? — No, es de Australia.", en: "Is Max from Chile? — No, he's from Australia.",
      noteEn: "[[no]] = no. Same word, same meaning!" },
    { id: "yn-max", type: "choose", titleEn: "Sí or no?", character: "max", flag: "au", promptEs: "¿Max es de Chile?",
      optionsEs: ["sí", "no"], answer: 1, answerEs: "¿Max es de Chile? — No, es de Australia.", answerEn: "Is Max from Chile? — No, he's from Australia." },
    { id: "yn-matilda", type: "choose", titleEn: "Sí or no?", character: "matilda", flag: "au", promptEs: "¿Matilda es de Australia?",
      optionsEs: ["sí", "no"], answer: 0, answerEs: "¿Matilda es de Australia? — Sí.", answerEn: "Is Matilda from Australia? — Yes." },
    { id: "intro-no-soy", type: "intro", character: "matilda", flag: "au", contextEn: "Max guesses wrong. Matilda answers:",
      es: "No, no soy de España.", en: "No, I'm not from Spain.",
      noteEn: "The first [[no]] answers the question. The second [[no]] means “not” and goes right before [[soy]]." },
    { id: "tiles-no-soy", type: "tiles", character: "matilda", en: "No, I'm not from Spain.",
      answerEs: ["no", "no", "soy", "de", "España"], tilesEs: ["soy", "no", "sí", "España", "de", "no", "eres"], fullEs: "No, no soy de España." },
    { id: "intro-eres-de", type: "intro", character: "matilda", flag: "au", contextEn: "A question and its answer:",
      es: "¿Eres de España? — No, soy de Australia.", en: "Are you from Spain? — No, I'm from Australia.",
      noteEn: "[[¿Eres de…?]] = Are you from…? The question is just the sentence with ¿…?" },
    { id: "yn-buho", type: "choose", titleEn: "Sí or no?", character: "owl-explaining", flag: "co", promptEs: "¿Él es de Colombia?",
      optionsEs: ["sí", "no"], answer: 0, answerEs: "¿Él es de Colombia? — Sí, es de Salento.", answerEn: "Is he from Colombia? — Yes, he's from Salento." },
    { id: "pick-peru", type: "pick", character: "max", promptEs: "¿Eres de Perú? — Sí, soy de Perú.",
      options: ["Are you from Peru? — Yes, I'm from Peru.", "Is he from Peru? — No, he's from Chile.", "Where are you from? — I'm from Peru.", "Are you from Peru? — No, I'm not."], answer: 0 },
    { id: "gap-no", type: "gap", es: "¿Eres de España? — No, soy de Australia.", en: "Are you from Spain? — No, I'm from Australia.", blank: "No", optionsEs: ["Sí", "No"] },
    { id: "listen-colombia", type: "listen", sayEs: "Él es de Colombia.", en: "He's from Colombia.",
      optionsEs: ["Él es de Colombia.", "¿Él es de Colombia? — Sí, es de Salento.", "Soy de Colombia.", "No, no soy de España."], answer: 0 },
    { id: "type-si", type: "type", en: "yes", answerEs: "sí" },
    { id: "match-4", type: "match", pairs: [
      { es: "sí", en: "yes" }, { es: "no", en: "no" }, { es: "tú", en: "you" },
      { es: "ella", en: "she" }, { es: "¿De dónde eres?", en: "Where are you from?" }] },
    { id: "speak-no", type: "speak", character: "matilda", es: "¿Eres de España? — No, soy de Australia.", en: "Are you from Spain? — No, I'm from Australia." },
  ],
};

const L5 = {
  ...common,
  id: "1.1-5", n: 5, kind: "practice",
  titleEs: "Soy, eres, es",
  titleEn: "I am, you are, he/she is",
  storyEn: "Practice: soy, eres and es with every country so far.",
  canDoEn: "Soy, eres, es: you're choosing the right one every time.",
  xpBase: 10,
  learnedEs: ["soy", "eres", "es"],
  steps: [
    { id: "model-max", type: "intro", character: "max", flag: "au", badgeEn: "Model", contextEn: "Max is asked, and answers:",
      es: "¿De dónde eres, Max? — Soy de Melbourne.", en: "Where are you from, Max? — I'm from Melbourne." },
    { id: "gap-soy", type: "gap", es: "¿De dónde eres, Max? — Soy de Melbourne.", en: "Where are you from, Max? — I'm from Melbourne.", blank: "Soy", optionsEs: ["Soy", "Eres", "Es"] },
    { id: "sort-ser", type: "sort", titleEn: "Who is it about?", bucketsEn: ["me (soy)", "you (eres)", "him or her (es)"],
      cards: [
        { es: "Soy de Chile.", bucket: 0 }, { es: "Eres de Perú.", bucket: 1 }, { es: "Es de Cuba.", bucket: 2 },
        { es: "Soy de Melbourne.", bucket: 0 }, { es: "¿De dónde eres, Max?", bucket: 1 }, { es: "Matilda es de Australia.", bucket: 2 }] },
    { id: "listen-soy", type: "listen", sayEs: "Soy de Australia.", en: "I'm from Australia.",
      optionsEs: ["Soy de Australia.", "Max es de Australia.", "Soy de Colombia.", "Él es de Colombia."], answer: 0 },
    { id: "tiles-ella", type: "tiles", character: "owl-explaining", en: "Where is she from? — She's from Argentina.",
      answerEs: ["de dónde es", "ella", "es", "de", "Argentina"], tilesEs: ["es", "ella", "de dónde es", "Argentina", "de", "de dónde eres", "él", "Chile"],
      fullEs: "¿De dónde es ella? — Es de Argentina." },
    { id: "type-chile", type: "type", en: "I'm from Chile.", answerEs: "Soy de Chile." },
    { id: "listen-max", type: "listen", sayEs: "Max es de Australia.", en: "Max is from Australia.",
      optionsEs: ["Max es de Australia.", "Soy de Australia.", "Matilda es de Melbourne.", "Soy de Colombia."], answer: 0 },
    { id: "gap-rd", type: "gap", es: "¿Eres de Cuba? — No, soy de República Dominicana.", en: "Are you from Cuba? — No, I'm from the Dominican Republic.", blank: "soy", optionsEs: ["soy", "eres", "es"] },
    { id: "pick-two", type: "pick", character: "owl-thinking", promptEs: "Matilda es de Australia. Buhísimo es de Colombia.",
      options: ["Matilda is from Australia. Buhísimo is from Colombia.", "Matilda is from Colombia. Buhísimo is from Australia.", "I'm from Australia. You're from Colombia.", "Matilda and Buhísimo are from Australia."], answer: 0 },
    { id: "type-peru", type: "type", en: "You're from Peru.", answerEs: "Eres de Perú." },
    { id: "tiles-rd", type: "tiles", character: "matilda", en: "No, I'm from the Dominican Republic.",
      answerEs: ["no", "soy", "de", "República Dominicana"], tilesEs: ["República Dominicana", "sí", "soy", "eres", "de", "no", "Cuba"], fullEs: "No, soy de República Dominicana." },
    { id: "match-5", type: "match", pairs: [
      { es: "soy", en: "I am" }, { es: "eres", en: "you are" }, { es: "es", en: "he is · she is" },
      { es: "tú", en: "you" }, { es: "él", en: "he" }] },
    { id: "speak-max", type: "speak", character: "max", es: "¿De dónde eres, Max? — Soy de Melbourne.", en: "Where are you from, Max? — I'm from Melbourne." },
  ],
};

const L6 = {
  ...common,
  id: "1.1-6", n: 6, kind: "learn",
  titleEs: "El mundo hispanohablante",
  titleEn: "The Spanish-speaking world",
  storyEn: "Max unfolds his map. Buhísimo shows that Spanish is spoken on four continents.",
  canDoEn: "Now you can talk about the Spanish-speaking world and its language.",
  xpBase: 10,
  learnedEs: ["el mapa", "el mundo", "hispanohablante", "Guinea Ecuatorial", "la lengua", "el español"],
  steps: [
    { id: "intro-mapa", type: "intro", art: "noun-mapa", contextEn: "Max unfolds something big:", es: "el mapa", en: "the map",
      exampleEs: "El mapa es de Max.", exampleEn: "The map is Max's.",
      noteEn: "[[el mapa]] ends in -a, but it's a masculine word. Always learn the little word in front!" },
    { id: "intro-mundo", type: "intro", art: "noun-mundo", contextEn: "On Max's map:", es: "el mundo", en: "the world" },
    { id: "pic-mapa", type: "choose", titleEn: "Tap the picture", promptEs: "el mapa", sayEs: "el mapa",
      optionsArt: [{ art: "noun-mundo", labelEn: "the world" }, { art: "noun-mapa", labelEn: "the map" }], answer: 1, answerEs: "el mapa", answerEn: "the map" },
    { id: "intro-hisp", type: "intro", map: "hispanic", contextEn: "Every country in turquoise speaks Spanish:", es: "hispanohablante", en: "Spanish-speaking",
      exampleEs: "Chile es hispanohablante.", exampleEn: "Chile is Spanish-speaking.",
      noteEn: "No capital letter in Spanish: [[hispanohablante]]." },
    { id: "intro-gq", type: "intro", map: "gq", contextEn: "Spanish in Africa, too:", es: "Guinea Ecuatorial", en: "Equatorial Guinea",
      exampleEs: "Guinea Ecuatorial es hispanohablante.", exampleEn: "Equatorial Guinea is Spanish-speaking.",
      noteEn: "It's the only country in Africa where Spanish is an official language." },
    { id: "study-l6", type: "mapstudy", places: ["us", "co", "ar", "es", "gq"], contextEn: "Spanish on three continents. Tap each place to hear it. Then find Equatorial Guinea without names." },
    { id: "map-gq", type: "maptap", sayEs: "Guinea Ecuatorial es hispanohablante.", en: "Equatorial Guinea is Spanish-speaking.", target: "gq", choices: ["gq", "es", "co"] },
    { id: "intro-lengua", type: "intro", character: "owl-explaining", contextEn: "Buhísimo explains:", es: "la lengua", en: "the language",
      exampleEs: "La lengua de Guinea Ecuatorial es el español.", exampleEn: "The language of Equatorial Guinea is Spanish." },
    { id: "intro-espanol", type: "intro", character: "owl-explaining", contextEn: "And the language we're learning:", es: "el español", en: "Spanish (the language)",
      exampleEs: "El español es la lengua de Cuba.", exampleEn: "Spanish is the language of Cuba.",
      noteEn: "A small e, and the little word in front: [[el español]]." },
    { id: "pick-hisp", type: "pick", character: "owl-explaining", promptEs: "Chile es hispanohablante.",
      options: ["Chile is Spanish-speaking.", "Chile is a country.", "Chile is on the map.", "Spanish is the language of Chile."], answer: 0 },
    { id: "rule-small", type: "table", titleEn: "Small letters", contextEn: "English writes “Spanish” with a capital S. Spanish doesn't.",
      rows: [
        { es: "el español", en: "a language: small letter", exampleEs: "El español es la lengua de Cuba.", exampleEn: "Spanish is the language of Cuba." },
        { es: "hispanohablante", en: "Spanish-speaking: small letter", exampleEs: "Chile es hispanohablante.", exampleEn: "Chile is Spanish-speaking." },
      ],
      noteEn: "Countries keep their capital ([[Chile]]), but languages don't: [[el español]]. Days and months don't either (Unit 1.4)." },
    { id: "type-espanol", type: "type", en: "Spanish (the language)", answerEs: "el español" },
    { id: "listen-mapa", type: "listen", sayEs: "el mapa", en: "the map",
      optionsEs: ["el mapa", "el mundo", "el país", "la lengua"], answer: 0 },
    { id: "tiles-lengua", type: "tiles", character: "owl-explaining", en: "The language of Equatorial Guinea is Spanish.",
      answerEs: ["la lengua", "de", "Guinea Ecuatorial", "es", "el español"], tilesEs: ["el español", "Guinea Ecuatorial", "el mapa", "es", "la lengua", "de", "el mundo"],
      fullEs: "La lengua de Guinea Ecuatorial es el español." },
    { id: "type-hisp", type: "type", en: "Spanish-speaking", answerEs: "hispanohablante" },
    { id: "match-6", type: "match", pairs: [
      { es: "el mundo", en: "the world" }, { es: "el mapa", en: "the map" }, { es: "la lengua", en: "the language" },
      { es: "el español", en: "Spanish" }, { es: "hispanohablante", en: "Spanish-speaking" }] },
    { id: "pick-chile", type: "pick", character: "max", promptEs: "¿La lengua de Chile? ¡El español!",
      options: ["The language of Chile? Spanish!", "The capital of Chile? Santiago!", "Is Chile Spanish-speaking? Yes!", "Where is Chile? On the map!"], answer: 0 },
    { id: "speak-cuba", type: "speak", character: "owl-explaining", es: "El español es la lengua de Cuba.", en: "Spanish is the language of Cuba." },
  ],
};

const L7 = {
  ...common,
  id: "1.1-7", n: 7, kind: "learn",
  // Not «Islas y destinos»: y is 1.5, and bare plurals are never used (decision 2026-10-21).
  titleEs: "El destino",
  titleEn: "Islands and destinations",
  storyEn: "Max picks a destination. Every island he finds is Spanish-speaking (well, almost).",
  canDoEn: "Now you can name four groups of islands and say where you're going.",
  xpBase: 10,
  learnedEs: ["el destino", "la Isla de Pascua", "las Islas Canarias", "las Islas Baleares", "las Islas Filipinas"],
  steps: [
    { id: "intro-destino", type: "intro", art: "noun-mapa", contextEn: "Max puts a pin on his map:", es: "el destino", en: "the destination",
      exampleEs: "El destino es la Isla de Pascua.", exampleEn: "The destination is Easter Island." },
    { id: "intro-pascua", type: "intro", map: "pascua", contextEn: "Far out in the Pacific:", es: "la Isla de Pascua", en: "Easter Island",
      exampleEs: "La Isla de Pascua es de Chile.", exampleEn: "Easter Island belongs to Chile.",
      noteEn: "Easter Island (Rapa Nui) is famous for its giant stone heads, the moai." },
    { id: "map-pascua", type: "maptap", sayEs: "El destino es la Isla de Pascua.", en: "The destination is Easter Island.", target: "pascua", choices: ["pascua", "cl", "pe"] },
    { id: "intro-canarias", type: "intro", map: "canarias", contextEn: "Islands of Spain, near Africa:", es: "las Islas Canarias", en: "the Canary Islands",
      exampleEs: "Ella es de las Islas Canarias.", exampleEn: "She's from the Canary Islands." },
    { id: "intro-baleares", type: "intro", map: "baleares", contextEn: "Islands of Spain, in the Mediterranean:", es: "las Islas Baleares", en: "the Balearic Islands",
      exampleEs: "Él es de las Islas Baleares.", exampleEn: "He's from the Balearic Islands.",
      noteEn: "Mallorca is the biggest of the Balearic Islands." },
    { id: "study-l7", type: "mapstudy", places: ["es", "baleares", "canarias", "gq"], contextEn: "Spain and its islands. Tap each place to hear it. Then find them on a map without names." },
    { id: "map-baleares", type: "maptap", sayEs: "Él es de las Islas Baleares.", en: "He's from the Balearic Islands.", target: "baleares", choices: ["baleares", "canarias", "es"] },
    { id: "intro-filipinas", type: "intro", map: "ph", contextEn: "Max's next idea:", es: "las Islas Filipinas", en: "the Philippines",
      exampleEs: "¿El destino? ¡Las Islas Filipinas!", exampleEn: "The destination? The Philippines!",
      noteEn: "Spanish was an official language in the Philippines for centuries, and many Filipino words come from Spanish. Today people there speak Filipino and English." },
    { id: "map-canarias", type: "maptap", sayEs: "Ella es de las Islas Canarias.", en: "She's from the Canary Islands.", target: "canarias", choices: ["canarias", "baleares", "gq"] },
    { id: "tiles-destino", type: "tiles", character: "max", en: "The destination is Easter Island.",
      answerEs: ["el destino", "es", "la Isla de Pascua"], tilesEs: ["la Isla de Pascua", "el mapa", "es", "el destino"],
      fullEs: "El destino es la Isla de Pascua." },
    { id: "pick-pascua", type: "pick", character: "owl-explaining", promptEs: "La Isla de Pascua es de Chile.",
      options: ["Easter Island belongs to Chile.", "Easter Island is in Peru.", "Chile is an island.", "The destination is Chile."], answer: 0 },
    { id: "type-destino", type: "type", en: "the destination", answerEs: "el destino" },
    { id: "listen-mundo", type: "listen", sayEs: "el mundo", en: "the world",
      optionsEs: ["el mundo", "el mapa", "el destino", "el país"], answer: 0 },
    { id: "match-7", type: "match", pairs: [
      { es: "el destino", en: "the destination" }, { es: "la Isla de Pascua", en: "Easter Island" },
      { es: "las Islas Canarias", en: "the Canary Islands" }, { es: "las Islas Baleares", en: "the Balearic Islands" },
      { es: "las Islas Filipinas", en: "the Philippines" }] },
    { id: "map-filipinas", type: "maptap", sayEs: "¿El destino? ¡Las Islas Filipinas!", en: "The destination? The Philippines!", target: "ph", choices: ["ph", "au", "pascua"] },
    { id: "speak-destino", type: "speak", character: "max", es: "El destino es la Isla de Pascua.", en: "The destination is Easter Island." },
  ],
};

const L8 = {
  ...common,
  id: "1.1-8", n: 8, kind: "learn",
  // Not «Famoso e histórico»: e is 1.5 (decision 2026-10-21).
  titleEs: "¡Max es famoso!",
  titleEn: "Famous and historic",
  storyEn: "In the plaza, everyone wants a photo with the kangaroo: “¡Max es famoso!”",
  canDoEn: "Now you can describe places: -o for masculine words, -a for feminine words.",
  xpBase: 10,
  learnedEs: ["famoso", "histórico", "el monumento", "la capital"],
  steps: [
    { id: "intro-monumento", type: "intro", art: "noun-monumento", contextEn: "In the plaza there's a tall stone tower:", es: "el monumento", en: "the monument" },
    { id: "intro-famoso", type: "intro", art: "noun-monumento", contextEn: "Everyone takes photos of it:", es: "El monumento es famoso.", en: "The monument is famous.",
      noteEn: "[[famoso]] = famous" },
    { id: "intro-capital", type: "intro", art: "noun-capital", contextEn: "Every country has one:", es: "la capital", en: "the capital" },
    { id: "table-agree", type: "table", titleEn: "-o or -a?", contextEn: "Describing words match the little word in front.",
      rows: [
        { es: "histórico", en: "historic (masculine)", exampleEs: "El monumento es histórico.", exampleEn: "The monument is historic." },
        { es: "histórica", en: "historic (feminine)", exampleEs: "La capital es histórica.", exampleEn: "The capital is historic." },
      ],
      noteEn: "Masculine words, like [[el monumento]], take -o. Feminine words, like [[la capital]], take -a. Look at the little word in front, not the ending: [[el mapa]] is masculine!" },
    { id: "gap-famosa", type: "gap", es: "La Isla de Pascua es famosa.", en: "Easter Island is famous.", blank: "famosa", optionsEs: ["famoso", "famosa"] },
    { id: "gap-historica", type: "gap", es: "La capital es histórica.", en: "The capital is historic.", blank: "histórica", optionsEs: ["histórico", "histórica"] },
    { id: "sort-agree", type: "sort", titleEn: "Famoso or famosa?", bucketsEs: ["famoso", "famosa"],
      cards: [
        { es: "el monumento", bucket: 0 }, { es: "la capital", bucket: 1 }, { es: "la Isla de Pascua", bucket: 1 },
        { es: "el mapa", bucket: 0 }, { es: "el país", bucket: 0 }, { es: "la lengua", bucket: 1 }] },
    // Scene picture of the Cocora Valley (Juan, 21 Oct): drop it in at assets/cocora-valley.webp; until then the owl shows.
    { id: "intro-cocora", type: "intro", scene: "cocora-valley", sceneAltEn: "The Cocora Valley: tall wax palms in the mist", character: "owl-celebrating", contextEn: "Buhísimo's favourite place, the Cocora Valley, near Salento:",
      es: "Cocora es famoso.", en: "Cocora is famous.",
      noteEn: "Cocora is short for the Cocora Valley, a masculine word, so it takes [[famoso]]. Its wax palms are the tallest palms in the world." },
    { id: "pick-max-famoso", type: "pick", character: "matilda", promptEs: "¡Max es famoso!",
      options: ["Max is famous!", "Max is historic!", "Max is from Australia!", "Max is in the capital!"], answer: 0 },
    { id: "type-capital", type: "type", en: "the capital", answerEs: "la capital" },
    { id: "tiles-historico", type: "tiles", character: "owl-explaining", en: "The monument is historic.",
      answerEs: ["el monumento", "es", "histórico"], tilesEs: ["histórica", "el monumento", "famosa", "es", "histórico", "la capital"], fullEs: "El monumento es histórico." },
    { id: "listen-capital", type: "listen", sayEs: "la capital", en: "the capital",
      optionsEs: ["la capital", "el país", "el mapa", "el monumento"], answer: 0 },
    { id: "match-8", type: "match", pairs: [
      { es: "el monumento", en: "the monument" }, { es: "la capital", en: "the capital" }, { es: "famoso", en: "famous" },
      { es: "histórico", en: "historic" }, { es: "el destino", en: "the destination" }] },
    { id: "speak-pascua", type: "speak", character: "owl-explaining", es: "La Isla de Pascua es famosa.", en: "Easter Island is famous." },
  ],
};

// L9: the story (see STORY below; steps are built from its lines).
export const STORY = {
  titleEn: "Max and the map",
  sceneEn: "The plaza in Salento. Buhísimo has just met two visitors from Melbourne, and Max has a big map.",
  scene: "salento-street",
  cast: [
    { who: "buho", nameEn: "Buhísimo", art: "owl-explaining" },
    { who: "matilda", nameEn: "Matilda", art: "matilda-wave" },
    { who: "max", nameEn: "Max", art: "max-wave" },
  ],
  lines: [
    { who: "buho", art: "owl-explaining", es: "¿De dónde eres, Matilda?", en: "Where are you from, Matilda?" },
    { who: "matilda", art: "matilda-wave", es: "Soy de Australia. Soy de Melbourne.", en: "I'm from Australia. I'm from Melbourne." },
    { who: "max", art: "max-wave", es: "¿De dónde eres, Buhísimo?", en: "Where are you from, Buhísimo?" },
    { who: "buho", art: "owl-celebrating", es: "Soy de Colombia. ¡Soy de Salento!", en: "I'm from Colombia. I'm from Salento!" },
    { check: { titleEn: "Where is Buhísimo from?", options: ["Salento", "Melbourne", "Cuba"], answer: 0,
      answerEn: "Buhísimo is from Salento, in Colombia." } },
    { who: "max", art: "max-thinking", es: "¿Salento es famoso?", en: "Is Salento famous?" },
    { who: "buho", art: "owl-explaining", es: "¡Cocora es famoso! El destino es Cocora.", en: "Cocora is famous! The destination is Cocora." },
    { who: "max", art: "max-jump", actionEn: "Max jumps onto the map, from country to country.", es: "¿Cocora? ¿Es Perú? ¿Es Cuba? ¿Es Chile?", en: "Cocora? Is it Peru? Is it Cuba? Is it Chile?" },
    { check: { titleEn: "What is Max doing?", options: ["Jumping across the map, looking for Cocora", "Asking Matilda where she's from", "Taking a photo of the monument"], answer: 0,
      answerEn: "He's jumping from country to country on the map, looking for Cocora." } },
    { who: "matilda", art: "matilda-surprised", es: "Max… ¡Cocora es de Colombia!", en: "Max… Cocora is in Colombia!" },
    { who: "buho", art: "owl-celebrating", es: "Colombia es el país de Buhísimo. ¡El destino es Cocora!", en: "Colombia is Buhísimo's country. The destination is Cocora!" },
    { who: "max", art: "max-celebrate", actionEn: "A crowd in the plaza is watching him.", es: "¡Soy famoso!", en: "I'm famous!" },
    { order: { titleEn: "Put the last three lines in order", last: 3 } },
  ],
};

const L10 = {
  ...common,
  id: "1.1-10", n: 10, kind: "game",
  titleEn: "Map tap",
  storyEn: "Read (or hear) where each person is from, then tap the place on the map.",
  canDoEn: "You found every country and island on the map!",
  xpBase: 15,
  learnedEs: [],
  game: true,
  steps: [
    // Look first (with names), then play (without names). Distractors are neighbours or look-alikes.
    { id: "g-study-north", type: "mapstudy", titleEn: "Look at the map: the Caribbean", places: ["us", "cu", "do", "co"],
      contextEn: "Tap each place to hear it. In the game, the map has no names!" },
    { id: "g-study-south", type: "mapstudy", titleEn: "Look at the map: South America", places: ["co", "pe", "cl", "ar", "pascua"],
      contextEn: "Tap each place to hear it." },
    { id: "g-study-world", type: "mapstudy", titleEn: "Look at the map: Spain, Africa and Asia", places: ["es", "baleares", "canarias", "gq", "ph", "au"],
      contextEn: "Tap each place to hear it. Then the game starts.",
      // Six names are too crowded at 390px wide: phones get two maps (decision 2026-10-21).
      phoneSplit: [
        { titleEn: "Look at the map: Spain and Africa", places: ["es", "baleares", "canarias", "gq"], contextEn: "Tap each place to hear it." },
        { titleEn: "Look at the map: Asia and Australia", places: ["ph", "au"], contextEn: "Tap each place to hear it. Then the game starts." },
      ] },
    { id: "g-gq", type: "maptap", sayEs: "Él es de Guinea Ecuatorial.", en: "He's from Equatorial Guinea.", target: "gq", choices: ["gq", "canarias", "es", "co"] },
    { id: "g-us", type: "maptap", sayEs: "Ella es de Estados Unidos.", en: "She's from the United States.", target: "us", choices: ["us", "cu", "do", "co"] },
    { id: "g-peru", type: "maptap", sayEs: "Él es de Perú.", en: "He's from Peru.", target: "pe", choices: ["pe", "cl", "ar", "co"] },
    { id: "g-canarias", type: "maptap", sayEs: "Soy de las Islas Canarias.", en: "I'm from the Canary Islands.", target: "canarias", choices: ["canarias", "baleares", "gq", "es"] },
    { id: "g-espana", type: "maptap", sayEs: "Soy de España.", en: "I'm from Spain.", target: "es", choices: ["es", "baleares", "canarias", "gq"] },
    { id: "g-argentina", type: "maptap", sayEs: "Ella es de Argentina.", en: "She's from Argentina.", target: "ar", choices: ["ar", "cl", "pe", "co"] },
    { id: "g-cuba", type: "maptap", sayEs: "Ella es de Cuba.", en: "She's from Cuba.", target: "cu", choices: ["cu", "do", "us", "co"] },
    { id: "g-baleares", type: "maptap", sayEs: "Él es de las Islas Baleares.", en: "He's from the Balearic Islands.", target: "baleares", choices: ["baleares", "canarias", "es", "gq"] },
    { id: "g-chile", type: "maptap", sayEs: "Él es de Chile.", en: "He's from Chile.", target: "cl", choices: ["cl", "ar", "pe", "pascua"] },
    { id: "g-rd", type: "maptap", sayEs: "Ella es de República Dominicana.", en: "She's from the Dominican Republic.", target: "do", choices: ["do", "cu", "us", "co"] },
    { id: "g-pascua", type: "maptap", sayEs: "El destino es la Isla de Pascua.", en: "The destination is Easter Island.", target: "pascua", choices: ["pascua", "cl", "pe", "ar"] },
    { id: "g-filipinas", type: "maptap", sayEs: "¿El destino? ¡Las Islas Filipinas!", en: "The destination? The Philippines!", target: "ph", choices: ["ph", "au", "pascua"] },
  ],
};

const L11 = {
  ...common,
  id: "1.1-11", n: 11, kind: "check",
  titleEn: "Passport control",
  storyEn: "Unit check: every 1.1 word, then Buhísimo stamps three passports.",
  canDoEn: "Unit 1.1 done! You can say where people are from, all around the Spanish-speaking world.",
  xpBase: 20,
  learnedEs: [],
  check: true,
  steps: [
    { id: "c-type-espana", type: "type", en: "Spain", flag: "es", answerEs: "España" },
    { id: "c-listen-colombia", type: "listen", sayEs: "Él es de Colombia.", en: "He's from Colombia.",
      optionsEs: ["Él es de Colombia.", "Soy de Colombia.", "Ella es de Chile. Él es de Cuba.", "Max es de Australia."], answer: 0 },
    { id: "c-type-pais", type: "type", en: "the country", answerEs: "el país" },
    { id: "c-pick-two", type: "pick", character: "owl-thinking", promptEs: "Ella es de Chile. Él es de Cuba.",
      options: ["She's from Chile. He's from Cuba.", "He's from Chile. She's from Cuba.", "I'm from Chile. You're from Cuba.", "She's from Cuba. He's from Chile."], answer: 0 },
    { id: "c-gap-soy", type: "gap", es: "¿Eres de Argentina? — No, soy de Chile.", en: "Are you from Argentina? — No, I'm from Chile.", blank: "soy", optionsEs: ["soy", "eres", "es"] },
    { id: "c-type-hisp", type: "type", en: "Spanish-speaking", answerEs: "hispanohablante" },
    { id: "c-map-cuba", type: "maptap", sayEs: "Cuba es hispanohablante.", en: "Cuba is Spanish-speaking.", target: "cu", choices: ["cu", "do", "us", "co"] },
    { id: "c-listen-pais", type: "listen", sayEs: "Colombia es el país de Buhísimo.", en: "Colombia is Buhísimo's country.",
      optionsEs: ["Colombia es el país de Buhísimo.", "Australia es el país de Matilda.", "El destino es España.", "La capital es famosa."], answer: 0 },
    { id: "c-tiles-capital", type: "tiles", character: "owl-explaining", en: "The capital is famous.",
      answerEs: ["la capital", "es", "famosa"], tilesEs: ["famoso", "la capital", "histórica", "es", "famosa", "el monumento"], fullEs: "La capital es famosa." },
    { id: "c-yn-max", type: "choose", titleEn: "Sí or no?", character: "max", flag: "au", promptEs: "¿Max es de Chile?",
      optionsEs: ["sí", "no"], answer: 1, answerEs: "¿Max es de Chile? — No, es de Australia.", answerEn: "Is Max from Chile? — No, he's from Australia." },
    { id: "c-type-destino", type: "type", en: "The destination is Spain.", answerEs: "El destino es España." },
    { id: "c-type-lengua", type: "type", en: "The language of Peru is Spanish.", answerEs: "La lengua de Perú es el español." },
    { id: "c-type-soy", type: "type", en: "I'm from Australia. Where are you from?", answerEs: "Soy de Australia. ¿De dónde eres?" },
    // Finale: Buhísimo stamps passports. Listen and type when the answer is recorded; otherwise read the English.
    { id: "c-passport-1", type: "passport", character: "matilda", nameEn: "Matilda", askEs: "¿De dónde eres?", answerEs: "Soy de Australia.", en: "I'm from Australia.", stampEs: "Australia" },
    { id: "c-passport-2", type: "passport", character: "max", nameEn: "Max", askEs: "¿De dónde eres?", answerEs: "Soy de Melbourne.", en: "I'm from Melbourne.", stampEs: "Melbourne" },
    { id: "c-passport-3", type: "passport", character: "traveller", nameEn: "A traveller", askEs: "¿De dónde eres?", answerEs: "Soy de las Islas Canarias.", en: "I'm from the Canary Islands.", stampEs: "las Islas Canarias" },
  ],
};

const L9 = {
  ...common,
  id: "1.1-9", n: 9, kind: "story",
  titleEs: "El mapa de Max", // not «Max y el mapa»: y is 1.5 (decision 2026-10-21)
  titleEn: STORY.titleEn,
  storyEn: STORY.sceneEn,
  canDoEn: "You followed a whole story in Spanish!",
  xpBase: 10,
  learnedEs: [],
  story: STORY,
  steps: buildStorySteps(STORY),
};

export function buildStorySteps(story) {
  const steps = [{ id: "s-intro", type: "storyintro" }];
  const said = [];
  story.lines.forEach((l, i) => {
    if (l.check) steps.push({ id: `s-check-${i}`, type: "choose", titleEn: l.check.titleEn, story: true, character: "owl-thinking",
      optionsEn: l.check.options, answer: l.check.answer, answerEn: l.check.answerEn });
    else if (l.order) {
      const last = said.slice(-l.order.last);
      steps.push({ id: `s-order-${i}`, type: "tiles", lines: true, titleEn: l.order.titleEn, en: "",
        answerEs: last.map((x) => x.es), tilesEs: [...last.map((x) => x.es)].reverse() });
    } else {
      said.push(l);
      steps.push({ id: `s-line-${i}`, type: "storyline", line: said.length - 1 });
    }
  });
  return steps;
}

export const LESSONS = [{ ...common, ...lesson1, n: 1, kind: "learn", canDoEn: "Now you can ask and say where people are from.",
  learnedEs: lesson1.learnedEs }, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11];
export const lessonById = (id) => LESSONS.find((l) => l.id === id);
