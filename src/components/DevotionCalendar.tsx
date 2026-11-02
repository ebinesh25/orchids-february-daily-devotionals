import Link from "next/link";
import { TrackedLink } from "@/components/TrackedLink";
import { dayPath, monthLabel, monthPath, validDate } from "@/lib/dates";
import { SupportedLang } from "@/types/lang";

export function DevotionCalendar({ year, month, days, lang, currentDay }: {
  year: number; month: number; days: number[]; lang: SupportedLang; currentDay?: number;
}) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const available = new Set(days.filter(day => validDate(year, month, day)));
  const weekdays = lang === "ta" ? ["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return (
    <section className="rounded-xl border bg-card p-4 text-card-foreground" aria-label={`${monthLabel(month, lang)} ${year}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href={monthPath(lang, month, year)} className="font-semibold hover:underline">{monthLabel(month, lang)} {year}</Link>
        <span className="text-xs text-muted-foreground">{available.size} {lang === "ta" ? "பதிவுகள்" : "devotions"}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((label, i) => <span key={i} className="py-2 text-xs text-muted-foreground">{label}</span>)}
        {Array.from({ length: firstWeekday }, (_, i) => <span key={`blank-${i}`} />)}
        {Array.from({ length: dayCount }, (_, i) => i + 1).map(day => available.has(day) ? (
          <TrackedLink key={day} eventName="date_navigation" eventPayload={{ month: String(month), day, action: "day_select" }} href={dayPath(lang, month, day, year)} aria-label={`${day} ${monthLabel(month, lang)} ${year}`} aria-current={day === currentDay ? "date" : undefined}
            className={`flex min-h-10 items-center justify-center rounded-md text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${day === currentDay ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent underline decoration-muted-foreground/40 underline-offset-4"}`}>
            {day}
          </TrackedLink>
        ) : <span key={day} className="flex min-h-10 items-center justify-center text-sm text-muted-foreground/50">{day}</span>)}
      </div>
    </section>
  );
}
