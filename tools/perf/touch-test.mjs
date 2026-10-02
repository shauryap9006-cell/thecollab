// usage: node touch-test.mjs [url]
// Verifies, with touch emulation, that the page still scrolls natively after
// TouchPanControls switched its touch listeners to `passive: true`.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3999';

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(9000);

const client = await context.newCDPSession(page);

const getScrollTop = () =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => {
      const s = getComputedStyle(d);
      return /(auto|scroll)/.test(s.overflowY) && d.scrollHeight > d.clientHeight + 10;
    });
    return el ? el.scrollTop : null;
  });

const swipe = async (x, y0, y1, steps = 8) => {
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: y0 }],
  });
  for (let i = 1; i <= steps; i++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / steps }],
    });
    await page.waitForTimeout(16);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(800);
};

const before = await getScrollTop();
await swipe(195, 600, 200);
const afterSwipeDown = await getScrollTop();
await swipe(195, 200, 600);
const afterSwipeUp = await getScrollTop();

console.log('scrollTop before      :', before);
console.log('scrollTop after swipe :', afterSwipeDown, '(expected > before)');
console.log('scrollTop after back  :', afterSwipeUp, '(expected < after swipe)');

const scrolledDown = afterSwipeDown !== null && before !== null && afterSwipeDown > before;
const scrolledUp = afterSwipeUp !== null && afterSwipeDown !== null && afterSwipeUp < afterSwipeDown;
console.log('native scroll down works:', scrolledDown);
console.log('native scroll up works  :', scrolledUp);
console.log('console/page errors     :', errors.length ? errors.slice(0, 5) : 'none');

await browser.close();
process.exit(scrolledDown && scrolledUp && errors.length === 0 ? 0 : 1);
