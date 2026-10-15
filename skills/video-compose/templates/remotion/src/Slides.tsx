import { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import meta from "../public/meta.json";
import scenesData from "../public/scenes.json";
import brand from "../public/brand.json";

const S = brand.style;
const FONT = "'BrandFont', 'Noto Sans Bengali', system-ui, sans-serif";
const WIN_W = 1500;
const BAR = 54;
const WIN_X = (1920 - WIN_W) / 2;
const WIN_Y = 118;
const INTRO = brand.introSeconds;
const END = brand.outroSeconds;
const IMG_W = scenesData.size.w;
const IMG_H = scenesData.size.h;
const K = WIN_W / IMG_W;
const VIEW_H = IMG_H * K;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

type Box = { x: number; y: number; width: number; height: number };
type Scene = { image: string; t0: number; t1: number; focus: Box | null; step: number };
type Ev = { t: number; dur: number; text: string; step: number };
const scenes = scenesData.scenes as Scene[];
const events = meta.events as Ev[];
const callouts = ((meta as { callouts?: { t0: number; t1: number; box: Box; text: string }[] }).callouts ?? []);
const urls = ((meta as { urls?: { t: number; url: string }[] }).urls ?? []);

const useFont = () => {
  const [h] = useState(() => delayRender("font"));
  useEffect(() => {
    new FontFace("BrandFont", `url(${staticFile(brand.fontFile)})`, { weight: "100 900" })
      .load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const groups = (() => {
  const g: { t0: number; t1: number; text: string }[] = [];
  let cur: Ev[] = [];
  const flush = () => {
    if (!cur.length) return;
    const last = cur[cur.length - 1];
    g.push({ t0: cur[0].t, t1: last.t + last.dur + 0.3, text: cur.map((e) => e.text).join(" ") });
    cur = [];
  };
  for (const e of events) {
    if (cur.length && cur[cur.length - 1].step !== e.step) flush();
    cur.push(e);
    if (/[।!?.]$/.test(e.text)) flush();
  }
  flush();
  return g;
})();

const center = (b: Box | null) => (b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : { x: IMG_W / 2, y: IMG_H / 2 });

const Cursor = ({ t }: { t: number }) => {
  const i = Math.max(0, scenes.findIndex((s) => t >= s.t0 && t < s.t1));
  const sc = scenes[i];
  const prev = center(scenes[i - 1]?.focus ?? null);
  const to = center(sc.focus);
  const p = interpolate(t, [sc.t0, sc.t0 + 0.9], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = interpolate(p, [0, 1], [prev.x, to.x]) * K;
  const y = interpolate(p, [0, 1], [prev.y, to.y]) * K;
  const r = interpolate(t, [sc.t0 + 0.9, sc.t0 + 1.5], [0, 1], clamp);
  return (
    <>
      {sc.focus ? <div style={{ position: "absolute", left: x, top: y, width: 26, height: 26, marginLeft: -13, marginTop: -13, borderRadius: 13, border: "3px solid #f59e0b", background: "rgba(245,158,11,.25)" }} /> : null}
      {sc.focus && r > 0 && r < 1 ? <div style={{ position: "absolute", left: x, top: y, width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, border: "3px solid #f59e0b", scale: String(1 + r * 3), opacity: 1 - r }} /> : null}
    </>
  );
};

const Stage = ({ t, frame }: { t: number; frame: number }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - INTRO * fps + 6, fps, config: { damping: 22, stiffness: 120 } });
  const outStart = (INTRO + meta.innerDur) * fps;
  const outP = interpolate(frame, [outStart, outStart + 18], [0, 1], { ...clamp, easing: ease });
  const idx = Math.max(0, scenes.findIndex((s) => t >= s.t0 && t < s.t1));
  const sc = scenes[idx];
  const fade = interpolate(t, [sc.t0 - 0.05, sc.t0 + 0.3], [0, 1], clamp);
  const c = center(sc.focus);
  const zoomIn = S.zoom === "focus" && sc.focus ? interpolate(t, [sc.t0 + 0.3, sc.t0 + 1.1], [1, brand.zoom], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 1;
  const group = S.captions === "burned" ? groups.find((g) => t >= g.t0 && t < g.t1) : undefined;
  const capO = group ? Math.min(interpolate(t, [group.t0, group.t0 + 0.22], [0, 1], clamp), interpolate(t, [group.t1 - 0.18, group.t1], [1, 0], clamp)) : 0;
  const url = urls.reduce((a, u) => (t >= u.t ? u.url : a), urls[0]?.url ?? brand.domain);
  const tip = callouts.find((x) => t >= x.t0 && t < x.t1);
  return (
    <div style={{ position: "absolute", left: WIN_X, top: WIN_Y, width: WIN_W, opacity: interpolate(pop, [0, 1], [0, 1]) * (1 - outP), scale: String(interpolate(pop, [0, 1], [0.9, 1]) * interpolate(outP, [0, 1], [1, 0.94])) }}>
      <div style={{ borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 40px 90px rgba(0,0,0,.45)" }}>
        {S.frame === "none" ? null : (
          <div style={{ height: BAR, background: "linear-gradient(#f1f3f1,#e4e8e4)", display: "flex", alignItems: "center", padding: "0 20px", gap: 10, borderBottom: "1px solid #cfd6cf" }}>
            {S.frame === "macos" ? ["#ff5f57", "#febc2e", "#28c840"].map((k) => <div key={k} style={{ width: 15, height: 15, borderRadius: 8, background: k }} />) : null}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 640, height: 34, borderRadius: 17, background: "#fff", padding: "0 18px", boxShadow: "inset 0 0 0 1px #d5dbd5", fontFamily: "system-ui, sans-serif", fontSize: 18, color: "#35403a", display: "flex", alignItems: "center" }}>{url}</div>
            </div>
            <div style={{ width: S.frame === "macos" ? 75 : 0 }} />
          </div>
        )}
        <div style={{ position: "relative", width: WIN_W, height: VIEW_H, overflow: "hidden", background: "#fff" }}>
          <div style={{ width: "100%", height: "100%", scale: String(zoomIn), transformOrigin: `${(c.x / IMG_W) * 100}% ${(c.y / IMG_H) * 100}%`, opacity: fade }}>
            <Img src={staticFile(sc.image)} style={{ width: WIN_W, height: VIEW_H, display: "block" }} />
            <Cursor t={t} />
          </div>
          {S.callouts === "tooltip" && tip ? (
            <div style={{ position: "absolute", left: (tip.box.x + tip.box.width / 2) * K, top: (tip.box.y + tip.box.height) * K + 14, translate: "-50% 0", opacity: Math.min(interpolate(t, [tip.t0, tip.t0 + 0.25], [0, 1], clamp), interpolate(t, [tip.t1 - 0.2, tip.t1], [1, 0], clamp)), background: "#fff", color: "#16241b", fontFamily: FONT, fontWeight: 500, fontSize: 26, padding: "10px 20px", borderRadius: 12, boxShadow: "0 10px 26px rgba(0,0,0,.28)", maxWidth: 520, textAlign: "center" }}>{tip.text}</div>
          ) : null}
          {group ? (
            <div style={{ position: "absolute", left: "50%", bottom: 26, translate: "-50% 0", opacity: capO, maxWidth: 980, padding: "12px 28px", borderRadius: 14, background: "rgba(10,22,15,.78)", color: "#f4f7f4", fontFamily: FONT, fontWeight: brand.caption.weight, fontSize: brand.caption.size, lineHeight: 1.55, textAlign: "center", textWrap: "balance" as never }}>{group.text}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 20, stiffness: 110 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: pop }}>
      <div style={{ background: "#fff", borderRadius: 28, padding: "20px 36px", marginBottom: 44 }}><Img src={staticFile(brand.logo)} style={{ height: 96 }} /></div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 80, color: "#fff", textAlign: "center" }}>{title}</div>
      {subtitle ? <div style={{ fontFamily: FONT, fontSize: 38, color: brand.light, marginTop: 18 }}>{subtitle}</div> : null}
    </AbsoluteFill>
  );
};

export const Slides = () => {
  useFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame / fps - INTRO);
  return (
    <AbsoluteFill style={{ background: S.background === "solid" ? brand.dark : `linear-gradient(135deg, ${brand.dark}, ${brand.mid} 60%, ${brand.primary})` }}>
      <Sequence from={0} durationInFrames={INTRO * fps}><Card title={brand.introTitle} subtitle={brand.introSubtitle} /></Sequence>
      <Stage t={t} frame={frame} />
      <Sequence from={Math.round((INTRO + meta.innerDur) * fps)} durationInFrames={END * fps}><Card title={brand.outroTitle} subtitle={brand.domain} /></Sequence>
      <Sequence from={Math.round(INTRO * fps)}><Audio src={staticFile("narration.wav")} /></Sequence>
    </AbsoluteFill>
  );
};
