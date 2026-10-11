import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import { Utensils, ClipboardList, User, LogOut, ShoppingBag } from 'lucide-react';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { totalCount, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0B0F19' }}>
      {/* Top Navigation */}
      <header style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2A3B5A', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
          {/* Logo */}
          <NavLink to="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            <div style={{ background: 'linear-gradient(135deg, #FF5722, #FF8A65)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(255, 87, 34, 0.4)' }}>
              🍔
            </div>
            <span>Campus<span style={{ color: '#FF5722' }}>Bite</span></span>
            <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, marginLeft: '6px' }}>STUDENT</span>
          </NavLink>

          {/* Links */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            <NavLink
              to="/student/dashboard"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 600,
                color: isActive ? '#fff' : '#94A3B8', backgroundColor: isActive ? '#1B263C' : 'transparent', textDecoration: 'none', transition: 'all 0.2s'
              })}
            >
              <Utensils size={18} color="#FF5722" />
              <span>Explore Food</span>
            </NavLink>

            <NavLink
              to="/student/orders"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 600,
                color: isActive ? '#fff' : '#94A3B8', backgroundColor: isActive ? '#1B263C' : 'transparent', textDecoration: 'none', transition: 'all 0.2s'
              })}
            >
              <ClipboardList size={18} color="#3B82F6" />
              <span>My Orders</span>
            </NavLink>

            <NavLink
              to="/student/profile"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 600,
                color: isActive ? '#fff' : '#94A3B8', backgroundColor: isActive ? '#1B263C' : 'transparent', textDecoration: 'none', transition: 'all 0.2s'
              })}
            >
              <User size={18} color="#10B981" />
              <span>Profile</span>
            </NavLink>
          </nav>

          {/* User actions & Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="btn btn-outline"
              style={{ position: 'relative', padding: '8px 16px', borderRadius: '10px', borderColor: '#2A3B5A' }}
            >
              <ShoppingBag size={18} color="#FF5722" />
              <span>Tray</span>
              {totalCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#FF5722', color: '#fff', fontSize: '0.72rem', fontWeight: 800, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0B0F19' }}>
                  {totalCount}
                </span>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px', borderLeft: '1px solid #2A3B5A' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'Student'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user?.studentId || 'ID: 20261001'}</div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log Out" style={{ color: '#EF4444', borderColor: 'transparent' }}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Slide-over Tray */}
      <CartDrawer />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2A3B5A', padding: '24px 0', backgroundColor: '#141D2E', color: '#94A3B8', fontSize: '0.85rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© 2026 CampusBite. Skip the wait, enjoy your plate.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>MongoDB Atlas Cluster</span>
            <span>•</span>
            <span>Live Campus Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
