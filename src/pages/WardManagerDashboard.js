import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STAFF = [
  { name:'Deepa Menon',   role:'Nurse',    shift:'Morning', status:'on-duty'  },
  { name:'Preethi Nair',  role:'Nurse',    shift:'Morning', status:'on-duty'  },
  { name:'Suresh Babu',   role:'Nurse',    shift:'Evening', status:'off-duty' },
  { name:'Anand Raj',     role:'Attender', shift:'Morning', status:'on-duty'  },
  { name:'Kavitha S',     role:'Attender', shift:'Evening', status:'off-duty' },
];

const BEDS = [
  {num:1,status:'occupied'},{num:2,status:'occupied'},{num:3,status:'vacant'},
  {num:4,status:'occupied'},{num:5,status:'occupied'},{num:6,status:'vacant'},
  {num:7,status:'occupied'},{num:8,status:'maintenance'},{num:9,status:'occupied'},
  {num:10,status:'reserved'},{num:11,status:'occupied'},{num:12,status:'occupied'},
  {num:13,status:'vacant'},{num:14,status:'occupied'},{num:15,status:'occupied'},
  {num:16,status:'vacant'},
];

export default function WardManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState('overview');
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
          <div style={s.sbLogoSub}>Ward 4B</div>
          <div style={s.userPill}>
            <div style={{...s.avatar,background:'#FAEEDA',color:'#854F0B'}}>
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uRole}>Ward Manager</div>
            </div>
          </div>
        </div>
        <div style={s.sbNav}>
          {[
            {key:'overview', label:'Ward Overview', icon:'🏥'},
            {key:'beds',     label:'Bed Management',icon:'🛏️'},
            {key:'staff',    label:'Staff on Duty', icon:'👥'},
            {key:'reports',  label:'Daily Reports', icon:'📊'},
          ].map(n=>(
            <div key={n.key} onClick={()=>setActive(n.key)}
              style={{...s.navItem,background:active===n.key?'#FAEEDA':'transparent',color:active===n.key?'#854F0B':'#555'}}>
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
            <div style={s.tbTitle}>🏥 Ward Manager Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning shift</div>
          </div>
          <span style={{...s.tbBadge,background:'#FAEEDA',color:'#854F0B',border:'0.5px solid #FAC775'}}>Ward 4B</span>
        </div>

        <div style={s.content}>
          {active==='overview' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Beds</div><div style={s.statVal}>16</div></div>
                <div style={s.stat}><div style={s.statLbl}>Occupied</div><div style={{...s.statVal,color:'#E24B4A'}}>10</div></div>
                <div style={s.stat}><div style={s.statLbl}>Vacant</div><div style={{...s.statVal,color:'#3B6D11'}}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Staff On Duty</div><div style={{...s.statVal,color:'#854F0B'}}>3</div></div>
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>Ward occupancy — 62.5%</div>
                <div style={{marginTop:10,height:12,background:'#f0f0f0',borderRadius:6,overflow:'hidden'}}>
                  <div style={{width:'62.5%',height:'100%',background:'#E24B4A',borderRadius:6}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:11,color:'#aaa'}}>
                  <span>10 occupied</span><span>4 vacant · 1 reserved · 1 maintenance</span>
                </div>
              </div>
            </div>
          )}
          {active==='beds' && (
            <div>
              <div style={s.secTitle}>Bed Status — Ward 4B</div>
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
          {active==='staff' && (
            <div>
              <div style={s.secTitle}>Staff on Duty</div>
              {STAFF.map((st,i)=>(
                <div key={i} style={s.card}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{st.name}</div>
                      <div style={s.cardSub}>{st.role} · {st.shift} shift</div>
                    </div>
                    <span style={{...s.badge,
                      background:st.status==='on-duty'?'#EAF3DE':'#f5f5f5',
                      color:st.status==='on-duty'?'#3B6D11':'#888'}}>
                      {st.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {active==='reports' && (
            <div style={s.emptyBox}>📊 Daily reports — connect to hospital backend to populate</div>
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
  bedGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8},
  bedCell:{border:'0.5px solid',borderRadius:10,padding:'10px',cursor:'pointer'},
  bedNum:{fontSize:11,fontWeight:500,color:'#888',marginBottom:3},
  emptyBox:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:'#888'},
};