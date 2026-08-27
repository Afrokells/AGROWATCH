import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Select from '../../components/UI/Select';
import DatePicker from '../../components/UI/DatePicker';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { marketAPI } from '../../services/api';
import { CROPS } from '../../data/constants';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    crop_type: '',
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
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
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>Offer your produce to verified buyers.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div>
            <Select 
              value={formData.crop_type}
              onChange={(val) => setFormData(prev => ({ ...prev, crop_type: val }))}
              options={CROPS.map(crop => ({ value: crop, label: crop.charAt(0).toUpperCase() + crop.slice(1) }))}
              placeholder="Select crop type"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
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
                placeholder="e.g. 8.50"
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
              placeholder="Provide details about quality, variety, or collection arrangements..."
              rows="4"
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginTop: 'var(--sp-2)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/market')} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save size={18} />} loading={isSubmitting}>Publish Listing</Button>
          </div>
        </form>
      </Card>
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
