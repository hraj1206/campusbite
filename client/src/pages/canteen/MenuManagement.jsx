import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Check, X, Utensils } from 'lucide-react';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [price, setPrice] = useState('');
  const [foodType, setFoodType] = useState('veg');
  const [prepTime, setPrepTime] = useState(10);
  const [quantity, setQuantity] = useState(50);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMenu = async () => {
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
    loadMenu();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Breakfast');
    setPrice('');
    setFoodType('veg');
    setPrepTime(10);
    setQuantity(50);
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setFoodType(item.foodType);
    setPrepTime(item.preparationTime || 10);
    setQuantity(item.availableQuantity !== null ? item.availableQuantity : 50);
    setDescription(item.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      category,
      price: Number(price),
      foodType,
      preparationTime: Number(prepTime),
      availableQuantity: Number(quantity),
      description
    };

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem._id, payload);
      } else {
        await api.createMenuItem(payload);
      }
      setModalOpen(false);
      await loadMenu();
    } catch (err) {
      alert(err.message || 'Error saving menu dish');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await api.updateMenuItem(item._id, { isAvailable: !item.isAvailable });
      loadMenu();
    } catch (err) {
      alert(err.message || 'Error updating item availability');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await api.deleteMenuItem(itemId);
      loadMenu();
    } catch (err) {
      alert(err.message || 'Error deleting dish');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>📋 Canteen Menu Management</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Add new dishes, update prices, manage stock, and toggle real-time availability.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>Add New Dish</span>
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading menu items...</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dish Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.description}</div>
                  </td>
                  <td><span className="badge badge-placed">{item.category}</span></td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: item.foodType === 'veg' ? '#34D399' : '#F87171', fontWeight: 600 }}>
                      {item.foodType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </td>
                  <td><strong style={{ color: '#fff' }}>₹{item.price}</strong></td>
                  <td>
                    <span className={item.availableQuantity < 15 ? 'badge badge-pending' : ''} style={{ fontWeight: 600 }}>
                      {item.availableQuantity !== null ? item.availableQuantity : 'Unlimited'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      className={`btn btn-sm ${item.isAvailable ? 'btn-success' : 'btn-outline'}`}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      {item.isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(item)} className="btn btn-outline btn-sm" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '16px' }}>
              {editingItem ? 'Edit Dish' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Dish Name</label>
                <input type="text" required className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paneer Butter Masala" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Dietary Type</label>
                  <select className="form-control" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="non-veg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" required min="1" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="80" />
                </div>
                <div className="form-group">
                  <label>Prep Time (mins)</label>
                  <input type="number" min="1" className="form-control" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input type="number" min="0" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea rows="2" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Made fresh with organic paneer and spices" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
