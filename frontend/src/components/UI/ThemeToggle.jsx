import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ 
      display: 'inline-flex', 
      background: 'var(--bg-input)', 
      borderRadius: 'var(--radius-full)', 
      padding: '4px',
      border: '1px solid var(--border)',
      gap: 2
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
