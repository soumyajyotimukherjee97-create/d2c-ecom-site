'use client'

import { useEffect, useState, useTransition } from 'react'
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

interface ChipButtonProps {
  label:    string
  active:   boolean
  onClick:  () => void
  testId?:  string
}

function ChipButton({ label, active, onClick, testId }: ChipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-testid={testId}
      data-active={active}
      onClick={onClick}
      className={[
        'font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border transition-colors',
        'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-transparent text-ink-2 border-hairline hover:border-ink',
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

  const committedSkinType = searchParams.get('skin_type') ?? ''
  const committedConcern  = searchParams.get('concern')   ?? ''
  const committedSort     = searchParams.get('sort')      ?? 'created_at_desc'

  const [optimisticSkinType, setOptimisticSkinType] = useState(committedSkinType)
  const [optimisticConcern, setOptimisticConcern]   = useState(committedConcern)
  const [optimisticSort, setOptimisticSort]         = useState(committedSort)

  useEffect(() => { setOptimisticSkinType(committedSkinType) }, [committedSkinType])
  useEffect(() => { setOptimisticConcern(committedConcern) }, [committedConcern])
  useEffect(() => { setOptimisticSort(committedSort) }, [committedSort])

  const activeSkinType = isPending ? optimisticSkinType : committedSkinType
  const activeConcern  = isPending ? optimisticConcern  : committedConcern
  const activeSort     = isPending ? optimisticSort     : committedSort

  function navigate(updates: Record<string, string | undefined>) {
    startTransition(() => {
      router.push(buildUrl(pathname, searchParams, updates))
    })
  }

  function setSkinType(value: string) {
    const next = value === activeSkinType ? '' : value
    setOptimisticSkinType(next)
    navigate({ skin_type: next })
  }

  function setConcern(value: string) {
    const next = value === activeConcern ? '' : value
    setOptimisticConcern(next)
    navigate({ concern: next })
  }

  function setSort(value: string) {
    setOptimisticSort(value)
    navigate({ sort: value })
  }

  return (
    <div
      data-testid="filter-bar"
      data-pending={isPending}
      className={`bg-paper border-b border-hairline px-8 py-5 transition-opacity ${isPending ? 'opacity-60' : ''}`}
    >
      <div className="max-w-container mx-auto grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center">

        {/* Skin type — single-select */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap">
            Skin type:
          </span>
          <div className="flex flex-wrap gap-1">
            {SKIN_TYPES.map(({ label, value }) => (
              <ChipButton
                key={label}
                label={label}
                active={activeSkinType === value}
                onClick={() => setSkinType(value)}
                testId={`filter-skin-${value || 'all'}`}
              />
            ))}
          </div>
        </div>

        {/* Concern — single-select */}
        <div className="flex flex-wrap items-center gap-3 md:justify-center">
          <span className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap">
            Concern:
          </span>
          <div className="flex flex-wrap gap-1">
            {CONCERNS.map(({ label, value }) => (
              <ChipButton
                key={label}
                label={label}
                active={activeConcern === value}
                onClick={() => setConcern(value)}
                testId={`filter-concern-${value}`}
              />
            ))}
          </div>
        </div>

        {/* Sort — native select */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="plp-sort"
            className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap"
          >
            Sort:
          </label>
          <select
            id="plp-sort"
            value={activeSort}
            onChange={(e) => setSort(e.target.value)}
            data-testid="sort-select"
            className="border border-hairline bg-paper px-3 py-1.5 font-mono text-[11px] text-ink min-w-[140px] hover:border-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
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
