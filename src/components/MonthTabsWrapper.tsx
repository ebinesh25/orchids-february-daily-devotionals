"use client";

import { Suspense } from "react";
import { MonthTabs } from "@/components/MonthTabs";

interface MonthTabsWrapperProps {
  months: string[];
  activeMonth: string;
}

export function MonthTabsWrapper({ months, activeMonth }: MonthTabsWrapperProps) {
  return (
    <Suspense fallback={<div className="border-b h-12" />}>
      <MonthTabs months={months} activeMonth={activeMonth} />
    </Suspense>
  );
}
