import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import subs

topic_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
topic = json.loads(topic_path.read_text())
intro = 3.0
if len(sys.argv) > 3:
    intro = float(json.loads(Path(sys.argv[3]).read_text()).get("introSeconds", 3))
root = topic_path.parent
voice = root / topic.get("voiceDir", "voice")
phrases = {p["i"]: p for p in json.loads((root / topic["phrases"]).read_text())}
data = json.loads((out_dir / "events.json").read_text())
raw = (out_dir / "raw.path").read_text().strip()
shift, end = data["shift"], data["end"]
KEEP, HOLD = 1.0, 4.0

cuts = sorted(data["cuts"], key=lambda c: c["ws"])
segments, cursor, removed = [], 0.0, []
for c in cuts:
    keep = min(KEEP, c["we"] - c["ws"])
    segments.append((cursor, c["ws"] + keep))
    removed.append((c["ws"] + keep, c["we"], c["we"] - c["ws"] - keep))
    cursor = c["we"]
segments.append((cursor, end))


def gmap(t):
    back = 0.0
    for a, b, r in removed:
        if t >= b:
            back += r
        elif t > a:
            return a - back
    return t - back


parts = []
for k, (a, b) in enumerate(segments):
    parts.append(f"[0:v]trim={shift + a:.3f}:{shift + b:.3f},setpts=PTS-STARTPTS[v{k}]")
concat = "".join(f"[v{k}]" for k in range(len(segments)))
parts.append(f"{concat}concat=n={len(segments)}:v=1:a=0,fps=30,tpad=stop_mode=clone:stop_duration={HOLD}[v]")
inner = out_dir / "inner.mp4"
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-filter_complex", ";".join(parts),
     "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-r", "30", str(inner)],
    check=True,
)

events = []
for e in data["events"]:
    p = phrases[e["i"]]
    events.append({"i": e["i"], "t": gmap(e["t"]), "dur": e["dur"], "text": p.get("caption") or p["text"],
                   "step": p.get("step", 0), "focus": e.get("focus")})
events.sort(key=lambda e: e["t"])

inputs, filters, labels = [], [], []
for k, e in enumerate(events):
    inputs += ["-i", str(voice / f"ph{e['i']}.wav")]
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

by_i = {e["i"]: e for e in events}
urls = []
for u in topic.get("urls", []):
    if "fromPhrase" in u and u["fromPhrase"] in by_i:
        urls.append({"t": by_i[u["fromPhrase"]]["t"], "url": u["url"]})
    elif "afterPhrase" in u and u["afterPhrase"] in by_i:
        e = by_i[u["afterPhrase"]]
        urls.append({"t": e["t"] + e["dur"] + 0.3, "url": u["url"]})
urls.sort(key=lambda u: u["t"])

subs.write(events, out_dir, intro)

callouts = [{"t0": gmap(c["t0"]), "t1": gmap(c["t1"]), "box": c["box"], "text": c["text"]} for c in data.get("callouts", [])]
inner_dur = float(subprocess.check_output(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(inner)]).decode())
meta = {"innerDur": inner_dur, "events": events, "callouts": callouts, "urls": urls}
(out_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
print(f"inner {inner_dur:.1f}s, {len(events)} lines, {len(cuts)} cut(s)")
