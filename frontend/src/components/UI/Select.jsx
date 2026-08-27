import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  label,
  icon: Icon,
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value || opt === value);
  const displayLabel = selectedOption?.label || selectedOption?.value || selectedOption || placeholder;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    const val = option.value !== undefined ? option.value : option;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`form-group ${className}`} ref={containerRef} style={{ position: 'relative', zIndex: isOpen ? 50 : 'auto' }}>
      {label && <label className="form-label">{label}</label>}
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--sp-3) var(--sp-4)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all var(--ease)',
          boxShadow: isOpen ? '0 0 0 3px rgba(74, 222, 128, 0.1)' : 'none',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
          position: 'relative',
          paddingLeft: Icon ? 44 : 'var(--sp-4)'
        }}
      >
        {Icon && <Icon size={18} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />}
        
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayLabel}
        </span>
        
        <ChevronDown 
          size={18} 
          style={{ 
            transition: 'transform var(--ease)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            color: 'var(--text-muted)'
          }} 
        />
      </div>

      {isOpen && (
        <div className="glass-strong no-scrollbar" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          maxHeight: '240px',
          overflowY: 'auto',
          padding: 'var(--sp-2)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {options.map((option, idx) => {
            const optVal = option.value !== undefined ? option.value : option;
            const optLabel = option.label || option.value || option;
            const isSelected = optVal === value;

            return (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  background: isSelected ? 'var(--accent-dim)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
              >
                <span>{optLabel}</span>
                {isSelected && <Check size={16} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
