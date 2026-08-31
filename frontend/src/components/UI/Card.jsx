/**
 * Card — base surface component.
 *
 * variant:
 *   "default" — standard glass surface (unchanged)
 *   "inset"   — slightly recessed background (var(--bg-card)), for nested/secondary content
 *   "rule"    — left-border accent, colored by the `ruleColor` prop
 *
 * ruleColor: "accent" | "amber" | "danger" | "info"  (used when variant="rule")
 */
export default function Card({
  children,
  style = {},
  className = '',
  hover = true,
  variant = 'default',
  ruleColor = 'accent',
}) {
  const variantClass =
    variant === 'inset' ? 'card-inset' :
    variant === 'rule'  ? `card-rule-${ruleColor}` :
    '';

  return (
    <div
      className={`glass ${variantClass} ${className}`}
      style={{
        padding: 'var(--sp-6)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      } : undefined}
    >
      {children}
    </div>
  );
}
