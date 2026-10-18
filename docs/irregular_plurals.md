# Irregular and tricky plurals in the master CSV (all units)

*Compiled 18 October 2026 for Juan. Source data: `content/plurals.json` (the validator reads it). Scope: every noun and adjective in `spanish_app/vocabulary_database.csv` and `helper_words.csv`, units 1.1–4.1, checked with `node tools/check_vocab.mjs --plurals`, which lists the plural of every CSV noun and fails if an irregular one is missing from `plurals.json`. Adjectives are not typed in the CSV, so they were checked by hand.*

**Rule of the app:** a plural may only be used once its rule has been taught (a short rule card plus practice). In 1.1–1.6 the rules are taught in three 1.6 lessons; the validator rejects any plural used before its rule card. For later units the "first taught" column says where the card (or a review card) belongs.

| Rule card | Lesson | What it says |
|---|---|---|
| `plural:regular` | **1.6 L6** *Los libros, las reglas* | vowel → + s (*el libro → los libros*); consonant → + es (*la capital → las capitales*, *azul → azules*). Watch-outs: *el país → los países* keeps the í; one-syllable *el mes → los meses*. Adjectives agree: *dos bolígrafos rojos*. |
| `plural:z-ces` | **1.6 L7** *Dos lápices, dos sacapuntas* | *el lápiz → los lápices* (z → c before e). |
| `plural:unchanged` | **1.6 L7** | unstressed final -s: no change. *el sacapuntas → los sacapuntas*, *el cumpleaños → los cumpleaños*, *el lunes → los lunes* (= on Mondays). |
| `plural:plural-only` | **1.6 L7** | *las tijeras* is always plural, even for one pair. |
| `plural:accent-loss` | **1.6 L8** *Bolígrafos marrones, hojas de papel* | *marrón → marrones*: the stress stays put, so the written accent is no longer needed. |
| `plural:compound` | **1.6 L8** | only the first noun changes: *la hoja de papel → las hojas de papel*, *el libro de texto → los libros de texto*, *el lugar de nacimiento → los lugares de nacimiento*. |

Rules first taught after 1.6 (from `ruleTaughtAt`): mixed-masculine 2.2, accent-gain 2.5, -y → -yes 2.5, loanword 3.5, el-feminine 3.7. The z → ces, accent-loss, unchanged, plural-only and compound words of later units get a short **review card** in their own unit.

## The list

### z → ces (`z-ces`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| el lápiz | lápices | 1.6 | 1.6 L7 (rule card: z → ces) | Keeps its written accent: lápiz → lápices. |
| el pez | peces | 2.3 | 2.3 (review card; z → ces first taught 1.6 L7) |  |
| feroz | feroces | 2.3 | 2.3 (review card) |  |
| la nariz | narices | 2.4 | 2.4 (review card) |  |
| el/la actor/actriz | actores / actrices | 3.5 | 3.5 (review card: actriz → actrices; actor → actores is regular) |  |

### Losing a written accent (`accent-loss`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| marrón | marrones | 1.5 | 1.6 L8 (rule card: -ón → -ones, accent drops) | Also a 2.4 CSV row (ojos marrones). |
| el ratón | ratones | 2.3 | 2.3 (review card; first taught 1.6 L8) |  |
| la selección nacional | selecciones nacionales | 3.2 | 3.2 (review card) | Both words change: nacional → nacionales. |
| la canción | canciones | 3.5 | 3.5 (review card) |  |

### Gaining a written accent (`accent-gain`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| joven | jóvenes | 2.5 | 2.5 (NEW rule card: -en → -enes gains an accent) | The only accent-gain word in the CSV (el examen, la imagen are not in it). |

### Unchanged (unstressed final -s) (`unchanged`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| el cumpleaños | cumpleaños | 1.4 | 1.6 L7 (rule card: unstressed -s, no change) | los cumpleaños |
| lunes | lunes | 1.4 | 1.6 L7 (rule card; los lunes = on Mondays) | No article in the CSV; the plural is read after los/a number. |
| martes | martes | 1.4 | 1.6 L7 (rule card; los lunes = on Mondays) | No article in the CSV; the plural is read after los/a number. |
| miércoles | miércoles | 1.4 | 1.6 L7 (rule card; los lunes = on Mondays) | No article in the CSV; the plural is read after los/a number. |
| jueves | jueves | 1.4 | 1.6 L7 (rule card; los lunes = on Mondays) | No article in the CSV; the plural is read after los/a number. |
| viernes | viernes | 1.4 | 1.6 L7 (rule card; los lunes = on Mondays) | No article in the CSV; the plural is read after los/a number. |
| el sacapuntas | sacapuntas | 1.6 | 1.6 L7 (rule card) | los sacapuntas |
| 'me gusta' | 'me gusta' | 3.6 | 3.6 (note: muchos 'me gusta'; a borrowed phrase used as a noun never changes) |  |

### Compound nouns: only the first noun changes (`compound`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| el lugar de nacimiento | lugares de nacimiento | 1.3 | 1.6 L8 (rule card: only the first noun changes) |  |
| el carnet de identidad | carnets de identidad | 1.3 | 3.5 (with the loanword card); the plural is not used in 1.3–1.6 | carnet is a French loanword: + s, not + es. The RAE prefers the spelling carné / carnés, which is also the usual spelling in Colombia (carné estudiantil). |
| el libro de texto | libros de texto | 1.6 | 1.6 L8 (rule card) | Not *libros de textos. |
| la hoja de papel | hojas de papel | 1.6 | 1.6 L8 (rule card) | Not *hojas de papeles. |
| el número de teléfono | números de teléfono | 2.1 | 2.1 (review card) |  |

### Always plural (`plural-only`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| las tijeras | tijeras | 1.6 | 1.6 L7 (rule card: always plural, even for one pair) | unas tijeras / sus tijeras; la tijera is rare. |
| las gafas | gafas | 2.4 | 2.4 (review card) |  |
| las afueras | afueras | 4.1 | 4.1 (review card) |  |

### Masculine plural for a mixed group (`mixed-masculine`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| los padres | padres | 2.2 | 2.2 (NEW rule card: a masculine plural covers a mixed group) | los padres = the parents (mother and father), not only the males. |
| los abuelos | abuelos | 2.2 | 2.2 (NEW rule card: a masculine plural covers a mixed group) | los abuelos = grandparents, not only the males. |
| los hermanos | hermanos | 2.2 | 2.2 (NEW rule card: a masculine plural covers a mixed group) | los hermanos = brothers and sisters, not only the males. |
| los gemelos | gemelos | 2.2 | 2.2 (NEW rule card: a masculine plural covers a mixed group) | los gemelos = twins, not only the males. |

### -y → -yes (`y-yes`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| el rey | reyes | 2.5 | 2.5 (NEW rule card: -y → -yes) | los reyes = the king and queen (mixed group too). |

### Loanwords: + s (`loanword`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| el carnet de identidad | carnets de identidad | 1.3 | 3.5 (with the loanword card); the plural is not used in 1.3–1.6 | carnet is a French loanword: + s, not + es. The RAE prefers the spelling carné / carnés, which is also the usual spelling in Colombia (carné estudiantil). |
| el/la fan | fans | 3.5 | 3.5 (NEW rule card: loanwords add -s) | The RAE recommends fanes; fans is what students will see and hear. |

### el in the singular, las in the plural (`el-feminine`)

| Word | Plural | First appears | Plural first taught | Note |
|---|---|---|---|---|
| el águila | águilas | 3.7 | 3.7 (NEW card: feminine noun with el in the singular only) | el águila → las águilas, un águila → unas águilas. A 3.7 helper word. |

### Other cases and watch-outs (regular, but worth a sentence on the card)

| Word | Plural | First appears | Where to mention it | Note |
|---|---|---|---|---|
| el país | países | 1.1 | 1.6 L6 (watch-out on the regular card: países keeps the í) | Regular (+ es), but the accent stays because í and a are separate syllables. |
| el/la amigo/a | amigos / amigas | 1.3 | 1.6 L6 | los amigos can mean a mixed group (mixed-masculine card in 2.2). |
| el mes | meses | 1.4 | 1.6 L6 (watch-out: one-syllable -s words add -es, unlike lunes) |  |
| sábado | sábados | 1.4 | 1.6 L6 |  |
| domingo | domingos | 1.4 | 1.6 L6 |  |
| naranja | naranjas | 1.5 | 1.6 L8 (note: colour nouns used as adjectives) | Both bolígrafos naranja and bolígrafos naranjas are correct; teach naranja (no change) as the safe choice. |
| rosa | rosas | 1.5 | 1.6 L8 (note, as naranja) | In Colombia rosado/a (rosados) is the everyday word for pink; rosa is the Claro word. |
| el hijo único | hijos únicos | 2.2 | 2.2 (both words change) |  |
| la hija única | hijas únicas | 2.2 | 2.2 (both words change) |  |
| fácil | fáciles | 3.3 | 3.3 (watch-out: the accent stays) |  |
| difícil | difíciles | 3.3 | 3.3 (watch-out: the accent stays) |  |
| la red social | redes sociales | 3.6 | 3.6 (both words change) |  |

## Not in the CSV (Juan's examples, for reference)

*el examen → los exámenes* and *la imagen → las imágenes* (accent gain), *francés → franceses*, *inglés → ingleses*, *alemán → alemanes* and *el autobús → los autobuses* (accent loss), *la voz → las voces* (z → ces). None of these is a CSV row yet; `--plurals` will flag them when they are added.

## Found while scanning

- **`los rasgos fisicos` (2.5)** is missing its accent: it should be *los rasgos físicos*. Not changed (not one of the approved fixes); Juan to confirm.
- **`la edad`** is a row in both 1.3 and 2.2. Harmless (the validator uses the earlier section).
- **2.4 already has plural adjective rows** *azules, marrones, verdes* (eye colours). The 1.6 L6/L8 cards teach these plurals two units earlier, so the 2.4 rows become review.
- **`el carnet de identidad`**: the RAE prefers *carné* (plural *carnés*), and *carné* is the usual spelling in Colombia. The CSV follows Claro. The plural is not used anywhere in 1.1–1.6.
- **Colour nouns as adjectives**: *naranja* and *rosa* may stay unchanged (*dos cuadernos naranja*) or add -s. The plan uses the unchanged form. In Colombia, *rosado/a* is the everyday word for pink.
