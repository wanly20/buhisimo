#!/usr/bin/env python3
"""Record prototype/audio/TODO_lines.json with video_generation's lesson_audio.py pipeline
(Qwen3-TTS Base x-vector clone via Wan2GP, same reference wavs, settings and MP3 export filter).
Writes the takes to ~/.cache/buhisimo_l2_audio and the clips + audio/manifest-l2.json here.

Run from ~/Documents/video_generation (GPU stages: ask Juan first, one GPU user at a time):
  python3 <this> plan      # TODO_lines.json -> clips.json + jobs.json
  python3 <this> render    # GPU, headless: render missing takes
  python3 <this> check     # CPU Whisper turbo (music/align_venv) on every take (whisper_cpu.py)
  python3 <this> report    # clips with no matching take
  python3 <this> retake    # queue two new seeds for each mismatching clip, then render + check again
  python3 <this> export    # best takes -> audio/<voice>/<slug>.mp3 + audio/manifest-l2.json
"""
import json, subprocess, sys, os, re, unicodedata
from pathlib import Path
sys.path.insert(0, str(Path.home() / "Documents/video_generation/scripts/voice_tools"))
import lesson_audio as LA

WORK = Path.home() / ".cache/buhisimo_l2_audio"
PROTO = LA.PROTO
SEEDS = [12345, 777, 4242, 9001, 31337, 2024]
LA.WORK = WORK
LA.SEEDS = SEEDS

def clips(): return json.loads((WORK / "clips.json").read_text())

def plan():
    todo = json.loads((PROTO / "audio/TODO_lines.json").read_text())["lines"]
    WORK.mkdir(parents=True, exist_ok=True)
    c = [dict(text=l["text"], tts=l["tts"], voice=l["voice"], slug=l["slug"]) for l in todo]
    (WORK / "clips.json").write_text(json.dumps(c, ensure_ascii=False, indent=1))
    LA.queue_jobs({(x["voice"], x["slug"]): [SEEDS[0]] for x in c})

def render(): LA.render()

def check():
    py = Path.home() / "Documents/video_generation/music/align_venv/bin/python"
    takes = sorted(str(p) for p in (WORK / "takes").rglob("*.wav"))
    subprocess.run([str(py), str(Path(__file__).with_name("whisper_cpu.py")), str(WORK / "whisper.json"), *takes], check=True)

def N(x, accents=True, spaces=True):
    x = " ".join(LA.norm(x, accents).split())
    return x if spaces else x.replace(" ", "")

def heard_ok(heard, text, tts, spaces=True):
    # Melbourne is said "Mélburn": accept either spelling in the transcript.
    # spaces=False: Whisper word-boundary slips ("desalento", "hispano hablante") still count.
    return any(N(heard, True, spaces) == N(t, True, spaces) for t in {text, tts, text.replace("Melbourne", "Mélburn")})

# Takes accepted after a closer check (Whisper can't spell or hear these on their own):
#  * sí (María): one-syllable clips come back blank or "C"; sandwiched between "¿Eres de Perú?" and
#    "Soy de Colombia." every take is heard as "Sí" (control words "Tú", "Es" heard correctly the same way).
#  * Cocora (María Bogotá): heard "Kokora", the same sounds; Whisper doesn't know the place name.
ACCEPT = {("maria_bogota", "si-5e06bd"): 12345, ("maria_paisa", "si-5e06bd"): 12345,
          ("maria_bogota", "cocora-es-famoso-0cf839"): 777}

def verdicts():
    W = json.loads((WORK / "whisper.json").read_text()) if (WORK / "whisper.json").exists() else {}
    out = []
    for c in clips():
        takes = []
        for seed in SEEDS:
            p = str(LA.take_path(c, seed))
            if p in W:
                heard = W[p]["text"]
                exact = (heard_ok(heard, c["text"], c["tts"]) or heard_ok(heard, c["text"], c["tts"], spaces=False)
                         or ACCEPT.get((c["voice"], c["slug"])) == seed)
                loose = N(heard, False, False) in {N(t, False, False) for t in (c["text"], c["tts"], c["text"].replace("Melbourne", "Melburn"))}
                takes.append(dict(seed=seed, path=p, heard=heard, exact=exact, loose=loose, dur=W[p]["dur"]))
        out.append((c, takes))
    return out

def retake():
    need = {}
    for c, takes in verdicts():
        if takes and not any(t["exact"] for t in takes):
            tried = {t["seed"] for t in takes}
            nxt = [s for s in SEEDS if s not in tried][:2]
            if nxt:
                need[(c["voice"], c["slug"])] = nxt
                print("retake", c["voice"], repr(c["text"]), "heard:", [t["heard"] for t in takes])
    LA.queue_jobs(need)

def report():
    for c, takes in verdicts():
        if not any(t["exact"] for t in takes):
            print(c["voice"], repr(c["text"]), [t["heard"] for t in takes])

def export():
    out = {"note": "Unit 1.1 lines from audio/TODO_lines.json (Oct 2026), recorded with Qwen3-TTS (x-vector clone) "
                   "from the same reference wavs and with the same export filter as manifest.json (lesson_audio.py). "
                   "Merged with manifest.json and manifest-extra.json by js/speech.js.", "clips": {}}
    # Keep the clips video_generation/scripts/voice_tools/u12_audio.py merged in (Unit 1.2, Oct 2026).
    mp = PROTO / "audio/manifest-l2.json"
    if mp.exists():
        old = json.loads(mp.read_text())
        out["note"], out["clips"] = old.get("note", out["note"]), old["clips"]
    doubtful = []
    for c, takes in verdicts():
        if not takes:
            doubtful.append(f"{c['voice']}: {c['text']} (no take)"); continue
        best = (next((t for t in takes if t["exact"]), None) or next((t for t in takes if t["loose"]), None) or takes[-1])
        if not best["exact"]:
            doubtful.append(f"{c['voice']}: {c['text']!r} heard {best['heard']!r}" + (" (accent only)" if best["loose"] else ""))
        rel = f"audio/{c['voice']}/{c['slug']}.mp3"
        dst = PROTO / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", best["path"], "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,"
                        "adelay=80:all=1,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11",
                        "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k",
                        "-map_metadata", "-1", str(dst)], check=True)
        out["clips"].setdefault(c["text"], {})[c["voice"]] = rel
    (PROTO / "audio/manifest-l2.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(sum(len(v) for v in out["clips"].values()), "clips exported")
    print("doubtful:" if doubtful else "no doubtful clips", *doubtful, sep="\n  ")

if __name__ == "__main__":
    globals()[sys.argv[1]]()
