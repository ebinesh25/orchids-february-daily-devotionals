import { getDevotional } from "@/lib/data";
import Reader from "@/components/Reader";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    month: string;
  }>;
}

export default async function MonthTodayPage({ params }: PageProps) {
  const { month } = await params;

  const today = new Date();
  const day = today.getDate();

  const result = await getDevotional(month, day);

  if (!result) {
    notFound();
  }

  return <Reader devotional={result.devotional} month={month} day={result.dayNum} />;
}
