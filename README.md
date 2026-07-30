# Heinrich Co. — Operations

Internal operations command center for Heinrich Co. Consolidates Sales, Finance,
Marketing, Operations, Reports, and the Darwin AI layer into one interface.

Built from the design prototype (`index.html`) as a full-stack Next.js 14 app —
same brand system, layout, and UX patterns, made responsive for mobile.

## Tech stack

- **Frontend:** React 18 + Next.js 14 (App Router)
- **Styling:** Tailwind CSS + brand design tokens (`app/globals.css`)
- **Database / Auth:** Supabase (PostgreSQL + RLS + Auth)
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`) for Darwin + invoice capture
- **Icons:** Lucide React · **Charts:** custom brand SVG (Recharts available)
- **Hosting:** Vercel (Cron for sync jobs)

## Demo mode

The app runs fully **without any configuration**, using the seed data in
`lib/data.ts`. This mirrors the prototype so every screen is meaningful before
Supabase, Google, or Anthropic are connected.

- **Auth:** disabled → the login page enters the workspace directly.
- **Darwin:** streams canned executive-tone responses.
- **Invoice capture:** returns sample extractions.
- **Sync routes:** respond `{ configured: false }` and no-op.

Add the corresponding env vars (see `.env.example`) to switch each subsystem to
live data. Detection is per-subsystem, so you can enable them one at a time.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — leave blank for demo mode
npm run dev                  # http://localhost:3000
```

## Supabase setup

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor (tables + RLS policies).
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY`.
4. Add each team member to the `users` table with their `role`. There is no
   self-signup — access is granted manually.

When Supabase is configured, `middleware.ts` gates the app behind auth and
redirects unauthenticated users to `/login`.

## Roles & access

| Role      | Sales | Finance | Everything else |
| --------- | ----- | ------- | --------------- |
| owner     | ✓     | ✓       | ✓               |
| admin     | ✓     | (syed)  | ✓               |
| manager   | ✓     | —       | ✓               |
| member    | —     | —       | ✓               |
| viewer    | —     | —       | ✓               |

Finance is hidden in the sidebar for non-owners and guarded on the page itself.
The "Viewing as" switcher in the sidebar demonstrates role gating without login.


## Feature modules & extensibility

Each module works in demo mode and turns "live" when its env vars are set:

| Module | Live when you set | Notes |
| --- | --- | --- |
| Installable app (PWA) | (always on) | `app/manifest.ts`, `public/sw.js`, offline page. Add-to-Home-Screen + offline shell. |
| Push notifications | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (+ Supabase) | Subscribe from the bell; send via `POST /api/push/send` (CRON_SECRET-guarded). |
| Real-time updates | Supabase | `useLiveResource` subscribes to table changes; Sales leads wired as reference. |
| Persisted approvals + audit | Supabase | `/api/approvals` + `/api/audit`; owner-only activity card in Operations. |
| Darwin → Gmail/Calendar | `GOOGLE_WORKSPACE_SUBJECT` (+ delegation) | Draft follow-ups / book events from the lead drawer. |

### Adding a new external data source

The data layer decouples the UI from where data comes from. To add a source:

1. Register it in `lib/resources.ts` (`{ table, realtime }`).
2. Add a branch (and optional row→UI mapper) in `lib/data-source.ts`.
3. Read it anywhere via `GET /api/data/<name>` or the `useLiveResource` hook.

Pages never change when a source is swapped or added.

## Deployment

```bash
vercel --prod
```

Add all env vars in the Vercel dashboard, then optionally configure the custom
domain `ops.heinrichco-ai.com`.

## Project structure

```
app/
  (app)/            authenticated app shell + routed pages
    page.tsx        Command Center (home)
    sales/  finance/  marketing/  operations/  reports/  darwin/
  api/
    darwin/         Claude proxy (streamed) + fallback
    capture/        invoice photo → Claude Vision extraction
    sync/           sheets · calendar
  login/            Google OAuth + email/password
  auth/callback/    OAuth code exchange
components/         layout · shared · sales · finance
lib/                data (seed) · supabase · darwin · reports · roles · nav
supabase/schema.sql
```
