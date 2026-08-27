import { useState, useEffect } from 'react';
import { farmsAPI } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Badge from '../../components/UI/Badge';
import { useToast } from '../../context/ToastContext';
import { Tractor, MapPin, Maximize, Plus, ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CROP_ICONS } from '../../data/constants';

export default function Farms() {
  const { user, isAdmin } = useAuth();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadFarms = async () => {
    try {
      const res = await farmsAPI.list(isAdmin ? null : user?.id);
      setFarms(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, [user, isAdmin]);

  const [editingFarm, setEditingFarm] = useState(null);
  const [editName, setEditName] = useState('');

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setEditName(farm.farm_name);
  };

  const handleSaveEdit = async () => {
    if (editName && editName !== editingFarm.farm_name) {
      try {
        await farmsAPI.update(editingFarm.id, { farm_name: editName });
        await loadFarms();
        setEditingFarm(null);
        addToast('Farm updated successfully!', 'success');
      } catch (err) {
        console.error(err);
        addToast("Failed to update farm.", 'error');
      }
    } else {
      setEditingFarm(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'All Registered Farms' : 'My Registered Farms'}</h1>
          <p className="page-subtitle">
            {isAdmin ? 'System-wide registry of farm plots across Ghana.' : 'Manage your field plots and crop configurations.'}
          </p>
        </div>
        {!isAdmin && (
          <Link to="/farms/new">
            <Button icon={<Plus size={18} />}>Add New Farm</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }}></div>)}
        </div>
      ) : farms.length === 0 ? (
        <div className="empty-state">
          <Tractor className="empty-state-icon" />
          <h3 className="empty-state-title">{isAdmin ? 'No Registered Farms Found' : 'No farms found'}</h3>
          <p className="empty-state-desc">
            {isAdmin 
              ? 'There are currently no farm plots registered in the system.' 
              : 'Register your first farm plot to start monitoring with drone imagery.'}
          </p>
          {!isAdmin && <Link to="/farms/new"><Button>Register a Farm</Button></Link>}
        </div>
      ) : (
        <div className="grid-3">
          {farms.map(farm => (
            <Card key={farm.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 'var(--radius-md)', 
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {CROP_ICONS[farm.crop_type] || <Leaf size={24} />}
                </div>
                <Badge label={farm.crop_type} variant="info" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{farm.farm_name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /> {farm.district}, {farm.region}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Maximize size={14} /> {farm.area_ha} Hectares
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--sp-2)', display: 'flex', gap: 'var(--sp-3)' }}>
                <Button variant="ghost" fullWidth size="sm" onClick={() => openEditModal(farm)}>Edit</Button>
                <Link to="/scan" style={{ flex: 1 }}>
                  <Button fullWidth size="sm" iconRight={<ArrowRight size={14} />}>Scan</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Farm Modal */}
      <Modal 
        open={!!editingFarm} 
        onClose={() => setEditingFarm(null)}
        title="Edit Farm Name"
        width={400}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <input 
            type="text" 
            value={editName}
            onChange={e => setEditName(e.target.value)}
            style={{
              width: '100%', padding: 'var(--sp-3)',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              outline: 'none'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
            <Button variant="ghost" onClick={() => setEditingFarm(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
