/**
 * InSite Shared Utilities
 * Single source of truth for common functions used across the app.
 * Loaded before all other app scripts.
 */

// --- Atlanta Metro Employment Centers (canonical list) ---
const ATLANTA_EMPLOYMENT_CENTERS = [
  { id: 'downtown',      name: 'Downtown Atlanta',       lat: 33.749, lng: -84.388, icon: 'fa-city',            jobs: '~80K' },
  { id: 'midtown',       name: 'Midtown',                lat: 33.784, lng: -84.383, icon: 'fa-building',        jobs: '~100K' },
  { id: 'buckhead',      name: 'Buckhead',               lat: 33.838, lng: -84.379, icon: 'fa-gem',             jobs: '~75K' },
  { id: 'perimeter',     name: 'Perimeter Center',       lat: 33.927, lng: -84.341, icon: 'fa-ring',            jobs: '~90K' },
  { id: 'airport',       name: 'Hartsfield-Jackson',     lat: 33.641, lng: -84.428, icon: 'fa-plane',           jobs: '~63K' },
  { id: 'gatech',        name: 'GA Tech / West Midtown', lat: 33.775, lng: -84.397, icon: 'fa-university',      jobs: '~30K' },
  { id: 'emory',         name: 'Emory / CDC',            lat: 33.793, lng: -84.324, icon: 'fa-hospital',        jobs: '~35K' },
  { id: 'marietta',      name: 'Marietta / Cobb',        lat: 33.952, lng: -84.549, icon: 'fa-map-marker-alt',  jobs: '~50K' },
  { id: 'lawrenceville', name: 'Lawrenceville',          lat: 33.956, lng: -83.988, icon: 'fa-map-marker-alt',  jobs: '~25K' },
  { id: 'alpharetta',    name: 'Alpharetta / N. Fulton', lat: 34.075, lng: -84.294, icon: 'fa-map-marker-alt',  jobs: '~65K' }
];

// --- Haversine Distance (single implementation) ---
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959;
  const toRad = deg => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Percentile Rank Calculator ---
function getPercentileRank(value, metric, higherIsBetter = true) {
  if (!window.allZipCodes || window.allZipCodes.length === 0) return 50;
  const allValues = window.allZipCodes
    .map(z => window.zipData[z]?.[metric])
    .filter(v => v != null && !isNaN(v) && v > 0)
    .sort((a, b) => a - b);
  if (allValues.length === 0) return 50;
  const rank = allValues.filter(v => v <= value).length;
  const percentile = Math.round((rank / allValues.length) * 100);
  return higherIsBetter ? percentile : (100 - percentile);
}

// --- Grade from Score ---
function getGradeFromScore(score) {
  if (score >= 90) return { letter: 'A+', color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { letter: 'A', color: '#22c55e', label: 'Great' };
  if (score >= 70) return { letter: 'B', color: '#84cc16', label: 'Good' };
  if (score >= 60) return { letter: 'C', color: '#f59e0b', label: 'Average' };
  if (score >= 50) return { letter: 'D', color: '#f97316', label: 'Below Avg' };
  return { letter: 'F', color: '#ef4444', label: 'Poor' };
}

// --- Value Formatters ---
const ValueFormatters = {
  currency: v => {
    if (v == null || isNaN(v)) return 'N/A';
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return '$' + Math.round(v / 1000) + 'K';
    return '$' + Math.round(v);
  },
  currencyFull: v => {
    if (v == null || isNaN(v)) return 'N/A';
    return '$' + Math.round(v).toLocaleString();
  },
  population: v => {
    if (v == null || isNaN(v)) return 'N/A';
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return Math.round(v / 1000) + 'K';
    return Math.round(v).toLocaleString();
  },
  percent: v => {
    if (v == null || isNaN(v)) return 'N/A';
    return Math.round(v) + '%';
  },
  number: v => {
    if (v == null || isNaN(v)) return 'N/A';
    return Math.round(v).toLocaleString();
  }
};

// --- Pro Tier Check ---
function isPro() {
  // Check Firestore-backed user profile first
  if (window.userProfile && (window.userProfile.tier === 'professional' || window.userProfile.tier === 'enterprise')) {
    return true;
  }
  // Fall back to localStorage
  return localStorage.getItem('insitePro') === 'true';
}

// --- Shared ApexCharts Theme ---
const CHART_THEME = {
  colors: ['#0d9488', '#f59e0b', '#60a5fa', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8'],
  chart: {
    background: 'transparent',
    foreColor: '#94a3b8',
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false }
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.1)',
    strokeDashArray: 3
  },
  tooltip: {
    theme: 'dark',
    style: { fontSize: '12px' }
  },
  xaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
    axisBorder: { color: 'rgba(148, 163, 184, 0.15)' }
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { opacity: 0.85 }
};

function applyChartTheme(options) {
  return {
    ...options,
    chart: { ...CHART_THEME.chart, ...(options.chart || {}) },
    grid: { ...CHART_THEME.grid, ...(options.grid || {}) },
    tooltip: { ...CHART_THEME.tooltip, ...(options.tooltip || {}) },
    xaxis: { ...CHART_THEME.xaxis, ...(options.xaxis || {}), labels: { ...CHART_THEME.xaxis.labels, ...(options.xaxis?.labels || {}) } },
    yaxis: { ...CHART_THEME.yaxis, ...(options.yaxis || {}), labels: { ...CHART_THEME.yaxis.labels, ...(options.yaxis?.labels || {}) } },
    colors: options.colors || CHART_THEME.colors,
    dataLabels: { ...CHART_THEME.dataLabels, ...(options.dataLabels || {}) },
    stroke: { ...CHART_THEME.stroke, ...(options.stroke || {}) }
  };
}

// --- Safe DOM Helpers ---
function safeText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '';
}
function safeHTML(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = val ?? '';
}
function safeStyle(id, prop, val) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = val;
}
