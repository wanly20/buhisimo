# Buhísimo v2: content plan for units 1.1–1.6

*Drafted 9 October 2026 for Juan. This is a content and data plan, not UI. Companion files:*

| File | What it is |
|---|---|
| `content/lessons_1.1-1.6.json` | The lesson order and the items each lesson introduces (machine-readable version of this plan) |
| `content/sentences_1.1-1.6.json` | Every Spanish sentence or phrase in this plan (376), tagged with the unit and lesson where it is first used |
| `content/proposals_1.1-1.6.json` | The proposals in §9, as data, so the validator can show what each one unlocks. **Nothing here is in the CSVs.** |
| `tools/check_vocab.mjs` | The unit-aware validator (§10) |

---

## 0. At a glance

| Unit | Lessons | Learn lessons | New items (CSV + helper + name) | Sentences | Ready today | Wait on a proposal |
|---|---|---|---|---|---|---|
| 1.1 El español global | 10 | 6 | 24 + 8 + 7 | 62 | 58 | 4 |
| 1.2 ¿Qué tal? | 10 | 5 | 16 + 3 + 0 | 51 | 48 | 3 |
| 1.3 Mi carnet de identidad | 17 | 10 | 39 + 6 + 3 | 77 | 62 | 15 |
| 1.4 ¡…y que cumplas muchos más! | 12 | 7 | 27 + 1 + 0 | 49 | 42 | 7 |
| 1.5 Mis preferencias | 13 | 7 | 26 + 1 + 0 | 69 | 58 | 11 |
| 1.6 ¡Tod@s a clase! | 12 | 5 | 12 + 11 + 0 | 68 | 45 | 23 |
| **Total** | **74** | **40** | **184** | **376** | **313** | **63** |

(`llamarse` is a 1.2 CSV row; it is taught in 1.3 next to its forms, so it is counted in 1.3.)

**The validator passes**: every sentence uses only words from the three CSVs at or before its unit, and also at or before its lesson. The 63 "waiting" sentences are tagged with the proposal they need (§9) and are reported separately. If a proposal is rejected, its sentences are dropped and every lesson still has approved content. The exception is 1.6, where `hay`, `un/una` and `mi/su/sus` cannot be used at all without P7 (see §9).

---

## 1. How to read this plan

**Lesson types** (v2 plan §4.3): *learn* (4–7 new items), *practice* (no new items), *conjugation* (practice of one verb's forms), *repaso* (unit warm-up: spaced retrieval of the previous units plus the prerequisites this unit relies on), *story* (Duolingo-Stories style dialogue with checks between lines), *listen* (Radio Búho), *speak*, *game*, *check* (section check, no hearts) and *boss* (Unit 1, cumulative).

**Sources:** C = `vocabulary_database.csv`, H = `helper_words.csv`, N = `names.csv`. Names are recognised rather than recalled, so they don't count towards the 4–7 limit.

**Exercise codes** (prototype types first, then v2 plan §6.2):
`intro` worked example (picture, audio, Spanish, English, one example; no question) · `pick` Spanish → meaning · `listen` hear → choose · `tiles` word bank · `type` English → type Spanish · `match` pairs · `speak` shadow and self-rate · `gap` gap fill with choices · `sort` categorise · `dict` dictation · `tf` true/false against a picture · `maptap`, `request`, `invaders` (games). **Speaking and listening are in every learn lesson by default**; students can snooze them, and the lesson still completes.

**A standard learn lesson** runs: for each new item, `intro` → immediate `pick` or `listen` → the same item again after two others. Then `match`/`tiles` on the set, 1–2 `type`, 1 `speak`, and 20–30% review items (due items from the scheduler, plus the review threads named in each lesson). Only the lesson-specific mix is listed below.

**Example sentences** are a selection; the JSON has them all. `[P6]` marks a sentence that needs proposal P6.

---

## 2. Why this sequence

1. **Textbook order, one new idea at a time.** Units follow Claro (1.1 → 1.6), and every word appears at or after its CSV section. Inside a unit, each learn lesson carries one idea: a question and its answer (*¿De dónde eres? / Soy de…*), a person contrast (*soy / eres / es*), a word family (numbers 11–15), or a connector set.
2. **Chunks first, grammar second.** Questions are taught as whole chunks (*¿De dónde eres?*, *¿Cuántos años tienes?*). The grammar inside them is unpacked later: 1.1 L3 turns *eres* from the chunk into "you are", and 1.3 L8 turns *tienes* into "you have".
3. **Interleaving across units.** Numbers (1.3) are split into six small lessons placed *between* the name, age and ID lessons, so students switch between them. Then 1.4 dates reuse them constantly. Countries (1.1) come back in greetings (1.2), ID cards (1.3) and opinions (1.5). Each unit opens with a *repaso* of the units before it.
4. **Worked examples before practice.** Every pattern is introduced by a character saying it (intro card) before students produce it. Patterns fade from model → gap → tiles → type in the practice lessons (1.1 L4, 1.2 L5, 1.3 L10, 1.5 L10).
5. **Story frame in every unit.** Matilda and Max are the learners. Each story gives the unit's words a reason to exist, and every story line passes the validator at its own lesson.
6. **Stay inside the approved words.** Where a natural sentence needs a word that isn't approved yet (*años*, *¿Cómo te llamas?*, standalone *el* for dates), the plan uses a natural alternative that works today (*¿Cuántos años tienes? — Doce.*, *¿Y tú?*, *el primero de mayo*). It also writes the better sentence, tagged with the proposal that unlocks it.
7. **Kindness.** Jokes come from a character's own trait (Max jumps too far, Matilda is sleepy in the mornings, Buhísimo fusses about accents). Negative opinions (*odio*, *detesto*, *no me gusta nada*) are only about days or colours, and never about the colours of the cast (Matilda is grey, Max and Buhísimo are brown), countries or people.

---

## 3. Story arc for Unit 1

| Unit | What happens | Cast |
|---|---|---|
| 1.1 | Matilda and Max arrive in Salento. Buhísimo meets them in the plaza with a map of the Spanish-speaking world; Max tries to jump to every country. | Buhísimo, Matilda, Max |
| 1.2 | The first morning in the Cocora fog. Matilda (a koala) is "regular" until her nap; Max is "¡fenomenal!" from 5 a.m., then flat by the afternoon. | + callers on Radio Búho |
| 1.3 | They meet Valentina and Samuel Restrepo, learn ages, and make ID cards. Max loses his *carnet de identidad* jumping in the valley; Buhísimo finds it. | + Valentina, Samuel |
| 1.4 | Birthdays. Valentina's is on Colombia's Independence Day; Max is a leap-day kangaroo (29 February) and has only had three real birthdays. | same |
| 1.5 | Choosing a Willys jeep to drive up to Cocora: everyone has a different favourite colour, and they take the jeep with all of them. | same |
| 1.6 | First day at Valentina and Samuel's school. Max has no backpack: everything is in his pouch, except the scissors. The Unit 1 boss is Buhísimo's welcome poster. | same |

**Story canon proposed here (change freely):** birthdays are Samuel 1 May, Matilda 1 March, Valentina 20 July, Max 29 February and Buhísimo 1 January. Favourite colours are Matilda green (eucalyptus), Max red, Valentina purple, Samuel blue and Buhísimo brown (he's a little proud of himself). I chose Samuel's and Matilda's birthdays because *el primero / el uno* work today, before standalone *el* is approved.

---

## 4. Unit 1.1 · El español global (10 lessons)

**Unit goal:** say where you and others are from; name Spanish-speaking countries and places; describe a place as famous, historic or Spanish-speaking.
**Not available yet:** greetings (1.2), *y* (1.5), *un/una* (1.6), *sí/no* (proposal P1). The unit is built entirely from *ser + de + place*.

### 1.1 L1 · learn · ¿De dónde eres? *(the prototype lesson, `prototype/lesson-1-1.js`)*
- **Goal:** ask and answer "Where are you from?"; *él es* for a third person.
- **New:** ¿De dónde eres? (C) · soy (H) · de (H) · él (H) · es (H) · España (C) · Colombia (C) · el país (C) · *names:* Buhísimo, Matilda, Max, Australia (N). That's 8 items, one over the limit: the validator flags it. *Soy de* and *él es* are taught as two chunks, so the working load is 6. Keep the prototype as it is, or move *España* to L2.
- **Review:** none (first lesson).
- **Exercises:** as built in the prototype: intro ×5, pick, listen, tiles, type ×2, match, speak.
- **Examples:** ¿De dónde eres? · Soy de Australia. · Él es de Colombia. · Colombia es el país de Buhísimo. · Max es de Australia.
- **Story:** In Salento's plaza, Buhísimo meets two visitors from Melbourne and asks where they're from.

### 1.1 L2 · learn · ¿De dónde es?
- **Goal:** ask and say where someone else is from; *ella* vs *él*.
- **New:** ella (H) · ¿De dónde es? (C) · Argentina, Chile, Perú (C) · *names:* Melbourne, Salento (N).
- **Review:** L1 chunks; *él/ella* contrast card (picture of Max vs Matilda).
- **Exercises:** listen → pick the person (él/ella); tiles "Ella es de ___"; maptap preview with 3 countries.
- **Examples:** ¿De dónde es Matilda? · Ella es de Melbourne. · Él es de Salento. · ¿De dónde es? — Es de Perú.
- **Story:** Tourists cross the plaza; Max asks Buhísimo where each one is from.

### 1.1 L3 · learn · Tú eres…
- **Goal:** the first person contrast, *soy / eres / es*, in one table (worked example); more countries.
- **New:** tú (H) · eres (H) · Cuba, Estados Unidos, República Dominicana (C). *If P1 is approved:* sí, no.
- **Review:** *¿De dónde eres?* (the *eres* inside it is now unpacked), L2 countries.
- **Exercises:** intro table soy/eres/es → `sort` sentences by person → gap "___ de Cuba" (soy/eres/es) → speak.
- **Examples:** Tú eres de Australia. · Soy Buhísimo. Tú eres Matilda. · Él es de Estados Unidos. · [P1] ¿Eres de España? — No, soy de Australia.
- **Story:** Buhísimo plays a guessing game: "Tú eres… Matilda!"

### 1.1 L4 · practice · Soy, eres, es
- **Goal:** fluent choice of *soy/eres/es* with every country so far (ser has 3 forms, so this is person-contrast practice, not a conjugation lesson; see §7).
- **New:** none. **Review:** L1–L3, interleaved.
- **Exercises:** faded pattern: model → gap → tiles → type the whole sentence; listen with person as distractor; speak a 2-line exchange.
- **Examples:** Soy de Chile. Eres de Perú. Es de Cuba. · ¿De dónde eres, Max? — Soy de Melbourne. · Matilda es de Australia. Buhísimo es de Colombia.

### 1.1 L5 · learn · El mundo hispanohablante
- **Goal:** talk about the Spanish-speaking world on a map.
- **New:** el mundo, el mapa, hispanohablante, Guinea Ecuatorial (C) · la lengua (H). *If P2:* el español.
- **Review:** countries L1–L3.
- **Exercises:** `tf` against a map ("Chile es hispanohablante" ✓); `sort` hispanohablante vs not (Australia); type *hispanohablante* (lower case in Spanish, a classic English-speaker error).
- **Examples:** Chile es hispanohablante. · El mapa: el mundo hispanohablante. · El mapa es de Max. · [P2] La lengua de Guinea Ecuatorial es el español.
- **Story:** Max unfolds his map. Buhísimo shows that Spanish is spoken on four continents, including Equatorial Guinea in Africa.
- **Note:** *la lengua* has no natural sentence without *el español* (P2), so without P2 it is taught as a word card only.

### 1.1 L6 · learn · Islas y destinos
- **Goal:** Spanish-speaking islands; *el destino*.
- **New:** la Isla de Pascua, las Islas Canarias, las Islas Baleares, las Islas Filipinas, el destino (C).
- **Review:** *¿De dónde es?*, él/ella, L5 map words.
- **Exercises:** maptap islands; listen → pick island; tiles "El destino es ___".
- **Examples:** El destino es la Isla de Pascua. · La Isla de Pascua es de Chile. · Ella es de las Islas Canarias. · ¿El destino? ¡Las Islas Filipinas!
- **Story:** Buhísimo spins the globe; wherever Max's finger lands is "el destino".
- **Culture note (English):** Spanish was an official language in the Philippines for centuries, and many Filipino words come from Spanish. Avoid saying the Philippines *is* Spanish-speaking today.

### 1.1 L7 · learn · Famoso e histórico
- **Goal:** describe places; the first agreement contrast (*famoso/famosa*).
- **New:** famoso/a, histórico/a, el monumento, la capital (C) · *name:* Cocora (N).
- **Review:** islands, countries, *es*.
- **Exercises:** intro pair "El monumento es histórico / La capital es histórica" (worked example of agreement); `sort` -o/-a by noun; gap with both forms.
- **Examples:** El monumento es famoso. · La capital es histórica. · Cocora es famoso. · La Isla de Pascua es famosa. · ¡Max es famoso!
- **Story:** In the plaza everyone wants a photo with the kangaroo: "¡Max es famoso!"

### 1.1 L8 · story · Max y el mapa
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

### 1.1 L9 · game · Map tap
- Hear "Ella es de Guinea Ecuatorial" → tap the country. Later rounds add islands and *soy/eres/es*. Sentences come from a closed list (subject × country, all validated). **Examples:** Él es de Guinea Ecuatorial. · Soy de las Islas Canarias.

### 1.1 L10 · check · Passport control
- 12–15 items: every 1.1 item at least once, mostly type and listen; one maptap round; production: type 3 sentences from English. The boss finale: Buhísimo stamps passports by asking three tourists *¿De dónde eres?* (listen, then type their answer).
- **Production examples:** Soy de Australia. ¿De dónde eres? · Ella es de Chile. Él es de Cuba. · Cuba es hispanohablante. · La capital es famosa.

---

## 5. Unit 1.2 · ¿Qué tal? (10 lessons)

**Unit goal:** greet and say goodbye at the right time of day; ask how someone is and answer; say how someone else is (*está*).
**Note:** `llamarse` is a 1.2 row, but its forms (*me llamo…*) are 1.3 helpers, so it is taught in 1.3 L2 alongside them.

### 1.2 L1 · repaso · ¿De dónde eres?
- 10–12 items: 1.1 countries, *soy/eres/es*, *¿De dónde…?*. **Example:** ¿De dónde es Max? — Es de Australia.

### 1.2 L2 · learn · ¡Hola!
- **Goal:** greetings and goodbyes; time of day.
- **New:** ¡hola!, Buenos días, Buenas tardes, ¡Adiós!, ¡Hasta luego! (C).
- **Review:** *Soy* + name/country (1.1). Students can now open every exchange properly.
- **Exercises:** picture of the sun position → pick greeting; listen → pick; speak each greeting (shadow).
- **Examples:** ¡Hola, Matilda! · Buenos días, Buhísimo. · Buenas tardes, Max. · ¡Hasta luego, Matilda! · ¡Hola! Soy Max. Soy de Australia.
- **Story:** Morning in the plaza; by the afternoon the fog rolls in and it's *buenas tardes*. Culture note: *buenos días* until lunchtime.

### 1.2 L3 · learn · ¿Qué tal?
- **New:** ¿Qué tal?, bien, mal, regular, ¿Y tú? (C).
- **Review:** L2 greetings.
- **Exercises:** emoji scale → pick word; `sort` good/so-so/bad; tiles "¿Qué tal? — ___. ¿Y tú?"; speak a 2-line exchange.
- **Examples:** ¿Qué tal? — Bien. ¿Y tú? · ¡Hola, Max! ¿Qué tal? · Regular. ¿Y tú? · ¿Qué tal, Matilda? — Mal.
- **Story:** Matilda, still half asleep in her ruana: "Regular."

### 1.2 L4 · learn · ¿Cómo estás?
- **New:** ¿Cómo estás?, fatal, fenomenal, fantástico/a (C) · muy, gracias (H).
- **Review:** L3 feelings (*bien/mal/regular*), greetings.
- **Exercises:** `sort` on a 5-point scale (fatal → fenomenal); gap "Muy ___, gracias"; listen; speak.
- **Examples:** ¿Cómo estás? — Muy bien, gracias. · Buenos días, Matilda. ¿Cómo estás? · ¡Fenomenal! ¿Y tú? · ¡Fantástico, gracias!
- **Story:** Max answers everything with "¡Fenomenal!".

### 1.2 L5 · practice · Hola, ¿qué tal?
- **Review:** L2–L4 plus 1.1 (*¿De dónde eres?*). Whole mini-dialogues, faded: model → gap → tiles → speak both roles.
- **Examples:** ¡Hola! ¿Qué tal? — Muy bien, gracias. ¿Y tú? · Buenas tardes. ¿De dónde eres? — Soy de Perú. · ¡Hasta luego, Buhísimo! — ¡Adiós, Max!

### 1.2 L6 · learn · Max está fenomenal
- **Goal:** say how someone else is: *está* (one new item, a lot of retrieval). Contrast card: *es de* (where from) vs *está* (how they feel).
- **New:** está (H).
- **Review:** feelings L3–L4, *es* (1.1).
- **Exercises:** gap *es/está*; pick the picture (Max bouncing vs Matilda yawning); type.
- **Examples:** Max está fenomenal. · Matilda está regular. · ¿Qué tal Buhísimo? — Está muy bien. · Max es de Australia. Está fenomenal.

### 1.2 L7 · learn · El alfabeto
- **Goal:** the alphabet and spelling names (Buhísimo's favourite lesson: accents and ñ).
- **New:** el alfabeto, escribir (C). *If P10:* letter names, ¿Cómo se escribe?
- **Review:** names and countries from 1.1 as spelling targets.
- **Exercises:** `dict` (hear a known word, type it); accent fix-up (*Peru → Perú*, *Espana → España*, *Buhisimo → Buhísimo*). With P10: hear letters → type the name.
- **Examples:** [P10] ¿Cómo se escribe Max? — Eme, a, equis. · [P10] ¿Cómo se escribe Salento? — Ese, a, ele, e, ene, te, o.
- **Without P10** this lesson is dictation and accent work on known words, with no new sentences.

### 1.2 L8 · story · Buenos días, Salento
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

### 1.2 L9 · listen · Radio Búho: ¿Qué tal?
- Buhísimo takes four calls from four countries. Students fill a grid (country × face) on the first listen, then listen again with the transcript.
- **Script:** ¡Buenas tardes! Soy Buhísimo. ¿Qué tal? · ¡Hola, Buhísimo! Soy de Argentina. Muy bien, gracias. · ¡Hola! Soy de Cuba. Regular. · Buenas tardes. Soy de España. ¡Fenomenal! · ¡Hola! Soy de Perú. Fatal. · ¡Hasta luego, Argentina, Cuba, España, Perú!

### 1.2 L10 · check · The plaza
- Every 1.2 item; one listening grid; production: build and speak a greeting exchange for a given time of day and mood.
- **Examples:** ¡Hola! ¿Cómo estás? — Muy bien, gracias. ¿Y tú? · Buenas tardes, Max. ¿Qué tal? · Matilda está muy bien.

---

## 6. Unit 1.3 · Mi carnet de identidad (17 lessons)

**Unit goal:** give and ask names; numbers 1–31; ask and say age; fill in an ID card.
**Shape:** this is the largest unit (48 items). Numbers are split into six lessons and interleaved with name, age and ID lessons, so no two number lessons are back to back except 21–25 and 26–31. If the map feels long, show it as two halves: "1.3a ¿Cómo te llamas?" (L1–L10) and "1.3b El carnet" (L11–L17).

### 1.3 L1 · repaso · ¿Qué tal?
- 1.2 greetings and feelings plus 1.1 countries. **Example:** Buenas tardes, Matilda. ¿Cómo estás? — Regular.

### 1.3 L2 · learn · Me llamo Valentina
- **Goal:** say your name and ask someone else's.
- **New:** llamarse (C, 1.2 row) · me llamo, te llamas, se llama (H) · *names:* Valentina, Samuel (N). *If P3:* ¿Cómo te llamas?, ¿Cómo se llama?
- **Review:** greetings, *¿Y tú?*, *soy de*.
- **Exercises:** intro by each speaker; listen → pick the person; tiles "Me llamo ___. ¿Y tú?"; speak.
- **Examples:** ¡Hola! Me llamo Valentina. · Me llamo Samuel. ¿Y tú? · Ella se llama Matilda. · ¿Te llamas Max? · [P3] ¿Cómo te llamas? — Me llamo Valentina.
- **Story:** The Restrepo house. Valentina (12) and Samuel (13) meet the visitors. Without P3 the question is *¿Y tú?*, which is natural after "Me llamo…".

### 1.3 L3 · conjugation · llamarse
- **Goal:** the first conjugation lesson. Llamarse has 4 forms (infinitive + me llamo / te llamas / se llama), so it meets the ≥4 rule (§7). Table → choose the form for the person → type. Then the cross-verb pattern with *soy/eres/es*.
- **Examples:** Me llamo Matilda. Soy de Melbourne. · Te llamas Samuel. Eres de Colombia. · Se llama Buhísimo. Es de Salento. · Me llamo, te llamas, se llama.

### 1.3 L4 · learn · Uno, dos, tres
- **New:** uno, dos, tres, cuatro, cinco (C). **Review:** names (L2–L3).
- **Exercises:** listen → tap digit; type the word from the digit; count-down chant (speak).
- **Examples:** Uno, dos, tres, cuatro, cinco. · Tres, dos, uno… ¡Max! · Cinco, cuatro, tres, dos, uno.
- **Story:** Max counts down before each jump.

### 1.3 L5 · learn · Seis… diez
- **New:** seis, siete, ocho, nueve, diez (C). **Review:** 1–5, greetings.
- **Examples:** Seis, siete, ocho, nueve, diez. · Ocho, nueve, diez… ¡fenomenal! · Dos, cuatro, seis, ocho, diez.
- **Story:** Samuel counts the wax palms (in English: "palm" isn't a 1.x word); Max counts his jumps.

### 1.3 L6 · game · Number Invaders 1–10
- Hear a number → shoot the digit (audio cue mode); calm mode available. **Example:** Uno, tres, cinco, siete, nueve.

### 1.3 L7 · learn · Once… quince
- **New:** once, doce, trece, catorce, quince (C). These are irregular, so each gets its own intro. **Review:** 1–10, names.
- **Examples:** Once, doce, trece, catorce, quince. · Diez, once, doce… ¡trece!

### 1.3 L8 · learn · ¿Cuántos años tienes?
- **Goal:** ask and answer age; *tener* = to have.
- **New:** ¿Cuántos años tienes? (C) · tengo, tienes, tiene (H). *If P4:* años.
- **Review:** 11–15 (the cast's ages are 12 and 13), names.
- **Worked example:** "Tengo el mapa" = I have the map → "In Spanish you *have* years: Tengo doce años."
- **Examples:** ¿Cuántos años tienes? — Doce. · ¿Tienes el mapa, Max? · Valentina tiene el mapa. · [P4] Tengo doce años. · [P4] Samuel tiene trece años.
- **Without P4** the age answer is the number alone (*— Doce.*), which is natural in speech. *Tengo/tiene* are practised with "have" (*tengo el mapa*).

### 1.3 L9 · learn · Dieciséis… veinte
- **New:** dieciséis, diecisiete, dieciocho, diecinueve, veinte (C). Teach the pattern explicitly: *diez y seis → dieciséis* (shown as a picture, not as a sentence).
- **Review:** 11–15, age question.
- **Examples:** Dieciséis, diecisiete, dieciocho, diecinueve, veinte. · Quince, dieciséis, diecisiete.

### 1.3 L10 · practice · Tengo, tienes, tiene
- **Goal:** person contrast for *tener*, alongside *llamarse* and *ser* (tener has only 3 forms, so this is not a full conjugation lesson). Numbers 1–20 interleaved.
- **Examples:** Tengo, tienes, tiene. · ¿Cuántos años tienes, Valentina? — Doce. · [P4] Me llamo Matilda. Tengo doce años. · [P4] Max tiene trece años. Es de Melbourne.

### 1.3 L11 · learn · Veintiuno… veinticinco
- **New:** veintiuno, veintidós, veintitrés, veinticuatro, veinticinco (C). Pattern: *veinti-* + unit; watch the accents on *-dós, -trés*.
- **Examples:** Veintiuno, veintidós, veintitrés, veinticuatro, veinticinco. · Veinte, veintiuno, veintidós…

### 1.3 L12 · learn · Veintiséis… treinta y uno
- **New:** veintiséis, veintisiete, veintiocho, veintinueve, treinta, treinta y uno (C). This is 6 items, but one pattern. Note: *treinta y uno* is three words, unlike *veintiuno*.
- **Examples:** Veintiséis, veintisiete, veintiocho, veintinueve, treinta. · Veintinueve, treinta, treinta y uno.

### 1.3 L13 · learn · El carnet de identidad
- **New:** el carnet de identidad, el nombre, el apellido (C) · *name:* Restrepo (N). *If P5 and P7:* mi, and nouns without their article (ID-card labels).
- **Review:** *me llamo*, *tengo*, numbers.
- **Exercises:** read an ID card → pick; tiles; type *el apellido*. With P7: fill the card's labels.
- **Examples:** El carnet de identidad de Samuel. · El nombre es Valentina. El apellido es Restrepo. · Tengo el carnet de identidad. · [P7] Nombre: Samuel. Apellido: Restrepo. · [P5+P7] Mi nombre es Samuel. Mi apellido es Restrepo.

### 1.3 L14 · learn · La amiga de Matilda
- **New:** la edad, el/la amigo/a, el lugar de nascimiento (C, spelt as in the CSV; see P9).
- **Review:** ID words (L13), ages.
- **Exercises:** match amigo/amiga to pictures (agreement); fill a full ID card for a character.
- **Examples:** Valentina es la amiga de Matilda. · Samuel es el amigo de Max. · ¿La edad? Doce. · [P9] El lugar de nacimiento de Samuel es Salento. · [P5+P7] Mi amiga se llama Valentina.
- **Note:** until P9 is approved, `el lugar de nascimiento` can only be shown misspelt. I would not show it to students until it's fixed.

### 1.3 L15 · story · El carnet de Max
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

### 1.3 L16 · listen · Radio Búho: tres carnets
- Three teens call in; students fill three ID cards (name, surname, from, age) on the first listen.
- **Script (works today):** ¡Buenas tardes! Me llamo Buhísimo. ¿Y tú? · Me llamo Valentina Restrepo. Soy de Salento. · ¿Y tú? ¿Cuántos años tienes? · Me llamo Samuel Restrepo. Trece. · Me llamo Matilda. Soy de Australia. Doce.
- **With P4** the answers become full sentences: Me llamo Valentina Restrepo. Tengo doce años. Soy de Salento.

### 1.3 L17 · check · The ID card office
- Number dictation (1–31), an ID card listening task, and production: introduce yourself as a character (name, where from, age).
- **Examples:** Me llamo Samuel. Soy de Colombia. · ¿Cuántos años tienes? — Trece. · Samuel es el amigo de Matilda. · [P4] Me llamo Max. Tengo trece años. Soy de Melbourne.

---

## 7. Verbs and conjugation lessons (all of Unit 1)

The validator counts the forms of each Lemma in `helper_words.csv`, plus the infinitive when it is itself a CSV row:

| Verb | Forms in 1.1–1.6 | ≥ 4? | Where it is practised |
|---|---|---|---|
| ser | soy, eres, es (1.1) | No (3) | 1.1 L3 worked example; 1.1 L4 person-contrast practice; 1.6 L9 cross-verb review |
| llamarse | llamarse (1.2), me llamo, te llamas, se llama (1.3) | **Yes, from 1.3 L2** | **1.3 L3 conjugation lesson** |
| tener | tengo, tienes, tiene (1.3) | No (3) | 1.3 L8 intro; 1.3 L10 person-contrast practice; 1.6 L9 |
| estar | está (1.2), plus *estás* inside ¿Cómo estás? | No | 1.2 L6 *es* vs *está* contrast |

So under the ≥4 rule, **llamarse is the only verb with a conjugation lesson in Unit 1**. Ser and tener get yo/tú/él person-contrast practice inside practice lessons. **1.6 L9** is a cross-verb review of the shared pattern (*soy / me llamo / tengo* for yo, *eres / te llamas / tienes* for tú, *es / se llama / tiene* for él/ella). That pattern is a useful explicit-teaching point before Unit 2. Whether the infinitive should count is an open question (§11).

---

## 8. Units 1.4–1.6

### Unit 1.4 · ¡…y que cumplas muchos más! (12 lessons)

**Unit goal:** days, months, the date and birthdays. Numbers 1–31 come back in every lesson.
**Constraint:** without standalone *el* (P6), the only dates that work today are *el primero de…* and *el uno de…* (both CSV rows). All other dates are tagged [P6]. Days and months are lower case in Spanish; the `capitals` column marks them as case-sensitive, so typing "Lunes" mid-sentence should be "nearly".

#### 1.4 L1 · repaso · Los números
- Numbers 1–31 (audio → digit, digit → type), names and age. **Example:** Uno, cinco, diez, quince, veinte, veinticinco, treinta.

#### 1.4 L2 · learn · La semana
- **New:** la semana, lunes, martes, miércoles, jueves (C). **Review:** numbers, feelings.
- **Exercises:** order the days (tiles); listen → tap the calendar; type with the lower-case rule.
- **Examples:** Lunes, martes, miércoles, jueves. · Es lunes. · Es jueves. ¡Fenomenal! · La semana: lunes, martes, miércoles, jueves…

#### 1.4 L3 · learn · ¡Sábado!
- **New:** viernes, sábado, domingo (C): 3 items, to finish the week; heavy review of L2.
- **Examples:** Viernes, sábado, domingo. · Es sábado. ¡Fantástico! · Es domingo. Matilda está muy bien. · Es viernes. ¿Qué tal, Samuel?

#### 1.4 L4 · learn · Enero… abril
- **New:** el mes, enero, febrero, marzo, abril (C). **Review:** days.
- **Examples:** Enero, febrero, marzo, abril. · Es enero. · ¿El mes? Febrero.

#### 1.4 L5 · learn · Mayo… agosto
- **New:** mayo, junio, julio, agosto (C). **Review:** L4 months, days.
- **Examples:** Mayo, junio, julio, agosto. · Es julio. Buhísimo está fenomenal. · ¿Junio? ¡Fantástico!
- **Culture note (in English):** Colombia has no four seasons, while July is winter in Melbourne and Chile. Weather words come in 3.4, so the note stays in English.

#### 1.4 L6 · learn · Septiembre… diciembre
- **New:** septiembre, octubre, noviembre, diciembre, el año (C).
- **Examples:** Septiembre, octubre, noviembre, diciembre. · El año: enero, febrero, marzo… · Es diciembre. ¡Fenomenal!

#### 1.4 L7 · game · Calendar tap
- Hear a day or month → tap it on a calendar; later rounds use the full date (after L8). **Examples:** Es miércoles. · Es octubre.

#### 1.4 L8 · learn · ¿Cuándo es tu cumpleaños?
- **New:** ¿Cuándo es tu cumpleaños?, el cumpleaños, el primero, el uno (C) · tu (H). *If P6:* el.
- **Review:** months, numbers, names.
- **Worked example:** "*el* + number + *de* + month". *El primero* and *el uno* both mean "the first"; in Colombia people say *el primero*, in Spain often *el uno*. Samuel says one and Matilda the other.
- **Examples:** ¿Cuándo es tu cumpleaños? — Es el primero de junio. · El cumpleaños de Samuel es el primero de mayo. · El cumpleaños de Matilda es el uno de marzo. · [P6] El cumpleaños de Valentina es el veinte de julio. · [P5+P7] Mi cumpleaños es el primero de mayo.

#### 1.4 L9 · learn · La fecha
- **New:** la fecha (C). 1 item, then a date workout: day + date. With P6 this is where all 31 × 12 dates open up (a generated list, validated).
- **Examples:** La fecha es el uno de abril. · La fecha: lunes, el primero de octubre. · [P6] Es martes, el doce de marzo. · [P6] La fecha es el treinta y uno de diciembre.

#### 1.4 L10 · speak · Di la fecha
- Shadow 4 dates, then prompted production from a calendar picture.
- **Examples:** Es viernes, el primero de julio. · ¿Cuándo es tu cumpleaños? — Es el uno de noviembre. · [P6] Es el quince de septiembre.

#### 1.4 L11 · story · El cumpleaños de Max
Checks after lines 3, 7 and 10. Every line works today: "Veinte de julio" and "Veintinueve de febrero" are natural exclamations without *el*.
```
V:  ¿Cuándo es tu cumpleaños, Matilda?
M:  Es el uno de marzo. ¿Y tú, Valentina?
V:  Julio. ¡Veinte de julio!
    [check] Why is Valentina's birthday special? (it's Colombia's national day: fireworks!)
S:  ¿Y tú, Max? ¿Cuándo es tu cumpleaños?
X:  Febrero. Veintinueve de febrero.
S:  ¿Veintinueve de febrero? ¿Cuántos años tienes, Max?
X:  Trece. ¿El cumpleaños? ¡Tres!
    [check] Why does Max say "¡Tres!"? (29 February only comes every four years: he's a leap-day kangaroo)
B:  ¡Max es fantástico!
V:  La fecha: domingo, el uno de marzo. ¡El cumpleaños de Matilda!
M:  ¡Fenomenal! ¡Gracias!
    [check] What will they celebrate on Sunday 1 March? (Matilda's birthday, and Max celebrates on the same day in non-leap years)
```

#### 1.4 L12 · check · The party calendar
- Every 1.4 item; date dictation; production: say and type birthdays from a calendar.
- **Examples:** ¿Cuándo es tu cumpleaños? — Es el primero de agosto. · Es sábado, el uno de mayo. · [P6] Es jueves, el veintidós de abril.

### Unit 1.5 · Mis preferencias (13 lessons)

**Unit goal:** colours with agreement; likes and dislikes; join opinions with connectors.
**Constraint:** opinions about colours (*Me encanta el azul*) need standalone *el*, a 1.6 helper. Today's 1.5 sentences attach opinions to places, days and things that already include their article (*Me gusta Salento*, *¿Lunes? No me gusta nada*), and use colours as adjectives (*El mapa es azul*). Colour opinions are tagged [P6]. If P6 is rejected, they move to 1.6 L2, where they're already used (*Me gusta el rojo, pero prefiero el azul*).

#### 1.5 L1 · repaso · El calendario
- Days, months and dates from 1.4; numbers. **Example:** Es domingo, el primero de junio.

#### 1.5 L2 · learn · Rojo, azul, verde
- **New:** rojo/a, azul, amarillo/a, verde, negro/a, blanco/a (C).
- **Review:** 1.1 nouns (*el mapa, el monumento, la capital*) as things to colour.
- **Worked example:** El monumento es blanco / La capital es blanca. Agreement is shown, not just told.
- **Exercises:** colour swatch → pick; `sort` -o/-a/invariable; gap with agreement.
- **Examples:** El mapa es azul. · El monumento es blanco. · La capital es blanca. · Cocora es verde. · ¿Rojo? ¡Fenomenal!

#### 1.5 L3 · learn · Gris, marrón, morado
- **New:** gris, marrón, morado/a, naranja, rosa (C). **Review:** L2 colours.
- **Examples:** Matilda es gris. · Max es marrón. · El monumento es gris. · El carnet de identidad de Max es naranja. · ¿Morado? ¡Fantástico!

#### 1.5 L4 · learn · Mi color favorito es…
- **New:** claro/a, oscuro/a, mi color favorito es… (C).
- **Examples:** Mi color favorito es azul. · Max es marrón claro. · Buhísimo es marrón oscuro. · Mi color favorito es verde oscuro.

#### 1.5 L5 · game · Colour match
- Picture → colour phrase with agreement (Request engine). **Examples:** El mapa es amarillo. · La capital es roja. · El carnet de identidad es azul claro.

#### 1.5 L6 · learn · Me gusta, me encanta
- **New:** me gusta (mucho), no me gusta (nada), me encanta (C) · mucho/a (H).
- **Review:** places (1.1), days (1.4).
- **Exercises:** `sort` on a 5-point scale (no me gusta nada → me encanta); listen → pick the face; speak.
- **Examples:** Me gusta Salento. · Me gusta mucho Cocora. · Me encanta Colombia. · ¿Lunes? No me gusta nada. · [P6] Me encanta el verde.

#### 1.5 L7 · learn · Prefiero, odio, detesto
- **New:** prefiero, odio, detesto (C).
- **Examples:** Prefiero Cocora. · ¿Chile? Prefiero Perú. · [P6] Odio el blanco. · [P6] Detesto el naranja.
- **Note:** without P6, *odio* and *detesto* have no kind, natural sentence in 1.5. The plan never hates a country or a person, so they get word cards plus English-context examples until 1.6.

#### 1.5 L8 · learn · y, o, pero
- **New:** y, o, pero (C). **Review:** opinions, colours.
- **Examples:** ¿Rojo o azul? — Azul. · Max es marrón y Matilda es gris. · Me gusta Chile, pero prefiero Perú. · [P6] Me encanta el azul, pero no me gusta nada el naranja.
- **Guardrail (Appendix C):** *y → e* before an *i-* sound and *o → u* before an *o-* sound. Nothing in Unit 1 triggers it (*histórico* and *Isla* never follow *y*); the generators should block it anyway.

#### 1.5 L9 · learn · También, además, sin embargo
- **New:** también, además, sin embargo (C).
- **Examples:** También me gusta Cuba. · Me encanta Salento. Además, me gusta mucho Cocora. · Me gusta Melbourne. Sin embargo, prefiero Salento.

#### 1.5 L10 · practice · Me encanta…, pero…
- Pattern *opinion + thing + connector + opinion + thing*, faded model → gap → tiles → type.
- **Examples:** Me gusta mucho España, pero prefiero Colombia. · [P6] Me gusta mucho el rojo. Además, me encanta el amarillo.

#### 1.5 L11 · story · Un jeep de colores
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

#### 1.5 L12 · listen · Radio Búho: colores favoritos
- A colour poll. Grid: person × colour.
- **Script:** ¡Buenas tardes! Soy Buhísimo. Mi color favorito es marrón. · ¿Y tú, Valentina? · Mi color favorito es morado. ¡Me encanta! · ¿Y tú, Samuel? · Mi color favorito es azul. ¡Azul claro! · Mi color favorito es verde. ¡Verde oscuro! · ¿Y Max? · ¡Mi color favorito es rojo! Rojo, amarillo, azul, verde…

#### 1.5 L13 · check · Paint the jeep
- Every 1.5 item; one listening grid; production: 2 opinion sentences with a connector.
- **Examples:** Mi color favorito es morado. · Me gusta mucho Salento, pero prefiero Cocora. · Max es marrón claro y Matilda es gris. · [P6] Me encanta el rojo. Sin embargo, prefiero el verde.

### Unit 1.6 · ¡Tod@s a clase! (12 lessons, including the Unit 1 boss)

**Unit goal:** school objects; articles and gender; *hay*; possessives; recombining all of Unit 1.
**Constraint:** *hay*, *un/una* and *mi/tu/su/sus* are always followed by a noun **without** its article (*un libro, mi mochila*). Under the current rules, a CSV row like `el libro` only allows *el libro*, so every sentence using them is tagged [P7]. With P7 approved, 1.6 is exactly the v1 consolidation unit. Without it, those helpers can only be taught as word cards.

#### 1.6 L1 · repaso · Colores y opiniones
- Colours, opinions and connectors (1.5), plus dates. **Example:** ¿Rojo o verde? — Rojo. ¡Me encanta!

#### 1.6 L2 · learn · El libro, la regla
- **Goal:** masculine and feminine nouns; *el/la* as words.
- **New:** el, la (H) · el libro, el cuaderno, la regla, la goma (C).
- **Review:** colours with agreement.
- **Exercises:** `sort` el/la; pick the picture; gap *el/la*; type with the article (required at stage 3).
- **Examples:** El libro es azul. · La regla es amarilla. · El cuaderno de Valentina es morado. · Me gusta el rojo, pero prefiero el azul. · ¿El cuaderno? Prefiero el libro.

#### 1.6 L3 · learn · El lápiz, el estuche
- **New:** el bolígrafo, el lápiz, el estuche, el sacapuntas (C) · la mochila (H).
- **Examples:** El bolígrafo es rojo. · El estuche de Matilda es verde. · El sacapuntas es gris. · La mochila de Samuel es azul. · Me encanta la mochila de Valentina.

#### 1.6 L4 · learn · Los, las
- **New:** los, las (H) · las tijeras, la hoja de papel, el libro de texto (C). *If P8:* plurals.
- **Examples:** Tengo las tijeras. · ¿Tienes la hoja de papel? · El libro de texto es rojo. · [P8] El libro, los libros. La regla, las reglas. · [P8] ¿Tienes los cuadernos?

#### 1.6 L5 · learn · Hay…
- **New:** hay… (C) · un, una, en (H).
- **Examples:** El lápiz está en el estuche. · El libro está en la mochila. · Max está en Salento. · [P7] En la mochila hay un libro. · [P7] Hay una regla en el estuche. · [P8] Hay tres lápices.
- **Today:** *en* works fully with *está* (*está en la mochila*). *Hay* and *un/una* need P7.

#### 1.6 L6 · learn · Mi, tu, su
- **New:** mi, su, sus (H); *tu* is reviewed from 1.4.
- **Examples:** [P7] Mi mochila es verde. · [P7] Tu estuche es morado. · [P7] Su libro está en la mochila. · [P8] Tengo sus cuadernos.

#### 1.6 L7 · game · En mi mochila (Request engine, v1 Mochila)
- Read or hear a request, tap the matching objects. Requests come from slot tables (number × object × colour), never free text. **Examples:** [P7] Un cuaderno. · [P7] Una goma verde. · [P8] Tres lápices rojos. · [P8] Dos reglas amarillas.

#### 1.6 L8 · practice · La mochila mágica (mix engine)
- The v1 templates T1–T5 (rules §8.2), every output listed and validated at build time.
- **Examples:** Prefiero el cuaderno azul. *(T3, works today)* · Me encanta la goma rosa. *(T3)* · [P7+P8] En mi mochila hay tres bolígrafos rojos. *(T1)* · [P7] Hay una regla verde en mi mochila. *(T2)* · [P1+P7] No hay tijeras en mi mochila. *(T4)* · [P1+P7] ¿Hay un sacapuntas en tu estuche? — Sí, hay un sacapuntas. *(T5)*

#### 1.6 L9 · practice · Soy, me llamo, tengo (verb review)
- The cross-verb person pattern before the boss (§7). Table → `sort` by person → type.
- **Examples:** Me llamo Samuel. Soy de Salento. Tengo el libro de texto. · Te llamas Max. Eres de Melbourne. Tienes el mapa. · Se llama Matilda. Es de Australia. Tiene la mochila. · Soy, eres, es. Tengo, tienes, tiene.

#### 1.6 L10 · story · La mochila de Max
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

#### 1.6 L11 · check · First day of school
- Every 1.6 item; a Request-engine round; production: describe what's in a backpack.
- **Examples:** El estuche está en la mochila. · Me gusta mucho el libro de texto. · [P7] Hay un bolígrafo azul en el estuche. · [P7+P8] En la mochila hay dos cuadernos y una regla.

#### 1.6 L12 · boss · Unit 1 boss: Buhísimo's welcome poster
- Cumulative 1.1–1.6, no hearts, about 15 items: listening (a Radio Búho-style self-introduction), typing, and **4–5 production sentences, each combining at least 3 sections**. Students build Matilda's welcome poster: name and greeting (1.2–1.3), where from (1.1), birthday (1.4), favourite colour and opinions (1.5), what's in the backpack (1.6). Pass at ≥80% first-try; otherwise targeted practice of the missed items, then retry.
- **Examples:** ¡Hola! Me llamo Matilda. Soy de Australia. · Ella se llama Matilda. Es de Melbourne, en Australia. · ¿Cuándo es tu cumpleaños, Matilda? — Es domingo, el uno de marzo. · Mi color favorito es verde, pero también me gusta el azul. · El libro está en la mochila de Matilda. · [P4+P7] Tengo doce años. Mi cumpleaños es el uno de marzo. · [P7+P8] En mi mochila hay tres bolígrafos rojos y una regla verde.

---

## 9. Proposals (not in the CSVs; for Juan to approve)

Ranked by what they unlock. "Sentences" is how many plan sentences wait on each one. The data is in `content/proposals_1.1-1.6.json`. To approve one, add the words to the master CSV with the section shown and re-sync. To preview the plan with it approved: `node tools/check_vocab.mjs --approve P6`.

| # | Proposal | Section | Sentences | What it unlocks |
|---|---|---|---|---|
| **P7** | **Rule:** a CSV noun may appear without its article (*libro* from `el libro`) | from each noun's section | 21 | **Essential for 1.6.** *hay*, *un/una* and *mi/tu/su/sus* all need a bare noun (*un libro, mi mochila, Hay una regla…*); without it these approved helpers can't appear in any sentence. Also ID-card labels (*Nombre: Samuel*). Every token is still a CSV word. |
| **P6** | Move **el** from 1.6 to **1.4** | 1.4 | 17 | All dates except the 1st (*el doce de marzo*), and every colour opinion in 1.5 (*Me encanta el azul*, *Odio el blanco*). Without it, *odio/detesto/prefiero* have no natural 1.5 sentence. The v2 plan already said "standalone *el* must be approved by 1.4". |
| **P8** | **Rule:** regular plurals of CSV nouns | from each noun's section | 10 | *tres lápices, dos cuadernos, los libros*: the Mochila game and the mix engine (as in v1). The validator lists each plural used: bolígrafos, cuadernos, libros, lápices, reglas. |
| **P4** | **años** (in *tengo … años*) | 1.3 | 8 | *Tengo doce años* / *Samuel tiene trece años*. The `tengo` helper note says it is "for *tengo doce años*", but *años* itself is only inside *¿Cuántos años tienes?* (and *el año* is 1.4). |
| **P1** | **sí, no** | 1.1 | 6 | Yes/no answers from 1.1 (*¿Eres de España? — No, soy de Australia.*); *No hay…* in 1.6 (mix template T4). |
| **P5** | Move **mi** from 1.6 to **1.3** | 1.3 | 3 | *Mi nombre es…*, *Mi amiga se llama Valentina* (1.3), *Mi cumpleaños es…* (1.4). Needs P7 as well. |
| **P3** | **¿Cómo te llamas?** / **¿Cómo se llama?** | 1.3 | 2 | The standard name question. Today *cómo* only exists inside *¿Cómo estás?*, so the plan uses *¿Y tú?* and *¿Te llamas…?*. |
| **P9** | **CSV fix:** el lugar de *nascimiento* → *nacimiento* | 1.3 | 2 | The correct spelling on the 1.3 ID card. |
| P2 *(nice to have)* | **el español** | 1.1 | 2 | Makes the approved helper *la lengua* usable (*La lengua de Cuba es el español*). It's also in the unit title. |
| P10 *(nice to have)* | **Letter names** (a, be, ce… zeta) + **¿Cómo se escribe?** | 1.2 | 3 | Spelling practice for *el alfabeto / escribir*. Choose *uve* or *ve corta*, and *ye* or *i griega*, to match class. |

**Considered and not proposed:** pulling greetings forward into 1.1 (v1 did this). 1.1 works without them, and 1.2 then opens with a real story beat ("now they can say hello properly"). Also *y* earlier than 1.5, and *en* earlier than 1.6: neither is needed.

---

## 10. Validator: `tools/check_vocab.mjs`

**What it checks.** It loads `data/vocabulary_database.csv`, `helper_words.csv` and `names.csv`. For any unit, it builds the allowed set from every row whose Section is ≤ that unit, compared numerically. Rows with no Section (19 names, e.g. Carlos, Sofía) are never allowed. It generates only these forms: o/a endings (*roja, rojos, rojas*), *el/la amigo/a* → *el amigo, la amiga*, optional parentheses (*me gusta (mucho)* → *me gusta*, *me gusta mucho*), *jugador(a)*/*actor/actriz* pairs, and *hay…* → *hay*. It tokenises case- and punctuation-insensitively, keeps accents (*si* ≠ *sí*), and matches the longest phrase first (up to 8 tokens).

Then:
1. **Unit-level check (the hard rule):** every sentence in `content/sentences_1.1-1.6.json` must tokenise with the words allowed at its unit. A sentence tagged `"needs": ["P#"]` is reported as *pending* if it only fails on that proposal's words. It fails if anything else is missing, and gets a warning if the tag isn't needed.
2. **Lesson-level check:** walking `content/lessons_1.1-1.6.json` in order, a sentence may only use items introduced in its own lesson or earlier. It also fails if a lesson introduces a word *before its CSV section* (the "move it to the earlier section first" rule). It warns on lessons with more than 7 new items, and on any 1.1–1.6 row never introduced (coverage).
3. **Conjugation report:** for each Lemma in `helper_words.csv`, it shows the lesson where the 4th form is introduced.

**Usage**
```
node tools/check_vocab.mjs                        # the check below; exit 1 on failure
node tools/check_vocab.mjs --strict               # pending sentences count as failures
node tools/check_vocab.mjs --approve P6,P7        # preview with proposals approved ("all" for every one)
node tools/check_vocab.mjs --unit 1.3 --text "Tengo doce años."   # one string
node tools/check_vocab.mjs --unit 1.5 --list      # every form allowed at 1.5
```
Spot checks that behave as intended: *¡Hola!* fails at 1.1 ("introduced in 1.2"); *Tengo doce años* fails at 1.3 ("años: proposal P4"); *Me gusta el rojo* fails at 1.5 and passes at 1.6; *amiga* on its own fails at 1.3 while *la amiga* passes; *si* fails ("introduced in 3.4") while *sí* is P1.

**Output of the final run** (9 October 2026):
```
Buhísimo vocabulary check: content/sentences_1.1-1.6.json
  data: 427 vocabulary rows, 45 helper rows, 62 names (19 names have no Section and are never allowed)
  proposals: 10 in content/proposals_1.1-1.6.json; approved for this run: none

Unit-level check: each sentence may use rows whose Section ≤ its unit
  unit  sentences  ready  pending  fail
  1.1          62     58        4     0
  1.2          51     48        3     0
  1.3          77     62       15     0
  1.4          49     42        7     0
  1.5          69     58       11     0
  1.6          68     45       23     0
  all         376    313       63     0
  waiting on proposals (sentences per proposal; one sentence can wait on several):
    P1     6  sí / no
    P2     2  el español
    P3     2  ¿Cómo te llamas? / ¿Cómo se llama?
    P4     8  años (in 'tengo … años')
    P5     3  mi: move from 1.6 to 1.3
    P6    17  el: move from 1.6 to 1.4
    P7    21  Rule: a CSV noun may appear without its article
    P8    10  Rule: regular plurals of CSV nouns
    P9     2  CSV typo: el lugar de nascimiento → nacimiento
    P10    3  Letter names + ¿Cómo se escribe?
  nouns used without article (P7): amiga, apellido, bolígrafo, cuaderno, cumpleaños, edad, estuche, goma, libro, lugar de nacimiento, mochila, nombre, regla, sacapuntas, tijeras
  plural forms used (P8, please check): bolígrafos, cuadernos, libros, lápices, reglas

Lesson-level check (content/lessons_1.1-1.6.json): each sentence may use only items introduced in its lesson or before
WARN  1.1 L1: 8 new items (names not counted), above 7: ¿De dónde eres?, soy, de, él, es, España, Colombia, el país
  lessons: 74 (1.1: 10, 1.2: 10, 1.3: 17, 1.4: 12, 1.5: 13, 1.6: 12); items introduced: 184
  lesson-level failures: 0; lessons above 7 new items: 1
  coverage: every vocabulary, helper and name row in 1.1–1.6 is introduced

Conjugation lessons (rule: once ≥ 4 forms of a Lemma are introduced; the infinitive counts when it is a row)
  ser       es (1.1, él/ella), eres (1.1, tú), soy (1.1, yo)
            -> 3 forms by 1.6: no conjugation lesson yet
  estar     está (1.2, él/ella)
            -> 1 form by 1.6: no conjugation lesson yet
  llamarse  llamarse (1.2, infinitive), me llamo (1.3, yo), te llamas (1.3, tú), se llama (1.3, él/ella)
            -> eligible from 1.3 L2
  tener     tengo (1.3, yo), tienes (1.3, tú), tiene (1.3, él/ella)
            -> 3 forms by 1.6: no conjugation lesson yet

✓ PASS: no unapproved words. 313 of 376 sentences use only approved words today; 63 wait on the proposals listed above (run with --strict to count them as failures).
```

---

## 11. Open questions

1. **P7 and P8 (articles and plurals).** These are rules, not words, and they decide whether 1.6 works. The v1 1.6 unit (approved) already used *un cuaderno*, *mi mochila* and *tres bolígrafos rojos*, so I suspect the answer is yes. I haven't assumed it.
2. **Does the infinitive count towards the ≥4 forms?** If yes, llamarse gets a conjugation lesson in 1.3 (as planned). If no, there are no conjugation lessons in Unit 1 at all, and 1.3 L3 becomes person-contrast practice like ser and tener.
3. **1.1 L1 has 8 new items.** That's the prototype as built. Keep it, or move *España* to L2?
4. **Story canon** (birthdays, favourite colours, Max as a leap-day kangaroo, Matilda's green ruana days): fine to fix as canon?
5. **1.3 length (17 lessons).** Keep one long unit, or split the map into 1.3a/1.3b?
6. **`la lengua`** has no natural sentence in Unit 1 without *el español* (P2). Approve P2, or keep *la lengua* as a word card only?
7. **Number range in later generators:** dates up to 31 use *veintiuno*/*treinta y uno* safely. Avoid *un/uno* apocope in counted nouns (*veintiún libros*) by keeping counted-object generators to 2–9, as in v1.
