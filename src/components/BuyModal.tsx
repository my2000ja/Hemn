import React, { useState } from 'react';
import { CreditCard, Send, X, FileText, Smartphone, Hash, Info, CheckCircle2, Copy, Wallet, QrCode } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { formatIQD } from '../utils/currency';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkgName: string;
  price: number;
  clicks: number;
  isMonthly: boolean;
  fibDestinationNumber?: string;
  onSubmitRequest: (
    senderFib: string,
    userPhone: string,
    receiptRef: string,
    receiptNote: string
  ) => void;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  pkgName,
  price,
  clicks,
  isMonthly,
  fibDestinationNumber = '07512189730',
  onSubmitRequest
}) => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'FIB' | 'USDT'>('FIB');
  const [senderFib, setSenderFib] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cryptoAddress = 'TNxFn1smwabHz8PREquhcChZiQNg8uGXxm';
  const fibNumber = fibDestinationNumber || '07512189730';

  const activeDestination = paymentMethod === 'FIB' ? fibNumber : cryptoAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeDestination);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderFib.trim()) {
      return;
    }
    
    onSubmitRequest(
      senderFib.trim(),
      senderFib.trim(),
      receiptRef.trim() || `TXID-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNote.trim() || `پارەدان بەڕێگەی ${paymentMethod === 'FIB' ? 'FIB' : 'USDT TRC-20'}`
    );
    
    setSenderFib('');
    setReceiptRef('');
    setReceiptNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#121215] border border-[#27272a] w-full max-w-md rounded-xl p-5 sm:p-6 shadow-2xl text-right relative my-auto pt-6 pb-12 sm:pb-6">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg bg-[#18181b] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold border-b border-[#27272a] pb-3">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm text-zinc-100 font-bold">{pkgName}</h3>
            <span className="text-[10px] text-zinc-400 font-mono">داواکاری داخلکردنی باڵانس / کڕین</span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex bg-[#09090b] p-1 rounded-xl border border-zinc-800 mb-4 gap-1">
          <button
            type="button"
            onClick={() => setPaymentMethod('FIB')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMethod === 'FIB'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>FIB (دینار)</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('USDT')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMethod === 'USDT'
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>USDT TRC-20</span>
          </button>
        </div>

        {/* Payment Details Box */}
        <div className="bg-gradient-to-b from-[#0e171f] via-[#0a1015] to-[#09090b] border border-amber-500/30 rounded-2xl p-4 mb-4 space-y-3 text-xs text-zinc-300 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-zinc-100 text-xs">
                {paymentMethod === 'FIB' ? 'ژمارەی FIB فەرمی:' : 'ناونیشانی USDT (TRC-20):'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 block font-mono">بڕی تێچوو:</span>
              <span className="font-mono font-black text-amber-400 text-sm sm:text-base">
                {formatIQD(price)}
              </span>
            </div>
          </div>

          <div className="space-y-2 py-1">
            <div className="w-full bg-[#070c13] border border-amber-500/40 p-3 rounded-xl flex items-center justify-between shadow-lg">
              <div className="flex-1 text-right overflow-hidden">
                <span className="text-[10px] text-zinc-400 block font-mono">
                  {paymentMethod === 'FIB' ? 'ژمارەی حساب (FIB):' : 'Wallet Address (USDT TRC-20):'}
                </span>
                <span className="text-sm font-mono font-black text-amber-400 select-all tracking-wider dir-ltr block truncate">
                  {activeDestination}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 mr-2"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'کۆپی کرا' : 'کۆپیکردن'}</span>
              </button>
            </div>

            <div className="w-full bg-[#0d1217]/90 border border-zinc-800 rounded-xl p-2.5 text-[11px] text-zinc-300 space-y-1 text-right">
              <p className="text-amber-400 font-bold flex items-center gap-1 justify-end">
                <Info className="w-3.5 h-3.5" />
                <span>پارەکە بگوێزەرەوە بۆ ئەم ژمارەیە، پاشان زانیارییەکان لە خوارەوە پڕ بکەرەوە:</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sender FIB / Wallet */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>ژمارەی FIB یان جزدانی نێرەر *</span>
              <Hash className="w-3.5 h-3.5 text-amber-400" />
            </label>
            <input
              type="text"
              required
              value={senderFib}
              onChange={(e) => setSenderFib(e.target.value)}
              placeholder="ژمارەی حسابەکەت کە پارەت پێ ناردووە"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-base sm:text-xs outline-none focus:border-amber-500 font-mono transition-all text-right"
            />
          </div>

          {/* Receipt / Transaction Reference Number */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>ناسنامەی پسوولە / Transaction ID *</span>
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </label>
            <input
              type="text"
              required
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="ژمارەی پسوولە یان ژمارەی گواستنەوە"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-base sm:text-xs outline-none focus:border-amber-500 font-mono transition-all text-right"
            />
          </div>

          {/* Receipt Note / Extra Details */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>تێبینی زیاتر (ئیختیاری)</span>
              <Info className="w-3.5 h-3.5 text-zinc-400" />
            </label>
            <textarea
              rows={2}
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="تێبینی خۆت بنووسە..."
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-xs outline-none focus:border-amber-500 transition-all resize-none text-right"
            />
          </div>

          {/* Invoice Summary Preview */}
          <div className="bg-[#18181b] border border-amber-500/30 rounded-lg p-3 text-[11px] text-zinc-300 space-y-1 font-mono">
            <div className="text-amber-400 font-bold flex items-center gap-1 mb-1 justify-end">
              <span>پێداچوونەوەی داواکاری</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">ناونیشان:</span>
              <span className="font-bold text-zinc-100">{pkgName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">تێچوو بە دینار:</span>
              <span className="font-bold text-amber-400">{formatIQD(price)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ناردنی پسوولە بۆ ئەدمین</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-[#18181b] hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg text-xs transition-all cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

