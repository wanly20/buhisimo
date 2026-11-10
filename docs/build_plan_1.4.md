# Build plan: Unit 1.4 «¡…y que cumplas muchos más!» in the v2 prototype

*11 November 2026. A plan for Juan to review before anything is built. Sources: `docs/content_plan_1.1-1.6.md` §8 (Unit 1.4), §3 (story canon), §11 (songs, clip D1–D9) and the "Decisions applied" sections; `content/lessons_1.1-1.6.json` and `content/sentences_1.1-1.6.json` (1.4 rows); Juan's decisions up to 29 Oct 2026 (capitals rule, numerals-karaoke placement, look-alikes, the «Who is it?» layout, slow and even spelling, characters changing per lesson, Max's and Matilda's voices, songs with taught words only). Same engine as 1.1–1.3: 1.4 adds one content file (`unit-1-4.js`), one line in `course.js`, 13 nodes in `path-data.js` and a few exercise types (`js/exercises-1-4.js`), mostly around a calendar drawn in code. Nothing in this plan has been built, recorded or generated yet.*

**Status of the content plan.** All 74 Unit 1.4 sentences in the content plan pass `node tools/check_vocab.mjs` today (run read-only for this plan). This plan adds 68 lines that are not in the content plan yet, mostly game prompts, birthday-wall bubbles, Radio Búho calls and story fixes. All of them pass the validator at unit 1.4 (`--unit 1.4 --text`) except «¡Feliz cumpleaños!», which needs Decision 1. Section 3 lists the problems that the validator can't see.

## 1. Shape

1.4 is the next section on the path after the 1.3 unit check (1.3 L20), in **terracotta**, with 13 nodes. It needs no split into map sections, because 13 lessons is within the 11–15 range. Lessons still lock one after the other: 1.4 L1 opens only when 1.3 L20 is done (`?unlock=all` and the "For teachers" settings still open everything). The placeholder 1.4 section in `path-data.js` (four "Coming soon" nodes) is replaced.

| # | Type | Title (Spanish; English underneath) | Host | New items (counted) | Exercise types |
|---|---|---|---|---|---|
| L1 | repaso | Veinte, veinticinco, treinta · *Review: numbers 0–31* | Buhísimo | — | count in fives, number pick (look-alikes), **«Del veinte al treinta y uno» con números**, dictation, ID card read, «Who is it?» (*el amigo*), gap, number → word, tiles, type, match, speak |
| L2 | learn | La semana · *The week* | Matilda | la semana, lunes, martes, miércoles, jueves (5) | intro, **"small letters" card**, **calendar tap (week strip)**, clip D1, **order the days**, listen, **builder ES→EN, then EN→ES**, pick, type, match, speak |
| L3 | learn | ¡Sábado! · *Friday, Saturday, Sunday* | Max | viernes, sábado, domingo (3) | intro, calendar tap, **week card L M X J V S D**, clip D2, order the whole week, sort school days / weekend, listen, gap, builders, pick, type, match, speak |
| L4 | learn | Enero… abril · *January to April* | Samuel | el mes, enero, febrero, marzo, abril (5) | intro, **calendar tap (year view)**, sort day or month (*martes / marzo*), clip D3, order, **spell *marzo***, listen, builders, pick, type, match, speak |
| L5 | learn | Mayo… agosto · *May to August* | Valentina | mayo, junio, julio, agosto (4) | intro, ***junio / julio*** card and choice, calendar tap, **spell *junio***, culture card (seasons), clip D4, order, gap, builders, pick, type, match, speak |
| L6 | learn | Septiembre… diciembre · *September to December* | Matilda | septiembre, octubre, noviembre, diciembre, el año (5) | intro, ***el nombre / noviembre*** card and **name-or-month** choice, calendar tap, clip D5, order the whole year, listen, gap, builders, pick, type (*el año*, ñ fix-up), match, speak |
| L7 | listen | *Radio Búho: the week and the months* | Buhísimo | — | **Radio Búho plays «La semana» and «El año»** with karaoke, gaps on the songs, **call-in grid** (day or month + face), transcript, «Who is it?», two questions |
| L8 | game | *Game: calendar tap* | Max | — | study card, **Calendar tap** (three waves: days, months, look-alikes), **spell *julio***, order, listen |
| L9 | learn | ¿Cuándo es tu cumpleaños? · *When is your birthday?* | Valentina | ¿Cuándo es tu cumpleaños?, el cumpleaños, tu, el primero, el uno (5) | intro, **mi / tu table** (*tu / tú*), gap, **birthday wall (months)**, **«Who is it?» (whose month?)**, *el primero / el uno* cards, calendar (which page?), pick, listen, builders, type, match, speak |
| L10 | learn | La fecha: el veinte de julio · *The date* | Samuel | el, la fecha (2), + ¡Feliz cumpleaños! if Decision 1 is OK (3) | «Uno, diez, once… treinta y uno» con números, **pattern card *el + veinte + de + julio***, intro, calendar read and date tap, **birthday wall (dates)**, «Who is it?» (whose date?), **date dictation**, builders, pick, type, **song «¿Cuándo es tu cumpleaños?» (letras)**, match, speak |
| L11 | speak | *Speak: say the date* | Matilda | — | **«¿Cuándo es tu cumpleaños?» con números**, shadow 5 dates, say the date from a calendar, **calendar tap with full dates** (moved here from L8), builder then type, **"Your birthday"** (You Do) |
| L12 | story | El cumpleaños de Max · *Story: Max's birthday* | the whole cast | — | the 11-line story (fixed, §3), checks after lines 3, 7 and 10, then put the last lines in order |
| L13 | check | *Unit check: the party calendar* | Buhísimo | — | no hints, no hearts: order the week, month tap with look-alikes, two date dictations, **party-calendar call-in** (three callers), gap *tu / tú*, «Who is it?», listen, type, match, production as Max (tiles → type → speak) |

Counted new items: 27 CSV rows + *tu* and *el* (helpers) = 29, as in the content plan. The largest lessons have 5 (L2, L4, L6, L9). L10 has 2, or 3 with «¡Feliz cumpleaños!» (Decision 1), which is why the phrase goes there and not into L9. Nothing is above 6.

**Every learn lesson** keeps the 1.1–1.3 rhythm (each new item is shown on a card and practised at once, the set is mixed, then there is one listening step and one speaking step). From 1.4 on, the mixed part follows the **Spanish We Do order** exactly: **sentence builder ES→EN, then EN→ES → "What does it mean?" (pick) → "Now in Spanish" (type) → Show Me (speak the whole chant or sentence)**. The ES→EN builder is new (§5, Decision 9). The lesson ends with the student saying something whole. That is the app's Show Me; there is no exit ticket.

**Titles:** the manifest's titles, checked at their own lesson. L7, L8, L11 and L13 have English titles only. Song titles: «La semana» (fine from L2) and **«El año»** for the months song. «Los meses» would be a bare plural before the 1.6 plural rule card, and the validator rejects it (§3, A7).

**Praise:** the 1.2 set (*¡Muy bien! ¡Fenomenal! ¡Fantástico! ¡Buhísimo!*), said by Buhísimo.

**Completion:** L13 says "Unit 1.4 complete!".

### Characters change per lesson (Juan, 26 Oct)

Each lesson has a **host**. The host is on the start card, on most intro cards and on the finish card, and the others come in where their lines belong. Every child hosts at least twice, and the hosts follow the story: Matilda is sleepy on Mondays, Max jumps on Saturdays, and each child hosts the lesson with their own birthday month.

| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | L11 | L12 | L13 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Buhísimo | Matilda | Max | Samuel (*enero*) | Valentina (*julio*) | Matilda (*junio* look-alike) | Buhísimo + callers | Max | Valentina (asks everyone) | Samuel (*el diez de enero*) | Matilda | cast | Buhísimo |

## 2. Lesson by lesson

Speakers: **B** Buhísimo, **M** Matilda, **X** Max, **V** Valentina, **S** Samuel, **N** neutral (María ×2 + Raúl, used for prompts in listen, pick, calendar and dictation steps, as in 1.3), **C** a Radio Búho caller. ✱ marks the main lines that are not in the content plan yet. All 68 of them are added to `content/sentences_1.1-1.6.json` when the unit is built, and §8.1 lists every line. Each lesson lists its steps in order, then its new lines.

### L1 · repaso · Veinte, veinticinco, treinta (host: Buhísimo)

Spaced retrieval of 1.3 (numbers 0–31, names, age, the ID card) plus 1.1–1.2 threads. These are all things 1.4 relies on: dates need every number up to 31.

1. `count` in fives: *Cinco, diez, quince, veinte, veinticinco, treinta.* ✱ (tap in order).
2. `numpick` 25 from 24 / 25 / 15 / 5 (`lookalike: veinticuatro/veinticinco`).
3. `song` «Del veinte al treinta y uno» **con números** (the numerals versions come back in later reviews, as the content plan says).
4. `dictation`: *Uno, cinco, diez, quince, veinte, veinticinco, treinta.* → 1 5 10 15 20 25 30.
5. `numpick` 27 from 26 / 27 / 17 / 7 (`lookalike: veintiséis/veintisiete`).
6. `idcard` read: Max's card → *Max tiene trece años.* ✱ / *tres años* / *doce años*.
7. «Who is it?» (bubbles, the 1.3 L17 step, already recorded): Matilda says *Es el amigo de Max.*; Samuel or Valentina.
8. `gap`: *Mi apellido es Restrepo.* (blank *Mi apellido*).
9. `numtype` 31 → *treinta y uno*.
10. `tiles` *Me llamo Samuel. Tengo trece años.*
11. `type` "How old are you?" → *¿Cuántos años tienes?*
12. `match` 15, 20, 25, 30, 31.
13. `speak` *Uno, cinco, diez, quince, veinte, veinticinco, treinta.*

New lines: 3 (N). Everything else is already recorded.

### L2 · learn · La semana (host: Matilda)

**New (5):** la semana, lunes, martes, miércoles, jueves (C). **Clip:** D1.

1. `intro` **lunes**: M (sleepy pose) *Es lunes.* "It's Monday." Note: *Es lunes* = it's Monday. Spanish needs no word for "it", so ***es*** here means "it is" (it meant "he/she is" in 1.1; §3 A6). A week strip shows L lit.
2. `table` **"Small letters" card** (the capitals rule, 21 Oct): *Es lunes.* ✓ · *Es Lunes.* ✗ "Almost: days and months take a small letter" · *Lunes, martes…* ✓ "the first word of a sentence still takes a capital, even a day".
3. `intro` **martes**: M *Es martes.*
4. `calendar` tap (week strip, only L and M active): N *Es martes.* → tap M.
5. `intro` **miércoles**: X *Es miércoles.* Note: accent on the *é* (MIÉR-co-les). Spanish calendars write **X** for miércoles, because M is martes.
6. `pick` *Es miércoles.* → It's Wednesday / It's Tuesday / It's Monday / It's March.
7. `intro` **jueves**: S *Es jueves. ¡Fenomenal!*
8. `calendar` tap: N *Es jueves.* → J (L M X J active).
9. `intro` **la semana**: B *La semana: lunes, martes, miércoles, jueves…* Note: the week has seven days; the other three come next lesson.
10. `clip` D1 *Lunes, martes, miércoles, jueves: ¡la semana!* (listen, chant along, then a gap on *miércoles*).
11. `order` (new, §5): tap *lunes → jueves* in order; the week strip lights up as you go.
12. `listen` N *Es martes.* → *Es martes. / Es miércoles. / Es lunes. / Es jueves.*
13. **Builder ES→EN** (`tiles`, `dir: "es-en"`): *Es jueves. ¡Fenomenal!* → "It's · Thursday. · Great!" (+ "Tuesday.", "Monday.").
14. **Builder EN→ES**: "It's Wednesday." → *es · miércoles* (+ *martes, jueves, está*).
15. `pick` **What does it mean?** *Lunes, martes, miércoles, jueves.*
16. `type` **Now in Spanish:** "It's Monday." → *Es lunes.* (capital E, small l; "Es Lunes" is Almost).
17. `type` "Thursday" → *jueves* (a single day is always small: "Jueves" is Almost).
18. `match` la semana, lunes, martes, miércoles, jueves.
19. `speak` **Show Me:** *Lunes, martes, miércoles, jueves: ¡la semana!*

### L3 · learn · ¡Sábado! (host: Max)

**New (3):** viernes, sábado, domingo (C), to finish the week, with heavy review of L2. **Clip:** D2.

1. `order` warm-up: *lunes → jueves*.
2. `intro` **viernes**: X *Es viernes. ¿Qué tal, Samuel?*
3. `calendar` tap: N *Es viernes.* (L–V active).
4. `intro` **sábado**: X (jump pose) *Es sábado. ¡Fantástico!* Note: SÁ-ba-do, accent on the first *á*.
5. `pick` N *Es sábado. Max está fenomenal.*
6. `intro` **domingo**: B *Es domingo. Matilda está muy bien.* (Matilda dozing in the sun.)
7. `calendar` **week card**: the whole week **L M X J V S D**. Spanish calendars start on Monday and write X for miércoles. Tap a letter to hear its day (§3 A15, Decision 6).
8. `clip` D2 *Viernes, sábado… ¡domingo! ¡Fenomenal!*
9. `order` the whole week (7 tiles).
10. `sort` "school days" / "weekend" (English labels): *lunes … domingo*.
11. `listen` N *Es domingo.*
12. `gap` *Viernes, sábado, domingo.* (blank *sábado*; *jueves, domingo*).
13. Builder ES→EN: *Es viernes. ¿Qué tal, Samuel?*
14. Builder EN→ES: "It's Sunday. Matilda is very well." → *es · domingo · Matilda · está · muy · bien* (+ *sábado*).
15. `pick` What does it mean? *Es sábado. Max está fenomenal.*
16. `type` Now in Spanish: "It's Saturday." → *Es sábado.* (accent and small-letter fix-ups).
17. `type` "Friday" → *viernes*.
18. `match` viernes, sábado, domingo, jueves, la semana.
19. `speak` Show Me: *La semana: lunes, martes, miércoles, jueves, viernes, sábado, domingo.* (the D6 line, said).

### L4 · learn · Enero… abril (host: Samuel)

**New (5):** el mes, enero, febrero, marzo, abril (C). **Clip:** D3.

1. `calendar` warm-up: N *Es viernes.* → tap.
2. `intro` **enero**: S *Es enero.* A month page headed *enero* (small letter, like the days).
3. `intro` **febrero**: X *Es febrero.* (He grins: his secret comes out in L9.)
4. `calendar` year view (enero and febrero active): N *Es febrero.*
5. `intro` **marzo**: V *Es marzo.* Note: ***marzo*** (a month) and ***martes*** (a day) both start with *mar-*.
6. `sort` "a day" / "a month": *lunes, marzo, martes, enero, jueves, febrero*.
7. `intro` **abril**: M *Es abril.*
8. `intro` **el mes**: B *¿El mes? Febrero.* Note: *el mes* = the month.
9. `clip` D3 *Enero, febrero, marzo, abril… ¡muy bien!*
10. `order` *enero → abril*.
11. `spell` N *¿Cómo se escribe marzo? — Eme, a, erre, zeta, o.* → type *marzo*. The 1.2 alphabet comes back, with slow and even spelling (§8.1).
12. `listen` N *¿El mes? Marzo.*
13. Builder ES→EN: *Es abril. Max está fenomenal.*
14. Builder EN→ES: "The month? January." → *¿el mes? · enero* (+ *febrero, es*).
15. `pick` What does it mean? *¿El mes? Febrero. ¡Fantástico!*
16. `type` Now in Spanish: "It's March." → *Es marzo.*
17. `type` "the month" → *el mes*.
18. `match` el mes, enero, febrero, marzo, abril.
19. `speak` Show Me: *Enero, febrero, marzo, abril… ¡muy bien!*

### L5 · learn · Mayo… agosto (host: Valentina)

**New (4):** mayo, junio, julio, agosto (C). **Clip:** D4. **Look-alike:** *junio / julio* (both taught here).

1. `order` warm-up: *enero → abril*.
2. `intro` **mayo**: V *Es mayo.*
3. `intro` **junio**: M *Es junio.*
4. `calendar` year view: N *Es mayo.*
5. `intro` **julio**: V *Es julio. ¡Fantástico!* **Look-alike card:** *junio* (with **n**) / *julio* (with **l**): one letter apart, so listen for the n or the l. Both months are on screen, coloured differently.
6. `choose` "June or July?" (like 1.3's "26 or 27?"): X *¿Junio? No, julio.* → July (`lookalike: junio/julio`).
7. `calendar` two pages side by side, *junio* and *julio*: N *Junio, julio. ¡Junio! ¡Julio!* is played first, then N *Es junio.* → tap the right page.
8. `spell` N *¿Cómo se escribe junio? — Jota, u, ene, i, o.* → type *junio*. Spelling separates the pair letter by letter (*julio* is spelt in L8).
9. `intro` **agosto**: B *Es agosto. ¡Muy bien!*
10. **Culture card** (English, code-drawn picture): Colombia is near the equator and has no four seasons, so Salento feels much the same all year, with rainy and dry spells. July is winter in Melbourne and in Chile. The only Spanish is *Es julio.*
11. `clip` D4 *Mayo, junio, julio, agosto… ¡fantástico!*
12. `order` *mayo → agosto*.
13. `gap` *Mayo, junio, julio, agosto.* (blank *julio*; *junio / julio*).
14. Builder ES→EN: *¿Junio? No, julio.*
15. Builder EN→ES: "It's July. Buhísimo is feeling great." → *es · julio · Buhísimo · está · fenomenal* (+ *junio, es*).
16. `pick` What does it mean? *¿Junio? ¡Fantástico!*
17. `type` Now in Spanish: "It's July." → *Es julio.*
18. `type` "June" → *junio*.
19. `match` mayo, junio, julio, agosto, el mes.
20. `speak` Show Me: *Mayo, junio, julio, agosto… ¡fantástico!*

### L6 · learn · Septiembre… diciembre (host: Matilda)

**New (5):** septiembre, octubre, noviembre, diciembre, el año (C). **Clip:** D5. **Look-alike:** *el nombre* (1.3 L16) / *noviembre*.

1. `calendar` warm-up: N *Es julio.* (*junio / julio* again).
2. `intro` **septiembre**: M *Es septiembre.*
3. `intro` **octubre**: S *Es octubre.*
4. `calendar` year view: N *Es octubre.*
5. `intro` **noviembre**: M, holding Samuel's ID card next to a calendar page, says *¿El nombre? Samuel. ¿El mes? Noviembre.* **Look-alike card:** *el nombre* (on the ID card: NOM-bre) / *noviembre* (on the calendar: no-VIEM-bre).
6. `choose` **name or month?** (picture choice: the ID card or the calendar page): hear *noviembre* → calendar; then hear *el nombre* → ID card. The word clips already exist (`lookalike: nombre/noviembre`).
7. `intro` **diciembre**: X *Es diciembre. ¡Fenomenal!*
8. `intro` **el año**: B *El año: enero, febrero, marzo…* Note: *el año* = the year. You already know its plural from *tengo doce años*. The **ñ** matters, so the ñ fix-up catches *ano*.
9. `clip` D5 *Septiembre, octubre, noviembre, diciembre: ¡el año!*
10. `order` the whole year (12 tiles in two rows; the year view lights up).
11. `listen` N *Es diciembre. ¡Fenomenal!*
12. `gap` N *¿El nombre? Samuel. ¿El mes? Noviembre.* (blank *noviembre*; *noviembre / el nombre*).
13. Builder ES→EN: *Es diciembre. ¡Fenomenal!*
14. Builder EN→ES: "The name? Samuel. The month? November."
15. `pick` What does it mean? *El año: enero, febrero, marzo…*
16. `type` Now in Spanish: "It's October." → *Es octubre.*
17. `type` "the year" → *el año*.
18. `match` septiembre, octubre, noviembre, diciembre, el año.
19. `speak` Show Me: *Septiembre, octubre, noviembre, diciembre: ¡el año!*

### L7 · listen · Radio Búho: the week and the months (host: Buhísimo)

The episode «La semana y los meses» (content plan §11.3 D): an intro over the jingle, the two songs, five calls and the goodbye. The Radio tab lists it once L7 is open.

1. `songset`: B (D0) *¡Buenos días! Soy Buhísimo. ¿Cómo estás?*, then **«La semana»** and **«El año»**, each playable with its karaoke.
2. `song` «La semana», then a `gap` on it (*miércoles*).
3. `song` «El año», then a `gap` on it (*junio / julio*).
4. `radio` **call-in grid** (the 1.2 `radio` type). Rows are callers; the columns are **the day or month they say** (tap it on a week strip or a month list) and **how they are** (the 1.2 faces). Callers who aren't in the cast stay voices only, with no pictures.
   - V *¡Hola, Buhísimo! Me llamo Valentina. ¡Es sábado! ¡Fantástico!* → sábado, fantástico
   - C (Peru) *¡Hola, Buhísimo! ¿Es martes?* — B *No, es miércoles.* — C *¿Miércoles? ¡Fenomenal!* → miércoles, fenomenal
   - X *¡Hola, Buhísimo! Soy Max. ¿Lunes? Matilda está regular.* → lunes, regular (Matilda's sleepy Monday)
   - C (Spain) *¡Hola, Buhísimo! Soy de España. Es domingo. ¡Fenomenal!* → domingo, fenomenal
   - C (Chile) *¡Hola! Soy de Chile. ¿Julio? Regular.* → julio, regular (winter in Chile: the L5 culture card)
5. `transcript` (tap a line to hear it, EN toggle).
6. «Who is it?» (bubbles, 1 × 2): B says *¡Es sábado! ¡Fantástico!* Who phoned? Valentina or Max. After the answer the bubbles show *sábado* (Valentina) and *lunes* (Max). Wrong answer: "On the radio Max said «¿Lunes?». It was Valentina who said «¡Es sábado!»."
7. `pick` N *¿Es martes? — No, es miércoles.*
8. `pick` B (D9) *¡Muy bien! La semana, el mes, el año… ¡hasta luego!*

The callers ask *¿Es martes?*, because *¿Qué día es (hoy)?* can't be used (*qué día*, *hoy* and *el día* aren't taught: §3 A8).

### L8 · game · Game: calendar tap (host: Max)

**Days and months only.** The content plan's "later rounds use the full date (after L10)" can't be in L8, which comes before L10, so those rounds move to L11 and L13 (§3 A1, Decision 5).

1. `calendar` **study card**: the week strip and the year view, labelled; tap to hear.
2. `caltap` **Calendar tap** (§5): a wall calendar. Hear the prompt (N *Es lunes.* … *Es diciembre.*, all 19 recorded once each) and tap the day or month before Max lands on it.
   - Wave 1 **la semana**: the 7 days, shuffled.
   - Wave 2 **el año**: the 12 months, shuffled.
   - Wave 3 **look-alikes**: N *Es junio. — No, es julio.* (tap the one that's right: *julio*); *martes / marzo* (a day strip and a month strip both on screen); *el nombre / noviembre* (an ID-card tile sits among the months; hear *el nombre* → tap the card).
   - Score, streak and "best" (kept on the device); "Slower" halves the speed (on under reduced motion); keyboard 1–7 for days, arrows + Enter. Like Number Invaders, it must really move and feel like a game (Juan, 27 Oct).
3. `spell` N *¿Cómo se escribe julio? — Jota, u, ele, i, o.* → type *julio* (the partner of L5's *junio*).
4. `order` the whole week, against the clock.
5. `listen` N *Es junio. — No, es julio.*

### L9 · learn · ¿Cuándo es tu cumpleaños? (host: Valentina)

**New (5):** ¿Cuándo es tu cumpleaños?, el cumpleaños, el primero, el uno (C) · tu (H). Only ***el primero / el uno + de + month*** works here: *el* + any other number waits for L10, so the cast give only their **month** (story canon §3: Samuel *enero*, Max *febrero*, Matilda *junio*, Valentina *julio*, Buhísimo *agosto*).

1. `calendar` warm-up: N *Es enero.*
2. `intro` **el cumpleaños** (a cake picture): V *¿El cumpleaños de Samuel? Enero.* ✱ Note: *el cumpleaños* is one birthday even though it ends in *-s*.
3. `intro` **¿Cuándo es tu cumpleaños?**: V to Max *¿Cuándo es tu cumpleaños?* Note: learn it as one question; *cuándo* = when.
4. `table` **mi / tu**: *mi cumpleaños* = my birthday (1.3), *tu cumpleaños* = your birthday. Example V *¿Y tú, Max? ¿Tu cumpleaños?* **Point out *tu / tú*:** *tu* (your) has no accent; *tú* (you, as in *¿Y tú?*) has one (§4, Decision 8).
5. `gap` *¿Cuándo es tu cumpleaños?* (blank *tu*; *tu / tú / mi*) (`lookalike: tu/tú` if Decision 8 is OK).
6. **Birthday wall** (§5; months only). Five portraits with bubbles; tap to hear: S *¿Mi cumpleaños? Enero.* ✱ · X *¿Mi cumpleaños? Febrero.* ✱ · M *¿Mi cumpleaños? Junio.* ✱ · V *¿Mi cumpleaños? Julio.* ✱ · V *¿Cuándo es tu cumpleaños, Buhísimo?* — B *¿Mi cumpleaños? Agosto.*
7. **«Who is it?»** (bubbles, 2×2: Valentina, Samuel, Matilda, Max): B (speaker) *¿El cumpleaños? Julio.* ✱ The deciding word *julio* is highlighted, and the title is "Whose birthday month is it?". After the answer each bubble shows its month: *julio, enero, junio, febrero*. Wrong-answer feedback says why: "Matilda's birthday is in **junio** (with n). **Julio** (with l) is Valentina's." (`lookalike: junio/julio`). The line is said by Buhísimo, not by Valentina, so her voice doesn't give the answer away, and no English sits under the Spanish.
8. `intro` **el primero** (a *marzo* page with 1 circled): B *El primero de marzo.* ✱ Note: in Colombia the 1st is *el primero*. The pattern is ***el primero de* + month**; L10 extends it to every number.
9. `intro` **el uno**: B *El uno de marzo, el primero de marzo: ¡muy bien!* Note: in Spain people often say *el uno*. Both mean the 1st.
10. `calendar` **which page?** Four small month pages, each with its 1st circled: N *Es el primero de mayo.* ✱ → tap *mayo*.
11. `pick` N *¿El cumpleaños de Samuel? ¿El primero de mayo? — No.*
12. `listen` N *¿Cuándo es tu cumpleaños? — Es el primero de junio.* This is said in neutral voices, never by a cast member (Matilda's birthday is 15 June: §3 A5). The choices are *…primero de julio*, *¿Mi cumpleaños? Junio.* and *…primero de enero*.
13. Builder ES→EN: N *¿Cuándo es tu cumpleaños, Buhísimo? — ¿Mi cumpleaños? Agosto.*
14. Builder EN→ES: "When is your birthday?" → *cuándo · es · tu · cumpleaños* (+ *tú, mi*).
15. `pick` What does it mean? V *¿Y tú, Max? ¿Tu cumpleaños?*
16. `type` Now in Spanish: "When is your birthday?" → *¿Cuándo es tu cumpleaños?* (capital after ¿, accent on *á*, no accent on *tu*).
17. `type` "My birthday? January." → *¿Mi cumpleaños? Enero.*
18. `match` el cumpleaños, tu, el primero, el uno, ¿Cuándo es tu cumpleaños?
19. `speak` Show Me, as Max: *¿Cuándo es tu cumpleaños? — ¿Mi cumpleaños? Febrero.* ✱

### L10 · learn · La fecha: el veinte de julio (host: Samuel)

**New (2):** el (H, moved to 1.4 by P6) · la fecha (C). **+ ¡Feliz cumpleaños!** (helper chunk, if Decision 1 is OK). Then a date workout: from here every one of the 31 × 12 dates is open (a generated list, validated).

1. `song` «Uno, diez, once… treinta y uno» **con números** (review: dates are written in digits).
2. `pattern` **worked example** (the 1.3 pattern card): *el + veinte + de + julio → el veinte de julio* (20/7), with rows *el primero de marzo* (1/3, from L9), *el diez de enero* (10/1) and *el veinte de julio* (20/7). Note: *el* in front, *de* before the month, numbers from 1.3. Written day/month, as in Australia.
3. `intro` **el**: S *Es el veinte de julio.* Note: you met *el* inside *el nombre* and *el mes*; now it goes before a number.
4. `intro` **la fecha**: S *La fecha es el uno de abril.*
5. `calendar` **read**: a *julio* page with 20 circled → *el veinte de julio* / *el veinte de junio* / *el doce de julio* (`lookalike: junio/julio`).
6. `calendar` **date tap**: N *Es miércoles, el doce de marzo.* → tap 12 on the *marzo* page. The weekday column (X) lights too. Further rounds: N *La fecha: lunes, el primero de septiembre.* · N *¿La fecha? Viernes, el uno de agosto.* (weekdays fixed: §3 A4).
7. **Birthday wall (dates):** S *Mi cumpleaños es el diez de enero.* · B *Mi cumpleaños es el siete de agosto. ¡Fenomenal!* · N *El cumpleaños de Matilda es el quince de junio.* · N *El cumpleaños de Max es el veintinueve de febrero.* · N *El cumpleaños de Valentina es el veinte de julio.*
8. **«Who is it?»** (bubbles, 2×2): B *¡El veinte de julio!* ✱ "Whose birthday is it?" After the answer the bubbles show *el quince de junio*, *el veinte de julio*, *el diez de enero* and *el veintinueve de febrero*. Wrong answer: "{picked}'s birthday is *el quince de junio*. *El veinte de julio* is Valentina's."
9. `intro` **¡Feliz cumpleaños!** (Decision 1): M *¡Feliz cumpleaños, Valentina!* ✱ The picture is the 20 July scene: Salento's plaza with Colombian flags and fireworks. **Culture note** (English): 20 July is Colombia's Independence Day, so Valentina shares her birthday with the whole country.
10. `datedict` (§5): N *El cumpleaños de Max es el veintinueve de febrero.* → write **29 / 2**.
11. `idcard` read: Valentina's card, with V *Mi nombre es Valentina. Mi cumpleaños es el veinte de julio.* (`lookalike: nombre/noviembre, junio/julio`, as tagged in the content plan) → pick her birthday.
12. Builder ES→EN: *El cumpleaños de Valentina es el veinte de julio.*
13. Builder EN→ES: "The date is the thirty-first of December." → *la fecha · es · el · treinta y uno · de · diciembre* (+ *el uno, noviembre*).
14. `pick` What does it mean? N *Es miércoles, el doce de marzo.*
15. `type` Now in Spanish: "It's the fifteenth of June." → *Es el quince de junio.*
16. `type` "Samuel's birthday is the tenth of January." → *El cumpleaños de Samuel es el diez de enero.*
17. `song` **«¿Cuándo es tu cumpleaños?» (letras)** (Decision 7): the cast's birthdays in calendar order (§7).
18. `match` la fecha, el cumpleaños, *el veinte de julio* / 20 July, *el diez de enero* / 10 January, *el primero de marzo* / 1 March.
19. `speak` Show Me: *El cumpleaños de Valentina es el veinte de julio.*

### L11 · speak · Speak: say the date (host: Matilda)

1. `song` «¿Cuándo es tu cumpleaños?» **con números** (the numerals rule of 23 Oct: the lesson right after the one that taught everything the song needs, which is L10). If Decision 7 is Not OK, «Del veinte al treinta y uno» con números takes its place.
2. `speak` shadow 5 dates (N model): *Es martes, el primero de julio.* · *¿Cuándo es tu cumpleaños? — Es el uno de noviembre.* · *Es el quince de septiembre.* · *Es lunes, el veintidós de septiembre.* ✱ · *Es sábado, el primero de noviembre.* ✱
3. `calendar` **say it**: the calendar shows a circled date (Saturday 1 November) → say it; speech check against *Es sábado, el primero de noviembre.* (*el uno* also accepted).
4. `caltap` **with full dates** (moved from L8): N *Es el veinte de julio.* · *Es el diez de enero.* · *Es el siete de agosto.* · *Es el veintinueve de febrero.* → flip to the month, tap the day. For 29 February the calendar shows a leap-year February (§3 A14).
5. Builder EN→ES, then `type`: the calendar shows 15 June → *el quince de junio*.
6. **"Your birthday"** (You Do, §5, Decision 11): tap your own birthday on a calendar, then build the sentence (tiles), then type it, then say it: *Mi cumpleaños es el … de ….* The app makes the sentence from the date you tapped (from the validated date list). **Nothing is saved:** the date is forgotten when the step ends. There is no model audio for this step (372 possible dates).

With speaking snoozed, each `speak` step turns into a tiles step on the same sentence, so the lesson still completes and still practises the date.

### L12 · story · El cumpleaños de Max (cast: V, M, S, X, B)

The scene is the Restrepo kitchen with a wall calendar (*junio*, the 15th circled), and it ends at Matilda's birthday party. Checks come after lines 3, 7 and 10. Changes from the content plan are marked → (Decisions 2 and 3).

```
V:  ¿Cuándo es tu cumpleaños, Matilda?
M:  Es el quince de junio. ¿Y tú, Valentina?
V:  Julio. ¡El veinte de julio!                         → was «Julio. ¡Veinte de julio!»
    [check] Why is Valentina's birthday special? (it's Colombia's national day: fireworks!)
S:  ¿Y tú, Max? ¿Cuándo es tu cumpleaños?
X:  Febrero. ¡El veintinueve de febrero!                → was «Febrero. Veintinueve de febrero.»
S:  ¿El veintinueve de febrero? ¿Cuántos años tienes, Max?
X:  Trece. ¿El veintinueve de febrero? Uno, dos, tres… ¡tres!   → was «Trece. ¿El cumpleaños? ¡Tres!»
    [check] Why does Max only count to three? (29 February comes once every four years: three real birthdays)
B:  ¡Max es fantástico!
V:  La fecha: domingo, el quince de junio. ¡El cumpleaños de Matilda!
M:  ¡Fenomenal! ¡Gracias!
X:  ¡Feliz cumpleaños, Matilda!                         → new, only if Decision 1 is OK
    [check] What do they celebrate on Sunday 15 June? (Matilda's birthday)
```
Then put the last three lines in order (tiles, `lines: true`). The story year is 2025 and is never shown: 15 June 2025 is a Sunday, Max (born 29 Feb 2012) is 13 and has had three real birthdays (2016, 2020, 2024), as in 1.3 where he says *¡Trece!*. Picture: Max counting *uno, dos, tres* on his fingers (new art, §8.3).

### L13 · check · Unit check: the party calendar (host: Buhísimo)

No hints, no hearts.

1. `order` the whole week.
2. `caltap` (months, one round): N *Es julio.* (*junio* is a choice).
3. `choose` N *Mi nombre es Samuel. ¿El mes? Noviembre.* → "Which word is the month?" *noviembre* / *nombre*.
4. `datedict` N *Es jueves, el veintidós de mayo.* → 22 / 5 (was *jueves, el veintidós de abril*: §3 A4).
5. `datedict` N *Es sábado, el uno de marzo.* → 1 / 3 (was *sábado, el uno de mayo*).
6. `radio` **the party calendar** (a call-in, not in the Radio tab, like 1.3 L20). Three callers give their birthdays and the student taps each date on the party calendar (a sticker appears):
   - C (Spain) *Hola, Buhísimo. Soy de España. Mi cumpleaños es el uno de mayo.*
   - C (Colombia, `caller_neutral_f`) *Hola, Buhísimo. Soy de Colombia. Mi cumpleaños es el primero de octubre.*
   - C (Argentina) *¡Hola, Buhísimo! Soy de Argentina. Mi cumpleaños es el doce de noviembre.*

   The Spain caller says *el uno* and the Colombian says *el primero*: the L9 culture point, heard in a real call.
7. `gap` *¿Cuándo es tu cumpleaños?* (*tu / tú*).
8. «Who is it?» (2×2): B *¡El quince de junio!* → Matilda; the bubbles show the dates; feedback names *junio / julio*.
9. `listen` N *¿Cuándo es tu cumpleaños? — Es el primero de agosto.* (neutral voices: Buhísimo's is the 7th: §3 A5).
10. `type` "Monday, Wednesday, Friday." → *Lunes, miércoles, viernes.* (capital L because it starts the sentence, then small letters: the capitals rule in one line).
11. `type` "When is your birthday?" → *¿Cuándo es tu cumpleaños?*
12. `match` five months and dates.
13. `listen` N *El cumpleaños de Matilda es el quince de junio. El cumpleaños de Valentina es el veinte de julio.* (both look-alikes).
14. Production as Max: tiles → type → speak: X *¿Cuándo es tu cumpleaños? — Mi cumpleaños es el veintinueve de febrero.* ✱

## 3. Taught-before-used audit

Method: every Spanish word, phrase and structure in the content plan's §8 Unit 1.4 and in this plan was checked against what 1.1–1.4 teach, in lesson order: the validator (`tools/check_vocab.mjs`, whole run plus `--unit 1.4 --text` on each new line) and a read-through for what the validator can't see (meaning, canon, calendars, capitals). **Words:** every 1.4 word is taught before it is used; the validator passes all 74 content-plan sentences. The problems are below.

| # | Where | Problem | Proposed fix |
|---|---|---|---|
| A1 | L8 calendar tap | "Later rounds use the full date (after L10)": L8 comes **before** L10, so *el* + number (*el veinte de julio*) isn't taught yet. | L8 keeps days and months only. Full-date rounds go into L11 (calendar tap with dates) and L13. (Decision 5) |
| A2 | L12 story, Max: *Trece. ¿El cumpleaños? ¡Tres!* | Passes the validator, but means "The birthday? Three!". The English ("Birthdays? Three!") needs a plural (*los cumpleaños*, *tres cumpleaños*), whose unchanged-plural rule card is 1.6 L7. The validator rejects *Tres cumpleaños.* at 1.4. | *Trece. ¿El veintinueve de febrero? Uno, dos, tres… ¡tres!* Max counts his real birthdays on his fingers. Only taught words. (Decision 2) |
| A3 | Story and L10 | A birthday unit without ***¡Feliz cumpleaños!***. It isn't in the CSV or the helper words, and the validator rejects it (*cumpleaños* would be a bare noun). Nothing in the content plan uses it, but every story and party scene wants it. | Add «¡Feliz cumpleaños!» to `helper_words.csv` as a 1.4 chunk (one row; it then counts as one item, in L10). Juan or the coordinating session edits the CSV and `sync_vocab.py` copies it. (Decision 1) |
| A4 | L10, L11, L13 | **Weekdays and dates don't fit one calendar.** *martes, el doce de marzo* (true in 2024), *lunes, el primero de octubre* (2029), *domingo, el uno de agosto* (2021), *viernes, el primero de julio* (2022), *sábado, el uno de mayo* (2021), *jueves, el veintidós de abril* (2021). The story's *domingo, el quince de junio* is 2025. A calendar picture can't show them all. | One calendar, **2025** (the story year), never shown on screen: *Es miércoles, el doce de marzo.* · *La fecha: lunes, el primero de septiembre.* · *¿La fecha? Viernes, el uno de agosto.* · *Es martes, el primero de julio.* · *Es sábado, el uno de marzo.* · *Es jueves, el veintidós de mayo.* All six pass the validator. (Decision 4) |
| A5 | L9, L11, L13 | **Story canon.** *¿Cuándo es tu cumpleaños? — Es el primero de junio.* (L9), *…el uno de noviembre* (L11) and *…el primero de agosto* (L13) have no speaker in the content plan. Said by Matilda (15 June) or Buhísimo (7 August), they would contradict the canon. | Only neutral voices or callers say dates that aren't canon; the cast only ever say their own (§1 canon table). The build checks this: a cast line with a date must match the canon. |
| A6 | L2 on | ***Es lunes*** = "it's Monday": a new meaning of *es* (1.1, CSV English "is / he is / she is"). Not a vocabulary violation, but a new idea students meet without being told. | Say it on the first card (L2 step 1): "Spanish needs no word for *it*". |
| A7 | L7 song title | A title «Los meses» (the obvious one) is a bare plural, and plurals wait for the 1.6 rule cards. The validator rejects it. | Call the months song **«El año»** (its last line is *…diciembre: ¡el año!*). |
| A8 | L7 calls | "Callers say what day it is": the natural question *¿Qué día es hoy?* uses *qué día* and *hoy*, which aren't taught (the validator rejects *día* and *hoy*). | Callers ask *¿Es martes?* and answer *No, es miércoles.* Same for any later script. |
| A9 | Content plan §8 intro | "Days and months are lower case": true, but a sentence still starts with a capital (*Lunes, martes…*; *Julio. ¡El veinte de julio!*; *¿Junio? No, julio.*). Students need both halves of the rule. The engine's message for a missing capital on a day at the start of a sentence talks about "names of countries, places and people", which would confuse them. | The L2 "small letters" card teaches both halves. Change one engine message: when the capital is missing on a day or month that starts a sentence, say "A sentence starts with a capital letter, even when it starts with a day or a month." (§5) |
| A10 | L9 | *Es el primero de junio* already uses ***de* + month** before L10's worked example (*el* + number + *de* + month). That's fine (*el primero* is a CSV chunk and *de* is 1.1), but L10 should build on it rather than start fresh. | The L9 card shows the pattern *el primero de* + month, and L10's pattern card starts from it. |
| A11 | L9 | ***tu*** (your, new in L9) and ***tú*** (you, 1.2 *¿Y tú?*) meet in one sentence: *¿Y tú, Max? ¿Tu cumpleaños?* | Point the pair out on the mi/tu card and practise it in a gap (L9, L13). The accent fix-up already catches *tú cumpleaños*. (Decision 8) |
| A12 | Unit title | «¡…y que cumplas muchos más!» uses *que, cumplas, muchos, más*, none of them taught. It's a textbook title (path-data already treats unit titles that way). The traditional song «Cumpleaños feliz» has the same problem (*feliz*, *te deseamos*, *todos*). | Keep it as the textbook title only: never in lesson text, a song or a story. Don't use «Cumpleaños feliz». |
| A13 | Clip D1 | *Lunes, martes, miércoles, jueves: ¡la semana!* calls four days "the week". | Fine for a chant. The *la semana* card says the other three days come next lesson. |
| A14 | L10, L11, L13 | **29 February doesn't exist in 2025.** Max's birthday can't be tapped on the story-year calendar. | For Max's date the calendar shows a leap-year February (the year is never shown), and no 1.4 line gives a weekday for 29 February. The joke stays intact. |
| A15 | L3 week card | Spanish calendars start on Monday and write **X** for *miércoles* (L M X J V S D). Not a vocabulary issue, but students will meet it on every calendar in the unit. | Teach it on the L3 week card and draw every 1.4 calendar that way. (Decision 6) |

**Checked and fine:** *de* in *el veinte de julio* and *el cumpleaños de Valentina* (1.1, used the same way in 1.3); *¿El mes? Febrero.* and *¿El cumpleaños de Samuel?* (CSV nouns with their own *el*); *¿Cuándo es tu cumpleaños, Matilda?* (the chunk plus a name); *treinta y uno* and *veintiuno* in dates (never *veintiún*); the 1.2 feelings and praise words; *mi* (1.3 L16) in *¿Mi cumpleaños? Enero.*; spelling lines (only letters from 1.2, and only in `spell` lines).

**CSV and helper words.** The prompt for this plan expected the days and months might be missing from the vocabulary master. They are **all there**: `claro_reviewer/vocabulary_database.csv` (the master, rows 82–108) has the 27 Unit 1.4 rows (7 days, 12 months, *el mes, el año, la semana, la fecha, el cumpleaños, el primero, el uno, ¿Cuándo es tu cumpleaños?*). The days and months carry `capitals = yes`, and `buhisimo/data/` is in sync. *tu* and *el* are in `helper_words.csv` (1.4). **The only addition proposed is «¡Feliz cumpleaños!»** (helper chunk, 1.4, Decision 1). This plan does not edit the CSVs.

## 4. Look-alikes, false friends and patterns to point out

Juan's rule: once both words are taught, point the pair out, practise it side by side, then keep it in reviews. Steps that do this carry `lookalike: "a/b"`, which the validator checks.

| Pair | Both taught | Pointed out | Practised side by side | Kept in |
|---|---|---|---|---|
| *junio / julio* (n / l) | L5 | L5 *julio* card | L5 (*¿Junio? No, julio.*, the two-page calendar, spelling *junio*), L8 (wave 3, spelling *julio*), L9 («Who is it?» months), L10 (the calendar read, Valentina's card) | L12 story, L13 check, 1.5 L1 repaso |
| *el nombre / noviembre* | 1.3 L16 → L6 | L6 *noviembre* card (Samuel's ID card next to a calendar) | L6 (name or month?), L8 (ID-card tile among the months), L10 (Valentina's card) | L13, 1.5 L1 |
| *tu / tú* (accent) | 1.2 → L9 | L9 mi/tu card | L9 gap, L13 gap | 1.5 L1 (**not on the approved list yet**: Decision 8) |
| *seis / siete* and the *veinti-* pairs | 1.3 | — | L1 repaso (number picks) | dates in L10–L13 |

Not in 1.4: *mayo / mayor* and *el primo / el primero* wait for 2.2 (the second word of each pair is taught there).

**Patterns (a note, not a pair):** *martes / marzo* both start *mar-* (L4 card plus a day-or-month sort; Decision 10). *el año* / *años* (*tengo doce años*): the same word, singular and plural, and the ñ matters (L6). *Es lunes* = "it's Monday" (L2). The **week starts on Monday, and X = miércoles** (L3). *el primero* (Colombia) / *el uno* (often in Spain), both "the first" (L9, L13). Written dates go **day / month** (20/7), as in Australia (L10).

## 5. New engine features

| Feature | Where | What it does |
|---|---|---|
| Unit 1.4 content | `unit-1-4.js`, one line in `course.js` | 13 lessons, items (each day or month carries its calendar position; dates are generated), Radio Búho episodes (L7 in the Radio tab; L13 `inTab: false`) |
| Path | `path-data.js` | The 1.4 section (terracotta, "Days, months and birthdays") with 13 real nodes: repaso, lesson ×5, listen, game, lesson ×2, speak, story, check |
| `calendar` | `js/exercises-1-4.js` + `js/art.js` | **The calendar, drawn in code** (like the ID card): **week strip** (L M X J V S D, Monday first), **year view** (12 month tiles), **month page** (a grid of 1–31, starting Monday, headed with the month in small letters, **no year shown**; 2025, plus a leap-year February for Max). Modes: **card** (labelled, tap to hear), **tap** (hear → tap a day, month or date; only days and months taught by that lesson are active, the rest dimmed), **read** (a circled date → pick its Spanish), **say** (a circled date → speak it), **which page?** (several small pages). Targets ≥ 44 px; works at 390 px wide. Unrecorded prompts are shown to read, as in 1.3. |
| `order` | same | Tap words in order from a shuffled bank (days, months). The 1.3 `count` step without the big digit: the calendar lights up instead. Mix-ups shake and are counted. |
| `caltap` | same | **Calendar tap**, the L8 game (also L11 with dates, L13 one round): waves, a prompt heard (or read), a tap before Max hops onto the square, score, streak, best on the device, "Slower", keyboard (1–7, arrows, Enter), reduced motion. It must really feel like a game (the Number Invaders lesson of 27 Oct). |
| `datedict` | same | **Date dictation:** hear a date → write the day and month as digits (two boxes, dd / mm), or tap it on a calendar page. |
| Birthday wall | same (a `table` variant with art) | The five characters with speech bubbles: months in L9, full dates in L10. Tap a bubble to hear it. |
| ES→EN builder | `js/lesson.js` `tiles` | **New:** `dir: "es-en"`: the Spanish is shown and played, and the student builds the English from English tiles. Used before the EN→ES builder in every 1.4 learn lesson (the Spanish We Do order). (Decision 9) |
| «Who is it?» with dates | `js/lesson.js` `chooseWho` (exists) | Already supports `speaker`, `focusEs`, `tagsEs` and `whyEn`. 1.4 uses it for months (L9), dates (L10, L13) and callers (L7). Buhísimo speaks the line, so a character's own voice never gives the answer away. |
| `idcard` field «¿El cumpleaños?» | `js/exercises-1-3.js` | A birthday field on the existing ID card (read mode in L10). |
| "Your birthday" (`mydate`) | `js/exercises-1-4.js` | L11 You Do: tap your own date, then build, type and say *Mi cumpleaños es el … de ….* The sentence is generated and validated; **nothing is stored**. (Decision 11) |
| Capitals message | `js/lesson.js` `capsMessage` | One new message: a missing capital on a day or month at the start of a sentence → "A sentence starts with a capital letter, even when it starts with a day or a month." The rule itself (`SMALL_WORDS`, `isSentence`) already covers days and months. |
| Review | `js/review.js` | Day and month items get a calendar-tap question; dates come from the generated list; *tu* is matched inside sentences, never asked bare. |
| Songs | `js/exercises-1-3.js` `song`, `songset` | Reused. `numbers.js` `tokens()` already turns *el veinte de julio* into *el 20 de julio* for the con números version. |
| Voices | `js/speech.js` | No new roles. Valentina and Samuel fall back to María / Raúl until their voices are chosen and recorded. |
| Speak lesson with speaking snoozed | `js/lesson.js` | In a `speak`-type lesson, a snoozed speak step becomes a tiles step on the same sentence instead of being skipped. |
| Checker | `prototype/tools/check_vocab.mjs` | Unit 1.4; `lookalike` tags; song lyrics checked at their lesson; **new: a cast line that gives a birthday must match the canon**; `--todo` lists the 1.4 lines and songs |
| Version | `sw.js`, `js/app.js` | `2026-11-xx.u14`; the service worker caches the new songs, clips and pictures |

## 6. Songs and chants

Juan's decisions apply: songs are **sung** (ACE-Step, like the number songs), **short**, use **only taught words with no filler** (no *la la*, *oh* or extra words, and any version that adds one is rejected), and Juan **picks by ear from a shortlist**, because the Whisper and metric picks aren't reliable for songs. Clips inside the learn lessons are cut from the approved songs, as N1–N6 were.

| Song | Lyrics (every line passes the validator at its lesson) | Full song | Clips | Con números |
|---|---|---|---|---|
| **«La semana»** | *Lunes, martes, / miércoles, jueves: ¡la semana! / Viernes, sábado… / ¡domingo! ¡Fenomenal! / La semana: lunes, martes, miércoles, / jueves, viernes, sábado, domingo.* (D1, D2, D6) | L3 (needs all 7 days), L7 | **D1** in L2 (lines 1–2), **D2** in L3 (lines 3–4) | — (no numbers) |
| **«El año»** | *Enero, febrero, / marzo, abril… ¡muy bien! / Mayo, junio, / julio, agosto… ¡fantástico! / Septiembre, octubre, / noviembre, diciembre: ¡el año! / El año: enero, febrero, marzo, abril, / mayo, junio, julio, agosto, / septiembre, octubre, noviembre, diciembre.* (D3, D4, D5, D7) | L6 (needs all 12 months and *el año*), L7 | **D3** in L4, **D4** in L5, **D5** in L6 | — |
| **«¿Cuándo es tu cumpleaños?»** (new, Decision 7) | *¿Cuándo es tu cumpleaños? / El diez de enero. / ¿Cuándo es tu cumpleaños? / ¡El veintinueve de febrero! / ¿Cuándo es tu cumpleaños? / El quince de junio. / ¿Cuándo es tu cumpleaños? / El veinte de julio. / ¿Cuándo es tu cumpleaños? / El siete de agosto: ¡fenomenal!* (the canon in calendar order: Samuel, Max, Matilda, Valentina, Buhísimo) | **L10** (letras) | — | **L11**: the lesson right after L10, the lesson that teaches the last things the song needs (*el* + number) |
| Number songs (reused) | approved 1.3 versions | — | — | «Del veinte al treinta y uno» con números in **L1**, «Uno, diez, once… treinta y uno» con números in **L10** (review) |

- **Numerals rule (23 Oct):** it is about numbers, so it applies only to the birthday song (letras L10, con números L11). The week and year songs have no numbers and get no con números version.
- **Not proposed:** a *junio / julio* contrast song like «Uno, once · Dos, doce» (calendar tap and spelling already drill the pair; it can come later if Juan wants it). «Cumpleaños feliz» can't be used (§3 A12).
- **Pronunciation watch list for the shortlists:** *miércoles* and *sábado* (stress on the first syllable), *septiembre* (the *p* must be there), *junio / julio* kept apart, and *¡fenomenal!* not swallowed by the word before it (the *quince | ¡fenomenal!* problem of 24 Oct).

## 7. Radio Búho

| Episode | Lesson | In the Radio tab | Lines |
|---|---|---|---|
| «La semana y los meses» | L7 | yes, once L7 is open | D0 (B), «La semana», «El año», D8 calls (Valentina, the Peru caller with Buhísimo's answer, Max, the Spain caller, the Chile caller), D9 (B) |
| «The party calendar» | L13 | no (`inTab: false`, like 1.3 L20) | three birthday calls (Spain *el uno*, Colombia *el primero*, Argentina) |

The callers reuse the voices made on 24 Oct (each caller has their own synthetic voice; never `es_m_40` or `ar_f_25`). The Colombia caller is `caller_neutral_f`, the Colombia speller of 1.2. Kindness rule: the feelings are about the day or the weather, never about people.

## 8. Assets

### 8.1 Audio

**Pipeline** (in `~/Projects/video_generation`; read for this plan, nothing was run):
1. `node prototype/tools/check_vocab.mjs --todo` writes `prototype/audio/TODO_lines.json` (every unrecorded line, one entry per voice, with role, speaker and unit) and `TODO_songs.json`.
2. A 1.4 recording script in `scripts/voice_tools/`, following `u12_audio.py` and `r3_audio.py`: `plan` → `render` (**GPU**: Qwen3-TTS voice cloning from `conversations/voices/<ref>.wav`, several seeds) → `check` (**GPU**: Whisper large-v3 on every take) → `retake` → `status` → `export` (CPU: ffmpeg loudness normalisation → MP3 in `prototype/audio/<voice>/` and a `manifest-*.json`). About 2.4 s a clip on the 4060, plus the checks and retakes.
3. **Spelling is slow and even** (Juan, 26 Oct): each spelt line is built the `r3_audio.py` way, from letter names already recorded once per voice and joined with the same 0.5 s gap (0.6 s after the lead-in). Joining the letters is CPU work; only the lead-in (*¿Cómo se escribe marzo?*) is new TTS. Spelling defaults to **María Paisa**, which Juan found better for spelling. 1.4 spells only words without accents (*marzo, junio, julio*), because *con tilde* isn't taught.
4. **Drama 3** (expressive, local) is not used for 1.4. It can't clone the cast voices yet (untested), and the story lines need to sound like the same characters as in 1.1–1.3.

**Voices:** Matilda = `matilda` (*co_f_kid_matilda*, "Colombian schoolgirl, clear", chosen 24 Oct). Max = `max` (*co_m_kid_max*, "Colombian schoolboy, clear", chosen 21 Oct). Buhísimo = Profesor and Abuelo (both recorded; Settings switch). Neutral = María Bogotá + María Paisa + Raúl (3 clips a line, as in 1.3). Valentina and Samuel: **voices not chosen yet** (options in review round 4); until they are, their lines stay as text with the María / Raúl fallback, as in 1.3 (Decision 12). Callers: their 24 Oct voices.

**Totals: 172 new lines (157 different texts) → 395 clips**: María Bogotá 103, María Paisa 103, Raúl 103 (of them 29 single words or chunks for the cards and 3 spelt lines), Buhísimo 17 × 2 voices, Max 13, Valentina 13, Matilda 10, Samuel 9, callers 7 (Peru 2, Spain 2, Chile 1, Colombia 1, Argentina 1). Three lines (5 clips) depend on Decision 1. None of these texts has a recording yet (checked against every `audio/manifest*.json`). **All need the GPU** except joining the spelt letters.

*Neutral ×3* = María Bogotá + María Paisa + Raúl; *Buhísimo ×2* = Profesor + Abuelo; callers in their own voices (`caller_peru` pe_f_teen, `caller_espana` es_m_20, `caller_chile` cl_m_45, `caller_neutral_f` neu_f_35, `caller_argentina` ar_m_35). Each line is listed once per speaker. The 19 neutral prompts «Es lunes.» … «Es diciembre.» are listed under L8, though L2–L6 already use some of them in their calendar steps.

| Lesson | Speaker and voice | Lines (n) |
|---|---|---|
| L1 | Neutral ×3 | «Uno, cinco, diez, quince, veinte, veinticinco, treinta.» · «Cinco, diez, quince, veinte, veinticinco, treinta.» · «Max tiene trece años.» (3) |
| L2 | Buhísimo ×2 | «La semana: lunes, martes, miércoles, jueves…» (1) |
| L2 | Matilda | «Es lunes.» · «Es martes.» (2) |
| L2 | Max | «Es miércoles.» (1) |
| L2 | Samuel | «Es jueves. ¡Fenomenal!» (1) |
| L2 | Neutral ×3 | «Lunes, martes, miércoles, jueves.» · «Lunes, martes, miércoles, jueves: ¡la semana!» (2) |
| L3 | Buhísimo ×2 | «Es domingo. Matilda está muy bien.» (1) |
| L3 | Max | «Es viernes. ¿Qué tal, Samuel?» · «Es sábado. ¡Fantástico!» (2) |
| L3 | Neutral ×3 | «Es sábado. Max está fenomenal.» · «Viernes, sábado, domingo.» · «Viernes, sábado… ¡domingo! ¡Fenomenal!» · «La semana: lunes, martes, miércoles, jueves, viernes, sábado, domingo.» (4) |
| L4 | Buhísimo ×2 | «¿El mes? Febrero.» (1) |
| L4 | Matilda | «Es abril.» (1) |
| L4 | Max | «Es febrero.» (1) |
| L4 | Valentina | «Es marzo.» (1) |
| L4 | Samuel | «Es enero.» (1) |
| L4 | Neutral ×3 | «¿El mes? Marzo.» · «¿Cómo se escribe marzo? — Eme, a, erre, zeta, o.» · «Es abril. Max está fenomenal.» · «¿El mes? Febrero. ¡Fantástico!» · «Enero, febrero, marzo, abril… ¡muy bien!» (5) |
| L5 | Buhísimo ×2 | «Es agosto. ¡Muy bien!» (1) |
| L5 | Matilda | «Es junio.» (1) |
| L5 | Max | «¿Junio? No, julio.» (1) |
| L5 | Valentina | «Es mayo.» · «Es julio. ¡Fantástico!» (2) |
| L5 | Neutral ×3 | «Junio, julio. ¡Junio! ¡Julio!» · «¿Cómo se escribe junio? — Jota, u, ene, i, o.» · «Mayo, junio, julio, agosto.» · «Es julio. Buhísimo está fenomenal.» · «¿Junio? ¡Fantástico!» · «Mayo, junio, julio, agosto… ¡fantástico!» (6) |
| L6 | Buhísimo ×2 | «El año: enero, febrero, marzo…» (1) |
| L6 | Matilda | «Es septiembre.» · «¿El nombre? Samuel. ¿El mes? Noviembre.» (2) |
| L6 | Max | «Es diciembre. ¡Fenomenal!» (1) |
| L6 | Samuel | «Es octubre.» (1) |
| L6 | Neutral ×3 | «¿El nombre? Samuel. ¿El mes? Noviembre.» · «Es diciembre. ¡Fenomenal!» · «Septiembre, octubre, noviembre, diciembre: ¡el año!» (3) |
| L7 | Buhísimo ×2 | «¡Buenos días! Soy Buhísimo. ¿Cómo estás?» · «No, es miércoles.» · «¡Es sábado! ¡Fantástico!» · «¡Muy bien! La semana, el mes, el año… ¡hasta luego!» (4) |
| L7 | Max | «¡Hola, Buhísimo! Soy Max. ¿Lunes? Matilda está regular.» (1) |
| L7 | Valentina | «¡Hola, Buhísimo! Me llamo Valentina. ¡Es sábado! ¡Fantástico!» (1) |
| L7 | `caller_peru` | «¡Hola, Buhísimo! ¿Es martes?» · «¿Miércoles? ¡Fenomenal!» (2) |
| L7 | `caller_espana` | «¡Hola, Buhísimo! Soy de España. Es domingo. ¡Fenomenal!» (1) |
| L7 | `caller_chile` | «¡Hola! Soy de Chile. ¿Julio? Regular.» (1) |
| L7 | Neutral ×3 | «¿Es martes? — No, es miércoles.» (1) |
| L8 | Neutral ×3 | «Es lunes.» · «Es martes.» · «Es miércoles.» · «Es jueves.» · «Es viernes.» · «Es sábado.» · «Es domingo.» · «Es enero.» · «Es febrero.» · «Es marzo.» · «Es abril.» · «Es mayo.» · «Es junio.» · «Es julio.» · «Es agosto.» · «Es septiembre.» · «Es octubre.» · «Es noviembre.» · «Es diciembre.» · «Es junio. — No, es julio.» · «¿Cómo se escribe julio? — Jota, u, ele, i, o.» (21) |
| L9 | Buhísimo ×2 | «¿Mi cumpleaños? Agosto.» · «¿El cumpleaños? Julio.» · «El primero de marzo.» · «El uno de marzo, el primero de marzo: ¡muy bien!» (4) |
| L9 | Matilda | «¿Mi cumpleaños? Junio.» (1) |
| L9 | Max | «¿Mi cumpleaños? Febrero.» · «¿Cuándo es tu cumpleaños? — ¿Mi cumpleaños? Febrero.» (2) |
| L9 | Valentina | «¿El cumpleaños de Samuel? Enero.» · «¿Cuándo es tu cumpleaños?» · «¿Y tú, Max? ¿Tu cumpleaños?» · «¿Mi cumpleaños? Julio.» · «¿Cuándo es tu cumpleaños, Buhísimo?» (5) |
| L9 | Samuel | «¿Mi cumpleaños? Enero.» (1) |
| L9 | Neutral ×3 | «Es el primero de mayo.» · «¿El cumpleaños de Samuel? ¿El primero de mayo? — No.» · «¿Cuándo es tu cumpleaños? — Es el primero de junio.» · «¿Cuándo es tu cumpleaños, Buhísimo? — ¿Mi cumpleaños? Agosto.» · «¿Cuándo es tu cumpleaños?» (5) |
| L10 | Buhísimo ×2 | «Mi cumpleaños es el siete de agosto. ¡Fenomenal!» · «¡El veinte de julio!» (2) |
| L10 | Matilda | «¡Feliz cumpleaños, Valentina!» (1) |
| L10 | Valentina | «Mi nombre es Valentina. Mi cumpleaños es el veinte de julio.» (1) |
| L10 | Samuel | «Es el veinte de julio.» · «La fecha es el uno de abril.» · «Mi cumpleaños es el diez de enero.» (3) |
| L10 | Neutral ×3 | «Es miércoles, el doce de marzo.» · «La fecha: lunes, el primero de septiembre.» · «¿La fecha? Viernes, el uno de agosto.» · «El cumpleaños de Matilda es el quince de junio.» · «El cumpleaños de Max es el veintinueve de febrero.» · «El cumpleaños de Valentina es el veinte de julio.» · «La fecha es el treinta y uno de diciembre.» · «Es el quince de junio.» · «El cumpleaños de Samuel es el diez de enero.» (9) |
| L11 | Neutral ×3 | «Es martes, el primero de julio.» · «¿Cuándo es tu cumpleaños? — Es el uno de noviembre.» · «Es el quince de septiembre.» · «Es lunes, el veintidós de septiembre.» · «Es sábado, el primero de noviembre.» · «Es el veinte de julio.» · «Es el diez de enero.» · «Es el siete de agosto.» · «Es el veintinueve de febrero.» (9) |
| L12 | Buhísimo ×2 | «¡Max es fantástico!» (1) |
| L12 | Matilda | «Es el quince de junio. ¿Y tú, Valentina?» · «¡Fenomenal! ¡Gracias!» (2) |
| L12 | Max | «Febrero. ¡El veintinueve de febrero!» · «Trece. ¿El veintinueve de febrero? Uno, dos, tres… ¡tres!» · «¡Feliz cumpleaños, Matilda!» (3) |
| L12 | Valentina | «¿Cuándo es tu cumpleaños, Matilda?» · «Julio. ¡El veinte de julio!» · «La fecha: domingo, el quince de junio. ¡El cumpleaños de Matilda!» (3) |
| L12 | Samuel | «¿Y tú, Max? ¿Cuándo es tu cumpleaños?» · «¿El veintinueve de febrero? ¿Cuántos años tienes, Max?» (2) |
| L13 | Buhísimo ×2 | «¡El quince de junio!» (1) |
| L13 | Max | «¿Cuándo es tu cumpleaños? — Mi cumpleaños es el veintinueve de febrero.» (1) |
| L13 | `caller_espana` | «Hola, Buhísimo. Soy de España. Mi cumpleaños es el uno de mayo.» (1) |
| L13 | `caller_neutral_f` | «Hola, Buhísimo. Soy de Colombia. Mi cumpleaños es el primero de octubre.» (1) |
| L13 | `caller_argentina` | «¡Hola, Buhísimo! Soy de Argentina. Mi cumpleaños es el doce de noviembre.» (1) |
| L13 | Neutral ×3 | «Mi nombre es Samuel. ¿El mes? Noviembre.» · «Es jueves, el veintidós de mayo.» · «Es sábado, el uno de marzo.» · «¿Cuándo es tu cumpleaños? — Es el primero de agosto.» · «Lunes, miércoles, viernes.» · «El cumpleaños de Matilda es el quince de junio. El cumpleaños de Valentina es el veinte de julio.» (6) |
| Words (intro cards, match, Review) | Neutral ×3 | «la semana» · «lunes» · «martes» · «miércoles» · «jueves» · «viernes» · «sábado» · «domingo» · «el mes» · «enero» · «febrero» · «marzo» · «abril» · «mayo» · «junio» · «julio» · «agosto» · «septiembre» · «octubre» · «noviembre» · «diciembre» · «el año» · «el cumpleaños» · «tu» · «el primero» · «el uno» · «el» · «la fecha» · «¡Feliz cumpleaños!» (29) |

### 8.2 Songs and clips

| Asset | Lessons | Tool | GPU |
|---|---|---|---|
| «La semana», 4 seeds → Juan's shortlist | L3, L7 (+ clips D1, D2) | `scripts/make_song.py` (ACE-Step 1.5 via Wan2GP; `--bpm 90`, Colombian Spanish, "slow clear diction") | **yes** (about 30 s a seed; WanGP UI closed) |
| «El año», 4 seeds | L6, L7 (+ clips D3, D4, D5) | same | **yes** |
| «¿Cuándo es tu cumpleaños?», 4 seeds (Decision 7) | L10 letras, L11 con números | same | **yes** |
| Whisper check of the sung words (report for the shortlist) | — | `scripts/song_set.py whisper / report` | **yes** |
| Karaoke timings | all three songs | `scripts/align_lyrics.py` (demucs + stable-ts, its own CPU-only venv) | no |
| Karaoke review pages (letras and numerales) | review hub | `song_set.py karaoke [--numerals]` | no |
| Export + clips D1–D5 + `songs.json` | prototype | a `make_calendar_songs.py` like `prototype/tools/make_number_songs.py` (afade, `loudnorm=I=-16:TP=-1.5:LRA=11`, mono 24 kHz, MP3 64 kb/s) | no |
| D0 and D9 (Buhísimo, spoken over the Radio Búho jingle) | L7 | the TTS pipeline above (counted in 8.1) + the existing jingle | yes (TTS) |

**Count: 3 new songs (4 karaoke versions: 3 letras + 1 con números) and 5 clips**, plus 2 approved number songs reused in their con números versions.

### 8.3 Art and pictures

Style rules that apply: the flat, chunky, no-outline app style (Juan's favourite is the prototype's Max, made with Z-Image and NAG off); MOSS-Image is approved for poses and scenes. For the owl, the prompt says no ear tufts and a pale belly. No sombrero vueltiao. Never put "houses" in the style text. **No words in painted art:** every calendar, date and month name is drawn in code over the picture, so the Spanish is exact and in small letters.

| # | Asset | Lessons | How | GPU |
|---|---|---|---|---|
| 1 | Calendar set: week strip (L M X J V S D), year view, month pages (2025 + a leap-year February), party calendar with stickers, circled dates | L2–L13 | SVG in `js/art.js` | no |
| 2 | Birthday wall (five portraits with bubbles) | L9, L10 | existing portraits + code | no |
| 3 | Name-or-month card (ID card next to a calendar page) | L6, L8 | existing `idcard` + calendar | no |
| 4 | Seasons culture card (Melbourne in July: beanie and rain; Salento: the same all year) | L5 | code-drawn icons | no |
| 5 | Max's leap-day joke (a *febrero* page with 29 circled, Max jumping) | L10, L11 | `max-jump` + code calendar | no |
| 6 | Matilda sleepy (Monday; *Matilda está regular*) | L2, L3, L7 | Juan's round-2 pick (s3), not in the app yet: crop and convert (`tools/process_art*.py`) | no |
| 7 | **Valentina's own poses** ×4: wave, thinking, celebrate, asking (purple, *mochila wayuu*). She hosts L5 and L9; today she is cut out of the family picture | L4–L13 | MOSS (or Z-Image, NAG off), 2–3 seeds each | **yes** |
| 8 | **Samuel's own poses** ×4: wave, thinking, celebrate, pointing at a calendar (*carriel*). He hosts L4 and L10 | L2–L13 | same | **yes** |
| 9 | Max counting *uno, dos, tres* on his fingers | L12 | same | **yes** |
| 10 | Scene: 20 July in Salento's plaza (Colombian flags, fireworks at dusk) | L10, L12 check 1 | MOSS scene | **yes** |
| 11 | Scene: the Restrepo kitchen with a **blank** wall calendar (the code draws *junio* and the 15th) | L12 opening | MOSS scene | **yes** |
| 12 | Scene: Matilda's birthday party (green eucalyptus cake; the whole cast) | L12 ending, L13 | MOSS scene | **yes** |
| 13 | Buhísimo at the Radio Búho microphone (the redo Juan asked for on 26 Oct) | L7 | MOSS | **yes** (carried over from 1.2) |
| 14 | Max tired (the redo Juan asked for on 26 Oct); optional in 1.4 | L7 (Max's call) | MOSS | **yes** (carried over) |

**Count: 12 new painted pictures + 2 carried-over redos (all GPU, 2–3 seeds each for Juan to choose), 1 approved picture to process (CPU), and the code-drawn calendar set (no GPU).** Art pipeline: `scripts/03_run.sh` starts ComfyUI, then `scripts/make_moss.py "<prompt>" --out … --seeds 1 2 3` (GPU); or `Wan2GP/.venv/bin/python scripts/make_image.py` (Z-Image Turbo, GPU, about 27 s an image); then `prototype/tools/process_art*.py` (CPU: crop, WebP).

**GPU summary:** about 395 TTS clips with their Whisper checks, 12 song seeds with their checks, and 14 pictures × 2–3 seeds. The GPU rule applies before any of it starts: plugged in = go (with a warning); on battery below 60% = wait; at 60% or more = ask first, with a battery estimate. One GPU user at a time (WanGP and ComfyUI closed while the others run).

## 9. Tests

- `node tools/check_vocab.mjs` and `--plurals` pass with the new 1.4 sentences (including the fixed story lines and dates); `node prototype/tools/check_vocab.mjs` passes for 1.1–1.4, including the new canon check for birthdays.
- `prototype/tools/e2e-unit.mjs` gains **section W (Unit 1.4)**: 1.4 locked until 1.3 L20; every 1.4 lesson in order by keyboard at 1366×768 (a wrong answer each where the step allows it; every step fits without scrolling; nothing under or behind the feedback bar); every lesson by touch at 390×844 (no horizontal scrolling; calendar targets ≥ 44 px); Calendar tap really moves in normal mode and slows down under reduced motion; the capitals fix-up on *Es Lunes*, *jueves* and *Lunes, miércoles, viernes.*; the songs play and light up (letras and con números); the Radio tab lists the L7 episode and not L13; screenshots of every new screen type at both sizes.
- `e2e.mjs` and `e2e-keyboard.mjs` still pass. Service worker and app version `2026-11-xx.u14`.
- **For Juan's browser check after the build:** Calendar tap's feel and speed, the calendar on a Chromebook and a phone, the birthday wall, the «Who is it?» birthday steps, the songs (by ear), and the art picks.

## 10. Decisions for Juan

Each can be answered OK / Not OK. My recommendation is in brackets.

1. **Add «¡Feliz cumpleaños!» as a 1.4 helper phrase**, taught in L10 and used in the story ending. Today the app can't say "happy birthday" in the birthday unit. *(Recommend: OK.)*
2. **Fix Max's story line.** «Trece. ¿El cumpleaños? ¡Tres!» means "The birthday? Three!"; the joke needs a plural that isn't taught until 1.6. New line: «Trece. ¿El veintinueve de febrero? Uno, dos, tres… ¡tres!» (he counts his real birthdays on his fingers). *(Recommend: OK.)*
3. **Say the dates in the story with *el*** («¡El veinte de julio!», «¡El veintinueve de febrero!»), the pattern students have just learnt, instead of «Veinte de julio». *(Recommend: OK.)*
4. **All dates that give a weekday follow one real calendar (2025, the story's year), never shown on screen.** Six sentences change their weekday or month so the calendar pictures can be right (§3 A4). *(Recommend: OK.)*
5. **Calendar tap in L8 uses days and months only.** Full dates come in L11 and the unit check, because «el veinte de julio» isn't taught until L10. *(Recommend: OK.)*
6. **Calendars start on Monday and use X for miércoles (L M X J V S D)**, taught on the L3 week card, as on real Spanish-language calendars. *(Recommend: OK.)*
7. **Songs:** «La semana» and «El año» (sung, with clips D1–D5 cut from them), plus a new short song «¿Cuándo es tu cumpleaños?» with the cast's birthdays: words in L10, digits in L11. You pick each from a shortlist. *(Recommend: OK for all three.)*
8. **Add *tu / tú* to the look-alike list** (*your* has no accent, *you* has one) and practise it in L9 and L13. *(Recommend: OK.)*
9. **New step: a sentence builder from Spanish into English**, before the usual English-into-Spanish builder, so every 1.4 learn lesson follows the Spanish We Do order (builder ES→EN → EN→ES → What does it mean? → Now in Spanish → Show Me). *(Recommend: OK.)*
10. ***martes / marzo* gets a short note and a "day or month?" sort in L4**, not the full look-alike treatment. *(Recommend: OK.)*
11. **"Your birthday" in L11:** students tap their own birthday on a calendar, then build, type and say «Mi cumpleaños es el … de …». The date isn't saved anywhere. *(Recommend: OK.)*
12. **Valentina's and Samuel's voices:** 1.4 has 13 Valentina lines and 9 Samuel lines. Choose their voices (review round 4) before the 1.4 recording run, so their lines are recorded in their own voices. *(Recommend: choose first; until then the lines stay as text, as in 1.3.)*
13. **Characters change per lesson** as in the host table in §1 (Matilda's sleepy Monday, Max's Saturday jump, each child hosting their birthday month). *(Recommend: OK.)*
14. **GPU work for 1.4** (about 395 voice clips, 3 songs × 4 versions, 14 pictures × 2–3 versions) is done in one plugged-in session after you approve this plan. *(Recommend: OK.)*
