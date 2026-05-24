import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ALL_USERS = [
  { name:'Deepa Menon',   role:'Nurse',        ward:'4B',  status:'active',   shift:'Morning' },
  { name:'Preethi Nair',  role:'Nurse',        ward:'4B',  status:'active',   shift:'Morning' },
  { name:'Dr. Srikanth',  role:'Doctor',       ward:'4B',  status:'active',   shift:'Morning' },
  { name:'Anita Sharma',  role:'Ward Manager', ward:'4B',  status:'active',   shift:'Morning' },
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
            <div style={{...s.avatar,background:'#FCEBEB',color:'#A32D2D'}}>
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
            <div key={n.key} onClick={()=>setActive(n.key)}
              style={{...s.navItem,background:active===n.key?'#FCEBEB':'transparent',color:active===n.key?'#A32D2D':'#555'}}>
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
            <div style={s.tbTitle}>⚙️ Admin Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Full system access</div>
          </div>
          <span style={{...s.tbBadge,background:'#FCEBEB',color:'#A32D2D',border:'0.5px solid #F7C1C1'}}>
            Admin · All Wards
          </span>
        </div>

        <div style={s.content}>

          {active==='overview' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Wards</div><div style={s.statVal}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Total Beds</div><div style={s.statVal}>56</div></div>
                <div style={s.stat}><div style={s.statLbl}>Total Staff</div><div style={{...s.statVal,color:'#185FA5'}}>23</div></div>
                <div style={s.stat}><div style={s.statLbl}>Active Users</div><div style={{...s.statVal,color:'#3B6D11'}}>6</div></div>
              </div>
              <div style={s.secTitle}>Ward Summary</div>
              {WARDS.map((w,i)=>(
                <div key={i} style={s.card}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{w.name}</div>
                      <div style={s.cardSub}>{w.occupied} occupied · {w.vacant} vacant · {w.staff} staff</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:13,fontWeight:500,color:'#1a1a2e'}}>{Math.round(w.occupied/w.beds*100)}%</div>
                      <div style={{fontSize:11,color:'#aaa'}}>occupancy</div>
                    </div>
                  </div>
                  <div style={{marginTop:10,height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
                    <div style={{
                      width:`${Math.round(w.occupied/w.beds*100)}%`,
                      height:'100%',
                      background: w.occupied/w.beds > 0.85 ? '#E24B4A' : '#3B6D11',
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
                <div key={i} style={s.card}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{u.name}</div>
                      <div style={s.cardSub}>{u.role} · Ward {u.ward} · {u.shift} shift</div>
                    </div>
                    <span style={{...s.badge,
                      background:u.status==='active'?'#EAF3DE':'#f5f5f5',
                      color:u.status==='active'?'#3B6D11':'#888'}}>
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
                  <div key={i} style={s.card}>
                    <div style={s.cardTitle}>{w.name}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                      <div style={s.miniStat}><div style={s.statLbl}>Beds</div><div style={{fontSize:18,fontWeight:500}}>{w.beds}</div></div>
                      <div style={s.miniStat}><div style={s.statLbl}>Occupied</div><div style={{fontSize:18,fontWeight:500,color:'#E24B4A'}}>{w.occupied}</div></div>
                      <div style={s.miniStat}><div style={s.statLbl}>Vacant</div><div style={{fontSize:18,fontWeight:500,color:'#3B6D11'}}>{w.vacant}</div></div>
                      <div style={s.miniStat}><div style={s.statLbl}>Staff</div><div style={{fontSize:18,fontWeight:500,color:'#185FA5'}}>{w.staff}</div></div>
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
  miniStat:{background:'#f5f6fa',borderRadius:8,padding:'8px 10px'},
  emptyBox:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:'#888'},
};