import { useRef, useEffect } from 'react';

export default function PlantDetectionMap({ imageUrl, detections, cropType }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    const img = new Image();
    img.src = imageUrl || 'https://images.unsplash.com/photo-1592841200221-a6898f307bac?q=80&w=1000&auto=format&fit=crop';
    
    img.onload = () => {
      // Calculate aspect ratio scale
      const containerWidth = container.clientWidth;
      const scale = containerWidth / img.width;
      const containerHeight = img.height * scale;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Draw image
      ctx.drawImage(img, 0, 0, containerWidth, containerHeight);
      
      // Draw detections
      detections.forEach(det => {
        const x = det.x * scale;
        const y = det.y * scale;
        const w = det.w * scale;
        const h = det.h * scale;
        
        // Bounding box color
        const isHealthy = det.disease_flag?.severity === 'none' || !det.disease_flag;
        ctx.strokeStyle = isHealthy ? '#4ade80' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        
        // Track ID label
        ctx.fillStyle = isHealthy ? '#4ade80' : '#ef4444';
        ctx.font = 'bold 10px Inter';
        ctx.fillText(`ID:${det.track_id}`, x, y - 5);
        
        // If disease detected, add a small pulse or indicator
        if (!isHealthy) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.fillRect(x, y, w, h);
        }
      });
    };
  }, [imageUrl, detections, cropType]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
      {!imageUrl && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
          Simulation: Processing Aerial Imagery...
        </div>
      )}
    </div>
  );
}
