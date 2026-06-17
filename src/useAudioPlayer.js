import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * useAudioPlayer – centralised audio engine for Glide Radio.
 *
 * Tesla constraints:
 *  • play() MUST be called from a user gesture (click/tap). Never autoplay.
 *  • Live streams have no seekable range.
 *  • Stall auto-recovery: reload src after 4 s stall.
 */
export function useAudioPlayer() {
  const audioRef = useRef(null);
  const stallTimerRef = useRef(null);

  const [currentStation, setCurrentStation] = useState(null);
  // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
  const [playbackState, setPlaybackState] = useState('idle');
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem('glideRadio_volume');
      return saved !== null ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const clearStallTimer = () => {
    if (stallTimerRef.current) { clearTimeout(stallTimerRef.current); stallTimerRef.current = null; }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;
    audioRef.current = audio;

    const onPlaying = () => { clearStallTimer(); setPlaybackState('playing'); };
    const onWaiting = () => setPlaybackState('loading');
    const onPause = () => { clearStallTimer(); setPlaybackState('paused'); };

    const onStalled = () => {
      setPlaybackState('loading');
      clearStallTimer();
      stallTimerRef.current = setTimeout(() => {
        if (audioRef.current && !audioRef.current.paused) {
          const url = audioRef.current.src;
          audioRef.current.src = '';
          audioRef.current.src = url;
          audioRef.current.volume = volume; // Sync volume on recovery
          audioRef.current.play().catch(() => setPlaybackState('error'));
        }
      }, 4000);
    };

    const onError = () => {
      clearStallTimer();
      const code = audio?.error?.code;
      const msgs = {
        1: 'Playback aborted.',
        2: 'Network error – check your connection.',
        3: 'Stream decode error.',
        4: 'Stream unsupported or blocked. Must be HTTPS.',
      };
      setErrorMessage(msgs[code] || 'Unknown stream error.');
      setPlaybackState('error');
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('stalled', onStalled);
    audio.addEventListener('error', onError);

    return () => {
      ['playing', 'waiting', 'pause', 'stalled', 'error'].forEach(e => audio.removeEventListener(e, { onPlaying, onWaiting, onPause, onStalled, onError }[`on${e.charAt(0).toUpperCase() + e.slice(1)}`]));
      audio.src = '';
      clearStallTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume changes dynamically to HTML5 Audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync Media Session API Metadata
  useEffect(() => {
    if ('mediaSession' in navigator && currentStation) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: `${currentStation.frequency} · ${currentStation.genre}`,
        album: 'Glide Radio',
        artwork: [
          {
            src: currentStation.logoUrl || '/radio-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      });
    }
  }, [currentStation]);

  // Sync Media Session API Actions and Playback State
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState =
        playbackState === 'playing' ? 'playing' :
        playbackState === 'paused' ? 'paused' : 'none';

      try {
        navigator.mediaSession.setActionHandler('play', () => {
          if (audioRef.current && currentStation) {
            audioRef.current.volume = volume;
            audioRef.current.play().catch(() => setPlaybackState('error'));
          }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        });
      } catch (err) {
        // Fallback for older browsers
      }
    }
  }, [playbackState, currentStation, volume]);

  /** Only call from a click/tap handler. */
  const playStation = useCallback((station) => {
    const audio = audioRef.current;
    if (!audio || !station?.streamUrl) return;
    setErrorMessage('');

    if (currentStation?.id === station.id) {
      if (audio.paused) {
        setPlaybackState('loading');
        audio.volume = volume;
        audio.play().catch(() => setPlaybackState('error'));
      }
      else { audio.pause(); }
      return;
    }

    audio.pause();
    audio.src = station.streamUrl;
    audio.load();
    audio.volume = volume; // Ensure volume doesn't spike on load
    setCurrentStation(station);
    setPlaybackState('loading');
    audio.play().catch(() => setPlaybackState('error'));
  }, [currentStation, volume]);

  const togglePlay = useCallback(() => {
    if (currentStation) playStation(currentStation);
  }, [currentStation, playStation]);

  const setVolume = useCallback((val) => {
    const v = Math.min(1, Math.max(0, val));
    setVolumeState(v);
    try {
      localStorage.setItem('glideRadio_volume', v.toString());
    } catch (e) {
      // ignore quota exceeded or sandboxed environment error
    }
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return { currentStation, playbackState, volume, setVolume, playStation, togglePlay, errorMessage };
}
