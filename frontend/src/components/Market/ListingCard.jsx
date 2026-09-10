import React from 'react';
import { MapPin, Calendar, MessageCircle, CheckCircle2, Phone, Package, Sparkles } from 'lucide-react';
import { CROP_THEMES } from '../../data/constants';

export default function ListingCard({ listing, onEnquire, onContact, isOwner = false, preview = false }) {
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

  const normalizedCrop = crop_type?.toLowerCase() || 'tomato';
  const theme = CROP_THEMES[normalizedCrop] || CROP_THEMES.tomato;
  const handleAction = onContact || onEnquire;

  // Format date cleanly
  const formattedDate = harvest_date 
    ? new Date(harvest_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent Harvest';

  const farmerInitial = farmer_name ? farmer_name.trim().charAt(0).toUpperCase() : 'F';

  return (
    <div className={`market-card market-card--${normalizedCrop}`}>
      {/* ── Top Hero Showcase with Selected Crop Picture Background ── */}
      <div className="market-card__hero">
        {/* Crop Background Image */}
        <div 
          className="market-card__hero-img" 
          style={{ backgroundImage: `url(${theme.image})` }} 
        />

        {/* Theme-Sensitive Scrim Gradient */}
        <div className="market-card__hero-scrim" />

        {/* Top Floating Badges */}
        <div className="market-card__hero-top">
          {/* Frosted Crop Pill */}
          <div className="market-card__crop-pill">
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{theme.emoji}</span>
            <span style={{ textTransform: 'capitalize' }}>{crop_type}</span>
            <span
              style={{
                color: 'var(--card-accent)',
                fontSize: '0.6875rem',
                paddingLeft: 6,
                borderLeft: '1px solid var(--border)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {theme.tag}
            </span>
          </div>

          {/* Floating Price Badge */}
          <div className="market-card__price-badge">
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>GH₵</span>
            <span>{asking_price_ghs ? Number(asking_price_ghs).toFixed(2) : '0.00'}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>/kg</span>
          </div>
        </div>

        {/* Bottom Floating Stock Badge */}
        <div className="market-card__hero-bottom">
          <div className="market-card__stock-chip">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--card-accent)',
                boxShadow: '0 0 6px var(--card-accent)',
              }}
            />
            <Package size={12} style={{ color: 'var(--card-accent)' }} />
            <span>{quantity_kg ? Number(quantity_kg).toLocaleString() : '0'} kg Available</span>
          </div>

          {isOwner && (
            <span
              style={{
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(34, 197, 94, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#22c55e',
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
      </div>

      {/* ── Card Body (Seamlessly integrated with active Theme) ── */}
      <div className="market-card__body">
        {/* Subtle organic watermark of the crop picture */}
        <div 
          className="market-card__body-watermark" 
          style={{ backgroundImage: `url(${theme.image})` }} 
        />

        {/* Farmer Header */}
        <div className="market-card__farmer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
            {/* Avatar */}
            <div 
              className="market-card__farmer-avatar"
              style={{ background: `linear-gradient(135deg, var(--card-accent), #15803d)` }}
            >
              {farmerInitial}
            </div>

            <div className="market-card__farmer-meta">
              <div className="market-card__farmer-name">
                <span>{farmer_name || 'Verified Farmer'}</span>
                <CheckCircle2 size={13} style={{ color: 'var(--card-accent)', flexShrink: 0 }} />
              </div>
              {farmer_phone && (
                <div className="market-card__farmer-phone">
                  <Phone size={10} />
                  <span>{farmer_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="market-card__desc">
            {description}
          </p>
        )}

        {/* Tags: Location & Harvest Date */}
        <div className="market-card__tags">
          {(farmer_district || farmer_region) && (
            <div className="market-card__tag">
              <MapPin size={12} style={{ color: 'var(--card-accent)', flexShrink: 0 }} />
              <span>{[farmer_district, farmer_region].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {harvest_date && (
            <div className="market-card__tag">
              <Calendar size={12} style={{ color: 'var(--card-accent)', flexShrink: 0 }} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Action CTA */}
        {!preview && (
          <div className="market-card__cta">
            {isOwner ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--card-accent)' }} />
                <span>Active on Market Exchange</span>
              </div>
            ) : (
              <button
                type="button"
                className="market-card__cta-btn"
                onClick={() => handleAction && handleAction(listing)}
              >
                <MessageCircle size={16} />
                <span>Contact Farmer</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


