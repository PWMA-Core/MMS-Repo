# PWMA Membership Management System

Membership Management System for the Private Wealth Management Association of Hong Kong. Unified portal for member registration, CPWP and CPWPA applications and renewals, events, OPT tracking, and payments.

## Tech stack

| Layer           | Choice                                  |
| --------------- | --------------------------------------- |
| Build tool      | Vite 8                                  |
| Framework       | React 19 + TypeScript 6 (strict)        |
| Routing         | React Router v7                         |
| Styling         | Tailwind CSS v4 + shadcn/ui             |
| Data            | TanStack Query v5                       |
| Backend         | Supabase (Postgres + Auth + Storage)    |
| Forms           | react-hook-form + zod                   |
| State           | Zustand                                 |
| Dates           | date-fns                                |
| Email           | Microsoft 365 SMTP (env-gated, interface abstracted) |
| Unit test       | Vitest + Testing Library                |
| E2E test        | Playwright                              |
| Lint / format   | ESLint flat config + Prettier           |
| Git hooks       | Husky + lint-staged                     |

Node 20 LTS (see `.nvmrc`).

## Branch strategy

- `main` — production code
- `staging` — testing environment
- `feature/*` — active development

## Quickstart

```bash
nvm use                       # or ensure Node 20
npm install
cp .env.example .env.local    # fill values once Supabase project is connected
npm run dev                   # http://localhost:5173
```

Supabase local (requires Docker):

```bash
npm run supabase:start        # starts local Postgres, Auth, Studio
npm run supabase:reset        # applies all migrations + seed.sql
npm run supabase:types        # regenerates src/lib/supabase/types.ts
```

## Commands

| Command                   | Purpose                              |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Vite dev server                      |
| `npm run build`           | Type-check and production bundle     |
| `npm run preview`         | Serve `dist/`                        |
| `npm run lint`            | ESLint                               |
| `npm run typecheck`       | `tsc -b --noEmit`                    |
| `npm run test:unit`       | Vitest (JSDOM)                       |
| `npm run test:unit:watch` | Vitest watch                         |
| `npm run test:e2e`        | Playwright                           |
| `npm run format`          | Prettier write                       |
| `npm run format:check`    | Prettier check                       |
| `npm run supabase:start`  | Start local Supabase stack           |
| `npm run supabase:stop`   | Stop local Supabase stack            |
| `npm run supabase:reset`  | Reset local DB and apply seed        |
| `npm run supabase:types`  | Regenerate typed DB schema           |

## Project structure

```
MMS-Repo/
├── public/                         Static assets
├── src/
│   ├── main.tsx                    Entry point
│   ├── App.tsx                     Providers (Query, Theme, Router)
│   ├── router.tsx                  Route tree
│   ├── routes/                     Route components (public, auth, member, admin)
│   ├── components/
│   │   ├── ui/                     shadcn primitives
│   │   ├── forms/                  Registration and profile forms
│   │   └── layout/                 Header, footer, side nav
│   ├── lib/
│   │   ├── supabase/               Client and types
│   │   ├── query/                  TanStack Query client
│   │   ├── email/                  EmailProvider interface and implementations
│   │   ├── validators/             zod schemas (HKID, auth, profile, registration)
│   │   ├── constants/              Roles, statuses, fees, eligibility
│   │   └── utils/cn.ts             classnames utility
│   ├── hooks/                      use-session, use-user
│   ├── stores/                     Zustand session store
│   ├── types/                      Database types
│   └── index.css                   Tailwind entry and theme tokens
├── supabase/
│   ├── config.toml                 Local Supabase config
│   ├── migrations/                 SQL migrations
│   └── seed.sql                    Local seed data
├── tests/
│   ├── unit/                       Vitest unit tests
│   └── e2e/                        Playwright specs
├── .github/workflows/ci.yml        Lint, typecheck, unit test, build
├── .husky/pre-commit               lint-staged on staged files
├── vercel.json                     SPA deploy config
└── ...                             Config files
```

## Configuration

Copy `.env.example` to `.env.local` and fill in:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_EMAIL_PROVIDER` — email provider identifier (default `m365`)
- `M365_SMTP_USER` — Microsoft 365 mailbox user (server-side only)
- `M365_SMTP_PASS` — Microsoft 365 mailbox password or app password (server-side only)
- `M365_SMTP_FROM` — default `From` address for outbound email
- `VITE_PUBLIC_URL` — public base URL (used in email links)
- `VITE_ENV` — environment label (`development`, `staging`, `production`)

## Testing

```bash
npm run test:unit      # unit tests (Vitest, JSDOM)
npm run test:e2e       # end-to-end tests (Playwright)
```

## Deployment

Static SPA. Build output in `dist/`. `vercel.json` is configured for Vercel with SPA rewrites to `index.html`.
