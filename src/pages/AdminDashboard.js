import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';

const ALL_USERS = [
  { name:'Deepa Menon',   role:'Nurse',        ward:'4B',  status:'active',   shift:'Morning' },
  { name:'Preethi Nair',  role:'Nurse',        ward:'4B',  status:'active',   shift:'Morning' },
  { name:'Dr. Srikanth',  role:'Doctor',       ward:'4B',  status:'active',   shift:'Morning' },
  { name:'Preethi Nair',  role:'Pharmacist',   ward:'ALL', status:'active',   shift:'Morning' },
  { name:'Suman Reddy',   role:'Receptionist', ward:'ALL', status:'active',   shift:'Morning' },
  { name:'Suresh Babu',   role:'Nurse',        ward:'4B',  status:'off-duty', shift:'Evening' },
];

const WARDS = [
  { name:'Ward 4B', beds:16, occupied:10, vacant:4, staff:5 },
  { name:'Ward 3A', beds:20, occupied:18, vacant:2, staff:6 },
  { name:'Ward 2C', beds:12, occupied:8,  vacant:4, staff:4 },
  { name:'ICU',     beds:8,  occupied:7,  vacant:1, staff:8 },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState('overview');
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sbHead}>
          <div style={{fontSize:28,marginBottom:4}}>🏥</div>
          <div style={s.sbLogoText}>MediTrack HMS</div>
          <div style={s.sbLogoSub}>Admin Panel</div>
          <div style={s.userPill}>
            <div style={{...s.avatar,background:C.accentBg,color:C.accent}}>
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uRole}>System Admin</div>
            </div>
          </div>
        </div>
        <div style={s.sbNav}>
          {[
            {key:'overview', label:'System Overview', icon:'📊'},
            {key:'users',    label:'All Users',       icon:'👥'},
            {key:'wards',    label:'All Wards',       icon:'🏥'},
            {key:'settings', label:'Settings',        icon:'⚙️'},
          ].map(n=>(
            <div key={n.key} onClick={()=>setActive(n.key)} className="hover-lift"
              style={{...s.navItem,background:active===n.key?C.accentBg:'transparent',color:active===n.key?C.accent:C.textDim}}>
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
            <div style={s.tbTitle}>⚙️ Admin Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Full system access</div>
          </div>
          <span style={{...s.tbBadge,background:C.accentBg,color:C.accent,border:`0.5px solid ${C.accentBg}`}}>
            Admin · All Wards
          </span>
        </div>

        <div style={s.content}>

          {active==='overview' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Wards</div><div style={s.statVal}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Total Beds</div><div style={s.statVal}>56</div></div>
                <div style={s.stat}><div style={s.statLbl}>Total Staff</div><div style={{...s.statVal,color:C.accent}}>23</div></div>
                <div style={s.stat}><div style={s.statLbl}>Active Users</div><div style={{...s.statVal,color:C.greenBright}}>6</div></div>
              </div>
              <div style={s.secTitle}>Ward Summary</div>
              {WARDS.map((w,i)=>(
                <div key={i} style={s.card} className="hover-lift-soft">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{w.name}</div>
                      <div style={s.cardSub}>{w.occupied} occupied · {w.vacant} vacant · {w.staff} staff</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:13,fontWeight:500,color:C.text}}>{Math.round(w.occupied/w.beds*100)}%</div>
                      <div style={{fontSize:11,color:C.textMute}}>occupancy</div>
                    </div>
                  </div>
                  <div style={{marginTop:10,height:6,background:C.border,borderRadius:3,overflow:'hidden'}}>
                    <div style={{
                      width:`${Math.round(w.occupied/w.beds*100)}%`,
                      height:'100%',
                      background: w.occupied/w.beds > 0.85 ? C.red : C.greenBright,
                      borderRadius:3
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active==='users' && (
            <div>
              <div style={s.secTitle}>All System Users</div>
              {ALL_USERS.map((u,i)=>(
                <div key={i} style={s.card} className="hover-lift-soft">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{u.name}</div>
                      <div style={s.cardSub}>{u.role} · Ward {u.ward} · {u.shift} shift</div>
                    </div>
                    <span style={{...s.badge,
                      background:u.status==='active'?C.green:C.gray,
                      color:'#fff'}}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active==='wards' && (
            <div>
              <div style={s.secTitle}>All Wards</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                {WARDS.map((w,i)=>(
                  <div key={i} style={s.card} className="hover-lift-soft">
                    <div style={s.cardTitle}>{w.name}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                      <div style={s.miniStat}><div style={s.statLbl}>Beds</div><div style={{fontSize:18,fontWeight:500,color:C.text}}>{w.beds}</div></div>
                      <div style={s.miniStat}><div style={s.statLbl}>Occupied</div><div style={{fontSize:18,fontWeight:500,color:C.red}}>{w.occupied}</div></div>
                      <div style={s.miniStat}><div style={s.statLbl}>Vacant</div><div style={{fontSize:18,fontWeight:500,color:C.greenBright}}>{w.vacant}</div></div>
                      <div style={s.miniStat}><div style={s.statLbl}>Staff</div><div style={{fontSize:18,fontWeight:500,color:C.accent}}>{w.staff}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active==='settings' && (
            <div style={s.emptyBox}>⚙️ System settings — connect to backend to manage configurations</div>
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
  avatar:{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,flexShrink:0},
  uName:{fontSize:12,fontWeight:500,color:C.text},
  uRole:{fontSize:10,color:C.textMute},
  sbNav:{padding:'0.5rem 0.75rem',flex:1},
  navItem:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,marginBottom:2},
  sbFooter:{padding:'0.75rem',borderTop:`0.5px solid ${C.border}`},
  logoutBtn:{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,color:C.textDim},
  main:{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'},
  topbar:{background:C.bgAlt,borderBottom:`0.5px solid ${C.border}`,padding:'0.75rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'},
  tbTitle:{fontSize:15,fontWeight:500,color:C.text},
  tbSub:{fontSize:12,color:C.textMute,marginTop:2},
  tbBadge:{fontSize:12,padding:'4px 10px',borderRadius:20},
  content:{flex:1,overflowY:'auto',padding:'1rem 1.25rem',background:C.bg},
  statGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:'1rem'},
  stat:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:10,padding:'0.75rem 1rem'},
  statLbl:{fontSize:11,color:C.textMute,marginBottom:3},
  statVal:{fontSize:22,fontWeight:500,color:C.text,lineHeight:1},
  secTitle:{fontSize:11,fontWeight:600,color:C.textMute,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10},
  card:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'0.85rem 1rem',marginBottom:8},
  cardTitle:{fontSize:13,fontWeight:500,color:C.text},
  cardSub:{fontSize:11,color:C.textMute,marginTop:2},
  badge:{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600},
  miniStat:{background:C.cardAlt,borderRadius:8,padding:'8px 10px'},
  emptyBox:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:C.textMute},
};