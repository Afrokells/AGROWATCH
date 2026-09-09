import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Select from '../../components/UI/Select';
import DatePicker from '../../components/UI/DatePicker';
import ListingCard from '../../components/Market/ListingCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { marketAPI } from '../../services/api';
import { CROPS } from '../../data/constants';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    crop_type: 'tomato',
    quantity_kg: '',
    asking_price_ghs: '',
    harvest_date: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop_type || !formData.harvest_date) return;
    
    setIsSubmitting(true);
    try {
      await marketAPI.create({
        ...formData,
        farmer: user?.id,
        quantity_kg: Number(formData.quantity_kg),
        asking_price_ghs: Number(formData.asking_price_ghs)
      });
      addToast('Listing created successfully!', 'success');
      navigate('/market');
    } catch (err) {
      console.error(err);
      addToast('Failed to create listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct real-time preview data
  const previewListing = {
    crop_type: formData.crop_type || 'tomato',
    quantity_kg: formData.quantity_kg || '500',
    asking_price_ghs: formData.asking_price_ghs || '15.00',
    harvest_date: formData.harvest_date || new Date().toISOString().split('T')[0],
    farmer_name: user?.full_name || 'Your Farm Name',
    farmer_phone: user?.phone_number || '+233 24 123 4567',
    farmer_region: user?.region || 'Ashanti',
    farmer_district: user?.district || 'Ejura',
    description: formData.description || 'Premium, freshly harvested produce direct from farm.',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <button 
          onClick={() => navigate('/market')}
          style={{ 
            background: 'var(--bg-input)', border: '1px solid var(--border)', 
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Create Market Listing</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>Offer your produce to verified buyers across Ghana.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)', alignItems: 'start' }}>
        {/* Form Column */}
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Select Crop Type</label>
              <Select 
                value={formData.crop_type}
                onChange={(val) => setFormData(prev => ({ ...prev, crop_type: val }))}
                options={CROPS.map(crop => ({ value: crop, label: crop.charAt(0).toUpperCase() + crop.slice(1) }))}
                placeholder="Select crop type"
              />
            </div>

            <div className="grid-2" style={{ gap: 'var(--sp-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Quantity (kg)</label>
                <input 
                  type="number" 
                  name="quantity_kg" 
                  value={formData.quantity_kg} 
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  min="1"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Asking Price (GH₵ per kg)</label>
                <input 
                  type="number" 
                  name="asking_price_ghs" 
                  value={formData.asking_price_ghs} 
                  onChange={handleChange}
                  placeholder="e.g. 15.00"
                  step="0.1"
                  min="0.1"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <DatePicker
              label="Expected Harvest Date"
              value={formData.harvest_date}
              onChange={(val) => setFormData(prev => ({ ...prev, harvest_date: val }))}
              placeholder="Select date"
            />

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                placeholder="Provide details about quality, variety, packaging, or collection arrangements..."
                rows="4"
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginTop: 'var(--sp-2)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/market')} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" icon={<Save size={18} />} loading={isSubmitting}>Publish Listing</Button>
            </div>
          </form>
        </Card>

        {/* Live Preview Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles size={14} /> Live Listing Card Preview
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updates in real-time</span>
          </div>
          
          <ListingCard 
            listing={previewListing} 
            preview={true} 
            isOwner={true} 
          />
        </div>
      </div>
    </div>
  );
}


const inputStyle = {
  width: '100%', 
  padding: 'var(--sp-3)',
  background: 'var(--bg-input)', 
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)', 
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit'
};
