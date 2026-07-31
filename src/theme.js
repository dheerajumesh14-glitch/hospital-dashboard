// Shared design tokens for the MediTrack HMS dashboards.
// Import wherever colors are needed: import { C, statusBadgeStyle } from '../theme';

export const C = {
  bg:       '#0A2224',
  bgAlt:    '#0B2626',
  card:     '#0F2C2E',
  cardAlt:  '#123336',
  border:   '#163538',
  accent:   '#22D3AE',
  accentBg: 'rgba(34,211,174,0.12)',
  text:     '#EAF4F4',
  textDim:  '#8AA6A6',
  textMute: '#5C8285',
  red:      '#DC4C4C',
  redBg:    'rgba(220,76,76,0.14)',
  redBorder:'rgba(220,76,76,0.35)',
  amber:    '#D9A544',
  amberBg:  'rgba(217,165,68,0.14)',
  amberBorder:'rgba(217,165,68,0.35)',
  green:    '#2FAE87',
  greenBright: '#4ADE9A',
  greenBg:  'rgba(47,174,135,0.14)',
  greenBorder:'rgba(47,174,135,0.35)',
  gray:     '#6B7280',
  grayBg:   'rgba(107,114,128,0.14)',
  grayBorder:'rgba(107,114,128,0.35)',
};

// Solid badge style for any status word: critical/watch/stable, done/pending/escalated,
// available/in-use/low/unavailable, etc. Red family / amber family / green family.
export function statusBadgeStyle(status) {
  if (status === 'critical' || status === 'escalated' || status === 'low' || status === 'unavailable' || status === 'occupied') {
    return { background: C.red, color: '#fff' };
  }
  if (status === 'watch' || status === 'pending' || status === 'in-use' || status === 'reserved') {
    return { background: C.amber, color: '#14201a' };
  }
  if (status === 'maintenance') {
    return { background: C.gray, color: '#fff' };
  }
  return { background: C.green, color: '#fff' }; // stable / done / available / vacant
}

export function vitalColor(type, val) {
  if (type === 'hr')   return val > 100 ? C.red : val > 90 ? C.amber : C.text;
  if (type === 'temp') return val > 38  ? C.red : val > 37.5 ? C.amber : C.text;
  if (type === 'spo2') return val < 92  ? C.red : val < 95 ? C.amber : C.text;
  if (type === 'rr')   return val > 22  ? C.red : val > 18 ? C.amber : C.text;
  if (type === 'pain') return val >= 7  ? C.red : val >= 4 ? C.amber : C.text;
  return C.text;
}

export function ivColor(pct) {
  return pct < 20 ? C.red : pct < 35 ? C.amber : C.greenBright;
}

export function bedColor(status) {
  if (status === 'occupied')    return { bg: C.red,   light: C.redBg,   border: C.redBorder,   color: C.red   };
  if (status === 'vacant')      return { bg: C.green,  light: C.greenBg, border: C.greenBorder,  color: C.greenBright };
  if (status === 'reserved')    return { bg: C.amber,  light: C.amberBg, border: C.amberBorder,  color: C.amber };
  if (status === 'maintenance') return { bg: C.gray,   light: C.grayBg,  border: C.grayBorder,   color: C.gray  };
  return {};
}