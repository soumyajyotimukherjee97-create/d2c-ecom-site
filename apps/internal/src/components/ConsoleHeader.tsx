import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from './SignOutButton'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products',  label: 'Products' },
  { href: '/orders',    label: 'Orders' },
  { href: '/support',   label: 'Support' },
] as const

export async function ConsoleHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-heading text-xl text-gray-900">
            Internal
          </Link>
          <nav className="flex items-center gap-4" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-2xs uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="font-mono text-2xs uppercase tracking-wider text-gray-600"
            data-testid="staff-email"
          >
            {user?.email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
