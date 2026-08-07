import { TradingSignal, AppSettings } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  fibNumber: '07512189730',
  clickReward: 150,
  adminUser: 'admin',
  adminPass: 'hemn12345@67',
  adminVaultBalance: 0
};

export const INITIAL_SIGNALS: TradingSignal[] = [
  {
    id: 'sig-1',
    pair: 'XAU/USD (زێڕ)',
    type: 'BUY',
    entry: '2385.50 - 2388.00',
    tp1: '2394.00',
    tp2: '2402.00',
    tp3: '2415.00',
    sl: '2378.00',
    winRate: '94%',
    status: 'HIT_TP2',
    isVip: true,
    createdAt: 'ئەمڕۆ - 10:15 AM',
    notes: 'زێڕ لە سەرچاوەی پاڵپشتی بەهێزدایە. ئامانجی دووەم پێکهاکرا (+170 پیپس).'
  },
  {
    id: 'sig-2',
    pair: 'BTC/USDT (بیتکۆین)',
    type: 'BUY',
    entry: '64,200 - 64,500',
    tp1: '65,800',
    tp2: '67,000',
    tp3: '69,500',
    sl: '63,100',
    winRate: '89%',
    status: 'ACTIVE',
    isVip: false,
    createdAt: 'ئەمڕۆ - 11:30 AM',
    notes: 'شکاندنی بەربەستی سەرەوە بە قەبارەی بەرز. گونجاوە بۆ کڕین.'
  },
  {
    id: 'sig-3',
    pair: 'EUR/USD (یۆرۆ / دۆلار)',
    type: 'SELL',
    entry: '1.0890 - 1.0905',
    tp1: '1.0850',
    tp2: '1.0810',
    tp3: '1.0760',
    sl: '1.0935',
    winRate: '91%',
    status: 'HIT_TP1',
    isVip: false,
    createdAt: 'دوێنێ - 03:45 PM',
    notes: 'ئامانجی یەکەم بە سەرکەوتوویی ژێربڕ کرا (+40 پیپس).'
  },
  {
    id: 'sig-4',
    pair: 'GBP/JPY (پاوەند / یەن)',
    type: 'BUY',
    entry: '198.20 - 198.50',
    tp1: '199.30',
    tp2: '200.50',
    tp3: '202.00',
    sl: '197.40',
    winRate: '92%',
    status: 'ACTIVE',
    isVip: true,
    createdAt: 'ئەمڕۆ - 08:20 AM',
    notes: 'سیگناڵی تایبەت بۆ ئەندامانی مانگانە. ترێندی بەرەو سەرەوە زۆر بەهێزە.'
  },
  {
    id: 'sig-5',
    pair: 'USOIL (نەوت)',
    type: 'BUY',
    entry: '78.40 - 78.80',
    tp1: '80.00',
    tp2: '81.50',
    tp3: '83.00',
    sl: '77.20',
    winRate: '87%',
    status: 'CLOSED',
    isVip: false,
    createdAt: 'دوێنێ - 01:10 PM',
    notes: 'سیگناڵ بە قازانجی +160 پیپس داگیرا.'
  }
];
