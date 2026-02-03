import fs from 'fs/promises';
import path from 'path';

export interface Devotional {
  day: number;
  english: string;
  tamil: string;
}

export interface MonthData {
  [month: string]: Devotional[];
}

export async function getDevotionals(): Promise<MonthData> {
  const filePath = path.join(process.cwd(), 'data.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

export async function getDevotional(month: string, day: number): Promise<Devotional | null> {
  const data = await getDevotionals();
  const monthDevotionals = data[month.toLowerCase()];
  if (!monthDevotionals) return null;
  return monthDevotionals.find((d) => d.day === day) || null;
}
