# Buhísimo v2: content plan for units 1.1–1.6

*Drafted 9 October 2026 for Juan; **revised 18 October 2026** with Juan's decisions (smaller lessons, P1–P10 approved, the determiner rule, irregular plurals, songs and podcasts); **20 October 2026:** Unit 1.3 is shown as two map sections, 1.3a and 1.3b (§6). This is a content and data plan, not UI. Companion files:*

| File | What it is |
|---|---|
| `content/lessons_1.1-1.6.json` | The lesson order and the items, letters and rule cards each lesson introduces (machine-readable version of this plan) |
| `content/sentences_1.1-1.6.json` | Every Spanish sentence or phrase in this plan (468), tagged with the unit and lesson where it is first used. Song and podcast lines carry a `clip` id (§11) |
| `content/proposals_1.1-1.6.json` | The proposals in §9. P1–P10 are **approved** and now live in the CSVs; P11–P13 are new and still open |
| `content/plurals.json` | Plural rules and the irregular plurals of the whole master CSV; read by the validator |
| `docs/irregular_plurals.md` | The irregular-plural list for Juan (all units), with where each plural is taught |
| `tools/check_vocab.mjs` | The unit-aware validator (§10) |

---

## 0. At a glance

| Unit | Lessons | Learn lessons | New items (CSV + helper + name) | Sentences |
|---|---|---|---|---|
| 1.1 El español global | 11 | 7 | 24 + 11 + 7 | 72 |
| 1.2 ¿Qué tal? | 13 | 7 | 17 + 31 + 0 | 81 |
| 1.3 Mi carnet de identidad (map: 1.3a + 1.3b) | 20 (11 + 9) | 10 | 38 + 10 + 3 | 99 |
| 1.4 ¡…y que cumplas muchos más! | 13 | 7 | 27 + 2 + 0 | 62 |
| 1.5 Mis preferencias | 13 | 7 | 26 + 1 + 0 | 69 |
| 1.6 ¡Tod@s a clase! | 15 | 8 | 12 + 9 + 0, plus 6 plural rule cards | 85 |
| **Total** | **85** (was 74) | **46** (was 40) | **218** (was 184) + 6 rule cards | **468** (was 376) |

- 1.2's 31 helper items are *muy, gracias, está, ¿Cómo se escribe?* and the 27 letter names (taught as 9 letter groups, see 1.2 L9–L11). `llamarse` is now taught in 1.2, its CSV section (decision 2).
- **Lesson size:** the average learn lesson now has 4.3 counted items; the largest has 6. No lesson is above 6, so the hard limit of 8 is never used.
- **The validator passes:** all 468 sentences use only approved words at their unit and at their lesson, with a determiner before every noun that has lost its *el/la* and with every plural rule taught first. The 63 sentences that used to wait on a proposal are now ordinary sentences. Nothing is pending.

### Decisions applied on 18 October 2026

1. **About 6 new items per lesson; 8 is the hard limit.** Lessons were re-split (74 → 83; 85 since the 1.3 split on 20 October added a 1.3a check and a 1.3b repaso). A chunk such as *soy de* counts as one item. The validator warns above 6 and fails above 8.
2. **Infinitives in the Claro CSV are taught, and the infinitive counts as a form.** *Llamarse* and *escribir* are taught in 1.2 (as spelling targets in the alphabet lessons); llamarse reaches 4 forms in 1.3 L2, so 1.3 L3 stays its conjugation lesson. The old open question is closed.
3. **P7 approved, with a limit:** a CSV noun may swap its *el/la* for *un/una, mi/tu/su, los/las, mis/tus/sus* or a number, and is **never bare**. No "Nombre: Samuel" labels: the plan uses *¿El nombre? Samuel.* or *Mi nombre es Samuel.* The validator enforces this.
4. **P1–P6, P8, P9 and P10 approved and added to the masters** (see §9). *Uve* and *ye* are the letter names.
5. **Irregular plurals are taught explicitly**, in three 1.6 lessons, and the validator rejects a plural before its rule card (§8, `docs/irregular_plurals.md`).
6. **Songs, chants and Radio Búho podcasts** for sequences: the alphabet (1.2), numbers 1–31 (1.3) and, added here, days and months (1.4) (§11).

### Decisions applied on 20 October 2026

1. **Unit 1.3 is shown as two map sections**, 1.3a and 1.3b, with a new section check and repaso between them (§6, §12 question 4).
2. **Lessons are locked one after the other.** Juan: *"lessons are to be locked one after the other as the vocabulary builds and thus is pre-requisite."* Every lesson uses the items of the lessons before it (the validator's lesson-level check is built on that order), so a student can open only the next unfinished lesson, plus any lesson already finished (to replay it). In the v2 prototype:
   - Locked lessons are sand-coloured with a padlock badge on the path; their popover says which lesson to finish first and has no Start button; screen readers hear "locked" in the node's label.
   - A locked lesson can't be opened from the address bar or an old link either (`#/lesson/1.1-7` goes back to the path with a "That lesson is locked" message).
   - **Teacher override (hidden from students):** add `?unlock=all` to the address, e.g. `https://wanly20.github.io/buhisimo/prototype/?unlock=all`. Every lesson opens, a dashed padlock chip appears in the path header (tap it to lock again) and the "For teachers" settings appear (Open every lesson, computer voice). `?unlock=off` locks the lessons again; `?teacher=1` only shows the teacher settings; `?teacher=0` hides them and relocks. The choice is remembered on that device and survives "Reset prototype progress".
   - The full app keeps the same rule. A teacher dashboard can later open a lesson for one student or a class (e.g. after a whole-class lesson), but students never skip ahead on their own.
3. **Map questions: show the map, then ask without the names.** Juan: *"Perhaps at times show the world map to help students locate [the countries], then in questions don't give the answer away."* Until now every map question labelled each choice, so the answer was on screen. The design follows explicit instruction (show, then practise):
   - **Show.** Each new place is introduced on its own card with a locator map (as before). Then a labelled **"Look at the map"** step shows that lesson's places together (tap a name to hear it) just before its map questions: 1.1 L2 (Colombia, Perú, Chile, Argentina), L3 (Estados Unidos, Cuba, República Dominicana, Colombia), L6 (Spanish on three continents, with Guinea Ecuatorial), L7 (España and its islands). Map tap (L10) opens with three study maps: the Caribbean, South America (with la Isla de Pascua) and Spain, Africa and Asia.
   - **Practise.** In every map question the map has **no names**. Each choice is a numbered ring on the place (a callout circle round small islands); the student hears or reads the Spanish sentence and taps the right ring, or the tinted country itself. After CHECK every ring gets its name (green for the answer, red for a wrong tap), so the map is seen labelled once more.
   - **Hint, not a giveaway.** In learn lessons and Map tap, "Show the names" reveals the names; the answer still counts as right but not as a first-try answer (no bonus XP, accuracy below 100%), and Review brings that place back sooner. The unit check has no hint.
   - **Plausible distractors:** neighbours and look-alikes, never a far-away country on its own: Argentina / Chile / Perú / Colombia; Cuba / República Dominicana / Estados Unidos; las Islas Baleares / las Islas Canarias / España; Guinea Ecuatorial / las Islas Canarias / España; la Isla de Pascua / Chile / Perú; las Islas Filipinas / Australia / la Isla de Pascua.
   - **Small places on a phone:** every ring is a 48 px target; rings that would overlap at 390 px wide (Cuba and the Dominican Republic, Spain and the Balearics) are spread apart with a leader line to the real spot. The e2e test checks every map question at 390×844 and 1366×768 (targets ≥ 44 px, inside the map, no overlaps, no names before CHECK).


### Decisions applied on 21 October 2026

1. **Lesson titles obey the vocabulary rules.** A title is Spanish students read, so it may only use words taught by that lesson, with no bare nouns. Each lesson in `content/lessons_1.1-1.6.json` now has `titleEs` (shown in Spanish, with a small English line, `titleEn`, underneath) or only `titleEn` when no Spanish title fits yet. The validator checks every `titleEs` at its own lesson (§10). Renamed in 1.1: «¿Sí o no?» → **«¿Sí? ¿No?»** (L4), «Islas y destinos» → **«El destino»** (L7), «Famoso e histórico» → **«¡Max es famoso!»** (L8), «Max y el mapa» → **«El mapa de Max»** (L9). Titles in 1.2–1.6 that failed are renamed in the lesson headings below (each heading notes its old title): mostly *Repaso:*, *Radio Búho:* and English check titles, plus «Be, ce, de… y llamarse», «Las letras raras…», «El carnet de Max» (*el* before 1.4), «Un jeep de colores», «Bolígrafos marrones, hojas de papel» (bare plurals).
2. **Locator maps show a whole region.** Juan: the *Isla de Pascua* card showed a square of ocean with a dot, and *Guinea Ecuatorial* only a patch of coast. Every locator card now zooms out to the continent or a region students recognise (South America, with the Pacific for Pascua; the Caribbean and Central America; North America; Spain and North-West Africa; all of Africa; South-East Asia; Australia), tints the country it belongs to (Chile for Pascua, Spain for the Canarias and Baleares) and puts a callout ring round small places. The cards are bigger, too.
3. **Crowded study maps split on phones.** In Map tap (1.1 L10), «Spain, Africa and Asia» becomes two maps below 700 px wide: Spain and Africa, then Asia and Australia. Wider screens keep one.
4. **Story canon approved** (§3): birthdays and favourite colours.
5. **A scene picture for Cocora.** 1.1 L8's *Cocora es famoso.* card shows a picture of the Cocora Valley (wax palms in the mist) instead of the owl, once `prototype/assets/cocora-valley.webp` exists; until then the owl shows.
6. **Capital letters count in typed answers** (Juan, 21 Oct: "soy de australia" was accepted in Passport control). In the prototype's typing engine (`grade()` in `js/lesson.js`):
   - A typed answer that is right except for capital letters is **not** right as it is. Like the accent fix-up, a "fix the letters" step names the rule and highlights the letters to change; the student taps them (a ↔ A) or uses "Show me". It then counts as right but **not first-try** (no bonus XP, not 100%), so Review brings the word back sooner.
   - **Capitals needed:** the first letter of a sentence (after *¿* or *¡* too: *¿De dónde eres?*) and names of countries, places and people (*España, Australia, Matilda, Salento*).
   - **Small letters needed:** languages, days and months never take a capital in Spanish (*el español, hispanohablante, lunes, enero*). *el Español* or *Hispanohablante* is flagged: "in Spanish, languages, days and months don't take a capital".
   - **A word or phrase on its own is not a sentence** (a word card's *el destino*, *regular*, *Buenos días*): its first letter may be either case, because students type a dictionary form, not a sentence, unless the word is a name (always a capital) or a language, day or month (always small). A sentence is an answer that ends in *. ? !* or starts with *¿ ¡*. End punctuation itself stays optional.
   - Taught explicitly: a "Capital letters" card in 1.1 L1 just before the first typed country (*España*; a sentence starts with a capital, after *¿* too), then a practice item (*I'm from Colombia.* → *Soy de Colombia.*); a "Small letters" card in 1.1 L6 before typing *el español* and *hispanohablante*.
   - Word-bank tiles and spelling grids in Radio Búho stay case-insensitive (tiles show the words already written); in a listening grid a capital or accent slip counts as right but not first-try.
---

## 1. How to read this plan

**Lesson types** (v2 plan §4.3): *learn* (about 6 new items, never more than 8), *practice* (no new items), *conjugation* (practice of one verb's forms), *repaso* (unit warm-up: spaced retrieval of the previous units plus the prerequisites this unit relies on), *story* (Duolingo-Stories style dialogue with checks between lines), *listen* (Radio Búho, including the new podcast-and-song episodes), *speak*, *game*, *check* (section check, no hearts) and *boss* (Unit 1, cumulative).

**Sources:** C = `vocabulary_database.csv`, H = `helper_words.csv`, N = `names.csv`.

**What counts as a new item** (the validator counts it the same way): each CSV or helper row is one item; a chunk taught as one unit (*soy de*) is one item; each letter group (1.2) is one item; each plural rule card (1.6) is one item. Names are recognised rather than recalled, so they are not counted.

**Exercise codes** (prototype types first, then v2 plan §6.2):
`intro` worked example (picture, audio, Spanish, English, one example; no question) · `pick` Spanish → meaning · `listen` hear → choose · `tiles` word bank · `type` English → type Spanish · `match` pairs · `speak` shadow and self-rate · `gap` gap fill with choices · `sort` categorise · `dict` dictation · `tf` true/false against a picture · `clip` a short song or podcast clip from §11 (listen, then sing or say along, then fill the gap) · `rule` a plural rule card (worked example, then practice) · `mapstudy` a labelled map to look at before map questions · `maptap` hear or read → tap the place on a map without names · `request`, `invaders` (games). **Speaking and listening are in every learn lesson by default**; students can snooze them, and the lesson still completes.

**A standard learn lesson** runs: for each new item, `intro` → immediate `pick` or `listen` → the same item again after two others. Then `match`/`tiles` on the set, 1–2 `type`, 1 `speak`, and 20–30% review items (due items from the scheduler, plus the review threads named in each lesson). With fewer new items per lesson, the spare time goes to more retrieval of the items just met, not to more content. Only the lesson-specific mix is listed below.

**Example sentences** are a selection; the JSON has them all.

---

## 2. Why this sequence

1. **Textbook order, one new idea at a time.** Units follow Claro (1.1 → 1.6), and every word appears at or after its CSV section. Inside a unit, each learn lesson carries one idea: a question and its answer (*¿De dónde eres? / Soy de…*), a person contrast (*soy / eres / es*), a word family (numbers 11–15), a letter family (*efe, ele, eme…*) or a plural rule.
2. **Chunks first, grammar second.** Questions are taught as whole chunks (*¿De dónde eres?*, *¿Cuántos años tienes?*, *¿Cómo se escribe?*). The grammar inside them is unpacked later: 1.1 L3 turns *eres* from the chunk into "you are", and 1.3 L8 turns *tienes* into "you have".
3. **Small steps, lots of practice.** About 6 new items per lesson (most have 5), so each item gets more retrieval inside its own lesson. Where the old plan had 6–8 items, the lesson is split (1.1 L1/L2, 1.1 L3/L4, 1.4 L9/L10, 1.6 L4–L9).
4. **Interleaving across units.** Numbers (1.3) are split into six small lessons placed *between* the name, age and ID lessons. 1.4 dates reuse them constantly. Countries (1.1) come back in greetings (1.2), spelling (1.2), ID cards (1.3) and opinions (1.5). Each unit opens with a *repaso* of the units before it.
5. **Worked examples before practice.** Every pattern is introduced by a character saying it (intro card) before students produce it. Patterns fade from model → gap → tiles → type in the practice lessons (1.1 L5, 1.2 L5, 1.3 L10, 1.5 L10). Every plural rule has a rule card (worked example: *el lápiz → los lápices*) before any plural of that kind appears.
6. **Sequences are sung, then retrieved.** The alphabet, numbers and the calendar are things learnt in order. Each gets a Radio Búho episode with a chant, cut into short clips that appear inside the learn lessons (§11).
7. **Story frame in every unit.** Matilda and Max are the learners. Each story gives the unit's words a reason to exist, and every story line passes the validator at its own lesson.
8. **Kindness.** Jokes come from a character's own trait (Max jumps too far, Matilda is sleepy in the mornings, Buhísimo fusses about accents). Negative opinions (*odio*, *detesto*, *no me gusta nada*) are only about days or colours, and never about the colours of the cast (Matilda is grey, Max and Buhísimo are brown), countries or people.

---

## 3. Story arc for Unit 1

| Unit | What happens | Cast |
|---|---|---|
| 1.1 | Matilda and Max arrive in Salento. Buhísimo meets them in the plaza with a map of the Spanish-speaking world; Max tries to jump to every country. | Buhísimo, Matilda, Max |
| 1.2 | The first morning in the Cocora fog. Matilda (a koala) is "regular" until her nap; Max is "¡fenomenal!" from 5 a.m., then flat by the afternoon. Buhísimo runs a spelling show on Radio Búho. | + callers on Radio Búho |
| 1.3 | They meet Valentina and Samuel Restrepo, learn ages, and make ID cards. Max loses his *carnet de identidad* jumping in the valley; Buhísimo finds it. | + Valentina, Samuel |
| 1.4 | Birthdays. Valentina's is on Colombia's Independence Day; Max is a leap-day kangaroo (29 February) and has only had three real birthdays. | same |
| 1.5 | Choosing a Willys jeep to drive up to Cocora: everyone has a different favourite colour, and they take the jeep with all of them. | same |
| 1.6 | First day at Valentina and Samuel's school. Max has no backpack: everything is in his pouch, except the scissors. The Unit 1 boss is Buhísimo's welcome poster. | same |

**Story canon (approved by Juan, 21 October 2026).**

| Character | Birthday | Favourite colour |
|---|---|---|
| Max | 29 de febrero (a leap-day kangaroo: only three real birthdays so far) | rojo |
| Valentina | 20 de julio (Colombia's Independence Day) | morado |
| Matilda | 15 de junio | verde (eucalyptus) |
| Samuel | 10 de enero | azul |
| Buhísimo | 7 de agosto | marrón (he's a little proud of himself) |

The birthdays fall on the hardest months on purpose, for exposure: *febrero*, *julio* and *junio* (a look-alike pair: Matilda 15 *junio*, Valentina 20 *julio*), *enero* and *agosto*. The 1.4 and 1.6 sentences use these dates (1.4 L9 can only say *el primero / el uno*, since *el* + number arrives in L10, so L9 asks about the month: *¿Mi cumpleaños? Enero.*).

---

## 4. Unit 1.1 · El español global (11 lessons)

**Unit goal:** say where you and others are from; answer yes/no questions; name Spanish-speaking countries and places; describe a place as famous, historic or Spanish-speaking.
**Not available yet:** greetings (1.2), *y* (1.5), *un/una* (1.6), plurals (1.6). The unit is built from *ser + de + place*, plus *sí/no*.

### 1.1 L1 · learn · ¿De dónde eres? *(the prototype lesson, `prototype/lesson-1-1.js`)*
- **Goal:** ask and answer "Where are you from?"; *él es* for a third person.
- **New (6):** ¿De dónde eres? (C) · *soy de* (H, one chunk) · él (H) · es (H) · Colombia (C) · España (C) · *names:* Buhísimo, Matilda, Max, Australia (N).
- **Changed on 18 October:** *el país* moved to L2 (the old L1 had 8 counted items). The prototype lost its `intro-pais` and `type-pais` steps; its match game now pairs *es / is* instead of *el país / the country*.
- **Review:** none (first lesson).
- **Exercises:** as built in the prototype: intro ×4, pick, listen, tiles, type, match, speak.
- **Examples:** ¿De dónde eres? · Soy de Australia. · Él es de Colombia. · Max es de Australia. · Él es de España.
- **Story:** In Salento's plaza, Buhísimo meets two visitors from Melbourne and asks where they're from.

### 1.1 L2 · learn · ¿De dónde es?
- **Goal:** ask and say where someone else is from; *ella* vs *él*; *el país*.
- **New (6):** ella (H) · ¿De dónde es? (C) · el país (C) · Argentina, Chile, Perú (C) · *names:* Melbourne, Salento (N).
- **Review:** L1 chunks; *él/ella* contrast card (picture of Max vs Matilda).
- **Exercises:** listen → pick the person (él/ella); tiles "Ella es de ___"; maptap preview with 3 countries; type *el país* (missing article = "nearly", as in the prototype grader).
- **Examples:** ¿De dónde es Matilda? · Ella es de Melbourne. · Colombia es el país de Buhísimo. · Australia es el país de Matilda. · ¿De dónde es? — Es de Perú.
- **Story:** Tourists cross the plaza; Max asks Buhísimo where each one is from.

### 1.1 L3 · learn · Tú eres…
- **Goal:** the first person contrast, *soy / eres / es*, in one table (worked example); more countries.
- **New (5):** tú (H) · eres (H) · Cuba, Estados Unidos, República Dominicana (C).
- **Review:** *¿De dónde eres?* (the *eres* inside it is now unpacked), L2 countries.
- **Exercises:** intro table soy/eres/es → `sort` sentences by person → gap "___ de Cuba" (soy/eres/es) → speak.
- **Examples:** Tú eres de Australia. · Soy Buhísimo. Tú eres Matilda. · Él es de Estados Unidos. · Ella es de República Dominicana.
- **Story:** Buhísimo plays a guessing game: "Tú eres… Matilda!"

### 1.1 L4 · learn · ¿Sí? ¿No? *(new: P1; title renamed 21 Oct: o is 1.5)*
- **Goal:** answer yes/no questions; *no* before the verb.
- **New (2):** sí, no (H). Two items and a lot of retrieval of L1–L3.
- **Worked example:** *¿Eres de España? — No, soy de Australia.* Watch-out card: *sí* (yes) has an accent; *si* (if) comes in 3.4.
- **Exercises:** `tf` against a map with a spoken *sí/no*; listen → sí/no; speak a 2-line exchange.
- **Examples:** ¿Matilda es de Australia? — Sí. · ¿Max es de Chile? — No, es de Australia. · ¿Eres de España? — No, soy de Australia. · ¿Él es de Colombia? — Sí, es de Salento. · No, no soy de España.

### 1.1 L5 · practice · Soy, eres, es
- **Goal:** fluent choice of *soy/eres/es* with every country so far (ser has 3 forms, so this is person-contrast practice, not a conjugation lesson; see §7).
- **New:** none. **Review:** L1–L4, interleaved.
- **Exercises:** faded pattern: model → gap → tiles → type the whole sentence; listen with person as distractor; speak a 2-line exchange.
- **Examples:** Soy de Chile. Eres de Perú. Es de Cuba. · ¿De dónde eres, Max? — Soy de Melbourne. · ¿Eres de Cuba? — No, soy de República Dominicana.

### 1.1 L6 · learn · El mundo hispanohablante
- **Goal:** talk about the Spanish-speaking world on a map; the language.
- **New (6):** el mundo, el mapa, hispanohablante, Guinea Ecuatorial (C) · la lengua, el español (H; *el español* is P2).
- **Review:** countries L1–L3.
- **Exercises:** `tf` against a map ("Chile es hispanohablante" ✓); `sort` hispanohablante vs not (Australia); type *hispanohablante* and *el español* (lower case in Spanish, a classic English-speaker error).
- **Examples:** Chile es hispanohablante. · El mapa: el mundo hispanohablante. · La lengua de Guinea Ecuatorial es el español. · El español es la lengua de Cuba. · ¿La lengua de Chile? ¡El español!
- **Story:** Max unfolds his map. Buhísimo shows that Spanish is spoken on four continents, including Equatorial Guinea in Africa.

### 1.1 L7 · learn · El destino *(title renamed 21 Oct: y is 1.5, and «islas» would be a bare plural)*
- **New (5):** la Isla de Pascua, las Islas Canarias, las Islas Baleares, las Islas Filipinas, el destino (C).
- **Review:** *¿De dónde es?*, él/ella, L6 map words.
- **Exercises:** maptap islands; listen → pick island; tiles "El destino es ___".
- **Examples:** El destino es la Isla de Pascua. · La Isla de Pascua es de Chile. · Ella es de las Islas Canarias. · ¿El destino? ¡Las Islas Filipinas!
- **Culture note (English):** Spanish was an official language in the Philippines for centuries, and many Filipino words come from Spanish. Avoid saying the Philippines *is* Spanish-speaking today.

### 1.1 L8 · learn · ¡Max es famoso! *(title renamed 21 Oct: e is 1.5)*
- **Goal:** describe places; the first agreement contrast (*famoso/famosa*).
- **New (4):** famoso/a, histórico/a, el monumento, la capital (C) · *name:* Cocora (N).
- **Exercises:** intro pair "El monumento es histórico / La capital es histórica" (worked example of agreement); `sort` -o/-a by noun; gap with both forms.
- **Examples:** El monumento es famoso. · La capital es histórica. · Cocora es famoso. · La Isla de Pascua es famosa. · ¡Max es famoso!
- **Story:** In the plaza everyone wants a photo with the kangaroo: "¡Max es famoso!"

### 1.1 L9 · story · El mapa de Max *(title renamed 21 Oct: y is 1.5)*
Buhísimo, Matilda and Max in the plaza. 10 lines, all 1.1 words. Checks after lines 4, 7 and 10.
```
B:  ¿De dónde eres, Matilda?
M:  Soy de Australia. Soy de Melbourne.
X:  ¿De dónde eres, Buhísimo?
B:  Soy de Colombia. ¡Soy de Salento!
    [check] Where is Buhísimo from? (Salento / Melbourne / Cuba)
X:  ¿Salento es famoso?
B:  ¡Cocora es famoso! El destino es Cocora.
X:  (jumps onto the map) ¿Cocora? ¿Es Perú? ¿Es Cuba? ¿Es Chile?
    [check] What is Max doing? (jumping across the map looking for Cocora)
M:  Max… ¡Cocora es de Colombia!
B:  Colombia es el país de Buhísimo. ¡El destino es Cocora!
X:  (a crowd is watching him) ¡Soy famoso!
    [check] Put the last three lines in order.
```

### 1.1 L10 · game · Game: map tap *(title until 21 Oct: «Map tap»)*
- First three labelled study maps (the Caribbean, South America, Spain / Africa / Asia), then hear "Ella es de Guinea Ecuatorial" → tap the place on a map **without names** (decision 20 Oct: numbered rings, neighbours as distractors, "Show the names" costs the bonus). Later rounds add islands and *soy/eres/es*. Sentences come from a closed list (subject × country, all validated). **Examples:** Él es de Guinea Ecuatorial. · Soy de las Islas Canarias.

### 1.1 L11 · check · Unit check: passport control *(title until 21 Oct: «Passport control»)*
- 12–15 items: every 1.1 item at least once, mostly type and listen; one maptap round; production: type 3 sentences from English. The boss finale: Buhísimo stamps passports by asking three tourists *¿De dónde eres?* (listen, then type their answer).
- **Production examples:** Soy de Australia. ¿De dónde eres? · ¿Eres de Argentina? — No, soy de Chile. · La lengua de Perú es el español. · La capital es famosa.

---

## 5. Unit 1.2 · ¿Qué tal? (13 lessons)

**Unit goal:** greet and say goodbye at the right time of day; ask how someone is and answer; say how someone else is (*está*); say and spell with the Spanish alphabet.
**Infinitives (decision 2):** *escribir* and *llamarse* are 1.2 CSV rows and are taught here, in the alphabet lessons, as spelling targets with their meaning (*escribir* = to write, *llamarse* = to be called). Their forms come later (*me llamo…* in 1.3).

### 1.2 L1 · repaso · ¿De dónde es Max? *(title until 21 Oct: «¿De dónde eres?»)*
- 10–12 items: 1.1 countries, *soy/eres/es*, *sí/no*, *¿De dónde…?*. **Example:** ¿De dónde es Max? — Es de Australia.

### 1.2 L2 · learn · ¡Hola!
- **New (5):** ¡hola!, Buenos días, Buenas tardes, ¡Adiós!, ¡Hasta luego! (C).
- **Exercises:** picture of the sun position → pick greeting; listen → pick; speak each greeting (shadow).
- **Examples:** ¡Hola, Matilda! · Buenos días, Buhísimo. · Buenas tardes, Max. · ¡Hasta luego, Matilda! · ¡Hola! Soy Max. Soy de Australia.
- **Story:** Morning in the plaza; by the afternoon the fog rolls in and it's *buenas tardes*. Culture note: *buenos días* until lunchtime.

### 1.2 L3 · learn · ¿Qué tal?
- **New (5):** ¿Qué tal?, bien, mal, regular, ¿Y tú? (C).
- **Exercises:** emoji scale → pick word; `sort` good/so-so/bad; tiles "¿Qué tal? — ___. ¿Y tú?"; speak a 2-line exchange.
- **Examples:** ¿Qué tal? — Bien. ¿Y tú? · ¡Hola, Max! ¿Qué tal? · Regular. ¿Y tú? · ¿Qué tal, Matilda? — Mal.

### 1.2 L4 · learn · ¿Cómo estás?
- **New (6):** ¿Cómo estás?, fatal, fenomenal, fantástico/a (C) · muy, gracias (H).
- **Exercises:** `sort` on a 5-point scale (fatal → fenomenal); gap "Muy ___, gracias"; listen; speak.
- **Examples:** ¿Cómo estás? — Muy bien, gracias. · Buenos días, Matilda. ¿Cómo estás? · ¡Fenomenal! ¿Y tú? · ¡Fantástico, gracias!

### 1.2 L5 · practice · Hola, ¿qué tal?
- Whole mini-dialogues, faded: model → gap → tiles → speak both roles.
- **Examples:** ¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú? · Buenas tardes. ¿De dónde eres? — Soy de Perú. · ¡Hasta luego, Buhísimo! — ¡Adiós, Max!

### 1.2 L6 · learn · Max está fenomenal
- **New (1):** está (H). Contrast card: *es de* (where from) vs *está* (how they feel).
- **Examples:** Max está fenomenal. · Matilda está regular. · ¿Qué tal Buhísimo? — Está muy bien. · Max es de Australia. Está fenomenal.

### 1.2 L7 · story · Buenos días, Salento
First morning and afternoon. 11 lines; checks after lines 3, 6 and 10.
```
B:  ¡Buenos días, Matilda! ¿Qué tal?
M:  Regular… ¿Y tú, Buhísimo?
B:  ¡Muy bien, gracias!
    [check] How is Matilda this morning? (so-so / great / awful)
X:  ¡Hola, Buhísimo! ¡Hola, Matilda!
B:  ¿Cómo estás, Max?
X:  ¡Fenomenal! ¡Fantástico! ¡Muy, muy bien!
    [check] How is Max? (great)
B:  Max está fenomenal. Matilda está regular.
    (Afternoon. Matilda has had a long koala nap.)
M:  ¡Buenas tardes! ¡Muy bien, gracias!
B:  ¿Y tú, Max? ¿Qué tal?
X:  Mal… muy mal.
    [check] Why has everything changed? (Matilda slept; Max has been jumping since 5 a.m.)
B:  ¡Hasta luego, Max!
```

### 1.2 L8 · listen · ¡Hola, Buhísimo! *(title until 21 Oct: «Radio Búho: ¿Qué tal?»)*
- Buhísimo takes four calls from four countries. Students fill a grid (country × face) on the first listen, then listen again with the transcript.
- **Script:** ¡Buenas tardes! Soy Buhísimo. ¿Qué tal? · ¡Hola, Buhísimo! Soy de Argentina. Muy bien, gracias. · ¡Hola! Soy de Cuba. Regular. · Buenas tardes. Soy de España. ¡Fenomenal! · ¡Hola! Soy de Perú. Fatal. · ¡Hasta luego, Argentina, Cuba, España, Perú!

### 1.2 L9 · learn · El alfabeto: a, e, i, o, u
- **Goal:** the vowels and the *e + consonant + e* letter family; spell short known words.
- **New (5):** el alfabeto (C) · ¿Cómo se escribe? (H) · *letters:* a e i o u (one group) · efe ele eme ene eñe ese erre (one group: they all sound "e + letter + e") · jota.
- **Clips (§11):** A1 (vowels) and A2 (the *e* family) from the Radio Búho alphabet episode, as `clip` exercises: listen, chant along, then fill the missing letter.
- **Exercises:** hear a letter → tap it; `dict` letter by letter; `tiles` to build the letter names of a word.
- **Examples:** El alfabeto: a, e, i, o, u. · ¿Cómo se escribe «ella»? — E, ele, ele, a. · ¿Cómo se escribe «eres»? — E, erre, e, ese. · ¿Cómo se escribe «fenomenal»? — Efe, e, ene, o, eme, e, ene, a, ele.
- **Validator note:** a bare letter name (*eme*) is allowed only in a spelling line (one that contains *se escribe* or *alfabeto*, or is marked `"spell": true`). Elsewhere a letter is a noun like any other: *la eme*.

### 1.2 L10 · learn · ¿Cómo se escribe Matilda? *(title until 21 Oct: «Be, ce, de… y llamarse»)*
- **New (5):** escribir, llamarse (C, infinitives) · *letters:* be ce de ge pe te (one group: "letter + e") · hache · cu.
- **Clip:** A3 (be, ce, de, ge, pe, te).
- **Exercises:** spell names from 1.1 (dictation and tiles); accent fix-up (*Peru → Perú*, *Buhisimo → Buhísimo*); intro cards for the two infinitives, then spell them. *Llamarse* shows that *ll* is spelt "ele, ele".
- **Examples:** ¿Cómo se escribe Salento? — Ese, a, ele, e, ene, te, o. · ¿Cómo se escribe «hola»? — Hache, o, ele, a. · ¿Cómo se escribe Matilda? — Eme, a, te, i, ele, de, a. · ¿Cómo se escribe «escribir»? — E, ese, ce, erre, i, be, i, erre. · ¿Cómo se escribe «llamarse»? — Ele, ele, a, eme, a, erre, ese, e.

### 1.2 L11 · learn · ¿Cómo se escribe Max? *(title until 21 Oct: «Las letras raras: ka, uve, equis…»)*
- **New (6):** *letters:* ka · uve · doble ve · equis · ye · zeta (each its own item: no shared pattern).
- **Letter names chosen by Juan:** **uve** (not *ve corta / ve chiquita*) and **ye** (not *i griega*), following the RAE 2010 recommendation. **W = doble ve**, chosen by Juan on 20 Oct 2026 (the usual Colombian name).
- **Clip:** A4 (ka, uve, doble ve, equis, ye, zeta).
- **Examples:** ¿Cómo se escribe Max? — Eme, a, equis. · ¿Cómo se escribe «soy»? — Ese, o, ye. · ¿Cómo se escribe «muy»? — Eme, u, ye.

### 1.2 L12 · listen · ¡El alfabeto! *(podcast and chant, §11; title until 21 Oct: «Radio Búho: el alfabeto»)*
- The full episode: the four family chants, the whole alphabet in order, then listeners phone in to spell their country or name. Students fill a spelling grid on the first listen.
- **Examples:** A, be, ce, de, e, efe, ge, … · ¡Hola, Buhísimo! Soy de Chile. Ce, hache, i, ele, e. · ¿Cómo se escribe Melbourne? — Eme, e, ele, be, o, u, erre, ene, e.

### 1.2 L13 · check · Unit check: the plaza *(title until 21 Oct: «The plaza»)*
- Every 1.2 item; one listening grid; one spelling dictation; production: build and speak a greeting exchange for a given time of day and mood.
- **Examples:** ¡Hola! ¿Cómo estás? — Muy bien, gracias. ¿Y tú? · Buenas tardes, Max. ¿Qué tal? · Matilda está muy bien. · ¿Cómo se escribe España? — E, ese, pe, a, eñe, a.

---

## 6. Unit 1.3 · Mi carnet de identidad (20 lessons, two map sections)

**Unit goal:** give and ask names; numbers 1–31; ask and say age; fill in an ID card; *mi*.
**Shape:** this is the largest unit (48 items). Numbers are split into six lessons and interleaved with name, age and ID lessons, then brought together in the Radio Búho numbers episode (L15).

**Two map sections (decided 20 October 2026; Juan approved splitting units with too many lessons).** At 18 lessons, 1.3 was well above the other units (11–15), so the path shows it as two sections. The split is a **path grouping only**: the CSV section stays "1.3 Mi carnet de identidad", every sentence keeps unit 1.3, and the lessons are numbered L1–L20 straight through. In `content/lessons_1.1-1.6.json` each 1.3 lesson has `"part": "1.3a"` or `"1.3b"`, and a top-level `"parts"` list gives each section's title and lesson range; the validator checks the ranges (§10).

| Section | Lessons | What it covers | Opens / closes with |
|---|---|---|---|
| **1.3a «¿Cómo te llamas?»** | L1–L11 (11 lessons, 30 counted items) | names, *llamarse*, numbers 1–20, age with *tener* | L1 repaso (1.1–1.2) / **L11 1.3a check (new)** |
| **1.3b «Mi carnet de identidad»** | L12–L20 (9 lessons, 18 counted items) | numbers 21–31, the numbers podcast and song, the ID card, *mi*, *amigo/a* | **L12 repaso (new)** / L20 unit check |

Why here: the cut falls after the first big block (names, 1–20 and age, practised together in L10) and before 21–31, so 1.3a ends on something students can already do in full (*Me llamo Samuel. Tengo trece años.*). 21–31 then sits next to the counting-song episode, which needs the whole 1–31 sequence, and the ID card. The halves are 11 and 9 lessons, close to Unit 1.1 (11). The new L11 check and L12 repaso keep the rule that each section opens with retrieval and closes with a check. Moving the podcast into 1.3a was considered and rejected: the song runs 1–31, so it can't come before 21–31.

**Section 1.3a · ¿Cómo te llamas? (L1–L11)**

### 1.3 L1 · repaso · Buenas tardes, ¿qué tal? *(title until 21 Oct: «¿Qué tal?»)*
- 1.2 greetings and feelings plus 1.1 countries and a spelling item. **Example:** Buenas tardes, Matilda. ¿Cómo estás? — Regular.

### 1.3 L2 · learn · Me llamo Valentina
- **Goal:** say your name and ask someone else's.
- **New (5):** me llamo, te llamas, se llama (H) · ¿Cómo te llamas?, ¿Cómo se llama? (H, P3) · *names:* Valentina, Samuel (N). *Llamarse* itself was met in 1.2 L10.
- **Exercises:** intro by each speaker; listen → pick the person; tiles "Me llamo ___. ¿Y tú?"; speak.
- **Examples:** ¡Hola! Me llamo Valentina. · ¿Cómo te llamas? — Me llamo Valentina. · ¿Cómo se llama él? — Se llama Samuel. · Ella se llama Matilda. · ¿Te llamas Samuel? — Sí, me llamo Samuel.
- **Story:** The Restrepo house. Valentina (12) and Samuel (13) meet the visitors.

### 1.3 L3 · conjugation · Me llamo, te llamas, se llama *(title until 21 Oct: «llamarse»)*
- **Goal:** the first conjugation lesson. Llamarse has 4 forms (infinitive + me llamo / te llamas / se llama), so it meets the ≥4 rule (§7). Table → choose the form for the person → type. Then the cross-verb pattern with *soy/eres/es*.
- **Examples:** Me llamo Matilda. Soy de Melbourne. · Te llamas Samuel. Eres de Colombia. · Se llama Buhísimo. Es de Salento. · Me llamo, te llamas, se llama.

### 1.3 L4 · learn · Uno, dos, tres
- **New (5):** uno, dos, tres, cuatro, cinco (C). **Clip:** N1.
- **Exercises:** listen → tap digit; type the word from the digit; count-down chant (speak).
- **Examples:** Uno, dos, tres, cuatro, cinco. · Tres, dos, uno… ¡Max! · Uno, dos, tres, cuatro, cinco: ¡muy bien!

### 1.3 L5 · learn · Seis… diez
- **New (5):** seis, siete, ocho, nueve, diez (C). **Clip:** N2.
- **Examples:** Seis, siete, ocho, nueve, diez. · Dos, cuatro, seis, ocho, diez. · Seis, siete, ocho, nueve, diez: ¡fenomenal!

### 1.3 L6 · game · Game: Number Invaders 1–10 *(title until 21 Oct: «Number Invaders 1–10»)*
- Hear a number → shoot the digit (audio cue mode); calm mode available. **Example:** Uno, tres, cinco, siete, nueve.

### 1.3 L7 · learn · Once… quince
- **New (5):** once, doce, trece, catorce, quince (C). These are irregular, so each gets its own intro. **Clip:** N3.
- **Examples:** Once, doce, trece, catorce, quince. · Diez, once, doce… ¡trece!

### 1.3 L8 · learn · ¿Cuántos años tienes?
- **Goal:** ask and answer age; *tener* = to have.
- **New (5):** ¿Cuántos años tienes? (C) · tengo, tienes, tiene, años (H; *años* is P4).
- **Worked example:** "Tengo el mapa" = I have the map → "In Spanish you *have* years: Tengo doce años." *Años* always follows a number (the validator treats it as a plural noun that needs one).
- **Examples:** ¿Cuántos años tienes? — Doce. · Tengo doce años. · Samuel tiene trece años. · ¿Tienes doce años? — Sí, tengo doce años. · Valentina tiene el mapa.

### 1.3 L9 · learn · Dieciséis… veinte
- **New (5):** dieciséis, diecisiete, dieciocho, diecinueve, veinte (C). Teach the pattern explicitly: *diez y seis → dieciséis* (shown as a picture, not as a sentence). **Clip:** N4.
- **Examples:** Dieciséis, diecisiete, dieciocho, diecinueve, veinte. · Quince, dieciséis, diecisiete.

### 1.3 L10 · practice · Tengo, tienes, tiene
- **Goal:** person contrast for *tener*, alongside *llamarse* and *ser* (tener has only 3 forms, so this is not a full conjugation lesson). Numbers 1–20 interleaved.
- **Examples:** Tengo, tienes, tiene. · Me llamo Matilda. Tengo doce años. · Max tiene trece años. Es de Melbourne.

### 1.3 L11 · check · ¿Cómo te llamas? ¿Cuántos años tienes? *(new, 20 Oct: closes section 1.3a; title until 21 Oct: «1.3a check: ¿Cómo te llamas? ¿Cuántos años tienes?»)*
- No hearts. Numbers 1–20 by ear (hear → tap the digit, and a short countdown dictation), names and ages (listen → pick the person), then production: introduce a character (name, age, where from).
- **Examples:** ¿Cómo te llamas? — Me llamo Samuel. Tengo trece años. · Valentina tiene doce años. Es de Salento. · Veinte, diecinueve, dieciocho, diecisiete, dieciséis. · ¿Cómo se llama él? — Se llama Max. Tiene trece años.

**Section 1.3b · Mi carnet de identidad (L12–L20)**

### 1.3 L12 · repaso · Cinco, diez, quince, veinte *(new, 20 Oct: opens section 1.3b; title until 21 Oct: «Names, ages and numbers 1–20»)*
- Spaced retrieval of 1.3a (numbers 1–20 out of order, *me llamo / te llamas / se llama*, *tengo … años*) plus one 1.1 country item and one 1.2 greeting. 21–29 are built from *veinte* + 1–9, so the repaso leans on *uno… nueve* and *veinte*.
- **Examples:** Cinco, diez, quince, veinte. · ¡Hola! Me llamo Matilda. Soy de Melbourne. Tengo doce años. · ¿Te llamas Valentina? — Sí. ¿Y tú?

### 1.3 L13 · learn · Veintiuno… veinticinco
- **New (5):** veintiuno, veintidós, veintitrés, veinticuatro, veinticinco (C). Pattern: *veinti-* + unit; watch the accents on *-dós, -trés*. **Clip:** N5.
- **Examples:** Veintiuno, veintidós, veintitrés, veinticuatro, veinticinco. · Veinte, veintiuno, veintidós…

### 1.3 L14 · learn · Veintiséis… treinta y uno
- **New (6):** veintiséis, veintisiete, veintiocho, veintinueve, treinta, treinta y uno (C). One pattern. Note: *treinta y uno* is three words, unlike *veintiuno*. **Clip:** N6.
- **Examples:** Veintiséis, veintisiete, veintiocho, veintinueve, treinta. · Veintinueve, treinta, treinta y uno.

### 1.3 L15 · listen · Radio Búho: the numbers song *(podcast and counting song, §11; title until 21 Oct: «Radio Búho: los números»)*
- The whole counting song 1–31, a countdown with Max, then two callers give their name and age. Students write the numbers they hear.
- **Examples:** Diez, nueve, ocho, siete, seis, cinco, cuatro, tres, dos, uno… ¡Max! · ¿Cuántos años tienes, Samuel? — Tengo trece años. · ¿Cuántos años tienes? ¡Doce, doce, doce años!

### 1.3 L16 · learn · Mi carnet de identidad
- **New (4):** el carnet de identidad, el nombre, el apellido (C) · mi (H, moved from 1.6 by P5) · *name:* Restrepo (N).
- **Worked example (P7):** *el nombre → mi nombre*: *mi* takes the place of *el*. Never the noun alone.
- **Exercises:** read an ID card → pick; tiles; type *el apellido*; fill a card by answering questions (*¿El nombre? —*), never by bare labels.
- **Examples:** El nombre es Valentina. El apellido es Restrepo. · ¿El nombre? Samuel. ¿El apellido? Restrepo. · Mi nombre es Samuel. Mi apellido es Restrepo. · ¿Tienes mi carnet de identidad? · Tengo el carnet de identidad.
- **Card labels on screen** (the printed field names of a picture of an ID card) are images, not text exercises, so no bare noun ever appears in a sentence.

### 1.3 L17 · learn · La amiga de Matilda
- **New (3):** la edad, el/la amigo/a, el lugar de nacimiento (C; spelling fixed by P9).
- **Exercises:** match amigo/amiga to pictures (agreement); fill a full ID card for a character.
- **Examples:** Valentina es la amiga de Matilda. · Samuel es el amigo de Max. · ¿La edad? Doce. · El lugar de nacimiento de Samuel es Salento. · Mi lugar de nacimiento es Melbourne. Tengo trece años. · Mi amiga se llama Valentina.

### 1.3 L18 · story · El carnet de identidad de Max *(title until 21 Oct: «El carnet de Max»)*
Max jumped a little too far in the Cocora valley and his ID card fell out. 11 lines; checks after lines 2, 5 and 11.
```
S:  Max, ¿tienes el carnet de identidad?
X:  ¿El carnet de identidad? … ¡Fatal!
    [check] What's Max's problem? (he can't find his ID card)
M:  Tengo el carnet de identidad. ¿Y tú, Max?
V:  ¿El mapa? ¿Tienes el mapa?
B:  (flies in) ¡Hola! Tengo el carnet de identidad de Max.
    [check] Who has Max's ID card? (Buhísimo)
B:  El nombre: Max. ¿De dónde eres?
X:  Soy de Melbourne.
B:  ¿Cuántos años tienes?
X:  ¡Trece!
B:  ¡Fenomenal! El carnet de identidad de Max.
X:  ¡Gracias, Buhísimo!
    [check] Put Buhísimo's three questions in order.
```

### 1.3 L19 · listen · Radio Búho: three ID cards *(title until 21 Oct: «Radio Búho: el carnet de identidad»)*
- Three teens call in; students fill three ID cards (name, surname, from, age) on the first listen.
- **Script:** ¡Buenas tardes! Me llamo Buhísimo. ¿Y tú? · Me llamo Valentina Restrepo. Tengo doce años. Soy de Salento. · ¿Y tú? ¿Cuántos años tienes? · Me llamo Samuel Restrepo. Trece. · Me llamo Matilda. Soy de Australia. Doce.

### 1.3 L20 · check · Unit check: the ID card office *(title until 21 Oct: «The ID card office»)*
- Number dictation (1–31), an ID card listening task, and production: introduce yourself as a character (name, where from, age).
- **Examples:** Me llamo Samuel. Soy de Colombia. · ¿Cuántos años tienes? — Trece. · Samuel es el amigo de Matilda. · Me llamo Max. Tengo trece años. Soy de Melbourne.

---

## 7. Verbs and conjugation lessons (all of Unit 1)

The validator counts the forms of each Lemma in `helper_words.csv` (verb forms only), plus the infinitive when it is itself a CSV row. **Decided 18 October: the infinitive counts.** Chunks such as *¿Cómo te llamas?* and *¿Cómo se escribe?* have no Lemma, so they don't count as extra forms.

| Verb | Forms in 1.1–1.6 | ≥ 4? | Where it is practised |
|---|---|---|---|
| ser | soy, es (1.1 L1), eres (1.1 L3) | No (3) | 1.1 L3 worked example; 1.1 L5 person-contrast practice; 1.6 L12 cross-verb review |
| llamarse | llamarse (1.2 L10), me llamo, te llamas, se llama (1.3 L2) | **Yes, from 1.3 L2** | **1.3 L3 conjugation lesson** |
| tener | tengo, tienes, tiene (1.3 L8) | No (3) | 1.3 L8 intro; 1.3 L10 person-contrast practice; 1.6 L12 |
| estar | está (1.2 L6), plus *estás* inside ¿Cómo estás? | No | 1.2 L6 *es* vs *está* contrast |
| escribir | escribir (1.2 L10), plus *escribe* inside ¿Cómo se escribe? | No | 1.2 L10 (meaning and spelling) |

So **llamarse is the only verb with a conjugation lesson in Unit 1**. Ser and tener get yo/tú/él person-contrast practice inside practice lessons. **1.6 L12** is a cross-verb review of the shared pattern (*soy / me llamo / tengo* for yo, *eres / te llamas / tienes* for tú, *es / se llama / tiene* for él/ella), a useful explicit-teaching point before Unit 2.

---

## 8. Units 1.4–1.6

### Unit 1.4 · ¡…y que cumplas muchos más! (13 lessons)

**Unit goal:** days, months, the date and birthdays. Numbers 1–31 come back in every lesson.
**With P6** (standalone *el* moved to 1.4), every date works from L10: *el + number + de + month*. Days and months are lower case in Spanish; the `capitals` column marks them as case-sensitive, so typing "Lunes" mid-sentence should be "nearly". No plurals yet: *los lunes* waits for the 1.6 L7 rule card.

#### 1.4 L1 · repaso · Veinte, veinticinco, treinta *(title until 21 Oct: «Los números»)*
- Numbers 1–31 (audio → digit, digit → type), names and age; a clip from the 1.3 counting song. **Example:** Uno, cinco, diez, quince, veinte, veinticinco, treinta.

#### 1.4 L2 · learn · La semana
- **New (5):** la semana, lunes, martes, miércoles, jueves (C). **Clip:** D1.
- **Exercises:** order the days (tiles); listen → tap the calendar; type with the lower-case rule.
- **Examples:** Lunes, martes, miércoles, jueves. · Es lunes. · Es jueves. ¡Fenomenal! · Lunes, martes, miércoles, jueves: ¡la semana!

#### 1.4 L3 · learn · ¡Sábado!
- **New (3):** viernes, sábado, domingo (C), to finish the week; heavy review of L2. **Clip:** D2.
- **Examples:** Viernes, sábado, domingo. · Es sábado. ¡Fantástico! · Es domingo. Matilda está muy bien.

#### 1.4 L4 · learn · Enero… abril
- **New (5):** el mes, enero, febrero, marzo, abril (C). **Clip:** D3.
- **Examples:** Enero, febrero, marzo, abril. · Es enero. · ¿El mes? Febrero.

#### 1.4 L5 · learn · Mayo… agosto
- **New (4):** mayo, junio, julio, agosto (C). **Clip:** D4.
- **Examples:** Mayo, junio, julio, agosto. · Es julio. Buhísimo está fenomenal. · ¿Junio? ¡Fantástico!
- **Culture note (in English):** Colombia has no four seasons, while July is winter in Melbourne and Chile.

#### 1.4 L6 · learn · Septiembre… diciembre
- **New (5):** septiembre, octubre, noviembre, diciembre, el año (C). **Clip:** D5.
- **Examples:** Septiembre, octubre, noviembre, diciembre. · El año: enero, febrero, marzo… · Septiembre, octubre, noviembre, diciembre: ¡el año!

#### 1.4 L7 · listen · Radio Búho: the week and the months *(podcast and chant, new, §11; title until 21 Oct: «Radio Búho: la semana y los meses»)*
- The week chant and the months chant in full, then callers say what day it is. **Examples:** La semana: lunes, martes, miércoles, jueves, viernes, sábado, domingo. · ¿Es martes? — No, es miércoles.

#### 1.4 L8 · game · Game: calendar tap *(title until 21 Oct: «Calendar tap»)*
- Hear a day or month → tap it on a calendar; later rounds use the full date (after L10). **Examples:** Es miércoles. · Es octubre.

#### 1.4 L9 · learn · ¿Cuándo es tu cumpleaños?
- **New (5):** ¿Cuándo es tu cumpleaños?, el cumpleaños, el primero, el uno (C) · tu (H).
- **Worked example:** *El primero* and *el uno* both mean "the first"; in Colombia people say *el primero*, in Spain often *el uno*. Buhísimo shows both: *El uno de marzo, el primero de marzo: ¡muy bien!* *Mi cumpleaños* (P5 + P7): *mi* replaces *el*. *El* + any other number comes in L10, so here the cast only name the month (*¿Mi cumpleaños? Enero.*).
- **Examples:** ¿Cuándo es tu cumpleaños? — Es el primero de junio. · ¿El cumpleaños de Samuel? ¿El primero de mayo? — No. · El uno de marzo, el primero de marzo: ¡muy bien! · ¿Cuándo es tu cumpleaños, Buhísimo? — ¿Mi cumpleaños? Agosto. · (Samuel) ¿Mi cumpleaños? Enero. · ¿Y tú, Max? ¿Tu cumpleaños?

#### 1.4 L10 · learn · La fecha: el veinte de julio
- **New (2):** el (H, moved from 1.6 by P6) · la fecha (C). Then a date workout: day + date. **Worked example:** "*el* + number + *de* + month". This is where all 31 × 12 dates open up (a generated list, validated).
- **Examples:** Es el veinte de julio. · El cumpleaños de Valentina es el veinte de julio. · La fecha es el uno de abril. · Es martes, el doce de marzo. · La fecha es el treinta y uno de diciembre. · The cast's birthdays (canon, §3): Mi cumpleaños es el diez de enero. (Samuel) · El cumpleaños de Matilda es el quince de junio. · Mi cumpleaños es el siete de agosto. ¡Fenomenal! (Buhísimo) · El cumpleaños de Max es el veintinueve de febrero.

#### 1.4 L11 · speak · Speak: say the date *(title until 21 Oct: «Di la fecha»)*
- Shadow 4 dates, then prompted production from a calendar picture.
- **Examples:** Es viernes, el primero de julio. · ¿Cuándo es tu cumpleaños? — Es el uno de noviembre. · Es el quince de septiembre.

#### 1.4 L12 · story · El cumpleaños de Max
Checks after lines 3, 7 and 10.
```
V:  ¿Cuándo es tu cumpleaños, Matilda?
M:  Es el quince de junio. ¿Y tú, Valentina?
V:  Julio. ¡Veinte de julio!
    [check] Why is Valentina's birthday special? (it's Colombia's national day: fireworks!)
S:  ¿Y tú, Max? ¿Cuándo es tu cumpleaños?
X:  Febrero. Veintinueve de febrero.
S:  ¿Veintinueve de febrero? ¿Cuántos años tienes, Max?
X:  Trece. ¿El cumpleaños? ¡Tres!
    [check] Why does Max say "¡Tres!"? (29 February only comes every four years: he's a leap-day kangaroo)
B:  ¡Max es fantástico!
V:  La fecha: domingo, el quince de junio. ¡El cumpleaños de Matilda!
M:  ¡Fenomenal! ¡Gracias!
    [check] What will they celebrate on Sunday 15 June? (Matilda's birthday)
```

#### 1.4 L13 · check · Unit check: the party calendar *(title until 21 Oct: «The party calendar»)*
- Every 1.4 item; date dictation; production: say and type birthdays from a calendar.
- **Examples:** ¿Cuándo es tu cumpleaños? — Es el primero de agosto. · Es sábado, el uno de mayo. · Es jueves, el veintidós de abril.

### Unit 1.5 · Mis preferencias (13 lessons)

**Unit goal:** colours with agreement; likes and dislikes; join opinions with connectors.
**With P6**, colour opinions work from the start of the unit (*Me encanta el azul*, *Odio el blanco*), so *odio/detesto/prefiero* now have kind, natural sentences in 1.5. Colours stay singular until 1.6 (plural agreement is taught in 1.6 L6 and L8).

#### 1.5 L1 · repaso · Es domingo, el primero de junio *(title until 21 Oct: «El calendario»)*
- Days, months and dates from 1.4; numbers. **Example:** Es domingo, el primero de junio.

#### 1.5 L2 · learn · Rojo, azul, verde
- **New (6):** rojo/a, azul, amarillo/a, verde, negro/a, blanco/a (C).
- **Worked example:** El monumento es blanco / La capital es blanca. Agreement is shown, not just told.
- **Exercises:** colour swatch → pick; `sort` -o/-a/invariable; gap with agreement.
- **Examples:** El mapa es azul. · El monumento es blanco. · La capital es blanca. · Cocora es verde. · ¿Rojo? ¡Fenomenal!

#### 1.5 L3 · learn · Gris, marrón, morado
- **New (5):** gris, marrón, morado/a, naranja, rosa (C).
- **Examples:** Matilda es gris. · Max es marrón. · El carnet de identidad de Max es naranja. · ¿Morado? ¡Fantástico!

#### 1.5 L4 · learn · Mi color favorito es…
- **New (3):** claro/a, oscuro/a, mi color favorito es… (C).
- **Examples:** Mi color favorito es azul. · Max es marrón claro. · Buhísimo es marrón oscuro. · Mi color favorito es verde oscuro.

#### 1.5 L5 · game · Game: colour match *(title until 21 Oct: «Colour match»)*
- Picture → colour phrase with agreement (Request engine). **Examples:** El mapa es amarillo. · La capital es roja. · El carnet de identidad es azul claro.

#### 1.5 L6 · learn · Me gusta, me encanta
- **New (4):** me gusta (mucho), no me gusta (nada), me encanta (C) · mucho/a (H).
- **Exercises:** `sort` on a 5-point scale (no me gusta nada → me encanta); listen → pick the face; speak.
- **Examples:** Me gusta Salento. · Me gusta mucho Cocora. · ¿Lunes? No me gusta nada. · Me gusta el rojo. · Me encanta el verde.

#### 1.5 L7 · learn · Prefiero, odio, detesto
- **New (3):** prefiero, odio, detesto (C).
- **Examples:** Prefiero Cocora. · ¿Chile? Prefiero Perú. · Odio el blanco. · Detesto el naranja. · Prefiero el azul.

#### 1.5 L8 · learn · y, o, pero
- **New (3):** y, o, pero (C).
- **Examples:** ¿Rojo o azul? — Azul. · Max es marrón y Matilda es gris. · Me gusta Chile, pero prefiero Perú. · Me encanta el azul, pero no me gusta nada el naranja.
- **Guardrail (Appendix C):** *y → e* before an *i-* sound and *o → u* before an *o-* sound. Nothing in Unit 1 triggers it; the generators should block it anyway.

#### 1.5 L9 · learn · También, además, sin embargo
- **New (3):** también, además, sin embargo (C).
- **Examples:** También me gusta Cuba. · Me encanta Salento. Además, me gusta mucho Cocora. · Me gusta el verde. Sin embargo, prefiero el morado.

#### 1.5 L10 · practice · Me encanta…, pero…
- Pattern *opinion + thing + connector + opinion + thing*, faded model → gap → tiles → type.
- **Examples:** Me gusta mucho España, pero prefiero Colombia. · Me gusta mucho el rojo. Además, me encanta el amarillo.

#### 1.5 L11 · story · ¡Rojo, verde, azul… y amarillo! *(title until 21 Oct: «Un jeep de colores»)*
Choosing a painted Willys jeep for the ride up to Cocora. Checks after lines 4 and 6, and at the end.
```
X:  ¡Rojo! ¡Me encanta!
M:  ¿Rojo? No me gusta nada.
V:  ¿Azul o verde, Matilda?
M:  Verde. Mi color favorito es verde.
    [check] What is Matilda's favourite colour? (green)
S:  ¿Verde? Me gusta mucho. Sin embargo, mi color favorito es azul.
B:  ¡Rojo, verde, azul… y amarillo! ¡Fenomenal!
    [check] Which jeep do they take? (the one with every colour)
V:  ¡Fantástico! ¡Me encanta!
X:  ¡Me encanta, me encanta, me encanta!
```

#### 1.5 L12 · listen · Radio Búho: favourite colours *(title until 21 Oct: «Radio Búho: colores favoritos»)*
- A colour poll. Grid: person × colour.
- **Script:** ¡Buenas tardes! Soy Buhísimo. Mi color favorito es marrón. · ¿Y tú, Valentina? · Mi color favorito es morado. ¡Me encanta! · ¿Y tú, Samuel? · Mi color favorito es azul. ¡Azul claro! · Mi color favorito es verde. ¡Verde oscuro! · ¿Y Max? · ¡Mi color favorito es rojo! Rojo, amarillo, azul, verde…

#### 1.5 L13 · check · Unit check: paint the jeep *(title until 21 Oct: «Paint the jeep»)*
- Every 1.5 item; one listening grid; production: 2 opinion sentences with a connector.
- **Examples:** Mi color favorito es morado. · Me gusta mucho Salento, pero prefiero Cocora. · Max es marrón claro y Matilda es gris. · Me encanta el rojo. Sin embargo, prefiero el verde.

### Unit 1.6 · ¡Tod@s a clase! (15 lessons, including the Unit 1 boss)

**Unit goal:** school objects; articles and gender; *hay*; possessives; **plurals, including the irregular ones**; recombining all of Unit 1.
**Determiners (P7):** *un/una*, *mi/tu/su/sus*, *los/las* and numbers replace a noun's *el/la*: *un libro, mi mochila, dos cuadernos*. A noun is never bare, so *No hay tijeras* (natural, but bare) is not used; the mix engine's negative template says *No tengo las tijeras* instead.
**Plurals (P8):** taught as three rule-card lessons (L6–L8) after the objects are known. Every plural with a spelling change gets its own rule card before it is used, and the validator rejects any plural used before its card. The full list for all units is in `docs/irregular_plurals.md`.

| Rule card | Lesson | Words it covers in 1.1–1.6 |
|---|---|---|
| regular: vowel + s, consonant + es (and adjectives agree) | L6 | libros, cuadernos, reglas, gomas, bolígrafos, estuches, mochilas; países (keeps its í), meses; rojos, azules, grises, verdes |
| z → ces | L7 | el lápiz → los lápices |
| unchanged (unstressed -s) | L7 | el sacapuntas → los sacapuntas, el cumpleaños → los cumpleaños, el lunes → los lunes (also martes–viernes) |
| always plural | L7 | las tijeras |
| accent loss | L8 | marrón → marrones |
| compound: only the first noun changes | L8 | las hojas de papel, los libros de texto, los lugares de nacimiento |

*Carnet → carnets* (a loanword) is not used in 1.1–1.6; its card is planned for 3.5 with *el fan → los fans*. *Naranja* and *rosa* stay unchanged after a plural noun (*dos cuadernos naranja*), which is correct and needs no card; L8 mentions it.

#### 1.6 L1 · repaso · ¿Rojo o verde? *(title until 21 Oct: «Colores y opiniones»)*
- Colours, opinions and connectors (1.5), plus dates. **Example:** ¿Rojo o verde? — Rojo. ¡Me encanta!

#### 1.6 L2 · learn · El libro, la regla
- **Goal:** masculine and feminine nouns; *el/la* as words (*el* is review from 1.4).
- **New (5):** la (H) · el libro, el cuaderno, la regla, la goma (C).
- **Exercises:** `sort` el/la; pick the picture; gap *el/la*; type with the article (required at stage 3).
- **Examples:** El libro es azul. · La regla es amarilla. · El cuaderno de Valentina es morado. · Me gusta el rojo, pero prefiero el azul. · ¿El cuaderno? Prefiero el libro.

#### 1.6 L3 · learn · El lápiz, el estuche
- **New (5):** el bolígrafo, el lápiz, el estuche, el sacapuntas (C) · la mochila (H).
- **Examples:** El bolígrafo es rojo. · El estuche de Matilda es verde. · El sacapuntas es gris. · La mochila de Samuel es azul. · Me encanta la mochila de Valentina.

#### 1.6 L4 · learn · Hay un libro
- **New (4):** hay… (C) · un, una, en (H).
- **Worked example (P7):** *el libro → un libro*, *la regla → una regla*: the gender of *el/la* decides *un/una*.
- **Examples:** El lápiz está en el estuche. · En la mochila hay un libro. · Hay una regla en el estuche. · Hay una goma blanca. · Max está en Salento.

#### 1.6 L5 · learn · Las tijeras, la hoja de papel
- **New (3):** las tijeras, la hoja de papel, el libro de texto (C).
- **Examples:** Tengo las tijeras. · ¿Tienes la hoja de papel? · El libro de texto es rojo.

#### 1.6 L6 · learn · Los libros, las reglas *(rule card: regular plurals)*
- **New (3):** los, las (H) · rule card `plural:regular`.
- **Rule card:** *el libro → los libros* (vowel + s), *la capital → las capitales* (consonant + es); adjectives agree (*dos bolígrafos azules*). Watch-outs: *el país → los países* keeps the í; *el mes → los meses*.
- **Exercises:** `sort` singular/plural; gap *el/los, la/las*; picture → "dos ___"; type the plural.
- **Examples:** El libro, los libros. La regla, las reglas. · Dos cuadernos, tres libros. · Tengo dos bolígrafos azules. · ¿Tienes los cuadernos? · Los países hispanohablantes: España, Colombia, Perú…

#### 1.6 L7 · learn · Dos lápices, dos sacapuntas *(rule cards: z → ces, unchanged, always plural)*
- **New (3 rule cards):** `plural:z-ces`, `plural:unchanged`, `plural:plural-only`. No new words: the whole lesson is practice of the three cards.
- **Rule cards:** *un lápiz → dos lápices* (z → c before e); *el sacapuntas → los sacapuntas*, *el cumpleaños → los cumpleaños*, *el lunes → los lunes* (the last syllable isn't stressed and already ends in -s, so nothing changes; the article shows the number); *las tijeras* is always plural.
- **Exercises:** odd-one-out (which plural changes?); hear "dos ___" → pick *lápiz/lápices*; type the plural with the accent kept (*lápices*).
- **Examples:** Un lápiz, dos lápices. · Hay tres lápices. · El sacapuntas, los sacapuntas. · Tengo dos sacapuntas. · Los lunes, los martes, los miércoles… · Max no tiene las tijeras.

#### 1.6 L8 · learn · Dos bolígrafos marrones *(rule cards: accent loss, compounds; title until 21 Oct: «Bolígrafos marrones, hojas de papel»)*
- **New (2 rule cards):** `plural:accent-loss`, `plural:compound`.
- **Rule cards:** *marrón → marrones*: the stress stays on the same syllable, so the written accent isn't needed any more. *La hoja de papel → las hojas de papel*: only the first noun changes (not *hojas de papeles*). Note: *naranja* and *rosa* can stay the same (*dos cuadernos naranja*).
- **Examples:** Dos bolígrafos marrones. · Hay tres lápices marrones. · Tengo tres hojas de papel. · Hay dos libros de texto en la mochila. · Hay dos cuadernos naranja.

#### 1.6 L9 · learn · Su libro, sus libros
- **New (2):** su, sus (H). *Mi* (1.3) and *tu* (1.4) are reviewed. (*Mis* and *tus* are not rows yet: P12.)
- **Examples:** Mi mochila es verde. · Tu estuche es morado. · Su libro está en la mochila. · Su mochila es azul. · Tengo sus cuadernos. · Tengo sus bolígrafos rojos.

#### 1.6 L10 · game · En mi mochila (Request engine, v1 Mochila)
- Read or hear a request, tap the matching objects. Requests come from slot tables (number × object × colour), never free text. **Examples:** Un cuaderno. · Una goma verde. · Tres lápices rojos. · Dos reglas amarillas.

#### 1.6 L11 · practice · Practice: the magic backpack *(title until 21 Oct: «La mochila mágica (mix engine)»)*
- The v1 templates T1–T5 (rules §8.2), every output listed and validated at build time. **T4 changed:** *No hay tijeras…* (bare noun) became *No tengo las tijeras.*
- **Examples:** Prefiero el cuaderno azul. *(T3)* · En mi mochila hay tres bolígrafos rojos. *(T1)* · Hay una regla verde en mi mochila. *(T2)* · No tengo las tijeras. *(T4)* · ¿Hay un sacapuntas en tu estuche? — Sí, hay un sacapuntas. *(T5)*

#### 1.6 L12 · practice · Soy, me llamo, tengo (verb review)
- The cross-verb person pattern before the boss (§7). Table → `sort` by person → type.
- **Examples:** Me llamo Samuel. Soy de Salento. Tengo el libro de texto. · Te llamas Max. Eres de Melbourne. Tienes el mapa. · Se llama Matilda. Es de Australia. Tiene la mochila. · Soy, eres, es. Tengo, tienes, tiene.

#### 1.6 L13 · story · La mochila de Max
First day of school. Max has no backpack: everything comes out of his pouch. Checks after lines 4, 8 and 10.
```
V:  ¡Buenos días! ¿Tienes la mochila, Matilda?
M:  Tengo la mochila. En la mochila: el libro, el cuaderno y el estuche.
S:  ¿Y tú, Max? ¿La mochila?
X:  ¿La mochila? … ¡Tengo el libro de texto!   (pulls it out of his pouch)
    [check] Where does Max keep his things? (in his pouch)
V:  ¿Y el lápiz? ¿Y la regla?
X:  ¡El lápiz, la regla, la goma y el sacapuntas!
M:  ¿Y las tijeras?
X:  ¿Las tijeras? … ¡Fatal!
    [check] What has Max forgotten? (the scissors)
B:  ¡Hola! Tengo las tijeras.   (from his mochila wayuu)
X:  ¡Gracias, Buhísimo! ¡Fenomenal!
    [check] Who helps Max? (Buhísimo)
```

#### 1.6 L14 · check · Unit check: first day of school *(title until 21 Oct: «First day of school»)*
- Every 1.6 item, including one plural of each rule; a Request-engine round; production: describe what's in a backpack.
- **Examples:** El estuche está en la mochila. · Me gusta mucho el libro de texto. · Hay un bolígrafo azul en el estuche. · En la mochila hay dos cuadernos y una regla.

#### 1.6 L15 · boss · Unit 1 boss: Buhísimo's welcome poster
- Cumulative 1.1–1.6, no hearts, about 15 items: listening (a Radio Búho-style self-introduction), typing, a spelling item, and **4–5 production sentences, each combining at least 3 sections**. Students build Matilda's welcome poster: name and greeting (1.2–1.3), where from (1.1), birthday (1.4), favourite colour and opinions (1.5), what's in the backpack (1.6). Pass at ≥80% first-try; otherwise targeted practice of the missed items, then retry.
- **Examples:** ¡Hola! Me llamo Matilda. Soy de Australia. · Ella se llama Matilda. Es de Melbourne, en Australia. · ¿Cuándo es tu cumpleaños, Matilda? — Es domingo, el quince de junio. · Mi color favorito es verde, pero también me gusta el azul. · Tengo doce años. Mi cumpleaños es el quince de junio. · En mi mochila hay tres bolígrafos rojos y una regla verde.

---

## 9. Proposals

### Approved by Juan on 18 October 2026 (now in the masters or the validator)

| # | Proposal | Where it lives now | Taught in |
|---|---|---|---|
| P1 | **sí, no** | `helper_words.csv`, 1.1 | 1.1 L4 |
| P2 | **el español** | `helper_words.csv`, 1.1 | 1.1 L6 |
| P3 | **¿Cómo te llamas? / ¿Cómo se llama?** | `helper_words.csv`, 1.3, chunks (no Lemma) | 1.3 L2 |
| P4 | **años** | `helper_words.csv`, 1.3, Type "noun (plural form)": always after a number | 1.3 L8 |
| P5 | **mi** moved from 1.6 to 1.3 | `helper_words.csv`. *Tu* stays 1.4 (it arrives inside *¿Cuándo es tu cumpleaños?*) and *su* stays 1.6: no 1.3 sentence needs them | 1.3 L16 |
| P6 | **el** moved from 1.6 to 1.4 | `helper_words.csv` | 1.4 L10 |
| P7 | **Determiner rule**: a CSV noun may swap *el/la* for *un/una, mi/tu/su, los/las, mis/tus/sus* or a number, never bare | `tools/check_vocab.mjs` | 1.3 L16 (*mi*), 1.6 L4 (*un/una*) |
| P8 | **Plurals**, each rule taught first | `tools/check_vocab.mjs` + `content/plurals.json` | 1.6 L6–L8 |
| P9 | **Typo fixed**: el lugar de *nascimiento* → *nacimiento* | `vocabulary_database.csv` master, synced to every copy | 1.3 L17 |
| P10 | **Letter names + ¿Cómo se escribe?** with **uve** and **ye** | `helper_words.csv`, 1.2: the chunk and 27 rows *la a … la zeta* (Type letter) | 1.2 L9–L12 |

**Letter-name choices (P10).** Juan chose ***uve*** (not *ve corta*) and ***ye*** (not *i griega*), as the RAE has recommended since 2010. For W he chose ***doble ve***, the usual Colombian name (20 Oct 2026). Letters are stored with their article (*la eme*) so that the one-letter names (*a, e, o, u, de, te*) don't become stray "words" for the other tools that read `helper_words.csv` (the slide and worksheet generators). The bare name is allowed only in a spelling line.

### Still open (new, for Juan to decide)

| # | Proposal | Section | What it unlocks |
|---|---|---|---|
| P11 | **cero** | 1.3 | Juan asked for a 0–31 counting song; *cero* isn't in the Claro 1.3 list, so the song currently runs 1–31. With P11 the song opens on *cero* and countdowns end on it. |
| P12 | **mis, tus** | 1.6 | Juan's P7 decision lists *mis/tus* as allowed determiners, but they are not rows yet. 1.6 L9 would teach *mis/tus* next to *sus* (*mis libros*). The validator already accepts them as determiners once they are rows. |
| P13 | **el abecedario** | 1.2 | The everyday Colombian school word for the alphabet, next to the Claro word *el alfabeto*, for the chant's title (*El abecedario de Buhísimo*). |

No sentence uses P11–P13, so nothing is pending. To approve one: add its words to the master CSV with the section shown, run `spanish_app/sync_vocab.py`, set its status to approved in `content/proposals_1.1-1.6.json`, and add the sentences.

---

## 10. Validator: `tools/check_vocab.mjs`

**What it checks.** It loads `data/vocabulary_database.csv`, `helper_words.csv` and `names.csv`, plus `content/plurals.json`. For any unit, it builds the allowed set from every row whose Section is ≤ that unit, compared numerically. Rows with no Section (19 names, e.g. Carlos, Sofía) are never allowed. It generates only these forms: o/a endings (*roja*; *rojos, rojas* count as plurals), *el/la amigo/a* → *el amigo, la amiga*, optional parentheses (*me gusta (mucho)*), *jugador(a)*/*actor/actriz* pairs, *hay…* → *hay*, noun plurals and the adjective plurals listed in `plurals.json`. It tokenises case- and punctuation-insensitively, keeps accents (*si* ≠ *sí*), and matches the longest phrase first (up to 8 tokens).

**New rules (18 October 2026).**
1. **Determiners (P7).** A noun that has lost its own *el/la* must have a determiner directly before it: *un, una, el, la, mi, tu, su, los, las, mis, tus, sus*, or a number from *dos* to *treinta* (or digits). Number and gender must agree (*una libro* and *dos lápiz* fail). A bare noun always fails, including labels like *Nombre: Samuel*. The determiner must itself be allowed (so *mis* fails until P12).
2. **Plurals (P8) and irregular-plural gating.** Each plural carries one or more rules (regular, z-ces, accent-loss, accent-gain, unchanged, compound, plural-only, loanword, y-yes, mixed-masculine, el-feminine). A plural is allowed only once all its rules are taught: in the manifest, a lesson declares `"teaches": ["plural:z-ces"]`; rules taught after 1.6 take their unit from `ruleTaughtAt` in `plurals.json` (accent-gain 2.5, for example). After a plural determiner, a word with an unchanged plural is read as that plural, so *los lunes* fails before 1.6 L7. `node tools/check_vocab.mjs --plurals` lists the plural of every CSV noun and **fails if an irregular one is missing from `plurals.json`**, so new CSV words can't slip through.
3. **Letter names.** *La eme* is an ordinary noun phrase; the bare *eme* is allowed only in a spelling line (it contains *se escribe* or *alfabeto*, or is marked `"spell": true`), and only for letters taught by that lesson.
4. **Lesson size.** Counted items = rows in `new` (a nested array such as `["soy", "de"]` is one chunk = one item; names don't count) + letter groups + rule cards. **More than 6 is a warning; more than 8 is a failure.**
5. **Approved proposals** are no longer applied as pending: their words are CSV rows and their rules are built in. A leftover `"needs"` tag on an approved proposal is reported as a warning. Pending proposals (P11–P13) still work as before, with `--approve` and `--strict`.
6. **Map sections (20 October 2026).** A unit can be shown as map sections with `"parts"` in the manifest. Parts must be contiguous ranges that cover every lesson of their unit, each lesson's `part` must match its range, and each part title must pass at its unit. A part that doesn't open with a repaso or close with a check or boss is a warning. Only 1.3 is split.
7. **Lesson titles (21 October 2026).** Every lesson needs `titleEs` and/or `titleEn` (an old `title` field fails). `titleEs` is checked like a sentence of its own lesson: only items introduced by then, no bare nouns, plural rules taught. «¿Sí o no?» fails in 1.1 L4 (*o* is 1.5) and «Bolígrafos marrones» fails anywhere (bare plural).

Then, as before:
1. **Unit-level check (the hard rule):** every sentence must tokenise with the words allowed at its unit.
2. **Lesson-level check:** walking `content/lessons_1.1-1.6.json` in order, a sentence may only use items, letters and plural rules introduced in its own lesson or earlier. It fails if a lesson introduces a word *before its CSV section*, and warns on any 1.1–1.6 row never introduced (coverage).
3. **Conjugation report:** for each Lemma (verb forms in `helper_words.csv`, plus the infinitive row), the lesson where the 4th form is introduced.

**Usage**
```
node tools/check_vocab.mjs                        # the check below; exit 1 on failure
node tools/check_vocab.mjs --verbose              # also lists each lesson's counted items
node tools/check_vocab.mjs --strict               # pending sentences count as failures
node tools/check_vocab.mjs --approve P11          # preview with pending proposals approved ("all" for every one)
node tools/check_vocab.mjs --unit 1.3 --text "Tengo doce años."   # one string (add --spell for a spelling line)
node tools/check_vocab.mjs --unit 1.5 --list      # every form allowed at 1.5
node tools/check_vocab.mjs --plurals              # every CSV noun's plural and rule
```
**Spot checks that behave as intended:** *Nombre: Samuel.* fails at 1.3 (bare noun) while *Mi nombre es Samuel.* passes; *Mochila.* and *No hay tijeras.* fail at 1.6 (bare); *Una libro.* fails (agreement); *Dos lápiz.* fails; *Hay tres lápices.* fails in 1.6 L6 ("z-ces taught in 1.6 L7") and passes from L7; *Dos bolígrafos marrones.* fails in 1.6 L7 and passes from L8; *Dos lunes.* fails at 1.5; *Los jóvenes.* fails at 2.2 and passes at 2.5; *Tengo años.* fails (needs a number) while *Tengo doce años.* passes; *Eme, a, equis.* fails as a normal line and passes as a spelling line; *¿Cómo se escribe Max? — Eme, a, equis.* fails in 1.2 L9 ("equis introduced in 1.2 L11").

**Output of the final run** (20 October 2026):
```
Buhísimo vocabulary check: content/sentences_1.1-1.6.json
  data: 426 vocabulary rows, 79 helper rows, 62 names (19 names have no Section and are never allowed)
  proposals: 13 in content/proposals_1.1-1.6.json (10 approved, 3 pending); approved for this run: none
  plural rules and where they are first taught: regular 1.6, z-ces 1.6, unchanged 1.6, plural-only 1.6, accent-loss 1.6, compound 1.6, mixed-masculine 2.2, accent-gain 2.5, y-yes 2.5, loanword 3.5, el-feminine 3.7

Unit-level check: rows with Section ≤ the sentence's unit; a determiner before every noun that lost its el/la; plural rules taught by that unit
  unit  sentences  ready  pending  fail
  1.1          72     72        0     0
  1.2          81     81        0     0
  1.3          99     99        0     0
  1.4          62     62        0     0
  1.5          69     69        0     0
  1.6          85     85        0     0
  all         468    468        0     0
  singular nouns after a determiner other than their own el/la (P7): amiga, amigo, apellido, bolígrafo, carnet de identidad, cuaderno, cumpleaños, estuche, goma, libro, lugar de nacimiento, lápiz, mochila, nombre, regla, sacapuntas
  noun plurals used (P8) [rules]: años [regular], bolígrafos [regular], cuadernos [regular], hojas de papel [compound], libros de texto [compound], libros [regular], lunes [unchanged], lápices [z-ces], martes [unchanged], miércoles [unchanged], países [regular], reglas [regular], sacapuntas [unchanged]

Lesson-level check (content/lessons_1.1-1.6.json): only items, letters and plural rules introduced in the sentence's lesson or before
  lessons: 85 (1.1: 11, 1.2: 13, 1.3: 20, 1.4: 13, 1.5: 13, 1.6: 15); items introduced: 218; plural rules taught: regular, z-ces, unchanged, plural-only, accent-loss, compound
  lessons with new items: 46, average 4.3 counted items, largest 6
  lesson-level failures: 0; lessons above 6 items: 0 (warning); above 8: 0 (failure)
  coverage: every vocabulary, helper, letter and name row in 1.1–1.6 is introduced

Map sections (parts): contiguous lesson ranges of one unit; each opens with a repaso and closes with a check or boss
  1.3a  L1–L11: 11 lessons, 30 counted items, «¿Cómo te llamas?» (Names, numbers 1–20 and age)
  1.3b  L12–L20: 9 lessons, 18 counted items, «Mi carnet de identidad» (Numbers 21–31 and the ID card)

Conjugation lessons (rule: once ≥ 4 forms of a Lemma are introduced; the infinitive counts when it is a row)
  ser       es (1.1 L1, él/ella), soy (1.1 L1, yo), eres (1.1 L3, tú)
            -> 3 forms by 1.6: no conjugation lesson yet
  estar     está (1.2 L6, él/ella)
            -> 1 form by 1.6: no conjugation lesson yet
  llamarse  llamarse (1.2 L10, infinitive), me llamo (1.3 L2, yo), te llamas (1.3 L2, tú), se llama (1.3 L2, él/ella)
            -> eligible from 1.3 L2
  tener     tengo (1.3 L8, yo), tienes (1.3 L8, tú), tiene (1.3 L8, él/ella)
            -> 3 forms by 1.6: no conjugation lesson yet

✓ PASS: 468 of 468 sentences use only approved words, determiners and taught plural rules.
```
`--plurals` also passes: "Every irregular noun plural is listed in content/plurals.json." The prototype's own checker (`prototype/tools/check_vocab.mjs`) passes on the revised lesson 1.1-1.

---

## 11. Songs, chants and Radio Búho podcasts

### 11.1 Why

Things learnt as a sequence (the alphabet, numbers, days, months) suit songs and chants: the tune and the beat hold the order together, and a chant is easy to repeat many times without it feeling like a drill. Two studies support this, with a caveat:

- **Ludke, Ferreira & Overy (2014)**, *Memory & Cognition* 42(1), 41–52: adults learning short Hungarian phrases recalled them better when they had learnt them by **singing** than by speaking. The study also had a rhythmic-speech condition; the clearest benefit was for singing.
- **Wallace (1994)**, *Journal of Experimental Psychology: Learning, Memory, and Cognition* 20(6), 1471–1485: text was recalled better when it was sung to a melody than when it was spoken, but only when the melody was **simple and repeated** across verses; a melody that was hard to learn removed the benefit.

So the plan uses **short, simple, repeated tunes**, and treats sung versions as better than spoken chants where we can make them. Songs are for memorising the sequence; the learn lessons still teach each item explicitly (intro → retrieval), so no student has to rely on the song. Songs are short (under a minute) and every clip has an on-screen transcript.

### 11.2 Where they fit

| Episode | Lesson | Clips inside learn lessons | Later spaced review |
|---|---|---|---|
| **«El alfabeto»** (alphabet chant + spelling call-in) | 1.2 L12 | A1–A2 in 1.2 L9, A3 in 1.2 L10, A4 in 1.2 L11 | 1.2 L13 check, 1.3 L1 repaso; spelling items in every unit check; *¿Cómo se escribe…?* with new words in later units |
| **«Los números»** (counting song 1–31 + age call-in) | 1.3 L15 | N1 in L4, N2 in L5, N3 in L7, N4 in L9, N5 in L13, N6 in L14 | 1.3 L11 (1.3a check, 1–20), 1.3 L12 repaso, 1.3 L20 check, 1.4 L1 repaso, Number Invaders |
| **«La semana y los meses»** (week and month chants) | 1.4 L7 | D1 in L2, D2 in L3, D3 in L4, D4 in L5, D5 in L6 | 1.4 L13 check, 1.5 L1 repaso |
| *Later (not scripted yet)* | 2.1 | Numbers 32–100: «Los números II», same tune as «Los números» | |
| | 2.2 | Family tree chant (*el padre, la madre, el hermano…*) | |
| | 3.2 / 3.4 | Sports and weather chants | |

**How the clips work.** The episode is recorded once and cut into clips (A1, A2, N1…). Each clip only uses items that are taught by the lesson it appears in, so a learn lesson can use its clip before the full episode exists for the student. A `clip` exercise runs: listen once → chant along (karaoke highlight) → listen again with one item blanked → tap or type the missing item. The full episode lesson then puts the families together in order. Every clip line is a sentence in `content/sentences_1.1-1.6.json` (kind `song` or `podcast`, with its `clip` id) and passes the validator at its own lesson.

### 11.3 Scripts

Colombian Spanish throughout: seseo (*cinco, doce, catorce* with /s/), *ll* and *y* as in Bogotá (/ʝ/), *uve* and *ye* as Juan chose. Voices as in the character bible (`spanish_app/buhisimo_characters.md` §5): Buhísimo from the prototype test voices (*buho_profesor* or *buho_abuelo*), Valentina `co_f_teen`, Samuel `co_m_teen`; Matilda and Max are still to choose. Tempo about 90 BPM (a slow version at 70 BPM for the first listen). `|` marks a bar of 4 beats; *¡…!* lines are shouted on the last beat.

**A. «El alfabeto» (1.2 L12)**

Family chants (one bar each, said twice):
```
A1  | A, e, i, o, u.                       |   (las vocales)
A2  | Efe, ele, eme, ene, eñe, ese, erre.  |   then: | Jota, jota, jota. |
A3  | Be, ce, de, ge, pe, te.              |
A4  | Ka, uve, doble ve, equis, ye, zeta. |
```
The whole alphabet in order (A5, sung or chanted twice, the second time with gaps for students):
```
| A, be, ce, de,      | e, efe, ge,          |
| hache, i, jota,     | ka, ele, eme,        |
| ene, eñe, o,        | pe, cu, erre,        |
| ese, te, u,         | uve, doble ve,      |
| equis, ye, zeta.    | ¡El alfabeto!        |
```
If it is sung, any simple, repeated tune works (Wallace 1994). The traditional ABC tune (*Ah! vous dirai-je, maman*, public domain) can carry these lines, and many Colombian children already know an *abecedario* sung to it.

**Podcast outline** (about 3 min 15 s):

| Time | Clip | Content (all lines are in the sentences file) |
|---|---|---|
| 0:00–0:08 | — | Radio Búho jingle (instrumental) |
| 0:08–0:15 | A0 | Buhísimo: *¡Buenas tardes! Soy Buhísimo. ¡El alfabeto!* |
| 0:15–0:35 | A1 | Vowel chant ×2; students echo |
| 0:35–0:58 | A2 | *e*-family chant ×2, then *Jota, jota, jota.* |
| 0:58–1:15 | A3 | *be*-family chant ×2 |
| 1:15–1:35 | A4 | The rare letters ×2 |
| 1:35–2:15 | A5 | Whole alphabet, twice (second time with gaps) |
| 2:15–3:05 | A6 | Call-in: *¡Hola, Buhísimo! Soy de Chile. Ce, hache, i, ele, e.* · *¿Cómo se escribe Colombia? — Ce, o, ele, o, eme, be, i, a.* · Matilda spells Melbourne · Max: *¿Cómo se escribe Max? — ¡Eme, a, equis! ¡Fenomenal!* |
| 3:05–3:15 | A7 | Buhísimo: *¡Muy bien! ¡Fenomenal! ¡Hasta luego!* |

**N. «Los números» (1.3 L15)**

Verses (each verse is also clip N1–N6 inside its learn lesson):
```
N1  | Uno, dos, tres,          | cuatro, cinco: ¡muy bien!          |
N2  | Seis, siete, ocho,       | nueve, diez: ¡fenomenal!           |
N3  | Once, doce, trece,       | catorce, quince: ¡fantástico!      |
N4  | Dieciséis, diecisiete,   | dieciocho, diecinueve, veinte: ¡muy bien! |
N5  | Veintiuno, veintidós,    | veintitrés, veinticuatro, veinticinco: ¡fenomenal! |
N6  | Veintiséis, veintisiete, | veintiocho, veintinueve, treinta… ¡treinta y uno! |
```
Chorus between verses (N9, from L8 on, since it uses *años*): `| ¿Cuántos años tienes? | ¡Doce, doce, doce años! |`
Without P11 the song starts on *uno*. With P11 it opens `| Cero… | uno, dos, tres… |` and Max's countdown ends on *cero*.

**Podcast outline** (about 3 min):

| Time | Clip | Content |
|---|---|---|
| 0:00–0:08 | — | Jingle |
| 0:08–0:15 | N0 | Buhísimo: *¡Hola, hola! Me llamo Buhísimo. ¡Uno, dos, tres!* |
| 0:15–1:45 | N1–N6, N9 | The song: six verses, chorus after verses 2, 4 and 6 |
| 1:45–2:05 | N7 | Max's countdown: *Diez, nueve, ocho… uno… ¡Max!* (he jumps) |
| 2:05–2:45 | N8 | Call-in: *¿Cuántos años tienes, Samuel? — Tengo trece años.* · *¿Cómo te llamas? — Me llamo Valentina. Tengo doce años.* |
| 2:45–2:55 | N10 | *¡Muy bien! Uno, dos, tres… ¡hasta luego!* |

**D. «La semana y los meses» (1.4 L7)**

```
D1  | Lunes, martes,      | miércoles, jueves: ¡la semana!      |
D2  | Viernes, sábado…    | ¡domingo! ¡Fenomenal!                |
D6  | La semana: lunes, martes, miércoles, jueves, viernes, sábado, domingo.   (two bars)
D3  | Enero, febrero,     | marzo, abril… ¡muy bien!             |
D4  | Mayo, junio,        | julio, agosto… ¡fantástico!          |
D5  | Septiembre, octubre,| noviembre, diciembre: ¡el año!       |
D7  | El año: enero … diciembre.   (three bars)
```
**Podcast outline** (about 2 min 30 s): 0:00 jingle · 0:08 D0 *¡Buenos días! Soy Buhísimo. ¿Cómo estás?* · 0:15 D1, D2, D6 (week) · 0:55 D3, D4, D5, D7 (months) · 1:45 D8 call-in (*¡Hola, Buhísimo! Me llamo Valentina. ¡Es sábado! ¡Fantástico!* · *¿Es martes? — No, es miércoles.* · *¿Lunes? Matilda está regular.*) · 2:20 D9 *¡Muy bien! La semana, el mes, el año… ¡hasta luego!*

### 11.4 What the local tooling can do (checked read-only, 18 October; nothing was run)

`~/Documents/video_generation/` has:
- **Speech that is ready now:** `scripts/make_audio.py` synthesises `.conv` scripts line by line with **Qwen3-TTS** (1.7B, voice cloning from a reference clip; the int8 base and VoiceDesign checkpoints are downloaded) or with **Piper** (CPU; Spain, Mexico and Argentina voices, no Colombian one). It already has per-clause pacing, a slow mode, silences and loudness normalisation through ffmpeg. The Colombian reference voices are in `conversations/voices/` (`co_f_adult_bogota`, `co_f_adult_paisa`, `co_m_30`, `co_m_old_profesor`, `co_m_old_abuelo`, `co_f_teen`, `co_m_teen`), and `scripts/voice_tools/lesson_audio.py` made the prototype's recorded clips from them. These are **speech** models: they can say a chant in rhythm but cannot sing a melody.
- **Music and singing: possible in principle, not ready.** The Wan2GP install has model definitions for lyric-to-song models (**ACE-Step v1.5**, **HeartMuLa OSS 3B**, **MiniMax Music 3**) and an instrumental model (**Stable Audio 3**), but **none of their weights are downloaded** (`models/wan2gp-ckpts` holds only Qwen3-TTS, Wan 2.1, Z-Image and helper models). Using them would mean several GB of downloads and GPU runs on the 8 GB laptop card. Nobody has tested whether they pronounce Spanish letter names and numbers accurately or with a Colombian accent; song models often blur or skip words in a list, which is exactly what these songs are. There is also a BS-Roformer stem-separation model, useful only for cleaning up recordings.
- **The realistic option now: chants spoken over a simple beat.** Generate each chant line with Qwen3-TTS in a Colombian voice (the same pipeline as the prototype clips), place the lines on a fixed beat grid (90 BPM) with ffmpeg (`adelay` + `amix`), and add a simple percussion loop made with ffmpeg's own generators (a click or clap from `aevalsrc`/`anoisesrc`) or a royalty-free loop. Clips are cut by the timestamps above. This is deterministic, works offline, and keeps the exact words.
- **Best quality for the sung versions:** Juan (or a Colombian colleague) sings the five-line alphabet tune and the counting song once on a phone, and the same ffmpeg steps add the beat and cut the clips. A test run of ACE-Step on one verse is worth trying later, judged against that.

---

## 12. Open questions

*Closed on 18 October: P7/P8 (approved), whether the infinitive counts (yes), 1.1 L1's size (now 6), and `la lengua` (P2 approved).*

1. **P11 cero, P12 mis/tus, P13 el abecedario** (§9): approve, or leave out?
2. **W: decided.** Juan chose *doble ve* (20 Oct 2026).
3. **Story canon: decided.** Juan approved it on 21 Oct 2026 (§3): birthdays Max 29 de febrero, Valentina 20 de julio, Matilda 15 de junio, Samuel 10 de enero, Buhísimo 7 de agosto (the hardest months on purpose, for exposure); favourite colours Matilda verde, Max rojo, Valentina morado, Samuel azul, Buhísimo marrón. The 1.4 and 1.6 sentences that used the old dates (Samuel 1 May, Matilda 1 March, Buhísimo 1 January) now use these.
4. **1.3 length: decided.** The map shows 1.3 as two sections (20 Oct 2026; Juan approved splitting long units): 1.3a «¿Cómo te llamas?» L1–L11 (names, 1–20, age, ending with a new 1.3a check) and 1.3b «Mi carnet de identidad» L12–L20 (a new repaso, 21–31, the numbers podcast, the ID card, the unit check). The CSV section stays 1.3 (§6). No other unit needs a split: after 1.3, the longest is 1.6 with 15 lessons, inside the 11–15 range.
5. **Songs: decided.** Sung, in the style of the counting-song samples (ACE-Step), which Juan likes (20 Oct 2026). Juan doesn't need to record tunes.
6. **Number range in later generators:** dates up to 31 use *veintiuno*/*treinta y uno* safely. *Uno*, *veintiuno* and *treinta y uno* are not determiners in the validator (before a noun they become *un/veintiún/treinta y un*), so counted-object generators stay at 2–30, as in v1.
7. **CSV issues: fixed 20 Oct 2026.** `los rasgos físicos` now has its accent, and the duplicate 2.2 `la edad` row is deleted (it stays in 1.3, the earlier section).
