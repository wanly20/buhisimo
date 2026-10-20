// Prototype progress, kept in localStorage (wrapped: storage may be blocked).
// Spaced repetition, "My knowledge" and the progress file follow the Spreadsheets
// practice app (ict_teaching/spreadsheet_app/js/store.js): same engine family.
const KEY = "buhisimo.prototype.v1";
const SNOOZE_MS = 15 * 60 * 1000;
const DAY = 864e5;
// Leitner boxes: a first-try right answer moves an item up a box and it comes back
// after this many days; a wrong answer sends it back to box 0 (due again today).
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];

const defaults = () => ({
  xp: 0,
  streak: 0,
  lastPracticeDay: null, // "YYYY-MM-DD" (local)
  completed: {},         // nodeId -> { xp, accuracy, at, plays }
  items: {},             // itemId -> { box, due, seen, right, wrong }
  sessions: 0,           // finished lessons and reviews (for the "download your progress" tip)
  font: "fredoka",
  sfx: true,
  speakOffUntil: 0,      // timestamp (ms); speaking exercises snoozed until then
  listenOffUntil: 0,
  voiceMaria: "maria_bogota", // recorded-voice test: maria_bogota | maria_paisa
  voiceBuho: "buho_profesor", // buho_profesor | buho_abuelo
  unlockAll: false,      // teacher preview: every lesson open (?unlock=all, see js/app.js)
  teacher: false,        // show the "For teachers" settings (?unlock=all or ?teacher=1)
  robotVoice: false,     // computer voice for lines that aren't recorded yet
});

export const PROGRESS_FILE = { app: "buhisimo", version: 1 };

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    return defaults();
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
}

export const store = {
  get: () => state,
  set(patch) { state = { ...state, ...patch }; save(); return state; },
  reset() { state = { ...defaults(), font: state.font, voiceMaria: state.voiceMaria, voiceBuho: state.voiceBuho, unlockAll: state.unlockAll, teacher: state.teacher }; save(); return state; },

  speakOn: () => Date.now() >= state.speakOffUntil,
  listenOn: () => Date.now() >= state.listenOffUntil,
  snoozeSpeak() { store.set({ speakOffUntil: Date.now() + SNOOZE_MS }); },
  snoozeListen() { store.set({ listenOffUntil: Date.now() + SNOOZE_MS }); },

  /** Record a finished lesson or review: XP, streak (days in a row), completion. */
  finishLesson(nodeId, xp, accuracy) {
    const today = dayKey(new Date());
    const yesterday = dayKey(new Date(Date.now() - DAY));
    let streak = state.streak;
    if (state.lastPracticeDay === today) streak = Math.max(streak, 1);
    else if (state.lastPracticeDay === yesterday) streak += 1;
    else streak = 1;
    const prev = state.completed[nodeId];
    const completed = nodeId ? { ...state.completed, [nodeId]: { xp: (prev?.xp || 0) + xp, accuracy: Math.max(accuracy, prev?.accuracy || 0), at: Date.now(), plays: (prev?.plays || 0) + 1 } } : state.completed;
    return store.set({ xp: state.xp + xp, streak, lastPracticeDay: today, completed, sessions: (state.sessions || 0) + 1 });
  },

  /** An item was met (new-word card): it enters Review, due tomorrow. */
  meet(itemId) {
    if (state.items[itemId]) return;
    const now = Date.now();
    state = { ...state, items: { ...state.items, [itemId]: { box: 0, due: now + DAY, seen: now, right: 0, wrong: 0 } } };
    save();
  },

  /** One graded answer for an item (only first tries move it up a box). */
  grade(itemId, ok, { firstTry = true } = {}) {
    const now = Date.now();
    const it = { box: 0, due: now, seen: now, right: 0, wrong: 0, ...state.items[itemId] };
    it.seen = now;
    if (ok) {
      it.right++;
      if (firstTry) it.box = Math.min(INTERVAL_DAYS.length - 1, it.box + 1);
    } else {
      it.wrong++;
      it.box = 0;
    }
    it.due = now + INTERVAL_DAYS[it.box] * DAY;
    state = { ...state, items: { ...state.items, [itemId]: it } };
    save();
  },

  /** How much an item needs practice: higher = sooner. Unseen items return -1. */
  need(itemId, now = Date.now()) {
    const it = state.items[itemId];
    if (!it) return -1;
    const overdue = Math.max(0, now - it.due) / DAY;
    return (it.due <= now ? 10 : 0) + (5 - it.box) * 2 + Math.min(it.wrong, 5) + Math.min(overdue, 5);
  },

  isDue: (itemId, now = Date.now()) => !!state.items[itemId] && state.items[itemId].due <= now,

  /** Strength for "My knowledge": null (not met yet), "learnt", "getting", "review". */
  strength(itemId, now = Date.now()) {
    const it = state.items[itemId];
    if (!it) return null;
    if (it.box >= 3 && it.due > now - 3 * DAY) return "learnt";
    if (it.box >= 1 && it.due > now - DAY) return "getting";
    return "review";
  },

  /** The streak shown today: 0 if the last practice was before yesterday. */
  liveStreak() {
    const today = dayKey(new Date()), yesterday = dayKey(new Date(Date.now() - DAY));
    return state.lastPracticeDay === today || state.lastPracticeDay === yesterday ? state.streak : 0;
  },

  /** Replace everything with progress from a file (already checked by readProgressFile). */
  replace(progress) { state = { ...defaults(), font: state.font, voiceMaria: state.voiceMaria, voiceBuho: state.voiceBuho, ...progress }; save(); return state; },

  /** The text of a progress file: a friendly first line, then the data. */
  progressFileText() {
    const { xp, streak, lastPracticeDay, completed, items, sessions } = state;
    return "Buhísimo: progress file. Keep it safe and load it on another device (Me → Load my progress).\n\n" +
      JSON.stringify({ ...PROGRESS_FILE, saved: new Date().toISOString(), progress: { xp, streak, lastPracticeDay, completed, items, sessions } }, null, 1) + "\n";
  },
};

/** Check a progress file. Returns { progress, saved } or { error } (a kind sentence). */
export function readProgressFile(text) {
  const bad = { error: "That file isn't a Buhísimo progress file. Choose the file you downloaded: its name starts with “buhisimo-progress”." };
  const damaged = { error: "That progress file is damaged, so it can't be loaded. Try downloading it again on the device where you practised." };
  if (typeof text !== "string" || text.length > 2e6) return bad;
  const start = text.indexOf("{");
  if (start < 0) return bad;
  let data;
  try { data = JSON.parse(text.slice(start)); } catch { return damaged; }
  if (!data || data.app !== PROGRESS_FILE.app) return bad;
  if (data.version > PROGRESS_FILE.version) return { error: "That progress file comes from a newer version of Buhísimo. Reload the page and try again." };
  const p = data.progress;
  const isObj = (o) => o && typeof o === "object" && !Array.isArray(o);
  if (!isObj(p) || typeof p.xp !== "number" || p.xp < 0 || !isObj(p.completed) || !isObj(p.items)) return damaged;
  const clean = {
    xp: Math.round(p.xp), streak: Math.max(0, Math.round(+p.streak || 0)),
    lastPracticeDay: typeof p.lastPracticeDay === "string" && /^\d{4}-\d\d-\d\d$/.test(p.lastPracticeDay) ? p.lastPracticeDay : null,
    completed: {}, items: {}, sessions: Math.max(0, Math.round(+p.sessions || 0)),
  };
  for (const [k, v] of Object.entries(p.completed)) if (/^[\d.]+-\d+$/.test(k) && isObj(v)) clean.completed[k] = { xp: +v.xp || 0, accuracy: Math.min(100, +v.accuracy || 0), at: +v.at || 0, plays: Math.max(1, +v.plays || 1) };
  for (const [k, v] of Object.entries(p.items)) if (/^[a-z0-9-]+$/.test(k) && isObj(v) && Number.isFinite(v.box)) clean.items[k] = { box: Math.min(5, Math.max(0, Math.round(v.box))), due: +v.due || 0, seen: +v.seen || 0, right: +v.right || 0, wrong: +v.wrong || 0 };
  return { progress: clean, saved: data.saved };
}

export function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function untilLabel(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
