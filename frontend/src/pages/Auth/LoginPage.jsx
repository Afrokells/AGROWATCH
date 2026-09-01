import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Logo from '../../components/UI/Logo';
import { Phone, Lock, ChevronLeft } from 'lucide-react';
import authBg from '../../assets/auth_bg.png';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(phone, password);
      if (user?.user_role === 'admin' || user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
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
        background: 'linear-gradient(to bottom, var(--bg-base), transparent 40%, var(--bg-base))',
        opacity: 0.9,
        zIndex: 1
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)', fontSize: '0.875rem', fontWeight: 500 }}>
          <ChevronLeft size={16} /> Back to Home
        </Link>
        
        <Card style={{ padding: 'var(--sp-10)', background: 'var(--bg-surface)', opacity: 0.95, backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
            <Logo size={48} showText={false} style={{ margin: '0 auto var(--sp-4)', display: 'flex', justifyContent: 'center' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4, color: 'var(--text-primary)' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Securely login to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="+233 24..."
                  style={{ paddingLeft: 44 }}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  style={{ paddingLeft: 44 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} style={{ marginTop: 'var(--sp-2)' }}>
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: 'var(--sp-8)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            New to AgroWatch? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
