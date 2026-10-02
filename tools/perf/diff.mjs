// usage: node diff.mjs <labelA> <labelB>
// Pixel-match two screenshot sets; prints % of differing pixels per offset.
// Time-driven motion (cloud drift, star twinkle) makes the diff non-zero even
// between two identical builds — compare against the before/before2 noise floor.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [a, b] = process.argv.slice(2);
if (!a || !b) { console.error('usage: node diff.mjs <labelA> <labelB>'); process.exit(1); }
const out = `shots/diff-${a}-vs-${b}`;
fs.mkdirSync(out, { recursive: true });

let total = 0;
let max = 0;
let count = 0;
for (const f of fs.readdirSync(`shots/${a}`)) {
  const A = PNG.sync.read(fs.readFileSync(`shots/${a}/${f}`));
  const B = PNG.sync.read(fs.readFileSync(`shots/${b}/${f}`));
  const d = new PNG({ width: A.width, height: A.height });
  const n = pixelmatch(A.data, B.data, d.data, A.width, A.height, { threshold: 0.15 });
  fs.writeFileSync(`${out}/${f}`, PNG.sync.write(d));
  const pct = +((n / (A.width * A.height)) * 100).toFixed(2);
  total += pct; count++;
  if (pct > max) max = pct;
  console.log(f, pct + '% pixels differ');
}
console.log('MEAN', (total / count).toFixed(2) + '%', '| MAX', max + '%');
