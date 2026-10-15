---
name: video-compose
description: Use after capture, to turn the raw recording and the approved audio into the finished video - split or align audio, cut user-wait spans, build the narration track, and render a branded Remotion composition with browser window frame, zoom, step chips, progress bar, readable captions and tooltip callouts. Triggers on render the video, Remotion, compose, captions style, Bangla captions, browser frame, intro outro, final render.
---

# Video Compose

Inputs: `out/events.json`, `out/raw.path`, `topic.json`, `voice/ph<N>.wav`, `voice/phrases.json`.

## Steps

1. **Audio per phrase.** Preferred: the user supplies one file per speaker line; put them in `voice/` as `ph<N>.wav` and write `voice/phrases.json` with `i`, `step`, `text`. If the user supplied one long file, split it:
   `python3 tools/split_audio.py narration.wav lines.json voice/`
   It matches pauses to line breaks and reports how many it interpolated. Treat interpolated lines as approximate and say so.
2. **Compose inner video and narration.**
   `python3 tools/compose.py topic.json out/`
   Cuts every `cuts[]` span (keeps 1s), writes `inner.mp4`, `narration.wav` (loudness -15 LUFS) and `meta.json`.
3. **Remotion project.** Copy `templates/remotion/` to `remotion/`, `npm i`, copy `out/inner.mp4`, `narration.wav`, `meta.json` into `remotion/public/`, add the logo and a Bengali-capable font as `font.ttf`, edit `public/brand.json`.
4. **Stills first.** `npx remotion still Tutorial stills/s300.png --frame=300` at the intro, a typing scene, a callout, a failure scene and the outro. Look at them. Fix before rendering.
5. **Render.** `npm run render`. Extract three frames and the audio level before handing over.

## Style options

Offer the choices in `references/style-catalog.md` before editing `brand.json` `style`. Ask whether captions are burned in, delivered as sidecar subtitles only, both, or omitted, and whether tooltips are wanted. `captions.srt` and `captions.vtt` are always written by `compose.py`.

## Caption and tooltip rules

- Captions: regular weight (400), 30px on a 1920 canvas, one sentence at a time, at most 2 lines, max width 980px, translucent dark background, never bold.
- Break lines with `text-wrap: balance`; never let a caption cover a field the viewer must read.
- Tooltips (callouts) carry short pointers to UI elements, 26px weight 500, only while the zoom is near 1.
- Step chip and progress bar come from `brand.stepTitles`; keep titles under 22 characters.
- Numerals follow the video language (`numerals: "bn"` for Bangla).

## Brand

All colors, logo, intro and outro text, domain and step titles live in `brand.json`. Reuse the same file across a series so every video matches.

## Licence note

Remotion is free for individuals and teams up to 3 people; larger companies need a Remotion licence.
