import Link from "next/link";
import { ThemeMenu } from "@/components/ThemeMenu";
import { monthLabel } from "@/lib/dates";
import { SupportedLang } from "@/types/lang";
export function ArchiveShell({ lang, year, month, children }: { lang: SupportedLang; year: number; month?: string; children: React.ReactNode }) {
  const path = `/${year}${month ? `/${month}` : ""}`;
  return <div className={`min-h-screen bg-background text-foreground ${lang === "ta" ? "lang-ta" : "lang-en"}`}>
    <header className="border-b bg-background/80">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href={`/${lang}`} className="text-xl font-bold text-primary">{lang === "ta" ? "வேதாகம தொடர்" : "Bible Series"}</Link>
        <div className="flex shrink-0 items-center gap-1">
        <Link href={`/${lang === "en" ? "ta" : "en"}${path}`} className="rounded-md px-3 py-2 text-sm hover:bg-muted">{lang === "en" ? "தமிழ்" : "English"}</Link>
        <ThemeMenu lang={lang} />
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href={`/${lang}`} className="hover:underline">{lang === "ta" ? "முகப்பு" : "Home"}</Link><span>/</span>
        <Link href={`/${lang}/${year}`} className="hover:underline">{year}</Link>{month && <><span>/</span><span aria-current="page">{monthLabel(+month, lang)}</span></>}
      </nav>
      {children}
    </main>
    <footer className="mt-12 border-t px-4 py-8 text-center text-sm text-muted-foreground">© {year} Christian Bible Series. May God bless you.</footer>
  </div>;
}
