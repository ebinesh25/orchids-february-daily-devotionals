import { getDevotional, getAllDaysForMonth, normalizeMonthName } from "@/lib/data";
import Reader from "@/components/Reader";
import { notFound } from "next/navigation";
import { LangParams } from "@/types/lang";
import { isValidLang } from "@/types/lang";

interface PageProps {
  params: Promise<LangParams & { month: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, month } = await params;
  const monthName = month.charAt(0).toUpperCase() + month.slice(1);

  return {
    title: lang === "ta"
      ? `இன்று ${monthName} வேதாகம தொடர்`
      : `Today's ${monthName} Bible Series`,
    alternates: {
      canonical: `/${lang}/${month}/today`,
      languages: {
        'en': `/en/${month}/today`,
        'ta': `/ta/${month}/today`,
      },
    },
  };
}

export default async function LangMonthTodayPage({ params }: PageProps) {
  const { lang, month } = await params;

  // Validate language
  if (!isValidLang(lang)) {
    notFound();
  }

  const today = new Date();
  const day = today.getDate();

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

// Generate static params for all available months and both languages
export async function generateStaticParams() {
  const { getAvailableMonths } = await import("@/lib/data");
  const months = await getAvailableMonths();
  const params: Array<{ lang: string; month: string }> = [];

  for (const month of months) {
    params.push({ lang: "ta", month });
    params.push({ lang: "en", month });
  }

  return params;
}
