import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import subs

slides_path, phrases_path, voice_dir, out_dir = map(Path, sys.argv[1:5])
intro = float(json.loads(Path(sys.argv[5]).read_text()).get("introSeconds", 3)) if len(sys.argv) > 5 else 3.0
slides = json.loads(slides_path.read_text())
phrases = {p["i"]: p for p in json.loads(phrases_path.read_text())}
out_dir.mkdir(parents=True, exist_ok=True)
LEAD, GAP, TAIL, HOLD = 0.4, 0.12, 0.35, 3.0


def dur(i):
    p = phrases[i]
    if "s" in p and "e" in p:
        return p["e"] - p["s"]
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(voice_dir / f"ph{i}.wav")]).decode())


t = LEAD
events, scenes, callouts, urls = [], [], [], []
for n, sc in enumerate(slides["scenes"]):
    t0 = t
    for i in sc["phrases"]:
        events.append({"i": i, "t": t, "dur": dur(i), "text": phrases[i].get("caption") or phrases[i]["text"], "step": sc.get("step", n), "focus": None})
        t += dur(i) + GAP
    t1 = t + TAIL
    scenes.append({"image": sc["image"], "t0": t0, "t1": t1, "focus": sc.get("focus"), "step": sc.get("step", n)})
    if sc.get("tooltip") and sc.get("focus"):
        callouts.append({"t0": t0 + 0.6, "t1": t1, "box": sc["focus"], "text": sc["tooltip"]})
    if sc.get("url"):
        urls.append({"t": t0, "url": sc["url"]})
    t = t1

inputs, filters, labels = [], [], []
for k, e in enumerate(events):
    inputs += ["-i", str(voice_dir / f"ph{e['i']}.wav")]
    filters.append(f"[{k}:a]adelay={int(e['t'] * 1000)}:all=1[s{k}]")
    labels.append(f"[s{k}]")
filters.append(
    "".join(labels)
    + f"amix=inputs={len(events)}:normalize=0:duration=longest,highpass=f=70,"
    "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-15:TP=-1.2:LRA=7,"
    "aformat=sample_rates=48000:channel_layouts=stereo[a]"
)
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters),
     "-map", "[a]", str(out_dir / "narration.wav")],
    check=True,
)
inner = t + HOLD
subs.write(events, out_dir, intro)
(out_dir / "meta.json").write_text(json.dumps(
    {"innerDur": inner, "events": events, "callouts": callouts, "urls": urls}, ensure_ascii=False, indent=1))
(out_dir / "scenes.json").write_text(json.dumps({"size": slides["size"], "scenes": scenes}, indent=1))
print(f"{len(scenes)} scenes, {len(events)} lines, {inner:.1f}s")
