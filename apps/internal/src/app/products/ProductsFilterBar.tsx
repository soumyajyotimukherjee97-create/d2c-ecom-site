'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

const CATEGORIES = ['serum', 'moisturiser', 'toner', 'spf'] as const

interface Props {
  defaultQ:          string
  defaultCategory:   string
  defaultVisibility: 'all' | 'active' | 'inactive'
}

export function ProductsFilterBar({ defaultQ, defaultCategory, defaultVisibility }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function update(next: Record<string, string | null>) {
    const qs = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') qs.delete(k)
      else qs.set(k, v)
    }
    qs.delete('page')
    startTransition(() => {
      router.push(qs.toString() ? `/products?${qs.toString()}` : '/products')
    })
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = (data.get('q') as string).trim()
    update({ q: q || null })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-center gap-3 mb-6"
      data-testid="products-filterbar"
      aria-busy={isPending}
    >
      <label className="flex-1 min-w-[220px]">
        <span className="sr-only">Search products</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultQ}
          placeholder="Search by name or slug"
          data-testid="products-search"
          className="w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1"
        />
      </label>

      <select
        name="category"
        defaultValue={defaultCategory}
        onChange={(e) => update({ category: e.target.value || null })}
        data-testid="products-category"
        className="border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white"
        aria-label="Category filter"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c} className="capitalize">{c}</option>
        ))}
      </select>

      <select
        name="visibility"
        defaultValue={defaultVisibility}
        onChange={(e) => update({ visibility: e.target.value === 'all' ? null : e.target.value })}
        data-testid="products-visibility"
        className="border border-gray-200 rounded-sm px-3 py-2 font-body text-sm bg-white"
        aria-label="Visibility filter"
      >
        <option value="all">Active + inactive</option>
        <option value="active">Active only</option>
        <option value="inactive">Inactive only</option>
      </select>

      <button
        type="submit"
        className="border border-gray-200 rounded-sm px-3 py-2 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        Search
      </button>
    </form>
  )
}
