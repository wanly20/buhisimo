"""CPU Whisper (stable_whisper, turbo) for record_todo_audio.py: whisper_cpu.py out.json a.wav b.wav ...
Run with ~/Documents/video_generation/music/align_venv/bin/python."""
import json, sys, os
from pathlib import Path
import stable_whisper
out = Path(sys.argv[1]); files = sys.argv[2:]
res = json.loads(out.read_text()) if out.exists() else {}
todo = [f for f in files if f not in res]
if todo:
    m = stable_whisper.load_model("turbo", device="cpu", download_root=os.path.expanduser("~/Documents/video_generation/music/models/whisper"))
for f in todo:
    r = m.transcribe(f, language="es", fp16=False, verbose=None, condition_on_previous_text=False, temperature=0.0)
    import soundfile as sf
    try: dur = sf.info(f).duration
    except Exception: dur = 0
    text = r.text.strip()
    if len(text) < 3:  # one-word clips: Whisper often hears nothing; retry with 1 s of silence around it
        import subprocess, tempfile
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f, "-af", "adelay=1000:all=1,apad=pad_dur=1", "-ar", "16000", tmp], check=True)
        text = m.transcribe(tmp, language="es", fp16=False, verbose=None, condition_on_previous_text=False, temperature=0.0).text.strip() or text
        os.unlink(tmp)
    res[f] = dict(text=text, dur=dur)
    print(Path(f).parent.name, Path(f).name, "|", res[f]["text"], flush=True)
    out.write_text(json.dumps(res, ensure_ascii=False, indent=1))
