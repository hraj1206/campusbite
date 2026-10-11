import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Store, ArrowRight } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [canteenName, setCanteenName] = useState('');
  const [canteenLocation, setCanteenLocation] = useState('');
  const [canteenDesc, setCanteenDesc] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        role,
        name,
        email,
        password,
        phone,
        ...(role === 'student' && { studentId }),
        ...(role === 'canteen' && {
          canteen: {
            name: canteenName,
            location: canteenLocation,
            description: canteenDesc
          }
        })
      };

      const res = await api.register(payload);
      if (role === 'student') {
        // Log in directly
        await login({ email, password, portal: 'student' });
        navigate('/student/dashboard');
      } else {
        setSuccessMsg('Your canteen application has been submitted for Admin approval! You can log in once approved.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', padding: '20px' }}>
      <div style={{ maxWidth: '520px', width: '100%', backgroundColor: '#141D2E', borderRadius: '20px', border: '1px solid #2A3B5A', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Join Campus<span style={{ color: '#FF5722' }}>Bite</span></h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>Create an account to start ordering or managing food.</p>
        </div>

        {/* Role switcher */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#1B263C', padding: '6px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              backgroundColor: role === 'student' ? '#FF5722' : 'transparent',
              color: role === 'student' ? '#fff' : '#94A3B8', transition: 'all 0.2s'
            }}
          >
            🎓 Student Account
          </button>
          <button
            type="button"
            onClick={() => setRole('canteen')}
            style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              backgroundColor: role === 'canteen' ? '#10B981' : 'transparent',
              color: role === 'canteen' ? '#fff' : '#94A3B8', transition: 'all 0.2s'
            }}
          >
            🏪 Canteen Owner
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '18px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '10px', color: '#F87171', fontSize: '0.86rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ marginBottom: '18px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '10px', color: '#34D399', fontSize: '0.86rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required className="form-control" placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required className="form-control" placeholder="name@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Password (8+ chars with letters & numbers)</label>
            <input type="password" required className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" className="form-control" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label>College Student ID / Roll Number</label>
              <input type="text" required className="form-control" placeholder="e.g. 2026CS101" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </div>
          )}

          {role === 'canteen' && (
            <>
              <div className="form-group">
                <label>Canteen Name</label>
                <input type="text" required className="form-control" placeholder="e.g. Food Court South Block" value={canteenName} onChange={(e) => setCanteenName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location on Campus</label>
                <input type="text" className="form-control" placeholder="e.g. Block C Ground Floor" value={canteenLocation} onChange={(e) => setCanteenLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Canteen Description</label>
                <input type="text" className="form-control" placeholder="e.g. Specializing in healthy south Indian & juices" value={canteenDesc} onChange={(e) => setCanteenDesc(e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '1rem' }}>
            {submitting ? 'Submitting...' : `Register as ${role === 'student' ? 'Student' : 'Canteen Owner'}`}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.86rem', color: '#94A3B8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#FF5722', fontWeight: 700, textDecoration: 'underline' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
