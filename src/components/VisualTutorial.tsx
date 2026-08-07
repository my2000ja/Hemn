import React, { useState } from 'react';
import { useLanguage } from '../utils/i18n';
import {
  Lock,
  User as UserIcon,
  CheckCircle2,
  Dices,
  Trophy,
  CreditCard,
  Sparkles,
  Gamepad2,
  ShieldCheck,
  MousePointerClick,
  ArrowDownLeft,
  Send
} from 'lucide-react';

export const VisualTutorial: React.FC<{ compact?: boolean }> = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const { t } = useLanguage();

  return (
    <div className="w-full bg-gradient-to-b from-[#0e070c] via-[#08080d] to-[#040c08] border border-emerald-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-right">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-950/90 to-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{t.visualTutorialTitle}</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
          {t.visualTutorialSub}
        </h2>
      </div>

      {/* Interactive Step Selector Tabs (4 Tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 1
              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400 shadow-lg shadow-red-950 scale-105'
              : 'bg-[#120a0e] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center font-mono text-[11px] font-black">
            ١
          </span>
          <span>{t.step1Title}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 2
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-lg shadow-emerald-950 scale-105'
              : 'bg-[#08120d] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center font-mono text-[11px] font-black">
            ٢
          </span>
          <span>{t.deposit}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(3)}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 3
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-lg shadow-indigo-950 scale-105'
              : 'bg-[#0a0812] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center font-mono text-[11px] font-black">
            ٣
          </span>
          <span>{t.step3Title}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(4)}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 4
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-400 shadow-lg shadow-amber-950 scale-105'
              : 'bg-[#120f08] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center font-mono text-[11px] font-black">
            ٤
          </span>
          <span>{t.withdraw}</span>
        </button>
      </div>

      {/* 4 VISUAL ILLUSTRATION CARDS / DIAGRAMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DIAGRAM STEP 1: LOGIN & REGISTRATION */}
        <div
          onClick={() => setActiveTab(1)}
          className={`bg-[#0d070a] border rounded-2xl p-4 space-y-4 transition-all duration-300 relative group cursor-pointer ${
            activeTab === 1
              ? 'border-red-500 ring-2 ring-red-500/30 shadow-2xl shadow-red-950 scale-[1.02]'
              : 'border-red-950/60 hover:border-red-800 opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-red-950/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">{t.step1Title}</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/90 border border-red-800 px-2 py-0.5 rounded-full">
              STEP 1
            </span>
          </div>

          {/* VISUAL DIAGRAM GRAPHIC - MOCK LOGIN SCREEN */}
          <div className="bg-[#15090d] border border-red-900/50 rounded-xl p-3 space-y-2 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-red-900/40 pb-1.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[9px] font-mono text-zinc-400">Login Window</span>
            </div>

            <div className="space-y-1">
              <div className="text-[9px] text-zinc-400 flex items-center gap-1 font-mono">
                <UserIcon className="w-3 h-3 text-red-400" />
                <span>{t.username}:</span>
              </div>
              <div className="bg-[#090305] border border-red-800/60 rounded px-2 py-1 text-xs text-zinc-200 font-mono flex items-center justify-between">
                <span>Ali_Kurdish</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[9px] text-zinc-400 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-red-400" />
                <span>{t.password}:</span>
              </div>
              <div className="bg-[#090305] border border-red-800/60 rounded px-2 py-1 text-xs text-amber-300 font-mono tracking-widest flex items-center justify-between">
                <span>••••••••</span>
                <span className="text-[8px] text-zinc-500">PASS</span>
              </div>
            </div>

            <div className="pt-0.5">
              <div className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-1.5 rounded text-center text-[11px] shadow-md flex items-center justify-center gap-1">
                <MousePointerClick className="w-3 h-3" />
                <span>[ {t.login} ]</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t.step1Desc}
          </p>
        </div>

        {/* DIAGRAM STEP 2: MONEY DEPOSIT */}
        <div
          onClick={() => setActiveTab(2)}
          className={`bg-[#050d0a] border rounded-2xl p-4 space-y-4 transition-all duration-300 relative group cursor-pointer ${
            activeTab === 2
              ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-950 scale-[1.02]'
              : 'border-emerald-950/60 hover:border-emerald-800 opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-emerald-950/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">{t.step2Title}</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800 px-2 py-0.5 rounded-full">
              STEP 2
            </span>
          </div>

          <div className="bg-[#03140c] border border-emerald-900/50 rounded-xl p-3 space-y-2 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-1.5">
              <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3" />
                <span>FIB Deposit System</span>
              </span>
              <span className="text-[8px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 font-bold">
                {t.deposit}
              </span>
            </div>

            <div className="bg-[#020b06] border border-emerald-800/60 rounded p-1.5 space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between text-zinc-300">
                <span>FIB Account:</span>
                <span className="text-emerald-400 font-bold">07512189730</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Deposit Range:</span>
                <span className="text-amber-300 font-bold">10,000 - 50,000</span>
              </div>
            </div>

            <div className="bg-emerald-950/90 border border-emerald-700/60 p-1.5 rounded text-center text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-1">
              <Send className="w-3 h-3 text-emerald-400" />
              <span>{t.sendReceipt} ⬅️ {t.approved}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t.step2Desc}
          </p>
        </div>

        {/* DIAGRAM STEP 3: PLAY GAMES */}
        <div
          onClick={() => setActiveTab(3)}
          className={`bg-[#06070d] border rounded-2xl p-4 space-y-4 transition-all duration-300 relative group cursor-pointer ${
            activeTab === 3
              ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl shadow-indigo-950 scale-[1.02]'
              : 'border-indigo-950/60 hover:border-indigo-800 opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">{t.step3Title}</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/90 border border-indigo-800 px-2 py-0.5 rounded-full">
              STEP 3
            </span>
          </div>

          <div className="bg-[#060914] border border-indigo-900/50 rounded-xl p-3 space-y-2 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-900/40 pb-1.5">
              <span className="text-[9px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" />
                <span>Games Hub</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 font-bold">
                25,000 ↗️
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-center">
              <div className="bg-[#0b1024] border border-indigo-700/60 rounded p-1.5 space-y-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                <div className="text-[9px] font-bold text-white">{t.spinWheel}</div>
                <div className="text-[8px] text-emerald-400 font-mono">+5,000</div>
              </div>
              <div className="bg-[#0b1024] border border-indigo-700/60 rounded p-1.5 space-y-0.5">
                <Dices className="w-3.5 h-3.5 text-indigo-400 mx-auto" />
                <div className="text-[9px] font-bold text-white">{t.headOrTail}</div>
                <div className="text-[8px] text-emerald-400 font-mono">2X 🔥</div>
              </div>
            </div>

            <div className="bg-[#080d1f] p-1.5 rounded border border-indigo-800/40 flex items-center justify-between text-[9px]">
              <span className="text-zinc-300 font-bold">Trading Earnings:</span>
              <span className="text-emerald-400 font-mono font-bold">+1,500 / min</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t.step3Desc}
          </p>
        </div>

        {/* DIAGRAM STEP 4: WITHDRAWAL */}
        <div
          onClick={() => setActiveTab(4)}
          className={`bg-[#0d0c07] border rounded-2xl p-4 space-y-4 transition-all duration-300 relative group cursor-pointer ${
            activeTab === 4
              ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-2xl shadow-amber-950 scale-[1.02]'
              : 'border-amber-950/60 hover:border-amber-800 opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-amber-950/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 font-mono font-black text-xs flex items-center justify-center shadow-md">
                4
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm">{t.step4Title}</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/90 border border-amber-800 px-2 py-0.5 rounded-full">
              STEP 4
            </span>
          </div>

          <div className="bg-[#17140a] border border-amber-900/50 rounded-xl p-3 space-y-2 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-1.5">
              <span className="text-[9px] font-mono text-amber-400 font-bold flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>First Iraqi Bank (FIB)</span>
              </span>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 font-bold">
                {t.approved} ✅
              </span>
            </div>

            <div className="bg-[#0c0a05] border border-amber-800/60 rounded p-1.5 space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-zinc-300">
                <span>FIB Number:</span>
                <span className="text-amber-300 font-bold">0750xxxxxxx</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>{t.amount}:</span>
                <span className="text-emerald-400 font-black text-xs">25,000</span>
              </div>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 p-1.5 rounded text-center text-[10px] font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{t.success}!</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t.step4Desc}
          </p>
        </div>
      </div>

      {/* Summary Footer Note */}
      <div className="bg-[#09070c] border border-emerald-500/30 rounded-2xl p-3.5 text-center text-xs text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Money Online Platform - 100% Safe Deposit & Withdrawal</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          FIB Bank & Telegram Support 24/7
        </div>
      </div>
    </div>
  );
};

