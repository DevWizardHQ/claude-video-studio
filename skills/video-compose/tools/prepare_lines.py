import json
import re
import subprocess
import sys
from pathlib import Path

lines_md, audio_dir, voice_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
voice_dir.mkdir(parents=True, exist_ok=True)
header, rows = None, []
for raw in lines_md.read_text().splitlines():
    if not raw.strip().startswith("|"):
        continue
    cells = [c.strip() for c in raw.strip().strip("|").split("|")]
    if cells and cells[0].lower() == "id":
        header = [c.lower() for c in cells]
        continue
    if header and re.fullmatch(r"L\d+", cells[0]):
        rows.append(dict(zip(header, cells)))
if not rows:
    sys.exit("no speaker lines found: expected a table with columns ID | Scene | Text | Caption | Delivery")

out = []
for i, r in enumerate(rows):
    src = next((p for p in audio_dir.glob(f"{r['id']}.*")), None)
    if src is None:
        sys.exit(f"missing audio for {r['id']} in {audio_dir}")
    dst = voice_dir / f"ph{i}.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ar", "44100", "-ac", "1", str(dst)], check=True)
    d = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dst)]).decode())
    scene = re.sub(r"\D", "", r.get("scene", "")) or "1"
    out.append({"i": i, "id": r["id"], "step": int(scene) - 1, "text": r["text"],
                "caption": r.get("caption") or r["text"], "s": 0.0, "e": round(d, 3)})
(voice_dir / "phrases.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(f"{len(out)} lines prepared in {voice_dir}")
