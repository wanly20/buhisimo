# Buhísimo v2 design system

*Design prototype, 9 Oct 2026. Live examples are on `design-system.html`, and the phone prototype is `index.html`. All values live in `css/tokens.css`. This file explains them.*

## 1. Principles

1. **Legible first, playful second.** Rounded display type is used only for headings and buttons. Every Spanish word uses a typeface built for reading.
2. **Everything you can press looks pressable.** Chunky 3D buttons have a darker bottom edge and sink when tapped.
3. **Kind feedback.** Right answers are emerald, and "not yet" answers are a warm terracotta (never alarm red). An icon and words always go with the colour. Wrong answers come back later; there are no hearts and no "failed" screens.
4. **Nothing jumps.** The bottom button bar has a fixed height. The feedback sheet slides over it, so CONTINUE lands exactly where CHECK was. Only `transform` and `opacity` animate.
5. **One source for Spanish.** All Spanish shown on screen comes from `lesson-1-1.js`, `unit-1-1.js` and `unit-1-2.js` (plus Radio Búho transcripts) and is checked by `tools/check_vocab.mjs`.

## 2. Colour (Salento palette)

| Scale | 50 | 100 / 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| Turquoise | `#e3f6f5` | `#c2ecea` | `#2bbfb9` | `#14a39e` | **`#0b7d79`** | `#075c59` |
| Magenta | `#fde8f1` | | `#ee4f97` | `#d6247a` | **`#b3135f`** | `#870b47` |
| Mustard | `#fff5d6` | `#ffd56a` (300) | **`#f7b928`** | `#e19c08` | `#b97c00` | ink `#3d2a00` |
| Emerald | `#e2f6ea` | `#c3ebd3` | `#2fbf71` | `#17a35a` | **`#0e7f45`** | `#085c31` |
| Terracotta | `#fdebe3` | `#f9d3c3` | `#e9845d` | `#d9643a` | **`#b7462a`** | `#8a2f19` |

The **bold** shade is the one used for button faces and filled surfaces with text. The 700 shade is the button's bottom edge. The 50 shade is a tinted background.

**Warm neutrals:** white `#ffffff`, cream `#fff9f0` (page), sand-100 `#f6eee2`, sand-200 `#eadfcf` (borders, card edges), sand-300 `#dccdb8`, ink `#2c2118` (text), ink-soft `#6b5a4b` (secondary text) and ink-faint `#a6978a` (icons only, never text).

**Semantic roles**

| Role | Token | Use |
|---|---|---|
| Page | `--c-bg` = cream | Screen background |
| Surface | `--c-surface` = white | Cards, options, sheets |
| Primary | `--c-primary` = turquoise-600 | CHECK, START, audio buttons |
| Correct | `--c-correct` = emerald-600, with emerald-50 sheet and emerald-700 text | Right answers, progress fill |
| Not yet | `--c-wrong` = terracotta-600, with terracotta-50 sheet and terracotta-700 text | Wrong answers |
| Reward | mustard-400 | XP, completed nodes, the new-word badge |
| Focus | magenta-500 | 3px keyboard focus ring |

**Contrast (WCAG AA, 4.5:1 for normal text).** Run `python3 tools/contrast.py` for the live table:

| Pair | Ratio |
|---|---|
| ink on cream / white | 15.0 / 15.7 |
| ink-soft on cream / white | 6.3 / 6.6 |
| white on turquoise-600 (primary button) | 5.0 |
| white on emerald-600 / terracotta-600 / magenta-600 | 5.1 / 5.4 / 6.6 |
| mustard-ink on mustard-400 | 7.8 |
| emerald-700 on emerald-50 (correct sheet) | 7.2 |
| terracotta-700 on terracotta-50 (wrong sheet) | 7.3 |
| turquoise-700 on turquoise-50 (selected option) | 7.0 |

Duolingo's white-on-lime buttons are about 2:1. Ours are deliberately deeper so every label passes AA.

## 3. Typography

| Pairing | Headings and buttons | Learning text (all Spanish) | Notes |
|---|---|---|---|
| **A (default)** | Fredoka 600/700 | Atkinson Hyperlegible 400/700 | Atkinson was designed for low-vision readers: I, l and 1 are all distinct, and 0 is slashed. This is the safest choice. |
| B | Baloo 2 700/800 | Lexend 400/700 | Bubblier. Lexend is good for reading fluency, but its **I and l look almost the same**. |
| C | Nunito 800/900 | Andika 400/700 | Softer. Andika is made for children learning to read. |

Students switch pairings in Settings (the slider icon in a lesson, or the gear on the path). The design-system page has the same switcher. The choice is saved (`data-font` on `<html>` swaps two CSS variables, `--font-display` and `--font-learn`).

**Scale (rem at 16px):** 13 label · 15 secondary · 17 body/options · 20 instruction/tiles · **24 Spanish prompts (minimum on phones)** · 30 new-word cards · 38 celebration. Buttons use uppercase display type with +0.06em tracking.

## 4. Spacing, radius, shadow, motion

- **Spacing** (4px base): `--sp-1` 4, `-2` 8, `-3` 12, `-4` 16 (screen gutter), `-5` 20, `-6` 24, `-8` 32, `-10` 40, `-12` 48.
- **Radius:** sm 10, md 14 (tiles), lg 20 (buttons, cards), xl 28 (sheets, intro card), pill.
- **3D edge:** `--edge` 4px (buttons, options), 3px (tiles, keys), `--edge-lg` 6px (path nodes, big audio and mic buttons).
- **Shadows:** sm (chips), md (banners), lg (popovers, desktop frame), sheet (modal sheets). Flat elements use the solid bottom edge instead of a blur.
- **Motion:** 120ms press, 260ms sheets and toggles, 480ms progress and screen changes. Easing is `cubic-bezier(.22,1,.36,1)`, with a spring for pops. `prefers-reduced-motion` makes every animation instant and turns confetti off.
- **Layout:** designed at 390×844 for phones, with tablet and Chromebook/desktop layouts in `css/layout.css` (section 9). Tap targets are at least 48px. The phone footer is a fixed 104px.

## 5. Components (in `css/components.css`)

| Component | Class | Notes |
|---|---|---|
| 3D press recipe | `.press > .face` | `::before` is the darker edge, and `.face` moves down by `--e` on `:active` (transform only). |
| Button | `.btn .btn--primary / secondary / correct / wrong / magenta / mustard / on-color` | Uppercase display type. Disabled = sand. |
| Text button | `.btn-text` | Can't speak now, Can't listen now, Show me |
| Icon buttons | `.icon-btn--primary / secondary / magenta`, `--sm` | Audio, 🐢 slow (rate 0.75), mic |
| Option card | `.option` + `aria-pressed`, `.is-correct`, `.is-wrong` | Number key badge (keys 1–9 work); hidden on touch screens |
| Word tile | `.tile`, `.tile-slot`, `.tile-fly` | The bank keeps a grey slot where a tile was, so nothing reflows. Tiles fly with FLIP. |
| Progress bar | `.progress > .progress__fill` (`--p` 0–1) | translateX fill with a glossy highlight |
| Chips | `.chip--streak`, `.chip--xp` | Path top bar |
| Badge, note, combo | `.badge`, `.note`, `.combo` | NEW WORD, hints, "3 in a row" |
| Speech bubble | `.speaker-row > .char + .bubble` | Character on the left, tail pointing at them |
| Feedback sheet | `.sheet.feedback(.is-wrong)` | Icon, title, answer with replay button, owl pose, CONTINUE |
| Modal sheet | `openModal()` in `js/ui.js` | Settings, quit confirm; Esc and scrim close it |
| Switch | `.switch[role=switch]` | 34px visual, 48px hit area |
| Toast | `toast()` | Snackbar above the footer |
| Path | `.unit-banner`, `.node(.is-current/.is-done)`, `.start-bubble`, `.node-pop` | Unit colours: turquoise, magenta, emerald, terracotta, mustard |

## 6. Characters and art

Cut out with rembg (`isnet-general-use`) by `tools/process_art.py`, which never modifies the sources. Every file is WebP and ≤150 KB (largest: family, 39 KB).

**Style (fixed 18 Oct):** flat, chunky rounded shapes, no outlines, one soft shadow tone, the look of `max.webp`. Made with Z-Image Turbo, 8 steps, **NAG off** (no negative prompt); the palette line lists colours only. Matilda, her poses, Max's poses and the four 1.1 nouns were remade in this style on 18 Oct (sources and prompts: `characters/remake_flat/`, review page `remake_flat/index.html`); they replace the softer round-5 (NAG 3) art. Paths below are under `spanish_app/design/`.

| Asset | Source | Used for |
|---|---|---|
| `owl-explaining` | `characters/owl_fix/pose_explaining_s3.png` | New words, path peek, brand avatar |
| `owl-celebrating` | `…/pose_celebrating_s3.png` | Correct sheet, lesson complete |
| `owl-encouraging` | `…/pose_encouraging_s3.png` | Wrong sheet, quit dialog |
| `owl-thinking` | `…/pose_thinking_s3.png` | Accent fix-up |
| `matilda` | `characters/remake_flat/matilda_stand_s4.png` (Juan's pick from `matilda_girl/balaca_style/`: balaca wayuu, soft lashes, striped ruana) | Intro, tiles, speaking |
| `matilda-wave` | `remake_flat/matilda_wave_s4.png` | Story cast and lines |
| `matilda-celebrate` | `remake_flat/matilda_celebrate_s4.png` | Story |
| `matilda-surprised` | `remake_flat/matilda_surprised_s4.png` | Story |
| `matilda-thinking` | `remake_flat/matilda_thinking_s1.png` | Story |
| `max` | `prototype_art/max_s1.png` (the style reference) | Intro, path |
| `max-wave` | `remake_flat/max_wave_s1.png` | Story cast and lines |
| `max-jump` | `remake_flat/max_jump_s1.png` | Story |
| `max-celebrate` | `remake_flat/max_celebrate_s3.png` (fists up; was a thumbs-up) | Story |
| `max-surprised` | `remake_flat/max_surprised_s1.png` | Story |
| `max-thinking` | `remake_flat/max_thinking_s2.png` | Story |
| `noun-mapa` | `remake_flat/noun_mapa_s4.png` (paper map, route, pin) | New-word card, picture choice |
| `noun-mundo` | `remake_flat/noun_mundo_s2.png` (globe on a stand) | New-word card, picture choice |
| `noun-capital` | `remake_flat/noun_capital_s2.png` (skyline with a gold star) | New-word card |
| `noun-monumento` | `remake_flat/noun_monumento_s4.png` (stone obelisk on steps) | New-word card |
| `family` | `prototype_art/family_s1.png` (s2 has houses directly behind them) | Design system only (arrives in 1.3) |
| `map-background` | `prototype_art/map_background_s2.png` | Path background, under a light cream veil |
| `salento-street` | `prototype_art/salento_street_s1.png` (more magenta) | Lesson complete |
| `flags/*.svg` | flag-icons 7.2.3 (MIT) | Country cards |

Buhísimo is the species-accurate seed-3 set (round head, no ear tufts). The celebrating pose carries a teal bag while the other three carry a pink one; fix that when the final art is made. Checked against `max_s1` on 18 Oct: the owl poses were made with NAG 3 and are slightly softer (gradient glasses, textured belly), close enough to keep for now; `family` was made with NAG off and is on-style.

## 7. Voice and tone

- Praise is short. Spanish praise uses only known words: in 1.1 that is **"¡Buhísimo!"**; in 1.2 *¡Bien!* joins from L3 and *¡Muy bien! ¡Fenomenal! ¡Fantástico!* from L4; plus English ("Great job!", "Nailed it!").
- Wrong-answer titles are kind: "Not quite", "Almost!", "Good try!", followed by "Mistakes help you learn." and "We'll come back to this one."
- The accent fix-up is Buhísimo's thing: "So close! Tap the letters that need an accent or ñ."
- Never: "Wrong!", buzzers, lost hearts, streak guilt or mockery.

## 8. Behaviour notes

- **Speaking** (Web Speech API, `es-CO` with fallback to `es-ES` and then `es-US`) is on by default and matching is lenient. After two misses the footer offers "Skip for now", so speaking never blocks progress. **Can't speak now** and **Can't listen now** switch those exercises off for 15 minutes (a timestamp in localStorage); Settings shows "Off until 8:17 AM" and can switch them back on. If speech recognition isn't supported, speaking steps are skipped with a toast.
- **Audio** is a placeholder (`speechSynthesis`, preferring es-CO, then es-US, es-MX and es-ES) with 🐢 at rate 0.75. Real recordings plug in behind `tts.speak()`.
- **Grading for typed answers:** an exact match is correct. If only accents or ñ differ, the accent fix-up runs and counts as "nearly" (accepted). A missing article (`país` for `el país`) is accepted, the fix-up adds the article, and a reminder is shown. **Capital letters count (21 Oct 2026):** a sentence starts with a capital (after ¿ ¡ too), names of countries, places and people always have one, and languages, days and months never do (*el español*, *lunes*). A capital-letter slip opens the same fix-up, which names the rule and highlights the letters (tap a ↔ A); it is right, but not first-try, so Review brings it back. A word on its own (*el destino*) may start either way. End punctuation stays optional.
- **Sounds:** WebAudio tones (correct = rising G5→D6, not-yet = soft E4→C4, complete = arpeggio), plus `navigator.vibrate` where available. They can be switched off in Settings.
- **Saved:** XP, streak (days in a row), completed nodes, font, sound, and the speak/listen snoozes. Key: `buhisimo.prototype.v1`; every access is wrapped in try/catch.

## 9. Tablet, Chromebook and desktop

Same app, same lessons; only the layout adapts. All of it is CSS (`css/layout.css`, grid + media queries + `clamp()`); the phone rules are untouched.

| Width | Layout |
|---|---|
| < 700px | Phone, as designed (a framed 430px card at 600–699px) |
| 700–1023px (tablet) | Top bar as on the phone; the path is a centred 560px column over the scene; the right panel is hidden |
| 1024–1279px | Icon-rail sidebar (96px) + path column + right panel (300px) |
| ≥ 1280px | Labelled sidebar (236px) + path column + right panel (340px) |
| height ≤ 820px | Compact lesson header and a 100px bottom bar (92px at ≤ 680px); characters are sized with `vh` so a whole exercise fits on 1366×768, 1280×720 and even a Chromebook's real ~1366×657 viewport |

- **Sidebar** (`.side-nav`, `js/shell.js`): logo; Path, Review, Radio Búho, Profile, Settings. Only Path works; the others open a "Coming soon" card (`#/review`, `#/radio`, `#/profile`) without reloading the shell.
- **Right panel** (`.path-panel`): streak + XP, a weekly goal ring (50 XP, prototype), "Your class is up to 1.4" (static placeholder, with a You/Class track) and Buhísimo's tip (`tipEn` in `lesson-1-1.js`).
- **Path art:** the 768px-wide map stays crisp behind the column; wider screens fill both sides with the same picture, blurred, so it is never stretched or pixelated.
- **Lessons:** a centred 720px stage, type one step larger (prompts 28px, new words 36px), choices in a 2×2 grid, and the new-word card laid out sideways. From 700px the bottom bar is full width: secondary actions on the left (Skip, Can't listen now / Can't speak now, Show me), CHECK on the right. **Skip** shows the answer kindly ("Here's the answer") and the question comes back later; on match and speaking it just moves on. The feedback sheet spans the full width with its content on the same 1000px grid, and CONTINUE lands exactly where CHECK was (same size, same spot). The accent bar adds ¿ and ¡.
- **Dialogs** (settings, quit) become centred cards. The lesson-complete screen is two columns from 1024px.
- **Keyboard:** 1–9 pick an option or word tile; in matching pairs 1–5 are Spanish and 6–9, 0 English; Backspace takes the last tile back; Enter = CHECK, then CONTINUE (holding it never races ahead; a focused tile, letter or audio button still does its own thing); Esc = quit dialog. Tab order follows the screen, with a magenta focus ring. Number badges show only with a fine pointer or no pointer (`@media (pointer: fine), (pointer: none)`), never on touch screens.
- **Tests:** `tools/e2e.mjs` (phone, unchanged) and `tools/e2e-keyboard.mjs` (the whole lesson with the keyboard only at 1366×768).

## 10. Unit 1.1 level (18 October 2026)

All 11 lessons of Unit 1.1 are playable (`unit-1-1.js`, following `docs/content_plan_1.1-1.6.md` §4). New pieces, all in `css/unit.css` with the same tokens and press recipe:

| Piece | Class | Notes |
|---|---|---|
| Audio coming | `.audio-soon` | Dashed sand chip where a line has no recording yet. Never a computer voice (a teacher switch in Settings turns one on). Listening steps without a recording become "read and choose", so nothing is ever audio-only without audio. |
| Choose | `.ex-choose`, `.pic-option` | One exercise for Spanish/English/picture options (sí/no, picture of *el mapa*, story checks). |
| Gap fill | `.ex-gap`, `.gap-slot` | The chosen word drops into a dashed slot; turquoise, then emerald or terracotta. |
| Sort | `.ex-sort` | One card at a time into 2–3 buckets (soy/eres/es, famoso/famosa); keys 1–3. |
| Map | `.map-frame`, `.map-pin`, `.map-mark` | Natural Earth shapes (`js/worldmap-data.js`). Locator maps on new-word cards. "Look at the map" (`mapstudy`): labelled pins (tap to hear) whose labels move so they never overlap or cover another dot. Map questions (`maptap`): no names; numbered 48 px rings (`.map-mark`, keys 1–4) on each place, spread apart with a leader line when they would overlap; a tap on a tinted country picks its ring; names appear after CHECK or with the "Show the names" hint (costs the bonus). |
| Rule table | `.rule-card` | Worked example: soy/eres/es, histórico/histórica. One line per row on short screens. |
| Story | `.story-line`, `.story-bubble` | Comic-style panels, the last three lines only (no scrolling), EN toggle, tap a line to hear it. |
| Passport | `.passport` | The unit check finale: listen (or read) and type; the passport gets a stamp. |
| Views | `.view`, `.view-hero` | Review + My knowledge, Radio Búho (karaoke `.k-line`/`.k-w`), Me (progress file). |
| Tab bar | `.tab-bar` | Phones and tablets (<1024px): Learn / Review / Radio / Me. The Chromebook layout keeps its sidebar. |

**Offline:** `sw.js` caches the app shell, pictures and every recorded clip. Code is network-first (an online student always gets the newest version); media is cache-first. Bump `VERSION` in `sw.js` and `APP_VERSION` in `js/app.js` together; a new version takes over as soon as no lesson is running.

## 11. Unit 1.2 level (21 October 2026)

All 13 lessons of Unit 1.2 «¿Qué tal?» (`unit-1-2.js`, `docs/build_plan_1.2.md`) run on the same lesson runner; `course.js` lists the units in path order (locks run across units: 1.2 L1 opens after the 1.1 check). New pieces, in `css/unit-1-2.css` with the same tokens and press recipe:

| Piece | Class | Notes |
|---|---|---|
| Time of day, feelings | `.art-scene`, `.art-face` (`js/art.js`) | Flat SVG: the Cocora hills in the morning (sun low, 8:00) and the afternoon (sun high, fog, 15:00); five faces from *fatal* to *fenomenal*. On intro cards, as a choose prompt, and as picture options. |
| Letter card | `.letter-grid`, `.letter-card` | A letter group: big letter, Spanish name; tap to hear. Notes point out sound-alike letters (*be/uve*, *ce/ese/zeta*, *ge/jota*). |
| Letter pick | `.ex-letterpick`, `.letter-option` | Hear (or read) a letter name, tap the letter; keys 1–4. |
| Spelling dictation | `.ex-spell`, `.spell-prompt` | Hear (or read) *Ese, a, ele…*, type the word; the typing engine's accent and capital-letter fix-ups apply. |
| Song clip | `.ex-clip`, `.clip-card` | The words light up on a 90 BPM beat (beat dots) so students chant along; the song plays with them once `audio/songs/<clip>.mp3` exists ("Song coming soon" until then). |
| Radio Búho grid | `.ex-radio`, `.radio-row`, `.face-pick`, `.radio-input` | Call-in grid: one row per caller, a face to tap or a word to write; first listen without the words (read them while unrecorded); after CHECK each row shows its answer. Keys 1–4 fill the next row. |
| Transcript | `.ex-transcript`, `.tr-line` | Listen again with the words: tap a line, EN toggle. |
| Radio tab episodes | `.radio-eps`, `.radio-ep-chip` | The 1.1 demo plus each lesson episode, padlocked until its lesson is open. |

## 12. Unit 1.3 level (26 October 2026)

All 20 lessons of Unit 1.3 «Mi carnet de identidad» (`unit-1-3.js`, `docs/build_plan_1.3.md`), shown on the path as two map sections (1.3a L1–L11, 1.3b L12–L20), on the same runner; 1.3 L1 opens after the 1.2 check. New pieces, in `css/unit-1-3.css` (`js/exercises-1-3.js`, `js/art.js`, `js/numbers.js`):

| Piece | Class | Notes |
|---|---|---|
| Digits | `.art-digit` (`digitArt`) | A big number tile in the Salento palette: intro cards for 11–15, digit → word, the countdown. |
| Number card | `.num-grid`, `.num-card` | Numbers with their names; tap to hear; notes point out look-alikes (*seis / siete*). `study` = a "Look first" card (0–10 before the game). |
| Number pick | `.ex-numpick`, `.num-option` | Hear (or read) a number or a sentence with one, tap the digit; keys 1–4. |
| Digit → word | `.ex-numtype` | See 16, type *dieciséis* (accent fix-up). |
| Number dictation | `.ex-dictation`, `.dict-box` | Hear (or read) a line of numbers, write each as digits; Space or comma moves to the next box. |
| Count / countdown | `.ex-count`, `.count-tile` | Tap the number words in order; the big digit counts with you; a countdown ends on *¡cero!* and Max jumps. |
| Pattern card | `.pattern-row` | *diez + seis → dieciséis* with the digits (a picture: no *y* before 1.5). |
| Number Invaders | `.ex-invaders`, `.inv-ship` | Four digits drift down; tap the one you hear or read. "Calm mode" (on at the start) stops the falling. Keys 1–4. |
| Song karaoke | `.song-box`, `.song-line` | A whole number song: the recorded song plays and each word lights up on its aligned timing; con números shows digits (`.song-num`). No file yet: "Song coming soon" and the beat. |
| Radio Búho's song set | `.songset`, `.songset-item` | The six number songs; tap one to play it (also in the Radio tab). |
| ID card («carnet») | `.idcard` (`idCard`), `.ex-idcard`, `.id-chip`, `.id-input` | Drawn in code: photo, the Colombian stripe, fields labelled with questions (*¿El nombre?*), never bare labels. Read a card, fill one (tap, write digits, type), or fill three from Radio Búho calls. |
| Valentina, Samuel | `assets/valentina.webp`, `assets/samuel.webp` | Cut from the Restrepo family picture (`tools/crop_family_kids.py`): no new art. |

## 13. Files
```
prototype/
  index.html                 app shell (phone, tablet and desktop) · manifest.webmanifest · sw.js (offline)
  design-system.html         living style guide
  lesson-1-1.js              lesson 1 content (the original prototype lesson)
  unit-1-1.js                lessons 2–11, the story, Unit 1.1 items (all Spanish)
  unit-1-2.js                Unit 1.2: 13 lessons, the story, Radio Búho episodes, items and letter groups
  unit-1-3.js                Unit 1.3: 20 lessons (1.3a, 1.3b), the story, Radio Búho episodes, the number songs, items
  course.js                  the playable units in path order (lessons, items, radio episodes)
  path-data.js               units 1.1–1.6 (textbook titles)
  css/tokens.css             design tokens  ← start here
  css/base.css · components.css · app.css · design-system.css
  css/layout.css             tablet + Chromebook/desktop layouts, keyboard hints
  css/unit.css               Unit 1.1 exercise types, views, tab bar
  css/unit-1-2.css           Unit 1.2 exercise types and pictures
  css/unit-1-3.css           Unit 1.3 exercise types, songs and the ID card
  js/app.js                  router, path, views, lesson complete, settings, service worker
  js/lesson.js               lesson runner + exercise types + accent fix-up
  js/exercises-1-2.js        letters, letterpick, spell, clip, radio, transcript
  js/exercises-1-3.js        numcard, numpick, numtype, dictation, count, pattern, invaders, song, songset, idcard
  js/numbers.js              numbers 0–31 and the «con números» view of a sung line (no DOM)
  js/art.js                  SVG time-of-day scenes, feeling faces, digits and the ID card
  js/review.js               spaced repetition, Review sessions, My knowledge
  js/radio.js                Radio Búho player (align_lyrics.py JSON format)
  js/worldmap.js · worldmap-data.js   maps
  js/shell.js                desktop sidebar, right panel, phone tab bar
  js/speech.js · sound.js · store.js · fonts.js · ui.js · icons.js (Lucide, ISC) · ds.js
  assets/ · icons/           WebP art + flags · app icons
  audio/                     recorded clips, manifest.json (lesson_audio.py), manifest-extra.json, manifest-l2.json, manifest-max.json (Max's voice), TODO_lines.json
  radio/                     episodes.json + episode JSON/MP3
  tools/check_vocab.mjs      vocabulary validator (unit and lesson level; --todo writes audio/TODO_lines.json)
  tools/e2e-unit.mjs         headless Chromium test of Units 1.1–1.3 (plus e2e.mjs, e2e-keyboard.mjs for lesson 1)
  tools/make_number_songs.py the approved number songs and clips N1–N6 into audio/songs/ (CPU, ffmpeg)
  tools/crop_family_kids.py  Valentina and Samuel cut from assets/family.webp (Pillow)
  tools/contrast.py          contrast table from tokens.css
  tools/process_art.py       art cut-out pipeline (rembg; all character, pose and noun art) · process_art_l2.py (PWA icons)
  tools/make_worldmap.mjs · make_radio_demo.py · import_design_clips.py
```

Run it locally with `python3 -m http.server` in `prototype/` and open `http://localhost:8000/` (ES modules need http).
