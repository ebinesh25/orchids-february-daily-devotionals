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
import { Type, Languages, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { OnboardingTour } from "@/components/OnboardingTour";
import { DayPicker } from "@/components/DayPicker";

interface ReaderProps {
  devotional: Devotional;
  month: string;
  day: number;
  days: number[];
}

const fontSizes = [
  { label: "Small", value: "text-sm" },
  { label: "Normal", value: "text-base" },
  { label: "Large", value: "text-lg" },
  { label: "Extra Large", value: "text-xl" },
  { label: "Maximum", value: "text-2xl" },
];

export default function Reader({ devotional, month, day, days }: ReaderProps) {
  const [language, setLanguage] = useState<"english" | "tamil">("english");
  const [fontSize, setFontSize] = useState("text-lg");
  const { theme, setTheme } = useTheme();

  // Clean up excessive newlines (more than 2 consecutive newlines)
  const cleanContent = (text: string) => {
    return text.replace(/\n{3,}/g, "\n\n");
  };

  const langData =
    language === "english" ? devotional.english : devotional.tamil;
  const title = langData.title;
  const content = cleanContent(langData.data);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <OnboardingTour />
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-tight text-primary"
          >
            Devotional
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <Button
              id="language-button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setLanguage(language === "english" ? "tamil" : "english")
              }
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
        {/* Title */}
        <h1
          className={`font-serif font-bold text-3xl md:text-4xl mb-8 text-primary ${fontSize}`}
        >
          {title}
        </h1>

        <article
          className={`prose prose-slate dark:prose-invert max-w-none font-serif leading-relaxed ${fontSize}`}
        >
          <div className="whitespace-pre-wrap">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>

        {/* Day Picker */}
        <div className="mt-12 border-t pt-8">
          <DayPicker month={month} days={days} currentDay={day} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Christian Devotionals. May God bless you.</p>
      </footer>
    </div>
  );
}
