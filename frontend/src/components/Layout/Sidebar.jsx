import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Tractor, ScanLine, ShoppingBasket,
  User, LogOut, Leaf, X, MessageCircle, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../UI/Logo';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
    : parts[0].substring(0, 2).toUpperCase();
};

const FARMER_LINKS = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/farms',     icon: <Tractor size={18} />,         label: 'My Farms'  },
  { to: '/scans',     icon: <ScanLine size={18} />,        label: 'Drone Scans' },
  { to: '/market',    icon: <ShoppingBasket size={18} />,  label: 'My Products' },
  { to: '/messages',  icon: <MessageCircle size={18} />,   label: 'Messages'  },
  { to: '/profile',   icon: <User size={18} />,            label: 'Profile'   },
];

const BUYER_LINKS = [
  { to: '/market',    icon: <ShoppingBasket size={18} />, label: 'Market Listings' },
  { to: '/messages',  icon: <MessageCircle size={18} />,  label: 'Messages'        },
  { to: '/profile',   icon: <User size={18} />,           label: 'Profile'         },
];

const ADMIN_LINKS = [
  { to: '/admin',     icon: <Shield size={18} />,          label: 'Admin Portal' },
  { to: '/farms',     icon: <Tractor size={18} />,         label: 'All Farms'    },
  { to: '/scans',     icon: <ScanLine size={18} />,        label: 'All Scans'    },
  { to: '/market',    icon: <ShoppingBasket size={18} />,  label: 'All Listings' },
  { to: '/profile',   icon: <User size={18} />,            label: 'Profile'      },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isFarmer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? ADMIN_LINKS : (isFarmer ? FARMER_LINKS : BUYER_LINKS);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 49, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside 
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          backdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: 'var(--sp-6)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Logo />
          <button
            onClick={onClose}
            className="mobile-only"
            style={{
              width: 28, height: 28, border: 'none',
              background: 'rgba(255,255,255,0.06)', borderRadius: 6,
              color: 'var(--text-secondary)', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
              display: 'flex',
            }}
            id="sidebar-close-btn"
          >
            <X size={14} />
          </button>
        </div>

        {/* User pill */}
        <div style={{
          margin: 'var(--sp-4) var(--sp-4) 0',
          padding: 'var(--sp-3)',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent)',
            flexShrink: 0,
          }}>
            {getInitials(user?.full_name)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'capitalize' }}>
              {user?.user_role}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: 'var(--sp-4)', overflowY: 'auto', marginTop: 'var(--sp-2)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)', padding: '0 var(--sp-3)' }}>
            Navigation
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
            {links.map(({ to, icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-3)',
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(74,222,128,0.2)' : 'transparent'}`,
                    transition: 'all 0.18s ease',
                    textDecoration: 'none',
                  })}
                  onMouseEnter={e => {
                    const a = e.currentTarget;
                    if (!a.style.background.includes('accent-dim') && !a.className?.includes('active')) {
                      a.style.background = 'rgba(255,255,255,0.04)';
                      a.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    const a = e.currentTarget;
                    if (!a.className?.includes('active')) {
                      a.style.background = 'transparent';
                      a.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {icon}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              width: '100%', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)',
              background: 'transparent', border: '1px solid transparent',
              color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--danger-dim)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
