// usage: node probe.mjs [url]
// Phase 0.4: records (1) the real LCP element, (2) renderer stats
// (draw calls / triangles) at 11 scroll offsets, and (3) the scroll-offset
// range where each named section is inside the camera frustum.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3999';

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript(() => {
  window.__lcp = [];
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp.push(e);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
});
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(8000);

// --- 1. Real LCP element ---
const lcp = await page.evaluate(() => {
  const entries = window.__lcp ?? [];
  const last = entries.at(-1);
  if (!last) return { entryCount: 0 };
  const el = last.element;
  return {
    startTime: Math.round(last.startTime),
    size: last.size,
    tag: el?.tagName,
    id: el?.id,
    className: el?.className,
    text: el?.textContent?.slice(0, 80),
    url: el?.currentSrc ?? el?.src ?? null,
    entryCount: entries.length,
  };
});
console.log('LCP:', JSON.stringify(lcp, null, 2));

// --- 2. Renderer stats per scroll offset ---
const el = await page.evaluateHandle(() =>
  [...document.querySelectorAll('div')].find((d) => {
    const s = getComputedStyle(d);
    return /(auto|scroll)/.test(s.overflowY) && d.scrollHeight > d.clientHeight + 10;
  }),
);

const statsByOffset = {};
for (const p of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) {
  await page.evaluate(([scrollEl, pos]) => {
    window.__scrollOffset = pos;
    scrollEl.scrollTop = pos * (scrollEl.scrollHeight - scrollEl.clientHeight);
  }, [el, p]);
  await page.waitForTimeout(2500); // damping settle
  const s = await page.evaluate(() => window.__glStats);
  statsByOffset[p.toFixed(1)] = s;
  console.log(
    `offset ${p.toFixed(1)}: calls=${s?.calls} tris=${s?.triangles} geoms=${s?.geometries} tex=${s?.textures}`,
  );
}

// --- 3. Section visibility ranges (slow sweep down, then up) ---
console.log('sweeping for visibility ranges...');
await page.evaluate(() => { window.__vis = {}; });
const steps = 51;
for (let i = 0; i <= steps; i++) {
  const p = i / steps;
  await page.evaluate(([scrollEl, pos]) => {
    scrollEl.scrollTop = pos * (scrollEl.scrollHeight - scrollEl.clientHeight);
  }, [el, p]);
  await page.waitForTimeout(350);
}
for (let i = steps; i >= 0; i--) {
  const p = i / steps;
  await page.evaluate(([scrollEl, pos]) => {
    scrollEl.scrollTop = pos * (scrollEl.scrollHeight - scrollEl.clientHeight);
  }, [el, p]);
  await page.waitForTimeout(350);
}
const vis = await page.evaluate(() =>
  Object.fromEntries(
    Object.entries(window.__vis ?? {}).map(([k, v]) => {
      const arr = [...v];
      return [k, [Math.min(...arr), Math.max(...arr), arr.length]];
    }),
  ),
);
console.log('VISIBILITY RANGES (scroll offset [min, max, samples]):');
console.log(JSON.stringify(vis, null, 2));

await browser.close();
console.log('PROBE DONE');
