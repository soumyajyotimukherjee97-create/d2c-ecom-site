# Deployment runbook

End-to-end steps to put the two apps (`apps/storefront`, `apps/internal`) and their shared Supabase database into production. Assumes Vercel for hosting and Supabase cloud for the database. Follow in order.

---

## 0. Pre-flight

```bash
pnpm install
pnpm typecheck   # all workspaces
pnpm lint        # all workspaces
pnpm test        # 451 vitest tests across the workspace
pnpm build       # both Next apps build cleanly
```

All four must pass before continuing. If you also want E2E locally, see `CLAUDE.md` § Commands.

---

## 1. Supabase — production project

1. **Create project** at [supabase.com/dashboard](https://supabase.com/dashboard). Pick a region close to the primary customer base (Mumbai / Singapore for India).
2. **Apply migrations**:
   ```bash
   supabase link --project-ref <project-ref>
   supabase db push                 # applies supabase/migrations/*.sql
   ```
3. **Seed production catalogue** — decide whether to run `supabase/seed.sql` (fake products) or a curated real catalogue. Seed is for dev; skip or replace for prod.
4. **RLS sanity check** — every user-facing table already has policies (see `supabase/migrations/002_rls.sql`). Verify with:
   ```sql
   select schemaname, tablename, rowsecurity from pg_tables where schemaname = 'public';
   ```
   All rows must show `rowsecurity = true`.
5. **Storage bucket** (optional — only if product images come from Supabase):
   - Dashboard → Storage → New bucket → `product-images`, **public**.
6. **Auth configuration** — Dashboard → Authentication → URL Configuration:
   - Site URL: `https://<storefront-domain>`
   - Redirect URLs: `https://<storefront-domain>/**`, `https://<internal-domain>/**`
7. **Create the first staff user** — Auth → Users → Invite, then (Users list → user → edit) set **Raw app meta data** to `{"role":"staff"}`, or run:
   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"staff"}'::jsonb
   where email = 'ops@yourcompany.com';
   ```

---

## 2. Vercel — two projects, one repo

Both apps live in the same repo. In Vercel each becomes its own project with a different **Root Directory**.

### 2.1 Storefront project

- **Import** the repo as a new Vercel project.
- **Root Directory**: `apps/storefront`
- **Framework preset**: Next.js
- **Install Command**: `pnpm install` (Vercel auto-detects pnpm workspace)
- **Build Command**: `pnpm build` (default)
- **Output Directory**: `.next` (default)
- **Environment variables**: see matrix in § 3
- **Custom domain**: point your apex or `shop.` subdomain at this project.

### 2.2 Internal project

- **Import** the same repo again as a second Vercel project.
- **Root Directory**: `apps/internal`
- Same framework / install / build defaults.
- **Custom domain**: a separate subdomain, e.g. `ops.yourcompany.com`. **Do not** expose this on the public apex.
- Optional: Vercel → Project → **Deployment Protection** → enable password or SSO so only staff can hit preview / prod URLs.

### 2.3 Shared package

`packages/email` is a workspace package. Both Vercel projects pick it up automatically via pnpm workspace + the `transpilePackages: ['@d2c/email']` entry in each app's `next.config.mjs`. No extra config needed.

---

## 3. Environment variables

Legend: **S** = storefront project, **I** = internal project, **common** = both.

### 3.1 Required

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | common | e.g. `https://xxxx.supabase.co`. Public — safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | common | Public key with RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | common | **Server-only.** Never commit, never prefix with `NEXT_PUBLIC_`. Used by admin client (orders RPC, internal writes). |
| `NEXT_PUBLIC_BASE_URL` | S | e.g. `https://shop.yourcompany.com`. Used to build the order-confirmation "View order" CTA link. |

### 3.2 Email (recommended before first real order)

| Variable | Scope | Notes |
|---|---|---|
| `RESEND_API_KEY` | common | From [resend.com/api-keys](https://resend.com/api-keys). Without it, `@d2c/email` logs `[email:dev]` previews and no-ops. |
| `EMAIL_FROM` | common | e.g. `D2C <orders@yourcompany.com>`. Must be a verified domain in Resend. Defaults to `D2C <onboarding@resend.dev>` for local only. |

### 3.3 Sentry (recommended for prod)

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | common | Without it, Sentry `init()` is skipped entirely (no plugin, no overhead). |
| `NEXT_PUBLIC_SENTRY_ENV` | common | `production` / `staging` — defaults to `NODE_ENV`. |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | common | `0.1` is a sensible default. Drop to `0` to disable tracing. |
| `SENTRY_AUTH_TOKEN` | common | Source-map upload. Only needed if all three of token + org + project are set. |
| `SENTRY_ORG` | common | — |
| `SENTRY_PROJECT` | common | Separate Sentry project per app is cleanest. |

### 3.4 Setting vars on Vercel

```
Vercel → project → Settings → Environment Variables → Add
```

For each secret, mark **Sensitive** and apply to all three of Production, Preview, Development.

---

## 4. Deployment order

1. **Supabase** up first (§ 1) so the two Next projects have a database to point at.
2. **Internal** project deployed second, so staff can create the first product / confirm the staff auth works, before any customer hits the storefront.
3. **Storefront** deployed last, after internal catalogue is populated.

---

## 5. Post-deploy smoke checklist

Run through these against the live URLs before announcing.

### Customer website

- [ ] `/` loads; hero + featured products render; no console errors.
- [ ] `/products` lists products; filter + sort work; pagination advances.
- [ ] `/products/[slug]` shows variant pills, ingredient tags, and stock.
- [ ] Add to cart → drawer opens → subtotal correct; free shipping kicks in at ₹999.
- [ ] Checkout as guest → order confirmation page renders → confirmation email arrives (check inbox, check Resend dashboard).
- [ ] `/login` + `/signup` → middleware redirects `/account/*` appropriately.
- [ ] `/account` shows orders + skin profile; sign-out works.
- [ ] `/support/new` as guest → success state, ticket email arrives.

### Internal console

- [ ] `/login` rejects a non-staff customer account with the unauthorized message.
- [ ] Staff signs in → `/dashboard` loads with email visible in header.
- [ ] `/products/new` creates a product; it appears on storefront `/products` without redeploy (route is `force-dynamic`).
- [ ] `/orders` lists orders; filters work.
- [ ] `/orders/[id]` status transition to `shipped` requires carrier + tracking; shipped email fires; delivered transition fires delivered email.
- [ ] `/support` queue loads; status/priority filters work.
- [ ] `/support/[id]` Assign-to-me + Unassign work; resolved transition stamps `resolved_at` and fires resolution email.

### Infra

- [ ] Sentry dashboard receives a test exception (curl an intentionally failing endpoint, or open `/throw` test page).
- [ ] Resend dashboard shows sent emails; bounces are zero.
- [ ] Supabase logs show no RLS policy violations.
- [ ] Vercel function logs clean of unhandled errors.

---

## 6. Rollback

Vercel keeps every deployment. To roll back:

```
Vercel → project → Deployments → [prior deployment] → Promote to Production
```

Database migrations are forward-only. If a migration needs undoing, write a new migration with the inverse changes — never edit historical migration files.

---

## 7. Out of scope for launch (Phase 2)

Per TDD § Out of scope: Razorpay, AI chatbot, SMS, loyalty points, Shiprocket/Delhivery. Do not add these to the launch checklist.
