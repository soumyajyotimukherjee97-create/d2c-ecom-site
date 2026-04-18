/* matter — homepage sections (toned-down, 4 sections) */

// ══ HERO — quieter, editorial ══════════════════════════════════════
function Hero() {
  return (
    <section id="home-hero" style={{ borderBottom: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '80px 32px 96px' }}>
        <div className="m-grid" style={{ alignItems: 'center' }}>

          {/* left: display headline */}
          <div style={{ gridColumn: '1 / 8' }}>
            <h1 className="m-display" style={{ fontSize: 'clamp(56px, 7vw, 104px)', margin: 0, lineHeight: 0.98 }}>
              Skin, reduced<br />
              to its <em>matter</em>.
            </h1>
            <p style={{ marginTop: 32, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 460 }}>
              Ingredient-led formulas, specified to the percentage proven in trial.
              No fragrance, no fillers, no filler claims.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
              <a href="Shop.html" className="m-btn">View the formulary <span>→</span></a>
              <a href="#spotlight" className="m-btn m-btn--hair">Read the science</a>
            </div>
          </div>

          {/* right: featured specimen */}
          <div style={{ gridColumn: '9 / 13' }}>
            <Placeholder label="SPECIMEN · 01" caption="serum 30ml" variant="mineral" ratio="3 / 4" />
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              paddingTop: 14, marginTop: 4, borderTop: 'var(--rule-soft)',
            }}>
              <span className="m-mono" style={{ color: 'var(--graphite)' }}>01 / The Corrective</span>
              <span className="m-num" style={{ fontSize: 14 }}>€ 84</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ FEATURED PRODUCTS (3-up) ═══════════════════════════════════════
function Featured() {
  // eslint-disable-next-line
  const items = [
    { n: '01', name: 'The Corrective', klass: 'Serum',    ml: '30',  pH: '5.5', price: '84',  variant: 'mineral' },
    { n: '02', name: 'The Veil',       klass: 'Emulsion', ml: '50',  pH: '5.8', price: '112', variant: 'default' },
    { n: '03', name: 'The Clarifier',  klass: 'Tonic',    ml: '200', pH: '3.6', price: '68',  variant: 'ink'     },
  ];
  return (
    <section id="home-featured" style={{ borderBottom: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '96px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48 }}>
          <div>
            <p className="m-eyebrow">§ II — Featured formulas</p>
            <h2 className="m-display" style={{ fontSize: 48, margin: '14px 0 0' }}>
              Start your <em>journey</em> here.
            </h2>
          </div>
          <a href="Shop.html" className="m-mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
            View all nine →
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {items.map(it => (
            <a key={it.n} href="Product.html" style={{ textDecoration: 'none', display: 'block' }}>
              <Placeholder label={`SPECIMEN · ${it.n}`} caption={`${it.klass.toLowerCase()} ${it.ml}ml`} variant={it.variant} ratio="4 / 5" />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16 }}>
                <span className="m-mono" style={{ color: 'var(--graphite)' }}>{it.n}</span>
                <span className="m-mono" style={{ color: 'var(--assay-ink)' }}>● IN LOT</span>
              </div>
              <h3 className="m-display" style={{ fontSize: 32, margin: '8px 0 6px' }}>{it.name}</h3>
              <p className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {it.klass} · {it.ml} ml · pH {it.pH}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18, paddingTop: 14, borderTop: 'var(--rule-soft)' }}>
                <span className="m-num" style={{ fontSize: 16 }}>€ {it.price}</span>
                <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>View assay →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══ KNOW YOUR INGREDIENT (interactive selector) ════════════════════
function Spotlight() {
  const ingredients = [
    {
      key: 'niacinamide',
      name: 'Niacinamide',
      formula: 'C₆H₆N₂O · 122.12 g/mol',
      headline: <>why <em>2%</em> is the sweet spot.</>,
      copy: "At 2%, niacinamide visibly reduces pore size and regulates sebum without irritating sensitive skin. Higher isn't better — it's about precision.",
      data: [['Concentration', '2.0%'], ['Trial reference', 'MT-CT-0026'], ['Efficacy plateau', '2 – 3%']],
    },
    {
      key: 'retinal',
      name: 'Retinaldehyde',
      formula: 'C₂₀H₂₈O · 284.44 g/mol',
      headline: <>why <em>0.05%</em> rivals retinol 1%.</>,
      copy: "Retinaldehyde converts to retinoic acid in a single step — 11× faster than retinol. A small dose delivers prescription-adjacent results with a fraction of the irritation.",
      data: [['Concentration', '0.05%'], ['Trial reference', 'MT-CT-0019'], ['Conversion rate', '11×']],
    },
    {
      key: 'aha',
      name: 'Mandelic acid',
      formula: 'C₈H₈O₃ · 152.15 g/mol',
      headline: <>why the <em>largest</em> AHA wins.</>,
      copy: "Mandelic's oversized molecule penetrates slowly and evenly, exfoliating without the sting. Gentler than glycolic, more effective than lactic for pigmented and reactive skin.",
      data: [['Concentration', '8.0%'], ['Molecular size', '152 Da'], ['pH', '3.6']],
    },
    {
      key: 'bakuchiol',
      name: 'Bakuchiol',
      formula: 'C₁₈H₂₄O · 256.38 g/mol',
      headline: <>why <em>plants</em> match retinoids.</>,
      copy: "Isolated from Psoralea corylifolia, bakuchiol up-regulates the same gene pathway as retinol — with no photosensitivity and no barrier disruption. Safe through pregnancy.",
      data: [['Concentration', '1.0%'], ['Photostability', 'UV-stable'], ['Pregnancy', 'Safe']],
    },
  ];
  const [active, setActive] = React.useState(ingredients[0].key);
  const ing = ingredients.find(i => i.key === active);

  return (
    <section id="home-spotlight" style={{ borderBottom: 'var(--rule)', background: 'var(--paper-2)' }}>
      <a id="spotlight" style={{ position: 'absolute' }}/>
      <a id="ingredients" style={{ position: 'absolute' }}/>
      <div className="m-container" style={{ padding: '96px 32px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
          <div>
            <p className="m-eyebrow">§ III — Know your ingredient</p>
            <h2 className="m-display" style={{ fontSize: 44, margin: '14px 0 0' }}>
              The <em>science</em>.
            </h2>
          </div>
          <p className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)', letterSpacing: '0.14em' }}>
            {ingredients.findIndex(i => i.key === active) + 1} / {ingredients.length}
          </p>
        </div>

        {/* ingredient selector tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${ingredients.length}, 1fr)`,
          border: 'var(--rule)', marginBottom: 56, background: 'var(--paper)',
        }}>
          {ingredients.map((i, idx) => {
            const selected = i.key === active;
            return (
              <button key={i.key} onClick={() => setActive(i.key)}
                style={{
                  padding: '18px 16px', textAlign: 'left',
                  background: selected ? 'var(--ink)' : 'transparent',
                  color:      selected ? 'var(--paper)' : 'var(--ink)',
                  borderRight: idx < ingredients.length - 1 ? '1px solid var(--hairline)' : 'none',
                  transition: 'background 0.12s',
                }}>
                <p className="m-mono" style={{
                  fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: selected ? 'color-mix(in oklab, var(--paper) 55%, transparent)' : 'var(--graphite)',
                  margin: 0,
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </p>
                <p className="m-display" style={{ fontSize: 22, margin: '6px 0 0', lineHeight: 1.1 }}>
                  {i.name}
                </p>
              </button>
            );
          })}
        </div>

        <div className="m-grid" style={{ alignItems: 'center' }}>
          <div style={{ gridColumn: '1 / 7' }}>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              {ing.name} — {ing.formula}
            </p>
            <h3 className="m-display" style={{ fontSize: 'clamp(40px, 4.6vw, 64px)', margin: '16px 0 0', lineHeight: 1 }}>
              {ing.headline}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', maxWidth: 480, marginTop: 28 }}>
              {ing.copy}
            </p>
            <p className="m-mono" style={{ marginTop: 24, color: 'var(--graphite)', fontSize: 10, letterSpacing: '0.14em' }}>
              — DR. INÈS SAAD, HEAD OF FORMULATION
            </p>
          </div>

          <div style={{ gridColumn: '8 / 13' }}>
            <Placeholder label={`SPECIMEN · ${ing.name.toUpperCase()}`} caption={ing.formula} variant="mineral" ratio="4 / 5" />

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
              marginTop: 14, border: 'var(--rule)', background: 'var(--paper)',
            }}>
              {ing.data.map(([k, v], i) => (
                <div key={k} style={{ padding: 14, borderRight: i < 2 ? 'var(--rule-soft)' : 'none' }}>
                  <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', marginBottom: 6 }}>{k}</p>
                  <p className="m-num" style={{ fontSize: 14, margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ AS SEEN IN ══════════════════════════════════════════════════════
function Press() {
  const pubs = ['Vogue Paris', 'Monocle', 'Financial Times', 'Kinfolk', 'NYT Styles', 'Elle Japon'];
  return (
    <section id="home-press" style={{ borderBottom: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '72px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <p className="m-eyebrow">§ IV — As seen in</p>
          <span className="m-mono" style={{ color: 'var(--graphite)' }}>Press · 2024 – 2026</span>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          borderTop: 'var(--rule)', borderBottom: 'var(--rule)',
        }}>
          {pubs.map((p, i) => (
            <div key={p} style={{
              padding: '36px 16px', textAlign: 'center',
              borderRight: i < pubs.length - 1 ? 'var(--rule-soft)' : 'none',
            }}>
              <span className="m-display" style={{ fontSize: 22 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══ STAY INFORMED ═══════════════════════════════════════════════════
function Newsletter() {
  return (
    <section id="home-newsletter" style={{ borderBottom: 'var(--rule)', background: 'var(--paper-2)' }}>
      <div className="m-container" style={{ padding: '96px 32px' }}>
        <div className="m-grid" style={{ alignItems: 'center' }}>
          <div style={{ gridColumn: '1 / 7' }}>
            <p className="m-eyebrow">§ V — Stay informed</p>
            <h2 className="m-display" style={{ fontSize: 'clamp(40px, 4.5vw, 60px)', margin: '16px 0 0', lineHeight: 1.02 }}>
              Formulary updates.<br /><em>Nothing</em> else.
            </h2>
            <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 440 }}>
              New lots, active revisions, the occasional trial publication.
              No promotions, no unsubscribe-bait.
            </p>
          </div>

          <div style={{ gridColumn: '8 / 13' }}>
            <form style={{ display: 'flex', gap: 0 }}>
              <input className="m-input" style={{
                padding: '14px 16px', fontSize: 13,
                border: '1px solid var(--ink)', borderRight: 0, flex: 1,
              }} placeholder="Electronic address" />
              <button className="m-mono" style={{
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'var(--ink)', color: 'var(--paper)',
                padding: '0 24px', border: '1px solid var(--ink)',
              }}>
                Enrol →
              </button>
            </form>
            <p className="m-mono" style={{ marginTop: 14, color: 'var(--graphite)', fontSize: 10, letterSpacing: '0.08em' }}>
              Dispatched quarterly · 2,814 subscribers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ PRINCIPLES (4-up with line icons) ══════════════════════════════
function Principles() {
  const items = [
    {
      label: 'Transparency',
      copy: 'Full disclosure of every active and its concentration, published with each lot.',
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
          <circle cx="24" cy="24" r="16" />
          <path d="M 12 24 L 36 24" />
          <path d="M 14 18 L 34 18" />
          <path d="M 14 30 L 34 30" />
          <path d="M 24 8 L 24 40" />
        </svg>
      ),
    },
    {
      label: 'Efficacy',
      copy: 'Formulations developed in-house, validated through blinded clinical trials.',
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
          <path d="M 18 8 L 18 20 L 10 38 L 38 38 L 30 20 L 30 8 Z" />
          <path d="M 16 8 L 32 8" />
          <path d="M 14 30 L 34 30" />
          <circle cx="22" cy="34" r="1.2" />
          <circle cx="28" cy="32" r="1.2" />
        </svg>
      ),
    },
    {
      label: 'Accessible',
      copy: 'Luxury-grade actives at the price of doing the science, not the marketing.',
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
          <path d="M 20 8 L 28 8 L 28 14 L 32 18 L 32 38 L 16 38 L 16 18 L 20 14 Z" />
          <path d="M 20 22 L 28 22" />
          <path d="M 20 28 L 28 28" />
        </svg>
      ),
    },
    {
      label: 'Sourced well',
      copy: 'Raw materials traced to origin; provenance published for every batch.',
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
          <circle cx="24" cy="24" r="16" />
          <ellipse cx="24" cy="24" rx="8" ry="16" />
          <path d="M 8 24 L 40 24" />
          <path d="M 10 16 L 38 16" />
          <path d="M 10 32 L 38 32" />
        </svg>
      ),
    },
  ];

  return (
    <section id="home-principles" style={{ borderBottom: 'var(--rule)' }}>
      <a id="about" style={{ position: 'absolute' }}/>
      <div className="m-container" style={{ padding: '120px 32px', textAlign: 'center' }}>
        <p className="m-eyebrow">§ III — Principles</p>
        <h2 className="m-display" style={{
          fontSize: 'clamp(40px, 5vw, 64px)', margin: '16px auto 0',
          lineHeight: 1.05, maxWidth: 840,
        }}>
          The <em>future</em> of personal care is here.
        </h2>
        <p style={{
          fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)',
          maxWidth: 560, margin: '24px auto 0',
        }}>
          Embrace matter — where each element is chosen for its scientific merit,
          offering you authentic, effective skincare.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0, marginTop: 96,
          borderTop: 'var(--rule)', borderBottom: 'var(--rule)',
          borderLeft: 'var(--rule)', borderRight: 'var(--rule)',
        }}>
          {items.map((it, i) => (
            <div key={it.label} style={{
              padding: '56px 24px 56px',
              borderRight: i < items.length - 1 ? 'var(--rule)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--graphite)', margin: 0 }}>
                0{i + 1}
              </p>
              <div style={{ color: 'var(--ink)', margin: '24px 0 28px' }}>
                {it.icon}
              </div>
              <h3 className="m-display" style={{ fontSize: 26, margin: 0 }}>
                {it.label}
              </h3>
              <p style={{
                fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)',
                margin: '14px 0 0', maxWidth: 220,
              }}>
                {it.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══ REVIEWS (arrow-nav carousel, 3-up) ═════════════════════════════
function Reviews() {
  const reviews = [
    { name: 'Ritesh M.',  date: '04/17/26', stars: 5, title: 'Results you can see',          body: 'Three weeks in and the change is clinical. Texture gone, tone evened out. The ingredient disclosure alone earned my trust.', product: 'The Corrective · 30ml' },
    { name: 'Anjum S.',   date: '04/17/26', stars: 5, title: 'Works on my sensitive skin',   body: 'I react to most actives within a day. This formulation — zero sting, zero redness. My skin genuinely looks settled.',          product: 'The Veil · 50ml' },
    { name: 'Yogesh A.',  date: '04/16/26', stars: 5, title: 'Finally, an honest brand',     body: 'Every formula lists percentages and trial references. I read the assay before I buy. This is how skincare should be sold.',     product: 'The Clarifier · 200ml' },
    { name: 'Bansi M.',   date: '04/14/26', stars: 5, title: 'Replaced my routine',          body: 'I was running eight products. I now use three from matter and my skin has never looked better. The restraint works.',             product: 'Starter regimen' },
    { name: 'Eliott R.',  date: '04/12/26', stars: 5, title: 'Quiet and extraordinary',      body: 'No claims, no theatre — just a serum that delivers. The bottle is beautiful. The results are better.',                        product: 'The Corrective · 30ml' },
    { name: 'Mira K.',    date: '04/09/26', stars: 4, title: 'Worth every euro',             body: 'Expensive, yes. But formulated to trial-verified concentrations with full provenance. You pay for the science, not the story.', product: 'The Veil · 50ml' },
  ];
  const perPage = 3;
  const totalPages = Math.ceil(reviews.length / perPage);
  const [page, setPage] = React.useState(0);
  const prev = () => setPage(p => (p - 1 + totalPages) % totalPages);
  const next = () => setPage(p => (p + 1) % totalPages);

  const ArrowBtn = ({ dir, onClick }) => (
    <button onClick={onClick} aria-label={dir === 'prev' ? 'Previous' : 'Next'}
      style={{
        width: 40, height: 40, border: '1px solid var(--ink)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', color: 'var(--ink)',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--paper)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)'; }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
        {dir === 'prev'
          ? <path d="M 9 2 L 4 7 L 9 12" />
          : <path d="M 5 2 L 10 7 L 5 12" />}
      </svg>
    </button>
  );

  return (
    <section id="home-reviews" style={{ borderBottom: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '96px 32px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48 }}>
          <div>
            <p className="m-eyebrow">§ IV — Correspondence</p>
            <h2 className="m-display" style={{ fontSize: 44, margin: '14px 0 0' }}>
              What our <em>customers</em> say.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <p className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)', letterSpacing: '0.14em', margin: 0 }}>
              n = 1,284 &middot; avg 4.9 / 5
            </p>
            <span className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)', letterSpacing: '0.14em' }}>
              {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <ArrowBtn dir="prev" onClick={prev} />
              <ArrowBtn dir="next" onClick={next} />
            </div>
          </div>
        </div>

        <div style={{ overflow: 'hidden', borderTop: 'var(--rule)', borderBottom: 'var(--rule)' }}>
          <div style={{
            display: 'flex',
            transform: `translateX(-${page * 100}%)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {Array.from({ length: totalPages }, (_, pg) => (
              <div key={pg} style={{
                flex: '0 0 100%',
                display: 'grid', gridTemplateColumns: `repeat(${perPage}, 1fr)`,
              }}>
                {reviews.slice(pg * perPage, pg * perPage + perPage).map((r, i) => (
                  <article key={i} style={{
                    padding: '28px 28px',
                    borderRight: i < perPage - 1 ? 'var(--rule-soft)' : 'none',
                    display: 'flex', flexDirection: 'column', minHeight: 300,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                      <p className="m-mono" style={{ fontSize: 11, margin: 0 }}>
                        {r.name} <span className="m-dot" style={{ margin: '0 6px 1px' }}/> <span style={{ color: 'var(--graphite)' }}>Verified</span>
                      </p>
                      <span className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)' }}>{r.date}</span>
                    </div>

                    <p className="m-num" style={{ margin: 0, fontSize: 13, letterSpacing: '0.18em' }}>
                      {'★'.repeat(r.stars)}<span style={{ color: 'var(--hairline)' }}>{'★'.repeat(5 - r.stars)}</span>
                    </p>

                    <h3 className="m-display" style={{ fontSize: 24, margin: '14px 0 10px', lineHeight: 1.15 }}>
                      {r.title}
                    </h3>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0, flex: 1 }}>
                      {r.body}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, paddingTop: 14, borderTop: 'var(--rule-soft)' }}>
                      <div style={{ width: 28, height: 28, background: 'var(--paper-3)', border: '1px solid var(--hairline)' }}/>
                      <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--graphite)', textTransform: 'uppercase' }}>
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
  );
}

Object.assign(window, { Hero, Featured, Principles, Reviews, Spotlight, Press, Newsletter });
