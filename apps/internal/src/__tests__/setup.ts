import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// ─── next/navigation stub ────────────────────────────────────────────────────
const pushMock = vi.fn()
const refreshMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push:    pushMock,
    refresh: refreshMock,
    replace: vi.fn(),
    back:    vi.fn(),
  }),
  usePathname: () => '/',
  redirect:    vi.fn(),
}))

// ─── Supabase browser client stub ────────────────────────────────────────────
// Tests override the return value per-test via vi.mocked(createClient).mockReturnValue(...)
vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(async () => ({ data: { user: null }, error: null })),
      signOut:            vi.fn(async () => ({ error: null })),
    },
  })),
}))

export { pushMock, refreshMock }
