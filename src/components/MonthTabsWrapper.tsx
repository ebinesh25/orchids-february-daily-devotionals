"use client";

import { Suspense } from "react";
import { MonthTabs } from "@/components/MonthTabs";

interface MonthTabsWrapperProps {
  months: string[];
  activeMonth: string;
  lang: "en" | "ta";
}

export function MonthTabsWrapper({ months, activeMonth, lang }: MonthTabsWrapperProps) {
  return (
    <Suspense fallback={<div className="border-b h-12" />}>
      <MonthTabs months={months} activeMonth={activeMonth} lang={lang} />
    </Suspense>
  );
}
