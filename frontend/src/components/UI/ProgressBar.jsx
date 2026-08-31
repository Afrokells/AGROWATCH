import { useEffect, useRef } from 'react';

export default function ProgressBar({
  value = 0,     // 0-100
  color = 'var(--accent)',
  height = 8,
  label,
  showValue = true,
  animated = true,
  style = {},
}) {
  const fillRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current) return;
    // slight delay so transition is visible on mount
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${Math.min(value, 100)}%`;
    }, 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={style}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
          {label && <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>}
          {showValue && <span style={{ color, fontWeight: 700 }}>{value.toFixed ? value.toFixed(0) : value}%</span>}
        </div>
      )}
      <div style={{
        height, borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div
          ref={fillRef}
          style={{
            height: '100%',
            width: '0%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            transition: animated ? 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
