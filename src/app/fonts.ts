import { Noto_Sans_Tamil, Noto_Sans } from "next/font/google";

// Noto Sans Tamil has the most complete Tamil character coverage
export const tamilFont = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
  preload: true,
});

export const englishFont = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-en",
  display: "swap",
});
