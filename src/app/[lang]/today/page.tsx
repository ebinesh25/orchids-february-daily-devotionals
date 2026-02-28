import { getDevotionals, getAllDaysForMonth } from "@/lib/data";
import Reader from "@/components/Reader";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { LangParams } from "@/types/lang";
import { isValidLang } from "@/types/lang";

export async function generateMetadata({ params }: { params: Promise<LangParams> }) {
  const { lang } = await params;

  return {
    title: lang === "ta" ? "இன்றிய வேதாகம தொடர்" : "Today's Bible Series",
    alternates: {
      canonical: `/${lang}/today`,
      languages: {
        'en': '/en/today',
        'ta': '/ta/today',
      },
    },
  };
}

export default async function LangTodayPage({ params }: { params: Promise<LangParams> }) {
  const { lang } = await params;

  // Validate language
  if (!isValidLang(lang)) {
    notFound();
  }

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();

  const data = await getDevotionals();
  const monthData = data[currentMonth];

  if (!monthData) {
    // If no data for current month, check February as fallback
    const febData = data['feb'];
    if (febData) {
      const days = await getAllDaysForMonth('feb');
      const dayKey = `day${currentDay}`;
      if (febData[dayKey]) {
        return (
          <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">{lang === "ta" ? "ஏற்றுகிறது..." : "Loading..."}</div>}>
            <Reader devotional={febData[dayKey]} month="feb" day={currentDay} days={days} lang={lang} />
          </Suspense>
        );
      }
      // Find first available day in Feb
      if (days.length > 0) {
        return (
          <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">{lang === "ta" ? "ஏற்றுகிறது..." : "Loading..."}</div>}>
            <Reader devotional={febData[`day${days[0]}`]} month="feb" day={days[0]} days={days} lang={lang} />
          </Suspense>
        );
      }
    }
    redirect(`/${lang}/feb/day/1`);
  }

  // Check if today's devotional exists
  const dayKey = `day${currentDay}`;
  const devotional = monthData[dayKey];

  // Get all days for the month
  const days = await getAllDaysForMonth(currentMonth);

  if (devotional) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">{lang === "ta" ? "ஏற்றுகிறது..." : "Loading..."}</div>}>
        <Reader devotional={devotional} month={currentMonth} day={currentDay} days={days} lang={lang} />
      </Suspense>
    );
  }

  // Find first available day in the month
  if (days.length > 0) {
    const firstDay = days[0];
    return (
      <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">{lang === "ta" ? "ஏற்றுகிறது..." : "Loading..."}</div>}>
        <Reader devotional={monthData[`day${firstDay}`]} month={currentMonth} day={firstDay} days={days} lang={lang} />
      </Suspense>
    );
  }

  redirect(`/${lang}/feb/day/1`);
}

// Generate static params for both languages
export async function generateStaticParams() {
  return [
    { lang: "ta" },
    { lang: "en" },
  ];
}
