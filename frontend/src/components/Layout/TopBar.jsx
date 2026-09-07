import { useState, useEffect, useCallback } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../UI/ThemeToggle';
import Logo from '../UI/Logo';
import { API_ORIGIN, messagingAPI } from '../../services/api';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
    : parts[0].substring(0, 2).toUpperCase();
};

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/admin':     'Admin Portal',
  '/farms':     'My Farms',
  '/scan':      'New Scan',
  '/scans':     'Drone Scans',
  '/market':    'Market Listings',
  '/messages':  'Messages',
  '/profile':   'Profile',
};

const getMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function TopBar({ onMenuClick }) {
  const { user, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[pathname] || (pathname.startsWith('/scan/') ? 'Scan Results' : 'AgroWatch');

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user || isAdmin) return;
    try {
      const notifs = await messagingAPI.listNotifications();
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch {
      // silently ignore polling errors
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleBellClick = () => {
    navigate('/messages');
  };

  return (
    <header 
      className="topbar"
      style={{
        background: 'var(--bg-base)',
        opacity: 0.9,
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--container-px)',
        gap: 'var(--sp-4)',
      }}
    >
      {/* Mobile menu btn */}
      <button
        onClick={onMenuClick}
        className="topbar-menu-btn"
        style={{
          display: 'none',
          width: 36, height: 36,
          alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Menu size={18} />
      </button>

      <Logo className="mobile-only" size={32} iconSize={16} showText={false} />

      {/* Page title */}
      <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, flex: 1, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <ThemeToggle />

        {/* Notification Bell */}
        {!isAdmin && (
          <button
            onClick={handleBellClick}
            title="Messages & Notifications"
            style={{
              position: 'relative',
              width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 5,
                minWidth: 16, height: 16, borderRadius: 99,
                background: 'var(--amber)',
                boxShadow: '0 0 6px var(--amber)',
                fontSize: '0.625rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', padding: '0 3px',
                lineHeight: 1,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
          padding: '4px 10px 4px 4px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          cursor: 'default',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent)',
            overflow: 'hidden',
          }}>
            {user?.profile_picture ? (
              <img src={getMediaUrl(user.profile_picture)} alt={user?.full_name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getInitials(user?.full_name)
            )}
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {user?.full_name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
