# Animation and motion design

Based on classic animation principles, tuned for UI explainers at 30 fps.

## Easing
- **Enter:** ease-out (fast then slow), `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Exit:** ease-in, shorter than the enter.
- **Move between states:** ease-in-out.
- Never linear, except for loops and progress bars.

## Durations (seconds)
| Element | Enter | Exit |
|---------|-------|------|
| Caption | 0.20 | 0.18 |
| Tooltip | 0.25 | 0.20 |
| Step chip | 0.35 (spring) | 0.20 |
| Window pop-in | 0.5 (spring) | 0.6 |
| Card (intro/outro) | 0.6 (spring) | 0.45 |

## Principles applied
1. **Anticipation and follow-through:** a button gets a tiny scale dip before the click ripple.
2. **Staging:** one focal animation at a time.
3. **Slow in, slow out:** every move eased.
4. **Secondary action:** the progress bar advances while the chip changes, never before.
5. **Timing:** faster = lighter and more urgent; slower = calmer and more premium. Tutorials sit calm.
6. **Exaggeration:** 8 to 12px offset for slide-ins; more looks like a toy.

## Springs
Use springs for entrances that should feel physical: `damping 18-22`, `stiffness 110-160`. No overshoot for text blocks; light overshoot for badges.

## Consistency
Same easing, same offsets and same durations for the whole series. Define them once in `brand.json` or the component, not per scene.

## Remotion specifics
Drive everything from `useCurrentFrame()` and `interpolate()`. CSS transitions do not render. Keyframe arrays passed to `interpolate` must be strictly increasing.
