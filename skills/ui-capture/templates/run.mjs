import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, resolve } from 'path';

const { chromium } = createRequire(resolve(process.cwd(), 'noop.js'))('playwright');

const topicPath = resolve(process.argv[2]);
const outDir = resolve(process.argv[3] ?? 'out');
const root = dirname(topicPath);
const topic = JSON.parse(readFileSync(topicPath, 'utf8'));
const phrases = JSON.parse(readFileSync(resolve(root, topic.phrases), 'utf8'));
const voiceDir = resolve(root, topic.voiceDir ?? 'voice');
mkdirSync(outDir, { recursive: true });

const sub = (s) => s.replace(/\$\{env:(\w+)\}/g, (_, k) => process.env[k] ?? '').replace(/\$\{(\w+)\}/g, (_, k) => topic.vars?.[k] ?? '');
const duration = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const guard = (p, ms, label) => {
  let t;
  return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${label} timed out`)), ms); })]).finally(() => clearTimeout(t));
};

const BN = '০১২৩৪৫৬৭৮৯';
const toBn = (s) => s.replace(/\d/g, (d) => BN[d]);
const digitsPattern = (digits) => digits.split('').map((d) => `[${d}${BN[d]}]`).join('[\\s\\-.]*');
const maskTexts = (topic.mask?.texts ?? []).map((m) => ({
  src: `(?:\\+?[8৮][8৮][\\s\\-]*)?(${digitsPattern(m.value.replace(/\D/g, ''))})`,
  keepFirst: m.keepFirst ?? 0,
  method: m.method ?? 'blur',
}));
const maskFields = topic.mask?.fields ?? [];

const initScript = `
(() => {
  const TEXTS = ${JSON.stringify(maskTexts)}.map((m) => ({ ...m, re: new RegExp(m.src, 'd') }));
  const FIELDS = ${JSON.stringify(maskFields)};
  const css = document.createElement('style');
  css.textContent = '#__cur{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border:3px solid #f59e0b;border-radius:50%;background:rgba(245,158,11,.25);z-index:2147483647;pointer-events:none;transition:left .04s linear,top .04s linear}'
    + '.__rip{position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border:3px solid #f59e0b;border-radius:50%;z-index:2147483646;pointer-events:none;animation:__rip .6s ease-out forwards}'
    + '@keyframes __rip{to{transform:scale(4);opacity:0}}'
    + '.__hl{outline:4px solid #f59e0b!important;outline-offset:3px;border-radius:8px}'
    + '.__bl{filter:blur(6px);display:inline-block}'
    + '.__mir{position:fixed;display:flex;align-items:center;white-space:pre;pointer-events:none;z-index:2147483000}';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const splitAt = (str, start, keep) => {
    let seen = 0;
    for (let k = start; k < str.length; k++) {
      if (/[0-9০-৯]/.test(str[k])) { if (seen === keep) return k; seen++; }
    }
    return str.length;
  };
  const textIndex = (v) => {
    for (const m of TEXTS) {
      const r = m.re.exec(v);
      if (r) return { idx: splitAt(v, r.indices[1][0], m.keepFirst), method: m.method };
    }
    return null;
  };
  const blurNode = (n) => {
    const hit = textIndex(n.nodeValue);
    if (!hit) return;
    const f = document.createDocumentFragment();
    f.append(n.nodeValue.slice(0, hit.idx));
    const end = (() => { const m = TEXTS.find((t) => t.re.test(n.nodeValue)); const r = m.re.exec(n.nodeValue); return r.indices[1][1]; })();
    const sp = document.createElement('span'); sp.className = '__bl'; sp.textContent = n.nodeValue.slice(hit.idx, end); f.append(sp);
    f.append(n.nodeValue.slice(end));
    n.replaceWith(f);
  };
  const sweep = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n; (n = w.nextNode());) if (n.parentElement && !n.parentElement.classList.contains('__bl') && textIndex(n.nodeValue)) hits.push(n);
    hits.forEach(blurNode);
  };
  const fieldRule = (input) => {
    if (input.type === 'password') return null;
    for (const rule of FIELDS) {
      if (!input.matches(rule.selector)) continue;
      const v = input.value;
      if (typeof rule.keepFirst === 'number') return v.length > rule.keepFirst ? { idx: rule.keepFirst, method: rule.method ?? 'blur' } : null;
      if (rule.afterLast) { const k = v.lastIndexOf(rule.afterLast); return k >= 0 && k < v.length - 1 ? { idx: k + 1, method: rule.method ?? 'blur' } : null; }
    }
    return input.value ? textIndex(input.value) : null;
  };
  const mirrors = new WeakMap();
  const loop = () => {
    for (const input of document.querySelectorAll('input,textarea')) {
      const rule = fieldRule(input);
      let m = mirrors.get(input);
      const r = input.getBoundingClientRect();
      if (!rule || !r.width) { if (m) { m.style.display = 'none'; input.style.color = ''; } continue; }
      if (!m) { m = document.createElement('div'); m.className = '__mir'; document.body.appendChild(m); mirrors.set(input, m); m.__color = getComputedStyle(input).color; }
      const cs = getComputedStyle(input);
      input.style.color = 'transparent';
      Object.assign(m.style, { display: 'flex', left: r.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth) + 'px', top: r.top + 'px', height: r.height + 'px', font: cs.font, letterSpacing: cs.letterSpacing, color: m.__color });
      const v = input.value;
      const tail = rule.method === 'dots' ? '•'.repeat(v.length - rule.idx) : esc(v.slice(rule.idx));
      m.innerHTML = esc(v.slice(0, rule.idx)) + '<span class="' + (rule.method === 'dots' ? '' : '__bl') + '">' + tail + '</span>';
    }
    requestAnimationFrame(loop);
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
    sweep();
    new MutationObserver(sweep).observe(document.body, { childList: true, subtree: true, characterData: true });
    loop();
  };
  if (document.body) boot(); else addEventListener('DOMContentLoaded', boot);
})();`;

const viewport = topic.viewport ?? { width: 1280, height: 720 };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport, recordVideo: { dir: outDir, size: viewport }, locale: topic.locale ?? 'en-US' });
await ctx.addInitScript(initScript);
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
const t0 = Date.now();
const now = () => (Date.now() - t0) / 1000;
let lastBox = null;

const first = (sel) => page.locator(sel).first();
const moveTo = async (loc, fast = false) => {
  await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await sleep(fast ? 350 : 700);
  const b = await loc.boundingBox();
  lastBox = b;
  await guard(page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: fast ? 14 : 26 }), 8000, 'mouse.move');
  await sleep(fast ? 120 : 250);
};

const cuts = [];
const marks = [];
const run = {
  goto: async (u) => { await page.goto(u.startsWith('http') ? u : topic.base + u, { waitUntil: 'load', timeout: 60000 }); await sleep(1200); },
  click: async (sel, o) => {
    const l = first(sel);
    await moveTo(l);
    if (o.dryRun) { await page.evaluate(() => window.__rip()); return; }
    await l.click({ timeout: o.timeout ?? 30000 });
  },
  hover: async (sel) => { await moveTo(first(sel)); },
  type: async ([sel, v], o = {}) => {
    const l = first(sel);
    await moveTo(l);
    await l.click();
    if (o.clear) await l.fill('');
    await l.pressSequentially(sub(v), { delay: 85 });
  },
  press: async (key) => { await page.keyboard.press(key); },
  highlight: async (sel) => {
    await page.evaluate(() => document.querySelectorAll('.__hl').forEach((e) => e.classList.remove('__hl')));
    const l = first(sel);
    await l.evaluate((e) => e.classList.add('__hl'));
    await moveTo(l);
  },
  check: async (sel) => { const l = first(sel); await moveTo(l); await l.check(); },
  scroll: async (sel) => { await first(sel).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' })); await sleep(500); },
  pause: async (s) => { await sleep(s * 1000); },
  choose: async ([openSel, optionSel, text]) => {
    const c = first(openSel);
    await moveTo(c, true); await c.click();
    const o = page.locator(optionSel, { hasText: text }).first();
    await o.waitFor({ timeout: 15000 });
    await moveTo(o, true); await o.click(); await sleep(250);
  },
  waitEnabled: async (a) => {
    const l = first(a.selector);
    const ws = now();
    const limit = (a.timeoutSeconds ?? 120) * 1000;
    const began = Date.now();
    const ready = () => l.evaluate((e) => !e.disabled && e.getAttribute('aria-disabled') !== 'true' && !/disabled/.test(e.className));
    while (!(await l.isVisible()) || !(await ready())) {
      if (Date.now() - began > limit) throw new Error(`timed out waiting for ${a.selector}`);
      await sleep(500);
    }
    if (now() - ws > 1.5) cuts.push({ ws, we: now() });
  },
  askUser: async (a) => {
    const f = resolve(root, a.file);
    mkdirSync(dirname(f), { recursive: true });
    if (existsSync(f)) unlinkSync(f);
    const ws = now();
    console.log(`WAITING ${f}`);
    const limit = (a.timeoutSeconds ?? 900) * 1000;
    const began = Date.now();
    while (!existsSync(f)) {
      if (Date.now() - began > limit) throw new Error(`timed out waiting for ${f}`);
      await sleep(1000);
    }
    const code = readFileSync(f, 'utf8').trim();
    unlinkSync(f);
    cuts.push({ ws, we: now() });
    const before = page.url();
    const moved = () => page.url() !== before;
    const typeCode = async () => {
      const typingStart = now();
      const boxes = page.locator(a.into);
      if (a.mode === 'each') {
        for (let i = 0; i < code.length && !moved(); i++) {
          await moveTo(boxes.nth(i), true);
          if (moved()) break;
          await boxes.nth(i).fill(code[i]);
        }
      } else {
        const l = boxes.first(); await moveTo(l); await l.click(); await l.pressSequentially(code, { delay: 120 });
      }
      if (a.submit && !moved()) {
        await page.waitForURL((u) => u.toString() !== before, { timeout: 1500 }).catch(() => {});
        if (!moved()) { const b = first(a.submit); await moveTo(b); if (!moved()) await b.click(); }
      }
      marks.push({ kind: 'code-typing', a: typingStart, b: now() });
      await sleep(3500);
    };
    await guard(typeCode(), 60000, 'enter code');
  },
};

const cues = new Map((topic.cues ?? []).map((c) => [c.i, c]));
const events = [];
const callouts = [];
const failures = [];
let shift = 0;
let end = 0;
const EST = 1.7;

try {
  if (topic.start) await run.goto(topic.start);
  for (const a of topic.setup ?? []) {
    const { opts = {}, ...rest } = a;
    const [k] = Object.keys(rest);
    await run[k](rest[k], opts);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  shift = now();

  for (const ph of [...phrases].sort((a, b) => a.i - b.i)) {
    if (topic.stopAfter !== undefined && ph.i > topic.stopAfter) break;
    if (topic.startFromPhrase !== undefined && ph.i < topic.startFromPhrase) continue;
    const audio = resolve(voiceDir, `ph${ph.i}.wav`);
    if (!existsSync(audio)) throw new Error(`missing audio ${audio}`);
    if ((topic.introPhrases ?? []).includes(ph.i) || (topic.outroPhrases ?? []).includes(ph.i)) continue;
    const cue = cues.get(ph.i) ?? { i: ph.i, do: [] };
    const d = duration(audio);
    const start = now();
    lastBox = null;
    const ev = { i: ph.i, t: start - shift, dur: d };
    events.push(ev);
    const limit = Math.max(90, ...(cue.do ?? []).map((a) => (a.askUser ? (a.askUser.timeoutSeconds ?? 900) + 120 : a.waitEnabled ? (a.waitEnabled.timeoutSeconds ?? 120) + 60 : 0))) * 1000;
    console.log(`cue ${ph.i} start`);
    const body = async () => {
      if (cue.land === 'end') await sleep(Math.max(0, d - EST) * 1000);
      for (const a of cue.do ?? []) {
        const { opts = {}, ...rest } = a;
        const [k] = Object.keys(rest);
        if (opts.landEnd) {
          const wait = start + d - EST - now();
          if (wait > 0) await sleep(wait * 1000);
        }
        await run[k](rest[k], opts);
      }
      if (lastBox && !cue.callout) ev.focus = lastBox;
      if (cue.callout) {
        const box = await first(cue.callout.selector).boundingBox();
        const t1 = Math.max(now() - shift + 1.5, start - shift + d + 0.3);
        if (box) callouts.push({ t0: now() - shift, t1, box, text: cue.callout.text });
      }
    };
    try {
      let timer;
      await Promise.race([
        body(),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`cue ${ph.i} timed out`)), limit); }),
      ]);
      clearTimeout(timer);
      console.log(`cue ${ph.i} done`);
    } catch (e) {
      failures.push({ i: ph.i, error: String(e.message).slice(0, 200) });
      console.error(`cue ${ph.i} failed: ${e.message}`);
      if (!topic.continueOnError) throw e;
    }
    writeFileSync(resolve(outDir, 'events.partial.json'), JSON.stringify({ events, cuts, callouts, failures, shift }, null, 1));
    const rest = start + d + 0.1 - now();
    if (rest > 0) await sleep(rest * 1000);
  }
} finally {
  end = now() - shift + 0.3;
  await sleep(300);
  const shifted = cuts.map((c) => ({ ws: c.ws - shift, we: c.we - shift }));
  const shiftedMarks = marks.map((m) => ({ ...m, a: m.a - shift, b: m.b - shift }));
  writeFileSync(resolve(outDir, 'events.json'), JSON.stringify({ events, cuts: shifted, marks: shiftedMarks, callouts, end, shift, failures }, null, 1));
  let vid = '';
  try { vid = await guard(page.video().path(), 10000, 'video path'); } catch {}
  await guard(ctx.close(), 30000, 'context close').catch((e) => console.error(e.message));
  await guard(browser.close(), 15000, 'browser close').catch((e) => console.error(e.message));
  if (vid) writeFileSync(resolve(outDir, 'raw.path'), vid);
  console.log(failures.length ? `DONE with ${failures.length} failure(s)` : `RAW ${vid}`);
}
