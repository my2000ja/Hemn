import React, { useState } from 'react';
import { CreditCard, Send, X, FileText, Smartphone, Hash, Info, CheckCircle2, Copy } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

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
  onSubmitRequest
}) => {
  const { t } = useLanguage();
  const [senderFib, setSenderFib] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cryptoAddress = 'TNxFn1smwabHz8PREquhcChZiQNg8uGXxm';

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderFib.trim() || !userPhone.trim()) {
      return;
    }
    
    onSubmitRequest(
      senderFib.trim(),
      userPhone.trim(),
      receiptRef.trim() || `TXID-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNote.trim() || (isMonthly ? 'داواکاری پلانی VIPی مانگانەی کریپتۆ' : 'داواکاری داخلکردنی باڵانسی کریپتۆ')
    );
    
    setSenderFib('');
    setUserPhone('');
    setReceiptRef('');
    setReceiptNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#121215] border border-[#27272a] w-full max-w-md rounded-xl p-5 sm:p-6 shadow-2xl text-right relative my-auto pt-6 pb-12 sm:pb-6">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg bg-[#18181b] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold border-b border-[#27272a] pb-3">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm text-zinc-100 font-bold">کڕینی {pkgName}</h3>
            <span className="text-[10px] text-zinc-400 font-mono">گواستنەوەی کریپتۆ (Crypto Deposit)</span>
          </div>
        </div>

        {/* Crypto Payment Box */}
        <div className="bg-gradient-to-b from-[#0e171f] via-[#0a1015] to-[#09090b] border border-blue-500/40 rounded-2xl p-4 mb-4 space-y-3 text-xs text-zinc-300 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-bold text-zinc-100 text-xs">پارەدان بە کریپتۆ USDT (TRC-20)</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 block font-mono">بڕی پێویست:</span>
              <span className="font-mono font-black text-blue-400 text-base">{price.toLocaleString()} USDT</span>
            </div>
          </div>

          <div className="space-y-2.5 py-1">
            {/* Account Number Display */}
            <div className="w-full bg-[#070c13] border border-blue-500/40 p-3 rounded-xl flex items-center justify-between shadow-lg">
              <div className="flex-1 text-right overflow-hidden">
                <span className="text-[10px] text-zinc-400 block font-mono">ناونیشانی جزدانی USDT (TRC-20) Wallet:</span>
                <span className="text-xs font-mono font-black text-blue-400 select-all tracking-wider dir-ltr block truncate">
                  {cryptoAddress}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-500/40 rounded-lg text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                <span>{copied ? 'کۆپی کرا' : 'کۆپیکردن'}</span>
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="w-full bg-[#0d1217]/90 border border-blue-500/20 rounded-xl p-3 text-[11px] text-zinc-300 space-y-1.5 text-right">
              <div className="text-blue-400 font-bold text-xs flex items-center gap-1.5 mb-1 justify-end">
                <span>ڕێنماییەکانی گواستنەوەی کریپتۆ:</span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 bg-[#121922] px-2.5 py-1 rounded-md border border-blue-500/10 justify-end">
                  <span>ناونیشانی جزدانەکە کۆپی بکە</span>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">١</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#121922] px-2.5 py-1 rounded-md border border-blue-500/10 justify-end">
                  <span>تۆڕی <strong>TRC-20 (Tron)</strong> هەڵبژێرە</span>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">٢</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#121922] px-2.5 py-1 rounded-md border border-blue-500/10 justify-end">
                  <span>بڕی <strong className="text-blue-400 font-mono">{price.toLocaleString()} USDT</strong> بنێرە</span>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">٣</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#121922] px-2.5 py-1 rounded-md border border-blue-500/10 justify-end">
                  <span>ناسنامەی گواستنەوە (TXID) بنووسە</span>
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">٤</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* User Mobile Number */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>ژمارەی مۆبایل یان ئایدی تێلیگرام بۆ پەیوەندی *</span>
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            </label>
            <input
              type="text"
              required
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="نموونە: 0750xxxxxxx یان @telegram_id"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 font-mono transition-all text-right"
            />
          </div>

          {/* Sender Crypto Wallet */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>ناونیشانی جزدانی تۆ (ئیختیاری یان ناوی بنێرەر) *</span>
              <Hash className="w-3.5 h-3.5 text-amber-400" />
            </label>
            <input
              type="text"
              required
              value={senderFib}
              onChange={(e) => setSenderFib(e.target.value)}
              placeholder="T... یان ناوی تەواوت بنووسە"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 font-mono transition-all text-right"
            />
          </div>

          {/* Receipt / Transaction Reference Number */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>ناسنامەی گواستنەوە (TXID / Transaction Hash) *</span>
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </label>
            <input
              type="text"
              required
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="نموونە: f487b9201a... (هاش یان کۆدی گواستنەوە)"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 font-mono transition-all text-right"
            />
          </div>

          {/* Receipt Note / Extra Details */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>تێبینی یان زانیاری پسولە</span>
              <Info className="w-3.5 h-3.5 text-zinc-400" />
            </label>
            <textarea
              rows={2}
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="تێبینی پارەدان لێرە بنووسە..."
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-3.5 py-2 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all resize-none text-right"
            />
          </div>

          {/* Invoice Summary Preview */}
          <div className="bg-[#18181b] border border-blue-500/30 rounded-lg p-3 text-[11px] text-zinc-300 space-y-1 font-mono">
            <div className="text-blue-400 font-bold flex items-center gap-1 mb-1 justify-end">
              <span>پێداچوونەوەی پسولەی گواستنەوە</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">پاكێجی هەڵبژێردراو:</span>
              <span className="font-bold text-zinc-100">{pkgName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">تێچووی گشتی:</span>
              <span className="font-bold text-amber-400">{price.toLocaleString()} USDT</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ناردنی پسولە بۆ ئەدمین</span>
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
