/* matter — About page
   Centered single-column manifesto — one page, nothing else */

function AboutHero() {
  return (
    <section style={{ borderBottom: 'var(--rule)', position: 'relative', overflow: 'hidden' }}>

      {/* background graphics — concentric arcs on the left, a ruled grid on the right */}
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
        style={{
          position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)',
          width: '34vw', maxWidth: 520, height: 'auto', opacity: 0.6, pointerEvents: 'none',
        }}>
        <g fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--hairline)' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <circle key={i} cx="200" cy="200" r={20 + i * 18} />
          ))}
          <line x1="0"   y1="200" x2="400" y2="200" />
          <line x1="200" y1="0"   x2="200" y2="400" />
        </g>
        <circle cx="200" cy="200" r="3" fill="var(--ink)"/>
      </svg>

      <svg viewBox="0 0 300 400" preserveAspectRatio="xMaxYMid meet"
        aria-hidden="true"
        style={{
          position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)',
          width: '24vw', maxWidth: 360, height: 'auto', opacity: 0.55, pointerEvents: 'none',
        }}>
        <g fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--hairline)' }}>
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 14} y1="40" x2={i * 14} y2="360" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0"   y1={40 + i * 29} x2="300" y2={40 + i * 29} />
          ))}
        </g>
        {/* corner markers */}
        <g fill="var(--ink)">
          <rect x="0"   y="38"  width="6" height="1"/>
          <rect x="294" y="38"  width="6" height="1"/>
          <rect x="0"   y="358" width="6" height="1"/>
          <rect x="294" y="358" width="6" height="1"/>
        </g>
      </svg>

      <div className="m-container" style={{
        padding: '88px 32px 72px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* kicker */}
        <p className="m-mono" style={{
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'var(--graphite)', margin: 0,
        }}>
          § The matter manifesto
        </p>

        {/* title */}
        <h1 className="m-display" style={{
          fontSize: 'clamp(72px, 9vw, 160px)', margin: '22px 0 0',
          lineHeight: 0.92, letterSpacing: '-0.03em',
        }}>
          What <em>we</em><br/>stand for.
        </h1>

        {/* inline rule + meta */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
          maxWidth: 640, margin: '40px auto 0',
        }}>
          <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }}/>
          <span className="m-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--graphite)' }}>
            Nine clauses · one page
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }}/>
        </div>

        {/* standfirst */}
        <p style={{
          fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)',
          maxWidth: 560, margin: '28px auto 0',
        }}>
          This is the document the two of us wrote on the first day of the
          company, and that every formula, every lot, and every word we publish
          still answers to.
        </p>

        {/* read down indicator */}
        <div style={{
          marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <span className="m-mono" style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--graphite)' }}>
            Read below
          </span>
          <span style={{ display: 'block', width: 1, height: 44, background: 'var(--graphite)' }}/>
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const beliefs = [
    "A formula is a claim. A claim without percentages is a story.",
    "If a molecule has no trial evidence, it has no place in a product.",
    "We name every active, at its exact concentration, on every bottle.",
    "Short ingredient lists are not a marketing position. They are a discipline.",
    "Fragrance is a liability for reactive skin. We do not use it.",
    "A lot that fails its assay does not ship. It is destroyed.",
    "We publish what we measured, including the things that didn't work.",
    "Before and after photographs can be staged. Clinical scores cannot.",
    "Restraint is not austerity. It is confidence in what remains.",
  ];

  return (
    <section style={{ borderBottom: 'var(--rule)', background: 'var(--paper)' }}>
      {/* masthead */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: 24,
        padding: '28px 48px 18px',
        borderBottom: '3px double var(--ink)',
        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
      }}>
        <span style={{ color: 'var(--graphite)' }}>Vol. I · No. 01</span>
        <span style={{ color: 'var(--ink)', fontSize: 11, letterSpacing: '0.3em' }}>
          The Matter Broadsheet
        </span>
        <span style={{ color: 'var(--graphite)', textAlign: 'right' }}>14 March 2024</span>
      </div>

      {/* headline + deck — broadsheet cap */}
      <div style={{
        borderBottom: '1px solid var(--ink)',
        padding: '48px 48px 40px',
        textAlign: 'center',
      }}>
        <p className="m-mono" style={{
          fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'var(--graphite)', margin: 0,
        }}>
          A leader, from the founders
        </p>
        <h2 className="m-display" style={{
          fontSize: 'clamp(56px, 7vw, 112px)', lineHeight: 0.95, letterSpacing: '-0.025em',
          margin: '18px auto 0', maxWidth: '14ch', textWrap: 'balance',
        }}>
          Nine <em>clauses</em>, unchanged<br/>since founding.
        </h2>
        <p style={{
          maxWidth: 560, margin: '24px auto 0',
          fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)',
        }}>
          Every product we ship, every lot we release, and every sentence we
          print is measured against the document below.
        </p>
      </div>

      {/* two-column broadsheet body */}
      <div style={{ padding: '56px 48px 48px' }}>
        <div style={{
          columnCount: 2,
          columnGap: 56,
          columnRule: '1px solid var(--hairline)',
          maxWidth: 1100, margin: '0 auto',
          fontFamily: 'var(--f-display)',
          fontSize: 20, lineHeight: 1.5,
          color: 'var(--ink)',
          textAlign: 'justify',
          hyphens: 'auto',
        }}>
          {beliefs.map((b, i) => (
            <p key={i} style={{
              margin: i === 0 ? 0 : '22px 0 0',
              breakInside: 'avoid',
            }}>
              {i === 0 ? (
                <span style={{
                  float: 'left', fontSize: 72, lineHeight: 0.8,
                  padding: '6px 10px 0 0', fontStyle: 'italic',
                }}>
                  {b[0]}
                </span>
              ) : null}
              <span className="m-mono" style={{
                fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--graphite)', marginRight: 10,
                verticalAlign: 'baseline',
              }}>
                §{String(i + 1).padStart(2, '0')}
              </span>
              <span>{i === 0 ? b.slice(1) : b}</span>
            </p>
          ))}
        </div>

        {/* rule + sign-off, centered under the two columns */}
        <div style={{
          maxWidth: 1100, margin: '56px auto 0',
          borderTop: '3px double var(--ink)', paddingTop: 28,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'end',
        }}>
          <div>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              Signed, the founders
            </p>
            <p className="m-display" style={{
              fontStyle: 'italic', fontSize: 'clamp(36px, 4vw, 56px)',
              margin: '10px 0 0', letterSpacing: '-0.025em', lineHeight: 1,
            }}>
              A. Rao · K. Mendelsohn
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="m-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite)', margin: 0 }}>
              Filed 14 March 2024
            </p>
            <p className="m-mono" style={{ fontSize: 11, marginTop: 6, color: 'var(--ink-2)' }}>
              London · Mumbai · New York
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function splitBody(s) {
  const keys = ['claim','story','evidence','active','bottle','discipline','liability','destroyed',"didn't",'cannot','confidence'];
  let used = false;
  return s.split(/(\s+)/).map((tok, i) => {
    const strip = tok.replace(/[.,]/g, '').toLowerCase();
    if (!used && keys.includes(strip)) {
      used = true;
      return <em key={i} style={{ fontStyle: 'italic' }}>{tok}</em>;
    }
    return tok;
  });
}

Object.assign(window, { AboutHero, Manifesto });
