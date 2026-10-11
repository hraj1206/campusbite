import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Store, Check, XCircle, RefreshCw, AlertTriangle, User } from 'lucide-react';

export default function CanteenManagement() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [msg, setMsg] = useState('');

  const loadCanteens = async () => {
    try {
      const data = await api.getAdminCanteens();
      setCanteens(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCanteens();
  }, []);

  const handleApprove = async (canteenId, status) => {
    let reason = '';
    if (status === 'rejected') {
      const input = prompt('Please enter a rejection reason for the canteen owner:');
      if (!input) return;
      reason = input;
    }

    setUpdatingId(canteenId);
    try {
      await api.updateCanteenApproval(canteenId, {
        approvalStatus: status,
        reason
      });
      setMsg(`Canteen successfully ${status}!`);
      await loadCanteens();
    } catch (err) {
      alert(err.message || 'Error updating canteen approval');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleOperational = async (canteen) => {
    const nextOp = canteen.operationalStatus === 'suspended' ? 'open' : 'suspended';
    setUpdatingId(canteen._id);
    try {
      await api.updateCanteenApproval(canteen._id, {
        operationalStatus: nextOp
      });
      setMsg(`Canteen operational status updated to "${nextOp.toUpperCase()}"`);
      await loadCanteens();
    } catch (err) {
      alert(err.message || 'Error updating canteen');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCanteens = canteens.filter((c) => c.approvalStatus === 'pending');
  const activeCanteens = canteens.filter((c) => c.approvalStatus !== 'pending');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>🏫 Canteen Registrations & Approval Governance</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Review new vendor registration requests, approve campus kitchens, and supervise operational statuses.
          </p>
        </div>

        <button onClick={loadCanteens} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '12px', color: '#34D399', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      {/* 1. Pending Approvals Section */}
      {pendingCanteens.length > 0 && (
        <div style={{ marginBottom: '36px', backgroundColor: 'rgba(245, 158, 11, 0.06)', borderRadius: '18px', border: '1px solid #F59E0B', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#FBBF24" />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
              Pending Canteen Registration Requests ({pendingCanteens.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {pendingCanteens.map((c) => (
              <div key={c._id} style={{ backgroundColor: '#141D2E', borderRadius: '14px', border: '1px solid #2A3B5A', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{c.name}</h4>
                  <span className="badge badge-pending">PENDING</span>
                </div>
                <p style={{ color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '12px' }}>{c.description}</p>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '14px' }}>
                  <div>📍 Location: {c.location || 'Campus'}</div>
                  <div style={{ marginTop: '4px' }}>👤 Owner: {c.ownerId?.name} ({c.ownerId?.email})</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    disabled={updatingId === c._id}
                    onClick={() => handleApprove(c._id, 'approved')}
                    className="btn btn-success btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Check size={14} />
                    <span>Approve Canteen</span>
                  </button>
                  <button
                    disabled={updatingId === c._id}
                    onClick={() => handleApprove(c._id, 'rejected')}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. All Registered Canteens Table */}
      <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>All Registered Campus Canteens</h3>
      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading canteens...</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Canteen Name</th>
                <th>Location</th>
                <th>Owner Details</th>
                <th>Approval</th>
                <th>Operating Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCanteens.map((c) => {
                const isSuspended = c.operationalStatus === 'suspended';
                return (
                  <tr key={c._id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{c.name}</strong>
                    </td>
                    <td>{c.location || 'Campus'}</td>
                    <td>
                      <div>{c.ownerId?.name || 'Owner'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{c.ownerId?.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.approvalStatus === 'approved' ? 'badge-approved' : 'badge-rejected'}`}>
                        {c.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isSuspended ? 'badge-suspended' : 'badge-open'}`}>
                        {c.operationalStatus || 'open'}
                      </span>
                    </td>
                    <td>
                      <button
                        disabled={updatingId === c._id}
                        onClick={() => handleToggleOperational(c)}
                        className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-outline'}`}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        {isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
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
