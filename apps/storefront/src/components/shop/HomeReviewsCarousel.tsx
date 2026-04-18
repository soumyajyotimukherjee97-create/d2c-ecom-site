'use client'

import { useState } from 'react'

type Review = {
  name:    string
  date:    string
  stars:   number
  title:   string
  body:    string
  product: string
}

const REVIEWS: Review[] = [
  { name: 'Ritesh M.', date: '04/17/26', stars: 5, title: 'Results you can see',        body: 'Three weeks in and the change is clinical. Texture gone, tone evened out. The ingredient disclosure alone earned my trust.', product: 'The Corrective · 30ml' },
  { name: 'Anjum S.',  date: '04/17/26', stars: 5, title: 'Works on my sensitive skin', body: 'I react to most actives within a day. This formulation — zero sting, zero redness. My skin genuinely looks settled.',        product: 'The Veil · 50ml' },
  { name: 'Yogesh A.', date: '04/16/26', stars: 5, title: 'Finally, an honest brand',   body: 'Every formula lists percentages and trial references. I read the assay before I buy. This is how skincare should be sold.',   product: 'The Clarifier · 200ml' },
  { name: 'Bansi M.',  date: '04/14/26', stars: 5, title: 'Replaced my routine',        body: 'I was running eight products. I now use three from matter and my skin has never looked better. The restraint works.',            product: 'Starter regimen' },
  { name: 'Eliott R.', date: '04/12/26', stars: 5, title: 'Quiet and extraordinary',    body: 'No claims, no theatre — just a serum that delivers. The bottle is beautiful. The results are better.',                       product: 'The Corrective · 30ml' },
  { name: 'Mira K.',   date: '04/09/26', stars: 4, title: 'Worth every euro',           body: 'Expensive, yes. But formulated to trial-verified concentrations with full provenance. You pay for the science, not the story.', product: 'The Veil · 50ml' },
]

const PER_PAGE = 3
const TOTAL_PAGES = Math.ceil(REVIEWS.length / PER_PAGE)

function ArrowButton({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next'
  onClick:   () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous reviews' : 'Next reviews'}
      data-testid={`reviews-arrow-${direction}`}
      className="inline-flex w-10 h-10 items-center justify-center border border-ink text-ink hover:bg-ink hover:text-paper transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        {direction === 'prev'
          ? <path d="M 9 2 L 4 7 L 9 12" />
          : <path d="M 5 2 L 10 7 L 5 12" />}
      </svg>
    </button>
  )
}

export function HomeReviewsCarousel() {
  const [page, setPage] = useState(0)
  const prev = () => setPage((p) => (p - 1 + TOTAL_PAGES) % TOTAL_PAGES)
  const next = () => setPage((p) => (p + 1) % TOTAL_PAGES)

  return (
    <section
      data-testid="home-reviews"
      className="bg-paper border-b border-hairline"
    >
      <div className="max-w-container mx-auto px-8 pt-24 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
              § IV — Correspondence
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink mt-3.5">
              What our <em className="italic">customers</em> say.
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-mono text-2xs tracking-widest uppercase text-graphite whitespace-nowrap">
              n = 1,284 · avg 4.9 / 5
            </p>
            <span
              data-testid="reviews-counter"
              className="font-mono text-2xs tracking-widest uppercase text-graphite whitespace-nowrap"
            >
              {String(page + 1).padStart(2, '0')} / {String(TOTAL_PAGES).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              <ArrowButton direction="prev" onClick={prev} />
              <ArrowButton direction="next" onClick={next} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-t border-b border-hairline">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
            data-testid="reviews-track"
          >
            {Array.from({ length: TOTAL_PAGES }, (_, pg) => (
              <div
                key={pg}
                className="flex-[0_0_100%] grid grid-cols-1 md:grid-cols-3"
              >
                {REVIEWS.slice(pg * PER_PAGE, pg * PER_PAGE + PER_PAGE).map((r, i) => (
                  <article
                    key={`${pg}-${i}`}
                    data-testid="review-card"
                    className={`p-7 flex flex-col min-h-[300px] ${i < PER_PAGE - 1 ? 'md:border-r border-hairline/60' : ''}`}
                  >
                    <div className="flex items-baseline justify-between mb-3.5">
                      <p className="font-mono text-xs text-ink">
                        {r.name}{' '}
                        <span
                          aria-hidden="true"
                          className="inline-block w-1.5 h-1.5 rounded-full bg-assay mx-1.5"
                        />
                        <span className="text-graphite">Verified</span>
                      </p>
                      <span className="font-mono text-2xs text-graphite">{r.date}</span>
                    </div>

                    <p
                      aria-label={`Rated ${r.stars} out of 5`}
                      className="font-mono text-sm tracking-[0.18em] text-ink"
                    >
                      {'★'.repeat(r.stars)}
                      <span className="text-hairline">{'★'.repeat(5 - r.stars)}</span>
                    </p>

                    <h3 className="font-display text-2xl text-ink mt-3.5 mb-2.5 leading-[1.15]">
                      {r.title}
                    </h3>
                    <p className="font-body text-sm leading-[1.6] text-ink-2 flex-1">
                      {r.body}
                    </p>

                    <div className="flex items-center gap-2.5 mt-5 pt-3.5 border-t border-hairline/60">
                      <span
                        aria-hidden="true"
                        className="inline-block w-7 h-7 bg-paper-3 border border-hairline"
                      />
                      <span className="font-mono text-2xs tracking-wider uppercase text-graphite">
                        {r.product}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
