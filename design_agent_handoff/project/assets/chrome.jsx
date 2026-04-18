/* matter — shared chrome (nav + footer + placeholder art) */

function Wordmark({ size = 22 }) {
  return (
    <a href="Home.html" className="m-wordmark" style={{ fontSize: size }} aria-label="matter — home">
      matter<em style={{ fontStyle: 'italic', letterSpacing: '-0.04em', marginLeft: 1 }}>.</em>
    </a>
  );
}

function Nav({ active }) {
  const links = [
    { label: 'Shop',        href: 'Shop.html',             key: 'shop' },
    { label: 'Ingredients', href: 'Ingredients.html',      key: 'ingredients' },
    { label: 'SkinInsight', href: 'Shop.html#skininsight', key: 'skininsight' },
    { label: 'About',       href: 'About.html',            key: 'about' },
  ];
  return (
    <header className="m-nav" style={{
      borderBottom: 'var(--rule)',
      background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div className="m-container" style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        padding: '18px 32px',
        gap: 40,
      }}>
        {/* left: wordmark + nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Wordmark size={24} />
          <span style={{ width: 1, height: 14, background: 'var(--hairline)' }} />
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {links.map(l => (
              <a key={l.key} href={l.href}
                 className="m-mono"
                 style={{
                   fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                   color: active === l.key ? 'var(--ink)' : 'var(--graphite)',
                   borderBottom: active === l.key ? '1px solid var(--ink)' : '1px solid transparent',
                   paddingBottom: 2,
                 }}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {/* center: spacer */}
        <div />

        {/* right: account + bag */}
        <nav style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, alignItems: 'center' }}>
          <a href="#" className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
            Account
          </a>
          <span style={{ width: 1, height: 14, background: 'var(--hairline)' }} />
          <a href="#" className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
            Bag <span style={{ color: 'var(--graphite)' }}>(0)</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

function Ruler() {
  // decorative 12-column ruler
  return (
    <div className="m-container">
      <div className="m-ruler">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i}>{String(i + 1).padStart(2, '0')}</span>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  const cols = [
    { h: 'Shop',  l: ['All formulas', 'Serums', 'Emulsions', 'Cleansers', 'Tonics'] },
    { h: 'Learn', l: ['Ingredients', 'Skin quiz', 'Journal', 'About us'] },
    { h: 'Help',  l: ['FAQ', 'Shipping', 'Returns', 'Contact'] },
  ];
  return (
    <footer style={{ borderTop: 'var(--rule)', marginTop: 96 }}>
      <div className="m-container" style={{ padding: '64px 32px 32px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 80 }}>
          {/* brand block */}
          <div>
            <p className="m-display" style={{ fontSize: 32, margin: 0 }}>
              matter<em style={{ fontStyle: 'italic', letterSpacing: '-0.04em' }}>.</em>
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)', marginTop: 20, maxWidth: 240 }}>
              Ingredient-led skincare.<br/>
              Formulated with precision.<br/>
              Nothing unnecessary.
            </p>
          </div>

          {/* link columns */}
          {cols.map(col => (
            <div key={col.h}>
              <p className="m-eyebrow" style={{ marginBottom: 20 }}>{col.h}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.l.map(item => (
                  <li key={item}><a href="#" style={{ fontSize: 13, color: 'var(--ink)' }}>{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: 'var(--rule-soft)',
        }}>
          <span className="m-mono" style={{ fontSize: 11, color: 'var(--graphite)' }}>
            © 2026 Matter. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy','Terms'].map(t => (
              <a key={t} href="#" className="m-mono" style={{ fontSize: 11, color: 'var(--graphite)' }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function Placeholder({ label, caption, variant = 'default', ratio = '3 / 4', style }) {
  const cls = {
    default: 'm-ph',
    ink:     'm-ph m-ph--ink',
    mineral: 'm-ph m-ph--mineral',
  }[variant] || 'm-ph';
  return (
    <div className={cls} style={{ aspectRatio: ratio, ...style }}>
      <div className="m-ph__label">
        <span>{label}</span>
        <span>{caption}</span>
      </div>
    </div>
  );
}

Object.assign(window, { Wordmark, Nav, Ruler, Footer, Placeholder });
