import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Save, Check } from 'lucide-react';

export default function CanteenSettings() {
  const [canteen, setCanteen] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [openHour, setOpenHour] = useState('08:00');
  const [closeHour, setCloseHour] = useState('20:00');
  const [phone, setPhone] = useState('');
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [operationalStatus, setOperationalStatus] = useState('open');
  const [submitting, setSubmitting] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    async function loadCanteen() {
      try {
        const data = await api.getCanteenDashboard();
        if (data.canteen) {
          setCanteen(data.canteen);
          setName(data.canteen.name || '');
          setLocation(data.canteen.location || '');
          setDescription(data.canteen.description || '');
          setOpenHour(data.canteen.openingHours?.open || '08:00');
          setCloseHour(data.canteen.openingHours?.close || '20:00');
          setPhone(data.canteen.contact?.phone || '');
          setAcceptingOrders(data.canteen.acceptingOrders !== false);
          setOperationalStatus(data.canteen.operationalStatus || 'open');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCanteen();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedMsg('');

    try {
      await api.updateCanteenSettings({
        name,
        location,
        description,
        openingHours: { open: openHour, close: closeHour },
        contact: { phone },
        acceptingOrders,
        operationalStatus
      });
      setSavedMsg('Canteen configuration saved successfully!');
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>⚙️ Canteen Counter & Store Settings</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
          Manage your canteen profile, operating hours, and order acceptance controls.
        </p>
      </div>

      {savedMsg && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '12px', color: '#34D399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      <div style={{ backgroundColor: '#141D2E', borderRadius: '20px', border: '1px solid #2A3B5A', padding: '30px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Canteen Name</label>
            <input type="text" required className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Location on Campus</label>
            <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows="2" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Opening Time</label>
              <input type="time" className="form-control" value={openHour} onChange={(e) => setOpenHour(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Closing Time</label>
              <input type="time" className="form-control" value={closeHour} onChange={(e) => setCloseHour(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '20px 0', padding: '16px', backgroundColor: '#1B263C', borderRadius: '12px', border: '1px solid #2A3B5A' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#fff', marginBottom: '4px', fontSize: '0.9rem' }}>Accepting Live Orders</label>
              <p style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Toggle whether students can place new orders right now.</p>
              <button
                type="button"
                onClick={() => setAcceptingOrders(!acceptingOrders)}
                className={`btn btn-sm ${acceptingOrders ? 'btn-success' : 'btn-danger'}`}
                style={{ marginTop: '8px' }}
              >
                {acceptingOrders ? '✓ Accepting Orders' : '✕ Paused Orders'}
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#fff', marginBottom: '4px', fontSize: '0.9rem' }}>Operational Status</label>
              <p style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Set your canteen open or closed status.</p>
              <button
                type="button"
                onClick={() => setOperationalStatus(operationalStatus === 'open' ? 'closed' : 'open')}
                className={`btn btn-sm ${operationalStatus === 'open' ? 'btn-success' : 'btn-outline'}`}
                style={{ marginTop: '8px' }}
              >
                {operationalStatus === 'open' ? '🟢 Open for Business' : '🔴 Closed'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            <span>{submitting ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
