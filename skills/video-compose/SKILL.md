---
name: video-compose
description: Loaded by video-studio at stage 7 of a video project. Turns the recording or screenshots and the approved audio into the finished video - cuts waits, builds the narration track and subtitles, and renders a branded Remotion composition with browser frame, zoom, step chips, captions and tooltips.
---

# Video Compose

Inputs: `out/events.json`, `out/raw.path`, `topic.json`, `voice/ph<N>.wav`, `voice/phrases.json`.

## Steps

1. **Audio per phrase.** Default: one file for the whole script. Split it using the sheet:
   `python3 ${CLAUDE_PLUGIN_ROOT}/skills/video-compose/tools/split_from_sheet.py speaker-lines.md audio/full.wav voice/`
   The tool uses the long silences as line breaks (exact when their count equals the number of lines minus one) and falls back to an approximate match, saying which. Fallback: one file per speaker line (`L01.wav` ...). Convert and index them:
   `python3 ${CLAUDE_PLUGIN_ROOT}/skills/video-compose/tools/prepare_lines.py speaker-lines.md audio/ voice/`
   This writes `voice/ph<N>.wav` and `voice/phrases.json` (`i`, `step`, `text`, `caption`). If the user supplied one long file, write `lines.json` (`[{"i":0,"step":0,"text":"..."}]`) and split:
   `python3 .../tools/split_audio.py narration.wav lines.json voice/`
   It matches pauses to line breaks and reports how many were interpolated. Treat interpolated lines as approximate and say so.
2. **Compose inner video and narration.**
   `python3 .../tools/compose.py topic.json out/ remotion/public/brand.json`
   Cuts every `cuts[]` span (keeps 1s), writes `inner.mp4`, `narration.wav` (loudness -15 LUFS), `meta.json` and `captions.srt` / `captions.vtt` already offset by the intro length. For screenshots use `build_timeline.py slides.json voice/phrases.json voice/ out/ remotion/public/brand.json`.
3. **Remotion project.** Copy `templates/remotion/` to `remotion/`, `npm i`, copy `out/inner.mp4`, `narration.wav`, `meta.json` into `remotion/public/`, add the logo and a Bengali-capable font as `font.ttf`, edit `public/brand.json`.
4. **Stills first.** `npx remotion still Tutorial stills/s300.png --frame=300` (use `Slides` for screenshot mode) at the intro, a typing scene, a callout, a failure scene and the outro. Look at them. Fix before rendering.
5. **Render.** `npm run render` (or `render:slides`). Extract three frames and check the audio level.
6. **Deliver.** `python3 .../tools/deliver.py remotion/out/final.mp4 out/captions.srt out/captions.vtt final/ <name>` copies the MP4 and subtitles and writes a thumbnail.

## Style options

Offer the choices in `references/style-catalog.md` before editing `brand.json` `style`. Ask whether captions are burned in, delivered as sidecar subtitles only, both, or omitted, and whether tooltips are wanted. `captions.srt` and `captions.vtt` are always written by `compose.py`.

## First run

`cd remotion && npm i`. Put the brand logo at `public/logo.png` and a Bengali-capable font at `public/font.ttf` (Noto Sans Bengali, SIL OFL, from Google Fonts). Remotion downloads its own headless browser on the first render. Requires ffmpeg 4.4 or newer.

## Caption and tooltip rules

- Captions: regular weight (400), 30px on a 1920 canvas, one sentence at a time, at most 2 lines, max width 980px, translucent dark background, never bold.
- Break lines with `text-wrap: balance`; never let a caption cover a field the viewer must read.
- Tooltips (callouts) carry short pointers to UI elements, 26px weight 500, only while the zoom is near 1.
- Step chip and progress bar come from `brand.stepTitles`; keep titles under 22 characters.
- Numerals follow the video language (`numerals: "bn"` for Bangla).

## Brand

All colors, logo, intro and outro text (`introHook`, `outroCta`, `supportLines`, `recapTitle`), domain and step titles live in `brand.json`. `style.intro` is `card`, `hook` or `none`; `style.outro` is `recap`, `card` or `none`. Follow `video-craft/references/intro-outro.md`. Reuse the same file across a series so every video matches.

## Licence note

Remotion is free for individuals and teams up to 3 people; larger companies need a Remotion licence.
