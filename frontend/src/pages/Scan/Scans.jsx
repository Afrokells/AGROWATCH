import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ScanLine, Plus, Search, Calendar, Target, AlertTriangle, 
  ArrowRight, Sprout, ShieldCheck, Clock, Filter, Activity, CheckCircle2 
} from 'lucide-react';
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
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '7d', '30d', '90d'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'diseased', 'healthy'

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

  // Aggregate Metrics
  const summary = useMemo(() => {
    const totalScans = scans.length;
    const totalPlants = scans.reduce((acc, s) => acc + (s.total_plants || 0), 0);
    const totalDiseases = scans.reduce((acc, s) => acc + (s.disease_flags || 0), 0);
    const healthyScans = scans.filter(s => (s.disease_flags || 0) === 0).length;
    const healthRate = totalScans > 0 ? Math.round((healthyScans / totalScans) * 100) : 100;

    return { totalScans, totalPlants, totalDiseases, healthRate };
  }, [scans]);

  // Filtered List
  const filteredScans = useMemo(() => {
    const now = new Date();
    return scans.filter(scan => {
      // 1. Search term
      const matchesSearch = scan.farm_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Crop filter
      const matchesCrop = cropFilter === 'all' || scan.crop_type === cropFilter;
      
      // 3. Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'diseased' && scan.disease_flags > 0) ||
        (statusFilter === 'healthy' && scan.disease_flags === 0);

      // 4. Time range filter
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const scanDate = new Date(scan.scan_date || scan.created_at);
        const diffDays = (now - scanDate) / (1000 * 60 * 60 * 24);
        if (timeFilter === '7d') matchesTime = diffDays <= 7;
        else if (timeFilter === '30d') matchesTime = diffDays <= 30;
        else if (timeFilter === '90d') matchesTime = diffDays <= 90;
      }

      return matchesSearch && matchesCrop && matchesStatus && matchesTime;
    });
  }, [scans, searchTerm, cropFilter, statusFilter, timeFilter]);

  const formatScanDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">{isAdmin ? 'All Drone Scans' : 'Drone Scan History & Archive'}</h1>
          <p className="page-subtitle">
            {isAdmin 
              ? 'System-wide monitoring records across all registered farm plots.' 
              : 'Permanent archive of all crop health monitoring scans, plant counts, and expert diagnoses.'}
          </p>
        </div>
        {!isAdmin && (
          <Link to="/scan">
            <Button icon={<Plus size={18} />}>New Drone / Batch Scan</Button>
          </Link>
        )}
      </div>

      {/* Historical Summary Cards */}
      <div className="grid-4" style={{ gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ScanLine size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Scans Kept</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{summary.totalScans}</div>
          </div>
        </Card>

        <Card style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--info-dim)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Plants Analyzed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{summary.totalPlants.toLocaleString()}</div>
          </div>
        </Card>

        <Card style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: summary.totalDiseases > 0 ? 'var(--danger-dim)' : 'var(--accent-dim)', color: summary.totalDiseases > 0 ? 'var(--danger)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Disease Flags</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: summary.totalDiseases > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {summary.totalDiseases}
            </div>
          </div>
        </Card>

        <Card style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Field Health Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>{summary.healthRate}%</div>
          </div>
        </Card>
      </div>

      {/* Retention Guarantee Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} className="text-accent" />
          <span><strong>Persistent Scan Retention:</strong> All past flight orthomosaics, batch scans, and treatment plans are stored permanently in your history.</span>
        </div>
        <Badge variant="accent">Indefinite Retention</Badge>
      </div>

      {/* Filters Bar */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 220px)' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search farm plots..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                outline: 'none', fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Time Filter */}
          <select 
            value={timeFilter} 
            onChange={e => setTimeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <option value="all">📅 All Time (All Records)</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>

          {/* Health Status Filter */}
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <option value="all">🔍 All Statuses</option>
            <option value="diseased">⚠️ Issues Detected Only</option>
            <option value="healthy">✅ Healthy Plots Only</option>
          </select>

          {/* Crop Buttons */}
          <div className="filter-scroll" style={{ display: 'flex', gap: 6 }}>
            {['all', 'tomato', 'maize', 'pineapple'].map(crop => (
              <button
                key={crop}
                onClick={() => setCropFilter(crop)}
                style={{
                  padding: '6px 14px',
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
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filteredScans.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <ScanLine size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--sp-4)' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)' }}>No Scans Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {scans.length === 0 
              ? "You haven't uploaded any drone or crop scans yet." 
              : "No scan records match the current filter or search criteria."}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {filteredScans.map(scan => (
            <Card key={scan.id} style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
                {/* Left info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {CROP_ICONS[scan.crop_type] || <Sprout size={24} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
                        {scan.farm_name || `Plot Scan #${scan.id}`}
                      </h3>
                      {scan.disease_flags > 0 ? (
                        <Badge variant="danger">Attention Needed</Badge>
                      ) : (
                        <Badge variant="accent">Healthy</Badge>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} /> {formatScanDate(scan.scan_date || scan.created_at)}
                      </span>
                      <span>·</span>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{scan.crop_type}</span>
                      {scan.image_count > 1 && (
                        <>
                          <span>·</span>
                          <span>{scan.image_count} frames</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                      Plants Count
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <Target size={14} className="text-accent" /> {scan.total_plants}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                      Issues Flagged
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <AlertTriangle size={14} className={scan.disease_flags > 0 ? "text-danger" : "text-accent"} /> 
                      <span className={scan.disease_flags > 0 ? "text-danger" : "text-accent"}>{scan.disease_flags}</span>
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
