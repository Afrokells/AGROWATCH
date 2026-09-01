import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Target, Activity, FileText } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { API_ORIGIN, scansAPI } from '../../services/api';
import { CROP_ICONS, DISEASE_CONDITIONS } from '../../data/constants';

export default function ScanResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);

  useEffect(() => {
    async function loadScan() {
      try {
        const found = await scansAPI.get(scanId);
        if (found) setScan(found);
      } catch (err) {
        console.error(err);
      }
    }
    loadScan();
  }, [scanId]);

  if (!scan) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton" style={{ height: 120, marginBottom: 'var(--sp-6)', borderRadius: 'var(--radius-lg)' }}></div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }}></div>
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ 
            background: 'var(--bg-input)', border: '1px solid var(--border)', 
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', margin: 0 }}>
            {scan.farm_name} Scan
            <Badge label="Completed" variant="accent" />
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
            Processed {scan.image_count} drone images on {new Date(scan.scan_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid-stats">
        <MetricCard label="Total Plants Detected" value={scan.total_plants} icon={<Target size={20} />} />
        <MetricCard label="Disease Flags" value={scan.disease_flags} icon={<AlertTriangle size={20} />} color={scan.disease_flags > 0 ? 'danger' : 'accent'} />
        <MetricCard label="Detection F1-Score" value={(scan.f1_score * 100).toFixed(1) + '%'} icon={<Activity size={20} />} />
        <MetricCard label="Tracking MOTA" value={(scan.mota * 100).toFixed(1) + '%'} icon={<CheckCircle size={20} />} />
      </div>

      <div className="grid-scan-results">
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--sp-4) var(--sp-6)', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: '1rem' }}>Field Orthomosaic Map</h3>
          </div>
          <div style={{ 
            minHeight: 260,
            height: 'clamp(260px, 40vw, 400px)',
            background: 'var(--bg-input)', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: `url("${scan.image ? (scan.image.startsWith('http') ? scan.image : `${API_ORIGIN}${scan.image}`) : 'https://images.unsplash.com/photo-1592982537447-6f2b6a061419?auto=format&fit=crop&q=80&w=1000'}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
            <p style={{ color: 'white', position: 'relative', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: 500 }}>
              {scan.image ? 'AI Crop Analysis Overlay' : 'Interactive Map View (Simulated)'}
            </p>
            {scan.detections?.slice(0, 50).map((det, i) => {
              const flagId = det.disease_flag_id || det.disease_flag?.id || '';
              const isHealthy = !flagId || flagId.includes('healthy');
              const diseaseFlag = isHealthy
                ? { severity: 'none', label: 'Healthy' }
                : Object.values(DISEASE_CONDITIONS).flat().find(d => {
                    const normFlag = flagId.toLowerCase().replace(/[- ]/g, '_');
                    const normId = (d.id || '').toLowerCase().replace(/[- ]/g, '_');
                    return normId === normFlag || normFlag.includes(normId) || normId.includes(normFlag);
                  }) || { severity: 'medium', label: flagId.replace(/_/g, ' ') };
              return (
              <div key={i} style={{
                position: 'absolute',
                left: `${(det.x / 800) * 100}%`,
                top: `${(det.y / 600) * 100}%`,
                width: 8, height: 8,
                borderRadius: '50%',
                background: diseaseFlag.severity !== 'none' ? 'var(--danger)' : 'var(--accent)',
                boxShadow: `0 0 8px ${diseaseFlag.severity !== 'none' ? 'var(--danger)' : 'var(--accent)'}`,
                opacity: 0.7
              }} title={`Plant #${det.track_id} - ${diseaseFlag.label}`} />
            )})}
          </div>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-6)' }}>Analysis Summary</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-3)', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Crop Type</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="text-accent">{CROP_ICONS[scan.crop_type]}</span> {scan.crop_type}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-3)', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Precision</span>
              <span style={{ fontWeight: 600 }}>{scan.precision.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-3)', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Recall</span>
              <span style={{ fontWeight: 600 }}>{scan.recall.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--sp-3)', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Identity Switches</span>
              <span style={{ fontWeight: 600 }}>{scan.identity_switches}</span>
            </div>

            <div style={{ 
              marginTop: 'auto', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)',
              background: scan.disease_flags > 0 ? 'var(--danger-dim)' : 'var(--accent-dim)',
              border: `1px solid ${scan.disease_flags > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`
            }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--sp-2)', color: scan.disease_flags > 0 ? 'var(--danger)' : 'var(--accent)' }}>
                System Recommendation
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {scan.disease_flags > 0 
                  ? `Detected ${scan.disease_flags} plants with potential disease symptoms. Expert diagnosis is strongly recommended.`
                  : "Field appears healthy. No significant disease or pest pressure detected."}
              </p>
            </div>
          </div>

          {scan.disease_flags > 0 && (
            <div style={{ marginTop: 'var(--sp-6)' }}>
              <Link to={`/diagnose/${scan.id}`}>
                <Button fullWidth variant="primary" icon={<FileText size={18} />}>View Expert Diagnosis</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color = 'accent' }) {
  return (
    <Card style={{ padding: 'var(--sp-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
        <div style={{ color: `var(--${color})` }}>{icon}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
    </Card>
  );
}
