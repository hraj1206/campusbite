import React from 'react';
import { Sliders, Database, Shield, Key } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff' }}>⚙️ Platform System Configuration</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
          Inspect global system constants, database connections, and operational credentials.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Database size={20} color="#10B981" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Database Cluster Status</h3>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '12px' }}>
            Connected to <strong>MongoDB Atlas</strong> cloud cluster (`cluster0.iof3oyi.mongodb.net/campusbite`).
          </p>
          <span className="badge badge-open">Active & Healthy 🟢</span>
        </div>

        <div style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Key size={20} color="#FF5722" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Demo Role Accounts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div style={{ padding: '10px 14px', backgroundColor: '#1B263C', borderRadius: '10px' }}>
              <strong>Platform Administrator:</strong> <code style={{ color: '#60A5FA' }}>admin@campusbite.local</code> (Password: <code>AdminPassword123!</code>)
            </div>
            <div style={{ padding: '10px 14px', backgroundColor: '#1B263C', borderRadius: '10px' }}>
              <strong>Canteen Owners:</strong> <code style={{ color: '#34D399' }}>owner1@campusbite.local</code>, <code>owner2@</code>, <code>owner3@</code>
            </div>
            <div style={{ padding: '10px 14px', backgroundColor: '#1B263C', borderRadius: '10px' }}>
              <strong>Demo Students:</strong> <code style={{ color: '#FF8A65' }}>student1@campusbite.local</code>, <code>student2@</code>, <code>student3@</code>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#141D2E', borderRadius: '18px', border: '1px solid #2A3B5A', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Shield size={20} color="#3B82F6" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Security & Token Invalidation Model</h3>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Roles and account permissions are fetched freshly from MongoDB on every request. JWT carries only user ID and <code>tokenVersion</code>. Suspending a user or logging out bumps <code>tokenVersion</code>, instantly terminating active sessions across all devices.
          </p>
        </div>
      </div>
    </div>
  );
}
