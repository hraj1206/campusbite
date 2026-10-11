import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Store,
  ShoppingBag,
  FileText,
  Star,
  Sliders,
  LogOut,
  Database
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: ShieldAlert },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Canteen Management', path: '/admin/canteens', icon: Store },
    { label: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { label: 'Reviews & Feedback', path: '/admin/reviews', icon: Star },
    { label: 'Platform Settings', path: '/admin/settings', icon: Sliders },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F19' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#141D2E', borderRight: '1px solid #2A3B5A', display: 'flex', flexDirection: 'column' }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #2A3B5A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>Campus<span style={{ color: '#FF5722' }}>Bite</span></div>
              <div style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700, letterSpacing: '0.5px' }}>PLATFORM ADMIN</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#fff' : '#94A3B8',
                  backgroundColor: isActive ? 'var(--info)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Bar */}
        <div style={{ padding: '16px', borderTop: '1px solid #2A3B5A', backgroundColor: '#101726' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'Platform Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log Out" style={{ color: '#EF4444', borderColor: 'transparent', padding: '6px' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: '64px', backgroundColor: '#141D2E', borderBottom: '1px solid #2A3B5A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>
            <span>Supervisory Control:</span>
            <strong style={{ color: '#fff' }}>Campus-Wide Governance & Approvals</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <Database size={14} />
              <span>Atlas MongoDB Live</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
