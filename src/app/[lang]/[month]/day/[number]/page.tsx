import { getDevotional, getAllDaysForMonth, normalizeMonthName } from "@/lib/data";
import Reader from "@/components/Reader";
import { notFound } from "next/navigation";
import { LangParams } from "@/types/lang";
import { isValidLang } from "@/types/lang";

interface PageProps {
  params: Promise<LangParams & { month: string; number: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, month, number } = await params;
  const monthName = month.charAt(0).toUpperCase() + month.slice(1);

  return {
    title: lang === "ta"
      ? `${monthName} நாள் ${number} வேதாகம தொடர்`
      : `${monthName} Day ${number} Bible Series`,
    alternates: {
      canonical: `/${lang}/${month}/day/${number}`,
      languages: {
        'en': `/en/${month}/day/${number}`,
        'ta': `/ta/${month}/day/${number}`,
      },
    },
  };
}

export default async function LangDayPage({ params }: PageProps) {
  const { lang, month, number } = await params;

  // Validate language
  if (!isValidLang(lang)) {
    notFound();
  }

  const day = parseInt(number);

  if (isNaN(day)) {
    notFound();
  }

  // Normalize month name (e.g., "march" → "mar") for data lookup
  const normalizedMonth = normalizeMonthName(month);

  const result = await getDevotional(normalizedMonth, day);

  if (!result) {
    notFound();
  }

  const days = await getAllDaysForMonth(normalizedMonth);

  return (
    <Reader
      devotional={result.devotional}
      month={month}
      day={result.dayNum}
      days={days}
      lang={lang}
    />
  );
}

// Generate static params for all days in all months for both languages
export async function generateStaticParams() {
  const { getAvailableMonths, getAllDaysForMonth } = await import("@/lib/data");
  const months = await getAvailableMonths();
  const params: Array<{ lang: string; month: string; number: string }> = [];

  for (const month of months) {
    const days = await getAllDaysForMonth(month);
    for (const day of days) {
      params.push({ lang: "ta", month, number: String(day) });
      params.push({ lang: "en", month, number: String(day) });
    }
  }

  return params;
}
