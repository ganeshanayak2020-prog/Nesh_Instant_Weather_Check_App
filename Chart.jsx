import { useId, useRef, useState } from 'react';

// Dependency-free SVG chart: lines with soft fills, optional colour bands, optional bars, hover/touch scrubbing.
function smooth(pts) {
  if (!pts.length) return '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], m = (x0 + x1) / 2;
    d += ` C${m} ${y0} ${m} ${y1} ${x1} ${y1}`;
  }
  return d;
}

export default function Chart({ series, labels, tickLabels, bands = [], bars, nowIndex, tip, height = 210, ticks = 6 }) {
  const uid = useId().replace(/:/g, '');
  const ref = useRef(null);
  const [act, setAct] = useState(null);
  const n = labels.length;
  const vals = series.flatMap((s) => s.values).filter((v) => v != null);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (!isFinite(lo)) { lo = 0; hi = 1; }
  if (hi === lo) { hi += 1; lo -= 1; }
  const pad = (hi - lo) * 0.12;
  lo -= pad; hi += pad;
  const top = 6, bot = bars ? 70 : 94;
  const X = (i) => (n > 1 ? (i / (n - 1)) * 100 : 50);
  const Y = (v) => bot - ((v - lo) / (hi - lo)) * (bot - top);
  const bMax = bars ? Math.max(1, ...bars) : 1;
  const step = Math.max(1, Math.ceil(n / ticks));
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    setAct(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
  };
  const side = act === null ? '' : X(act) < 22 ? 'tl' : X(act) > 78 ? 'tr' : '';

  return (
    <div className="chart" style={{ height }}>
      <div className="plot" ref={ref} onPointerMove={move} onPointerDown={move} onPointerLeave={() => setAct(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Chart">
          <defs>
            {series.map((s, k) => (
              <linearGradient key={k} id={`g${uid}${k}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity=".34" />
                <stop offset="1" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {bands.map((b, k) => {
            const y1 = Y(Math.min(b.to, hi)), y2 = Y(Math.max(b.from, lo));
            return y2 > y1 ? <rect key={k} x="0" y={y1} width="100" height={y2 - y1} fill={b.color} opacity=".16" /> : null;
          })}
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2="100" y1={top + (bot - top) * f} y2={top + (bot - top) * f} className="grid-line" vectorEffect="non-scaling-stroke" />
          ))}
          {bars && bars.map((v, i) => {
            const w = (100 / n) * 0.6, h = (Math.max(0, v ?? 0) / bMax) * 24;
            return <rect key={i} x={X(i) - w / 2} y={98 - h} width={w} height={h} className="bar" rx=".4" />;
          })}
          {nowIndex != null && nowIndex >= 0 && (
            <line x1={X(nowIndex)} x2={X(nowIndex)} y1="0" y2="100" className="now-line" vectorEffect="non-scaling-stroke" />
          )}
          {series.map((s, k) => {
            const pts = s.values.map((v, i) => (v == null ? null : [X(i), Y(v)])).filter(Boolean);
            if (!pts.length) return null;
            const line = smooth(pts);
            return (
              <g key={k}>
                {s.fill !== false && <path d={`${line} L${pts[pts.length - 1][0]} ${bot} L${pts[0][0]} ${bot}Z`} fill={`url(#g${uid}${k})`} />}
                <path d={line} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>
        {act !== null && (
          <>
            <div className="scrub" style={{ left: `${X(act)}%` }} />
            {series.map((s, k) => s.values[act] != null && (
              <div key={k} className="dot" style={{ left: `${X(act)}%`, top: `${Y(s.values[act])}%`, background: s.color }} />
            ))}
            <div className={`tip ${side}`} style={{ left: `${X(act)}%` }}>{tip(act)}</div>
          </>
        )}
      </div>
      <div className="xlabels" aria-hidden="true">
        {labels.map((l, i) => i % step === 0 && (
          <span key={i} className={X(i) < 6 ? 'l' : X(i) > 94 ? 'r' : ''} style={{ left: `${X(i)}%` }}>{tickLabels ? tickLabels[i] : l}</span>
        ))}
      </div>
    </div>
  );
}
