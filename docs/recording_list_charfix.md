## 4. Character-fix re-records (17 Nov 2026)

*Added by hand after the character-consistency review (Juan approved the fixes on 17 Nov 2026). `--todo` regenerates this file and will drop this section; the neutral-voice clips below are also in `prototype/audio/TODO_lines.json`, but the character-voice ones for Units 1.1 and 1.2 are not (the generator lists a character's own voice only from 1.3), so record from this table. Until a clip exists the step shows the text ("Audio soon") and plays nothing: the old clips are no longer reachable from these steps (new text, or pinned to the right voice in a manifest `speakers` map).*

**Needed (the line on screen has no recording at all):**

| # | Line (exact text) | Step | Voices to record | Target file (slug) |
|---|---|---|---|---|
| 1 | «¿Eres de Perú? — No, soy de Australia.» | 1.1-4 `pick-peru` (Max) | `max`, `maria_bogota`, `maria_paisa`, `raul` | `eres-de-peru-no-soy-de-australia-b3d538.mp3` |
| 2 | «No, soy de Australia.» | 1.1-5 `tiles-rd` (Matilda) | `matilda`, `maria_bogota`, `maria_paisa`, `raul` | `no-soy-de-australia-bfb4da.mp3` |
| 3 | «Buenas tardes. ¿De dónde eres? — Soy de Australia.» | 1.2-5 `model-2` (Max) | `max`, `maria_bogota`, `maria_paisa`, `raul` | `buenas-tardes-de-donde-eres-soy-de-austr-19212b.mp3` |
| 4 | «¡Hola! ¿Cómo te llamas?» | 1.3-2 `intro-como-te-llamas` example (Matilda) | `matilda`, `maria_bogota`, `maria_paisa`, `raul` | `hola-como-te-llamas-90be0d.mp3` |
| 5 | «Buenos días, Matilda. ¿Cómo estás? — Regular.» | 1.3-1 `r-pick-regular`, `r-speak` (Buhísimo) | `buho_profesor`, `buho_abuelo`, `maria_bogota`, `maria_paisa`, `raul` | `buenos-dias-matilda-como-estas-regular-d97476.mp3` |
| 6 | «¿Te llamas Samuel?» | 1.3-2 `yn-samuel` (now Max asks) | `max`, `maria_bogota`, `maria_paisa`, `raul` | `te-llamas-samuel-514a05.mp3` |
| 7 | «¿Tienes doce años?» | 1.3-8 `yn-doce` (now Matilda asks) | `matilda`, `maria_bogota`, `maria_paisa`, `raul` | `tienes-doce-anos-3dc43b.mp3` |
| 8 | «Es el uno de noviembre.» | 1.4-11 `say-1-nov` (neutral) | `maria_bogota`, `maria_paisa`, `raul` | `es-el-uno-de-noviembre-7ea8b7.mp3` (also in section 1, L11) |

Files go in `audio/<voice>/<slug>`; register them in the manifest of that batch (`manifest-l2.json` for 1.1–1.3, `manifest-u14.json` for 1.4).

**Nice to have (a stand-in voice plays now; these steps changed speaker):**

| # | Line (exact text) | Step | Plays now | Own voice to record |
|---|---|---|---|---|
| 9 | «Ella es de Argentina.» | 1.1-2 `tiles-argentina`, 1.2-1 `r-tiles-argentina` (now Buhísimo) | María | `buho_profesor`, `buho_abuelo` |
| 10 | «Él es de Estados Unidos.» | 1.1-3 `tiles-eeuu` (now Matilda) | María | `matilda` |
| 11 | «Buenas tardes, Matilda. ¿Cómo estás?» | 1.3-1 `r-tiles-tardes` (now Buhísimo) | María | `buho_profesor`, `buho_abuelo` |
| 12 | «Ella se llama Valentina.» | 1.3-3 `tiles-valentina` (now Samuel) | Raúl | `samuel` (once his voice is chosen) |

**First-person cast lines pinned to their speaker (`speakers` in `manifest-l2.json` / `manifest-u14.json`).** They now play in the speaker's own voice or a stand-in of the same gender (Matilda, Valentina → María; Max, Samuel → Raúl; Buhísimo → his own clips). The ones with no own-voice clip yet, to record when the voices are set up: Matilda «Me llamo Matilda.», «Me llamo Matilda. Soy de Melbourne.»; Max «Me llamo Max.», «Me llamo Max. Soy de Australia.», «Me llamo Max. Tengo trece años.», «¿Cómo te llamas? — Me llamo Max.»; Buhísimo «Me llamo Buhísimo.»; and every Valentina and Samuel line once their voices are chosen.
