import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Star, MessageSquare } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await api.getAdminReviews();
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
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>⭐ Platform Reviews & Student Feedback</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
          Inspect ratings across every campus canteen to monitor hygiene, taste, and student satisfaction.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A' }}>
          <MessageSquare size={36} color="#64748B" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#94A3B8' }}>No reviews recorded yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Canteen</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.studentId?.name || 'Student'}</strong></td>
                  <td>{r.canteenId?.name || 'Canteen'}</td>
                  <td>
                    <span style={{ color: '#FBBF24', fontWeight: 700 }}>
                      ★ {r.rating} / 5
                    </span>
                  </td>
                  <td>"{r.comment || 'No comment'}"</td>
                  <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
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
