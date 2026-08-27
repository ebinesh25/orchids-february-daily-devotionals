import { Noto_Sans_Tamil, Noto_Sans } from "next/font/google";

export const tamilFont = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
  preload: true,
});

export const englishFont = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-en",
  display: "swap",
  preload: true,
});

