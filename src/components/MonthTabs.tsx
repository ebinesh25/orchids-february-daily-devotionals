"use client";

import { useRouter } from "next/navigation";
import { monthPath } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/lib/analytics";

interface MonthTabsProps {
  months: string[];
  activeMonth: string;
  lang: "en" | "ta";
}

// Map short month names to display names
const monthDisplayNames: Record<string, string> = {
  jan: "Jan",
  feb: "Feb",
  mar: "Mar",
  apr: "Apr",
  may: "May",
  jun: "Jun",
  jul: "Jul",
  aug: "Aug",
  sep: "Sep",
  oct: "Oct",
  nov: "Nov",
  dec: "Dec",
};

export function MonthTabs({ months, activeMonth, lang }: MonthTabsProps) {
  const router = useRouter();
  const { track } = useAnalytics();

  const handleMonthChange = (month: string) => {
    track("date_navigation", {
      month,
      action: "month_select",
    });

    router.push(monthPath(lang, month));
  };

  return (
    <div className="border-b">
      <div className="flex overflow-x-auto scrollbar-hide">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => handleMonthChange(month)}
            className={cn(
              "px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors relative",
              activeMonth === month
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {monthDisplayNames[month] || month}
            {activeMonth === month && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
