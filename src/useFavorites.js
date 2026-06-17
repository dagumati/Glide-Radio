import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'glideRadio_favorites';
const BACKWARD_COMPAT_KEY = 'teslaRadio_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(BACKWARD_COMPAT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); }
    catch { /* storage full */ }
  }, [favorites]);

  const toggleFavorite = useCallback((station) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === station.id);
      return exists ? prev.filter(f => f.id !== station.id) : [...prev, station];
    });
  }, []);

  const isFavorite = useCallback((stationId) => favorites.some(f => f.id === stationId), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
