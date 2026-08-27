import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, ScanLine, ShoppingBasket, AlertTriangle, ArrowRight, Activity, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { farmsAPI, scansAPI, marketAPI } from '../../services/api';
import { CROP_ICONS } from '../../data/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalArea: 0,
    recentScans: [],
    diseaseAlerts: 0,
    activeListings: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userFarms, allScans, allListings] = await Promise.all([
          farmsAPI.list(user?.id),
          scansAPI.list(),
          marketAPI.list()
        ]);

        const userFarmIds = new Set(userFarms.map(f => f.id));
        const userScans = allScans.filter(s => userFarmIds.has(s.farm) || userFarmIds.has(s.farm_id));
        const userListings = allListings.filter(l => (l.farmer === user?.id || l.farmer_id === user?.id) && l.listing_status === 'active');
        const sortedScans = [...userScans].sort((a, b) => new Date(b.scan_date) - new Date(a.scan_date));
        const alerts = sortedScans.reduce((acc, scan) => acc + (scan.disease_flags > 0 ? 1 : 0), 0);

        setStats({
          totalFarms: userFarms.length,
          totalArea: userFarms.reduce((acc, farm) => acc + farm.area_ha, 0),
          recentScans: sortedScans.slice(0, 3),
          diseaseAlerts: alerts,
          activeListings: userListings.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', gap: 'var(--sp-6)', flexDirection: 'column' }}>
        <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }}></div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }}></div>
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
      {/* Header section */}
      <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here is an overview of your farming activities.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <Link to="/scan">
            <Button icon={<ScanLine size={18} />}>New Drone Scan</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-6)' }}>
        <StatCard 
          icon={<Tractor size={24} />} 
          label="Registered Farms" 
          value={stats.totalFarms} 
          subtitle={`${stats.totalArea.toFixed(1)} Total Hectares`}
          color="accent"
        />
        <StatCard 
          icon={<Activity size={24} />} 
          label="Recent Scans" 
          value={stats.recentScans.length} 
          subtitle="In the last 30 days"
          color="info"
        />
        <StatCard 
          icon={<AlertTriangle size={24} />} 
          label="Disease Alerts" 
          value={stats.diseaseAlerts} 
          subtitle="Requires attention"
          color="danger"
        />
        <StatCard 
          icon={<ShoppingBasket size={24} />} 
          label="Active Listings" 
          value={stats.activeListings} 
          subtitle="On the market"
          color="amber"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
        {/* Recent Scans */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <ScanLine size={18} className="text-accent" /> Recent Scans
            </h3>
            <Link to="/scans" className="text-accent" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {stats.recentScans.length > 0 ? stats.recentScans.map(scan => (
              <div key={scan.id} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    {CROP_ICONS[scan.crop_type] || <Sprout size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{scan.farm_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(scan.scan_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  {scan.disease_flags > 0 && (
                    <Badge label={`${scan.disease_flags} Issues`} variant="danger" dot />
                  )}
                  <Link to={`/scan/${scan.id}`}>
                    <Button variant="ghost" size="sm">Details</Button>
                  </Link>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>
                No recent scans found.
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions & Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <Card>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              <Link to="/farms/new">
                <Button variant="ghost" fullWidth style={{ height: 'auto', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', alignItems: 'center' }}>
                  <Tractor size={24} />
                  <span>Register Farm</span>
                </Button>
              </Link>
              <Link to="/market/new">
                <Button variant="ghost" fullWidth style={{ height: 'auto', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', alignItems: 'center' }}>
                  <ShoppingBasket size={24} />
                  <span>List Produce</span>
                </Button>
              </Link>
            </div>
          </Card>
          
          <Card style={{ flex: 1, background: 'linear-gradient(145deg, rgba(74,222,128,0.1), rgba(20,40,25,0.4))', borderColor: 'rgba(74,222,128,0.2)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)', color: 'var(--accent)' }}>Expert Tip</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Early detection is key to preventing crop loss. We recommend conducting drone scans at least once every two weeks during the active growing season.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
      <div style={{ 
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: `var(--${color}-dim, rgba(255,255,255,0.05))`,
        color: `var(--${color}, var(--text-primary))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>
        )}
      </div>
    </Card>
  );
}
