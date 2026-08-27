import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Select from '../../components/UI/Select';
import { Leaf, User, Phone, Lock, MapPin, ChevronLeft } from 'lucide-react';
import { REGIONS, REGIONS_DISTRICTS } from '../../data/constants';
import authBg from '../../assets/auth_bg.png';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    role: 'farmer',
    region: '',
    district: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      if (user?.user_role === 'admin' || user?.role === 'admin' || formData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addToast('Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 'var(--sp-6)',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-base)'
    }}>
      {/* Background Image with Theme-aware Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
        opacity: 0.6
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--bg-base), transparent 40%, var(--bg-base))',
        opacity: 0.9,
        zIndex: 1
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 540 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)', fontSize: '0.875rem', fontWeight: 500 }}>
          <ChevronLeft size={16} /> Back to Home
        </Link>

        <Card style={{ padding: 'var(--sp-10)', background: 'var(--bg-surface)', opacity: 0.95, backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-4)' }}>
              <Leaf size={28} color="#0a1410" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4, color: 'var(--text-primary)' }}>Create Your Account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Join the future of agricultural intelligence</p>
          </div>

          <form onSubmit={handleSubmit} className="grid-2" style={{ gap: 'var(--sp-5)' }}>
            <div style={{ gridColumn: 'span 2', display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--border)' }}>
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, role: 'farmer'}))}
                style={{ flex: 1, padding: '8px', borderRadius: 'calc(var(--radius-md) - 2px)', background: formData.role === 'farmer' ? 'var(--accent)' : 'transparent', color: formData.role === 'farmer' ? '#0a1410' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.2s ease' }}
              >
                I'm a Farmer
              </button>
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, role: 'buyer'}))}
                style={{ flex: 1, padding: '8px', borderRadius: 'calc(var(--radius-md) - 2px)', background: formData.role === 'buyer' ? 'var(--accent)' : 'transparent', color: formData.role === 'buyer' ? '#0a1410' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.2s ease' }}
              >
                I'm a Buyer
              </button>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="full_name" className="form-input" placeholder="e.g. Kwame Asante" style={{ paddingLeft: 44 }} value={formData.full_name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="phone_number" className="form-input" placeholder="+233..." style={{ paddingLeft: 44 }} value={formData.phone_number} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="password" type="password" className="form-input" placeholder="••••••••" style={{ paddingLeft: 44 }} value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <Select 
              label="Region"
              icon={MapPin}
              options={REGIONS.map(r => ({ value: r, label: r }))}
              value={formData.region}
              onChange={(val) => setFormData(p => ({...p, region: val, district: ''}))}
              placeholder="Select region"
            />

            <Select
              label="District"
              options={(REGIONS_DISTRICTS[formData.region] || []).map(d => ({ value: d, label: d }))}
              value={formData.district}
              onChange={(val) => setFormData(p => ({...p, district: val}))}
              placeholder={formData.region ? 'Select district' : 'Select a region first'}
              disabled={!formData.region}
            />

            <div style={{ gridColumn: 'span 2', marginTop: 'var(--sp-2)' }}>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create Account
              </Button>
            </div>
          </form>

          <div style={{ marginTop: 'var(--sp-8)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
