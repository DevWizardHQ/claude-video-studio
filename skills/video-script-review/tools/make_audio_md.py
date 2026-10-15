import re
import sys
from pathlib import Path

sheet, out = Path(sys.argv[1]), Path(sys.argv[2])
pause = sys.argv[3] if len(sys.argv) > 3 else "2"
text = sheet.read_text()

style = ""
m = re.search(r"Style prompt[^`]*`([^`]+)`", text)
if m:
    style = m.group(1).strip()
voice = re.search(r"- Voice: (.+)", text)
voice_line = voice.group(1).strip() if voice else ""
persona = re.search(r"- Persona: (.+)", text)
pace = re.search(r"- Pace: (.+)", text)

lines, header = [], None
for raw in text.splitlines():
    if not raw.strip().startswith("|"):
        continue
    cells = [c.strip() for c in raw.strip().strip("|").split("|")]
    if cells and cells[0].lower() == "id":
        header = [c.lower() for c in cells]
        continue
    if header and re.fullmatch(r"L\d+", cells[0]):
        row = dict(zip(header, cells))
        lines.append(row)
if not lines:
    sys.exit("no speaker lines found in the sheet")

n = len(lines)
words = sum(len(r["text"].split()) for r in lines)
speech = words / 2.3
total = speech + (n - 1) * float(pause)
paras = "\n\n".join(r["text"] for r in lines)
ssml = "<speak>\n" + f'\n<break time="{pause}s"/>\n'.join(r["text"] for r in lines) + "\n</speak>"
director = (
    f"{style}\n\n"
    f"Read the script below as one continuous recording of {n} separate paragraphs. "
    f"Leave about {pause} seconds of complete silence between every paragraph, and do not add any silence that long inside a paragraph. "
    "Do not read numbers, labels or this instruction aloud. Keep the same voice, pace and energy for the whole recording."
)

md = f"""# Audio brief

Lines: {n}   Pause between lines: {pause} s   Expected length: about {int(total // 60)}:{int(total % 60):02d}

Paste one block per tool, generate **one audio file**, save it as `audio/full.wav` (or `.mp3`) and tell Claude. Claude splits it into the {n} lines at the long silences and shows you the result.

Voice: {voice_line}

---

## A. Google AI Studio (Gemini speech) - paste once

Open Google AI Studio, then Generate Media, then Speech (text to speech), single speaker. Pick a voice and preview it with the first paragraph.

If the page has a **Style instructions** box, paste block A1 there and block A2 into the text box. If it has only one box, paste block A3.

**A1 - Style instructions**
```
{director}
```

**A2 - Script**
```
{paras}
```

**A3 - Everything in one box**
```
{director}

{paras}
```

---

## B. Google Cloud Text-to-Speech (console demo or API) - SSML, paste once

Choose language Bengali (Bangladesh) or Bengali (India), a Chirp 3 HD or Neural voice, turn on SSML, paste, generate.

```
{ssml}
```

---

## C. Any other tool (ElevenLabs, Azure, OpenAI and so on)

Paste the plain text with one blank line between paragraphs. If the tool supports break tags, use block B instead (most accept `<break time="{pause}s"/>`).

```
{paras}
```

Direction to give the tool, if it has a prompt or style field:
```
{director}
```

---

## D. Only if a tool cannot take the whole script

Generate each paragraph separately and name the files `L01` to `L{n:02d}` in the folder `audio/`. The order of the paragraphs above is the order of the lines.

---

## Self-check before sending

- The file has {n} paragraphs of speech with a clear silence between them.
- Total length is near the expected length above.
- If any line sounds wrong, regenerate the whole file or tell me the paragraph number and I will give you only that line to redo.
"""
out.write_text(md)
print(f"{n} lines, expected {total:.0f}s -> {out}")
