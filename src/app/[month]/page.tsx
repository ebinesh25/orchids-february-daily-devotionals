import { notFound } from "next/navigation";
import { getAvailableMonths, getAllDevotionalsForMonth } from "@/lib/data";
import { MonthTabsWrapper } from "@/components/MonthTabsWrapper";
import { ArticleCard } from "@/components/ArticleCard";

type Props = {
  params: Promise<{ month: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { month } = await params;
  return {
    title: `${month.charAt(0).toUpperCase() + month.slice(1)} Devotionals`,
  };
}

export default async function MonthPage({ params }: Props) {
  const { month } = await params;
  const availableMonths = await getAvailableMonths();

  // Validate month exists
  if (!availableMonths.includes(month)) {
    notFound();
  }

  const devotionals = await getAllDevotionalsForMonth(month);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <a href="/" className="font-serif text-xl font-bold tracking-tight text-primary">
            Devotional
          </a>
          <div className="text-sm text-muted-foreground">
            {month.charAt(0).toUpperCase() + month.slice(1)} Devotionals
          </div>
        </div>
      </header>

      {/* Month Tabs */}
      <MonthTabsWrapper
        months={availableMonths}
        activeMonth={month}
      />

      {/* Articles List */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-primary mb-6">
          {month.charAt(0).toUpperCase() + month.slice(1)} Articles
        </h1>
        <div className="grid gap-4 md:grid-cols-2">
          {devotionals.map(({ day, devotional }) => (
            <ArticleCard
              key={day}
              month={month}
              day={day}
              devotional={devotional}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Christian Devotionals. May God bless you.</p>
      </footer>
    </div>
  );
}

// Generate static params for all available months
export async function generateStaticParams() {
  const months = await getAvailableMonths();
  return months.map((month) => ({
    month,
  }));
}
