import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DollarSign, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function CanteenAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getCanteenAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div style={{ color: '#94A3B8' }}>Loading sales analytics...</div>;

  const maxDaily = Math.max(...(data?.dailyBreakdown?.map((d) => d.sales) || [100]), 100);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>📈 Sales & Revenue Analytics</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
          Real database revenue metrics, order completions, and 7-day kitchen performance trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Completed Revenue</span>
            <DollarSign size={18} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>₹{data?.totalRevenue || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Paid at counter & completed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Completed Orders</span>
            <CheckCircle2 size={18} color="#3B82F6" />
          </div>
          <div className="kpi-value" style={{ color: '#60A5FA' }}>{data?.completedOrders || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Successfully served</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Cancelled / Rejected</span>
            <XCircle size={18} color="#EF4444" />
          </div>
          <div className="kpi-value" style={{ color: '#F87171' }}>{data?.cancelledOrders || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Stock automatically rolled back</div>
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '18px' }}>Last 7 Days Revenue Trend</h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '16px', padding: '10px 0' }}>
          {data?.dailyBreakdown?.map((day, idx) => {
            const heightPercent = maxDaily > 0 ? Math.max((day.sales / maxDaily) * 100, 4) : 4;
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#FF5722', fontWeight: 700 }}>
                  ₹{day.sales}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: `${heightPercent}%`,
                    background: 'linear-gradient(180deg, #FF5722 0%, #FF8A65 100%)',
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

      {/* Daily Performance Table */}
      <div style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Daily Breakdown Summary</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders Completed</th>
              <th>Total Daily Sales</th>
            </tr>
          </thead>
          <tbody>
            {data?.dailyBreakdown?.map((day, idx) => (
              <tr key={idx}>
                <td><strong style={{ color: '#fff' }}>{day.date}</strong></td>
                <td>{day.count} orders</td>
                <td><strong style={{ color: '#10B981' }}>₹{day.sales}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
