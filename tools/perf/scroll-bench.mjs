// usage: node scroll-bench.mjs [url] [seconds] [label]
// Measures scroll-driven frame times on the production build.
// NOTE: this environment has no display, so Chromium runs headless with
// SwiftShader (software GL). Absolute numbers are pessimistic vs a real GPU;
// use them directionally (before vs after) — that is what the plan requires.
import { chromium } from 'playwright';
import fs from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:3999';
const seconds = Number(process.argv[3] ?? 12);
const label = process.argv[4] ?? 'run';

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(8000); // loader 1s delay + 3s fade + GL warmup

const stats = await page.evaluate(async (seconds) => {
  const el = [...document.querySelectorAll('div')].find((d) => {
    const s = getComputedStyle(d);
    return /(auto|scroll)/.test(s.overflowY) && d.scrollHeight > d.clientHeight + 10;
  });
  if (!el) return { error: 'scroll container not found' };
  const max = el.scrollHeight - el.clientHeight;

  const long = [];
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => long.push(e.duration)))
      .observe({ type: 'long-animation-frame', buffered: false });
  } catch {}

  const dts = [];
  const t0 = performance.now();
  let last = t0;
  await new Promise((resolve) => {
    const tick = (now) => {
      dts.push(now - last);
      last = now;
      const p = Math.min((now - t0) / (seconds * 1000), 1);
      el.scrollTop = p * max;
      p < 1 ? requestAnimationFrame(tick) : resolve();
    };
    requestAnimationFrame(tick);
  });
  dts.shift();

  const sorted = [...dts].sort((a, b) => a - b);
  const q = (x) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * x))];
  return {
    frames: dts.length,
    avgMs: +(dts.reduce((a, b) => a + b, 0) / dts.length).toFixed(2),
    p50: +q(0.5).toFixed(2),
    p95: +q(0.95).toFixed(2),
    p99: +q(0.99).toFixed(2),
    maxMs: +sorted.at(-1).toFixed(1),
    framesOver25ms: dts.filter((d) => d > 25).length,
    framesOver50ms: dts.filter((d) => d > 50).count ?? dts.filter((d) => d > 50).length,
    longAnimationFrames: long.length,
  };
}, seconds);

stats.label = label;
console.log(JSON.stringify(stats, null, 2));
fs.writeFileSync(`bench-${label}.json`, JSON.stringify(stats, null, 2));
await browser.close();
