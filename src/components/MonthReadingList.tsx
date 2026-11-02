"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Headphones, Search, X } from "lucide-react";
import { ShareDropdown } from "@/components/ShareDropdown";
import type { SupportedLang } from "@/types/lang";

export interface MonthReading {
  day: number;
  title: string;
  excerpt: string;
  weekday: string;
  date: string;
  href: string;
  hasAudio: boolean;
}

export function MonthReadingList({ readings, lang }: { readings: MonthReading[]; lang: SupportedLang }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().normalize("NFC").toLocaleLowerCase();
  const filtered = readings.filter(reading => `${reading.title} ${reading.excerpt} ${reading.day}`.normalize("NFC").toLocaleLowerCase().includes(normalized));

  return (
    <section aria-labelledby="readings-heading" className="min-w-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="readings-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">{lang === "ta" ? "தினசரி பதிவுகள்" : "Daily readings"}</h2>
        <span aria-live="polite" aria-atomic="true" className="shrink-0 text-sm text-muted-foreground">
          {query.trim() ? `${filtered.length} / ${readings.length}` : `${readings.length} ${lang === "ta" ? "பதிவுகள்" : "devotions"}`}
        </span>
      </div>
      <div className="relative mb-5">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor="reading-search" className="sr-only">{lang === "ta" ? "பதிவுகளைத் தேடுங்கள்" : "Search this month’s readings"}</label>
        <input id="reading-search" type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder={lang === "ta" ? "தலைப்பு, வசனம் அல்லது நாள்…" : "Search a title, verse, or day…"}
          className="h-13 w-full rounded-xl border bg-card pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden" />
        {query && <button type="button" aria-label={lang === "ta" ? "தேடலை அழி" : "Clear search"} onClick={() => setQuery("")} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>}
      </div>
      {filtered.length ? (
        <ol className="overflow-hidden rounded-2xl border bg-card divide-y">
          {filtered.map(reading => (
            <li key={reading.day} className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 p-4 transition-colors hover:bg-muted/45 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-5 sm:p-6">
              <time dateTime={reading.date} className="pointer-events-none flex flex-col items-center border-r pr-4 pt-1 sm:pr-5">
                <span className="text-[1.75rem] font-medium leading-none tracking-tight text-primary sm:text-3xl">{String(reading.day).padStart(2, "0")}</span>
                <span className="mt-2 text-xs text-muted-foreground">{reading.weekday}</span>
              </time>
              <div className="min-w-0">
                <Link href={reading.href} className="block rounded-sm pr-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring after:absolute after:inset-0" aria-label={`${lang === "ta" ? "நாள்" : "Day"} ${reading.day}: ${reading.title}`}>
                  <h3 className={`text-xl font-semibold leading-snug text-primary sm:text-[1.4rem] ${lang === "en" ? "font-serif" : ""}`}>{reading.title}</h3>
                  <p className="mt-2 line-clamp-2 text-base leading-relaxed text-muted-foreground">{reading.excerpt}</p>
                </Link>
                <div className="mt-3 flex min-h-8 items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {reading.hasAudio ? <><Headphones aria-hidden="true" className="h-3.5 w-3.5" />{lang === "ta" ? "ஆடியோ உள்ளது" : "Audio available"}</> : <span>{lang === "ta" ? "தினசரி தியானம்" : "Daily devotion"}</span>}
                  </span>
                  <div className="relative z-10"><ShareDropdown url={reading.href} title={reading.title} /></div>
                </div>
              </div>
              <ArrowUpRight aria-hidden="true" className="pointer-events-none absolute right-4 top-5 h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none sm:right-6 sm:top-7" />
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
          <Search aria-hidden="true" className="mx-auto mb-4 h-6 w-6 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{lang === "ta" ? "பதிவுகள் கிடைக்கவில்லை" : "No readings found"}</h3>
          <p className="mt-2 text-base text-muted-foreground">{lang === "ta" ? "வேறொரு சொல்லைத் தேடுங்கள்." : "Try another title, Bible verse, or day number."}</p>
          <button type="button" onClick={() => setQuery("")} className="mt-5 min-h-11 rounded-lg border px-4 py-2 font-medium hover:bg-muted">{lang === "ta" ? "அனைத்தையும் காட்டு" : "Show all readings"}</button>
        </div>
      )}
    </section>
  );
}
