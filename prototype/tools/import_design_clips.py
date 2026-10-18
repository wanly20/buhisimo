#!/usr/bin/env python3
"""Reuse the voice-design test lines that the cast voices already recorded.

The voice-design page (spanish_app/design/voices/) cloned ten 1.1 test lines with the
SAME reference wavs and the SAME mode (Qwen3-TTS Base, x-vector) as lesson_audio.py,
so they are production-quality clips. Nothing is generated here: this only copies the
MP3s (no GPU, no model) into prototype/audio/<voice>/<slug>.mp3 and writes
audio/manifest-extra.json, which js/speech.js merges with audio/manifest.json
(that one is written by lesson_audio.py and must not be edited by hand).

    python3 prototype/tools/import_design_clips.py
"""
import hashlib, json, re, shutil, unicodedata
from pathlib import Path

PROTO = Path(__file__).resolve().parent.parent
LINES = Path.home() / "Documents/spanish/spanish_app/design/voices/lines"

# design voice -> prototype voice (same reference wav, checked by md5)
VOICES = {"maria_bogota_warm": "maria_bogota", "maria_paisa_warm": "maria_paisa",
          "raul_co_m_30": "raul", "buho_profesor": "buho_profesor"}
# design line number -> the text key used in the lessons
LINES_USED = {"02": "Soy de Colombia.", "03": "Max es de Australia.", "04": "Matilda es de Melbourne.",
              "06": "el país", "07": "la capital", "09": "el mundo", "10": "el mapa"}


def slug(text: str) -> str:  # same as lesson_audio.py
    a = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    a = re.sub(r"[^a-z0-9]+", "-", a).strip("-")[:40]
    return f"{a}-{hashlib.sha1(text.encode()).hexdigest()[:6]}"


def main():
    main_manifest = json.loads((PROTO / "audio/manifest.json").read_text())["clips"]
    clips = {}
    for n, text in LINES_USED.items():
        for dv, pv in VOICES.items():
            if main_manifest.get(text, {}).get(pv):
                continue  # already recorded by lesson_audio.py
            src = LINES / f"{dv}__xvec__{n}.mp3"
            if not src.exists():
                continue
            rel = f"audio/{pv}/{slug(text)}.mp3"
            (PROTO / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, PROTO / rel)
            clips.setdefault(text, {})[pv] = rel
    out = {"note": "Clips copied from spanish_app/design/voices/lines (the voice-design test, x-vector clones of the "
                   "same reference wavs as manifest.json). Written by tools/import_design_clips.py.",
           "clips": clips}
    (PROTO / "audio/manifest-extra.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(sum(len(v) for v in clips.values()), "clips for", len(clips), "texts")


if __name__ == "__main__":
    main()
