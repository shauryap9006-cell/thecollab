// usage: node drawcalls.mjs [url]
// Measures single-frame WebGL draw calls (incl. shadow + transmission passes)
// at 21 scroll offsets. Patches the WebGL context prototypes from an init
// script (runs before any page JS), so no app code changes are required.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3999';

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

await page.addInitScript(() => {
  let count = 0;
  const methods = [
    'drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced',
    'drawArraysInstancedANGLE', 'drawElementsInstancedANGLE', 'drawRangeElements',
  ];
  const patch = (proto) => {
    if (!proto) return;
    for (const m of methods) {
      const orig = proto[m];
      if (typeof orig !== 'function') continue;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      proto[m] = function (...a) { count++; return orig.apply(this, a); };
    }
  };
  patch(window.WebGLRenderingContext && window.WebGLRenderingContext.prototype);
  patch(window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype);
  // Sample the draw calls issued in a single frame: reset in the first rAF
  // callback (which runs after the previous frame's render), read in the next.
  window.__frameDrawCalls = () =>
    new Promise((resolve) => {
      count = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(count)));
    });
});

await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(8000);

const el = await page.evaluateHandle(() =>
  [...document.querySelectorAll('div')].find((d) => {
    const s = getComputedStyle(d);
    return /(auto|scroll)/.test(s.overflowY) && d.scrollHeight > d.clientHeight + 10;
  }),
);
if (!el) {
  console.error('scroll container not found');
  process.exit(1);
}

const out = {};
for (let i = 0; i <= 20; i++) {
  const p = i / 20;
  await page.evaluate(([scrollEl, pos]) => {
    scrollEl.scrollTop = pos * (scrollEl.scrollHeight - scrollEl.clientHeight);
  }, [el, p]);
  await page.waitForTimeout(2500); // let the scroll damping settle
  // median of 3 single-frame samples
  const samples = [];
  for (let s = 0; s < 3; s++) samples.push(await page.evaluate(() => window.__frameDrawCalls()));
  samples.sort((a, b) => a - b);
  out[p.toFixed(2)] = samples[1];
  console.log(`offset ${p.toFixed(2)}: ${samples[1]} draw calls/frame (samples: ${samples.join(', ')})`);
}
console.log(JSON.stringify(out));
await browser.close();
