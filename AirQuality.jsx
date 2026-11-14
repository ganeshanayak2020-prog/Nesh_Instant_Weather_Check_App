import Chart from './Chart';
import { US_LEVELS, EU_LEVELS, level, nowIdx, fmtWeekday, fmtHour } from '../utils';

const POLLUTANTS = [
  { key: 'pm2_5', name: 'PM2.5', desc: 'Fine particles from traffic, smoke and industry', ref: 55 },
  { key: 'pm10', name: 'PM10', desc: 'Dust, pollen and coarse particles', ref: 150 },
  { key: 'ozone', name: 'Ozone (O₃)', desc: 'Ground-level smog formed in sunlight', ref: 180 },
  { key: 'nitrogen_dioxide', name: 'Nitrogen dioxide (NO₂)', desc: 'Mainly from vehicle exhaust', ref: 200 },
];

function Scale({ title, value, levels, max, caps }) {
  const lv = level(levels, value);
  let prev = 0;
  const segs = levels.map((l) => { const to = Math.min(l.max, max), w = ((to - prev) / max) * 100; prev = to; return { ...l, w }; }).filter((s) => s.w > 0);
  return (
    <div className="scale">
      <div className="scale-head">
        <span>{title}</span>
        <strong style={{ color: lv?.color }}>{value ?? '–'}</strong>
      </div>
      <p className="scale-cat" style={{ color: lv?.color }}>{lv ? lv.label : 'Not available'}</p>
      <div className="spectrum" role="img" aria-label={`${title} ${value ?? 'unavailable'}${lv ? `, ${lv.label}` : ''}`}>
        {segs.map((s) => <i key={s.label} style={{ width: `${s.w}%`, background: s.color }} />)}
        {value != null && <b style={{ left: `${Math.min(value / max, 1) * 100}%` }} />}
      </div>
      <div className="spectrum-caps"><span>{caps[0]}</span><span>{caps[1]}</span></div>
    </div>
  );
}

export default function AirQuality({ air }) {
  if (!air) {
    return (
      <section className="card" aria-label="Air quality">
        <h2>Air quality</h2>
        <p className="muted">Air quality data isn’t available for this location right now. Weather is unaffected.</p>
      </section>
    );
  }
  const c = air.current, h = air.hourly;
  const us = level(US_LEVELS, c.us_aqi), eu = level(EU_LEVELS, c.european_aqi);
  const now = nowIdx(h.time, c.time);
  const labels = h.time.map((t) => `${fmtWeekday(t)} ${fmtHour(t)}`);
  let prev = -1;
  const bands = US_LEVELS.slice(0, 5).map((l) => { const b = { from: prev, to: l.max, color: l.color }; prev = l.max; return b; });
  const vals = h.us_aqi;
  return (
    <section className="card aqi" aria-label="Air quality">
      <h2>Air quality <small>Live readings with 3 days of history and 2 days of forecast</small></h2>
      <div className="aqi-top">
        <Scale title="US AQI" value={c.us_aqi} levels={US_LEVELS} max={300} caps={['0 Good', '300+ Hazardous']} />
        <Scale title="European AQI" value={c.european_aqi} levels={EU_LEVELS} max={120} caps={['0 Good', '100+ Extremely poor']} />
      </div>
      {us && <p className="advice" style={{ borderColor: us.color }}><b>{us.label}.</b> {us.info}</p>}

      <div className="pollutants">
        {POLLUTANTS.map((p) => {
          const v = c[p.key], r = v == null ? 0 : Math.min(v / p.ref, 1);
          const col = r < 0.25 ? '#2ecc8f' : r < 0.5 ? '#f4d03f' : r < 0.75 ? '#f39c34' : '#e5534b';
          return (
            <div className="poll" key={p.key}>
              <div><b>{p.name}</b><strong>{v == null ? '–' : v.toFixed(1)} <small>µg/m³</small></strong></div>
              <div className="meter"><i style={{ width: `${r * 100}%`, background: col }} /></div>
              <small>{p.desc}</small>
            </div>
          );
        })}
      </div>
      <p className="fine">Pollutant bars show each reading against a high-concentration reference level, so a full bar means very high.</p>

      <h3>US AQI trend</h3>
      <Chart
        series={[{ values: vals, color: '#7cc4ff' }]} labels={labels} bands={bands} nowIndex={now} ticks={5} height={190}
        tip={(i) => { const l = level(US_LEVELS, vals[i]); return <><b>{labels[i]}{i === now ? ' (now)' : i > now ? ' (forecast)' : ''}</b><br />AQI {vals[i] ?? '–'}{l ? `, ${l.label}` : ''}</>; }}
      />

      <details className="guide">
        <summary>What do the air quality levels mean?</summary>
        <div className="guide-cols">
          <div>
            <h4>US AQI</h4>
            <ul>{US_LEVELS.map((l, i) => (
              <li key={l.label}><i style={{ background: l.color }} /><span><b>{l.label}</b> ({i ? US_LEVELS[i - 1].max + 1 : 0}{l.max === Infinity ? '+' : `–${l.max}`}). {l.info}</span></li>
            ))}</ul>
          </div>
          <div>
            <h4>European AQI</h4>
            <ul>{EU_LEVELS.map((l, i) => (
              <li key={l.label}><i style={{ background: l.color }} /><span><b>{l.label}</b> ({i ? EU_LEVELS[i - 1].max : 0}{l.max === Infinity ? '+' : `–${l.max}`}). {l.info}</span></li>
            ))}</ul>
          </div>
        </div>
      </details>
      {eu && <span className="sr-only">European AQI category: {eu.label}</span>}
    </section>
  );
}
