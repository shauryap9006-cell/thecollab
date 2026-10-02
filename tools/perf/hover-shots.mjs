// usage: node hover-shots.mjs <label> [url]
// Captures the footer link hover at rest, mid-tween, settled and mid-exit, so the
// letterSpacing slide can be compared against the opacity crossfade.
import { chromium } from 'playwright';
import fs from 'node:fs';

const label = process.argv[2];
const url = process.argv[3] ?? 'http://localhost:3999';
fs.mkdirSync(`shots/${label}`, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(8000);

const el = await page.evaluateHandle(() =>
  [...document.querySelectorAll('div')].find((d) => {
    const s = getComputedStyle(d);
    return /(auto|scroll)/.test(s.overflowY) && d.scrollHeight > d.clientHeight + 10;
  }),
);

// Footer is the last section.
await page.evaluate(([scrollEl]) => {
  scrollEl.scrollTop = scrollEl.scrollHeight;
}, [el]);
await page.waitForTimeout(3500);

const shot = (name) => page.screenshot({ path: `shots/${label}/${name}.png` });
await shot('rest');

// drei's useCursor sets body.style.cursor, which is how we find a hoverable link.
let hit = null;
outer: for (let y = 380; y <= 880 && !hit; y += 25) {
  for (let x = 80; x <= 1000; x += 25) {
    await page.mouse.move(x, y);
    const cursor = await page.evaluate(() => document.body.style.cursor);
    if (cursor === 'pointer') {
      hit = { x, y };
      break outer;
    }
  }
}

if (!hit) {
  console.log('NO_HOVERABLE_POINT');
} else {
  console.log('hover point:', JSON.stringify(hit));
  await page.mouse.move(20, 880);
  await page.waitForTimeout(1200);
  await page.mouse.move(hit.x, hit.y);
  await page.waitForTimeout(120); // mid-tween: the 300ms slide/crossfade
  await shot('mid-hover');
  await page.waitForTimeout(700); // settled
  await shot('settled-hover');
  await page.mouse.move(20, 880);
  await page.waitForTimeout(120); // mid-exit
  await shot('mid-exit');
  await page.waitForTimeout(700);
  await shot('rest-again');
}

await browser.close();
