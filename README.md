# NEXTUP

NEXTUP is a basketball recruiting workspace. Athletes can keep a profile, film links, a checklist, and the schools they are researching in one place. The discovery roster is fictional demonstration data.

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

- Landing page, discovery, and individual demonstration profiles
- Search, filters, and sort on the player board
- Demo sign-in (name and email stored in this browser only; no demo password)
- Dashboard profile editing, completion percentage, checklist, film links, and saved players
- College tracker with statuses Interested, Contacted, and Evaluating
- Local persistence in `localStorage` (`nextup-board-v1` and `nextup-session-v1`)

Demonstration players are not real athletes. Statistics, academics, and school names on those profiles are sample content. Outreach dates are dates you enter yourself. The app does not invent offers or coach contacts.

## Optional Supabase

Leave the variables unset and the app stays in demo mode.

When you want accounts and a cloud copy of the board, create a Supabase project and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy `.env.example` to `.env.local` for local development. In Vercel, add the same names under Project Settings → Environment Variables.

Use the anon public key only. Do not create a `NEXT_PUBLIC_` variable for the service-role key. This app never reads a service-role key.

Then run the SQL in `supabase/schema.sql` in the Supabase SQL editor. It creates `athlete_boards` with row level security so a signed-in user can read and write only their own row. Email confirmation depends on your Supabase Auth settings. If confirmation is required, create the account, confirm the email, then sign in. Demo mode still works beside that.

## Publish with GitHub and Vercel

1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository. The framework preset is Next.js. No `vercel.json` is required.
3. Leave the Supabase variables empty for a demo deployment, or add the two public variables above.
4. Deploy. Vercel runs `npm run build`.

`main` on GitHub is the usual production branch. Open a pull request for review, then merge when you want that deploy to update.

## Photography

Player and arena images are stored in `public/images` so the pages do not depend on a remote image host at runtime. Sources are Unsplash and Pexels. If a file fails to load, the UI falls back to `public/images/fallback.jpg`.
