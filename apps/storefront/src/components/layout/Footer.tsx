import Link from 'next/link'

const SHOP_LINKS = [
  { label: 'All formulas',  href: '/products' },
  { label: 'Serums',        href: '/products?category=serum' },
  { label: 'Emulsions',     href: '/products?category=emulsion' },
  { label: 'Cleansers',     href: '/products?category=cleanser' },
  { label: 'Tonics',        href: '/products?category=toner' },
]

const LEARN_LINKS = [
  { label: 'Ingredients', href: '/ingredients' },
  { label: 'Skin quiz',   href: '/products?quiz=true' },
  { label: 'Journal',     href: '/journal' },
  { label: 'About us',    href: '/about' },
]

const HELP_LINKS = [
  { label: 'FAQ',      href: '/faq' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns',  href: '/returns' },
  { label: 'Contact',  href: '/support/new' },
]

function LinkGroup({
  heading,
  links,
}: {
  heading: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <p
        data-testid={`footer-heading-${heading.toLowerCase()}`}
        className="font-mono text-2xs uppercase tracking-widest text-graphite mb-5"
      >
        {heading}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="font-body text-sm text-ink hover:text-graphite transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      data-testid="footer"
      className="border-t border-hairline bg-paper mt-24 px-8 pt-16 pb-8"
    >
      {/* ── 4-col grid — brand (1.4fr) · Shop · Learn · Help ── */}
      <div
        className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12 mb-20"
      >
        {/* Brand + tagline */}
        <div>
          <Link
            href="/"
            data-testid="footer-brand"
            aria-label="matter — home"
            className="font-display text-[32px] leading-none tracking-tight text-ink block"
          >
            matter<em style={{ fontStyle: 'italic', letterSpacing: '-0.04em' }}>.</em>
          </Link>
          <p className="font-body text-sm text-ink-2 leading-relaxed mt-5 max-w-[240px]">
            Ingredient-led skincare.<br />
            Formulated with precision.<br />
            Nothing unnecessary.
          </p>
        </div>

        <LinkGroup heading="Shop" links={SHOP_LINKS} />
        <LinkGroup heading="Learn" links={LEARN_LINKS} />
        <LinkGroup heading="Help" links={HELP_LINKS} />
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between border-t border-hairline/50 pt-6">
        <p
          data-testid="footer-copyright"
          className="font-mono text-xs text-graphite"
        >
          © {year} Matter. All rights reserved.
        </p>

        <div className="flex items-center gap-7">
          <Link
            href="/privacy"
            data-testid="footer-privacy"
            className="font-mono text-xs uppercase tracking-widest text-graphite hover:text-ink transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            data-testid="footer-terms"
            className="font-mono text-xs uppercase tracking-widest text-graphite hover:text-ink transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
