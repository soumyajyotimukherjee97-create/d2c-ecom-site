# Pre-deployment checklist

Work through this **in order** before the first production deploy. Every box must be ticked. If an item is genuinely not applicable, write `N/A` and a one-line reason — don't tick blindly.

---

## 1. Code quality gates (local)

- [ ] `git status` is clean — no uncommitted or stashed changes on the branch you're about to deploy.
- [ ] On the intended branch (usually `main`); `git log -1` shows the commit you expect to deploy.
- [ ] `pnpm install` completes without `ERR_PNPM_*` errors.
- [ ] `pnpm typecheck` passes across all workspaces (storefront, internal, `@d2c/email`).
- [ ] `pnpm lint` passes with zero warnings across all workspaces.
- [ ] `pnpm test` passes — expected baseline is **451 vitest tests**.
- [ ] `pnpm build` completes for both apps. Note the route counts: storefront ≈ 21, internal ≈ 10.
- [ ] `pnpm -F storefront e2e` passes all 6 Playwright specs against local Supabase. (Skip if you're only doing a hot-fix and the affected code is covered by unit/integration tests.)

---

## 2. Secrets + repo hygiene

- [ ] No `.env.local`, `.env.*.local`, or raw keys committed. Verify: `git ls-files | grep -E '\.env'` returns nothing.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` appears **only** server-side — no file with that variable is referenced from a `'use client'` component. Verify: `grep -rn SUPABASE_SERVICE_ROLE_KEY apps/*/src | grep -v /api/ | grep -v /lib/supabase/admin.ts | grep -v /lib/actions/`.
- [ ] `apps/*/src/lib/supabase/admin.ts` is imported only from API routes, server actions, and server-only utilities — never from a client component.
- [ ] No real customer data, Stripe/Razorpay keys, or personal emails in seed files or tests.
- [ ] `supabase/seed.sql` is demo data only — do **not** apply it to the prod DB unless that's what you want.

---

## 3. Supabase production database

- [ ] Production project created at [supabase.com/dashboard](https://supabase.com/dashboard) in the right region (Mumbai / Singapore for India).
- [ ] `supabase link --project-ref <ref>` succeeds locally.
- [ ] `supabase db push` applies all migrations. Verify migration count matches `ls supabase/migrations/*.sql | wc -l`.
- [ ] RLS is on for every user-facing table:
  ```sql
  select tablename from pg_tables
  where schemaname = 'public' and rowsecurity = false;
  ```
  Must return zero rows.
- [ ] First staff user exists with `raw_app_meta_data->>'role' = 'staff'`:
  ```sql
  select email, raw_app_meta_data->'role' as role
  from auth.users where raw_app_meta_data->>'role' = 'staff';
  ```
- [ ] Auth settings (Dashboard → Authentication → URL Configuration):
  - Site URL = production storefront URL
  - Redirect URLs include both storefront and internal domains
  - Email confirmation flow matches the storefront signup expectation
- [ ] Storage bucket `product-images` exists and is **public** (only if you're serving product images from Supabase Storage).
- [ ] Database **point-in-time-recovery** enabled (Supabase → Settings → Database → PITR). Non-negotiable for a production commerce DB.
- [ ] Take a manual backup *before* the first prod deploy: `supabase db dump -f backup-$(date +%Y%m%d).sql`.

---

## 4. Environment variables ready

Have these values in hand before opening the Vercel dashboard. See `DEPLOY.md` § 3 for the full matrix.

### Required (both apps)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — marked **Sensitive** in Vercel

### Storefront-only

- [ ] `NEXT_PUBLIC_BASE_URL` = public HTTPS URL of the storefront (used in order-confirmation email CTA)

### Recommended for launch

- [ ] `RESEND_API_KEY` — without it, no transactional emails go out
- [ ] `EMAIL_FROM` — **verified** sender in Resend (see § 6)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — separate Sentry project per app is cleanest

### Optional (only if using Sentry source maps)

- [ ] `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` — all three, or none

---

## 5. Domains + DNS

- [ ] Storefront domain (apex or `shop.`) owned and DNS manageable.
- [ ] Internal domain (separate subdomain, e.g. `ops.`) owned and DNS manageable.
- [ ] TLS certificates will auto-provision via Vercel — confirm the domains are reachable from the internet (no Cloudflare proxy blocking Let's Encrypt HTTP-01 challenges).
- [ ] Email From-domain DNS records published (see § 6).

---

## 6. Email deliverability (Resend)

- [ ] Resend account exists and billing is set up (free tier is fine for launch volume).
- [ ] Sending domain added to Resend (e.g. `mail.yourcompany.com`).
- [ ] DNS records in the registrar match Resend's instructions **exactly**:
  - [ ] SPF (`TXT @` or subdomain)
  - [ ] DKIM (CNAME records)
  - [ ] Return-path / MX record if prompted
- [ ] Resend dashboard shows the domain as **Verified** — not pending.
- [ ] `EMAIL_FROM` env var uses a mailbox on the verified domain (e.g. `D2C <orders@mail.yourcompany.com>`). **Do not** ship with the default `onboarding@resend.dev`.
- [ ] Sent a test email from a staging build — it arrived in inbox (not spam) with a green DKIM check in Gmail "Show original".

---

## 7. Monitoring + error tracking

- [ ] Sentry organisation created; two separate projects (`storefront-web`, `internal-ops` or similar).
- [ ] DSNs copied into the Vercel env vars for each app.
- [ ] Alert rules in Sentry: new issue → notify on-call (Slack / email).
- [ ] Supabase **Log drains** reviewed — decide whether to export to a log aggregator or rely on Supabase's UI for the first month.
- [ ] Vercel **Analytics** or **Speed Insights** toggled on (optional, but free + low effort).

---

## 8. Security + legal

- [ ] No `TODO: remove before prod` strings. Verify: `grep -rn "TODO.*prod\|XXX\|FIXME" apps/ packages/`.
- [ ] No test accounts (`e2e-customer@d2c.test`, `e2e-staff@d2c.test`) exist in the prod Supabase `auth.users` table.
- [ ] Service-role bearer-token API paths (`GET /api/orders`, `GET /api/support`, PATCH status routes) are not callable without the bearer — smoke-test with `curl -i https://<storefront>/api/orders` and expect `403`.
- [ ] Privacy policy + Terms of Service pages live **and linked from the footer**.
- [ ] Cookie banner / consent is present **if required** by your target market. (Phase 2 if not required — skip with N/A.)
- [ ] GSTIN / business info in footer if legally required in India.

---

## 9. Phase-2 scope guard

Per TDD "Out of scope" — confirm none of these accidentally made it into this deploy. Any one of them being real-not-stubbed is a blocker.

- [ ] **Razorpay / live payments** — checkout still ends at the stubbed confirmation path. No charge is captured.
- [ ] **Shiprocket / Delhivery API** — shipping is still tagged manually by staff, not an API call.
- [ ] **AI chatbot** — no chat widget on the storefront.
- [ ] **SMS notifications** — no Twilio / MSG91 keys in env.
- [ ] **Loyalty points** — no loyalty UI or table rows.

---

## 10. Final sign-off

- [ ] Deployment window agreed (date + time window + who's on call).
- [ ] Rollback path rehearsed — confirm you know where "Promote to Production" lives on a prior Vercel deployment.
- [ ] Someone other than the deployer has read this checklist and signed off. (Name / ticket / PR approval.)
- [ ] `DEPLOY.md` § 5 "Post-deploy smoke checklist" printed or opened in another tab, ready to work through **immediately** after the deploy.

---

When every box above is ticked, open `DEPLOY.md` and follow § 2 → § 5 in order.
