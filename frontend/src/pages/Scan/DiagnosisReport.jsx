import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { scansAPI } from '../../services/api';
import { DISEASE_CONDITIONS } from '../../data/constants';

export default function DiagnosisReport() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [diagnosisGroups, setDiagnosisGroups] = useState([]);

  useEffect(() => {
    async function loadScan() {
      try {
        const found = await scansAPI.get(scanId);
        if (found) {
          setScan(found);
          
          // Build a lookup of all disease conditions by their class name
          const cropConditions = DISEASE_CONDITIONS[found.crop_type] || [];

          // Group detections by disease class name
          const groups = {};
          if (found.detections) {
            found.detections.forEach(det => {
              const flagId = det.disease_flag_id || '';
              if (!flagId || flagId === 'healthy' || flagId.endsWith('_healthy') || flagId.includes('healthy')) return;

              const normFlag = flagId.toLowerCase().replace(/[- ]/g, '_');

              // Match against DISEASE_CONDITIONS by exact id, alias, or fuzzy category match
              const condition = cropConditions.find(c => {
                const normCId = (c.id || '').toLowerCase().replace(/[- ]/g, '_');
                const normLabel = (c.label || '').toLowerCase().replace(/[- ]/g, '_');
                const cropPrefix = `${found.crop_type}_`;

                return normCId === normFlag ||
                       normCId === `${cropPrefix}${normFlag}` ||
                       normFlag === `${cropPrefix}${normCId}` ||
                       normFlag.replace(cropPrefix, '') === normCId.replace(cropPrefix, '') ||
                       normLabel === normFlag ||
                       normLabel === normFlag.replace(cropPrefix, '') ||
                       (normFlag.includes('northern') && normCId.includes('northern')) ||
                       (normFlag.includes('rust') && normCId.includes('rust')) ||
                       ((normFlag.includes('gray') || normFlag.includes('grey')) && (normCId.includes('gray') || normCId.includes('grey'))) ||
                       (normFlag.includes('armyworm') && normCId.includes('armyworm')) ||
                       (normFlag.includes('late_blight') && normCId.includes('late_blight')) ||
                       (normFlag.includes('leaf_curl') && normCId.includes('leaf_curl')) ||
                       (normFlag.includes('septoria') && normCId.includes('septoria')) ||
                       (normFlag.includes('bacterial') && normCId.includes('bacterial')) ||
                       (normFlag.includes('mealybug') && normCId.includes('mealybug')) ||
                       (normFlag.includes('heart_rot') && normCId.includes('heart_rot'));
              });

              const key = condition ? condition.id : flagId;
              if (!groups[key]) {
                groups[key] = {
                  condition: condition || {
                    id: flagId,
                    label: flagId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    severity: 'medium',
                    color: 'amber',
                    description: `Detected "${flagId}" pattern in plant imagery.`,
                    recommendation: 'Consult an agricultural extension officer for further diagnosis.',
                  },
                  count: 0,
                };
              }
              groups[key].count++;
            });
          }
          setDiagnosisGroups(Object.values(groups).sort((a, b) => b.count - a.count));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadScan();
  }, [scanId]);

  if (!scan) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <button 
            onClick={() => navigate(`/scan/${scanId}`)}
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
              <Stethoscope size={24} className="text-accent" /> Expert Diagnosis Report
            </h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
              Based on {scan.farm_name} scan data • {new Date(scan.scan_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {diagnosisGroups.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <ShieldCheck size={64} style={{ color: 'var(--accent)', margin: '0 auto var(--sp-6)' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--sp-3)' }}>No Diseases Detected</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            The computer vision model did not identify any pest or disease symptoms in the scanned imagery. Continue standard agronomic practices.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {diagnosisGroups.map((group, idx) => (
            <Card key={idx} style={{ 
              borderLeft: `4px solid var(--${group.condition.color})`,
              padding: 'var(--sp-6)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background gradient hint */}
              <div style={{ 
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '30%',
                background: `linear-gradient(90deg, transparent, var(--${group.condition.color}-dim))`,
                opacity: 0.1, pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{group.condition.label}</h3>
                    <Badge label={group.condition.severity + ' severity'} variant={group.condition.color} />
                  </div>
                  {group.condition.pathogen && (
                    <div style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Pathogen: {group.condition.pathogen}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: `var(--${group.condition.color})`, lineHeight: 1 }}>
                    {group.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                    Plants Affected
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)', marginTop: 'var(--sp-6)' }}>
                <div style={{ background: 'var(--bg-input)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Visual Symptoms
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{group.condition.description}</p>
                </div>
                
                <div style={{ 
                  background: 'var(--accent-dim)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(74,222,128,0.2)'
                }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--accent)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Expert Recommendation
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {group.condition.recommendation}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          <Card style={{ background: 'var(--bg-input)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
              <AlertTriangle size={24} className="text-amber" />
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: 'var(--sp-2)' }}>Advisory Notice</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  These recommendations are generated by the AgroWatch expert system based on computer vision analysis. While highly accurate, they should be corroborated with an agricultural extension officer for large-scale interventions, especially regarding chemical applications.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
