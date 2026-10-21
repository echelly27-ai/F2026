# NEXTUP

NEXTUP is a basketball recruiting workspace. Athletes can keep a profile, film links, a checklist, and the schools they are researching in one place. The public directory is the ESPN 2027 SC Next 100 as listed on October 19, 2026: https://www.espn.com/college-sports/basketball/recruiting/playerrankings/_/class/2027/view/scouts100

No credentials are required to use the app.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

## What works without setup

- Landing page, the public 2027 directory, and individual prospect profiles
- Search, filters, and sort on the ranking table and cards
- Demo sign-in (name and email stored in this browser only; no demo password)
- Dashboard profile editing, completion percentage, checklist, film links, and saved players
- College tracker with statuses Interested, Contacted, and Evaluating
- Local persistence in `localStorage` (`nextup-board-v1` and `nextup-session-v1`)

Directory facts come from that public ranking table: rank, name, position, hometown, high school, height, weight, stars, and grade. A commitment is shown only when that row lists one. GPA, season statistics, and highlight URLs were not published as data on the rows, so those fields stay blank. Scouting reports link out to ESPN instead of being copied. Your dashboard profile is separate and does not overwrite a prospect. Outreach dates are dates you enter yourself. The app does not invent offers or coach contacts.

## Optional Supabase

Leave the variables unset and the app stays in demo mode.

When you want accounts and a cloud copy of the board, create a Supabase project and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy `.env.example` to `.env.local` for local development. In Vercel, add the same names under Project Settings → Environment Variables.

Use the anon public key only. Do not create a `NEXT_PUBLIC_` variable for the service-role key. This app never reads a service-role key.

Then run the SQL in `supabase/schema.sql` in the Supabase SQL editor. It creates `athlete_boards` with row level security so a signed-in user can read and write only their own row. Email confirmation depends on your Supabase Auth settings. If confirmation is required, create the account, confirm the email, then sign in. Demo mode still works beside that.

## Live site

GitHub Pages serves the static export at [https://echelly27-ai.github.io/F2026/](https://echelly27-ai.github.io/F2026/). Pushes to `main` run `.github/workflows/pages.yml` with `GITHUB_PAGES=true`, which sets `basePath` to `/F2026`. A normal `npm run build` stays a standard Next.js build for Vercel.

## Publish with GitHub and Vercel

1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository. The framework preset is Next.js. No `vercel.json` is required.
3. Leave the Supabase variables empty for a demo deployment, or add the two public variables above.
4. Deploy. Vercel runs `npm run build`.

`main` on GitHub is the usual production branch. Open a pull request for review, then merge when you want that deploy to update.

## Photography

Prospect photos are the public 247Sports recruiting pictures saved in `public/images/players`. Yohane Kabongo and Anthony Brown have no verified public photo, so those rows show initials on a dark placeholder. A missing image does not fall back to a hoop graphic.
