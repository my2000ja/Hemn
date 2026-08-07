import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'bg-[#121215] border-emerald-500/50 text-emerald-300',
    error: 'bg-[#121215] border-rose-500/50 text-rose-300',
    info: 'bg-[#121215] border-[#27272a] text-zinc-200',
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] sm:w-auto">
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-xl ${bgColors[type]}`}>
        {icons[type]}
        <span className="text-xs font-medium leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="mr-auto p-1 rounded hover:bg-white/10 transition-colors text-zinc-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
