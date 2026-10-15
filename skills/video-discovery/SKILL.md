---
name: video-discovery
description: Use first when the user gives a URL, a staging link, a folder of screenshots, a Figma export or app screens. Collects every screen, lists forms, buttons and states, shows the inventory, then interviews the user screen by screen about what each screen is for and what the viewer must understand. Triggers on here is the website, my site is, these are the screens, screenshots folder, make a video of this app, explore the site.
---

# Video Discovery

Never write a script from assumptions. Learn the real screens first, then ask what the user thinks about each.

## Step 1 - Collect

| Input | Action |
|-------|--------|
| Live URL | `node tools/crawl.mjs <url> discovery 25 [storageState.json]` from a folder where `playwright` is installed. Read-only: GET only, same origin, never submits forms. |
| Behind a login | Ask the user for a test account; save a Playwright storage state, pass it as the 4th argument. Never use a real customer account. |
| Screenshots / exports | Copy to `discovery/shots/`, number them, describe each with a short note. |
| Nothing yet | Go to `video-source-modes` and choose a source mode. |

Crawling finds pages, not states. Ask about the states a crawl cannot see: modals, validation errors, empty states, success pages, email or SMS content, mobile layouts.

## Step 2 - Show the inventory

Write `discovery/screens.md` (the crawler does this) and show the user the table with a thumbnail path per screen. Look at the screenshots yourself before asking questions.

## Step 3 - Interview per screen

For each screen that may appear in the video, ask with AskUserQuestion (options plus a recommendation, 3 to 4 questions per call):

- **Role**: Show in the video (Recommended when it is on the main flow) / Mention only / Skip.
- **Purpose in one phrase**: offer 2 or 3 drafted phrases from what you saw, plus Other.
- **Viewer must notice**: offer the 2 or 3 most important elements you found.
- **Risks**: personal data on screen, test data needed, an irreversible action.

Group small screens into one question when they share a purpose. Skip screens the user already marked as out of scope.

## Step 4 - Write

Produce `discovery/screen-notes.md`: for each kept screen, URL, purpose, the elements to point at, data to mask, risks. This feeds `video-brief-interview` and `video-story`.
