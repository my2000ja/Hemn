import React from 'react';
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
import { TrendingUp, TrendingDown, X, Activity, Clock } from 'lucide-react';

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

  const candleWidth = Math.max(Math.min(width * 0.65, 16), 3);
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
}) => {
  const isJpy = selectedPair.includes('JPY');
  const isCrypto = selectedPair.includes('BTC') || selectedPair.includes('ETH');
  const precision = isJpy ? 3 : isCrypto ? 2 : selectedPair.includes('XAU') ? 2 : 5;

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

  // Transform candles for Recharts
  const chartData = candles.map((c) => {
    const isBullish = c.close >= c.open;
    return {
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      isBullish,
      barVal: Math.max(c.open, c.close),
    };
  });

  // Calculate Y-Axis bounds safely
  const allLows = candles.map((c) => c.low);
  const allHighs = candles.map((c) => c.high);
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
    if (!candles.length) return '';
    return candles[candles.length - 1].time;
  };

  return (
    <div className="w-full space-y-2 select-none font-mono">
      {/* META5 TERMINAL TOP BAR WITH CANDLE TIMER & OHLC */}
      <div className="bg-[#0b0e14] border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg text-white font-extrabold text-[10px]">
            <span className="text-[#00b050]">MT5</span>
            <span className="text-zinc-500">|</span>
            <span>{selectedPair.replace('/', '')}</span>
            <span className="text-amber-400 font-bold uppercase">{timeframe.toUpperCase()}</span>
          </div>

          {/* Candle Countdown Timer Pill */}
          <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>کات بۆ کاندلی نوێ: {formatTimer(candleTimerSeconds)}</span>
          </div>
        </div>

        {/* OHLC Bar */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span>O: <span className="text-white font-bold">{lastCandle.open?.toFixed(precision)}</span></span>
          <span>H: <span className="text-[#00b050] font-bold">{lastCandle.high?.toFixed(precision)}</span></span>
          <span>L: <span className="text-[#ff3b30] font-bold">{lastCandle.low?.toFixed(precision)}</span></span>
          <span>C: <span className="text-white font-bold">{lastCandle.close?.toFixed(precision)}</span></span>
        </div>
      </div>

      {/* RECHARTS MT5 CHART CONTAINER */}
      <div className="w-full bg-[#05070a] rounded-xl border border-zinc-850 p-1 relative overflow-hidden shadow-inner">
        {candles.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-zinc-500 text-xs">
            <Activity className="w-4 h-4 animate-spin mr-2 text-amber-400" />
            چاوەڕوانی خولانەوەی کاندلەکان بە شێوازی MT5...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#182030"
                opacity={0.6}
                vertical={true}
              />
              <XAxis
                dataKey="time"
                stroke="#3b4252"
                tick={{ fontSize: 9, fill: '#6c7893' }}
                tickLine={false}
                axisLine={{ stroke: '#1f293d' }}
              />
              <YAxis
                domain={[minVal, maxVal]}
                stroke="#3b4252"
                orientation="right"
                tick={{ fontSize: 9, fill: '#a0aabf', fontFamily: 'monospace' }}
                tickFormatter={(val) => Number(val).toFixed(precision)}
                tickLine={false}
                axisLine={{ stroke: '#1f293d' }}
                width={55}
              />
              <Tooltip content={<CustomChartTooltip precision={precision} />} />

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
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Live Current Price Reference Line */}
              {currentPrice && (
                <ReferenceLine
                  y={currentPrice}
                  stroke="#3b82f6"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{
                    value: currentPrice.toFixed(precision),
                    position: 'right',
                    fill: '#3b82f6',
                    fontSize: 9,
                    fontWeight: 'bold',
                    className: 'font-mono bg-blue-950 px-1 rounded'
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
                        position: 'left',
                        fill: strokeColor,
                        fontSize: 9,
                        fontWeight: 'bold',
                        className: 'font-mono bg-black/90 px-1 rounded border border-zinc-800'
                      }}
                    />

                    {markerX && (
                      <ReferenceDot
                        x={markerX}
                        y={trade.entryPrice}
                        r={5}
                        fill={strokeColor}
                        stroke="#05070a"
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
    </div>
  );
};
