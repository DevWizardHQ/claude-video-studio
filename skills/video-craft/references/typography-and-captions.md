# Typography and captions (Bangla first)

## Font
- Noto Sans Bengali (variable) is the default. Alternatives: Hind Siliguri, Anek Bangla, Baloo Da 2 (friendly).
- Load the font file into the project; do not rely on a system font.
- Test every conjunct-heavy line rendered; broken shaping is a defect.

## Caption spec (1920x1080 canvas)
| Property | Value |
|----------|-------|
| Size | 28 to 32px (default 30) |
| Weight | 400 regular. Never bold. |
| Color | near-white `#f4f7f4` on translucent dark `rgba(10,22,15,.78)` |
| Lines | 1 to 2, max width 980px, `text-wrap: balance` |
| Line height | 1.5 to 1.6 |
| Padding | 12px 28px, radius 14px |
| Position | bottom center, 26px above the window edge |
| Reading speed | at most 15 characters per second |
| Duration | at least 1.2s per caption; hold until the sentence ends |

## Rules
- One sentence per caption. Break at a phrase, not mid-word.
- Never cover the field being typed into; if it would, move the caption to the top for that scene.
- Punctuation: Bangla `।`, no stacked punctuation.
- Numerals follow the language of the video.
- Burned-in text is optional; always ship `.srt` and `.vtt` for accessibility.

## Tooltips
26px, weight 500, white card, dark text, 6 words or fewer, with an arrow to the target.

## HUD text
Step chip 26px weight 500; title 32px weight 500. Avoid weights above 600 anywhere in Bangla text; heavy weights close counters in conjuncts.
