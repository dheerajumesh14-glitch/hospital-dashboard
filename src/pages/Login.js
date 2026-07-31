import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

const ROLES = [
  { key: 'nurse',        label: 'Nurse',        color: '#4DA3E8', bg: 'rgba(77,163,232,0.16)',  icon: '🩺' },
  { key: 'doctor',       label: 'Doctor',       color: '#4ADE9A', bg: 'rgba(74,222,154,0.16)',  icon: '👨‍⚕️' },
  { key: 'admin',        label: 'Admin',        color: '#F87171', bg: 'rgba(248,113,113,0.16)', icon: '⚙️' },
  { key: 'pharmacist',   label: 'Pharmacist',   color: '#22D3AE', bg: 'rgba(34,211,174,0.16)',  icon: '💊' },
  { key: 'receptionist', label: 'Receptionist', color: '#A78BFA', bg: 'rgba(167,139,250,0.16)', icon: '🛎️' },
];

const ROUTE_MAP = {
  nurse:        '/nurse',
  doctor:       '/doctor',
  admin:        '/admin',
  pharmacist:   '/pharmacist',
  receptionist: '/receptionist',
};

const DEMO = [
  { role: 'nurse',        name: 'Deepa Menon',   pass: 'nurse123'  },
  { role: 'doctor',       name: 'Dr. Srikanth',  pass: 'doctor123' },
  { role: 'admin',        name: 'Rajesh Kumar',  pass: 'admin123'  },
  { role: 'pharmacist',   name: 'Preethi Nair',  pass: 'pharma123' },
  { role: 'receptionist', name: 'Suman Reddy',   pass: 'recept123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [hoveredRole, setHoveredRole]   = useState('');
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
          {ROLES.map(role => {
            const isSelected = selectedRole === role.key;
            const isHovered  = hoveredRole === role.key;
            const active = isSelected || isHovered;
            return (
              <button
                key={role.key}
                onClick={() => { setSelectedRole(role.key); setError(''); }}
                onMouseEnter={() => setHoveredRole(role.key)}
                onMouseLeave={() => setHoveredRole('')}
                style={{
                  ...s.roleBtn,
                  border: active ? `2px solid ${role.color}` : `1.5px solid ${C.border}`,
                  background: active ? role.bg : C.cardAlt,
                  transform: isHovered && !isSelected ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: isHovered ? `0 6px 16px ${role.bg}` : 'none',
                }}
              >
                <span style={{ fontSize: 24 }}>{role.icon}</span>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: active ? role.color : C.textDim
                }}>
                  {role.label}
                </span>
              </button>
            );
          })}
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
              background: currentRole ? currentRole.color : C.gray,
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
  page:      { minHeight: '100vh', background: `linear-gradient(135deg, #071616, ${C.bg}, ${C.cardAlt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif' },
  card:      { background: C.card, borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: `0.5px solid ${C.border}` },
  header:    { textAlign: 'center', marginBottom: '1.5rem' },
  logoBox:   { fontSize: 52, marginBottom: 8 },
  title:     { fontSize: 26, fontWeight: 700, color: C.text },
  subtitle:  { fontSize: 13, color: C.textMute, marginTop: 4 },
  roleLabel: { fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  roleGrid:  { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: '1.5rem' },
  roleBtn:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 10, cursor: 'pointer', transition: 'all .15s ease', width: 'calc(33.333% - 6px)', minWidth: 100 },
  form:      { display: 'flex', flexDirection: 'column', gap: 14 },
  field:     { display: 'flex', flexDirection: 'column', gap: 5 },
  label:     { fontSize: 13, fontWeight: 500, color: C.textDim },
  input:     { padding: '10px 14px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.cardAlt },
  error:     { background: C.redBg, border: `1px solid ${C.redBorder}`, color: '#F87171', borderRadius: 8, padding: '8px 12px', fontSize: 13 },
  submitBtn: { padding: '12px', borderRadius: 10, border: 'none', color: '#0A2224', fontSize: 15, fontWeight: 700, marginTop: 4 },
  demoBox:   { marginTop: '1.5rem', padding: '1rem', background: C.cardAlt, borderRadius: 10, border: `1px dashed ${C.border}` },
  demoTitle: { fontSize: 11, color: C.textMute, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  demoGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 },
  demoRow:   { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform .12s ease' },
  demoRole:  { fontSize: 12, fontWeight: 500, color: C.text },
  demoPass:  { fontSize: 11, color: C.textMute },
};