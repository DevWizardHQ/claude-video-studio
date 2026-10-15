# Question bank

Ask in this order. Rounds of 3 to 4 questions. Recommendation first.

## Round 1 - purpose
- **Video type**: Step-by-step tutorial (Recommended for features) / Product explainer / Marketing promo / Announcement.
- **Audience**: End customers with low digital literacy (Recommended for public services) / Staff or operators / Developers / Investors or partners.
- **Success action**: What must the viewer do after watching (register, verify, pay, contact support).
- **Series**: One-off or part of a series. A series shares intro, outro, colors, voice.

## Round 2 - language and voice
- **Language**: Bangla / English / Bangla with English UI terms kept (Recommended when the UI is mixed).
- **Register**: Warm and conversational "আপনি" (Recommended) / Formal / Playful.
- **Voice source**: User's own recording (most natural) / TTS from a tool the user runs (Recommended when no studio). The user always produces the audio; Claude does not synthesize it.
- **Pace**: Medium-slow (Recommended for tutorials) / Normal.

## Round 3 - format and brand
- **Aspect**: 16:9 for web and YouTube (Recommended, ready) / 9:16 for Shorts and Reels (planned: needs a vertical composition) / 1:1 for feeds (planned).
- **Length**: Under 60s / 60 to 120s (Recommended for one flow) / 2 to 4 min.
- **Brand**: Logo file, primary color, font, URL to show. Use the product site when not given.
- **Intro**: Hook line then title (Recommended for public tutorials) / Title card / None. Ask for the hook line or draft two options from the story.
- **Outro**: Thank-you with call to action and support contacts (Recommended for tutorials) / Add a step recap checklist / Plain thank-you card / None. Ask for the CTA text and confirm every support contact.

## Round 4 - content depth
- **Flow coverage**: Happy path only / Happy path plus edge cases (Recommended).
- **Edge cases** (multi-select): see edge-cases.md.
- **Support contact** shown at the end of failure scenes: phone, email, link, hours.
- **Callouts**: Tooltip callouts on key fields (Recommended) / Captions only.

## Round 5 - safety and delivery
- **Environment**: Live production / Staging / Local. Is creating real records or sending real SMS allowed.
- **Masking**: Values that must never show. Method: blur (Recommended) / dots. Passwords always stay as native dots.
- **Test account**: Use user-provided data or generate.
- **Deliverables** (multi-select): MP4 (always) / SRT captions / thumbnail PNG / vertical cut / per-step GIFs.
- **Review rounds**: Script, speaker lines, stills, final (Recommended: all four).

## Round 6 - on-screen text and style (ask every time)
- **Text on screen**: Burned-in captions (Recommended for public tutorials and feeds) / Sidecar subtitles only (SRT and VTT, viewer toggles) / Both / Voice only.
- **Tooltips**: Yes, one short pointer on key fields (Recommended) / No.
- **Caption animation**: Fade-up (Recommended) / Fade / Typewriter. Show `video-compose/references/style-catalog.md`.
- **Browser frame**: macOS window (Recommended) / Minimal address bar / None. Mark planned items as planned.
- **Camera**: Smooth focus zoom (Recommended) / Static.
- **Chrome**: Step chip and progress bar on (Recommended) / Off.
- **Intro and outro**: Card (Recommended) / None.
Offer the full list from the style catalog when the user asks "what is available".
