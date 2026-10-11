import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { items, canteen, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromCart, clearCart, totalAmount, totalCount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0 || !canteen) return;
    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        canteenId: canteen._id,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        paymentMethod: 'pay_at_counter'
      };

      const createdOrder = await api.placeOrder(orderData);
      clearCart();
      setIsDrawerOpen(false);
      navigate('/student/orders');
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '420px', maxWidth: '90vw', height: '100vh', backgroundColor: '#141D2E', borderLeft: '1px solid #2A3B5A', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A3B5A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="#FF5722" />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Your Tray ({totalCount})</h3>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Canteen Scope Notice */}
        {canteen && (
          <div style={{ padding: '10px 24px', backgroundColor: 'rgba(255, 87, 34, 0.08)', borderBottom: '1px solid #2A3B5A', fontSize: '0.85rem', color: '#FF8A65' }}>
            Ordering from: <strong style={{ color: '#fff' }}>{canteen.name}</strong>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{ margin: '14px 24px 0', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '10px', color: '#F87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: '80px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛒</div>
              <p style={{ fontWeight: 600 }}>Your tray is empty.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Add your favorite meals from the canteen menu!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.menuItemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#1B263C', borderRadius: '12px', border: '1px solid #2A3B5A' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ color: '#FF5722', fontWeight: 600, fontSize: '0.88rem', marginTop: '2px' }}>₹{item.price * item.quantity}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQuantity(item.menuItemId, -1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #2A3B5A', background: '#141D2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #2A3B5A', background: '#141D2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item.menuItemId)} style={{ background: 'transparent', border: 'none', color: '#EF4444', marginLeft: '6px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #2A3B5A', backgroundColor: '#1B263C' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#94A3B8' }}>
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.9rem', color: '#94A3B8' }}>
              <span>Payment Mode</span>
              <span style={{ color: '#34D399', fontWeight: 600 }}>Pay at Counter (Cash/UPI)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              <span>Total Amount</span>
              <span style={{ color: '#FF5722' }}>₹{totalAmount}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px' }}
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
