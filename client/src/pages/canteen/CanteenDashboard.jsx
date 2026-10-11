import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NavLink } from 'react-router-dom';
import { DollarSign, ShoppingBag, Clock, ChefHat, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

export default function CanteenDashboard() {
  const [data, setData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dash, menu] = await Promise.all([
          api.getCanteenDashboard(),
          api.getCanteenMenuOwner()
        ]);
        setData(dash);
        setMenuItems(menu);
      } catch (err) {
        console.error('Error loading canteen dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <div style={{ color: '#94A3B8' }}>Loading canteen operations dashboard...</div>;

  const lowStockItems = menuItems.filter((i) => i.availableQuantity !== null && i.availableQuantity < 15);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>🍳 Kitchen & Counter Operations</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Live metrics and order management for {data?.canteen?.name || 'your canteen'}.
          </p>
        </div>

        <NavLink to="/canteen/orders" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>View Live Order Board</span>
          <ArrowRight size={16} />
        </NavLink>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Today's Sales</span>
            <DollarSign size={18} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>₹{data?.todaysSales || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Completed orders only</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Orders Today</span>
            <ShoppingBag size={18} color="#FF5722" />
          </div>
          <div className="kpi-value">{data?.todaysOrders || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Total processed today</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>New Incoming</span>
            <Clock size={18} color="#3B82F6" />
          </div>
          <div className="kpi-value" style={{ color: '#60A5FA' }}>{data?.pending || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Awaiting your acceptance</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>In Kitchen (Cooking)</span>
            <ChefHat size={18} color="#F59E0B" />
          </div>
          <div className="kpi-value" style={{ color: '#FBBF24' }}>{data?.preparing || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Currently being prepared</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Completed Today</span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
          <div className="kpi-value">{data?.completed || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px' }}>Served at counter</div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Top Selling Dishes */}
        <div style={{ backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <TrendingUp size={20} color="#FF5722" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Top Selling Dishes</h3>
          </div>

          {!data?.topDishes?.length ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No completed orders recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.topDishes.map((dish, idx) => (
                <div key={dish._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#1B263C', borderRadius: '10px', border: '1px solid #2A3B5A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: '#FF5722', width: '20px' }}>#{idx + 1}</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{dish._id}</span>
                  </div>
                  <span className="badge badge-open">{dish.qty} Sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <AlertTriangle size={20} color="#F59E0B" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Inventory & Stock Alerts</h3>
          </div>

          {lowStockItems.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ✓ All tracked menu items have sufficient stock!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid #F59E0B' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Price: ₹{item.price}</div>
                  </div>
                  <span className="badge badge-pending">Only {item.availableQuantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
