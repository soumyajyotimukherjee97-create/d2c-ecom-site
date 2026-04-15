import type { Metadata } from 'next'
import Link from 'next/link'
import { ConsoleHeader } from '@/components/ConsoleHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard · Internal',
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl text-gray-900 mb-2">Dashboard</h1>
        <p className="font-body text-sm text-gray-600 mb-8">
          Overview metrics will appear here once Task 6.3 wires up the order queue.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card title="Products" href="/products" hint="Manage catalogue" />
          <Card title="Orders"   href="/orders"   hint="Queue and fulfilment" />
          <Card title="Support"  href="/support"  hint="Open tickets" />
        </div>
      </section>
    </main>
  )
}

function Card({ title, href, hint }: { title: string; href: string; hint: string }) {
  return (
    <Link
      href={href}
      className="block border border-gray-200 rounded-sm bg-white p-6 hover:border-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
    >
      <p className="font-mono text-2xs uppercase tracking-wider text-gray-400 mb-1">{hint}</p>
      <p className="font-heading text-xl text-gray-900">{title}</p>
    </Link>
  )
}
