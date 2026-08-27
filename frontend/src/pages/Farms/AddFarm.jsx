import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Select from '../../components/UI/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { farmsAPI } from '../../services/api';
import { CROPS, REGIONS, REGIONS_DISTRICTS } from '../../data/constants';

export default function AddFarm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    farm_name: '',
    crop_type: '',
    region: '',
    district: '',
    area_ha: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop_type || !formData.region || !formData.district) return;
    
    setIsSubmitting(true);
    try {
      await farmsAPI.create({
        ...formData,
        farmer: user?.id,
        area_ha: Number(formData.area_ha)
      });
      addToast('Farm registered successfully!', 'success');
      navigate('/farms');
    } catch (err) {
      console.error(err);
      addToast('Failed to register farm', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <button 
          onClick={() => navigate('/farms')}
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
          <h1 className="page-title" style={{ margin: 0 }}>Register New Farm</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>Add a new plot to start monitoring its health.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Farm / Plot Name</label>
            <input 
              type="text" 
              name="farm_name" 
              value={formData.farm_name} 
              onChange={handleChange}
              placeholder="e.g. North Field"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <Select 
              label="Crop Type"
              value={formData.crop_type}
              onChange={(val) => setFormData(prev => ({ ...prev, crop_type: val }))}
              options={CROPS.map(crop => ({ value: crop, label: crop.charAt(0).toUpperCase() + crop.slice(1) }))}
              placeholder="Select crop type"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <div>
              <Select 
                label="Region"
                value={formData.region}
                onChange={(val) => setFormData(prev => ({ ...prev, region: val, district: '' }))}
                options={REGIONS.map(r => ({ value: r, label: r }))}
                placeholder="Select region"
              />
            </div>
            <div>
              <Select 
                label="District"
                value={formData.district}
                onChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
                options={(REGIONS_DISTRICTS[formData.region] || []).map(d => ({ value: d, label: d }))}
                placeholder={formData.region ? 'Select district' : 'Select a region first'}
                disabled={!formData.region}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Area (Hectares)</label>
            <input 
              type="number" 
              name="area_ha" 
              value={formData.area_ha} 
              onChange={handleChange}
              placeholder="e.g. 1.5"
              step="0.1"
              min="0.1"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 'var(--sp-2)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/farms')} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save size={18} />} loading={isSubmitting}>Register Farm</Button>
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
