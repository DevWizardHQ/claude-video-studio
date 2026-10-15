---
name: ui-capture
description: Use after the script and audio are approved, to record the real web UI with Playwright so the on-screen actions land exactly when the narration names them. Provides a cue-driven capture runner with cursor and click ripple, field highlight, per-field blur masking, user-input waits (OTP) that are cut later, and callout and focus metadata for the compositor. Triggers on record the flow, screen recording, capture UI, Playwright video, mask phone number, blur sensitive data.
---

# UI Capture

Records the live flow once, driven by the approved audio, and writes the metadata the compositor needs.

## Inputs
- `audio/L01.wav ...` (or `voice/phrases.json` plus `voice/ph<N>.wav` after splitting)
- `topic.json` (see `templates/topic.example.json`)
- Node 20+, `npm i playwright`, `npx playwright install chromium`, ffmpeg

## Run

```
node templates/run.mjs path/to/topic.json out/
```

Outputs in `out/`: the raw `.webm`, `raw.path`, `events.json` with `events[]` (phrase start, duration, focus box), `cuts[]` (user-wait spans to cut), `callouts[]`, `shift`, `end`.

## Sync model

Every cue pairs a phrase with actions. Phrase audio starts when the cue starts. `land: "start"` runs actions at once; `land: "end"` delays them so the click lands at the end of the phrase. The next phrase starts when both audio and actions finish. Long actions create natural pauses; keep select-style actions fast.

## Masking (do this before recording)

`mask.texts` blurs a value wherever it appears as text (ASCII and Bangla digits). `mask.fields` mirrors an input and blurs part of its value (`keepFirst` characters stay readable, or `afterLast` blurs after a separator). Passwords stay as dots. Check one frame of every scene that shows a masked value before accepting a take.

## User input (OTP and similar)

Use `askUser`. The runner pauses, the user types the code into `inputs/<name>.txt` (or tells Claude, which writes it), the runner fills the field and continues. The wait is recorded in `cuts[]` and removed by the compositor.

## Verify

Extract frames at each cue start and a mid-typing frame; open them. Reject the take if a masked value is readable, a click misses, or a validation error shows unintentionally.

## Account side effects

A real registration or SMS cannot be repeated with the same number. Plan takes accordingly: dry-run the destructive click (`opts.dryRun`) for rehearsals, and do the real submit once.
