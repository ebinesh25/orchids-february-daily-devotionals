import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getDevotionals, generateExcerpt } from "@/lib/data";
import { CONTENT_YEAR, MONTHS, dayPath, monthLabel, monthPath, padDate, validDate } from "@/lib/dates";
import { isValidLang } from "@/types/lang";
import { ArchiveShell } from "@/components/ArchiveShell";
import { DevotionCalendar } from "@/components/DevotionCalendar";
import { MonthReadingList, type MonthReading } from "@/components/MonthReadingList";

type Props = { params: Promise<{ lang: string; segment: string; month: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, segment: year, month } = await params;
  const path = `/${year}/${padDate(+month)}`;
  return {
    title: `${/^\d{1,2}$/.test(month) && +month >= 1 && +month <= 12 ? monthLabel(+month, lang) : month} ${year} · Bible Series`,
    alternates: { canonical: `/${lang}${path}`, languages: { en: `/en${path}`, ta: `/ta${path}` } },
  };
}

export default async function MonthPage({ params }: Props) {
  const { lang, segment: year, month } = await params;
  if (!isValidLang(lang) || year !== String(CONTENT_YEAR) || !/^\d{1,2}$/.test(month) || !validDate(+year, +month, 1)) notFound();
  if (month !== padDate(+month)) permanentRedirect(monthPath(lang, +month, +year));

  const name = monthLabel(+month, lang);
  const archive = await getDevotionals();
  const monthData = archive[MONTHS[+month - 1]] || {};
  const readings: MonthReading[] = Object.entries(monthData).flatMap(([key, devotional]) => {
    const day = Number(key.replace(/^day/, ""));
    if (!validDate(+year, +month, day)) return [];
    const content = devotional[lang === "ta" ? "tamil" : "english"];
    return [{
      day,
      title: content.title.replace(/^(?:Day|நாள்)\s*\d+\s*[-–—:]\s*/i, ""),
      excerpt: generateExcerpt(content.data, 165),
      weekday: new Intl.DateTimeFormat(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(+year, +month - 1, day))),
      date: `${year}-${month}-${padDate(day)}`,
      href: dayPath(lang, +month, day, +year),
      hasAudio: Boolean(content.audioUrl),
    }];
  }).sort((a, b) => a.day - b.day);

  const calendar = <DevotionCalendar year={+year} month={+month} days={readings.map(reading => reading.day)} lang={lang} />;

  return (
    <ArchiveShell lang={lang} year={+year} month={month}>
      <header className="mb-8 border-b pb-8 sm:mb-10 sm:pb-10">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <BookOpen className="h-4 w-4" aria-hidden="true" />{lang === "ta" ? "தினசரி வேதாகம தியானம்" : "A little time in the Word"}
        </p>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className={`text-4xl font-semibold leading-tight tracking-tight text-primary sm:text-6xl ${lang === "en" ? "font-serif" : ""}`}>
              {name} <span className="font-normal text-muted-foreground">{year}</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {lang === "ta" ? "ஒவ்வொரு நாளும் வாசிக்கவும், தியானிக்கவும், ஜெபிக்கவும் ஒரு தருணம்." : "A moment to read, reflect, and walk closer with God. One day at a time."}
            </p>
          </div>
          {readings[0] && <Link href={readings[0].href} className="inline-flex min-h-12 w-fit shrink-0 items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {lang === "ta" ? "வாசிக்கத் தொடங்குங்கள்" : "Start reading"}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>}
        </div>
      </header>

      <div className="grid items-start gap-7 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
        <aside aria-label={lang === "ta" ? "மாத நாட்காட்டி" : "Month calendar"} className="min-w-0 lg:sticky lg:top-6">
          <nav aria-label={lang === "ta" ? "மாதங்கள்" : "Month navigation"} className="mb-4 flex min-h-12 items-center justify-between rounded-xl border bg-card p-1">
            {+month > 1 ? <Link href={monthPath(lang, +month - 1, +year)} aria-label={`${lang === "ta" ? "முந்தைய மாதம்" : "Previous month"}: ${monthLabel(+month - 1, lang)}`} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted"><ChevronLeft className="h-5 w-5" /></Link> : <span className="w-11" />}
            <span className="px-2 text-sm font-semibold">{name} {year}</span>
            {+month < 12 ? <Link href={monthPath(lang, +month + 1, +year)} aria-label={`${lang === "ta" ? "அடுத்த மாதம்" : "Next month"}: ${monthLabel(+month + 1, lang)}`} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted"><ChevronRight className="h-5 w-5" /></Link> : <span className="w-11" />}
          </nav>
          <div className="hidden lg:block">{calendar}</div>
          <details className="group rounded-xl border bg-card lg:hidden">
            <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-medium [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden="true" />{lang === "ta" ? "ஒரு தேதியைத் தேர்ந்தெடுக்கவும்" : "Choose a date"}</span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <div className="border-t p-2">{calendar}</div>
          </details>
          <Link href={`/${lang}/${year}`} className="mt-4 hidden min-h-12 items-center justify-between rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground lg:flex">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden="true" />{lang === "ta" ? "ஆண்டு நாட்காட்டி" : "Explore the year"}</span><ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-5 hidden border-t px-1 pt-5 text-sm leading-relaxed text-muted-foreground lg:block">
            {lang === "ta" ? "ஒரு நாளைத் தேர்ந்தெடுக்கவும். உங்கள் நேரத்திற்கு ஏற்ப வாசிக்கவும்." : "Choose any day to begin. There’s always room for a quiet moment."}
          </p>
        </aside>

        {readings.length ? <MonthReadingList key={`${lang}-${year}-${month}`} readings={readings} lang={lang} /> : (
          <section className="rounded-2xl border border-dashed px-6 py-14 text-center">
            <BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-xl font-semibold">{lang === "ta" ? "பதிவுகள் விரைவில் கிடைக்கும்" : "A new month is on its way"}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{lang === "ta" ? "இந்த மாதத்திற்கான பதிவுகள் இன்னும் இல்லை." : "No devotions have been published for this month yet. Explore another month in the meantime."}</p>
            <Link href={`/${lang}/${year}`} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-muted">{lang === "ta" ? "ஆண்டு நாட்காட்டி" : "Browse the year"}<ArrowRight className="h-4 w-4" /></Link>
          </section>
        )}
      </div>
    </ArchiveShell>
  );
}
