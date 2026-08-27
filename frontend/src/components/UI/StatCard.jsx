import { useEffect, useRef } from 'react';
import Card from './Card';

export default function StatCard({ icon, value, label, sub, color = 'var(--accent)', trend, style = {} }) {
  const valRef = useRef(null);

  // Count-up animation
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
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: `${color}20`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color, flexShrink: 0,
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: trend >= 0 ? 'var(--accent)' : 'var(--danger)',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <div ref={valRef} style={{
          fontSize: '1.875rem', fontWeight: 800,
          fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {typeof value === 'number' ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2)) : value}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </Card>
  );
}
