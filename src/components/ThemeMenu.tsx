"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupportedLang } from "@/types/lang";

export function ThemeMenu({ lang }: { lang: SupportedLang }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const selected = mounted ? theme || "system" : "system";
  const Icon = selected === "light" ? Sun : selected === "dark" ? Moon : Monitor;
  const label = lang === "ta" ? "திரைத் தோற்றம்" : "Appearance";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id="theme-button" variant="ghost" size="icon" aria-label={label} title={label}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={selected} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="system" className="min-h-11 gap-2">
            <Monitor className="h-4 w-4" aria-hidden="true" />
            {lang === "ta" ? "சாதன அமைப்பு" : "Use system setting"}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light" className="min-h-11 gap-2">
            <Sun className="h-4 w-4" aria-hidden="true" />
            {lang === "ta" ? "வெளிர்" : "Light"}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="min-h-11 gap-2">
            <Moon className="h-4 w-4" aria-hidden="true" />
            {lang === "ta" ? "இருள்" : "Dark"}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
