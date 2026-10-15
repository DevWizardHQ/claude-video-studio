---
name: ui-capture
description: Loaded by video-studio at stage 6 of a live-web video project, after the audio is returned. Records the real web UI with Playwright so on-screen actions land when the narration names them, with cursor ripple, field highlight, blur masking, user-input waits such as OTP, and focus and callout metadata for the compositor.
---

# UI Capture

Records the live flow once, driven by the approved audio, and writes the metadata the compositor needs.

## Inputs
- `voice/ph<N>.wav` and `voice/phrases.json` (from `prepare_lines.py` or `split_audio.py`)
- `topic.json` (see `templates/topic.example.json`)
- Node 20+, ffmpeg

## First run
From the video folder (not the plugin folder):
```
npm i playwright && npx playwright install chromium
node ${CLAUDE_PLUGIN_ROOT}/skills/ui-capture/templates/run.mjs topic.json out/
```
The script resolves `playwright` from the current folder, so run it where it is installed.

Outputs in `out/`: the raw `.webm`, `raw.path`, `events.json` with `events[]` (phrase start, duration, focus box), `cuts[]` (user-wait spans), `callouts[]`, `failures[]`, `shift`, `end`.

## Sync model

Every phrase in `phrases.json` plays, in order. A cue in `topic.json` attaches actions to a phrase by `i`; phrases without a cue just play over the current screen. `land: "start"` runs actions at once; `land: "end"` delays them so the click lands at the end of the phrase. The next phrase starts when both audio and actions finish. Long actions create natural pauses; keep dropdown actions fast.

Cue options: `do[]`, `land`, `callout {selector, text}`. A cue that has a callout does not trigger the focus zoom, so the tooltip stays visible.

Top-level options: `stopAfter` (last phrase to run, for rehearsals), `continueOnError` (keep going after a failed cue; failures are listed in `events.json`). Without it, the first failed cue stops the run, and everything captured so far is still written.

## Masking (before recording)

- `mask.texts`: a value to hide wherever it appears as text or inside an input, in ASCII or Bangla digits, with or without spaces and dashes, with or without `+88`. `keepFirst` digits stay readable. `method`: `blur` (default) or `dots`.
- `mask.fields`: per-selector rule when the value is not a known string (for example a generated username): `keepFirst` or `afterLast`.
- Password inputs are never mirrored; they keep their native dots.
- Review a frame of every scene that shows a masked value. A readable value is a failed take.

## User input (OTP and similar)

`askUser` pauses the run and prints `WAITING <file>`. Run the script in the background and watch for that line. When the user gives the code, write it to that file; the run fills the field, continues, and records the wait in `cuts[]`. The default timeout is 15 minutes (`timeoutSeconds`).

## Verify

Extract frames at each cue start and a mid-typing frame; open them. Reject the take if a masked value is readable, a click misses, or a validation error shows unintentionally.

## Account side effects

A real registration or SMS cannot be repeated with the same number. Rehearse with `opts.dryRun` on destructive clicks and with `stopAfter`; do the real submit once. Keep test credentials and `inputs/` out of version control.
