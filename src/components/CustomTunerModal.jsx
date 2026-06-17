import { useState, useEffect } from 'react';
import { X, Radio, Plus, Check } from 'lucide-react';

/**
 * CustomTunerModal
 * Lets the user paste any HTTPS stream URL and add it as a custom station.
 * Also handles editing existing presets.
 */
export function CustomTunerModal({ onAdd, onClose, initialData }) {
  const [name,   setName]   = useState(initialData?.name || '');
  const [freq,   setFreq]   = useState(initialData?.frequency || '');
  const [genre,  setGenre]  = useState(initialData?.genre || '');
  const [url,    setUrl]    = useState(initialData?.streamUrl || '');
  const [error,  setError]  = useState('');

  const accentColors = ['#e03030','#7c3aed','#0ea5e9','#d97706','#16a34a','#6366f1','#db2777','#f97316'];
  const [accent, setAccent] = useState(initialData?.accentColor || accentColors[0]);

  const validate = () => {
    if (!name.trim())  return 'Station name is required.';
    if (!url.trim())   return 'Stream URL is required.';
    if (!url.startsWith('https://')) return '⚠ URL must start with https:// (Secure stream required).';
    return '';
  };

  const handleAdd = () => {
    const err = validate();
    if (err) { setError(err); return; }
    onAdd({
      id:          initialData?.id || `custom-${Date.now()}`,
      name:        name.trim(),
      frequency:   freq.trim() || 'Custom',
      hdChannel:   initialData?.hdChannel || null,
      genre:       genre.trim() || 'Custom',
      streamUrl:   url.trim(),
      logoUrl:     initialData?.logoUrl || null,
      accentColor: accent,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 p-7 space-y-6 animate-slide-up shadow-2xl"
        style={{ background: 'linear-gradient(145deg, #1a1a2e, #0a0a0f)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500">
               <Radio size={20} />
            </div>
            <h2 className="font-black text-white text-lg uppercase tracking-tight">
              {initialData ? 'Edit Station' : 'Custom Tuner'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <InputRow label="Station Name" value={name} onChange={setName} placeholder="e.g. WBAP 93.3" />
          <div className="grid grid-cols-2 gap-4">
             <InputRow label="Frequency" value={freq} onChange={setFreq} placeholder="93.3 FM" />
             <InputRow label="Genre" value={genre} onChange={setGenre} placeholder="Alternative" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Stream URL (HTTPS Only)</label>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Secure HTTPS Stream</span>
            </div>
            <input
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); }}
              placeholder="https://..."
              className={[
                'w-full rounded-xl bg-black/40 border px-4 py-3 text-xs text-white font-mono',
                'placeholder:text-zinc-700 outline-none transition-all focus:ring-2 focus:ring-white/5',
                error && error.includes('URL') ? 'border-red-900 bg-red-950/10' : 'border-white/10 focus:border-white/20',
              ].join(' ')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Accent Colour</label>
            <div className="flex gap-2.5 flex-wrap">
              {accentColors.map(c => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className="w-8 h-8 rounded-full border-4 border-transparent transition-transform hover:scale-110 relative flex items-center justify-center"
                  style={{ background: c }}
                >
                  {c === accent && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-[10px] font-black uppercase text-red-400 bg-red-900/20 border border-red-900/30 rounded-xl px-4 py-2.5 animate-fade-in">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-white/10 text-zinc-500 hover:text-white hover:bg-white/5 py-4 text-xs font-black uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-2xl flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:brightness-125 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
          >
            {initialData ? <Check size={14} /> : <Plus size={14} />}
            {initialData ? 'Save Changes' : 'Add Station'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-black/40 border border-white/10 focus:border-white/20 px-4 py-3 text-xs text-white placeholder:text-zinc-700 outline-none transition-all"
      />
    </div>
  );
}
