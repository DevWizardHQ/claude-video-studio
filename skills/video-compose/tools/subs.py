import re

TERMINAL = ("।", "!", "?", ".", "؟", "。", "！", "？")


def wrap(text, width=60, lines=2):
    words, rows, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > width:
            rows.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        rows.append(cur)
    return rows


def groups(events):
    out, cur = [], []
    for e in events:
        if cur and cur[-1]["step"] != e["step"]:
            out.append(cur)
            cur = []
        cur.append(e)
        if e["text"].rstrip().endswith(TERMINAL):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def stamp(t, sep):
    h, r = divmod(max(t, 0), 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}{sep}{int((s % 1) * 1000):03d}"


def write(events, out_dir, intro=0.0):
    gs = groups(events)
    srt, vtt = [], ["WEBVTT", ""]
    for n, g in enumerate(gs, 1):
        a = g[0]["t"] + intro
        b = g[-1]["t"] + g[-1]["dur"] + 0.2 + intro
        if n < len(gs):
            b = min(b, gs[n][0]["t"] + intro - 0.05)
        b = max(b, a + 1.2)
        text = "\n".join(wrap(" ".join(x["text"] for x in g)))
        srt += [str(n), f"{stamp(a, ',')} --> {stamp(b, ',')}", text, ""]
        vtt += [f"{stamp(a, '.')} --> {stamp(b, '.')}", text, ""]
    (out_dir / "captions.srt").write_text("\n".join(srt))
    (out_dir / "captions.vtt").write_text("\n".join(vtt))
