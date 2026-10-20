// Small flat pictures drawn in SVG (Salento palette, no outlines, one shadow tone), so the
// 1.2 lessons need no new image files: the time of day over the Cocora hills, and five
// feeling faces from "fatal" to "fenomenal". Decorative only: the step text carries the meaning.

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
