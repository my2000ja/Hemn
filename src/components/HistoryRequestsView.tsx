import React from 'react';
import { PendingRequest, User } from '../types';
import { Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, ShieldAlert } from 'lucide-react';

interface HistoryRequestsViewProps {
  requests: PendingRequest[];
  userKey: string;
}

export const HistoryRequestsView: React.FC<HistoryRequestsViewProps> = ({ requests, userKey }) => {
  const userRequests = requests.filter((r) => r.userKey === userKey);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 text-right">
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              میژووی داواکارییەکان (کڕین و ڕاکێشانی پارە)
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            سەرجەم: {userRequests.length} داواکاری
          </span>
        </div>

        {userRequests.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs font-mono">
            هیچ داواکارییەکت ئەنجام نەداوە تا ئێستا.
          </div>
        ) : (
          <div className="space-y-2.5">
            {userRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#09090b] border border-[#27272a] p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      req.type === 'buy'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {req.type === 'buy' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-zinc-100 text-xs flex items-center gap-2 flex-wrap">
                      <span>{req.title}</span>
                      {req.receiptRef && (
                        <span className="text-[10px] font-mono text-zinc-400 bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a]">
                          پسولە: {req.receiptRef}
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-[10px] font-mono mt-0.5">
                      بەروار: {req.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mr-auto">
                  <div className="text-left">
                    <div className="font-mono font-bold text-zinc-200 text-xs">
                      {req.amount.toLocaleString()} $
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <span className="bg-amber-500/10 text-amber-300 border border-[#27272a] px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>چاوەڕوانکراو</span>
                    </span>
                  )}

                  {req.status === 'approved' && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-[#27272a] px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>پەسەندکرا</span>
                    </span>
                  )}

                  {req.status === 'rejected' && (
                    <span className="bg-rose-500/10 text-rose-400 border border-[#27272a] px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>ڕەتکرایەوە</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
