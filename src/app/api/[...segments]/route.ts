import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDevotional } from "@/lib/data";
import { CONTENT_YEAR, MONTHS, validDate } from "@/lib/dates";

function hasValidBearerToken(request: NextRequest): boolean {
  const expected = process.env.API_KEY;
  const authorization = request.headers.get("authorization");

  if (!expected || !authorization?.startsWith("Bearer ")) return false;

  const supplied = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);

  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> },
) {
  if (!hasValidBearerToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { segments } = await params;
  if (segments.length !== 3) {
    return NextResponse.json({ error: "Use the date format /api/YYYY/MM/DD" }, { status: 400 });
  }

  const [yearParam, monthParam, dayParam] = segments;
  const year = Number(yearParam);
  const monthNumber = Number(monthParam);
  const day = Number(dayParam);

  if (!/^\d{4}$/.test(yearParam) || !/^\d{2}$/.test(monthParam) || !/^\d{2}$/.test(dayParam)
    || !validDate(year, monthNumber, day)) {
    return NextResponse.json({ error: "Invalid date. Use a valid date in /api/YYYY/MM/DD format." }, { status: 400 });
  }
  if (year !== CONTENT_YEAR) {
    return NextResponse.json({ error: `No devotional archive for ${year}` }, { status: 404 });
  }

  const month = MONTHS[monthNumber - 1];
  const result = await getDevotional(month, day);
  if (!result) {
    return NextResponse.json({ error: "Devotional not found" }, { status: 404 });
  }

  return NextResponse.json({
    year,
    month: monthNumber,
    day,
    english: {
      title: result.devotional.english.title,
      text: result.devotional.english.data,
      audio: result.devotional.english.audioUrl ?? null,
    },
    tamil: {
      title: result.devotional.tamil.title,
      text: result.devotional.tamil.data,
      audio: result.devotional.tamil.audioUrl ?? null,
    },
  });
}
