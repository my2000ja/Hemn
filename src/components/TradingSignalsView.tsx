import React, { useState } from 'react';
import { TrendingUp, Lock, CheckCircle2, AlertTriangle, Shield, Copy, Star, Sparkles, Filter } from 'lucide-react';
import { TradingSignal, User } from '../types';

interface TradingSignalsViewProps {
  signals: TradingSignal[];
  user: User | null;
  onRequestBuyMonthly: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TradingSignalsView: React.FC<TradingSignalsViewProps> = ({
  signals,
  user,
  onRequestBuyMonthly,
  showToast
}) => {
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'FOREX' | 'CRYPTO' | 'VIP'>('ALL');

  const filteredSignals = signals.filter((sig) => {
    if (filter === 'FREE') return !sig.isVip;
    if (filter === 'VIP') return sig.isVip;
    if (filter === 'FOREX') return sig.pair.includes('XAU') || sig.pair.includes('EUR') || sig.pair.includes('GBP') || sig.pair.includes('USD') || sig.pair.includes('OIL');
    if (filter === 'CRYPTO') return sig.pair.includes('BTC') || sig.pair.includes('ETH') || sig.pair.includes('USDT');
    return true;
  });

  const handleCopySignal = (sig: TradingSignal) => {
    const text = `📊 **سیگناڵی Kurd Signal**\nزۆج: ${sig.pair}\nجۆر: ${sig.type}\nچوونەژوورەوە: ${sig.entry}\nTake Profit 1: ${sig.tp1}\nTake Profit 2: ${sig.tp2}\nStop Loss: ${sig.sl}`;
    navigator.clipboard.writeText(text);
    showToast('سیگناڵەکە کۆپی کرا بۆ کیبۆرد!', 'success');
  };

  const statusBadges = {
    ACTIVE: { label: '🔥 چالاک', class: 'bg-emerald-500/10 text-emerald-400 border-[#27272a]' },
    HIT_TP1: { label: '🎯 پێکا TP1', class: 'bg-teal-500/10 text-teal-300 border-[#27272a]' },
    HIT_TP2: { label: '🎯 پێکا TP2', class: 'bg-indigo-500/10 text-indigo-300 border-[#27272a]' },
    HIT_TP3: { label: '🚀 پێکا TP3', class: 'bg-amber-500/10 text-amber-300 border-[#27272a]' },
    STOP_LOSS: { label: '⚠️ ستۆپ لۆس', class: 'bg-rose-500/10 text-rose-400 border-[#27272a]' },
    CLOSED: { label: 'بەستراوە', class: 'bg-[#18181b] text-zinc-500 border-[#27272a]' },
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 text-right">
      {/* Title & Filter bar */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                سیگناڵە ڕاستەوخۆکانی بازرگانی (Live Trading Signals)
              </h2>
              <p className="text-xs text-zinc-400">
                ڕاگەیاندنی ڕۆژانەی زێڕ، فۆرێکس، بیتکۆین و نەوت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-lg border border-[#27272a] text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2 py-1 rounded font-mono font-bold text-xs transition-all ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              هەمووی
            </button>
            <button
              onClick={() => setFilter('FREE')}
              className={`px-2 py-1 rounded font-mono font-bold text-xs transition-all ${
                filter === 'FREE'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              🎁 بەشی فریی (Free)
            </button>
            <button
              onClick={() => setFilter('FOREX')}
              className={`px-2 py-1 rounded font-mono font-bold text-xs transition-all ${
                filter === 'FOREX'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              فۆرێکس و زێڕ
            </button>
            <button
              onClick={() => setFilter('CRYPTO')}
              className={`px-2 py-1 rounded font-mono font-bold text-xs transition-all ${
                filter === 'CRYPTO'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              کریپتۆ
            </button>
            <button
              onClick={() => setFilter('VIP')}
              className={`px-2 py-1 rounded font-mono font-bold text-xs transition-all ${
                filter === 'VIP'
                  ? 'bg-amber-500 text-zinc-950'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              VIP ⭐
            </button>
          </div>
        </div>

        {/* Free Banner */}
        {filter === 'FREE' && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-mono">
            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
            <div>
              <strong className="block text-emerald-200 font-bold">🎁 سیگناڵە سەرپشکی و فرییەکان (Free Signals)</strong>
              <span>ئەم سیگناڵانە بەخۆڕایین بۆ سەرجەم ئەندامان بەبێ هیچ تێچوویەک.</span>
            </div>
          </div>
        )}

        {/* Signals List */}
        <div className="space-y-3">
          {filteredSignals.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs font-mono">
              هیچ سیگناڵێک لەم جۆرە نەدۆزرایەوە.
            </div>
          ) : (
            filteredSignals.map((sig) => {
              const isLocked = sig.isVip && (!user || !user.monthly);
              const statusInfo = statusBadges[sig.status] || statusBadges.CLOSED;

              return (
                <div
                  key={sig.id}
                  className={`bg-[#09090b] border rounded-xl p-4 relative transition-all ${
                    sig.isVip
                      ? 'border-indigo-500/40 shadow'
                      : 'border-[#27272a]'
                  }`}
                >
                  {/* Lock Blur Layer for Non-VIP Users */}
                  {isLocked && (
                    <div className="absolute inset-0 z-20 bg-[#09090b]/95 backdrop-blur-md rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-indigo-500/50">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400">
                        <Lock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100">
                          سیگناڵی تایبەت بۆ ئەندامانی VIP
                        </h4>
                        <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
                          بۆ بینینی پارامیتەرەکانی ئەم سیگناڵە، پلانی مانگانە چالاک بکە.
                        </p>
                      </div>
                      <button
                        onClick={onRequestBuyMonthly}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs shadow flex items-center gap-2"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>چالاککردنی پلانی مانگانەی VIP (150$ دۆلار)</span>
                      </button>
                    </div>
                  )}

                  {/* Top Bar: Pair Name & Type Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-100 text-sm">
                        {sig.pair}
                      </span>
                      {sig.isVip && (
                        <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>VIP</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                          sig.type === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {sig.type === 'BUY' ? '🟢 BUY' : '🔴 SELL'}
                      </span>

                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${statusInfo.class}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Signal Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3 bg-[#121215] p-3 rounded-lg border border-[#27272a]">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">چوونەژوورەوە</span>
                      <span className="font-mono font-bold text-amber-400">{sig.entry}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">ئامانجی یەکەم (TP1)</span>
                      <span className="font-mono font-bold text-emerald-400">{sig.tp1}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">ئامانجی دووەم (TP2)</span>
                      <span className="font-mono font-bold text-emerald-400">{sig.tp2}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">ستۆپ لۆس (SL)</span>
                      <span className="font-mono font-bold text-rose-400">{sig.sl}</span>
                    </div>
                  </div>

                  {/* Notes & Win Rate */}
                  {sig.notes && (
                    <p className="text-xs text-zinc-300 bg-[#121215] p-2.5 rounded-lg border border-[#27272a] mb-3 leading-relaxed">
                      💡 {sig.notes}
                    </p>
                  )}

                  {/* Footer Bar */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[#27272a]">
                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      <span>ڕێژەی سەرکەوتن: <strong className="text-emerald-400">{sig.winRate}</strong></span>
                      <span>کاتی بڵاوکردنەوە: {sig.createdAt}</span>
                    </div>

                    <button
                      onClick={() => handleCopySignal(sig)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition-colors text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>کۆپیکردن</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
