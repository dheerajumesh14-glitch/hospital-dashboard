import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { C, statusBadgeStyle, vitalColor, ivColor, bedColor } from '../theme';


// Live API endpoint (FastAPI on Lambda, behind API Gateway)
const API_URL = 'https://rtgr7kit4f.execute-api.ap-south-1.amazonaws.com/dashboard-data';
const POLL_INTERVAL_MS = 5000;

const PATIENTS_BASE = [
  { id: 1, name: 'Priya Sharma',  bed: 4,  gender: 'F', age: 62, status: 'critical', bp: '148/92', hr: 112, temp: 38.9, spo2: 94, rr: 24, pain: 8,  iv: 'Saline',     ivPct: 12, ward: 'Ward 4B', doctor: 'Dr. Nair', notes: 'Post-op monitoring, hourly checks.' },
  { id: 2, name: 'Ravi Kumar',    bed: 11, gender: 'M', age: 58, status: 'critical', bp: '92/60',  hr: 118, temp: 36.5, spo2: 91, rr: 26, pain: 6,  iv: 'Dopamine',   ivPct: 55, ward: 'Ward 4B', doctor: 'Dr. Srikanth', notes: 'On dopamine drip, cardiac monitoring active.' },
  { id: 3, name: 'Arjun Mehta',   bed: 7,  gender: 'M', age: 45, status: 'watch',    bp: '128/82', hr: 98,  temp: 37.8, spo2: 97, rr: 18, pain: 3,  iv: 'Antibiotics', ivPct: 28, ward: 'Ward 4B', doctor: 'Dr. Nair', notes: 'Responding well to antibiotics, fever reducing.' },
  { id: 4, name: 'Leela Nair',    bed: 2,  gender: 'F', age: 73, status: 'stable',   bp: '118/76', hr: 72,  temp: 36.8, spo2: 99, rr: 16, pain: 1,  iv: 'Glucose',    ivPct: 72, ward: 'Ward 4B', doctor: 'Dr. Iyer', notes: 'Stable, scheduled for discharge review.' },
  { id: 5, name: 'Farida Begum',  bed: 5,  gender: 'F', age: 55, status: 'stable',   bp: '122/80', hr: 76,  temp: 37.0, spo2: 98, rr: 17, pain: 2,  iv: 'Saline',     ivPct: 60, ward: 'Ward 4B', doctor: 'Dr. Iyer', notes: 'Stable, routine monitoring.' },
  { id: 6, name: 'Kiran Desai',   bed: 9,  gender: 'M', age: 40, status: 'watch',    bp: '135/88', hr: 95,  temp: 38.1, spo2: 96, rr: 19, pain: 4,  iv: 'Glucose',    ivPct: 40, ward: 'Ward 4B', doctor: 'Dr. Srikanth', notes: 'Mild fever, being observed.' },
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
  { num: 4,  status: 'occupied',    patient: 'Priya Sharma' },
  { num: 5,  status: 'occupied',    patient: 'Farida Begum' },
  { num: 6,  status: 'vacant',      patient: ''             },
  { num: 7,  status: 'occupied',    patient: 'Arjun Mehta'  },
  { num: 8,  status: 'maintenance', patient: 'Deep clean'   },
  { num: 9,  status: 'occupied',    patient: 'Kiran Desai'  },
  { num: 10, status: 'reserved',    patient: 'Transfer 10:30' },
  { num: 11, status: 'occupied',    patient: 'Ravi Kumar'   },
  { num: 12, status: 'occupied',    patient: 'Meena Joseph' },
  { num: 13, status: 'vacant',      patient: ''             },
  { num: 14, status: 'occupied',    patient: 'Babu Reddy'   },
  { num: 15, status: 'occupied',    patient: 'Hameed Ali'   },
  { num: 16, status: 'vacant',      patient: ''             },
];

const ASSET_GROUPS_BASE = [
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
];

const HISTORY_BASE = [
  { icon:'✅', title:'IV drip replaced — Leela Nair (Bed 2)',       meta:'Nurse Deepa · 07:42 · IV Glucose bag changed', status:'done'      },
  { icon:'✅', title:'Morning vitals recorded — all 12 patients',   meta:'Nurse Preethi · 06:30 · Routine check complete', status:'done'     },
  { icon:'⚠️', title:'Wheelchair WC-06 sent for maintenance',       meta:'Nurse Deepa · 06:15 · Faulty wheel logged',     status:'pending'   },
  { icon:'🔴', title:'SpO₂ alert — Ravi Kumar escalated',           meta:'Auto-system · 07:58 · Dr. Srikanth notified',   status:'escalated' },
  { icon:'✅', title:'Night shift handover complete',               meta:'Sr. Nurse Anita · 06:00 · Notes transferred',   status:'done'      },
];

function severityToStatus(severity) {
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'WARNING') return 'watch';
  return 'stable';
}

function wheelchairStatusMap(status) {
  if (status === 'In Use') return 'in-use';
  if (status === 'Charging') return 'unavailable';
  return 'available';
}

/* ---------- Reusable: Filter dropdown ---------- */
function FilterDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={s.filterBtn} className="hover-lift" onClick={() => setOpen(o => !o)}>
        <span>{current.label}</span>
        <span style={{ fontSize: 10, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▼</span>
      </div>
      {open && (
        <div style={s.filterMenu}>
          {options.map(o => (
            <div
              key={o.value}
              className="hover-lift"
              style={{
                ...s.filterOption,
                background: o.value === value ? C.accentBg : 'transparent',
                color: o.value === value ? C.accent : C.text
              }}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
              {o.count !== undefined && <span style={s.filterCount}>{o.count}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable: Patient detail modal ---------- */
function PatientModal({ patient, onClose }) {
  if (!patient) return null;
  const badge = statusBadgeStyle(patient.status);
  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modalCard} onClick={e => e.stopPropagation()}>
        <div style={s.modalHead}>
          <div>
            <div style={s.modalName}>
              {patient.name}
              {patient.isLive && <span style={s.liveTag}> ● LIVE</span>}
            </div>
            <div style={s.modalSub}>Bed {patient.bed} · {patient.gender}/{patient.age} · {patient.ward}</div>
          </div>
          <span style={{ ...s.badge, ...badge }}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </span>
        </div>

        <div style={s.modalVitalsGrid}>
          {[
            { label: 'Blood Pressure', value: patient.bp,             color: C.text },
            { label: 'Heart Rate',     value: `${patient.hr} bpm`,    color: vitalColor('hr',   patient.hr)   },
            { label: 'Temperature',    value: `${patient.temp}°C`,    color: vitalColor('temp', patient.temp) },
            { label: 'SpO₂',          value: `${patient.spo2}%`,     color: vitalColor('spo2', patient.spo2) },
            { label: 'Resp. Rate',     value: `${patient.rr}/min`,    color: vitalColor('rr',   patient.rr)   },
            { label: 'Pain Score',     value: `${patient.pain}/10`,   color: vitalColor('pain', patient.pain) },
          ].map(v => (
            <div key={v.label} style={s.modalVit}>
              <div style={s.modalVn}>{v.label}</div>
              <div style={{ ...s.modalVv, color: v.color }}>{v.value}</div>
            </div>
          ))}
        </div>

        <div style={s.modalSection}>
          <div style={s.modalSectionLbl}>IV Drip</div>
          <div style={s.ivRow}>
            <span style={s.ivLbl}>💧 {patient.iv}</span>
            <div style={s.bar}>
              <div style={{ ...s.bf, width: `${patient.ivPct}%`, background: ivColor(patient.ivPct) }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: ivColor(patient.ivPct) }}>{patient.ivPct}%</span>
          </div>
        </div>

        <div style={s.modalSection}>
          <div style={s.modalSectionLbl}>Attending Doctor</div>
          <div style={s.modalText}>{patient.doctor}</div>
        </div>

        <div style={s.modalSection}>
          <div style={s.modalSectionLbl}>Notes</div>
          <div style={s.modalText}>{patient.notes}</div>
        </div>

        <div style={s.modalClose} className="hover-lift" onClick={onClose}>Close</div>
      </div>
    </div>
  );
}

/* ---------- Reusable: bed icon (BookMyShow-style seat map) ---------- */
function BedIcon({ status }) {
  const c = bedColor(status);
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="10" width="20" height="9" rx="2" fill={c.bg} opacity="0.9" />
      <rect x="2" y="7" width="6" height="6" rx="1.5" fill={c.bg} />
      <rect x="1" y="18" width="2" height="4" rx="0.5" fill={c.bg} />
      <rect x="21" y="18" width="2" height="4" rx="0.5" fill={c.bg} />
    </svg>
  );
}

export default function NurseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('vitals');
  const [ackedAlerts, setAckedAlerts] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  const [vitalsFilter, setVitalsFilter] = useState('all');
  const [alertsFilter, setAlertsFilter] = useState('all');
  const [bedsFilter, setBedsFilter] = useState('all');
  const [assetsFilter, setAssetsFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setLiveData(data);
          setLiveConnected(true);
        }
      } catch (err) {
        if (!cancelled) setLiveConnected(false);
        console.error('Dashboard live data fetch failed:', err);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const ackAlert = (id) => setAckedAlerts(prev => [...prev, id]);
  const allActiveAlerts = ALERTS.filter(a => !ackedAlerts.includes(a.id));

  // Merge live PAT-004 vitals into the Bed 11 card
  const patients = PATIENTS_BASE.map(p => {
    if (p.bed === 11 && liveData?.patientVitals && !liveData.patientVitals.error) {
      const v = liveData.patientVitals;
      return {
        ...p,
        name: v.patient_name || p.name,
        age: v.age ?? p.age,
        status: severityToStatus(v.alert_severity),
        bp: v.systolic_bp ? `${v.systolic_bp}/--` : p.bp,
        hr: v.heart_rate_bpm ?? p.hr,
        temp: v.temperature_celsius ?? p.temp,
        spo2: v.spo2_percent ?? p.spo2,
        rr: v.respiratory_rate ?? p.rr,
        isLive: true
      };
    }
    return p;
  });

  const assetGroups = ASSET_GROUPS_BASE.map(group => {
    if (group.name !== 'Wheelchairs') return group;
    return {
      ...group,
      items: group.items.map(item => {
        if (item.id === 'WC-02' && liveData?.wheelchairTracking && !liveData.wheelchairTracking.error) {
          const w = liveData.wheelchairTracking;
          return {
            ...item,
            id: w.asset_id || item.id,
            loc: w.zone || item.loc,
            status: wheelchairStatusMap(w.status),
            isLive: true
          };
        }
        return item;
      })
    };
  });

  // Filtered views
  const filteredPatients = vitalsFilter === 'all' ? patients : patients.filter(p => p.status === vitalsFilter);
  const filteredAlerts = alertsFilter === 'all' ? allActiveAlerts : allActiveAlerts.filter(a => a.type === alertsFilter);
  const filteredBeds = bedsFilter === 'all' ? BEDS : BEDS.filter(b => b.status === bedsFilter);
  const allAssetItems = assetGroups.flatMap(g => g.items.map(i => ({ ...i, group: g.name })));
  const filteredAssetGroups = assetsFilter === 'all'
    ? assetGroups
    : assetGroups.map(g => ({ ...g, items: g.items.filter(i => i.status === assetsFilter) })).filter(g => g.items.length > 0);
  const filteredHistory = historyFilter === 'all' ? HISTORY_BASE : HISTORY_BASE.filter(h => h.status === historyFilter);

  const vitalsFilterOptions = [
    { value: 'all', label: 'All Patients', count: patients.length },
    { value: 'critical', label: 'Critical', count: patients.filter(p => p.status === 'critical').length },
    { value: 'watch', label: 'Watch', count: patients.filter(p => p.status === 'watch').length },
    { value: 'stable', label: 'Stable', count: patients.filter(p => p.status === 'stable').length },
  ];

  const alertsFilterOptions = [
    { value: 'all', label: 'All Alerts', count: allActiveAlerts.length },
    { value: 'critical', label: 'Critical', count: allActiveAlerts.filter(a => a.type === 'critical').length },
    { value: 'warning', label: 'Warning', count: allActiveAlerts.filter(a => a.type === 'warning').length },
  ];

  const bedsFilterOptions = [
    { value: 'all', label: 'All Beds', count: BEDS.length },
    { value: 'occupied', label: 'Occupied', count: BEDS.filter(b => b.status === 'occupied').length },
    { value: 'vacant', label: 'Vacant', count: BEDS.filter(b => b.status === 'vacant').length },
    { value: 'reserved', label: 'Reserved', count: BEDS.filter(b => b.status === 'reserved').length },
    { value: 'maintenance', label: 'Maintenance', count: BEDS.filter(b => b.status === 'maintenance').length },
  ];

  const assetsFilterOptions = [
    { value: 'all', label: 'All Assets', count: allAssetItems.length },
    { value: 'available', label: 'Available', count: allAssetItems.filter(i => i.status === 'available').length },
    { value: 'in-use', label: 'In Use', count: allAssetItems.filter(i => i.status === 'in-use').length },
    { value: 'low', label: 'Low', count: allAssetItems.filter(i => i.status === 'low').length },
    { value: 'unavailable', label: 'Unavailable', count: allAssetItems.filter(i => i.status === 'unavailable').length },
  ];

  const historyFilterOptions = [
    { value: 'all', label: 'All Tasks', count: HISTORY_BASE.length },
    { value: 'done', label: 'Done', count: HISTORY_BASE.filter(h => h.status === 'done').length },
    { value: 'pending', label: 'Pending', count: HISTORY_BASE.filter(h => h.status === 'pending').length },
    { value: 'escalated', label: 'Escalated', count: HISTORY_BASE.filter(h => h.status === 'escalated').length },
  ];

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
              className="hover-lift"
              style={{
                ...s.navItem,
                background: active === n.key ? C.accentBg : 'transparent',
                color:      active === n.key ? C.accent : C.textDim,
                fontWeight: active === n.key ? 500 : 400,
              }}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
              {n.key === 'alerts' && allActiveAlerts.length > 0 && (
                <span style={s.alertBadge}>{allActiveAlerts.length}</span>
              )}
            </div>
          ))}
        </div>

        <div style={s.sbFooter}>
          <div style={s.logoutBtn} className="hover-lift" onClick={handleLogout}>
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
            <span style={{
              ...s.tbBadge,
              background: liveConnected ? C.greenBg : C.redBg,
              color: liveConnected ? C.greenBright : C.red,
              borderColor: liveConnected ? C.greenBorder : C.redBorder
            }}>
              {liveConnected ? '🟢 IoT Live' : '🔴 Disconnected'}
            </span>
            <span style={s.tbBadge}>12 patients</span>
            {allActiveAlerts.length > 0 && (
              <span style={s.alertDot} className="hover-lift" onClick={() => setActive('alerts')}>
                🔔 {allActiveAlerts.length}
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
                <div style={s.stat}><div style={s.statLbl}>Vacant Beds</div><div style={{...s.statVal,color:C.greenBright}}>4</div><div style={s.statNote}>of 16 total</div></div>
                <div style={s.stat}><div style={s.statLbl}>Active Alerts</div><div style={{...s.statVal,color:C.red}}>{allActiveAlerts.length}</div><div style={s.statNote}>2 critical</div></div>
                <div style={s.stat}><div style={s.statLbl}>IV Drips Due</div><div style={{...s.statVal,color:C.amber}}>2</div><div style={s.statNote}>within 30 min</div></div>
              </div>

              <div style={s.secHead}>
                <span style={s.secTitle}>Patient Vitals — Live</span>
                <FilterDropdown value={vitalsFilter} options={vitalsFilterOptions} onChange={setVitalsFilter} />
              </div>

              {filteredPatients.length === 0 && <div style={s.emptyBox}>No patients match this filter.</div>}

              <div style={s.patientGrid}>
                {filteredPatients.map(p => {
                  const badge = statusBadgeStyle(p.status);
                  return (
                  <div
                    key={p.id}
                    className="hover-lift-soft"
                    style={{
                      ...s.pc,
                      borderLeft: p.status === 'critical' ? `4px solid ${C.red}` : `0.5px solid ${C.border}`,
                      position: 'relative'
                    }}
                    onClick={() => setSelectedPatient(p)}
                  >
                    {p.isLive && <span style={s.liveTagAbs}>● LIVE</span>}
                    <div style={s.pcHead}>
                      <div>
                        <div style={s.pcName}>{p.name}</div>
                        <div style={s.pcBed}>Bed {p.bed} · {p.gender}/{p.age}</div>
                      </div>
                      <span style={{ ...s.badge, ...badge }}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>

                    <div style={s.vitals}>
                      {[
                        { label: 'BP',    value: p.bp,             color: C.text },
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
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {active === 'alerts' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Active Alerts</span>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <span style={{fontSize:13,color:C.textDim}}>{filteredAlerts.length} shown</span>
                  <FilterDropdown value={alertsFilter} options={alertsFilterOptions} onChange={setAlertsFilter} />
                </div>
              </div>
              {filteredAlerts.length === 0 && (
                <div style={s.emptyBox}>✅ No alerts match this filter!</div>
              )}
              {filteredAlerts.map(a => (
                <div key={a.id} className="hover-lift-soft" style={{
                  ...s.alertRow,
                  borderLeft: a.type === 'critical' ? `4px solid ${C.red}` : `4px solid ${C.amber}`
                }}>
                  <span style={{fontSize:24}}>{a.icon}</span>
                  <div style={{flex:1}}>
                    <div style={s.alTitle}>{a.title}</div>
                    <div style={s.alDesc}>{a.desc}</div>
                  </div>
                  <button style={s.ackBtn} className="hover-lift" onClick={() => ackAlert(a.id)}>
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
                <div style={s.stat}><div style={s.statLbl}>Occupied</div><div style={{...s.statVal,color:C.red}}>10</div></div>
                <div style={s.stat}><div style={s.statLbl}>Vacant</div><div style={{...s.statVal,color:C.greenBright}}>4</div></div>
                <div style={s.stat}><div style={s.statLbl}>Reserved</div><div style={{...s.statVal,color:C.amber}}>1</div></div>
                <div style={s.stat}><div style={s.statLbl}>Maintenance</div><div style={{...s.statVal,color:C.gray}}>1</div></div>
              </div>

              <div style={s.secHead}>
                <span style={s.secTitle}>Ward Map</span>
                <FilterDropdown value={bedsFilter} options={bedsFilterOptions} onChange={setBedsFilter} />
              </div>

              <div style={s.legendRow}>
                {[
                  {status:'vacant', label:'Vacant'},
                  {status:'occupied', label:'Occupied'},
                  {status:'reserved', label:'Reserved'},
                  {status:'maintenance', label:'Maintenance'},
                ].map(l => (
                  <div key={l.status} style={s.legendItem}>
                    <BedIcon status={l.status} />
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>

              {filteredBeds.length === 0 && <div style={s.emptyBox}>No beds match this filter.</div>}

              <div style={s.bedIconGrid}>
                {filteredBeds.map(b => {
                  const c = bedColor(b.status);
                  return (
                    <div
                      key={b.num}
                      className="hover-lift"
                      style={{...s.bedIconCell, background:c.light, borderColor:c.border}}
                      onClick={() => setSelectedBed(b)}
                      title={b.patient || 'Ready'}
                    >
                      <BedIcon status={b.status} />
                      <div style={s.bedIconNum}>{String(b.num).padStart(2,'0')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ASSETS ── */}
          {active === 'assets' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Asset Tracker</span>
                <FilterDropdown value={assetsFilter} options={assetsFilterOptions} onChange={setAssetsFilter} />
              </div>

              {filteredAssetGroups.length === 0 && <div style={s.emptyBox}>No assets match this filter.</div>}

              {filteredAssetGroups.map(group => (
                <div key={group.name} style={s.assetCard}>
                  <div style={s.assetHead}>{group.name}</div>
                  {group.items.map(item => {
                    const badge = statusBadgeStyle(item.status);
                    return (
                    <div key={item.id} className="hover-lift-soft" style={s.assetRow}>
                      <span style={s.assetId}>
                        {item.id}{item.isLive && <span style={s.liveDot}> ●</span>}
                      </span>
                      <span style={s.assetLoc}>{item.loc}</span>
                      {item.pct !== undefined && (
                        <div style={s.miniBar}>
                          <div style={{...s.miniFill, width:`${item.pct}%`, background: item.pct < 25 ? C.red : C.greenBright}} />
                        </div>
                      )}
                      <span style={{ ...s.badge, ...badge }}>
                        {item.status}
                      </span>
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ── HISTORY ── */}
          {active === 'history' && (
            <div>
              <div style={s.secHead}>
                <span style={s.secTitle}>Task History — Today</span>
                <FilterDropdown value={historyFilter} options={historyFilterOptions} onChange={setHistoryFilter} />
              </div>

              {filteredHistory.length === 0 && <div style={s.emptyBox}>No tasks match this filter.</div>}

              {filteredHistory.map((h,i) => {
                const badge = statusBadgeStyle(h.status);
                return (
                <div key={i} className="hover-lift-soft" style={s.histRow}>
                  <span style={{fontSize:20}}>{h.icon}</span>
                  <div style={{flex:1}}>
                    <div style={s.histTitle}>{h.title}</div>
                    <div style={s.histMeta}>{h.meta}</div>
                  </div>
                  <span style={{ ...s.badge, ...badge }}>{h.status}</span>
                </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {selectedPatient && (
        <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}

      {selectedBed && (
        <div style={s.modalOverlay} onClick={() => setSelectedBed(null)}>
          <div style={s.modalCardSmall} onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalName}>Bed {String(selectedBed.num).padStart(2,'0')}</div>
                <div style={s.modalSub}>{selectedBed.patient || 'No patient assigned'}</div>
              </div>
              <span style={{
                ...s.badge,
                background: bedColor(selectedBed.status).bg,
                color: '#fff',
              }}>
                {selectedBed.status.charAt(0).toUpperCase() + selectedBed.status.slice(1)}
              </span>
            </div>
            <div style={s.modalClose} className="hover-lift" onClick={() => setSelectedBed(null)}>Close</div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  app:         { display:'flex', height:'100vh', background:C.bg, color:C.text, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif' },
  sidebar:     { width:220, background:C.bgAlt, borderRight:`0.5px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0 },
  sbHead:      { padding:'1rem', borderBottom:`0.5px solid ${C.border}` },
  sbLogo:      { display:'flex', alignItems:'center', gap:8 },
  sbLogoIcon:  { width:32, height:32, borderRadius:8, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  sbLogoText:  { fontSize:14, fontWeight:600, color:C.text },
  sbLogoSub:   { fontSize:11, color:C.textMute },
  userPill:    { marginTop:10, background:C.card, borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 },
  avatar:      { width:28, height:28, borderRadius:'50%', background:C.accentBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:C.accent, flexShrink:0 },
  uName:       { fontSize:12, fontWeight:500, color:C.text },
  uRole:       { fontSize:10, color:C.textMute },
  sbNav:       { padding:'0.5rem 0.75rem', flex:1, overflowY:'auto' },
  navSection:  { fontSize:10, fontWeight:600, color:C.textMute, textTransform:'uppercase', letterSpacing:'0.07em', padding:'10px 8px 5px' },
  navItem:     { display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, marginBottom:2, transition:'all .12s' },
  alertBadge:  { marginLeft:'auto', fontSize:10, background:C.redBg, color:C.red, borderRadius:10, padding:'1px 6px', fontWeight:600 },
  sbFooter:    { padding:'0.75rem', borderTop:`0.5px solid ${C.border}` },
  logoutBtn:   { display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, color:C.textDim },
  main:        { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:      { background:C.bgAlt, borderBottom:`0.5px solid ${C.border}`, padding:'0.75rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  tbTitle:     { fontSize:15, fontWeight:500, color:C.text },
  tbSub:       { fontSize:12, color:C.textMute, marginTop:2 },
  tbRight:     { display:'flex', alignItems:'center', gap:10 },
  tbBadge:     { fontSize:12, padding:'4px 10px', borderRadius:20, background:C.card, color:C.textDim, border:`0.5px solid ${C.border}` },
  alertDot:    { fontSize:12, padding:'4px 10px', borderRadius:20, background:C.redBg, color:C.red, cursor:'pointer', fontWeight:600 },
  content:     { flex:1, overflowY:'auto', padding:'1rem 1.25rem', background:C.bg },
  statGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:'1rem' },
  stat:        { background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'0.75rem 1rem' },
  statLbl:     { fontSize:11, color:C.textMute, marginBottom:3 },
  statVal:     { fontSize:22, fontWeight:500, color:C.text, lineHeight:1 },
  statNote:    { fontSize:11, color:C.textMute, marginTop:2 },
  secHead:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  secTitle:    { fontSize:11, fontWeight:600, color:C.textMute, textTransform:'uppercase', letterSpacing:'0.05em' },
  patientGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 },
  pc:          { background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'0.85rem 1rem', cursor:'pointer' },
  liveTagAbs:  { position:'absolute', top:8, right:10, fontSize:9, fontWeight:700, color:C.greenBright, letterSpacing:'0.05em' },
  liveTag:     { fontSize:11, fontWeight:700, color:C.greenBright },
  liveDot:     { color:C.greenBright, fontWeight:700 },
  pcHead:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  pcName:      { fontSize:13, fontWeight:500, color:C.text },
  pcBed:       { fontSize:11, color:C.textMute },
  badge:       { fontSize:10, padding:'2px 8px', borderRadius:10, fontWeight:600 },
  vitals:      { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, marginBottom:8 },
  vit:         { background:C.cardAlt, borderRadius:6, padding:'4px 6px' },
  vn:          { fontSize:9, color:C.textMute },
  vv:          { fontSize:13, fontWeight:500 },
  ivRow:       { display:'flex', alignItems:'center', gap:6, paddingTop:6, borderTop:`0.5px solid ${C.border}` },
  ivLbl:       { fontSize:10, color:C.textMute, whiteSpace:'nowrap' },
  bar:         { flex:1, height:4, background:C.border, borderRadius:2, overflow:'hidden' },
  bf:          { height:'100%', borderRadius:2, transition:'width .4s' },
  alertRow:    { display:'flex', alignItems:'center', gap:12, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'0.85rem 1rem', marginBottom:8 },
  alTitle:     { fontSize:13, fontWeight:500, color:C.text },
  alDesc:      { fontSize:12, color:C.textMute, marginTop:2 },
  ackBtn:      { fontSize:12, padding:'5px 12px', borderRadius:8, border:`0.5px solid ${C.border}`, background:C.cardAlt, color:C.textDim, cursor:'pointer' },
  emptyBox:    { background:C.greenBg, border:`1px solid ${C.greenBorder}`, borderRadius:12, padding:'2rem', textAlign:'center', fontSize:14, color:C.greenBright, marginBottom:12 },
  assetCard:   { background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'1rem', marginBottom:10 },
  assetHead:   { fontSize:13, fontWeight:500, color:C.text, marginBottom:10 },
  assetRow:    { display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:`0.5px solid ${C.border}` },
  assetId:     { fontSize:11, color:C.textMute, width:60 },
  assetLoc:    { fontSize:12, color:C.text, flex:1 },
  miniBar:     { width:48, height:4, background:C.border, borderRadius:2, overflow:'hidden' },
  miniFill:    { height:'100%', borderRadius:2 },
  histRow:     { display:'flex', alignItems:'flex-start', gap:12, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'0.85rem 1rem', marginBottom:8 },
  histTitle:   { fontSize:13, fontWeight:500, color:C.text },
  histMeta:    { fontSize:11, color:C.textMute, marginTop:2 },

  /* Filter dropdown */
  filterBtn:   { display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500, color:C.text, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'6px 12px', cursor:'pointer' },
  filterMenu:  { position:'absolute', top:'110%', right:0, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,0.4)', minWidth:180, zIndex:20, overflow:'hidden' },
  filterOption:{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'8px 12px', cursor:'pointer' },
  filterCount: { fontSize:11, color:C.textMute, background:C.cardAlt, borderRadius:8, padding:'1px 7px' },

  /* Bed icon grid */
  legendRow:    { display:'flex', gap:16, marginBottom:12, flexWrap:'wrap' },
  legendItem:   { display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.textDim },
  bedIconGrid:  { display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:10 },
  bedIconCell:  { border:'0.5px solid', borderRadius:10, padding:'10px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer', transition:'transform .1s' },
  bedIconNum:   { fontSize:10, fontWeight:600, color:C.textDim },

  /* Modal */
  modalOverlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modalCard:      { background:C.card, borderRadius:16, padding:'1.5rem', width:420, maxWidth:'90vw', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 10px 40px rgba(0,0,0,0.5)' },
  modalCardSmall: { background:C.card, borderRadius:16, padding:'1.5rem', width:300, maxWidth:'90vw', boxShadow:'0 10px 40px rgba(0,0,0,0.5)' },
  modalHead:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  modalName:      { fontSize:17, fontWeight:600, color:C.text },
  modalSub:       { fontSize:12, color:C.textMute, marginTop:2 },
  modalVitalsGrid:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 },
  modalVit:       { background:C.cardAlt, borderRadius:8, padding:'8px 10px' },
  modalVn:        { fontSize:10, color:C.textMute, marginBottom:2 },
  modalVv:        { fontSize:15, fontWeight:600 },
  modalSection:   { marginBottom:14 },
  modalSectionLbl:{ fontSize:11, fontWeight:600, color:C.textMute, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 },
  modalText:      { fontSize:13, color:C.textDim, lineHeight:1.4 },
  modalClose:     { textAlign:'center', fontSize:13, fontWeight:500, color:C.textDim, background:C.cardAlt, borderRadius:8, padding:'8px', cursor:'pointer', marginTop:8 },
};