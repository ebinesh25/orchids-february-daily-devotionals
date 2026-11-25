import { unstable_cache } from "next/cache";
import { CONTENT_YEAR, MONTHS, monthNumber, validDate, type ReadingNavigation } from "./dates";
import { convexClient } from "./convex-client";
import { api } from "../../convex/_generated/api";
import novemberData from "../../public/data/nov.json";

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

const NOVEMBER_DATA = novemberData as MonthData["nov"];

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
      const archive = data as MonthData;
      return {
        ...archive,
        nov: { ...NOVEMBER_DATA, ...(archive.nov || {}) },
      };
    } catch (error) {
      console.error("Error fetching devotionals from Convex:", error);
      return { nov: NOVEMBER_DATA };
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

      if (!doc) {
        if (normalizedMonth !== "nov") return null;
        const fallback = NOVEMBER_DATA[`day${day}`];
        return fallback ? { devotional: fallback, dayNum: day } : null;
      }

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
      if (normalizedMonth === "nov") {
        const fallback = NOVEMBER_DATA[`day${day}`];
        return fallback ? { devotional: fallback, dayNum: day } : null;
      }
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
      if (normalizedMonth !== "nov") return days;
      return [...new Set([...days, ...Object.keys(NOVEMBER_DATA).map((key) => Number(key.slice(3)))])]
        .sort((a, b) => a - b);
    } catch (error) {
      console.error(`Error fetching days for ${month} from Convex:`, error);
      if (normalizedMonth === "nov") {
        return Object.keys(NOVEMBER_DATA).map((key) => Number(key.slice(3))).sort((a, b) => a - b);
      }
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
      return [...new Set([...months, "nov"])];
    } catch (error) {
      console.error("Error fetching available months from Convex:", error);
      return ["nov"];
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

      const databaseReadings = docs.map((doc) => ({
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
      if (normalizedMonth !== "nov") return databaseReadings;

      const readingsByDay = new Map<number, { day: number; devotional: Devotional }>();
      for (const [key, devotional] of Object.entries(NOVEMBER_DATA)) {
        const day = Number(key.slice(3));
        readingsByDay.set(day, { day, devotional });
      }
      for (const reading of databaseReadings) readingsByDay.set(reading.day, reading);
      return [...readingsByDay.values()].sort((a, b) => a.day - b.day);
    } catch (error) {
      console.error(`Error fetching devotionals for ${month} from Convex:`, error);
      if (normalizedMonth === "nov") {
        return Object.entries(NOVEMBER_DATA)
          .map(([key, devotional]) => ({ day: Number(key.slice(3)), devotional }))
          .sort((a, b) => a.day - b.day);
      }
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
  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const currentMonthIndex = Number(localDate.find(part => part.type === "month")!.value) - 1;
  const currentDay = Number(localDate.find(part => part.type === "day")!.value);
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
  const currentMonth = monthNames[currentMonthIndex];

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


/** Find neighboring readings from the same archive used by the year calendar. */
export async function getReadingNavigation(month: string, day: number, archive?: MonthData): Promise<ReadingNavigation> {
  const data = archive ?? await getDevotionals();
  const current = monthNumber(month) * 100 + day;
  const readings = MONTHS.flatMap((key, index) => Object.keys(data[key] || {})
    .map(dayKey => ({ month: key, day: Number(dayKey.replace(/^day/, "")) }))
    .filter(date => validDate(CONTENT_YEAR, index + 1, date.day)))
    .sort((a, b) => (monthNumber(a.month) * 100 + a.day) - (monthNumber(b.month) * 100 + b.day));
  return {
    previous: readings.filter(date => monthNumber(date.month) * 100 + date.day < current).at(-1),
    next: readings.find(date => monthNumber(date.month) * 100 + date.day > current),
  };
}
