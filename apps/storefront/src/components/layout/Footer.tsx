import Link from 'next/link'

const SHOP_LINKS = [
  { label: 'All products', href: '/products' },
  { label: 'Serums', href: '/products?category=serum' },
  { label: 'Moisturisers', href: '/products?category=moisturiser' },
  { label: 'Toners', href: '/products?category=toner' },
]

const LEARN_LINKS = [
  { label: 'Ingredients', href: '/ingredients' },
  { label: 'Skin quiz', href: '/products?quiz=true' },
  { label: 'Journal', href: '/journal' },
  { label: 'About us', href: '/about' },
]

const HELP_LINKS = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact', href: '/support/new' },
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
        className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-4"
      >
        {heading}
      </p>
      <ul className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="font-body text-xs text-gray-600 hover:text-gray-900 transition-colors"
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
    <footer data-testid="footer" className="border-t border-gray-100 bg-white px-6 pt-12 pb-8">

      {/* ── 4-col grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">

        {/* Col 1 — Brand + tagline (spans 2 of 5 columns) */}
        <div className="md:col-span-2">
          <Link
            href="/"
            data-testid="footer-brand"
            className="font-heading text-base tracking-tight text-gray-900 block mb-3"
          >
            Form.
          </Link>
          <p className="font-body text-xs text-gray-600 leading-relaxed">
            Ingredient-led skincare.<br />
            Formulated with precision.<br />
            Nothing unnecessary.
          </p>
        </div>

        {/* Cols 2–4 — Link groups */}
        <LinkGroup heading="Shop" links={SHOP_LINKS} />
        <LinkGroup heading="Learn" links={LEARN_LINKS} />
        <LinkGroup heading="Help" links={HELP_LINKS} />
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <p
          data-testid="footer-copyright"
          className="font-mono text-2xs text-gray-400"
        >
          © {year} Form. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            data-testid="footer-privacy"
            className="font-mono text-2xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            data-testid="footer-terms"
            className="font-mono text-2xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>

    </footer>
  )
}
