---
name: video-source-modes
description: Use when the user has no live website or wants more than a screen recording. Chooses the right build mode - live web recording, screenshot walkthrough, mobile or desktop app recording, design mockup, AI-generated illustrations or animation, kinetic text explainer, or a mix - and gives the pipeline, gates and quality rules for each. Triggers on no website yet, only screenshots, Figma, mockup, animation, AI video, explainer, motion graphics, text animation, slideshow.
---

# Video Source Modes

Pick one primary mode per video. Mix only when the brief says so. Every mode keeps the same gates: brief, story, script, speaker lines, build, QA.

| Mode | Use when | Build path | Status |
|------|----------|-----------|--------|
| `live-web` | The product runs and can be driven | `ui-capture` then `video-compose` (Tutorial) | ready |
| `screenshots` | UI exists as images, a staging link is unavailable, or the flow is risky to repeat | Number images, write `slides.json`, `tools/build_timeline.py`, Remotion `Slides` composition | ready |
| `app-recording` | Mobile or desktop app | User records the screen with the OS recorder; trim, then `video-compose` with the clip as `inner.mp4` and phrases cut to the clip | guided |
| `design-mockup` | Figma or design exports before the build | Treat exports as `screenshots`; add hotspot boxes for focus zoom | ready |
| `illustrated` | Concept is abstract (policy, benefits, how an agency works) | Generate or commission illustrations per scene, then `screenshots` path with a different frame (`none`) | guided |
| `kinetic-text` | No visuals at all, a message or announcement | Remotion text scenes driven by the script lines; same timeline tool | planned |
| `ai-animation` | Short story or hero animation | Use an image or video generation tool chosen by the user; Claude writes prompts per scene and assembles clips in Remotion | guided |

`ready` is implemented in this pack. `guided` means the steps and checklists are here but the media is made outside. `planned` means describe the limitation and use the nearest ready mode.

## Choosing

Ask with AskUserQuestion, recommended first:
1. Does the product run today? Yes: `live-web` (Recommended). No but screens exist: `screenshots`. No screens: `illustrated` or `kinetic-text`.
2. Is the action repeatable and safe on the real system? If not, prefer `screenshots` or a staging copy.
3. Is the audience watching on phones? Prefer 9:16 and `frame: none`.

## Screenshot mode (ready)

1. Put images in `shots/`, name them `01-...png`.
2. Write `slides.json`:
   ```json
   {
     "size": { "w": 1280, "h": 720 },
     "scenes": [
       { "image": "shots/01-home.png", "phrases": [0, 1], "url": "example.com", "step": 0,
         "focus": { "x": 820, "y": 90, "width": 220, "height": 50 },
         "tooltip": "Click Register" }
     ]
   }
   ```
3. `python3 ../video-compose/tools/build_timeline.py slides.json voice/phrases.json voice/ out/`
4. Copy `out/meta.json`, `out/scenes.json`, `out/narration.wav` and the images into `remotion/public/`, render the `Slides` composition.

Rules: images at the same aspect ratio; mask personal data in the image before use; give every scene one focus box at most.

## AI-generated visuals (guided)

- Prompts come from the approved script, one per scene, with a style line shared by all so the set looks like one world.
- State clearly in the brief that visuals are illustrative, not the real product.
- Never generate people's faces for real customers, officials or brands without permission.
- Keep text inside generated images out; add it in Remotion so Bangla renders correctly.
