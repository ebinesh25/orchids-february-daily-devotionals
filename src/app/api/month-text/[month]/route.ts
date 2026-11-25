import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex-client";
import { normalizeMonthName, type Devotional } from "@/lib/data";
import { MONTHS } from "@/lib/dates";
import novemberData from "../../../../../public/data/nov.json";

export const dynamic = "force-dynamic";

const november = novemberData as Record<string, Devotional>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ month: string }> },
) {
  const { month: monthParam } = await params;
  const month = normalizeMonthName(monthParam);
  if (!MONTHS.includes(month)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  try {
    const docs = await convexClient.query(api.devotionals.getDevotionalsForMonth, { month });
    const readings = docs.map((doc) => ({
      day: doc.day,
      devotional: {
        english: { title: doc.englishTitle, data: doc.englishData },
        tamil: { title: doc.tamilTitle, data: doc.tamilData },
      },
    }));

    if (month === "nov") {
      const byDay = new Map<number, (typeof readings)[number]>();
      for (const [key, devotional] of Object.entries(november)) {
        const day = Number(key.slice(3));
        byDay.set(day, {
          day,
          devotional: {
            english: { title: devotional.english.title, data: devotional.english.data },
            tamil: { title: devotional.tamil.title, data: devotional.tamil.data },
          },
        });
      }
      for (const reading of readings) byDay.set(reading.day, reading);
      return NextResponse.json(
        { readings: [...byDay.values()].sort((a, b) => a.day - b.day) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json({ readings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (month === "nov") {
      const readings = Object.entries(november).map(([key, devotional]) => ({
        day: Number(key.slice(3)),
        devotional: {
          english: { title: devotional.english.title, data: devotional.english.data },
          tamil: { title: devotional.tamil.title, data: devotional.tamil.data },
        },
      }));
      return NextResponse.json({ readings }, { headers: { "Cache-Control": "no-store" } });
    }

    console.error(`Failed to refresh ${month} month text from Convex:`, error);
    return NextResponse.json({ error: "Could not refresh month text" }, { status: 503 });
  }
}
