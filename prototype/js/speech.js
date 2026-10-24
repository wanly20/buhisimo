// Audio: recorded clips (audio/manifest.json) with speechSynthesis as the fallback,
// plus speaking practice (SpeechRecognition).
import { store } from "./store.js";

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

// ---------------------------------------------------------------- recorded clips
// manifest.clips: Spanish text -> { voiceId: "audio/<voice>/<file>.mp3" }.
// Roles: "maria" | "raul" | "max" | "matilda" | "caller" | "buho". María and Buhísimo have two
// test voices each (Settings → Voices (test)); Raúl (Papá), Max (his kid voice, Juan 21 Oct 2026)
// and Matilda (her kid voice, Juan 24 Oct 2026) have one. Each Radio Búho caller has a voice of
// their own ("caller_<country>", manifest-callers.json); role "caller" plays whichever caller
// voice recorded that line (every call is said by one caller).
export const VOICE_OPTIONS = {
  maria: [{ id: "maria_bogota", label: "Bogotá" }, { id: "maria_paisa", label: "Paisa" }],
  buho: [{ id: "buho_profesor", label: "Profesor" }, { id: "buho_abuelo", label: "Abuelo" }],
};
const FALLBACK_ROLES = { maria: ["maria", "raul"], raul: ["raul", "maria"], max: ["max", "raul", "maria"], matilda: ["matilda", "maria", "raul"],
  caller: ["caller", "maria", "raul"], buho: ["buho", "maria", "raul"] };

// audio/manifest.json is written by lesson_audio.py; audio/manifest-extra.json holds
// clips copied from the voice-design test (tools/import_design_clips.py); audio/manifest-l2.json
// holds the Unit 1.1 lines recorded from TODO_lines.json (same pipeline); audio/manifest-max.json
// holds Max's lines in his own voice (video_generation/scripts/voice_tools/max_voice.py and u12_audio.py);
// audio/manifest-matilda.json Matilda's in hers and audio/manifest-callers.json the Radio Búho
// callers' (u12_audio.py). Merged here.
let manifest = null;
const getJson = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const manifestReady = Promise.all([getJson("audio/manifest.json"), getJson("audio/manifest-extra.json"), getJson("audio/manifest-l2.json"), getJson("audio/manifest-max.json"),
  getJson("audio/manifest-matilda.json"), getJson("audio/manifest-callers.json")])
  .then(([main, ...extras]) => {
    const clips = {};
    for (const m of [main, ...extras]) for (const [text, byVoice] of Object.entries(m?.clips || {})) clips[text] = { ...clips[text], ...byVoice };
    manifest = { ...(main || {}), clips };
    return manifest;
  });

function voiceFor(role) {
  const s = store.get();
  if (role === "raul") return "raul";
  if (role === "max") return "max";
  if (role === "matilda") return "matilda";
  if (role === "buho") return VOICE_OPTIONS.buho.some((v) => v.id === s.voiceBuho) ? s.voiceBuho : VOICE_OPTIONS.buho[0].id;
  return VOICE_OPTIONS.maria.some((v) => v.id === s.voiceMaria) ? s.voiceMaria : VOICE_OPTIONS.maria[0].id;
}

/** The recorded clip for this text in this role (or the closest voice that has one). */
function clipFor(text, role = "maria") {
  const byVoice = manifest?.clips?.[text];
  if (!byVoice) return null;
  for (const r of FALLBACK_ROLES[role] || FALLBACK_ROLES.maria) {
    const src = r === "caller" ? byVoice[Object.keys(byVoice).find((v) => v.startsWith("caller_"))] : byVoice[voiceFor(r)];
    if (src) return src;
  }
  return null;
}

// Clips are fetched once into blob URLs: tiny files, instant replays, and no
// half-loaded media requests when one clip interrupts another.
const blobs = new Map();
function blobUrl(src) {
  if (!blobs.has(src)) {
    blobs.set(src, fetch(src).then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => URL.createObjectURL(b))
      .catch(() => { blobs.delete(src); return null; }));
  }
  return blobs.get(src);
}

const player = typeof Audio !== "undefined" ? new Audio() : null;
let playToken = 0;
let endCurrent = null;

function playClip(url, slow) {
  return new Promise((resolve) => {
    const token = ++playToken;
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      player.onended = player.onerror = null;
      if (endCurrent === finish) endCurrent = null;
      resolve(ok);
    };
    endCurrent = finish;
    try {
      player.pause();
      player.src = url;
      player.preservesPitch = true;
      player.webkitPreservesPitch = true;
      player.defaultPlaybackRate = player.playbackRate = slow ? 0.75 : 1;
      player.onended = () => finish(true);
      player.onerror = () => finish(false);
      const p = player.play();
      if (p?.catch) p.catch(() => finish(false));
      setTimeout(() => { if (token === playToken) finish(true); }, 12000);
    } catch {
      finish(false);
    }
  });
}

export const tts = {
  available: () => !!player || synthAvailable(),
  voiceName() { const v = pickVoice(); return v ? `${v.name} (${v.lang})` : "default Spanish voice"; },
  /** True when this text has a recorded clip (any voice). Lines without one show
   *  an "audio coming" state instead of a computer voice (Buhísimo v2, Oct 2026). */
  hasClip: (text) => !!manifest?.clips?.[text],
  /** Every recorded clip path (for the service worker and tests). */
  clipPaths: () => Object.values(manifest?.clips || {}).flatMap((v) => Object.values(v)),
  ready: () => manifestReady,

  /**
   * Speak Spanish text: the recorded clip for `role` ("maria" | "raul" | "max" | "matilda" | "caller" | "buho")
   * when there is one, otherwise speechSynthesis. Resolves when finished.
   */
  async speak(text, { slow = false, sayAs = {}, role = "maria" } = {}) {
    tts.stop();
    const token = speakToken;
    await manifestReady;
    const src = player && clipFor(text, role);
    if (src) {
      const url = await blobUrl(src);
      if (token !== speakToken) return false; // something newer started meanwhile
      if (url) return playClip(url, slow);
    }
    if (token !== speakToken) return false;
    // No recording yet: silence ("audio coming"), unless the teacher turned the
    // computer voice on in Settings.
    if (!store.get().robotVoice) return false;
    return synthSpeak(text, { slow, sayAs });
  },
  stop() {
    speakToken++;
    try { player?.pause(); } catch { /* ignore */ }
    endCurrent?.(false);
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  },
};

let speakToken = 0;
function synthAvailable() { return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"; }

function synthSpeak(text, { slow = false, sayAs = {} } = {}) {
  if (!synthAvailable()) return Promise.resolve(false);
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
}

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
    .replace(/[¡!¿?.,;:"“”'‘’…—–]/g, " ").replace(/\s+/g, " ").trim();
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
