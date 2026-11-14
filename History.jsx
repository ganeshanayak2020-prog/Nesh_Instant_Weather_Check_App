import Chart from './Chart';
import { tval, temp, rain, fmtShort } from '../utils';

export default function History({ hist, unit }) {
  if (!hist) {
    return (
      <section className="card" aria-label="Weather history">
        <h2>Past 30 days</h2>
        <p className="muted">Historical data isn’t available for this location right now.</p>
      </section>
    );
  }
  const d = hist.daily;
  const keep = d.time.map((_, i) => i).filter((i) => d.temperature_2m_max[i] != null);
  const t = keep.map((i) => d.time[i]);
  const mx = keep.map((i) => d.temperature_2m_max[i]), mn = keep.map((i) => d.temperature_2m_min[i]), pr = keep.map((i) => d.precipitation_sum[i] ?? 0);
  if (!t.length) return null;
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const hot = mx.indexOf(Math.max(...mx)), cold = mn.indexOf(Math.min(...mn));
  const total = pr.reduce((s, v) => s + v, 0), wet = pr.filter((v) => v >= 1).length;
  const stats = [
    ['Average high', `${temp(avg(mx), unit)}°`],
    ['Average low', `${temp(avg(mn), unit)}°`],
    ['Hottest day', `${temp(mx[hot], unit)}° on ${fmtShort(t[hot])}`],
    ['Coldest night', `${temp(mn[cold], unit)}° on ${fmtShort(t[cold])}`],
    ['Total rain', rain(total, unit)],
    ['Rainy days', `${wet} of ${t.length}`],
  ];
  return (
    <section className="card" aria-label="Weather history">
      <h2>Past 30 days <small>Daily highs, lows and rainfall</small></h2>
      <Chart
        series={[{ values: mx.map((v) => tval(v, unit)), color: '#ff9a6b', fill: false }, { values: mn.map((v) => tval(v, unit)), color: '#7cc4ff' }]}
        labels={t} tickLabels={t.map(fmtShort)} bars={pr} ticks={5} height={230}
        tip={(i) => <><b>{fmtShort(t[i])}</b><br />High {temp(mx[i], unit)}°, low {temp(mn[i], unit)}°<br />Rain {rain(pr[i], unit)}</>}
      />
      <dl className="stats">
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  );
}
