import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAir, fetchHistory, fetchWeather, reverseGeocode } from './api';
import { wmo } from './utils';
import Scene from './components/Scene';
import Search from './components/Search';
import { Hero, Metrics } from './components/Current';
import { Hourly, Daily } from './components/Forecast';
import AirQuality from './components/AirQuality';
import History from './components/History';

const DEFAULT_PLACE = { name: 'London', admin: 'England', country: 'United Kingdom', lat: 51.5072, lon: -0.1276 };
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

function Skeleton() {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading weather">
      <div className="card skeleton s7" style={{ height: 380 }} />
      <div className="s5 metrics">{Array.from({ length: 8 }, (_, i) => <div key={i} className="card skeleton" style={{ height: 120 }} />)}</div>
      <div className="card skeleton s12" style={{ height: 300 }} />
    </div>
  );
}

export default function App() {
  const [unit, setUnit] = useState(() => store.get('unit', 'C'));
  const [place, setPlace] = useState(() => store.get('place', null));
  const [state, setState] = useState({ status: 'loading' });
  const [notice, setNotice] = useState('');
  const [locating, setLocating] = useState(false);
  const abort = useRef(null);

  useEffect(() => store.set('unit', unit), [unit]);

  const pick = useCallback((p) => { setNotice(''); setPlace(p); store.set('place', p); }, []);
  const fallback = useCallback((msg) => { setNotice(msg); setPlace((p) => p || DEFAULT_PLACE); }, []);

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) { fallback('This browser can’t share its location. Search for a city instead.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const g = await reverseGeocode(coords.latitude, coords.longitude);
        setLocating(false);
        pick({ ...g, lat: coords.latitude, lon: coords.longitude });
      },
      (err) => {
        setLocating(false);
        fallback(
          err.code === 1 ? 'Location access is blocked. Allow it in your browser’s site settings, or search for a city.'
          : err.code === 3 ? 'Finding your location took too long. Search for a city instead.'
          : 'We couldn’t work out your location. Search for a city instead.'
        );
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  }, [fallback, pick]);

  useEffect(() => { locate(); }, [locate]);

  const load = useCallback(async (p) => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setState((s) => ({ ...s, status: 'loading' }));
    const [w, a, h] = await Promise.allSettled([fetchWeather(p, ac.signal), fetchAir(p, ac.signal), fetchHistory(p, ac.signal)]);
    if (ac.signal.aborted) return;
    if (w.status === 'rejected') { setState({ status: 'error', error: w.reason?.message || 'Something went wrong.' }); return; }
    setState({ status: 'ready', w: w.value, air: a.value ?? null, hist: h.value ?? null });
  }, []);

  useEffect(() => { if (place) load(place); }, [place, load]);

  const { w } = state;
  const info = w ? wmo(w.current.weather_code, w.current.is_day) : null;

  return (
    <>
      <Scene kind={info?.kind ?? 'cloudy'} isDay={w ? !!w.current.is_day : true} />
      <div className="app">
        <header className="top">
          <div className="brand"><span aria-hidden="true">🌤️</span> Skycast</div>
          <Search onPick={pick} />
          <button className="btn" onClick={locate} disabled={locating} title="Use my current location">
            {locating ? 'Locating…' : 'My location'}
          </button>
          <div className="seg" role="group" aria-label="Temperature unit">
            {['C', 'F'].map((u) => (
              <button key={u} aria-pressed={unit === u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>°{u}</button>
            ))}
          </div>
        </header>

        {notice && <p className="notice" role="status">{notice}</p>}

        <main>
          {state.status === 'error' ? (
            <div className="card errorcard" role="alert">
              <h2>We couldn’t load the forecast</h2>
              <p>{state.error}</p>
              <div className="row">
                <button className="btn primary" onClick={() => place && load(place)}>Try again</button>
                <button className="btn" onClick={locate}>Use my location</button>
              </div>
            </div>
          ) : !w ? (
            <>
              <Skeleton />
              {!place && <p className="muted center">Waiting for your location. You can also search for a city above.</p>}
            </>
          ) : (
            <div className={`grid ${state.status === 'loading' ? 'dim' : ''}`} key={`${place.lat},${place.lon}`}>
              <div className="s7"><Hero w={w} place={place} unit={unit} /></div>
              <div className="s5"><Metrics w={w} unit={unit} /></div>
              <div className="s12"><Hourly w={w} unit={unit} /></div>
              <div className="s5"><Daily w={w} unit={unit} /></div>
              <div className="s7"><History hist={state.hist} unit={unit} /></div>
              <div className="s12"><AirQuality air={state.air} /></div>
            </div>
          )}
        </main>

        <footer>
          Weather, air quality and history data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a> (CC BY 4.0).
          Place names from <a href="https://www.bigdatacloud.com/" target="_blank" rel="noreferrer">BigDataCloud</a>.
        </footer>
      </div>
    </>
  );
}
