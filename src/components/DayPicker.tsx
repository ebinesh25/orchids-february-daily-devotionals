import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayPickerProps {
  month: string;
  days: number[];
  currentDay: number;
  inline?: boolean;
}

export function DayPicker({ month, days, currentDay, inline = false }: DayPickerProps) {
  const dayLinks = days.map((day) => (
    <Link
      key={day}
      href={`/${month}/day/${day}`}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg font-medium transition-all text-sm",
        day === currentDay
          ? "bg-primary text-primary-foreground shadow-md scale-105"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {day}
    </Link>
  ));

  if (inline) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center gap-1">
          {/* Previous Button */}
          {currentDay > 1 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/${month}/day/${currentDay - 1}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
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
              <Link href={`/${month}/day/${currentDay + 1}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {currentDay >= Math.max(...days) && <div className="w-8" />}
        </div>

        {/* Current Day Label */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Day {currentDay}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Day Picker */}
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          {currentDay > 1 && (
            <Button variant="outline" size="icon" asChild>
              <Link href={`/${month}/day/${currentDay - 1}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {currentDay <= 1 && <div className="w-10" />}

          {/* Day Numbers */}
          <div className="flex flex-wrap justify-center gap-2">
            {days.map((day) => (
              <Link
                key={day}
                href={`/${month}/day/${day}`}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg font-medium transition-all",
                  day === currentDay
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {day}
              </Link>
            ))}
          </div>

          {/* Next Button */}
          {currentDay < Math.max(...days) && (
            <Button variant="outline" size="icon" asChild>
              <Link href={`/${month}/day/${currentDay + 1}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {currentDay >= Math.max(...days) && <div className="w-10" />}
        </div>

        {/* Current Day Label */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Day {currentDay} • {month.charAt(0).toUpperCase() + month.slice(1)}
          </p>
        </div>
      </main>
    </div>
  );
}
