import React, { useState } from 'react';
import { PendingRequest, User, TradingSignal, AppSettings, VisitorSession } from '../types';
import { formatIQD } from '../utils/currency';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  DollarSign,
  Smartphone,
  Key,
  Star,
  Clock,
  Activity,
  Globe,
  Search,
  UserPlus,
  RefreshCw,
  Eye,
  Filter,
  Check
} from 'lucide-react';

interface AdminPanelProps {
  pendingRequests: PendingRequest[];
  allUsers: { key: string; data: User }[];
  signals: TradingSignal[];
  settings: AppSettings;
  visitors?: VisitorSession[];
  onApproveRequest: (requestId: number) => void;
  onRejectRequest: (requestId: number) => void;
  onUpdateUser: (userKey: string, updatedUser: User) => void;
  onDeleteUser?: (userKey: string) => void;
  onDeleteAllUsers?: (scope: 'all' | 'logged' | 'banned') => void;
  onResetAllBalances?: () => void;
  onCreateUser?: (newUserKey: string, newUser: User) => void;
  onAddSignal: (newSignal: TradingSignal) => void;
  onUpdateSignalStatus: (signalId: string, newStatus: TradingSignal['status']) => void;
  onDeleteSignal: (signalId: string) => void;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearVisitors?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  pendingRequests,
  allUsers,
  signals,
  settings,
  visitors = [],
  onApproveRequest,
  onRejectRequest,
  onUpdateUser,
  onDeleteUser,
  onDeleteAllUsers,
  onResetAllBalances,
  onCreateUser,
  onAddSignal,
  onUpdateSignalStatus,
  onDeleteSignal,
  onSaveSettings,
  onClearVisitors,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'visitors' | 'requests' | 'users' | 'settings'>('visitors');

  // Modal confirmation for bulk user deletion
  const [confirmDeleteScope, setConfirmDeleteScope] = useState<'all' | 'logged' | 'banned' | null>(null);

  // Search and Filter States
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilter, setVisitorFilter] = useState<'all' | 'logged' | 'guest'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'logged' | 'vip' | 'banned'>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | 'buy' | 'withdraw'>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // New Signal Form State
  const [pair, setPair] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [entry, setEntry] = useState('');
  const [tp1, setTp1] = useState('');
  const [tp2, setTp2] = useState('');
  const [tp3, setTp3] = useState('');
  const [sl, setSl] = useState('');
  const [winRate, setWinRate] = useState('90%');
  const [isVip, setIsVip] = useState(false);
  const [notes, setNotes] = useState('');

  // App Settings State
  const [fibNum, setFibNum] = useState(settings.fibNumber);
  const [clickReward, setClickReward] = useState(settings.clickReward);
  const [adminUser, setAdminUser] = useState(settings.adminUser || 'hemn');
  const [adminPass, setAdminPass] = useState(settings.adminPass || 'hemn12345@67');
  const [adminVaultBalance, setAdminVaultBalance] = useState(settings.adminVaultBalance || 0);

  React.useEffect(() => {
    setFibNum(settings.fibNumber);
    setClickReward(settings.clickReward);
    setAdminUser(settings.adminUser || 'hemn');
    setAdminPass(settings.adminPass || 'hemn12345@67');
    setAdminVaultBalance(settings.adminVaultBalance || 0);
  }, [settings]);

  // User Edit State
  const [editingUserKey, setEditingUserKey] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editClicks, setEditClicks] = useState<number>(0);
  const [editVipDays, setEditVipDays] = useState<number>(30);

  // Create New User Form State
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserFib, setNewUserFib] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserBalance, setNewUserBalance] = useState<number>(0);
  const [newUserClicks, setNewUserClicks] = useState<number>(0);
  const [newUserIsVip, setNewUserIsVip] = useState(false);

  // Helper to check if a visitor record is system admin
  const isSystemAdminVisitor = (v: VisitorSession) => {
    const name = (v.userName || '').toLowerCase();
    const key = (v.userKey || '').toLowerCase();
    const page = (v.page || '').toLowerCase();
    return name.includes('admin') || name.includes('ئەدمین') || key === 'admin' || page === 'admin';
  };

  // Active 30-min visitors count (excluding system admin)
  const now = Date.now();
  const realVisitors = visitors.filter((v) => !isSystemAdminVisitor(v));
  const online30MinVisitors = realVisitors.filter((v) => (now - v.lastActive) <= 30 * 60 * 1000);
  const pendingCount = pendingRequests.filter((r) => r.status === 'pending').length;

  // Filtered Lists
  const filteredVisitors = realVisitors.filter((v) => {
    const isUserLogged = Boolean(v.isLoggedIn || v.userKey);
    if (visitorFilter === 'logged' && !isUserLogged) return false;
    if (visitorFilter === 'guest' && isUserLogged) return false;

    if (!visitorSearch.trim()) return true;
    const query = visitorSearch.toLowerCase();
    return (
      (v.userName || '').toLowerCase().includes(query) ||
      (v.userPhone || '').toLowerCase().includes(query) ||
      (v.userFib || '').toLowerCase().includes(query) ||
      (v.page || '').toLowerCase().includes(query)
    );
  });

  const filteredUsers = allUsers.filter(({ key, data }) => {
    // Exclude system admin account from user statistics/lists if named admin
    const k = key.toLowerCase();
    const name = (data.name || '').toLowerCase();
    if (k === 'admin' || k === 'user_admin' || name.includes('ئەدمینی سیستەم')) return false;

    const isOnline = Boolean(data.isOnline || ((now - (data.lastActive || 0)) <= 3 * 60 * 1000));
    const isLoggedIn = Boolean(data.isLoggedIn || data.lastLoginAt);

    if (userFilter === 'online' && !isOnline) return false;
    if (userFilter === 'logged' && !isLoggedIn) return false;
    if (userFilter === 'vip' && !data.monthly) return false;
    if (userFilter === 'banned' && !data.isBanned) return false;
    if (userFilter === 'verification' && data.verificationStatus !== 'pending') return false;

    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      data.name.toLowerCase().includes(q) ||
      (data.fib || '').toLowerCase().includes(q) ||
      key.toLowerCase().includes(q)
    );
  });

  const filteredRequests = pendingRequests.filter((r) => {
    if (requestStatusFilter !== 'all' && r.status !== requestStatusFilter) return false;
    if (requestTypeFilter !== 'all' && r.type !== requestTypeFilter) return false;
    if (!requestSearch.trim()) return true;
    const q = requestSearch.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.userFib || '').toLowerCase().includes(q) ||
      (r.userPhone || '').toLowerCase().includes(q) ||
      (r.receiptRef || '').toLowerCase().includes(q)
    );
  });

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entry || !tp1 || !sl) {
      showToast('تکایە خانە سەرەکییەکانی سیگناڵ پڕبکەرەوە!', 'error');
      return;
    }

    const newSig: TradingSignal = {
      id: `sig-${Date.now()}`,
      pair: pair.trim(),
      type,
      entry: entry.trim(),
      tp1: tp1.trim(),
      tp2: tp2.trim() || tp1.trim(),
      tp3: tp3.trim() || tp1.trim(),
      sl: sl.trim(),
      winRate: winRate.trim() || '90%',
      status: 'ACTIVE',
      isVip,
      createdAt: 'ئەمڕۆ - ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim()
    };

    onAddSignal(newSig);
    showToast('سیگناڵی نوێ بڵاوکرایەوە!', 'success');
    setPair('');
    setEntry('');
    setTp1('');
    setTp2('');
    setTp3('');
    setSl('');
    setNotes('');
  };

  const handleSaveAppSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      fibNumber: fibNum.trim(),
      clickReward: Number(clickReward) || 150,
      adminUser: adminUser.trim(),
      adminPass: adminPass.trim(),
      adminVaultBalance: Number(adminVaultBalance) || 0
    });
    showToast('ڕێکخستنەکان و باڵانسی ئەدمین پاشەکەوت کران!', 'success');
  };

  const startEditUser = (userKey: string, user: User) => {
    setEditingUserKey(userKey);
    setEditBalance(user.balance);
    setEditClicks(user.clicks);
    setEditVipDays(30);
  };

  const saveUserChanges = (userKey: string, currentUser: User) => {
    onUpdateUser(userKey, {
      ...currentUser,
      balance: editBalance,
      clicks: editClicks
    });
    setEditingUserKey(null);
    showToast('زانیارییەکانی بەکارهێنەر نوێکرانەوە!', 'success');
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserFib.trim() || !newUserPass.trim()) {
      showToast('تکایە هەموو خانە پێویستەکان پڕ بکەرەوە!', 'error');
      return;
    }

    const userKey = `user_${newUserFib.trim()}`;
    const newUser: User = {
      name: newUserName.trim(),
      fib: newUserFib.trim(),
      pass: newUserPass.trim(),
      balance: newUserBalance,
      clicks: newUserClicks,
      monthly: newUserIsVip,
      vipExpiryDate: newUserIsVip ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null,
      vipDailyClicks: newUserIsVip ? 100 : undefined,
      createdAt: new Date().toISOString()
    };

    if (onCreateUser) {
      onCreateUser(userKey, newUser);
    } else {
      onUpdateUser(userKey, newUser);
    }

    showToast(`بەکارهێنەر (${newUserName}) بەسەرکەوتوویی دروستکرا!`, 'success');
    setIsCreatingUser(false);
    setNewUserName('');
    setNewUserFib('');
    setNewUserPass('');
    setNewUserBalance(0);
    setNewUserClicks(0);
    setNewUserIsVip(false);
  };

  const getTimeAgoText = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'ئێستا (کەمتر لە خولەکێک)';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `پێش ${diffMin} خولەک`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `پێش ${diffHour} کاتژمێر`;
    return `پێش ${Math.floor(diffHour / 24)} ڕۆژ`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 text-right font-sans">
      {/* Top KPI Cards Bar - High-Contrast Black, Blue & Green Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div
          onClick={() => setActiveTab('visitors')}
          className={`bg-[#050b14] border rounded-xl p-3 text-center shadow-lg transition-all cursor-pointer hover:border-blue-500/80 ${
            activeTab === 'visitors'
              ? 'border-blue-600 ring-2 ring-blue-600/40 bg-[#09152a]'
              : 'border-blue-900/40'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-zinc-400 text-[10px] font-mono uppercase font-bold">ئۆنلاین (۳۰ خولەک)</div>
          <div className="text-lg font-mono font-black text-white">{online30MinVisitors.length} کەس</div>
        </div>

        <div
          onClick={() => setActiveTab('requests')}
          className={`bg-[#050b14] border rounded-xl p-3 text-center shadow-lg cursor-pointer transition-all hover:border-blue-500/80 ${
            activeTab === 'requests'
              ? 'border-blue-600 ring-2 ring-blue-600/40 bg-[#09152a]'
              : 'border-blue-900/40'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <div className="text-zinc-400 text-[10px] font-mono uppercase font-bold">داواکاری چاوەڕوانکراو</div>
          <div className="text-lg font-mono font-black text-white">{pendingCount}</div>
        </div>

        <div
          onClick={() => setActiveTab('users')}
          className={`bg-[#050b14] border rounded-xl p-3 text-center shadow-lg cursor-pointer transition-all hover:border-blue-500/80 ${
            activeTab === 'users'
              ? 'border-blue-600 ring-2 ring-blue-600/40 bg-[#09152a]'
              : 'border-blue-900/40'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-zinc-400 text-[10px] font-mono uppercase font-bold">سەرجەم بەکارهێنەران</div>
          <div className="text-lg font-mono font-black text-white">{allUsers.length}</div>
        </div>

        {/* 4th Card: Admin Profit/Loss Vault Balance */}
        <div
          onClick={() => setActiveTab('settings')}
          className={`bg-gradient-to-br from-[#061226] via-[#030914] to-[#000000] border rounded-xl p-3 text-center shadow-xl shadow-blue-950/40 cursor-pointer transition-all hover:border-emerald-500 group ${
            activeTab === 'settings'
              ? 'border-emerald-500 ring-2 ring-emerald-500/50 bg-[#051829]'
              : 'border-blue-800/60'
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400 animate-pulse group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-emerald-400/90 text-[10px] font-mono font-bold uppercase tracking-tight">باڵانسی ئەدمین ($ زەرەری یاری)</div>
          <div className="text-base sm:text-lg font-mono font-black text-white drop-shadow">
            ${(settings.adminVaultBalance || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation - Black, Blue, Emerald Theme */}
      <div className="flex bg-[#040914] border border-blue-900/40 p-1.5 rounded-xl gap-1 text-xs font-bold text-zinc-300 overflow-x-auto shadow-md">
        <button
          onClick={() => setActiveTab('visitors')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'visitors'
              ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-950/60'
              : 'hover:bg-blue-950/30 text-zinc-300 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-white" />
          <span>سەردانیکەران ({online30MinVisitors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-950/60'
              : 'hover:bg-blue-950/30 text-zinc-300 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-white" />
          <span>داواکارییەکان ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-950/60'
              : 'hover:bg-blue-950/30 text-zinc-300 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-white" />
          <span>بەکارهێنەران ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-950/60'
              : 'hover:bg-blue-950/30 text-zinc-300 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-white" />
          <span>ڕێکخستن</span>
        </button>
      </div>

      {/* 1. VISITORS & ONLINE USERS TAB */}
      {activeTab === 'visitors' && (
        <div className="bg-[#040914] border border-blue-900/40 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-blue-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>سەردانیکەران و چالاکیی ٣٠ خولەکی ڕابردوو</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                تۆماری ئۆنلاینی ئەم بەکار‌هێنەرانەی لە ۳۰ خولەکی دواییدا داخل بوون یاخود سەردانیان کردووە
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono bg-blue-950/80 text-white px-3 py-1 rounded-lg border border-blue-600/60 font-bold flex items-center gap-1.5 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{online30MinVisitors.length} ئەکتیڤ ئۆنلاین</span>
              </span>

              {onDeleteAllUsers && (
                <button
                  onClick={() => setConfirmDeleteScope('logged')}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1 border border-blue-400"
                  title="سڕینەوەی گشتی سەرجەم بەکارهێنەرانی داخلبوو"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>سڕینەوەی داخلبووان</span>
                </button>
              )}

              {onClearVisitors && visitors.length > 0 && (
                <button
                  onClick={onClearVisitors}
                  className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="سڕینەوەی لۆگی سەردانیکەران"
                >
                  سڕینەوەی لۆگ
                </button>
              )}
            </div>
          </div>

          {/* Search Box & Visitor Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={visitorSearch}
                onChange={(e) => setVisitorSearch(e.target.value)}
                placeholder="گەڕان بەدوای ناوی سەردانیکەر، موبایل، یان لاپەڕە..."
                className="w-full bg-[#071124] border border-blue-900/50 pr-10 pl-3 py-2 rounded-lg text-white text-xs outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex gap-1 bg-[#071124] p-1 rounded-lg border border-blue-900/50 text-xs font-mono">
              <button
                onClick={() => setVisitorFilter('all')}
                className={`flex-1 py-1 rounded transition-all font-bold ${
                  visitorFilter === 'all' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                هەمووی ({visitors.length})
              </button>
              <button
                onClick={() => setVisitorFilter('logged')}
                className={`flex-1 py-1 rounded transition-all font-bold ${
                  visitorFilter === 'logged' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🔓 داخلبووان ({visitors.filter((v) => v.isLoggedIn || v.userKey).length})
              </button>
              <button
                onClick={() => setVisitorFilter('guest')}
                className={`flex-1 py-1 rounded transition-all font-bold ${
                  visitorFilter === 'guest' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ⚪ مێوانەکان ({visitors.filter((v) => !v.isLoggedIn && !v.userKey).length})
              </button>
            </div>
          </div>

          {filteredVisitors.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs font-mono border border-dashed border-red-900/40 rounded-xl">
              هیچ سەردانیکەرێک لە لۆگدا تۆمار نەکراوە.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVisitors.map((vis) => {
                const isOnline30Min = (now - vis.lastActive) <= 30 * 60 * 1000;
                const isUserLogged = Boolean(vis.isLoggedIn || vis.userKey);
                let pageLabel = 'لاپەڕەی سەرەکی';
                if (vis.page === 'signals') pageLabel = '📊 سیگناڵەکان';
                if (vis.page === 'history') pageLabel = '📜 مێژووی داواکاری';
                if (vis.page === 'admin') pageLabel = '🛡️ پانێڵی ئەدمین';

                return (
                  <div
                    key={vis.id}
                    className={`bg-[#0a0305] border p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs transition-all ${
                      isOnline30Min
                        ? 'border-red-600/70 shadow-md shadow-red-950/30'
                        : 'border-red-950/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black font-mono text-xs ${
                          isUserLogged
                            ? 'bg-red-600 text-white border border-red-400'
                            : isOnline30Min
                            ? 'bg-red-950/80 text-red-300 border border-red-700'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {vis.userName ? vis.userName.substring(0, 1).toUpperCase() : 'V'}
                      </div>

                      <div>
                        <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                          <span>{vis.userName || 'سەردانیکەری مێوان'}</span>
                          {isUserLogged ? (
                            <span className="text-[10px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 rounded border border-red-500 flex items-center gap-1 shadow">
                              🔓 ئەکاونتی داخلبوو
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              ⚪ سەردانیکەری مێوان
                            </span>
                          )}

                          {isOnline30Min ? (
                            <span className="text-[10px] font-mono font-bold text-white bg-red-950/90 px-2 py-0.5 rounded border border-red-600/60 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span>ئۆنلاین</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-400 bg-[#120709] px-2 py-0.5 rounded border border-red-950">
                              ئۆفلاین
                            </span>
                          )}
                        </div>

                        <div className="text-zinc-400 text-[11px] font-mono mt-0.5 flex flex-wrap gap-2">
                          {vis.userPhone && (
                            <span>📱 موبایل: <strong className="text-white">{vis.userPhone}</strong></span>
                          )}
                          {vis.userFib && (
                            <span>💳 FIB: <strong className="text-red-400">{vis.userFib}</strong></span>
                          )}
                          <span>📍 لاپەڕە: <strong className="text-red-400">{pageLabel}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-mono text-[11px] text-zinc-400 border-r border-red-950 pr-3 sm:border-r-0 sm:pr-0">
                      <div>دوا چالاکی: <strong className="text-white">{getTimeAgoText(vis.lastActive)}</strong></div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        کاتی هاتن: {new Date(vis.joinedAt || vis.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. REQUESTS QUEUE TAB */}
      {activeTab === 'requests' && (
        <div className="bg-[#070203] border border-red-900/40 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-red-950 pb-3 gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-red-500" />
              <span>داواکارییەکانی موبایل و پسولەی پارەدان</span>
            </h3>
            <span className="text-xs font-mono bg-red-950/80 text-white px-2.5 py-1 rounded border border-red-600/60 font-bold shadow">
              {pendingCount} داواکاری لە چاوەڕوانیدایە
            </span>
          </div>

          {/* Search Box and Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="گەڕان لە داواکارییەکان (ناو، موبایل، FIB، ID)..."
                className="w-full bg-[#0d0406] border border-red-900/50 pr-10 pl-3 py-2 rounded-lg text-white text-xs outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 bg-[#0d0406] p-1 rounded-lg border border-red-900/50 text-xs font-mono">
              <button
                onClick={() => setRequestTypeFilter('all')}
                className={`flex-1 min-w-[70px] py-1 px-2 rounded transition-all font-bold ${
                  requestTypeFilter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                هەمووی ({pendingRequests.length})
              </button>
              <button
                onClick={() => setRequestTypeFilter('buy')}
                className={`flex-1 min-w-[90px] py-1 px-2 rounded transition-all font-bold ${
                  requestTypeFilter === 'buy' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                کڕین (VIP)
              </button>
              <button
                onClick={() => setRequestTypeFilter('withdraw')}
                className={`flex-1 min-w-[90px] py-1 px-2 rounded transition-all font-bold ${
                  requestTypeFilter === 'withdraw' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ڕاکێشان
              </button>
            </div>
          </div>

          {/* Sub-Filters for Status */}
          <div className="flex flex-wrap gap-1.5 bg-[#0d0406] p-1.5 rounded-lg border border-red-900/50 text-xs font-mono">
            <button
              onClick={() => setRequestStatusFilter('pending')}
              className={`px-3 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
                requestStatusFilter === 'pending'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>چاوەڕوانکراو</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded">
                {pendingRequests.filter((r) => r.status === 'pending').length}
              </span>
            </button>

            <button
              onClick={() => setRequestStatusFilter('approved')}
              className={`px-3 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
                requestStatusFilter === 'approved'
                  ? 'bg-red-700 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>پەسەندکراو</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded">
                {pendingRequests.filter((r) => r.status === 'approved').length}
              </span>
            </button>

            <button
              onClick={() => setRequestStatusFilter('rejected')}
              className={`px-3 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
                requestStatusFilter === 'rejected'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>ڕەتکراوە</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded">
                {pendingRequests.filter((r) => r.status === 'rejected').length}
              </span>
            </button>

            <button
              onClick={() => setRequestStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
                requestStatusFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>هەمووی</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded">
                {pendingRequests.length}
              </span>
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs font-mono border border-dashed border-red-900/40 rounded-xl">
              هیچ داواکارییەکی لەم جۆرە لە لیستەکەدا نییە.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const isVipBuy = req.isMonthly || req.title?.includes('VIP') || req.title?.includes('مانگانەی');

                return (
                  <div
                    key={req.id}
                    className={`bg-[#0a0305] border p-4 rounded-xl space-y-3 text-xs transition-all ${
                      isVipBuy
                        ? 'border-red-600 shadow-lg shadow-red-950/30'
                        : 'border-red-950/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-950 pb-2.5">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                          <span>{req.userName}</span>
                          {isVipBuy ? (
                            <span className="text-[11px] font-mono font-bold text-white bg-red-600 px-2.5 py-0.5 rounded border border-red-500 flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-white text-white" />
                              <span>{req.title} (⭐ VIP)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-red-300 bg-[#150608] px-2.5 py-0.5 rounded border border-red-900/60">
                              {req.title}
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-400 text-[10px] font-mono mt-0.5">
                          کاتی ناردن: {req.date}
                        </div>
                      </div>

                      <div className="text-left font-mono font-bold text-white text-sm bg-red-950/90 px-3 py-1 rounded border border-red-600/50">
                        {req.amount.toLocaleString()}
                      </div>
                    </div>

                    {/* Payment Receipt Box */}
                    <div className="bg-[#100407] border border-red-900/60 rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="text-red-400 font-bold text-[11px] flex items-center justify-between">
                        <span>📜 پسولەی پارەدان لە موبایلەوە:</span>
                        <span className="font-mono text-[10px] bg-red-950 text-white px-2 py-0.5 rounded border border-red-800">
                          ID: {req.receiptRef || `REC-${req.id}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 pt-1 font-mono text-[11px]">
                        <div>
                          📱 موبایلی نێرەر: <strong className="text-white">{req.userPhone || req.userFib || 'دیاری نەکراوە'}</strong>
                        </div>
                        <div>
                          💳 FIB نێرەر: <strong className="text-red-400">{req.userFib}</strong>
                        </div>
                      </div>

                      {req.receiptNote && (
                        <div className="text-[11px] text-zinc-400 pt-1 border-t border-red-950 mt-1">
                          📝 تێبینی پسولە: <span className="text-zinc-200">{req.receiptNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div>
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 border border-red-500 px-3 py-1 rounded-lg shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>پەسەندکراوە</span>
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-300 bg-red-950 border border-red-800 px-3 py-1 rounded-lg">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ڕەتکراوەتەوە</span>
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-950 border border-red-600/70 px-3 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span>لە چاوەڕوانیدایە</span>
                          </span>
                        )}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onApproveRequest(req.id)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>پەسەندکردنی پسولە</span>
                          </button>

                          <button
                            onClick={() => onRejectRequest(req.id)}
                            className="bg-red-950 hover:bg-red-900 text-red-200 font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 border border-red-800 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>ڕەتکردنەوە</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-[#070203] border border-red-900/40 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-red-950 pb-3 gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Users className="w-4 h-4 text-red-500" />
              <span>لیستی سەرجەم بەکارهێنەرانی تۆمارکراو ({allUsers.length})</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {onDeleteAllUsers && allUsers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setConfirmDeleteScope('logged')}
                    className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
                    title="سڕینەوەی گشتی تەنها ئەم بەکارهێنەرانەی داخلبوون"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>سڕینەوەی داخلبووان ({allUsers.filter((u) => u.data.isLoggedIn || u.data.lastLoginAt).length})</span>
                  </button>

                  <button
                    onClick={() => setConfirmDeleteScope('all')}
                    className="bg-red-600 hover:bg-red-500 text-white font-black py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 shadow transition-all cursor-pointer border border-red-400"
                    title="سڕینەوەی گشتی سەرجەم بەکارهێنەران لە داتابەیس"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>سڕینەوەی گشتی (Delete All)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('دڵنیای کە دەتەوێت باڵانسی سەرجەم بەکارهێنەران سفر بکەیتەوە بۆ $0؟ ئەم گۆڕانکارییە ناگەڕێتەوە.')) {
                        onResetAllBalances && onResetAllBalances();
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-black py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 shadow transition-all cursor-pointer border border-amber-400"
                    title="سفرکردنەوەی سەرجەم باڵانسەکان بۆ سفر"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-white" />
                    <span>سفرکردنەوەی باڵانسەکان (Reset Balances)</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsCreatingUser(!isCreatingUser)}
                className="bg-red-700 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isCreatingUser ? 'داخستنی فۆرم' : 'زیادکردنی بەکارهێنەر'}</span>
              </button>
            </div>
          </div>

          {/* Form to Create New User */}
          {isCreatingUser && (
            <form onSubmit={handleCreateUserSubmit} className="bg-[#0d0406] border border-red-600/70 p-4 rounded-xl space-y-3 text-xs shadow-lg">
              <div className="font-bold text-white border-b border-red-950 pb-2 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-red-500" />
                <span>دروستکردنی ئەکاونتی بەکارهێنەری نوێ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">ناوی تەواو</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="هێمن نادر"
                    className="w-full bg-[#140608] border border-red-900/50 px-3 py-2 rounded-lg text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">ژمارەی FIB</label>
                  <input
                    type="text"
                    required
                    value={newUserFib}
                    onChange={(e) => setNewUserFib(e.target.value)}
                    placeholder="07501234567"
                    className="w-full bg-[#140608] border border-red-900/50 px-3 py-2 rounded-lg text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">وشەی تێپەڕ (Password)</label>
                  <input
                    type="password"
                    required
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#140608] border border-red-900/50 px-3 py-2 rounded-lg text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">باڵانسی سەرەتایی</label>
                  <input
                    type="number"
                    value={newUserBalance}
                    onChange={(e) => setNewUserBalance(Number(e.target.value))}
                    className="w-full bg-[#140608] border border-red-900/50 px-3 py-2 rounded-lg text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-red-400">
                    <input
                      type="checkbox"
                      checked={newUserIsVip}
                      onChange={(e) => setNewUserIsVip(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 accent-red-600"
                    />
                    <span>ئەندامی VIP بێت؟</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-xs shadow transition-all cursor-pointer"
              >
                پاشەکەوتکردن و تۆمارکردن
              </button>
            </form>
          )}

          {/* Search Box & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="گەڕان بەدوای بەکارهێنەر (ناو، FIB)..."
                className="w-full bg-[#0d0406] border border-red-900/50 pr-10 pl-3 py-2 rounded-lg text-white text-xs outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-1 bg-[#0d0406] p-1 rounded-lg border border-red-900/50 text-xs font-mono">
              <button
                onClick={() => setUserFilter('all')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  userFilter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                هەمووی ({allUsers.length})
              </button>
              <button
                onClick={() => setUserFilter('online')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  userFilter === 'online' ? 'bg-red-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🟢 ئۆنلاین ({allUsers.filter((u) => u.data.isOnline || ((now - (u.data.lastActive || 0)) <= 3 * 60 * 1000)).length})
              </button>
              <button
                onClick={() => setUserFilter('logged')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  userFilter === 'logged' ? 'bg-red-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🔓 داخلبووان ({allUsers.filter((u) => u.data.isLoggedIn || u.data.lastLoginAt).length})
              </button>
              <button
                onClick={() => setUserFilter('vip')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  userFilter === 'vip' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ⭐ VIP ({allUsers.filter((u) => u.data.monthly).length})
              </button>
              <button
                onClick={() => setUserFilter('banned')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  userFilter === 'banned' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-zinc-400 hover:text-white'
                }`}
              >
                باندکراو ({allUsers.filter((u) => u.data.isBanned).length})
              </button>
              <button
                onClick={() => setUserFilter('verification')}
                className={`px-2.5 py-1 rounded transition-all font-bold ${
                  userFilter === 'verification' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🛡️ داواکاری ڤێریفاید ({allUsers.filter((u) => u.data.verificationStatus === 'pending').length})
              </button>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs font-mono border border-dashed border-red-900/40 rounded-xl">
              هیچ بەکارهێنەرێک نەدۆزرایەوە.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredUsers.map(({ key, data }) => {
                const isUserOnline = Boolean(data.isOnline || ((now - (data.lastActive || 0)) <= 3 * 60 * 1000));
                const isUserLogged = Boolean(data.isLoggedIn || data.lastLoginAt);

                return (
                  <div
                    key={key}
                    className={`bg-[#0a0305] border p-3.5 rounded-xl space-y-3 text-xs transition-all ${
                      isUserOnline
                        ? 'border-red-600 shadow-md shadow-red-950/30'
                        : 'border-red-950/60 hover:border-red-900'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-white">{data.name}</span>

                          {isUserOnline ? (
                            <span className="bg-red-950 text-white border border-red-600 font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span>ئۆنلاین</span>
                            </span>
                          ) : (
                            <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono text-[10px] px-2 py-0.5 rounded">
                              ئۆفلاین
                            </span>
                          )}

                          {isUserLogged && (
                            <span className="bg-red-600 text-white border border-red-500 font-mono text-[10px] px-2 py-0.5 rounded font-bold shadow">
                              🔓 داخل بووە
                            </span>
                          )}

                          {data.monthly && (
                            <span className="bg-red-600 text-white font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow">
                              <Star className="w-3 h-3 fill-white text-white" />
                              <span>VIP</span>
                            </span>
                          )}

                          {data.isBanned && (
                            <span className="bg-red-950 text-red-300 border border-red-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                              باندکراوە
                            </span>
                          )}

                          {data.verificationStatus === 'verified' && (
                            <span className="bg-red-950 text-white border border-red-600 font-mono text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                              🛡️ ڤێریفایدکراو
                            </span>
                          )}

                          {data.verificationStatus === 'pending' && (
                            <span className="bg-red-600 text-white border border-red-500 font-mono text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                              ⏳ داواکاری ڤێریفاید
                            </span>
                          )}

                          {data.verificationStatus === 'rejected' && (
                            <span className="bg-red-950 text-red-300 border border-red-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                              ❌ ڤێریفاید ڕەتکرایەوە
                            </span>
                          )}
                        </div>

                        <div className="text-zinc-400 text-[11px] font-mono mt-1 flex flex-wrap items-center gap-3">
                          <span>📱 موبایل/FIB: <strong className="text-white">{data.fib}</strong></span>
                          <span>🔑 ئیپاسۆرد: <strong className="text-red-400">{data.pass}</strong></span>
                          <span>💰 باڵانس: <strong className="text-emerald-400 text-xs">{formatIQD(data.balance || 0)}</strong> (${(data.balance || 0).toLocaleString()})</span>
                          {data.createdAt && (
                            <span>📅 دروستکراوە: <strong className="text-zinc-400">{data.createdAt}</strong></span>
                          )}
                          {data.lastActive && (
                            <span>⏱️ دواین چالاکی: <strong className="text-red-400">{getTimeAgoText(data.lastActive)}</strong></span>
                          )}
                        </div>

                        {/* Quick Deposit Balance Buttons */}
                        <div className="flex items-center gap-1.5 mt-2 bg-[#120406] p-1.5 rounded-lg border border-red-900/50 w-fit">
                          <span className="text-[10px] text-zinc-400 font-bold ml-1">داخڵکردنی باڵانس (Quick Deposit):</span>
                          {[33.33, 66.67, 166.67, 333.33].map((usdVal, idx) => {
                            const iqdLabel = idx === 0 ? '50,000 د.ع' : idx === 1 ? '100,000 د.ع' : idx === 2 ? '250,000 د.ع' : '500,000 د.ع';
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  const newBal = (data.balance || 0) + Math.round(usdVal);
                                  onUpdateUser(key, { ...data, balance: newBal });
                                  showToast(`بڕی ${iqdLabel} بەسەرکەوتوویی بۆ ${data.name} زیاکرا!`, 'success');
                                }}
                                className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
                              >
                                + {iqdLabel}
                              </button>
                            );
                          })}
                        </div>

                        {(data.verificationPhone || data.verificationIdNumber) && (
                          <div className="text-[11px] font-mono bg-[#121215] p-2 rounded border border-[#27272a] text-zinc-300 mt-2 flex flex-wrap gap-3">
                            {data.verificationPhone && (
                              <span>📞 موبایلی ڤێریفای: <strong className="text-sky-400">{data.verificationPhone}</strong></span>
                            )}
                            {data.verificationIdNumber && (
                              <span>🆔 ناسنامە/پاسپۆرت: <strong className="text-amber-400">{data.verificationIdNumber}</strong></span>
                            )}
                          </div>
                        )}

                        {data.monthly && (
                          <div className="text-[10px] font-mono text-indigo-300 mt-1.5 flex items-center gap-1.5 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-500/30 w-fit">
                            <span>⏳ بەسەرچوونی VIP:</span>
                            <strong className="text-amber-300">
                              {data.vipExpiryDate
                                ? new Date(data.vipExpiryDate).toLocaleDateString('en-GB') + ' ' + new Date(data.vipExpiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '30 ڕۆژ'}
                            </strong>
                          </div>
                        )}
                      </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {data.monthly ? (
                          <button
                            onClick={() =>
                              onUpdateUser(key, {
                                ...data,
                                monthly: false,
                                vipPlanType: undefined,
                                vipExpiryDate: null
                              })
                            }
                            className="px-2.5 py-1 rounded font-mono font-bold text-[10px] border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                          >
                            لادانی VIP
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                onUpdateUser(key, {
                                  ...data,
                                  monthly: true,
                                  vipPlanType: 'monthly',
                                  vipExpiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
                                  vipDailyClicks: 100
                                })
                              }
                              className="px-2 py-1 rounded font-mono font-bold text-[10px] border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
                              title="بکردنی VIPی مانگانە بۆ 30 ڕۆژ"
                            >
                              + VIP مانگانە (30 ڕۆژ)
                            </button>
                            <button
                              onClick={() =>
                                onUpdateUser(key, {
                                  ...data,
                                  monthly: true,
                                  vipPlanType: 'yearly',
                                  vipExpiryDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
                                  vipDailyClicks: 100
                                })
                              }
                              className="px-2 py-1 rounded font-mono font-bold text-[10px] border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                              title="بکردنی VIPی ساڵانە بۆ 365 ڕۆژ"
                            >
                              + VIP ساڵانە (365 ڕۆژ)
                            </button>
                          </div>
                        )}

                      <button
                        onClick={() =>
                          onUpdateUser(key, { ...data, isBanned: !data.isBanned })
                        }
                        className={`px-2.5 py-1 rounded font-mono font-bold text-[10px] border transition-all cursor-pointer ${
                          data.isBanned
                            ? 'bg-red-950 text-white border-red-700'
                            : 'bg-red-900/30 text-red-300 border-red-900/60 hover:bg-red-900/60'
                        }`}
                      >
                        {data.isBanned ? 'لادانی باند' : 'باندکردن'}
                      </button>

                      {data.verificationStatus === 'pending' ? (
                        <>
                          <button
                            onClick={() => {
                              onUpdateUser(key, { ...data, verificationStatus: 'verified' });
                              showToast(`پرۆفایلی ${data.name} سەلمێنرا (Verified)!`, 'success');
                            }}
                            className="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow"
                          >
                            پەسەندکردنی ڤێریفاید ✅
                          </button>
                          <button
                            onClick={() => {
                              onUpdateUser(key, { ...data, verificationStatus: 'rejected' });
                              showToast(`داواکاری ڤێریفایدی ${data.name} ڕەتکرایەوە`, 'info');
                            }}
                            className="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-red-950 text-red-200 border border-red-800 hover:bg-red-900 transition-all cursor-pointer shadow"
                          >
                            ڕەتکردنەوە ❌
                          </button>
                        </>
                      ) : data.verificationStatus === 'verified' ? (
                        <button
                          onClick={() => {
                            onUpdateUser(key, { ...data, verificationStatus: 'none' });
                            showToast(`ڤێریفایدی ${data.name} لادرا`, 'info');
                          }}
                          className="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-red-950 text-white border border-red-800 hover:bg-red-900 transition-all cursor-pointer"
                        >
                          لادانی ڤێریفاید 🛡️
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onUpdateUser(key, { ...data, verificationStatus: 'verified' });
                            showToast(`پرۆفایلی ${data.name} ڤێریفاید کرا!`, 'success');
                          }}
                          className="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-[#120406] text-white border border-red-800 hover:bg-red-600 transition-all cursor-pointer"
                        >
                          پێدانی ڤێریفاید 🛡️
                        </button>
                      )}

                      <button
                        onClick={() => startEditUser(key, data)}
                        className="p-1.5 bg-[#120406] text-white border border-red-900/60 rounded hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                        title="دەستکاری باڵانس یان کلیک"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteUser && (
                        <button
                          onClick={() => {
                            if (window.confirm(`دڵنیایت لە حەذفکردنی بەکارهێنەر (${data.name})؟`)) {
                              onDeleteUser(key);
                              showToast(`بەکارهێنەر حەذفکرا`, 'info');
                            }
                          }}
                          className="p-1.5 bg-red-950/80 text-red-300 border border-red-800 rounded hover:bg-red-700 hover:text-white transition-all cursor-pointer"
                          title="حەذفکردنی بەکارهێنەر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Edit inline form */}
                  {editingUserKey === key ? (
                    <div className="bg-[#0d0406] border border-red-600 p-3.5 rounded-lg space-y-3 shadow-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-zinc-300 font-bold block mb-1">
                            باڵانسی گشتی
                          </label>
                          <input
                            type="number"
                            value={editBalance}
                            onChange={(e) => setEditBalance(Number(e.target.value))}
                            className="w-full bg-[#140608] border border-red-900/80 px-3 py-2 rounded text-white text-sm font-mono font-bold outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-300 font-bold block mb-1">
                            ژمارەی کلیک
                          </label>
                          <input
                            type="number"
                            value={editClicks}
                            onChange={(e) => setEditClicks(Number(e.target.value))}
                            className="w-full bg-[#140608] border border-red-900/80 px-3 py-2 rounded text-white text-sm font-mono font-bold outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      {/* Quick Balance Add Shortcuts */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-zinc-400 font-bold block">
                          ⚡ زیاتکردنی خێرای باڵانس (بڕی دیاریکراو زێدە دەکات):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[1000, 5000, 10000, 25000, 50000, 100000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setEditBalance((prev) => (Number(prev) || 0) + amt)}
                              className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-mono font-bold cursor-pointer transition-all"
                            >
                              +{amt.toLocaleString()}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEditBalance(0)}
                            className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded text-[10px] font-mono font-bold cursor-pointer transition-all"
                          >
                            سفرکردنەوە (0)
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-red-950">
                        <button
                          onClick={() => saveUserChanges(key, data)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span>پاشەکەوتکردنی باڵانس</span>
                        </button>
                        <button
                          onClick={() => setEditingUserKey(null)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-1.5 rounded text-xs cursor-pointer transition-all"
                        >
                          داخستن
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-400 text-xs pt-2 border-t border-red-950 font-mono">
                      <div>
                        باڵانس: <strong className="text-emerald-400 text-sm">{data.balance.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-zinc-500">زیاتکردنی خێرا:</span>
                        {[5000, 10000, 25000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => {
                              const newBal = (data.balance || 0) + amt;
                              onUpdateUser(key, { ...data, balance: newBal });
                              showToast(`بڕی +${amt.toLocaleString()} زێدە کرا بۆ ${data.name}!`, 'success');
                            }}
                            className="px-2 py-0.5 bg-emerald-950/90 hover:bg-emerald-700 text-emerald-300 border border-emerald-800 rounded font-bold transition-all cursor-pointer"
                          >
                            +{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-[#070203] border border-red-900/40 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <Settings className="w-4 h-4 text-red-500" />
            <span>ڕێکخستنە گشتییەکانی پلاتفۆرم</span>
          </h3>

          <form onSubmit={handleSaveAppSettings} className="space-y-4 text-xs">
            {/* Admin Loss Vault Section */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 via-[#120306] to-black border border-red-700/60 space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-white font-bold text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <span>باڵانسی خەزێنەی ئەدمین (کۆکراوەی زەرەری بەکارهێنەران لە یارییەکان)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAdminVaultBalance(0)}
                  className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  سفرکردنەوەی باڵانس
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                ئەم باڵانسە بە شێوەیەکی ئۆتۆماتیکی زیادی دەکات هەرکاتێک یاریزانێک لە یارییەکانی بەختدا (چرخی بەخت، سڵۆت، مینەکان، بەلەم...) زەرەر بکات.
              </p>
              <div className="relative flex items-center pt-1">
                <input
                  type="number"
                  min="0"
                  value={adminVaultBalance}
                  onChange={(e) => setAdminVaultBalance(Number(e.target.value))}
                  className="w-full bg-[#0d0406] border border-red-800 pr-12 pl-3 py-2.5 rounded-lg text-white font-mono font-bold text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">
                ژمارەی FIB بەکارهاتوو بۆ وەرگرتنی پارەی پاکێجەکان
              </label>
              <div className="relative flex items-center">
                <Smartphone className="w-4 h-4 text-zinc-500 absolute right-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fibNum}
                  onChange={(e) => setFibNum(e.target.value)}
                  className="w-full bg-[#0d0406] border border-red-900/50 pr-10 pl-3 py-2 rounded-lg text-white outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">
                ناوی بەکارهێنەری ئەدمن (Admin Username)
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-zinc-500 absolute right-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#0d0406] border border-red-900/50 pr-10 pl-3 py-2 rounded-lg text-white outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">
                وشەی تێپەڕی نوێی ئەدمن (Admin Password)
              </label>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-zinc-500 absolute right-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-[#0d0406] border border-red-900/50 pr-10 pl-3 py-2 rounded-lg text-white outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow transition-all cursor-pointer"
            >
              پاشەکەوتکردنی ڕێکخستنەکان
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Bulk Deletion */}
      {confirmDeleteScope && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050c1a] border-2 border-blue-600 rounded-2xl p-6 max-w-md w-full space-y-4 text-center shadow-2xl shadow-blue-950/80 animate-in fade-in zoom-in duration-150">
            <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto text-blue-500 animate-pulse">
              <Trash2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-white">
              ⚠️ ئاگاداری زۆر گرنگ - سڕینەوەی گشتی
            </h3>

            <div className="text-xs text-zinc-300 leading-relaxed font-sans space-y-2">
              <p>
                {confirmDeleteScope === 'logged' && 'ئایا بەڕاستی دڵنیایت لە سڕینەوەی سەرجەم بەکارهێنەرانی داخلبوو (Logged-in Users)؟'}
                {confirmDeleteScope === 'banned' && 'ئایا بەڕاستی دڵنیایت لە سڕینەوەی سەرجەم بەکارهێنەرانی باندکراو؟'}
                {confirmDeleteScope === 'all' && 'ئایا بەڕاستی دڵنیایت لە سڕینەوەی گشتی و سەرجەم بەکارهێنەرانی تۆمارکراو لە سیستەمەکەدا؟'}
              </p>
              <p className="text-blue-400 font-bold bg-blue-950/50 p-2.5 rounded-lg border border-blue-800/80">
                🚨 ئەم کردارە ڕاستەوخۆ هەموو حسابەکان لە داتابەیسی سێرڤەر و لاپەڕەی مۆبایلەکان دەسڕێتەوە و ناگەڕێتەوە!
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAllUsers && confirmDeleteScope) {
                    onDeleteAllUsers(confirmDeleteScope);
                  }
                  setConfirmDeleteScope(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-lg transition-all cursor-pointer border border-blue-400 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>بەڵێ، گشتی بسڕەوە</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmDeleteScope(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer border border-zinc-700"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
