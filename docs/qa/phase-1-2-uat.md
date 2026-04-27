# UAT report — Phase 1 + Phase 2

**Branch under test:** `feature/phase-2-member-registration`
**Backend:** real Supabase project (anon + RLS active), with the migrations in this branch applied via `supabase db push`
**Method:** browser-driven end-to-end click-throughs against a deployed local dev server, plus REST probes against PostgREST to verify RLS edges
**Date:** 2026-04-23 (re-verified 2026-04-24 after fixes landed)

---

## Status overview — 8 of 8 PASS

| #   | Task scope                                                                      | Status                                 |
| --- | ------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | Dev environment health (`.env` flips backend between mock and real)             | PASS                                   |
| 2   | Phase 1 auth (sign-up, email verify, sign-in, password reset)                   | PASS — all 4 flows verified end-to-end |
| 3   | WF1 firm application (public submit + admin review + approval)                  | PASS                                   |
| 4   | WF2 individual registration (sign-up + admin approve + active)                  | PASS                                   |
| 5   | WF3 renewal (profile-confirm gate, lifecycle-state, OPT sum, auto-fill, submit) | PASS                                   |
| 6   | Profile change request (member submit + admin approve + write-back)             | PASS                                   |
| 7   | Firm admin consolidated view (`/firm/dashboard`, `/firm/employees`)             | PASS                                   |
| 8   | Admin dashboard live counts                                                     | PASS                                   |

**Code health:** typecheck clean, lint clean, **102 / 102 unit tests pass**, production build clean (~862 kB / 249 kB gz).

---

## Bugs found and fixed in this round

All 6 bugs found during this UAT pass have been fixed and are included in `feature/phase-2-member-registration`. Each entry is left intact below as a record so the same patterns can be checked for elsewhere.

### B-001 — Sign-up RLS missing → all sign-ups fail (FIXED)

**Severity:** P0 (blocks Phase 1 auth entirely)
**Symptom:** Click "Create account" on `/register/individual` → toast `new row violates row-level security policy for table "profiles"`.
**Root cause (two issues stacked):**

1. The original RLS migration defines `profiles_self_read` / `profiles_admin_read_all` / `profiles_self_update` / `profiles_admin_update_all`, but **no INSERT policy** for `profiles`.
2. With `mailer_autoconfirm: false` (Supabase default), `supabase.auth.signUp` returns `data.user` but `data.session = null`. The client is still anonymous on the immediate follow-up `from('profiles').insert(...)`, so even with a self-insert policy, `auth.uid()` would be NULL and a `auth.uid() = auth_user_id` check would fail.
   **Why our unit tests missed it:** the in-memory mock client (`src/lib/supabase/mock-client.ts`) does not enforce RLS. Sign-up "passed" 89 / 89 unit tests but failed on the live database. Mock-vs-real test gap.
   **Fix shipped:**

- New migration `supabase/migrations/20260423000012_signup_rls_and_trigger.sql`. Adds `profiles_self_insert` policy plus a `SECURITY DEFINER` trigger `handle_new_auth_user()` on `auth.users` that creates the profile row from `raw_user_meta_data`. Standard Supabase pattern; works whether email confirmation is on or off.
- `src/components/forms/registration-individual-form.tsx` and `registration-guest-form.tsx` refactored to pass `hkid`, `legal_name`, `date_of_birth`, `phone`, `address`, `role` (and `lifecycle_state` for guests) via `signUp.options.data`. Dropped the doomed client-side `profiles.insert`.
  **Repro after fix:** Sign-up form completes, redirects to `/verify`. Both `auth.users` row and `profiles` row exist; profile row has `auth_user_id` populated by the trigger.

### B-002 — Duplicate `/register/firm-admin` self-serve path bypasses approval gate (FIXED)

**Severity:** P1 (broken for all anon callers, and design-wise undermines WF1 approval gate)
**Symptom:** `/register/firm-admin` form submission failed with `new row violates row-level security policy for table "member_firms"`.
**Root cause:** the form did `auth.signUp` then three follow-up inserts on tables with admin-only RLS (`member_firms_admin_all FOR ALL USING (auth_is_pwma_admin())`, same for `firm_memberships`). Anon callers cannot satisfy these policies. Even if they could, this path lets anyone create a firm in PWMA's directory without staff vetting, which violates the WF1 review gate.
**Decision:** `/apply-firm` (WF1) is the canonical firm onboarding path per SOW + system flow. The duplicate `/register/firm-admin` was scaffolded by accident.
**Fix shipped:**

- Removed `/register/firm-admin` route from `src/router.tsx`.
- Replaced the "Firm admin" button on `/sign-up` chooser with a text link "Applying on behalf of a firm? → Submit a firm application" pointing at `/apply-firm`.
- Trashed `src/routes/_member/register/firm-admin.tsx` and `src/components/forms/registration-firm-admin-form.tsx`.
- Cleaned references in `src/components/debug/dev-nav.tsx` and `tests/e2e/registration.spec.ts`.
  **User journey:** new firm admins can find `/apply-firm` via (a) landing page primary CTA "Apply as a firm", (b) `/sign-up` chooser link.

### B-003 — `.insert(...).select('id').single()` returns 401 for anon callers (FIXED)

**Severity:** P0 (blocks public WF1 firm application submission entirely; also broke first-call notification enqueues from anon contexts)
**Symptom:** `/apply-firm` submit toasted `new row violates row-level security policy for table "firm_applications"`. Same pattern fired silent warnings from `dispatchNotificationAsync` on the same page.
**Root cause:** supabase-js's `.select(...).single()` after `.insert(...)` triggers PostgREST to set `Prefer: return=representation`, meaning PostgREST runs INSERT then SELECT inside one transaction. The INSERT passes RLS (`firm_applications_public_insert WITH CHECK (true)`), but the SELECT-back fails because anon has no SELECT policy on `firm_applications` (only `firm_applications_admin_all FOR ALL USING (auth_is_pwma_admin())` matches). The whole call returns 401 with the RLS-violation body.
**Verified by REST probe:**

- `apikey` only → HTTP 201 created
- `apikey + Authorization: Bearer <anon JWT> + Prefer: return=representation` → HTTP 401, code `42501`
  **Why our unit tests missed it:** the mock client returns the inserted row from `.insert(...).select(...).single()` without enforcing RLS-on-read.
  **Fix shipped:**
- `src/components/forms/firm-application-form.tsx` — drop `.select('id').single()`, return `null`. The id wasn't used downstream.
- `src/lib/notifications/dispatch.ts` — drop `.select('id').single()`. `notification_id` field of `DispatchResult` becomes vestigial; no caller reads it.
  **Audit recommendation for any future RLS-restricted table writes from anon contexts:** never chain `.select(...).single()` after `.insert(...)` unless anon has SELECT on the table.

### B-004 — Admin profile-change queue empty due to PostgREST embed ambiguity (FIXED)

**Severity:** P0 (blocks PWMA admin from approving any profile change request)
**Symptom:** `/admin/profile-changes` shows "0 awaiting review" even though a member has just submitted a change.
**Root cause:** `profile_change_requests` has TWO foreign keys to `profiles`: `profile_id` (the member submitting) and `reviewed_by` (the admin who reviewed). The PostgREST resource embed `profile:profiles(...)` is ambiguous and returns HTTP 300 with `code: PGRST201`. The supabase-js client surfaces this as a generic error, react-query then sees the error and the `pending` array is undefined.
**Why our unit tests missed it:** the mock client returns the embedded data without going through PostgREST's resource-embed disambiguation.
**Fix shipped:** `src/routes/_admin/profile-changes.tsx` — disambiguate the embed:

```ts
.select(`*, profile:profiles!profile_change_requests_profile_id_fkey(id, legal_name, email)`)
```

**Audit recommendation:** grep for any other `select(...profile:profiles...)` or similar embed patterns. Tables with multiple FKs to the same target need this disambiguation. `firm_applications` has only `reviewed_by` as a profiles FK so should be safe.

### B-005 — Firm admin cannot read employee profiles via RLS, plus initial fix caused recursion (FIXED)

**Severity:** P0 (breaks `/firm/employees` and `/firm/dashboard` consolidated views — the entire SOW 2.09 deliverable for member firm administrators)
**Symptom:** `/firm/employees` shows N rows but only the firm-admin's own row has Name + Email + Account-status; every other row shows blanks.
**Root cause:** `profiles` only had `profiles_self_read` (own) and `profiles_admin_read_all` (PWMA admin) SELECT policies. A firm admin had no RLS clearance to read profiles of employees in their firm, so the embed silently returned null on those rows.
**Followup recursion bug found and fixed in same loop:** the first fix attempt (`20260423000013`) referenced `firm_memberships` directly inside the `profiles` policy. That triggered RLS on `firm_memberships`, which itself references `profiles`, producing infinite recursion. Postgres returned `42P17 infinite recursion detected in policy` on every `profiles` and `firm_memberships` query — instantly broke the entire app for the firm admin.
**Final fix shipped:** migrations `20260423000013` (initial policy) + `20260423000014` (drops the recursive policy, replaces with a `SECURITY DEFINER` helper `auth_can_read_firm_member(target_profile_id)` so the cross-table joins bypass RLS and avoid the cycle, then re-creates the policy using the helper).
**Verified after fix:** `/firm/employees` lists all employees correctly with full profile data.

### F-001 — Raw Supabase error strings shown to users (FIXED)

**Severity:** P3 (cosmetic, important for non-technical end users)
**Symptom:** sign-in toast surfaced raw `Email not confirmed`, `Invalid login credentials`, `email rate limit exceeded` verbatim from Supabase. No "Resend verification email" affordance, so a user who lost the verification email was stuck.
**Fix shipped:**

- New `src/lib/auth/error-messages.ts` exposing `mapAuthError(error) -> { code, message }` covering 8 known Supabase error codes plus an `unknown` fallback.
- New `src/components/auth/resend-verification-button.tsx` calling `supabase.auth.resend({ type: 'signup', email })`.
- `sign-in.tsx`: shows `<ResendVerificationButton>` when error code is `email_not_confirmed`.
- `reset-password.tsx`, `registration-individual-form.tsx`, `registration-guest-form.tsx`: replaced raw `error.message` toasts with `mapAuthError(error).message`. Old per-form HKID/email duplicate detection logic centralised into the mapper.
- 13 new unit tests (`tests/unit/auth-error-messages.test.ts`).

---

## What might not work after switching to a fresh cloud Supabase

This is the explicit ask: things that worked locally but may need attention when pointed at a brand-new cloud project.

### 1. Email rate limit (4/hr on free tier, ~30/hr on Pro)

Default Supabase mailer is shared infrastructure. After ~3 sign-ups in an hour you hit `email rate limit exceeded` and verification emails stop arriving. Symptoms: registration succeeds in DB but no email lands in inbox.
**Workarounds in priority order:**

1. **Production cutover:** configure Supabase Auth → Authentication → SMTP Settings → custom, point at Microsoft 365 SMTP (`smtp.office365.com:587 STARTTLS` with a dedicated send mailbox, or Graph API with `Mail.Send` permission). No more rate limit.
2. **Dev/QA workaround:** Authentication → Settings → toggle `Enable email confirmations` OFF. Sign-ups become auto-confirmed; no email needed. Reversible.
3. **Per-user manual confirm:** SQL `UPDATE auth.users SET email_confirmed_at = now() WHERE email = '<email>';`

### 2. Email verification redirect URL

`supabase.auth.signUp` is called with `emailRedirectTo: ${VITE_PUBLIC_URL}/auth/callback`. On a fresh cloud project, ensure:

- `VITE_PUBLIC_URL` env var is set to the actual deployed URL (Vercel preview or staging URL).
- Supabase Dashboard → Authentication → URL Configuration → **Site URL** matches.
- Same dashboard, **Redirect URLs** allow-list contains `https://<deployed-url>/auth/callback` (and `http://localhost:5173/auth/callback` for local).
  Without these, the verification link 4xx's silently.

### 3. Storage bucket creation

Migration `20260423000010_storage_buckets.sql` creates 3 buckets (`application-documents`, `profile-avatars`, `firm-application-attachments`) with private ACL + MIME + 5MB limits. On a fresh project, run `supabase db push`; this migration is idempotent. Verify in Dashboard → Storage that the 3 buckets exist after push.

### 4. Notifications queue accumulates without an Edge Function drainer

The app enqueues rows to `notifications` with `status='queued'`. **No worker exists in this branch.** Until the Edge Function is deployed, these rows pile up. Symptoms: registration / approval / change-request actions appear to succeed in the UI but no email goes out. Confirm by querying `select count(*) from notifications where status = 'queued'`.
**Resolution:** implement and deploy the `send-notifications` Edge Function (spec in the comment block at the top of `supabase/migrations/20260423000009_notifications.sql`). Drains queued rows, sends via M365, updates status to `sent` / `failed`.

### 5. Director sign-off chain length

WF1 firm application captures director sign-offs as a JSONB array. Current schema and form assume **3 sequential**. This is an open question pending stakeholder confirmation. If the actual chain is different (2, 5, variable), the form + admin review need adjustment.

### 6. Mock client deactivation on cloud

The mock client auto-activates when `VITE_SUPABASE_URL` is empty / contains `placeholder` / matches one of the local Supabase defaults (`http://127.0.0.1:54321`, `http://localhost:54321`). On a real cloud project, set both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the actual values from Supabase Dashboard → Project API. The DevNav badge bottom-right will flip from "mock backend" to "live Supabase" when the real client is active.

### 7. Seed data not copied

`supabase/seed.sql` and the seed migration (`20260423000011_seed_renewal_periods.sql`) seed firms + renewal periods + 3 placeholder profile rows with `auth_user_id = NULL`. The placeholder profiles cannot sign in because they have no matching `auth.users` row. To make them sign-in-able, create matching auth users (via Dashboard or CLI) and update `profiles.auth_user_id` to link them.

### 8. RLS blast radius after env switch

RLS policies on this branch were verified against an empty-then-seeded project. On a project with pre-existing data of unknown shape, double-check:

- `auth_is_pwma_admin()` and `auth_is_firm_admin(firm_id)` helper functions exist (they're in migration `20260423000005_helper_functions.sql`).
- The admin profile has `role = 'pwma_admin'` and a non-null `auth_user_id`.
- For firm admins, the `firm_memberships` row has `role_in_firm = 'admin'` and `end_date IS NULL`.

---

## Test data the previous QA round created

Three seeded profiles (auth users created via SQL, see `seed.sql`):

| Email                  | Role                | Notes                                              |
| ---------------------- | ------------------- | -------------------------------------------------- |
| `admin@pwma.test`      | `pwma_admin`        | Has access to `/admin/*`                           |
| `member1@test.com`     | `cpwp_member`       | Has access to `/dashboard`, `/profile`, `/renewal` |
| `firm.admin@hsbc.test` | `member_firm_admin` | Has access to `/firm/dashboard`, `/firm/employees` |

All three use password `qa-pwma-test-pwd-2026` and are pre-confirmed (`email_confirmed_at` set).

Plus 4 firm_applications rows from prior QA submissions, 1 approved profile_change_request, and 1 renewal application.

---

## Test cases — copy and re-run on cloud

Each is a click-through against the running dev server pointed at the cloud project. Expect green outcomes after fixes in this branch are deployed.

### TC-1 — Anon sign-up (individual)

1. `/sign-up` → "Individual member"
2. Fill all fields with valid data; HKID format `A123456(3)` (must pass weighted-sum checksum)
3. Submit
   **Expected:** redirects to `/verify`. New row in `auth.users`. New row in `profiles` with `account_status='pending_email_verify'`, populated by trigger.
   **If fails:** check the trigger `handle_new_auth_user` exists, check email rate limit, check redirect URL allow-list.

### TC-2 — Sign-in friendly errors

1. `/sign-in`, type a valid email but wrong password, submit
2. Toast should read **"Wrong email or password. Try again or use Forgot password."** (not raw `Invalid login credentials`)
3. Type an unverified user's email + correct password
4. Toast should read **"Please verify your email before signing in. Check your inbox or use Resend below."** + a **Resend verification email** button appears under the form

### TC-3 — Resend verification

1. From TC-2 step 4, click **Resend verification email**
2. Toast: "Verification email sent. Check your inbox." (or rate-limit message if exceeded)
3. Button disables after click

### TC-4 — Public firm application (WF1)

1. `/apply-firm` → fill firm details + 3 director sign-off entries + submit
2. **Expected:** redirects to `/apply-firm/thanks`. New row in `firm_applications` with `status='submitted'`. New row in `notifications` (status='queued').
   **If fails:** check the form is using the no-`.select(...).single()` pattern, check `firm_applications_public_insert` policy exists.

### TC-5 — Admin approves firm application

1. Sign in as `admin@pwma.test`
2. `/admin/firm-applications` → click row submitted in TC-4 → Approve
3. **Expected:** new row in `member_firms`. New row in `notifications`. The original `firm_applications` row's `status` flips to `approved`.

### TC-6 — Admin approves member registration

1. Sign in as `admin@pwma.test`
2. `/admin/approvals` → see pending member from TC-1 → Approve
3. **Expected:** profile `account_status` flips to `active`. Notification enqueued.

### TC-7 — Member profile change request

1. Sign in as `member1@test.com`
2. `/profile` → click "Request change" on a critical field (Legal name, HKID, DOB, or Email) → submit new value with note
3. **Expected:** new row in `profile_change_requests` (`status='pending'`)
4. Switch to `admin@pwma.test` → `/admin/profile-changes` → see the request → Approve
5. **Expected:** the field updates on the profile, notification enqueued, request `status='approved'`

### TC-8 — Firm admin consolidated view

1. Sign in as `firm.admin@hsbc.test`
2. `/firm/dashboard` → see firm summary
3. `/firm/employees` → see all members linked to the firm with **full Name + Email + Account-status** columns (not blank)
   **If fails:** check migration 14 (`auth_can_read_firm_member`) is applied.

### TC-9 — Renewal flow (WF3 foundation)

1. Sign in as `member1@test.com`
2. `/renewal` → see profile-confirm gate → confirm + select lifecycle state
3. Submit renewal form
4. **Expected:** new row in `applications` with `application_kind='renewal'`. OPT hours auto-pulled from `opt_records` (currently 0 since no opt_records seeded).

### TC-10 — Admin dashboard live counts

1. Sign in as `admin@pwma.test`
2. `/admin/dashboard` → confirm the count widgets show non-zero numbers reflecting test data.

---

## Notes for the developer

- **DevNav debug overlay** lives bottom-right when running `npm run dev`. It auto-fills demo data on every form (look for `?demo=1` query string). Use it to run TC-1 through TC-10 fast.
- **Mock vs real toggle.** With no real env, app uses `mock-client.ts` for fully self-contained dev. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to switch to the cloud project.
- **All migrations applied via `npm run supabase:db:push`** (or `supabase db push` from CLI). If on a fresh cloud project, run this once after linking with `supabase link --project-ref <ref>`.
- **Auth UI gotcha:** until the Edge Function drainer is live, no actual emails go out. Use one of the workarounds in section 1 above.
