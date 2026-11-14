const T = (label, kind, icon, night) => ({ label, kind, icon, night: night || icon });
const CODES = {
  0: T('Clear sky', 'clear', '☀️', '🌙'), 1: T('Mostly clear', 'clear', '🌤️', '🌙'),
  2: T('Partly cloudy', 'cloudy', '⛅', '☁️'), 3: T('Overcast', 'cloudy', '☁️'),
  45: T('Fog', 'fog', '🌫️'), 48: T('Freezing fog', 'fog', '🌫️'),
  51: T('Light drizzle', 'rain', '🌦️'), 53: T('Drizzle', 'rain', '🌦️'), 55: T('Heavy drizzle', 'rain', '🌧️'),
  56: T('Freezing drizzle', 'rain', '🌧️'), 57: T('Freezing drizzle', 'rain', '🌧️'),
  61: T('Light rain', 'rain', '🌧️'), 63: T('Rain', 'rain', '🌧️'), 65: T('Heavy rain', 'rain', '🌧️'),
  66: T('Freezing rain', 'rain', '🌧️'), 67: T('Freezing rain', 'rain', '🌧️'),
  71: T('Light snow', 'snow', '🌨️'), 73: T('Snow', 'snow', '🌨️'), 75: T('Heavy snow', 'snow', '❄️'), 77: T('Snow grains', 'snow', '🌨️'),
  80: T('Light showers', 'rain', '🌦️'), 81: T('Showers', 'rain', '🌧️'), 82: T('Violent showers', 'rain', '🌧️'),
  85: T('Snow showers', 'snow', '🌨️'), 86: T('Heavy snow showers', 'snow', '❄️'),
  95: T('Thunderstorm', 'storm', '⛈️'), 96: T('Thunderstorm with hail', 'storm', '⛈️'), 99: T('Severe thunderstorm', 'storm', '⛈️'),
};
export const wmo = (code, isDay = 1) => {
  const c = CODES[code] || T('Unknown', 'cloudy', '☁️');
  return { label: c.label, kind: c.kind, icon: isDay ? c.icon : c.night };
};

// Units: the API is always queried in metric; "F" switches to imperial for display.
export const tval = (c, u) => (u === 'F' ? (c * 9) / 5 + 32 : c);
export const temp = (c, u) => (c == null ? '–' : Math.round(tval(c, u)));
export const speed = (k, u) => (k == null ? '–' : u === 'F' ? `${Math.round(k * 0.621371)} mph` : `${Math.round(k)} km/h`);
export const dist = (m, u) => (m == null ? '–' : u === 'F' ? `${(m / 1609.34).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`);
export const press = (h, u) => (h == null ? '–' : u === 'F' ? `${(h * 0.02953).toFixed(2)} inHg` : `${Math.round(h)} hPa`);
export const rain = (mm, u) => (mm == null ? '–' : u === 'F' ? `${(mm / 25.4).toFixed(2)} in` : `${mm.toFixed(1)} mm`);

const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export const compass = (deg) => DIRS[Math.round((deg ?? 0) / 22.5) % 16];

export const uvLevel = (v) =>
  v == null ? { label: 'Unknown', tip: '' }
  : v < 3 ? { label: 'Low', tip: 'No protection needed.' }
  : v < 6 ? { label: 'Moderate', tip: 'Wear sunscreen at midday.' }
  : v < 8 ? { label: 'High', tip: 'Cover up and seek shade at midday.' }
  : v < 11 ? { label: 'Very high', tip: 'Limit time in the sun.' }
  : { label: 'Extreme', tip: 'Avoid the sun at midday.' };

// Local-time strings from the API look like 2026-11-14T15:00 and are already in the place’s timezone.
export const fmtHour = (t) => { const h = +t.slice(11, 13); return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`; };
export const fmtTime = (t) => { const h = +t.slice(11, 13); return `${h % 12 || 12}:${t.slice(14, 16)} ${h < 12 ? 'AM' : 'PM'}`; };
const day = (t) => new Date(`${t.slice(0, 10)}T12:00:00`);
export const fmtDate = (t) => day(t).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtShort = (t) => day(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
export const fmtWeekday = (t) => day(t).toLocaleDateString(undefined, { weekday: 'short' });
export const nowIdx = (times, now) => Math.max(0, times.indexOf(`${now.slice(0, 13)}:00`));

export const summary = (w, u) => {
  const c = w.current, d = w.daily, info = wmo(c.weather_code, c.is_day);
  const p = d.precipitation_probability_max?.[0];
  const parts = [`${info.label} right now.`];
  if (p != null) parts.push(p >= 40 ? `Rain is likely today, with a ${p}% chance.` : `Rain is unlikely today (${p}% chance).`);
  parts.push(`Wind is ${speed(c.wind_speed_10m, u)} from the ${compass(c.wind_direction_10m)}.`);
  return parts.join(' ');
};

export const US_LEVELS = [
  { max: 50, label: 'Good', color: '#2ecc8f', info: 'Air quality is satisfactory and poses little or no risk. Enjoy outdoor activities.' },
  { max: 100, label: 'Moderate', color: '#f4d03f', info: 'Acceptable for most people. Unusually sensitive people may notice symptoms.' },
  { max: 150, label: 'Unhealthy for sensitive groups', color: '#f39c34', info: 'People with asthma, heart or lung disease, children and older adults should reduce long outdoor exertion.' },
  { max: 200, label: 'Unhealthy', color: '#e5534b', info: 'Everyone may begin to feel effects. Sensitive groups may feel more serious effects. Limit outdoor exertion.' },
  { max: 300, label: 'Very unhealthy', color: '#a463c9', info: 'Health alert: everyone may experience serious effects. Avoid outdoor exertion.' },
  { max: Infinity, label: 'Hazardous', color: '#9c2f55', info: 'Emergency conditions. Stay indoors with clean air and avoid all outdoor activity.' },
];
export const EU_LEVELS = [
  { max: 20, label: 'Good', color: '#2ecc8f', info: 'Air quality is good. Enjoy your usual outdoor activities.' },
  { max: 40, label: 'Fair', color: '#8fd14f', info: 'Fair air. Only very sensitive people may notice effects.' },
  { max: 60, label: 'Moderate', color: '#f4d03f', info: 'Sensitive people may feel symptoms. Consider shorter outdoor exertion.' },
  { max: 80, label: 'Poor', color: '#f39c34', info: 'Poor air. Sensitive groups should reduce outdoor exertion; others may feel irritation.' },
  { max: 100, label: 'Very poor', color: '#e5534b', info: 'Very poor air. Limit outdoor activity, especially for sensitive groups.' },
  { max: Infinity, label: 'Extremely poor', color: '#9c2f55', info: 'Extremely poor air. Avoid outdoor activity and keep windows closed.' },
];
export const level = (levels, v) => (v == null ? null : levels.find((l) => v <= l.max) || levels[levels.length - 1]);
