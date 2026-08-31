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
    <main className="register-page">
      <div
        className="register-page__bg"
        style={{ backgroundImage: `url(${authBg})` }}
      />
      <div className="register-page__overlay" />

      <div className="register-page__content">
        <Link to="/" className="register-page__back">
          <ChevronLeft size={16} /> Back to Home
        </Link>

        <Card className="register-card" hover={false}>
          <div className="register-card__header">
            <div className="register-card__logo">
              <Leaf size={28} color="#0a1410" strokeWidth={2.5} />
              <Leaf size={28} color="var(--accent-contrast)" strokeWidth={2.5} />
            </div>
            <h2>Create Your Account</h2>
            <p>Join the future of agricultural intelligence</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-role-toggle register-form__full">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                className={formData.role === 'farmer' ? 'is-active' : ''}
              >
                I'm a Farmer
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                className={formData.role === 'buyer' ? 'is-active' : ''}
              >
                I'm a Buyer
              </button>
            </div>

            <div className="form-group register-form__full">
              <label className="form-label" htmlFor="register-full-name">Full Name</label>
              <div className="register-input-wrap">
                <User size={18} />
                <input
                  id="register-full-name"
                  name="full_name"
                  className="form-input"
                  placeholder="e.g. Kwame Asante"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">Phone Number</label>
              <div className="register-input-wrap">
                <Phone size={18} />
                <input
                  id="register-phone"
                  name="phone_number"
                  type="tel"
                  className="form-input"
                  placeholder="+233..."
                  value={formData.phone_number}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="register-input-wrap">
                <Lock size={18} />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <Select
              label="Region"
              icon={MapPin}
              options={REGIONS.map(region => ({ value: region, label: region }))}
              value={formData.region}
              onChange={(val) => setFormData(prev => ({ ...prev, region: val, district: '' }))}
              placeholder="Select region"
            />

            <Select
              label="District"
              options={(REGIONS_DISTRICTS[formData.region] || []).map(district => ({ value: district, label: district }))}
              value={formData.district}
              onChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
              placeholder={formData.region ? 'Select district' : 'Select a region first'}
              disabled={!formData.region}
            />

            <div className="register-form__full">
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create Account
              </Button>
            </div>
          </form>

          <div className="register-card__footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
