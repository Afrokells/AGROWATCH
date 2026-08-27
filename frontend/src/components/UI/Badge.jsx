const PRESETS = {
  healthy:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  warning:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  danger:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  info:      { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  neutral:   { color: '#8fad95', bg: 'rgba(143,173,149,0.12)' },
  accent:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  amber:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
};

export default function Badge({ label, variant = 'neutral', dot = false, style = {} }) {
  const p = PRESETS[variant] || PRESETS.neutral;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.2rem 0.65rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: p.bg,
      color: p.color,
      border: `1px solid ${p.color}33`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: p.color, flexShrink: 0,
          boxShadow: `0 0 6px ${p.color}`,
        }} />
      )}
      {label}
    </span>
  );
}
