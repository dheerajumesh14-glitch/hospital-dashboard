import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { C, statusBadgeStyle } from '../theme';
import FilterDropdown from '../components/FilterDropdown';

// Live sensor API (same endpoint your Nurse dashboard already polls)
const LIVE_API_URL = 'https://rtgr7kit4f.execute-api.ap-south-1.amazonaws.com/dashboard-data';
// Real appointments read endpoint (your FastAPI backend)
const APPOINTMENTS_API_URL = 'http://localhost:8000/appointments';
const POLL_INTERVAL_MS = 5000;

const PATIENTS_BASE = [
  { id:1, name:'Priya Sharma',  bed:4,  diagnosis:'Hypertensive Crisis',  bp:'148/92', hr:112, temp:38.9, spo2:94,  status:'critical' },
  { id:2, name:'Ravi Kumar',    bed:11, diagnosis:'Septic Shock',          bp:'92/60',  hr:118, temp:36.5, spo2:91,  status:'critical' },
  { id:3, name:'Arjun Mehta',   bed:7,  diagnosis:'Pneumonia',             bp:'128/82', hr:98,  temp:37.8, spo2:97,  status:'watch'    },
  { id:4, name:'Leela Nair',    bed:2,  diagnosis:'Post-op Recovery',      bp:'118/76', hr:72,  temp:36.8, spo2:99,  status:'stable'   },
  { id:5, name:'Farida Begum',  bed:5,  diagnosis:'Type 2 Diabetes',       bp:'122/80', hr:76,  temp:37.0, spo2:98,  status:'stable'   },
  { id:6, name:'Kiran Desai',   bed:9,  diagnosis:'Acute Bronchitis',      bp:'135/88', hr:95,  temp:38.1, spo2:96,  status:'watch'    },
];

function severityToStatus(severity) {
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'WARNING') return 'watch';
  return 'stable';
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState('patients');
  const [patientsFilter, setPatientsFilter] = React.useState('all');

  const [liveData, setLiveData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(LIVE_API_URL);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setLiveData(data);
      } catch (err) {
        console.error('Live vitals fetch failed:', err);
      }
    }
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAppointments() {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        const doctorName = user?.name || '';
        const res = await fetch(`${APPOINTMENTS_API_URL}?doctor_name=${encodeURIComponent(doctorName)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setAppointments(data);
      } catch (err) {
        if (!cancelled) setAppointmentsError('Could not load appointments. Is the backend running?');
        console.error('Appointments fetch failed:', err);
      } finally {
        if (!cancelled) setAppointmentsLoading(false);
      }
    }

    fetchAppointments();
    return () => { cancelled = true; };
  }, [user]);

  // Split the SAME appointments data into two views based on keywords in
  // the "reason" field - surgical/procedural bookings vs routine visits.
  // No separate table needed; this is just a client-side categorization
  // of the one real appointments table.
  const OPERATION_KEYWORDS = ['surgery', 'operation', 'procedure', 'transplant', 'biopsy', 'removal', 'replacement'];
  const isOperation = (a) => {
    const reason = (a.reason || '').toLowerCase();
    return OPERATION_KEYWORDS.some(k => reason.includes(k));
  };
  const upcomingOperations = appointments.filter(isOperation);
  const upcomingRoutine = appointments.filter(a => !isOperation(a));

  const patients = PATIENTS_BASE.map(p => {
    if (p.bed === 11 && liveData?.patientVitals && !liveData.patientVitals.error) {
      const v = liveData.patientVitals;
      return {
        ...p,
        name: v.patient_name || p.name,
        status: severityToStatus(v.alert_severity),
        bp: v.systolic_bp ? `${v.systolic_bp}/--` : p.bp,
        hr: v.heart_rate_bpm ?? p.hr,
        temp: v.temperature_celsius ?? p.temp,
        spo2: v.spo2_percent ?? p.spo2,
        isLive: true,
      };
    }
    return p;
  });

  const filteredPatients = patientsFilter === 'all' ? patients : patients.filter(p => p.status === patientsFilter);
  const patientsFilterOptions = [
    { value: 'all', label: 'All Patients', count: patients.length },
    { value: 'critical', label: 'Critical', count: patients.filter(p => p.status === 'critical').length },
    { value: 'watch', label: 'Watch', count: patients.filter(p => p.status === 'watch').length },
    { value: 'stable', label: 'Stable', count: patients.filter(p => p.status === 'stable').length },
  ];

  const NAV = [
    { key:'patients',    label:'My Patients',          icon:'👥' },
    { key:'operations',  label:'Upcoming Operations',  icon:'⚕️' },
    { key:'appointments',label:'Upcoming Appointments',icon:'📅' },
  ];

  const renderPatientCard = (p) => {
    const badge = statusBadgeStyle(p.status);
    const stripe = p.status==='critical'? C.red : p.status==='watch'? C.amber : C.greenBright;
    return (
      <div key={p.id} className="hover-lift-soft" style={{...s.card, borderLeft: `4px solid ${stripe}`, position:'relative'}}>
        {p.isLive && <span style={s.liveTag}>● LIVE</span>}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div style={s.cardTitle}>{p.name}</div>
            <div style={s.cardSub}>Bed {p.bed} · {p.diagnosis}</div>
          </div>
          <span style={{...s.badge, ...badge}}>{p.status}</span>
        </div>
        <div style={s.vitalRow}>
          <span style={s.vitalItem}>BP: <b>{p.bp}</b></span>
          <span style={s.vitalItem}>HR: <b>{p.hr}</b></span>
          <span style={s.vitalItem}>Temp: <b>{p.temp}°C</b></span>
          <span style={s.vitalItem}>SpO₂: <b>{p.spo2}%</b></span>
        </div>
      </div>
    );
  };

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sbHead}>
          <div style={{fontSize:28, marginBottom:4}}>🏥</div>
          <div style={s.sbLogoText}>MediTrack HMS</div>
          <div style={s.sbLogoSub}>Ward 4B</div>
          <div style={s.userPill}>
            <div style={s.avatar}>{user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
            <div>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uRole}>Doctor · Ward 4B</div>
            </div>
          </div>
        </div>
        <div style={s.sbNav}>
          {NAV.map(n => (
            <div key={n.key} onClick={()=>setActive(n.key)} className="hover-lift"
              style={{...s.navItem, background: active===n.key?C.accentBg:'transparent', color: active===n.key?C.accent:C.textDim}}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </div>
        <div style={s.sbFooter}>
          <div style={s.logoutBtn} className="hover-lift" onClick={handleLogout}>🚪 Sign out</div>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <div style={s.tbTitle}>👨‍⚕️ Doctor Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning rounds</div>
          </div>
          <span style={s.tbBadge}>{patients.length} assigned patients</span>
        </div>

        <div style={s.content}>
          {active === 'patients' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>My Patients — Ward 4B</span>
                <FilterDropdown value={patientsFilter} options={patientsFilterOptions} onChange={setPatientsFilter} />
              </div>
              {filteredPatients.length === 0 && <div style={s.emptyBox}>No patients match this filter.</div>}
              {filteredPatients.map(renderPatientCard)}
            </div>
          )}

          {active === 'operations' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Upcoming Operations — {user?.name}</span>
              </div>
              {appointmentsLoading && <div style={s.emptyBox}>Loading operations...</div>}
              {appointmentsError && <div style={s.emptyBox}>{appointmentsError}</div>}
              {!appointmentsLoading && !appointmentsError && upcomingOperations.length === 0 && (
                <div style={s.emptyBox}>No upcoming operations found for {user?.name}.</div>
              )}
              {!appointmentsLoading && upcomingOperations.map(a => (
                <div key={a.appointment_id} className="hover-lift-soft" style={{...s.card, borderLeft: `4px solid ${C.red}`}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <div style={s.cardTitle}>{a.patient_id}</div>
                      <div style={s.cardSub}>
                        {a.appointment_date} · {a.appointment_time}
                        {a.reason ? ` · ${a.reason}` : ''}
                      </div>
                    </div>
                    <span style={{...s.badge, background: C.redBg, color: C.red}}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === 'appointments' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Upcoming Appointments — {user?.name}</span>
              </div>
              {appointmentsLoading && <div style={s.emptyBox}>Loading appointments...</div>}
              {appointmentsError && <div style={s.emptyBox}>{appointmentsError}</div>}
              {!appointmentsLoading && !appointmentsError && upcomingRoutine.length === 0 && (
                <div style={s.emptyBox}>No upcoming appointments found for {user?.name}.</div>
              )}
              {!appointmentsLoading && upcomingRoutine.map(a => (
                <div key={a.appointment_id} className="hover-lift-soft" style={s.card}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <div style={s.cardTitle}>{a.patient_id}</div>
                      <div style={s.cardSub}>
                        {a.appointment_date} · {a.appointment_time}
                        {a.reason ? ` · ${a.reason}` : ''}
                      </div>
                    </div>
                    <span style={{...s.badge, background: C.accentBg, color: C.accent}}>
                      {a.status}
                    </span>
                  </div>
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
  app:{display:'flex',height:'100vh',background:C.bg,color:C.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif'},
  sidebar:{width:220,background:C.bgAlt,borderRight:`0.5px solid ${C.border}`,display:'flex',flexDirection:'column'},
  sbHead:{padding:'1rem',borderBottom:`0.5px solid ${C.border}`},
  sbLogoText:{fontSize:14,fontWeight:600,color:C.text},
  sbLogoSub:{fontSize:11,color:C.textMute,marginBottom:8},
  userPill:{background:C.card,borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8},
  avatar:{width:28,height:28,borderRadius:'50%',background:C.accentBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:C.accent,flexShrink:0},
  uName:{fontSize:12,fontWeight:500,color:C.text},
  uRole:{fontSize:10,color:C.textMute},
  sbNav:{padding:'0.5rem 0.75rem',flex:1},
  navItem:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,marginBottom:2},
  navBadge:{marginLeft:'auto',fontSize:10,background:C.redBg,color:C.red,borderRadius:10,padding:'1px 6px',fontWeight:600},
  sbFooter:{padding:'0.75rem',borderTop:`0.5px solid ${C.border}`},
  logoutBtn:{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,color:C.textDim},
  main:{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'},
  topbar:{background:C.bgAlt,borderBottom:`0.5px solid ${C.border}`,padding:'0.75rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'},
  tbTitle:{fontSize:15,fontWeight:500,color:C.text},
  tbSub:{fontSize:12,color:C.textMute,marginTop:2},
  tbBadge:{fontSize:12,padding:'4px 10px',borderRadius:20,background:C.accentBg,color:C.accent,border:`0.5px solid ${C.accentBg}`},
  content:{flex:1,overflowY:'auto',padding:'1rem 1.25rem',background:C.bg},
  secTitle:{fontSize:11,fontWeight:600,color:C.textMute,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10},
  secHead:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10},
  card:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'0.85rem 1rem',marginBottom:8},
  cardTitle:{fontSize:13,fontWeight:500,color:C.text},
  cardSub:{fontSize:11,color:C.textMute,marginTop:2},
  vitalRow:{display:'flex',gap:16,marginTop:8,flexWrap:'wrap'},
  vitalItem:{fontSize:12,color:C.textDim},
  badge:{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600},
  liveTag:{position:'absolute',top:8,right:10,fontSize:9,fontWeight:700,color:C.greenBright,letterSpacing:'0.05em'},
  emptyBox:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:C.textMute},
};