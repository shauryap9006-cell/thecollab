// usage: node shots.mjs <label> [url]
// Captures 21 screenshots at scroll offsets 0..1 (step 0.05), waiting 2s at
// each offset so the ScrollControls damping settles before the shot.
import { chromium } from 'playwright';
import fs from 'node:fs';

const label = process.argv[2];
const url = process.argv[3] ?? 'http://localhost:3999';
if (!label) { console.error('usage: node shots.mjs <label> [url]'); process.exit(1); }
fs.mkdirSync(`shots/${label}`, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(8000);

const handle = await page.evaluateHandle(() =>
  [...document.querySelectorAll('div')].find((d) => {
    const s = getComputedStyle(d);
    return /(auto|scroll)/.test(s.overflowY) && d.scrollHeight > d.clientHeight + 10;
  }),
);

for (let i = 0; i <= 20; i++) {
  await page.evaluate(([el, p]) => { el.scrollTop = p * (el.scrollHeight - el.clientHeight); }, [handle, i / 20]);
  await page.waitForTimeout(2000); // let the scroll damping settle
  await page.screenshot({ path: `shots/${label}/offset-${String(i).padStart(2, '0')}.png` });
}
await browser.close();
console.log(`shots/${label}: 21 screenshots`);
