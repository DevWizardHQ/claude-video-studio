import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, resolve } from 'path';

const topicPath = resolve(process.argv[2]);
const outDir = resolve(process.argv[3] ?? 'out');
const root = dirname(topicPath);
const topic = JSON.parse(readFileSync(topicPath, 'utf8'));
mkdirSync(outDir, { recursive: true });

const sub = (s) => s.replace(/\$\{env:(\w+)\}/g, (_, k) => process.env[k] ?? '').replace(/\$\{(\w+)\}/g, (_, k) => topic.vars?.[k] ?? '');
const audioOf = (i) => resolve(root, topic.voiceDir ?? 'voice', `ph${i}.wav`);
const duration = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const bnDigits = (s) => s.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
const maskTexts = (topic.mask?.texts ?? []).flatMap((m) => [m, { ...m, value: bnDigits(m.value) }]);
const maskFields = topic.mask?.fields ?? [];

const initScript = `
(() => {
  const TEXTS = ${JSON.stringify(maskTexts)};
  const FIELDS = ${JSON.stringify(maskFields)};
  const css = document.createElement('style');
  css.textContent = '#__cur{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border:3px solid #f59e0b;border-radius:50%;background:rgba(245,158,11,.25);z-index:2147483647;pointer-events:none;transition:left .04s linear,top .04s linear}'
    + '.__rip{position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border:3px solid #f59e0b;border-radius:50%;z-index:2147483646;pointer-events:none;animation:__rip .6s ease-out forwards}'
    + '@keyframes __rip{to{transform:scale(4);opacity:0}}'
    + '.__hl{outline:4px solid #f59e0b!important;outline-offset:3px;border-radius:8px}'
    + '.__bl{filter:blur(6px);display:inline-block}'
    + '.__mir{position:fixed;display:flex;align-items:center;white-space:pre;pointer-events:none;z-index:2147483000}';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const blurText = (n) => {
    for (const m of TEXTS) {
      const k = n.nodeValue.indexOf(m.value);
      if (k < 0) continue;
      const f = document.createDocumentFragment();
      f.append(n.nodeValue.slice(0, k) + m.value.slice(0, m.keepFirst ?? 0));
      const sp = document.createElement('span'); sp.className = '__bl'; sp.textContent = m.value.slice(m.keepFirst ?? 0); f.append(sp);
      f.append(n.nodeValue.slice(k + m.value.length));
      n.replaceWith(f); return;
    }
  };
  const sweep = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n; (n = w.nextNode());) if (TEXTS.some((m) => n.nodeValue.includes(m.value))) hits.push(n);
    hits.forEach(blurText);
  };
  const blurFrom = (rule, v) => {
    if (typeof rule.keepFirst === 'number') return v.length > rule.keepFirst ? rule.keepFirst : -1;
    if (rule.afterLast) { const k = v.lastIndexOf(rule.afterLast); return k >= 0 && k < v.length - 1 ? k + 1 : -1; }
    return -1;
  };
  const mirror = (input, rule) => {
    const m = document.createElement('div'); m.className = '__mir'; document.body.appendChild(m);
    let color = '';
    const tick = () => {
      const v = input.value, r = input.getBoundingClientRect(), idx = v ? blurFrom(rule, v) : -1;
      if (idx < 0 || !r.width) { m.style.display = 'none'; input.style.color = ''; color = ''; requestAnimationFrame(tick); return; }
      const cs = getComputedStyle(input);
      if (!color) color = cs.color;
      input.style.color = 'transparent';
      Object.assign(m.style, { display: 'flex', left: r.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth) + 'px', top: r.top + 'px', height: r.height + 'px', font: cs.font, letterSpacing: cs.letterSpacing, color });
      m.innerHTML = esc(v.slice(0, idx)) + '<span class="__bl">' + esc(v.slice(idx)) + '</span>';
      requestAnimationFrame(tick);
    };
    tick();
  };
  const boot = () => {
    document.head.appendChild(css);
    const cur = Object.assign(document.createElement('div'), { id: '__cur' });
    document.body.append(cur);
    cur.style.left = '-50px';
    const rip = (x, y) => { const r = document.createElement('div'); r.className = '__rip'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); };
    addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', (e) => rip(e.clientX, e.clientY), true);
    window.__rip = () => rip(parseFloat(cur.style.left), parseFloat(cur.style.top));
    window.__hl = (sel) => { document.querySelectorAll('.__hl').forEach((e) => e.classList.remove('__hl')); const e = sel && document.querySelector(sel); if (e) e.classList.add('__hl'); };
    sweep();
    new MutationObserver(sweep).observe(document.body, { childList: true, subtree: true, characterData: true });
    const wire = () => FIELDS.forEach((rule) => { const el = document.querySelector(rule.selector); if (el && !el.__mirrored) { el.__mirrored = true; mirror(el, rule); } });
    wire();
    new MutationObserver(wire).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) boot(); else addEventListener('DOMContentLoaded', boot);
})();`;

const viewport = topic.viewport ?? { width: 1280, height: 720 };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport, recordVideo: { dir: outDir, size: viewport }, locale: topic.locale ?? 'en-US' });
await ctx.addInitScript(initScript);
const page = await ctx.newPage();
const t0 = Date.now();
const now = () => (Date.now() - t0) / 1000;
let lastBox = null;

const moveTo = async (loc, fast = false) => {
  await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await sleep(fast ? 350 : 700);
  const b = await loc.boundingBox();
  lastBox = b;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: fast ? 14 : 26 });
  await sleep(fast ? 120 : 250);
};

const cuts = [];
const run = {
  goto: async (u) => { await page.goto(u.startsWith('http') ? u : topic.base + u, { waitUntil: 'load', timeout: 60000 }); await sleep(1200); },
  click: async (sel, o) => {
    const l = page.locator(sel).first();
    await moveTo(l);
    if (o.dryRun) { await page.evaluate(() => window.__rip()); return; }
    await l.click();
  },
  hover: async (sel) => { await moveTo(page.locator(sel).first()); },
  type: async ([sel, v]) => { const l = page.locator(sel); await moveTo(l); await l.click(); await l.pressSequentially(sub(v), { delay: 85 }); },
  press: async (key) => { await page.keyboard.press(key); },
  highlight: async (sel) => { await page.evaluate((s) => window.__hl(s), sel); await moveTo(page.locator(sel)); },
  check: async (sel) => { const l = page.locator(sel); await moveTo(l); await l.check(); },
  scroll: async (sel) => { await page.locator(sel).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' })); await sleep(500); },
  pause: async (s) => { await sleep(s * 1000); },
  choose: async ([openSel, optionSel, text]) => {
    const c = page.locator(openSel).first();
    await moveTo(c, true); await c.click();
    const o = page.locator(optionSel, { hasText: text }).first();
    await o.waitFor({ timeout: 15000 });
    await moveTo(o, true); await o.click(); await sleep(250);
  },
  askUser: async (a) => {
    const f = resolve(root, a.file);
    mkdirSync(dirname(f), { recursive: true });
    if (existsSync(f)) unlinkSync(f);
    const ws = now();
    while (!existsSync(f)) await sleep(1000);
    const code = readFileSync(f, 'utf8').trim();
    unlinkSync(f);
    cuts.push({ ws, we: now() });
    const boxes = page.locator(a.into);
    if (a.mode === 'each') {
      for (let i = 0; i < code.length; i++) { await moveTo(boxes.nth(i), true); await boxes.nth(i).fill(code[i]); }
    } else {
      const l = boxes.first(); await moveTo(l); await l.click(); await l.pressSequentially(code, { delay: 120 });
    }
    if (a.submit) { const b = page.locator(a.submit).first(); await moveTo(b); await b.click(); await sleep(3500); }
  },
};

if (topic.start) await run.goto(topic.start);
await page.evaluate(() => window.scrollTo(0, 0));
const shift = now();
const events = [];
const callouts = [];
const EST = 1.7;

for (const cue of topic.cues) {
  const d = duration(audioOf(cue.i));
  const start = now();
  lastBox = null;
  const ev = { i: cue.i, t: start - shift, dur: d };
  events.push(ev);
  if (cue.land === 'end') await sleep(Math.max(0, d - EST) * 1000);
  for (const a of cue.do ?? []) {
    const { opts = {}, ...rest } = a;
    const [k] = Object.keys(rest);
    await run[k](rest[k], opts);
  }
  if (lastBox) ev.focus = lastBox;
  if (cue.callout) {
    const box = await page.locator(cue.callout.selector).first().boundingBox();
    if (box) callouts.push({ t0: now() - shift, t1: start - shift + d + 0.3, box, text: cue.callout.text });
  }
  const rest = start + d + 0.1 - now();
  if (rest > 0) await sleep(rest * 1000);
}

const end = now() - shift + 0.3;
await sleep(300);
const shifted = cuts.map((c) => ({ ws: c.ws - shift, we: c.we - shift }));
writeFileSync(resolve(outDir, 'events.json'), JSON.stringify({ events, cuts: shifted, callouts, end, shift }, null, 1));
const vid = await page.video().path();
await ctx.close();
await browser.close();
writeFileSync(resolve(outDir, 'raw.path'), vid);
console.log('RAW', vid);
