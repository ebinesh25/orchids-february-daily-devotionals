import assert from 'node:assert/strict';
import { getReadingNavigation, type MonthData } from '../src/lib/data';

const devotional = { english: { title: 'Reading', data: 'Text' }, tamil: { title: 'Reading', data: 'Text' } };
const archive: MonthData = {
  feb: { day1: devotional, day28: devotional, day29: devotional },
  sep: { day29: devotional, day30: devotional },
  oct: { day1: devotional, day3: devotional },
};
async function main() {
  assert.deepEqual(await getReadingNavigation('sep', 30, archive), { previous: { month: 'sep', day: 29 }, next: { month: 'oct', day: 1 } });
  assert.deepEqual(await getReadingNavigation('oct', 1, archive), { previous: { month: 'sep', day: 30 }, next: { month: 'oct', day: 3 } });
  assert.deepEqual(await getReadingNavigation('feb', 1, archive), { previous: undefined, next: { month: 'feb', day: 28 } });
  assert.deepEqual(await getReadingNavigation('feb', 28, archive), { previous: { month: 'feb', day: 1 }, next: { month: 'sep', day: 29 } });
  assert.deepEqual(await getReadingNavigation('oct', 3, archive), { previous: { month: 'oct', day: 1 }, next: undefined });
  assert.deepEqual(await getReadingNavigation('sep', 30, {}), { previous: undefined, next: undefined });
  console.log('Passed 6 navigation cases: month boundaries, missing days/months, invalid leap day, archive endpoints, and empty archive.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
