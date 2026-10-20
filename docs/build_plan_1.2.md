# Build plan: Unit 1.2 «¿Qué tal?» in the v2 prototype

*21 October 2026. From `docs/content_plan_1.1-1.6.md` §5 (lessons), §11.3 A (the alphabet episode) and the decisions of 18–21 October. The prototype engine of Unit 1.1 is reused, not forked: 1.2 adds a content file and a few exercise types to the same runner.*

## 1. Shape

1.2 is the next section on the path after 1.1, in magenta, with 13 nodes. Lessons lock in order across units: 1.2 L1 opens only when 1.1 L11 (the 1.1 check) is done, then one lesson at a time (`?unlock=all` still opens everything for teachers).

| # | Type | Title (Spanish; English underneath) | New items (counted) | Exercise types |
|---|---|---|---|---|
| L1 | repaso | ¿De dónde es Max? · *Review: where is everyone from?* | — | listen, maptap, gap (*soy/eres/es*), choose (sí/no), tiles, type, pick, match, speak (1.1 lines, most already recorded) |
| L2 | learn | ¡Hola! · *Hello and goodbye* | ¡hola!, Buenos días, Buenas tardes, ¡Adiós!, ¡Hasta luego! (5) | intro, **time-of-day scene** → choose the greeting, sort hello/goodbye, listen, tiles, type, match, speak; culture note (*buenos días* until lunch) |
| L3 | learn | ¿Qué tal? · *How's it going?* | ¿Qué tal?, bien, mal, regular, ¿Y tú? (5) | intro with **feeling faces**, choose a face, sort good / so-so / bad, listen, tiles, type, match, speak; false friend *regular* |
| L4 | learn | ¿Cómo estás? · *How are you?* | ¿Cómo estás?, muy, gracias, fatal, fenomenal, fantástico/a (6) | intro + faces, order the scale *fatal → fenomenal* (tiles), gap *Muy ___, gracias*, choose a face, listen, type, match, speak; false friend *fatal* |
| L5 | practice | Hola, ¿qué tal? · *Practice: little conversations* | — | faded: model → gap → tiles → speak both roles |
| L6 | learn | Max está fenomenal · *es and está* | está (1) | contrast table *es de* (where from) vs *está* (how you feel), gap, sort es/está, pick, listen, tiles, type, speak |
| L7 | story | Buenos días, Salento · *Story: good morning, Salento* | — | the 11-line story with checks after lines 3, 6 and 10, then put the last lines in order |
| L8 | listen | ¡Hola, Buhísimo! · *Radio Búho: how are the callers?* | — | **Radio Búho call-in grid** (country × face) on the first listen, then the **transcript** (listen again, tap a line, EN), then two questions |
| L9 | learn | El alfabeto: a, e, i, o, u · *The alphabet: vowels and the e family* | el alfabeto, ¿Cómo se escribe?, letters a e i o u · efe ele eme ene eñe ese erre · jota (5) | **letter card**, **song clip** A1 and A2 (chant along, then fill the gap), **letter pick**, **spelling dictation**, tiles of letter names, match, speak |
| L10 | learn | ¿Cómo se escribe Matilda? · *Spelling: B, C, D, G, P, T, H, Q* | escribir, llamarse, letters be ce de ge pe te · hache · cu (5) | letter card, clip A3, letter pick, dictation of 1.1 names (*Salento*, *Buhísimo*, *Perú* with the accent fix-up), tiles, intro cards for the two infinitives, match, speak |
| L11 | learn | ¿Cómo se escribe Max? · *The rare letters: K, V, W, X, Y, Z* | ka · uve · doble ve · equis · ye · zeta (6) | letter card, clip A4, letter pick (*uve* vs *be*, *ye*, *zeta*), dictation, tiles, match, speak |
| L12 | listen | ¡El alfabeto! · *Radio Búho: the spelling show* | — | **spelling-show grid** (callers spell; students write the word), the whole alphabet chant A5 with a gap, the transcript |
| L13 | check | *Unit check: the plaza* | — | every 1.2 item, one listening grid, one spelling dictation, production: build and speak a greeting for a time of day and a mood. No hint, no hearts |

Every learn lesson keeps the 1.1 rhythm: each new item is shown (intro card, worked example) and then practised at once, the set is mixed (match, tiles, type), there is one listening and one speaking step, and a lesson ends with the student saying something whole.

**Titles** follow the rule of 21 October (only words taught by that lesson, no bare nouns; checked by `tools/check_vocab.mjs`).

**P13 *el abecedario*** was rejected on 21 October: the unit uses *el alfabeto* only, and the song is «El alfabeto».

## 2. Look-alikes and false friends to point out

Juan's rule: point them out explicitly, practise them side by side once both are taught.

- **No word pairs inside 1.2** (coordinator, 21 Oct).
- **False friends with English** (said on the card): *regular* = so-so, not "regular"; *fatal* = awful, nothing to do with death.
- **es / está** (L6): both "is"; *es de* says where someone is from, *está* how they feel today. Contrast table, then a sort.
- **Buenos días / Buenas tardes**: *buenos* but *buenas* (agreement, as with *famoso/famosa* in 1.1). A gap with both.
- **Sound-alike letters** (on the letter cards and in letter picks): *be* and *uve* sound the same; *ce* (before e, i), *ese* and *zeta* sound the same in Colombia (seseo); *ge* before e, i sounds like *jota*; *ka* and *cu* both make a k sound; *ll* is spelt *ele, ele* and *y* is *ye*; *hache* is silent (*hola*); *eme / ene / eñe* look alike.

## 3. New engine features (in the 1.1 engine)

| Feature | Where | What it does |
|---|---|---|
| Course registry | `prototype/course.js` | Every unit's lessons, items and radio episodes in one ordered list. Locks, the path, Review, My knowledge, Me and the progress file read it, so a unit is added by writing `unit-1-x.js` and one line here. |
| Unit-aware lessons | `js/app.js`, `js/review.js` | Lesson ids `1.2-n`; "n of 13" per unit; "Unit 1.2 complete!"; Review items carry their unit; locks run across units. |
| Praise grows with the unit | `unit-1-2.js` | 1.1 praise is *¡Buhísimo!*; from 1.2 L3 *¡Bien!*, from L4 *¡Muy bien! ¡Fenomenal! ¡Fantástico!* (each only once taught; Buhísimo says it). |
| Scenes and faces | `js/art.js` | Flat inline SVG in the Salento palette: morning and afternoon over the Cocora hills (sun low / high, fog), and five feeling faces (*fatal → fenomenal*). No new image files needed. |
| `letters` | `js/lesson.js` | A letter card: big letters with their Spanish names; tap a letter to hear its name; a note for sound-alike letters. |
| `letterpick` | `js/lesson.js` | Hear (or, while unrecorded, read) a letter name → tap the letter. |
| `spell` | `js/lesson.js` | Spelling dictation: hear (or read) *Ese, a, ele, e, ene, te, o.* → type *Salento*. Reuses the typing engine (accent fix-up, and the capital-letter check). |
| `clip` | `js/lesson.js` | A song clip: the words light up on a 90 BPM beat so students can chant along, with the recorded clip when it exists ("Song coming soon" until then). A `gap` on the same line follows (listen again, fill the missing letter). |
| `radio` | `js/lesson.js` | Radio Búho in a lesson: a call-in grid. Rows are callers; cells are faces (L8) or a typed word (L12, the spelling show). First listen without the transcript; unrecorded lines are shown to read instead, so nothing is audio-only without audio. |
| `transcript` | `js/lesson.js` | Listen again with the transcript: every line, tap to hear, EN toggle. |
| Radio tab | `js/radio.js` | Lists every episode: the 1.1 demo, plus each lesson episode once its lesson is open; unrecorded episodes show the transcript and "Audio coming soon". |
| Spelling lines in the checker | `prototype/tools/check_vocab.mjs` | Multi-unit; bare letter names pass only in spelling lines (`spell: true`, or *se escribe* / *alfabeto*), exactly as in the repo validator; titles must equal the manifest's. |
| Audio TODO | `check_vocab.mjs --todo` | `audio/TODO_lines.json` lists every unrecorded 1.1 and 1.2 line per voice (Buhísimo, María = Matilda's stand-in, Raúl = Max's); `audio/TODO_songs.json` lists the song clips A0–A7 with their lines, lesson and tempo. |

## 4. Assets

| Need | Now | Later |
|---|---|---|
| Characters | Existing flat art: Matilda (koala, *balaca wayuu*) and Max (kangaroo, Selección shirt) poses; the current owl poses (a new owl is still being decided) | Matilda sleepy (morning), Max tired (afternoon), Buhísimo at the Radio Búho microphone |
| Time of day | SVG scenes in `js/art.js` | Painted morning / afternoon Salento plaza, Cocora in the fog |
| Feelings | SVG faces in `js/art.js` | Optional: character faces for each feeling |
| Audio | "Audio coming soon" (computer voice only with the teacher switch); listening steps fall back to reading | GPU run of `audio/TODO_lines.json` (voices per line) |
| Songs | Placeholder: words light up on the beat, "Song coming soon" | ACE-Step songs (Juan's choice, 20 Oct) cut into clips A0–A7 per `audio/TODO_songs.json` |

## 5. Tests

- `node tools/check_vocab.mjs` and `--plurals` pass; `node prototype/tools/check_vocab.mjs` passes for 1.1 and 1.2.
- `prototype/tools/e2e-unit.mjs` gains section U (Unit 1.2): every 1.2 lesson played in order at 1366×768 with the keyboard (one wrong answer per lesson, every step fits without scrolling), every 1.2 lesson by touch at 390×844 (no horizontal scrolling), 1.2 locked until 1.1 is done, the Radio tab's 1.2 episodes, and screenshots of every new screen type at both sizes.
- Service worker / app version `2026-10-21.u12` in `sw.js` and `js/app.js`.
