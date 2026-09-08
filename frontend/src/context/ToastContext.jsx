import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = null) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Error toasts stay persistent until the user presses OK / dismiss.
    // Success / info toasts auto-remove after 4.5 seconds (or custom duration).
    const autoDismissTime = duration !== null ? duration : (type === 'error' ? 0 : 4500);

    if (autoDismissTime > 0) {
      setTimeout(() => {
        removeToast(id);
      }, autoDismissTime);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(var(--sp-6) + var(--sab))',
        right: 'calc(var(--sp-6) + var(--sar))',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        zIndex: 9999,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - var(--sp-8) - var(--sal) - var(--sar))',
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: toast.type === 'error' ? '1.5px solid var(--danger, #ef4444)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-3) var(--sp-4)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--sp-3)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
            minWidth: 280,
            maxWidth: 420,
            pointerEvents: 'auto'
          }}>
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              {toast.type === 'success' && <CheckCircle size={18} style={{ color: 'var(--accent)' }} />}
              {toast.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--danger, #ef4444)' }} />}
              {toast.type === 'info' && <Info size={18} style={{ color: 'var(--text-secondary)' }} />}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.45,
                wordBreak: 'break-word'
              }}>
                {toast.message}
              </span>

              {toast.type === 'error' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                  <button
                    onClick={() => removeToast(toast.id)}
                    style={{
                      background: 'var(--danger, #ef4444)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm, 6px)',
                      padding: '4px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
            
            {toast.type !== 'error' && (
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 2,
                  marginTop: 2,
                  flexShrink: 0
                }}
                aria-label="Close toast"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
