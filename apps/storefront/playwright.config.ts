import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const STOREFRONT_URL = 'http://localhost:3000'
const INTERNAL_URL   = 'http://localhost:3001'

const authDir           = path.resolve(__dirname, './src/e2e/.auth')
const customerStateFile = path.join(authDir, 'customer.json')
const staffStateFile    = path.join(authDir, 'staff.json')

export default defineConfig({
  testDir:  './src/e2e',
  retries:  process.env.CI ? 1 : 0,
  workers:  process.env.CI ? 2 : undefined,
  reporter: [['list']],

  globalSetup: require.resolve('./src/e2e/global-setup.ts'),

  use: {
    baseURL: STOREFRONT_URL,
    trace:   'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use:  { ...devices['Desktop Chrome'] },
    },
  ],

  // `supabase start` + `supabase db reset` must be run before E2E.
  webServer: [
    {
      command:             'pnpm dev',
      url:                 STOREFRONT_URL,
      reuseExistingServer: !process.env.CI,
      timeout:             120_000,
      cwd:                 __dirname,
    },
    {
      command:             'pnpm -F internal dev',
      url:                 INTERNAL_URL,
      reuseExistingServer: !process.env.CI,
      timeout:             120_000,
      cwd:                 path.resolve(__dirname, '../..'),
    },
  ],

  metadata: {
    storefrontUrl:       STOREFRONT_URL,
    internalUrl:         INTERNAL_URL,
    authDir,
    customerStateFile,
    staffStateFile,
  },
})
