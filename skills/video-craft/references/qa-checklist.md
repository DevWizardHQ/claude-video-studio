# QA checklist

Run on the rendered MP4. Mark each pass or fail with a timestamp for failures.

## Story and script
- [ ] Promise stated within 10s and delivered.
- [ ] Every approved scene present, in order.
- [ ] Edge cases from the brief appear as scenes.
- [ ] Support contact visible for at least 3s.

## Sync
- [ ] Each click lands within 0.4s of its narrated word.
- [ ] Typing starts with its line.
- [ ] No silence longer than 2.5s except a narrated wait.

## Picture
- [ ] No personal data readable at any frame (extract frames every 2s and check).
- [ ] No caption overlaps the active field.
- [ ] Zoom never above 1.25x; no tooltip during zoom.
- [ ] Logo, colors and font match the brief.

## Text
- [ ] Captions at most 2 lines, 28 to 32px, regular weight.
- [ ] Bangla shaping correct on every caption.
- [ ] Subtitle file timing matches the burned-in text.

## Audio
- [ ] Integrated loudness near -15 LUFS, peak below -1.2 dBTP.
- [ ] No clicks at cuts, no clipped words.
- [ ] Intelligible on phone speakers.

## Delivery
- [ ] MP4 H.264, AAC, 1920x1080, 30 fps.
- [ ] `.srt`, `.vtt`, thumbnail present.
- [ ] File name: `<product>-<topic>-<lang>-v<N>.mp4`.
