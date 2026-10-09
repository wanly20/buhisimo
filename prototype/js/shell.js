// Desktop shell pieces (Chromebook / desktop, ≥1024px): the left sidebar, the
// right progress panel and the "coming soon" cards for sections that aren't
// built yet. The phone never shows the sidebar or panel (css/layout.css hides
// them); the design-system page renders them as components.
import { icon } from "./icons.js";
import { esc, rich, charImg } from "./ui.js";
import { units } from "../path-data.js";
import { lesson } from "../lesson-1-1.js";

export const NAV = [
  { id: "path", label: "Path", icon: "map", href: "#/" },
  { id: "review", label: "Review", icon: "repeat", href: "#/review" },
  { id: "radio", label: "Radio Búho", icon: "radio", href: "#/radio" },
  { id: "profile", label: "Profile", icon: "user", href: "#/profile" },
];

/** Sections that are only placeholders in the prototype. */
export const SOON = {
  review: { title: "Review is coming soon", text: "Buhísimo will pick the words you find tricky, so you can practise them in five minutes.", owl: "owl-thinking", icon: "repeat" },
  radio: { title: "Radio Búho is coming soon", text: "Short listening shows from Salento, with Buhísimo as your host. Perfect for the bus home.", owl: "owl-explaining", icon: "radio" },
  profile: { title: "Your profile is coming soon", text: "See your XP, your streak and every word you've learned so far.", owl: "owl-celebrating", icon: "user" },
};

// Static placeholders until the teacher dashboard exists.
export const CLASS_UNIT = "1.4";
export const WEEK_GOAL_XP = 50;

export function sideNav(active = "path") {
  return `
    <nav class="side-nav" aria-label="Main">
      <a class="side-brand" href="#/" aria-label="Buhísimo, back to the path">
        <span class="brand__avatar side-brand__avatar">${charImg("owl-explaining", "brand__img")}</span>
        <span class="side-brand__name" aria-hidden="true">Buhísimo</span>
      </a>
      <ul class="side-list">
        ${NAV.map((n) => `
          <li><a class="side-item side-item--${n.id}" href="${n.href}" data-view="${n.id}" title="${esc(n.label)}" ${n.id === active ? 'aria-current="page"' : ""}>
            <span class="side-item__icon">${icon(n.icon, 24, 2.5)}</span><span class="side-item__label">${esc(n.label)}</span>
          </a></li>`).join("")}
        <li><button class="side-item side-item--settings" data-nav="settings" title="Settings">
          <span class="side-item__icon">${icon("settings", 24, 2.5)}</span><span class="side-item__label">Settings</span>
        </button></li>
      </ul>
      <a class="side-foot" href="design-system.html" title="Design system">${icon("sparkles", 18, 2.5)}<span class="side-item__label">Design system</span></a>
    </nav>`;
}

/** The right-hand panel: streak + XP, weekly goal, class catch-up, tip. */
export function pathPanel(s) {
  const you = units.find((u) => u.nodes.some((n) => !s.completed[n.id]))?.id || units[0].id;
  const youIdx = units.findIndex((u) => u.id === you);
  const classUnit = units.find((u) => u.id === CLASS_UNIT);
  const week = Math.min(s.xp, WEEK_GOAL_XP);
  const p = week / WEEK_GOAL_XP;
  return `
    <aside class="path-panel" aria-label="Your progress">
      <div class="panel-card panel-stats">
        <div class="pstat pstat--streak ${s.streak ? "" : "is-zero"}">${icon("flame", 30, 2.25)}<span><b>${s.streak}</b><small>day streak</small></span></div>
        <div class="pstat pstat--xp">${icon("zap", 28, 2.25)}<span><b>${s.xp}</b><small>total XP</small></span></div>
      </div>

      <section class="panel-card panel-goal" aria-labelledby="goal-h">
        <div class="goal-ring" role="img" aria-label="${week} of ${WEEK_GOAL_XP} XP this week">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle class="goal-ring__track" cx="32" cy="32" r="26"></circle>
            <circle class="goal-ring__fill" cx="32" cy="32" r="26" pathLength="100" stroke-dasharray="${Math.max(p * 100, 0.01)} 100"></circle>
          </svg>
          <span class="goal-ring__icon">${icon(p >= 1 ? "check" : "target", 22, 2.75)}</span>
        </div>
        <div class="panel-goal__text">
          <h2 class="panel-title" id="goal-h">Weekly goal</h2>
          <p class="panel-goal__num"><b>${week}</b> / ${WEEK_GOAL_XP} XP</p>
          <p class="panel-small">${p >= 1 ? "Goal reached. Brilliant!" : "About one lesson a day gets you there."}</p>
        </div>
      </section>

      <section class="panel-card panel-class" aria-labelledby="class-h">
        <span class="panel-kicker">${icon("users", 16, 2.75)} Your class</span>
        <h2 class="panel-title" id="class-h">Your class is up to ${CLASS_UNIT}</h2>
        <p class="panel-small panel-class__unit">${esc(classUnit.subtitleEn)}</p>
        <ol class="class-track" aria-label="You are on unit ${you}. Your class is on unit ${CLASS_UNIT}.">
          ${units.map((u, i) => `
            <li class="class-track__step ${i <= youIdx ? "is-reached" : ""} ${u.id === you ? "is-you" : ""} ${u.id === CLASS_UNIT ? "is-class" : ""}" aria-hidden="true">
              ${u.id === you ? `<span class="class-track__tag class-track__tag--you">You</span>` : ""}
              ${u.id === CLASS_UNIT ? `<span class="class-track__tag class-track__tag--class">Class</span>` : ""}
              <span class="class-track__dot"></span><span class="class-track__label">${u.id}</span>
            </li>`).join("")}
        </ol>
        <p class="panel-small">Go at your own pace. Every lesson brings you closer.</p>
      </section>

      <section class="panel-card panel-tip" aria-labelledby="tip-h">
        ${charImg("owl-explaining", "panel-tip__owl")}
        <div>
          <h2 class="panel-kicker" id="tip-h">${icon("lightbulb", 16, 2.75)} Buhísimo's tip</h2>
          <p class="panel-tip__text">${rich(lesson.tipEn)}</p>
        </div>
      </section>
    </aside>`;
}

export function soonCard(view) {
  const v = SOON[view];
  return `
    <div class="soon-card">
      <div class="soon-art">${charImg(v.owl, "soon-owl")}<span class="soon-icon">${icon(v.icon, 26, 2.5)}</span></div>
      <span class="badge badge--turquoise">${icon("sparkles", 16, 2.75)} Coming soon</span>
      <h1 class="h-title soon-title" tabindex="-1">${esc(v.title)}</h1>
      <p class="soon-text">${esc(v.text)}</p>
      <a class="press btn btn--primary soon-back" href="#/"><span class="face">${icon("map", 22, 2.75)}<span>Back to the path</span></span></a>
    </div>`;
}
