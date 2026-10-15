import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import brand from "../public/brand.json";

const FONT = "'BrandFont', 'Noto Sans Bengali', system-ui, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

type Extra = { introHook?: string; outroCta?: string; outroSubtitle?: string; supportLines?: string[]; recapTitle?: string };
const x = brand as typeof brand & Extra;

const LogoPill = ({ height = 96 }: { height?: number }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: "20px 36px", display: "inline-flex" }}>
    <Img src={staticFile(brand.logo)} style={{ height }} />
  </div>
);

const useIn = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delay * fps), fps, config: { damping: 20, stiffness: 120 } });
};

export const Intro = ({ fadeOut = true }: { fadeOut?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const hook = brand.style.intro === "hook" && !!x.introHook;
  const split = hook ? Math.round(durationInFrames * 0.5) : 0;
  const out = fadeOut ? interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp) : 1;
  const hookIn = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: ease });
  const hookOut = interpolate(frame, [split - 10, split], [1, 0], clamp);
  const titleIn = useIn(hook ? split / fps : 0);
  const underline = interpolate(frame, [6, 26], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      {hook && frame < split ? (
        <div style={{ opacity: hookIn * hookOut, textAlign: "center", maxWidth: 1400 }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 84, color: "#fff", lineHeight: 1.35 }}>{x.introHook}</div>
          <div style={{ height: 6, width: 220 * underline, background: brand.light, borderRadius: 3, margin: "28px auto 0" }} />
        </div>
      ) : (
        <div style={{ opacity: titleIn, translate: `0 ${interpolate(titleIn, [0, 1], [26, 0])}px`, textAlign: "center" }}>
          <div style={{ marginBottom: 44 }}><LogoPill /></div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 80, color: "#fff", lineHeight: 1.3 }}>{brand.introTitle}</div>
          {brand.introSubtitle ? <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 38, color: brand.light, marginTop: 18 }}>{brand.introSubtitle}</div> : null}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Check = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7bd88a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
);

const Phone = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#bfe8c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
);
const Mail = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#bfe8c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);

const Thanks = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (d: number) => spring({ frame: frame - Math.round(d * fps), fps, config: { damping: 22, stiffness: 120 } });
  const rise = (p: number) => ({ opacity: p, translate: `0 ${interpolate(p, [0, 1], [22, 0])}px` });
  const support = x.supportLines ?? [];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ ...rise(at(0)), marginBottom: 36 }}><LogoPill height={84} /></div>
      <div style={{ ...rise(at(0.2)), fontFamily: FONT, fontWeight: 600, fontSize: 82, color: "#fff", lineHeight: 1.25 }}>{brand.outroTitle}</div>
      {x.outroSubtitle ? <div style={{ ...rise(at(0.35)), fontFamily: FONT, fontWeight: 400, fontSize: 38, color: brand.light, marginTop: 14 }}>{x.outroSubtitle}</div> : null}
      {x.outroCta ? (
        <div style={{ ...rise(at(0.7)), marginTop: 54, background: brand.primary, color: "#fff", fontFamily: FONT, fontWeight: 600, fontSize: 40, padding: "20px 44px", borderRadius: 18, boxShadow: "0 14px 34px rgba(0,0,0,.32)" }}>{x.outroCta}</div>
      ) : null}
      <div style={{ ...rise(at(1.0)), marginTop: 44, display: "flex", gap: 22 }}>
        {support.map((l, i) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 400, fontSize: 32, color: "#fff", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 16, padding: "14px 26px" }}>
            {i === 0 ? <Phone /> : <Mail />}{l}
          </div>
        ))}
      </div>
      <div style={{ ...rise(at(1.3)), marginTop: 36, fontFamily: "system-ui, sans-serif", fontWeight: 500, fontSize: 36, color: brand.light }}>{brand.domain}</div>
    </AbsoluteFill>
  );
};

export const Outro = () => {
  if (brand.style.outro === "thanks") return <Thanks />;
  const recap = brand.style.outro === "recap";
  const head = useIn(0);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = brand.stepTitles;
  const stepGap = Math.min(0.28, 2.2 / Math.max(1, steps.length));
  const support = x.supportLines ?? [];
  if (!recap) {
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: head, translate: `0 ${interpolate(head, [0, 1], [24, 0])}px` }}>
        <div style={{ marginBottom: 40 }}><LogoPill /></div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 84, color: "#fff" }}>{brand.outroTitle}</div>
        <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 500, fontSize: 44, color: brand.light, marginTop: 16 }}>{brand.domain}</div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ padding: "90px 150px", opacity: head }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <LogoPill height={64} />
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 56, color: "#fff" }}>{brand.outroTitle}</div>
      </div>
      <div style={{ display: "flex", gap: 90, marginTop: 70, flex: 1 }}>
        <div style={{ flex: 1.2 }}>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: brand.light, marginBottom: 26 }}>{x.recapTitle ?? "Recap"}</div>
          {steps.map((s, i) => {
            const p = spring({ frame: frame - Math.round((0.5 + i * stepGap) * fps), fps, config: { damping: 22, stiffness: 140 } });
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, opacity: p, translate: `${interpolate(p, [0, 1], [-24, 0])}px 0`, fontFamily: FONT, fontWeight: 400, fontSize: 36, color: "#fff" }}>
                <Check />{s}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          {x.outroCta ? (
            <div style={{ background: brand.primary, color: "#fff", fontFamily: FONT, fontWeight: 600, fontSize: 40, padding: "22px 34px", borderRadius: 18, boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>{x.outroCta}</div>
          ) : null}
          {support.map((l) => (
            <div key={l} style={{ fontFamily: FONT, fontWeight: 400, fontSize: 34, color: "#fff", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 14, padding: "14px 24px" }}>{l}</div>
          ))}
          <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 500, fontSize: 38, color: brand.light }}>{brand.domain}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
