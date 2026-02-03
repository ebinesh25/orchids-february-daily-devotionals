"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Devotional } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Type, Languages, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { OnboardingTour } from "@/components/OnboardingTour";

interface ReaderProps {
  devotional: Devotional;
  month: string;
}

const fontSizes = [
  { label: "Small", value: "text-sm" },
  { label: "Normal", value: "text-base" },
  { label: "Large", value: "text-lg" },
  { label: "Extra Large", value: "text-xl" },
  { label: "Maximum", value: "text-2xl" },
];

export default function Reader({ devotional, month }: ReaderProps) {
  const [language, setLanguage] = useState<"english" | "tamil">("english");
  const [fontSize, setFontSize] = useState("text-lg");
  const { theme, setTheme } = useTheme();

  const content = language === "english" ? devotional.english : devotional.tamil;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <OnboardingTour />
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight text-primary">
            Devotional
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <Button
              id="language-button"
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "english" ? "tamil" : "english")}
              title="Switch Language"
            >
              <Languages className="h-5 w-5" />
            </Button>

            {/* Font Size Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button id="font-button" variant="ghost" size="icon">
                  <Type className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {fontSizes.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => setFontSize(size.value)}
                    className={fontSize === size.value ? "bg-accent" : ""}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              id="theme-button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
        <article className={`prose prose-slate dark:prose-invert max-w-none font-serif leading-relaxed ${fontSize}`}>
          <div className="whitespace-pre-wrap">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Navigation Buttons */}
        <div className="mt-12 flex items-center justify-between border-t pt-8">
          {devotional.day > 1 ? (
            <Button variant="outline" asChild>
              <Link href={`/${month}/day/${devotional.day - 1}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Day
              </Link>
            </Button>
          ) : (
            <div />
          )}
          
          <Button variant="outline" asChild>
            <Link href={`/${month}/day/${devotional.day + 1}`}>
              Next Day
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Christian Devotionals. May God bless you.</p>
      </footer>
    </div>
  );
}
