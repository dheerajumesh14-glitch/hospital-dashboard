import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PATIENTS = [
  { id:1, name:'Priya Sharma',  bed:4,  diagnosis:'Hypertensive Crisis',  bp:'148/92', hr:112, temp:38.9, spo2:94,  status:'critical' },
  { id:2, name:'Ravi Kumar',    bed:11, diagnosis:'Septic Shock',          bp:'92/60',  hr:118, temp:36.5, spo2:91,  status:'critical' },
  { id:3, name:'Arjun Mehta',   bed:7,  diagnosis:'Pneumonia',             bp:'128/82', hr:98,  temp:37.8, spo2:97,  status:'watch'    },
  { id:4, name:'Leela Nair',    bed:2,  diagnosis:'Post-op Recovery',      bp:'118/76', hr:72,  temp:36.8, spo2:99,  status:'stable'   },
  { id:5, name:'Farida Begum',  bed:5,  diagnosis:'Type 2 Diabetes',       bp:'122/80', hr:76,  temp:37.0, spo2:98,  status:'stable'   },
  { id:6, name:'Kiran Desai',   bed:9,  diagnosis:'Acute Bronchitis',      bp:'135/88', hr:95,  temp:38.1, spo2:96,  status:'watch'    },
];

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState('patients');

  const handleLogout = () => { logout(); navigate('/login'); };

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
          {[
            {key:'patients', label:'My Patients',    icon:'👥'},
            {key:'orders',   label:'Lab Orders',     icon:'🧪'},
            {key:'prescriptions', label:'Prescriptions', icon:'💊'},
            {key:'notes',    label:'Clinical Notes', icon:'📝'},
          ].map(n => (
            <div key={n.key} onClick={()=>setActive(n.key)}
              style={{...s.navItem, background: active===n.key?'#EAF3DE':'transparent', color: active===n.key?'#3B6D11':'#555'}}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </div>
        <div style={s.sbFooter}>
          <div style={s.logoutBtn} onClick={handleLogout}>🚪 Sign out</div>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <div style={s.tbTitle}>👨‍⚕️ Doctor Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning rounds</div>
          </div>
          <span style={s.tbBadge}>6 assigned patients</span>
        </div>

        <div style={s.content}>
          {active === 'patients' && (
            <div>
              <div style={s.secTitle}>My Patients — Ward 4B</div>
              {PATIENTS.map(p => (
                <div key={p.id} style={{...s.card, borderLeft: p.status==='critical'?'4px solid #E24B4A': p.status==='watch'?'4px solid #BA7517':'4px solid #3B6D11'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <div style={s.cardTitle}>{p.name}</div>
                      <div style={s.cardSub}>Bed {p.bed} · {p.diagnosis}</div>
                    </div>
                    <span style={{...s.badge,
                      background: p.status==='critical'?'#FCEBEB':p.status==='watch'?'#FAEEDA':'#EAF3DE',
                      color: p.status==='critical'?'#A32D2D':p.status==='watch'?'#854F0B':'#3B6D11'}}>
                      {p.status}
                    </span>
                  </div>
                  <div style={s.vitalRow}>
                    <span style={s.vitalItem}>BP: <b>{p.bp}</b></span>
                    <span style={s.vitalItem}>HR: <b>{p.hr}</b></span>
                    <span style={s.vitalItem}>Temp: <b>{p.temp}°C</b></span>
                    <span style={s.vitalItem}>SpO₂: <b>{p.spo2}%</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {active === 'orders' && (
            <div style={s.emptyBox}>🧪 Lab orders module — connect to hospital LIS to populate</div>
          )}
          {active === 'prescriptions' && (
            <div style={s.emptyBox}>💊 Prescriptions module — connect to pharmacy system to populate</div>
          )}
          {active === 'notes' && (
            <div style={s.emptyBox}>📝 Clinical notes module — connect to EMR to populate</div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  app:{display:'flex',height:'100vh',background:'#f5f6fa'},
  sidebar:{width:220,background:'#fff',borderRight:'0.5px solid #e0e0e0',display:'flex',flexDirection:'column'},
  sbHead:{padding:'1rem',borderBottom:'0.5px solid #e0e0e0'},
  sbLogoText:{fontSize:14,fontWeight:600,color:'#1a1a2e'},
  sbLogoSub:{fontSize:11,color:'#aaa',marginBottom:8},
  userPill:{background:'#f5f6fa',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8},
  avatar:{width:28,height:28,borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#3B6D11',flexShrink:0},
  uName:{fontSize:12,fontWeight:500,color:'#1a1a2e'},
  uRole:{fontSize:10,color:'#aaa'},
  sbNav:{padding:'0.5rem 0.75rem',flex:1},
  navItem:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,marginBottom:2},
  sbFooter:{padding:'0.75rem',borderTop:'0.5px solid #e0e0e0'},
  logoutBtn:{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,color:'#555'},
  main:{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'},
  topbar:{background:'#fff',borderBottom:'0.5px solid #e0e0e0',padding:'0.75rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'},
  tbTitle:{fontSize:15,fontWeight:500,color:'#1a1a2e'},
  tbSub:{fontSize:12,color:'#aaa',marginTop:2},
  tbBadge:{fontSize:12,padding:'4px 10px',borderRadius:20,background:'#EAF3DE',color:'#3B6D11',border:'0.5px solid #C0DD97'},
  content:{flex:1,overflowY:'auto',padding:'1rem 1.25rem'},
  secTitle:{fontSize:11,fontWeight:600,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10},
  card:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'0.85rem 1rem',marginBottom:8},
  cardTitle:{fontSize:13,fontWeight:500,color:'#1a1a2e'},
  cardSub:{fontSize:11,color:'#aaa',marginTop:2},
  vitalRow:{display:'flex',gap:16,marginTop:8,flexWrap:'wrap'},
  vitalItem:{fontSize:12,color:'#555'},
  badge:{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:500},
  emptyBox:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:'#888'},
};