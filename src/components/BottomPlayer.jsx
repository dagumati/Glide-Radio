import { Play, Pause, Volume2, VolumeX, Loader2, Radio } from 'lucide-react';
import { EqualizerBars } from './EqualizerBars';

export function BottomPlayer({ currentStation, playbackState, volume, onTogglePlay, onVolumeChange, isIOS = false, carMode = false }) {
  const isPlaying  = playbackState === 'playing';
  const isLoading  = playbackState === 'loading';
  const isMuted    = volume === 0;
  const hasStation = currentStation !== null;
  const accent     = currentStation?.accentColor ?? '#dc2626';

  const handleVolumeInput = (e) => {
    const val = parseFloat(e.target.value);
    e.target.style.setProperty('--vol-pct', `${val * 100}%`);
    onVolumeChange(val);
  };

  return (
    <footer
      id="bottom-player"
      className={[
        'fixed bottom-0 left-0 right-0 z-50 animate-slide-up transition-all duration-300',
        carMode ? 'border-t-2 border-zinc-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]' : 'border-t border-white/5 shadow-2xl'
      ].join(' ')}
      style={{
        background: carMode
          ? 'linear-gradient(to top, #0a0a0c 0%, #121214 100%)'
          : 'linear-gradient(to top, rgba(8,8,14,0.99) 60%, rgba(8,8,14,0.85) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Station-colored top accent line */}
      <div className="h-[2px] w-full transition-all duration-500"
        style={{ background: hasStation ? `linear-gradient(90deg, transparent, ${accent}, transparent)` : 'transparent' }} />

      <div className="max-w-screen-2xl mx-auto px-5 py-3 flex items-center justify-between gap-5">
        {/* Station info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {hasStation ? (
            <>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 transition-all duration-500"
                style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                {currentStation.logoUrl
                  ? <img src={currentStation.logoUrl} alt={currentStation.name} className="w-7 h-7 object-contain rounded-md" />
                  : <Radio size={16} style={{ color: accent }} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-white truncate">{currentStation.name}</p>
                  {isPlaying && <EqualizerBars className="shrink-0" />}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  {playbackState === 'loading' ? 'Connecting…'
                    : playbackState === 'error'   ? '⚠ Stream error'
                    : playbackState === 'paused'  ? 'Paused'
                    : `${currentStation.frequency} · ${currentStation.genre}`}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-zinc-600">
              <Radio size={18} />
              <p className="text-sm">Select a station to begin</p>
            </div>
          )}
        </div>

        {/* Play/Pause */}
        <button
          id="play-pause-btn"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={onTogglePlay}
          disabled={!hasStation}
          className={[
            'relative w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0',
            'border-2 transition-all duration-200 outline-none',
            'focus-visible:ring-2 focus-visible:ring-white/40',
            hasStation
              ? carMode
                ? 'hover:brightness-110 active:scale-95 cursor-pointer'
                : 'hover:scale-110 hover:brightness-110 active:scale-95 cursor-pointer'
              : 'opacity-30 cursor-not-allowed',
          ].join(' ')}
          style={{
            background: hasStation
              ? carMode
                ? accent
                : `linear-gradient(135deg, ${accent}, ${accent}aa)`
              : '#27272a',
            borderColor: hasStation ? accent : '#3f3f46',
            boxShadow: isPlaying && !carMode ? `0 0 18px ${accent}66` : 'none',
          }}
        >
          {isLoading ? <Loader2 size={22} className="animate-spin-slow text-white" />
            : isPlaying ? <Pause size={22} className="text-white" fill="white" />
            : <Play size={22} className="text-white translate-x-0.5" fill="white" />}
        </button>

        {/* Volume / iOS adapt */}
        {isIOS ? (
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-right shrink-0 w-36 py-1.5 border border-zinc-800 bg-zinc-900/40 rounded-xl px-2.5 flex items-center justify-center gap-1.5 select-none">
            <Volume2 size={11} className="text-zinc-500" />
            <span>Use iOS Buttons</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-36 shrink-0">
            <button
              id="mute-btn"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              onClick={() => onVolumeChange(isMuted ? 0.8 : 0)}
              className="text-zinc-400 hover:text-white transition-colors outline-none rounded"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              id="volume-slider"
              type="range" min="0" max="1" step="0.01"
              value={volume}
              onChange={handleVolumeInput}
              aria-label="Volume"
              className="flex-1"
              style={{
                '--vol-pct': `${volume * 100}%`,
                '--accent-color': accent
              }}
            />
          </div>
        )}
      </div>
    </footer>
  );
}
