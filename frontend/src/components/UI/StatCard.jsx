import { useEffect, useRef } from 'react';
import Card from './Card';

/**
 * StatCard — key metric display.
 *
 * Refined: icon sits inline beside the label rather than in a standalone
 * colored square (which reads as a templated "dashboard card"). A thin
 * top-border in the accent color anchors each card visually without
 * relying on a gradient or glow.
 */
export default function StatCard({ icon, value, label, sub, color = 'var(--accent)', trend, style = {} }) {
  const valRef = useRef(null);

  // Count-up animation (preserved — it's earned UX)
  useEffect(() => {
    if (!valRef.current || typeof value !== 'number') return;
    let start = 0;
    const end = value;
    const duration = 800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      valRef.current.textContent = Number.isInteger(end)
        ? Math.round(eased * end).toLocaleString()
        : (eased * end).toFixed(2);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        borderTop: `3px solid ${color}`,
        paddingTop: 'var(--sp-5)',
        ...style,
      }}
    >
      {/* Label row: icon inline with label text */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          color: 'var(--text-muted)',
        }}>
          <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: trend >= 0 ? 'var(--accent)' : 'var(--danger)',
            background: trend >= 0 ? 'var(--accent-dim)' : 'var(--danger-dim)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <div ref={valRef} style={{
          fontSize: '2rem',
          fontWeight: 800,
          fontFamily: 'Plus Jakarta Sans',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {typeof value === 'number'
            ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2))
            : value}
        </div>
        {sub && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 5 }}>{sub}</div>
        )}
      </div>
    </Card>
  );
}
