This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Date-based devotional URLs

- `/{lang}/2026/MM/DD` opens a devotional (zero-padded month/day).
- `/{lang}/2026/MM` lists every devotional in the month, with a calendar.
- `/{lang}/2026` displays the yearly calendar. Published dates link to readings;
  unpublished dates remain inactive.
- English (`en`) and Tamil (`ta`) have matching routes and canonical/language metadata.
- Middleware permanently redirects legacy abbreviated/full month URLs such as
  `/en/nov/day/1/` directly to `/en/2026/11/01` using HTTP 308. Query parameters
  are preserved; legacy `la` selects the language and is removed.
- `/today` aliases use temporary redirects because their destinations change.
  The current day follows `Asia/Kolkata`.

The current Convex collection stores only month/day, without a year. All existing
records are assigned to the fixed `CONTENT_YEAR = 2026` in `src/lib/dates.ts`.
Other year archives return 404 rather than duplicating 2026 content. Supporting
additional content years requires adding year fields and year-aware queries to
Convex and the uploader; do not change this constant to roll into a new year,
as that would change historical links.

Routing checks: `node --import tsx scripts/test-date-routing.ts`.
