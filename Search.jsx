import { useEffect, useRef, useState } from 'react';
import { searchCities } from '../api';

export default function Search({ onPick }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [hi, setHi] = useState(0);
  const box = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRes([]); setMsg(''); setBusy(false); setOpen(false); return; }
    const ac = new AbortController();
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const r = await searchCities(term, ac.signal);
        setRes(r); setHi(0);
        setMsg(r.length ? '' : 'No city matches that name. Check the spelling or try a larger nearby city.');
        setOpen(true);
      } catch (e) {
        if (e.name !== 'AbortError') { setRes([]); setMsg('Search isn’t available right now. Check your connection and try again.'); setOpen(true); }
      } finally {
        if (!ac.signal.aborted) setBusy(false);
      }
    }, 300);
    return () => { clearTimeout(t); ac.abort(); };
  }, [q]);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = (r) => { onPick(r); setQ(''); setOpen(false); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, res.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' && res[hi]) pick(res[hi]);
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="search" ref={box}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      <input
        type="search" value={q} placeholder="Search any city" aria-label="Search for a city"
        role="combobox" aria-expanded={open} aria-controls="city-list" autoComplete="off"
        onChange={(e) => setQ(e.target.value)} onFocus={() => (res.length || msg) && setOpen(true)} onKeyDown={onKey}
      />
      {busy && <span className="spin" aria-label="Searching" />}
      {open && (
        <ul id="city-list" role="listbox" className="results">
          {msg && <li className="empty">{msg}</li>}
          {res.map((r, i) => (
            <li key={`${r.lat}${r.lon}`} role="option" aria-selected={i === hi} className={i === hi ? 'on' : ''} onMouseEnter={() => setHi(i)} onClick={() => pick(r)}>
              <strong>{r.name}</strong>
              <span>{[r.admin, r.country].filter(Boolean).join(', ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
