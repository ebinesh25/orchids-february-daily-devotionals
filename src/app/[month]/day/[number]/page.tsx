import { getDevotional } from "@/lib/data";
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

  const devotional = await getDevotional(month, day);

  if (!devotional) {
    notFound();
  }

  return <Reader devotional={devotional} month={month} />;
}
