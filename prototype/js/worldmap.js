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
  cl: { es: "Chile", en: "Chile", lon: -72, lat: -36.5, shape: "cl" }, // pin on the thin strip, clear of Argentina
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
export function mapFrame({ focus = null, choices = [], highlight = [], pins = false, keys = true, quiz = false, aspect = 1.6 } = {}) {
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
        <span class="map-pin__label">${keys ? `<span class="key" aria-hidden="true">${k + 1}</span>` : ""}<span lang="es" class="es">${esc(PLACES[c].es)}</span></span>
      </button>`;
  }).join("") : "";
  // Quiz markers (map questions): no names. A numbered ring sits on each place (a callout
  // circle round small islands and countries) with a 48px hit area; the names appear only
  // after CHECK, or with the "Show the names" hint. wireMapQuiz() spreads rings that would
  // overlap and draws a leader line back to the real spot.
  const quizHtml = quiz ? choices.map((c, k) => {
    const [l, t] = pct(c);
    return `<span class="map-anchor" data-anchor="${k}" style="left:${l.toFixed(2)}%;top:${t.toFixed(2)}%" aria-hidden="true" hidden></span>
      <span class="map-leader" data-leader="${k}" aria-hidden="true" hidden></span>
      <button class="option map-mark" data-oi="${k}" data-place="${c}" data-x="${l.toFixed(3)}" data-y="${t.toFixed(3)}" aria-pressed="false" aria-label="Place ${k + 1}" style="left:${l.toFixed(2)}%;top:${t.toFixed(2)}%">
        <span class="map-mark__ring" aria-hidden="true"></span>
        <span class="map-mark__num" aria-hidden="true">${k + 1}</span>
        <span class="map-mark__name" lang="es">${esc(PLACES[c].es)}</span>
      </button>`;
  }).join("") : "";
  const dotHtml = dots.map((c) => { const [l, t] = pct(c); return `<span class="map-dot" style="left:${l.toFixed(2)}%;top:${t.toFixed(2)}%" aria-hidden="true"></span>`; }).join("");
  const label = focus === "hispanic" ? "Map: the Spanish-speaking countries in turquoise"
    : focus ? `Map: where ${PLACES[focus].en} is` : quiz ? "Map with numbered places" : "Map";
  return `
    <div class="map-frame ${pins ? "map-frame--pins" : ""} ${quiz ? "map-frame--quiz" : ""}" style="aspect-ratio:${aspect}" ${quiz ? `role="group"` : `role="img"`} aria-label="${esc(label)}">
      <svg class="map-svg" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="--sw:${sw.toFixed(2)}">
        <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" class="map-sea"/>
        <path class="map-land" d="${WORLD.land}"/>
        <path class="map-land map-land--hisp ${focus === "hispanic" ? "is-tint" : ""}" d="${WORLD.hispanic}"/>
        ${shapes}
      </svg>
      ${dotHtml}${pinHtml}${quizHtml}
    </div>`;
}

/** After the pins are in the DOM: move labels so they don't overlap each other, cover another
 * place's dot or leave the frame. Crowded pins try the side facing away from their neighbour first. */
export function wireMapPins(root) {
  const frame = root.querySelector(".map-frame--pins");
  if (!frame) return;
  frame.classList.add("is-placing"); // no transitions while measuring (labels change side)
  const fr = frame.getBoundingClientRect();
  const pins = [...frame.querySelectorAll(".map-pin")];
  const dots = pins.map((p) => p.querySelector(".map-pin__dot").getBoundingClientRect());
  const centre = (r) => [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
  const area = (r, q) => Math.max(0, Math.min(r.right, q.right) - Math.max(r.left, q.left)) * Math.max(0, Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top));
  const placed = [];
  pins.forEach((pin, i) => {
    const [cx, cy] = centre(dots[i]);
    let near = null, nd = Infinity; // nearest other dot: try the side away from it first
    dots.forEach((d, j) => { if (j === i) return; const [x, y] = centre(d); const dd = Math.hypot(x - cx, y - cy); if (dd < nd) { nd = dd; near = [x, y]; } });
    let sides = ["below", "above", "right", "left"];
    if (near && nd < 140) {
      const dx = cx - near[0], dy = cy - near[1];
      const score = { right: dx, left: -dx, below: dy, above: -dy };
      sides = sides.sort((a, b) => score[b] - score[a]);
    }
    pin.querySelector(".map-pin__label").style.translate = "";
    let best = null;
    for (const side of sides) {
      pin.dataset.side = side;
      const r = pin.querySelector(".map-pin__label").getBoundingClientRect();
      const outside = Math.max(0, fr.left - r.left) + Math.max(0, r.right - fr.right) + Math.max(0, fr.top - r.top) + Math.max(0, r.bottom - fr.bottom);
      const overlap = placed.reduce((t, q) => t + area(r, q), 0);
      const onDots = dots.reduce((t, d, j) => t + (j === i ? 0 : area(r, d)), 0);
      const cost = outside * 50 + overlap + onDots * 6;
      if (!best || cost < best.cost) best = { side, cost, r };
      if (cost === 0) break;
    }
    pin.dataset.side = best.side;
    // Still poking out of the frame (a long name near the edge): slide the label back inside.
    const label = pin.querySelector(".map-pin__label");
    const r = best.r, m = 4;
    const dx = r.left < fr.left + m ? fr.left + m - r.left : r.right > fr.right - m ? fr.right - m - r.right : 0;
    const dy = r.top < fr.top + m ? fr.top + m - r.top : r.bottom > fr.bottom - m ? fr.bottom - m - r.bottom : 0;
    label.style.translate = dx || dy ? `${Math.round(dx)}px ${Math.round(dy)}px` : "";
    placed.push(label.getBoundingClientRect());
  });
  frame.classList.remove("is-placing");
}

/**
 * After the quiz markers are in the DOM: push apart rings closer than MIN px (small
 * neighbours such as Cuba and the Dominican Republic on a phone), keep them inside the
 * frame, draw a leader line from each moved ring to its real spot, and let a tap on a
 * tinted country choose that country's ring (bigger targets for big countries; islands are
 * chosen by their ring only). onPick(markerButton) is called with the chosen ring.
 */
export function wireMapQuiz(root, onPick) {
  const frame = root.querySelector(".map-frame--quiz");
  if (!frame) return;
  const W = frame.clientWidth, H = frame.clientHeight;
  const MIN = 50, R = 24;
  const marks = [...frame.querySelectorAll(".map-mark")];
  const pts = marks.map((m) => ({ m, ax: (+m.dataset.x / 100) * W, ay: (+m.dataset.y / 100) * H }));
  const clamp = (p) => { p.x = Math.min(W - R, Math.max(R, p.x)); p.y = Math.min(H - R, Math.max(R, p.y)); };
  pts.forEach((p) => { p.x = p.ax; p.y = p.ay; clamp(p); });
  for (let it = 0; it < 60; it++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j];
      let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      if (d >= MIN) continue;
      if (d < 0.01) { dx = 1; dy = 0.3; d = Math.hypot(dx, dy); }
      const push = (MIN - d) / 2 + 0.5;
      a.x -= (dx / d) * push; a.y -= (dy / d) * push;
      b.x += (dx / d) * push; b.y += (dy / d) * push;
      moved = true;
    }
    pts.forEach(clamp);
    if (!moved) break;
  }
  for (const p of pts) {
    p.m.style.left = `${(p.x / W) * 100}%`;
    p.m.style.top = `${(p.y / H) * 100}%`;
    const len = Math.hypot(p.x - p.ax, p.y - p.ay);
    const line = frame.querySelector(`[data-leader="${p.m.dataset.oi}"]`);
    const anchor = frame.querySelector(`[data-anchor="${p.m.dataset.oi}"]`);
    if (len > 8) {
      p.m.classList.add("is-moved");
      line.style.cssText = `left:${(p.ax / W) * 100}%;top:${(p.ay / H) * 100}%;width:${Math.max(0, len - R + 2)}px;transform:rotate(${Math.atan2(p.y - p.ay, p.x - p.ax)}rad)`;
      line.hidden = false; anchor.hidden = false;
    }
  }
  // A tap on a tinted country = that country's ring (the nearest, if it has more than one).
  frame.querySelector(".map-svg").addEventListener("click", (e) => {
    const shape = e.target.closest?.(".map-shape.is-tint")?.dataset.shape;
    if (!shape) return;
    const r = frame.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const cands = pts.filter((p) => PLACES[p.m.dataset.place].shape === shape && !PLACES[p.m.dataset.place].island && !p.m.disabled);
    if (!cands.length) return;
    const best = cands.reduce((a, b) => (Math.hypot(a.ax - x, a.ay - y) <= Math.hypot(b.ax - x, b.ay - y) ? a : b));
    onPick?.(best.m);
  });
}
