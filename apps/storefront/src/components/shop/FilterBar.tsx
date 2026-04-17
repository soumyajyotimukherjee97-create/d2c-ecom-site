'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIN_TYPES: { label: string; value: string }[] = [
  { label: 'All',         value: '' },
  { label: 'Dry',         value: 'dry' },
  { label: 'Oily',        value: 'oily' },
  { label: 'Combination', value: 'combination' },
  { label: 'Sensitive',   value: 'sensitive' },
]

const CONCERNS: { label: string; value: string }[] = [
  { label: 'Acne',     value: 'acne' },
  { label: 'Dullness', value: 'dullness' },
  { label: 'Aging',    value: 'aging' },
  { label: 'Pores',    value: 'pores' },
  { label: 'Redness',  value: 'redness' },
]

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Best match',  value: 'created_at_desc' },
  { label: 'Price: low',  value: 'price_asc' },
  { label: 'Price: high', value: 'price_desc' },
  { label: 'Name: A–Z',   value: 'name_asc' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(
  pathname: string,
  current: URLSearchParams,
  updates: Record<string, string | undefined>,
): string {
  const next = new URLSearchParams(current.toString())
  // Reset pagination whenever a filter changes
  next.delete('offset')

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
  }

  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FilterButtonProps {
  label:    string
  active:   boolean
  onClick:  () => void
  testId?:  string
}

function FilterButton({ label, active, onClick, testId }: FilterButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-testid={testId}
      onClick={onClick}
      className={[
        'font-mono text-2xs uppercase tracking-wide px-3 py-1 rounded-sm border transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2',
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const pathname     = usePathname()
  const [isPending, startTransition] = useTransition()

  const activeSkinType = searchParams.get('skin_type') ?? ''
  const activeConcern  = searchParams.get('concern')   ?? ''
  const activeSort     = searchParams.get('sort')      ?? 'created_at_desc'

  function navigate(updates: Record<string, string | undefined>) {
    startTransition(() => {
      router.push(buildUrl(pathname, searchParams, updates))
    })
  }

  function setSkinType(value: string) {
    const next = value === activeSkinType ? '' : value
    navigate({ skin_type: next })
  }

  function setConcern(value: string) {
    const next = value === activeConcern ? '' : value
    navigate({ concern: next })
  }

  function setSort(value: string) {
    navigate({ sort: value })
  }

  return (
    <div
      data-testid="filter-bar"
      className={`border-b border-gray-100 bg-white px-6 py-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 justify-between">

        {/* Skin type — single-select */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-2xs uppercase tracking-widest text-gray-400">
            Skin type:
          </span>
          {SKIN_TYPES.map(({ label, value }) => (
            <FilterButton
              key={label}
              label={label}
              active={activeSkinType === value}
              onClick={() => setSkinType(value)}
              testId={`filter-skin-${value || 'all'}`}
            />
          ))}
        </div>

        {/* Concern — single-select */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-2xs uppercase tracking-widest text-gray-400">
            Concern:
          </span>
          {CONCERNS.map(({ label, value }) => (
            <FilterButton
              key={label}
              label={label}
              active={activeConcern === value}
              onClick={() => setConcern(value)}
              testId={`filter-concern-${value}`}
            />
          ))}
        </div>

        {/* Sort — native select */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="plp-sort"
            className="font-mono text-2xs uppercase tracking-widest text-gray-400"
          >
            Sort:
          </label>
          <select
            id="plp-sort"
            value={activeSort}
            onChange={(e) => setSort(e.target.value)}
            data-testid="sort-select"
            className="border border-gray-100 rounded-sm px-2 py-1 font-mono text-2xs text-gray-900 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            {SORT_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  )
}
