/* matter — ingredients "Essay" view
   Long-form editorial narrative + hard science sidecar */

const ESSAYS = {
  // keyed by ingredient symbol
  NIA: {
    story: [
      "Niacinamide began as a footnote in pellagra research. In 1937, when Conrad Elvehjem identified vitamin B3 as the factor missing from the diets of corn-fed populations, no one imagined the molecule would, ninety years later, sit at the centre of the most-studied topical ingredient in skincare.",
      "Its promotion to household name took longer than it should have. For decades it lived quietly in pharmacy creams marketed for dark spots — a workhorse, never the story. The turn came when dermatologists began measuring what users had been claiming: that 2% niacinamide, applied twice daily, visibly normalised skin. Sebum levels equilibrated. Pigment clusters dispersed. The barrier held water it had been losing.",
      "What makes niacinamide remarkable is not any single action, but the breadth. Ceramide synthesis, melanosome transfer inhibition, sebaceous regulation — three distinct mechanisms running in parallel, in a single cosmetic-grade molecule. There is no equivalent.",
    ],
    aside: "A common myth — that high percentages of niacinamide are better. Trials show efficacy plateaus between 2–5%. Beyond this, risk of flushing rises with no measurable benefit.",
  },
  RET: {
    story: [
      "Retinaldehyde is the middle chapter of a three-part story. Retinol, the ingredient that built modern skincare, must pass through two enzymatic conversions before it becomes retinoic acid — the molecule that actually instructs skin cells to behave younger. Retinaldehyde skips the first step.",
      "This is not a small difference. The missing conversion saves time, reduces irritation, and allows vastly lower concentrations to achieve the same result. In the Didier Saint-Léger trials at L'Oréal in the 1990s, 0.05% retinaldehyde demonstrated efficacy comparable to 1% retinol on both photoageing and acne — at one-twentieth the dose.",
      "We encapsulate ours. The aldehyde group is fragile in light and oxygen; left unprotected, it degrades on the shelf. Microencapsulation holds the molecule in a lipid shell that opens only on skin contact. The shelf life doubles. The activity intensifies.",
    ],
    aside: "Retinaldehyde is not interchangeable with retinol. They behave differently on sensitive skin, layer differently, and require different introduction schedules. Begin every third night.",
  },
  HYA: {
    story: [
      "Hyaluronic acid is not a product of modern chemistry. It was isolated from bovine vitreous humour in 1934 by Karl Meyer and John Palmer at Columbia — an accident during research on eye surgery. For fifty years, it remained an obscure orthopaedic material, injected into arthritic joints.",
      "The cosmetic turn came with two engineering breakthroughs. First, microbial fermentation replaced the animal sourcing — bacteria could now be coaxed into producing hyaluronic acid at pharmaceutical scales. Second, molecular-weight fractionation allowed formulators to choose the behaviour of the molecule. High-weight chains sit on the surface and seal. Low-weight chains, cut to under 50 kilodaltons, penetrate the stratum corneum.",
      "A good hyaluronic serum is a conversation across scales. Our blend combines three weight classes: 1500 kDa for surface film, 500 kDa for mid-dermal plumping, and 50 kDa for deep hydration. The hand feel is silk; the effect is measurable.",
    ],
    aside: "Hyaluronic acid needs water to bind to. In dry climates, apply to damp skin and seal with an occlusive — otherwise it can pull moisture from deeper layers and leave skin feeling tighter.",
  },
  default: {
    story: [
      "Every ingredient has a history before it arrives in a bottle. Most are isolated from plants, fermented by microorganisms, or synthesised from petroleum or plant feedstocks. The industry rarely discusses this. We do.",
      "What appears on the INCI list is the final molecule, but the story begins upstream — at the field, the bioreactor, the laboratory. Provenance shapes efficacy as much as concentration does. Two lots of the same ingredient, sourced differently, can behave differently on skin.",
      "We document supplier class, extraction method and geographic origin for every active we use. The information is available to professionals on request. For the curious, the summary appears on every product page.",
    ],
    aside: "If a brand cannot tell you where an ingredient came from and how it was made, they are either withholding information or do not know. Both are disqualifying.",
  },
};

function IngredientsEssay({ rows, onSelect }) {
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

  // persist current chapter via URL hash (e.g. #essay/NIA) + localStorage
  const hashSym = () => {
    const m = window.location.hash.match(/^#essay\/([A-Z]{2,3})$/i);
    return m ? m[1].toUpperCase() : null;
  };
  const initial = (() => {
    const h = hashSym();
    if (h && rows.find(r => r.sym === h)) return h;
    const ls = localStorage.getItem('mt_essay_sym');
    if (ls && rows.find(r => r.sym === ls)) return ls;
    return rows[0].sym;
  })();

  const [sym, setSym] = React.useState(initial);

  // if filtered rows change and current sym is no longer visible, fall back
  React.useEffect(() => {
    if (!rows.find(r => r.sym === sym)) setSym(rows[0].sym);
  }, [rows.map(r => r.sym).join(',')]);

  // sync hash + localStorage + respond to back/forward
  React.useEffect(() => {
    const h = `#essay/${sym}`;
    if (window.location.hash !== h) history.replaceState(null, '', h);
    localStorage.setItem('mt_essay_sym', sym);
  }, [sym]);

  React.useEffect(() => {
    const onHash = () => { const h = hashSym(); if (h && rows.find(r => r.sym === h)) setSym(h); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [rows]);

  const idx = rows.findIndex(r => r.sym === sym);
  const current = rows[idx];
  const total = rows.length;
  const prev = () => setSym(rows[(idx - 1 + total) % total].sym);
  const next = () => setSym(rows[(idx + 1) % total].sym);

  return (
    <section style={{ borderBottom: 'var(--rule)' }}>
      {/* CHAPTER RAIL */}
      <ChapterRail rows={rows} sym={sym} setSym={setSym} />


      {/* CURRENT CHAPTER */}
      {current && (
        <EssayEntry key={current.sym} r={current} idx={idx} total={total} onSelect={onSelect} />
      )}

      {/* PREV / NEXT */}
      {current && (
        <div style={{ borderTop: 'var(--rule)', background: 'var(--paper)' }}>
          <div className="m-container" style={{ padding: '40px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <ChapterLink
                dir="prev" onClick={prev}
                num={rows[(idx - 1 + total) % total].n}
                title={rows[(idx - 1 + total) % total].name}
                klass={rows[(idx - 1 + total) % total].class}
              />
              <ChapterLink
                dir="next" onClick={next}
                num={rows[(idx + 1) % total].n}
                title={rows[(idx + 1) % total].name}
                klass={rows[(idx + 1) % total].class}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ChapterRail({ rows, sym, setSym }) {
  const scrollerRef = React.useRef(null);
  const [canL, setCanL] = React.useState(false);
  const [canR, setCanR] = React.useState(false);

  const refresh = React.useCallback(() => {
    const el = scrollerRef.current; if (!el) return;
    setCanL(el.scrollLeft > 2);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    refresh();
    const el = scrollerRef.current; if (!el) return;
    el.addEventListener('scroll', refresh, { passive: true });
    const ro = new ResizeObserver(refresh); ro.observe(el);
    return () => { el.removeEventListener('scroll', refresh); ro.disconnect(); };
  }, [refresh, rows.length]);

  // keep active chapter visible
  React.useEffect(() => {
    const el = scrollerRef.current; if (!el) return;
    const active = el.querySelector('[data-active="1"]');
    if (!active) return;
    const er = el.getBoundingClientRect(), ar = active.getBoundingClientRect();
    if (ar.left < er.left + 8 || ar.right > er.right - 8) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [sym]);

  const page = (dir) => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const arrowStyle = (enabled) => ({
    width: 34, height: 34, flexShrink: 0,
    border: '1px solid ' + (enabled ? 'var(--ink)' : 'var(--hairline)'),
    background: 'transparent',
    color: enabled ? 'var(--ink)' : 'var(--hairline)',
    fontFamily: 'var(--f-mono)', fontSize: 14,
    cursor: enabled ? 'pointer' : 'default',
    display: 'grid', placeItems: 'center',
  });

  return (
    <div style={{ borderBottom: 'var(--rule)', background: 'var(--paper)' }}>
      <div className="m-container" style={{ padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite)', flexShrink: 0 }}>
            Chapters
          </span>

          <button onClick={() => page(-1)} disabled={!canL} style={arrowStyle(canL)} aria-label="Previous chapters">←</button>

          <div
            ref={scrollerRef}
            style={{
              display: 'flex', gap: 4, flex: 1,
              overflowX: 'auto', scrollbarWidth: 'none',
            }}
          >
            <style>{`.mt-rail-scroll::-webkit-scrollbar{display:none}`}</style>
            {rows.map(r => {
              const active = r.sym === sym;
              return (
                <button key={r.sym} onClick={() => setSym(r.sym)} className="m-mono"
                  data-active={active ? '1' : '0'}
                  title={r.name}
                  style={{
                    padding: '9px 12px',
                    fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    background: active ? 'var(--ink)' : 'transparent',
                    color:      active ? 'var(--paper)' : 'var(--graphite)',
                    border: active ? '1px solid var(--ink)' : '1px solid var(--hairline)',
                  }}>
                  <span style={{ opacity: 0.6, marginRight: 8 }}>{r.n}</span>{r.sym}
                </button>
              );
            })}
          </div>

          <button onClick={() => page( 1)} disabled={!canR} style={arrowStyle(canR)} aria-label="More chapters">→</button>
        </div>
      </div>
    </div>
  );
}

function ChapterLink({ dir, onClick, num, title, klass }) {
  const isPrev = dir === 'prev';
  return (
    <button onClick={onClick} style={{
      textAlign: isPrev ? 'left' : 'right',
      padding: '24px 28px',
      border: '1px solid var(--hairline)',
      background: 'transparent',
      cursor: 'pointer',
      transition: 'border-color .15s, background .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.background = 'transparent'; }}
    >
      <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
        {isPrev ? '← Previous chapter' : 'Next chapter →'}
      </p>
      <p className="m-display" style={{ fontSize: 32, margin: '10px 0 6px', lineHeight: 1 }}>
        <span style={{ color: 'var(--graphite)', fontSize: 18, marginRight: 10 }}>{num}</span>
        {title}
      </p>
      <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
        {klass}
      </p>
    </button>
  );
}

function EssayEntry({ r, idx, total, onSelect }) {
  const essay = ESSAYS[r.sym] || ESSAYS.default;
  const alt   = idx % 2 === 1;
  return (
    <article style={{
      borderBottom: idx < total - 1 ? 'var(--rule)' : 'none',
      background: alt ? 'var(--paper-2)' : 'var(--paper)',
    }}>
      <div className="m-container" style={{ padding: '48px 32px 128px' }}>

        {/* CHAPTER HEAD */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          borderTop: '2px solid var(--ink)', paddingTop: 16, marginBottom: 40,
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>
          <span style={{ color: 'var(--ink)' }}>Chapter {r.n}</span>
          <span style={{ color: 'var(--graphite)' }}>{r.class}</span>
          <span style={{ color: 'var(--graphite)' }}>Pp. {(idx + 1) * 14} — {(idx + 1) * 14 + 7}</span>
        </div>

        {/* TITLE BLOCK — editorial */}
        <div style={{ marginBottom: 64 }}>
          <h2 className="m-display" style={{
            fontSize: 'clamp(72px, 9vw, 160px)',
            margin: 0, lineHeight: 0.9, letterSpacing: '-0.03em',
            maxWidth: '14ch',
          }}>
            The <em>{storyTitle(r)}</em> of <br />{r.name}.
          </h2>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginTop: 28, paddingTop: 16, borderTop: 'var(--rule)',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--graphite)',
          }}>
            <span>By the matter atelier</span>
            <span>{r.formula} · {r.mw} g/mol</span>
            <span>— 4 min read</span>
          </div>
        </div>

        {/* BODY — 7/12 essay + 4/12 science sidecar */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: 80, alignItems: 'start' }}>

          {/* LEFT — essay */}
          <div>
            {/* dropcap first paragraph */}
            <p style={{
              fontFamily: 'var(--f-display)', fontSize: 26, lineHeight: 1.35,
              color: 'var(--ink)', margin: 0,
            }}>
              <span style={{
                float: 'left', fontFamily: 'var(--f-display)', fontSize: 110,
                lineHeight: 0.8, padding: '6px 14px 0 0', fontStyle: 'italic',
              }}>
                {essay.story[0][0]}
              </span>
              {essay.story[0].slice(1)}
            </p>

            {/* remaining paragraphs */}
            {essay.story.slice(1).map((p, i) => (
              <p key={i} style={{
                fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)',
                marginTop: 24, maxWidth: '60ch',
              }}>{p}</p>
            ))}

            {/* pullquote */}
            <blockquote style={{
              margin: '56px 0 0',
              padding: '32px 0 0',
              borderTop: 'var(--rule)',
            }}>
              <p className="m-display" style={{
                fontSize: 34, lineHeight: 1.25, margin: 0, maxWidth: '26ch',
              }}>
                <em>"{essay.aside}"</em>
              </p>
              <p className="m-mono" style={{
                marginTop: 20, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--graphite)',
              }}>
                — Margin note · {r.sym} · {r.n}
              </p>
            </blockquote>
          </div>

          {/* RIGHT — science sidecar */}
          <aside style={{
            position: 'sticky', top: 100,
            border: '1px solid var(--ink)',
            background: alt ? 'var(--paper)' : 'var(--paper-2)',
          }}>
            {/* header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink)' }}>
              <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
                § Data sheet · {r.sym}
              </p>
            </div>

            {/* symbol card */}
            <div style={{
              padding: 22,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderBottom: 'var(--rule)',
            }}>
              <p className="m-display" style={{ fontSize: 120, margin: 0, lineHeight: 0.9, letterSpacing: '-0.04em' }}>
                {r.sym}
              </p>
              <p style={{ fontSize: 13, marginTop: 10, color: 'var(--graphite)' }}>{r.name}</p>
            </div>

            {/* key/value rows */}
            <dl style={{ margin: 0, padding: '8px 22px' }}>
              {[
                ['Formula',      r.formula],
                ['Molar mass',   `${r.mw} g/mol`],
                ['Typical use',  r.conc],
                ['Working pH',   r.pH],
                ['Class',        r.class],
                ['Function',     r.fn],
                ['Origin',       r.origin],
                ['Evidence',     r.evidence],
              ].map(([k, v], i) => (
                <div key={k} style={{
                  display: 'grid', gridTemplateColumns: '38% 1fr', gap: 10,
                  padding: '12px 0',
                  borderBottom: i < 7 ? 'var(--rule-soft)' : 'none',
                }}>
                  <dt className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>{k}</dt>
                  <dd style={{ margin: 0, fontSize: 12, color: 'var(--ink-2)', textAlign: 'right' }}>{v}</dd>
                </div>
              ))}
            </dl>

            {/* tolerance mini */}
            <div style={{ padding: '16px 22px', borderTop: 'var(--rule)' }}>
              <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', margin: '0 0 10px' }}>
                Tolerance
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                {[
                  ['DRY',  r.tol.dry ],
                  ['OIL',  r.tol.oily],
                  ['COM',  r.tol.comb],
                  ['SEN',  r.tol.sens],
                  ['REA',  r.tol.reac],
                ].map(([k, mark]) => (
                  <div key={k} style={{ textAlign: 'center', padding: '6px 0', border: '1px solid var(--hairline)' }}>
                    <p className="m-display" style={{ fontSize: 16, margin: 0, color: mark === '○' ? 'var(--oxblood)' : 'var(--ink)' }}>{mark}</p>
                    <p className="m-mono" style={{ fontSize: 8, letterSpacing: '0.14em', color: 'var(--graphite)', margin: '2px 0 0' }}>{k}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* page footer */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid var(--ink)',
              background: 'var(--ink)', color: 'var(--paper)',
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
            }}>
              <span>MT · Formulary</span>
              <span>{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

// word choice for the big headline, slightly varied per ingredient
function storyTitle(r) {
  const map = {
    'Active':      'science',
    'Exfoliant':   'craft',
    'Humectant':   'history',
    'Emollient':   'shape',
    'Peptide':     'signal',
    'Antioxidant': 'defence',
    'Botanical':   'origin',
  };
  return map[r.class] || 'story';
}

Object.assign(window, { IngredientsEssay });
