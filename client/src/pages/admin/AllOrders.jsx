import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShoppingBag, RefreshCw, Search } from 'lucide-react';

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadOrders = async () => {
    try {
      let params = '';
      if (statusFilter !== 'all') params += `status=${statusFilter}`;
      const data = await api.getAdminOrders(params);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    return o.orderNumber.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>📦 Platform-Wide Orders Stream</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Monitor every meal order, student payment status, and canteen throughput across campus.
          </p>
        </div>

        <button onClick={loadOrders} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {['all', 'placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`pill ${statusFilter === st ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading orders...</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Canteen</th>
                <th>Items Ordered</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td><strong style={{ color: '#fff' }}>#{o.orderNumber}</strong></td>
                  <td>{o.canteenId?.name || 'Campus Canteen'}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>
                      {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </span>
                  </td>
                  <td><strong style={{ color: '#FF5722' }}>₹{o.totalAmount}</strong></td>
                  <td>
                    <span className={`badge badge-${o.orderStatus}`}>{o.orderStatus}</span>
                  </td>
                  <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
