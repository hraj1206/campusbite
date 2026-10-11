import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RefreshCw, Star, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState('');

  const loadOrders = async () => {
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000); // Poll status every 8s
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.cancelOrder(orderId, 'Cancelled by student');
      setMessage('Order cancelled successfully.');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setReviewing(true);
    try {
      await api.submitReview({
        orderId: reviewOrder._id,
        rating: Number(rating),
        comment
      });
      setMessage('Thank you for your rating & feedback!');
      setReviewOrder(null);
      setComment('');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Could not submit review');
    } finally {
      setReviewing(false);
    }
  };

  const steps = ['placed', 'accepted', 'preparing', 'ready', 'completed'];

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>📋 My Orders</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Track the live progress of your canteen orders from preparation to counter pickup.
          </p>
        </div>
        <button onClick={loadOrders} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '12px', color: '#34D399', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', backgroundColor: '#141D2E', borderRadius: '20px', border: '1px solid #2A3B5A' }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📦</div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>No orders placed yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Browse food from campus canteens and place your first meal order!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((o) => {
            const currentStepIdx = steps.indexOf(o.orderStatus);

            return (
              <div key={o._id} style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #2A3B5A' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Order #{o.orderNumber}</h3>
                      <span className={`badge badge-${o.orderStatus}`}>{o.orderStatus}</span>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '4px' }}>
                      🏫 {o.canteenId?.name || 'Canteen'} • {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FF5722' }}>₹{o.totalAmount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>Pay at Counter</div>
                  </div>
                </div>

                {/* Progress Steps */}
                {o.orderStatus !== 'cancelled' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 10px', position: 'relative' }}>
                    {steps.map((st, idx) => {
                      const isDone = idx < currentStepIdx;
                      const isActive = idx === currentStepIdx;
                      return (
                        <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? '#10B981' : (isActive ? '#FF5722' : '#1B263C'),
                              border: `2px solid ${isDone ? '#10B981' : (isActive ? '#FF5722' : '#2A3B5A')}`,
                              color: isDone || isActive ? '#fff' : '#94A3B8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 800
                            }}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#fff' : '#94A3B8', textTransform: 'uppercase' }}>
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ margin: '18px 0', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '10px', color: '#F87171', fontSize: '0.9rem' }}>
                    ⚠️ This order was cancelled: {o.cancellationReason || 'Cancelled'}
                  </div>
                )}

                {/* Items & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#F1F5F9' }}>
                    Items: {o.items.map((i) => <strong key={i.menuItemId}>{i.name} (x{i.quantity}) </strong>)}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {o.orderStatus === 'placed' && (
                      <button
                        onClick={() => handleCancel(o._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel Order
                      </button>
                    )}

                    {o.orderStatus === 'completed' && (
                      <button
                        onClick={() => setReviewOrder(o)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#FBBF24', borderColor: '#FBBF24' }}
                      >
                        ★ Rate Food & Service
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Rate Order #{reviewOrder.orderNumber}</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '18px' }}>How was the food from {reviewOrder.canteenId?.name || 'the canteen'}?</p>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Rating (1 - 5 Stars)</label>
                <div style={{ display: 'flex', gap: '10px', fontSize: '1.6rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span
                      key={num}
                      onClick={() => setRating(num)}
                      style={{ color: num <= rating ? '#FBBF24' : '#475569' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Feedback & Comments</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="The food was hot, tasty, and served quickly..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setReviewOrder(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={reviewing} className="btn btn-primary">
                  {reviewing ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
