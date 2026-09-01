import { Leaf } from 'lucide-react';

export default function Logo({ size = 36, iconSize = 18, showText = true, className = '' }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-md)',
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <Leaf size={iconSize} color="#0f1712" strokeWidth={2.5} />
      </div>
      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{ 
            fontFamily: 'Plus Jakarta Sans', 
            fontWeight: 800, 
            fontSize: size > 30 ? '1.0625rem' : '0.9375rem', 
            color: 'var(--text-primary)' 
          }}>
            AgroWatch
          </div>
          {size > 30 && (
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Ghana
            </div>
          )}
        </div>
      )}
    </div>
  );
}
