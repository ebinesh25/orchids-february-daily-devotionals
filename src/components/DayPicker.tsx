import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackedLink } from "@/components/TrackedLink";

interface DayPickerProps {
  month: string;
  days: number[];
  currentDay: number;
  inline?: boolean;
  lang: "en" | "ta";
}

export function DayPicker({ month, days, currentDay, inline = false, lang }: DayPickerProps) {
  const dayLinks = days.map((day) => (
    <TrackedLink
      key={day}
      href={`/${lang}/${month}/day/${day}`}
      eventName="date_navigation"
      eventPayload={{ month, day, action: "day_select" }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg font-medium transition-all text-sm",
        day === currentDay
          ? "bg-primary text-primary-foreground shadow-md scale-105"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {day}
    </TrackedLink>
  ));

  if (inline) {
    // Month display names
    const monthDisplayNames: Record<string, string> = {
      jan: lang === "ta" ? "ஜனவரி" : "January",
      january: lang === "ta" ? "ஜனவரி" : "January",
      feb: lang === "ta" ? "பிப்ரவரி" : "February",
      february: lang === "ta" ? "பிப்ரவரி" : "February",
      mar: lang === "ta" ? "மார்ச்" : "March",
      march: lang === "ta" ? "மார்ச்" : "March",
      apr: lang === "ta" ? "ஏப்ரல்" : "April",
      april: lang === "ta" ? "ஏப்ரல்" : "April",
      may: lang === "ta" ? "மே" : "May",
      jun: lang === "ta" ? "ஜூன்" : "June",
      june: lang === "ta" ? "ஜூன்" : "June",
      jul: lang === "ta" ? "ஜூலை" : "July",
      july: lang === "ta" ? "ஜூலை" : "July",
      aug: lang === "ta" ? "ஆகஸ்ட்" : "August",
      august: lang === "ta" ? "ஆகஸ்ட்" : "August",
      sep: lang === "ta" ? "செப்டம்பர்" : "September",
      september: lang === "ta" ? "செப்டம்பர்" : "September",
      oct: lang === "ta" ? "அக்டோபர்" : "October",
      october: lang === "ta" ? "அக்டோபர்" : "October",
      nov: lang === "ta" ? "நவம்பர்" : "November",
      november: lang === "ta" ? "நவம்பர்" : "November",
      dec: lang === "ta" ? "டிசம்பர்" : "December",
      december: lang === "ta" ? "டிசம்பர்" : "December",
    };

    const monthName = monthDisplayNames[month.toLowerCase()] || month.charAt(0).toUpperCase() + month.slice(1);

    return (
      <div className="w-full">
        {/* Month Name Header */}
        <div className="text-center mb-4">
          <h3 className={`text-lg font-semibold text-primary ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}>
            {monthName}
          </h3>
        </div>

        <div className="flex items-center justify-center gap-1">
          {/* Previous Button */}
          {currentDay > 1 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <TrackedLink
                href={`/${lang}/${month}/day/${currentDay - 1}`}
                eventName="date_navigation"
                eventPayload={{ month, day: currentDay - 1, action: "prev_next" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </TrackedLink>
            </Button>
          )}
          {currentDay <= 1 && <div className="w-8" />}

          {/* Day Numbers */}
          <div className="flex flex-wrap justify-center gap-1">
            {dayLinks}
          </div>

          {/* Next Button */}
          {currentDay < Math.max(...days) && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <TrackedLink
                href={`/${lang}/${month}/day/${currentDay + 1}`}
                eventName="date_navigation"
                eventPayload={{ month, day: currentDay + 1, action: "prev_next" }}
              >
                <ChevronRight className="h-4 w-4" />
              </TrackedLink>
            </Button>
          )}
          {currentDay >= Math.max(...days) && <div className="w-8" />}
        </div>

        {/* Current Day Label */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            {lang === "ta" ? `நாள் ${currentDay}` : `Day ${currentDay}`}
          </p>
        </div>
      </div>
    );
  }

  // Month display names
  const monthDisplayNames: Record<string, string> = {
    jan: lang === "ta" ? "ஜனவரி" : "January",
    january: lang === "ta" ? "ஜனவரி" : "January",
    feb: lang === "ta" ? "பிப்ரவரி" : "February",
    february: lang === "ta" ? "பிப்ரவரி" : "February",
    mar: lang === "ta" ? "மார்ச்" : "March",
    march: lang === "ta" ? "மார்ச்" : "March",
    apr: lang === "ta" ? "ஏப்ரல்" : "April",
    april: lang === "ta" ? "ஏப்ரல்" : "April",
    may: lang === "ta" ? "மே" : "May",
    jun: lang === "ta" ? "ஜூன்" : "June",
    june: lang === "ta" ? "ஜூன்" : "June",
    jul: lang === "ta" ? "ஜூலை" : "July",
    july: lang === "ta" ? "ஜூலை" : "July",
    aug: lang === "ta" ? "ஆகஸ்ட்" : "August",
    august: lang === "ta" ? "ஆகஸ்ட்" : "August",
    sep: lang === "ta" ? "செப்டம்பர்" : "September",
    september: lang === "ta" ? "செப்டம்பர்" : "September",
    oct: lang === "ta" ? "அக்டோபர்" : "October",
    october: lang === "ta" ? "அக்டோபர்" : "October",
    nov: lang === "ta" ? "நவம்பர்" : "November",
    november: lang === "ta" ? "நவம்பர்" : "November",
    dec: lang === "ta" ? "டிசம்பர்" : "December",
    december: lang === "ta" ? "டிசம்பர்" : "December",
  };

  const monthName = monthDisplayNames[month.toLowerCase()] || month.charAt(0).toUpperCase() + month.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Month Name Header */}
      <div className="text-center py-8">
        <h1 className={`text-3xl font-bold text-primary ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}>
          {monthName}
        </h1>
      </div>

      {/* Day Picker */}
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          {currentDay > 1 && (
            <Button variant="outline" size="icon" asChild>
              <TrackedLink
                href={`/${lang}/${month}/day/${currentDay - 1}`}
                eventName="date_navigation"
                eventPayload={{ month, day: currentDay - 1, action: "prev_next" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </TrackedLink>
            </Button>
          )}
          {currentDay <= 1 && <div className="w-10" />}

          {/* Day Numbers */}
          <div className="flex flex-wrap justify-center gap-2">
            {days.map((day) => (
              <TrackedLink
                key={day}
                href={`/${lang}/${month}/day/${day}`}
                eventName="date_navigation"
                eventPayload={{ month, day, action: "day_select" }}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg font-medium transition-all",
                  day === currentDay
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {day}
              </TrackedLink>
            ))}
          </div>

          {/* Next Button */}
          {currentDay < Math.max(...days) && (
            <Button variant="outline" size="icon" asChild>
              <TrackedLink
                href={`/${lang}/${month}/day/${currentDay + 1}`}
                eventName="date_navigation"
                eventPayload={{ month, day: currentDay + 1, action: "prev_next" }}
              >
                <ChevronRight className="h-4 w-4" />
              </TrackedLink>
            </Button>
          )}
          {currentDay >= Math.max(...days) && <div className="w-10" />}
        </div>

        {/* Current Day Label */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {lang === "ta" ? `நாள் ${currentDay} • ${monthName}` : `Day ${currentDay} • ${monthName}`}
          </p>
        </div>
      </main>
    </div>
  );
}
