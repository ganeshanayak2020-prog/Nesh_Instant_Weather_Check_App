import { wmo, temp, speed, dist, press, rain, compass, uvLevel, fmtDate, fmtTime, nowIdx, summary } from '../utils';

export function Hero({ w, place, unit }) {
  const c = w.current, d = w.daily, info = wmo(c.weather_code, c.is_day);
  return (
    <section className="card hero" aria-label="Current weather">
      <div className="place">
        <h1>{place.name}</h1>
        <p>{[place.admin, place.country].filter(Boolean).join(', ')}</p>
      </div>
      <p className="clock">{fmtDate(c.time)}, local time {fmtTime(c.time)}</p>
      <div className="now">
        <span className="wicon" role="img" aria-label={info.label}>{info.icon}</span>
        <div className="temp">{temp(c.temperature_2m, unit)}<sup>°{unit}</sup></div>
      </div>
      <p className="cond">{info.label}</p>
      <ul className="chips">
        <li>Feels like {temp(c.apparent_temperature, unit)}°</li>
        <li>High {temp(d.temperature_2m_max[0], unit)}°</li>
        <li>Low {temp(d.temperature_2m_min[0], unit)}°</li>
        <li>Sunrise {fmtTime(d.sunrise[0])}</li>
        <li>Sunset {fmtTime(d.sunset[0])}</li>
      </ul>
      <p className="summary">{summary(w, unit)}</p>
    </section>
  );
}

export function Metrics({ w, unit }) {
  const c = w.current, i = nowIdx(w.hourly.time, c.time);
  const uv = w.hourly.uv_index[i], uvl = uvLevel(uv);
  const tiles = [
    { icon: '🌡️', label: 'Feels like', value: `${temp(c.apparent_temperature, unit)}°${unit}`, note: c.apparent_temperature - c.temperature_2m > 1 ? 'Warmer than the air temperature' : c.apparent_temperature - c.temperature_2m < -1 ? 'Colder than the air temperature' : 'Close to the air temperature' },
    { icon: '💧', label: 'Humidity', value: `${Math.round(c.relative_humidity_2m)}%`, note: c.relative_humidity_2m > 70 ? 'Humid' : c.relative_humidity_2m < 30 ? 'Dry' : 'Comfortable' },
    { icon: '💨', label: 'Wind', value: speed(c.wind_speed_10m, unit), note: `From ${compass(c.wind_direction_10m)}, gusts ${speed(c.wind_gusts_10m, unit)}`, arrow: c.wind_direction_10m },
    { icon: '👁️', label: 'Visibility', value: dist(w.hourly.visibility[i], unit), note: w.hourly.visibility[i] >= 10000 ? 'Clear view' : w.hourly.visibility[i] >= 4000 ? 'Slightly reduced' : 'Poor' },
    { icon: '🧭', label: 'Pressure', value: press(c.pressure_msl, unit), note: c.pressure_msl < 1009 ? 'Low, unsettled weather' : c.pressure_msl > 1022 ? 'High, settled weather' : 'Normal' },
    { icon: '☁️', label: 'Cloud cover', value: `${Math.round(c.cloud_cover)}%`, note: c.cloud_cover < 25 ? 'Mostly clear' : c.cloud_cover < 70 ? 'Partly covered' : 'Mostly covered' },
    { icon: '🕶️', label: 'UV index', value: uv == null ? '–' : uv.toFixed(1), note: `${uvl.label}. ${uvl.tip}` },
    { icon: '🌧️', label: 'Rain today', value: rain(w.daily.precipitation_sum[0], unit), note: `${w.daily.precipitation_probability_max[0] ?? 0}% chance` },
  ];
  return (
    <section className="metrics" aria-label="Weather details">
      {tiles.map((t) => (
        <div className="card tile" key={t.label}>
          <span className="tile-icon" aria-hidden="true">{t.icon}</span>
          <span className="tile-label">{t.label}</span>
          <strong className="tile-value">
            {t.value}
            {t.arrow != null && <i className="arrow" style={{ transform: `rotate(${t.arrow + 180}deg)` }} aria-hidden="true">↑</i>}
          </strong>
          <span className="tile-note">{t.note}</span>
        </div>
      ))}
    </section>
  );
}
