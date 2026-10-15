import shutil
import subprocess
import sys
from pathlib import Path

video, srt, vtt, final_dir = map(Path, sys.argv[1:5])
name = sys.argv[5] if len(sys.argv) > 5 else "final"
at = sys.argv[6] if len(sys.argv) > 6 else "6"
final_dir.mkdir(parents=True, exist_ok=True)
shutil.copy(video, final_dir / f"{name}.mp4")
shutil.copy(srt, final_dir / f"{name}.srt")
shutil.copy(vtt, final_dir / f"{name}.vtt")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", at, "-i", str(video), "-frames:v", "1",
                str(final_dir / f"{name}-thumbnail.png")], check=True)
print(f"delivered to {final_dir}")
