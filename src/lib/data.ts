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

export async function getAvailableMonths(): Promise<string[]> {
  const data = await getDevotionals();
  return Object.keys(data);
}

export async function getAllDevotionalsForMonth(month: string): Promise<Array<{ day: number; devotional: Devotional }>> {
  const data = await getDevotionals();
  const monthData = data[month.toLowerCase()];
  if (!monthData) return [];

  return Object.keys(monthData)
    .filter(key => key.startsWith('day'))
    .map(key => ({
      day: parseInt(key.replace('day', '')),
      devotional: monthData[key]
    }))
    .sort((a, b) => a.day - b.day);
}

export async function getTodayDevotional(): Promise<{ month: string; day: number; devotional: Devotional } | null> {
  const data = await getDevotionals();
  const now = new Date();

  // Map month numbers to short names
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[now.getMonth()];
  const day = now.getDate();

  const monthData = data[month];
  if (!monthData) return null;

  const dayKey = `day${day}`;
  const devotional = monthData[dayKey];

  if (!devotional) return null;

  return { month, day, devotional };
}

export function generateExcerpt(content: string, maxLength: number = 100): string {
  // Remove markdown formatting
  let clean = content
    .replace(/\*\*/g, '') // bold
    .replace(/\*/g, '') // italic
    .replace(/_/g, '') // underline/italic
    .replace(/#{1,6}\s/g, '') // headers
    .replace(/\n/g, ' ') // newlines to spaces
    .replace(/\s+/g, ' ') // multiple spaces to one
    .trim();

  if (clean.length <= maxLength) return clean;

  return clean.slice(0, maxLength - 3) + '...';
}
