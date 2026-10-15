---
name: video-brief-interview
description: Use at the very start of any video request. Interviews the user with AskUserQuestion (options plus a recommended default) to capture goal, audience, language and tone, length and format, brand, flows and edge cases, data masking, voice, captions, music and deliverables, then writes brief.md. Triggers on new video, make a video, tutorial video, promo video, video concept, video brief.
---

# Video Brief Interview

Goal: a complete, approved `brief.md` so nobody has to repeat requirements on the next video.

## Method

1. Read what already exists: repo, product pages, earlier `brief.md` files, brand tokens. Answer what you can yourself.
2. Ask the remaining questions with AskUserQuestion, 3 to 4 questions per call, 2 to 4 options each. First option is your recommendation, labelled `(Recommended)`, with the reason in its description.
3. Use the question bank in `references/question-bank.md`. Skip a question when the answer is already known. Add product-specific questions when the flow has branches.
4. After the last round, write `brief.md` from `references/brief-template.md` and show a short summary. Ask for explicit confirmation. Do not move to the script before it.

## Rules

- Never ask a yes/no question that has a conventional default. State the default and move on.
- Always ask for the edge cases the user wants covered. List the candidates from `video-script-review/references/edge-cases.md` as a multi-select.
- Always ask about masking: which values are real and must never appear.
- Always ask about environment: live site, staging, test accounts, whether the action is allowed to create real records or send real SMS.
- If the user declines a question, record the default and do not ask again.
