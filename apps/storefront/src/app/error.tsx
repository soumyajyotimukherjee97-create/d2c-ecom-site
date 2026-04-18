'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Surface unhandled errors to the server log. Sentry's auto-instrumentation
    // (Chunk 8.2) captures these when a DSN is configured; this log keeps a
    // record even in dev.
    console.error('[storefront] unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-paper border-b border-hairline px-8 py-6">
        <div className="max-w-container mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            data-testid="error-brand"
            aria-label="matter — home"
            className="font-display text-[22px] leading-none tracking-tight text-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            matter<em className="not-italic" style={{ fontStyle: 'italic', letterSpacing: '-0.04em', marginLeft: 1 }}>.</em>
          </Link>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
            § Unexpected
          </span>
        </div>
      </header>

      <main className="flex-1 bg-paper-2 flex items-center px-8 py-20">
        <div className="max-w-[560px] mx-auto text-center">
          <p
            data-testid="error-eyebrow"
            className="font-mono text-2xs tracking-ultra uppercase text-graphite"
          >
            § 500 — Unexpected
          </p>
          <h1
            data-testid="error-title"
            className="font-display font-normal text-[clamp(56px,8vw,128px)] leading-[0.96] tracking-tightest mt-5"
          >
            Something <em className="italic">gave</em> way.
          </h1>
          <p className="font-body text-[15px] leading-[1.6] text-ink-2 mt-7">
            An unexpected fault has been logged. Try again, or return home. If
            the problem persists, our atelier is one correspondence away.
          </p>
          {error.digest && (
            <p
              data-testid="error-digest"
              className="font-mono text-2xs tracking-widest uppercase text-graphite mt-4 tabular-nums"
            >
              Ref · {error.digest}
            </p>
          )}
          <div className="flex flex-wrap gap-2 justify-center mt-9">
            <button
              type="button"
              onClick={reset}
              data-testid="error-retry"
              className="inline-flex items-center justify-center bg-ink text-paper px-6 py-4 font-mono text-[11px] tracking-ultra uppercase hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Try again →
            </button>
            <Link
              href="/"
              data-testid="error-home"
              className="inline-flex items-center justify-center border border-ink text-ink px-6 py-4 font-mono text-[11px] tracking-ultra uppercase hover:bg-paper transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Return home
            </Link>
            <Link
              href="/support/new"
              data-testid="error-support"
              className="inline-flex items-center justify-center border border-hairline text-ink px-6 py-4 font-mono text-[11px] tracking-widest uppercase hover:border-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              File a note
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
