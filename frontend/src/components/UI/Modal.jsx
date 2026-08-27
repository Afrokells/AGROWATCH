import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 520 }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes slideUpModal {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInBackdrop {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(8px); }
        }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5, 12, 8, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 'var(--sp-4)',
          animation: 'fadeInBackdrop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: width,
            maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hover)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}
        >
          <div style={{ 
            padding: 'var(--sp-5) var(--sp-6)', 
            borderBottom: '1px solid rgba(74, 222, 128, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                background: 'var(--bg-input)',
                color: 'var(--text-secondary)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--danger-dim)';
                e.currentTarget.style.color = 'var(--danger)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-input)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div style={{ padding: 'var(--sp-6)', background: 'var(--bg-base)' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
