# Build plan: Unit 1.3 «Mi carnet de identidad» in the v2 prototype

*26 October 2026. From `docs/content_plan_1.1-1.6.md` §6 (lessons, the two map sections, number songs and their numerals karaoke), §3 (story canon), §11.3 N and §12, `content/lessons_1.1-1.6.json` ("parts": 1.3a L1–L11, 1.3b L12–L20) and `video_generation/music/songs/number_songs_plan.md`. Same engine as 1.1 and 1.2: 1.3 adds one content file (`unit-1-3.js`), one line in `course.js` and a few exercise types (`js/exercises-1-3.js`). No GPU work: no new recordings, songs or images.*

## 1. Shape

1.3 is the next part of the path after the 1.2 unit check, in emerald, shown as **two map sections** with every lesson as a node: **1.3a «¿Cómo te llamas?»** (L1–L11) and **1.3b «Mi carnet de identidad»** (L12–L20). Lessons still lock one after the other across units: 1.3 L1 opens only when 1.2 L13 (the 1.2 check) is done (`?unlock=all` and the "For teachers" settings still open everything). Lesson numbers run L1–L20 straight through, as in the manifest.

| # | Part | Type | Title (Spanish; English underneath) | New items (counted) | Exercise types |
|---|---|---|---|---|---|
| L1 | 1.3a | repaso | Buenas tardes, ¿qué tal? · *Review: greetings and spelling* | — | pick, time-of-day scene, face, maptap, gap (*es/está*), listen, **spell** (Cuba), tiles, type, letterpick, match, speak |
| L2 | 1.3a | learn | Me llamo Valentina · *My name is Valentina* | me llamo, te llamas, se llama, ¿Cómo te llamas?, ¿Cómo se llama? (5) + names Valentina, Samuel | intro by each speaker, **choose the person** (pictures of Valentina, Samuel, Matilda, Max), sí/no, gap, sort I / you / he-she, listen, tiles «Me llamo ___. ¿Y tú?», type, match, speak |
| L3 | 1.3a | conjugation | Me llamo, te llamas, se llama · *Conjugation: llamarse* | — | table → choose the form for the person → gap → type; then the cross-verb pattern with *soy / eres / es* (second table, sort, gap) |
| L4 | 1.3a | learn | Cero, uno, dos, tres · *Numbers 0–5* | cero, uno, dos, tres, cuatro, cinco (6) | **number card** (1–3, 4–5, 0), **number pick**, **count up**, **countdown** ending on *¡cero!* (Max jumps), clip N1, **digit → word** (type), **number dictation** (*Tres, dos, uno… ¡Max!*), match, speak the countdown |
| L5 | 1.3a | learn | Seis… diez · *Numbers 6–10* | seis, siete, ocho, nueve, diez (5) | number cards (*seis / siete* pointed out on the card), number pick, *¿Seis? No, siete.*, count up, count in twos, clip N2, **song «Del uno al diez» (letras)**, gap on the song, dictation, type, match, speak |
| L6 | 1.3a | game | *Game: Number Invaders 0–10* | — | study card 0–10, **Number Invaders** (three waves: odd numbers, the countdown to *cero*, *seis / siete*), **song «Del uno al diez» con números**, dictation |
| L7 | 1.3a | learn | Once… quince · *Numbers 11–15* | once, doce, trece, catorce, quince (5) | one intro card each (irregular), number pick with the *tres / trece* look-alikes, count, clip N3, sort 1–5 / 11–15, dictation, type, match, speak |
| L8 | 1.3a | learn | ¿Cuántos años tienes? · *How old are you?* | ¿Cuántos años tienes?, tengo, tienes, tiene, años (5) | intro *tengo / tienes / tiene* with *el mapa*, **worked example table** (*Tengo el mapa → Tengo doce años*), gap, sí/no, tiles, listen, age pick, type, match, speak |
| L9 | 1.3a | learn | Dieciséis… veinte · *Numbers 16–20* | dieciséis, diecisiete, dieciocho, diecinueve, veinte (5) | **pattern card** (*diez + seis → dieciséis*, a picture, no *y*), number cards, number pick, count, clip N4, **song «Del diez al veinte» (letras)**, gap, dictation, sort 0–10 / 11–20, type (accent fix-up on *dieciséis*), match, speak |
| L10 | 1.3a | practice | Tengo, tienes, tiene · *I have, you have, he/she has* | — | table (*tener* with *llamarse* and *ser*), **«Del diez al veinte» con números**, **«Uno, once · Dos, doce» letras then con números**, gap, choose, tiles, sort by person, dictation of the pairs, type, listen, speak |
| L11 | 1.3a | check | ¿Cómo te llamas? ¿Cuántos años tienes? · *Section check 1.3a* | — | no hints, no hearts: numbers 0–20 by ear (number pick, two dictations incl. a countdown to *¡cero!*), *¿Siete? — No, seis.*, names and ages (choose the person), listen, type, gap, production (introduce a character: name, age, where from), speak |
| L12 | 1.3b | repaso | Cinco, diez, quince, veinte · *Review: names, ages and numbers 0–20* | — | count in fives, number pick, pick, dictation (*Cinco, seis, siete*), gap, type, maptap (1.1), morning scene (1.2), tiles, match, speak |
| L13 | 1.3b | learn | Veintiuno… veinticinco · *Numbers 21–25* | veintiuno, veintidós, veintitrés, veinticuatro, veinticinco (5) | pattern card (*veinte + dos → veintidós*, accents on *-dós, -trés*), number cards, number pick, ***veinticuatro / veinticinco*** apart, count, clip N5, **song «Dos, doce, veintidós» (letras): placeholder, "Song coming soon"**, dictation, sort, type, match, speak |
| L14 | 1.3b | learn | Veintiséis… treinta y uno · *Numbers 26–31* | veintiséis, veintisiete, veintiocho, veintinueve, treinta, treinta y uno (6) | number cards (***veintiséis / veintisiete*** pointed out), number pick, pattern card (*veintiuno* one word, *treinta y uno* three), count, clip N6, **song «Del veinte al treinta y uno» (letras)**, **«Dos, doce, veintidós» con números (placeholder)**, dictation, type, match, tiles, speak |
| L15 | 1.3b | listen | *Radio Búho: the numbers song* | — | **Radio Búho plays the set** (six short songs in order, each playable with its karaoke), **«Del veinte al treinta y uno» con números**, **«Uno, diez, once… treinta y uno» letras, then con números**, gap on the song, Max's countdown as a **dictation**, **call-in card** (write the ages you hear), transcript |
| L16 | 1.3b | learn | Mi carnet de identidad · *My ID card* | el carnet de identidad, el nombre, el apellido, mi (4) + name Restrepo | intro cards on a **drawn ID card**, **read a card → pick**, worked example *el nombre → mi nombre* (table), gap, **fill a card** (tap the answers, then type them: capitals count), listen, tiles, type *el apellido*, match, speak |
| L17 | 1.3b | learn | La amiga de Matilda · *Matilda's friend* | la edad, el/la amigo/a, el lugar de nacimiento (3) | intro *la amiga / el amigo* (agreement, like *famoso / famosa*), amigo or amiga for a picture, gap, intro on the card, read a card, **fill a whole card** (name, surname, age in digits, place of birth), listen, tiles, type, match, speak |
| L18 | 1.3b | story | El carnet de identidad de Max · *Story: Max's ID card* | — | the 11-line story (§6), checks after lines 2 and 5, then put Buhísimo's three lines in order |
| L19 | 1.3b | listen | *Radio Búho: three ID cards* | — | **three ID cards to fill on the first listen** (Valentina, Samuel, Matilda: name, surname, age, where from), transcript, two questions |
| L20 | 1.3b | check | *Unit check: the ID card office* | — | number dictation 1–31, number pick with both *veinti-* look-alike pairs, an ID card listening task, gap, type, match, fill your own card as Max, production (tiles, type, speak: *Me llamo Max. Tengo trece años. Soy de Melbourne.*) |

Every learn lesson keeps the 1.1 rhythm: each new item is shown (card, worked example) and practised at once, before the next one; the set is then mixed (match, tiles, type, dictation); there is one listening and one speaking step; the lesson ends with the student saying something whole. With 5–6 items per lesson, the extra time goes on retrieval (number picks, dictations, counting).

**Titles:** the manifest's titles, checked at their own lesson (`tools/check_vocab.mjs`). L6, L15, L19 and L20 have English titles only. Song titles that start *Del… al…* (*del, al*) aren't taught, so the app names those songs in English (*Song: 1 to 10*); «Uno, once · Dos, doce», «Dos, doce, veintidós» and «Uno, diez, once… treinta y uno» are shown in Spanish.

**Praise:** the full 1.2 set (*¡Muy bien! ¡Fenomenal! ¡Fantástico! ¡Buhísimo!*), said by Buhísimo.

**Completion:** L11 says "Unit 1.3, part A complete!"; L20 "Unit 1.3 complete!".

## 2. Look-alikes, false friends and patterns to point out

Juan's rule: once both words are taught, point the pair out and practise it side by side, then keep it in reviews. Steps that do this carry `lookalike: "a/b"`, which `prototype/tools/check_vocab.mjs` passes to the repo validator (it fails a pair used before both words are taught).

| Pair | Both taught | Pointed out | Practised side by side | Kept in |
|---|---|---|---|---|
| *seis / siete* | L5 | L5 *siete* card | L5 (*¿Seis? No, siete.*, pick, gap on the song, dictation), L6 (Invaders wave 3) | L9 (*dieciséis / diecisiete*), L11 check, L12 repaso |
| *veinticuatro / veinticinco* | L13 | L13 card | L13 (*¿Veinticuatro? No, veinticinco.*, picks) | L20 check |
| *veintiséis / veintisiete* | L14 | L14 card | L14 (*¿Veintiséis? No, veintisiete.*, picks) | L20 check |
| *el nombre / noviembre* | 1.4 L6 (*noviembre* is 1.4) | — | **not in 1.3** (as the content plan says) | 1.4 |
| *nueve* | — | its pair *la nieve* is 3.4: nothing to do in 1.3 | — | — |

Also pointed out (not look-alike pairs): *tres / trece*, *dos / doce*, *cuatro / catorce*, *cinco / quince* (L7 cards and sort; the song «Uno, once · Dos, doce» in L10); *dieci-* = *diez* + number (L9 pattern card); *veinti-* is one word but *treinta y uno* three (L14); *el amigo / la amiga* (agreement, L17); *mi* takes the place of *el* (L16, never a bare noun); *años* always after a number (L8).

## 3. New engine features

| Feature | Where | What it does |
|---|---|---|
| Unit 1.3 content | `unit-1-3.js`, one line in `course.js` | 20 lessons, items (numbers carry their digit), Radio Búho episodes (L15, L19; L11 and L20 check calls stay out of the Radio tab) |
| Path | `path-data.js` | 1.3a and 1.3b list every lesson (11 and 9 nodes); "Unit 1.3 · Part A/B" banners as before |
| `numcard` | `js/exercises-1-3.js` | A number card: big digits with their Spanish names, tap to hear; a note for look-alikes |
| `numpick` | same | Hear (or, while unrecorded, read) a number → tap the digit. Also a whole sentence: *Samuel tiene trece años.* → 13 |
| `numtype` | same | **Digit → word**: see *16*, type *dieciséis* (typing engine: accent fix-up, capitals) |
| `dictation` | same | **Number dictation**: hear (or read) *Tres, dos, uno… ¡Max!* and write the digits, one box per number |
| `count` | same | **Count up / countdown**: tap the number words in order (from a shuffled bank); a big digit counts with you; a countdown ends on *¡cero!* and Max jumps. Mix-ups shake and are counted, like sort |
| `pattern` | same | A pattern card, drawn: *diez + seis → dieciséis* with the digits (no *y* before 1.5) |
| `invaders` | same | **Number Invaders**: Space Invaders with numbers. Aliens carrying digits march down; hear or read a number and shoot its alien (tap it, or Left/Right + Space/Enter) before they land. "Slower" halves the speed (on under reduced motion); each wave can set `fallMs` |
| `song` | same | A whole number song with its **karaoke**: the recorded song (`audio/songs/<id>.mp3`) plays and each word lights up on its aligned timing; a repeated block lights the same lines again. `numerals: true` = the **con números** version (digits on screen, *¡muy bien!* stays words, *treinta y uno* is one token, **31**). No file yet = "Song coming soon" and the words light up on a 90 BPM beat |
| `songset` | same | Radio Búho's set in L15: the six songs as a list; tap one to play it with its karaoke |
| `idcard` | same + `js/art.js` | The **ID card** («carnet»), drawn in code: a photo (the character), the Colombian colours and fields labelled with questions (*¿El nombre? ¿El apellido? ¿La edad? ¿El lugar de nacimiento? ¿De dónde eres?*), never bare labels. Modes: **read** (a filled card, then a question), **fill** (tap the answer for each field, or type it: capitals and accents go through the same fix-up rules as the radio grid, right but not first-try), and **radio** (several cards filled from Radio Búho calls, read while unrecorded) |
| Valentina and Samuel | `assets/valentina.webp`, `assets/samuel.webp` | Cut out of the existing Restrepo family picture (`assets/family.webp`) by `tools/crop_family_kids.py` (Pillow, CPU): no new art. Samuel's hidden arm is his other arm mirrored |
| Voices | `js/speech.js`, `js/lesson.js` | Roles `valentina` and `samuel` (María / Raúl until their voices exist); story names for both |
| Review | `js/review.js` | Number items get a number-pick question; `años` is matched inside sentences but shown as *doce años* (never bare) |
| Songs in the Radio tab | `js/radio.js` | A lesson episode with songs lists them with play buttons and karaoke |
| Checker | `prototype/tools/check_vocab.mjs` | Unit 1.3; the `lookalike` tag reaches the validator; song lyrics (`audio/songs/songs.json`) are checked at their lesson; `--todo` lists Valentina's and Samuel's lines under their planned voices and the number songs in `TODO_songs.json` |
| Version | `sw.js`, `js/app.js` | `2026-10-26.u13`; the service worker also caches the songs, `clips.json`, `songs.json` and the two new pictures |

## 4. Songs as wired

From content plan §6 (Juan's rule of 23 Oct: each numerals version goes in the lesson right after the one that completes its numbers). Approved versions only; converted on the CPU with the prototype's export filter (`afade`, `loudnorm=I=-16:TP=-1.5:LRA=11`, mono 24 kHz, MP3 64 kb/s) by `prototype/tools/make_number_songs.py`, which also writes `audio/songs/songs.json` (the aligned word timings from each song's JSON) and cuts the clips N1–N6.

| Song (approved version) | Letras | Con números |
|---|---|---|
| Del uno al diez · `numeros_1_10_s1` (Version A) | L5 | L6 |
| Del diez al veinte · `numeros_10_20_s2` | L9 | L10 |
| Uno, once · Dos, doce · `numeros_uno_once_s5` | L10 | L10 |
| Dos, doce, veintidós · **not chosen yet** (round 2) | L13 (placeholder) | L14 (placeholder) |
| Del veinte al treinta y uno · `numeros_20_31_s2` | L14 | L15 |
| Uno, diez, once… treinta y uno · `numeros_uno_diez_once_s1` | L15 | L15 |

- **«Dos, doce, veintidós» placeholder:** its steps use the song id `numeros_dos_doce_veintidos`, which has no file yet, so they show "Song coming soon" and light the words on the beat. The placeholder words are the measurement front-runner's (`v8h`). When Juan picks a version, set it in `SONGS` in `make_number_songs.py` (one line) and run the script: the file, the timings and the lyrics shown come from that version.
- **Clips N1–N6** (inside the learn lessons, content plan §11.2) are cut from the approved songs: N1 and N2 from «Del uno al diez» (lines 1–2 and 3–4), N3 and N4 from «Del diez al veinte», N5 and N6 from «Del veinte al treinta y uno». N1 therefore starts on *uno*, not *cero* (no approved song has *cero*); *cero* is taught in L4 with the countdown instead.
- **Radio Búho in L15 plays the set** (all six songs, in teaching order), not one long song, as `number_songs_plan.md` proposed. The chorus chant N9 (*¿Cuántos años tienes? ¡Doce, doce, doce años!*) has no song and is left out.

## 5. Audio

No new recordings. Every new line goes into `audio/TODO_lines.json` with its speaker's role: Buhísimo (`buho_profesor`, `buho_abuelo`), Matilda (`matilda`), Max (`max`), **Valentina (`valentina`, planned voice `co_f_teen`)**, **Samuel (`samuel`, planned voice `co_m_teen`)**, neutral lines in María and Raúl. Until a line is recorded, the text fallback works as in 1.2: listening steps become read-and-choose, number picks and dictations show the words to read, the radio cards say "The calls aren't recorded yet, so read them", and the speaking steps still run. The count is in the commit and the report.

## 6. Art

No image generation: existing art and code-drawn art only.

| Need | Now | Later (art TODO) |
|---|---|---|
| Valentina, Samuel | Cut from the existing Restrepo family picture | Their own flat-style poses (wave, thinking, celebrate), Valentina in her colours (canon favourite *morado*, a *mochila wayuu*), Samuel with his *carriel* |
| ID card («carnet») | Drawn in code (`js/art.js`): photo, Colombian stripe, question labels | A painted card for the story (Max's card in the grass) |
| Numbers | Big digits in the Salento palette (code) | Number Invaders ships and sky (painted); Max counting on his fingers |
| Countdown | Max's jump pose (`max-jump`) | Max mid-jump over the Cocora valley |
| Story L18 | The Salento street scene | Cocora valley with wax palms; Max searching the grass; Buhísimo flying in with the card |
| The Restrepo house (L2) | — | The front door, the family meeting Matilda and Max |
| Radio Búho | The owl poses | Buhísimo at the microphone (MOSS test exists for 1.2) |

## 7. Tests

- `node tools/check_vocab.mjs` and `--plurals` pass; `node prototype/tools/check_vocab.mjs` passes for 1.1–1.3 (and lists the lines that aren't plan sentences).
- `prototype/tools/e2e-unit.mjs` gains section V (Unit 1.3): 1.3 locked until the 1.2 check; every 1.3 lesson in order by keyboard at 1366×768 (a wrong answer each where the step allows it, every step fits without scrolling); every 1.3 lesson by touch at 390×844 (no horizontal scrolling); the songs play and their words light up on the aligned timing (letras and numerals); the placeholder song says "Song coming soon"; the Radio tab's 1.3 episodes; Me and My knowledge; screenshots of every new screen type at both sizes, with the feedback after CHECK. `e2e.mjs` and `e2e-keyboard.mjs` still pass.
- Service worker / app version `2026-10-26.u13`.
