import { Radio, Loader2, Star, Edit2 } from 'lucide-react';
import { EqualizerBars } from './EqualizerBars';

const GENRE_ICONS = {
  'News / Talk':        '📰',
  'NPR / Public Radio': '📡',
  'Classical':          '🎻',
  'Independent Music':  '🎸',
  'Country':            '🤠',
  'Rock':               '⚡',
  'Classic Hits':       '🎵',
  'Top 40':             '🔥',
  'Jazz':               '🎷',
  'Bollywood / Desi':   '🎭',
  'Desi Talk / Music':  '🍛',
  'Punjabi':            '🪘',
  'Community / Talk':   '🗣️',
};

/**
 * StationCard – large touch-friendly Tesla card.
 */
export function StationCard({ station, isActive, playbackState, onSelect, onFavorite, isFav, onEdit, carMode = false, triggerHaptic = () => {} }) {
  const isPlaying  = isActive && playbackState === 'playing';
  const isLoading  = isActive && playbackState === 'loading';
  const hasError   = isActive && playbackState === 'error';
  const noUrl      = !station.streamUrl;
  const emoji      = GENRE_ICONS[station.genre] ?? '📻';
  const accent     = station.accentColor ?? '#dc2626';

  const handleSelect = () => {
    if (!noUrl) {
      triggerHaptic(15);
      onSelect(station);
    }
  };

  const handleFavClick = (e) => {
    e.stopPropagation();
    triggerHaptic(20);
    onFavorite(station);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    triggerHaptic(20);
    onEdit(station);
  };

  return (
    <button
      id={`station-card-${station.id}`}
      aria-label={`Play ${station.name}`}
      aria-pressed={isActive}
      onClick={handleSelect}
      className={[
        'group relative flex flex-col items-center justify-center gap-2.5',
        'w-full rounded-2xl border-2 transition-all duration-300 outline-none select-none',
        carMode ? 'min-h-[200px] px-4 py-6 md:min-h-[220px]' : 'min-h-[170px] px-3 py-4',
        'focus-visible:ring-2 focus-visible:ring-white/40',
        noUrl
          ? 'border-zinc-800 bg-zinc-900/40 cursor-default opacity-60'
          : isActive
            ? 'card-active bg-zinc-800/90 cursor-pointer scale-[1.02]'
            : 'border-zinc-700/50 bg-zinc-900/70 hover:bg-zinc-800/80 hover:border-zinc-500 hover:scale-[1.02] cursor-pointer',
      ].join(' ')}
      style={isActive && !noUrl ? { borderColor: accent } : {}}
    >
      {/* Radial glow when active */}
      {isActive && !noUrl && (
        <span className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 30%, ${accent} 0%, transparent 70%)` }} />
      )}

      {/* Toolbar (Fav + Edit) */}
      <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEditClick}
          className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Edit station URL"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={handleFavClick}
          className={[
            'p-1.5 rounded-lg bg-zinc-800/80 transition-colors',
            isFav ? 'text-yellow-400' : 'text-zinc-400 hover:text-yellow-400 hover:bg-zinc-700'
          ].join(' ')}
          title={isFav ? 'Unfavourite' : 'Favourite'}
        >
          <Star size={12} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* HD badge */}
      {station.hdChannel && (
        <span className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white/10 text-white border border-white/20 uppercase tracking-tighter">
          {station.hdChannel}
        </span>
      )}

      {/* Logo / emoji */}
      <div
        className={[
          'relative flex items-center justify-center text-2xl transition-transform duration-300',
          carMode ? 'w-18 h-18 md:w-20 md:h-20 rounded-2xl' : 'w-14 h-14 rounded-xl',
          isActive && !noUrl ? 'scale-110' : '',
        ].join(' ')}
        style={{
          background: isActive && !noUrl
            ? `linear-gradient(135deg, ${accent}33, ${accent}11)`
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isActive && !noUrl ? accent + '44' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        {station.logoUrl
          ? <img src={station.logoUrl} alt={station.name} className="w-10 h-10 object-contain rounded-lg" />
          : <span role="img">{emoji}</span>}
      </div>

      {/* Info */}
      <div className="text-center space-y-1 z-10 w-full px-1">
        <p className={[
          'font-bold leading-tight text-white line-clamp-2',
          carMode ? 'text-xs md:text-sm' : 'text-[11px]'
        ].join(' ')}>{station.name}</p>
        <p className={[
          'text-zinc-400 font-medium',
          carMode ? 'text-[11px] md:text-xs' : 'text-[10px]'
        ].join(' ')}>{station.frequency}</p>
        <p className={[
          'text-zinc-500 line-clamp-1 italic',
          carMode ? 'text-[10px] md:text-[11px]' : 'text-[9px]'
        ].join(' ')}>{station.genre}</p>
      </div>

      {/* Status */}
      <div className="h-4 flex items-center justify-center z-10">
        {isPlaying  && <EqualizerBars />}
        {isLoading  && (
          <div className="flex items-center gap-1 text-zinc-400">
            <Loader2 size={10} className="animate-spin-slow text-red-500" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Connecting</span>
          </div>
        )}
        {hasError   && <span className="text-[9px] text-red-500 font-bold uppercase">Stream Error</span>}
        {noUrl      && <span className="text-[9px] text-zinc-600 font-bold uppercase">Empty URL</span>}
        {!isActive && !noUrl && (
          <span className="text-[9px] text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase font-bold tracking-tighter">Listen Live</span>
        )}
      </div>
    </button>
  );
}
