import React, { useState, useEffect, useRef } from 'react';
import { C } from '../theme';

// Reusable filter dropdown. `options` is an array of { value, label, count? }.
export default function FilterDropdown({ value, options, onChange }) {
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
      <div style={s.filterBtn} onClick={() => setOpen(o => !o)}>
        <span>{current.label}</span>
        <span style={{ fontSize: 10, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▼</span>
      </div>
      {open && (
        <div style={s.filterMenu}>
          {options.map(o => (
            <div
              key={o.value}
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

const s = {
  filterBtn:   { display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500, color:C.text, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'6px 12px', cursor:'pointer' },
  filterMenu:  { position:'absolute', top:'110%', right:0, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,0.4)', minWidth:180, zIndex:20, overflow:'hidden' },
  filterOption:{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'8px 12px', cursor:'pointer' },
  filterCount: { fontSize:11, color:C.textMute, background:C.cardAlt, borderRadius:8, padding:'1px 7px' },
};