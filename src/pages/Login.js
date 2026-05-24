import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'nurse',        label: 'Nurse',        color: '#185FA5', bg: '#E6F1FB', icon: '🩺' },
  { key: 'doctor',       label: 'Doctor',       color: '#3B6D11', bg: '#EAF3DE', icon: '👨‍⚕️' },
  { key: 'wardmanager',  label: 'Ward Manager', color: '#854F0B', bg: '#FAEEDA', icon: '🏥' },
  { key: 'admin',        label: 'Admin',        color: '#A32D2D', bg: '#FCEBEB', icon: '⚙️' },
  { key: 'pharmacist',   label: 'Pharmacist',   color: '#0F6E56', bg: '#E1F5EE', icon: '💊' },
  { key: 'receptionist', label: 'Receptionist', color: '#3C3489', bg: '#EEEDFE', icon: '🛎️' },
];

const ROUTE_MAP = {
  nurse:        '/nurse',
  doctor:       '/doctor',
  wardmanager:  '/wardmanager',
  admin:        '/admin',
  pharmacist:   '/pharmacist',
  receptionist: '/receptionist',
};

const DEMO = [
  { role: 'nurse',        name: 'Deepa Menon',   pass: 'nurse123'   },
  { role: 'doctor',       name: 'Dr. Srikanth',  pass: 'doctor123'  },
  { role: 'wardmanager',  name: 'Anita Sharma',  pass: 'ward123'    },
  { role: 'admin',        name: 'Rajesh Kumar',  pass: 'admin123'   },
  { role: 'pharmacist',   name: 'Preethi Nair',  pass: 'pharma123'  },
  { role: 'receptionist', name: 'Suman Reddy',   pass: 'recept123'  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const currentRole = ROLES.find(r => r.key === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select your role first'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(name, password);
    setLoading(false);
    if (result.success) {
      navigate(ROUTE_MAP[result.user.role]);
    } else {
      setError('Invalid name or password. Please try again.');
    }
  };

  const autofill = (demo) => {
    setName(demo.name);
    setPassword(demo.pass);
    setSelectedRole(demo.role);
    setError('');
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.logoBox}>🏥</div>
          <h1 style={s.title}>MediTrack HMS</h1>
          <p style={s.subtitle}>Hospital Management System · Ward 4B</p>
        </div>

        {/* Role Grid */}
        <p style={s.roleLabel}>Select your role</p>
        <div style={s.roleGrid}>
          {ROLES.map(role => (
            <button
              key={role.key}
              onClick={() => { setSelectedRole(role.key); setError(''); }}
              style={{
                ...s.roleBtn,
                border: selectedRole === role.key
                  ? `2px solid ${role.color}`
                  : '1.5px solid #e0e0e0',
                background: selectedRole === role.key ? role.bg : '#fff',
              }}
            >
              <span style={{ fontSize: 24 }}>{role.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: selectedRole === role.key ? role.color : '#666'
              }}>
                {role.label}
              </span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. Deepa Menon"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              background: currentRole ? currentRole.color : '#ccc',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? 'Signing in...'
              : `Sign in as ${currentRole ? currentRole.label : '...'}`}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={s.demoBox}>
          <p style={s.demoTitle}>Demo accounts — click to autofill</p>
          <div style={s.demoGrid}>
            {DEMO.map(d => (
              <div key={d.role} style={s.demoRow} onClick={() => autofill(d)}>
                <span style={s.demoRole}>
                  {ROLES.find(r => r.key === d.role)?.label}
                </span>
                <span style={s.demoPass}>{d.pass}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card:      { background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' },
  header:    { textAlign: 'center', marginBottom: '1.5rem' },
  logoBox:   { fontSize: 52, marginBottom: 8 },
  title:     { fontSize: 26, fontWeight: 700, color: '#1a1a2e' },
  subtitle:  { fontSize: 13, color: '#888', marginTop: 4 },
  roleLabel: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  roleGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.5rem' },
  roleBtn:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 10, cursor: 'pointer', transition: 'all .15s' },
  form:      { display: 'flex', flexDirection: 'column', gap: 14 },
  field:     { display: 'flex', flexDirection: 'column', gap: 5 },
  label:     { fontSize: 13, fontWeight: 500, color: '#444' },
  input:     { padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, color: '#1a1a2e' },
  error:     { background: '#fff0f0', border: '1px solid #ffcdd2', color: '#c0392b', borderRadius: 8, padding: '8px 12px', fontSize: 13 },
  submitBtn: { padding: '12px', borderRadius: 10, border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 4 },
  demoBox:   { marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: 10, border: '1px dashed #e0e0e0' },
  demoTitle: { fontSize: 11, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  demoGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 },
  demoRow:   { background: '#fff', border: '1px solid #eee', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column' },
  demoRole:  { fontSize: 12, fontWeight: 500, color: '#333' },
  demoPass:  { fontSize: 11, color: '#aaa' },
};