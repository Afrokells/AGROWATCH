import React from 'react';

/**
 * AgroWatchMark — Custom-crafted brand emblem for AgroWatch.
 *
 * Visual Concept:
 * Merges optical drone surveillance (corner reticle guides & vision sensor node)
 * with upward biological crop vitality (stylized twin growth leaves).
 * Crafted with precise geometric arcs and dual-tone gradients.
 */
export function AgroWatchMark({ size = 36, className = '', idPrefix = 'aw' }) {
  const gradTileId = `${idPrefix}-tile-grad`;
  const gradLeafLeftId = `${idPrefix}-leaf-l`;
  const gradLeafRightId = `${idPrefix}-leaf-r`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradTileId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent, #315c3b)" />
          <stop offset="100%" stopColor="var(--accent-hover, #203f27)" />
        </linearGradient>
        <linearGradient id={gradLeafLeftId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e3ecde" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={gradLeafRightId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c5dbbe" />
        </linearGradient>
      </defs>

      {/* Rounded Hex/Square Brand Container Tile */}
      <rect width="36" height="36" rx="9" fill={`url(#${gradTileId})`} />

      {/* Precision Reticle / Drone Viewfinder Framing (Optical Scan Corners) */}
      <path
        d="M 8 13 V 9.5 A 1.5 1.5 0 0 1 9.5 8 H 13"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path
        d="M 23 8 H 26.5 A 1.5 1.5 0 0 1 28 9.5 V 13"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path
        d="M 28 23 V 26.5 A 1.5 1.5 0 0 1 26.5 28 H 23"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path
        d="M 13 28 H 9.5 A 1.5 1.5 0 0 1 8 26.5 V 23"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Primary Crop Shoot Stem */}
      <path
        d="M 18 26.5 V 13"
        stroke="#ffffff"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Left Foliar Blade (Sprout Curvature) */}
      <path
        d="M 18 21.5 C 14.2 21.5 10.5 18.8 11.2 13.8 C 15.5 14 17.5 17.5 18 20.2"
        fill={`url(#${gradLeafLeftId})`}
      />

      {/* Right Foliar Blade (Ascending Leaf Canopy) */}
      <path
        d="M 18 17.5 C 21.8 17.5 25.5 14.8 24.8 9.8 C 20.5 10 18.5 13.5 18 16.2"
        fill={`url(#${gradLeafRightId})`}
      />

      {/* Optical Vision Focus Node / Bio-Pulse Sensor (Gold Amber Target) */}
      <circle cx="18" cy="9.2" r="1.85" fill="#d0a85d" />
      <circle cx="18" cy="9.2" r="0.75" fill="#ffffff" />
    </svg>
  );
}

/**
 * Logo — Primary brand identity component.
 *
 * Props:
 * - size: Emblem dimensions in px (default: 36)
 * - showText: Boolean to display wordmark (default: true)
 * - subtitle: Custom string below wordmark (default: "Precision Agri-Tech" or "Ghana")
 * - showSubtitle: Boolean to toggle subtitle visibility (default: true if size > 30)
 * - className: Optional class names
 * - style: Optional inline styles
 */
export default function Logo({
  size = 36,
  showText = true,
  subtitle = 'Ghana',
  showSubtitle,
  className = '',
  style = {},
}) {
  const isLarge = size > 30;
  const shouldShowSub = showSubtitle !== undefined ? showSubtitle : isLarge;

  return (
    <div
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size > 32 ? 'var(--sp-3, 12px)' : 'var(--sp-2, 8px)',
        userSelect: 'none',
        ...style,
      }}
    >
      <AgroWatchMark size={size} />

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: size > 32 ? '1.125rem' : '0.975rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '1px',
            }}
          >
            <span style={{ fontWeight: 800 }}>Agro</span>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Watch</span>
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--amber, #d0a85d)',
                marginLeft: 2,
                marginBottom: 2,
              }}
            />
          </div>

          {shouldShowSub && (
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
