# Buhísimo

Spanish practice app for Year 7 students learning with *Claro 1*: a home-practice companion to explicit teaching in class.

**Live:** https://wanly20.github.io/buhisimo/

## Layout
- `prototype/` is the design prototype used to agree the look and feel before the full app is built: all 11 lessons of Unit 1.1, all 13 of Unit 1.2 «¿Qué tal?» (greetings, feelings, the alphabet and spelling; `docs/build_plan_1.2.md`) and all 20 of Unit 1.3 «Mi carnet de identidad» (names, numbers 0–31 with the number songs, age, the ID card; `docs/build_plan_1.3.md`), Review (spaced repetition), Radio Búho and offline install. Lines without a recording yet are listed in `prototype/audio/TODO_lines.json`, song clips in `prototype/audio/TODO_songs.json`.
  - Lessons unlock one after the other. **Teacher override:** open `prototype/?unlock=all` to open every lesson (and show the teacher settings); `?unlock=off` locks them again. Details: `docs/content_plan_1.1-1.6.md`, decisions of 20 October.
- `data/` holds the vocabulary data. **Don't edit these here.** The masters live in `spanish_app/` and are copied in by `spanish_app/sync_vocab.py`:
  - `vocabulary_database.csv` is the textbook vocabulary (Spanish, English, Section, Source, capitals).
  - `helper_words.csv` lists approved helper words and verb forms, with the section where each is introduced.
  - `names.csv` lists approved names and places, with the section where each is introduced and a "Say as" pronunciation spelling.

## Vocabulary rules
1. Only words from these three files may appear, and only once they have been introduced.
2. A word needed earlier belongs to the earlier section.
