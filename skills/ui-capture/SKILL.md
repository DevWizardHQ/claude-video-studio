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

Top-level options: `setup` (actions run before recording starts, for example logging in), `startFromPhrase`, `introPhrases` / `outroPhrases` (lines spoken over the intro and outro cards, not played in the recording), `retime` (compose-time offsets in seconds per phrase), `autoSpeed` (compose speeds up the recorded code typing: `{"kind":"code-typing","factor":2.4}`), `alignToMark` (`{"13":"code-typing"}` starts that phrase when the typing starts), `stopAfter` (last phrase to run, for rehearsals), `continueOnError` (keep going after a failed cue; failures are listed in `events.json`). Without it, the first failed cue stops the run, and everything captured so far is still written.

## Masking (before recording)

- `mask.texts`: a value to hide wherever it appears as text or inside an input, in ASCII or Bangla digits, with or without spaces and dashes, with or without `+88`. `keepFirst` digits stay readable. `method`: `blur` (default) or `dots`.
- `mask.fields`: per-selector rule when the value is not a known string (for example a generated username): `keepFirst` or `afterLast`.
- Password inputs are never mirrored; they keep their native dots.
- Review a frame of every scene that shows a masked value. A readable value is a failed take.
- One-time codes (OTP) are not secrets once used or expired; do not mask them unless the brief says so, because viewers need to see the digits go in.

## User input (OTP and similar)

`askUser` pauses the run and prints `WAITING <file>`. Run the script in the background and watch for that line. When the user gives the code, write it to that file; the run fills the field, continues, and records the wait in `cuts[]`. The default timeout is 15 minutes (`timeoutSeconds`).

## Verify

Extract frames at each cue start and a mid-typing frame; open them. Reject the take if a masked value is readable, a click misses, or a validation error shows unintentionally.

## Selectors

Prefer ids, roles or `data-` attributes. A text selector such as `text=Resend` can match decorative copy elsewhere on the page (a side panel) and click the wrong element; confirm what a selector resolves to, with a frame or a DOM probe, before a real take.

## Safety notes from real runs

- Never leave a stale runner alive: a second process polling the same `inputs/` file steals the code. List with `ps` and kill by PID before each take.
- The OTP can expire in minutes. Have the user read the newest code from the SMS or database and send it at once; ask for all 6 digits.
- Repeated login attempts are throttled; do not probe an account in a loop.
- Every action and every cue has a timeout and the run always writes `events.json` and the video, so a stuck step becomes a logged failure.

## Account side effects

A real registration or SMS cannot be repeated with the same number. Rehearse with `opts.dryRun` on destructive clicks and with `stopAfter`; do the real submit once. Keep test credentials and `inputs/` out of version control.
