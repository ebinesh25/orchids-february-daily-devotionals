import { getTodayDevotional } from "@/lib/data";
import { dayPath } from "@/lib/dates";
import { isValidLang } from "@/types/lang";
import { redirect, notFound } from "next/navigation";
// Today is a moving alias; never cache its redirect as a permanent date.
export const dynamic = "force-dynamic";
export default async function TodayPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const today = await getTodayDevotional();
  if (!today) notFound();
  redirect(dayPath(lang, today.month, today.day));
}
