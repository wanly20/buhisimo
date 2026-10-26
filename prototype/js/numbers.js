// Numbers 0–31 (Unit 1.3) and the «con números» (numerals) view of a sung line.
// No DOM here: unit-1-3.js (read by the Node checker) and js/exercises-1-3.js both use it.

/** The Spanish word for 0–31, as the course teaches it (vocabulary_database.csv, 1.3). */
export const NUM_ES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte",
  "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
  "treinta", "treinta y uno"];

const VALUE = new Map(NUM_ES.map((w, n) => [w, n]));
const PARTS = /^([¡¿«"“]*)(.*?)([.,:;!?…»"”]*)$/u;
const bare = (w) => PARTS.exec(w)[2].toLowerCase();

/** The number a written word stands for (punctuation and capitals ignored), or null. */
export const numberOf = (word) => (VALUE.has(bare(word)) ? VALUE.get(bare(word)) : null);

/**
 * The tokens of a sung line, as words (letras) or with the numbers as digits (con números).
 * Each token lists the indexes of the sung words it covers, so the aligned word timings still
 * light it up: «¡treinta y uno!» is one token (¡31!) covering three sung words.
 *   tokens("cuatro, cinco: ¡muy bien!", true) -> 4, | 5: | ¡muy | bien!
 */
export function tokens(line, numerals = false) {
  const words = line.split(/\s+/).filter(Boolean);
  if (!numerals) return words.map((text, i) => ({ text, words: [i], n: null }));
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const three = words.slice(i, i + 3);
    if (three.length === 3 && three.map(bare).join(" ") === "treinta y uno") {
      const [, lead] = PARTS.exec(three[0]), [, , , trail] = PARTS.exec(three[2]);
      out.push({ text: `${lead}31${trail}`, words: [i, i + 1, i + 2], n: 31 });
      i += 2;
      continue;
    }
    const n = numberOf(words[i]);
    if (n == null) { out.push({ text: words[i], words: [i], n: null }); continue; }
    const [, lead, , trail] = PARTS.exec(words[i]);
    out.push({ text: `${lead}${n}${trail}`, words: [i], n });
  }
  return out;
}
