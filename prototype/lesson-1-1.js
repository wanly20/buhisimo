// Unit 1.1 "El español global", lesson 1: ¿De dónde eres?
//
// ALL Spanish text in the prototype lives in this file (plus the textbook unit
// titles in path-data.js). Convention used by tools/check_vocab.mjs:
//   * a key named `es`, or ending in `Es`, holds Spanish (a string or an array);
//   * everything else is English or data, except Spanish quoted inside English
//     text, which is wrapped in [[double brackets]] (rendered as <span lang="es">)
//     and is checked too.
// Allowed words: rows of vocabulary_database.csv, helper_words.csv and names.csv
// whose Section starts with "1.1" (o/a adjectives may also end in -o/-a/-os/-as).

export const lesson = {
  id: "1.1-1",
  unit: "1.1",
  titleEs: "¿De dónde eres?",
  titleEn: "Where are you from?",
  storyEn: "In Salento, Colombia, Buhísimo meets two visitors from Melbourne: Matilda and Max.",
  xpBase: 10,

  // How the placeholder text-to-speech should pronounce names (names.csv "Say as").
  // Pronunciation spellings, never shown on screen.
  sayAs: { Melbourne: "Mélburn" },

  // Praise in Spanish must also obey the vocabulary rules, so in 1.1 it is
  // Buhísimo's own name. English praise goes with it.
  praiseEs: ["¡Buhísimo!"],
  praiseEn: ["Great job!", "You got it!", "Nailed it!", "Spot on!", "Brilliant!", "That's right!"],
  encourageEn: ["Not quite", "Almost!", "Good try!"],
  kindEn: ["Mistakes help you learn.", "Everyone mixes these up at first.", "Let's look at it together."],

  // Shown as chips on the lesson-complete screen.
  learnedEs: ["¿De dónde eres?", "soy de", "él es", "España", "el país"],

  // Specimen line used by the settings sheet and the design-system page.
  specimenEs: "¿De dónde eres? Soy de España.",
  // Buhísimo's tip card on the desktop path (right panel).
  tipEn: "Say new words out loud. Your mouth remembers too! Try [[¿De dónde eres?]] three times, a little faster each time.",

  // Extra example lines used on the design-system page.
  examplesEs: ["Matilda es de Melbourne.", "Max es de Australia.", "Ella es famosa.", "El monumento es histórico.", "la capital", "el mundo", "el mapa"],

  steps: [
    {
      id: "intro-donde",
      type: "intro",
      character: "owl-explaining",
      contextEn: "Buhísimo meets Matilda and Max in Salento. He asks:",
      es: "¿De dónde eres?",
      en: "Where are you from?",
      noteEn: "Use it to ask one person where they're from.",
    },
    {
      id: "intro-soy",
      type: "intro",
      character: "matilda",
      flag: "au",
      contextEn: "Matilda answers:",
      es: "Soy de Australia.",
      en: "I'm from Australia.",
      noteEn: "[[soy de]] = I'm from",
    },
    {
      id: "pick-donde",
      type: "pick",
      character: "owl-explaining",
      promptEs: "¿De dónde eres?",
      options: ["Where are you from?", "Where is he from?", "I'm from Australia.", "He's from Colombia."],
      answer: 0,
    },
    {
      id: "intro-el",
      type: "intro",
      character: "max",
      flag: "co",
      contextEn: "Max points at Buhísimo and says:",
      es: "Él es de Colombia.",
      en: "He's from Colombia.",
      noteEn: "[[él]] = he · [[es]] = is. Watch the accent on [[él]]!",
    },
    {
      id: "listen-el",
      type: "listen",
      sayEs: "Él es de Colombia.",
      optionsEs: ["Él es de Colombia.", "Él es de Australia.", "Soy de Colombia.", "Soy de Australia."],
      answer: 0,
    },
    {
      id: "tiles-soy",
      type: "tiles",
      character: "matilda",
      en: "I'm from Colombia.",
      answerEs: ["soy", "de", "Colombia"],
      tilesEs: ["Colombia", "eres", "soy", "Australia", "de", "es"],
      fullEs: "Soy de Colombia.",
    },
    {
      id: "intro-espana",
      type: "intro",
      character: "owl-explaining",
      flag: "es",
      contextEn: "A new country:",
      es: "España",
      en: "Spain",
      noteEn: "Buhísimo loves the letter ñ! It sounds like the “ny” in canyon.",
    },
    {
      id: "type-espana",
      type: "type",
      en: "Spain",
      flag: "es",
      answerEs: "España",
    },
    {
      id: "intro-pais",
      type: "intro",
      flags: ["co", "es", "au"],
      contextEn: "Colombia, [[España]] and Australia are all…",
      es: "el país",
      en: "the country",
      exampleEs: "Colombia es el país de Buhísimo.",
      exampleEn: "Colombia is Buhísimo's country.",
    },
    {
      id: "match-1",
      type: "match",
      pairs: [
        { es: "España", en: "Spain" },
        { es: "el país", en: "the country" },
        { es: "soy", en: "I am" },
        { es: "eres", en: "you are" },
        { es: "él", en: "he" },
      ],
    },
    {
      id: "speak-soy",
      type: "speak",
      character: "matilda",
      es: "Soy de Australia.",
      en: "I'm from Australia.",
    },
    {
      id: "type-pais",
      type: "type",
      en: "the country",
      answerEs: "el país",
      // Typing it without the article is accepted as "nearly" with a reminder
      // (handled generically by the grader, so no extra Spanish string is needed).
    },
  ],
};
