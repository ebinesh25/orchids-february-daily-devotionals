import { notFound } from "next/navigation";
import { getAvailableMonths, getAllDevotionalsForMonth, normalizeMonthName } from "@/lib/data";
import { MonthTabsWrapper } from "@/components/MonthTabsWrapper";
import { ArticleCard } from "@/components/ArticleCard";
import { LangParams } from "@/types/lang";
import { isValidLang } from "@/types/lang";

type MonthPageProps = {
  params: Promise<LangParams & { month: string }>;
};

export async function generateMetadata({ params }: MonthPageProps) {
  const { lang, month } = await params;
  const monthName = month.charAt(0).toUpperCase() + month.slice(1);

  return {
    title: lang === "ta"
      ? `${monthName} வேதாகம தொடர்கள்`
      : `${monthName} Bible Series`,
    alternates: {
      canonical: `/${lang}/${month}`,
      languages: {
        'en': `/en/${month}`,
        'ta': `/ta/${month}`,
      },
    },
  };
}

export default async function LangMonthPage({ params }: MonthPageProps) {
  const { lang, month } = await params;

  // Validate language
  if (!isValidLang(lang)) {
    notFound();
  }

  const language = lang === "ta" ? "tamil" : "english";
  const availableMonths = await getAvailableMonths();

  // Normalize month name (e.g., "march" → "mar") for data lookup
  const normalizedMonth = normalizeMonthName(month);

  // Validate month exists
  if (!availableMonths.includes(normalizedMonth)) {
    notFound();
  }

  const devotionals = await getAllDevotionalsForMonth(normalizedMonth);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <a
            href={`/${lang}`}
            className={`text-xl font-bold text-primary ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif tracking-tight"}`}
          >
            {lang === "ta" ? "வேதாகம தொடர்" : "Bible Series"}
          </a>
          <div className={`text-sm text-muted-foreground ${lang === "ta" ? "lang-ta font-sans" : "lang-en"}`}>
            {month.charAt(0).toUpperCase() + month.slice(1)}{" "}
            {lang === "ta" ? "வேதாகம தொடர்" : "Bible Series"}
          </div>
        </div>
      </header>

      {/* Month Tabs */}
      <MonthTabsWrapper
        months={availableMonths}
        activeMonth={normalizedMonth}
        lang={lang}
      />

      {/* Articles List */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className={`text-3xl font-bold text-primary mb-6 ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}>
          {month.charAt(0).toUpperCase() + month.slice(1)}{" "}
          {lang === "ta" ? "கட்டுரைகள்" : "Articles"}
        </h1>
        <div className="grid gap-4 md:grid-cols-2">
          {devotionals.map(({ day, devotional }) => (
            <ArticleCard
              lang={lang}
              key={day}
              month={normalizedMonth}
              day={day}
              devotional={devotional}
              language={language}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Christian Bible Series. May God bless you.</p>
      </footer>
    </div>
  );
}

// Generate static params for all available months and both languages
export async function generateStaticParams() {
  const months = await getAvailableMonths();
  const params: Array<{ lang: string; month: string }> = [];

  for (const month of months) {
    params.push({ lang: "ta", month });
    params.push({ lang: "en", month });
  }

  return params;
}
