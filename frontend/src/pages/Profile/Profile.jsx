import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Select from '../../components/UI/Select';
import { Phone, MapPin, Shield, Edit2, LogOut, Save, Camera, Upload } from 'lucide-react';
import { API_ORIGIN, authAPI } from '../../services/api';
import { REGIONS } from '../../data/constants';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
};

const getMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
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
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const profilePictureUrl = useMemo(
    () => getMediaUrl(user?.profile_picture),
    [user?.profile_picture]
  );

  useEffect(() => {
    if (!profilePictureFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(profilePictureFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePictureFile]);

  if (!user) return null;

  const openEditModal = () => {
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      region: user.region || '',
      district: user.district || ''
    });
    setProfilePictureFile(null);
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setProfilePictureFile(null);
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please choose an image file.', 'error');
      return;
    }

    setProfilePictureFile(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('full_name', formData.full_name);
      payload.append('phone_number', formData.phone_number);
      payload.append('region', formData.region);
      payload.append('district', formData.district);

      if (profilePictureFile) {
        payload.append('profile_picture', profilePictureFile);
      }

      const updatedData = await authAPI.updateProfile(user.id, payload);
      updateUser(updatedData);
      addToast('Profile updated successfully!', 'success');
      closeEditModal();
    } catch (err) {
      console.error(err);
      addToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayImageUrl = previewUrl || profilePictureUrl;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your account settings and regional preferences.</p>
      </div>

      <div className="grid-profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <Card style={{ textAlign: 'center', padding: 'clamp(var(--sp-6), 4vw, var(--sp-10))' }}>
            <Avatar imageUrl={profilePictureUrl} name={user.full_name} size={100} />
            <h2 style={{ fontSize: '1.25rem', margin: 'var(--sp-6) 0 4px' }}>{user.full_name}</h2>
            <Badge label={user.user_role} variant="accent" dot />
            <div style={{ marginTop: 'var(--sp-8)' }}>
              <Button variant="ghost" fullWidth icon={<Edit2 size={16} />} onClick={openEditModal}>
                Edit Profile
              </Button>
            </div>
          </Card>

          <Button variant="danger" fullWidth icon={<LogOut size={18} />} onClick={logout}>Sign Out</Button>
        </div>

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

      <Modal open={isEditing} onClose={closeEditModal} title="Edit Profile" width={520}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <Avatar imageUrl={displayImageUrl} name={formData.full_name} size={76} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <label
                htmlFor="profile-picture"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Upload size={16} /> Upload Photo
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                style={{ display: 'none' }}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 'var(--sp-2)' }}>
                JPG, PNG, or WebP image.
              </p>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              style={inputStyle}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              style={inputStyle}
              autoComplete="tel"
              required
            />
          </div>

          <Select
            label="Region"
            options={REGIONS}
            value={formData.region}
            onChange={(val) => setFormData(prev => ({ ...prev, region: val }))}
          />

          <div>
            <label style={labelStyle}>District</label>
            <input
              type="text"
              value={formData.district}
              onChange={e => setFormData(prev => ({ ...prev, district: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <Button type="button" variant="ghost" onClick={closeEditModal} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save size={16} />} loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Avatar({ imageUrl, name, size }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--accent-dim)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: size > 80 ? '2.5rem' : '1.5rem',
      color: 'var(--accent)',
      margin: size > 80 ? '0 auto' : 0,
      boxShadow: 'var(--shadow-glow)',
      border: '2px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {imageUrl ? (
        <img src={imageUrl} alt={name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <Camera size={size > 80 ? 26 : 20} style={{ position: 'absolute', opacity: 0.18, transform: 'translate(22px, 22px)' }} />
          {getInitials(name)}
        </>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value, status }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '1rem', fontWeight: 500 }}>{value || 'Not set'}</div>
      </div>
      {status && <Badge label="Verified" variant={status} dot />}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: 'var(--sp-2)',
  fontWeight: 500,
  fontSize: '0.875rem'
};

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
