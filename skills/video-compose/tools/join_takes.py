import json
import subprocess
import sys
from pathlib import Path

head_dir, tail_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
split_phrase = int(sys.argv[4])
out_dir.mkdir(parents=True, exist_ok=True)

head = json.loads((head_dir / "events.json").read_text())
tail = json.loads((tail_dir / "events.json").read_text())
head_raw = (head_dir / "raw.path").read_text().strip()
tail_raw = (tail_dir / "raw.path").read_text().strip()

head_cut = next(e["t"] for e in head["events"] if e["i"] == split_phrase)
tail_start = next(e["t"] for e in tail["events"] if e["i"] == split_phrase)
tail_end = tail["end"]

fc = (
    f"[0:v]trim={head['shift']:.3f}:{head['shift'] + head_cut:.3f},setpts=PTS-STARTPTS,fps=30,scale=1280:720[a];"
    f"[1:v]trim={tail['shift'] + tail_start:.3f}:{tail['shift'] + tail_end:.3f},setpts=PTS-STARTPTS,fps=30,scale=1280:720[b];"
    "[a][b]concat=n=2:v=1:a=0[v]"
)
joined = out_dir / "raw.mp4"
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", head_raw, "-i", tail_raw, "-filter_complex", fc,
     "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "14", str(joined)],
    check=True,
)

offset = head_cut - tail_start
events = [e for e in head["events"] if e["i"] < split_phrase]
events += [{**e, "t": e["t"] + offset} for e in tail["events"] if e["i"] >= split_phrase]
cuts = [c for c in head["cuts"] if c["we"] <= head_cut]
cuts += [{"ws": c["ws"] + offset, "we": c["we"] + offset} for c in tail["cuts"] if c["ws"] >= tail_start]
marks = [{**m, "a": m["a"] + offset, "b": m["b"] + offset} for m in tail.get("marks", []) if m["a"] >= tail_start]
callouts = [c for c in head.get("callouts", []) if c["t1"] <= head_cut + 0.01]
(out_dir / "events.json").write_text(json.dumps({
    "events": events, "cuts": cuts, "marks": marks, "callouts": callouts,
    "end": head_cut + (tail_end - tail_start), "shift": 0.0, "failures": head.get("failures", []) + tail.get("failures", []),
}, indent=1))
(out_dir / "raw.path").write_text(str(joined))
print(f"joined: head {head_cut:.1f}s + tail {tail_end - tail_start:.1f}s")
