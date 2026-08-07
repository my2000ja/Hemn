import React, { useState, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  X,
  Activity,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Plus,
  Layers,
  Crosshair,
  Sliders,
  ChevronDown
} from 'lucide-react';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ActiveTrade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  amount: number;
  lotSize: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: string;
  accountType?: 'real' | 'demo';
}

export interface MarketChartProps {
  candles: Candle[];
  activeTrades: ActiveTrade[];
  selectedPair: string;
  currentPrice?: number;
  chartType?: 'candles' | 'line';
  timeframe?: string;
  candleTimerSeconds?: number;
  height?: number;
  onCloseTrade?: (tradeId: string) => void;
  onToggleChartType?: () => void;
  onSelectTimeframe?: (tf: '1m' | '5m' | '15m' | '1h' | '4h' | 'D') => void;
}

// Custom Candlestick shape component for Recharts Bar
const CandlestickShape = (props: any) => {
  const { x, width, payload, minVal, maxVal, chartHeight = 250, yAxis } = props;
  if (!payload) return null;

  const { open, close, high, low, isBullish } = payload;

  let yOpen: number | undefined;
  let yClose: number | undefined;
  let yHigh: number | undefined;
  let yLow: number | undefined;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      yOpen = yAxis.scale(open);
      yClose = yAxis.scale(close);
      yHigh = yAxis.scale(high);
      yLow = yAxis.scale(low);
    } catch {
      // fallback
    }
  }

  if (
    typeof yOpen !== 'number' || isNaN(yOpen) ||
    typeof yClose !== 'number' || isNaN(yClose) ||
    typeof yHigh !== 'number' || isNaN(yHigh) ||
    typeof yLow !== 'number' || isNaN(yLow)
  ) {
    const minD = minVal !== undefined ? minVal : 2300;
    const maxD = maxVal !== undefined ? maxVal : 2360;
    const range = maxD - minD || 1;
    const topMargin = 12;
    const bottomMargin = 20;
    const plotHeight = Math.max(chartHeight - topMargin - bottomMargin, 50);

    const calcY = (val: number) => {
      const norm = (val - minD) / range;
      const clamped = Math.max(-0.2, Math.min(1.2, norm));
      return topMargin + plotHeight * (1 - clamped);
    };

    yOpen = calcY(open);
    yClose = calcY(close);
    yHigh = calcY(high);
    yLow = calcY(low);
  }

  const candleWidth = Math.max(Math.min(width * 0.68, 18), 3);
  const candleX = x + (width - candleWidth) / 2;
  const candleY = Math.min(yOpen, yClose);
  const candleHeight = Math.max(Math.abs(yOpen - yClose), 2);

  const color = isBullish ? '#00b050' : '#ff3b30'; // MT5 Green for Bullish, MT5 Red for Bearish

  return (
    <g className="candlestick-item">
      {/* High to Low Wick */}
      <line
        x1={x + width / 2}
        y1={yHigh}
        x2={x + width / 2}
        y2={yLow}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Open to Close Body */}
      <rect
        x={candleX}
        y={candleY}
        width={candleWidth}
        height={candleHeight}
        fill={color}
        stroke={color}
        rx={1}
      />
    </g>
  );
};

// Custom Tooltip component for Recharts
const CustomChartTooltip = ({ active, payload, label, precision }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  if (!data) return null;

  const { open, high, low, close, isBullish } = data;
  const diff = close - open;
  const pct = open ? ((diff / open) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-[#0b0e14]/95 border border-zinc-800 p-2.5 rounded-xl shadow-xl text-[11px] font-mono space-y-1 backdrop-blur-md z-50">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-1">
        <span className="text-zinc-400 text-[10px]">{label}</span>
        <span className={`font-bold flex items-center gap-0.5 ${isBullish ? 'text-[#00b050]' : 'text-[#ff3b30]'}`}>
          {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {diff >= 0 ? '+' : ''}{diff.toFixed(precision)} ({pct}%)
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-zinc-300">
        <div>Open: <span className="font-bold text-white">{open?.toFixed(precision)}</span></div>
        <div>High: <span className="font-bold text-[#00b050]">{high?.toFixed(precision)}</span></div>
        <div>Low: <span className="font-bold text-[#ff3b30]">{low?.toFixed(precision)}</span></div>
        <div>Close: <span className="font-bold text-white">{close?.toFixed(precision)}</span></div>
      </div>
    </div>
  );
};

export const MarketChart: React.FC<MarketChartProps> = ({
  candles,
  activeTrades,
  selectedPair,
  currentPrice,
  chartType = 'candles',
  timeframe = '1m',
  candleTimerSeconds = 60,
  height = 250,
  onCloseTrade,
  onSelectTimeframe,
}) => {
  const isJpy = selectedPair.includes('JPY');
  const isCrypto = selectedPair.includes('BTC') || selectedPair.includes('ETH');
  const precision = isJpy ? 3 : isCrypto ? 2 : selectedPair.includes('XAU') ? 2 : 5;

  // Pan & Zoom interactive state
  const [visibleCount, setVisibleCount] = useState<number>(26);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartOffset, setDragStartOffset] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(true);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut listener to close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const formatTimer = (totalSec: number = 0) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${String(h).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Filter active positions for current pair
  const normalizedPair = selectedPair.replace('/', '');
  const pairTrades = activeTrades.filter(
    (t) => t.pair === selectedPair || t.pair.replace('/', '') === normalizedPair
  );

  // Latest candle data for MT5 Header Bar
  const lastCandle = candles[candles.length - 1] || { open: currentPrice || 0, high: currentPrice || 0, low: currentPrice || 0, close: currentPrice || 0 };

  // Calculate visible slice for Pan & Zoom
  const maxScroll = Math.max(0, candles.length - 8);
  const safeOffset = Math.min(scrollOffset, maxScroll);
  const endIdx = candles.length - safeOffset;
  const startIdx = Math.max(0, endIdx - visibleCount);
  const visibleCandles = candles.slice(startIdx, Math.max(startIdx + 4, endIdx));

  const getPairDescription = (pair: string) => {
    const p = pair.replace('/', '').toUpperCase();
    if (p.includes('XAU')) return 'Gold vs US Dollar';
    if (p.includes('EUR')) return 'Euro vs US Dollar';
    if (p.includes('GBP')) return 'Great Britain Pound vs US Dollar';
    if (p.includes('JPY')) return 'US Dollar vs Japanese Yen';
    if (p.includes('BTC')) return 'Bitcoin vs US Dollar';
    return `${pair} Spot Market`;
  };

  // Transform visible candles for Recharts
  const chartData = visibleCandles.map((c) => {
    const isBullish = c.close >= c.open;
    const range = Math.abs(c.high - c.low);
    const volume = Math.max(12, Math.round(range * (isCrypto ? 80 : 1200) + (c.open * 100) % 40 + 15));
    return {
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      isBullish,
      volume,
      barVal: Math.max(c.open, c.close),
    };
  });

  const maxVol = Math.max(...chartData.map((d) => d.volume), 100);

  // Calculate Y-Axis bounds safely based on visible candles
  const allLows = visibleCandles.map((c) => c.low);
  const allHighs = visibleCandles.map((c) => c.high);
  const tradePrices = pairTrades.map((t) => t.entryPrice);

  let minVal = Math.min(...allLows, ...(currentPrice ? [currentPrice] : []), ...tradePrices);
  let maxVal = Math.max(...allHighs, ...(currentPrice ? [currentPrice] : []), ...tradePrices);

  if (!isFinite(minVal) || !isFinite(maxVal) || minVal === maxVal) {
    minVal = (currentPrice || 100) * 0.99;
    maxVal = (currentPrice || 100) * 1.01;
  } else {
    const padding = (maxVal - minVal) * 0.08 || 1;
    minVal -= padding;
    maxVal += padding;
  }

  const getNearestTime = () => {
    if (!visibleCandles.length) return '';
    return visibleCandles[visibleCandles.length - 1].time;
  };

  // Handlers for Touch / Mouse Drag Pan and Scroll Zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartOffset(scrollOffset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const candleShift = Math.round(deltaX / 14);
    const nextOffset = Math.max(0, Math.min(maxScroll, dragStartOffset + candleShift));
    setScrollOffset(nextOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartOffset(scrollOffset);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    const candleShift = Math.round(deltaX / 12);
    const nextOffset = Math.max(0, Math.min(maxScroll, dragStartOffset + candleShift));
    setScrollOffset(nextOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      // Zoom In (fewer candles)
      setVisibleCount((prev) => Math.max(10, prev - 3));
    } else {
      // Zoom Out (more candles)
      setVisibleCount((prev) => Math.min(60, prev + 3));
    }
  };

  return (
    <div className="w-full space-y-2 select-none font-mono">
      {/* MT5 MOBILE / DESKTOP HEADER TOOLBAR */}
      <div className={`border rounded-xl p-2.5 space-y-2 transition-colors ${
        isLightTheme ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-[#0b0e14] border-zinc-800/80 text-zinc-100'
      }`}>
        {/* Top Control Bar with MT5 Mobile Icons */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            {/* Timeframe Selector Pill */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
              isLightTheme ? 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200' : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
            }`}>
              <span className="text-[#00a896] font-black">MT5</span>
              <span>|</span>
              <span className="uppercase">{timeframe}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* MT5 Mobile App Icons: +, f, Delta, Clock, Trade Square */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg">
              <button
                type="button"
                className={`p-1 rounded transition-colors ${isLightTheme ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-zinc-800 text-zinc-300'}`}
                title="Crosshair (+)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`p-1 rounded text-xs font-serif font-black italic transition-colors ${isLightTheme ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-zinc-800 text-zinc-300'}`}
                title="Indicators (f)"
              >
                f
              </button>
              <button
                type="button"
                className={`p-1 rounded transition-colors ${isLightTheme ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-zinc-800 text-zinc-300'}`}
                title="Objects / Shapes (Δ)"
              >
                <Layers className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#00a896]/30 bg-[#00a896]/10 text-[#00a896] text-[10px] font-bold">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>{formatTimer(candleTimerSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Actions: Theme Toggle, Pan/Zoom, Fullscreen */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Theme Toggle (Light MT5 vs Dark MT5) */}
            <button
              type="button"
              onClick={() => setIsLightTheme((prev) => !prev)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                isLightTheme
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title="گۆڕینی دیزاین (Theme Switcher)"
            >
              {isLightTheme ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>MT5 Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>MT5 Dark</span>
                </>
              )}
            </button>

            {/* Zoom Controls */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${
              isLightTheme ? 'bg-slate-100 border-slate-200' : 'bg-[#121824] border-zinc-800'
            }`}>
              <button
                type="button"
                onClick={() => setScrollOffset((prev) => Math.min(prev + 4, maxScroll))}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
                title="Pan Back"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setScrollOffset((prev) => Math.max(0, prev - 4))}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
                title="Pan Forward"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.max(10, prev - 4))}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(60, prev + 4))}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setScrollOffset(0);
                  setVisibleCount(26);
                }}
                className={`p-1 rounded text-[9px] font-bold ${
                  safeOffset > 0 ? 'bg-[#00a896] text-white animate-pulse' : 'hover:bg-slate-200 dark:hover:bg-zinc-800'
                }`}
                title="Reset Live"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1 px-1.5 rounded-lg bg-[#00a896]/10 border border-[#00a896]/30 text-[#00a896] font-bold text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'داخستن' : 'تەواو'}</span>
            </button>
          </div>
        </div>

        {/* Ticker Symbol Info Header matching MT5 iOS */}
        <div className="border-t pt-2 border-slate-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm tracking-tight text-[#00a896]">
                {selectedPair.replace('/', '')}.c
              </span>
              <span className={`text-[11px] font-bold ${isLightTheme ? 'text-slate-600' : 'text-zinc-400'}`}>
                ▼ {timeframe.toUpperCase()}, {lastCandle.open?.toFixed(precision)} {lastCandle.high?.toFixed(precision)} {lastCandle.low?.toFixed(precision)} {lastCandle.close?.toFixed(precision)}
              </span>
            </div>
            <p className={`text-[10px] font-medium ${isLightTheme ? 'text-slate-500' : 'text-zinc-500'}`}>
              {getPairDescription(selectedPair)}
            </p>
          </div>

          {/* Live OHLC Badges */}
          <div className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded-lg ${
            isLightTheme ? 'bg-slate-50 border border-slate-200 text-slate-600' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
          }`}>
            <span>O: <span className={isLightTheme ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{lastCandle.open?.toFixed(precision)}</span></span>
            <span>H: <span className="text-[#00a896] font-bold">{lastCandle.high?.toFixed(precision)}</span></span>
            <span>L: <span className="text-[#ef4444] font-bold">{lastCandle.low?.toFixed(precision)}</span></span>
            <span>C: <span className={isLightTheme ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{lastCandle.close?.toFixed(precision)}</span></span>
          </div>
        </div>
      </div>

      {/* RECHARTS MT5 CHART CANVAS CONTAINER */}
      <div
        ref={chartContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`w-full rounded-xl border p-1 relative overflow-hidden shadow-inner cursor-grab active:cursor-grabbing touch-pan-x select-none transition-colors ${
          isLightTheme ? 'bg-white border-slate-200' : 'bg-[#05070a] border-zinc-850'
        }`}
      >
        {/* Interactive Drag Hint Overlay when Panned Back */}
        {safeOffset > 0 && (
          <div className="absolute top-2 left-2 z-20 bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
            <MoveHorizontal className="w-3 h-3 animate-pulse" />
            <span>مێژووی چارت (Panned {safeOffset} candles)</span>
          </div>
        )}

        {visibleCandles.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-zinc-500 text-xs">
            <Activity className="w-4 h-4 animate-spin mr-2 text-[#00a896]" />
            چاوەڕوانی خولانەوەی کاندلەکان بە شێوازی MT5...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 58, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke={isLightTheme ? '#e2e8f0' : '#182030'}
                opacity={isLightTheme ? 0.8 : 0.6}
                vertical={true}
              />
              <XAxis
                dataKey="time"
                stroke={isLightTheme ? '#94a3b8' : '#3b4252'}
                tick={{ fontSize: 9.5, fill: isLightTheme ? '#64748b' : '#6c7893' }}
                tickLine={false}
                axisLine={{ stroke: isLightTheme ? '#cbd5e1' : '#1f293d' }}
              />
              <YAxis
                domain={[minVal, maxVal]}
                stroke={isLightTheme ? '#94a3b8' : '#3b4252'}
                orientation="right"
                tick={{ fontSize: 9.5, fill: isLightTheme ? '#334155' : '#94a3b8', fontFamily: 'monospace', dx: 4 }}
                tickFormatter={(val) => Number(val).toFixed(precision)}
                tickLine={false}
                axisLine={{ stroke: isLightTheme ? '#cbd5e1' : '#1f293d' }}
                width={52}
              />
              {/* Secondary Hidden YAxis for Bottom Volume Histogram */}
              <YAxis
                yAxisId="vol"
                domain={[0, maxVol * 4.5]}
                hide={true}
                orientation="left"
              />

              <Tooltip content={<CustomChartTooltip precision={precision} />} />

              {/* Volume Histogram at the bottom */}
              <Bar
                yAxisId="vol"
                dataKey="volume"
                fill={isLightTheme ? '#00a896' : '#0d9488'}
                opacity={0.6}
                barSize={2.5}
                isAnimationActive={false}
              />

              {/* Candlesticks or Line */}
              {chartType === 'candles' ? (
                <Bar
                  dataKey="barVal"
                  shape={(props: any) => (
                    <CandlestickShape
                      {...props}
                      minVal={minVal}
                      maxVal={maxVal}
                      chartHeight={height}
                    />
                  )}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#00a896"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Live Current Price Reference Line with MT5 Teal Pill */}
              {currentPrice && (
                <ReferenceLine
                  y={currentPrice}
                  stroke={isLightTheme ? '#00a896' : '#00a896'}
                  strokeDasharray="2 2"
                  strokeWidth={1.5}
                  label={{
                    value: `${currentPrice.toFixed(precision)} | ${formatTimer(candleTimerSeconds)}`,
                    position: 'right',
                    fill: '#ffffff',
                    fontSize: 9.5,
                    fontWeight: 'bold',
                    className: 'font-mono bg-[#00a896] px-1.5 py-0.5 rounded text-white shadow-sm'
                  }}
                />
              )}

              {/* Visual Reference Lines & Entry Markers for Active User Positions */}
              {pairTrades.map((trade) => {
                const isBuy = trade.type === 'BUY';
                const strokeColor = isBuy ? '#00b050' : '#ff3b30';
                const markerX = getNearestTime();

                return (
                  <React.Fragment key={`trade-ref-${trade.id}`}>
                    <ReferenceLine
                      y={trade.entryPrice}
                      stroke={strokeColor}
                      strokeDasharray="4 2"
                      strokeWidth={1.5}
                      label={{
                        value: `${isBuy ? '▲ BUY' : '▼ SELL'} ${trade.lotSize} @ ${trade.entryPrice}`,
                        position: 'insideTopLeft',
                        fill: strokeColor,
                        fontSize: 9,
                        fontWeight: 'bold',
                        className: `font-mono px-1.5 py-0.5 rounded border ${
                          isLightTheme ? 'bg-white/90 border-slate-300' : 'bg-black/95 border-zinc-800'
                        }`
                      }}
                    />

                    {markerX && (
                      <ReferenceDot
                        x={markerX}
                        y={trade.entryPrice}
                        r={5}
                        fill={strokeColor}
                        stroke={isLightTheme ? '#ffffff' : '#05070a'}
                        strokeWidth={2}
                        isFront={true}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* MT5 Three Dots in bottom right corner */}
        <div className="absolute bottom-1 right-2 text-slate-400 font-bold text-xs pointer-events-none">
          •••
        </div>
      </div>

      {/* POSITIONS LEGEND & SUMMARY PANEL */}
      <div className="bg-[#0b0e14] rounded-xl p-3 border border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-mono">
              پۆزیشنە کراوەکان ({pairTrades.length})
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00b050]" /> کڕین (BUY)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30]" /> فرۆشتن (SELL)
            </span>
          </div>
        </div>

        {pairTrades.length === 0 ? (
          <div className="text-center py-2 text-[10px] text-zinc-500 font-bold font-sans">
            هیچ پۆزیشنێکی کراوە نییە لەسەر pairـی <span className="text-amber-400">{selectedPair}</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {pairTrades.map((trade) => {
              const isBuy = trade.type === 'BUY';
              const isProfit = trade.pnl >= 0;

              return (
                <div
                  key={trade.id}
                  className="bg-[#05070a] p-2 rounded-lg border border-zinc-850 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isBuy
                          ? 'bg-emerald-950 text-[#00b050] border border-emerald-800/50'
                          : 'bg-rose-950 text-[#ff3b30] border border-rose-800/50'
                      }`}
                    >
                      {trade.type} {trade.lotSize}
                    </span>
                    <div className="text-left">
                      <span className="text-white font-bold block leading-none">
                        @{trade.entryPrice}
                      </span>
                      <span className="text-[9px] text-zinc-500 block">
                        نرخی ئێستا: {trade.currentPrice || currentPrice || trade.entryPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`font-black block leading-none ${
                          isProfit ? 'text-[#00b050]' : 'text-[#ff3b30]'
                        }`}
                      >
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-zinc-500 block">P&L</span>
                    </div>

                    {onCloseTrade && (
                      <button
                        onClick={() => onCloseTrade(trade.id)}
                        className="p-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer"
                        title="داخستنی پۆزیشن"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULLSCREEN ANALYSIS MODAL OVERLAY */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-[#05070a] p-3 sm:p-5 flex flex-col justify-between overflow-hidden backdrop-blur-2xl font-mono select-none animate-in fade-in duration-200">
          {/* FULLSCREEN HEADER BAR */}
          <div className="bg-[#0e131f] border border-zinc-800 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs shadow-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-zinc-900 border border-amber-500/40 px-3 py-1 rounded-xl text-white font-extrabold">
                <span className="text-amber-400 font-black">MT5 PRO</span>
                <span className="text-zinc-600">|</span>
                <span className="text-white text-sm">{selectedPair}</span>
              </div>

              {/* Timeframe Selector inside Fullscreen */}
              <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
                {(['1m', '5m', '15m', '1h', '4h', 'D'] as const).map((tf) => (
                  <button
                    key={`fs-tf-${tf}`}
                    type="button"
                    onClick={() => onSelectTimeframe && onSelectTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      timeframe === tf
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Candle Timer */}
              <div className="flex items-center gap-1.5 bg-amber-950/50 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl text-xs font-black">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>کاندلی نوێ: {formatTimer(candleTimerSeconds)}</span>
              </div>
            </div>

            {/* Pan/Zoom Controls & Exit Fullscreen Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#151d2a] p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setScrollOffset((prev) => Math.min(prev + 4, maxScroll))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  title="Pan Back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScrollOffset((prev) => Math.max(0, prev - 4))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  title="Pan Forward"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-0.5" />
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.max(10, prev - 4))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(60, prev + 4))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScrollOffset(0);
                    setVisibleCount(26);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    safeOffset > 0
                      ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  LIVE
                </button>
              </div>

              {/* Exit Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Minimize2 className="w-4 h-4" />
                <span>داخستن (Esc)</span>
              </button>
            </div>
          </div>

          {/* FULLSCREEN CHART CONTAINER */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="flex-1 w-full min-h-0 relative my-3 bg-[#080b12] rounded-2xl border border-zinc-800/80 p-2 sm:p-4 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-pan-x"
          >
            {/* OHLC Bar Overlay */}
            <div className="absolute top-3 right-4 z-20 bg-[#0c111a]/90 border border-zinc-800/80 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs text-zinc-400 backdrop-blur-md">
              <span>Open: <strong className="text-white">{lastCandle.open?.toFixed(precision)}</strong></span>
              <span>High: <strong className="text-[#00b050]">{lastCandle.high?.toFixed(precision)}</strong></span>
              <span>Low: <strong className="text-[#ff3b30]">{lastCandle.low?.toFixed(precision)}</strong></span>
              <span>Close: <strong className="text-white">{lastCandle.close?.toFixed(precision)}</strong></span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 35, right: 62, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#182030" opacity={0.7} vertical={true} />
                <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={{ stroke: '#1f293d' }} />
                <YAxis domain={[minVal, maxVal]} stroke="#4b5563" orientation="right" tick={{ fontSize: 11, fill: '#e2e8f0', fontFamily: 'monospace', dx: 4 }} tickFormatter={(val) => Number(val).toFixed(precision)} tickLine={false} axisLine={{ stroke: '#1f293d' }} width={55} />
                <Tooltip content={<CustomChartTooltip precision={precision} />} />

                {chartType === 'candles' ? (
                  <Bar
                    dataKey="barVal"
                    shape={(props: any) => (
                      <CandlestickShape {...props} minVal={minVal} maxVal={maxVal} />
                    )}
                    isAnimationActive={false}
                  />
                ) : (
                  <Line type="monotone" dataKey="close" stroke="#eab308" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                )}

                {currentPrice && (
                  <ReferenceLine
                    y={currentPrice}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: `LIVE: ${currentPrice.toFixed(precision)}`,
                      position: 'right',
                      fill: '#60a5fa',
                      fontSize: 11,
                      fontWeight: 'bold',
                      className: 'font-mono bg-blue-950/95 px-2 py-0.5 rounded border border-blue-800'
                    }}
                  />
                )}

                {pairTrades.map((trade) => {
                  const isBuy = trade.type === 'BUY';
                  const strokeColor = isBuy ? '#00b050' : '#ff3b30';
                  const markerX = getNearestTime();
                  return (
                    <React.Fragment key={`fs-trade-${trade.id}`}>
                      <ReferenceLine
                        y={trade.entryPrice}
                        stroke={strokeColor}
                        strokeDasharray="4 2"
                        strokeWidth={2}
                        label={{
                          value: `${isBuy ? '▲ BUY' : '▼ SELL'} ${trade.lotSize} @ ${trade.entryPrice}`,
                          position: 'insideTopLeft',
                          fill: strokeColor,
                          fontSize: 10,
                          fontWeight: 'bold',
                          className: 'font-mono bg-black/95 px-2 py-0.5 rounded border border-zinc-800'
                        }}
                      />
                      {markerX && (
                        <ReferenceDot x={markerX} y={trade.entryPrice} r={6} fill={strokeColor} stroke="#05070a" strokeWidth={2.5} isFront={true} />
                      )}
                    </React.Fragment>
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* FULLSCREEN FOOTER STATS */}
          <div className="bg-[#0e131f] border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span>شیکاری تەکنیکی <strong className="text-amber-400 font-black">{selectedPair}</strong></span>
              <span>پۆزیشنی چالاک: <strong className="text-white">{pairTrades.length}</strong></span>
            </div>
            <div className="text-zinc-500 text-[11px]">
              داگرتنی دوگمەی Esc یان بەکارهێنانی دوگمەی سەرەوە بۆ داخستنی شاشەی تەواو
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
