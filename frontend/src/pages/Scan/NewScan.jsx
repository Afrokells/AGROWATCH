import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { farmsAPI, scansAPI } from '../../services/api';
import Select from '../../components/UI/Select';

export default function NewScan() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [selectedFarm, setSelectedFarm] = useState('');
  const [files, setFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const [userFarms, setUserFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarms() {
      try {
        const farms = await farmsAPI.list(user?.id);
        setUserFarms(farms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadFarms();
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const startScan = async () => {
    if (!selectedFarm || files.length === 0) return;
    
    setIsScanning(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress < 95) {
        setProgress(currentProgress);
      }
    }, 500);

    try {
      const farm = userFarms.find(f => f.id === selectedFarm);
      const crop = farm ? farm.crop_type : 'tomato';

      // Build FormData to send real image files to the backend for YOLOv8 inference
      const formData = new FormData();
      formData.append('farm', selectedFarm);
      formData.append('crop_type', crop);
      files.forEach(file => formData.append('images', file));

      const newScan = await scansAPI.create(formData);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        navigate(`/scan/${newScan.id}`);
      }, 500);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setIsScanning(false);
      addToast('Failed to run analysis', 'error');
    }
  };

  if (loading) return null;

  if (userFarms.length === 0) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <Card style={{ padding: 'var(--sp-10)' }}>
          <AlertCircle size={48} style={{ color: 'var(--amber)', margin: '0 auto var(--sp-6)' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--sp-2)' }}>No Farms Registered</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>
            You need to register at least one farm plot before initiating a drone scan.
          </p>
          <Button onClick={() => navigate('/farms/new')}>Register a Farm</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Initiate New Scan</h1>
        <p className="page-subtitle">Upload drone imagery for AI-powered crop analysis.</p>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* Farm Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Select Farm Plot</label>
            <Select 
              value={selectedFarm} 
              onChange={setSelectedFarm}
              disabled={isScanning}
              options={userFarms.map(farm => ({
                value: farm.id,
                label: `${farm.farm_name} (${farm.crop_type})`
              }))}
              placeholder="-- Select a farm --"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: 500 }}>Upload Drone Imagery</label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--sp-8)',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              position: 'relative',
              transition: 'all 0.2s ease',
              opacity: isScanning ? 0.5 : 1,
              pointerEvents: isScanning ? 'none' : 'auto'
            }}>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  opacity: 0, cursor: 'pointer'
                }}
              />
              <UploadCloud size={48} style={{ color: 'var(--accent)', margin: '0 auto var(--sp-4)' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)' }}>Click or drag images here</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Supports JPG, PNG (Max 20MB per file)
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {files.length} file(s) selected
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', maxHeight: 200, overflowY: 'auto' }}>
                {files.map((file, i) => (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'var(--sp-2) var(--sp-3)', background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', overflow: 'hidden' }}>
                      <ImageIcon size={16} className="text-accent" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                    </div>
                    {!isScanning && (
                      <button 
                        onClick={() => removeFile(i)}
                        style={{ 
                          background: 'none', border: 'none', color: 'var(--text-muted)',
                          cursor: 'pointer', padding: 4, display: 'flex'
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress / Submit */}
          <div style={{ marginTop: 'var(--sp-4)' }}>
            {isScanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Analyzing imagery...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', background: 'var(--accent)', 
                    width: `${progress}%`, transition: 'width 0.2s ease' 
                  }} />
                </div>
              </div>
            ) : (
              <Button 
                fullWidth 
                onClick={startScan}
                disabled={!selectedFarm || files.length === 0}
              >
                Run AI Analysis
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
