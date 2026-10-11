import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Boxes, AlertTriangle, Plus, RefreshCw } from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadInventory = async () => {
    try {
      const data = await api.getCanteenMenuOwner();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAddStock = async (itemId, currentQty, addCount) => {
    setUpdatingId(itemId);
    const newQty = (currentQty || 0) + addCount;
    try {
      await api.updateMenuItem(itemId, { availableQuantity: newQty });
      await loadInventory();
    } catch (err) {
      alert('Error updating stock: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>📦 Kitchen Inventory & Stock Control</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Monitor ingredient portions, track low-stock warnings, and replenish dish quantities.
          </p>
        </div>

        <button onClick={loadInventory} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading inventory...</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Menu Item</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Quick Restock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const qty = i.availableQuantity !== null ? i.availableQuantity : 100;
                const isLow = qty < 15;
                const isOut = qty === 0;

                return (
                  <tr key={i._id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{i.name}</strong>
                    </td>
                    <td><span className="badge badge-placed">{i.category}</span></td>
                    <td>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isOut ? '#EF4444' : (isLow ? '#F59E0B' : '#10B981') }}>
                        {qty} units
                      </span>
                    </td>
                    <td>
                      {isOut ? (
                        <span className="badge badge-rejected">OUT OF STOCK</span>
                      ) : isLow ? (
                        <span className="badge badge-pending">LOW STOCK</span>
                      ) : (
                        <span className="badge badge-open">HEALTHY</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={updatingId === i._id}
                          onClick={() => handleAddStock(i._id, qty, 20)}
                          className="btn btn-outline btn-sm"
                        >
                          +20
                        </button>
                        <button
                          disabled={updatingId === i._id}
                          onClick={() => handleAddStock(i._id, qty, 50)}
                          className="btn btn-primary btn-sm"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
