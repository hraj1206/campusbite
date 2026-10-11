import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Search, MapPin, Star, Clock, Plus, Check } from 'lucide-react';

export default function StudentDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [foodType, setFoodType] = useState('all');
  const [addedNotice, setAddedNotice] = useState(null);

  const { addToCart, canteen: cartCanteen } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [cList, mList] = await Promise.all([
          api.getCanteens(),
          api.getAllMenuItems()
        ]);
        setCanteens(cList);
        setMenuItems(mList);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAdd = (dish) => {
    const dishCanteen = canteens.find((c) => c._id === dish.canteenId);
    const added = addToCart(dish, dishCanteen);
    if (added) {
      setAddedNotice(dish._id);
      setTimeout(() => setAddedNotice(null), 1500);
    }
  };

  const categories = ['all', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Desserts'];

  const filteredDishes = menuItems.filter((dish) => {
    if (selectedCanteen && dish.canteenId !== selectedCanteen._id) return false;
    if (category !== 'all' && dish.category.toLowerCase() !== category.toLowerCase()) return false;
    if (foodType !== 'all' && dish.foodType !== foodType) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchDesc = dish.description && dish.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#94A3B8' }}>Loading campus food court...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      {/* Hero Search Section */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          What are you craving today?
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 28px' }}>
          Explore dishes from approved campus canteens. Order ahead and pick up directly from the counter.
        </p>

        {/* Search & Filter Bar */}
        <div style={{ maxWidth: '820px', margin: '0 auto', backgroundColor: '#141D2E', padding: '12px 18px', borderRadius: '18px', border: '1px solid #2A3B5A', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={20} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search dishes (Dosa, Biryani, Coffee, Burger...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <button
              onClick={() => setFoodType(foodType === 'veg' ? 'all' : 'veg')}
              className={`pill ${foodType === 'veg' ? 'active' : ''}`}
              style={{ backgroundColor: foodType === 'veg' ? '#10B981' : '#1B263C', borderColor: foodType === 'veg' ? '#10B981' : '#2A3B5A' }}
            >
              🟢 Veg Only
            </button>
            <button
              onClick={() => setFoodType(foodType === 'non-veg' ? 'all' : 'non-veg')}
              className={`pill ${foodType === 'non-veg' ? 'active' : ''}`}
              style={{ backgroundColor: foodType === 'non-veg' ? '#EF4444' : '#1B263C', borderColor: foodType === 'non-veg' ? '#EF4444' : '#2A3B5A' }}
            >
              🔴 Non-Veg Only
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`pill ${category === cat ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'all' ? 'All Dishes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Canteens List */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff' }}>🏫 Campus Canteens</h2>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{canteens.length} Open & Serving</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {canteens.map((c) => {
            const isSelected = selectedCanteen?._id === c._id;
            return (
              <div
                key={c._id}
                onClick={() => setSelectedCanteen(isSelected ? null : c)}
                style={{
                  backgroundColor: '#141D2E',
                  borderRadius: '16px',
                  padding: '20px',
                  border: isSelected ? '2px solid #FF5722' : '1px solid #2A3B5A',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 0 20px rgba(255, 87, 34, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{c.name}</h3>
                  <span className="badge badge-open">OPEN</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '14px', minHeight: '38px' }}>
                  {c.description || 'Serving freshly prepared campus food.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', borderTop: '1px solid #2A3B5A', paddingTop: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#FF5722" />
                    {c.location || 'Campus Block'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    {c.averageRating > 0 ? c.averageRating.toFixed(1) : '4.5'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#34D399" />
                    {c.openingHours?.open || '08:00'} - {c.openingHours?.close || '20:00'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Menu Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff' }}>
            🍽️ {selectedCanteen ? `Menu: ${selectedCanteen.name}` : 'All Dishes'}
          </h2>
          {selectedCanteen && (
            <button
              onClick={() => setSelectedCanteen(null)}
              style={{ background: 'transparent', border: 'none', color: '#FF5722', fontSize: '0.85rem', cursor: 'pointer', marginTop: '4px', padding: 0 }}
            >
              ← Clear canteen filter (show all dishes)
            </button>
          )}
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{filteredDishes.length} Dishes available</span>
      </div>

      {/* 3. Menu Grid */}
      {filteredDishes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A' }}>
          <p style={{ color: '#94A3B8', fontSize: '1rem' }}>No dishes found matching your search or filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {filteredDishes.map((dish) => {
            const dishCanteen = canteens.find((c) => c._id === dish.canteenId);
            const isJustAdded = addedNotice === dish._id;

            return (
              <div
                key={dish._id}
                style={{
                  backgroundColor: '#1B263C',
                  borderRadius: '16px',
                  border: '1px solid #2A3B5A',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#FF8A65', fontWeight: 700, textTransform: 'uppercase' }}>
                      {dishCanteen?.name || dish.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        ★ {dish.averageRating > 0 ? dish.averageRating.toFixed(1) : '4.2'}
                      </span>
                      <div className={`food-type-icon ${dish.foodType}`}></div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{dish.name}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px', minHeight: '36px' }}>
                    {dish.description || 'Cooked fresh upon order in canteen.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>₹{dish.price}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Prep: {dish.preparationTime || 10} mins</div>
                  </div>

                  <button
                    onClick={() => handleAdd(dish)}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.88rem',
                      backgroundColor: isJustAdded ? '#10B981' : undefined
                    }}
                  >
                    {isJustAdded ? <Check size={16} /> : <Plus size={16} />}
                    <span>{isJustAdded ? 'Added' : 'Add to Tray'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
