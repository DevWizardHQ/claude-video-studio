---
name: video-source-modes
description: Loaded by video-studio at stage 0 of a video project. Chooses the build mode for the video - live web recording, screenshots, app recording, design mockup, illustrated, kinetic text or AI animation - and gives the pipeline and quality rules for each. Use when the user has no live website for the video or wants more than a screen recording.
---

# Video Source Modes

Pick one primary mode per video. Mix only when the brief says so. Every mode keeps the same gates: brief, story, script, speaker lines, build, QA.

| Mode | Use when | Build path | Status |
|------|----------|-----------|--------|
| `live-web` | The product runs and can be driven | `ui-capture` then `video-compose` (Tutorial) | ready |
| `screenshots` | UI exists as images, a staging link is unavailable, or the flow is risky to repeat | Number images, write `slides.json`, `tools/build_timeline.py`, Remotion `Slides` composition | ready |
| `app-recording` | Mobile or desktop app | User records the screen with the OS recorder; the user and Claude write a timing sheet (phrase start seconds) and build `events.json` by hand, then `compose.py` | guided |
| `design-mockup` | Figma or design exports before the build | Treat exports as `screenshots`; add hotspot boxes for focus zoom | ready |
| `illustrated` | Concept is abstract (policy, benefits, how an agency works) | Generate or commission illustrations per scene, then `screenshots` path with a different frame (`none`) | guided |
| `kinetic-text` | No visuals at all, a message or announcement | Remotion text scenes driven by the script lines; same timeline tool | planned |
| `ai-animation` | Short story or hero animation | Use an image or video generation tool chosen by the user; Claude writes prompts per scene and assembles clips in Remotion | guided |

`ready` is implemented in this pack. `guided` means the steps and checklists are here but the media is made outside. `planned` means describe the limitation and use the nearest ready mode.

## Choosing

Ask with AskUserQuestion, recommended first:
1. Does the product run today? Yes: `live-web` (Recommended). No but screens exist: `screenshots`. No screens: `illustrated` or `kinetic-text`.
2. Is the action repeatable and safe on the real system? If not, prefer `screenshots` or a staging copy.
3. Is the audience watching on phones? 9:16 is planned; today use 16:9 with `frame: none` and larger captions.

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
