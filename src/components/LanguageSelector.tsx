import React from 'react';
import { useLanguage, Language } from '../utils/i18n';
import { Globe, Check } from 'lucide-react';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { lang, setLang } = useLanguage();

  const options: { id: Language; label: string; flag: string; badge: string }[] = [
    { id: 'sorani', label: 'کوردی (سۆرانی)', flag: '☀️', badge: 'CKB' },
    { id: 'badini', label: 'کوردی (بادینی)', flag: '⛰️', badge: 'KMR' },
    { id: 'en', label: 'English', flag: '🇬🇧', badge: 'ENG' }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-[#121215] border border-zinc-800 p-1 rounded-xl shadow-md">
        <Globe className="w-3.5 h-3.5 text-amber-400 mx-1" />
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLang(opt.id)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
              lang === opt.id
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>{opt.flag}</span>
            <span>{opt.badge}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#0d070b] border border-red-900/40 rounded-2xl shadow-xl">
      <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-amber-400 font-mono">
        <Globe className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>زمانی ئەپ (Language):</span>
      </div>
      <div className="flex items-center gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLang(opt.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              lang === opt.id
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-lg shadow-red-950/60 scale-105'
                : 'bg-[#181014] text-zinc-300 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span className="text-sm">{opt.flag}</span>
            <span>{opt.label}</span>
            {lang === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
};
