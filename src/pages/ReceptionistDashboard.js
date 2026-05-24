import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const APPOINTMENTS = [
  { id:1, name:'Sunil Verma',    time:'09:00', doctor:'Dr. Srikanth', type:'OPD',      status:'waiting'   },
  { id:2, name:'Meena Pillai',   time:'09:15', doctor:'Dr. Srikanth', type:'Follow-up', status:'waiting'  },
  { id:3, name:'Arun Kumar',     time:'09:30', doctor:'Dr. Srikanth', type:'OPD',      status:'scheduled' },
  { id:4, name:'Rekha Sharma',   time:'10:00', doctor:'Dr. Srikanth', type:'OPD',      status:'scheduled' },
  { id:5, name:'Vijay Nair',     time:'10:30', doctor:'Dr. Srikanth', type:'Follow-up', status:'scheduled'},
];

const BEDS = [
  {num:1,status:'occupied'},{num:2,status:'occupied'},{num:3,status:'vacant'},
  {num:4,status:'occupied'},{num:5,status:'occupied'},{num:6,status:'vacant'},
  {num:7,status:'occupied'},{num:8,status:'maintenance'},{num:9,status:'occupied'},
  {num:10,status:'reserved'},{num:11,status:'occupied'},{num:12,status:'occupied'},
  {num:13,status:'vacant'},{num:14,status:'occupied'},{num:15,status:'occupied'},
  {num:16,status:'vacant'},
];

const ADMISSIONS = [
  { name:'Neha Singh',   time:'10:30', from:'ICU Transfer',  ward:'4B', bed:10, status:'incoming' },
  { name:'Ramesh Rao',   time:'11:00', from:'Emergency',     ward:'4B', bed:3,  status:'incoming' },
  { name:'Sunita Bose',  time:'08:00', from:'OPD Referral',  ward:'3A', bed:5,  status:'admitted' },
];

export default function ReceptionistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState('appointments');
  const [checkedIn, setCheckedIn] = React.useState([]);
  const handleLogout = () => { logout(); navigate('/login'); };

  const bedColor = (status) => {
    if(status==='occupied')    return {bg:'#FCEBEB',border:'#F7C1C1',color:'#A32D2D'};
    if(status==='vacant')      return {bg:'#EAF3DE',border:'#C0DD97',color:'#3B6D11'};
    if(status==='reserved')    return {bg:'#FAEEDA',border:'#FAC775',color:'#854F0B'};
    if(status==='maintenance') return {bg:'#f5f5f5',border:'#e0e0e0',color:'#888'};
    return {};
  };

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sbHead}>
          <div style={{fontSize:28,marginBottom:4}}>🏥</div>
          <div style={s.sbLogoText}>MediTrack HMS</div>
          <div style={s.sbLogoSub}>Reception</div>
          <div style={s.userPill}>
            <div style={{...s.avatar,background:'#EEEDFE',color:'#3C3489'}}>
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uRole}>Receptionist</div>
            </div>
          </div>
        </div>
        <div style={s.sbNav}>
          {[
            {key:'appointments', label:'Appointments',   icon:'📅'},
            {key:'beds',         label:'Bed Availability',icon:'🛏️'},
            {key:'admissions',   label:'Admissions',     icon:'🏥'},
          ].map(n=>(
            <div key={n.key} onClick={()=>setActive(n.key)}
              style={{...s.navItem,background:active===n.key?'#EEEDFE':'transparent',color:active===n.key?'#3C3489':'#555'}}>
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
            <div style={s.tbTitle}>🛎️ Receptionist Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning shift</div>
          </div>
          <span style={{...s.tbBadge,background:'#EEEDFE',color:'#3C3489',border:'0.5px solid #CECBF6'}}>
            {APPOINTMENTS.filter(a=>a.status==='waiting').length} patients waiting
          </span>
        </div>

        <div style={s.content}>

          {active==='appointments' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Today</div><div style={s.statVal}>{APPOINTMENTS.length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Waiting</div><div style={{...s.statVal,color:'#E24B4A'}}>{APPOINTMENTS.filter(a=>a.status==='waiting').length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Scheduled</div><div style={{...s.statVal,color:'#BA7517'}}>{APPOINTMENTS.filter(a=>a.status==='scheduled').length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Checked In</div><div style={{...s.statVal,color:'#3B6D11'}}>{checkedIn.length}</div></div>
              </div>
              <div style={s.secTitle}>Today's Appointments</div>
              {APPOINTMENTS.map(a=>{
                const done = checkedIn.includes(a.id);
                return (
                  <div key={a.id} style={{...s.card,
                    borderLeft: a.status==='waiting'&&!done?'4px solid #E24B4A':'4px solid #3C3489',
                    opacity: done ? 0.6 : 1
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={s.cardTitle}>{a.name}</div>
                        <div style={s.cardSub}>{a.time} · {a.doctor} · {a.type}</div>
                      </div>
                      {!done ? (
                        <button style={s.checkinBtn} onClick={()=>setCheckedIn(prev=>[...prev,a.id])}>
                          Check In
                        </button>
                      ) : (
                        <span style={{...s.badge,background:'#EAF3DE',color:'#3B6D11'}}>✅ Checked In</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {active==='beds' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Beds</div><div style={s.statVal}>16</div></div>
                <div style={s.stat}><div style={s.statLbl}>Occupied</div><div style={{...s.statVal,color:'#E24B4A'}}>10</div></div>
                <div style={s.stat}><div style={s.statLbl}>Vacant</div><div style={{...s.statVal,color:'#3B6D11'}}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Reserved</div><div style={{...s.statVal,color:'#BA7517'}}>1</div></div>
              </div>
              <div style={s.secTitle}>Bed Availability — Ward 4B</div>
              <div style={s.bedGrid}>
                {BEDS.map(b=>{
                  const c=bedColor(b.status);
                  return (
                    <div key={b.num} style={{...s.bedCell,background:c.bg,borderColor:c.border}}>
                      <div style={s.bedNum}>Bed {String(b.num).padStart(2,'0')}</div>
                      <div style={{fontSize:11,fontWeight:500,color:c.color}}>
                        {b.status.charAt(0).toUpperCase()+b.status.slice(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {active==='admissions' && (
            <div>
              <div style={s.secTitle}>Admissions — Today</div>
              {ADMISSIONS.map((a,i)=>(
                <div key={i} style={{...s.card,
                  borderLeft: a.status==='incoming'?'4px solid #BA7517':'4px solid #3B6D11'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={s.cardTitle}>{a.name}</div>
                      <div style={s.cardSub}>
                        {a.time} · {a.from} · Ward {a.ward} · Bed {a.bed}
                      </div>
                    </div>
                    <span style={{...s.badge,
                      background:a.status==='incoming'?'#FAEEDA':'#EAF3DE',
                      color:a.status==='incoming'?'#854F0B':'#3B6D11'}}>
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
  app:{display:'flex',height:'100vh',background:'#f5f6fa'},
  sidebar:{width:220,background:'#fff',borderRight:'0.5px solid #e0e0e0',display:'flex',flexDirection:'column'},
  sbHead:{padding:'1rem',borderBottom:'0.5px solid #e0e0e0'},
  sbLogoText:{fontSize:14,fontWeight:600,color:'#1a1a2e'},
  sbLogoSub:{fontSize:11,color:'#aaa',marginBottom:8},
  userPill:{background:'#f5f6fa',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8},
  avatar:{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,flexShrink:0},
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
  tbBadge:{fontSize:12,padding:'4px 10px',borderRadius:20},
  content:{flex:1,overflowY:'auto',padding:'1rem 1.25rem'},
  statGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:'1rem'},
  stat:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:10,padding:'0.75rem 1rem'},
  statLbl:{fontSize:11,color:'#aaa',marginBottom:3},
  statVal:{fontSize:22,fontWeight:500,color:'#1a1a2e',lineHeight:1},
  secTitle:{fontSize:11,fontWeight:600,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10},
  card:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'0.85rem 1rem',marginBottom:8},
  cardTitle:{fontSize:13,fontWeight:500,color:'#1a1a2e'},
  cardSub:{fontSize:11,color:'#aaa',marginTop:2},
  badge:{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:500},
  checkinBtn:{fontSize:12,padding:'5px 14px',borderRadius:8,border:'none',background:'#3C3489',color:'#fff',cursor:'pointer'},
  bedGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8},
  bedCell:{border:'0.5px solid',borderRadius:10,padding:'10px',cursor:'pointer'},
  bedNum:{fontSize:11,fontWeight:500,color:'#888',marginBottom:3},
  emptyBox:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:'#888'},
};