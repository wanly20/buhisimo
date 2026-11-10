// Days, months and dates (Unit 1.4). No DOM here: unit-1-4.js (read by the Node checker),
// js/art.js and js/exercises-1-4.js all use it.
//
// Calendar rules (docs/build_plan_1.4.md §3 A4, A14, A15; Juan's decisions 4 and 6, 11 Nov 2026):
//   * every calendar starts on Monday and writes X for miércoles: L M X J V S D;
//   * weekdays and dates follow ONE real calendar, 2025 (the story's year), which is never shown;
//   * Max's 29 February doesn't exist in 2025, so his February is drawn as a leap-year February
//     (`leap: true`), and no line gives a weekday for 29 February.
import { NUM_ES } from "./numbers.js";

/** The days, Monday first, as taught in 1.4 L2–L3 (always small letters). */
export const DAYS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
/** Calendar letters: X for miércoles, because M is martes. */
export const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];
/** The months, as taught in 1.4 L4–L6 (always small letters). Index 0 = enero. */
export const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const STORY_YEAR = 2025; // never shown on screen
const LEAP_YEAR = 2024;          // for Max's February only

/** Days in month m (1–12); `leap` draws a leap-year February. */
export const daysIn = (m, { leap = false } = {}) => new Date(Date.UTC(leap && m === 2 ? LEAP_YEAR : STORY_YEAR, m, 0)).getUTCDate();
/** Weekday of d/m (0 = lunes … 6 = domingo) in the story year (or a leap year for `leap`). */
export const weekdayOf = (d, m, { leap = false } = {}) => (new Date(Date.UTC(leap && m === 2 ? LEAP_YEAR : STORY_YEAR, m - 1, d)).getUTCDay() + 6) % 7;

/** The cells of a month page, Monday first: leading blanks (null), then 1 … n. */
export function monthCells(m, opts = {}) {
  const lead = weekdayOf(1, m, opts), n = daysIn(m, opts);
  return [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
}

/** «el veinte de julio» for 20/7; the 1st is «el primero» (Colombia) unless `uno` («el uno», often in Spain). */
export function dateEs(d, m, { uno = false } = {}) {
  const n = d === 1 ? (uno ? "uno" : "primero") : NUM_ES[d];
  return `el ${n} de ${MONTHS_ES[m - 1]}`;
}
const ORD = (d) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
/** "20 July" style (Australian order, as students write it). */
export const dateEn = (d, m) => `${d} ${MONTHS_EN[m - 1]}`;
export const dateEnLong = (d, m) => `the ${d}${ORD(d)} of ${MONTHS_EN[m - 1]}`;
/** Written the Australian way, day / month: 20/7. */
export const dateDigits = (d, m) => `${d}/${m}`;

/**
 * Every date of the year as Spanish, for the "Your birthday" step (1.4 L11) and the checker:
 * [{ d, m, es: "el veinte de julio", alsoEs?: "el uno de enero" }], 29 February included (a leap-year February).
 */
export function allDates() {
  const out = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= daysIn(m, { leap: true }); d++) out.push({ d, m, es: dateEs(d, m), ...(d === 1 ? { alsoEs: dateEs(d, m, { uno: true }) } : {}) });
  return out;
}

/** The sentence the "Your birthday" step builds: «Mi cumpleaños es el veinte de julio.» */
export const birthdaySentence = (d, m, opts) => `Mi cumpleaños es ${dateEs(d, m, opts)}.`;

/** The cast's birthdays (story canon, approved 21 Oct 2026). The checker holds every cast line to it. */
export const CANON = {
  samuel: { d: 10, m: 1 }, max: { d: 29, m: 2, leap: true }, matilda: { d: 15, m: 6 }, valentina: { d: 20, m: 7 }, buho: { d: 7, m: 8 },
};
export const CANON_NAMES = { samuel: "Samuel", max: "Max", matilda: "Matilda", valentina: "Valentina", buho: "Buhísimo" };
