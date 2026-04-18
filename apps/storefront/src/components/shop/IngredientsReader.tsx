'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Essay } from '@/lib/ingredients/essays'
import type { IngredientEntry, ToleranceMark } from '@/lib/ingredients/catalogue'
import { storyTitle } from '@/lib/ingredients/catalogue'

interface IngredientsReaderProps {
  ingredients: IngredientEntry[]
  /** Essays keyed by symbol. Missing keys fall back to defaultEssay. */
  essays:       Record<string, Essay>
  defaultEssay: Essay
}

const STORAGE_KEY = 'mt_essay_sym'
const HASH_RE = /^#essay\/([A-Z]{2,3})$/i

// ─── ChapterRail ──────────────────────────────────────────────────────────────

function ChapterRail({
  ingredients,
  activeSym,
  onSelect,
}: {
  ingredients: IngredientEntry[]
  activeSym:   string
  onSelect:    (sym: string) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft]   = useState(false)
  const [canRight, setCanRight] = useState(false)

  const refresh = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    refresh()
    el.addEventListener('scroll', refresh, { passive: true })
    const ro = new ResizeObserver(refresh)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', refresh)
      ro.disconnect()
    }
  }, [refresh, ingredients.length])

  // Keep active chip in view when it changes
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const active = el.querySelector<HTMLElement>('[data-active="true"]')
    if (!active) return
    const er = el.getBoundingClientRect()
    const ar = active.getBoundingClientRect()
    if (ar.left < er.left + 8 || ar.right > er.right - 8) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeSym])

  function page(dir: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div
      data-testid="chapter-rail"
      className="bg-paper border-b border-hairline"
    >
      <div className="max-w-container mx-auto px-8 py-5">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-ultra uppercase text-graphite flex-shrink-0">
            Chapters
          </span>

          <button
            type="button"
            onClick={() => page(-1)}
            disabled={!canLeft}
            aria-label="Previous chapters"
            data-testid="chapter-rail-prev"
            className={[
              'flex-shrink-0 w-[34px] h-[34px] inline-flex items-center justify-center font-mono text-sm border transition-colors',
              canLeft
                ? 'border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer'
                : 'border-hairline text-hairline cursor-default',
              'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
            ].join(' ')}
          >
            ←
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-1 flex-1 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {ingredients.map((ing) => {
              const isActive = ing.sym === activeSym
              return (
                <button
                  key={ing.sym}
                  type="button"
                  onClick={() => onSelect(ing.sym)}
                  data-active={isActive}
                  data-testid={`chapter-chip-${ing.sym}`}
                  title={ing.name}
                  className={[
                    'flex-shrink-0 whitespace-nowrap px-3 py-2.5 font-mono text-[10px] tracking-widest uppercase border transition-colors',
                    isActive
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-transparent text-graphite border-hairline hover:border-ink hover:text-ink',
                    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
                  ].join(' ')}
                >
                  <span className={isActive ? 'opacity-60 mr-2' : 'opacity-60 mr-2'}>
                    {ing.n}
                  </span>
                  {ing.sym}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => page(1)}
            disabled={!canRight}
            aria-label="More chapters"
            data-testid="chapter-rail-next"
            className={[
              'flex-shrink-0 w-[34px] h-[34px] inline-flex items-center justify-center font-mono text-sm border transition-colors',
              canRight
                ? 'border-ink text-ink hover:bg-ink hover:text-paper cursor-pointer'
                : 'border-hairline text-hairline cursor-default',
              'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
            ].join(' ')}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DataSheet (sidecar) ──────────────────────────────────────────────────────

function tolColor(mark: ToleranceMark): string {
  return mark === '○' ? 'text-oxblood' : 'text-ink'
}

function DataSheet({
  ing,
  idx,
  total,
  alt,
}: {
  ing:   IngredientEntry
  idx:   number
  total: number
  alt:   boolean
}) {
  const sheetBg = alt ? 'bg-paper' : 'bg-paper-2'
  return (
    <aside
      data-testid="ingredient-sidecar"
      className={`sticky top-24 border border-ink ${sheetBg}`}
    >
      <div className="px-5 py-4 border-b border-ink">
        <p className="font-mono text-[9px] tracking-ultra uppercase text-graphite">
          § Data sheet · {ing.sym}
        </p>
      </div>

      <div className="flex flex-col items-center px-5 py-5 border-b border-hairline">
        <p
          aria-hidden="true"
          className="font-display text-[120px] leading-[0.9] tracking-[-0.04em]"
        >
          {ing.sym}
        </p>
        <p className="font-body text-[13px] text-graphite mt-2.5">{ing.name}</p>
      </div>

      <dl className="px-5 py-2 m-0">
        {[
          ['Formula',     ing.formula],
          ['Molar mass',  `${ing.mw} g/mol`],
          ['Typical use', ing.conc],
          ['Working pH',  ing.pH],
          ['Class',       ing.class],
          ['Function',    ing.fn],
          ['Origin',      ing.origin],
          ['Evidence',    ing.evidence],
        ].map(([k, v], i) => (
          <div
            key={k}
            className={`grid grid-cols-[38%_1fr] gap-2.5 py-3 ${i < 7 ? 'border-b border-hairline/60' : ''}`}
          >
            <dt className="font-mono text-[9px] tracking-widest uppercase text-graphite m-0">
              {k}
            </dt>
            <dd className="m-0 text-xs text-ink-2 text-right">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="px-5 py-4 border-t border-hairline">
        <p className="font-mono text-[9px] tracking-widest uppercase text-graphite mb-2.5">
          Tolerance
        </p>
        <div className="grid grid-cols-5 gap-1">
          {([
            ['DRY', ing.tol.dry],
            ['OIL', ing.tol.oily],
            ['COM', ing.tol.comb],
            ['SEN', ing.tol.sens],
            ['REA', ing.tol.reac],
          ] as const).map(([label, mark]) => (
            <div
              key={label}
              className="text-center py-1.5 border border-hairline"
            >
              <p className={`font-display text-base m-0 ${tolColor(mark)}`}>{mark}</p>
              <p className="font-mono text-[8px] tracking-widest text-graphite mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between px-5 py-3.5 border-t border-ink bg-ink text-paper font-mono text-[9px] tracking-ultra uppercase">
        <span>MT · Formulary</span>
        <span className="tabular-nums">
          {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </aside>
  )
}

// ─── EssayEntry ───────────────────────────────────────────────────────────────

function EssayEntry({
  ing,
  idx,
  total,
  essay,
}: {
  ing:   IngredientEntry
  idx:   number
  total: number
  essay: Essay
}) {
  const alt    = idx % 2 === 1
  const bgCls  = alt ? 'bg-paper-2' : 'bg-paper'
  const [dropcap, ...restOfFirst] = essay.story[0] ? [essay.story[0][0], essay.story[0].slice(1)] : ['', '']
  const firstPara  = restOfFirst.join('')
  const otherParas = essay.story.slice(1)

  return (
    <article
      data-testid="essay-entry"
      data-sym={ing.sym}
      className={`${bgCls} border-b border-hairline`}
    >
      <div className="max-w-container mx-auto px-8 pt-12 pb-32">

        {/* Chapter head */}
        <div className="flex justify-between border-t-2 border-ink pt-4 mb-10 font-mono text-[10px] tracking-ultra uppercase">
          <span data-testid="essay-chapter-n" className="text-ink">
            Chapter {ing.n}
          </span>
          <span className="text-graphite">{ing.class}</span>
          <span className="text-graphite">
            Pp. {(idx + 1) * 14} — {(idx + 1) * 14 + 7}
          </span>
        </div>

        {/* Title block */}
        <div className="mb-16">
          <h2
            data-testid="essay-title"
            className="font-display font-normal text-[clamp(56px,9vw,160px)] leading-[0.9] tracking-[-0.03em] m-0 max-w-[14ch]"
          >
            The <em className="italic">{storyTitle(ing)}</em> of<br />
            {ing.name}.
          </h2>
          <div className="flex flex-wrap justify-between items-baseline gap-4 mt-7 pt-4 border-t border-hairline font-mono text-[11px] tracking-wide text-graphite">
            <span>By the matter atelier</span>
            <span>{ing.formula} · {ing.mw} g/mol</span>
            <span>— 4 min read</span>
          </div>
        </div>

        {/* Body: essay + sticky sidecar */}
        <div className="grid grid-cols-1 md:grid-cols-[7fr_4fr] gap-8 md:gap-20 items-start">
          <div>
            {essay.story[0] && (
              <p
                data-testid="essay-dropcap-para"
                className="font-display text-[26px] leading-[1.35] text-ink m-0"
              >
                <span
                  className="float-left font-display italic text-[110px] leading-[0.8] pt-1.5 pr-3.5"
                  aria-hidden="true"
                >
                  {dropcap}
                </span>
                {firstPara}
              </p>
            )}

            {otherParas.map((p, i) => (
              <p
                key={i}
                className="font-body text-base leading-[1.7] text-ink-2 mt-6 max-w-[60ch]"
              >
                {p}
              </p>
            ))}

            <blockquote
              data-testid="essay-aside"
              className="mt-14 pt-8 border-t border-hairline"
            >
              <p className="font-display text-[clamp(24px,2.4vw,34px)] leading-[1.25] m-0 max-w-[26ch]">
                <em className="italic">&ldquo;{essay.aside}&rdquo;</em>
              </p>
              <p className="font-mono text-[10px] tracking-ultra uppercase text-graphite mt-5">
                — Margin note · {ing.sym} · {ing.n}
              </p>
            </blockquote>

            {ing.used.length > 0 && (
              <div className="mt-16 pt-6 border-t border-hairline">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite mb-3.5">
                  § Appears in
                </p>
                <ul data-testid="essay-appears-in" className="flex flex-wrap gap-2">
                  {ing.used.map((name) => (
                    <li key={name}>
                      <span className="inline-flex items-center font-mono text-[11px] tracking-widest uppercase border border-hairline text-graphite px-4 py-2.5">
                        {name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DataSheet ing={ing} idx={idx} total={total} alt={alt} />
        </div>
      </div>
    </article>
  )
}

// ─── ChapterLink (Prev/Next) ──────────────────────────────────────────────────

function ChapterLink({
  dir,
  onClick,
  ing,
}: {
  dir:     'prev' | 'next'
  onClick: () => void
  ing:     IngredientEntry
}) {
  const isPrev = dir === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`chapter-link-${dir}`}
      className={[
        'px-7 py-6 border border-hairline bg-transparent transition-colors hover:border-ink hover:bg-paper-2',
        isPrev ? 'text-left' : 'text-right',
        'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
      ].join(' ')}
    >
      <p className="font-mono text-[10px] tracking-ultra uppercase text-graphite m-0">
        {isPrev ? '← Previous chapter' : 'Next chapter →'}
      </p>
      <p className="font-display text-3xl mt-2.5 mb-1.5 leading-none">
        <span className="text-graphite text-lg mr-2.5">{ing.n}</span>
        {ing.name}
      </p>
      <p className="font-mono text-[10px] tracking-widest uppercase text-graphite m-0">
        {ing.class}
      </p>
    </button>
  )
}

// ─── IngredientsReader (main) ─────────────────────────────────────────────────

export function IngredientsReader({
  ingredients,
  essays,
  defaultEssay,
}: IngredientsReaderProps) {
  const symByIndex = useMemo(
    () => new Map(ingredients.map((i, idx) => [i.sym, idx])),
    [ingredients],
  )
  const firstSym = ingredients[0]?.sym ?? ''

  const [sym, setSym] = useState<string>(firstSym)
  const [mounted, setMounted] = useState(false)

  // Resolve initial chapter from hash + localStorage (client-only to avoid SSR mismatch)
  useEffect(() => {
    const hashMatch = typeof window !== 'undefined' ? window.location.hash.match(HASH_RE) : null
    const hashSym   = hashMatch ? hashMatch[1].toUpperCase() : null
    if (hashSym && symByIndex.has(hashSym)) {
      setSym(hashSym)
    } else if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && symByIndex.has(stored)) {
        setSym(stored)
      }
    }
    setMounted(true)
  }, [symByIndex])

  // Sync hash + localStorage when sym changes (only after mount — prevents
  // overwriting the user's hash on first paint)
  useEffect(() => {
    if (!mounted) return
    const nextHash = `#essay/${sym}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
    window.localStorage.setItem(STORAGE_KEY, sym)
  }, [sym, mounted])

  // Respond to browser back/forward
  useEffect(() => {
    if (!mounted) return
    function onHash() {
      const m = window.location.hash.match(HASH_RE)
      if (m && symByIndex.has(m[1].toUpperCase())) {
        setSym(m[1].toUpperCase())
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [mounted, symByIndex])

  const idx       = symByIndex.get(sym) ?? 0
  const current   = ingredients[idx]
  const total     = ingredients.length
  const prevIng   = ingredients[(idx - 1 + total) % total]
  const nextIng   = ingredients[(idx + 1) % total]
  const essay     = essays[current.sym] ?? defaultEssay

  return (
    <>
      <ChapterRail ingredients={ingredients} activeSym={sym} onSelect={setSym} />
      <EssayEntry ing={current} idx={idx} total={total} essay={essay} />
      <div className="bg-paper border-b border-hairline">
        <div className="max-w-container mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChapterLink dir="prev" ing={prevIng} onClick={() => setSym(prevIng.sym)} />
          <ChapterLink dir="next" ing={nextIng} onClick={() => setSym(nextIng.sym)} />
        </div>
      </div>
    </>
  )
}
