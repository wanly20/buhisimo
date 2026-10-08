# Buhísimo

Spanish practice app for Year 7 students learning with *Claro 1*: a home-practice companion to explicit teaching in class.

**Live:** https://wanly20.github.io/buhisimo/

## Layout
- `prototype/` is the design prototype (one complete lesson) used to agree the look and feel before the full app is built.
- `data/` holds the vocabulary data. **Don't edit these here.** The masters live in `spanish_app/` and are copied in by `spanish_app/sync_vocab.py`:
  - `vocabulary_database.csv` is the textbook vocabulary (Spanish, English, Section, Source, capitals).
  - `helper_words.csv` lists approved helper words and verb forms, with the section where each is introduced.
  - `names.csv` lists approved names and places, with the section where each is introduced and a "Say as" pronunciation spelling.

## Vocabulary rules
1. Only words from these three files may appear, and only once they have been introduced.
2. A word needed earlier belongs to the earlier section.
