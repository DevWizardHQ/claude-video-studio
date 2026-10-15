import { createRequire } from 'module';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const { chromium } = createRequire(resolve(process.cwd(), 'noop.js'))('playwright');

const [startUrl, outArg, maxArg, stateArg] = process.argv.slice(2);
if (!startUrl) {
  console.error('usage: node crawl.mjs <url> [outDir] [maxPages] [storageState.json]');
  process.exit(1);
}
const outDir = resolve(outArg ?? 'discovery');
const max = Number(maxArg ?? 25);
const origin = new URL(startUrl).origin;
mkdirSync(`${outDir}/shots`, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  storageState: stateArg && existsSync(stateArg) ? stateArg : undefined,
});
const page = await ctx.newPage();
const skip = /\.(pdf|zip|png|jpe?g|gif|svg|webp|mp4|docx?|xlsx?)$|logout|signout|sign-out|delete|\/api\//i;
const queue = [startUrl];
const seen = new Set();
const screens = [];
const slug = (u) => new URL(u).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';

while (queue.length && screens.length < max) {
  const url = queue.shift();
  const key = url.split('#')[0].replace(/\/$/, '');
  if (seen.has(key)) continue;
  seen.add(key);
  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1200);
    const info = await page.evaluate(() => {
      const txt = (e) => (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      const vis = (e) => !!(e.offsetWidth || e.offsetHeight);
      return {
        title: document.title,
        h1: [...document.querySelectorAll('h1,h2')].filter(vis).slice(0, 4).map(txt),
        forms: [...document.forms].map((f) => ({
          action: f.getAttribute('action') || '',
          fields: [...f.querySelectorAll('input,select,textarea')].filter((e) => e.type !== 'hidden').map((e) => ({
            name: e.name || e.id, type: e.type, label: (e.labels?.[0]?.innerText || e.placeholder || '').trim().slice(0, 50), required: e.required,
          })),
          submit: [...f.querySelectorAll('button,[type=submit]')].filter(vis).map(txt).filter(Boolean).slice(0, 3),
        })),
        buttons: [...document.querySelectorAll('button,a.btn,[role=button]')].filter(vis).map(txt).filter(Boolean).slice(0, 12),
        links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
      };
    });
    const file = `shots/${String(screens.length + 1).padStart(2, '0')}-${slug(url)}.png`;
    await page.screenshot({ path: `${outDir}/${file}`, fullPage: true });
    screens.push({ n: screens.length + 1, url, status: res?.status(), title: info.title, headings: info.h1, forms: info.forms, buttons: info.buttons, screenshot: file });
    for (const l of info.links) {
      try {
        const u = new URL(l);
        if (u.origin === origin && !skip.test(u.pathname) && !seen.has(u.href.split('#')[0].replace(/\/$/, ''))) queue.push(u.href.split('#')[0]);
      } catch {}
    }
  } catch (e) {
    screens.push({ n: screens.length + 1, url, error: String(e.message).slice(0, 120) });
  }
}

writeFileSync(`${outDir}/screens.json`, JSON.stringify(screens, null, 1));
const rows = screens.map((s) =>
  `| ${s.n} | ${s.url.replace(origin, '') || '/'} | ${s.title ?? s.error ?? ''} | ${(s.headings ?? []).join(' / ')} | ${(s.forms ?? []).map((f) => f.fields.length + ' fields').join(', ')} | ${s.screenshot ?? ''} |`);
writeFileSync(`${outDir}/screens.md`, ['# Screens found', '', '| # | Path | Title | Headings | Forms | Screenshot |', '|---|------|-------|----------|-------|------------|', ...rows, ''].join('\n'));
await browser.close();
console.log(`${screens.length} screens written to ${outDir}`);
