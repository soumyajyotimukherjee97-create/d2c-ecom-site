import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Not on file · matter',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Minimal chrome — this route renders outside (shop), so no Navbar. */}
      <header className="bg-paper border-b border-hairline px-8 py-6">
        <div className="max-w-container mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            data-testid="not-found-brand"
            aria-label="matter — home"
            className="font-display text-[22px] leading-none tracking-tight text-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            matter<em className="not-italic" style={{ fontStyle: 'italic', letterSpacing: '-0.04em', marginLeft: 1 }}>.</em>
          </Link>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
            § Not on file
          </span>
        </div>
      </header>

      <main className="flex-1 bg-paper-2 flex items-center px-8 py-20">
        <div className="max-w-[560px] mx-auto text-center">
          <p
            data-testid="not-found-eyebrow"
            className="font-mono text-2xs tracking-ultra uppercase text-graphite"
          >
            § 404 — Out of catalogue
          </p>
          <h1
            data-testid="not-found-title"
            className="font-display font-normal text-[clamp(56px,8vw,128px)] leading-[0.96] tracking-tightest mt-5"
          >
            This page is <em className="italic">not</em> on file.
          </h1>
          <p className="font-body text-[15px] leading-[1.6] text-ink-2 mt-7">
            Our index has no record of the address you requested. It may have
            been moved, retired, or mistyped. No further dispatch is possible
            from here.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-9">
            <Link
              href="/"
              data-testid="not-found-home"
              className="inline-flex items-center justify-center bg-ink text-paper px-6 py-4 font-mono text-[11px] tracking-ultra uppercase hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Return home →
            </Link>
            <Link
              href="/products"
              data-testid="not-found-formulary"
              className="inline-flex items-center justify-center border border-ink text-ink px-6 py-4 font-mono text-[11px] tracking-ultra uppercase hover:bg-paper transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Browse formulary
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
