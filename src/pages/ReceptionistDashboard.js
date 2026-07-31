import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { C, bedColor } from '../theme';
import FilterDropdown from '../components/FilterDropdown';


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
  const [apptFilter, setApptFilter] = React.useState('all');
  const [bedsFilter, setBedsFilter] = React.useState('all');
  const [admissionsFilter, setAdmissionsFilter] = React.useState('all');
  const handleLogout = () => { logout(); navigate('/login'); };

  const effectiveApptStatus = (a) => checkedIn.includes(a.id) ? 'checked-in' : a.status;
  const filteredAppointments = apptFilter === 'all' ? APPOINTMENTS : APPOINTMENTS.filter(a => effectiveApptStatus(a) === apptFilter);
  const apptFilterOptions = [
    { value: 'all', label: 'All Appointments', count: APPOINTMENTS.length },
    { value: 'waiting', label: 'Waiting', count: APPOINTMENTS.filter(a => effectiveApptStatus(a) === 'waiting').length },
    { value: 'scheduled', label: 'Scheduled', count: APPOINTMENTS.filter(a => effectiveApptStatus(a) === 'scheduled').length },
    { value: 'checked-in', label: 'Checked In', count: APPOINTMENTS.filter(a => effectiveApptStatus(a) === 'checked-in').length },
  ];

  const filteredBeds = bedsFilter === 'all' ? BEDS : BEDS.filter(b => b.status === bedsFilter);
  const bedsFilterOptions = [
    { value: 'all', label: 'All Beds', count: BEDS.length },
    { value: 'occupied', label: 'Occupied', count: BEDS.filter(b => b.status === 'occupied').length },
    { value: 'vacant', label: 'Vacant', count: BEDS.filter(b => b.status === 'vacant').length },
    { value: 'reserved', label: 'Reserved', count: BEDS.filter(b => b.status === 'reserved').length },
    { value: 'maintenance', label: 'Maintenance', count: BEDS.filter(b => b.status === 'maintenance').length },
  ];

  const filteredAdmissions = admissionsFilter === 'all' ? ADMISSIONS : ADMISSIONS.filter(a => a.status === admissionsFilter);
  const admissionsFilterOptions = [
    { value: 'all', label: 'All Admissions', count: ADMISSIONS.length },
    { value: 'incoming', label: 'Incoming', count: ADMISSIONS.filter(a => a.status === 'incoming').length },
    { value: 'admitted', label: 'Admitted', count: ADMISSIONS.filter(a => a.status === 'admitted').length },
  ];

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sbHead}>
          <div style={{fontSize:28,marginBottom:4}}>🏥</div>
          <div style={s.sbLogoText}>MediTrack HMS</div>
          <div style={s.sbLogoSub}>Reception</div>
          <div style={s.userPill}>
            <div style={{...s.avatar,background:C.accentBg,color:C.accent}}>
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
            <div style={s.tbTitle}>🛎️ Receptionist Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning shift</div>
          </div>
          <span style={{...s.tbBadge,background:C.accentBg,color:C.accent,border:`0.5px solid ${C.accentBg}`}}>
            {APPOINTMENTS.filter(a=>a.status==='waiting').length} patients waiting
          </span>
        </div>

        <div style={s.content}>

          {active==='appointments' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Today</div><div style={s.statVal}>{APPOINTMENTS.length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Waiting</div><div style={{...s.statVal,color:C.red}}>{APPOINTMENTS.filter(a=>a.status==='waiting').length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Scheduled</div><div style={{...s.statVal,color:C.amber}}>{APPOINTMENTS.filter(a=>a.status==='scheduled').length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Checked In</div><div style={{...s.statVal,color:C.greenBright}}>{checkedIn.length}</div></div>
              </div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Today's Appointments</span>
                <FilterDropdown value={apptFilter} options={apptFilterOptions} onChange={setApptFilter} />
              </div>
              {filteredAppointments.length === 0 && <div style={s.emptyBox}>No appointments match this filter.</div>}
              {filteredAppointments.map(a=>{
                const done = checkedIn.includes(a.id);
                return (
                  <div key={a.id} className="hover-lift-soft" style={{...s.card,
                    borderLeft: a.status==='waiting'&&!done?`4px solid ${C.red}`:`4px solid ${C.accent}`,
                    opacity: done ? 0.6 : 1
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={s.cardTitle}>{a.name}</div>
                        <div style={s.cardSub}>{a.time} · {a.doctor} · {a.type}</div>
                      </div>
                      {!done ? (
                        <button style={s.checkinBtn} className="hover-lift" onClick={()=>setCheckedIn(prev=>[...prev,a.id])}>
                          Check In
                        </button>
                      ) : (
                        <span style={{...s.badge,background:C.green,color:'#fff'}}>✅ Checked In</span>
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
                <div style={s.stat}><div style={s.statLbl}>Occupied</div><div style={{...s.statVal,color:C.red}}>10</div></div>
                <div style={s.stat}><div style={s.statLbl}>Vacant</div><div style={{...s.statVal,color:C.greenBright}}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Reserved</div><div style={{...s.statVal,color:C.amber}}>1</div></div>
              </div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Bed Availability — Ward 4B</span>
                <FilterDropdown value={bedsFilter} options={bedsFilterOptions} onChange={setBedsFilter} />
              </div>
              {filteredBeds.length === 0 && <div style={s.emptyBox}>No beds match this filter.</div>}
              <div style={s.bedGrid}>
                {filteredBeds.map(b=>{
                  const c=bedColor(b.status);
                  return (
                    <div key={b.num} className="hover-lift" style={{...s.bedCell,background:c.light,borderColor:c.border}}>
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
              <div style={s.secHead}>
                <span style={s.secTitle}>Admissions — Today</span>
                <FilterDropdown value={admissionsFilter} options={admissionsFilterOptions} onChange={setAdmissionsFilter} />
              </div>
              {filteredAdmissions.length === 0 && <div style={s.emptyBox}>No admissions match this filter.</div>}
              {filteredAdmissions.map((a,i)=>(
                <div key={i} className="hover-lift-soft" style={{...s.card,
                  borderLeft: a.status==='incoming'?`4px solid ${C.amber}`:`4px solid ${C.greenBright}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={s.cardTitle}>{a.name}</div>
                      <div style={s.cardSub}>
                        {a.time} · {a.from} · Ward {a.ward} · Bed {a.bed}
                      </div>
                    </div>
                    <span style={{...s.badge,
                      background:a.status==='incoming'?C.amber:C.green,
                      color:a.status==='incoming'?'#14201a':'#fff'}}>
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
  secHead:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10},
  card:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'0.85rem 1rem',marginBottom:8},
  cardTitle:{fontSize:13,fontWeight:500,color:C.text},
  cardSub:{fontSize:11,color:C.textMute,marginTop:2},
  badge:{fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600},
  checkinBtn:{fontSize:12,padding:'5px 14px',borderRadius:8,border:'none',background:C.accent,color:'#0A2224',fontWeight:600,cursor:'pointer'},
  bedGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8},
  bedCell:{border:'0.5px solid',borderRadius:10,padding:'10px',cursor:'pointer'},
  bedNum:{fontSize:11,fontWeight:500,color:C.textDim,marginBottom:3},
  emptyBox:{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:C.textMute},
};