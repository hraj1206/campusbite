import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!user) navigate('/login');
    else if (user.role === 'student') navigate('/student/dashboard');
    else if (user.role === 'canteen') navigate('/canteen/dashboard');
    else if (user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', padding: '20px', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px', backgroundColor: '#141D2E', padding: '40px', borderRadius: '20px', border: '1px solid #2A3B5A' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍽️</div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>404 - Page Not Found</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '24px' }}>
          The page or portal route you requested does not exist or has moved.
        </p>
        <button onClick={handleReturn} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
