'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useAuthUser, getInitials } from '@/lib/hooks/useAuthUser'

const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Ingredients', href: '/ingredients' },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/journal' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const cartCountRaw = useCartStore((s) => s.itemCount)
  const openCart     = useCartStore((s) => s.openCart)
  // Only show persisted count after hydration — prevents server/client HTML mismatch
  const cartCount = mounted ? cartCountRaw : 0

  const { user } = useAuthUser()
  const initials = mounted ? getInitials(user) : ''
  const isSignedIn = mounted && user !== null

  return (
    <header
      data-testid="navbar"
      className={[
        'fixed top-0 inset-x-0 z-50 border-b transition-colors duration-200',
        scrolled ? 'bg-white border-gray-100' : 'bg-transparent border-transparent',
      ].join(' ')}
    >
      {/* ── Main bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-8 px-6 py-4">

        {/* Brand wordmark */}
        <Link
          href="/"
          data-testid="navbar-brand"
          className="font-heading text-base tracking-tight text-gray-900 shrink-0"
        >
          Form.
        </Link>

        {/* Desktop nav links */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                data-testid={`nav-link-${label.toLowerCase()}`}
                aria-current={active ? 'page' : undefined}
                className={[
                  'font-body text-xs uppercase tracking-wider transition-colors',
                  active
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Icon cluster */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            aria-label="Search"
            data-testid="navbar-search"
            className="w-8 h-8 flex items-center justify-center border border-gray-100 rounded-sm text-gray-600 hover:border-gray-200 hover:text-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            <Search size={14} aria-hidden="true" />
          </button>

          {/* Account */}
          <Link
            href={isSignedIn ? '/account' : '/login'}
            aria-label={isSignedIn ? 'Account' : 'Sign in'}
            data-testid="navbar-account"
            data-signed-in={isSignedIn ? 'true' : 'false'}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-sm transition-colors',
              'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2',
              isSignedIn
                ? 'bg-gray-900 text-white border border-gray-900 hover:bg-gray-700'
                : 'border border-gray-100 text-gray-600 hover:border-gray-200 hover:text-gray-900',
            ].join(' ')}
          >
            {isSignedIn && initials ? (
              <span
                data-testid="navbar-account-initials"
                className="font-mono text-2xs tracking-wider"
              >
                {initials}
              </span>
            ) : (
              <User size={14} aria-hidden="true" />
            )}
          </Link>

          {/* Cart */}
          <button
            aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : 'Cart'}
            data-testid="navbar-cart"
            onClick={openCart}
            className="relative w-8 h-8 flex items-center justify-center border border-gray-100 rounded-sm text-gray-600 hover:border-gray-200 hover:text-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            <ShoppingBag size={14} aria-hidden="true" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                data-testid="navbar-cart-badge"
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-gray-900 text-white font-mono text-2xs rounded-sm flex items-center justify-center"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            data-testid="navbar-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden ml-1 w-8 h-8 flex items-center justify-center border border-gray-100 rounded-sm text-gray-600 hover:border-gray-200 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            {mobileOpen ? (
              <X size={14} aria-hidden="true" />
            ) : (
              <Menu size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer ────────────────────────────────── */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          data-testid="navbar-mobile-menu"
          className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-link-${label.toLowerCase()}`}
                aria-current={active ? 'page' : undefined}
                className={[
                  'font-body text-sm uppercase tracking-wider transition-colors',
                  active ? 'text-gray-900 font-medium' : 'text-gray-600',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
