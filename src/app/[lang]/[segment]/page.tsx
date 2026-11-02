import { notFound } from "next/navigation";
import LegacyMonthArchive from "@/components/LegacyMonthArchive";
import YearArchive from "@/components/YearArchive";
import { getAvailableMonths } from "@/lib/data";
import { CONTENT_YEAR } from "@/lib/dates";
import { isValidLang } from "@/types/lang";

type Props = { params: Promise<{ lang: string; segment: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, segment } = await params;
  if (/^\d{4}$/.test(segment)) {
    return {
      title: `${segment} ${lang === "ta" ? "வேதாகம தொடர்கள்" : "Devotional Calendar"}`,
      alternates: { canonical: `/${lang}/${segment}`, languages: { en: `/en/${segment}`, ta: `/ta/${segment}` } },
    };
  }
  const monthName = segment.charAt(0).toUpperCase() + segment.slice(1);
  return {
    title: lang === "ta" ? `${monthName} வேதாகம தொடர்கள்` : `${monthName} Bible Series`,
    alternates: { canonical: `/${lang}/${segment}`, languages: { en: `/en/${segment}`, ta: `/ta/${segment}` } },
  };
}

export default async function ArchiveIndex({ params }: Props) {
  const { lang, segment } = await params;
  if (!isValidLang(lang)) notFound();
  if (/^\d{4}$/.test(segment)) return <YearArchive lang={lang} year={segment} />;
  return <LegacyMonthArchive params={Promise.resolve({ lang, month: segment })} />;
}

export async function generateStaticParams() {
  const months = await getAvailableMonths();
  const segments = Array.from(new Set([...months, String(CONTENT_YEAR)]));
  return ["en", "ta"].flatMap(lang => segments.map(segment => ({ lang, segment })));
}
