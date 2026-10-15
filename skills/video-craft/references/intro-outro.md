# Intros and outros

The first 5 seconds earn the next 60. The last 5 seconds decide what the viewer does.

## Intro

### Purpose
Orient the viewer, promise the result, signal the brand. Nothing else.

### Choose a style
| Style | When | Length |
|-------|------|--------|
| `hook` | Public tutorials where viewers arrive with a problem (a code that does not come, a form that fails) | 4 to 5s: hook line 2s, brand title 2s |
| `card` | Series, internal training, formal services | 3s |
| `none` | Short feed cuts and videos placed after another intro | 0s |

### Hook line rules
- One sentence, 8 words or fewer, in the viewer's own words.
- A question or a promise: "ওটিপি আসছে না? চিন্তা নেই।"
- Never a greeting, never the company name first.
- It must be answered inside the video.

### Intro card rules
- Logo on a white pill, title 60 to 90px on a 1920 canvas, subtitle 36 to 40px at 70% brightness.
- Title is the outcome ("নতুন অ্যাকাউন্ট খুলুন"), not the department ("নিবন্ধন বিভাগ").
- One ease-out entrance (0.6s spring), one fade-out (0.45s). No spinning, no bouncing.
- Start the voice at 0.4s; do not leave a silent card.
- Total under 5s. Under 3s for videos below 60s.

### Never
- Long logo animations, countdowns, "welcome to our channel", music before the voice.
- A different intro per video of one series.

## Outro

### Purpose
Confirm what was learned, name the next action, make help easy to find.

### Required content, in this order
1. **Result line:** "অ্যাকাউন্ট তৈরি সম্পন্ন" or the outcome in one phrase.
2. **Recap:** the step titles as a checklist, ticked in order. Maximum 7 items.
3. **Call to action:** one action, as a button-like block ("এখনই অ্যাকাউন্ট খুলুন").
4. **Support:** phone and email (or link) with hours if relevant. Only contacts the product confirms.
5. **Brand:** logo and domain.
6. **Next video (optional):** title of the logical next topic in the series.

### Styles
| Style | When |
|-------|------|
| `recap` | Tutorials and onboarding. Default. 6 to 7s. |
| `card` | Feed cuts and announcements. 3s: thank-you plus domain. |
| `none` | When the platform adds its own end screen. |

### Timing
- Hold the success result in the main video for 3s before the outro starts.
- Checklist ticks stagger 0.25s apart, finishing by the 3s mark; everything is readable for at least 3 more seconds.
- Voice-over on the outro: one or two lines (result, then help). Do not read the checklist aloud.

### Platform end screens
- YouTube end screens occupy the last 5 to 20s. Keep the right third and the bottom quarter of the frame free of important text when the video will carry them.
- Social feeds: put the CTA and contact in the caption text as well; the outro is not copyable.

## Series consistency
- Same intro style, same outro layout, same colors, same position of the support block.
- Change only the title, the hook and the recap items.
- Keep the support contact in `brand.json` so one edit updates every video.

## Accessibility and safety
- Outro text at least 34px on a 1920 canvas; contrast 7:1.
- Never put a contact that is not verified by the owner.
- Do not use countdown or urgency language unless the offer really expires.

## Review checklist
- [ ] Intro under 5s and the hook is answered later.
- [ ] Voice starts within 0.5s of the intro.
- [ ] Outro has result, recap, CTA, support, brand.
- [ ] Support contacts match the product.
- [ ] Outro fully readable for 3s or more.
- [ ] Same bookends as the rest of the series.
