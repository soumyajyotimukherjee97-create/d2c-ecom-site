import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom doesn't implement ResizeObserver — stub it so components that call it
// in effects (e.g. scrollable rails) don't crash during render.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class NoopResizeObserver {
    observe()    {}
    unobserve()  {}
    disconnect() {}
  }
  ;(globalThis as unknown as { ResizeObserver: typeof NoopResizeObserver }).ResizeObserver = NoopResizeObserver
}

// jsdom doesn't implement Element.prototype.scrollIntoView — stub it so
// components that call it on mount don't crash. Same story for scrollBy on
// horizontal scrollers.
if (typeof Element !== 'undefined') {
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = function () {}
  }
  if (typeof Element.prototype.scrollBy !== 'function') {
    ;(Element.prototype as unknown as { scrollBy: () => void }).scrollBy = function () {}
  }
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock the browser client wrapper — our export is `createClient`, not `createBrowserClient`
vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}))
