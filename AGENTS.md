## Project Summary
A clean, mobile-friendly Christian devotional application that allows users to read daily articles in English and Tamil. It features a customizable reading experience with font size presets and theme toggles.

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS (with Typography plugin)
- react-markdown
- next-themes
- Lucide React icons
- Radix UI (via shadcn/ui components)

## Architecture
- `data.json`: Centralized storage for devotional content organized by month.
- `src/lib/data.ts`: Server-side data fetching utilities.
- `src/components/Reader.tsx`: Main client-side reading interface with language, font, and theme controls.
- `src/app/[month]/today`: Dynamic route for the current day's devotional.
- `src/app/[month]/day/[number]`: Dynamic route for specific historical devotionals.

## User Preferences
- Reading-friendly Christian aesthetic (serif fonts, clean layout).
- Bilingual support (English/Tamil).
- 5 font size presets for accessibility.
- Dark and Light mode support.

## Project Guidelines
- Use `data.json` as the source of truth for all devotional content.
- Ensure all reading interfaces are responsive and optimized for mobile devices.
- Maintain a respectful and serene visual tone.

## Common Patterns
- Server components fetch data and pass to `Reader` client component.
- Content rendered using `react-markdown` with `whitespace-pre-wrap` for proper formatting.
