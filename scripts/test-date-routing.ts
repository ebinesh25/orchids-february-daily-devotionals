import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { dayPath, validDate } from '../src/lib/dates';

let checked = 0;
function redirect(path: string, target: string, status = 308, headers: Record<string, string> = {}) {
  const response = middleware(new NextRequest(`https://devotions.test${path}`, { headers }));
  assert.equal(response.status, status, path);
  assert.equal(response.headers.get('location'), `https://devotions.test${target}`, path);
  checked++;
}
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const full = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
for (const lang of ['en', 'ta']) {
  for (let i = 0; i < 12; i++) {
    for (const month of new Set([months[i], full[i], months[i].toUpperCase()])) {
      const lastDay = new Date(Date.UTC(2026, i + 1, 0)).getUTCDate();
      for (const day of [1, 9, lastDay]) {
        redirect(`/${lang}/${month}/day/${day}/`, dayPath(lang, i + 1, day));
      }
      redirect(`/${lang}/${month}`, `/${lang}/2026/${String(i + 1).padStart(2, '0')}`);
    }
  }
}
redirect('/en/nov/day/1/?utm_source=test', '/en/2026/11/01?utm_source=test');
redirect('/nov/day/1?la=en&utm_source=test', '/en/2026/11/01?utm_source=test');
redirect('/en/nov/day/1?la=ta', '/ta/2026/11/01');
redirect('/november/day/1', '/en/2026/11/01', 308, { 'accept-language': 'en' });
redirect('/nov/day/1', '/ta/2026/11/01');
redirect('/?la=en', '/en', 307);
redirect('/en/2026/11/01?la=ta', '/ta/2026/11/01');
redirect('/2026/11/01', '/ta/2026/11/01');
redirect('/en/2026/11/01/', '/en/2026/11/01');
redirect('/ta/2026/', '/ta/2026');
for (const path of ['/en/2026/11/01', '/en/2026', '/ta/2026/02', '/en/nov/day/31', '/en/feb/day/29', '/en/nov/day/1abc', '/unknown']) {
  const response = middleware(new NextRequest(`https://devotions.test${path}`));
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('location'), null, path);
  checked++;
}
assert.equal(validDate(2026, 2, 29), false);
assert.equal(validDate(2028, 2, 29), true);
assert.equal(validDate(2026, 11, 31), false);
assert.equal(validDate(2026, 0, 1), false);
assert.equal(validDate(2026, 12, 31), true);
assert.equal(validDate(2026, 1, 1.5), false);
console.log(`Passed ${checked} redirect and routing cases, plus date validation checks.`);
