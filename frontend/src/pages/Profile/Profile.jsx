import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Select from '../../components/UI/Select';
import { Phone, MapPin, Shield, Edit2, LogOut, Save } from 'lucide-react';
import { authAPI } from '../../services/api';
import { REGIONS } from '../../data/constants';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
    : parts[0].substring(0, 2).toUpperCase();
};

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    region: '',
    district: ''
  });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const openEditModal = () => {
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      region: user.region || '',
      district: user.district || ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedData = await authAPI.updateProfile(user.id, formData);
      updateUser(updatedData);
      addToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your account settings and regional preferences.</p>
      </div>

      <div className="grid-profile">
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <Card style={{ textAlign: 'center', padding: 'clamp(var(--sp-6), 4vw, var(--sp-10))' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '2.5rem', color: 'var(--accent)',
              margin: '0 auto var(--sp-6)',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {getInitials(user?.full_name)}
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{user.full_name}</h2>
            <Badge label={user.user_role} variant="accent" dot />
            <div style={{ marginTop: 'var(--sp-8)' }}>
              <Button variant="ghost" fullWidth icon={<Edit2 size={16} />} onClick={openEditModal}>
                Edit Profile
              </Button>
            </div>
          </Card>

          <Button variant="danger" fullWidth icon={<LogOut size={18} />} onClick={logout}>Sign Out</Button>
        </div>

        {/* Details Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-6)' }}>Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              <DetailItem icon={<Phone size={20} />} label="Phone Number" value={user.phone_number} />
              <DetailItem icon={<MapPin size={20} />} label="Region & District" value={`${user.district ? user.district + ', ' : ''}${user.region}`} />
              <DetailItem icon={<Shield size={20} />} label="Identity Status" value={`Verified ${user.user_role ? user.user_role.charAt(0).toUpperCase() + user.user_role.slice(1) : 'User'}`} status="accent" />
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-6)' }}>System Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>Push Notifications</span>
                <Badge label="Enabled" variant="accent" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>Language</span>
                <Badge label="English" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal open={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile" width={480}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Full Name</label>
            <input 
              type="text" 
              value={formData.full_name} 
              onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>Phone Number</label>
            <input 
              type="text" 
              value={formData.phone_number} 
              onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>

          <Select 
            label="Region"
            options={REGIONS}
            value={formData.region}
            onChange={(val) => setFormData(p => ({ ...p, region: val }))}
          />

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500, fontSize: '0.875rem' }}>District</label>
            <input 
              type="text" 
              value={formData.district} 
              onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save size={16} />} loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DetailItem({ icon, label, value, status }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '1rem', fontWeight: 500 }}>{value}</div>
      </div>
      {status && <Badge label="Verified" variant={status} dot />}
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
