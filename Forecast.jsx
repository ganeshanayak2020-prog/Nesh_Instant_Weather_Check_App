import Chart from './Chart';
import { wmo, temp, tval, fmtHour, fmtWeekday, fmtShort, nowIdx } from '../utils';

export function Hourly({ w, unit }) {
  const h = w.hourly, s = nowIdx(h.time, w.current.time);
  const idx = Array.from({ length: 12 }, (_, k) => s + k).filter((i) => i < h.time.length);
  const labels = idx.map((i, k) => (k === 0 ? 'Now' : fmtHour(h.time[i])));
  const vals = idx.map((i) => tval(h.temperature_2m[i], unit));
  const pop = idx.map((i) => h.precipitation_probability[i] ?? 0);
  return (
    <section className="card" aria-label="Hourly forecast">
      <h2>Next 12 hours <small>Line is temperature, bars are chance of rain</small></h2>
      <Chart
        series={[{ values: vals, color: '#ffc971' }]} labels={labels} bars={pop} ticks={6}
        tip={(i) => <><b>{labels[i]}</b><br />{Math.round(vals[i])}°{unit}, {pop[i]}% rain<br />{wmo(h.weather_code[idx[i]], h.is_day[idx[i]]).label}</>}
      />
      <ol className="hours">
        {idx.map((i, k) => {
          const info = wmo(h.weather_code[i], h.is_day[i]);
          return (
            <li key={i} className={k === 0 ? 'on' : ''}>
              <span>{labels[k]}</span>
              <span className="wicon sm" role="img" aria-label={info.label}>{info.icon}</span>
              <strong>{temp(h.temperature_2m[i], unit)}°</strong>
              <span className="pop">{pop[k]}%</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Daily({ w, unit }) {
  const d = w.daily;
  const lo = Math.min(...d.temperature_2m_min), hi = Math.max(...d.temperature_2m_max), span = hi - lo || 1;
  return (
    <section className="card" aria-label="7-day forecast">
      <h2>7-day forecast</h2>
      <ul className="days">
        {d.time.map((t, i) => {
          const info = wmo(d.weather_code[i]);
          const l = ((d.temperature_2m_min[i] - lo) / span) * 100, r = ((d.temperature_2m_max[i] - lo) / span) * 100;
          return (
            <li key={t}>
              <span className="dname"><b>{i === 0 ? 'Today' : fmtWeekday(t)}</b><small>{fmtShort(t)}</small></span>
              <span className="wicon sm" role="img" aria-label={info.label} title={info.label}>{info.icon}</span>
              <span className="pop">{d.precipitation_probability_max[i] ?? 0}%</span>
              <span className="lo">{temp(d.temperature_2m_min[i], unit)}°</span>
              <span className="range" aria-hidden="true"><i style={{ left: `${l}%`, width: `${Math.max(r - l, 6)}%` }} /></span>
              <span className="hi">{temp(d.temperature_2m_max[i], unit)}°</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
