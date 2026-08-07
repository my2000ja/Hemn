import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  CheckCircle2,
  QrCode,
  Info,
  Smartphone,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Search,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';

interface OKXDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OKXDepositModal: React.FC<OKXDepositModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const trc20Address = 'TNxFn1smwabHz8PREquhcChZiQNg8uGXxm';
  const ethAddress = '0xeb25b42a2116799a749f636cb7f40eb23075dd43';
  const depositAddress = trc20Address;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const steps = [
    {
      title: 'هەنگاوی ١: چوونه بەشی Assets',
      desc: 'بەرنامەی OKX بکەرەوە. لە خوارەوە لای ڕاست کلیک لەسەر دوگمەی "Assets" بکە و پاشان لە بەشی سەرەوە کلیک لەسەر "Withdraw" بکە (وەک بە بازنەی سوور دیاریکراوە).',
      highlightText: 'Withdraw'
    },
    {
      title: 'هەنگاوی ٢: هەڵبژاردنی Withdraw Crypto',
      desc: 'لەم قۆناغەدا پەڕەیەک لە خوارەوە دەکرێتەوە. کلیک لەسەر بژاردەی یەکەم بکە کە بریتییە لە "Withdraw crypto" تاوەکو بتوانیت کریپتۆ ڕەوانە بکەیت.',
      highlightText: 'Withdraw crypto'
    },
    {
      title: 'هەنگاوی ٣: هەڵبژاردنی دراوی ETH',
      desc: 'دراوی ETH (Ethereum) یان دراوی دیاریکراو لە لیستی دراوەکاندا دیاری بکە. دەتوانیت لە ڕێگەی گەڕان (Search) ناوی ETH بنووسیت و دەستبەجێ هەڵیبژێریت.',
      highlightText: 'ETH (Ethereum)'
    },
    {
      title: 'هەنگاوی ٤: دیاریکردنی شێوازی On-chain',
      desc: 'لەم بەشەدا، کلیک لەسەر بژاردەی یەکەم بکە کە بریتییە لە "On-chain" (ناردنی سەر هێڵ بۆ ڕاهێنەر یان ئەکاونت) تاوەکو گواستنەوەکە لەسەر تۆڕی سەرەکی ئەنجام بدرێت.',
      highlightText: 'On-chain'
    },
    {
      title: 'هەنگاوی ٥: هەڵبژاردنی تۆڕی ERC20',
      desc: 'تۆڕی گواستنەوەکە بە تەواوی لەسەر "ETH-ERC20" دابنێ. دڵنیابەرەوە لە هەڵبژاردنی ئەم تۆڕە بۆ ئەوەی پارەکەت بە سەلامەتی بگاتە دەستی ئێمە.',
      highlightText: 'ETH-ERC20'
    },
    {
      title: 'هەنگاوی ٦: سکانکردنی QR یان کۆپیکردنی ناونیشان',
      desc: 'ناونیشانی دەپۆزیت کۆپی بکە یان کۆدی QR سکان بکە. پاشان بڕی دڵخواز بنێرە و وێنەی وەسلەکە (سکرین شۆت) بۆ تیمی پشتگیری ڕەوانە بکە.',
      highlightText: 'Deposit Address & QR Code'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div id="okx-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div id="okx-modal-card" className="w-full max-w-4xl bg-[#090a12] border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col lg:flex-row h-auto lg:h-[620px] max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* LEFT PANEL: INTERACTIVE OKX PHONE SIMULATOR */}
        <div id="okx-phone-simulator" className="w-full lg:w-1/2 bg-[#05060b] border-b lg:border-b-0 lg:border-r border-zinc-900 p-4 flex flex-col items-center justify-center relative min-h-[360px] lg:min-h-0 overflow-hidden select-none">
          
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />

          {/* Glowing Target Ring (Replaces manual screenshots with sharp vector graphics) */}
          {currentStep !== 5 && (
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
              {/* Pulsing indicator overlay indicating where to click */}
              <div className="absolute w-80 h-auto flex flex-col items-center">
                {/* Visual feedback about target area based on step */}
              </div>
            </div>
          )}

          {/* Phone Canvas Frame */}
          <div className="w-full max-w-[275px] bg-[#0c0d14] border-4 border-[#242633] rounded-[32px] h-[320px] lg:h-[460px] shadow-2xl relative flex flex-col overflow-hidden text-left font-sans">
            
            {/* Phone Notch & Status bar */}
            <div className="w-full h-8 bg-[#0c0d14] flex items-center justify-between px-5 pt-2 text-[9px] font-bold text-zinc-500 select-none">
              <span>9:41</span>
              <div className="w-16 h-4 bg-[#1a1b26] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full mr-1" />
                <div className="w-5 h-1 bg-zinc-800 rounded-sm" />
              </div>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Simulated Screen Dynamic Content based on active step */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-[#040509] text-[#e2e8f0]">
              
              {/* STEP 1: OKX APP HOME */}
              {currentStep === 0 && (
                <div className="flex-1 p-3 flex flex-col justify-between">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-black font-black text-[9px] tracking-tighter">OKX</div>
                      <span className="text-[10px] font-bold">Funding</span>
                    </div>
                    <span className="text-[9px] text-zinc-500">USD ▼</span>
                  </div>

                  {/* Balance details */}
                  <div className="my-2 space-y-1">
                    <span className="text-[8px] text-zinc-500 uppercase font-mono">Total Assets</span>
                    <h4 className="text-lg font-bold font-mono">$1,450.78</h4>
                    <span className="text-[8px] text-emerald-400 font-mono">+1.24% Today</span>
                  </div>

                  {/* Buttons Row with withdraw highlighted */}
                  <div className="grid grid-cols-4 gap-1 py-2 border-y border-zinc-900">
                    <div className="flex flex-col items-center gap-1 text-[8px] text-zinc-400">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">📥</div>
                      <span>Deposit</span>
                    </div>
                    
                    {/* HIGHLIGHTED WITHDRAW BUTTON */}
                    <div className="flex flex-col items-center gap-1 text-[8px] text-amber-400 relative">
                      {/* Highlight Circle Overlay */}
                      <div className="absolute -inset-1 border-2 border-red-500 rounded-xl animate-pulse z-20 scale-110 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500 flex items-center justify-center text-red-500 shadow-md">📤</div>
                      <span className="font-bold text-white">Withdraw</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-[8px] text-zinc-400">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">🔄</div>
                      <span>Transfer</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[8px] text-zinc-400">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">💼</div>
                      <span>Earn</span>
                    </div>
                  </div>

                  {/* Asset List Preview */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-[8px] text-zinc-500">
                      <span>Amount</span>
                      <span>Asset Name</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] bg-zinc-950 p-1.5 rounded">
                      <span className="font-mono">0.450 ETH</span>
                      <span className="font-bold">ETH (Ethereum)</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] bg-zinc-950/40 p-1.5 rounded">
                      <span className="font-mono">240.00 USDT</span>
                      <span className="font-bold">USDT (Tether)</span>
                    </div>
                  </div>

                  {/* OKX Bottom Navigation Bar */}
                  <div className="border-t border-zinc-900 pt-1.5 flex items-center justify-between text-zinc-600 text-[8px] font-bold">
                    <span>Home</span>
                    <span>Trade</span>
                    <span>Discover</span>
                    {/* HIGHLIGHTED ASSETS TAB */}
                    <span className="text-white border-b-2 border-white pb-0.5 relative">
                      <div className="absolute -top-1.5 -left-1 -right-1 w-8 h-8 border border-red-500 rounded-full animate-ping pointer-events-none scale-75" />
                      Assets
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: WITHDRAW CRYPTO OPTION SHEET */}
              {currentStep === 1 && (
                <div className="flex-1 bg-[#020205] p-3 flex flex-col justify-between">
                  {/* Gray Background Home Screen */}
                  <div className="opacity-30 space-y-2">
                    <div className="h-6 bg-zinc-800 rounded w-1/3" />
                    <div className="h-20 bg-zinc-800 rounded" />
                  </div>

                  {/* SLIDED UP WITHDRAWAL SHEET */}
                  <div className="bg-[#0c0d14] border-t-2 border-zinc-800 rounded-t-2xl p-3 space-y-3 relative z-10 shadow-2xl -mx-3 -mb-3 pb-4">
                    <div className="w-8 h-1 bg-zinc-700 rounded-full mx-auto" />
                    <h4 className="text-[10px] font-bold text-white">Withdrawal Methods</h4>
                    
                    <div className="space-y-2">
                      {/* OPTION 1: WITHDRAW CRYPTO (HIGHLIGHTED) */}
                      <div className="p-2.5 rounded-xl bg-red-500/5 border-2 border-red-500 flex items-start gap-2 relative">
                        {/* Highlight Border and cursor */}
                        <div className="absolute inset-0 border border-red-500 rounded-xl pointer-events-none" />
                        <span className="text-sm">🪙</span>
                        <div>
                          <div className="text-[10px] font-bold text-white flex items-center gap-1">
                            <span>Withdraw crypto</span>
                            <span className="text-[7px] bg-red-600 text-white px-1 rounded">Recommended</span>
                          </div>
                          <p className="text-[7px] text-zinc-400 mt-0.5">Transfer crypto to a wallet, exchanges, or OKX address</p>
                        </div>
                      </div>

                      {/* OPTION 2: P2P */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 flex items-start gap-2 opacity-60">
                        <span className="text-sm">🤝</span>
                        <div>
                          <div className="text-[10px] font-bold text-zinc-300">P2P Trading</div>
                          <p className="text-[7px] text-zinc-500 mt-0.5">Sell crypto with zero fees via local payment methods</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT CRYPTO */}
              {currentStep === 2 && (
                <div className="flex-1 p-3 flex flex-col justify-between">
                  {/* Search Bar */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-white">Select crypto</h4>
                    <div className="bg-zinc-900 rounded-lg p-1.5 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-zinc-500" />
                      <input type="text" disabled placeholder="Search crypto (e.g. ETH)" className="bg-transparent text-[9px] w-full focus:outline-none" />
                    </div>
                  </div>

                  {/* List of assets with ETH circled in red */}
                  <div className="flex-1 my-3 space-y-2 overflow-y-auto">
                    <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold">All crypto</span>
                    
                    <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between opacity-55">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-[8px]">USDT</div>
                        <span className="text-[9px] font-bold text-zinc-300">Tether (USDT)</span>
                      </div>
                    </div>

                    {/* ETH HIGHLIGHTED */}
                    <div className="p-2.5 rounded-xl bg-red-500/5 border-2 border-red-500 flex items-center justify-between relative">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[8px]">ETH</div>
                        <span className="text-[9px] font-bold text-white">ETH (Ethereum)</span>
                      </div>
                      <span className="text-[7px] font-mono text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900">SELECTED</span>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between opacity-55">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[8px]">BTC</div>
                        <span className="text-[9px] font-bold text-zinc-300">Bitcoin (BTC)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT WITHDRAW METHOD */}
              {currentStep === 3 && (
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div className="space-y-1 pb-2 border-b border-zinc-900">
                    <h4 className="text-[10px] font-bold text-white">Withdrawal method</h4>
                    <p className="text-[7px] text-zinc-500">How do you want to transfer your ETH?</p>
                  </div>

                  <div className="flex-1 my-4 space-y-3">
                    {/* ON-CHAIN HIGHLIGHTED */}
                    <div className="p-3.5 rounded-2xl bg-red-500/5 border-2 border-red-500 space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                          <span>🌐 On-chain</span>
                          <span className="text-[6.5px] bg-red-500 text-white px-1 py-0.2 rounded font-bold font-mono">STEP 4</span>
                        </span>
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">✓</div>
                      </div>
                      <p className="text-[7.5px] text-zinc-300 leading-relaxed">
                        Withdraw via network to other exchanges (e.g. Coinbase, Binance) or private wallets.
                      </p>
                    </div>

                    {/* INTERNAL TRANSFER */}
                    <div className="p-3 rounded-2xl bg-[#0c0d14] border border-zinc-900 opacity-45 space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400">⚡ Internal transfer</span>
                      <p className="text-[7px] text-zinc-500">Send to OKX users with email, subaccount, or phone. Fee: 0</p>
                    </div>
                  </div>

                  <div className="bg-[#0b0c13] p-2 rounded-xl text-center text-[7.5px] text-zinc-400 flex items-center justify-center gap-1">
                    <span>🔒 Safe transaction secured by Ethereum network</span>
                  </div>
                </div>
              )}

              {/* STEP 5: SELECT NETWORK */}
              {currentStep === 4 && (
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-white">Select withdrawal network</h4>
                    <p className="text-[7px] text-zinc-500 mt-0.5">Make sure the network matches deposit network to avoid loss.</p>
                  </div>

                  <div className="flex-1 my-3 space-y-2">
                    {/* ETHEREUM NETWORK (HIGHLIGHTED) */}
                    <div className="p-3 rounded-xl bg-red-500/5 border-2 border-red-500 flex items-center justify-between relative">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-white block">Ethereum (ERC20)</span>
                        <span className="text-[7px] text-zinc-400 block font-mono">Fee: 0.000055 ETH (~$0.15) | Arrives: 2 mins</span>
                      </div>
                      <span className="text-[7px] font-mono text-white bg-red-600 px-1.5 py-0.5 rounded font-black">SELECT</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between opacity-40">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-zinc-400 block">Arbitrum One</span>
                        <span className="text-[7px] text-zinc-500 block font-mono">Fee: 0.00001 ETH | Arrives: 1 min</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between opacity-40">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-zinc-400 block">Optimism (OP)</span>
                        <span className="text-[7px] text-zinc-500 block font-mono">Fee: 0.00001 ETH | Arrives: 1 min</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-950/20 border border-red-900/30 p-2 rounded-xl text-[7.5px] text-red-300">
                    ⚠️ Warn: Sending on wrong network results in loss of funds. Ensure ERC20 network.
                  </div>
                </div>
              )}

              {/* STEP 6: DESTINATION QR CODE ADDRESS */}
              {currentStep === 5 && (
                <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto">
                  <div className="text-center space-y-1">
                    <h4 className="text-[10px] font-bold text-white">ETH Deposit Address</h4>
                    <span className="text-[7.5px] bg-[#1c1209] text-amber-500 px-2 py-0.5 rounded border border-amber-500/30 inline-block font-bold">ERC20 Network Only</span>
                  </div>

                  {/* High Quality Styled SVG QR Code */}
                  <div className="w-24 h-24 bg-white p-1.5 rounded-xl mx-auto shadow-lg border border-zinc-800 flex items-center justify-center relative my-1">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="select-none">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="22" height="22" fill="black" />
                      <rect x="9" y="9" width="14" height="14" fill="white" />
                      <rect x="12" y="12" width="8" height="8" fill="black" />

                      <rect x="73" y="5" width="22" height="22" fill="black" />
                      <rect x="77" y="9" width="14" height="14" fill="white" />
                      <rect x="80" y="12" width="8" height="8" fill="black" />

                      <rect x="5" y="73" width="22" height="22" fill="black" />
                      <rect x="9" y="77" width="14" height="14" fill="white" />
                      <rect x="12" y="80" width="8" height="8" fill="black" />

                      {/* Random pixels imitating address encoding */}
                      <rect x="35" y="10" width="8" height="15" fill="black" />
                      <rect x="48" y="5" width="12" height="8" fill="black" />
                      <rect x="32" y="32" width="15" height="12" fill="black" />
                      <rect x="52" y="45" width="10" height="15" fill="black" />
                      <rect x="70" y="35" width="15" height="8" fill="black" />
                      <rect x="75" y="55" width="10" height="20" fill="black" />
                      <rect x="35" y="55" width="12" height="12" fill="black" />
                      <rect x="15" y="45" width="10" height="10" fill="black" />
                      <rect x="50" y="75" width="18" height="18" fill="black" />
                    </svg>
                    {/* Tiny eth logo in the center */}
                    <div className="absolute w-6 h-6 rounded-full bg-[#0c0d14] border-2 border-white flex items-center justify-center">
                      <span className="text-[9px] text-blue-400 font-bold">Ξ</span>
                    </div>
                  </div>

                  {/* Copyable Address Panel */}
                  <div className="space-y-1 text-[8px]">
                    <span className="text-zinc-400 font-bold block text-center">Address:</span>
                    <div className="bg-[#0f111a] border border-zinc-800 rounded px-2 py-1 flex items-center justify-between">
                      <span className="font-mono text-zinc-300 overflow-hidden text-ellipsis whitespace-nowrap mr-2 select-all">
                        TNxFn1smwabHz8...GXxm
                      </span>
                      <button type="button" onClick={handleCopy} className="text-amber-400 shrink-0 hover:text-amber-300">
                        {copied ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Address Caution Warning */}
                  <div className="mt-1.5 p-1 bg-red-950/40 rounded text-center text-[7px] text-red-400">
                    ⚠️ Please do not send any other coin except ETH.
                  </div>
                </div>
              )}

            </div>

            {/* Simulated Phone Home Button indicator */}
            <div className="w-full h-4 bg-[#0c0d14] flex items-center justify-center pb-1">
              <div className="w-24 h-1 bg-zinc-700 rounded-full" />
            </div>

          </div>

          {/* Stepper Dots Indicators */}
          <div className="flex gap-1.5 mt-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-5 bg-amber-500' : 'w-1.5 bg-zinc-800'
                }`}
              />
            ))}
          </div>

        </div>

        {/* RIGHT PANEL: EXPLANATIONS & USER ACTION BOX */}
        <div id="okx-explain-box" className="w-full lg:w-1/2 p-5 sm:p-8 flex flex-col justify-between text-right space-y-6">
          
          {/* Header Title with Logo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950 border border-amber-800/60 px-3 py-1 rounded-full">
                Step {currentStep + 1} of 6
              </span>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-black text-white">ڕێنمایی دەپۆزیت بە OKX</h3>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xs shadow shadow-amber-500/20">
                  OKX
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Content body */}
          <div className="flex-1 space-y-4">
            <h4 className="text-base font-bold text-amber-400">
              {steps[currentStep].title}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              {steps[currentStep].desc}
            </p>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block font-mono">⚠️ تێبینی گرنگ</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                کلیک لەسەر ئەو بەشانە بکە لە ناو مۆبایلە نمایشکراوەکە کە بە <span className="text-red-500 font-bold">چوارچێوەی سوور</span> نیشان دراون تاوەکو هەنگاوەکانت وەک فۆتۆکان ڕوون بێت.
              </p>
            </div>
          </div>

          {/* Persistent Deposit Address Panel at Step 6 or inside explanation */}
          <div className="bg-gradient-to-b from-[#14120f] to-[#0c0a07] border border-amber-500/30 rounded-2xl p-4 space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Ethereum (ERC20)
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>ناونیشانی فەرمی وەرگرتنی کریپتۆ</span>
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400">Ethereum Address (بۆ کۆپیکردن کلیک بکە):</span>
              <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-amber-500 text-zinc-950 hover:bg-amber-400 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> : <Copy className="w-3.5 h-3.5 text-zinc-950" />}
                  <span>{copied ? 'کۆپی کرا!' : 'کۆپیکردن'}</span>
                </button>
                <span className="font-mono text-[11px] font-semibold text-zinc-100 overflow-hidden text-ellipsis select-all text-left w-full ml-4 block py-1">
                  {depositAddress}
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-500">
              * بۆ ناردنی پارە، دەتوانیت IQcode-ەکەش سکان بکەیت. تکایە هەمیشە دڵنیابەرەوە لە هەڵبژاردنی تۆڕی **ERC20** لە کاتی دەپۆزیتدا.
            </p>
          </div>

          {/* Navigation Controls buttons inside modal */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>پێشوو</span>
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 text-xs font-bold shadow-md shadow-amber-500/15 cursor-pointer"
              >
                تەواو، تێگەیشتم!
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>دواتر</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
