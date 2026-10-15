# Cursor and interaction choreography

The cursor is the lead actor. Direct it like one.

## Principles
1. **Arrive before the voice names it.** The cursor settles on the target 0.2 to 0.4s before the narrated word, so the eye is already there.
2. **One mover at a time.** While the cursor travels, nothing else on screen animates.
3. **Eased paths.** Ease-in-out over 0.5 to 0.9s; never constant speed, never teleport. Arc slightly on long moves.
4. **Settle, then act.** Pause 0.2 to 0.3s on the target, then click or type.
5. **Visible acknowledgements.** Click ripple, focus ring, field highlight. The viewer should never wonder whether it registered.
6. **Typing is human.** 70 to 100 ms per character, no instant fill. Pause after the last character before moving on.
7. **No dead travel.** Do not drag the cursor across the page for nothing; cut or speed through it.

## Timing table
| Action | Typical duration |
|--------|------------------|
| Move to a nearby field | 0.5s |
| Move across the page | 0.8 to 1.0s |
| Click ripple | 0.6s |
| Type 10 characters | 0.9s |
| Open a dropdown and choose | 1.8 to 2.5s |
| Scroll to a field | 0.6 to 0.8s |

## Sync rules
- Typing lines start when typing starts.
- Click lines land the click on the last stressed word.
- Selection from a dropdown: say the choice as it is picked, not before.
- Waits (OTP, loading) get a narrated reason ("কোড আসতে কিছুক্ষণ লাগতে পারে") and are cut in the edit.

## Never
- Hover over a destructive control "for effect".
- Leave the cursor resting over text the viewer must read.
- Let the cursor exit the frame mid-scene.
