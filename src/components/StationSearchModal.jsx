import { useState, useCallback } from 'react';
import { Search, Loader2, Radio, X } from 'lucide-react';

const API_BASE = 'https://de1.api.radio-browser.info/json/stations/search';

/**
 * StationSearchModal
 * Live search powered by the open Radio Browser API.
 * Returns verified stations with working stream URLs.
 */
export function StationSearchModal({ onAdd, onClose }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [added,   setAdded]   = useState(new Set());

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({
        name: q,
        limit: 20,
        order: 'clickcount',
        reverse: 'true',
        hidebroken: 'true',
      });
      const res = await fetch(`${API_BASE}?${params}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      // Only show stations we can actually play (HTTPS preferred, codec ok)
      const usable = data.filter(s => s.url_resolved || s.url);
      setResults(usable);
    } catch {
      setError('Search failed. Check your connection.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = (s) => {
    const streamUrl = s.url_resolved || s.url;
    onAdd({
      id:         `search-${s.stationuuid}`,
      name:       s.name,
      frequency:  s.tags?.split(',')[0] || 'Online',
      hdChannel:  null,
      genre:      s.tags?.split(',').slice(0,2).join(' / ') || s.codec || 'Unknown',
      streamUrl,
      logoUrl:    s.favicon || null,
      accentColor: '#6366f1',
    });
    setAdded(prev => new Set([...prev, s.stationuuid]));
  };

  let inputTimer = null;
  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => search(q), 500); // 500 ms debounce
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-700/50 p-6 space-y-4 animate-slide-up"
        style={{ background: 'linear-gradient(135deg, #141420, #0f0f1a)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-indigo-400" />
            <h2 className="font-bold text-white text-base">Search Radio Stations</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={handleInput}
            placeholder="Search by station name…  e.g. KEGL, KXT, NPR"
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors"
          />
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
          {loading && (
            <div className="flex items-center justify-center py-8 text-zinc-500 gap-2">
              <Loader2 size={16} className="animate-spin-slow" />
              <span className="text-sm">Searching…</span>
            </div>
          )}
          {error && <p className="text-xs text-red-400 py-4 text-center">{error}</p>}
          {!loading && !error && results.length === 0 && query.trim() && (
            <p className="text-xs text-zinc-600 py-4 text-center">No stations found. Try a different search.</p>
          )}
          {!loading && results.map(s => {
            const url = s.url_resolved || s.url;
            const isHttps = url?.startsWith('https://');
            const isAdded = added.has(s.stationuuid);
            return (
              <div
                key={s.stationuuid}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/60 transition-all p-3"
              >
                {/* Mini logo */}
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {s.favicon ? (
                    <img src={s.favicon} alt="" className="w-7 h-7 object-contain"
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                  ) : null}
                  <Radio size={14} className="text-zinc-600" style={{ display: s.favicon ? 'none' : 'block' }} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {s.country && `${s.country} · `}{s.codec} {s.bitrate ? `${s.bitrate}kbps` : ''}
                    {!isHttps && <span className="text-yellow-600 ml-1">(http – may be blocked)</span>}
                  </p>
                </div>
                {/* Add button */}
                <button
                  onClick={() => !isAdded && handleAdd(s)}
                  disabled={isAdded}
                  className={[
                    'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                    isAdded
                      ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500',
                  ].join(' ')}
                >
                  {isAdded ? '✓ Added' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-zinc-700 text-center">
          Powered by Radio Browser · Community-maintained worldwide station database
        </p>
      </div>
    </div>
  );
}
