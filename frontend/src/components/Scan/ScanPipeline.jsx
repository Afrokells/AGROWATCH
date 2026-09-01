import { useState, useEffect } from 'react';
import ProgressBar from '../UI/ProgressBar';
import { Search, MapPin, Activity, CheckCircle2 } from 'lucide-react';

export default function ScanPipeline({ onComplete }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { label: 'Plant Detection', icon: <Search size={20} />, duration: 3000 },
    { label: 'Object Tracking', icon: <MapPin size={20} />, duration: 2500 },
    { label: 'Disease Analysis', icon: <Activity size={20} />, duration: 3500 },
  ];

  useEffect(() => {
    let currentStep = 0;
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);
      
      const threshold = ((currentStep + 1) / steps.length) * 100;
      if (currentProgress >= threshold && currentStep < steps.length - 1) {
        currentStep += 1;
        setStep(currentStep);
      }
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-10)', position: 'relative' }}>
        {/* Connection line */}
        <div style={{ position: 'absolute', top: 22, left: '10%', right: '10%', height: 2, background: 'var(--border)', zIndex: 0 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
        </div>
        
        {steps.map((s, i) => (
          <div key={i} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '33%' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: i <= step ? 'var(--accent)' : 'var(--bg-card)',
              color: i <= step ? 'var(--bg-base)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.4s ease',
              boxShadow: i === step ? 'var(--shadow-glow)' : 'none',
            }}>
              {i < step ? <CheckCircle2 size={24} /> : s.icon}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>{steps[step].label} in progress...</h3>
        <ProgressBar value={progress} color="var(--accent)" />
        <p style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Analyzing 640x640 drone imagery using YOLOv8 models.
        </p>
      </div>
    </div>
  );
}
