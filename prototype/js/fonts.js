// Font pairings: a rounded display face for headings/buttons + a highly legible
// face for Spanish learning text. Google Fonts are loaded on demand.
export const pairings = [
  {
    id: "fredoka",
    name: "Fredoka + Atkinson Hyperlegible",
    display: "Fredoka",
    learn: "Atkinson Hyperlegible",
    why: "Default. Atkinson was designed for low-vision readers: I, l and 1 all look different.",
    css: "family=Fredoka:wght@500;600;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400",
  },
  {
    id: "baloo",
    name: "Baloo 2 + Lexend",
    display: "Baloo 2",
    learn: "Lexend",
    why: "Bubblier headings. Lexend is built for reading fluency (wide letter spacing).",
    css: "family=Baloo+2:wght@600;700;800&family=Lexend:wght@400;700",
  },
  {
    id: "nunito",
    name: "Nunito + Andika",
    display: "Nunito",
    learn: "Andika",
    why: "Softer and calmer. Andika is made for children learning to read (clear a, g, I, l).",
    css: "family=Nunito:wght@700;800;900&family=Andika:ital,wght@0,400;0,700;1,400",
  },
];

const loaded = new Set();

export function loadPairing(id) {
  const p = pairings.find((x) => x.id === id) || pairings[0];
  if (!loaded.has(p.id)) {
    loaded.add(p.id);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${p.css}&display=swap`;
    document.head.appendChild(link);
  }
  return p;
}

export function applyFont(id) {
  const p = loadPairing(id);
  if (p.id === "fredoka") document.documentElement.removeAttribute("data-font");
  else document.documentElement.setAttribute("data-font", p.id);
  return p;
}
