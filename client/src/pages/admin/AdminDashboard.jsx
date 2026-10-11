import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NavLink } from 'react-router-dom';
import { Users, Store, Clock, ShoppingCart, DollarSign, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [dash, ana] = await Promise.all([
          api.getAdminDashboard(),
          api.getAdminAnalytics()
        ]);
        setMetrics(dash);
        setAnalytics(ana);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div style={{ color: '#94A3B8' }}>Loading campus management overview...</div>;

  const maxTrend = Math.max(...(analytics?.dailyTrend?.map((d) => d.sales) || [100]), 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>🛡️ Platform Supervisory Overview</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Campus-wide student population, canteen registrations, revenue, and order integrity metrics.
          </p>
        </div>

        {metrics?.pendingApprovals > 0 && (
          <NavLink to="/admin/canteens" className="btn btn-primary" style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}>
            <span>Review {metrics.pendingApprovals} Pending Canteens</span>
            <ArrowRight size={16} />
          </NavLink>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Enrolled Students</span>
            <Users size={18} color="#3B82F6" />
          </div>
          <div className="kpi-value">{metrics?.students || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Registered student accounts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Active Canteens</span>
            <Store size={18} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ color: '#34D399' }}>{metrics?.canteens || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Approved on campus</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Pending Approvals</span>
            <Clock size={18} color="#F59E0B" />
          </div>
          <div className="kpi-value" style={{ color: metrics?.pendingApprovals > 0 ? '#FBBF24' : '#fff' }}>
            {metrics?.pendingApprovals || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>New canteen applicants</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Gross Order Value</span>
            <DollarSign size={18} color="#FF5722" />
          </div>
          <div className="kpi-value" style={{ color: '#FF5722' }}>₹{metrics?.grossOrderValue || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Total platform volume</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Completed Sales</span>
            <DollarSign size={18} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>₹{metrics?.completedSales || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Successfully collected</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Orders</span>
            <ShoppingCart size={18} color="#60A5FA" />
          </div>
          <div className="kpi-value">{metrics?.totalOrders || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Cancelled: {metrics?.cancelledOrders || 0}</div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '18px' }}>Platform-Wide Daily Sales Trend (Last 7 Days)</h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '16px', padding: '10px 0' }}>
          {analytics?.dailyTrend?.map((day, idx) => {
            const heightPercent = maxTrend > 0 ? Math.max((day.sales / maxTrend) * 100, 4) : 4;
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 700 }}>
                  ₹{day.sales}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: `${heightPercent}%`,
                    background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  {day.date.split(',')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
