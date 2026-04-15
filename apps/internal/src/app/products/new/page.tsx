import type { Metadata } from 'next'
import Link from 'next/link'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { NewProductForm } from './NewProductForm'

export const metadata: Metadata = {
  title: 'New product · Internal',
}

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/products" className="font-mono text-2xs uppercase tracking-wider text-gray-600 hover:text-gray-900">
          ← Back to products
        </Link>
        <h1 className="font-heading text-3xl text-gray-900 mt-2 mb-6">New product</h1>
        <NewProductForm />
      </section>
    </main>
  )
}
