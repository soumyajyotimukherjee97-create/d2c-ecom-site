'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { useAuthUser, getInitials } from '@/lib/hooks/useAuthUser'

const NAV_LINKS = [
  { label: 'Shop',         href: '/products',      key: 'shop' },
  { label: 'Ingredients',  href: '/ingredients',   key: 'ingredients' },
  { label: 'SkinInsight',  href: '/skin-insight',  key: 'skininsight' },
  { label: 'About',         href: '/about',        key: 'about' },
] as const

/** Tiny pipe used as a visual divider between text zones. */
function Divider() {
  return <span aria-hidden="true" className="w-px h-3.5 bg-hairline" />
}

/** Brand wordmark — Instrument Serif with an italic dot. */
function Wordmark() {
  return (
    <Link
      href="/"
      data-testid="navbar-brand"
      aria-label="matter — home"
      className="font-display text-2xl leading-none tracking-tight text-ink"
    >
      matter<em className="not-italic" style={{ fontStyle: 'italic', letterSpacing: '-0.04em', marginLeft: 1 }}>.</em>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const cartCountRaw = useCartStore((s) => s.itemCount)
  const openCart     = useCartStore((s) => s.openCart)
  // Only show persisted count after hydration — prevents server/client HTML mismatch.
  const cartCount = mounted ? cartCountRaw : 0

  const { user } = useAuthUser()
  const initials = mounted ? getInitials(user) : ''
  const isSignedIn = mounted && user !== null

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 inset-x-0 z-50 bg-paper border-b border-hairline"
    >
      <div className="flex items-center justify-between gap-10 px-8 py-[18px]">

        {/* LEFT — wordmark + divider + nav links */}
        <div className="flex items-center gap-8">
          <Wordmark />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Divider />
            <nav aria-label="Main navigation" className="flex items-center gap-6">
              {NAV_LINKS.map(({ label, href, key }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={key}
                    href={href}
                    data-testid={`nav-link-${key}`}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'font-mono text-[10px] uppercase tracking-widest transition-colors pb-0.5',
                      'border-b',
                      active
                        ? 'text-ink border-ink'
                        : 'text-graphite border-transparent hover:text-ink',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* RIGHT — Account + divider + Bag (desktop) + mobile toggle */}
        <div className="flex items-center gap-5">

          {/* Desktop right cluster */}
          <nav aria-label="Utility" className="hidden md:flex items-center gap-5">
            {isSignedIn ? (
              <Link
                href="/account"
                aria-label="Account"
                data-testid="navbar-account"
                data-signed-in="true"
                className="inline-flex items-center gap-2 text-ink hover:opacity-80 transition-opacity focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                <span
                  data-testid="navbar-account-initials"
                  className="inline-flex items-center justify-center w-7 h-7 bg-paper-3 border border-hairline font-mono text-[10px] tracking-wider text-ink"
                >
                  {initials}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Sign in"
                data-testid="navbar-account"
                data-signed-in="false"
                className="font-mono text-[10px] uppercase tracking-widest text-ink hover:text-graphite transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                Account
              </Link>
            )}

            <Divider />

            <button
              type="button"
              aria-label={cartCount > 0 ? `Bag, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : 'Bag'}
              data-testid="navbar-cart"
              onClick={openCart}
              className="font-mono text-[10px] uppercase tracking-widest text-ink hover:text-graphite transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Bag{' '}
              <span
                data-testid="navbar-cart-count"
                className="text-graphite tabular-nums"
              >
                ({cartCount})
              </span>
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            data-testid="navbar-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden font-mono text-sm text-ink hover:text-graphite transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 w-8 h-8 inline-flex items-center justify-center"
          >
            {mobileOpen ? '×' : '≡'}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          data-testid="navbar-mobile-menu"
          className="md:hidden bg-paper border-t border-hairline px-8 py-6 flex flex-col gap-5"
        >
          {NAV_LINKS.map(({ label, href, key }) => {
            const active = isActive(href)
            return (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-link-${key}`}
                aria-current={active ? 'page' : undefined}
                className={[
                  'font-mono text-xs uppercase tracking-widest transition-colors',
                  active ? 'text-ink' : 'text-graphite',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
          <div className="h-px bg-hairline my-2" />
          <Link
            href={isSignedIn ? '/account' : '/login'}
            onClick={() => setMobileOpen(false)}
            data-testid="mobile-nav-account"
            className="font-mono text-xs uppercase tracking-widest text-graphite"
          >
            Account{isSignedIn && initials ? ` · ${initials}` : ''}
          </Link>
          <button
            type="button"
            data-testid="mobile-nav-bag"
            onClick={() => {
              setMobileOpen(false)
              openCart()
            }}
            className="font-mono text-xs uppercase tracking-widest text-graphite text-left"
          >
            Bag <span className="tabular-nums">({cartCount})</span>
          </button>
        </nav>
      )}
    </header>
  )
}
