import { chromium, type FullConfig } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'

type AdminClient = SupabaseClient

export const E2E_CUSTOMER_EMAIL    = 'e2e-customer@d2c.test'
export const E2E_CUSTOMER_PASSWORD = 'E2ECustomer!2026'
export const E2E_STAFF_EMAIL       = 'e2e-staff@d2c.test'
export const E2E_STAFF_PASSWORD    = 'E2EStaff!2026'

/**
 * Provisions two deterministic Supabase auth users (customer + staff) and
 * saves signed-in browser `storageState` files for specs to reuse.
 *
 * Requires:
 *   - local Supabase running (supabase start && supabase db reset)
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env
 *   - storefront on :3000, internal on :3001 (Playwright's webServer brings these up)
 */
export default async function globalSetup(config: FullConfig) {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'E2E global-setup needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
        'Start local Supabase and ensure apps/storefront/.env.local is populated.',
    )
  }

  const admin: AdminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  await upsertUser(admin, E2E_CUSTOMER_EMAIL, E2E_CUSTOMER_PASSWORD, {})
  await upsertUser(admin, E2E_STAFF_EMAIL,    E2E_STAFF_PASSWORD,    { role: 'staff' })

  const authDir          = (config.metadata.authDir as string)
  const staffStateFile   = (config.metadata.staffStateFile as string)
  const customerStateFile= (config.metadata.customerStateFile as string)
  await fs.mkdir(authDir, { recursive: true })

  const storefrontUrl = config.metadata.storefrontUrl as string
  const internalUrl   = config.metadata.internalUrl as string

  // Sign the customer in against the storefront.
  await signIn({
    browserCmd:  `${storefrontUrl}/login`,
    emailSel:    '[data-testid="input-email"]',
    passwordSel: '[data-testid="input-password"]',
    submitSel:   '[data-testid="login-submit"]',
    email:       E2E_CUSTOMER_EMAIL,
    password:    E2E_CUSTOMER_PASSWORD,
    expectUrl:   `${storefrontUrl}/account`,
    statePath:   customerStateFile,
  })

  // Sign the staff user in against the internal console.
  await signIn({
    browserCmd:  `${internalUrl}/login`,
    emailSel:    '[data-testid="staff-login-email"]',
    passwordSel: '[data-testid="staff-login-password"]',
    submitSel:   '[data-testid="staff-login-submit"]',
    email:       E2E_STAFF_EMAIL,
    password:    E2E_STAFF_PASSWORD,
    expectUrl:   `${internalUrl}/dashboard`,
    statePath:   staffStateFile,
  })

  // Useful output for CI logs.
  console.info('[e2e:setup] auth states saved to', path.basename(authDir))
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function upsertUser(
  admin:       AdminClient,
  email:       string,
  password:    string,
  appMetadata: Record<string, unknown>,
): Promise<void> {
  // listUsers has a default page size of 50 — fine for local test environments.
  const { data: listed, error: listErr } = await admin.auth.admin.listUsers()
  if (listErr) throw listErr

  const existing = listed.users.find((u) => u.email === email)

  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata:  { ...existing.app_metadata, ...appMetadata },
    })
    return
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata:  appMetadata,
  })
  if (error) throw error
}

interface SignInOpts {
  browserCmd:  string
  emailSel:    string
  passwordSel: string
  submitSel:   string
  email:       string
  password:    string
  expectUrl:   string
  statePath:   string
}

async function signIn(opts: SignInOpts): Promise<void> {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page    = await context.newPage()
  await page.goto(opts.browserCmd)
  await page.fill(opts.emailSel,    opts.email)
  await page.fill(opts.passwordSel, opts.password)
  await Promise.all([
    page.waitForURL(opts.expectUrl, { timeout: 15_000 }),
    page.click(opts.submitSel),
  ])
  await context.storageState({ path: opts.statePath })
  await browser.close()
}
