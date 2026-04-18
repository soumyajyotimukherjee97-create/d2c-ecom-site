/* matter — ingredients page
   Index backbone + Periodic Table toggle + detail drawer */

const INGREDIENTS = [
  // ACTIVES
  { sym: 'NIA', n: '01', name: 'Niacinamide',            class: 'Active',      fn: 'Barrier · Sebum',      formula: 'C₆H₆N₂O',   mw: 122.12, conc: '4.0%',   pH: '5.5', size: 'S',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Synthesised · pharmaceutical grade · EU',  used: ['The Corrective', 'The Morning'],
    blurb: "Reduces pore visibility, regulates sebum, and strengthens barrier lipid synthesis. Tolerated by virtually every skin type.",
    evidence: 'MT-CT-0026 · n=104 · 56 days' },
  { sym: 'RET', n: '02', name: 'Retinaldehyde',          class: 'Active',      fn: 'Renewal',              formula: 'C₂₀H₂₈O',   mw: 284.44, conc: '0.05%',  pH: '5.5', size: 'M',
    tol: { dry: '◐', oily: '●', comb: '●', sens: '◐', reac: '○' },
    origin: 'Encapsulated synthesis · Switzerland',  used: ['Night Repair'],
    blurb: "Converts to retinoic acid in one step — 11× faster than retinol. Prescription-adjacent results, a fraction of the irritation.",
    evidence: 'MT-CT-0019 · n=82 · 12 weeks' },
  { sym: 'MAN', n: '03', name: 'Mandelic Acid',          class: 'Exfoliant',   fn: 'Resurfacing',          formula: 'C₈H₈O₃',    mw: 152.15, conc: '8.0%',   pH: '3.6', size: 'L',
    tol: { dry: '●', oily: '●', comb: '●', sens: '◐', reac: '◐' },
    origin: 'Bitter almond derivative · France',    used: ['The Clarifier'],
    blurb: "The largest AHA. Penetrates slowly and evenly, exfoliating without the sting. Ideal for pigmented and reactive skin.",
    evidence: 'MT-CT-0011 · n=60 · 28 days' },
  { sym: 'BAK', n: '04', name: 'Bakuchiol',              class: 'Active',      fn: 'Renewal',              formula: 'C₁₈H₂₄O',   mw: 256.38, conc: '1.0%',   pH: '5.5', size: 'M',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Psoralea corylifolia · India',          used: ['The Dusk'],
    blurb: "Plant retinol alternative. Up-regulates the same gene pathway without photosensitivity. Safe through pregnancy.",
    evidence: 'MT-CT-0022 · n=48 · 12 weeks' },
  { sym: 'SAL', n: '05', name: 'Salicylic Acid',         class: 'Exfoliant',   fn: 'Pore clearance',       formula: 'C₇H₆O₃',    mw: 138.12, conc: '2.0%',   pH: '3.4', size: 'S',
    tol: { dry: '◐', oily: '●', comb: '●', sens: '○', reac: '○' },
    origin: 'Willow bark derivative · Germany',      used: ['The Clarifier'],
    blurb: "Oil-soluble BHA. Penetrates sebum-filled pores to dissolve keratinocyte plugs. Best for oily, breakout-prone skin.",
    evidence: 'Published monograph · FDA 2021' },
  { sym: 'AZE', n: '06', name: 'Azelaic Acid',           class: 'Active',      fn: 'Redness · Pigment',    formula: 'C₉H₁₆O₄',   mw: 188.22, conc: '10%',    pH: '4.5', size: 'S',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Fermented grain · Sweden',              used: ['The Calm'],
    blurb: "Multitasking dicarboxylic acid. Reduces post-inflammatory pigment, calms redness, and inhibits C. acnes. Rosacea-friendly.",
    evidence: 'MT-CT-0031 · n=74 · 8 weeks' },

  // HUMECTANTS / HYDRATION
  { sym: 'HYA', n: '07', name: 'Hyaluronic Acid',        class: 'Humectant',   fn: 'Hydration',            formula: '(C₁₄H₂₁NO₁₁)ₙ', mw: 1000, conc: '1.0%', pH: '6.0', size: 'XL',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Bio-fermented · South Korea',           used: ['The Reservoir', 'The Veil'],
    blurb: "Low + high molecular weight blend. Surface hydration and deep dermal plumping. Universal tolerance.",
    evidence: 'Clinical consensus · 40+ years' },
  { sym: 'GLY', n: '08', name: 'Glycerin',               class: 'Humectant',   fn: 'Hydration',            formula: 'C₃H₈O₃',    mw: 92.09,  conc: '5.0%',   pH: '—',   size: 'S',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Vegetable · palm-free · Germany',       used: ['The Reservoir', 'The Morning', 'The Veil'],
    blurb: "The gold-standard humectant. Draws water from the environment and binds it to the stratum corneum.",
    evidence: 'Published monograph' },
  { sym: 'PAN', n: '09', name: 'Panthenol',              class: 'Humectant',   fn: 'Soothing',             formula: 'C₉H₁₉NO₄',  mw: 205.25, conc: '2.0%',   pH: '5.5', size: 'S',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Pro-vitamin B5 · synthesised · FR',     used: ['The Corrective', 'The Calm'],
    blurb: "Converts to pantothenic acid in the skin. Barrier-calming and mildly hydrating. Soothes post-actives.",
    evidence: 'Published monograph' },

  // EMOLLIENTS
  { sym: 'CER', n: '10', name: 'Ceramide NP',            class: 'Emollient',   fn: 'Barrier',              formula: 'C₄₂H₈₃NO₄', mw: 666.12, conc: '1.0%',   pH: '—',   size: 'L',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Bio-identical · Japan',                 used: ['Night Repair', 'The Veil'],
    blurb: "Replaces the lipids lost through cleansing and ageing. Restores watertight seal of the stratum corneum.",
    evidence: 'MT-CT-0018 · TEWL measured' },
  { sym: 'SQU', n: '11', name: 'Squalane',               class: 'Emollient',   fn: 'Barrier',              formula: 'C₃₀H₆₂',    mw: 422.81, conc: 'q.s.',   pH: '—',   size: 'L',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Olive-derived · Spain',                 used: ['The Veil', 'The Dusk'],
    blurb: "Saturated lipid mimicking skin's natural sebum composition. Non-comedogenic, even on oily skin.",
    evidence: 'Published monograph' },
  { sym: 'PMT', n: '12', name: 'Palmitoyl Tripeptide-1', class: 'Peptide',     fn: 'Collagen signalling',  formula: 'C₃₀H₅₇N₅O₅', mw: 567.82, conc: '0.5%',   pH: '5.5', size: 'M',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Synthesised · Switzerland',             used: ['Night Repair'],
    blurb: "Signal peptide that prompts fibroblasts to upregulate collagen I and III. Measurable firmness gains at 12 weeks.",
    evidence: 'MT-CT-0024 · n=38' },

  // ANTIOXIDANTS
  { sym: 'VTC', n: '13', name: 'L-Ascorbic Acid',        class: 'Antioxidant', fn: 'Pigment · Radiance',   formula: 'C₆H₈O₆',    mw: 176.12, conc: '15%',    pH: '3.2', size: 'S',
    tol: { dry: '●', oily: '●', comb: '●', sens: '◐', reac: '○' },
    origin: 'Corn-derived · Scotland',               used: ['The Morning'],
    blurb: "The only form of vitamin C with full published evidence. Stabilised at pH 3.2 for bio-availability.",
    evidence: 'Pinnell 2001 · MT-CT-0009' },
  { sym: 'VTE', n: '14', name: 'Tocopherol',             class: 'Antioxidant', fn: 'Lipid defense',        formula: 'C₂₉H₅₀O₂',  mw: 430.71, conc: '1.0%',   pH: '—',   size: 'M',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Non-GMO soy · Italy',                   used: ['The Morning', 'The Dusk'],
    blurb: "Lipid-soluble vitamin E. Synergises with L-ascorbic acid for 4× photoprotective potency.",
    evidence: 'Published monograph' },
  { sym: 'FER', n: '15', name: 'Ferulic Acid',           class: 'Antioxidant', fn: 'Stabiliser',           formula: 'C₁₀H₁₀O₄',  mw: 194.18, conc: '0.5%',   pH: '4.0', size: 'S',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Rice bran · Japan',                     used: ['The Morning'],
    blurb: "Stabilises L-ascorbic acid and doubles its photoprotection. Essential companion to vitamin C.",
    evidence: 'Lin 2005' },

  // BOTANICAL
  { sym: 'CEN', n: '16', name: 'Madecassoside',          class: 'Botanical',   fn: 'Anti-inflammatory',    formula: 'C₄₈H₇₈O₂₀', mw: 975.12, conc: '0.1%',   pH: '—',   size: 'XL',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Centella asiatica · Madagascar',        used: ['The Corrective', 'The Calm'],
    blurb: "Isolated triterpene from centella. Reduces post-procedural inflammation and accelerates barrier repair.",
    evidence: 'MT-CT-0027 · n=44' },
  { sym: 'GLU', n: '17', name: 'β-Glucan',               class: 'Botanical',   fn: 'Soothing',             formula: '(C₆H₁₀O₅)ₙ', mw: 6000, conc: '0.5%',  pH: '—',   size: 'XL',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Oat-derived · Finland',                 used: ['The Calm'],
    blurb: "High molecular weight polysaccharide. Forms a moisture-binding film that calms reactive skin.",
    evidence: 'Published monograph' },
];

const CLASSES = ['All', 'Active', 'Exfoliant', 'Humectant', 'Emollient', 'Peptide', 'Antioxidant', 'Botanical'];
const CONCERNS = {
  'All':          null,
  'Dry':          r => r.tol.dry  !== '○',
  'Oily':         r => r.tol.oily !== '○',
  'Sensitive':    r => r.tol.sens !== '○',
  'Reactive':     r => r.tol.reac !== '○',
};

// ══ HERO ═══════════════════════════════════════════════════════════
function IngredientsHero() {
  return (
    <section style={{ borderBottom: 'var(--rule)', background: 'var(--paper-2)' }}>
      <div className="m-container" style={{ padding: '80px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end' }}>
          <div>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              § The Formulary Index
            </p>
            <h1 className="m-display" style={{ fontSize: 'clamp(64px, 7vw, 112px)', margin: '18px 0 0', lineHeight: 0.95 }}>
              Every <em>molecule</em>,<br/>indexed.
            </h1>
          </div>
          <div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0, maxWidth: 480 }}>
              The full catalogue of actives, humectants, emollients and
              botanicals that appear across the matter formulary — written as
              short essays, with history, mechanism and provenance for each.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 40, borderTop: 'var(--rule)' }}>
              {[
                ['Chapters',   INGREDIENTS.length],
                ['Read time',  `${INGREDIENTS.length * 4} min`],
                ['Updated',    'Apr 2026'],
              ].map(([k, v], i) => (
                <div key={k} style={{ padding: '14px 12px', borderRight: i < 2 ? 'var(--rule-soft)' : 'none' }}>
                  <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>{k}</p>
                  <p className="m-num" style={{ fontSize: 18, margin: '4px 0 0' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ DETAIL DRAWER ══════════════════════════════════════════════════
function DetailDrawer({ ing, onClose }) {
  if (!ing) return null;
  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(18,18,16,0.45)',
        zIndex: 90,
      }}/>
      {/* panel */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(620px, 92vw)', background: 'var(--paper)',
        zIndex: 91, overflowY: 'auto', borderLeft: 'var(--rule)',
      }}>
        {/* header */}
        <div style={{ padding: '28px 40px', borderBottom: 'var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              Entry · {ing.n} · {ing.class}
            </p>
            <h2 className="m-display" style={{ fontSize: 44, margin: '10px 0 0', lineHeight: 1 }}>{ing.name}</h2>
            <p className="m-mono" style={{ marginTop: 8, color: 'var(--graphite)', fontSize: 11 }}>
              {ing.formula} · {ing.mw} g/mol
            </p>
          </div>
          <button onClick={onClose} className="m-mono" style={{
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            padding: '8px 12px', border: '1px solid var(--ink)',
          }}>Close ×</button>
        </div>

        {/* big symbol card */}
        <div style={{ padding: '32px 40px', borderBottom: 'var(--rule)' }}>
          <div style={{
            aspectRatio: '1.4 / 1', background: 'var(--paper-2)',
            border: '1px solid var(--hairline)', padding: 24,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)' }}>{ing.n}</span>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)' }}>{ing.conc}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="m-display" style={{ fontSize: 92, margin: 0, lineHeight: 1 }}>{ing.sym}</p>
              <p style={{ fontSize: 14, marginTop: 8, color: 'var(--ink-2)' }}>{ing.name}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)' }}>{ing.mw} Da</span>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--graphite)' }}>pH {ing.pH}</span>
            </div>
          </div>
        </div>

        {/* blurb */}
        <div style={{ padding: '32px 40px', borderBottom: 'var(--rule)' }}>
          <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>Function</p>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', marginTop: 10 }}>{ing.blurb}</p>
        </div>

        {/* tolerance matrix */}
        <div style={{ padding: '32px 40px', borderBottom: 'var(--rule)' }}>
          <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>Skin-type tolerance</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginTop: 16, border: '1px solid var(--hairline)' }}>
            {[
              ['Dry',       ing.tol.dry ],
              ['Oily',      ing.tol.oily],
              ['Combo',     ing.tol.comb],
              ['Sensitive', ing.tol.sens],
              ['Reactive',  ing.tol.reac],
            ].map(([label, mark], i) => (
              <div key={label} style={{
                padding: '16px 10px', textAlign: 'center',
                borderRight: i < 4 ? 'var(--rule-soft)' : 'none',
              }}>
                <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>{label}</p>
                <p className="m-display" style={{ fontSize: 22, margin: '6px 0 0', color: mark === '○' ? 'var(--oxblood)' : 'var(--ink)' }}>{mark}</p>
              </div>
            ))}
          </div>
          <p className="m-mono" style={{ fontSize: 10, color: 'var(--graphite)', marginTop: 12, letterSpacing: '0.08em' }}>
            ● Well tolerated &nbsp; ◐ With caution &nbsp; ○ Avoid
          </p>
        </div>

        {/* meta */}
        <div style={{ padding: '32px 40px', borderBottom: 'var(--rule)' }}>
          {[
            ['Origin',       ing.origin],
            ['Typical use',  ing.conc],
            ['pH',           ing.pH],
            ['Evidence',     ing.evidence],
          ].map(([k, v], i) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < 3 ? 'var(--rule-soft)' : 'none',
            }}>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)' }}>{k}</span>
              <span style={{ fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* used in */}
        <div style={{ padding: '32px 40px 48px' }}>
          <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 14px' }}>Appears in</p>
          {ing.used.map(u => (
            <a key={u} href="Product.html" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', marginBottom: 8,
              border: '1px solid var(--hairline)',
            }}>
              <span style={{ fontSize: 14 }}>{u}</span>
              <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--graphite)', textTransform: 'uppercase' }}>View →</span>
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}

// ══ PHILOSOPHY STRIP ═══════════════════════════════════════════════
function Philosophy() {
  return (
    <section style={{ borderBottom: 'var(--rule)' }}>
      <div className="m-container" style={{ padding: '64px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {[
            ['01 Disclosure', 'Every ingredient published with exact concentration. No proprietary blends, no "active complex" hand-waving.'],
            ['02 Restraint',  'If a molecule lacks trial evidence or measurable benefit, we do not use it. Short ingredient lists, by design.'],
            ['03 Provenance', 'Origin, supplier class and extraction method documented for each lot. Available on request for professionals.'],
          ].map(([h, b]) => (
            <div key={h} style={{ borderTop: 'var(--rule)', paddingTop: 20 }}>
              <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>{h}</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', marginTop: 12 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { IngredientsHero, DetailDrawer, Philosophy, INGREDIENTS, CLASSES, CONCERNS });
