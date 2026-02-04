"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface MonthTabsProps {
  months: string[];
  activeMonth: string;
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

export function MonthTabs({ months, activeMonth }: MonthTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMonth = searchParams.get("month");

  const handleMonthChange = (month: string) => {
    // Check if we're on a month page (/[month]/day/[number]) or home page
    const path = window.location.pathname;

    if (path.startsWith("/feb/") || path.startsWith("/mar/") || path.startsWith("/apr/")) {
      // On a month detail page, navigate to the month's list page
      router.push(`/${month}`);
    } else {
      // On home page, update query param
      const params = new URLSearchParams(searchParams.toString());
      if (month === months[0] && !currentMonth) {
        params.delete("month");
      } else {
        params.set("month", month);
      }
      router.push(`/?${params.toString()}`);
    }
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
