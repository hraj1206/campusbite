import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';
import { RefreshCw, Check, ChefHat, Bell, CheckCircle2, XCircle, Phone, User } from 'lucide-react';

export default function LiveOrders() {
  const { soundEnabled } = useOutletContext() || { soundEnabled: true };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [msg, setMsg] = useState('');

  const loadOrders = async () => {
    try {
      const data = await api.getCanteenOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load canteen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 6000); // Poll orders every 6s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    let reason = '';
    if (nextStatus === 'cancelled') {
      const input = prompt('Please enter a cancellation / rejection reason for the student:');
      if (!input) return;
      reason = input;
    }

    setProcessingId(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus, reason);
      setMsg(`Order status changed to "${nextStatus.toUpperCase()}"`);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Error updating order status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.orderStatus === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>🍳 Live Order Management Queue</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Accept incoming orders, update kitchen cooking stages, and notify students for counter pickup.
          </p>
        </div>

        <button onClick={loadOrders} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: '16px', padding: '10px 16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '10px', color: '#34D399', fontSize: '0.88rem' }}>
          {msg}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'placed', label: '⚡ Incoming (Placed)' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'preparing', label: 'Cooking (Preparing)' },
          { key: 'ready', label: 'Ready for Pickup' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`pill ${filter === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A' }}>
          <p style={{ color: '#94A3B8' }}>No orders currently in the "{filter.toUpperCase()}" queue.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((o) => {
            const isProcessing = processingId === o._id;

            return (
              <div
                key={o._id}
                style={{
                  backgroundColor: '#141D2E',
                  borderRadius: '16px',
                  border: '1px solid #2A3B5A',
                  padding: '22px',
                  borderLeft: o.orderStatus === 'placed' ? '5px solid #3B82F6' : (o.orderStatus === 'preparing' ? '5px solid #F59E0B' : (o.orderStatus === 'ready' ? '5px solid #10B981' : '1px solid #2A3B5A'))
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #2A3B5A' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Order #{o.orderNumber}</h3>
                      <span className={`badge badge-${o.orderStatus}`}>{o.orderStatus}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#94A3B8', fontSize: '0.85rem', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} color="#FF5722" />
                        {o.studentId?.name || 'Student'} ({o.studentId?.studentId || 'ID: CS101'})
                      </span>
                      {o.studentId?.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={14} color="#34D399" />
                          {o.studentId.phone}
                        </span>
                      )}
                      <span>• {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FF5722' }}>₹{o.totalAmount}</div>
                    <span style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 600 }}>Pay at Counter</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '16px', backgroundColor: '#1B263C', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2A3B5A' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>Ordered Items:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {o.items.map((i) => (
                      <div key={i.menuItemId} style={{ color: '#fff', fontSize: '0.92rem' }}>
                        <strong>{i.name}</strong> × <span style={{ color: '#FF5722', fontWeight: 700 }}>{i.quantity}</span> (₹{i.price * i.quantity})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Workflow Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                  {o.orderStatus === 'placed' && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(o._id, 'accepted')}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Check size={16} />
                        <span>Accept Order</span>
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(o._id, 'cancelled')}
                        className="btn btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {o.orderStatus === 'accepted' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(o._id, 'preparing')}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ChefHat size={16} />
                      <span>Start Preparing 🍳</span>
                    </button>
                  )}

                  {o.orderStatus === 'preparing' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(o._id, 'ready')}
                      className="btn btn-success"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Bell size={16} />
                      <span>Mark Ready for Pickup 🔔</span>
                    </button>
                  )}

                  {o.orderStatus === 'ready' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(o._id, 'completed')}
                      className="btn btn-success"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Complete & Hand Over ✅</span>
                    </button>
                  )}

                  {o.orderStatus === 'completed' && (
                    <span style={{ color: '#34D399', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} /> Delivered & Completed
                    </span>
                  )}

                  {o.orderStatus === 'cancelled' && (
                    <span style={{ color: '#F87171', fontSize: '0.85rem' }}>
                      Cancelled ({o.cancellationReason || 'No reason specified'})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
