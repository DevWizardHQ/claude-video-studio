import json
import re
import subprocess
import sys
from pathlib import Path

audio, lines_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
noise = sys.argv[4] if len(sys.argv) > 4 else "-34dB"
min_gap = sys.argv[5] if len(sys.argv) > 5 else "0.12"
lines = json.loads(lines_path.read_text())
out_dir.mkdir(parents=True, exist_ok=True)

log = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", str(audio), "-af", f"silencedetect=noise={noise}:d={min_gap}", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
total = float(subprocess.check_output(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(audio)]).decode())
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
gaps = [(s, e) for s, e in zip(starts, ends)]
speech_start = gaps[0][1] if gaps and gaps[0][0] < 0.05 else 0.0
speech_end = gaps[-1][0] if gaps and gaps[-1][1] >= total - 0.05 else total
cands = [((s + e) / 2, e - s) for s, e in gaps if speech_start + 0.15 < (s + e) / 2 < speech_end - 0.15]

terminal = [bool(re.search(r"[।!?.]$", p["text"].strip())) for p in lines]
weights = [max(1, len(re.sub(r"[\s,।!?.]", "", p["text"]))) for p in lines]
cum, c = [], 0
for w in weights[:-1]:
    c += w
    cum.append(c)
span = speech_end - speech_start
expected = [speech_start + span * x / sum(weights) for x in cum]

UNMATCHED = 1.2
n, m = len(expected), len(cands)
INF = float("inf")
f = [[INF] * (m + 1) for _ in range(n + 1)]
back = [[None] * (m + 1) for _ in range(n + 1)]
f[0][0] = 0.0
for k in range(n):
    for u in range(m + 1):
        if f[k][u] == INF:
            continue
        if f[k][u] + UNMATCHED < f[k + 1][u]:
            f[k + 1][u] = f[k][u] + UNMATCHED
            back[k + 1][u] = (u, None)
        for j in range(u, m):
            mid, gap = cands[j]
            bonus = 1.6 if terminal[k] else 0.5
            cost = abs(mid - expected[k]) * 0.6 - bonus * min(gap, 1.0)
            if abs(mid - expected[k]) > 3.0:
                continue
            if f[k][u] + cost < f[k + 1][j + 1]:
                f[k + 1][j + 1] = f[k][u] + cost
                back[k + 1][j + 1] = (u, j)

u = min(range(m + 1), key=lambda x: f[n][x])
chosen = [None] * n
for k in range(n, 0, -1):
    pu, j = back[k][u]
    chosen[k - 1] = cands[j][0] if j is not None else None
    u = pu

pos = [speech_start] + chosen + [speech_end]
cum2 = [0]
for w in weights:
    cum2.append(cum2[-1] + w)
k = 0
while k < len(pos):
    if pos[k] is None:
        i, j = k - 1, k
        while pos[j] is None:
            j += 1
        for mm in range(k, j):
            pos[mm] = pos[i] + (pos[j] - pos[i]) * (cum2[mm] - cum2[i]) / (cum2[j] - cum2[i])
        k = j
    k += 1

result = []
for idx, p in enumerate(lines):
    s, e = (0.0 if idx == 0 else pos[idx]), (total if idx == len(lines) - 1 else pos[idx + 1])
    d = e - s
    wav = out_dir / f"ph{p['i']}.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{s:.3f}", "-to", f"{e:.3f}", "-i", str(audio),
         "-af", f"afade=t=in:d=0.02,afade=t=out:st={max(d - 0.04, 0):.3f}:d=0.04", "-ar", "44100", "-ac", "1", str(wav)],
        check=True,
    )
    result.append({**p, "s": round(s, 3), "e": round(e, 3)})
(out_dir / "phrases.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
matched = sum(1 for x in chosen if x is not None)
print(f"{len(lines)} lines, {matched}/{n} breaks matched to silences, {n - matched} interpolated")
