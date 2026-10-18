// The learning path shown on the home screen (prototype).
// Unit titles are the textbook (Claro 1) section titles from vocabulary_database.csv.
// They are proper titles, not practice language, so the vocabulary checker lists
// them separately as "textbook titles" instead of applying the 1.1 word list.

export const unitsTextbookTitlesEs = {
  "1.1": "El español global",
  "1.2": "¿Qué tal?",
  "1.3": "Mi carnet de identidad",
  "1.4": "¡…y que cumplas muchos más!",
  "1.5": "Mis preferencias",
  "1.6": "¡Tod@s a clase!",
};

// Each unit: colour theme + nodes. kind decides the icon.
// Unit 1.1 is fully playable (unit-1-1.js: 11 lessons, docs/content_plan_1.1-1.6.md §4);
// every node of 1.2–1.6 still says "Coming soon".
export const units = [
  { id: "1.1", theme: "turquoise", subtitleEn: "Countries and where people are from",
    nodes: [
      { id: "1.1-1", kind: "lesson", labelEn: "Lesson 1" },
      { id: "1.1-2", kind: "lesson", labelEn: "Lesson 2" },
      { id: "1.1-3", kind: "lesson", labelEn: "Lesson 3" },
      { id: "1.1-4", kind: "lesson", labelEn: "Lesson 4" },
      { id: "1.1-5", kind: "practice", labelEn: "Practice" },
      { id: "1.1-6", kind: "lesson", labelEn: "Lesson 6" },
      { id: "1.1-7", kind: "lesson", labelEn: "Lesson 7" },
      { id: "1.1-8", kind: "lesson", labelEn: "Lesson 8" },
      { id: "1.1-9", kind: "story", labelEn: "Story" },
      { id: "1.1-10", kind: "game", labelEn: "Game" },
      { id: "1.1-11", kind: "check", labelEn: "Unit check" },
    ] },
  { id: "1.2", theme: "magenta", subtitleEn: "Greetings and feelings",
    nodes: [
      { id: "1.2-1", kind: "lesson", labelEn: "Lesson 1" },
      { id: "1.2-2", kind: "listen", labelEn: "Listen" },
      { id: "1.2-3", kind: "story", labelEn: "Story" },
      { id: "1.2-4", kind: "check", labelEn: "Unit check" },
    ] },
  { id: "1.3", theme: "emerald", subtitleEn: "Numbers, names and ages",
    nodes: [
      { id: "1.3-1", kind: "lesson", labelEn: "Lesson 1" },
      { id: "1.3-2", kind: "lesson", labelEn: "Lesson 2" },
      { id: "1.3-3", kind: "game", labelEn: "Game" },
      { id: "1.3-4", kind: "check", labelEn: "Unit check" },
    ] },
  { id: "1.4", theme: "terracotta", subtitleEn: "Days, months and birthdays",
    nodes: [
      { id: "1.4-1", kind: "lesson", labelEn: "Lesson 1" },
      { id: "1.4-2", kind: "speak", labelEn: "Speak" },
      { id: "1.4-3", kind: "story", labelEn: "Story" },
      { id: "1.4-4", kind: "check", labelEn: "Unit check" },
    ] },
  { id: "1.5", theme: "mustard", subtitleEn: "Colours and opinions",
    nodes: [
      { id: "1.5-1", kind: "lesson", labelEn: "Lesson 1" },
      { id: "1.5-2", kind: "listen", labelEn: "Listen" },
      { id: "1.5-3", kind: "practice", labelEn: "Practice" },
      { id: "1.5-4", kind: "check", labelEn: "Unit check" },
    ] },
  { id: "1.6", theme: "turquoise", subtitleEn: "Classroom objects",
    nodes: [
      { id: "1.6-1", kind: "lesson", labelEn: "Lesson 1" },
      { id: "1.6-2", kind: "game", labelEn: "Game" },
      { id: "1.6-3", kind: "boss", labelEn: "Unit 1 boss" },
    ] },
];
