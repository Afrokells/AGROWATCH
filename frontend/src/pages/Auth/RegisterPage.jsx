import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Select from '../../components/UI/Select';
import Logo from '../../components/UI/Logo';
import { 
  User, Phone, Lock, MapPin, ChevronLeft, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ShieldCheck, Info, XCircle 
} from 'lucide-react';
import { REGIONS, REGIONS_DISTRICTS } from '../../data/constants';
import authBg from '../../assets/auth_bg.png';

// Recognized Ghana Telecom Prefixes
const GHANA_PREFIXES = {
  '24': 'MTN', '54': 'MTN', '55': 'MTN', '59': 'MTN', '25': 'MTN',
  '20': 'Telecel', '50': 'Telecel',
  '27': 'AT', '57': 'AT', '26': 'AT', '56': 'AT',
  '28': 'Expresso', '23': 'Glo'
};

const DUMMY_NAMES = new Set([
  'test', 'dummy', 'admin', 'administrator', 'user', 'guest', 'null', 'none', 'fake',
  'asdf', 'qwerty', 'farmer', 'buyer', 'demo', 'sample', 'nobody', 'unknown', 'testuser',
  'firstname', 'lastname', 'myname', 'john doe', 'jane doe', 'abc', 'xyz'
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
  const [submitErrors, setSubmitErrors] = useState([]);
  
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── 1. Full Name Validation ───────────────────────────────────────────────
  const nameValidation = useMemo(() => {
    const raw = formData.full_name.trim();
    if (!raw) {
      return { 
        isValid: false, 
        status: 'empty', 
        message: 'Requirement: Enter your legal First & Last name (e.g. Kwame Mensah). Letters only.' 
      };
    }
    if (!/^[A-Za-zÀ-ÿ\s\-\']+$/.test(raw)) {
      return { 
        isValid: false, 
        status: 'invalid', 
        message: 'Name contains numbers or symbols. Only letters, hyphens, and apostrophes are allowed.' 
      };
    }
    const words = raw.split(/\s+/);
    if (words.length < 2) {
      return { 
        isValid: false, 
        status: 'invalid', 
        message: 'Please provide both your First Name and Last Name (minimum 2 words).' 
      };
    }
    for (const w of words) {
      if (w.length < 2) {
        return { isValid: false, status: 'invalid', message: `Name segment '${w}' is too short (min 2 letters).` };
      }
      if (DUMMY_NAMES.has(w.toLowerCase())) {
        return { isValid: false, status: 'invalid', message: `'${w}' is a placeholder. Please use your real legal name.` };
      }
    }
    return { isValid: true, status: 'valid', message: 'Legitimate legal full name verified.' };
  }, [formData.full_name]);

  // ── 2. Phone Number Validation ────────────────────────────────────────────
  const phoneValidation = useMemo(() => {
    const raw = formData.phone_number.trim().replace(/[\s\-\(\)]/g, '');
    if (!raw) {
      return { 
        isValid: false, 
        network: null, 
        status: 'empty', 
        message: 'Requirement: 10-digit Ghana mobile number (024/050/027...) or international format (+233...).' 
      };
    }

    const digits = raw.replace(/\D/g, '');
    
    // Check for repetitive/dummy numbers
    if (new Set(digits).size <= 2 && digits.length >= 6) {
      return { 
        isValid: false, 
        network: null, 
        status: 'invalid', 
        message: 'Repeated dummy numbers (e.g. 0000000000, 1111111111) are rejected.' 
      };
    }
    if ('0123456789012345'.includes(digits) || '9876543210987654'.includes(digits)) {
      return { 
        isValid: false, 
        network: null, 
        status: 'invalid', 
        message: 'Sequential numbers (e.g. 1234567890) are not legitimate contact numbers.' 
      };
    }

    // Local Ghana format (e.g. 0241234567)
    if (raw.startsWith('0') && digits.length === 10) {
      const pfx = digits.substring(1, 3);
      const network = GHANA_PREFIXES[pfx];
      if (network) {
        return { isValid: true, network: `${network} Ghana`, status: 'valid', message: `Verified ${network} Ghana number` };
      }
      return { 
        isValid: false, 
        network: null, 
        status: 'invalid', 
        message: `'0${pfx}' is not a recognized Ghana telecom network prefix (use MTN, Telecel, or AT).` 
      };
    }

    // International Ghana format (+233 24...)
    if ((raw.startsWith('+233') || raw.startsWith('233')) && digits.length === 12) {
      const pfx = digits.substring(3, 5);
      const network = GHANA_PREFIXES[pfx];
      if (network) {
        return { isValid: true, network: `${network} Ghana`, status: 'valid', message: `Verified ${network} Ghana number` };
      }
      return { 
        isValid: false, 
        network: null, 
        status: 'invalid', 
        message: `'${pfx}' is not an active Ghana network prefix.` 
      };
    }

    // General International format (10 - 15 digits)
    if (raw.startsWith('+') && digits.length >= 10 && digits.length <= 15) {
      return { isValid: true, network: 'International', status: 'valid', message: 'Valid international phone format.' };
    }

    return { 
      isValid: false, 
      network: null, 
      status: 'invalid', 
      message: 'Invalid length or format. Enter a 10-digit Ghana number (e.g. 024XXXXXXX) or +233XXXXXXXXX.' 
    };
  }, [formData.phone_number]);

  // ── 3. Password Strength Validation ───────────────────────────────────────
  const passwordValidation = useMemo(() => {
    const pass = formData.password;
    if (!pass) {
      return { 
        score: 0, 
        isValid: false, 
        status: 'empty', 
        message: 'Requirement: Minimum 8 characters with a mix of letters (A-Z) and numbers (0-9).' 
      };
    }

    const hasMinLen = pass.length >= 8;
    const hasLetters = /[A-Za-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    let score = 0;
    if (hasMinLen) score += 1;
    if (hasLetters && hasNumbers) score += 1;
    if (pass.length >= 10 || hasSpecial) score += 1;

    const lower = pass.toLowerCase();
    const isCommon = ['password', '12345678', 'admin123', 'agrowatch123', 'qwerty123'].includes(lower);

    if (isCommon) {
      return { 
        score: 1, 
        isValid: false, 
        status: 'invalid', 
        message: 'This password is too common and easily guessed. Choose a stronger password.' 
      };
    }

    if (!hasMinLen) {
      return { score: 1, isValid: false, status: 'invalid', message: `Password is too short (${pass.length}/8 characters).` };
    }
    if (!hasLetters) {
      return { score: 1, isValid: false, status: 'invalid', message: 'Password must contain at least one letter (a-z or A-Z).' };
    }
    if (!hasNumbers) {
      return { score: 1, isValid: false, status: 'invalid', message: 'Password must contain at least one numeric digit (0-9).' };
    }

    return { 
      score, 
      isValid: true, 
      status: 'valid', 
      message: score >= 3 ? 'Very strong password.' : 'Good password.' 
    };
  }, [formData.password]);

  // ── 4. Location Validation ────────────────────────────────────────────────
  const locationValidation = useMemo(() => {
    if (!formData.region) {
      return { isValid: false, message: 'Requirement: Select your administrative Region in Ghana.' };
    }
    if (!formData.district) {
      return { isValid: false, message: 'Requirement: Select your municipal/district assembly.' };
    }
    return { isValid: true, message: 'Verified location in Ghana.' };
  }, [formData.region, formData.district]);

  // ── Handle Registration Submission ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitErrors([]);

    // Collect all credential failure reasons
    const errors = [];
    if (!nameValidation.isValid) {
      errors.push(`Full Name: ${nameValidation.message}`);
    }
    if (!phoneValidation.isValid) {
      errors.push(`Phone Number: ${phoneValidation.message}`);
    }
    if (!passwordValidation.isValid) {
      errors.push(`Password: ${passwordValidation.message}`);
    }
    if (!formData.region) {
      errors.push('Region: Please select an administrative Region in Ghana.');
    }
    if (!formData.district) {
      errors.push('District: Please select your official District assembly.');
    }

    if (errors.length > 0) {
      setSubmitErrors(errors);
      addToast('Please correct the highlighted requirements before submitting.', 'error');
      // Scroll to top of form to view reasons
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const data = err.response?.data;
      const reasons = [];

      if (data) {
        if (typeof data === 'string') {
          reasons.push(data);
        } else if (data.detail && typeof data.detail === 'string') {
          reasons.push(data.detail);
        } else if (data.error && typeof data.error === 'string') {
          reasons.push(data.error);
        }

        // Parse any field-specific errors
        const fieldErrors = data.errors || (typeof data === 'object' ? data : {});
        if (typeof fieldErrors === 'object' && fieldErrors !== null) {
          Object.entries(fieldErrors).forEach(([field, msgs]) => {
            if (field === 'detail' || field === 'error' || field === 'errors') return;
            const fieldTitle = field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
            const msgText = Array.isArray(msgs) ? msgs[0] : (typeof msgs === 'object' ? JSON.stringify(msgs) : String(msgs));
            const formatted = `${fieldTitle}: ${msgText}`;
            if (!reasons.includes(formatted)) {
              reasons.push(formatted);
            }
          });
        }
      }

      if (reasons.length === 0) {
        reasons.push(err.message || 'Registration failed. Please verify all contact credentials and try again.');
      }

      setSubmitErrors(reasons);
      addToast(reasons[0] || 'Registration failed.', 'error');
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
            <h2>Create Verified Account</h2>
            <p>Join the future of agricultural intelligence</p>
          </div>

          {/* Registration Failure Summary Alert */}
          {submitErrors.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: 'var(--sp-4)',
              color: 'var(--danger)',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6 }}>
                <XCircle size={18} />
                <span>Registration Failed — Please Fix the Following:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {submitErrors.map((errText, idx) => (
                  <li key={idx}><strong>{errText}</strong></li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Role Toggle */}
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

            {/* ── 1. Full Name Field ─────────────────────────────────────── */}
            <div className="form-group register-form__full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" htmlFor="register-full-name" style={{ margin: 0 }}>
                  Full Legal Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                {formData.full_name && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: nameValidation.isValid ? 'var(--accent)' : 'var(--danger)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    fontWeight: 600
                  }}>
                    {nameValidation.isValid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    {nameValidation.isValid ? 'Valid Name' : 'Invalid Name'}
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
                  style={{
                    borderColor: formData.full_name ? (nameValidation.isValid ? 'var(--accent)' : 'var(--danger)') : 'var(--border)'
                  }}
                />
              </div>

              {/* Requirement & Failure Reason */}
              <div style={{ 
                fontSize: '0.75rem', 
                marginTop: 4, 
                color: formData.full_name && !nameValidation.isValid ? 'var(--danger)' : 'var(--text-muted)',
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 4 
              }}>
                <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{nameValidation.message}</span>
              </div>
            </div>

            {/* ── 2. Phone Number Field ──────────────────────────────────── */}
            <div className="form-group register-form__full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" htmlFor="register-phone" style={{ margin: 0 }}>
                  Mobile Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                {formData.phone_number && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: phoneValidation.isValid ? 'var(--accent)' : 'var(--danger)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    fontWeight: 600
                  }}>
                    {phoneValidation.isValid ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>{phoneValidation.network ? `Verified [${phoneValidation.network}]` : 'Valid Phone'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} />
                        <span>Invalid Number</span>
                      </>
                    )}
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
                  style={{
                    borderColor: formData.phone_number ? (phoneValidation.isValid ? 'var(--accent)' : 'var(--danger)') : 'var(--border)'
                  }}
                />
              </div>

              {/* Requirement & Failure Reason */}
              <div style={{ 
                fontSize: '0.75rem', 
                marginTop: 4, 
                color: formData.phone_number && !phoneValidation.isValid ? 'var(--danger)' : 'var(--text-muted)',
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 4 
              }}>
                <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{phoneValidation.message}</span>
              </div>
            </div>

            {/* ── 3. Password Field ──────────────────────────────────────── */}
            <div className="form-group register-form__full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" htmlFor="register-password" style={{ margin: 0 }}>
                  Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                {formData.password && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: passwordValidation.isValid ? 'var(--accent)' : 'var(--danger)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    fontWeight: 600
                  }}>
                    {passwordValidation.isValid ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
                    {passwordValidation.message}
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
                  style={{
                    borderColor: formData.password ? (passwordValidation.isValid ? 'var(--accent)' : 'var(--danger)') : 'var(--border)'
                  }}
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password visual meter */}
              {formData.password && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        height: 3,
                        flex: 1,
                        borderRadius: 2,
                        background: passwordValidation.score >= lvl 
                          ? (passwordValidation.score === 1 ? 'var(--danger)' : passwordValidation.score === 2 ? 'var(--amber)' : 'var(--accent)') 
                          : 'var(--border)',
                        transition: 'background 0.2s'
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Requirement & Failure Reason */}
              <div style={{ 
                fontSize: '0.75rem', 
                marginTop: 4, 
                color: formData.password && !passwordValidation.isValid ? 'var(--danger)' : 'var(--text-muted)',
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 4 
              }}>
                <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{passwordValidation.message}</span>
              </div>
            </div>

            {/* ── 4. Region in Ghana ─────────────────────────────────────── */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Select
                label="Region in Ghana *"
                icon={MapPin}
                options={REGIONS.map(region => ({ value: region, label: region }))}
                value={formData.region}
                onChange={(val) => setFormData(prev => ({ ...prev, region: val, district: '' }))}
                placeholder="Select region in Ghana"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Info size={12} /> Requirement: Select your official administrative region.
              </span>
            </div>

            {/* ── 5. District Assembly ───────────────────────────────────── */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Select
                label="District / Municipal Assembly *"
                options={(REGIONS_DISTRICTS[formData.region] || []).map(district => ({ value: district, label: district }))}
                value={formData.district}
                onChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
                placeholder={formData.region ? 'Select district assembly' : 'Select a region first'}
                disabled={!formData.region}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Info size={12} /> Requirement: Select your local district/assembly location.
              </span>
            </div>

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
