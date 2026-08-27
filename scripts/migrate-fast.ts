import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL is not set!");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface DevotionalContent {
  title: string;
  data: string;
}

interface Devotional {
  english: DevotionalContent;
  tamil: DevotionalContent;
}

interface MonthData {
  [month: string]: {
    [dayKey: string]: Devotional;
  };
}

async function uploadAudioFile(filePath: string): Promise<string> {
  const uploadUrl = await client.mutation(api.devotionals.generateUploadUrl, {});
  const fileBuffer = fs.readFileSync(filePath);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "audio/mpeg" },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${filePath}: ${response.statusText}`);
  }

  const { storageId } = await response.json();
  return storageId;
}

// Concurrency pool helper
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`Starting fast concurrent migration to Convex: ${CONVEX_URL}`);

  const dataPath = path.join(process.cwd(), "data.json");
  const data: MonthData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const audioDir = path.join(process.cwd(), "public/audio");
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  console.log(`Found ${audioFiles.length} audio files in public/audio`);

  // Step 1: Upload all audio files concurrently
  console.log("\n--- Phase 1: Uploading audio files in parallel (concurrency: 12) ---");
  const audioStorageMap = new Map<string, string>(); // "month_day_lang" -> storageId
  const audioRegex = /^([a-z]+)_day(\d+)_(english|tamil)\.mp3$/;

  const validAudioFiles = audioFiles.filter((f) => audioRegex.test(f));
  let completedUploads = 0;

  await mapConcurrent(validAudioFiles, 12, async (file) => {
    const match = file.match(audioRegex)!;
    const [, m, d, lang] = match;
    const key = `${m}_${d}_${lang}`;
    const filePath = path.join(audioDir, file);

    try {
      const storageId = await uploadAudioFile(filePath);
      audioStorageMap.set(key, storageId);
      completedUploads++;
      if (completedUploads % 20 === 0 || completedUploads === validAudioFiles.length) {
        console.log(`Uploaded ${completedUploads}/${validAudioFiles.length} audio files...`);
      }
    } catch (e: any) {
      console.error(`Failed to upload ${file}: ${e.message}`);
    }
  });

  console.log(`Audio upload complete: ${audioStorageMap.size} files in Convex storage.`);

  // Step 2: Upsert all devotionals concurrently
  console.log("\n--- Phase 2: Upserting devotionals (concurrency: 10) ---");
  const entries: Array<{
    month: string;
    dayNum: number;
    devotional: Devotional;
  }> = [];

  for (const [month, days] of Object.entries(data)) {
    for (const [dayKey, devotional] of Object.entries(days)) {
      const dayNum = parseInt(dayKey.replace("day", ""), 10);
      if (isNaN(dayNum)) continue;
      entries.push({ month: month.toLowerCase(), dayNum, devotional });
    }
  }

  let completedDevotionals = 0;
  await mapConcurrent(entries, 10, async ({ month, dayNum, devotional }) => {
    const engAudioKey = `${month}_${dayNum}_english`;
    const tamAudioKey = `${month}_${dayNum}_tamil`;

    const englishStorageId = audioStorageMap.get(engAudioKey) as any;
    const tamilStorageId = audioStorageMap.get(tamAudioKey) as any;

    await client.mutation(api.devotionals.upsertDevotional, {
      month,
      day: dayNum,
      englishTitle: devotional.english.title,
      englishData: devotional.english.data,
      tamilTitle: devotional.tamil.title,
      tamilData: devotional.tamil.data,
      ...(englishStorageId ? { englishStorageId } : {}),
      ...(tamilStorageId ? { tamilStorageId } : {}),
    });

    completedDevotionals++;
    if (completedDevotionals % 25 === 0 || completedDevotionals === entries.length) {
      console.log(`Upserted ${completedDevotionals}/${entries.length} devotionals...`);
    }
  });

  console.log("\n=========================================");
  console.log("Migration completely finished successfully!");
  console.log("=========================================");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
