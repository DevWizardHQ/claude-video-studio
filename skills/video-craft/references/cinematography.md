# Cinematography for screen video

## Frame and composition
- **Safe area:** keep key UI inside the central 90% of the frame; captions sit in the lower 12%.
- **Window on a stage:** 16:9 canvas, browser window centered, 8 to 10% margin, soft shadow. The stage color comes from the brand.
- **Rule of thirds for focus:** when zooming, place the target on a third line, not dead center, if the layout allows.
- **Aspect:** 16:9 for web and YouTube, 9:16 for Shorts and Reels (use frame `none` and larger type), 1:1 for feeds.

## Camera moves (zoom and pan)
| Move | When | Spec |
|------|------|------|
| Focus zoom | A field or button is the subject | 1.10 to 1.20x, 0.5s ease-in, hold, 0.7s ease-out |
| Chained pan | Next target within 1.6s | Keep zoom, pan between targets, no zoom-out |
| Pull back | Result or overview | Return to 1.0x before a result is shown |
| Static | Dense UI or a table | No move; use a tooltip |

Rules: never zoom beyond 1.25x (text softens); never zoom and show a tooltip at once; never move the camera during typing.

## Shot list for a form flow
1. Establishing: whole page at 1.0x.
2. Per field: focus zoom on the field, type, ease out.
3. Submit: pull back, cursor to button, ripple.
4. Result: hold 3s at 1.0x.

## Cuts and transitions
- Cut on action, not on dead time. Straight cut between steps; a 0.3s cross-fade between sections.
- A jump cut over a long wait is acceptable if narrated and signalled (a short "..." caption or a clock tooltip).
