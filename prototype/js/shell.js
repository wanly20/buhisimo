// Shell pieces: the desktop sidebar and right progress panel (Chromebook /
// desktop, ≥1024px), and the bottom tab bar for phones and tablets (<1024px).
// css/layout.css shows each one only at its widths; the design-system page
// renders them as components.
import { icon } from "./icons.js";
import { esc, rich, charImg } from "./ui.js";
import { units } from "../path-data.js";
import { lesson } from "../lesson-1-1.js";

export const NAV = [
  { id: "path", label: "Path", tab: "Learn", icon: "map", href: "#/" },
  { id: "review", label: "Review", tab: "Review", icon: "repeat", href: "#/review" },
  { id: "radio", label: "Radio Búho", tab: "Radio", icon: "radio", href: "#/radio" },
  { id: "profile", label: "Profile", tab: "Me", icon: "user", href: "#/profile" },
];

/** Bottom navigation on phones and tablets: Learn / Review / Radio / Me. */
export function tabBar(active = "path", due = 0) {
  return `
    <nav class="tab-bar" aria-label="Main">
      ${NAV.map((n) => `
        <a class="tab tab--${n.id}" href="${n.href}" data-view="${n.id}" ${n.id === active ? 'aria-current="page"' : ""}>
          <span class="tab__icon">${icon(n.icon, 24, 2.5)}${n.id === "review" && due ? `<span class="tab__badge" aria-label="${due} to review">${due > 9 ? "9+" : due}</span>` : ""}</span>
          <span class="tab__label">${esc(n.tab)}</span>
        </a>`).join("")}
    </nav>`;
}

// Static placeholders until the teacher dashboard exists.
export const CLASS_UNIT = "1.4";
export const WEEK_GOAL_XP = 50;

export function sideNav(active = "path", due = 0) {
  return `
    <nav class="side-nav" aria-label="Main">
      <a class="side-brand" href="#/" aria-label="Buhísimo, back to the path">
        <span class="brand__avatar side-brand__avatar">${charImg("owl-explaining", "brand__img")}</span>
        <span class="side-brand__name" aria-hidden="true">Buhísimo</span>
      </a>
      <ul class="side-list">
        ${NAV.map((n) => `
          <li><a class="side-item side-item--${n.id}" href="${n.href}" data-view="${n.id}" title="${esc(n.label)}" ${n.id === active ? 'aria-current="page"' : ""}>
            <span class="side-item__icon">${icon(n.icon, 24, 2.5)}${n.id === "review" && due ? `<span class="tab__badge" aria-label="${due} to review">${due > 9 ? "9+" : due}</span>` : ""}</span><span class="side-item__label">${esc(n.label)}</span>
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
  // The class track shows textbook units: the map sections of a split unit (1.3a, 1.3b) count as one.
  const unitOf = (u) => u.unit ?? u.id;
  const track = [...new Set(units.map(unitOf))];
  const you = unitOf(units.find((u) => u.nodes.some((n) => !s.completed[n.id])) || units[0]);
  const youIdx = track.indexOf(you);
  const classUnit = units.find((u) => unitOf(u) === CLASS_UNIT);
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
          ${track.map((id, i) => `
            <li class="class-track__step ${i <= youIdx ? "is-reached" : ""} ${id === you ? "is-you" : ""} ${id === CLASS_UNIT ? "is-class" : ""}" aria-hidden="true">
              ${id === you ? `<span class="class-track__tag class-track__tag--you">You</span>` : ""}
              ${id === CLASS_UNIT ? `<span class="class-track__tag class-track__tag--class">Class</span>` : ""}
              <span class="class-track__dot"></span><span class="class-track__label">${id}</span>
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
