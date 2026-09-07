import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Select from '../../components/UI/Select';
import Logo from '../../components/UI/Logo';
import { User, Phone, Lock, MapPin, ChevronLeft, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { REGIONS, REGIONS_DISTRICTS } from '../../data/constants';
import authBg from '../../assets/auth_bg.png';

// Recognized Ghana Telecom Prefixes
const GHANA_PREFIXES = {
  '24': 'MTN', '54': 'MTN', '55': 'MTN', '59': 'MTN', '25': 'MTN',
  '20': 'Telecel', '50': 'Telecel',
  '27': 'AT', '57': 'AT', '26': 'AT', '56': 'AT',
};

const DUMMY_NAMES = new Set([
  'test', 'dummy', 'admin', 'user', 'guest', 'null', 'fake',
  'asdf', 'qwerty', 'farmer', 'buyer', 'demo', 'sample', 'nobody', 'unknown'
]);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    role: 'farmer',
    region: '',
    district: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── Real-Time Validation Feedback ─────────────────────────────────────────
  const nameValidation = useMemo(() => {
    const trimmed = formData.full_name.trim();
    if (!trimmed) return { isValid: false, message: '' };
    if (!/^[A-Za-zÀ-ÿ\s\-\']+$/.test(trimmed)) {
      return { isValid: false, message: 'Name must contain only letters (no numbers or symbols)' };
    }
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
      return { isValid: false, message: 'Please enter both your First and Last name' };
    }
    for (const w of words) {
      if (w.length < 2) return { isValid: false, message: `Name segment '${w}' is too short` };
      if (DUMMY_NAMES.has(w.toLowerCase())) return { isValid: false, message: 'Please use your real legal name' };
    }
    return { isValid: true, message: 'Valid full name' };
  }, [formData.full_name]);

  const phoneValidation = useMemo(() => {
    const raw = formData.phone_number.trim().replace(/[\s\-\(\)]/g, '');
    if (!raw) return { isValid: false, network: null, message: '' };

    const digits = raw.replace(/\D/g, '');
    
    // Check for repetitive/dummy numbers
    if (new Set(digits).size <= 2 && digits.length >= 6) {
      return { isValid: false, network: null, message: 'Repeated dummy numbers (e.g. 000000) are not allowed' };
    }
    if ('0123456789012345'.includes(digits) || '9876543210987654'.includes(digits)) {
      return { isValid: false, network: null, message: 'Sequential dummy numbers are not permitted' };
    }

    // Local Ghana format (e.g. 0241234567)
    if (raw.startsWith('0') && digits.length === 10) {
      const pfx = digits.substring(1, 3);
      const network = GHANA_PREFIXES[pfx];
      if (network) {
        return { isValid: true, network, message: `Valid ${network} Ghana number` };
      }
      return { isValid: false, network: null, message: `'0${pfx}' is not a recognized Ghana network prefix` };
    }

    // International Ghana format (+233 24...)
    if ((raw.startsWith('+233') || raw.startsWith('233')) && digits.length === 12) {
      const pfx = digits.substring(3, 5);
      const network = GHANA_PREFIXES[pfx];
      if (network) {
        return { isValid: true, network, message: `Valid ${network} Ghana number` };
      }
      return { isValid: false, network: null, message: `'${pfx}' is not a recognized Ghana network prefix` };
    }

    // General International format (10 - 15 digits)
    if (raw.startsWith('+') && digits.length >= 10 && digits.length <= 15) {
      return { isValid: true, network: 'International', message: 'Valid international number' };
    }

    return { isValid: false, network: null, message: 'Enter a valid phone (e.g. 024 XXX XXXX or +233...)' };
  }, [formData.phone_number]);

  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: '', isValid: false, message: '' };

    const hasMinLen = pass.length >= 8;
    const hasLetters = /[A-Za-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    let score = 0;
    if (hasMinLen) score += 1;
    if (hasLetters && hasNumbers) score += 1;
    if (pass.length >= 10 || hasSpecial) score += 1;

    const isValid = hasMinLen && hasLetters && hasNumbers;
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];

    let message = '';
    if (!hasMinLen) message = 'Must be at least 8 characters';
    else if (!hasLetters || !hasNumbers) message = 'Must include both letters and numbers';
    else message = 'Strong secure password';

    return { score, label: labels[score], isValid, message };
  }, [formData.password]);

  // ── Form Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameValidation.isValid) {
      addToast(nameValidation.message || 'Please provide your legitimate First & Last name.', 'error');
      return;
    }

    if (!phoneValidation.isValid) {
      addToast(phoneValidation.message || 'Please enter a legitimate mobile phone number.', 'error');
      return;
    }

    if (!passwordStrength.isValid) {
      addToast(passwordStrength.message || 'Password must be at least 8 characters with letters & numbers.', 'error');
      return;
    }

    if (!formData.region || !formData.district) {
      addToast('Please select your Region and District in Ghana.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      addToast('Account created successfully! Welcome to AgroWatch.', 'success');
      if (user?.user_role === 'admin' || user?.role === 'admin' || formData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.response?.data?.error || (typeof err.response?.data === 'object' ? Object.values(err.response.data)[0] : null) || 'Registration failed. Please check your credentials.';
      const finalMsg = Array.isArray(detail) ? detail[0] : detail;
      addToast(String(finalMsg), 'error');
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
            <Logo size={48} showText={false} style={{ margin: '0 auto var(--sp-4)', display: 'flex', justifyContent: 'center' }} />
            <h2>Create Your Account</h2>
            <p>Join the agricultural intelligence platform</p>
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

            {/* Full Name */}
            <div className="form-group register-form__full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="register-full-name">Full Legal Name</label>
                {formData.full_name && (
                  <span style={{ fontSize: '0.75rem', color: nameValidation.isValid ? 'var(--accent)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {nameValidation.isValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {nameValidation.message}
                  </span>
                )}
              </div>
              <div className="register-input-wrap">
                <User size={18} />
                <input
                  id="register-full-name"
                  name="full_name"
                  className="form-input"
                  placeholder="e.g. Kwame Mensah"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group register-form__full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="register-phone">Mobile Phone Number</label>
                {formData.phone_number && (
                  <span style={{ fontSize: '0.75rem', color: phoneValidation.isValid ? 'var(--accent)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {phoneValidation.isValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {phoneValidation.message}
                  </span>
                )}
              </div>
              <div className="register-input-wrap">
                <Phone size={18} />
                <input
                  id="register-phone"
                  name="phone_number"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 024 123 4567 or +233..."
                  value={formData.phone_number}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group register-form__full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="register-password">Password</label>
                {formData.password && (
                  <span style={{ fontSize: '0.75rem', color: passwordStrength.isValid ? 'var(--accent)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {passwordStrength.isValid ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                    {passwordStrength.message}
                  </span>
                )}
              </div>
              <div className="register-input-wrap" style={{ position: 'relative' }}>
                <Lock size={18} />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 8 chars (letters & numbers)"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength visual meter */}
              {formData.password && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        height: 3,
                        flex: 1,
                        borderRadius: 2,
                        background: passwordStrength.score >= lvl 
                          ? (passwordStrength.score === 1 ? 'var(--danger)' : passwordStrength.score === 2 ? 'var(--amber)' : 'var(--accent)') 
                          : 'var(--border)',
                        transition: 'background 0.2s'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Region & District */}
            <Select
              label="Region"
              icon={MapPin}
              options={REGIONS.map(region => ({ value: region, label: region }))}
              value={formData.region}
              onChange={(val) => setFormData(prev => ({ ...prev, region: val, district: '' }))}
              placeholder="Select region in Ghana"
            />

            <Select
              label="District"
              options={(REGIONS_DISTRICTS[formData.region] || []).map(district => ({ value: district, label: district }))}
              value={formData.district}
              onChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
              placeholder={formData.region ? 'Select district' : 'Select a region first'}
              disabled={!formData.region}
            />

            <div className="register-form__full" style={{ marginTop: 'var(--sp-2)' }}>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create Verified Account
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
