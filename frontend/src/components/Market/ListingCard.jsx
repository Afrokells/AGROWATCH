import React, { useState } from 'react';
import { MapPin, Calendar, MessageCircle, CheckCircle2, Phone, Package, Sparkles } from 'lucide-react';
import Button from '../UI/Button';
import { CROP_THEMES } from '../../data/constants';

export default function ListingCard({ listing, onEnquire, onContact, isOwner = false, preview = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    crop_type = 'tomato',
    farmer_name,
    farmer_phone,
    farmer_region,
    farmer_district,
    quantity_kg,
    asking_price_ghs,
    harvest_date,
    description,
  } = listing || {};

  const theme = CROP_THEMES[crop_type?.toLowerCase()] || CROP_THEMES.tomato;
  const handleAction = onContact || onEnquire;

  // Format date nicely
  const formattedDate = harvest_date 
    ? new Date(harvest_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent Harvest';

  const farmerInitial = farmer_name ? farmer_name.trim().charAt(0).toUpperCase() : 'F';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: `1px solid ${isHovered ? theme.border : 'rgba(255, 255, 255, 0.12)'}`,
        boxShadow: isHovered 
          ? `0 16px 36px ${theme.glow}, 0 4px 12px rgba(0,0,0,0.35)` 
          : '0 4px 16px rgba(0,0,0,0.2)',
        transform: isHovered && !preview ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 380,
        boxSizing: 'border-box',
        background: '#0a1410',
      }}
    >
      {/* ── Background Layer: Selected Crop Picture ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${theme.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isHovered && !preview ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 0,
        }}
      />

      {/* ── Dual-Layer Gradient Scrim (for vibrant top photo + dark readable bottom) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at top right, ${theme.glow}, transparent 55%),
            linear-gradient(180deg, 
              rgba(8, 16, 12, 0.30) 0%, 
              rgba(8, 16, 12, 0.65) 38%, 
              rgba(8, 16, 12, 0.92) 68%, 
              rgba(8, 16, 12, 0.98) 100%
            )
          `,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Card Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          flex: 1,
          padding: 'var(--sp-4)',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Floating Telemetry Section */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              marginBottom: 'var(--sp-3)',
            }}
          >
            {/* Glassmorphic Crop Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{theme.emoji}</span>
              <span
                style={{
                  fontWeight: 800,
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.02em',
                  textTransform: 'capitalize',
                }}
              >
                {crop_type}
              </span>
              <span
                style={{
                  color: theme.accent,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  paddingLeft: 6,
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {theme.tag}
              </span>
            </div>

            {/* Glowing Price Tag Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 0, 0, 0.82)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${theme.border}`,
                boxShadow: `0 4px 14px rgba(0,0,0,0.4), 0 0 12px ${theme.glow}`,
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#94a39a', fontWeight: 600 }}>GH₵</span>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: theme.accent,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {asking_price_ghs ? Number(asking_price_ghs).toFixed(2) : '0.00'}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                /kg
              </span>
            </div>
          </div>

          {/* Visual Stock Availability Badge floating on the crop image */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              width: 'fit-content',
              marginBottom: 'var(--sp-6)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: theme.accent,
                boxShadow: `0 0 8px ${theme.accent}`,
              }}
            />
            <Package size={12} style={{ color: theme.accent }} />
            <span>
              {quantity_kg ? Number(quantity_kg).toLocaleString() : '0'} kg Available
            </span>
          </div>
        </div>

        {/* ── Lower Glass Surface (Farmer Identity & Metadata) ── */}
        <div
          style={{
            background: 'rgba(10, 20, 15, 0.82)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)',
            marginTop: 'auto',
          }}
        >
          {/* Farmer Profile Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              {/* Farmer Initial Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.accent}, #15803d)`,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                }}
              >
                {farmerInitial}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {farmer_name || 'Verified Farmer'}
                  </span>
                  <CheckCircle2 size={13} style={{ color: theme.accent, flexShrink: 0 }} />
                </div>
                {farmer_phone && (
                  <div style={{ fontSize: '0.75rem', color: '#94a39a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={10} />
                    <span>{farmer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {isOwner && (
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(74, 222, 128, 0.15)',
                  border: '1px solid rgba(74, 222, 128, 0.35)',
                  color: '#4ade80',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Your Lot
              </span>
            )}
          </div>

          {/* Description snippet */}
          {description && (
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#cbd5e1',
                margin: 0,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
          )}

          {/* Location & Harvest Timeline Tags */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--sp-2)',
              fontSize: '0.75rem',
              paddingTop: 'var(--sp-2)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {(farmer_district || farmer_region) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#e2e8f0',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <MapPin size={11} style={{ color: theme.accent }} />
                <span>{[farmer_district, farmer_region].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {harvest_date && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#e2e8f0',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Calendar size={11} style={{ color: theme.accent }} />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          {!preview && (
            <div style={{ marginTop: 'var(--sp-1)' }}>
              {isOwner ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} style={{ color: theme.accent }} />
                  <span>Active on Market Exchange</span>
                </div>
              ) : (
                <Button
                  fullWidth
                  variant="primary"
                  icon={<MessageCircle size={16} />}
                  onClick={() => handleAction && handleAction(listing)}
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, #16a34a)`,
                    borderColor: theme.accent,
                    color: '#07160d',
                    fontWeight: 800,
                    boxShadow: isHovered ? `0 4px 16px ${theme.glow}` : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  Contact Seller
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

