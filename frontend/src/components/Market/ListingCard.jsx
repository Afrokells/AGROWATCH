import Card from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import { CROP_ICONS, CROP_COLORS } from '../../data/constants';
import { MapPin, Calendar, ShoppingCart } from 'lucide-react';

export default function ListingCard({ listing, onEnquire }) {
  const {
    crop_type, farmer_name, farmer_region, farmer_district,
    quantity_kg, asking_price_ghs, harvest_date, description
  } = listing;
  
  const colors = CROP_COLORS[crop_type] || CROP_COLORS.tomato;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          background: colors.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.5rem',
        }}>
          {CROP_ICONS[crop_type]}
        </div>
        <Badge label={`${asking_price_ghs} GHS/kg`} variant="accent" />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ textTransform: 'capitalize', fontSize: '1.125rem', marginBottom: 4 }}>
          {crop_type} - {quantity_kg}kg
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <MapPin size={14} /> {farmer_district}, {farmer_region}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} /> Harvest: {new Date(harvest_date).toLocaleDateString()}
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{farmer_name} ({listing.farmer_phone})</span>
        </div>
        <Button 
          variant="secondary" 
          fullWidth 
          icon={<ShoppingCart size={16} />}
          onClick={() => onEnquire(listing)}
        >
          Contact Farmer
        </Button>
      </div>
    </Card>
  );
}
