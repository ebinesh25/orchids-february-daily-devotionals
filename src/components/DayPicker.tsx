import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DevotionCalendar } from "@/components/DevotionCalendar";
import { CONTENT_YEAR, dayPath, monthNumber, monthLabel, monthPath, type ReadingNavigation } from "@/lib/dates";
interface DayPickerProps {
  month: string; days: number[]; currentDay: number; inline?: boolean; lang: "en" | "ta";
  navigation?: ReadingNavigation;
}
export function DayPicker({ month, days, currentDay, inline = false, lang, navigation }: DayPickerProps) {
  const available = [...new Set(days)].sort((a, b) => a - b);
  const previousDay = available.filter(day => day < currentDay).at(-1);
  const nextDay = available.find(day => day > currentDay);
  const previous = navigation?.previous ?? (previousDay !== undefined ? { month, day: previousDay } : undefined);
  const next = navigation?.next ?? (nextDay !== undefined ? { month, day: nextDay } : undefined);
  const number = monthNumber(month);
  const label = (date: { month: string; day: number }) => `${date.day} ${monthLabel(monthNumber(date.month), lang)}`;
  return <div className={inline ? "mx-auto max-w-sm" : "mx-auto max-w-sm px-4 py-8"}>
    <nav aria-label={lang === "ta" ? "தேதி வழிசெலுத்தல்" : "Date navigation"} className="mb-4 grid grid-cols-2 gap-3 text-sm">
      {previous ? <Link aria-label={`${lang === "ta" ? "முந்தைய பதிவு" : "Previous devotion"}: ${label(previous)}`} href={dayPath(lang, previous.month, previous.day)} className="flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted"><ChevronLeft className="h-5 w-5 shrink-0" /><span>{label(previous)}</span></Link> : <span />}
      {next ? <Link aria-label={`${lang === "ta" ? "அடுத்த பதிவு" : "Next devotion"}: ${label(next)}`} href={dayPath(lang, next.month, next.day)} className="flex min-h-12 items-center justify-end gap-2 rounded-lg border px-3 py-2 text-right hover:bg-muted"><span>{label(next)}</span><ChevronRight className="h-5 w-5 shrink-0" /></Link> : <span />}
    </nav>
    <DevotionCalendar year={CONTENT_YEAR} month={number} days={available} currentDay={currentDay} lang={lang} />
    <nav aria-label={lang === "ta" ? "மாத வழிசெலுத்தல்" : "Month navigation"} className="mt-3 grid grid-cols-2 gap-3 text-sm">
      {number > 1 ? <Link href={monthPath(lang, number - 1)} aria-label={`${lang === "ta" ? "முந்தைய மாதம்" : "Previous month"}: ${monthLabel(number - 1, lang)}`} className="flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><ChevronLeft className="h-4 w-4 shrink-0" /><span>{monthLabel(number - 1, lang)}</span></Link> : <span />}
      {number < 12 ? <Link href={monthPath(lang, number + 1)} aria-label={`${lang === "ta" ? "அடுத்த மாதம்" : "Next month"}: ${monthLabel(number + 1, lang)}`} className="flex min-h-12 items-center justify-end gap-2 rounded-lg px-3 py-2 text-right hover:bg-muted"><span>{monthLabel(number + 1, lang)}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link> : <span />}
    </nav>
    <Link className="mt-2 flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-sm hover:bg-muted" href={`/${lang}/${CONTENT_YEAR}`}>{lang === "ta" ? "ஆண்டு நாட்காட்டி" : "Year calendar"} · {CONTENT_YEAR}</Link>
  </div>;
}
