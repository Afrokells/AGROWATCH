
const VARIANTS = {
  primary:   { bg: 'var(--accent)', color: '#0a1410', border: 'transparent' },
  secondary: { bg: 'var(--accent-dim)', color: 'var(--accent)', border: 'var(--accent)' },
  amber:     { bg: 'var(--amber-dim)', color: 'var(--amber)', border: 'var(--amber)' },
  danger:    { bg: 'var(--danger-dim)', color: 'var(--danger)', border: 'var(--danger)' },
  ghost:     { bg: 'transparent', color: 'var(--text-secondary)', border: 'var(--border)' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style: extraStyle = {},
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const sizes = { sm: '0.4rem 0.85rem', md: '0.65rem 1.25rem', lg: '0.85rem 1.75rem' };
  const fontSizes = { sm: '0.8125rem', md: '0.9375rem', lg: '1rem' };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: sizes[size],
        fontSize: fontSizes[size],
        fontWeight: 600,
        fontFamily: 'inherit',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        ...extraStyle,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      {...rest}
    >
      {loading ? (
        <span style={{
          width: 16, height: 16, border: `2px solid ${v.color}`,
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
