import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MEDICATIONS = [
  { id:1, patient:'Priya Sharma',  bed:4,  medicine:'Saline IV 500ml',    qty:2,  status:'urgent',  time:'08:00' },
  { id:2, patient:'Ravi Kumar',    bed:11, medicine:'Dopamine 200mg',      qty:1,  status:'urgent',  time:'08:15' },
  { id:3, patient:'Arjun Mehta',   bed:7,  medicine:'Amoxicillin 500mg',   qty:3,  status:'pending', time:'09:00' },
  { id:4, patient:'Leela Nair',    bed:2,  medicine:'Glucose IV 500ml',    qty:1,  status:'pending', time:'09:30' },
  { id:5, patient:'Farida Begum',  bed:5,  medicine:'Metformin 500mg',     qty:2,  status:'done',    time:'07:30' },
  { id:6, patient:'Kiran Desai',   bed:9,  medicine:'Azithromycin 250mg',  qty:1,  status:'done',    time:'07:00' },
];

const INVENTORY = [
  { name:'Saline IV 500ml',   stock:24, unit:'bags',    level:'ok'      },
  { name:'Glucose IV 500ml',  stock:18, unit:'bags',    level:'ok'      },
  { name:'Dopamine 200mg',    stock:6,  unit:'vials',   level:'low'     },
  { name:'Amoxicillin 500mg', stock:45, unit:'capsules',level:'ok'      },
  { name:'Paracetamol 500mg', stock:3,  unit:'strips',  level:'critical'},
  { name:'Metformin 500mg',   stock:30, unit:'tablets', level:'ok'      },
];

export default function PharmacistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState('orders');
  const [dispensed, setDispensed] = React.useState([]);
  const handleLogout = () => { logout(); navigate('/login'); };
  const dispense = (id) => setDispensed(prev => [...prev, id]);

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sbHead}>
          <div style={{fontSize:28,marginBottom:4}}>🏥</div>
          <div style={s.sbLogoText}>MediTrack HMS</div>
          <div style={s.sbLogoSub}>Pharmacy</div>
          <div style={s.userPill}>
            <div style={{...s.avatar,background:'#E1F5EE',color:'#0F6E56'}}>
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={s.uName}>{user?.name}</div>
              <div style={s.uRole}>Pharmacist</div>
            </div>
          </div>
        </div>
        <div style={s.sbNav}>
          {[
            {key:'orders',    label:'Medication Orders', icon:'📋'},
            {key:'inventory', label:'Inventory',         icon:'🏪'},
            {key:'dispensed', label:'Dispensed Log',     icon:'✅'},
          ].map(n=>(
            <div key={n.key} onClick={()=>setActive(n.key)}
              style={{...s.navItem,background:active===n.key?'#E1F5EE':'transparent',color:active===n.key?'#0F6E56':'#555'}}>
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
            <div style={s.tbTitle}>💊 Pharmacist Dashboard</div>
            <div style={s.tbSub}>Sunday, 24 May 2026 · Morning shift</div>
          </div>
          <span style={{...s.tbBadge,background:'#E1F5EE',color:'#0F6E56',border:'0.5px solid #9FE1CB'}}>
            {MEDICATIONS.filter(m=>m.status!=='done'&&!dispensed.includes(m.id)).length} orders pending
          </span>
        </div>

        <div style={s.content}>

          {active==='orders' && (
            <div>
              <div style={s.statGrid}>
                <div style={s.stat}><div style={s.statLbl}>Total Orders</div><div style={s.statVal}>{MEDICATIONS.length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Urgent</div><div style={{...s.statVal,color:'#E24B4A'}}>{MEDICATIONS.filter(m=>m.status==='urgent').length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Pending</div><div style={{...s.statVal,color:'#BA7517'}}>{MEDICATIONS.filter(m=>m.status==='pending').length}</div></div>
                <div style={s.stat}><div style={s.statLbl}>Dispensed</div><div style={{...s.statVal,color:'#3B6D11'}}>{MEDICATIONS.filter(m=>m.status==='done').length + dispensed.length}</div></div>
              </div>
              <div style={s.secTitle}>Medication Orders</div>
              {MEDICATIONS.map(m=>{
                const isDone = m.status==='done' || dispensed.includes(m.id);
                return (
                  <div key={m.id} style={{...s.card,
                    borderLeft: m.status==='urgent'&&!isDone ? '4px solid #E24B4A' :
                                m.status==='pending'&&!isDone ? '4px solid #BA7517' :
                                '4px solid #3B6D11',
                    opacity: isDone ? 0.6 : 1
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={s.cardTitle}>{m.medicine}</div>
                        <div style={s.cardSub}>{m.patient} · Bed {m.bed} · Qty: {m.qty} · Time: {m.time}</div>
                      </div>
                      {!isDone ? (
                        <button style={s.dispenseBtn} onClick={()=>dispense(m.id)}>
                          Dispense
                        </button>
                      ) : (
                        <span style={{...s.badge,background:'#EAF3DE',color:'#3B6D11'}}>✅ Done</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {active==='inventory' && (
            <div>
              <div style={s.secTitle}>Drug Inventory</div>
              {INVENTORY.map((item,i)=>(
                <div key={i} style={{...s.card,
                  borderLeft: item.level==='critical'?'4px solid #E24B4A':
                              item.level==='low'?'4px solid #BA7517':
                              '4px solid #3B6D11'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{item.name}</div>
                      <div style={s.cardSub}>{item.stock} {item.unit} remaining</div>
                    </div>
                    <span style={{...s.badge,
                      background: item.level==='critical'?'#FCEBEB':item.level==='low'?'#FAEEDA':'#EAF3DE',
                      color: item.level==='critical'?'#A32D2D':item.level==='low'?'#854F0B':'#3B6D11'}}>
                      {item.level}
                    </span>
                  </div>
                  <div style={{marginTop:8,height:5,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
                    <div style={{
                      width:`${Math.min(item.stock*2,100)}%`,
                      height:'100%',
                      background: item.level==='critical'?'#E24B4A':item.level==='low'?'#BA7517':'#3B6D11',
                      borderRadius:3
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active==='dispensed' && (
            <div>
              <div style={s.secTitle}>Dispensed Today</div>
              {MEDICATIONS.filter(m=>m.status==='done'||dispensed.includes(m.id)).map(m=>(
                <div key={m.id} style={s.card}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={s.cardTitle}>{m.medicine}</div>
                      <div style={s.cardSub}>{m.patient} · Bed {m.bed} · {m.time}</div>
                    </div>
                    <span style={{...s.badge,background:'#EAF3DE',color:'#3B6D11'}}>✅ Dispensed</span>
                  </div>
                </div>
              ))}
              {MEDICATIONS.filter(m=>m.status==='done'||dispensed.includes(m.id)).length===0 && (
                <div style={s.emptyBox}>No medications dispensed yet</div>
              )}
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
  dispenseBtn:{fontSize:12,padding:'5px 14px',borderRadius:8,border:'none',background:'#0F6E56',color:'#fff',cursor:'pointer'},
  emptyBox:{background:'#fff',border:'0.5px solid #e0e0e0',borderRadius:12,padding:'3rem',textAlign:'center',fontSize:14,color:'#888'},
};