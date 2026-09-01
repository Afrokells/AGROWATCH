export default function Card({ children, style = {}, className = '', hover = true, glow = false }) {
  return (
    <div
      className={`glass ${className}`}
      style={{
        padding: 'var(--sp-6)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        boxShadow: glow ? 'var(--shadow-glow)' : 'var(--shadow-md)',
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.boxShadow = glow ? '0 0 32px rgba(74,222,128,0.25)' : '0 8px 32px rgba(0,0,0,0.5)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.borderColor = 'rgba(74,222,128,0.12)';
        e.currentTarget.style.boxShadow = glow ? 'var(--shadow-glow)' : 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(0)';
      } : undefined}
    >
      {children}
    </div>
  );
}
