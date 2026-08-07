import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  ChevronDown,
  Smartphone,
  Globe,
  Star,
  Users,
  CheckCircle2,
  LogIn,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  Award,
  HelpCircle,
  Headphones,
  BarChart2,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { MrPocketLogo } from './MrPocketLogo';
import { LanguageSelector } from './LanguageSelector';
import { PendingRequest } from '../types';
import { OKXDepositModal } from './OKXDepositModal';
import { VisualTutorial } from './VisualTutorial';

interface LandingPageProps {
  onOpenAuth: (initialTab?: 'login' | 'register' | 'admin') => void;
  pendingRequests?: PendingRequest[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [isOKXModalOpen, setIsOKXModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Simulated live prices for header ticker
  const [tickerPrices, setTickerPrices] = useState([
    { pair: 'XAU/USD', price: 4234.00, change: '+1.15%', isUp: true },
    { pair: 'BTC/USD', price: 64230.00, change: '+2.40%', isUp: true },
    { pair: 'EUR/USD', price: 1.0892, change: '-0.12%', isUp: false },
    { pair: 'GBP/USD', price: 1.2845, change: '+0.35%', isUp: true },
    { pair: 'USD/JPY', price: 154.60, change: '-0.28%', isUp: false },
    { pair: 'ETH/USD', price: 3480.50, change: '+3.10%', isUp: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPrices(prev =>
        prev.map(item => {
          const delta = (Math.random() - 0.49) * (item.price * 0.0008);
          const newPrice = item.price + delta;
          return {
            ...item,
            price: Number(newPrice.toFixed(item.pair.includes('JPY') ? 2 : item.pair.includes('USD') && !item.pair.includes('XAU') && !item.pair.includes('BTC') && !item.pair.includes('ETH') ? 4 : 2))
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: 'چۆن دەتوانم دەست بە مامەڵەکردن بکەم لە Mr Pocket؟',
      a: 'زۆر ئاسانە! تەنها کلیک لەسەر "دروستکردنی حساب" بکە، زانیارییەکانت پڕبکەرەوە. دوای دروستکردنی حساب دەتوانیت بە هەژماری تاقیکردنەوە (Demo) یان هەژماری ڕاستەقینە مامەڵە بکەیت.'
    },
    {
      q: 'چۆن دەتوانم پارە شارژ بکەم (Deposit) بۆ ناو هەژمارەکەم؟',
      a: 'دەتوانیت لە ڕێگەی ڕێگاکانی وەک OKX (USDT TRC20/BEP20)، FIB (First Iraqi Bank)، FastPay یان بەکار‌هێنانی کارتی ئەلیکترۆنی بە خێرایی و بەبێ هیچ تێچوویەکی زیادە پارە شارژ بکەیت.'
    },
    {
      q: 'ئایا شێوازی ڕاکێشانی پارە (Withdrawal) چەند کات دەخایەنێت؟',
      a: 'داواکارییەکانی ڕاکێشانی پارە بە شێوەیەکی ئۆتۆماتیکی و ڕاستەوخۆ بە کەمتر لە ١٥ خولەک جێبەجێ دەکرێن بۆ سەر جزدان یان هەژماری بانکییەکەت.'
    },
    {
      q: 'سیگناڵەکانی VIP چین و چۆن سوودیان لێ وەربگرم؟',
      a: 'سیگناڵەکانی VIP بریتین لە شیکاریی و ڕێنمایی ئامادەکراوی ڕۆژانە لەلایەن شیکارکارانی ئەزموونداری بازار. پێشبینی خاڵی چوونەژوورەوە، تارگێت و ستۆپ لۆست بۆ دیاری دەکەن.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#070a12] text-[#e4e4e7] font-sans antialiased select-none relative overflow-x-hidden">
      
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-600/15 via-purple-600/15 to-rose-600/15 blur-[140px] pointer-events-none rounded-full z-0" />
      <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full z-0" />
      <div className="absolute top-2/3 right-[-200px] w-[500px] h-[500px] bg-rose-600/10 blur-[150px] pointer-events-none rounded-full z-0" />

      {/* TOP LIVE TICKER STRIP */}
      <div className="w-full bg-[#0b0f19] border-b border-zinc-800/80 py-1.5 px-4 overflow-hidden relative z-20">
        <div className="flex items-center gap-6 animate-marquee whitespace-nowrap text-xs font-mono">
          {tickerPrices.concat(tickerPrices).map((item, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-zinc-900/60 border border-zinc-800">
              <span className="font-bold text-zinc-300">{item.pair}</span>
              <span className="text-white font-black">{item.price}</span>
              <span className={`text-[10px] font-bold flex items-center ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN TOP NAVIGATION BAR */}
      <nav className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenAuth('login')}>
          <MrPocketLogo size={36} />
          <div className="text-right hidden sm:block">
            <span className="font-black text-base text-white block leading-none">Mr<span className="text-rose-500">pocket</span></span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider">Trading Terminal Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector compact={true} />
          
          <button
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all border border-zinc-800 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>چوونەژوورەوە</span>
          </button>

          <button
            onClick={() => onOpenAuth('register')}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>حساب دروستبکە</span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-16 text-center space-y-8">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-xs font-bold text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>به‌خێر بێیت بۆ <strong className="text-white font-black tracking-wide">MR POCKET</strong></span>
        </div>

        {/* Headline matching screenshot */}
        <div className="space-y-1 font-black tracking-tight leading-tight dir-ltr">
          <h1 className="text-4xl sm:text-7xl font-black">
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]">
              ,Smart
            </span>
            <span className="text-white ml-2">Pocket</span>
          </h1>
          <h1 className="text-4xl sm:text-7xl font-black">
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              .Better
            </span>
            <span className="text-white ml-2">Life</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed font-medium px-2 dir-rtl">
          Mr Pocket پلاتفۆڕمێکی مۆدێرنە بۆ بەڕێوەبردنی پاره و مامەڵەکانت بە شێوەیەکی خێرا، ئاسان و پارێزراو.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full max-w-md mx-auto">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-base tracking-wide shadow-[0_0_35px_rgba(99,102,241,0.55)] hover:shadow-[0_0_50px_rgba(99,102,241,0.8)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-indigo-400/30 flex items-center justify-center gap-2 group"
          >
            <span>دەست پێبکه</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">🚀</span>
          </button>

          <button
            onClick={() => setIsOKXModalOpen(true)}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-[#0b0f19] hover:bg-zinc-800/80 text-zinc-200 font-bold text-sm border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>ڕێنمایی شارژکردنی OKX</span>
          </button>
        </div>

        {/* TERMINAL CARD WIDGET (Metallic Glossy Card from Screenshot) */}
        <div className="relative z-10 w-full max-w-md mx-auto pt-6 transform hover:scale-[1.01] transition-transform duration-300">
          
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/30 via-purple-600/30 to-blue-600/30 blur-2xl rounded-[2.5rem] pointer-events-none -z-10" />

          <div className="relative rounded-[2rem] bg-gradient-to-br from-[#120721] via-[#0d122b] to-[#1c081d] border border-rose-500/30 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-left font-sans">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1233] to-[#0d091a] border border-rose-500/40 p-2 shadow-[0_0_20px_rgba(244,63,94,0.25)] flex items-center justify-center relative">
                <MrPocketLogo size={42} />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d122b] animate-ping" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d122b]" />
              </div>

              <div className="text-right space-y-1">
                <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-300 block uppercase">
                  OFFICIAL TERMINAL
                </span>
                <div className="inline-block px-2.5 py-0.5 rounded-md border border-emerald-500/60 bg-emerald-950/60 text-emerald-400 text-[10px] font-mono font-bold tracking-wider">
                  PRO v2.4
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                <span className="text-rose-500">MR</span>
                <span>POCKET</span>
              </h2>
              <p className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase flex items-center gap-2">
                <span>TRADING TERMINAL PRO</span>
                <span className="text-rose-500">•</span>
                <span>SMART POCKET</span>
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* STEP-BY-STEP VISUAL TUTORIAL SECTION */}
      <section id="tutorial-section" className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <VisualTutorial />
      </section>

      {/* PLATFORM FEATURES GRID */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-16 border-t border-zinc-900/80">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">تایبەتمەندییە سەرەکییەکان</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">بۆچی MR POCKET هەڵدەبژێریت؟</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0b0f19]/90 border border-zinc-800/80 p-6 rounded-2xl hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">تێپەڕاندنی خێرا (Execution)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              جێبەجێکردنی داواکارییەکان بێ هیچ دواکەوتنێک بە خێرایی بەرزتر لە ٠.٠٥ چرکە.
            </p>
          </div>

          <div className="bg-[#0b0f19]/90 border border-zinc-800/80 p-6 rounded-2xl hover:border-rose-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">پاراستنی باڵا</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              سستمی پاراستنی چەند بەشە بە ئاستی بانکی و ڕەمزاندنی SSL بۆ پاراستنی دارایی و زانیارییەکانت.
            </p>
          </div>

          <div className="bg-[#0b0f19]/90 border border-zinc-800/80 p-6 rounded-2xl hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">سیگناڵی VIP</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              دەستگەیشتن بە سیگناڵی جۆری بەرز بە ڕێژەی سەرکەوتنی زیاتر لە ٨٥٪ ڕۆژانە.
            </p>
          </div>

          <div className="bg-[#0b0f19]/90 border border-zinc-800/80 p-6 rounded-2xl hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">شارژ و ڕاکێشانی ئاسان</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              پشتگیری OKX USDT، FIB، FastPay و کارتی بانکی بۆ شارژکردن بە کەمترین کات.
            </p>
          </div>
        </div>
      </section>

      {/* STATS COUNTER */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-12 bg-gradient-to-r from-indigo-950/30 via-[#0b0f19] to-rose-950/30 rounded-3xl border border-zinc-800 my-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl font-black text-white font-mono block">$12.4M+</span>
            <span className="text-xs text-zinc-400 font-bold">قەبارەی مامەڵەی ڕۆژانە</span>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-400 font-mono block">99.9%</span>
            <span className="text-xs text-zinc-400 font-bold">کاتی کارکردنی سستەم</span>
          </div>
          <div>
            <span className="text-3xl font-black text-indigo-400 font-mono block">&lt; 15m</span>
            <span className="text-xs text-zinc-400 font-bold">کاتی ڕاکێشانی پارە</span>
          </div>
          <div>
            <span className="text-3xl font-black text-rose-400 font-mono block">45,000+</span>
            <span className="text-xs text-zinc-400 font-bold">بەکارهێنەری چالاک</span>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">پرسیارە باوەکان</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">پێویستت بە یارمەتییە؟</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#0b0f19] border border-zinc-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between font-bold text-sm text-white hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-zinc-900 bg-[#05080f] py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MrPocketLogo size={28} />
            <span className="font-black text-white text-sm">Mr<span className="text-rose-500">pocket</span></span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors cursor-pointer">چوونەژوورەوە</button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors cursor-pointer">حساب دروستبکە</button>
            <button onClick={() => setIsOKXModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">شارژکردن بە OKX</button>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 max-w-2xl mx-auto leading-normal">
          مافی لەبەرگرتنەوە پارێزراوە © 2026 MR POCKET Terminal Pro. مامەڵەکردن لە بازاڕە داراییەکان خاوەنی مەترسییە.
        </p>
      </footer>

      {/* OKX Deposit Instructions Modal */}
      <OKXDepositModal isOpen={isOKXModalOpen} onClose={() => setIsOKXModalOpen(false)} />
    </div>
  );
};
