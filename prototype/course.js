// The course in the prototype: every playable unit, in path order. Locks, the path, Review,
// My knowledge, Me, the Radio tab and the progress file all read this list, so a new unit is
// one content file (unit-1-x.js) plus one line here.
import * as U11 from "./unit-1-1.js";
import * as U12 from "./unit-1-2.js";

export const UNITS = [
  { id: "1.1", lessons: U11.LESSONS, items: U11.ITEMS.map((it) => ({ unit: "1.1", ...it })), radio: [] },
  { id: "1.2", lessons: U12.LESSONS, items: U12.ITEMS, radio: U12.RADIO },
];

/** Every lesson in order (1.1-1 … 1.1-11, 1.2-1 …): lessons unlock one after the other. */
export const LESSONS = UNITS.flatMap((u) => u.lessons);
/** Every item Review and My knowledge know about, with its unit and lesson. */
export const ITEMS = UNITS.flatMap((u) => u.items);
/** Radio Búho episodes that belong to lessons (the Radio tab lists them once the lesson is open). */
export const RADIO = UNITS.flatMap((u) => u.radio);

export const lessonById = (id) => LESSONS.find((l) => l.id === id);
export const unitLessons = (unit) => LESSONS.filter((l) => l.unit === unit);
export const episodeById = (id) => RADIO.find((e) => e.id === id);
/** The lesson an item is introduced in. */
export const lessonOfItem = (it) => LESSONS.find((l) => l.unit === it.unit && l.n === it.lesson);
