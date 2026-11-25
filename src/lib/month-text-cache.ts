import type { Devotional } from "@/lib/data";

export interface CachedMonthReading {
  day: number;
  english: { title: string; data: string };
  tamil: { title: string; data: string };
}

interface CachedMonth {
  key: string;
  readings: CachedMonthReading[];
  savedAt: number;
}

const DATABASE_NAME = "bible-series-text-cache";
const DATABASE_VERSION = 1;
const STORE_NAME = "months";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheMonthText(
  key: string,
  readings: Array<{ day: number; devotional: Devotional }>,
): Promise<CachedMonthReading[] | null> {
  if (typeof indexedDB === "undefined") return null;

  let database: IDBDatabase | undefined;
  try {
    database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const read = store.get(key);
    const freshReadings: CachedMonthReading[] = readings.map(({ day, devotional }) => ({
      day,
      english: { title: devotional.english.title, data: devotional.english.data },
      tamil: { title: devotional.tamil.title, data: devotional.tamil.data },
    }));

    const cachedReadings = await new Promise<CachedMonthReading[] | null>((resolve, reject) => {
      read.onsuccess = () => resolve((read.result as CachedMonth | undefined)?.readings ?? null);
      read.onerror = () => reject(read.error);
    });

    store.put({ key, readings: freshReadings, savedAt: Date.now() } satisfies CachedMonth);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return cachedReadings;
  } catch {
    return null;
  } finally {
    database?.close();
  }
}

export async function replaceCachedMonthText(
  key: string,
  readings: CachedMonthReading[],
): Promise<void> {
  if (typeof indexedDB === "undefined") throw new Error("IndexedDB is unavailable");

  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ key, readings, savedAt: Date.now() } satisfies CachedMonth);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
