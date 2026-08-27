import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Select from './Select';

export default function DatePicker({ label, value, onChange, placeholder = 'Select date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selected.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '100%', paddingBottom: '100%' }} />);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const isSelected = value === current.toISOString().split('T')[0];
      const isToday = new Date().toDateString() === current.toDateString();

      days.push(
        <div 
          key={d}
          onClick={(e) => { e.stopPropagation(); handleDateClick(d); }}
          style={{
            width: '100%',
            aspectRatio: '1/1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s ease',
            color: isSelected ? 'white' : 'var(--text-primary)',
            background: isSelected ? 'var(--accent)' : 'transparent',
            border: isToday && !isSelected ? '1px solid var(--accent)' : 'none',
            fontWeight: isSelected || isToday ? 700 : 400
          }}
          onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'var(--bg-card-hover)')}
          onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative', zIndex: isOpen ? 50 : 'auto' }}>
      {label && <label className="form-label">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--sp-3) var(--sp-4)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          transition: 'all var(--ease)',
          boxShadow: isOpen ? '0 0 0 3px rgba(74, 222, 128, 0.1)' : 'none',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
          position: 'relative'
        }}
      >
        <CalendarIcon size={18} style={{ color: 'var(--text-muted)' }} />
        <span>{value || placeholder}</span>
      </div>

      {isOpen && (
        <div className="glass-strong" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: '340px',
          zIndex: 1000,
          padding: 'var(--sp-4)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Header with Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', gap: 4 }}>
            <div style={{ display: 'flex', gap: 4, flex: 1, minWidth: 0 }}>
              <div style={{ flex: 1.2 }}>
                <Select 
                  value={viewDate.getMonth()}
                  options={months.map((m, i) => ({ value: i, label: m }))}
                  onChange={(val) => setViewDate(new Date(viewDate.getFullYear(), val, 1))}
                  className="mini-select"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select 
                  value={viewDate.getFullYear()}
                  options={Array.from({ length: 20 }, (_, i) => 2020 + i).map(y => ({ value: y, label: y.toString() }))}
                  onChange={(val) => setViewDate(new Date(val, viewDate.getMonth(), 1))}
                  className="mini-select"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              <button onClick={handlePrevMonth} style={{ padding: 4, borderRadius: 4, color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} style={{ padding: 4, borderRadius: 4, color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 'var(--sp-4)' }}>
            {renderDays()}
          </div>

          {/* Footer - Today Button */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const today = new Date();
                onChange(today.toISOString().split('T')[0]);
                setViewDate(today);
                setIsOpen(false);
              }}
              style={{
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)',
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--accent-dim)', border: '1px solid rgba(74, 222, 128, 0.2)',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(74, 222, 128, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
