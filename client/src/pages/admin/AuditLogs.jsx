import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileText, Shield, RefreshCw } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await api.getAdminAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>📝 Security Audit Trail</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
            Immutable administrative logs capturing canteen reviews, status changes, and platform approvals.
          </p>
        </div>

        <button onClick={loadLogs} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#141D2E', borderRadius: '16px', border: '1px solid #2A3B5A' }}>
          <p style={{ color: '#94A3B8' }}>No audit actions recorded yet. Actions like approving canteens will appear here.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <strong style={{ color: '#fff' }}>{log.actorId?.name || 'Administrator'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{log.actorId?.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-pending">{log.action}</span>
                  </td>
                  <td>{log.targetType}</td>
                  <td>
                    <code style={{ fontSize: '0.78rem', color: '#60A5FA', background: '#1B263C', padding: '2px 6px', borderRadius: '4px' }}>
                      {JSON.stringify(log.details || {})}
                    </code>
                  </td>
                  <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
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
