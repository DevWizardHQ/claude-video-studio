---
name: video-script-review
description: Use after the brief is approved and before any recording. Writes the full reviewable script document (scenes, on-screen actions, narration, captions, tooltips, masking, timing, edge cases) for user approval, then produces the speaker-line sheet with voice brief and pronunciation glossary for the user to record or generate audio. Triggers on video script, narration script, speaker lines, voice-over, audio brief, script approval.
---

# Video Script Review

Two documents, two gates. Nothing is recorded or generated before gate 2.

## Gate 2 - script.md

Use `references/script-template.md`. One table row per scene. Every row has:

- on-screen action (what the cursor does, in product terms)
- narration (final wording in the video language)
- caption (shorter than narration; max 2 lines, about 60 characters per line)
- tooltip or callout (target element and text), when one is needed
- masking (what must be blurred in this scene)
- estimated seconds

Also include: opening and closing cards, the edge-case scenes from `references/edge-cases.md` that the brief selected, and a short list of open questions.

Present the document in full (not a summary) and ask for approval or edits. Apply edits and show only what changed.

## Gate 3 - speaker-lines.md

Only after approval. Use `references/speaker-lines-template.md`.

- Split narration into speaker lines `L01`, `L02`, ... one idea each, at most two short sentences.
- Add delivery notes per line (tone, pause, emphasis) and a pronunciation glossary (OTP, KYC, brand names, numbers).
- Give the voice brief: voice, pace, style prompt, file format (wav, 48 kHz or 44.1 kHz, mono ok), naming `L01.wav`.
- Ask for one file per line. If the user supplies one long file instead, split it by silence and state the confidence honestly.
- Re-record only the lines that change when the script is edited later.

## Bangla notes

- Write the way people speak: short sentences, `আপনি`, comma pauses where a breath belongs.
- Spell abbreviations as they are said (`ওটিপি`, `কেওয়াইসি`).
- Avoid dense conjuncts in captions; check them rendered.
