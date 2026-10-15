---
name: video-script-review
description: Loaded by video-studio at stages 4 and 5 of a video project. Writes the full reviewable script (scenes, narration, captions, tooltips, masking, timing, edge cases) for approval, then the speaker-line sheet with voice brief and glossary so the user can record or generate the audio.
---

# Video Script Review

Two documents, two gates. Runs after the story is approved (stage 3). Nothing is recorded before stage 5 is complete.

## Stage 4 - script.md (gate: script approved)

Use `references/script-template.md`. One table row per scene. Every row has:

- on-screen action (what the cursor does, in product terms)
- narration (final wording in the video language)
- caption (shorter than narration; max 2 lines, about 60 characters per line)
- tooltip or callout (target element and text), when one is needed
- masking (what must be blurred in this scene)
- estimated seconds

Also include: opening and closing cards, the edge-case scenes from `references/edge-cases.md` that the brief selected, and a short list of open questions.

Present the document in full (not a summary). Then ask with AskUserQuestion: Approve (Recommended) / Change the order / Change wording / Add or remove a scene. Apply edits, show only what changed, ask again. Keep each approved version as `script.v1.md`, `script.v2.md`.

## Stage 5 - speaker-lines.md (gate: audio returned)

Only after approval. Use `references/speaker-lines-template.md`.

- Split narration into speaker lines `L01`, `L02`, ... one idea each, at most two short sentences.
- Add delivery notes per line (tone, pause, emphasis) and a pronunciation glossary (OTP, KYC, brand names, numbers).
- Give the voice brief: voice, pace, style prompt, file format (wav or mp3, mono ok), naming `L01.wav`, `L02.wav`.
- Ask for one file per line. After the files arrive run `video-compose/tools/prepare_lines.py speaker-lines.md audio/ voice/`. If the user supplies one long file instead, split it with `split_audio.py` and state the confidence honestly.
- Re-record only the lines that change when the script is edited later.
- The sheet table is machine-read: keep the header `| ID | Scene | Text | Caption | Delivery |` and one row per line.

## Bangla notes

- Write the way people speak: short sentences, `আপনি`, comma pauses where a breath belongs.
- Spell abbreviations as they are said (`ওটিপি`, `কেওয়াইসি`).
- Avoid dense conjuncts in captions; check them rendered.
