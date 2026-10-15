# Claude Video Studio

A video production agency for Claude Code. It turns a real web app into a reviewed, narrated, branded tutorial or marketing video.

Works for any product and any language. Built and proven on Bangla tutorials.

## What you get

| Piece | Purpose |
|-------|---------|
| `video-studio` | Orchestrator skill. Fixed order, approval gates. |
| `video-brief-interview` | Interviews you with options and a recommendation, writes `brief.md`. |
| `video-script-review` | Full reviewable script, then speaker lines, voice brief and glossary. Edge-case checklist (resend OTP, support, failures). |
| `ui-capture` | Playwright runner: cursor, ripple, highlight, per-field blur masking, OTP waits, cue-based sync to your audio. |
| `video-compose` | Audio split, cut and mix tools plus a Remotion template: browser frame, zoom, step chips, quiet captions, tooltips. |
| `video-director`, `video-qa-reviewer` | Agents: run the workflow, then review the render. |

## Install

```
/plugin marketplace add DevWizardHQ/claude-video-studio
/plugin install claude-video-studio@devwizard-video-studio
```

Requirements: Node 20+, ffmpeg, Python 3, Playwright (`npm i playwright && npx playwright install chromium`).
The Remotion skills (`npx skills add remotion-dev/skills`) are recommended for Studio and render guidance.

## Workflow

1. Brief interview, you approve `brief.md`.
2. Script review, you approve `script.md`.
3. Speaker lines, you record or generate one audio file per line.
4. Capture the live flow against your audio.
5. Compose in Remotion, review stills, render.
6. QA review, deliver MP4, SRT, thumbnail.

## Licence

MIT. Remotion has its own licence terms for companies.
