/* matter — ingredients molecular focus (hero per ingredient) */

function MolecularFocus({ rows, onSelect }) {
  if (!rows || rows.length === 0) {
    return (
      <section style={{ borderBottom: 'var(--rule)' }}>
        <div className="m-container" style={{ padding: '120px 32px', textAlign: 'center' }}>
          <p className="m-mono" style={{ color: 'var(--graphite)', letterSpacing: '0.14em' }}>
            — No entries match. Adjust your filters.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section style={{ borderBottom: 'var(--rule)' }}>
      {rows.map((r, i) => (
        <FocusEntry key={r.n} r={r} idx={i} total={rows.length} onSelect={onSelect} />
      ))}
    </section>
  );
}

function FocusEntry({ r, idx, total, onSelect }) {
  // alternate layout every other row
  const flip = idx % 2 === 1;
  const bg   = idx % 2 === 1 ? 'var(--paper-2)' : 'var(--paper)';

  return (
    <div style={{ borderBottom: idx < total - 1 ? 'var(--rule)' : 'none', background: bg }}>
      <div className="m-container" style={{ padding: '120px 32px' }}>
        {/* top meta strip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          paddingBottom: 20, borderBottom: 'var(--rule)', marginBottom: 56,
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)',
        }}>
          <span>Entry · {r.n} / {String(total).padStart(2, '0')}</span>
          <span>{r.class} · {r.fn}</span>
          <span>{r.origin}</span>
        </div>

        {/* main two-column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: flip ? '1fr 1fr' : '1fr 1fr',
          gap: 80, alignItems: 'start',
          direction: flip ? 'rtl' : 'ltr',
        }}>
          {/* LEFT — molecule card */}
          <div style={{ direction: 'ltr', position: 'relative' }}>
            <MoleculeVisual r={r} />
          </div>

          {/* RIGHT — copy */}
          <div style={{ direction: 'ltr' }}>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              § {r.class} · {r.n}
            </p>

            <h2 className="m-display" style={{ fontSize: 'clamp(56px, 6.4vw, 96px)', margin: '18px 0 0', lineHeight: 0.95 }}>
              {r.name}<span style={{ color: 'var(--graphite)', fontSize: '0.45em', marginLeft: 14, verticalAlign: 'middle' }}>({r.sym})</span>
            </h2>

            <p className="m-mono" style={{ fontSize: 12, color: 'var(--graphite)', marginTop: 14, letterSpacing: '0.04em' }}>
              {r.formula} · {r.mw} g/mol
            </p>

            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', marginTop: 32, maxWidth: 520 }}>
              {r.blurb}
            </p>

            {/* data rail */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              marginTop: 40, borderTop: 'var(--rule)',
            }}>
              {[
                ['Typical use', r.conc],
                ['pH',          r.pH],
                ['MW (Da)',     r.mw],
                ['Class',       r.class],
              ].map(([k, v], i) => (
                <div key={k} style={{
                  padding: '16px 14px 0 0',
                  borderRight: i < 3 ? 'var(--rule-soft)' : 'none',
                }}>
                  <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>{k}</p>
                  <p className="m-num"  style={{ fontSize: 18, margin: '6px 0 0' }}>{v}</p>
                </div>
              ))}
            </div>

            {/* tolerance meter */}
            <div style={{ marginTop: 36 }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 12px' }}>
                Skin-type tolerance
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid var(--hairline)' }}>
                {[
                  ['Dry',  r.tol.dry ],
                  ['Oily', r.tol.oily],
                  ['Combo',r.tol.comb],
                  ['Sens.',r.tol.sens],
                  ['React.',r.tol.reac],
                ].map(([label, mark], i) => (
                  <div key={label} style={{
                    padding: '14px 8px', textAlign: 'center',
                    borderRight: i < 4 ? 'var(--rule-soft)' : 'none',
                  }}>
                    <p className="m-display" style={{ fontSize: 22, margin: 0, color: mark === '○' ? 'var(--oxblood)' : 'var(--ink)' }}>{mark}</p>
                    <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '6px 0 0' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* evidence + CTA */}
            <div style={{
              marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 20, borderTop: 'var(--rule)',
            }}>
              <div>
                <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>Evidence</p>
                <p className="m-mono" style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-2)' }}>{r.evidence}</p>
              </div>
              <button onClick={() => onSelect && onSelect(r)} className="m-mono" style={{
                padding: '12px 22px', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                background: 'var(--ink)', color: 'var(--paper)',
              }}>
                Full entry →
              </button>
            </div>

            {/* appears in */}
            <div style={{ marginTop: 24 }}>
              <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 10px' }}>
                Appears in
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.used.map(u => (
                  <a key={u} href="Product.html" className="m-mono" style={{
                    padding: '7px 12px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                    border: '1px solid var(--hairline)', color: 'var(--ink)',
                  }}>{u} →</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Large molecule visual card (big symbol + formula + crosshair + concentric rings)
function MoleculeVisual({ r }) {
  return (
    <div style={{
      aspectRatio: '1 / 1',
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* faint grid */}
      <svg viewBox="0 0 120 120" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="120"
            stroke="var(--hairline)" strokeWidth="0.15" opacity="0.4" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="120" y2={(i + 1) * 10}
            stroke="var(--hairline)" strokeWidth="0.15" opacity="0.4" />
        ))}

        {/* concentric diffusion rings */}
        <circle cx="60" cy="60" r="36" fill="none" stroke="var(--ink)" strokeWidth="0.25" opacity="0.25" />
        <circle cx="60" cy="60" r="28" fill="none" stroke="var(--ink)" strokeWidth="0.25" opacity="0.35" />
        <circle cx="60" cy="60" r="20" fill="none" stroke="var(--ink)" strokeWidth="0.3"  opacity="0.5"  />
        <circle cx="60" cy="60" r="12" fill="var(--ink)" opacity="0.06" />

        {/* crosshair */}
        <line x1="60" y1="4"  x2="60" y2="116" stroke="var(--hairline)" strokeWidth="0.3" />
        <line x1="4"  y1="60" x2="116" y2="60" stroke="var(--hairline)" strokeWidth="0.3" />
      </svg>

      {/* corner labels */}
      <div style={{
        position: 'absolute', top: 18, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)', textTransform: 'uppercase',
      }}>
        <span>Fig. {r.n} · molecule</span>
        <span>{r.formula}</span>
      </div>

      {/* big symbol */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <p className="m-display" style={{ fontSize: 'clamp(120px, 16vw, 200px)', margin: 0, lineHeight: 0.9, letterSpacing: '-0.04em' }}>
          {r.sym}
        </p>
        <p style={{ fontSize: 14, marginTop: 8, color: 'var(--graphite)' }}>{r.name}</p>
      </div>

      {/* bottom corner */}
      <div style={{
        position: 'absolute', bottom: 18, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)', textTransform: 'uppercase',
      }}>
        <span>MW {r.mw}</span>
        <span style={{ color: 'var(--assay-ink)' }}>● {r.conc}</span>
      </div>
    </div>
  );
}

Object.assign(window, { MolecularFocus });
