import { unstable_cache } from "next/cache";
import { convexClient } from "./convex-client";
import { api } from "../../convex/_generated/api";

export interface DevotionalContent {
  title: string;
  data: string;
  audioUrl?: string | null;
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

/**
 * Revalidation interval in seconds (e.g. 1 hour = 3600s, 24 hours = 86400s)
 * Keeps pages and data fast while automatically checking Convex DB periodically.
 */
export const CACHE_REVALIDATE_SECONDS = 3600;

/**
 * Normalize month name to three-letter abbreviation
 */
export function normalizeMonthName(month: string): string {
  const monthMap: Record<string, string> = {
    "january": "jan",
    "jan": "jan",
    "february": "feb",
    "feb": "feb",
    "march": "mar",
    "mar": "mar",
    "april": "apr",
    "apr": "apr",
    "may": "may",
    "june": "jun",
    "jun": "jun",
    "july": "jul",
    "jul": "jul",
    "august": "aug",
    "aug": "aug",
    "september": "sep",
    "sep": "sep",
    "october": "oct",
    "oct": "oct",
    "november": "nov",
    "nov": "nov",
    "december": "dec",
    "dec": "dec",
  };

  const normalized = monthMap[month.toLowerCase()];
  return normalized || month.toLowerCase();
}

/**
 * Cached fetcher for all devotionals
 */
export const getDevotionals = unstable_cache(
  async (): Promise<MonthData> => {
    try {
      const data = await convexClient.query(api.devotionals.getAllDevotionals, {});
      return data as MonthData;
    } catch (error) {
      console.error("Error fetching devotionals from Convex:", error);
      return {};
    }
  },
  ["all-devotionals"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["devotionals"] }
);

/**
 * Cached fetcher for a single day's devotional
 */
export const getDevotional = unstable_cache(
  async (
    month: string,
    day: number
  ): Promise<{ devotional: Devotional; dayNum: number } | null> => {
    const normalizedMonth = normalizeMonthName(month);
    try {
      const doc = await convexClient.query(api.devotionals.getDevotional, {
        month: normalizedMonth,
        day,
      });

      if (!doc) return null;

      const devotional: Devotional = {
        english: {
          title: doc.englishTitle,
          data: doc.englishData,
          audioUrl: doc.englishAudioUrl,
        },
        tamil: {
          title: doc.tamilTitle,
          data: doc.tamilData,
          audioUrl: doc.tamilAudioUrl,
        },
      };

      return { devotional, dayNum: day };
    } catch (error) {
      console.error(`Error fetching devotional for ${month} day ${day} from Convex:`, error);
      return null;
    }
  },
  ["single-devotional"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["devotionals"] }
);

/**
 * Cached fetcher for all available days in a month
 */
export const getAllDaysForMonth = unstable_cache(
  async (month: string): Promise<number[]> => {
    const normalizedMonth = normalizeMonthName(month);
    try {
      const days = await convexClient.query(api.devotionals.getDaysForMonth, {
        month: normalizedMonth,
      });
      return days;
    } catch (error) {
      console.error(`Error fetching days for ${month} from Convex:`, error);
      return [];
    }
  },
  ["month-days"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["devotionals"] }
);

/**
 * Cached fetcher for list of available months
 */
export const getAvailableMonths = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const months = await convexClient.query(api.devotionals.getAvailableMonths, {});
      return months;
    } catch (error) {
      console.error("Error fetching available months from Convex:", error);
      return [];
    }
  },
  ["available-months"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["devotionals"] }
);

/**
 * Cached fetcher for all devotionals in a month
 */
export const getAllDevotionalsForMonth = unstable_cache(
  async (month: string): Promise<Array<{ day: number; devotional: Devotional }>> => {
    const normalizedMonth = normalizeMonthName(month);
    try {
      const docs = await convexClient.query(api.devotionals.getDevotionalsForMonth, {
        month: normalizedMonth,
      });

      return docs.map((doc) => ({
        day: doc.day,
        devotional: {
          english: {
            title: doc.englishTitle,
            data: doc.englishData,
            audioUrl: doc.englishAudioUrl,
          },
          tamil: {
            title: doc.tamilTitle,
            data: doc.tamilData,
            audioUrl: doc.tamilAudioUrl,
          },
        },
      }));
    } catch (error) {
      console.error(`Error fetching devotionals for ${month} from Convex:`, error);
      return [];
    }
  },
  ["month-devotionals"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["devotionals"] }
);

export async function getTodayDevotional(): Promise<{
  month: string;
  day: number;
  devotional: Devotional;
} | null> {
  const now = new Date();
  const monthNames = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const currentMonth = monthNames[now.getMonth()];
  const currentDay = now.getDate();

  const result = await getDevotional(currentMonth, currentDay);
  if (result) {
    return {
      month: currentMonth,
      day: currentDay,
      devotional: result.devotional,
    };
  }

  // Fallback to first available day of available month
  const availableMonths = await getAvailableMonths();
  if (availableMonths.length > 0) {
    const fallbackMonth = availableMonths.includes(currentMonth)
      ? currentMonth
      : availableMonths[0];
    const days = await getAllDaysForMonth(fallbackMonth);
    if (days.length > 0) {
      const fallbackDay = days.includes(currentDay) ? currentDay : days[0];
      const fallbackResult = await getDevotional(fallbackMonth, fallbackDay);
      if (fallbackResult) {
        return {
          month: fallbackMonth,
          day: fallbackDay,
          devotional: fallbackResult.devotional,
        };
      }
    }
  }

  return null;
}

export function generateExcerpt(content: string, maxLength: number = 100): string {
  // Remove markdown formatting
  let clean = content
    .replace(/\*\*/g, "") // bold
    .replace(/\*/g, "") // italic
    .replace(/_/g, "") // underline/italic
    .replace(/#{1,6}\s/g, "") // headers
    .replace(/\n/g, " ") // newlines to spaces
    .replace(/\s+/g, " ") // multiple spaces to one
    .trim();

  if (clean.length <= maxLength) return clean;

  return clean.slice(0, maxLength - 3) + "...";
}
