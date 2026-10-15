---
name: video-studio
description: This skill should be used when the user asks for a video made from a product, website, app or screens - a tutorial, how-to, explainer, onboarding, announcement or promo, in any language including Bangla. It is the single entry point and runs the full agency workflow with approval gates (source, discovery, brief, story, script, speaker lines, build, compose, QA). Other video-* skills are loaded by this one.
---

# Video Studio

One workflow for every video. The order never changes and no step is skipped.

## Gates

| # | Stage | Skill | Gate (user must approve) |
|---|-------|-------|--------------------------|
| 0 | Source mode | `video-source-modes` | Mode chosen: live web, screenshots, app recording, mockup, illustrated, text, AI animation |
| 1 | Discovery | `video-discovery` | Screen inventory and per-screen notes confirmed |
| 2 | Brief | `video-brief-interview` | Brief summary confirmed (includes subtitles, tooltips, style choices) |
| 3 | Story | `video-story` | Story and scene map approved |
| 4 | Script | `video-script-review` | Full script document approved |
| 5 | Speaker lines | `video-script-review` | Lines sent to the user, audio files returned |
| 6 | Build | `ui-capture` or `video-source-modes` (screenshots) | Frames verified |
| 7 | Compose | `video-compose` | Stills approved, then full render |
| 8 | QA | agent `video-qa-reviewer` | Pass verdict |

## Rules

1. Learn the real screens before asking questions or writing anything. With a URL, crawl it. With screenshots, read every image. With nothing, choose a source mode first.
2. Interview with AskUserQuestion. Options carry a recommendation, the recommended option first and labelled `(Recommended)`. Never ask what the product or the repo already answers.
3. Story before script, script before audio, audio before recording. Every edit restarts only the gate it touches.
4. Show whole documents for review, not summaries.
5. The user produces the voice (own recording or a TTS tool). Hand over `audio.md` with paste-ready blocks, ask for one audio file, split it by the long pauses, and sync to the pieces. Never ask for line-by-line pasting.
6. Cover edge cases from `video-script-review/references/edge-cases.md` as scenes: resend, failure, support, recovery.
7. Ask whether the viewer needs burned-in text, sidecar subtitles, tooltips, and which frame and animation style. Offer `video-compose/references/style-catalog.md`; do not decide silently.
8. Mask personal data in the page or image itself before recording. Never rely on editing it out later.
9. Use Sonnet for building agents and Opus only for review.
10. Verify with frames before claiming a stage is done: look at them.
11. Load `video-craft` guides for the stage you are in; they are the house standard.
12. Run the gates in the main session. Subagents are for build, compose and review only.

## Working folder

```
<video-id>/
  discovery/        screens.json, screens.md, shots/, screen-notes.md
  brief.md          approved brief
  story.md          approved story
  script.md         approved script
  speaker-lines.md  lines, voice brief, glossary
  voice/            ph0.wav ... and phrases.json
  topic.json        capture config (live-web) or slides.json (screenshots)
  out/              raw recording, events.json, inner.mp4, narration.wav, meta.json, captions.srt
  remotion/         Remotion project from the video-compose template
  final/            final.mp4, captions.srt, captions.vtt, thumbnail.png
```
