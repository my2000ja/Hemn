import React, { useState } from 'react';
import { TrendingUp, Award, Zap, ShieldAlert, LogOut, Wallet, BellRing, Volume2, VolumeX } from 'lucide-react';
import { MrPocketLogo } from './MrPocketLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../utils/i18n';
import { getAudioMuted, setAudioMuted, playClickSound } from '../utils/audio';

interface HeaderProps {
  currentView: 'home' | 'history' | 'admin';
  setCurrentView: (view: 'home' | 'history' | 'admin') => void;
  userName?: string;
  balance?: number;
  isAdmin?: boolean;
  onLogout?: () => void;
  pendingCount?: number;
  onOpenAuth?: (tab: 'login' | 'register' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  userName,
  balance = 0,
  isAdmin,
  onLogout,
  pendingCount = 0,
  onOpenAuth
}) => {
  const { t } = useLanguage();
  const [muted, setMuted] = useState(() => getAudioMuted());

  const toggleAudio = () => {
    const next = !muted;
    setAudioMuted(next);
    setMuted(next);
    if (!next) {
      playClickSound();
    }
  };

  return (
    <header className="w-full max-w-2xl mx-auto mb-6 text-center space-y-3.5">
      {/* Language Switcher Bar & Sound Toggle at top of Header */}
      <div className="flex items-center justify-center gap-2">
        <LanguageSelector compact />
        <button
          onClick={toggleAudio}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
            muted
              ? 'bg-zinc-900/80 border-zinc-700/60 text-zinc-500 hover:text-zinc-300'
              : 'bg-[#1e1124]/60 border-fuchsia-500/40 text-fuchsia-400 hover:bg-[#2c1236]/60'
          }`}
          title={muted ? 'دەنگ بێدەنگ کراوە' : 'دەنگ چالاکە'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-mono">{muted ? 'OFF' : 'ON'}</span>
        </button>
      </div>

      {/* Top Engine Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#11131c] border border-[#23273a] text-fuchsia-400 text-[11px] font-mono tracking-wider uppercase">
        <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
        <Award className="w-3.5 h-3.5 text-fuchsia-400" />
        <span>mrpocket - SMART PAYMENTS & CHIPS VAULT</span>
      </div>

      {/* Main Title & Logo */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2.5">
          <MrPocketLogo size={42} />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight lowercase flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-[#ff0055] via-[#ec4899] to-[#3b82f6] bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
              mrpocket
            </span>
          </h1>
        </div>
        <p className="text-[11px] text-zinc-400 font-medium tracking-wide mt-1">
          {t.tagline}
        </p>
      </div>

      {/* Visitor Action Bar if not logged in */}
      {!userName && !isAdmin && onOpenAuth && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => onOpenAuth('register')}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-blue-950/40 border border-blue-500/30 transition-all cursor-pointer"
          >
            {t.register}
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-1.5 rounded-lg bg-[#0a1224] hover:bg-[#101e3b] text-zinc-300 hover:text-white font-bold text-xs border border-blue-900/50 transition-all cursor-pointer"
          >
            {t.login}
          </button>
          <button
            onClick={() => onOpenAuth('admin')}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-bold text-[11px] border border-emerald-500/30 transition-all cursor-pointer"
          >
            {t.admin}
          </button>
        </div>
      )}

      {/* User Status Bar if logged in */}
      {userName && !isAdmin && (
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-right">
              <div className="text-zinc-500 text-[10px] uppercase font-mono">{t.user}</div>
              <div className="font-bold text-zinc-100 text-xs sm:text-sm">{userName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs sm:text-sm">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>{balance.toLocaleString()} $</span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Admin Status Bar */}
      {isAdmin && (
        <div className="bg-[#121215] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold font-mono">PANEL: SYSTEM ADMIN</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-zinc-950 font-black px-2 py-0.5 rounded text-[10px]">
                {pendingCount} {t.requests}
              </span>
            )}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          )}
        </div>
      )}

      {/* Main View Tabs */}
      {(userName || isAdmin) && (
        <nav className="flex bg-[#121215] border border-[#27272a] p-1 rounded-xl gap-1 text-xs font-medium text-zinc-400">
          {!isAdmin && (
            <>
              <button
                onClick={() => setCurrentView('home')}
                className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentView === 'home'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'hover:bg-[#18181b] hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{t.games}</span>
              </button>

              <button
                onClick={() => setCurrentView('history')}
                className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentView === 'history'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'hover:bg-[#18181b] hover:text-zinc-200'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{t.requests}</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="w-full py-2 px-3 rounded-lg bg-amber-500 text-zinc-950 font-bold flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t.admin} (Admin Dashboard)</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

