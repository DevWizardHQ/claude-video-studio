# Claude Video Studio

A video production agency for Claude Code. It turns a real web app into a reviewed, narrated, branded tutorial or marketing video.

Works for any product and any language. Built and proven on Bangla tutorials.

## What you get

| Piece | Purpose |
|-------|---------|
| `video-studio` | Orchestrator skill. Fixed order, approval gates. |
| `video-source-modes` | Choose live web, screenshots, app recording, mockup, illustrated, text or AI animation, with the pipeline for each. |
| `video-discovery` | Crawl a URL or read screenshots, list every screen, interview you per screen. |
| `video-story` | Story, hook, arc and scene map for approval before the script. |
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

1. Source mode and discovery of every screen.
2. Brief interview, you approve `brief.md`.
3. Story, you approve `story.md`.
4. Script, you approve `script.md`.
5. Speaker lines, you record or generate one audio file per line.
6. Build: capture the live flow, or assemble screenshots, against your audio.
7. Compose in Remotion, review stills, render.
8. QA review, deliver MP4, SRT, VTT, thumbnail.

## Licence

MIT. Remotion has its own licence terms for companies.
