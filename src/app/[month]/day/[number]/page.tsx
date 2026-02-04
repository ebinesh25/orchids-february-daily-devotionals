import { getDevotional, getAllDaysForMonth } from "@/lib/data";
import Reader from "@/components/Reader";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    month: string;
    number: string;
  }>;
}

export default async function DayPage({ params }: PageProps) {
  const { month, number } = await params;
  const day = parseInt(number);

  if (isNaN(day)) {
    notFound();
  }

  const result = await getDevotional(month, day);

  if (!result) {
    notFound();
  }

  const days = await getAllDaysForMonth(month);

  return <Reader devotional={result.devotional} month={month} day={result.dayNum} days={days} />;
}
