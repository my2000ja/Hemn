import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react';

interface MarketTickerProps {
  initialPrice?: number;
  className?: string;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  initialPrice = 4234.00,
  className = '',
}) => {
  const [price, setPrice] = useState<number>(initialPrice);
  const [prevPrice, setPrevPrice] = useState<number>(initialPrice);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [dayChange, setDayChange] = useState<number>(28.50);
  const [dayChangePercent, setDayChangePercent] = useState<number>(0.68);
  const [high, setHigh] = useState<number>(initialPrice + 18.20);
  const [low, setLow] = useState<number>(initialPrice - 14.50);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((currentPrice) => {
        // Small realistic micro-fluctuation between -0.45 and +0.45
        const delta = (Math.random() - 0.49) * 0.70;
        const newPrice = Math.max(3000, Number((currentPrice + delta).toFixed(2)));

        setPrevPrice(currentPrice);
        if (newPrice > currentPrice) {
          setDirection('up');
        } else if (newPrice < currentPrice) {
          setDirection('down');
        }

        // Clear existing flash timer
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          setDirection('neutral');
        }, 800);

        // Update High/Low
        setHigh((prev) => Math.max(prev, newPrice));
        setLow((prev) => Math.min(prev, newPrice));

        // Update 24h change
        const openPrice = 4205.50;
        const change = newPrice - openPrice;
        setDayChange(Number(change.toFixed(2)));
        setDayChangePercent(Number(((change / openPrice) * 100).toFixed(2)));

        return newPrice;
      });
    }, 2200);

    return () => {
      clearInterval(interval);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const isUp = dayChange >= 0;
  const spread = 0.30;
  const bidPrice = (price - spread / 2).toFixed(2);
  const askPrice = (price + spread / 2).toFixed(2);

  return (
    <div
      className={`w-full bg-[#0d121d] border-b border-zinc-800/80 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md select-none transition-colors duration-300 ${
        direction === 'up'
          ? 'bg-emerald-950/20'
          : direction === 'down'
          ? 'bg-rose-950/20'
          : ''
      } ${className}`}
      id="gold-market-ticker"
    >
      {/* Left: Asset info & symbol badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold shadow-sm">
            <span>✨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-white text-sm tracking-wide">
                XAU / USD
              </span>
              <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                زێڕ (GOLD)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block font-sans">
              بازاڕی جیهانی زێڕ بەرامبەر دۆلار
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Live Price & Fluctuation */}
      <div className="flex items-center gap-4 bg-[#121824] px-3.5 py-1.5 rounded-xl border border-zinc-800/90 font-mono">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-zinc-500 font-sans font-bold">نرخی لایڤ:</span>
          <span
            className={`text-base sm:text-lg font-black transition-colors duration-300 ${
              direction === 'up'
                ? 'text-emerald-400 scale-105'
                : direction === 'down'
                ? 'text-rose-400 scale-105'
                : 'text-amber-400'
            }`}
          >
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Day Change Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-black ${
            isUp
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          {isUp ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {isUp ? '+' : ''}${dayChange.toFixed(2)} ({isUp ? '+' : ''}
            {dayChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Right: Market stats (Bid/Ask, High/Low, Live status) */}
      <div className="flex items-center gap-3 sm:gap-5 text-[11px] font-mono text-zinc-300">
        <div className="hidden md:flex items-center gap-3 border-r border-zinc-800 pr-4">
          <div>
            <span className="text-[9px] text-zinc-500 block">کڕین (Bid):</span>
            <span className="font-bold text-emerald-400">${bidPrice}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">فرۆشتن (Ask):</span>
            <span className="font-bold text-rose-400">${askPrice}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 border-r border-zinc-800 pr-4">
          <div>
            <span className="text-[9px] text-zinc-500 block">بەرزترین (High):</span>
            <span className="font-bold text-zinc-200">${high.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">نزمترین (Low):</span>
            <span className="font-bold text-zinc-200">${low.toFixed(2)}</span>
          </div>
        </div>

        {/* Live Market Indicator */}
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-emerald-400 text-[10px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wider">MARKET LIVE</span>
        </div>
      </div>
    </div>
  );
};
