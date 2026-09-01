import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Plus, Search, Calendar, Target, AlertTriangle, ArrowRight, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { farmsAPI, scansAPI } from '../../services/api';
import { CROP_ICONS } from '../../data/constants';

export default function Scans() {
  const { user, isAdmin } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('all');

  useEffect(() => {
    async function loadScans() {
      try {
        if (isAdmin) {
          const allScans = await scansAPI.list();
          const sorted = [...allScans].sort((a, b) => new Date(b.scan_date || b.created_at) - new Date(a.scan_date || a.created_at));
          setScans(sorted);
        } else {
          const [userFarms, allScans] = await Promise.all([
            farmsAPI.list(user?.id),
            scansAPI.list()
          ]);
          const userFarmIds = new Set(userFarms.map(f => f.id));
          const userScans = allScans.filter(s => userFarmIds.has(s.farm) || userFarmIds.has(s.farm_id));
          
          // Sort by date descending
          const sorted = [...userScans].sort((a, b) => new Date(b.scan_date || b.created_at) - new Date(a.scan_date || a.created_at));
          setScans(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScans();
  }, [user, isAdmin]);

  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.farm_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = cropFilter === 'all' || scan.crop_type === cropFilter;
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">{isAdmin ? 'All Drone Scans' : 'Drone Scan History'}</h1>
          <p className="page-subtitle">
            {isAdmin ? 'System-wide monitoring logs across all farm plots.' : 'View and analyze all past crop monitoring scans.'}
          </p>
        </div>
        {!isAdmin && (
          <Link to="/scan">
            <Button icon={<Plus size={18} />}>New Drone Scan</Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 250px)' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by farm name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: 'var(--sp-3) var(--sp-3) var(--sp-3) 44px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                outline: 'none', fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div className="filter-scroll">
            {['all', 'tomato', 'maize', 'pineapple'].map(crop => (
              <button
                key={crop}
                onClick={() => setCropFilter(crop)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: cropFilter === crop ? 'var(--accent)' : 'var(--bg-input)',
                  color: cropFilter === crop ? '#0a1410' : 'var(--text-secondary)',
                  border: `1px solid ${cropFilter === crop ? 'var(--accent)' : 'var(--border)'}`,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Scans List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filteredScans.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <ScanLine size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--sp-4)' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)' }}>No Scans Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {scans.length === 0 
              ? "You haven't uploaded any drone scans yet." 
              : "No scans match your search or filter criteria."}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredScans.map(scan => (
            <Card key={scan.id} style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {CROP_ICONS[scan.crop_type] || <Sprout size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>{scan.farm_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} /> {new Date(scan.scan_date || scan.created_at).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span style={{ textTransform: 'capitalize' }}>{scan.crop_type}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                      Plants
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <Target size={14} className="text-accent" /> {scan.total_plants}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                      Issues
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <AlertTriangle size={14} className={scan.disease_flags > 0 ? "text-danger" : "text-accent"} /> 
                      <span className={scan.disease_flags > 0 ? "text-danger" : ""}>{scan.disease_flags}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link to={`/scan/${scan.id}`}>
                    <Button variant="ghost" iconRight={<ArrowRight size={16} />}>
                      View Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
