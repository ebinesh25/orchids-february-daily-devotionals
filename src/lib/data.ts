import fs from 'fs/promises';
import path from 'path';

export interface DevotionalContent {
  title: string;
  data: string;
}

export interface Devotional {
  english: DevotionalContent;
  tamil: DevotionalContent;
}

export interface MonthData {
  [key: string]: {
    [key: string]: Devotional;
  };
}

export async function getDevotionals(): Promise<MonthData> {
  const filePath = path.join(process.cwd(), 'data.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

export async function getDevotional(month: string, day: number): Promise<{ devotional: Devotional; dayNum: number } | null> {
  const data = await getDevotionals();
  const monthData = data[month.toLowerCase()];
  if (!monthData) return null;

  const dayKey = `day${day}`;
  const devotional = monthData[dayKey];

  if (!devotional) return null;

  return { devotional, dayNum: day };
}

export async function getAllDaysForMonth(month: string): Promise<number[]> {
  const data = await getDevotionals();
  const monthData = data[month.toLowerCase()];
  if (!monthData) return [];

  return Object.keys(monthData)
    .filter(key => key.startsWith('day'))
    .map(key => parseInt(key.replace('day', '')))
    .sort((a, b) => a - b);
}
