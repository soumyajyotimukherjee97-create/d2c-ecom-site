import { defineConfig } from 'vitest/config'
import path from 'path'

// Integration tests — require `supabase start && supabase db reset` before running.
// Run with: pnpm vitest run --config vitest.integration.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/integration/**/*.test.ts'],
    setupFiles: [],
    testTimeout: 15000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
