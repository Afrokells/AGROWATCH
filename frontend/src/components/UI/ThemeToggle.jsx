import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    const isDark = theme === 'dark';
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-label="Toggle theme"
        style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--bg-input)', 
          border: '1px solid var(--border)',
          color: isDark ? 'var(--accent)' : 'var(--text-secondary)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s ease'
        }}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    );
  }

  return (
    <div style={{ 
      display: 'inline-flex', 
      background: 'var(--bg-input)', 
      borderRadius: 'var(--radius-full)', 
      padding: '4px',
      border: '1px solid var(--border)',
      gap: 2,
      flexShrink: 0
    }}>
      <ThemeButton 
        active={theme === 'light'} 
        onClick={() => setTheme('light')} 
        icon={<Sun size={14} />} 
        label="Light" 
      />
      <ThemeButton 
        active={theme === 'dark'} 
        onClick={() => setTheme('dark')} 
        icon={<Moon size={14} />} 
        label="Dark" 
      />
      <ThemeButton 
        active={theme === 'system'} 
        onClick={() => setTheme('system')} 
        icon={<Laptop size={14} />} 
        label="System" 
      />
    </div>
  );
}

function ThemeButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: 'none',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#0a1410' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {icon}
      {active && (
        <span style={{
          position: 'absolute',
          inset: -2,
          border: '2px solid var(--accent)',
          borderRadius: '50%',
          opacity: 0.3
        }} />
      )}
    </button>
  );
}
