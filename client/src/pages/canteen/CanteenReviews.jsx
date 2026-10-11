import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Star, MessageSquare } from 'lucide-react';

export default function CanteenReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await api.getCanteenReviews();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>⭐ Customer Reviews & Feedback</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
          See what students are saying about your food quality, taste, and counter service.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A' }}>
          <MessageSquare size={36} color="#64748B" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#94A3B8' }}>No student reviews submitted yet. Reviews will show up as students complete orders.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {reviews.map((rev) => (
            <div key={rev._id} style={{ backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{rev.studentId?.name || 'Student'}</span>
                <span style={{ color: '#FBBF24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  ★ {rev.rating} / 5
                </span>
              </div>
              <p style={{ color: '#CBD5E1', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '12px' }}>
                "{rev.comment || 'Great meal!'}"
              </p>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', borderTop: '1px solid #2A3B5A', paddingTop: '10px' }}>
                {new Date(rev.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
