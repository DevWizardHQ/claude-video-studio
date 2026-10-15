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
KEEP, LEAD = 1.0, 0.4
HOLD = float(topic.get("hold", 3.0))

cuts = sorted(data["cuts"], key=lambda c: c["ws"])
ops = []
cut_keep = topic.get("cutKeep", [])
for n, c in enumerate(cuts):
    keep = min(float(cut_keep[n]) if n < len(cut_keep) else KEEP, c["we"] - c["ws"])
    ops.append(("cut", c["ws"] + keep, c["we"], 1.0))
for sp in topic.get("speed", []):
    ops.append(("speed", float(sp["start"]), float(sp["end"]), float(sp["factor"])))
auto = topic.get("autoSpeed")
if auto:
    for m in data.get("marks", []):
        if m["kind"] == auto.get("kind", "code-typing") and m["b"] - m["a"] > 2.0:
            ops.append(("speed", m["a"], m["b"], float(auto.get("factor", 2.4))))
gap_cfg = topic.get("compressGaps")
if gap_cfg:
    limit, target, top = float(gap_cfg.get("over", 3.0)), float(gap_cfg.get("to", 2.0)), float(gap_cfg.get("maxFactor", 5.0))
    evs = sorted(data["events"], key=lambda e: e["t"])
    for cur, nxt in zip(evs, evs[1:]):
        a, b = cur["t"] + cur["dur"] + 0.15, nxt["t"]
        if b - a <= limit:
            continue
        if any(not (b <= oa or a >= ob) for _, oa, ob, _ in ops):
            continue
        ops.append(("speed", a, b, min(top, (b - a) / target)))
ops.sort(key=lambda o: o[1])
segments, cursor = [], 0.0
for kind, a, b, f in ops:
    if a > cursor:
        segments.append((cursor, a, 1.0))
    if kind == "speed":
        segments.append((a, b, f))
    cursor = b
segments.append((cursor, end, 1.0))


def gmap(t):
    back = 0.0
    for kind, a, b, f in ops:
        saved = (b - a) if kind == "cut" else (b - a) * (1 - 1 / f)
        if t >= b:
            back += saved
        elif t > a:
            return (a - back) if kind == "cut" else (a - back) + (t - a) / f
    return t - back


parts = []
for k, (a, b, f) in enumerate(segments):
    parts.append(f"[0:v]trim={shift + a:.3f}:{shift + b:.3f},setpts=(PTS-STARTPTS)/{f}[v{k}]")
concat = "".join(f"[v{k}]" for k in range(len(segments)))
parts.append(f"{concat}concat=n={len(segments)}:v=1:a=0,fps=30,tpad=stop_mode=clone:stop_duration={HOLD}[v]")
inner = out_dir / "inner.mp4"
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-filter_complex", ";".join(parts),
     "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-r", "30", str(inner)],
    check=True,
)
inner_dur = float(subprocess.check_output(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(inner)]).decode())


def caption_of(i):
    p = phrases[i]
    return p.get("caption") or p["text"]


def dur_of(i):
    p = phrases[i]
    if "s" in p and "e" in p:
        return p["e"] - p["s"]
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(voice / f"ph{i}.wav")]).decode())


events = []
for e in data["events"]:
    p = phrases[e["i"]]
    events.append({"i": e["i"], "t": gmap(e["t"]), "dur": e["dur"], "text": caption_of(e["i"]),
                   "step": p.get("step", 0), "focus": e.get("focus")})
retime = {int(k): float(v) for k, v in topic.get("retime", {}).items()}
for e in events:
    e["t"] += retime.get(e["i"], 0.0)
marks_by_kind = {}
for m in data.get("marks", []):
    marks_by_kind.setdefault(m["kind"], []).append(m)
for phrase, kind in topic.get("alignToMark", {}).items():
    if marks_by_kind.get(kind):
        for e in events:
            if e["i"] == int(phrase):
                e["t"] = gmap(marks_by_kind[kind][0]["a"])
events.sort(key=lambda e: e["t"])

absolute = [{**e, "t": e["t"] + intro} for e in events]
t = LEAD
for i in topic.get("introPhrases", []):
    d = dur_of(i)
    absolute.append({"i": i, "t": t, "dur": d, "text": caption_of(i), "step": phrases[i].get("step", 0)})
    t += d + 0.15
t = intro + inner_dur + LEAD
for i in topic.get("outroPhrases", []):
    d = dur_of(i)
    absolute.append({"i": i, "t": t, "dur": d, "text": caption_of(i), "step": phrases[i].get("step", 0)})
    t += d + 0.15
absolute.sort(key=lambda e: e["t"])

inputs, filters, labels = [], [], []
for k, e in enumerate(absolute):
    inputs += ["-i", str(voice / f"ph{e['i']}.wav")]
    filters.append(f"[{k}:a]adelay={int(e['t'] * 1000)}:all=1[s{k}]")
    labels.append(f"[s{k}]")
filters.append(
    "".join(labels)
    + f"amix=inputs={len(absolute)}:normalize=0:duration=longest,highpass=f=70,"
    "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-15:TP=-1.2:LRA=7,"
    "aformat=sample_rates=48000:channel_layouts=stereo[a]"
)
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters),
     "-map", "[a]", str(out_dir / "narration.wav")],
    check=True,
)
subs.write(absolute, out_dir, 0.0)

by_i = {e["i"]: e for e in events}
urls = []
for u in topic.get("urls", []):
    if "fromPhrase" in u and u["fromPhrase"] in by_i:
        urls.append({"t": by_i[u["fromPhrase"]]["t"], "url": u["url"]})
    elif "afterPhrase" in u and u["afterPhrase"] in by_i:
        e = by_i[u["afterPhrase"]]
        urls.append({"t": e["t"] + e["dur"] + 0.3, "url": u["url"]})
urls.sort(key=lambda u: u["t"])

callouts = [{"t0": gmap(c["t0"]), "t1": gmap(c["t1"]), "box": c["box"], "text": c["text"]} for c in data.get("callouts", [])]
meta = {"innerDur": inner_dur, "events": events, "callouts": callouts, "urls": urls, "audioFullTimeline": True}
(out_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
print(f"inner {inner_dur:.1f}s, {len(events)} lines in video, {len(absolute) - len(events)} on intro/outro, {len(cuts)} cut(s)")
