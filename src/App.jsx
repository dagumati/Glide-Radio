import { useState, useMemo, useEffect } from 'react';
import { Radio, Wifi, WifiOff, Star, Plus, Search, MapPin, Sliders, Info } from 'lucide-react';

import { cities, stationsByCity } from './stations';
import { useAudioPlayer } from './useAudioPlayer';
import { useFavorites } from './useFavorites';

import { StationCard } from './components/StationCard';
import { BottomPlayer } from './components/BottomPlayer';
import { CustomTunerModal } from './components/CustomTunerModal';
import { StationSearchModal } from './components/StationSearchModal';

const TABS = [
  { id: 'city', label: 'Stations', Icon: Radio },
  { id: 'favorites', label: 'Favourites', Icon: Star },
  { id: 'custom', label: 'My Stations', Icon: Sliders },
];

export default function App() {
  const audio = useAudioPlayer();
  const favs = useFavorites();

  const [activeTab, setActiveTab] = useState('city');
  const [cityId, setCityId] = useState('dfw');

  // Storage for custom stations (separate from hardcoded presets)
  const [customStations, setCustomStations] = useState(() => {
    const raw = localStorage.getItem('teslaRadio_custom');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem('teslaRadio_custom', JSON.stringify(customStations));
  }, [customStations]);

  // Modal tracking
  const [showTuner, setShowTuner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editStation, setEditStation] = useState(null);

  const [showCityPanel, setShowCityPanel] = useState(false);

  const cityStations = useMemo(() => stationsByCity[cityId] ?? [], [cityId]);
  const currentCity = cities.find(c => c.id === cityId);

  const addCustomStation = (station) => {
    // If we're updating an existing one (same ID or editing a preset)
    setCustomStations(prev => {
      const filtered = prev.filter(s => s.id !== station.id);
      return [station, ...filtered];
    });
    setActiveTab('custom');
  };

  const removeCustomStation = (id) => {
    setCustomStations(prev => prev.filter(s => s.id !== id));
  };

  const handleEdit = (station) => {
    setEditStation(station);
    setShowTuner(true);
  };

  const displayStations =
    activeTab === 'favorites' ? favs.favorites :
      activeTab === 'custom' ? customStations :
        cityStations;

  return (
    <div id="app-root" className="flex flex-col min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, #1a0a0a 0%, #0a0a0f 60%, #07070e 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header id="app-header" className="sticky top-0 z-40 px-4 pt-3 pb-0"
        style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Radio size={16} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-none uppercase tracking-tight">Glide Radio</h1>
              <p className="text-[10px] text-zinc-600 font-bold leading-none mt-0.5 uppercase tracking-tighter">
                {activeTab === 'city' ? `${currentCity?.name} Dashboard` : `${TABS.find(t => t.id === activeTab)?.label} View`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {audio.playbackState === 'error' && (
              <span className="flex items-center gap-1 bg-red-950/60 border border-red-800/40 text-red-500 text-[10px] font-black px-2 py-1 rounded-lg animate-fade-in uppercase">
                <WifiOff size={10} />Error
              </span>
            )}

            {activeTab === 'city' && (
              <button
                onClick={() => setShowCityPanel(p => !p)}
                className="flex items-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 text-zinc-300 text-xs px-3 py-1.5 rounded-full transition-all font-bold"
              >
                <MapPin size={11} />
                <span>{currentCity?.emoji} {currentCity?.name}</span>
              </button>
            )}

            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1.5 bg-indigo-900/40 hover:bg-indigo-800/50 border border-indigo-700/30 text-indigo-400 text-xs px-3 py-1.5 rounded-full font-bold transition-all"
            >
              <Search size={11} />Search
            </button>
            <button
              onClick={() => { setEditStation(null); setShowTuner(true); }}
              className="flex items-center gap-1.5 bg-red-900/30 hover:bg-red-800/40 border border-red-800/20 text-red-400 text-xs px-3 py-1.5 rounded-full font-bold transition-all"
            >
              <Plus size={11} />Custom
            </button>
          </div>
        </div>

        {/* City panel slide-down */}
        {showCityPanel && (
          <div className="pb-3 animate-fade-in border-t border-zinc-800/50 pt-3 mt-1">
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => { setCityId(city.id); setShowCityPanel(false); }}
                  className={[
                    'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all font-bold',
                    city.id === cityId
                      ? 'bg-red-600/20 border-red-500/50 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-200',
                  ].join(' ')}
                >
                  {city.emoji} {city.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1" role="tablist">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-t-xl transition-all relative',
                activeTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              <Icon size={12} />
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 pb-28">

        {activeTab === 'favorites' && favs.favorites.length > 0 && (
          <div className="mb-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-4 py-2 flex items-center gap-2 text-indigo-400">
            <Info size={14} />
            <p className="text-[10px] font-bold uppercase tracking-tight">
              Person Persistence: These are stored in your car's local storage. Each browser has its own list.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {displayStations.map(station => (
            <div key={station.id} className="animate-fade-in relative">
              {activeTab === 'custom' && (
                <button
                  onClick={() => removeCustomStation(station.id)}
                  className="absolute -top-1.5 -right-1.5 z-30 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-red-900 hover:text-white text-[10px] flex items-center justify-center transition-all shadow-lg"
                >×</button>
              )}
              <StationCard
                station={station}
                isActive={audio.currentStation?.id === station.id}
                playbackState={audio.currentStation?.id === station.id ? audio.playbackState : 'idle'}
                onSelect={audio.playStation}
                onFavorite={favs.toggleFavorite}
                isFav={favs.isFavorite(station.id)}
                onEdit={handleEdit}
              />
            </div>
          ))}
        </div>

        {displayStations.length === 0 && (
          <div className="mt-20 flex flex-col items-center gap-4 text-center opacity-40">
            <Radio size={40} />
            <p className="text-sm font-bold uppercase tracking-widest">No stations found</p>
          </div>
        )}
      </main>

      <BottomPlayer
        currentStation={audio.currentStation}
        playbackState={audio.playbackState}
        volume={audio.volume}
        onTogglePlay={audio.togglePlay}
        onVolumeChange={audio.setVolume}
      />

      {showTuner && (
        <CustomTunerModal
          onAdd={addCustomStation}
          onClose={() => { setShowTuner(false); setEditStation(null); }}
          initialData={editStation}
        />
      )}
      {showSearch && <StationSearchModal onAdd={addCustomStation} onClose={() => setShowSearch(false)} />}
    </div>
  );
}
