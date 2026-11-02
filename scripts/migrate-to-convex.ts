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

async function main() {
  console.log(`Starting migration to Convex: ${CONVEX_URL}`);

  // 1. Load data.json
  const dataPath = path.join(process.cwd(), "data.json");
  const data: MonthData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // 2. Index audio files in public/audio
  const audioDir = path.join(process.cwd(), "public/audio");
  const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir) : [];
  console.log(`Found ${audioFiles.length} audio files in public/audio`);

  const audioMap = new Map<string, string>(); // "month_day_lang" -> filename
  const audioRegex = /^([a-z]+)_day(\d+)_(english|tamil)\.mp3$/;

  for (const file of audioFiles) {
    const match = file.match(audioRegex);
    if (match) {
      const [, m, d, lang] = match;
      audioMap.set(`${m}_${d}_${lang}`, file);
    }
  }

  // 3. Migrate each month and day
  for (const [month, days] of Object.entries(data)) {
    console.log(`\nMigrating month: ${month} (${Object.keys(days).length} days)...`);

    for (const [dayKey, devotional] of Object.entries(days)) {
      const dayNum = parseInt(dayKey.replace("day", ""), 10);
      if (isNaN(dayNum)) continue;

      let englishStorageId: any = undefined;
      let tamilStorageId: any = undefined;

      // Check for English audio
      const engAudioKey = `${month.toLowerCase()}_${dayNum}_english`;
      if (audioMap.has(engAudioKey)) {
        const file = audioMap.get(engAudioKey)!;
        const filePath = path.join(audioDir, file);
        process.stdout.write(`  [${month} Day ${dayNum}] Uploading English audio (${file})... `);
        try {
          englishStorageId = await uploadAudioFile(filePath);
          console.log(`✓ done (${englishStorageId})`);
        } catch (e: any) {
          console.error(`✗ error: ${e.message}`);
        }
      }

      // Check for Tamil audio
      const tamAudioKey = `${month.toLowerCase()}_${dayNum}_tamil`;
      if (audioMap.has(tamAudioKey)) {
        const file = audioMap.get(tamAudioKey)!;
        const filePath = path.join(audioDir, file);
        process.stdout.write(`  [${month} Day ${dayNum}] Uploading Tamil audio (${file})... `);
        try {
          tamilStorageId = await uploadAudioFile(filePath);
          console.log(`✓ done (${tamilStorageId})`);
        } catch (e: any) {
          console.error(`✗ error: ${e.message}`);
        }
      }

      // Upsert devotional text + storage IDs to Convex
      await client.mutation(api.devotionals.upsertDevotional, {
        month: month.toLowerCase(),
        day: dayNum,
        englishTitle: devotional.english.title,
        englishData: devotional.english.data,
        tamilTitle: devotional.tamil.title,
        tamilData: devotional.tamil.data,
        ...(englishStorageId ? { englishStorageId } : {}),
        ...(tamilStorageId ? { tamilStorageId } : {}),
      });

      console.log(`  [${month} Day ${dayNum}] Devotional text migrated.`);
    }
  }

  console.log("\n=========================================");
  console.log("Migration completely finished successfully!");
  console.log("=========================================");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
