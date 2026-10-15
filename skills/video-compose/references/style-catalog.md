# Style catalog

Every option has an id. The user picks ids in the brief; they land in `brand.json` under `style`.
Status `ready` means the template implements it. `planned` means it is offered as a roadmap item: say so and use the nearest ready option.

## Text on screen

| Setting | id | Status | When to use |
|---------|----|--------|-------------|
| `captions` | `burned` | ready | Viewers watch muted (social, feeds) or the audience has low literacy. Text is part of the video. |
| `captions` | `none` | ready | Voice carries the video. Pair with sidecar subtitles. |
| subtitles file | `captions.srt`, `captions.vtt` | ready | Always generated. Upload to YouTube or a player so viewers can toggle. Recommended default for long videos. |

Decision rule: tutorials for the public, short feeds and WhatsApp use `burned`. YouTube and site-embedded videos use `none` plus the sidecar file. When unsure, ask.

## Caption animation

| id | Status | Feel |
|----|--------|------|
| `fade-up` | ready | Calm, default. Slides up 10px while fading in. |
| `fade` | ready | Quietest. |
| `typewriter` | ready | Playful; suits short lines only. |
| `word-highlight` | planned | Karaoke emphasis for marketing cuts. |

## Tooltips and callouts

| id | Status | Use |
|----|--------|-----|
| `tooltip` | ready | Short pointer to one UI element ("created automatically"). Only while the view is not zoomed. |
| `none` | ready | Captions carry everything. |
| `spotlight` | planned | Dim everything except one element. |
| `numbered-badge` | planned | 1, 2, 3 markers for multi-field forms. |

Rule: at most one tooltip per scene, 6 words or fewer.

## Browser frame

| id | Status | Look |
|----|--------|------|
| `macos` | ready | Traffic lights, address bar. Default for web tutorials. |
| `minimal` | ready | Address bar only, no lights. Cleaner for brand-heavy videos. |
| `none` | ready | Full-bleed page with rounded corners. Best for mobile-first products. |
| `laptop` | planned | Device mockup for promos. |
| `phone` | planned | Portrait phone mockup for 9:16. |

## Camera movement

| id | Status | Behaviour |
|----|--------|-----------|
| `focus` | ready | Smooth 1.15x zoom toward the active field, eases back when idle. |
| `none` | ready | Static. Use when the UI is dense and must stay readable. |
| `pan-follow` | planned | Slow drift that follows the cursor. |

## Background and branding

| Setting | id | Status |
|---------|----|--------|
| background | `gradient` | ready (brand colors, slow light drift) |
| background | `solid` | ready |
| background | `mesh`, `particles` | planned |
| progress | `bar` / `none` | ready |
| step chip | `true` / `false` | ready ("Step 3/10 + title") |
| intro / outro | `card` | ready (logo, title, subtitle; thank-you and domain) |
| intro | `logo-reveal`, `kinetic-title` | planned |

## Audio

| id | Status |
|----|--------|
| narration only | ready |
| background music (quiet bed, ducked under voice) | planned |
| click and key sound effects | planned |

## Agency guidance

- One idea per scene. If a scene needs more than one caption sentence and a tooltip, split it.
- Start on the product within 3 seconds of the intro card.
- Never put a caption over the field being typed into.
- Hold the final result for 3 seconds before the outro.
- Use the same `brand.json` for a whole series.
- Mask first, animate second.
