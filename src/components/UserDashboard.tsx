import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  History,
  Settings,
  X,
  Copy,
  Gift,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  Bell,
  Smartphone,
  Wallet,
  CheckCircle2,
  Loader2,
  Star,
  Menu,
  User as UserIcon,
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Sliders,
  RefreshCw,
  BarChart2,
  Shield,
  HelpCircle,
  Maximize2,
  SmartphoneIcon,
  MonitorIcon,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CreditCard,
  QrCode,
  Send,
  Zap
} from 'lucide-react';
import { User, AppSettings, TradingSignal } from '../types';
import { getActivityLogs, addActivityLog } from '../utils/storage';
import { MarketChart } from './MarketChart';
import { MarketTicker } from './MarketTicker';

interface UserDashboardProps {
  user: User;
  userKey?: string;
  settings: AppSettings;
  onRequestBuy: (pkgName: string, price: number, clicks: number, isMonthly: boolean) => void;
  onRequestWithdraw: (fibNumber: string, amount: number) => void;
  onNavigateView?: (view: 'home' | 'history' | 'admin') => void;
  onUpdateUser?: (key: string, updatedUser: User) => void;
  onRecordGameLoss?: (lossAmount: number) => void;
  onDeleteAccount?: (key: string) => void;
  onRequestAuth?: (tab?: 'login' | 'register') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ActiveTrade {
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

// Helper to generate dynamic candlesticks based on pair and timeframe
const generateInitialCandles = (pair: string, tf: string = '1m'): Candle[] => {
  let basePrice = 4234.00;
  let baseTick = 1.25;
  if (pair === 'EUR/USD') { basePrice = 1.08435; baseTick = 0.00015; }
  else if (pair === 'GBP/USD') { basePrice = 1.26745; baseTick = 0.00020; }
  else if (pair === 'USD/JPY') { basePrice = 156.784; baseTick = 0.025; }
  else if (pair === 'BTC/USD') { basePrice = 67842.13; baseTick = 12.50; }

  let tfMultiplier = 1;
  let stepMinutes = 1;

  switch (tf) {
    case '5m':
      tfMultiplier = 2.2;
      stepMinutes = 5;
      break;
    case '15m':
      tfMultiplier = 3.8;
      stepMinutes = 15;
      break;
    case '1h':
      tfMultiplier = 6.5;
      stepMinutes = 60;
      break;
    case '4h':
      tfMultiplier = 12.0;
      stepMinutes = 240;
      break;
    case 'D':
      tfMultiplier = 22.0;
      stepMinutes = 1440;
      break;
    default: // 1m
      tfMultiplier = 1.0;
      stepMinutes = 1;
      break;
  }

  const tick = baseTick * tfMultiplier;
  const list: Candle[] = [];
  const candleCount = 40;
  const now = new Date();
  let currentPrice = basePrice - (candleCount / 2) * (tick * 0.35);

  for (let i = 0; i < candleCount; i++) {
    const minutesAgo = (candleCount - 1 - i) * stepMinutes;
    const candleDate = new Date(now.getTime() - minutesAgo * 60 * 1000);

    let timeStr = '';
    if (tf === 'D') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      timeStr = `${months[candleDate.getMonth()]} ${String(candleDate.getDate()).padStart(2, '0')}`;
    } else {
      timeStr = `${String(candleDate.getHours()).padStart(2, '0')}:${String(candleDate.getMinutes()).padStart(2, '0')}`;
    }

    const dec = pair.includes('JPY') ? 3 : (pair === 'XAU/USD' || pair === 'BTC/USD' ? 2 : 5);
    const change = (Math.random() - 0.48) * tick * 2.2;
    const open = Number(currentPrice.toFixed(dec));
    const close = Number((open + change).toFixed(dec));
    const high = Number((Math.max(open, close) + Math.random() * tick * 1.4).toFixed(dec));
    const low = Number((Math.min(open, close) - Math.random() * tick * 1.4).toFixed(dec));

    list.push({ time: timeStr, open, high, low, close });
    currentPrice = close;
  }
  return list;
};

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  userKey = '',
  settings,
  onRequestBuy,
  onRequestWithdraw,
  onUpdateUser,
  onDeleteAccount,
  showToast
}) => {
  // View Modes: 'mobile' (perfect iPhone shell) vs 'desktop' (expanded terminal)
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Active Account Type State: 'real' (هەژماری ڕاستەقینە) vs 'demo' (هەژماری تاقیکردنەوە - $10,000)
  const [accountType, setAccountType] = useState<'real' | 'demo'>(() => {
    try {
      const saved = localStorage.getItem(`acc_type_${userKey}`);
      return (saved === 'demo' ? 'demo' : 'real');
    } catch {
      return 'real';
    }
  });

  // Demo Account Balance ($10,000 default virtual money)
  const [demoBalance, setDemoBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`demo_bal_${userKey}`);
      return saved ? Number(saved) : 10000;
    } catch {
      return 10000;
    }
  });

  const handleResetDemoBalance = () => {
    setDemoBalance(10000);
    localStorage.setItem(`demo_bal_${userKey}`, '10000');
    showToast('باڵانسی هەژماری تاقیکردنەوە (Demo) گەڕێنرایەوە بۆ $10,000! 🔄', 'success');
  };

  // Bottom Tab Navigation: 'home', 'markets', 'trades', 'signals', 'profile'
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'markets' | 'trades' | 'signals' | 'profile'>('home');

  // Selected Active Asset & Chart Settings
  const [selectedPair, setSelectedPair] = useState<'XAU/USD' | 'EUR/USD' | 'GBP/USD' | 'USD/JPY' | 'BTC/USD'>('XAU/USD');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | 'D'>('1m');

  const getTimeframeSeconds = (tf: string): number => {
    switch (tf) {
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '1h': return 3600;
      case '4h': return 14400;
      case 'D': return 86400;
      default: return 60;
    }
  };

  const [candleTimerSeconds, setCandleTimerSeconds] = useState<number>(() => getTimeframeSeconds('1m'));

  useEffect(() => {
    setCandleTimerSeconds(getTimeframeSeconds(timeframe));
  }, [timeframe]);

  // Interactive Lot State (default is 0.10 matching the screenshot)
  const [lotSize, setLotSize] = useState<number>(0.10);

  // Modal Open States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // VIP signals local view state
  const [signalsList, setSignalsList] = useState<TradingSignal[]>([]);

  // Profile Form States
  const [editName, setEditName] = useState(user.name || '');
  const [editFib, setEditFib] = useState(user.fib || '');
  const [editPass, setEditPass] = useState('');
  const [verifyPhone, setVerifyPhone] = useState(user.verificationPhone || '');
  const [verifyIdNumber, setVerifyIdNumber] = useState(user.verificationIdNumber || '');
  const [deleteConfirmPass, setDeleteConfirmPass] = useState('');

  // Withdrawal States
  const [withdrawFib, setWithdrawFib] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Market Search query in "Markets" tab
  const [marketSearchQuery, setMarketSearchQuery] = useState('');

  // Real-time market prices state (fluctuates dynamically)
  const [marketPrices, setMarketPrices] = useState({
    'XAU/USD': { price: 4234.00, change: 0.79, high: 4252.20, low: 4210.40 },
    'EUR/USD': { price: 1.08435, change: -0.23, high: 1.08620, low: 1.08110 },
    'GBP/USD': { price: 1.26745, change: 0.25, high: 1.27110, low: 1.26250 },
    'USD/JPY': { price: 156.784, change: 0.16, high: 157.250, low: 156.120 },
    'BTC/USD': { price: 67842.13, change: 1.85, high: 68500.00, low: 67120.00 }
  });

  // Dynamic Candlestick State with lazy initialization for session continuity
  const [candles, setCandles] = useState<Candle[]>(() => {
    const pair = 'EUR/USD';
    const tf = '1m';
    const storageKey = `chart_candles_${pair.replace('/', '_')}_${tf}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return generateInitialCandles(pair, tf);
  });
  const [tickCount, setTickCount] = useState(0);

  // Mock Notification Badge
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '🚀 سیگناڵی زێڕ چالاک بوو', text: 'سیگناڵی کڕین (BUY) بۆ XAU/USD لە نرخ ٢,٣٤٥ دەرچوو. چاودێری بکە.', time: '١٠:٣٠ لایڤ', read: false },
    { id: 2, title: '💸 داواکاری کڕین پەسەندکرا', text: 'پاکێجی وەبەرهێنان بە سەرکەوتوویی لە لایەن ئەدمینەوە پەسەندکرا.', time: 'دوێنێ', read: false },
    { id: 3, title: '🔒 حسابت بە سەرکەوتوویی پارێزراوە', text: 'سیستەمی نوێی KYC چالاککراوە بۆ پاراستنی هەمیشەیی سەرمایەکەت.', time: '٢ ڕۆژ لەمەوبەر', read: false }
  ]);

  // Active trades state
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>(() => {
    try {
      const saved = localStorage.getItem(`trades_${userKey}`);
      if (saved) {
        const loaded = JSON.parse(saved);
        if (Array.isArray(loaded) && loaded.length > 0) {
          return loaded.map((t: any) => ({
            id: t.id || Math.random().toString(36).substring(2, 9),
            pair: t.pair || 'EUR/USD',
            type: t.type || 'BUY',
            amount: typeof t.amount === 'number' ? t.amount : 100,
            lotSize: typeof t.lotSize === 'number' ? t.lotSize : 0.10,
            entryPrice: typeof t.entryPrice === 'number' ? t.entryPrice : 1.0850,
            currentPrice: typeof t.currentPrice === 'number' ? t.currentPrice : 1.0850,
            pnl: typeof t.pnl === 'number' ? t.pnl : 0,
            timestamp: t.timestamp || '12:00',
            accountType: t.accountType || 'real'
          }));
        }
      }
    } catch {}

    return [];
  });

  // Filter active trades for currently selected account type
  const filteredActiveTrades = activeTrades.filter((t) => t.accountType ? t.accountType === accountType : true);

  // Calculate dynamic trade stats based on active account type
  const totalActivePnl = filteredActiveTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const effectiveBalance = accountType === 'demo' ? demoBalance : user.balance;
  const currentEquity = Number((effectiveBalance + totalActivePnl).toFixed(2));
  
  // Calculate dynamic Margin: e.g. $1000 margin required per 1.0 lot ($100 per 0.10 lot)
  const currentMargin = Number((filteredActiveTrades.reduce((acc, t) => acc + (t.lotSize * 1000), 0)).toFixed(2));
  const currentFreeMargin = Number((currentEquity - currentMargin).toFixed(2));

  // Market Sentiment calculation
  const getMarketSentiment = () => {
    const buySignals = signalsList.filter(s => s.type === 'BUY').length;
    const sellSignals = signalsList.filter(s => s.type === 'SELL').length;
    
    const buyTrades = activeTrades.filter(t => t.type === 'BUY').length;
    const sellTrades = activeTrades.filter(t => t.type === 'SELL').length;
    
    const totalBuys = buySignals + buyTrades;
    const totalSells = sellSignals + sellTrades;
    const totalCount = totalBuys + totalSells;
    
    if (totalCount === 0) {
      return { buyPercent: 50, sellPercent: 50, totalBuys: 0, totalSells: 0, statusLabel: 'یەکلاکرانەوە نییە', statusLabelEn: 'Neutral' };
    }
    
    const buyPercent = Math.round((totalBuys / totalCount) * 100);
    const sellPercent = 100 - buyPercent;
    
    let statusLabel = 'مامناوەند';
    let statusLabelEn = 'Neutral';
    if (buyPercent >= 70) {
      statusLabel = 'کڕینی بەهێز 🔥';
      statusLabelEn = 'Strong Buy';
    } else if (buyPercent >= 55) {
      statusLabel = 'کڕین 📈';
      statusLabelEn = 'Buy';
    } else if (sellPercent >= 70) {
      statusLabel = 'فرۆشتنی بەهێز ❄️';
      statusLabelEn = 'Strong Sell';
    } else if (sellPercent >= 55) {
      statusLabel = 'فرۆشتن 📉';
      statusLabelEn = 'Sell';
    }
    
    return {
      buyPercent,
      sellPercent,
      totalBuys,
      totalSells,
      statusLabel,
      statusLabelEn
    };
  };

  const sentiment = getMarketSentiment();

  // Initialize and Sync signals local state from storage
  useEffect(() => {
    const saved = localStorage.getItem('kurd_trading_signals');
    if (saved) {
      try {
        setSignalsList(JSON.parse(saved));
      } catch {}
    } else {
      // Set some gorgeous default signals to look extremely high-end out of the box!
      const defaultSigs: TradingSignal[] = [
        {
          id: 'sig_1',
          pair: 'XAU/USD (زێڕ)',
          type: 'BUY',
          entry: '2341.50',
          tp1: '2348.00',
          tp2: '2352.00',
          tp3: '2360.00',
          sl: '2335.00',
          winRate: '94%',
          status: 'ACTIVE',
          isVip: false,
          createdAt: '١ کاتژمێر لەمەوبەر',
          notes: 'پشتیوانی سەرەکی زۆر بەهێزە، مۆمێک لە سەر کاتژمێری داخراوە.'
        },
        {
          id: 'sig_2',
          pair: 'EUR/USD',
          type: 'SELL',
          entry: '1.08550',
          tp1: '1.08300',
          tp2: '1.08000',
          tp3: '1.07500',
          sl: '1.08850',
          winRate: '88%',
          status: 'HIT_TP2',
          isVip: false,
          createdAt: '٤ کاتژمێر لەمەوبەر',
          notes: 'قازانجی دووەم بە سەرکەوتوویی بەدەست هات! لایڤ بەردەوامە.'
        },
        {
          id: 'sig_3',
          pair: 'GBP/USD',
          type: 'BUY',
          entry: '1.26500',
          tp1: '1.26800',
          tp2: '1.27200',
          tp3: '1.27800',
          sl: '1.26100',
          winRate: '91%',
          status: 'HIT_TP3',
          isVip: true,
          createdAt: 'دوێنێ',
          notes: 'سیگناڵی ڤی ئای پی زۆر نایاب هەموو ئامانجەکانی پێکاوە!'
        }
      ];
      setSignalsList(defaultSigs);
      localStorage.setItem('kurd_trading_signals', JSON.stringify(defaultSigs));
    }
  }, [activeBottomTab]);

  // Synchronize profile edits when user updates
  useEffect(() => {
    setEditName(user.name || '');
    setEditFib(user.fib || '');
    setVerifyPhone(user.verificationPhone || '');
    setVerifyIdNumber(user.verificationIdNumber || '');
  }, [user]);

  // Switch candles array whenever selected pair or timeframe changes, persisting timeframe-specific history
  useEffect(() => {
    const storageKey = `chart_candles_${selectedPair.replace('/', '_')}_${timeframe}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCandles(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading candles from localStorage:', e);
    }

    const initial = generateInitialCandles(selectedPair, timeframe);
    setCandles(initial);
    try {
      localStorage.setItem(storageKey, JSON.stringify(initial));
    } catch (e) {}
  }, [selectedPair, timeframe]);

  // Continuously persist active candles state to localStorage per timeframe
  useEffect(() => {
    if (candles.length > 0) {
      try {
        const storageKey = `chart_candles_${selectedPair.replace('/', '_')}_${timeframe}`;
        localStorage.setItem(storageKey, JSON.stringify(candles));
      } catch (e) {
        console.error('Error saving candles to localStorage:', e);
      }
    }
  }, [candles, selectedPair, timeframe]);

  // Real-time market tick interval (fluctuates prices, updates candlesticks & open trades)
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Decrement Candlestick Countdown Timer
      setCandleTimerSeconds((prevTimer) => {
        if (prevTimer <= 1) {
          // Candlestick time expired! Finalize current candle and spawn a new one slowly
          setCandles((prevCandles) => {
            if (prevCandles.length === 0) return prevCandles;
            const nextCandles = [...prevCandles];
            const last = nextCandles[nextCandles.length - 1];

            if (nextCandles.length >= 120) {
              nextCandles.shift();
            }

            const nowTime = new Date();
            const timeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;

            nextCandles.push({
              time: timeStr,
              open: last.close,
              high: last.close,
              low: last.close,
              close: last.close
            });
            return nextCandles;
          });

          return getTimeframeSeconds(timeframe);
        }
        return prevTimer - 1;
      });

      // 2. Fluctuating market prices with Inverse Market Liquidity Engine ("پێچەوانەیی خەلک کە پۆزشن دەکەن")
      setMarketPrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((pair) => {
          const item = next[pair as keyof typeof next];
          const tickSize = pair === 'XAU/USD' ? 0.18 : (pair === 'USD/JPY' ? 0.015 : (pair === 'BTC/USD' ? 12.50 : 0.00010));

          // Calculate active user trades on this pair for current account type to exert opposing liquidity bias
          const normalizedPair = pair.replace('/', '');
          const pairTrades = activeTrades.filter(
            (t) => (t.accountType ? t.accountType === accountType : true) && (t.pair === pair || t.pair.replace('/', '') === normalizedPair)
          );

          const buyLots = pairTrades.filter((t) => t.type === 'BUY').reduce((acc, t) => acc + t.lotSize, 0);
          const sellLots = pairTrades.filter((t) => t.type === 'SELL').reduce((acc, t) => acc + t.lotSize, 0);
          const netLots = buyLots - sellLots;

          // Inverse liquidity logic:
          // If netLots > 0 (more BUYs), 35% chance up, 65% chance down
          // If netLots < 0 (more SELLs), 65% chance up, 35% chance down
          // If netLots === 0 (balanced), 50% chance up, 50% chance down
          let upChance = 0.50;
          if (netLots > 0) {
            upChance = 0.35;
          } else if (netLots < 0) {
            upChance = 0.65;
          }

          const changeDir = Math.random() < upChance ? 1 : -1;
          const tickDiff = changeDir * Math.random() * tickSize;
          const newPrice = Number((item.price + tickDiff).toFixed(pair === 'EUR/USD' || pair === 'GBP/USD' ? 5 : (pair === 'USD/JPY' ? 3 : 2)));

          const newHigh = Math.max(item.high, newPrice);
          const newLow = Math.min(item.low, newPrice);

          const baseOpen = pair === 'XAU/USD' ? 4210 : (pair === 'EUR/USD' ? 1.082 : (pair === 'GBP/USD' ? 1.261 : (pair === 'BTC/USD' ? 67000 : 156.0)));
          const changePercent = Number(((newPrice - baseOpen) / baseOpen * 100).toFixed(2));

          next[pair as keyof typeof next] = {
            price: newPrice,
            change: changePercent,
            high: newHigh,
            low: newLow
          };
        });
        return next;
      });

      // 3. Synchronously update live open trades calculations
      setActiveTrades((prevTrades) => {
        if (prevTrades.length === 0) return prevTrades;

        const next = prevTrades.map((t) => {
          const livePrice = marketPrices[t.pair as keyof typeof marketPrices]?.price || t.entryPrice;
          let pnl = t.pnl;

          const entryPrice = t.entryPrice;
          const directionMultiplier = t.type === 'BUY' ? 1 : -1;

          if (t.pair === 'XAU/USD') {
            pnl = Number((directionMultiplier * (livePrice - entryPrice) * t.lotSize * 100).toFixed(2));
          } else if (t.pair === 'USD/JPY') {
            pnl = Number((directionMultiplier * (livePrice - entryPrice) * t.lotSize * 1000).toFixed(2));
          } else if (t.pair === 'BTC/USD') {
            pnl = Number((directionMultiplier * (livePrice - entryPrice) * t.lotSize * 100).toFixed(2));
          } else {
            pnl = Number((directionMultiplier * (livePrice - entryPrice) * t.lotSize * 100000).toFixed(2));
          }

          return {
            ...t,
            currentPrice: livePrice,
            pnl: pnl
          };
        });

        localStorage.setItem(`trades_${userKey}`, JSON.stringify(next));
        return next;
      });

      // 4. Align current active candle high, low, and close with current price
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const copy = [...prevCandles];
        const lastIdx = copy.length - 1;
        const last = { ...copy[lastIdx] };

        const activeFeed = marketPrices[selectedPair as keyof typeof marketPrices];
        if (activeFeed) {
          const livePrice = activeFeed.price;
          last.close = livePrice;
          if (livePrice > last.high) last.high = livePrice;
          if (livePrice < last.low) last.low = livePrice;
          copy[lastIdx] = last;
        }

        return copy;
      });

    }, 1000); // 1-second smooth ticking

    return () => clearInterval(timer);
  }, [selectedPair, marketPrices, userKey, activeTrades, accountType, timeframe]);

  // Handle Withdrawal Request Submission
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!withdrawFib.trim()) {
      showToast('تکایە ناونیشانی جزدانی کریپتۆ بنووسە!', 'error');
      return;
    }
    if (!amt || amt <= 0) {
      showToast('تکایە بڕی پارە بەدروستی بنووسە!', 'error');
      return;
    }
    if (amt > 1000) {
      showToast('زۆرترین بڕی پارە بۆ ڕاکێشانەوە ۱,۰۰۰ دۆلارە ($1,000)!', 'error');
      return;
    }
    if (amt > user.balance) {
      showToast('باڵانسی بەردەستت لەم بڕە کەمترە!', 'error');
      return;
    }

    onRequestWithdraw(withdrawFib.trim(), amt);
    
    // Add transaction log
    addActivityLog(userKey, {
      type: 'withdraw_request',
      title: 'داواکاری ڕاکێشانی باڵانس نێردرا',
      detail: `بڕی $${amt.toLocaleString()} نێردرا بۆ جزدانی ${withdrawFib.substring(0, 5)}...`
    });

    setWithdrawAmount('');
    setIsWithdrawModalOpen(false);
    showToast('داواکاری ڕاکێشانی پارە بە سەرکەوتوویی تۆمارکرا! دوای پێداچوونەوەی ئەدمین پارەکە ڕەوانە دەکرێت.', 'success');
  };

  // Open Live Trade Position
  const handleOpenTrade = (type: 'BUY' | 'SELL') => {
    if (lotSize < 0.01) {
      showToast('کەمترین قەبارەی لۆت پێویستە لەسەروو 0.01 بێت!', 'error');
      return;
    }

    // Required Margin is $1000 per 1.0 lot ($100 per 0.10 lot)
    const requiredMargin = lotSize * 1000;
    const currentBal = accountType === 'demo' ? demoBalance : user.balance;

    if (currentBal <= 0 || requiredMargin > currentBal) {
      showToast(`باڵانسی بەردەستت کەمە لە هەژماری ${accountType === 'demo' ? 'تاقیکردنەوە (Demo)' : 'ڕاستەقینە (Real)'}! پێویستت بە لانیکەم $${requiredMargin.toFixed(2)} باڵانس هەیە.`, 'error');
      return;
    }

    const currentPrice = marketPrices[selectedPair as keyof typeof marketPrices]?.price || 1.0;

    const newTrade: ActiveTrade = {
      id: Math.random().toString(36).substring(2, 9),
      pair: selectedPair,
      type: type,
      amount: requiredMargin, // Keep track of trade locked margin as trade amount
      lotSize: lotSize,
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      pnl: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accountType: accountType
    };

    const updatedTrades = [newTrade, ...activeTrades];
    setActiveTrades(updatedTrades);
    localStorage.setItem(`trades_${userKey}`, JSON.stringify(updatedTrades));

    // Deduct margin from current active account balance
    if (accountType === 'demo') {
      const newDemoBal = Number((demoBalance - requiredMargin).toFixed(2));
      setDemoBalance(newDemoBal);
      localStorage.setItem(`demo_bal_${userKey}`, newDemoBal.toString());
    } else {
      const updatedUser: User = {
        ...user,
        balance: Number((user.balance - requiredMargin).toFixed(2))
      };
      if (onUpdateUser && userKey) {
        onUpdateUser(userKey, updatedUser);
      }
    }

    // Log Activity
    addActivityLog(userKey, {
      type: 'click',
      title: `پۆزیشنی نوێ کرایەوە (${type} - ${accountType.toUpperCase()})`,
      detail: `${selectedPair} بە قەبارەی ${lotSize} لۆت لە نرخی ${currentPrice}`
    });

    showToast(`ئۆردەری ${type === 'BUY' ? 'کڕین (BUY) ▲' : 'فرۆشتن (SELL) ▼'} [${accountType.toUpperCase()}] بە سەرکەوتوویی جێبەجێکرا!`, 'success');
  };

  // Close Active Position
  const handleCloseTrade = (tradeId: string) => {
    const tradeToClose = activeTrades.find((t) => t.id === tradeId);
    if (!tradeToClose) return;

    const tPnl = tradeToClose.pnl ?? 0;
    const tAmount = tradeToClose.amount ?? 0; // locked margin
    const tradeAccType = tradeToClose.accountType || accountType;
    
    // Return margin + Pnl to balance
    const payout = Number((tAmount + tPnl).toFixed(2));

    if (tradeAccType === 'demo') {
      const finalDemo = Math.max(0, Number((demoBalance + payout).toFixed(2)));
      setDemoBalance(finalDemo);
      localStorage.setItem(`demo_bal_${userKey}`, finalDemo.toString());
    } else {
      const finalBalance = Math.max(0, Number((user.balance + payout).toFixed(2)));
      const updatedUser: User = {
        ...user,
        balance: finalBalance
      };
      if (onUpdateUser && userKey) {
        onUpdateUser(userKey, updatedUser);
      }
    }

    const filtered = activeTrades.filter((t) => t.id !== tradeId);
    setActiveTrades(filtered);
    localStorage.setItem(`trades_${userKey}`, JSON.stringify(filtered));

    // Log Activity
    addActivityLog(userKey, {
      type: 'click',
      title: 'پۆزیشن داخرا',
      detail: `${tradeToClose.pair} ${tradeToClose.type} بە قەبارەی ${tradeToClose.lotSize} لۆت. ئەنجام: ${tPnl >= 0 ? '+' : ''}$${tPnl.toFixed(2)}`
    });

    if (tPnl >= 0) {
      showToast(`پۆزیشن داخرا! قازانج: +$${tPnl.toFixed(2)} خرایە سەر باڵانسی ${tradeAccType === 'demo' ? 'تاقیکردنەوە' : 'ڕاستەقینە'}.`, 'success');
    } else {
      showToast(`پۆزیشن داخرا! زیان: -$${Math.abs(tPnl).toFixed(2)} لە باڵانسی ${tradeAccType === 'demo' ? 'تاقیکردنەوە' : 'ڕاستەقینە'} کەمبووەوە.`, 'info');
    }
  };

  // Close All Active Positions at Once
  const handleCloseAllTrades = () => {
    const targetTrades = activeTrades.filter(t => t.accountType ? t.accountType === accountType : true);
    if (targetTrades.length === 0) return;
    
    let totalPayout = 0;
    targetTrades.forEach((t) => {
      totalPayout += (t.amount + t.pnl);
    });

    if (accountType === 'demo') {
      const finalDemo = Math.max(0, Number((demoBalance + totalPayout).toFixed(2)));
      setDemoBalance(finalDemo);
      localStorage.setItem(`demo_bal_${userKey}`, finalDemo.toString());
    } else {
      const finalBalance = Math.max(0, Number((user.balance + totalPayout).toFixed(2)));
      const updatedUser: User = {
        ...user,
        balance: finalBalance
      };
      if (onUpdateUser && userKey) {
        onUpdateUser(userKey, updatedUser);
      }
    }

    const remainingTrades = activeTrades.filter(t => t.accountType && t.accountType !== accountType);
    setActiveTrades(remainingTrades);
    localStorage.setItem(`trades_${userKey}`, JSON.stringify(remainingTrades));

    showToast(`سەرجەم پۆزیشنە کراوەکانی هەژماری ${accountType === 'demo' ? 'تاقیکردنەوە (Demo)' : 'ڕاستەقینە (Real)'} داخران!`, 'success');
  };

  // Edit and Save Profile details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editFib.trim()) {
      showToast('تکایە زانیارییەکان بە تەواوی بنووسە!', 'error');
      return;
    }

    const updatedUser: User = {
      ...user,
      name: editName.trim(),
      fib: editFib.trim(),
      pass: editPass.trim() ? editPass.trim() : user.pass
    };

    if (onUpdateUser && userKey) {
      onUpdateUser(userKey, updatedUser);
      showToast('زانیارییەکانی پڕۆفایل بەسەرکەوتوویی نوێکرانەوە! 💾', 'success');
      setEditPass('');
    }
  };

  // Send KYC Verification Details
  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPhone.trim() || !verifyIdNumber.trim()) {
      showToast('تکایە سەرجەم خانەکان پڕبکەرەوە!', 'error');
      return;
    }

    const updatedUser: User = {
      ...user,
      verificationStatus: 'pending',
      verificationPhone: verifyPhone.trim(),
      verificationIdNumber: verifyIdNumber.trim()
    };

    if (onUpdateUser && userKey) {
      onUpdateUser(userKey, updatedUser);
      showToast('بەڵگەنامەکان نێردران! ناسنامەت لە کەمتر لە ٢٤ کاتژمێردا پشتڕاست دەکرێتەوە.', 'success');
    }
  };

  // Confirm Account Deletion
  const handleConfirmDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmPass !== user.pass) {
      showToast('وشەی نهێنی نادروستە! ناتوانیت ئەکاونتەکە بسڕیتەوە.', 'error');
      return;
    }
    if (onDeleteAccount && userKey) {
      if (confirm('⚠️ ئایا دڵنیای لە حەزفکردنی ئەکاونتەکەت؟ ئەم کارە ناگەڕێتەوە!')) {
        onDeleteAccount(userKey);
      }
    }
  };

  // Render Asset Card helper
  const renderAssetCard = (pair: 'XAU/USD' | 'EUR/USD' | 'GBP/USD' | 'USD/JPY' | 'BTC/USD', label: string, desc: string, index: number) => {
    const isSelected = selectedPair === pair;
    const item = marketPrices[pair];
    const isUp = item.change >= 0;

    // Asset icons
    const renderIcon = () => {
      switch (pair) {
        case 'XAU/USD':
          return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center text-white border border-yellow-300/30">
              <Sparkles className="w-5 h-5 text-yellow-100" />
            </div>
          );
        case 'EUR/USD':
          return (
            <div className="w-10 h-10 rounded-full bg-[#003399] flex items-center justify-center relative overflow-hidden border border-blue-400/20">
              <span className="text-[10px] font-black text-white z-10">EU</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
            </div>
          );
        case 'GBP/USD':
          return (
            <div className="w-10 h-10 rounded-full bg-[#012169] flex items-center justify-center relative overflow-hidden border border-blue-400/20">
              <span className="text-[10px] font-black text-white z-10">UK</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
            </div>
          );
        case 'USD/JPY':
          return (
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative overflow-hidden border border-zinc-200">
              <div className="w-4 h-4 rounded-full bg-[#BC002D]" />
              <span className="text-[8px] font-black text-slate-800 absolute bottom-1 z-10">JP</span>
            </div>
          );
        case 'BTC/USD':
          return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white border border-amber-400/30">
              <span className="text-xs font-black text-amber-100">₿</span>
            </div>
          );
      }
    };

    return (
      <button
        key={pair}
        onClick={() => setSelectedPair(pair)}
        className={`flex-shrink-0 w-[155px] p-3.5 rounded-2xl transition-all text-right border ${
          isSelected 
            ? 'bg-[#121b2d] border-[#eab308]/50 shadow-lg shadow-[#eab308]/5' 
            : 'bg-[#111622] border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isUp ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'}`}>
            {isUp ? '+' : ''}{item.change.toFixed(2)}%
          </span>
          {renderIcon()}
        </div>
        
        <h4 className="text-xs font-black text-white">{pair.replace('/', '')}</h4>
        <p className="text-[9px] text-zinc-400 mt-0.5">{desc}</p>
        
        <div className="mt-2.5 font-mono text-xs font-black text-white">
          {item.price.toLocaleString(undefined, { minimumFractionDigits: pair.includes('USD') && !pair.startsWith('XAU') ? 5 : 2 })}
        </div>
      </button>
    );
  };

  // Setup Coordinate mappings for interactive candlestick chart
  const minPrice = Math.min(...candles.map(c => c.low), marketPrices[selectedPair]?.low || 2300) * 0.9995;
  const maxPrice = Math.max(...candles.map(c => c.high), marketPrices[selectedPair]?.high || 2360) * 1.0005;
  const priceRange = maxPrice - minPrice;

  const mapPriceToY = (price: number) => {
    const height = 210;
    const padding = 15;
    return padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
  };

  const mapVolumeToHeight = (c: Candle, idx: number) => {
    // Proportional volume height matching candle size
    const bodySize = Math.abs(c.close - c.open);
    const maxBody = Math.max(...candles.map(item => Math.abs(item.close - item.open)), 0.1);
    const ratio = bodySize / maxBody;
    return 10 + ratio * 35; // height between 10px and 45px
  };

  // Filtered markets in "Markets" tab
  const listAllMarketProducts = [
    { pair: 'XAU/USD', name: 'Gold Spot / U.S. Dollar', type: 'Forex Metal', spread: '0.15' },
    { pair: 'EUR/USD', name: 'Euro / U.S. Dollar', type: 'Forex Major', spread: '0.00012' },
    { pair: 'GBP/USD', name: 'British Pound / U.S. Dollar', type: 'Forex Major', spread: '0.00018' },
    { pair: 'USD/JPY', name: 'U.S. Dollar / Japanese Yen', type: 'Forex Major', spread: '0.015' },
    { pair: 'BTC/USD', name: 'Bitcoin / U.S. Dollar', type: 'Crypto', spread: '12.50' },
    { pair: 'ETH/USD', name: 'Ethereum / U.S. Dollar', type: 'Crypto', spread: '1.20' },
    { pair: 'US30', name: 'Dow Jones Industrial 30', type: 'Indices', spread: '1.50' },
    { pair: 'NAS100', name: 'Nasdaq 100 Index', type: 'Indices', spread: '0.80' }
  ];

  const filteredMarkets = listAllMarketProducts.filter(m => 
    m.pair.toLowerCase().includes(marketSearchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(marketSearchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(marketSearchQuery.toLowerCase())
  );

  // Render entire Trading Applet UI
  const renderAppletContent = () => {
    return (
      <div className="h-full flex flex-col justify-between bg-[#090d16] text-white overflow-hidden relative select-none">
        
        {/* UPPER HEADER BAR */}
        <div className="bg-[#111622]/90 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-zinc-900/50 z-30">
          {/* Greetings with Avatar on Left */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveBottomTab('profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_12px_rgba(99,102,241,0.35)] relative cursor-pointer active:scale-95 transition-all"
            >
              {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JH'}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#111622]" />
            </div>
            <div className="text-left flex flex-col justify-center">
              <span className="text-[10px] text-zinc-400 font-bold tracking-tight uppercase leading-none">بەیانیت باش / Good morning</span>
              <span className="text-xs font-black text-white mt-1 leading-none flex items-center gap-1">
                سڵاو، {user.name ? user.name.split(' ')[0] : 'جاک'} 👋
              </span>
            </div>
          </div>

          {/* Actions on Right: Account Switcher & Icons */}
          <div className="flex items-center gap-2">
            {/* Account Type Toggle Switch */}
            <div className="flex items-center bg-[#090d16] border border-zinc-800 p-0.5 rounded-xl">
              <button
                onClick={() => {
                  setAccountType('real');
                  localStorage.setItem(`acc_type_${userKey}`, 'real');
                  showToast('پەڕیتەوە بۆ هەژماری ڕاستەقینە (REAL)', 'success');
                }}
                className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  accountType === 'real'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ڕاستەقینە</span>
              </button>
              <button
                onClick={() => {
                  setAccountType('demo');
                  localStorage.setItem(`acc_type_${userKey}`, 'demo');
                  showToast('پەڕیتەوە بۆ هەژماری تاقیکردنەوە (DEMO) $10,000', 'info');
                }}
                className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  accountType === 'demo'
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-950/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>تاقیکردنەوە</span>
              </button>
            </div>

            {/* Desktop Mode Button */}
            <button
              onClick={() => {
                setViewMode('desktop');
                showToast('گۆڕدرا بۆ مۆدی کۆمپیوتەر / Desktop Mode Activated', 'success');
              }}
              className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-800 hover:text-white transition-all text-zinc-400 cursor-pointer"
              title="مۆدی کۆمپیوتەر"
            >
              <MonitorIcon className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-800 transition-colors text-zinc-300 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center border border-[#111622]" id="unread-notif-badge">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Gold Market Ticker Feed */}
        <MarketTicker />

        {/* MAIN VIEWPORT BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16 custom-scrollbar">
          
          {/* 1️⃣ HOME / TERMINAL DASHBOARD TAB */}
          {activeBottomTab === 'home' && (
            <div className="p-4 space-y-4 animate-fade-in">
              
              {/* TOTAL BALANCE CARD */}
              <div className={`bg-[#111622] rounded-2xl p-5 border shadow-xl relative overflow-hidden space-y-4 transition-all ${
                accountType === 'demo'
                  ? 'border-amber-500/40 shadow-[0_0_25px_rgba(234,179,8,0.12)]'
                  : 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
              }`}>
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header of Balance Card */}
                <div className="flex items-center justify-between">
                  {/* Account Badge Indicator */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black flex items-center gap-1.5 border ${
                      accountType === 'demo'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        accountType === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      {accountType === 'demo' ? 'هەژماری تاقیکردنەوە (DEMO)' : 'هەژماری ڕاستەقینە (REAL)'}
                    </span>

                    {accountType === 'demo' && (
                      <button
                        onClick={handleResetDemoBalance}
                        className="text-[9px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-amber-600 hover:text-slate-950 text-amber-400 font-bold transition-all border border-amber-500/20 cursor-pointer"
                        title="گەڕاندنەوەی باڵانس بۆ $10,000"
                      >
                        🔄 ڕێسێت ($10K)
                      </button>
                    )}
                  </div>

                  {/* Title of Balance Card */}
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-black">
                    <span className="text-[10px] uppercase tracking-wider">
                      {accountType === 'demo' ? 'Demo Balance' : 'Real Balance'}
                    </span>
                    <span className="text-zinc-500 text-[10px]">👁️</span>
                  </div>
                </div>

                {/* Main Middle section: Balance value and Sparkline */}
                <div className="flex items-center justify-between">
                  {/* Sparkline trend chart on the right */}
                  <div className="h-10 w-28 opacity-85">
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <defs>
                        <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={accountType === 'demo' ? "#f59e0b" : "#10b981"} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={accountType === 'demo' ? "#f59e0b" : "#10b981"} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,28 C10,25 15,10 25,18 C35,26 40,5 50,15 C60,25 70,8 80,12 C90,16 95,2 100,5"
                        fill="none"
                        stroke={accountType === 'demo' ? "#f59e0b" : "#10b981"}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0,28 C10,25 15,10 25,18 C35,26 40,5 50,15 C60,25 70,8 80,12 C90,16 95,2 100,5 L100,40 L0,40 Z"
                        fill="url(#sparkline-grad)"
                      />
                    </svg>
                  </div>

                  {/* Large Balance display */}
                  <div className="text-right">
                    <h2 className="text-2xl font-mono font-black text-white tracking-tight flex items-baseline justify-end gap-1">
                      <span className="text-lg text-zinc-400 font-sans mr-0.5">$</span>
                      {effectiveBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                </div>

                {/* Bottom section: Dynamic trend text and Buttons row */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900/40">
                  {/* Deposit and Withdraw side-by-side buttons */}
                  <div className="flex gap-2">
                    {/* Withdraw Button */}
                    <button 
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-4 py-2 text-[11px] font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-950/20 flex items-center gap-1.5 transition-all"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>

                    {/* Deposit Button */}
                    <button 
                      onClick={() => setIsDepositModalOpen(true)}
                      className="px-4 py-2 text-[11px] font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-950/20 flex items-center gap-1.5 transition-all"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Deposit</span>
                    </button>
                  </div>

                  {/* Percentage Today change */}
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 font-mono font-black flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      + 2.45% Today
                    </span>
                  </div>
                </div>

                {/* Substats block: Equity, Margin, Free Margin (Trading Terminal Essential) */}
                <div className="grid grid-cols-3 gap-1 pt-2.5 mt-2 border-t border-zinc-900/60 text-right text-[10px]">
                  <div>
                    <span className="text-zinc-500 block">مارجینی ئازاد / Free Margin</span>
                    <span className="font-mono text-emerald-400 font-extrabold mt-0.5 block">${currentFreeMargin.toLocaleString()}</span>
                  </div>
                  <div className="border-x border-zinc-900/60 px-1">
                    <span className="text-zinc-500 block">مارجینی بەکارهاتوو / Margin</span>
                    <span className="font-mono text-zinc-300 font-extrabold mt-0.5 block">${currentMargin.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">سەرمایە (Equity)</span>
                    <span className="font-mono text-[#eab308] font-extrabold mt-0.5 block">${currentEquity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ASSET SELECTOR CAROUSEL */}
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none snap-x text-right">
                  {renderAssetCard('XAU/USD', 'XAUUSD', 'Gold / USD', 0)}
                  {renderAssetCard('EUR/USD', 'EURUSD', 'Euro / USD', 1)}
                  {renderAssetCard('GBP/USD', 'GBPUSD', 'GBP / USD', 2)}
                  {renderAssetCard('BTC/USD', 'BTCUSD', 'Bitcoin / USD', 3)}
                </div>
                {/* Carousel dots indicator */}
                <div className="flex justify-center gap-1.5 mt-2">
                  <span className={`h-1.5 rounded-full transition-all ${selectedPair === 'XAU/USD' ? 'w-4 bg-[#eab308]' : 'w-1.5 bg-zinc-800'}`} />
                  <span className={`h-1.5 rounded-full transition-all ${selectedPair === 'EUR/USD' ? 'w-4 bg-[#eab308]' : 'w-1.5 bg-zinc-800'}`} />
                  <span className={`h-1.5 rounded-full transition-all ${selectedPair === 'GBP/USD' ? 'w-4 bg-[#eab308]' : 'w-1.5 bg-zinc-800'}`} />
                  <span className={`h-1.5 rounded-full transition-all ${selectedPair === 'BTC/USD' ? 'w-4 bg-[#eab308]' : 'w-1.5 bg-zinc-800'}`} />
                </div>
              </div>

              {/* MARKET SENTIMENT MODULE */}
              <div id="market-sentiment-card" className="bg-[#111622] rounded-2xl p-4 border border-zinc-900/80 shadow-lg space-y-3 text-right">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-900/60">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#eab308] bg-[#eab308]/10 px-2.5 py-0.5 rounded-full font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                    <span>{sentiment.statusLabelEn}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white">ئاڕاستەی بازاڕ / Market Sentiment</h4>
                    <TrendingUp className="w-4 h-4 text-[#eab308]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-extrabold">
                      <span>BUY {sentiment.buyPercent}%</span>
                      <span className="text-[10px] text-zinc-500 font-normal">({sentiment.totalBuys})</span>
                    </div>

                    <div className="font-extrabold text-[#eab308] text-xs">
                      {sentiment.statusLabel}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-rose-400 font-extrabold">
                      <span className="text-[10px] text-zinc-500 font-normal">({sentiment.totalSells})</span>
                      <span>{sentiment.sellPercent}% SELL</span>
                    </div>
                  </div>

                  {/* Dual-colored progress bar */}
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
                      style={{ width: `${sentiment.buyPercent}%` }} 
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500 ease-out" 
                      style={{ width: `${sentiment.sellPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 leading-relaxed flex items-center justify-between">
                  <span className="font-mono text-zinc-500">Based on {sentiment.totalBuys + sentiment.totalSells} inputs</span>
                  <p>ڕێژەی کڕین بەرامبەر بە فرۆشتن لەسەر بنەمای سیگناڵە چالاکەکان و گرێبەستە کراوەکانت</p>
                </div>
              </div>

              {/* INTERACTIVE LIVE CHART MODULE */}
              <div className="bg-[#111622] rounded-2xl p-4 border border-zinc-900/80 shadow-lg space-y-3">
                
                {/* Chart Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setChartType(prev => prev === 'candles' ? 'line' : 'candles')}
                      className={`p-1.5 rounded-lg border ${chartType === 'candles' ? 'border-[#eab308]/40 bg-[#eab308]/5 text-[#eab308]' : 'border-zinc-800 text-zinc-400'}`}
                      title="گۆڕینی جۆری چارت"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex gap-1 text-[10px] font-bold">
                      {(['1m', '5m', '15m', '1h', '4h', 'D'] as const).map(tf => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-2 py-1 rounded ${timeframe === tf ? 'bg-[#eab308] text-slate-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#eab308] fill-[#eab308]" />
                    <h3 className="text-xs font-black text-white font-mono">{selectedPair.replace('/', '')}</h3>
                  </div>
                </div>

                {/* Subinfo Line */}
                <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-900/60 pb-2">
                  <div className="font-mono text-emerald-400 flex items-center gap-1.5">
                    <span>+1.50 (+0.06%)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-zinc-300">
                      O <span className="text-zinc-500">{(marketPrices[selectedPair]?.price - 1.2).toFixed(selectedPair.includes('JPY') ? 3 : 5)}</span> | 
                      H <span className="text-zinc-500">{(marketPrices[selectedPair]?.high).toFixed(selectedPair.includes('JPY') ? 3 : 5)}</span> | 
                      L <span className="text-zinc-500">{(marketPrices[selectedPair]?.low).toFixed(selectedPair.includes('JPY') ? 3 : 5)}</span>
                    </span>
                  </div>
                </div>

                {/* MarketChart Component (Recharts) */}
                <MarketChart
                  candles={candles}
                  activeTrades={activeTrades}
                  selectedPair={selectedPair}
                  currentPrice={marketPrices[selectedPair]?.price}
                  chartType={chartType}
                  timeframe={timeframe}
                  candleTimerSeconds={candleTimerSeconds}
                  height={360}
                  onCloseTrade={handleCloseTrade}
                  onSelectTimeframe={setTimeframe}
                  onToggleChartType={() => setChartType(prev => prev === 'candles' ? 'line' : 'candles')}
                />

                {/* Chart Toolbar Tools */}
                <div className="flex items-center justify-around border-t border-zinc-900/60 pt-2 text-zinc-500">
                  <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
                  <Settings className="w-4 h-4 hover:text-white cursor-pointer" />
                  <span className="text-[10px] font-bold hover:text-white cursor-pointer select-none">𝑓𝑥</span>
                  <Sliders className="w-4 h-4 hover:text-white cursor-pointer" />
                  <TrendingUp className="w-4 h-4 hover:text-white cursor-pointer" />
                </div>
              </div>

              {/* TRADING ACTIONS / ORDER ENGINE */}
              <div className="bg-[#111622] rounded-2xl p-4 border border-zinc-900/80 shadow-lg space-y-4 text-right">
                
                {/* Lot size configurations */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    <button 
                      onClick={() => setLotSize(prev => Math.max(0.01, Number((prev + 0.05).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 text-white font-extrabold flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                    <input 
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="10"
                      value={lotSize}
                      onChange={(e) => setLotSize(Math.max(0.01, Number(parseFloat(e.target.value).toFixed(2)) || 0.10))}
                      className="w-16 bg-transparent text-center font-mono font-black text-white text-xs outline-none"
                    />
                    <button 
                      onClick={() => setLotSize(prev => Math.max(0.01, Number((prev - 0.05).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 text-white font-extrabold flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-black">حجم گرێبەست / Lot Size</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5 block">مارجینی پێویست: ${(lotSize * 1000).toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Instant Buy / Sell Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* BUY BUTTON */}
                  <button
                    onClick={() => handleOpenTrade('BUY')}
                    className="py-3.5 px-3 bg-[#10b981] hover:bg-emerald-600 transition-all text-white rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span className="text-[11px] font-black tracking-widest flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> کڕین ▲ BUY
                    </span>
                    <span className="text-xs font-mono font-extrabold mt-1">
                      {(marketPrices[selectedPair]?.price + (selectedPair === 'XAU/USD' ? 0.15 : (selectedPair === 'USD/JPY' ? 0.012 : 0.00015))).toFixed(selectedPair.includes('JPY') ? 3 : (selectedPair === 'XAU/USD' ? 2 : 5))}
                    </span>
                  </button>

                  {/* SELL BUTTON */}
                  <button
                    onClick={() => handleOpenTrade('SELL')}
                    className="py-3.5 px-3 bg-[#f43f5e] hover:bg-rose-600 transition-all text-white rounded-xl shadow-lg shadow-rose-950/20 active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span className="text-[11px] font-black tracking-widest flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" /> فرۆشتن ▼ SELL
                    </span>
                    <span className="text-xs font-mono font-extrabold mt-1">
                      {(marketPrices[selectedPair]?.price - (selectedPair === 'XAU/USD' ? 0.15 : (selectedPair === 'USD/JPY' ? 0.012 : 0.00015))).toFixed(selectedPair.includes('JPY') ? 3 : (selectedPair === 'XAU/USD' ? 2 : 5))}
                    </span>
                  </button>
                </div>
              </div>

              {/* QUICK POSITIONS FEED */}
              <div className="bg-[#111622] rounded-2xl p-4 border border-zinc-900/80 shadow-lg text-right space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-900/60">
                  <button 
                    onClick={() => setActiveBottomTab('trades')}
                    className="text-[10px] font-black text-[#eab308] hover:underline"
                  >
                    بینینی هەمووی (See All)
                  </button>
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <span>پۆزیشنە کراوەکان</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                  </h4>
                </div>

                {activeTrades.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 space-y-1.5">
                    <Activity className="w-7 h-7 mx-auto text-zinc-600" />
                    <p className="text-[10px] font-bold text-zinc-400">هیچ پۆزیشنێکی کڕین یان فرۆشتنی لایڤ نییە!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeTrades.slice(0, 3).map((trade) => {
                      const isUp = trade.pnl >= 0;
                      return (
                        <div 
                          key={trade.id} 
                          className="bg-[#090d16] p-3 rounded-xl border border-zinc-900/80 flex items-center justify-between"
                        >
                          <button 
                            onClick={() => handleCloseTrade(trade.id)}
                            className="px-2.5 py-1 text-[9px] font-black bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/10 transition-all cursor-pointer"
                          >
                            داخستن
                          </button>
                          
                          <div className="text-center">
                            <span className={`text-[10px] font-mono font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isUp ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                            <span className="text-[8px] text-zinc-500 block mt-0.5">
                              {((trade.pnl / (trade.amount || 100)) * 100).toFixed(2)}%
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-xs text-white block">
                              {trade.pair.replace('/', '')} <span className={`text-[9px] px-1 py-0.2 rounded font-black ${trade.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                {trade.type}
                              </span>
                            </span>
                            <span className="text-[9px] text-zinc-500 block mt-0.5">
                              قەبارە: {trade.lotSize.toFixed(2)} لۆت | نرخ: {trade.entryPrice}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 2️⃣ MARKETS WATCHLIST TAB */}
          {activeBottomTab === 'markets' && (
            <div className="p-4 space-y-4 animate-fade-in text-right">
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-white">چاودێری بازاڕەکان (Markets Live)</h3>
                <p className="text-[10px] text-zinc-400">تەواوی نرخی لایڤی جووتە دراوەکان، کریپتۆ، زێڕ و نیشاندەرە جیهانییەکان</p>
              </div>

              {/* Search filter input */}
              <div className="relative">
                <input 
                  type="text"
                  value={marketSearchQuery}
                  onChange={(e) => setMarketSearchQuery(e.target.value)}
                  placeholder="گەڕان لە نێوان دراو و سەرچاوە داراییەکان..."
                  className="w-full bg-[#111622] border border-zinc-800 text-white px-4 py-2.5 pr-9 rounded-xl text-xs outline-none focus:border-[#eab308] text-right font-bold"
                />
                <Sliders className="absolute top-3 left-3 w-4 h-4 text-zinc-500" />
              </div>

              {/* Markets Grid List */}
              <div className="space-y-2.5">
                {filteredMarkets.map((prod) => {
                  // Fallback pricing if not defined in state
                  const baseData = marketPrices[prod.pair as keyof typeof marketPrices] || { price: 2.35, change: 0.12 };
                  const isUp = baseData.change >= 0;
                  
                  return (
                    <div 
                      key={prod.pair}
                      onClick={() => {
                        if (['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'].includes(prod.pair)) {
                          setSelectedPair(prod.pair as any);
                          setActiveBottomTab('home');
                          showToast(`${prod.pair} خرایە سەر چارتەکەت`, 'info');
                        } else {
                          showToast(`ئەم بەرهەمە لەم کاتەدا لە کاتی بازرگانی کراوە نییە!`, 'info');
                        }
                      }}
                      className="bg-[#111622] hover:bg-[#121b2d] p-3.5 rounded-xl border border-zinc-900/80 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="text-left font-mono">
                        <span className={`text-xs font-black block ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{baseData.change}%
                        </span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 block">پێشخستن: {prod.spread}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-white block">
                          {baseData.price.toLocaleString(undefined, { minimumFractionDigits: prod.pair.includes('USD') && !prod.pair.startsWith('XAU') ? 5 : 2 })}
                        </span>
                        <span className="text-[9px] text-[#eab308] block mt-0.5">{prod.pair}</span>
                      </div>

                      <div className="text-right max-w-[150px]">
                        <h4 className="text-xs font-black text-white">{prod.pair.replace('/', '')}</h4>
                        <p className="text-[9px] text-zinc-400 mt-0.5 truncate">{prod.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3️⃣ PORTFOLIO & HISTORIC TRADES TAB */}
          {activeBottomTab === 'trades' && (
            <div className="p-4 space-y-4 animate-fade-in text-right">
              
              {/* PORTFOLIO BALANCE DETAILS */}
              <div className={`bg-[#111622] rounded-2xl p-5 border space-y-4 relative transition-all ${
                accountType === 'demo'
                  ? 'border-amber-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                  : 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 border ${
                      accountType === 'demo'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        accountType === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      {accountType === 'demo' ? 'تاقیکردنەوە (DEMO)' : 'ڕاستەقینە (REAL)'}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white">کاپیتالی پۆرتفۆلیۆ ({accountType.toUpperCase()})</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">مارجینی ئازاد (Free Margin)</span>
                    <span className="font-mono text-sm font-black text-emerald-400 mt-1 block">${currentFreeMargin.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">مارجینی قوفڵکراو</span>
                    <span className="font-mono text-sm font-black text-zinc-300 mt-1 block">${currentMargin.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block">کۆی قازانج/زیانی لایڤ</span>
                    <span className={`font-mono text-sm font-black mt-1 block ${totalActivePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalActivePnl >= 0 ? '+' : ''}${totalActivePnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block">باڵانسی خاوێن ({accountType.toUpperCase()})</span>
                    <span className="font-mono text-sm font-black text-white mt-1 block">${effectiveBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* LIST OF OPEN TRADES & CLOSE ALL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {filteredActiveTrades.length > 0 && (
                    <button 
                      onClick={handleCloseAllTrades}
                      className="text-[10px] px-2.5 py-1 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 font-bold hover:bg-rose-600 hover:text-white transition-all"
                    >
                      داخستنی هەموو پۆزیشنەکان ⚠️
                    </button>
                  )}
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <span>پۆزیشنی چالاک ({filteredActiveTrades.length}) - {accountType === 'demo' ? 'DEMO' : 'REAL'}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${accountType === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  </h3>
                </div>

                {filteredActiveTrades.length === 0 ? (
                  <div className="bg-[#111622] rounded-2xl p-8 border border-zinc-900/80 text-center text-zinc-500 space-y-2">
                    <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs font-bold text-zinc-400">تائێستا هیچ گرێبەستێکی کراوە بەردەست نییە لە هەژماری {accountType === 'demo' ? 'تاقیکردنەوە' : 'ڕاستەقینە'}!</p>
                    <p className="text-[10px] text-zinc-500">سەردانی بەشی سەرەکی بکە بۆ کردنەوەی ئۆردەر.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredActiveTrades.map((trade) => {
                      const isUp = trade.pnl >= 0;
                      return (
                        <div 
                          key={trade.id} 
                          className="bg-[#111622] p-4 rounded-xl border border-zinc-900/80 flex items-center justify-between text-right"
                        >
                          <div className="flex items-center gap-2.5">
                            <button 
                              onClick={() => handleCloseTrade(trade.id)}
                              className="px-3.5 py-1.5 text-xs font-black bg-rose-600/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                            >
                              داخستن
                            </button>
                          </div>

                          <div className="text-center font-mono">
                            <span className={`text-xs font-black block ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isUp ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-zinc-500 block mt-0.5">
                              {((trade.pnl / (trade.amount || 100)) * 100).toFixed(2)}%
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-mono font-black text-white block">
                              {trade.pair.replace('/', '')} 
                              <span className={`text-[9px] px-1 py-0.2 rounded font-black ml-1.5 ${trade.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                {trade.type}
                              </span>
                            </span>
                            <span className="text-[9px] text-zinc-400 block mt-0.5">
                              لۆت: {trade.lotSize.toFixed(2)} | چوونەژوورەوە: {trade.entryPrice}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DYNAMIC ACTIVITY & TRANSACTION LOGS */}
              <div className="bg-[#111622] p-4 rounded-2xl border border-zinc-900/80 space-y-3.5 mt-4">
                <div className="border-b border-zinc-850 pb-2 text-right">
                  <h3 className="text-xs font-black text-white flex items-center gap-2 justify-end">
                    <span>مێژووی دوایین چالاکییەکان</span>
                    <History className="w-4 h-4 text-[#eab308]" />
                  </h3>
                </div>

                {getActivityLogs(userKey).length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-zinc-500">
                    هیچ لۆگێکی چالاکی فەرمی بوونی نییە.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {getActivityLogs(userKey).slice(0, 4).map((log, index) => (
                      <div key={index} className="bg-[#090d16] p-3 rounded-lg border border-zinc-900 text-right space-y-1">
                        <div className="flex items-center justify-between text-[8.5px] text-zinc-500">
                          <span>{log.date}</span>
                          <strong className="text-zinc-400">{log.title}</strong>
                        </div>
                        <p className="text-[9.5px] text-zinc-400 leading-normal">{log.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 4️⃣ TRADING VIP SIGNALS TAB */}
          {activeBottomTab === 'signals' && (
            <div className="p-4 space-y-4 animate-fade-in text-right">
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-white flex items-center gap-2 justify-end">
                  <span>سیگناڵەکانی بازاڕ (LIVECALLS)</span>
                  <Bell className="w-4 h-4 text-[#eab308] animate-bounce" />
                </h3>
                <p className="text-[10px] text-zinc-400">سیگناڵەکانی کڕین و فرۆشتنی زێڕ و جووتە دراوەکان بە ڕێژەی سەرکەوتنی بەرز</p>
              </div>

              {signalsList.length === 0 ? (
                <div className="bg-[#111622] p-8 rounded-2xl border border-zinc-900/80 text-center space-y-3 text-zinc-500">
                  <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-400">لە ئێستادا هیچ سیگناڵێکی نوێ چالاک نییە!</p>
                  <p className="text-[10px] text-zinc-500">دوای شیکردنەوەی چارتەکان لێرە نوێ دەکرێتەوە.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {signalsList.map((sig) => {
                    const isBuy = sig.type === 'BUY';
                    const isClosed = sig.status === 'CLOSED' || sig.status === 'STOP_LOSS';
                    
                    return (
                      <div 
                        key={sig.id}
                        className={`bg-[#111622] p-4 rounded-xl border relative overflow-hidden ${
                          isClosed ? 'border-zinc-900/80 opacity-70' : 'border-zinc-800'
                        }`}
                      >
                        {/* Status Label on corner */}
                        <span className={`absolute top-0 left-0 text-[8.5px] font-black px-2.5 py-1 rounded-br-lg ${
                          sig.status.startsWith('HIT') ? 'bg-emerald-500 text-white' :
                          sig.status === 'STOP_LOSS' ? 'bg-rose-500 text-white' :
                          'bg-[#eab308] text-slate-950 animate-pulse'
                        }`}>
                          {sig.status === 'ACTIVE' ? 'بەرکار و چالاک' : sig.status}
                        </span>

                        <div className="flex items-center justify-between pb-2 border-b border-zinc-850 mt-2">
                          <span className="text-[9px] text-zinc-500 font-mono">{sig.createdAt}</span>
                          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                            <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-black ${isBuy ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                              {isBuy ? 'کڕین / BUY' : 'فرۆشتن / SELL'}
                            </span>
                            <span className="font-mono text-white">{sig.pair}</span>
                          </h4>
                        </div>

                        {/* Targets grid details */}
                        <div className="grid grid-cols-2 gap-3.5 pt-3 text-[10px] font-mono text-zinc-300">
                          <div>
                            <span className="text-zinc-500 block font-sans">نرخی چوونە ژوور (Entry)</span>
                            <span className="font-extrabold text-white block mt-0.5">{sig.entry}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block font-sans">قازانجی یەکەم (TP-1)</span>
                            <span className="font-extrabold text-emerald-400 block mt-0.5">{sig.tp1}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block font-sans">قازانجی کۆتایی (TP-3)</span>
                            <span className="font-extrabold text-emerald-400 block mt-0.5">{sig.tp3}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block font-sans">ئاستی زیان (Stop Loss)</span>
                            <span className="font-extrabold text-rose-400 block mt-0.5">{sig.sl}</span>
                          </div>
                        </div>

                        {sig.notes && (
                          <p className="text-[9px] text-zinc-400 leading-normal mt-3 bg-[#090d16] p-2 rounded-lg border border-zinc-900">
                            <strong>بینیەر:</strong> {sig.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5️⃣ PROFILE & SETTINGS TAB */}
          {activeBottomTab === 'profile' && (
            <div className="p-4 space-y-4 animate-fade-in text-right">
              
              {/* USER META CARD */}
              <div className="bg-[#111622] p-5 rounded-2xl border border-zinc-900/80 text-center space-y-3 relative overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-[#eab308]/10 border border-[#eab308]/60 flex items-center justify-center mx-auto shadow-inner shadow-yellow-950/20">
                  <UserIcon className="w-7 h-7 text-[#eab308]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">{user.name}</h3>
                  <p className="text-[9.5px] text-zinc-400 mt-1 font-mono">حیسابی فەرمی: {user.fib}</p>
                </div>

                {user.verificationStatus === 'approved' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold mx-auto">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ناسنامە ڤێریفای کراوە (KYC Verified)</span>
                  </div>
                ) : user.verificationStatus === 'pending' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-bold mx-auto">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>داواکاری KYC لە ژێر چاودێریدایە</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/60 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-bold mx-auto">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>پڕۆفایل پشتڕاست نەکراوەتەوە (No KYC)</span>
                  </div>
                )}
              </div>

              {/* ACCOUNT SETTINGS FORM */}
              <div className="bg-[#111622] p-4 rounded-2xl border border-zinc-900/80 space-y-4">
                <div className="border-b border-zinc-850 pb-2">
                  <h4 className="text-xs font-black text-white">ڕێکخستن و پاراستنی پڕۆفایل</h4>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">ناوی تەواو (ناوی سیانی)</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#090d16] border border-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eab308] font-bold text-right"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">ژمارەی ناسنامەی گشتی</label>
                    <input
                      type="text"
                      value={editFib}
                      onChange={(e) => setEditFib(e.target.value)}
                      className="w-full bg-[#090d16] border border-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">تێپەڕەوشەی نوێ (ئارەزوومەندانە)</label>
                    <input
                      type="password"
                      value={editPass}
                      onChange={(e) => setEditPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#090d16] border border-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#eab308] hover:bg-yellow-500 text-slate-900 font-black rounded-xl text-xs shadow-md cursor-pointer transition-all"
                  >
                    پاشەکەوتکردنی گۆڕانکارییەکان
                  </button>
                </form>
              </div>

              {/* ID VERIFICATION FORM PANEL (KYC) */}
              {user.verificationStatus !== 'approved' && (
                <div className="bg-[#111622] p-4 rounded-2xl border border-zinc-900/80 space-y-4">
                  <div className="border-b border-zinc-850 pb-2">
                    <h4 className="text-xs font-black text-white">پشتڕاستکردنەوەی ناسنامە (KYC)</h4>
                  </div>

                  {user.verificationStatus === 'pending' ? (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-center space-y-2">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                      <h4 className="text-xs font-black text-white">بەڵگەنامەکان لەژێر وردبینیدان</h4>
                      <p className="text-[10px] text-zinc-400">ئەدمینەکان بەم زووانە بەدواداچوونی بۆ دەکەن.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitVerification} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold block">مۆبایلی فەرمی</label>
                        <input
                          type="text"
                          value={verifyPhone}
                          onChange={(e) => setVerifyPhone(e.target.value)}
                          placeholder="0750xxxxxxx"
                          className="w-full bg-[#090d16] border border-zinc-800 text-white px-3 py-2.5 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold block">ژمارەی پاسپۆرت یان مۆڵەتی شۆفێری</label>
                        <input
                          type="text"
                          value={verifyIdNumber}
                          onChange={(e) => setVerifyIdNumber(e.target.value)}
                          placeholder="A1890xxxxx"
                          className="w-full bg-[#090d16] border border-zinc-800 text-white px-3 py-2.5 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        ناردنی داواکاری پشتڕاستکردنەوە
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ACCOUNT DELETION PANEL */}
              <div className="bg-[#111622] p-4 rounded-2xl border border-zinc-900/80 space-y-3">
                <h4 className="text-xs font-black text-rose-500">سڕینەوەی یەکجاری ئەکاونت</h4>
                <p className="text-[10px] text-zinc-500">سڕینەوەی حسابت سەرجەم چالاکی، باڵانس و ڕێکخستنەکانت لە داتابەیس حەذف دەکات.</p>

                <form onSubmit={handleConfirmDeleteAccount} className="space-y-2.5">
                  <input
                    type="password"
                    value={deleteConfirmPass}
                    onChange={(e) => setDeleteConfirmPass(e.target.value)}
                    placeholder="وشەی نهێنی بۆ پشتڕاستکردنەوە لێرە بنووسە"
                    className="w-full bg-[#090d16] border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500 text-right font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    بەڵێ، حسابەکەم بسڕەوە ⚠️
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* FLOATING BOTTOM MOBILE NAVIGATION BAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#111622]/95 backdrop-blur-md border-t border-zinc-900/80 px-2 py-1.5 flex items-center justify-around z-30">
          
          {/* PROFILE BUTTON */}
          <button 
            onClick={() => setActiveBottomTab('profile')}
            className={`flex flex-col items-center flex-1 py-1 transition-colors relative ${activeBottomTab === 'profile' ? 'text-[#eab308]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            <span className="text-[9.5px] font-black mt-1">Profile</span>
          </button>

          {/* SIGNALS BUTTON */}
          <button 
            onClick={() => setActiveBottomTab('signals')}
            className={`flex flex-col items-center flex-1 py-1 transition-colors relative ${activeBottomTab === 'signals' ? 'text-[#eab308]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="text-[9.5px] font-black mt-1">Signals</span>
          </button>

          {/* TRADES BUTTON */}
          <button 
            onClick={() => setActiveBottomTab('trades')}
            className={`flex flex-col items-center flex-1 py-1 transition-colors relative ${activeBottomTab === 'trades' ? 'text-[#eab308]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <History className="w-4.5 h-4.5" />
            <span className="text-[9.5px] font-black mt-1">Trades</span>
          </button>

          {/* MARKETS BUTTON */}
          <button 
            onClick={() => setActiveBottomTab('markets')}
            className={`flex flex-col items-center flex-1 py-1 transition-colors relative ${activeBottomTab === 'markets' ? 'text-[#eab308]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <BarChart2 className="w-4.5 h-4.5" />
            <span className="text-[9.5px] font-black mt-1">Markets</span>
          </button>

          {/* HOME BUTTON */}
          <button 
            onClick={() => setActiveBottomTab('home')}
            className={`flex flex-col items-center flex-1 py-1 transition-colors relative ${activeBottomTab === 'home' ? 'text-[#eab308]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span className="text-[9.5px] font-black mt-1">Home</span>
          </button>
        </div>

        {/* 🪙 GLOBAL DEPOSIT INFORMATION MODAL */}
        {isDepositModalOpen && (
          <div 
            onClick={() => setIsDepositModalOpen(false)}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer text-right"
          >
            <div 
              className="bg-[#111622] border border-zinc-800 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 relative shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsDepositModalOpen(false)}
                className="absolute top-4 left-4 p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-center gap-2 text-[#eab308] font-bold text-base">
                  <Smartphone className="w-5 h-5" />
                  <span>بارکردنی باڵانس (USDT TRC-20)</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">Tether USDT (TRC-20) Network</p>
              </div>

              <div className="bg-[#090d16] border border-zinc-900 rounded-2xl p-4 text-center space-y-2 shadow-inner">
                <span className="text-xs text-zinc-300 font-bold block">ناونیشانی جزدانی USDT فەرمی:</span>
                <div className="flex flex-col items-center justify-center gap-2 bg-[#111622] border border-zinc-800 p-2.5 rounded-xl">
                  <span className="text-[10px] sm:text-xs font-mono font-black text-[#eab308] select-all tracking-wider break-all leading-relaxed">
                    TNxFn1smwabHz8PREquhcChZiQNg8uGXxm
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('TNxFn1smwabHz8PREquhcChZiQNg8uGXxm');
                      showToast('ناونیشانی USDT (TRC-20) کۆپی کرا!', 'success');
                    }}
                    className="px-4 py-1.5 bg-[#090d16] hover:bg-zinc-900 border border-zinc-800 rounded-lg text-[#eab308] transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>کۆپیکردن</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#090d16] border border-zinc-900 rounded-xl p-3 text-right text-[11px] text-zinc-400 space-y-1 leading-normal">
                <strong className="text-[#eab308] font-bold block">شێوازی ناردن:</strong>
                <p>پارەکە لەڕێگەی تۆڕی ترۆن TRC-20 ڕەوانەی ئەم جزدانە بکە، پاشان وێنەی پسوولە بنێرە لە ڕێگەی دەسکتۆپ یان چات تا خێرا باڵانست پڕبکرێتەوە.</p>
              </div>

              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="w-full py-2.5 bg-zinc-900 border border-zinc-800 text-[#eab308] hover:text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                داخستنی لاپەڕە
              </button>
            </div>
          </div>
        )}

        {/* 💳 GLOBAL WITHDRAW REQUEST FORM MODAL */}
        {isWithdrawModalOpen && (
          <div 
            onClick={() => setIsWithdrawModalOpen(false)}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm text-right cursor-pointer"
          >
            <div 
              className="bg-[#111622] border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-[#eab308]">
                  <h3 className="font-extrabold text-white text-sm">داواکاری ڕاکێشانی قازانج (USDT TRC-20)</h3>
                  <Wallet className="w-4.5 h-4.5" />
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-bold block">ناونیشانی جزدانی کریپتۆ (USDT TRC-20 Destination)</label>
                  <input
                    type="text"
                    required
                    value={withdrawFib}
                    onChange={(e) => setWithdrawFib(e.target.value)}
                    placeholder="T..."
                    className="w-full bg-[#090d16] border border-zinc-800 text-white px-4 py-3 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#eab308] font-bold">زۆرترین بڕ: $1,000</span>
                    <label className="text-xs text-zinc-400 font-bold block">بڕی پارە بە دۆلار ($)</label>
                  </div>
                  <input
                    type="number"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="بۆ نموونە: 250"
                    className="w-full bg-[#090d16] border border-zinc-800 text-white px-4 py-3 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 py-3 bg-[#090d16] hover:bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 font-bold"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg"
                  >
                    ناردنی داواکاری ڕاکێشان
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🔔 GLOBAL SYSTEM NOTIFICATIONS SIDE PANEL */}
        {isNotificationsOpen && (
          <div 
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" 
            onClick={() => setIsNotificationsOpen(false)}
          >
            <div 
              className="w-full max-w-xs bg-[#111622] border-l border-zinc-900 h-full p-5 space-y-5 overflow-y-auto text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 rounded-full bg-[#090d16] text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>ئاگادارکردنەوەکان</span>
                  <Bell className="w-4.5 h-4.5 text-[#eab308]" />
                </h3>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 rounded-xl border text-right space-y-1.5 transition-all ${
                      n.read ? 'bg-zinc-950/40 border-zinc-900 text-zinc-500' : 'bg-zinc-950 border-zinc-900 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] text-zinc-500 font-mono">{n.time}</span>
                      <h4 className="text-xs font-extrabold text-white">{n.title}</h4>
                    </div>
                    <p className="text-[10px] leading-relaxed text-zinc-400">{n.text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadNotifications(0);
                  showToast('تەواوی ئاگادارکردنەوەکان خوێندرانەوە!', 'info');
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-400 text-center font-bold"
              >
                هەموو نیشانە بکە وەک بینراو
              </button>
            </div>
          </div>
        )}

      </div>
    );
  };

  if (viewMode === 'mobile') {
    return renderAppletContent();
  }

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white font-sans flex flex-col justify-between select-none relative pb-10">
      
      {/* 1. MT4 TOP ACCOUNT STATUS RIBBON */}
      <div className="bg-[#111622] border-b border-zinc-900 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono z-30">
        <div className="flex items-center gap-2">
          {/* Mr Pocket Branding */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-700 flex items-center justify-center border border-rose-500/20 shadow-md">
              <span className="text-white font-black text-sm tracking-tighter">M</span>
            </div>
            <div className="flex items-center text-right">
              <span className="text-white font-black text-xs">Mr</span>
              <span className="text-rose-500 font-black text-xs ml-0.5">pocket</span>
            </div>
          </div>
          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-sans font-bold uppercase tracking-wider ml-1">WebTerminal MT4</span>

          {/* Account Type Segmented Switcher */}
          <div className="flex items-center bg-[#090d16] border border-zinc-800 p-0.5 rounded-xl ml-2">
            <button
              onClick={() => {
                setAccountType('real');
                localStorage.setItem(`acc_type_${userKey}`, 'real');
                showToast('پەڕیتەوە بۆ هەژماری ڕاستەقینە (REAL)', 'success');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                accountType === 'real'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ڕاستەقینە (REAL)</span>
            </button>
            <button
              onClick={() => {
                setAccountType('demo');
                localStorage.setItem(`acc_type_${userKey}`, 'demo');
                showToast('پەڕیتەوە بۆ هەژماری تاقیکردنەوە (DEMO) $10,000', 'info');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                accountType === 'demo'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-950/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>تاقیکردنەوە (DEMO)</span>
            </button>
          </div>
        </div>

        {/* Account balance stats like real MT4 */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[11px] text-zinc-400">
          <div>
            <span>باڵانس ({accountType === 'demo' ? 'DEMO' : 'REAL'}): </span>
            <span className={`font-bold font-mono ${accountType === 'demo' ? 'text-amber-400' : 'text-emerald-400'}`}>
              ${effectiveBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <span>سەرمایە / Equity: </span>
            <span className="text-[#eab308] font-bold font-mono">${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <span>مارجینی بەکارهاتوو / Margin: </span>
            <span className="text-zinc-300 font-bold font-mono">${currentMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <span>مارجینی ئازاد / Free Margin: </span>
            <span className="text-emerald-400 font-bold font-mono">${currentFreeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <span>قازانج/زیان / Profit: </span>
            <span className={`font-bold font-mono ${totalActivePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalActivePnl >= 0 ? '+' : ''}${totalActivePnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Deposit/Withdraw fast links */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white rounded-lg font-sans font-black text-[10px] transition-all cursor-pointer"
          >
            Withdraw / ڕاکێشان
          </button>
          <button 
            onClick={() => setIsDepositModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-sans font-black text-[10px] transition-all shadow-md shadow-blue-950/20 cursor-pointer"
          >
            Deposit / بارکردن
          </button>
        </div>
      </div>

      {/* Live Gold Market Ticker Feed */}
      <MarketTicker />

      {/* 2. MAIN MT4 RESPONSIVE GRID LAYOUT */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: MARKET WATCH & NAVIGATOR (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Market Watch watchlist panel */}
          <div className="bg-[#111622] rounded-2xl border border-zinc-900/80 p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
              <span className="text-[10px] text-zinc-500 font-mono">Quotes / Live prices</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5 justify-end">
                <span>چاودێری بازاڕ / Market Watch</span>
                <Sliders className="w-3.5 h-3.5 text-[#eab308]" />
              </h3>
            </div>

            {/* Quick search */}
            <input 
              type="text"
              value={marketSearchQuery}
              onChange={(e) => setMarketSearchQuery(e.target.value)}
              placeholder="گەڕان لە نێوان سەرچاوەکان..."
              className="w-full bg-[#090d16] border border-zinc-800 text-white px-3 py-1.5 rounded-xl text-[11px] outline-none focus:border-[#eab308] text-right font-bold"
            />

            {/* Watchlist table */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {filteredMarkets.map((prod) => {
                const isSelected = selectedPair === prod.pair;
                const baseData = marketPrices[prod.pair as keyof typeof marketPrices] || { price: 0, change: 0 };
                const isUp = baseData.change >= 0;
                return (
                  <div 
                    key={prod.pair}
                    onClick={() => {
                      if (['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD'].includes(prod.pair)) {
                        setSelectedPair(prod.pair as any);
                        showToast(`${prod.pair} نیشاندرا لەسەر چارتەکە`, 'info');
                      } else {
                        showToast(`ئەم بەرهەمە لەم کاتەدا لە کاتی بازرگانی کراوە نییە!`, 'info');
                      }
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#1e273d] border-blue-500/50 shadow-inner' 
                        : 'bg-[#090d16]/50 border-zinc-900 hover:bg-[#111622] hover:border-zinc-850'
                    }`}
                  >
                    <div className="text-left font-mono">
                      <span className={`text-[10px] font-bold block ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? '▲' : '▼'} {baseData.change}%
                      </span>
                      <span className="text-[8.5px] text-zinc-500 block">spread: {prod.spread}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono font-black text-white block">
                        {baseData.price.toLocaleString(undefined, { minimumFractionDigits: prod.pair.includes('USD') && !prod.pair.startsWith('XAU') && !prod.pair.startsWith('BTC') ? 5 : 2 })}
                      </span>
                      <span className={`text-[9.5px] font-black block ${isSelected ? 'text-[#eab308]' : 'text-zinc-400'}`}>
                        {prod.pair}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigator containing Profile & Support Bot quick entry */}
          <div className="bg-[#111622] rounded-2xl border border-zinc-900/80 p-4 space-y-3 shadow-lg text-right">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
              <span className="text-[10px] text-zinc-500 font-mono">Account info</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>ناڤیگاتۆر / Navigator</span>
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              </h3>
            </div>

            <div className="bg-[#090d16]/80 p-3 rounded-xl border border-zinc-900 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto relative">
                <UserIcon className="w-5 h-5 text-blue-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#111622]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{user.name}</h4>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">ID: {user.fib}</p>
              </div>

              {user.verificationStatus === 'approved' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/40 text-emerald-400 text-[9px] font-bold rounded-full">
                  ✓ ناسنامە پشتڕاستکراوە
                </span>
              ) : (
                <button 
                  onClick={() => {
                    setActiveBottomTab('profile');
                    showToast('تکایە لێرە زانیاری مۆبایل و پاسپۆرت پێشکەش بکە بۆ پشتڕاستکردنەوەی ناسنامە (KYC).', 'info');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/40 text-amber-400 text-[9px] font-bold rounded-full hover:bg-amber-900/40 transition-all"
                >
                  ⚠ پێویستی بە KYC هەیە
                </button>
              )}
            </div>

            {/* Quick action buttons for navigator */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10.5px]">
              <button 
                onClick={() => {
                  setActiveBottomTab('profile');
                  showToast('چوونە ڕێکخستنەکانی پڕۆفایل', 'info');
                }}
                className={`p-2 rounded-xl border font-bold transition-all ${
                  activeBottomTab === 'profile' ? 'bg-[#eab308] text-slate-900 border-[#eab308]' : 'bg-[#090d16] border-zinc-900 hover:border-zinc-800 text-zinc-300'
                }`}
              >
                Profile / پڕۆفایل
              </button>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(true);
                }}
                className="p-2 rounded-xl bg-[#090d16] border border-zinc-900 hover:border-zinc-800 font-bold text-zinc-300 relative transition-all"
              >
                Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center border border-[#111622]">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE INTERACTIVE MT4 CHART & QUICK TRADE ENGINE (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Candle Chart panel */}
          <div className="bg-[#111622] rounded-2xl border border-zinc-900/80 p-4 space-y-3 shadow-lg">
            
            {/* Toolbar row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900/60 pb-3">
              
              {/* Asset & price indicator */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#eab308]/10 border border-[#eab308]/30 flex items-center justify-center text-[#eab308] font-mono font-black text-xs">
                  {selectedPair === 'XAU/USD' ? 'Au' : (selectedPair === 'BTC/USD' ? '₿' : '$')}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-mono flex items-center gap-1.5">
                    <span>{selectedPair}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Live Chart</span>
                  </h3>
                  <p className="text-[9.5px] font-mono text-emerald-400 mt-0.5">
                    Bid: {(marketPrices[selectedPair]?.price - (selectedPair === 'XAU/USD' ? 0.15 : (selectedPair === 'USD/JPY' ? 0.015 : 0.00015))).toFixed(selectedPair.includes('JPY') ? 3 : (selectedPair === 'XAU/USD' ? 2 : 5))} | 
                    Ask: {(marketPrices[selectedPair]?.price + (selectedPair === 'XAU/USD' ? 0.15 : (selectedPair === 'USD/JPY' ? 0.015 : 0.00015))).toFixed(selectedPair.includes('JPY') ? 3 : (selectedPair === 'XAU/USD' ? 2 : 5))}
                  </p>
                </div>
              </div>

              {/* Timeframes and chart styles */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Timeframe selector */}
                <div className="flex items-center bg-[#090d16] border border-zinc-900 p-0.5 rounded-lg text-[9px] font-black font-mono">
                  {['1m', '5m', '15m', '1h', '4h', 'D'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setTimeframe(tf as any);
                        showToast(`گۆڕدرا بۆ کاتی ${tf}`, 'info');
                      }}
                      className={`px-1.5 py-1 rounded transition-all uppercase ${
                        timeframe === tf ? 'bg-[#eab308] text-slate-900 font-extrabold' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {tf === 'D' ? 'D1' : tf.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Chart type toggle */}
                <div className="flex items-center bg-[#090d16] border border-zinc-900 p-0.5 rounded-lg text-[9px] font-black font-mono">
                  <button
                    onClick={() => setChartType('candles')}
                    className={`px-2 py-1 rounded transition-all ${
                      chartType === 'candles' ? 'bg-[#eab308] text-slate-900 font-extrabold' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Candles
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2 py-1 rounded transition-all ${
                      chartType === 'line' ? 'bg-[#eab308] text-slate-900 font-extrabold' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>
            </div>

            {/* Subinfo stats */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
              <span className="text-emerald-400">● Live Connection Status (Auto-Tick)</span>
              <div>
                <span>High: <span className="text-zinc-300">{(marketPrices[selectedPair]?.high).toFixed(selectedPair.includes('JPY') ? 3 : 5)}</span></span>
                <span className="mx-2">|</span>
                <span>Low: <span className="text-zinc-300">{(marketPrices[selectedPair]?.low).toFixed(selectedPair.includes('JPY') ? 3 : 5)}</span></span>
              </div>
            </div>

            {/* MarketChart Component (Recharts) */}
            <MarketChart
              candles={candles}
              activeTrades={activeTrades}
              selectedPair={selectedPair}
              currentPrice={marketPrices[selectedPair]?.price}
              chartType={chartType}
              timeframe={timeframe}
              candleTimerSeconds={candleTimerSeconds}
              height={280}
              onCloseTrade={handleCloseTrade}
            />
          </div>

          {/* MT4 QUICK-TRADE EXECUTIONS PANEL */}
          <div className="bg-[#111622] rounded-2xl p-5 border border-zinc-900/80 shadow-lg space-y-4 text-right">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-900/40">
              <span className="text-[10px] text-zinc-500 font-mono">Lot Size & Market Order execution</span>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>تەقاندنی ئۆردەر / Fast Order Execution</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Lot size editor */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-sans font-bold block">Lot / قەبارە:</span>
                <div className="flex items-center bg-[#090d16] border border-zinc-800 rounded-xl p-1 shadow-inner">
                  <button 
                    onClick={() => setLotSize(prev => Math.max(0.01, Number((prev + 0.05).toFixed(2))))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={lotSize}
                    onChange={(e) => setLotSize(Math.max(0.01, Number(parseFloat(e.target.value).toFixed(2)) || 0.10))}
                    className="w-16 bg-transparent text-center font-mono font-black text-white text-xs outline-none"
                  />
                  <button 
                    onClick={() => setLotSize(prev => Math.max(0.01, Number((prev - 0.05).toFixed(2))))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono max-w-[120px] leading-tight">Margin req: ${(lotSize * 1000).toLocaleString()} USD</span>
              </div>

              {/* Instant Execution Buttons */}
              <div className="grid grid-cols-2 gap-3 flex-1 w-full sm:w-auto">
                {/* BUY BUTTON */}
                <button
                  onClick={() => handleOpenTrade('BUY')}
                  className="py-3 px-4 bg-[#10b981] hover:bg-emerald-600 transition-all text-white rounded-xl shadow-md active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-[11px] font-black tracking-wider flex items-center gap-1 font-sans">
                    کڕین ▲ BUY
                  </span>
                  <span className="text-xs font-mono font-extrabold mt-1">
                    {(marketPrices[selectedPair]?.price + (selectedPair === 'XAU/USD' ? 0.15 : (selectedPair === 'USD/JPY' ? 0.012 : 0.00015))).toFixed(selectedPair.includes('JPY') ? 3 : (selectedPair === 'XAU/USD' ? 2 : 5))}
                  </span>
                </button>

                {/* SELL BUTTON */}
                <button
                  onClick={() => handleOpenTrade('SELL')}
                  className="py-3 px-4 bg-[#f43f5e] hover:bg-rose-600 transition-all text-white rounded-xl shadow-md active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-[11px] font-black tracking-wider flex items-center gap-1 font-sans">
                    فرۆشتن ▼ SELL
                  </span>
                  <span className="text-xs font-mono font-extrabold mt-1">
                    {(marketPrices[selectedPair]?.price - (selectedPair === 'XAU/USD' ? 0.15 : (selectedPair === 'USD/JPY' ? 0.012 : 0.00015))).toFixed(selectedPair.includes('JPY') ? 3 : (selectedPair === 'XAU/USD' ? 2 : 5))}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGNALS ROOM & ECONOMIC CALENDAR NEWS (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* VIP Signals Panel */}
          <div className="bg-[#111622] rounded-2xl border border-zinc-900/80 p-4 space-y-3 shadow-lg text-right">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
              <span className="text-[10px] bg-amber-500/10 text-[#eab308] border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-bold">Accuracy 94%</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>سیگناڵەکانی VIP / Hot Signals</span>
                <Bell className="w-3.5 h-3.5 text-[#eab308]" />
              </h3>
            </div>

            {/* List of active signals with execution triggers */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar">
              {signalsList.map((sig) => {
                const isBuy = sig.type === 'BUY';
                return (
                  <div 
                    key={sig.id}
                    className="bg-[#090d16]/85 border border-zinc-900 rounded-xl p-3 space-y-2 relative overflow-hidden text-right hover:border-zinc-800 transition-all"
                  >
                    {/* Direction badge and pair name */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono ${isBuy ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        {sig.type}
                      </span>
                      <h4 className="text-xs font-black text-white font-mono">{sig.pair}</h4>
                    </div>

                    {/* SL / TP targets */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                      <div>
                        <span>TP1: </span>
                        <span className="text-emerald-400 font-bold">{sig.tp1}</span>
                      </div>
                      <div>
                        <span>Entry: </span>
                        <span className="text-white font-bold">{sig.entry}</span>
                      </div>
                      <div>
                        <span>SL: </span>
                        <span className="text-rose-400 font-bold">{sig.sl}</span>
                      </div>
                      <div>
                        <span>Status: </span>
                        <span className="text-[#eab308] font-bold uppercase">{sig.status}</span>
                      </div>
                    </div>

                    {/* Kurds description notes */}
                    <p className="text-[9px] text-zinc-500 leading-normal border-t border-zinc-900/60 pt-1.5 mt-1.5 italic">
                      {sig.notes}
                    </p>

                    {/* Interactive "Execute" button */}
                    <button
                      onClick={() => {
                        const cleanPair = sig.pair.includes('زێڕ') || sig.pair.includes('XAU') ? 'XAU/USD' : 'EUR/USD';
                        setSelectedPair(cleanPair as any);
                        setLotSize(0.10);
                        handleOpenTrade(sig.type as 'BUY' | 'SELL');
                        showToast(`سیگناڵی ${sig.pair} کۆپی کرا و جێبەجێکرا!`, 'success');
                      }}
                      className="w-full mt-2 py-1.5 bg-[#eab308]/15 border border-[#eab308]/20 text-[#eab308] hover:bg-[#eab308] hover:text-slate-900 text-[10.5px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>تەقاندنی سیگناڵ / Execute Signal</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Economic Calendar & Breaking news */}
          <div className="bg-[#111622] rounded-2xl border border-zinc-900/80 p-4 space-y-3 shadow-lg text-right">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
              <span className="text-[10px] text-zinc-500 font-mono">Global Feed</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>ڕۆژژمێری ئابووری / News Feed</span>
                <Activity className="w-3.5 h-3.5 text-rose-500" />
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[140px] overflow-y-auto custom-scrollbar text-[10px] text-zinc-400">
              <div className="border-b border-zinc-900 pb-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                  <span>14:30 لایڤ</span>
                  <span className="text-rose-400">کاریگەری بەرز (High)</span>
                </div>
                <h4 className="text-white font-black text-[10.5px] mt-0.5">داواکارییەکانی بێکاری ئەمریکا (US Jobless Claims)</h4>
                <p className="mt-0.5 text-zinc-500 leading-tight">هەواڵێکی زۆر خێرا و گەورە لەسەر بەهای دۆلار و زێڕ دەردەچێت.</p>
              </div>

              <div className="border-b border-zinc-900 pb-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                  <span>16:00</span>
                  <span className="text-amber-400">مامناوەند (Medium)</span>
                </div>
                <h4 className="text-white font-black text-[10.5px] mt-0.5">پێنوێنی متمانەی بەکاربەر (US CB Consumer Confidence)</h4>
                <p className="mt-0.5 text-zinc-500 leading-tight">پێشبینی دەکرێت بەهۆی بەرزبوونەوەی پێنوێنەکە دۆلار هێز بەدەست بهێنێت.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM PANEL: MT4 TOOLBOX & TERMINAL ACTIVE TRADES TABLE */}
      <div className="px-4 pb-4">
        <div className="bg-[#111622] rounded-2xl border border-zinc-900/80 p-5 shadow-xl space-y-4">
          
          {/* Bottom terminal tabs menu */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900/60 pb-3">
            
            {/* Action options */}
            <div className="flex items-center gap-3">
              {activeTrades.length > 0 && (
                <button 
                  onClick={handleCloseAllTrades}
                  className="px-3 py-1.5 bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer"
                >
                  Close All Positions / داخستنی گشت ئۆردەرەکان ⚠️
                </button>
              )}
            </div>

            {/* Kurdish Terminal tab selector */}
            <div className="flex items-center gap-2 bg-[#090d16] border border-zinc-900 p-0.5 rounded-xl text-xs font-black">
              
              <button 
                onClick={() => {
                  setActiveBottomTab('profile');
                  showToast('چوونە ڕێکخستنەکانی پڕۆفایل و KYC', 'info');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBottomTab === 'profile' ? 'bg-[#eab308] text-slate-900 font-extrabold' : 'text-zinc-500 hover:text-white'
                }`}
              >
                پڕۆفایل و ناسنامە (Profile & KYC)
              </button>

              <button 
                onClick={() => {
                  setActiveBottomTab('trades');
                  showToast('بینینی مێژووی دوایین لۆگەکان', 'info');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBottomTab === 'trades' ? 'bg-[#eab308] text-slate-900 font-extrabold' : 'text-zinc-500 hover:text-white'
                }`}
              >
                مێژووی چالاکی (Activity Logs)
              </button>

              <button 
                onClick={() => {
                  setActiveBottomTab('home');
                  showToast('گەڕانەوە بۆ گرێبەستە چالاکەکان', 'info');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                  activeBottomTab === 'home' || activeBottomTab === 'markets' || activeBottomTab === 'signals' ? 'bg-[#eab308] text-slate-900 font-extrabold' : 'text-zinc-500 hover:text-white'
                }`}
              >
                گرێبەستە کراوەکان / Open Trades ({activeTrades.length})
                {activeTrades.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {activeTrades.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Tab Body renders inside the Toolbox */}
          <div>
            
            {/* If tab is HOME or markets or signals or we have active trades, display MT4 Trade positions table */}
            {(activeBottomTab === 'home' || activeBottomTab === 'markets' || activeBottomTab === 'signals') && (
              <div className="space-y-3">
                {activeTrades.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 space-y-2">
                    <TrendingUp className="w-10 h-10 text-zinc-700 mx-auto" />
                    <p className="text-xs font-bold text-zinc-400">هیچ گرێبەستێکی کراوە لەسەر بازاڕ بوونی نییە!</p>
                    <p className="text-[10px] text-zinc-500">لۆتی پێویست هەڵبژێرە لە بەشی سەرەوە و کلیک لە BUY یان SELL بکە بۆ مامەڵەکردن.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs font-mono select-text">
                      <thead>
                        <tr className="border-b border-zinc-900/60 text-zinc-500 pb-2 text-[11px]">
                          <th className="pb-2 text-left pl-2">Action / داخستن</th>
                          <th className="pb-2">Profit/Loss ($)</th>
                          <th className="pb-2">Live Price</th>
                          <th className="pb-2">Entry Price</th>
                          <th className="pb-2">Volume / لۆت</th>
                          <th className="pb-2">Type / جۆر</th>
                          <th className="pb-2 text-right pr-2">Symbol / کاڵا</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/40">
                        {activeTrades.map((trade) => {
                          const isUp = trade.pnl >= 0;
                          return (
                            <tr key={trade.id} className="hover:bg-zinc-950/40 transition-colors">
                              <td className="py-3 pl-2 text-left">
                                <button
                                  onClick={() => handleCloseTrade(trade.id)}
                                  className="px-2.5 py-1 text-[10px] bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white rounded-md font-sans font-black transition-all cursor-pointer"
                                >
                                  Close ✖
                                </button>
                              </td>
                              <td className={`py-3 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isUp ? '+' : ''}${trade.pnl.toFixed(2)}
                              </td>
                              <td className="py-3 text-zinc-300">
                                {trade.currentPrice.toLocaleString(undefined, { minimumFractionDigits: trade.pair.includes('USD') && !trade.pair.startsWith('XAU') && !trade.pair.startsWith('BTC') ? 5 : 2 })}
                              </td>
                              <td className="py-3 text-zinc-400">
                                {trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: trade.pair.includes('USD') && !trade.pair.startsWith('XAU') && !trade.pair.startsWith('BTC') ? 5 : 2 })}
                              </td>
                              <td className="py-3 text-zinc-300 font-bold">{trade.lotSize.toFixed(2)}</td>
                              <td className="py-3">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${trade.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="py-3 text-white font-bold text-right pr-2">{trade.pair}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* MT4 Balance Summary row */}
                    <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-zinc-900/60 mt-4 flex flex-wrap items-center justify-between text-xs font-mono font-bold">
                      <div className={`text-[13px] ${totalActivePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span>کۆی قازانج/زیانی سەرجەم پۆزیشنەکان: </span>
                        <span>{totalActivePnl >= 0 ? '+' : ''}${totalActivePnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex gap-x-6 text-zinc-400 text-[11.5px]">
                        <span>Free Margin: <strong className="text-emerald-400">${currentFreeMargin.toLocaleString()}</strong></span>
                        <span>Margin: <strong className="text-zinc-300">${currentMargin.toLocaleString()}</strong></span>
                        <span>Equity: <strong className="text-[#eab308]">${currentEquity.toLocaleString()}</strong></span>
                        <span>Balance: <strong className="text-white">${user.balance.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If tab is ACTIVITY LOGS, render the logs list */}
            {activeBottomTab === 'trades' && (
              <div className="space-y-4 text-right">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-900/40">
                  <span className="text-[10px] text-zinc-500 font-mono">Historic logs</span>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>مێژووی دوایین چالاکییەکان و تراکتەکان</span>
                    <History className="w-3.5 h-3.5 text-blue-400" />
                  </h4>
                </div>

                {getActivityLogs(userKey).length === 0 ? (
                  <div className="text-center py-6 text-[11px] text-zinc-500">
                    هیچ لۆگێکی چالاکی تۆمارنەکراوە بۆ ئەم حسابە.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {getActivityLogs(userKey).map((log: any, idx: number) => {
                      return (
                        <div 
                          key={log.id || idx}
                          className="bg-[#090d16]/60 border border-zinc-900/80 p-3 rounded-xl flex items-center justify-between text-xs"
                        >
                          <span className="text-[10px] text-zinc-500 font-mono">{log.timestamp || '12:00'}</span>
                          <div className="text-right">
                            <h5 className="font-black text-white">{log.title}</h5>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{log.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* If tab is PROFILE, render profile settings inside terminal */}
            {activeBottomTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                
                {/* Save details form */}
                <div className="bg-[#090d16]/60 border border-zinc-900 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-black text-[#eab308] border-b border-zinc-900/60 pb-1.5">ڕێکخستنی زانیاری کەسی پڕۆفایل</h4>
                  <form onSubmit={handleSaveProfile} className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block">ناوی سیانی</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#111622] border border-zinc-800 text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-[#eab308] text-right font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block">ژمارەی کارتی گشتی</label>
                      <input
                        type="text"
                        value={editFib}
                        onChange={(e) => setEditFib(e.target.value)}
                        className="w-full bg-[#111622] border border-zinc-800 text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-[#eab308] text-right font-mono font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block">تێپەڕەوشەی نوێ</label>
                      <input
                        type="password"
                        value={editPass}
                        onChange={(e) => setEditPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#111622] border border-zinc-800 text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-[#eab308] text-right font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#eab308] hover:bg-yellow-500 text-slate-900 font-black rounded-lg text-xs transition-all cursor-pointer"
                    >
                      پاشەکەوتکردنی گۆڕانکارییەکان
                    </button>
                  </form>
                </div>

                {/* KYC submission form */}
                <div className="bg-[#090d16]/60 border border-zinc-900 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-black text-[#eab308] border-b border-zinc-900/60 pb-1.5">پشتڕاستکردنەوەی فەرمی ناسنامە (KYC)</h4>
                  {user.verificationStatus === 'approved' ? (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl text-center space-y-1.5">
                      <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h5 className="text-xs font-black text-white">ئەکاونتەکەت بە فەرمی پشتڕاستکراوەتەوە!</h5>
                      <p className="text-[10px] text-zinc-400 leading-normal">تەواوی خزمەتگوزارییەکانی کڕین، فرۆشتن، داواکاری سیگناڵ و کێشانەوەی قازانج بۆت کراوەیە بەبێ سنوور.</p>
                    </div>
                  ) : user.verificationStatus === 'pending' ? (
                    <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl text-center space-y-1.5">
                      <Loader2 className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                      <h5 className="text-xs font-black text-white">بەڵگەنامەکانت لە ژێر لێکۆڵینەوەدان</h5>
                      <p className="text-[10px] text-zinc-400">ئەدمینەکان بەم زووانە بەڵگەکانت پەسەند دەکەن.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitVerification} className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 block">ژمارەی مۆبایل</label>
                        <input
                          type="text"
                          value={verifyPhone}
                          onChange={(e) => setVerifyPhone(e.target.value)}
                          placeholder="0750xxxxxxx"
                          className="w-full bg-[#111622] border border-zinc-800 text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-[#eab308] text-right font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 block">ژمارەی ناسنامە / پاسپۆرت</label>
                        <input
                          type="text"
                          value={verifyIdNumber}
                          onChange={(e) => setVerifyIdNumber(e.target.value)}
                          placeholder="A1890xxxxx"
                          className="w-full bg-[#111622] border border-zinc-800 text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-[#eab308] text-right font-mono"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-white font-black rounded-lg text-xs transition-all cursor-pointer"
                      >
                        ناردنی داواکاری پشتڕاستکردنەوە
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* RENDER SYSTEM MODALS */}
      {/* 🪙 DEPOSIT MODAL */}
      {isDepositModalOpen && (
        <div 
          onClick={() => setIsDepositModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer text-right"
        >
          <div 
            className="bg-[#111622] border border-zinc-800 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 relative shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-center gap-2 text-[#eab308] font-bold text-sm">
                <Wallet className="w-5 h-5" />
                <span>بارکردنی باڵانس (USDT TRC-20)</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Tether USDT (TRC-20) Network</p>
            </div>

            <div className="bg-[#090d16] border border-zinc-900 rounded-2xl p-4 text-center space-y-2 shadow-inner">
              <span className="text-xs text-zinc-300 font-bold block">ناونیشانی جزدانی USDT فەرمی:</span>
              <div className="flex flex-col items-center justify-center gap-2 bg-[#111622] border border-zinc-800 p-2.5 rounded-xl">
                <span className="text-[10px] sm:text-xs font-mono font-black text-[#eab308] select-all tracking-wider break-all leading-relaxed">
                  TNxFn1smwabHz8PREquhcChZiQNg8uGXxm
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('TNxFn1smwabHz8PREquhcChZiQNg8uGXxm');
                    showToast('ناونیشانی USDT (TRC-20) کۆپی کرا!', 'success');
                  }}
                  className="px-4 py-1.5 bg-[#090d16] hover:bg-zinc-900 border border-zinc-800 rounded-lg text-[#eab308] transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کۆپیکردن</span>
                </button>
              </div>
            </div>

            <div className="bg-[#090d16] border border-zinc-900 rounded-xl p-3 text-right text-[11px] text-zinc-400 space-y-1 leading-normal">
              <strong className="text-[#eab308] font-bold block">شێوازی ناردن:</strong>
              <p>پارەکە لەڕێگەی تۆڕی ترۆن TRC-20 ڕەوانەی ئەم جزدانە بکە، پاشان وێنەی پسوولە بنێرە لە ڕێگەی دەسکتۆپ یان چات تا خێرا باڵانست پڕبکرێتەوە.</p>
            </div>

            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-800 text-[#eab308] hover:text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              داخستنی لاپەڕە
            </button>
          </div>
        </div>
      )}

      {/* 💳 WITHDRAW MODAL */}
      {isWithdrawModalOpen && (
        <div 
          onClick={() => setIsWithdrawModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm text-right cursor-pointer"
        >
          <div 
            className="bg-[#111622] border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-[#eab308]">
                <h3 className="font-extrabold text-white text-sm">داواکاری ڕاکێشانی قازانج (USDT TRC-20)</h3>
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-bold block">ناونیشانی جزدانی کریپتۆ (USDT TRC-20 Destination)</label>
                <input
                  type="text"
                  required
                  value={withdrawFib}
                  onChange={(e) => setWithdrawFib(e.target.value)}
                  placeholder="T..."
                  className="w-full bg-[#090d16] border border-zinc-800 text-white px-4 py-3 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#eab308] font-bold">زۆرترین بڕ: $1,000</span>
                  <label className="text-xs text-zinc-400 font-bold block">بڕی پارە بە دۆلار ($)</label>
                </div>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="بۆ نموونە: 250"
                  className="w-full bg-[#090d16] border border-zinc-800 text-white px-4 py-3 rounded-xl text-xs outline-none focus:border-[#eab308] font-mono text-right"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 py-3 bg-[#090d16] hover:bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 font-bold"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg"
                >
                  ناردنی داواکاری ڕاکێشان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔔 SYSTEM NOTIFICATIONS SIDE PANEL */}
      {isNotificationsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" 
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div 
            className="w-full max-w-xs bg-[#111622] border-l border-zinc-900 h-full p-5 space-y-5 overflow-y-auto text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-full bg-[#090d16] text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>ئاگادارکردنەوەکان</span>
                <Bell className="w-4.5 h-4.5 text-[#eab308]" />
              </h3>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-xl border text-right space-y-1.5 transition-all ${
                    n.read ? 'bg-zinc-950/40 border-zinc-900 text-zinc-500' : 'bg-zinc-950 border-zinc-900 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] text-zinc-500 font-mono">{n.time}</span>
                    <h4 className="text-xs font-extrabold text-white">{n.title}</h4>
                  </div>
                  <p className="text-[10px] leading-relaxed text-zinc-400">{n.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadNotifications(0);
                showToast('تەواوی ئاگادارکردنەوەکان خوێندرانەوە!', 'info');
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-400 text-center font-bold cursor-pointer"
            >
              هەموو نیشانە بکە وەک بینراو
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
