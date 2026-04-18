/* matter — shop / product listing (simplified) */

function ShopHero() {
  return null;
}

function FilterBar() {
  const [skinType, setSkinType] = React.useState('All');
  const [concern,  setConcern]  = React.useState(null);
  const [sort,     setSort]     = React.useState('Best match');

  const skinTypes = ['All','Dry','Oily','Combination','Sensitive'];
  const concerns  = ['Acne','Dullness','Aging','Pores','Redness'];
  const sorts     = ['Best match','Price ↑','Price ↓','New'];
  const [sortOpen, setSortOpen] = React.useState(false);

  return (
    <section style={{ borderBottom: 'var(--rule)', background: 'var(--paper)' }}>
      <div className="m-container" style={{
        padding: '20px 32px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 40, alignItems: 'center',
      }}>
        {/* skin type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)' }}>Skin type:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {skinTypes.map(o => {
              const active = skinType === o;
              return (
                <button key={o} onClick={() => setSkinType(o)}
                  className="m-mono"
                  style={{
                    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '6px 12px',
                    border: '1px solid var(--hairline)',
                    background: active ? 'var(--ink)' : 'transparent',
                    color:      active ? 'var(--paper)' : 'var(--ink-2)',
                  }}>{o}</button>
              );
            })}
          </div>
        </div>

        {/* concern */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'center' }}>
          <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)' }}>Concern:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {concerns.map(o => {
              const active = concern === o;
              return (
                <button key={o} onClick={() => setConcern(active ? null : o)}
                  className="m-mono"
                  style={{
                    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '6px 12px',
                    border: '1px solid var(--hairline)',
                    background: active ? 'var(--ink)' : 'transparent',
                    color:      active ? 'var(--paper)' : 'var(--ink-2)',
                  }}>{o}</button>
              );
            })}
          </div>
        </div>

        {/* sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)' }}>Sort:</span>
          <button onClick={() => setSortOpen(o => !o)} className="m-mono"
            style={{
              fontSize: 11, padding: '6px 12px',
              border: '1px solid var(--hairline)', background: 'var(--paper)',
              display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, justifyContent: 'space-between',
            }}>
            {sort}
            <span style={{ fontSize: 9 }}>▾</span>
          </button>
          {sortOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: 'var(--paper)', border: '1px solid var(--hairline)', minWidth: 140, zIndex: 20,
            }}>
              {sorts.map(s => (
                <button key={s} onClick={() => { setSort(s); setSortOpen(false); }}
                  className="m-mono"
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    fontSize: 11, padding: '8px 12px',
                    background: sort === s ? 'var(--paper-2)' : 'transparent',
                  }}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductTile({ name, klass, concerns, ml, price, variant }) {
  return (
    <a href="Product.html" style={{ display: 'block', textDecoration: 'none', position: 'relative' }}>
      <Placeholder label={`SPECIMEN · ${name.toUpperCase()}`} caption={`${klass.toLowerCase()} ${ml}ml`}
                   variant={variant} ratio="1 / 1" />
      <div style={{ padding: '16px 18px 18px', background: 'var(--paper)', border: '1px solid var(--hairline)', borderTop: 'none', position: 'relative' }}>
        <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
          {klass}
        </p>
        <h3 style={{ fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 15, margin: '6px 0 8px' }}>
          {name}
        </h3>
        <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
          {concerns.join(' · ')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
          <span className="m-num" style={{ fontSize: 15 }}>₹{price}</span>
          <button style={{
            width: 28, height: 28, background: 'var(--ink)', color: 'var(--paper)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, lineHeight: 1,
          }}>+</button>
        </div>
      </div>
    </a>
  );
}

function ProductGrid() {
  const items = [
    { name: 'Brightening Serum', klass: 'Serum',      concerns: ['Dullness','Acne','Pores'],     ml: '30',  price: '1,299', variant: 'mineral' },
    { name: 'Night Repair Cream',klass: 'Moisturizer',concerns: ['Aging','Dullness','Redness'],  ml: '50',  price: '2,499', variant: 'default' },
    { name: 'Pore Refining Toner',klass:'Toner',      concerns: ['Pores','Acne','Dullness'],     ml: '200', price: '899',   variant: 'mineral' },
    { name: 'Daily Defence SPF 50',klass:'SPF',       concerns: ['Aging','Dullness'],            ml: '30',  price: '1,299', variant: 'default' },
  ];
  return (
    <section style={{ background: 'var(--paper-2)' }}>
      <div className="m-container" style={{ padding: '56px 32px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 32 }}>
          <h1 className="m-display" style={{ fontSize: 44, margin: 0 }}>All products</h1>
          <span className="m-mono" style={{ color: 'var(--graphite)', fontSize: 12 }}>({items.length})</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {items.map(it => <ProductTile key={it.name} {...it} />)}
        </div>
      </div>
    </section>
  );
}

function QuizCTA() {
  return (
    <section id="skininsight" style={{ borderTop: 'var(--rule)', background: 'var(--paper)' }}>
      <div className="m-container" style={{ padding: '80px 32px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          alignItems: 'center', gap: 80, minHeight: 420,
        }}>
          {/* LEFT — skin concern heatmap */}
          <div style={{
            position: 'relative',
            aspectRatio: '4 / 3',
            background: 'var(--paper-2)',
            border: '1px solid var(--hairline)',
            padding: '32px 36px 40px',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* top-left label */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
                  Fig. 026 — Concern density map
                </p>
                <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--graphite)', margin: '4px 0 0' }}>
                  Subject 026 · 11 markers indexed
                </p>
              </div>
              <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--graphite)' }}>
                AI · ANALYSIS
              </span>
            </div>

            {/* grid plot */}
            <div style={{
              position: 'relative', flex: 1, marginTop: 20,
              border: '1px solid var(--hairline)',
              background: 'var(--paper)',
            }}>
              {/* vertical grid lines */}
              <svg viewBox="0 0 120 80" preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                {/* faint grid */}
                {Array.from({ length: 11 }, (_, i) => (
                  <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="80"
                    stroke="var(--hairline)" strokeWidth="0.15" opacity="0.5" />
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                  <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="120" y2={(i + 1) * 10}
                    stroke="var(--hairline)" strokeWidth="0.15" opacity="0.5" />
                ))}

                {/* heatmap clusters (soft ellipses) */}
                <ellipse cx="28" cy="28" rx="14" ry="9"  fill="var(--ink)" opacity="0.06" />
                <ellipse cx="28" cy="28" rx="8"  ry="5"  fill="var(--ink)" opacity="0.10" />
                <ellipse cx="75" cy="35" rx="10" ry="7"  fill="var(--ink)" opacity="0.06" />
                <ellipse cx="75" cy="35" rx="5"  ry="3"  fill="var(--ink)" opacity="0.10" />
                <ellipse cx="50" cy="56" rx="16" ry="8"  fill="var(--ink)" opacity="0.05" />
                <ellipse cx="50" cy="56" rx="9"  ry="4"  fill="var(--ink)" opacity="0.08" />
                <ellipse cx="92" cy="60" rx="9"  ry="6"  fill="var(--ink)" opacity="0.06" />
                <ellipse cx="92" cy="60" rx="4"  ry="2.5" fill="var(--ink)" opacity="0.10" />

                {/* connecting hairlines out to labels — drawn in absolute-positioned divs below for crisp 1px */}
              </svg>

              {/* plotted markers */}
              <Marker x="23%" y="35%" label="Pigmentation" value="High"   align="top-left"    />
              <Marker x="62%" y="44%" label="Pores"        value="Med"    align="top-right"   />
              <Marker x="42%" y="70%" label="Fine lines"   value="Low"    align="bottom-left" />
              <Marker x="77%" y="68%" label="Acne"         value="Med"    align="top-right"/>

              {/* axis labels inside plot */}
              <span style={{
                position: 'absolute', left: 10, top: 10,
                fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--graphite)', textTransform: 'uppercase',
              }}>T-zone</span>
              <span style={{
                position: 'absolute', right: 10, bottom: 6,
                fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--graphite)', textTransform: 'uppercase',
              }}>U-zone</span>
            </div>

            {/* footer metadata */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 16,
              fontFamily: 'var(--f-mono)', fontSize: 9,
              letterSpacing: '0.14em', color: 'var(--graphite)',
            }}>
              <span>SPECIMEN · SUBJECT 026</span>
              <span>CONFIDENCE — 96.4%</span>
            </div>
          </div>

          {/* RIGHT — copy + CTA */}
          <div>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              §  New
            </p>
            <h2 className="m-display" style={{ fontSize: 'clamp(44px, 5vw, 68px)', margin: '18px 0 0', lineHeight: 1 }}>
              Skin<em>Insights</em>.
            </h2>
            <p className="m-mono" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--graphite)', marginTop: 16 }}>
              Know your skin health, using AI
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 460, marginTop: 28 }}>
              Scan your face in 30 seconds. Our clinical-grade model identifies
              pigmentation, pores, acne, and early signs of aging — then
              prescribes a routine from our formulary.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 24px', background: 'var(--ink)', color: 'var(--paper)',
                fontFamily: 'var(--f-mono)', fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                Try now <span>→</span>
              </a>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--graphite)' }}>
                Free · No signup
              </span>
            </div>

            {/* small trust-data strip */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              marginTop: 40, borderTop: 'var(--rule)', borderBottom: 'var(--rule)',
            }}>
              {[
                ['Accuracy', '96.4%'],
                ['Trial n', '4,812'],
                ['Markers', '11 indexed'],
              ].map(([k, v], i) => (
                <div key={k} style={{ padding: '14px 16px', borderRight: i < 2 ? 'var(--rule-soft)' : 'none' }}>
                  <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>{k}</p>
                  <p className="m-num" style={{ fontSize: 14, margin: '4px 0 0' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Marker — plotted dot + label pill on the heatmap
function Marker({ x, y, label, value, align = 'top-right' }) {
  const isBottom = align.startsWith('bottom');
  const isRight  = align.endsWith('right');
  return (
    <div style={{
      position: 'absolute', top: y, left: x,
      transform: 'translate(-50%, -50%)',
    }}>
      {/* dot */}
      <span style={{
        display: 'block', width: 8, height: 8, borderRadius: '50%',
        background: 'var(--ink)',
        boxShadow: '0 0 0 3px var(--paper)',
      }} />
      {/* crosshair ticks */}
      <span style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 1, background: 'var(--ink)', transform: 'translate(-50%, -50%)', opacity: 0.25 }}/>
      <span style={{ position: 'absolute', left: '50%', top: '50%', width: 1, height: 18, background: 'var(--ink)', transform: 'translate(-50%, -50%)', opacity: 0.25 }}/>
      {/* label pill */}
      <div style={{
        position: 'absolute',
        top:  isBottom ? '18px' : 'auto',
        bottom: isBottom ? 'auto' : '18px',
        left:  isRight ? '14px' : 'auto',
        right: isRight ? 'auto' : '14px',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
        padding: '4px 8px',
        background: 'var(--paper)', border: '1px solid var(--ink)',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ color: 'var(--ink)' }}>{label}</span>
        <span style={{ width: 1, height: 10, background: 'var(--hairline)' }}/>
        <span style={{ color: 'var(--graphite)', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 9 }}>{value}</span>
      </div>
    </div>
  );
}

// Annotation pin — dot on face, line out to label at edge
function Annotation({ label, dotTop, dotLeft, lineTo, align = 'left' }) {
  // compute line path
  const x1 = dotLeft;
  const y1 = dotTop;
  const x2 = lineTo.left || `calc(100% - ${lineTo.right})`;
  const y2 = lineTo.top;

  return (
    <>
      {/* SVG line */}
      <svg style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'visible',
      }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--ink)" strokeWidth="0.75" />
      </svg>

      {/* dot on face */}
      <span style={{
        position: 'absolute', top: dotTop, left: dotLeft,
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--ink)', transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 0 2px var(--paper-2)',
      }} />

      {/* label at edge */}
      <span style={{
        position: 'absolute',
        top: `calc(${lineTo.top} - 7px)`,
        left:  lineTo.left  ? `calc(${lineTo.left} - 8px)`  : 'auto',
        right: lineTo.right ? `calc(${lineTo.right} - 8px)` : 'auto',
        transform: align === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
        fontFamily: 'var(--f-body)', fontSize: 12, color: 'var(--ink)',
        whiteSpace: 'nowrap', paddingBottom: 2,
        borderBottom: '1px solid var(--ink)',
      }}>
        {label}
      </span>
    </>
  );
}

function AssayTable() { return null; }

Object.assign(window, { ShopHero, FilterBar, ProductGrid, AssayTable, QuizCTA });
