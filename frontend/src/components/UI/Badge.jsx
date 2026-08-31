/**
 * Badge — semantic status/label component.
 *
 * dot: shows a 3×12px vertical rule (intentional mark) instead of a round bullet
 * caps: uppercase letter-spacing treatment (opt-in, not forced)
 */
const PRESETS = {
  healthy:   { color: 'var(--accent)',         bg: 'var(--accent-dim)' },
  warning:   { color: 'var(--amber)',           bg: 'var(--amber-dim)' },
  danger:    { color: 'var(--danger)',          bg: 'var(--danger-dim)' },
  info:      { color: 'var(--info)',            bg: 'var(--info-dim)' },
  neutral:   { color: 'var(--text-secondary)', bg: 'var(--bg-input)' },
  accent:    { color: 'var(--accent)',         bg: 'var(--accent-dim)' },
  amber:     { color: 'var(--amber)',           bg: 'var(--amber-dim)' },
};

export default function Badge({ label, variant = 'neutral', dot = false, caps = false, style = {} }) {
  const p = PRESETS[variant] || PRESETS.neutral;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      padding: '0.28rem 0.6rem',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: caps ? '0.05em' : '0.01em',
      textTransform: caps ? 'uppercase' : 'none',
      background: p.bg,
      color: p.color,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 3,
          height: 12,
          borderRadius: 2,
          background: p.color,
          flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}
