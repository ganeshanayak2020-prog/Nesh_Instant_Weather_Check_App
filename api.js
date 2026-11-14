// All data comes from keyless public APIs. See README for details.
const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const REVERSE = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

async function getJSON(url, signal) {
  let res;
  try {
    res = await fetch(url, { signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('Can’t reach the weather service. Check your internet connection.');
  }
  if (!res.ok) {
    throw new Error(res.status === 429 ? 'Too many requests. Wait a minute and try again.' : `The weather service returned an error (${res.status}).`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.reason || 'The weather service returned an error.');
  return data;
}

export async function searchCities(name, signal) {
  const d = await getJSON(`${GEO}?name=${encodeURIComponent(name)}&count=6&language=en&format=json`, signal);
  return (d.results || []).map((r) => ({ name: r.name, admin: r.admin1, country: r.country, lat: r.latitude, lon: r.longitude }));
}

export async function reverseGeocode(lat, lon) {
  try {
    const d = await getJSON(`${REVERSE}?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    return { name: d.city || d.locality || 'Your location', admin: d.principalSubdivision, country: d.countryName };
  } catch {
    return { name: 'Your location', admin: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, country: '' };
  }
}

export const fetchWeather = ({ lat, lon }, signal) =>
  getJSON(
    `${FORECAST}?latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=7` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m' +
      '&hourly=temperature_2m,precipitation_probability,weather_code,is_day,uv_index,visibility' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    signal
  );

export const fetchAir = ({ lat, lon }, signal) =>
  getJSON(
    `${AIR}?latitude=${lat}&longitude=${lon}&timezone=auto&past_days=3&forecast_days=2` +
      '&current=us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide' +
      '&hourly=us_aqi,european_aqi',
    signal
  );

const iso = (d) => d.toISOString().slice(0, 10);
export function fetchHistory({ lat, lon }, signal) {
  // The archive lags a few days behind, so the 30-day window ends 3 days ago.
  const end = new Date(Date.now() - 3 * 864e5);
  const start = new Date(end.getTime() - 29 * 864e5);
  return getJSON(
    `${ARCHIVE}?latitude=${lat}&longitude=${lon}&timezone=auto&start_date=${iso(start)}&end_date=${iso(end)}` +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum',
    signal
  );
}
