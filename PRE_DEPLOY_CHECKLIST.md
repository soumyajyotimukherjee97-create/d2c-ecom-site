# Pre-deployment checklist

Work through this **in order** before the first production deploy. Every box must be ticked. If an item is genuinely not applicable, write `N/A` and a one-line reason — don't tick blindly.

---

## 1. Code quality gates (local)

- [x] `git status` is clean — no uncommitted or stashed changes on the branch you're about to deploy.
- [x] On the intended branch (usually `main`); `git log -1` shows the commit you expect to deploy. (`4d6eba8` on `main`)
- [x] `pnpm install` completes without `ERR_PNPM_*` errors.
- [x] `pnpm typecheck` passes across all workspaces (storefront, internal, `@d2c/email`).
- [x] `pnpm lint` passes with zero warnings across all workspaces.
- [x] `pnpm test` passes — expected baseline is **451 vitest tests**. (371 + 65 + 15 = 451 ✓)
- [x] `pnpm build` completes for both apps. Note the route counts: storefront ≈ 21, internal ≈ 10. (21 + 10 ✓)
- [ ] `pnpm -F storefront e2e` passes all 6 Playwright specs against local Supabase. (Skip if you're only doing a hot-fix and the affected code is covered by unit/integration tests.)

---

## 2. Secrets + repo hygiene

- [x] No `.env.local`, `.env.*.local`, or raw keys committed. (`.env.test` is tracked but holds literal placeholder strings for local integration tests — no real secrets.)
- [x] `SUPABASE_SERVICE_ROLE_KEY` appears **only** server-side — no file with that variable is referenced from a `'use client'` component. (Only extra hit: `src/e2e/global-setup.ts`, Playwright setup — server-only.)
- [x] `apps/*/src/lib/supabase/admin.ts` is imported only from API routes, server actions, and server-only utilities — never from a client component. (20 import sites, all server-side.)
- [x] No real customer data, Stripe/Razorpay keys, or personal emails in seed files or tests.
- [x] `supabase/seed.sql` is demo data only — do **not** apply it to the prod DB unless that's what you want.

---

## 3. Supabase production database

- [x] Production project created at [supabase.com/dashboard](https://supabase.com/dashboard) in the right region (Mumbai / Singapore for India).
- [x] `supabase link --project-ref <ref>` succeeds locally.
- [x] `supabase db push` applies all migrations. Verify migration count matches `ls supabase/migrations/*.sql | wc -l`. (5 migrations applied ✓)
- [x] RLS is on for every user-facing table:
  ```sql
  select tablename from pg_tables
  where schemaname = 'public' and rowsecurity = false;
  ```
  Must return zero rows. (Zero rows ✓)
- [x] First staff user exists with `raw_app_meta_data->>'role' = 'staff'`:
  ```sql
  select email, raw_app_meta_data->'role' as role
  from auth.users where raw_app_meta_data->>'role' = 'staff';
  ```
- [ ] Auth settings (Dashboard → Authentication → URL Configuration): **DEFERRED** — will configure after Vercel deploy provides actual URLs.
  - Site URL = production storefront URL
  - Redirect URLs include both storefront and internal domains
  - Email confirmation flow matches the storefront signup expectation
- [x] Storage bucket `product-images` exists and is **public** (only if you're serving product images from Supabase Storage).
- [ ] Database **point-in-time-recovery** enabled (Supabase → Settings → Database → PITR). N/A — free tier; upgrade to Pro before handling real customer data.
- [x] Take a manual backup *before* the first prod deploy: `supabase db dump -f backup-$(date +%Y%m%d).sql`.

---

## 4. Environment variables ready

Have these values in hand before opening the Vercel dashboard. See `DEPLOY.md` § 3 for the full matrix.

### Required (both apps)

- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY` — marked **Sensitive** in Vercel

### Storefront-only

- [ ] `NEXT_PUBLIC_BASE_URL` = public HTTPS URL of the storefront (used in order-confirmation email CTA) — **DEFERRED** until Vercel deploy provides URL.

### Recommended for launch

- [ ] `RESEND_API_KEY` — without it, no transactional emails go out
- [ ] `EMAIL_FROM` — **verified** sender in Resend (see § 6)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — separate Sentry project per app is cleanest

### Optional (only if using Sentry source maps)

- [ ] `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` — all three, or none

---

## 5. Domains + DNS

- [x] Storefront domain — N/A, using Vercel default `*.vercel.app` URL for now.
- [x] Internal domain — N/A, using Vercel default `*.vercel.app` URL for now.
- [x] TLS certificates — N/A, Vercel handles TLS on `*.vercel.app` automatically.
- [ ] Email From-domain DNS records published (see § 6). — **DEFERRED** until custom domain + Resend setup.

---

## 6. Email deliverability (Resend)

- [x] Resend account exists and billing is set up (free tier is fine for launch volume).
- [ ] Sending domain added to Resend (e.g. `mail.yourcompany.com`). — **DEFERRED** — using `onboarding@resend.dev` for initial launch. **TODO: add custom domain before handling real customer orders.**
- [ ] DNS records in the registrar match Resend's instructions **exactly**: — **DEFERRED** (no custom domain yet)
  - [ ] SPF (`TXT @` or subdomain)
  - [ ] DKIM (CNAME records)
  - [ ] Return-path / MX record if prompted
- [ ] Resend dashboard shows the domain as **Verified** — not pending. — **DEFERRED**
- [ ] `EMAIL_FROM` env var uses a mailbox on the verified domain (e.g. `D2C <orders@mail.yourcompany.com>`). — **DEFERRED** — using default `onboarding@resend.dev` for now. **Must change before real customer orders.**
- [ ] Sent a test email from a staging build — it arrived in inbox (not spam) with a green DKIM check in Gmail "Show original". — will test after Vercel deploy.

---

## 7. Monitoring + error tracking

- [ ] Sentry organisation created; two separate projects (`storefront-web`, `internal-ops` or similar). — **DEFERRED. TODO: set up before handling real traffic.**
- [ ] DSNs copied into the Vercel env vars for each app. — **DEFERRED**
- [ ] Alert rules in Sentry: new issue → notify on-call (Slack / email). — **DEFERRED**
- [ ] Supabase **Log drains** reviewed — decide whether to export to a log aggregator or rely on Supabase's UI for the first month.
- [ ] Vercel **Analytics** or **Speed Insights** toggled on (optional, but free + low effort).

---

## 8. Security + legal

- [x] No `TODO: remove before prod` strings. Verify: `grep -rn "TODO.*prod\|XXX\|FIXME" apps/ packages/`. (Zero matches ✓)
- [x] No test accounts (`e2e-customer@d2c.test`, `e2e-staff@d2c.test`) exist in the prod Supabase `auth.users` table. (Zero rows ✓)
- [ ] Service-role bearer-token API paths (`GET /api/orders`, `GET /api/support`, PATCH status routes) are not callable without the bearer — smoke-test with `curl -i https://<storefront>/api/orders` and expect `403`. — **DEFERRED** until after Vercel deploy.
- [ ] Privacy policy + Terms of Service pages live **and linked from the footer**. — **DEFERRED. TODO: add before handling real customer traffic.**
- [x] Cookie banner / consent is present **if required** by your target market. N/A — India-only, not legally required.
- [x] GSTIN / business info in footer if legally required in India. N/A.

---

## 9. Phase-2 scope guard

Per TDD "Out of scope" — confirm none of these accidentally made it into this deploy. Any one of them being real-not-stubbed is a blocker.

- [x] **Razorpay / live payments** — checkout still ends at the stubbed confirmation path. No charge is captured. (Only a static "We use Razorpay" UI label — no SDK, no keys.)
- [x] **Shiprocket / Delhivery API** — shipping is still tagged manually by staff, not an API call. (Zero matches ✓)
- [x] **AI chatbot** — no chat widget on the storefront. (Zero matches ✓)
- [x] **SMS notifications** — no Twilio / MSG91 keys in env. (Zero matches ✓)
- [x] **Loyalty points** — no loyalty UI or table rows. (Zero matches ✓)

---

## 10. Final sign-off

- [x] Deployment window agreed (date + time window + who's on call). — 2026-04-16, deploying now.
- [x] Rollback path rehearsed — Vercel → project → Deployments → prior deployment → Promote to Production.
- [ ] Someone other than the deployer has read this checklist and signed off. — N/A for solo launch.
- [x] `DEPLOY.md` § 5 "Post-deploy smoke checklist" printed or opened in another tab, ready to work through **immediately** after the deploy.

---

When every box above is ticked, open `DEPLOY.md` and follow § 2 → § 5 in order.
