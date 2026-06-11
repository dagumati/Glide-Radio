/**
 * EqualizerBars – animated playing indicator.
 */
export function EqualizerBars({ className = '' }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-label="Now playing">
      {['animate-eq-bar-1','animate-eq-bar-2','animate-eq-bar-3','animate-eq-bar-4'].map((cls, i) => (
        <span key={i} className={`block w-[4px] rounded-full bg-red-500 origin-bottom ${cls}`} style={{ height: '18px' }} />
      ))}
    </div>
  );
}
