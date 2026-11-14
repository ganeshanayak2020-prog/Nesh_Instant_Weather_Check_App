const range = (n) => Array.from({ length: n }, (_, i) => i);
const CLOUDS = { clear: 2, cloudy: 6, fog: 0, rain: 5, storm: 6, snow: 4 };

// Atmospheric background drawn with CSS only: no image downloads, nothing to license.
export default function Scene({ kind, isDay }) {
  const drops = kind === 'storm' ? 90 : kind === 'rain' ? 70 : 0;
  const flakes = kind === 'snow' ? 60 : 0;
  return (
    <div className={`scene ${kind} ${isDay ? 'day' : 'night'}`} aria-hidden="true">
      {kind === 'clear' && (isDay ? <div className="sun" /> : <div className="moon" />)}
      {kind === 'clear' && !isDay && range(36).map((i) => (
        <i key={i} className="star" style={{ left: `${(i * 29) % 100}%`, top: `${(i * 17) % 60}%`, animationDelay: `-${(i % 7) * 0.9}s` }} />
      ))}
      {range(CLOUDS[kind] ?? 3).map((i) => (
        <i key={i} className="cloud" style={{ top: `${4 + ((i * 13) % 40)}%`, '--s': 1 + (i % 3) * 0.45, animationDuration: `${80 + i * 19}s`, animationDelay: `-${i * 27}s` }} />
      ))}
      {kind === 'fog' && range(4).map((i) => (
        <i key={i} className="fogband" style={{ top: `${10 + i * 20}%`, animationDuration: `${50 + i * 13}s`, animationDelay: `-${i * 14}s` }} />
      ))}
      {range(drops).map((i) => (
        <i key={i} className="drop" style={{ left: `${(i * 53) % 105}%`, animationDelay: `-${((i * 37) % 100) / 50}s`, animationDuration: `${0.65 + (i % 5) * 0.12}s` }} />
      ))}
      {range(flakes).map((i) => (
        <i key={i} className="flake" style={{ left: `${(i * 47) % 100}%`, width: 3 + (i % 4), height: 3 + (i % 4), animationDelay: `-${(i * 7) % 11}s`, animationDuration: `${8 + (i % 6)}s` }} />
      ))}
      {kind === 'storm' && <div className="flash" />}
      <div className="scrim" />
    </div>
  );
}
