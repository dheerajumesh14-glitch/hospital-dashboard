import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PATIENTS = [
  { id: 1, name: 'Priya Sharma',  bed: 4,  gender: 'F', age: 62, status: 'critical', bp: '148/92', hr: 112, temp: 38.9, spo2: 94, rr: 24, pain: 8,  iv: 'Saline',     ivPct: 12 },
  { id: 2, name: 'Ravi Kumar',    bed: 11, gender: 'M', age: 58, status: 'critical', bp: '92/60',  hr: 118, temp: 36.5, spo2: 91, rr: 26, pain: 6,  iv: 'Dopamine',   ivPct: 55 },
  { id: 3, name: 'Arjun Mehta',   bed: 7,  gender: 'M', age: 45, status: 'watch',    bp: '128/82', hr: 98,  temp: 37.8, spo2: 97, rr: 18, pain: 3,  iv: 'Antibiotics', ivPct: 28 },
  { id: 4, name: 'Leela Nair',    bed: 2,  gender: 'F', age: 73, status: 'stable',   bp: '118/76', hr: 72,  temp: 36.8, spo2: 99, rr: 16, pain: 1,  iv: 'Glucose',    ivPct: 72 },
  { id: 5, name: 'Farida Begum',  bed: 5,  gender: 'F', age: 55, status: 'stable',   bp: '122/80', hr: 76,  temp: 37.0, spo2: 98, rr: 17, pain: 2,  iv: 'Saline',     ivPct: 60 },
  { id: 6, name: 'Kiran Desai',   bed: 9,  gender: 'M', age: 40, status: 'watch',    bp: '135/88', hr: 95,  temp: 38.1, spo2: 96, rr: 19, pain: 4,  iv: 'Glucose',    ivPct: 40 },
];

const ALERTS = [
  { id: 1, type: 'critical', icon: '💧', title: 'IV drip nearly empty — Priya Sharma (Bed 4)', desc: 'Saline at 12% · ~8 min to empty' },
  { id: 2, type: 'critical', icon: '❤️', title: 'Low SpO₂ — Ravi Kumar (Bed 11)',              desc: 'SpO₂ 91% · below 95% threshold' },
  { id: 3, type: 'warning',  icon: '🌡️', title: 'High Temp — Priya Sharma (Bed 4)',            desc: '38.9°C · above 38°C threshold' },
  { id: 4, type: 'warning',  icon: '🫀', title: 'High HR — Ravi Kumar (Bed 11)',               desc: '118 bpm · above 100 bpm threshold' },
];

const NAV = [
  { key: 'vitals',  label: 'Vitals Monitor',  icon: '📊' },
  { key: 'alerts',  label: 'Alerts',          icon: '🔔' },
  { key: 'beds',    label: 'Bed Status',      icon: '🛏️' },
  { key: 'assets',  label: 'Asset Tracker',   icon: '♿' },
  { key: 'history', label: 'Task History',    icon: '📋' },
];

const BEDS = [
  { num: 1,  status: 'occupied',    patient: 'Sunita Rao'   },
  { num: 2,  status: 'occupied',    patient: 'Leela Nair'   },
  { num: 3,  status: 'vacant',      patient: ''             },
  { num: 4,  status: 'occupied',    patient: 'Priya Sharma ⚠' },
  { num: 5,  status: 'occupied',    patient: 'Farida Begum' },
  { num: 6,  status: 'vacant',      patient: ''             },
  { num: 7,  status: 'occupied',    patient: 'Arjun Mehta'  },
  { num: 8,  status: 'maintenance', patient: 'Deep clean'   },
  { num: 9,  status: 'occupied',    patient: 'Kiran Desai'  },
  { num: 10, status: 'reserved',    patient: 'Transfer 10:30' },
  { num: 11, status: 'occupied',    patient: 'Ravi Kumar ⚠' },
  { num: 12, status: 'occupied',    patient: 'Meena Joseph' },
  { num: 13, status: 'vacant',      patient: ''             },
  { num: 14, status: 'occupied',    patient: 'Babu Reddy'   },
  { num: 15, status: 'occupied',    patient: 'Hameed Ali'   },
  { num: 16, status: 'vacant',      patient: ''             },
];

function vitalColor(type, val) {
  if (type === 'hr')   return val > 100 ? '#E24B4A' : val > 90 ? '#BA7517' : '#3B6D11';
  if (type === 'temp') return val > 38  ? '#E24B4A' : val > 37.5 ? '#BA7517' : '#3B6D11';
  if (type === 'spo2') return val < 92  ? '#E24B4A' : val < 95 ? '#BA7517' : '#3B6D11';
  if (type === 'rr')   return val > 22  ? '#E24B4A' : val > 18 ? '#BA7517' : '#3B6D11';
  if (type === 'pain') return val >= 7  ? '#E24B4A' : val >= 4 ? '#BA7517' : '#3B6D11';
  return '#3B6D11';
}

function ivColor(pct) {
  return pct < 20 ? '#E24B4A' : pct < 35 ? '#BA7517' : '#3B6D11';
}

function bedColor(status) {
  if (status === 'occupied')    return { bg: '#FCEBEB', border: '#F7C1C1', color: '#A32D2D' };
  if (status === 'vacant')      return { bg: '#EAF3DE', border: '#C0DD97', color: '#3B6D11' };
  if (status === 'reserved')    return { bg: '#FAEEDA', border: '#FAC775', color: '#854F0B' };
  if (status === 'maintenance') return { bg: '#f5f5f5', border: '#e0e0e0', color: '#888'    };
  return {};
}

export default function NurseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('vitals');
  const [ackedAlerts, setAckedAlerts] = useState([]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const ackAlert = (id) => setAckedAlerts(prev => [...prev, id]);
  const activeAlerts = ALERTS.filter(a => !ackedAlerts.includes(a.id));

  return (
    <div style={s.app}>

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sbHead}>
          <div style={s.sbLogo}>
            <div style={s.sbLogoIcon}>🏥</div>
            <div>
              <div style={s.sbLogoText}>MediTrack</div>
              <div style={s.sbLogoSub}>Ward 4B</div>
            </div>
          </div>
          <div style={s.userPill}>
            <div style={s.avatar}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uRole}>Nurse · Morning shift</div>
            </div>
          </div>
        </div>

        <div style={s.sbNav}>
          <div style={s.navSection}>Patient Care</div>
          {NAV.map(n => (
            <div
              key={n.key}
              onClick={() => setActive(n.key)}
              style={{
                ...s.navItem,
                background: active === n.key ? '#E6F1FB' : 'transparent',
                color:      active === n.key ? '#0C447C' : '#555',
                fontWeight: active === n.key ? 500 : 400,
              }}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
              {n.key === 'alerts' && activeAlerts.length > 0 && (
                <span style={s.alertBadge}>{activeAlerts.length}</span>
              )}
            </div>
          ))}
        </div>

        <div style={s.sbFooter}>
          <div style={s.logoutBtn} onClick={handleLogout}>
            🚪 Sign out
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* Topbar */}
        <div style={s.topbar}>
          <div>
            <div style={s.tbTitle}>
              {NAV.find(n => n.key === active)?.icon}{' '}
              {NAV.find(n => n.key === active)?.label}
            </div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning shift</div>
          </div>
          <div style={s.tbRight}>
            <span style={s.tbBadge}>🟢 IoT Live</span>
            <span style={s.tbBadge}>12 patients</span>
            {activeAlerts.length > 0 && (
              <span style={s.alertDot} onClick={() => setActive('alerts')}>
                🔔 {activeAlerts.length}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={s.content}>

          {/* ── VITALS ── */}
          {active === 'vitals' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Patients</div><div style={s.statVal}>12</div><div style={s.statNote}>4 critical</div></div>
                <div style={s.stat}><div style={s.statLbl}>Vacant Beds</div><div style={{...s.statVal,color:'#3B6D11'}}>4</div><div style={s.statNote}>of 16 total</div></div>
                <div style={s.stat}><div style={s.statLbl}>Active Alerts</div><div style={{...s.statVal,color:'#E24B4A'}}>{activeAlerts.length}</div><div style={s.statNote}>2 critical</div></div>
                <div style={s.stat}><div style={s.statLbl}>IV Drips Due</div><div style={{...s.statVal,color:'#BA7517'}}>2</div><div style={s.statNote}>within 30 min</div></div>
              </div>

              <div style={s.secHead}>
                <span style={s.secTitle}>Patient Vitals — Live</span>
              </div>
              <div style={s.patientGrid}>
                {PATIENTS.map(p => (
                  <div key={p.id} style={{
                    ...s.pc,
                    borderLeft: p.status === 'critical' ? '4px solid #E24B4A' : '0.5px solid #e0e0e0'
                  }}>
                    <div style={s.pcHead}>
                      <div>
                        <div style={s.pcName}>{p.name}</div>
                        <div style={s.pcBed}>Bed {p.bed} · {p.gender}/{p.age}</div>
                      </div>
                      <span style={{
                        ...s.badge,
                        background: p.status === 'critical' ? '#FCEBEB' : p.status === 'watch' ? '#FAEEDA' : '#EAF3DE',
                        color:      p.status === 'critical' ? '#A32D2D' : p.status === 'watch' ? '#854F0B' : '#3B6D11',
                      }}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>

                    <div style={s.vitals}>
                      {[
                        { label: 'BP',    value: p.bp,             color: '#1a1a2e' },
                        { label: 'HR',    value: `${p.hr} bpm`,    color: vitalColor('hr',   p.hr)   },
                        { label: 'Temp',  value: `${p.temp}°C`,    color: vitalColor('temp', p.temp) },
                        { label: 'SpO₂', value: `${p.spo2}%`,     color: vitalColor('spo2', p.spo2) },
                        { label: 'RR',    value: `${p.rr}/min`,    color: vitalColor('rr',   p.rr)   },
                        { label: 'Pain',  value: `${p.pain}/10`,   color: vitalColor('pain', p.pain) },
                      ].map(v => (
                        <div key={v.label} style={s.vit}>
                          <div style={s.vn}>{v.label}</div>
                          <div style={{...s.vv, color: v.color}}>{v.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={s.ivRow}>
                      <span style={s.ivLbl}>💧 IV {p.iv}</span>
                      <div style={s.bar}>
                        <div style={{...s.bf, width:`${p.ivPct}%`, background: ivColor(p.ivPct)}} />
                      </div>
                      <span style={{fontSize:11, fontWeight:500, color: ivColor(p.ivPct)}}>{p.ivPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {active === 'alerts' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Active Alerts</span>
                <span style={{fontSize:13,color:'#888'}}>{activeAlerts.length} remaining</span>
              </div>
              {activeAlerts.length === 0 && (
                <div style={s.emptyBox}>✅ All alerts acknowledged!</div>
              )}
              {activeAlerts.map(a => (
                <div key={a.id} style={{
                  ...s.alertRow,
                  borderLeft: a.type === 'critical' ? '4px solid #E24B4A' : '4px solid #BA7517'
                }}>
                  <span style={{fontSize:24}}>{a.icon}</span>
                  <div style={{flex:1}}>
                    <div style={s.alTitle}>{a.title}</div>
                    <div style={s.alDesc}>{a.desc}</div>
                  </div>
                  <button style={s.ackBtn} onClick={() => ackAlert(a.id)}>
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── BEDS ── */}
          {active === 'beds' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Occupied</div><div style={{...s.statVal,color:'#E24B4A'}}>10</div></div>
                <div style={s.stat}><div style={s.statLbl}>Vacant</div><div style={{...s.statVal,color:'#3B6D11'}}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Reserved</div><div style={{...s.statVal,color:'#BA7517'}}>1</div></div>
                <div style={s.stat}><div style={s.statLbl}>Maintenance</div><div style={{...s.statVal,color:'#888'}}>1</div></div>
              </div>
              <div style={s.bedGrid}>
                {BEDS.map(b => {
                  const c = bedColor(b.status);
                  return (
                    <div key={b.num} style={{...s.bedCell, background:c.bg, borderColor:c.border}}>
                      <div style={s.bedNum}>Bed {String(b.num).padStart(2,'0')}</div>
                      <div style={{...s.bedStatus, color:c.color}}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </div>
                      <div style={s.bedPatient}>{b.patient || 'Ready'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ASSETS ── */}
          {active === 'assets' && (
            <div>
              <div style={s.secHead}><span style={s.secTitle}>Asset Tracker</span></div>
              {[
                { name: 'Wheelchairs', items: [
                  { id:'WC-01', loc:'Reception',   status:'available' },
                  { id:'WC-02', loc:'Bed 2',       status:'in-use'    },
                  { id:'WC-03', loc:'Radiology',   status:'in-use'    },
                  { id:'WC-04', loc:'Corridor A',  status:'available' },
                  { id:'WC-06', loc:'Maintenance', status:'unavailable'},
                ]},
                { name: 'Oxygen Cylinders', items: [
                  { id:'OC-01', loc:'Bed 4',    status:'available', pct:78  },
                  { id:'OC-07', loc:'Bed 11',   status:'low',       pct:18  },
                  { id:'OC-09', loc:'Corridor', status:'low',       pct:25  },
                  { id:'OC-05', loc:'ICU Backup',status:'available',pct:95  },
                ]},
              ].map(group => (
                <div key={group.name} style={s.assetCard}>
                  <div style={s.assetHead}>{group.name}</div>
                  {group.items.map(item => (
                    <div key={item.id} style={s.assetRow}>
                      <span style={s.assetId}>{item.id}</span>
                      <span style={s.assetLoc}>{item.loc}</span>
                      {item.pct !== undefined && (
                        <div style={s.miniBar}>
                          <div style={{...s.miniFill, width:`${item.pct}%`, background: item.pct < 25 ? '#E24B4A' : '#3B6D11'}} />
                        </div>
                      )}
                      <span style={{
                        ...s.badge,
                        background: item.status === 'available' ? '#EAF3DE' : item.status === 'in-use' ? '#FAEEDA' : '#FCEBEB',
                        color:      item.status === 'available' ? '#3B6D11' : item.status === 'in-use' ? '#854F0B' : '#A32D2D',
                      }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── HISTORY ── */}
          {active === 'history' && (
            <div>
              <div style={s.secHead}><span style={s.secTitle}>Task History — Today</span></div>
              {[
                { icon:'✅', title:'IV drip replaced — Leela Nair (Bed 2)',       meta:'Nurse Deepa · 07:42 · IV Glucose bag changed', status:'done'      },
                { icon:'✅', title:'Morning vitals recorded — all 12 patients',   meta:'Nurse Preethi · 06:30 · Routine check complete', status:'done'     },
                { icon:'⚠️', title:'Wheelchair WC-06 sent for maintenance',       meta:'Nurse Deepa · 06:15 · Faulty wheel logged',     status:'pending'   },
                { icon:'🔴', title:'SpO₂ alert — Ravi Kumar escalated',           meta:'Auto-system · 07:58 · Dr. Srikanth notified',   status:'escalated' },
                { icon:'✅', title:'Night shift handover complete',               meta:'Sr. Nurse Anita · 06:00 · Notes transferred',   status:'done'      },
              ].map((h,i) => (
                <div key={i} style={s.histRow}>
                  <span style={{fontSize:20}}>{h.icon}</span>
                  <div style={{flex:1}}>
                    <div style={s.histTitle}>{h.title}</div>
                    <div style={s.histMeta}>{h.meta}</div>
                  </div>
                  <span style={{
                    ...s.badge,
                    background: h.status==='done'?'#EAF3DE':h.status==='pending'?'#FAEEDA':'#FCEBEB',
                    color:      h.status==='done'?'#3B6D11':h.status==='pending'?'#854F0B':'#A32D2D',
                  }}>{h.status}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const s = {
  app:         { display:'flex', height:'100vh', background:'#f5f6fa', fontFamily:'sans-serif' },
  sidebar:     { width:220, background:'#fff', borderRight:'0.5px solid #e0e0e0', display:'flex', flexDirection:'column', flexShrink:0 },
  sbHead:      { padding:'1rem', borderBottom:'0.5px solid #e0e0e0' },
  sbLogo:      { display:'flex', alignItems:'center', gap:8 },
  sbLogoIcon:  { width:32, height:32, borderRadius:8, background:'#0f3460', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  sbLogoText:  { fontSize:14, fontWeight:600, color:'#1a1a2e' },
  sbLogoSub:   { fontSize:11, color:'#aaa' },
  userPill:    { marginTop:10, background:'#f5f6fa', borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 },
  avatar:      { width:28, height:28, borderRadius:'50%', background:'#E6F1FB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#0C447C', flexShrink:0 },
  uName:       { fontSize:12, fontWeight:500, color:'#1a1a2e' },
  uRole:       { fontSize:10, color:'#aaa' },
  sbNav:       { padding:'0.5rem 0.75rem', flex:1, overflowY:'auto' },
  navSection:  { fontSize:10, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.07em', padding:'10px 8px 5px' },
  navItem:     { display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, marginBottom:2, transition:'all .12s' },
  alertBadge:  { marginLeft:'auto', fontSize:10, background:'#FCEBEB', color:'#A32D2D', borderRadius:10, padding:'1px 6px', fontWeight:600 },
  sbFooter:    { padding:'0.75rem', borderTop:'0.5px solid #e0e0e0' },
  logoutBtn:   { display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, color:'#555' },
  main:        { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:      { background:'#fff', borderBottom:'0.5px solid #e0e0e0', padding:'0.75rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  tbTitle:     { fontSize:15, fontWeight:500, color:'#1a1a2e' },
  tbSub:       { fontSize:12, color:'#aaa', marginTop:2 },
  tbRight:     { display:'flex', alignItems:'center', gap:10 },
  tbBadge:     { fontSize:12, padding:'4px 10px', borderRadius:20, background:'#f5f6fa', color:'#555', border:'0.5px solid #e0e0e0' },
  alertDot:    { fontSize:12, padding:'4px 10px', borderRadius:20, background:'#FCEBEB', color:'#A32D2D', cursor:'pointer', fontWeight:600 },
  content:     { flex:1, overflowY:'auto', padding:'1rem 1.25rem' },
  statGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:'1rem' },
  stat:        { background:'#fff', border:'0.5px solid #e0e0e0', borderRadius:10, padding:'0.75rem 1rem' },
  statLbl:     { fontSize:11, color:'#aaa', marginBottom:3 },
  statVal:     { fontSize:22, fontWeight:500, color:'#1a1a2e', lineHeight:1 },
  statNote:    { fontSize:11, color:'#aaa', marginTop:2 },
  secHead:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  secTitle:    { fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.05em' },
  patientGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 },
  pc:          { background:'#fff', border:'0.5px solid #e0e0e0', borderRadius:12, padding:'0.85rem 1rem', cursor:'pointer' },
  pcHead:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  pcName:      { fontSize:13, fontWeight:500, color:'#1a1a2e' },
  pcBed:       { fontSize:11, color:'#aaa' },
  badge:       { fontSize:10, padding:'2px 8px', borderRadius:10, fontWeight:500 },
  vitals:      { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, marginBottom:8 },
  vit:         { background:'#f5f6fa', borderRadius:6, padding:'4px 6px' },
  vn:          { fontSize:9, color:'#aaa' },
  vv:          { fontSize:13, fontWeight:500 },
  ivRow:       { display:'flex', alignItems:'center', gap:6, paddingTop:6, borderTop:'0.5px solid #e0e0e0' },
  ivLbl:       { fontSize:10, color:'#aaa', whiteSpace:'nowrap' },
  bar:         { flex:1, height:4, background:'#f0f0f0', borderRadius:2, overflow:'hidden' },
  bf:          { height:'100%', borderRadius:2, transition:'width .4s' },
  alertRow:    { display:'flex', alignItems:'center', gap:12, background:'#fff', border:'0.5px solid #e0e0e0', borderRadius:12, padding:'0.85rem 1rem', marginBottom:8 },
  alTitle:     { fontSize:13, fontWeight:500, color:'#1a1a2e' },
  alDesc:      { fontSize:12, color:'#aaa', marginTop:2 },
  ackBtn:      { fontSize:12, padding:'5px 12px', borderRadius:8, border:'0.5px solid #e0e0e0', background:'#f5f6fa', color:'#555', cursor:'pointer' },
  emptyBox:    { background:'#EAF3DE', border:'1px solid #C0DD97', borderRadius:12, padding:'2rem', textAlign:'center', fontSize:16, color:'#3B6D11' },
  bedGrid:     { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 },
  bedCell:     { border:'0.5px solid', borderRadius:10, padding:'10px', cursor:'pointer' },
  bedNum:      { fontSize:11, fontWeight:500, color:'#888', marginBottom:3 },
  bedStatus:   { fontSize:12, fontWeight:500 },
  bedPatient:  { fontSize:11, color:'#888', marginTop:2 },
  assetCard:   { background:'#fff', border:'0.5px solid #e0e0e0', borderRadius:12, padding:'1rem', marginBottom:10 },
  assetHead:   { fontSize:13, fontWeight:500, color:'#1a1a2e', marginBottom:10 },
  assetRow:    { display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'0.5px solid #f0f0f0' },
  assetId:     { fontSize:11, color:'#aaa', width:50 },
  assetLoc:    { fontSize:12, color:'#1a1a2e', flex:1 },
  miniBar:     { width:48, height:4, background:'#f0f0f0', borderRadius:2, overflow:'hidden' },
  miniFill:    { height:'100%', borderRadius:2 },
  histRow:     { display:'flex', alignItems:'flex-start', gap:12, background:'#fff', border:'0.5px solid #e0e0e0', borderRadius:12, padding:'0.85rem 1rem', marginBottom:8 },
  histTitle:   { fontSize:13, fontWeight:500, color:'#1a1a2e' },
  histMeta:    { fontSize:11, color:'#aaa', marginTop:2 },
};