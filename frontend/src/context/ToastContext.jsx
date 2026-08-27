import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: 'var(--sp-6)',
        right: 'var(--sp-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-3) var(--sp-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-3)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            minWidth: 280,
            pointerEvents: 'auto'
          }}>
            {toast.type === 'success' && <CheckCircle size={18} style={{ color: 'var(--accent)' }} />}
            {toast.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />}
            {toast.type === 'info' && <Info size={18} style={{ color: 'var(--text-secondary)' }} />}
            
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
              {toast.message}
            </span>
            
            <button onClick={() => removeToast(toast.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
            }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
