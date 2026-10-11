import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, Phone, Mail, Award, Clock } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ count: 0, total: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const orders = await api.getMyOrders();
        setStats({
          count: orders.length,
          total: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>👤 Student Profile</h1>

      <div style={{ backgroundColor: '#141D2E', borderRadius: '20px', border: '1px solid #2A3B5A', padding: '30px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #2A3B5A' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{user?.name}</h2>
            <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>Student ID: {user?.studentId || 'N/A'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', backgroundColor: '#1B263C', borderRadius: '12px', border: '1px solid #2A3B5A' }}>
            <Mail size={20} color="#FF5722" />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Email Address</div>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', backgroundColor: '#1B263C', borderRadius: '12px', border: '1px solid #2A3B5A' }}>
            <Phone size={20} color="#3B82F6" />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Phone Contact</div>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>{user?.phone || 'Not specified'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <div style={{ backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A', padding: '22px' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#FF5722" />
            TOTAL ORDERS PLACED
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>{stats.count}</div>
        </div>

        <div style={{ backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A', padding: '22px' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} color="#10B981" />
            TOTAL SPENT ON CAMPUS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF5722', marginTop: '6px' }}>₹{stats.total}</div>
        </div>
      </div>
    </div>
  );
}
