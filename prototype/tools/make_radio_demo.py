#!/usr/bin/env python3
"""Build the Radio Búho DEMO episode from clips that are already recorded.

No models and no GPU: ffmpeg concatenates existing MP3s (audio/manifest*.json) with
pauses and a short synthesised chime (sine tones), and the word timings are ESTIMATED:
each clip's speech span (ffmpeg silencedetect) is shared between its words by syllable
count. The JSON matches video_generation/scripts/align_lyrics.py, so a real episode
aligned with that tool drops straight in:
  {"audio", "language", "duration", "lines": [{"text", "section", "start", "end",
   "words": [{"word", "start", "end"}]}]}
plus optional extras the player understands: "title", "demo", "note", and per line
"speaker", "voice" and "en".

    python3 prototype/tools/make_radio_demo.py
"""
import json, re, subprocess, tempfile
from pathlib import Path

PROTO = Path(__file__).resolve().parent.parent
OUT = PROTO / "radio"
SR = 24000

# (speaker shown on screen, voice id, Spanish line, English). Every line has a recording
# and passes tools/check_vocab.mjs (unit 1.1).
SCRIPT = [
    ("Buhísimo", "buho_profesor", "¡Buhísimo!", "Buhísimo! (That's me!)"),
    ("Buhísimo", "buho_profesor", "¿De dónde eres?", "Where are you from?"),
    ("Caller 1", "maria_bogota", "Soy de Colombia.", "I'm from Colombia."),
    ("Caller 1", "maria_bogota", "Colombia es el país de Buhísimo.", "Colombia is Buhísimo's country."),
    ("Buhísimo", "buho_profesor", "¿De dónde eres?", "Where are you from?"),
    ("Caller 2", "raul", "Soy de Australia.", "I'm from Australia."),
    ("Buhísimo", "buho_profesor", "Max es de Australia.", "Max is from Australia."),
    ("Buhísimo", "buho_profesor", "Matilda es de Melbourne.", "Matilda is from Melbourne."),
    ("Caller 2", "raul", "Él es de Colombia.", "He's from Colombia."),
    ("Buhísimo", "buho_profesor", "¡Buhísimo!", "Buhísimo!"),
]
GAP_SAME, GAP_NEW = 0.55, 0.9  # pause before a line: same speaker / new speaker


def clips():
    out = {}
    for name in ("manifest.json", "manifest-extra.json", "manifest-l2.json"):
        p = PROTO / "audio" / name
        if p.exists():
            for text, by in json.loads(p.read_text())["clips"].items():
                out.setdefault(text, {}).update(by)
    return out


def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True)


def duration(path):
    return float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)).stdout)


def speech_span(path, dur):
    """First and last moment of speech (silencedetect at -38 dB)."""
    err = run("ffmpeg", "-i", str(path), "-af", "silencedetect=noise=-38dB:d=0.06", "-f", "null", "-").stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    a = ends[0] if starts and starts[0] <= 0.02 and ends else 0.0
    b = starts[-1] if starts and (not ends or starts[-1] > ends[-1]) else dur
    return a, max(a + 0.2, b)


def syllables(word):
    w = re.sub(r"[^a-záéíóúüñ]", "", word.lower())
    return max(1, len(re.findall(r"[aeiouáéíóúü]+", w)))


def word_times(text, start, end):
    words = text.split()
    weights = [syllables(w) + (0.6 if re.search(r"[.,?!…]$", w) else 0) for w in words]
    total = sum(weights)
    t, out = start, []
    for w, k in zip(words, weights):
        d = (end - start) * k / total
        out.append({"word": w, "start": round(t, 3), "end": round(t + d * 0.92, 3)})
        t += d
    return out


def main():
    OUT.mkdir(exist_ok=True)
    C = clips()
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        parts, lines, t = [], [], 0.0
        # Jingle: three rising notes (C5 E5 G5) with a soft decay, then a pause.
        chime = td / "chime.wav"
        expr = "+".join(f"0.22*sin(2*PI*{f}*t)*exp(-4*(t-{s}))*gte(t,{s})" for f, s in ((523.25, 0), (659.25, 0.18), (783.99, 0.36)))
        expr = expr.replace(",", "\\,")  # commas inside a filter argument must be escaped
        run("ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc={expr}:s={SR}:d=1.6", "-ac", "1", str(chime))
        parts.append(chime)
        t = 1.6
        prev = None
        for i, (speaker, voice, text, en) in enumerate(SCRIPT):
            src = C.get(text, {}).get(voice)
            if not src:
                raise SystemExit(f"no clip for {voice}: {text}")
            gap = 0.5 if prev is None else GAP_SAME if prev == speaker else GAP_NEW
            sil = td / f"sil{i}.wav"
            run("ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{gap:.3f}", str(sil))
            parts.append(sil)
            t += gap
            wav = td / f"c{i}.wav"
            run("ffmpeg", "-y", "-i", str(PROTO / src), "-ar", str(SR), "-ac", "1", str(wav))
            d = duration(wav)
            a, b = speech_span(wav, d)
            words = word_times(text, t + a, t + b)
            lines.append({"text": text, "section": None, "start": words[0]["start"], "end": words[-1]["end"],
                          "words": words, "speaker": speaker, "voice": voice, "en": en})
            parts.append(wav)
            t += d
            prev = speaker
        tail = td / "tail.wav"
        run("ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", "1.2", str(tail))
        parts.append(tail)
        lst = td / "list.txt"
        lst.write_text("".join(f"file '{p}'\n" for p in parts))
        mp3 = OUT / "demo-1-1.mp3"
        run("ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", str(SR), "-ac", "1",
            "-c:a", "libmp3lame", "-b:a", "64k", "-map_metadata", "-1", str(mp3))
        total = round(duration(mp3), 3)
    data = {
        "audio": "demo-1-1.mp3", "language": "es", "model": "estimated", "separated": False, "duration": total,
        "title": "¿De dónde eres?", "demo": True,
        "note": "Built from the prototype's test recordings. The word timings are estimated, not aligned.",
        "lines": lines,
    }
    (OUT / "demo-1-1.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(f"demo-1-1.mp3 {total:.1f} s, {len(lines)} lines, {sum(len(l['words']) for l in lines)} words")


if __name__ == "__main__":
    main()
