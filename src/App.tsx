import React, { useState, useEffect } from 'react';
import { User, PendingRequest, TradingSignal, AppSettings, VisitorSession } from './types';
import {
  getAppSettings,
  saveAppSettings,
  getTradingSignals,
  saveTradingSignals,
  getPendingRequests,
  savePendingRequests,
  getUserData,
  saveUserData,
  getAllUsers,
  getCurrentUserKey,
  setCurrentUserKey,
  addActivityLog,
  fetchUsersFromServer,
  fetchRequestsFromServer,
  fetchSignalsFromServer,
  fetchSettingsFromServer,
  updateRequestStatusOnServer,
  getAdminLoggedIn,
  setAdminLoggedIn,
  getSavedCurrentView,
  setSavedCurrentView,
  pingVisitorOnServer,
  fetchVisitorsFromServer,
  clearVisitorsOnServer,
  deleteUserApi,
  deleteAllUsersApi
} from './utils/storage';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { HistoryRequestsView } from './components/HistoryRequestsView';
import { AdminPanel } from './components/AdminPanel';
import { BuyModal } from './components/BuyModal';
import { Toast } from './components/Toast';
import { SupportBot } from './components/SupportBot';

export default function App() {
  const [currentView, setCurrentViewRaw] = useState<'home' | 'history' | 'admin'>(() => {
    const saved = getSavedCurrentView();
    return saved === 'signals' ? 'home' : (saved as 'home' | 'history' | 'admin');
  });
  const [currentUserKey, setCurrentUserKeyState] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedInState] = useState<boolean>(getAdminLoggedIn());
  const [visitors, setVisitors] = useState<VisitorSession[]>([]);

  const setCurrentView = (view: 'home' | 'history' | 'admin') => {
    setCurrentViewRaw(view);
    setSavedCurrentView(view);
  };

  const setIsAdminLoggedIn = (val: boolean) => {
    setIsAdminLoggedInState(val);
    setAdminLoggedIn(val);
  };

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');

  const handleOpenAuth = (tab: 'login' | 'register' | 'admin' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // App Data States
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [signals, setSignals] = useState<TradingSignal[]>(getTradingSignals());
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(getPendingRequests());
  const [allUsersList, setAllUsersList] = useState<{ key: string; data: User }[]>([]);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Buy Modal State
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyPkgDetails, setBuyPkgDetails] = useState<{
    pkgName: string;
    price: number;
    clicks: number;
    isMonthly: boolean;
  }>({ pkgName: '', price: 0, clicks: 0, isMonthly: false });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Server & Local Database Auto-Sync
  const syncWithServer = async () => {
    try {
      const [serverUsers, serverRequests, serverSignals, serverSettings, serverVisitors] = await Promise.all([
        fetchUsersFromServer(),
        fetchRequestsFromServer(),
        fetchSignalsFromServer(),
        fetchSettingsFromServer(),
        fetchVisitorsFromServer()
      ]);
      setAllUsersList(serverUsers);
      setPendingRequests(serverRequests);
      setSignals(serverSignals);
      setSettings(serverSettings);
      if (serverVisitors) {
        setVisitors(serverVisitors);
      }

      const savedKey = getCurrentUserKey();
      if (savedKey) {
        const freshUser = serverUsers.find(u => u.key === savedKey)?.data;
        if (freshUser && !freshUser.isBanned) {
          // Zero out real account balance if leftover from mock trades
          if (freshUser.balance !== 0) {
            freshUser.balance = 0;
            saveUserData(savedKey, freshUser);
          }
          setUserData(freshUser);
        } else if (freshUser?.isBanned || (!freshUser && serverUsers.length > 0)) {
          // Immediately kick out banned or deleted user
          setCurrentUserKeyState(null);
          setUserData(null);
          setCurrentUserKey(null);
          if (currentView !== 'admin') {
            setCurrentView('home');
          }
          showToast('ئەکاونتەکەت لەلایەن ئەدمینەوە باندکرا (Banned)! یەکسەر لە ئەکاونتەکە دەرکرایت.', 'error');
        }
      }
    } catch {
      setAllUsersList(getAllUsers());
      setPendingRequests(getPendingRequests());
    }
  };

  // Heartbeat visitor ping (Only for real end users, excluding system admin)
  useEffect(() => {
    if (isAdminLoggedIn || currentView === 'admin') {
      return;
    }

    const doPing = () => {
      pingVisitorOnServer({
        userKey: currentUserKey || '',
        userName: userData?.name || 'سەردانیکەری مێوان',
        userPhone: userData?.fib || '',
        userFib: userData?.fib || '',
        page: currentView
      });
    };

    doPing();
    const pingInterval = setInterval(doPing, 10000); // ping every 10 seconds

    return () => clearInterval(pingInterval);
  }, [currentUserKey, userData, isAdminLoggedIn, currentView]);

  useEffect(() => {
    const savedKey = getCurrentUserKey();
    if (savedKey) {
      const data = getUserData(savedKey);
      if (data && !data.isBanned) {
        if (data.balance !== 0) {
          data.balance = 0;
          saveUserData(savedKey, data);
        }
        setCurrentUserKeyState(savedKey);
        setUserData(data);
      } else {
        setCurrentUserKey(null);
        setCurrentUserKeyState(null);
        setUserData(null);
      }
    }

    syncWithServer();
    const syncInterval = setInterval(() => {
      syncWithServer();
    }, 2500);

    return () => clearInterval(syncInterval);
  }, []);

  // Sync on view changes
  useEffect(() => {
    syncWithServer();
  }, [isAdminLoggedIn, currentView]);

  const handleUserAuthSuccess = async (key: string, data: User) => {
    setCurrentUserKeyState(key);
    setUserData(data);
    setIsAdminLoggedIn(false);
    setIsAuthModalOpen(false);
    setCurrentView('home');
    await saveUserData(key, data);
    await syncWithServer();
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentUserKeyState(null);
    setUserData(null);
    setIsAuthModalOpen(false);
    setCurrentView('admin');
    syncWithServer();
  };

  const handleLogout = () => {
    setCurrentUserKeyState(null);
    setUserData(null);
    setIsAdminLoggedIn(false);
    setCurrentUserKey(null);
    setCurrentView('home');
    showToast('دەرچوون بەسەرکەوتوویی ئەنجامدرا', 'info');
  };

  // Request Buy Package Modal Trigger
  const handleOpenBuyModal = (
    pkgName: string,
    price: number,
    clicks: number,
    isMonthly: boolean
  ) => {
    if (!userData) {
      showToast('تکایە سەرەتا بچۆ ژوورەوە یان ئەکاونت دروست بکە!', 'error');
      return;
    }
    setBuyPkgDetails({ pkgName, price, clicks, isMonthly });
    setBuyModalOpen(true);
  };

  // Submit Buy Package Request
  const handleSubmitBuyRequest = (
    senderFib: string,
    userPhone: string,
    receiptRef: string,
    receiptNote: string
  ) => {
    if (!currentUserKey || !userData) return;

    const newReq: PendingRequest = {
      id: Date.now(),
      userKey: currentUserKey,
      userName: userData.name,
      title: `کڕینی ${buyPkgDetails.pkgName}`,
      userFib: senderFib,
      userPhone: userPhone || userData.fib,
      receiptRef: receiptRef,
      receiptNote: receiptNote,
      amount: buyPkgDetails.price,
      clicks: buyPkgDetails.clicks,
      isMonthly: buyPkgDetails.isMonthly,
      type: 'buy',
      status: 'pending',
      date: new Date().toLocaleString('ku-IQ')
    };

    const currentPending = getPendingRequests();
    const updated = [newReq, ...currentPending];
    setPendingRequests(updated);
    savePendingRequests(updated);
    addActivityLog(currentUserKey, {
      type: 'buy_request',
      title: 'داواکاری کڕین نێردرا',
      detail: `کڕینی ${buyPkgDetails.pkgName} بە تێچووی ${buyPkgDetails.price.toLocaleString()}`
    });
    syncWithServer();
    showToast('پسولەی پارەدان بەسەرکەوتوویی نێردرا بۆ ئەدمین!', 'success');
  };

  // Submit Withdrawal Request
  const handleSubmitWithdrawRequest = (fibNumber: string, amount: number) => {
    if (!currentUserKey || !userData) return;

    if (amount > 1000) {
      showToast('زۆرترین بڕی پارە بۆ ڕاکێشانەوە ۱,۰۰۰ دۆلارە ($1,000)!', 'error');
      return;
    }

    // Check weekly withdrawal count limit (max 5 per week)
    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    let currentWeeklyCount = userData.weeklyWithdrawalCount || 0;
    let resetTime = userData.weeklyWithdrawalResetTime || (now + ONE_WEEK_MS);

    if (now >= resetTime) {
      currentWeeklyCount = 0;
      resetTime = now + ONE_WEEK_MS;
    }

    if (currentWeeklyCount >= 5) {
      showToast('سنوورداری ڕاکێشانەوە: تەنها ٥ جار ڕێگەپێدراوە لە هەفتەیەکدا! لە هەفتەی تازە دەتوانیت دیسان پارە بکێشیتەوە.', 'error');
      return;
    }

    // Deduct user balance immediately and update weekly withdrawal stats
    const updatedUser: User = {
      ...userData,
      balance: userData.balance - amount,
      weeklyWithdrawalCount: currentWeeklyCount + 1,
      weeklyWithdrawalResetTime: resetTime
    };
    setUserData(updatedUser);
    saveUserData(currentUserKey, updatedUser);

    const newReq: PendingRequest = {
      id: Date.now(),
      userKey: currentUserKey,
      userName: userData.name,
      title: `ڕاکێشانی ${amount.toLocaleString()}`,
      userFib: fibNumber,
      amount: amount,
      clicks: 0,
      isMonthly: false,
      type: 'withdraw',
      status: 'pending',
      date: new Date().toLocaleString('ku-IQ')
    };

    const currentPending = getPendingRequests();
    const updated = [newReq, ...currentPending];
    setPendingRequests(updated);
    savePendingRequests(updated);
    addActivityLog(currentUserKey, {
      type: 'withdraw_request',
      title: 'داواکاری ڕاکێشان نێردرا',
      detail: `داواکاری ڕاکێشانی ${amount.toLocaleString()} بۆ هەژماری ${fibNumber}`
    });
    syncWithServer();
    showToast('داواکاری ڕاکێشانی پارە بە سەرکەوتوویی تۆمارکرا!', 'success');
  };

  // ADMIN ACTIONS: Approve Request
  const handleApproveRequest = async (requestId: number) => {
    const target = pendingRequests.find((r) => r.id === requestId);
    if (!target) return;

    // First update user locally in storage/state
    if (target.userKey) {
      const targetUser = allUsersList.find((u) => u.key === target.userKey)?.data || getUserData(target.userKey);
      if (targetUser) {
        const updatedUser = { ...targetUser };
        if (target.type === 'buy') {
          updatedUser.balance = (updatedUser.balance || 0) + (target.amount || 0);
          if (target.clicks) {
            updatedUser.clicks = (updatedUser.clicks || 0) + target.clicks;
          }
          if (target.isMonthly) {
            const is30Min = target.title.includes('۳۰') || target.title.includes('30') || target.title.includes('خولەک') || target.title.includes('سەعات') || target.title.includes('Hourly');
            const isMonthly = target.title.includes('مانگ') || target.title.includes('Monthly');
            const initialClicks = target.clicks || 15;
            updatedUser.monthly = true;
            updatedUser.vipPlanType = is30Min ? 'min30' : isMonthly ? 'monthly' : 'yearly';
            updatedUser.vipInitialClicks = initialClicks;
            updatedUser.vipDailyClicks = initialClicks;
            const durationMs = is30Min ? 30 * 60 * 1000 : isMonthly ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
            updatedUser.vipNextResetTime = Date.now() + durationMs;
            updatedUser.vipExpiryDate = Date.now() + durationMs;
          }
        }
        await saveUserData(target.userKey, updatedUser);
        if (currentUserKey === target.userKey) {
          setUserData(updatedUser);
        }
      }
    }

    // Call server update
    await updateRequestStatusOnServer(requestId, 'approved');

    addActivityLog(target.userKey, {
      type: 'approval',
      title: 'داواکاری پەسەندکرا',
      detail: `${target.title} لەلایەن ئەدمینەوە پەسەندکرا (+${(target.amount || 0).toLocaleString()})`
    });

    await syncWithServer();
    showToast('داواکارییەکە پەسەندکرا و پارەکە چووە سەر حسابی بەکارهێنەر! 🎉', 'success');
  };

  // ADMIN ACTIONS: Reject Request
  const handleRejectRequest = async (requestId: number) => {
    const target = pendingRequests.find((r) => r.id === requestId);
    if (!target) return;

    // Refund deducted balance if withdrawal is rejected
    if (target.userKey && target.type === 'withdraw' && target.amount) {
      const targetUser = allUsersList.find((u) => u.key === target.userKey)?.data || getUserData(target.userKey);
      if (targetUser) {
        const updatedUser = {
          ...targetUser,
          balance: (targetUser.balance || 0) + target.amount
        };
        await saveUserData(target.userKey, updatedUser);
        if (currentUserKey === target.userKey) {
          setUserData(updatedUser);
        }
      }
    }

    await updateRequestStatusOnServer(requestId, 'rejected');

    addActivityLog(target.userKey, {
      type: 'approval',
      title: 'داواکاری ڕەتکرایەوە',
      detail: `${target.title} ڕەتکرایەوە${target.type === 'withdraw' ? ' و پارەکەی گەڕێندرایەوە سەر باڵانس' : ''}`
    });

    await syncWithServer();
    showToast('داواکارییەکە ڕەتکرایەوە!', 'info');
  };

  // ADMIN ACTIONS: User Update & Manage
  const handleUpdateUser = async (key: string, updatedUser: User) => {
    await saveUserData(key, updatedUser);
    if (currentUserKey === key) {
      setUserData(updatedUser);
    }
    await syncWithServer();
  };

  const handleDeleteUser = async (key: string) => {
    await deleteUserApi(key);
    if (currentUserKey === key) {
      setCurrentUserKeyState(null);
      setUserData(null);
      setCurrentUserKey(null);
    }
    await syncWithServer();
  };

  const handleDeleteAllUsers = async (scope: 'all' | 'logged' | 'banned' = 'all') => {
    await deleteAllUsersApi(scope);
    if (scope === 'all' || scope === 'logged') {
      setCurrentUserKeyState(null);
      setUserData(null);
      setCurrentUserKey(null);
    }
    await syncWithServer();
    const label = scope === 'logged' ? 'سەرجەم بەکارهێنەرانی داخلبوو' : scope === 'banned' ? 'سەرجەم بەکارهێنەرانی باندکراو' : 'سەرجەم بەکارهێنەرانی پلاتفۆرم';
    showToast(`${label} بەسەرکەوتوویی حەذفکران!`, 'success');
  };

  const handleResetAllBalances = async () => {
    try {
      const allUsers = await fetchUsersFromServer();
      for (const u of allUsers) {
        const updatedUser = {
          ...u.data,
          balance: 0
        };
        await saveUserData(u.key, updatedUser);
        if (currentUserKey === u.key) {
          setUserData(updatedUser);
        }
      }
      await syncWithServer();
      showToast('باڵانسی سەرجەم بەکارهێنەران سفر کرایەوە بەسەرکەوتوویی! 💸', 'success');
    } catch (err) {
      console.error('Error resetting balances:', err);
      showToast('هەڵەیەک ڕوویدا لە کاتی سفرکردنەوەی باڵانسەکان', 'error');
    }
  };

  const handleCreateUser = async (newUserKey: string, newUser: User) => {
    await saveUserData(newUserKey, newUser);
    await syncWithServer();
  };

  const handleClearVisitors = async () => {
    await clearVisitorsOnServer();
    setVisitors([]);
    showToast('لۆگی سەردانیکەران سڕایەوە', 'info');
  };

  // ADMIN ACTIONS: Signals
  const handleAddSignal = (newSig: TradingSignal) => {
    const updated = [newSig, ...signals];
    setSignals(updated);
    saveTradingSignals(updated);
  };

  const handleUpdateSignalStatus = (
    id: string,
    newStatus: TradingSignal['status']
  ) => {
    const updated = signals.map((s) =>
      s.id === id ? { ...s, status: newStatus } : s
    );
    setSignals(updated);
    saveTradingSignals(updated);
    showToast('باری سیگناڵ نوێکرایەوە!', 'success');
  };

  const handleDeleteSignal = (id: string) => {
    const updated = signals.filter((s) => s.id !== id);
    setSignals(updated);
    saveTradingSignals(updated);
    showToast('سیگناڵەکە سڕایەوە!', 'info');
  };

  // ADMIN ACTIONS: Save App Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  // RECORD USER GAME LOSS TO ADMIN VAULT
  const handleRecordGameLoss = (lossAmount: number) => {
    if (lossAmount <= 0) return;
    setSettings((prev) => {
      const newVault = (prev.adminVaultBalance || 0) + lossAmount;
      const updated = { ...prev, adminVaultBalance: newVault };
      saveAppSettings(updated);
      return updated;
    });
    fetch('/api/admin/vault/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: lossAmount })
    }).catch((err) => console.error('Error recording loss to vault:', err));
  };

  const pendingCount = pendingRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-2 sm:p-4 md:p-6 selection:bg-blue-500/30 selection:text-blue-200 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl xl:max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          userName={userData?.name}
          balance={userData?.balance}
          isAdmin={isAdminLoggedIn}
          onLogout={handleLogout}
          pendingCount={pendingCount}
          onOpenAuth={handleOpenAuth}
        />

        {/* Not logged in view: Rich Landing Page */}
        {!userData && !isAdminLoggedIn && (
          <LandingPage onOpenAuth={handleOpenAuth} pendingRequests={pendingRequests} />
        )}

        {/* User Logged In Views */}
        {userData && !isAdminLoggedIn && (
          <>
            {currentView === 'home' && (
              <UserDashboard
                user={userData}
                userKey={currentUserKey || ''}
                settings={settings}
                onRequestBuy={handleOpenBuyModal}
                onRequestWithdraw={handleSubmitWithdrawRequest}
                onNavigateView={(view) => setCurrentView(view)}
                onUpdateUser={handleUpdateUser}
                onRecordGameLoss={handleRecordGameLoss}
                onDeleteAccount={handleDeleteUser}
                onRequestAuth={(tab) => handleOpenAuth(tab)}
                showToast={showToast}
              />
            )}

            {currentView === 'history' && (
              <HistoryRequestsView
                requests={pendingRequests}
                userKey={currentUserKey || ''}
              />
            )}
          </>
        )}

        {/* Admin Dashboard */}
        {isAdminLoggedIn && (
          <AdminPanel
            pendingRequests={pendingRequests}
            allUsers={allUsersList}
            signals={signals}
            settings={settings}
            visitors={visitors}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onDeleteAllUsers={handleDeleteAllUsers}
            onResetAllBalances={handleResetAllBalances}
            onCreateUser={handleCreateUser}
            onAddSignal={handleAddSignal}
            onUpdateSignalStatus={handleUpdateSignalStatus}
            onDeleteSignal={handleDeleteSignal}
            onSaveSettings={handleSaveSettings}
            onClearVisitors={handleClearVisitors}
            showToast={showToast}
          />
        )}
      </div>

      {/* Auth Modal Popup Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex justify-center items-start sm:items-center">
          <div className="w-full max-w-md my-auto pt-6 sm:pt-0 pb-12 sm:pb-0">
            <AuthModal
              onSuccessUser={handleUserAuthSuccess}
              onSuccessAdmin={handleAdminAuthSuccess}
              showToast={showToast}
              initialTab={authModalTab}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Buy Modal */}
      <BuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        pkgName={buyPkgDetails.pkgName}
        price={buyPkgDetails.price}
        clicks={buyPkgDetails.clicks}
        isMonthly={buyPkgDetails.isMonthly}
        fibDestinationNumber={settings.fibNumber}
        onSubmitRequest={handleSubmitBuyRequest}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

      {/* Floating AI & Anti-Ban Support Bot (Landing Page Only) */}
      {!userData && !isAdminLoggedIn && (
        <SupportBot
          user={userData}
          settings={settings}
          onOpenBuyModal={() => setBuyModalOpen(true)}
          onNavigateView={(view) => setCurrentView(view)}
          onRequestAuth={(tab) => handleOpenAuth(tab)}
        />
      )}
    </div>
  );
}
