import { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import meta from "../public/meta.json";
import brand from "../public/brand.json";
import { Intro, Outro } from "./Bookends";

export const FPS = 30;

const S = brand.style;
const FONT = "'BrandFont', 'Noto Sans Bengali', system-ui, sans-serif";
const WIN_W = 1500;
const VIEW_W = brand.viewport.width;
const VIEW_H = brand.viewport.height;
const K = WIN_W / VIEW_W;
const VIEW_PX_H = VIEW_H * K;
const BAR = 54;
const WIN_X = (1920 - WIN_W) / 2;
const WIN_Y = 118;
const INTRO = S.intro === "none" ? 0 : brand.introSeconds;
const END = S.outro === "none" ? 0 : brand.outroSeconds;

const BN = "০১২৩৪৫৬৭৮৯";
const num = (n: number) => (brand.numerals === "bn" ? String(n).replace(/\d/g, (d) => BN[Number(d)]) : String(n));

type Box = { x: number; y: number; width: number; height: number };
type Ev = { i: number; t: number; dur: number; text: string; step: number; focus?: Box | null };
type Callout = { t0: number; t1: number; box: Box; text: string };
const events = meta.events as Ev[];
const callouts = ((meta as { callouts?: Callout[] }).callouts ?? []) as Callout[];
const urls = ((meta as { urls?: { t: number; url: string }[] }).urls ?? []) as { t: number; url: string }[];

const useFont = () => {
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    const f = new FontFace("BrandFont", `url(${staticFile(brand.fontFile)})`, { weight: "100 900" });
    f.load().then((l) => { document.fonts.add(l); continueRender(handle); }).catch((err) => { console.error("font failed", err); continueRender(handle); });
  }, [handle]);
};

const captionGroups = (() => {
  const groups: { t0: number; t1: number; text: string }[] = [];
  let cur: Ev[] = [];
  const flush = () => {
    if (!cur.length) return;
    const last = cur[cur.length - 1];
    groups.push({ t0: cur[0].t, t1: last.t + last.dur, text: cur.map((e) => e.text).join(" ") });
    cur = [];
  };
  for (const e of events) {
    if (cur.length && cur[cur.length - 1].step !== e.step) flush();
    cur.push(e);
    if (/[।!?.؟。！？]\s*$/.test(e.text)) flush();
  }
  flush();
  return groups.map((g, k, a) => ({ ...g, t1: Math.min(g.t1 + 0.35, a[k + 1] ? a[k + 1].t0 : g.t1 + 0.35) }));
})();

const stepStarts = (() => {
  const s: number[] = [];
  for (const e of events) if (s[e.step] === undefined) s[e.step] = e.t;
  return s;
})();

const zoomKeys = (() => {
  const segs = events.filter((e) => e.focus).map((e) => ({
    t0: e.t, t1: e.t + e.dur, cx: e.focus!.x + e.focus!.width / 2, cy: e.focus!.y + e.focus!.height / 2,
  }));
  const keys: { t: number; s: number; cx: number; cy: number }[] = [];
  const push = (k: { t: number; s: number; cx: number; cy: number }) => {
    const last = keys[keys.length - 1];
    keys.push({ ...k, t: last && k.t < last.t + 0.25 ? last.t + 0.25 : k.t });
  };
  segs.forEach((g, i) => {
    const prev = segs[i - 1];
    const chained = prev && g.t0 - prev.t1 < 1.6;
    push({ t: g.t0 - 0.5, s: chained ? brand.zoom : 1, cx: chained ? prev.cx : g.cx, cy: chained ? prev.cy : g.cy });
    push({ t: g.t0, s: brand.zoom, cx: g.cx, cy: g.cy });
    push({ t: g.t1 + 0.1, s: brand.zoom, cx: g.cx, cy: g.cy });
    const next = segs[i + 1];
    if (!next || next.t0 - g.t1 >= 1.6) push({ t: g.t1 + 0.7, s: 1, cx: g.cx, cy: g.cy });
  });
  return keys;
})();

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Lock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6b63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const Tooltip = ({ c, t }: { c: Callout; t: number }) => {
  const a = interpolate(t, [c.t0, c.t0 + 0.25], [0, 1], { ...clamp, easing: ease });
  const b = interpolate(t, [c.t1 - 0.2, c.t1], [1, 0], clamp);
  const o = Math.min(a, b);
  const cx = (c.box.x + c.box.width / 2) * K;
  const above = c.box.y * K > 150;
  const top = above ? c.box.y * K - 12 : (c.box.y + c.box.height) * K + 12;
  return (
    <div style={{ position: "absolute", left: cx, top, opacity: o, translate: `-50% ${above ? "-100%" : "0"}`, pointerEvents: "none" }}>
      {above ? null : <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "10px solid #fff" }} />}
      <div style={{ background: "#fff", color: "#16241b", fontFamily: FONT, fontWeight: 500, fontSize: 26, lineHeight: 1.4, padding: "10px 20px", borderRadius: 12, boxShadow: "0 10px 26px rgba(0,0,0,.28)", maxWidth: 520, textAlign: "center" }}>{c.text}</div>
      {above ? <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid #fff" }} /> : null}
    </div>
  );
};

const Window = ({ t, frame }: { t: number; frame: number }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - Math.round(INTRO * fps) + 6, fps, config: { damping: 22, stiffness: 120 } });
  const outStart = Math.round((INTRO + meta.innerDur) * fps);
  const outP = interpolate(frame, [outStart, outStart + 18], [0, 1], { ...clamp, easing: ease });
  const scale = interpolate(pop, [0, 1], [0.9, 1]) * interpolate(outP, [0, 1], [1, 0.94]);
  const opacity = interpolate(pop, [0, 1], [0, 1]) * (1 - outP);

  const ks = zoomKeys.map((k) => k.t);
  const inRange = S.zoom === "focus" && ks.length > 1 && t >= ks[0] && t <= ks[ks.length - 1];
  const ip = (vals: number[]) => interpolate(t, ks, vals, { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zs = inRange ? ip(zoomKeys.map((k) => k.s)) : 1;
  const zx = inRange ? ip(zoomKeys.map((k) => k.cx)) : VIEW_W / 2;
  const zy = inRange ? ip(zoomKeys.map((k) => k.cy)) : VIEW_H / 2;

  const group = S.captions === "burned" ? captionGroups.find((g) => t >= g.t0 && t < g.t1) : undefined;
  let capO = 0, capY = 10;
  if (group) {
    const a = interpolate(t, [group.t0, group.t0 + 0.22], [0, 1], { ...clamp, easing: ease });
    const b = interpolate(t, [group.t1 - 0.18, group.t1], [1, 0], clamp);
    capO = Math.min(a, b);
    capY = S.captionAnimation === "fade-up" ? interpolate(a, [0, 1], [10, 0]) : 0;
  }
  const url = urls.reduce((acc, u) => (t >= u.t ? u.url : acc), urls[0]?.url ?? brand.domain);
  const activeCallout = callouts.find((c) => t >= c.t0 && t < c.t1);

  return (
    <div style={{ position: "absolute", left: WIN_X, top: WIN_Y, width: WIN_W, opacity, scale: String(scale), transformOrigin: "50% 40%" }}>
      <div style={{ borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 40px 90px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08)" }}>
        {S.frame === "none" ? null : <div style={{ height: BAR, background: "linear-gradient(#f1f3f1,#e4e8e4)", display: "flex", alignItems: "center", padding: "0 20px", gap: 10, borderBottom: "1px solid #cfd6cf" }}>
          {S.frame === "macos" ? ["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />) : null}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: 640, height: 34, borderRadius: 17, background: "#fff", padding: "0 18px", boxShadow: "inset 0 0 0 1px #d5dbd5", fontFamily: "system-ui, sans-serif", fontSize: 18, color: "#35403a" }}>
              <Lock /><span>{url}</span>
            </div>
          </div>
          <div style={{ width: S.frame === "macos" ? 75 : 0 }} />
        </div>}
        <div style={{ position: "relative", width: WIN_W, height: VIEW_PX_H, overflow: "hidden", background: "#fff" }}>
          <div style={{ width: "100%", height: "100%", scale: String(zs), transformOrigin: `${(zx / VIEW_W) * 100}% ${(zy / VIEW_H) * 100}%` }}>
            <OffthreadVideo src={staticFile("inner.mp4")} muted style={{ width: WIN_W, height: VIEW_PX_H, display: "block" }} />
          </div>
          {S.callouts === "tooltip" && activeCallout ? <Tooltip c={activeCallout} t={t} /> : null}
          {group ? (
            <div style={{ position: "absolute", left: "50%", bottom: 26, translate: `-50% ${capY}px`, opacity: capO, maxWidth: 980, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 28px", borderRadius: 14, background: "rgba(10,22,15,.78)", color: "#f4f7f4", fontFamily: FONT, fontWeight: brand.caption.weight, fontSize: brand.caption.size, lineHeight: 1.55, textAlign: "center", textWrap: "balance" as never }}>
              {S.captionAnimation === "typewriter"
                ? group.text.slice(0, Math.ceil(group.text.length * interpolate(t, [group.t0, group.t0 + Math.max(0.6, (group.t1 - group.t0) * 0.7)], [0, 1], clamp)))
                : group.text}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Hud = ({ t, frame }: { t: number; frame: number }) => {
  const { fps } = useVideoConfig();
  const total = brand.stepTitles.length;
  const step = Math.min(total - 1, Math.max(0, stepStarts.reduce((acc, s, i) => (s !== undefined && t >= s ? i : acc), 0)));
  const outStart = Math.round((INTRO + meta.innerDur) * fps);
  const p = interpolate(frame, [Math.round(INTRO * fps) - 6, Math.round(INTRO * fps) + 14], [0, 1], { ...clamp, easing: ease }) * interpolate(frame, [outStart - 6, outStart + 10], [1, 0], clamp);
  const chip = spring({ frame: frame - Math.round(((stepStarts[step] ?? 0) + INTRO) * fps), fps, config: { damping: 18, stiffness: 160 } });
  return (
    <>
      <div style={{ position: "absolute", left: WIN_X, top: 28, opacity: p, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "8px 16px", display: "flex" }}><Img src={staticFile(brand.logo)} style={{ height: 44 }} /></div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 32, color: "#fff" }}>{brand.hudTitle}</div>
      </div>
      {S.stepChip ? <div style={{ position: "absolute", right: WIN_X, top: 30, opacity: p, translate: `0 ${interpolate(chip, [0, 1], [10, 0])}px`, display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 40, padding: "9px 22px", fontFamily: FONT, color: "#fff", fontSize: 26, fontWeight: 500 }}>
        <span style={{ background: brand.primary, borderRadius: 20, padding: "2px 16px", fontWeight: 600 }}>{brand.stepLabel} {num(step + 1)}/{num(total)}</span>
        <span>{brand.stepTitles[step]}</span>
      </div> : null}
      {S.progress === "bar" ? <div style={{ position: "absolute", left: WIN_X, width: WIN_W, top: 1030, opacity: p, display: "flex", gap: 8 }}>
        {brand.stepTitles.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < step ? "#7bd88a" : i === step ? "#fff" : "rgba(255,255,255,.22)" }} />
        ))}
      </div> : null}
    </>
  );
};

export const Tutorial = () => {
  useFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame / fps - INTRO);
  const drift = frame / fps;
  return (
    <AbsoluteFill style={{ background: S.background === "solid" ? brand.dark : `linear-gradient(135deg, ${brand.dark}, ${brand.mid} 60%, ${brand.primary})`, fontFamily: FONT }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 600px at ${30 + Math.sin(drift / 4) * 8}% ${20 + Math.cos(drift / 5) * 8}%, rgba(255,255,255,.14), transparent 70%)` }} />
      {INTRO > 0 ? <Sequence from={0} durationInFrames={Math.round(INTRO * fps)}><Intro /></Sequence> : null}
      <Window t={t} frame={frame} />
      <Hud t={t} frame={frame} />
      {END > 0 ? (
        <Sequence from={Math.round((INTRO + meta.innerDur) * fps)} durationInFrames={Math.round(END * fps)}>
          <Outro />
        </Sequence>
      ) : null}
      <Sequence from={Math.round(INTRO * fps)}><Audio src={staticFile("narration.wav")} /></Sequence>
    </AbsoluteFill>
  );
};
