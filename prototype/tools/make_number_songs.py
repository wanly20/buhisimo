#!/usr/bin/env python3
"""Unit 1.3 number songs for the prototype (CPU only: ffmpeg; nothing is generated).

Copies Juan's approved number songs from video_generation/music/songs/ into prototype/audio/songs/
with the prototype's export filter (the one alphabet_songs.py uses: short fades, loudnorm -16 LUFS,
mono 24 kHz, MP3 64 kb/s, no metadata) and writes:
  * audio/songs/<song>.mp3     the whole song (the `song` step plays it: letras or con números)
  * audio/songs/songs.json     per song: the version, length, the lines shown (a chorus that repeats
                               the verse is shown once) and every sung word as [line, word, start, end] from
                               the song's aligned JSON (align_lyrics.py), so a repeated block lights
                               up the same lines again
  * audio/songs/N1.mp3 … N6.mp3 the short clips inside the learn lessons (content plan §11.2), cut
                               from the approved songs, with their word timings merged into
                               audio/songs/clips.json (the 1.2 `clip` step reads it; A0–A7 are kept)

Run from the buhisimo repo:  python3 prototype/tools/make_number_songs.py
Then:                        node prototype/tools/check_vocab.mjs --todo   (TODO_songs.json "exists")

«Dos, doce, veintidós» is still being chosen (round 2). Its lessons (1.3 L13 letras, L14 con números)
already use the id below; set the chosen version here (one line) and run this again.
"""
from __future__ import annotations
import json, subprocess
from pathlib import Path

SONGS_DIR = Path.home() / "Documents/video_generation/music/songs"
PROTO = Path(__file__).resolve().parent.parent
OUT = PROTO / "audio/songs"

# song id in the app -> approved version (number_songs_plan.md, Juan 21 Oct 2026)
SONGS: dict[str, str | None] = {
    "numeros_1_10": "numeros_1_10_s1",            # Del uno al diez (Version A)        1.3 L5 / L6
    "numeros_10_20": "numeros_10_20_s2",          # Del diez al veinte                 1.3 L9 / L10
    "numeros_uno_once": "numeros_uno_once_s5",    # Uno, once · Dos, doce              1.3 L10 / L10
    "numeros_dos_doce_veintidos": "numeros_dos_doce_veintidos_v8h_s1",  # Dos, doce, veintidós (Juan, 26 Oct) 1.3 L13 / L14
    "numeros_20_31": "numeros_20_31_s2",          # Del veinte al treinta y uno        1.3 L14 / L15
    "numeros_uno_diez_once": "numeros_uno_diez_once_s1",  # Uno, diez, once… treinta y uno 1.3 L15 / L15
}
# Clips inside the learn lessons: (song id, 0-based line indexes of its aligned JSON)
CLIPS = {
    "N1": ("numeros_1_10", [0, 1]),    # Uno, dos, tres, / cuatro, cinco: ¡muy bien!            1.3 L4
    "N2": ("numeros_1_10", [2, 3]),    # Seis, siete, ocho, / nueve, diez: ¡fenomenal!          1.3 L5
    "N3": ("numeros_10_20", [0, 1]),   # Diez, once, doce, / trece, catorce, quince: ¡muy bien! 1.3 L7
    "N4": ("numeros_10_20", [2, 3]),   # Dieciséis, diecisiete, / dieciocho, … veinte          1.3 L9
    "N5": ("numeros_20_31", [0, 1]),   # Veinte, veintiuno, veintidós, / … veinticinco         1.3 L13
    "N6": ("numeros_20_31", [2, 3]),   # Veintiséis, veintisiete, veintiocho, / … treinta y uno 1.3 L14
}
EXPORT = ["-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k", "-map_metadata", "-1"]
LOUD = "loudnorm=I=-16:TP=-1.5:LRA=11"


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *map(str, a)], check=True)


def aligned(version):
    return json.loads((SONGS_DIR / f"{version}.json").read_text())


def whole_song(sid, version):
    d = aligned(version)
    src = SONGS_DIR / f"{version}.mp3"
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                               capture_output=True, text=True, check=True).stdout.strip())
    ff("-i", src, "-af", f"afade=t=in:d=0.15,afade=t=out:st={dur - 0.8:.2f}:d=0.8,{LOUD}", *EXPORT, OUT / f"{sid}.mp3")
    # A song whose chorus is its verse again shows the verse once (the same lines light up twice);
    # any other song shows every line in the order it is sung.
    texts = [ln["text"].strip() for ln in d["lines"]]
    half = len(texts) // 2
    repeat = len(texts) % 2 == 0 and texts[:half] == texts[half:]
    lines = texts[:half] if repeat else texts
    words = []
    for i, ln in enumerate(d["lines"]):
        text = texts[i]
        li = i % half if repeat else i
        if len(ln["words"]) != len(text.split()):
            raise SystemExit(f"{version}: line {text!r} has {len(ln['words'])} aligned words for {len(text.split())} written")
        words += [[li, wi, round(w["start"], 2), round(w["end"], 2)] for wi, w in enumerate(ln["words"])]
    return dict(version=version, file=f"audio/songs/{sid}.mp3", seconds=round(dur, 2), lines=lines, words=words)


def clip(name, sid, idx):
    d = aligned(SONGS[sid])["lines"]
    a = max(0, d[idx[0]]["start"] - 0.35)
    b = d[idx[-1]]["end"] + 0.6
    ff("-i", SONGS_DIR / f"{SONGS[sid]}.mp3", "-ss", f"{a:.2f}", "-to", f"{b:.2f}", "-af",
       f"afade=t=in:d=0.15,afade=t=out:st={b - a - 0.5:.2f}:d=0.5,{LOUD}", *EXPORT, OUT / f"{name}.mp3")
    words = [[round(w["start"] - a, 2), round(w["end"] - a, 2)] for i in idx for w in d[i]["words"]]
    return dict(src=SONGS[sid], seconds=round(b - a, 2), lines=[d[i]["text"] for i in idx], words=words)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    songs = {}
    for sid, version in SONGS.items():
        if not version:
            print(f"{sid}: not chosen yet (the app shows 'Song coming soon')")
            continue
        songs[sid] = whole_song(sid, version)
        print(f"{sid}: {version} -> {songs[sid]['file']} ({songs[sid]['seconds']} s, {len(songs[sid]['lines'])} lines, {len(songs[sid]['words'])} words)")
    (OUT / "songs.json").write_text(json.dumps(dict(
        note="Unit 1.3 number songs (Juan's approved versions, number_songs_plan.md): the whole song, the lines shown "
             "(a chorus that repeats the verse is shown once) and every sung word as [line, word, start s, end s]. Made by "
             "prototype/tools/make_number_songs.py from the aligned JSON of each version (CPU only).",
        songs=songs), ensure_ascii=False, indent=1) + "\n")
    cj = OUT / "clips.json"
    data = json.loads(cj.read_text()) if cj.exists() else {"note": "", "clips": {}}
    for name, (sid, idx) in CLIPS.items():
        data["clips"][name] = clip(name, sid, idx)
        print(f"{name}: {data['clips'][name]['lines']} ({data['clips'][name]['seconds']} s)")
    if "N1–N6" not in data.get("note", ""):
        data["note"] = (data.get("note", "") + " N1–N6 (Unit 1.3) are cut from the approved number songs by "
                        "prototype/tools/make_number_songs.py.").strip()
    cj.write_text(json.dumps(data, indent=1) + "\n")  # same format as alphabet_songs.py


if __name__ == "__main__":
    main()
