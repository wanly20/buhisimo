// Prototype progress, kept in localStorage (wrapped: storage may be blocked).
const KEY = "buhisimo.prototype.v1";
const SNOOZE_MS = 15 * 60 * 1000;

const defaults = () => ({
  xp: 0,
  streak: 0,
  lastPracticeDay: null, // "YYYY-MM-DD" (local)
  completed: {},         // nodeId -> { xp, accuracy, at }
  font: "fredoka",
  sfx: true,
  speakOffUntil: 0,      // timestamp (ms); speaking exercises snoozed until then
  listenOffUntil: 0,
});

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
  reset() { state = { ...defaults(), font: state.font }; save(); return state; },

  speakOn: () => Date.now() >= state.speakOffUntil,
  listenOn: () => Date.now() >= state.listenOffUntil,
  snoozeSpeak() { store.set({ speakOffUntil: Date.now() + SNOOZE_MS }); },
  snoozeListen() { store.set({ listenOffUntil: Date.now() + SNOOZE_MS }); },

  /** Record a finished lesson: XP, streak (days in a row), completion. */
  finishLesson(nodeId, xp, accuracy) {
    const today = dayKey(new Date());
    const yesterday = dayKey(new Date(Date.now() - 864e5));
    let streak = state.streak;
    if (state.lastPracticeDay === today) streak = Math.max(streak, 1);
    else if (state.lastPracticeDay === yesterday) streak += 1;
    else streak = 1;
    const completed = { ...state.completed, [nodeId]: { xp, accuracy, at: Date.now() } };
    return store.set({ xp: state.xp + xp, streak, lastPracticeDay: today, completed });
  },
};

export function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function untilLabel(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
