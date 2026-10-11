import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Boxes,
  TrendingUp,
  Star,
  Settings,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';

export default function CanteenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [canteenData, setCanteenData] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    async function loadCanteen() {
      try {
        const data = await api.getCanteenDashboard();
        setCanteenData(data.canteen);
      } catch (err) {
        console.error('Error loading canteen dashboard info:', err);
      }
    }
    loadCanteen();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/canteen/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', path: '/canteen/orders', icon: UtensilsCrossed },
    { label: 'Menu Management', path: '/canteen/menu', icon: BookOpen },
    { label: 'Inventory', path: '/canteen/inventory', icon: Boxes },
    { label: 'Sales & Analytics', path: '/canteen/analytics', icon: TrendingUp },
    { label: 'Reviews', path: '/canteen/reviews', icon: Star },
    { label: 'Canteen Settings', path: '/canteen/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F19' }}>
      {/* Canteen Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#141D2E', borderRight: '1px solid #2A3B5A', display: 'flex', flexDirection: 'column' }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #2A3B5A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
              🏪
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>Campus<span style={{ color: '#FF5722' }}>Bite</span></div>
              <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, letterSpacing: '0.5px' }}>CANTEEN OPERATIONS</div>
            </div>
          </div>

          {canteenData && (
            <div style={{ marginTop: '16px', padding: '10px 12px', backgroundColor: '#1B263C', borderRadius: '10px', border: '1px solid #2A3B5A' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{canteenData.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>📍 {canteenData.location || 'Campus Block'}</div>
            </div>
          )}
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
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
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

        {/* Audio notification toggle & User Bar */}
        <div style={{ padding: '16px', borderTop: '1px solid #2A3B5A', backgroundColor: '#101726' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#1B263C',
              border: '1px solid #2A3B5A',
              color: '#94A3B8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <span>Order Sound Alerts</span>
            {soundEnabled ? <Volume2 size={16} color="#10B981" /> : <VolumeX size={16} color="#EF4444" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'Canteen Owner'}</div>
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
            <span>Portal:</span>
            <strong style={{ color: '#fff' }}>Canteen Kitchen & Counter Management</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <CheckCircle2 size={14} />
              <span>Orders Synchronized</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <Outlet context={{ canteenData, soundEnabled }} />
        </main>
      </div>
    </div>
  );
}
