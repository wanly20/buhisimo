// Small flat pictures drawn in SVG (Salento palette, no outlines, one shadow tone), so the
// 1.2 lessons need no new image files: the time of day over the Cocora hills, and five
// feeling faces from "fatal" to "fenomenal". Decorative only: the step text carries the meaning.
import { DAYS_ES, DAY_LETTERS, MONTHS_ES, monthCells } from "./calendar.js";

const C = {
  sky: "#e3f6f5", skyPm: "#fde8f1", sun: "#f7b928", sunEdge: "#e19c08", hill1: "#2fbf71", hill2: "#17a35a", hill3: "#0e7f45",
  trunk: "#eadfcf", frond: "#0e7f45", fog: "#ffffff", ink: "#2c2118", cream: "#fff9f0",
};

/** A wax palm: a tall thin trunk and a small crown (the Cocora Valley). */
const palm = (x, base, h) => `
  <rect x="${x - 2}" y="${base - h}" width="4" height="${h}" rx="2" fill="${C.trunk}"/>
  <path d="M${x} ${base - h} q-14 -2 -20 8 M${x} ${base - h} q14 -2 20 8 M${x} ${base - h} q-6 -12 -16 -12 M${x} ${base - h} q6 -12 16 -12" stroke="${C.frond}" stroke-width="5" stroke-linecap="round" fill="none"/>`;

/**
 * The time of day in Salento: "morning" (sun low on the left, clear sky, 8:00) or
 * "afternoon" (sun high on the right, a pink sky and the Cocora fog rolling in, 15:00).
 */
export function timeScene(kind = "morning", { label = "" } = {}) {
  const am = kind === "morning";
  const sun = am ? { x: 62, y: 92 } : { x: 236, y: 42 };
  const time = am ? "8:00" : "15:00";
  return `
  <svg class="art-scene" viewBox="0 0 320 200" role="img" aria-label="${label || (am ? "Morning in Salento: the sun is just up" : "Afternoon in Salento: the sun is high and the fog rolls in")}">
    <rect width="320" height="200" rx="18" fill="${am ? C.sky : C.skyPm}"/>
    <circle cx="${sun.x}" cy="${sun.y}" r="${am ? 26 : 24}" fill="${C.sun}"/>
    <circle cx="${sun.x}" cy="${sun.y}" r="${am ? 36 : 34}" fill="${C.sun}" opacity="0.25"/>
    <path d="M0 132 Q70 92 150 124 T320 110 V200 H0 Z" fill="${C.hill1}"/>
    <path d="M0 158 Q90 120 190 150 T320 140 V200 H0 Z" fill="${C.hill2}"/>
    ${palm(112, 134, 64)}${palm(150, 140, 82)}${palm(262, 128, 70)}
    <path d="M0 176 Q120 160 320 178 V200 H0 Z" fill="${C.hill3}"/>
    ${am ? "" : `<g fill="${C.fog}" opacity="0.82"><rect x="-10" y="112" width="200" height="22" rx="11"/><rect x="120" y="128" width="220" height="20" rx="10"/><rect x="30" y="146" width="180" height="16" rx="8"/></g>`}
    <g transform="translate(${am ? 230 : 18} 14)">
      <rect width="74" height="32" rx="16" fill="${C.cream}"/>
      <circle cx="18" cy="16" r="9" fill="none" stroke="${C.ink}" stroke-width="2.5"/>
      <path d="M18 16 V10 M18 16 L${am ? 13 : 23} ${am ? 19 : 19}" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>
      <text x="33" y="22" font-size="15" font-weight="700" fill="${C.ink}" font-family="system-ui, sans-serif">${time}</text>
    </g>
  </svg>`;
}

// Feeling faces, best to worst. Each: face colour, mouth path, extras.
const FACES = {
  fenomenal: { fill: "#f7b928", mouth: "M34 60 Q50 80 66 60 Z", mouthFill: "#8a2f19", eyes: "happy", extra: "stars", en: "great" },
  muybien: { fill: "#ffd56a", mouth: "M34 60 Q50 78 66 60 Z", mouthFill: "#8a2f19", eyes: "dots", extra: "", en: "very good" },
  bien: { fill: "#ffd56a", mouth: "M36 62 Q50 72 64 62", eyes: "dots", extra: "", en: "good" },
  regular: { fill: "#eadfcf", mouth: "M37 66 H63", eyes: "dots", extra: "", en: "so-so" },
  mal: { fill: "#f9d3c3", mouth: "M36 70 Q50 60 64 70", eyes: "dots", extra: "", en: "not good" },
  fatal: { fill: "#e9845d", mouth: "M35 72 Q50 58 65 72", eyes: "sad", extra: "tear", en: "awful" },
};
export const FACE_KEYS = Object.keys(FACES);
export const faceEn = (k) => FACES[k]?.en || k;

/** A round feeling face (decorative; pass a label to make it an image for screen readers). */
export function face(kind, { label = "" } = {}) {
  const f = FACES[kind] || FACES.regular;
  const eyes = f.eyes === "happy"
    ? `<path d="M30 44 q6 -8 12 0 M58 44 q6 -8 12 0" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" fill="none"/>`
    : f.eyes === "sad"
      ? `<circle cx="37" cy="45" r="4.5" fill="${C.ink}"/><circle cx="63" cy="45" r="4.5" fill="${C.ink}"/><path d="M28 36 l12 4 M72 36 l-12 4" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/>`
      : `<circle cx="37" cy="45" r="4.5" fill="${C.ink}"/><circle cx="63" cy="45" r="4.5" fill="${C.ink}"/>`;
  const mouth = f.mouthFill ? `<path d="${f.mouth}" fill="${f.mouthFill}"/>` : `<path d="${f.mouth}" stroke="${C.ink}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  const extra = f.extra === "stars"
    ? `<path d="M10 16 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z M88 12 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5z" fill="#d6247a"/>`
    : f.extra === "tear" ? `<path d="M68 52 q5 9 0 13 q-5 -4 0 -13z" fill="#2bbfb9"/>` : "";
  return `<svg class="art-face" viewBox="0 0 100 100" ${label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`}>
    <circle cx="50" cy="54" r="38" fill="${f.fill}"/><path d="M20 66 a38 38 0 0 0 60 0 a40 40 0 0 1 -60 0z" fill="#000" opacity="0.06"/>
    ${eyes}${mouth}${extra}</svg>`;
}

// =================================================================== Unit 1.3: numbers and the ID card
// Drawn in code like the scenes and faces above: no new image files.

const DIGIT_COLOURS = ["#14a39e", "#d6247a", "#e19c08", "#17a35a", "#d9643a"];
/** A big number tile (number cards, intro cards, the countdown). Decorative: the step text says the number. */
export function digitArt(n, { label = "" } = {}) {
  const c = DIGIT_COLOURS[Math.abs(n) % DIGIT_COLOURS.length];
  const s = String(n);
  return `<svg class="art-digit" viewBox="0 0 200 160" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
    <rect x="6" y="10" width="188" height="144" rx="28" fill="${c}" opacity="0.16"/>
    <rect x="16" y="4" width="168" height="140" rx="26" fill="${c}"/>
    <text x="100" y="${s.length > 1 ? 112 : 116}" text-anchor="middle" font-size="${s.length > 1 ? 104 : 116}" font-weight="700" fill="#fff9f0" font-family="Fredoka, system-ui, sans-serif">${s}</text>
  </svg>`;
}

const escA = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/**
 * The ID card («el carnet de identidad»), in the colours of the Colombian flag. Each field is
 * labelled with a question (¿El nombre?), never a bare noun (content plan §6, P7). A field's value
 * is Spanish text (valueEs), a number (value), or HTML to fill in (slot, used by the fill exercise).
 *   idCard({ photo: "samuel", fields: [{ qEs: "¿El nombre?", valueEs: "Samuel" }], number: "1 094 233 017" })
 */
export function idCard({ photo = "", fields = [], number = "", highlight = -1, cls = "" } = {}) {
  return `
  <div class="idcard ${cls}" role="group" aria-label="ID card">
    <div class="idcard__flag" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="idcard__body">
      <div class="idcard__photo">${photo ? `<img src="assets/${escA(photo)}.webp" alt="" draggable="false">` : ""}</div>
      <dl class="idcard__fields">
        ${fields.map((f, k) => `
          <div class="idcard__field ${k === highlight ? "is-hl" : ""}" data-field="${k}">
            <dt lang="es">${escA(f.qEs)}</dt>
            <dd>${f.slot ?? (f.valueEs != null ? `<span lang="es" class="es">${escA(f.valueEs)}</span>` : f.value != null ? `<span class="idcard__num">${escA(f.value)}</span>` : `<span class="idcard__blank"></span>`)}</dd>
          </div>`).join("")}
      </dl>
    </div>
    <div class="idcard__foot" aria-hidden="true">
      <svg viewBox="0 0 60 30" class="idcard__sign"><path d="M3 22 q8 -18 14 -4 t12 -2 q4 -10 10 2 t18 -6" fill="none" stroke="#2c2118" stroke-width="2.5" stroke-linecap="round"/></svg>
      <span class="idcard__no">${escA(number)}</span>
    </div>
  </div>`;
}

// =================================================================== Unit 1.4: the calendar
// Drawn in code (HTML + CSS in css/unit-1-4.css), like the ID card: every day and month name is
// real text in small letters, so the Spanish on a calendar is always exact. Monday first, X for
// miércoles (L M X J V S D), no year anywhere (the story year 2025 is never shown: js/calendar.js).
// Each renderer returns HTML. With `tap`, the cells are buttons (class `cal-hit`, data-oi = the value)
// that exercises-1-4.js wires up; without it they are plain pictures.

const cellTag = (tap, value, inner, cls, on = true, label = "") => tap
  ? `<button class="press cal-hit ${cls}" data-oi="${escA(value)}" ${on ? "" : "disabled"} aria-label="${escA(label)}"><span class="face">${inner}</span></button>`
  : `<span class="${cls}" ${label ? `aria-label="${escA(label)}"` : ""}>${inner}</span>`;

/**
 * The week: L M X J V S D, each with its day name under the letter (`names`: all, or only the lit ones).
 *   weekStrip({ active: [0, 1], lit: [0], tap: true, names: "lit" })
 */
export function weekStrip({ active = [0, 1, 2, 3, 4, 5, 6], lit = [], tap = false, names = "all", cls = "" } = {}) {
  return `<div class="cal-week ${cls}" role="group" aria-label="The week, Monday first">
    ${DAYS_ES.map((d, i) => {
      const on = active.includes(i), isLit = lit.includes(i);
      const showName = names === "all" || (names === "lit" && isLit) || (names === "active" && on);
      const inner = `<span class="cal-week__l" aria-hidden="true">${DAY_LETTERS[i]}</span><span class="cal-week__n" lang="es">${showName ? escA(d) : "&nbsp;"}</span>`;
      return cellTag(tap, i, inner, `cal-week__d ${on ? "" : "is-off"} ${isLit ? "is-lit" : ""} ${i >= 5 ? "is-weekend" : ""}`, on, showName || tap ? d : DAY_LETTERS[i]);
    }).join("")}
  </div>`;
}

/** The year: twelve month tiles (1 = enero). `names`: "all" | "lit" | "active" (only active months named). */
export function yearView({ active = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], lit = [], tap = false, names = "all", cls = "" } = {}) {
  return `<div class="cal-year ${cls}" role="group" aria-label="The year">
    ${MONTHS_ES.map((name, i) => {
      const m = i + 1, on = active.includes(m), isLit = lit.includes(m);
      const showName = names === "all" || (names === "lit" && isLit) || (names === "active" && on);
      const inner = `<span class="cal-year__ring" aria-hidden="true"><i></i><i></i></span><span class="cal-year__n" lang="es">${showName ? escA(name) : "?"}</span>`;
      return cellTag(tap, m, inner, `cal-year__m cal-year__m--${(i % 4) + 1} ${on ? "" : "is-off"} ${isLit ? "is-lit" : ""}`, on, showName ? name : `month ${m}`);
    }).join("")}
  </div>`;
}

/**
 * A month page: the month name (small letters) over a Monday-first grid. `circle`: days drawn with a
 * ring; `stickers`: days with a party sticker; `tap`: the days are buttons; `flip`: ‹ › buttons beside
 * the name (data-flip="-1" / "1"); `leap`: a leap-year February (Max's 29th). No year is ever shown.
 */
export function monthPage(m, { leap = false, circle = [], stickers = [], tap = false, flip = false, lit = -1, small = false, cls = "" } = {}) {
  const cells = monthCells(m, { leap });
  return `<div class="cal-page ${small ? "cal-page--small" : ""} ${cls}" data-month="${m}" role="group" aria-label="The calendar page for ${escA(MONTHS_ES[m - 1])}">
    <div class="cal-page__head">
      ${flip ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm cal-flip" data-flip="-1" aria-label="Previous month"><span class="face">‹</span></button>` : ""}
      <span class="cal-page__name" lang="es">${escA(MONTHS_ES[m - 1])}</span>
      ${flip ? `<button class="press icon-btn icon-btn--secondary icon-btn--sm cal-flip" data-flip="1" aria-label="Next month"><span class="face">›</span></button>` : ""}
    </div>
    <div class="cal-page__grid">
      ${DAY_LETTERS.map((l, i) => `<span class="cal-page__dow ${i === lit ? "is-lit" : ""} ${i >= 5 ? "is-weekend" : ""}" data-dow="${i}" aria-hidden="true">${l}</span>`).join("")}
      ${cells.map((d, k) => d == null ? `<span class="cal-page__blank"></span>` : cellTag(tap, d, `<span class="cal-page__d">${d}</span>${stickers.includes(d) ? `<span class="cal-sticker" aria-hidden="true">★</span>` : ""}`,
        `cal-page__day ${circle.includes(d) ? "is-circled" : ""} ${k % 7 >= 5 ? "is-weekend" : ""}`, true, `${d}`)).join("")}
    </div>
  </div>`;
}

/** The seasons culture card (1.4 L5): Melbourne in July (beanie, rain) and Salento (the same all year). */
export function seasonsArt() {
  return `<svg class="art-seasons" viewBox="0 0 320 150" role="img" aria-label="Melbourne in July: cold and rainy. Salento: mild all year.">
    <rect x="4" y="4" width="150" height="142" rx="18" fill="#e3f6f5"/>
    <rect x="166" y="4" width="150" height="142" rx="18" fill="#fff5d6"/>
    <g fill="#9aa9b5"><ellipse cx="60" cy="40" rx="30" ry="14"/><ellipse cx="86" cy="34" rx="22" ry="13"/><ellipse cx="104" cy="44" rx="20" ry="11"/></g>
    <g stroke="#14a39e" stroke-width="4" stroke-linecap="round"><path d="M50 62 l-6 12"/><path d="M72 62 l-6 12"/><path d="M94 62 l-6 12"/><path d="M61 82 l-6 12"/><path d="M83 82 l-6 12"/></g>
    <path d="M52 128 q27 -40 54 0 z" fill="#d6247a"/><rect x="48" y="124" width="62" height="10" rx="5" fill="#b3135f"/><circle cx="79" cy="88" r="7" fill="#ee4f97"/>
    <circle cx="241" cy="46" r="20" fill="#f7b928"/><circle cx="241" cy="46" r="28" fill="#f7b928" opacity="0.25"/>
    <g fill="#ffffff"><ellipse cx="270" cy="62" rx="22" ry="10"/><ellipse cx="252" cy="66" rx="16" ry="8"/></g>
    <path d="M166 120 Q220 92 316 112 V146 H166 Z" fill="#2fbf71"/>
    <rect x="214" y="70" width="4" height="52" rx="2" fill="#eadfcf"/><path d="M216 70 q-14 -2 -20 8 M216 70 q14 -2 20 8 M216 70 q-6 -12 -16 -12 M216 70 q6 -12 16 -12" stroke="#0e7f45" stroke-width="5" stroke-linecap="round" fill="none"/>
    <text x="79" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#075c59" font-family="system-ui, sans-serif">Melbourne</text>
    <text x="241" y="140" text-anchor="middle" font-size="13" font-weight="700" fill="#3d2a00" font-family="system-ui, sans-serif">Salento</text>
  </svg>`;
}

/**
 * A calendar picture for an intro card or a choice (not interactive):
 *   { view: "week", lit: [0] } · { view: "year", lit: [7] } · { view: "month", month: 3, circle: [1] }
 *   { view: "pair", months: [6, 7] } (two pages side by side: junio / julio) · { view: "namecard" } (Samuel's ID card next to noviembre)
 */
export function calArt(c = {}) {
  if (c.view === "week") return weekStrip({ active: c.active, lit: c.lit || [], names: c.names || "all" });
  if (c.view === "year") return yearView({ active: c.active, lit: c.lit || [], names: c.names || "all" });
  if (c.view === "pair") return `<div class="cal-pair">${c.months.map((m, k) => monthPage(m, { small: true, circle: c.circle || [], cls: `cal-page--tone${k + 1}` })).join("")}</div>`;
  if (c.view === "namecard") return `<div class="cal-pair cal-pair--namecard">${idCard({ photo: "samuel", fields: [{ qEs: "¿El nombre?", valueEs: "Samuel" }], cls: "idcard--mini" })}${monthPage(11, { small: true })}</div>`;
  return monthPage(c.month, { leap: !!c.leap, circle: c.circle || [], small: c.small !== false }); // small on cards and prompts
}
