import { useState, useMemo, useEffect } from 'react';
import { Radio, Wifi, WifiOff, Star, Plus, Search, MapPin, Sliders, Info } from 'lucide-react';

import { cities, stationsByCity } from './stations';
import { useAudioPlayer } from './useAudioPlayer';
import { useFavorites } from './useFavorites';
import { useDeviceDetect } from './useDeviceDetect';

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
  const { isTesla, isMobile, isIOS, isAndroid, isDesktop, screenSize, triggerHaptic } = useDeviceDetect();

  const [activeTab, setActiveTab] = useState('city');
  const [cityId, setCityId] = useState('dfw');
  const [carMode, setCarMode] = useState(false);

  // Initialize carMode when detected as Tesla
  useEffect(() => {
    if (isTesla) {
      setCarMode(true);
    }
  }, [isTesla]);

  // Storage for custom stations (separate from hardcoded presets)
  const [customStations, setCustomStations] = useState(() => {
    const raw = localStorage.getItem('glideRadio_custom') || localStorage.getItem('teslaRadio_custom');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem('glideRadio_custom', JSON.stringify(customStations));
  }, [customStations]);

  // Modal tracking
  const [showTuner, setShowTuner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editStation, setEditStation] = useState(null);

  const [showCityPanel, setShowCityPanel] = useState(false);

  const cityStations = useMemo(() => stationsByCity[cityId] ?? [], [cityId]);
  const currentCity = cities.find(c => c.id === cityId);

  const addCustomStation = (station) => {
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

  // Next / Prev stations for Media Session Controls
  useEffect(() => {
    if ('mediaSession' in navigator && displayStations.length > 0 && audio.currentStation) {
      const currentIndex = displayStations.findIndex(s => s.id === audio.currentStation.id);

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const prevIndex = (currentIndex - 1 + displayStations.length) % displayStations.length;
        audio.playStation(displayStations[prevIndex]);
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        const nextIndex = (currentIndex + 1) % displayStations.length;
        audio.playStation(displayStations[nextIndex]);
      });
    }
  }, [displayStations, audio]);

  // Check if we should render the split widescreen car panel layout
  const isWidescreenCar = carMode && screenSize.width >= 1024;

  if (isWidescreenCar) {
    return (
      <div id="app-root" className="flex flex-col min-h-screen bg-black"
        style={{ background: 'radial-gradient(ellipse at 10% 0%, #121216 0%, #060608 60%, #040406 100%)' }}>
        
        <div className="flex flex-1 overflow-hidden pb-[78px]">
          {/* Left Navigation Sidebar */}
          <aside className="w-72 bg-zinc-950/90 border-r border-zinc-900/80 flex flex-col justify-between shrink-0 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Branding */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.45)]">
                  <Radio size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white leading-none uppercase tracking-wider">Glide Radio</h1>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Car Dashboard UI</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { triggerHaptic(15); setShowSearch(true); }}
                  className="flex items-center justify-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 text-[10px] font-black uppercase py-2.5 rounded-xl transition-all"
                >
                  <Search size={11} />Search
                </button>
                <button
                  onClick={() => { triggerHaptic(15); setEditStation(null); setShowTuner(true); }}
                  className="flex items-center justify-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 text-[10px] font-black uppercase py-2.5 rounded-xl transition-all"
                >
                  <Plus size={11} />Custom
                </button>
              </div>

              {/* Tabs */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest px-2 mb-1">Navigation</span>
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => { triggerHaptic(10); setActiveTab(id); }}
                    className={[
                      'flex items-center gap-3 w-full px-4 py-3.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all',
                      activeTab === id
                        ? 'bg-red-600/10 border border-red-600/30 text-white shadow-[inset_0_0_8px_rgba(220,38,38,0.05)]'
                        : 'bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30',
                    ].join(' ')}
                  >
                    <Icon size={14} className={activeTab === id ? 'text-red-500' : 'text-zinc-500'} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Cities scroll list (only on city tab) */}
              {activeTab === 'city' && (
                <div className="flex flex-col gap-1.5 pt-4 border-t border-zinc-900/80">
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest px-2 mb-1 font-bold">Frequencies</span>
                  <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {cities.map(city => (
                      <button
                        key={city.id}
                        onClick={() => { triggerHaptic(10); setCityId(city.id); }}
                        className={[
                          'flex items-center justify-between text-left text-[11px] px-3.5 py-3 rounded-xl border transition-all font-bold',
                          city.id === cityId
                            ? 'bg-zinc-900 border-zinc-800 text-white shadow-sm'
                            : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20',
                        ].join(' ')}
                      >
                        <span>{city.emoji} {city.name}</span>
                        {city.id === cityId && <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Bottom Footer Options */}
            <div className="pt-4 border-t border-zinc-900/80 flex flex-col gap-2">
              <button
                onClick={() => { triggerHaptic(15); setCarMode(false); }}
                className="w-full text-center py-3 text-[9px] font-black uppercase tracking-wider bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
              >
                Exit Car Mode
              </button>
            </div>
          </aside>

          {/* Grid Panel Area */}
          <main className="flex-1 overflow-y-auto px-8 py-7">
            {activeTab === 'favorites' && favs.favorites.length > 0 && (
              <div className="mb-6 bg-indigo-950/10 border border-indigo-900/20 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-indigo-400">
                <Info size={14} />
                <p className="text-[10px] font-bold uppercase tracking-tight">
                  Personal Favourites: Saved locally to this browser.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayStations.map(station => (
                <div key={station.id} className="animate-fade-in relative">
                  {activeTab === 'custom' && (
                    <button
                      onClick={() => { triggerHaptic(20); removeCustomStation(station.id); }}
                      className="absolute -top-1.5 -right-1.5 z-30 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-red-900 hover:text-white text-xs flex items-center justify-center transition-all shadow-lg"
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
                    carMode={true}
                    triggerHaptic={triggerHaptic}
                  />
                </div>
              ))}
            </div>

            {displayStations.length === 0 && (
              <div className="mt-32 flex flex-col items-center gap-4 text-center opacity-40">
                <Radio size={48} className="text-zinc-600" />
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No stations found</p>
              </div>
            )}
          </main>
        </div>

        <BottomPlayer
          currentStation={audio.currentStation}
          playbackState={audio.playbackState}
          volume={audio.volume}
          onTogglePlay={audio.togglePlay}
          onVolumeChange={audio.setVolume}
          isIOS={isIOS}
          carMode={true}
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

  // Fallback / Responsive Mobile and standard Layout
  return (
    <div id="app-root" className="flex flex-col min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, #140b0b 0%, #08080c 60%, #05050a 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header id="app-header" className="sticky top-0 z-40 px-4 pt-3.5 pb-0"
        style={{ background: 'rgba(8,8,12,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Radio size={16} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-xs font-black text-white leading-none uppercase tracking-tight">Glide Radio</h1>
              <p className="text-[9px] text-zinc-500 font-bold leading-none mt-1 uppercase tracking-tighter">
                {activeTab === 'city' ? `${currentCity?.name} Dashboard` : `${TABS.find(t => t.id === activeTab)?.label} View`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {audio.playbackState === 'error' && (
              <span className="flex items-center gap-1 bg-red-950/60 border border-red-800/40 text-red-500 text-[9px] font-black px-2 py-1.5 rounded-lg animate-fade-in uppercase">
                <WifiOff size={10} />Error
              </span>
            )}

            {/* Car Mode Toggle Button */}
            <button
              onClick={() => { triggerHaptic(15); setCarMode(c => !c); }}
              className={[
                'flex items-center gap-1 border text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full transition-all',
                carMode
                  ? 'bg-red-600/20 border-red-500/40 text-red-400'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700/50 text-zinc-300'
              ].join(' ')}
              title={carMode ? 'Deactivate Car Layout' : 'Activate Car Layout'}
            >
              <Radio size={11} className={carMode ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
              <span>Car Mode</span>
            </button>

            {activeTab === 'city' && (
              <button
                onClick={() => { triggerHaptic(10); setShowCityPanel(p => !p); }}
                className="flex items-center gap-1 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 text-zinc-300 text-[10px] font-black uppercase px-3.5 py-1.5 rounded-full transition-all"
              >
                <MapPin size={11} />
                <span>{currentCity?.emoji} {currentCity?.name}</span>
              </button>
            )}

            <button
              onClick={() => { triggerHaptic(10); setShowSearch(true); }}
              className="flex items-center gap-1 bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-700/30 text-indigo-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all"
            >
              <Search size={11} />Search
            </button>
            
            <button
              onClick={() => { triggerHaptic(10); setEditStation(null); setShowTuner(true); }}
              className="flex items-center gap-1 bg-red-900/30 hover:bg-red-800/40 border border-red-800/20 text-red-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all"
            >
              <Plus size={11} />Custom
            </button>
          </div>
        </div>

        {/* City panel slide-down */}
        {showCityPanel && (
          <div className="pb-3.5 animate-fade-in border-t border-zinc-900 pt-3 mt-1">
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => { triggerHaptic(12); setCityId(city.id); setShowCityPanel(false); }}
                  className={[
                    'flex items-center gap-1.5 text-[10px] font-black uppercase px-3.5 py-1.5 rounded-xl border transition-all',
                    city.id === cityId
                      ? 'bg-red-600/20 border-red-500/50 text-white'
                      : 'bg-zinc-900/80 border-zinc-800/80 text-zinc-500 hover:text-zinc-200',
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
              onClick={() => { triggerHaptic(10); setActiveTab(id); }}
              className={[
                'flex items-center gap-1.5 px-4.5 py-3 text-[10px] font-black uppercase tracking-wider rounded-t-xl transition-all relative',
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
          <div className="mb-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-indigo-400">
            <Info size={14} />
            <p className="text-[10px] font-bold uppercase tracking-tight">
              Personal Favourites: Stored in your car/device's local storage.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {displayStations.map(station => (
            <div key={station.id} className="animate-fade-in relative">
              {activeTab === 'custom' && (
                <button
                  onClick={() => { triggerHaptic(20); removeCustomStation(station.id); }}
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
                carMode={carMode}
                triggerHaptic={triggerHaptic}
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
        isIOS={isIOS}
        carMode={carMode}
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
