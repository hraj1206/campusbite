import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, UserCheck, Shield, Store, RefreshCw } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    try {
      let params = '';
      if (roleFilter !== 'all') params += `role=${roleFilter}&`;
      if (search) params += `search=${encodeURIComponent(search)}`;
      const data = await api.getAdminUsers(params);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    const confirmMsg = nextStatus === 'suspended'
      ? `Are you sure you want to suspend "${user.name}"? They will be immediately logged out and unable to access CampusBite.`
      : `Reactivate account for "${user.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(user._id);
    try {
      await api.updateUserStatus(user._id, nextStatus);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Error updating user status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>👥 Campus User Administration</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Inspect student registrations, canteen owner accounts, and enforce platform security policies.
          </p>
        </div>

        <button onClick={loadUsers} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '260px', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'student', 'canteen', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`pill ${roleFilter === r ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading users...</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Student ID / Info</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSuspended = u.accountStatus === 'suspended';
                return (
                  <tr key={u._id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-pending' : (u.role === 'canteen' ? 'badge-open' : 'badge-placed')}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: '#94A3B8' }}>
                      {u.studentId ? `ID: ${u.studentId}` : (u.phone || 'Campus')}
                    </td>
                    <td>
                      <span className={`badge ${isSuspended ? 'badge-rejected' : 'badge-approved'}`}>
                        {u.accountStatus || 'active'}
                      </span>
                    </td>
                    <td>
                      <button
                        disabled={updatingId === u._id}
                        onClick={() => handleToggleStatus(u)}
                        className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-danger'}`}
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
