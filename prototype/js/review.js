// Review (spaced repetition) and "My knowledge", the same engine family as the
// Spreadsheets practice app (ict_teaching/spreadsheet_app): Leitner boxes in
// store.js, weakest/due items first, one matching game per session.
import { ITEMS, LESSONS } from "../unit-1-1.js";
import { store } from "./store.js";
import { icon } from "./icons.js";
import { esc, es, button, shuffle, charImg } from "./ui.js";
import { hasAudio } from "./lesson.js";

// ------------------------------------------------------------------ item matching
const toks = (s) => String(s).normalize("NFC").toLowerCase().replace(/[¡!¿?.,;:"“”'‘’…—–()]/g, " ").split(/\s+/).filter(Boolean);
const FORMS = ITEMS.map((it) => ({ id: it.id, forms: (it.formsEs || [it.es]).map(toks) }));

/** The item ids that appear in a Spanish text (longest match first, so "soy de" beats "es"). */
export function itemsIn(text) {
  const t = toks(text), found = new Set();
  const cands = FORMS.flatMap((f) => f.forms.map((form) => ({ id: f.id, form }))).sort((a, b) => b.form.length - a.form.length);
  const used = new Array(t.length).fill(false);
  for (const { id, form } of cands) {
    for (let i = 0; i + form.length <= t.length; i++) {
      if (form.every((w, k) => t[i + k] === w && !used[i + k])) { found.add(id); form.forEach((_, k) => (used[i + k] = true)); }
    }
  }
  return [...found];
}

/** Spanish texts a graded step practises. */
function gradedTexts(step) {
  switch (step.type) {
    case "pick": return [step.promptEs];
    case "listen": return [step.sayEs];
    case "tiles": return step.lines ? [] : [step.fullEs];
    case "type": case "passport": return [step.answerEs];
    case "match": return step.pairs.map((p) => p.es);
    case "choose": return [step.answerEs || step.promptEs || step.optionsEs?.[step.answer]].filter(Boolean);
    case "gap": return [step.es];
    case "sort": return step.cards.map((c) => c.es);
    case "maptap": return [step.sayEs];
    case "speak": return [step.es];
    default: return [];
  }
}

/** Called by the lesson runner for each first-try answer. */
export function gradeStep(step, ok) {
  const ids = new Set(gradedTexts(step).flatMap(itemsIn));
  for (const id of ids) store.grade(id, ok);
}

/** New-word cards: the items a lesson introduces enter Review. */
export function meetLesson(lesson) {
  for (const it of ITEMS) if (it.lesson === lesson.n) store.meet(it.id);
}

export const metItems = () => ITEMS.filter((it) => store.get().items[it.id]);
export const dueItems = () => metItems().filter((it) => store.isDue(it.id));

// ------------------------------------------------------------------ sentence bank
// Every Spanish line with its English, from the lessons the student has finished.
function sentenceBank() {
  const done = store.get().completed;
  const out = new Map();
  const add = (e, n) => { if (e && n && /[.?!]$/.test(e) && !out.has(e)) out.set(e, n); };
  for (const l of LESSONS) {
    if (!done[l.id]) continue;
    for (const s of l.steps) {
      add(s.es, s.en); add(s.exampleEs, s.exampleEn); add(s.sayEs, s.en); add(s.fullEs, s.en);
      if (s.type === "pick") add(s.promptEs, s.options[s.answer]);
      if (s.type === "type") add(s.answerEs, s.en);
    }
  }
  return [...out].map(([es_, en]) => ({ es: es_, en }));
}

// ------------------------------------------------------------------ session
const pickN = (arr, n, not) => shuffle(arr.filter((x) => !not.includes(x))).slice(0, n);

function exercisesFor(it, pool, bank, k) {
  const others = pool.filter((o) => o.id !== it.id);
  const allOthers = ITEMS.filter((o) => o.id !== it.id);
  const distract = (n) => pickN(others.length >= n ? others : allOthers, n, []);
  const display = it.formsEs ? it.formsEs[0] : it.es;
  const list = [];
  list.push({ id: `r-pick-${it.id}-${k}`, type: "pick", character: "owl-thinking", promptEs: display,
    options: [it.en, ...distract(3).map((o) => o.en)], answer: 0 });
  list.push({ id: `r-choose-${it.id}-${k}`, type: "choose", titleEn: "Which one is it in Spanish?", character: "owl-explaining", promptEn: it.en,
    optionsEs: [display, ...distract(3).map((o) => (o.formsEs ? o.formsEs[0] : o.es))], answer: 0 });
  if (!it.formsEs && !["es", "no", "el"].includes(it.id)) list.push({ id: `r-type-${it.id}-${k}`, type: "type", en: it.en, answerEs: it.es });
  if (hasAudio(it.es)) list.push({ id: `r-listen-${it.id}-${k}`, type: "listen", sayEs: it.es, en: it.en,
    optionsEs: [it.es, ...distract(3).map((o) => o.es)], answer: 0 });
  const withIt = bank.filter((s) => itemsIn(s.es).includes(it.id));
  if (withIt.length) {
    const s = withIt[Math.floor(Math.random() * withIt.length)];
    const wrong = pickN(bank.map((b) => b.en), 3, [s.en]);
    if (wrong.length === 3) list.push({ id: `r-sent-${it.id}-${k}`, type: "pick", character: "owl-explaining", promptEs: s.es, options: [s.en, ...wrong], answer: 0 });
  }
  return list;
}

/** A review lesson: due and weak items first, about 10 questions plus a matching game. */
export function buildReview({ count = 9 } = {}) {
  const met = metItems();
  const ranked = met.map((it) => [store.need(it.id) + Math.random() * 3, it]).sort((a, b) => b[0] - a[0]).map((p) => p[1]);
  const chosen = ranked.slice(0, count);
  const bank = sentenceBank();
  const steps = chosen.map((it, k) => { const ex = exercisesFor(it, met, bank, k); return ex[Math.floor(Math.random() * ex.length)]; });
  // Short sessions: a second question on the weakest items.
  for (let i = 0; steps.length < Math.min(8, met.length * 2) && i < chosen.length; i++) {
    const ex = exercisesFor(chosen[i], met, bank, i + 50);
    steps.push(ex[Math.floor(Math.random() * ex.length)]);
  }
  const matchable = chosen.filter((it) => it.en.length < 26);
  if (matchable.length >= 4) {
    steps.splice(Math.min(steps.length, 3), 0, { id: "r-match", type: "match",
      pairs: shuffle(matchable).slice(0, 5).map((it) => ({ es: it.formsEs ? it.formsEs[0] : it.es, en: it.en })) });
  }
  const first = LESSONS[0];
  return {
    id: null, unit: "1.1", n: 0, kind: "review", titleEn: "Review", xpBase: 5,
    sayAs: first.sayAs, praiseEs: first.praiseEs, praiseEn: first.praiseEn, encourageEn: first.encourageEn, kindEn: first.kindEn,
    canDoEn: "Every review makes these words stronger.", learnedEs: chosen.slice(0, 6).map((it) => it.formsEs ? it.formsEs[0] : it.es),
    steps,
  };
}

// ------------------------------------------------------------------ My knowledge
const STRENGTH = {
  learnt: { label: "Learnt", icon: "check" },
  getting: { label: "Getting there", icon: "target" },
  review: { label: "Needs review", icon: "repeat" },
};

export function reviewViewHtml() {
  const met = metItems(), due = dueItems();
  const counts = { learnt: 0, getting: 0, review: 0 };
  met.forEach((it) => counts[store.strength(it.id)]++);
  const row = (it) => {
    const s = store.strength(it.id);
    const say = hasAudio(it.es) ? `<button class="kb-say" data-say="${esc(it.es)}" aria-label="Play ${esc(it.es)}">${icon("volume-2", 18, 2.5)}</button>` : "";
    const shown = it.formsEs ? it.formsEs.join(" · ") : it.es;
    if (!s) return `<li class="kb-item is-locked"><span class="kb-term">${icon("lock", 15, 2.75)} <span class="kb-hidden">${esc(shown.replace(/[^\s·]/g, "•"))}</span></span><span class="kb-def">${esc(it.en)}</span><span class="kb-strength kb-strength--locked">Lesson ${it.lesson}</span></li>`;
    return `<li class="kb-item"><span class="kb-term">${say}${es(shown)}</span><span class="kb-def">${esc(it.en)}</span><span class="kb-strength kb-strength--${s}">${icon(STRENGTH[s].icon, 14, 3)} ${STRENGTH[s].label}</span></li>`;
  };
  const byLesson = LESSONS.filter((l) => ITEMS.some((it) => it.lesson === l.n));
  return `
    <div class="view view-review">
      <header class="view-hero view-hero--review">
        ${charImg(due.length ? "owl-thinking" : "owl-celebrating", "view-hero__owl")}
        <div class="view-hero__text">
          <span class="panel-kicker">${icon("repeat", 16, 2.75)} Review</span>
          <h1 class="h-title" tabindex="-1">${met.length ? (due.length ? `${due.length} word${due.length === 1 ? "" : "s"} to refresh` : "All fresh for now") : "Nothing to review yet"}</h1>
          <p class="view-sub">${met.length ? "Review picks the words you got wrong or haven't seen for a while. Five minutes is enough." : "Finish your first lesson. Then Review brings back the words you find tricky."}</p>
          ${met.length ? button(due.length ? "Start review" : "Practise anyway", { variant: "magenta", block: false, attrs: "data-start-review", ico: "repeat" }) : `<a class="press btn btn--primary" href="#/"><span class="face">${icon("map", 22, 2.75)}<span>Go to the path</span></span></a>`}
        </div>
      </header>
      <section class="kb" aria-labelledby="kb-h">
        <div class="kb-head">
          <h2 class="kb-title" id="kb-h">My knowledge</h2>
          <div class="kb-counts">
            <span class="kb-count kb-strength--learnt">${icon("check", 14, 3)} ${counts.learnt} learnt</span>
            <span class="kb-count kb-strength--getting">${icon("target", 14, 3)} ${counts.getting} getting there</span>
            <span class="kb-count kb-strength--review">${icon("repeat", 14, 3)} ${counts.review} to review</span>
          </div>
        </div>
        ${byLesson.map((l) => `
          <div class="kb-lesson">
            <h3 class="kb-lesson__title"><span class="kb-lesson__n">${l.n}</span>${l.titleEs ? es(l.titleEs) : esc(l.titleEn)}</h3>
            <ul class="kb-list">${ITEMS.filter((it) => it.lesson === l.n).map(row).join("")}</ul>
          </div>`).join("")}
      </section>
    </div>`;
}
