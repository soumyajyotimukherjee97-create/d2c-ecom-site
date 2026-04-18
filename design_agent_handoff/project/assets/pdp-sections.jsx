/* matter — product detail page (simplified) */

function Breadcrumb() {
  return (
    <div className="m-container" style={{ padding: '20px 32px' }}>
      <span className="m-mono" style={{ color: 'var(--graphite)' }}>
        <a href="Home.html" style={{ color: 'var(--graphite)' }}>Home</a>
        <span style={{ margin: '0 10px', opacity: 0.4 }}>/</span>
        <a href="Shop.html" style={{ color: 'var(--graphite)' }}>Shop</a>
        <span style={{ margin: '0 10px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--ink)' }}>Night Repair Cream</span>
      </span>
    </div>
  );
}

function PDPMain() {
  const [vol, setVol] = React.useState('30');
  const [qty, setQty] = React.useState(1);
  const [img, setImg] = React.useState(0);

  const price = vol === '30' ? '2,499' : '3,999';
  const ml = vol === '30' ? '30ml' : '60ml';

  const concerns = ['Dry', 'Combination', 'Sensitive', 'Aging', 'Dullness', 'Redness'];

  return (
    <section>
      <div className="m-container" style={{ padding: '24px 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>

          {/* LEFT — image gallery */}
          <div>
            <div style={{
              aspectRatio: '1 / 1',
              background: 'var(--paper-2)',
              border: '1px solid var(--hairline)',
            }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
              {[0,1,2,3].map(i => (
                <button key={i} onClick={() => setImg(i)}
                  style={{
                    aspectRatio: '1 / 1',
                    background: 'var(--paper-2)',
                    border: img === i ? '1px solid var(--ink)' : '1px solid var(--hairline)',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — purchase panel */}
          <div style={{ borderLeft: 'var(--rule)', paddingLeft: 48 }}>
            <p className="m-mono" style={{ color: 'var(--graphite)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>
              Moisturiser
            </p>
            <h1 className="m-display" style={{ fontSize: 52, margin: '14px 0 0', lineHeight: 1 }}>
              Night Repair Cream
            </h1>

            <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="m-display" style={{ fontSize: 34 }}>₹{price}</span>
              <span className="m-mono" style={{ color: 'var(--graphite)', fontSize: 11 }}>/ {ml}</span>
            </div>

            {/* SIZE */}
            <div style={{ marginTop: 32 }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 10px' }}>Size</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['30','30ml', null], ['60','60ml','₹3,999']].map(([v, label, tag]) => (
                  <button key={v} onClick={() => setVol(v)} className="m-mono"
                    style={{
                      padding: '10px 14px',
                      fontSize: 11, letterSpacing: '0.08em',
                      background: vol === v ? 'var(--ink)' : 'transparent',
                      color: vol === v ? 'var(--paper)' : 'var(--ink)',
                      border: vol === v ? '1px solid var(--ink)' : '1px solid var(--hairline)',
                    }}>
                    {label}{tag && <span style={{ opacity: 0.7, marginLeft: 8 }}>— {tag}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* IDEAL FOR */}
            <div style={{ marginTop: 28 }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 10px' }}>Ideal for</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {concerns.map(c => (
                  <span key={c} className="m-mono" style={{
                    padding: '7px 12px',
                    fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: 'var(--graphite)',
                    border: '1px solid var(--hairline)',
                  }}>{c}</span>
                ))}
              </div>
            </div>

            {/* QTY + CTA */}
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '36px 1fr 36px',
                alignItems: 'center', border: '1px solid var(--hairline)',
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ height: 46, color: 'var(--graphite)' }}>–</button>
                <span className="m-num" style={{ textAlign: 'center', fontSize: 14 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  style={{ height: 46, color: 'var(--graphite)' }}>+</button>
              </div>
              <button className="m-mono" style={{
                background: 'var(--ink)', color: 'var(--paper)',
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '0 24px', height: 46,
              }}>
                Add to cart
              </button>
            </div>

            {/* KEY INGREDIENTS */}
            <div style={{ marginTop: 40 }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 12px' }}>Key ingredients</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Encapsulated Retinol', '0.1%'],
                  ['Ceramide NP',          '1%'],
                  ['Palmitoyl Tripeptide-1', null],
                ].map(([name, pct]) => (
                  <div key={name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px 12px 16px',
                    border: '1px solid var(--hairline)',
                    borderLeft: '3px solid var(--ink)',
                  }}>
                    <span style={{ fontSize: 14 }}>{name}</span>
                    {pct && <span className="m-num" style={{ fontSize: 11, color: 'var(--graphite)' }}>{pct}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* CLINICAL INSIGHT */}
            <div style={{
              marginTop: 20, padding: '18px 20px',
              border: '1px solid var(--hairline)', background: 'var(--paper-2)',
            }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
                Clinical insight
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)', margin: '8px 0 0' }}>
                Microencapsulation slows release, dramatically reducing irritation
                vs. pure retinol at equivalent activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function YouMightAlsoLike() {
  const items = [
    { name: 'Salicylic Acid + LHA 2% Cleanser', concern: 'Acne, Breakouts & Oiliness',      price: 'On Sale from ₹269',             cta: 'Select Size' },
    { name: 'SPF 60 Sunscreen',                 concern: 'Sun protection, UV exposure / damage', price: '₹539', strike: '₹599',     cta: 'Add to Cart' },
    { name: 'Vitamin B5 10% Moisturizer',       concern: 'Damaged Barrier, Oily & Dehydrated',   price: 'On Sale from ₹314',         cta: 'Select Size' },
    { name: 'Light Fluid SPF 50 Sunscreen',     concern: 'Sun protection & UV exposure / damage', price: 'On Sale from ₹314',        cta: 'Select Size' },
  ];

  return (
    <section style={{ borderTop: 'var(--rule)', background: 'var(--paper)' }}>
      <div className="m-container" style={{ padding: '72px 32px 96px' }}>
        <div style={{ marginBottom: 40 }}>
          <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
            § Complete the regimen
          </p>
          <h2 className="m-display" style={{ fontSize: 40, margin: '14px 0 0' }}>
            You might <em>also</em> like.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {items.map((it, i) => <ProductCard key={i} {...it} />)}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ name, concern, price, strike, cta }) {
  const [dot, setDot] = React.useState(0);
  return (
    <article>
      {/* image w/ arrows */}
      <div style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        background: 'var(--paper-2)',
        border: '1px solid var(--hairline)',
        overflow: 'hidden',
      }}>
        {/* arrows */}
        {[['left', '14px', '‹'], ['right', '14px', '›']].map(([side, off, g]) => (
          <button key={side} aria-label={side}
            style={{
              position: 'absolute', top: '50%', [side]: off, transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--paper)', border: '1px solid var(--hairline)',
              fontFamily: 'var(--f-body)', fontSize: 18, lineHeight: 1,
              color: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {g}
          </button>
        ))}

        {/* dot pagination */}
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {[0,1,2,3].map(i => (
            <button key={i} onClick={() => setDot(i)}
              style={{
                width: 5, height: 5, borderRadius: '50%', padding: 0,
                background: i === dot ? 'var(--ink)' : 'var(--hairline)',
              }} />
          ))}
        </div>
      </div>

      {/* text */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, color: 'var(--ink)' }}>{name}</h3>
        <p style={{ fontSize: 12, color: 'var(--graphite)', margin: '6px 0 0' }}>{concern}</p>
        <p style={{ margin: '6px 0 0' }}>
          <span className="m-num" style={{ fontSize: 13, color: 'var(--ink)' }}>{price}</span>
          {strike && (
            <span className="m-num" style={{ fontSize: 12, color: 'var(--graphite)', textDecoration: 'line-through', marginLeft: 8 }}>
              {strike}
            </span>
          )}
        </p>
      </div>

      {/* CTA */}
      <button className="m-mono" style={{
        width: '100%', marginTop: 16, padding: '14px 16px',
        background: 'var(--ink)', color: 'var(--paper)',
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        {cta}
      </button>
    </article>
  );
}

function ProductReviews() {
  const reviews = [
    { name: 'Aarti K.',  date: '04/16/26', stars: 5, title: 'Skin feels repaired overnight',   body: 'Three weeks in and the texture on my forehead has noticeably smoothed. No irritation at all — unusual for a retinol product.', product: 'Night Repair Cream · 30ml' },
    { name: 'Devika R.', date: '04/14/26', stars: 5, title: 'Finally a retinol I tolerate',     body: 'I\'ve stopped/started retinol three times because of flaking. Encapsulated form completely changed that. Smooth mornings, no peeling.', product: 'Night Repair Cream · 30ml' },
    { name: 'Kabir T.',  date: '04/12/26', stars: 5, title: 'Texture is near-invisible',        body: 'Melts in, no tackiness, plays well with my moisturiser. Fine lines around the eyes are genuinely softer after six weeks.',      product: 'Night Repair Cream · 60ml' },
    { name: 'Ishita P.', date: '04/09/26', stars: 5, title: 'Worth the upgrade',                body: 'Swapped out two products for this one. Barrier feels stronger, makeup sits better. The formulation does what it promises.',    product: 'Night Repair Cream · 30ml' },
    { name: 'Vivek S.',  date: '04/06/26', stars: 4, title: 'Subtle but real',                  body: 'Not a dramatic overnight change — the gains compound. By week four the difference was obvious to people around me, not just me.', product: 'Night Repair Cream · 30ml' },
    { name: 'Nisha J.',  date: '04/02/26', stars: 5, title: 'Calming on sensitive skin',        body: 'I have reactive skin and expected a sting. Nothing. Just a soft, smooth finish and visible reduction in redness after ten days.', product: 'Night Repair Cream · 30ml' },
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
      }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
        {dir === 'prev' ? <path d="M 9 2 L 4 7 L 9 12" /> : <path d="M 5 2 L 10 7 L 5 12" />}
      </svg>
    </button>
  );

  return (
    <section style={{ borderTop: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '80px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
          <div>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              § Correspondence
            </p>
            <h2 className="m-display" style={{ fontSize: 40, margin: '14px 0 0' }}>
              What people say about <em>Night Repair Cream</em>.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <p className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)', letterSpacing: '0.14em', margin: 0 }}>
              n = 412 &middot; avg 4.9 / 5
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
                    padding: '28px',
                    borderRight: i < perPage - 1 ? 'var(--rule-soft)' : 'none',
                    display: 'flex', flexDirection: 'column', minHeight: 300,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                      <p className="m-mono" style={{ fontSize: 11, margin: 0 }}>
                        {r.name} <span style={{ margin: '0 6px', color: 'var(--hairline)' }}>·</span>
                        <span style={{ color: 'var(--graphite)' }}>Verified</span>
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

Object.assign(window, { Breadcrumb, PDPMain, YouMightAlsoLike, ProductReviews });
