/* matter — tweaks panel with rich bg-color variations */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "bone",
  "displayFont": "Instrument Serif",
  "accent": "#5a7e62",
  "surfacePattern": "alternate"
}/*EDITMODE-END*/;

// Each palette defines full surface stack: paper (default bg), paper-2 (alt bg), mineral, hairline, ink etc.
const PALETTES = {
  bone:    { paper:'#F4F1EB', paper2:'#EDE9E1', paper3:'#E4E0D6', mineral:'#D6D2C6', hairline:'#BFBAAD', ink:'#121210', ink2:'#26251F', graphite:'#55534C', label: 'Bone' },
  ivory:   { paper:'#F7F5EE', paper2:'#EFEBE0', paper3:'#E4DECC', mineral:'#D4CEB9', hairline:'#BCB497', ink:'#1A1610', ink2:'#2E281C', graphite:'#5D5644', label: 'Ivory' },
  mineral: { paper:'#EDEEEA', paper2:'#E3E5E0', paper3:'#D6D8D1', mineral:'#C3C6BE', hairline:'#A9ADA3', ink:'#12141A', ink2:'#24262E', graphite:'#4F5258', label: 'Mineral' },
  oxide:   { paper:'#EBE4D6', paper2:'#E1D8C5', paper3:'#D3C7AF', mineral:'#C2B497', hairline:'#A8987A', ink:'#1E1608', ink2:'#322712', graphite:'#625132', label: 'Oxide' },
  ash:     { paper:'#E9E7E2', paper2:'#DEDBD4', paper3:'#CECABF', mineral:'#B8B4A7', hairline:'#9F9B8E', ink:'#0F0F0E', ink2:'#252420', graphite:'#524F48', label: 'Ash' },
  sage:    { paper:'#EAEDE5', paper2:'#DFE4D8', paper3:'#CBD3C2', mineral:'#B3BEA8', hairline:'#97A38C', ink:'#10140E', ink2:'#1F251B', graphite:'#4A5340', label: 'Sage' },
  rose:    { paper:'#F2EAE3', paper2:'#E8DDD3', paper3:'#D9C8B9', mineral:'#C3AE9C', hairline:'#A48C78', ink:'#1A120D', ink2:'#2E2118', graphite:'#61493A', label: 'Rose' },
  slate:   { paper:'#E4E5E5', paper2:'#D8DADA', paper3:'#C4C7C6', mineral:'#ADB1B0', hairline:'#8F9493', ink:'#0D0F10', ink2:'#1E2122', graphite:'#454A4B', label: 'Slate' },
  noir:    { paper:'#181614', paper2:'#24211D', paper3:'#2F2B26', mineral:'#3A362F', hairline:'#55504A', ink:'#F2EDE3', ink2:'#DCD6C9', graphite:'#A9A296', label: 'Noir' },
};

// Surface pattern — how the sections (Hero, Featured, Spotlight, Press, Newsletter) alternate
const PATTERNS = {
  alternate:  { hero:'paper',  featured:'paper',   spotlight:'paper-2', press:'paper',    newsletter:'paper-2', label: 'Alternate' },
  uniform:    { hero:'paper',  featured:'paper',   spotlight:'paper',   press:'paper',    newsletter:'paper',   label: 'Uniform' },
  sandwich:   { hero:'paper-2',featured:'paper',   spotlight:'paper-2', press:'paper',    newsletter:'paper-2', label: 'Sandwich' },
  stepped:    { hero:'paper',  featured:'paper-2', spotlight:'paper-3', press:'paper-2',  newsletter:'paper',   label: 'Stepped' },
  spotlight:  { hero:'paper',  featured:'paper',   spotlight:'ink',     press:'paper',    newsletter:'paper-2', label: 'Spotlight' },
  duotone:    { hero:'paper',  featured:'paper-2', spotlight:'paper',   press:'paper-2',  newsletter:'paper',   label: 'Duotone' },
  inverted:   { hero:'ink',    featured:'paper',   spotlight:'paper-2', press:'paper',    newsletter:'paper-2', label: 'Inverted' },
};

function applyTweaks(t) {
  const p = PALETTES[t.palette] || PALETTES.bone;
  const r = document.documentElement.style;
  r.setProperty('--paper',    p.paper);
  r.setProperty('--paper-2',  p.paper2);
  r.setProperty('--paper-3',  p.paper3);
  r.setProperty('--mineral',  p.mineral);
  r.setProperty('--hairline', p.hairline);
  r.setProperty('--ink',      p.ink);
  r.setProperty('--ink-2',    p.ink2);
  r.setProperty('--graphite', p.graphite);
  r.setProperty('--assay',    t.accent);
  r.setProperty('--f-display', `'${t.displayFont}', serif`);

  document.body.style.background = p.paper;

  // apply section surfaces
  const pat = PATTERNS[t.surfacePattern] || PATTERNS.alternate;
  const bgFor = (key) => {
    const v = pat[key];
    if (v === 'paper')   return p.paper;
    if (v === 'paper-2') return p.paper2;
    if (v === 'paper-3') return p.paper3;
    if (v === 'ink')     return p.ink;
    return p.paper;
  };
  const invert = (key) => pat[key] === 'ink';

  const sections = [
    ['home-hero',       'hero'],
    ['home-featured',   'featured'],
    ['home-spotlight',  'spotlight'],
    ['home-press',      'press'],
    ['home-newsletter', 'newsletter'],
  ];
  sections.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.background = bgFor(key);
    el.classList.toggle('m-inverted', invert(key));
  });
}

function Tweaks({ page }) {
  const [enabled, setEnabled] = React.useState(false);
  const [state, setState]     = React.useState(TWEAK_DEFAULTS);
  const [open,  setOpen]      = React.useState(true);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === '__activate_edit_mode')   setEnabled(true);
      if (e.data.type === '__deactivate_edit_mode') setEnabled(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    // small delay so sections have mounted
    setTimeout(() => applyTweaks(TWEAK_DEFAULTS), 30);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const update = (k, v) => {
    const next = { ...state, [k]: v };
    setState(next);
    applyTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 1000,
      width: open ? 300 : 140,
      background: 'var(--paper)', border: 'var(--rule)',
      padding: open ? 18 : '10px 14px',
      fontFamily: 'var(--f-mono)', fontSize: 11,
      transition: 'width 0.15s',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: open ? 12 : 0, marginBottom: open ? 12 : 0,
        borderBottom: open ? 'var(--rule-soft)' : 'none',
      }}>
        <span className="m-eyebrow">Tweaks · {page}</span>
        <button onClick={() => setOpen(o => !o)} className="m-mono"
          style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--graphite)' }}>
          {open ? '— hide' : '+ show'}
        </button>
      </div>

      {open && (
        <>
          <Section label="Background palette">
            <Swatches value={state.palette} onChange={v => update('palette', v)} />
          </Section>

          <Section label="Surface pattern">
            <Seg value={state.surfacePattern} onChange={v => update('surfacePattern', v)}
                 options={Object.entries(PATTERNS).map(([k, v]) => [k, v.label])}
                 wrap />
          </Section>

          <Section label="Accent">
            <Seg value={state.accent} onChange={v => update('accent', v)}
                 options={[['#5a7e62','Green'],['#6a5b8f','Violet'],['#8a5a3a','Clay'],['#3a5a7e','Cobalt'],['#8a3a3a','Oxblood']]} wrap />
          </Section>

          <Section label="Display font">
            <Seg value={state.displayFont} onChange={v => update('displayFont', v)}
                 options={[['Instrument Serif','Inst.'],['Libre Caslon Text','Caslon'],['Cormorant','Corm.'],['Inter Tight','Sans']]} wrap />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p className="m-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--graphite)', marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  );
}

function Swatches({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
      {Object.entries(PALETTES).map(([k, p]) => {
        const selected = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} title={p.label}
            style={{
              display: 'flex', flexDirection: 'column', padding: 0,
              border: selected ? '1px solid var(--ink)' : '1px solid var(--hairline)',
              outline: selected ? '1px solid var(--ink)' : 'none',
              outlineOffset: 2,
            }}>
            <div style={{ height: 20, background: p.paper }}/>
            <div style={{ height: 8,  background: p.paper2 }}/>
            <div style={{ height: 8,  background: p.ink }}/>
            <span className="m-mono" style={{
              fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '4px 0', background: p.paper, color: p.ink, textAlign: 'center',
              borderTop: `1px solid ${p.hairline}`,
            }}>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Seg({ value, onChange, options, wrap }) {
  return (
    <div style={{
      display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 4,
    }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)}
          style={{
            padding: '5px 8px', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: 'var(--f-mono)',
            background: value === v ? 'var(--ink)' : 'transparent',
            color:      value === v ? 'var(--paper)' : 'var(--ink)',
            border: '1px solid ' + (value === v ? 'var(--ink)' : 'var(--hairline)'),
          }}>{l}</button>
      ))}
    </div>
  );
}

Object.assign(window, { Tweaks });
