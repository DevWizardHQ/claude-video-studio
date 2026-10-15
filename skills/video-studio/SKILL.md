---
name: video-studio
description: Use when the user wants a product tutorial, how-to, explainer, onboarding, feature announcement or marketing video made from a real web app, in any language including Bangla. Runs the whole agency workflow with approval gates - brief interview, script review, speaker lines, UI capture, Remotion composition, QA. Triggers on video, tutorial video, screen recording, voice-over, narration, explainer, promo, marketing video, Remotion.
---

# Video Studio

One workflow for every video. The order never changes and no step is skipped.

## Gates

| # | Stage | Skill | Gate (user must approve) |
|---|-------|-------|--------------------------|
| 1 | Brief | `video-brief-interview` | Brief summary confirmed |
| 2 | Script | `video-script-review` | Full script document approved |
| 3 | Speaker lines | `video-script-review` | User delivers audio files |
| 4 | Capture | `ui-capture` | Capture screenshots verified |
| 5 | Compose | `video-compose` | Stills approved, then full render |
| 6 | QA | agent `video-qa-reviewer` | Pass verdict |

## Rules

1. Interview first with AskUserQuestion. Options carry a recommendation, the recommended option is first and labelled `(Recommended)`. Never ask what the repo or product already answers.
2. Present the whole script for review before any audio is requested and before anything is recorded. Edits restart the gate.
3. The user produces the voice (own recording or a TTS tool). Hand over the speaker-line sheet, ask for one audio file per line, then sync to those files.
4. Cover edge cases from the checklist in `video-script-review/references/edge-cases.md` as scenes: resend, failure, support, recovery.
5. Ask whether the viewer needs on-screen text, sidecar subtitles, tooltips, and which frame and animation style. Offer the style catalog; do not decide silently.
6. Mask personal data in the page itself (blur or dots) before recording. Never rely on editing it out later.
7. Use Sonnet for building agents and Opus only for review.
8. Verify with frames before claiming a stage is done: look at them.

## Working folder

```
<video-id>/
  brief.md          approved brief
  script.md         approved script
  speaker-lines.md  lines + voice brief + glossary
  audio/            one wav per speaker line  (L01.wav ...)
  topic.json        capture config  (see ui-capture)
  out/              raw recording, events.json, inner.mp4, narration.wav, meta.json
  remotion/         Remotion project from video-compose template
  final/            register-final.mp4, captions.srt, thumbnail.png
```

## Starting

Load `video-brief-interview`, run it, write `brief.md`, then continue down the table.
