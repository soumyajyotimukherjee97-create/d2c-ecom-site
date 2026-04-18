/* matter — ingredients page (Essay view only) */

function IngredientsPage() {
  return (
    <>
      <IngredientsHero />

      <IngredientsEssay rows={INGREDIENTS} />

      <Philosophy />
    </>
  );
}

// ══ INDEX TABLE ════════════════════════════════════════════════════
function IndexTable({ rows, onSelect }) {
  return (
    <section style={{ borderBottom: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '32px 32px 80px' }}>
        {/* header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 80px 80px 80px 100px',
          padding: '14px 0', borderBottom: 'var(--rule)',
          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)',
        }}>
          <span>№</span>
          <span>Ingredient</span>
          <span>Class · Function</span>
          <span>Formula</span>
          <span>MW</span>
          <span>Conc.</span>
          <span>pH</span>
          <span style={{ textAlign: 'right' }}>Tolerance</span>
        </div>

        {rows.map(r => (
          <button key={r.n} onClick={() => onSelect(r)} style={{
            display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 80px 80px 80px 100px',
            width: '100%', alignItems: 'baseline',
            padding: '18px 0', borderBottom: 'var(--rule-soft)',
            textAlign: 'left', cursor: 'pointer',
          }}>
            <span className="m-mono" style={{ fontSize: 11, color: 'var(--graphite)' }}>{r.n}</span>
            <span>
              <span className="m-display" style={{ fontSize: 22 }}>{r.name}</span>
              <span className="m-mono" style={{ marginLeft: 10, fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)' }}>{r.sym}</span>
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', marginRight: 8 }}>{r.class}</span>
              {r.fn}
            </span>
            <span className="m-mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r.formula}</span>
            <span className="m-num"  style={{ fontSize: 12 }}>{r.mw}</span>
            <span className="m-num"  style={{ fontSize: 12, color: 'var(--assay-ink)' }}>{r.conc}</span>
            <span className="m-num"  style={{ fontSize: 12 }}>{r.pH}</span>
            <span className="m-mono" style={{ fontSize: 14, textAlign: 'right', letterSpacing: '0.08em' }}>
              {r.tol.dry}{r.tol.oily}{r.tol.comb}{r.tol.sens}{r.tol.reac}
            </span>
          </button>
        ))}

        {rows.length === 0 && (
          <p className="m-mono" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--graphite)', letterSpacing: '0.14em' }}>
            — No entries match. Adjust your filters.
          </p>
        )}

        <div style={{
          marginTop: 24, display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--graphite)', textTransform: 'uppercase',
        }}>
          <span>{rows.length} of {INGREDIENTS.length} entries</span>
          <span>● Well tolerated · ◐ Caution · ○ Avoid</span>
        </div>
      </div>
    </section>
  );
}

// ══ PERIODIC TABLE VIEW ════════════════════════════════════════════
function PeriodicTable({ rows, onSelect }) {
  // group by class
  const groups = {};
  rows.forEach(r => { (groups[r.class] = groups[r.class] || []).push(r); });
  const order = ['Active', 'Exfoliant', 'Humectant', 'Emollient', 'Peptide', 'Antioxidant', 'Botanical'];

  return (
    <section style={{ borderBottom: 'var(--rule)', background: 'var(--paper-2)' }}>
      <div className="m-container" style={{ padding: '48px 32px 80px' }}>
        {order.filter(c => groups[c] && groups[c].length).map(cls => (
          <div key={cls} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, borderBottom: 'var(--rule)', paddingBottom: 12 }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
                § {cls}
              </p>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--graphite)', margin: 0 }}>
                {groups[cls].length} {groups[cls].length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {groups[cls].map(r => <ElementCard key={r.n} r={r} onClick={() => onSelect(r)} />)}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="m-mono" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--graphite)', letterSpacing: '0.14em' }}>
            — No entries match. Adjust your filters.
          </p>
        )}
      </div>
    </section>
  );
}

function ElementCard({ r, onClick }) {
  return (
    <button onClick={onClick} style={{
      aspectRatio: '1 / 1',
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      padding: 14, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      textAlign: 'left', transition: 'border-color .15s, background .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--graphite)' }}>{r.n}</span>
        <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--assay-ink)' }}>{r.conc}</span>
      </div>
      <div>
        <p className="m-display" style={{ fontSize: 36, margin: 0, lineHeight: 1 }}>{r.sym}</p>
        <p style={{ fontSize: 12, margin: '6px 0 0', color: 'var(--ink-2)' }}>{r.name}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--graphite)' }}>{r.mw}</span>
        <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--graphite)' }}>{r.fn}</span>
      </div>
    </button>
  );
}

Object.assign(window, { IngredientsPage, IndexTable, PeriodicTable, ElementCard });
