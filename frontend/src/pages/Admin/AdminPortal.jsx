import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Tractor, ScanLine, ShoppingBasket, Shield, 
  AlertTriangle, Search, CheckCircle, Sprout, MapPin, Phone, Award
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { farmsAPI, scansAPI, marketAPI, usersAPI } from '../../services/api';
import { CROP_ICONS } from '../../data/constants';

export default function AdminPortal() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    farmersCount: 0,
    buyersCount: 0,
    adminsCount: 0,
    totalFarms: 0,
    totalHectares: 0,
    totalScans: 0,
    diseaseFlags: 0,
    totalListings: 0,
    marketValue: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [farmsList, setFarmsList] = useState([]);
  const [scansList, setScansList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersRes, farmsRes, scansRes, marketRes] = await Promise.all([
          usersAPI.list().catch(() => []),
          farmsAPI.list(),
          scansAPI.list(),
          marketAPI.list()
        ]);

        setUsersList(usersRes);
        setFarmsList(farmsRes);
        setScansList(scansRes);
        setListingsList(marketRes);

        const farmers = usersRes.filter(u => u.user_role === 'farmer' || u.role === 'farmer').length;
        const buyers = usersRes.filter(u => u.user_role === 'buyer' || u.role === 'buyer').length;
        const admins = usersRes.filter(u => u.user_role === 'admin' || u.role === 'admin').length;

        const totalArea = farmsRes.reduce((acc, f) => acc + (f.area_ha || 0), 0);
        const alerts = scansRes.reduce((acc, s) => acc + (s.disease_flags || 0), 0);
        const totalMarketValue = marketRes.reduce((acc, l) => acc + (Number(l.asking_price_ghs || 0) * Number(l.quantity_kg || 0)), 0);

        setStats({
          totalUsers: usersRes.length,
          farmersCount: farmers,
          buyersCount: buyers,
          adminsCount: admins,
          totalFarms: farmsRes.length,
          totalHectares: totalArea,
          totalScans: scansRes.length,
          diseaseFlags: alerts,
          totalListings: marketRes.length,
          marketValue: totalMarketValue
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const filteredUsers = usersList.filter(u => {
    const role = u.user_role || u.role || 'farmer';
    const matchesRole = userRoleFilter === 'all' || role === userRoleFilter;
    const matchesSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.phone_number || '').includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
        <div className="grid-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
      {/* Admin Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <Shield size={26} className="text-accent" /> AgroWatch System Administration
          </h1>
          <p className="page-subtitle">National agricultural intelligence and user control center.</p>
        </div>
        <Badge label="System Admin" variant="accent" />
      </div>

      {/* Navigation Tabs */}
      <div className="filter-scroll" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-3)' }}>
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview & Metrics
        </TabButton>
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          User Management ({stats.totalUsers})
        </TabButton>
        <TabButton active={activeTab === 'farms'} onClick={() => setActiveTab('farms')}>
          National Farms ({stats.totalFarms})
        </TabButton>
        <TabButton active={activeTab === 'scans'} onClick={() => setActiveTab('scans')}>
          Drone Scans ({stats.totalScans})
        </TabButton>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
          {/* Key Metric Cards */}
          <div className="grid-stats">
            <AdminStatCard 
              icon={<Users size={24} />} 
              label="Total Users" 
              value={stats.totalUsers} 
              subtitle={`${stats.farmersCount} Farmers · ${stats.buyersCount} Buyers`}
              color="accent"
            />
            <AdminStatCard 
              icon={<Tractor size={24} />} 
              label="Registered Farms" 
              value={stats.totalFarms} 
              subtitle={`${stats.totalHectares.toFixed(1)} Total Hectares`}
              color="info"
            />
            <AdminStatCard 
              icon={<ScanLine size={24} />} 
              label="Drone Scans" 
              value={stats.totalScans} 
              subtitle={`${stats.diseaseFlags} Disease Alerts`}
              color={stats.diseaseFlags > 0 ? "danger" : "accent"}
            />
            <AdminStatCard 
              icon={<ShoppingBasket size={24} />} 
              label="Market Trade Volume" 
              value={`GH₵ ${stats.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
              subtitle={`${stats.totalListings} Active Listings`}
              color="amber"
            />
          </div>

          <div className="grid-2">
            {/* System Outbreak Monitor */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <AlertTriangle size={20} className="text-amber" /> National Disease Outbreaks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {scansList.filter(s => s.disease_flags > 0).slice(0, 4).map(scan => (
                  <div key={scan.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'var(--sp-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <div style={{ color: 'var(--accent)' }}>{CROP_ICONS[scan.crop_type] || <Sprout size={20} />}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{scan.farm_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(scan.scan_date || scan.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge label={`${scan.disease_flags} Issues`} variant="danger" dot />
                  </div>
                ))}
                {scansList.filter(s => s.disease_flags > 0).length === 0 && (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--sp-6)' }}>
                    No disease outbreaks flagged across the system.
                  </div>
                )}
              </div>
            </Card>

            {/* Quick System Actions */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <Shield size={20} className="text-accent" /> System Health Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <HealthItem label="YOLOv8 Detection Models" status="Active (Tomato, Maize, Pineapple)" />
                <HealthItem label="ByteTrack Object Tracker" status="Operational" />
                <HealthItem label="PostgreSQL / SQLite Storage" status="Online" />
                <HealthItem label="Token & Session Security" status="Enforced" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search user by name or phone..." 
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

            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              {['all', 'farmer', 'buyer', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: userRoleFilter === r ? 'var(--accent)' : 'var(--bg-input)',
                    color: userRoleFilter === r ? '#0a1410' : 'var(--text-secondary)',
                    border: `1px solid ${userRoleFilter === r ? 'var(--accent)' : 'var(--border)'}`,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 'var(--sp-3)' }}>Full Name</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Phone Number</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Role</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const role = user.user_role || user.role || 'farmer';
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>{user.full_name || 'N/A'}</td>
                      <td style={{ padding: 'var(--sp-3)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <Phone size={14} /> {user.phone_number}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--sp-3)' }}>
                        <Badge 
                          label={role} 
                          variant={role === 'admin' ? 'accent' : (role === 'farmer' ? 'info' : 'amber')} 
                        />
                      </td>
                      <td style={{ padding: 'var(--sp-3)', color: 'var(--text-muted)' }}>
                        {user.district || user.region ? `${user.district || ''}, ${user.region || ''}` : 'Ghana'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FARMS TAB */}
      {activeTab === 'farms' && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)' }}>All Registered Farm Plots Across Ghana</h3>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 'var(--sp-3)' }}>Farm Name</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Crop Type</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Region / District</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Area (Hectares)</th>
                </tr>
              </thead>
              <tbody>
                {farmsList.map(farm => (
                  <tr key={farm.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>{farm.farm_name}</td>
                    <td style={{ padding: 'var(--sp-3)', textTransform: 'capitalize' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{CROP_ICONS[farm.crop_type]}</span> {farm.crop_type}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--sp-3)' }}>{farm.district}, {farm.region}</td>
                    <td style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>{farm.area_ha} ha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SCANS TAB */}
      {activeTab === 'scans' && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)' }}>All System Drone Scans</h3>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 'var(--sp-3)' }}>Farm Plot</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Crop</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Date</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Plants Detected</th>
                  <th style={{ padding: 'var(--sp-3)' }}>Disease Flags</th>
                </tr>
              </thead>
              <tbody>
                {scansList.map(scan => (
                  <tr key={scan.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>{scan.farm_name}</td>
                    <td style={{ padding: 'var(--sp-3)', textTransform: 'capitalize' }}>{scan.crop_type}</td>
                    <td style={{ padding: 'var(--sp-3)' }}>{new Date(scan.scan_date || scan.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 'var(--sp-3)' }}>{scan.total_plants}</td>
                    <td style={{ padding: 'var(--sp-3)' }}>
                      <Badge 
                        label={`${scan.disease_flags} Flags`} 
                        variant={scan.disease_flags > 0 ? "danger" : "accent"} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function AdminStatCard({ icon, label, value, subtitle, color }) {
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
        <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>
        )}
      </div>
    </Card>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </button>
  );
}

function HealthItem({ label, status }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
        <CheckCircle size={14} /> {status}
      </span>
    </div>
  );
}
