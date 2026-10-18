// World map for Unit 1.1: locator maps on new-word cards, the "hispanohablante"
// map and the Map tap game. Shapes: js/worldmap-data.js (Natural Earth, public domain).
// Coordinates are tenths of a degree, x = (lon + 180) * 10, y = (90 - lat) * 10.
import { WORLD } from "./worldmap-data.js";
import { esc } from "./ui.js";

// Every place the unit names. `shape` = the country drawn for it; `es` = its name
// (a 1.1 item, so it's allowed on screen); lon/lat = where the pin goes.
export const PLACES = {
  co: { es: "Colombia", en: "Colombia", lon: -73.5, lat: 4.5, shape: "co" },
  es: { es: "España", en: "Spain", lon: -3.7, lat: 40.2, shape: "es" },
  au: { es: "Australia", en: "Australia", lon: 134, lat: -25.5, shape: "au" },
  ar: { es: "Argentina", en: "Argentina", lon: -64.5, lat: -34.5, shape: "ar" },
  cl: { es: "Chile", en: "Chile", lon: -71, lat: -33.5, shape: "cl" },
  pe: { es: "Perú", en: "Peru", lon: -75.5, lat: -9.8, shape: "pe" },
  cu: { es: "Cuba", en: "Cuba", lon: -79, lat: 21.8, shape: "cu" },
  us: { es: "Estados Unidos", en: "the United States", lon: -98, lat: 39, shape: "us" },
  do: { es: "República Dominicana", en: "the Dominican Republic", lon: -70.4, lat: 18.9, shape: "do" },
  gq: { es: "Guinea Ecuatorial", en: "Equatorial Guinea", lon: 10.4, lat: 1.6, shape: "gq" },
  ph: { es: "las Islas Filipinas", en: "the Philippines", lon: 122, lat: 12.5, shape: "ph" },
  pascua: { es: "la Isla de Pascua", en: "Easter Island", lon: -109.35, lat: -27.1, shape: "cl", island: true },
  canarias: { es: "las Islas Canarias", en: "the Canary Islands", lon: -15.6, lat: 28.3, shape: "es", island: true },
  baleares: { es: "las Islas Baleares", en: "the Balearic Islands", lon: 2.9, lat: 39.6, shape: "es", island: true },
};
// Countries where Spanish is an official language (for "hispanohablante").
const HISPANIC_FOCUS = ["co", "es", "ar", "cl", "pe", "cu", "do", "gq"];

export const placeName = (code) => PLACES[code]?.en || code;
const X = (lon) => (lon + 180) * 10;
const Y = (lat) => (90 - lat) * 10;

/** The viewBox [x, y, w, h] around these points, padded and stretched to `aspect` (w/h). */
function fit(points, aspect, { pad = 60, minW = 300 } = {}) {
  let x0 = Math.min(...points.map((p) => p[0])) - pad, x1 = Math.max(...points.map((p) => p[0])) + pad;
  let y0 = Math.min(...points.map((p) => p[1])) - pad, y1 = Math.max(...points.map((p) => p[1])) + pad;
  let w = Math.max(x1 - x0, minW), h = y1 - y0;
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let x = cx - w / 2, y = cy - h / 2;
  // keep inside the world (no Antarctica, no wrap)
  if (w > 3600) { w = 3600; h = w / aspect; x = 0; }
  x = Math.max(0, Math.min(3600 - w, x));
  y = Math.max(0, Math.min(1560 - h, y));
  return [Math.round(x), Math.round(y), Math.round(w), Math.round(h)];
}

/**
 * An SVG map in a frame. Options:
 *   focus: a place code (locator map: that country highlighted, a dot for islands),
 *          or "hispanic" (every Spanish-speaking country highlighted);
 *   choices: place codes shown as tappable pins (Map tap);
 *   highlight: place codes whose countries are tinted;
 *   aspect: width / height of the frame (default 1.6).
 */
export function mapFrame({ focus = null, choices = [], highlight = [], pins = false, aspect = 1.6 } = {}) {
  let view, tint = new Set(highlight.map((c) => PLACES[c]?.shape).filter(Boolean)), dots = [];
  if (focus === "hispanic") {
    HISPANIC_FOCUS.forEach((c) => tint.add(c));
    view = fit([[X(-118), Y(48)], [X(14), Y(-55)]], aspect, { pad: 20 });
  } else if (focus) {
    const p = PLACES[focus];
    tint.add(p.shape);
    if (p.island || ["gq", "cu", "do"].includes(focus)) dots.push(focus);
    const span = p.island || focus === "gq" ? 380 : ["us", "au", "ar", "cl"].includes(focus) ? 520 : 420;
    view = fit([[X(p.lon), Y(p.lat)]], aspect, { pad: span / 2, minW: span });
  } else {
    view = fit(choices.map((c) => [X(PLACES[c].lon), Y(PLACES[c].lat)]), aspect, { pad: 110, minW: 420 });
  }
  const [vx, vy, vw, vh] = view;
  const sw = Math.max(1, vw / 400); // border width scales with zoom
  const shapes = Object.entries(WORLD.countries).map(([code, d]) =>
    `<path class="map-shape ${tint.has(code) ? "is-tint" : ""}" data-shape="${code}" d="${d}"/>`).join("");
  const pct = (c) => [((X(PLACES[c].lon) - vx) / vw) * 100, ((Y(PLACES[c].lat) - vy) / vh) * 100];
  const pinHtml = pins ? choices.map((c, k) => {
    const [l, t] = pct(c);
    return `<button class="option map-pin" data-oi="${k}" data-place="${c}" aria-pressed="false" style="left:${l.toFixed(2)}%;top:${t.toFixed(2)}%">
        <span class="map-pin__dot" aria-hidden="true"></span>
        <span class="map-pin__label"><span class="key" aria-hidden="true">${k + 1}</span><span lang="es" class="es">${esc(PLACES[c].es)}</span></span>
      </button>`;
  }).join("") : "";
  const dotHtml = dots.map((c) => { const [l, t] = pct(c); return `<span class="map-dot" style="left:${l.toFixed(2)}%;top:${t.toFixed(2)}%" aria-hidden="true"></span>`; }).join("");
  const label = focus === "hispanic" ? "Map: the Spanish-speaking countries in turquoise"
    : focus ? `Map: where ${PLACES[focus].en} is` : "Map";
  return `
    <div class="map-frame ${pins ? "map-frame--pins" : ""}" style="aspect-ratio:${aspect}" role="img" aria-label="${esc(label)}">
      <svg class="map-svg" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="--sw:${sw.toFixed(2)}">
        <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" class="map-sea"/>
        <path class="map-land" d="${WORLD.land}"/>
        <path class="map-land map-land--hisp ${focus === "hispanic" ? "is-tint" : ""}" d="${WORLD.hispanic}"/>
        ${shapes}
      </svg>
      ${dotHtml}${pinHtml}
    </div>`;
}

/** After the pins are in the DOM: move labels so they don't overlap or leave the frame. */
export function wireMapPins(root) {
  const frame = root.querySelector(".map-frame--pins");
  if (!frame) return;
  const fr = frame.getBoundingClientRect();
  const placed = [];
  const SIDES = ["below", "above", "right", "left"];
  for (const pin of frame.querySelectorAll(".map-pin")) {
    let best = null;
    for (const side of SIDES) {
      pin.dataset.side = side;
      const r = pin.querySelector(".map-pin__label").getBoundingClientRect();
      const outside = Math.max(0, fr.left - r.left) + Math.max(0, r.right - fr.right) + Math.max(0, fr.top - r.top) + Math.max(0, r.bottom - fr.bottom);
      const overlap = placed.reduce((s, q) => s + Math.max(0, Math.min(r.right, q.right) - Math.max(r.left, q.left)) * Math.max(0, Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top)), 0);
      const cost = outside * 50 + overlap;
      if (!best || cost < best.cost) best = { side, cost, r };
      if (cost === 0) break;
    }
    pin.dataset.side = best.side;
    placed.push(best.r);
  }
}
