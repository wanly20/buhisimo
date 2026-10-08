// Placeholder audio (speechSynthesis) and speaking practice (SpeechRecognition).
// Real recorded audio replaces tts.speak() later; the call sites stay the same.

const VOICE_PREFS = ["es-CO", "es-US", "es-MX", "es-419", "es-ES"];
const REC_LANGS = ["es-CO", "es-ES", "es-US"];

let voices = [];
function refreshVoices() {
  try { voices = window.speechSynthesis?.getVoices() || []; } catch { voices = []; }
}
if ("speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

function pickVoice() {
  if (!voices.length) refreshVoices();
  const norm = (l) => (l || "").replace("_", "-").toLowerCase();
  for (const pref of VOICE_PREFS) {
    const v = voices.find((x) => norm(x.lang) === pref.toLowerCase());
    if (v) return v;
  }
  return voices.find((x) => norm(x.lang).startsWith("es")) || null;
}

export const tts = {
  available: () => "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
  voiceName() { const v = pickVoice(); return v ? `${v.name} (${v.lang})` : "default Spanish voice"; },

  /** Speak Spanish text. Resolves when finished (or after a safety timeout). */
  speak(text, { slow = false, sayAs = {} } = {}) {
    if (!tts.available()) return Promise.resolve(false);
    let spoken = text;
    for (const [word, say] of Object.entries(sayAs)) spoken = spoken.replaceAll(word, say);
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(spoken);
        const v = pickVoice();
        if (v) u.voice = v;
        u.lang = v?.lang || "es-ES";
        u.rate = slow ? 0.75 : 0.95;
        u.pitch = 1;
        let done = false;
        const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
        u.onend = () => finish(true);
        u.onerror = () => finish(false);
        setTimeout(() => finish(true), 1200 + spoken.length * (slow ? 140 : 100));
        synth.speak(u);
      } catch {
        resolve(false);
      }
    });
  },
  stop() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } },
};

// ---------------------------------------------------------------- recognition
const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;

export const stt = {
  available: () => !!Rec,

  /**
   * Listen once. Resolves { ok: true, heard: [alternatives] } or
   * { ok: false, error } (no-speech, not-allowed, network, unsupported…).
   */
  listen({ onStart } = {}) {
    if (!Rec) return Promise.resolve({ ok: false, error: "unsupported" });
    const tryLang = (i) => new Promise((resolve) => {
      let rec;
      try {
        rec = new Rec();
      } catch {
        resolve({ ok: false, error: "unsupported" });
        return;
      }
      stt._current = rec;
      rec.lang = REC_LANGS[i];
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.continuous = false;
      let settled = false;
      const done = (r) => { if (!settled) { settled = true; stt._current = null; resolve(r); } };
      rec.onstart = () => onStart?.();
      rec.onresult = (e) => {
        const res = e.results[0];
        const heard = [];
        for (let k = 0; k < res.length; k++) heard.push(res[k].transcript);
        done({ ok: true, heard });
      };
      rec.onerror = (e) => {
        if (e.error === "language-not-supported" && i + 1 < REC_LANGS.length) {
          settled = true;
          tryLang(i + 1).then(resolve);
        } else done({ ok: false, error: e.error || "error" });
      };
      rec.onend = () => done({ ok: false, error: "no-speech" });
      try { rec.start(); } catch { done({ ok: false, error: "busy" }); }
      setTimeout(() => { try { rec.stop(); } catch { /* ignore */ } }, 8000);
    });
    return tryLang(0);
  },
  stop() { try { stt._current?.stop(); } catch { /* ignore */ } },
  _current: null,
};

// ---------------------------------------------------------------- matching helpers
export function fold(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[¡!¿?.,;:"“”'‘’…]/g, " ").replace(/\s+/g, " ").trim();
}

/** Lenient speech match: every expected word appears, in order. */
export function speechMatches(expected, heardList) {
  const want = fold(expected).split(" ");
  return heardList.some((h) => {
    const got = fold(h).split(" ");
    let j = 0;
    for (const w of got) if (w === want[j] || (want[j] && similar(w, want[j]))) j++;
    return j >= want.length;
  });
}

function similar(a, b) {
  if (Math.abs(a.length - b.length) > 2) return false;
  // one edit away is close enough for beginners (e.g. "australia" / "austral1a")
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}
