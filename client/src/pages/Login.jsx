import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Store } from 'lucide-react';

export default function Login() {
  const [portal, setPortal] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePortalSwitch = (newPortal) => {
    setPortal(newPortal);
    setError('');
    // Optionally pre-fill demo values when clicking portal
    const demo = DEMO_CREDENTIALS[newPortal];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const fillDemo = (roleKey) => {
    setPortal(roleKey);
    const demo = DEMO_CREDENTIALS[roleKey];
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login({ email, password, portal });
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'canteen') navigate('/canteen/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', padding: '20px' }}>
      <div style={{ maxWidth: '460px', width: '100%', backgroundColor: '#141D2E', borderRadius: '20px', border: '1px solid #2A3B5A', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF5722, #FF8A65)', fontSize: '1.8rem', boxShadow: '0 6px 18px rgba(255, 87, 34, 0.4)', marginBottom: '12px' }}>
            🍔
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Campus<span style={{ color: '#FF5722' }}>Bite</span></h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>College Canteen Management System</p>
        </div>

        {/* Portal Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#1B263C', padding: '6px', borderRadius: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => handlePortalSwitch('student')}
            style={{
              flex: 1, padding: '9px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              backgroundColor: portal === 'student' ? '#FF5722' : 'transparent',
              color: portal === 'student' ? '#fff' : '#94A3B8', transition: 'all 0.2s'
            }}
          >
            <UserCheck size={16} />
            Student
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('canteen')}
            style={{
              flex: 1, padding: '9px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              backgroundColor: portal === 'canteen' ? '#10B981' : 'transparent',
              color: portal === 'canteen' ? '#fff' : '#94A3B8', transition: 'all 0.2s'
            }}
          >
            <Store size={16} />
            Canteen
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            style={{
              flex: 1, padding: '9px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              backgroundColor: portal === 'admin' ? '#3B82F6' : 'transparent',
              color: portal === 'admin' ? '#fff' : '#94A3B8', transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={16} />
            Admin
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '10px', color: '#F87171', fontSize: '0.86rem' }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="name@campusbite.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '1rem', borderRadius: '10px' }}
          >
            {submitting ? 'Authenticating...' : `Sign in to ${portal.toUpperCase()} Portal`}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* 1-Click Demo Credentials */}
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#1B263C', borderRadius: '12px', border: '1px solid #2A3B5A' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚡ 1-Click Demo Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fillDemo('student')}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #2A3B5A', background: '#141D2E', color: '#FF8A65', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('canteen')}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #2A3B5A', background: '#141D2E', color: '#34D399', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Canteen Owner
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #2A3B5A', background: '#141D2E', color: '#60A5FA', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.86rem', color: '#94A3B8' }}>
          New student or canteen owner?{' '}
          <Link to="/register" style={{ color: '#FF5722', fontWeight: 700, textDecoration: 'underline' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
