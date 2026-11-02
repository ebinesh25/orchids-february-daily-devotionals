import { notFound } from "next/navigation";
import { getDevotionals } from "@/lib/data";
import { CONTENT_YEAR, MONTHS, validDate } from "@/lib/dates";
import { isValidLang } from "@/types/lang";
import { ArchiveShell } from "@/components/ArchiveShell";
import { DevotionCalendar } from "@/components/DevotionCalendar";

export default async function YearArchive({ lang, year }: { lang: string; year: string }) {
  if (!isValidLang(lang) || year !== String(CONTENT_YEAR)) notFound();
  const data = await getDevotionals();
  const months = MONTHS.map((key, i) => ({ month: i + 1, days: Object.keys(data[key] || {}).map(key => Number(key.replace(/^day/, ""))).filter(day => validDate(+year, i + 1, day)) }));
  const total = months.reduce((sum, month) => sum + month.days.length, 0);
  return <ArchiveShell lang={lang} year={+year}>
    <h1 className="mb-3 text-3xl font-bold text-primary md:text-4xl">{year} · {lang === "ta" ? "வேதாகம தொடர்கள்" : "Devotional calendar"}</h1>
    <p className="mb-8 text-muted-foreground">{lang === "ta" ? `${total} பதிவுகள். படிக்க ஒரு தேதியைத் தேர்ந்தெடுக்கவும்.` : `${total} devotions. Choose an available date to read, or a month to explore.`}</p>
    {total === 0 && <p className="mb-6 text-muted-foreground">{lang === "ta" ? "பதிவுகள் விரைவில் கிடைக்கும்." : "Devotions will appear here when available."}</p>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{months.map(({ month, days }) => <DevotionCalendar key={month} year={+year} month={month} days={days} lang={lang} />)}</div>
  </ArchiveShell>;
}
