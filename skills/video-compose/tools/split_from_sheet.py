import json
import re
import subprocess
import sys
from pathlib import Path

sheet, audio, voice_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
voice_dir.mkdir(parents=True, exist_ok=True)
header, lines = None, []
for raw in sheet.read_text().splitlines():
    if not raw.strip().startswith("|"):
        continue
    cells = [c.strip() for c in raw.strip().strip("|").split("|")]
    if cells and cells[0].lower() == "id":
        header = [c.lower() for c in cells]
        continue
    if header and re.fullmatch(r"L\d+", cells[0]):
        r = dict(zip(header, cells))
        scene = re.sub(r"\D", "", r.get("scene", "")) or "1"
        lines.append({"i": len(lines), "id": r["id"], "step": int(scene) - 1, "text": r["text"],
                      "caption": r.get("caption") or r["text"]})
if not lines:
    sys.exit("no speaker lines found in the sheet")
lines_json = voice_dir / "lines.json"
lines_json.write_text(json.dumps(lines, ensure_ascii=False, indent=1))
tool = Path(__file__).parent / "split_audio.py"
subprocess.run([sys.executable, str(tool), str(audio), str(lines_json), str(voice_dir)], check=True)
