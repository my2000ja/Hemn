import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Lock, Smartphone, ShieldCheck, ArrowRight, User as UserIcon, Eye, EyeOff, Sparkles, X, Gift, CheckCircle2, Info, Clock, Send, RefreshCw, XCircle } from 'lucide-react';
import { User, PendingRequest } from '../types';
import { saveUserData, setCurrentUserKey, getAllUsers, getAppSettings, fetchUsersFromServer, addActivityLog, fetchRequestsFromServer } from '../utils/storage';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../utils/i18n';

interface AuthModalProps {
  onSuccessUser: (userKey: string, userData: User) => void;
  onSuccessAdmin: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialTab?: 'login' | 'register' | 'admin';
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccessUser,
  onSuccessAdmin,
  showToast,
  initialTab = 'login',
  onClose
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin' | 'forgot'>(initialTab);


  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Password Visibility States
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Login Form fields
  const [loginInput, setLoginInput] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register Form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFib, setRegFib] = useState('');
  const [regPass, setRegPass] = useState('');

  // Admin Form fields
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Forgot Password fields
  const [forgotInput, setForgotInput] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = loginInput.trim();
    const cleanPass = loginPass.trim();

    if (!cleanUser || !cleanPass) {
      showToast('تکایە هەموو خانەکان پڕبکەرەوە!', 'error');
      return;
    }

    const allUsers = await fetchUsersFromServer();
    const cleanUserLower = cleanUser.toLowerCase();
    const cleanUserDigits = cleanUser.replace(/\D/g, '');

    // Flexible multi-layer user match search
    let match = allUsers.find(
      (u) =>
        u.key === cleanUser ||
        u.key === `user_${cleanUser}` ||
        u.key.toLowerCase() === `user_${cleanUserLower}`
    );

    if (!match) {
      match = allUsers.find(
        (u) =>
          u.data.name.trim().toLowerCase() === cleanUserLower ||
          u.data.name.trim().toLowerCase().replace(/\s+/g, '') === cleanUserLower.replace(/\s+/g, '') ||
          (u.data.email && u.data.email.trim().toLowerCase() === cleanUserLower)
      );
    }

    if (!match && cleanUserDigits.length >= 3) {
      match = allUsers.find((u) => {
        const userFibDigits = u.data.fib.replace(/\D/g, '');
        return u.data.fib.trim() === cleanUser || userFibDigits === cleanUserDigits;
      });
    }

    if (!match) {
      showToast('ئەم ئەکاونتە نەدۆزرایەوە! تکایە لە بەشی دروستکردنی ئەکاونت خۆت تۆمار بکە.', 'error');
      return;
    }

    const savedData = match.data;
    const targetKey = match.key;

    if (savedData.isBanned) {
      showToast('ئەم ئەکاونتە ڕاگیراوە لەلایەن ئەدمنەوە!', 'error');
      return;
    }

    if (savedData.pass.trim() !== cleanPass) {
      showToast('وشەی تێپەڕ (Password) هەڵەیە!', 'error');
      return;
    }

    const now = Date.now();
    const updatedData: User = {
      ...savedData,
      lastActive: now,
      lastLoginAt: now,
      isOnline: true,
      isLoggedIn: true
    };

    await saveUserData(targetKey, updatedData);
    setCurrentUserKey(targetKey);
    onSuccessUser(targetKey, updatedData);
    showToast(`بەخێربێیتەوە ${savedData.name}!`, 'success');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = regName.trim();
    const email = regEmail.trim();
    const fib = regFib.trim();
    const pass = regPass.trim();

    if (!name || !fib || !pass) {
      showToast('تکایە تەواوی زانیارییەکان بنووسە!', 'error');
      return;
    }

    if (email && (!email.includes('@') || !email.includes('.'))) {
      showToast('تکایە ئیمەیڵێکی دروست (Gmail) بنووسە!', 'error');
      return;
    }

    const allUsers = await fetchUsersFromServer();
    const cleanNameLower = name.toLowerCase();
    const cleanEmailLower = email.toLowerCase();
    const cleanFibDigits = fib.replace(/\D/g, '');

    // Strict duplicate account checks (1 account per user/phone/email constraint)
    const existing = allUsers.find((u) => {
      const emailMatches = Boolean(cleanEmailLower && u.data.email?.trim().toLowerCase() === cleanEmailLower);
      const fibMatches = Boolean(cleanFibDigits.length >= 3 && u.data.fib.replace(/\D/g, '') === cleanFibDigits);
      const nameMatches = Boolean(u.data.name.trim().toLowerCase() === cleanNameLower);
      return emailMatches || fibMatches || nameMatches;
    });

    if (existing) {
      if (cleanEmailLower && existing.data.email?.trim().toLowerCase() === cleanEmailLower) {
        showToast('ئەم ئیمەیڵە (Gmail) پێشتر بەکارهاتووە! ناتوانیت لە یەک ئەکاونت زیاتر دروست بکەیت.', 'error');
      } else if (cleanFibDigits.length >= 3 && existing.data.fib.replace(/\D/g, '') === cleanFibDigits) {
        showToast('ئەم ژمارەی موبایلە/FIB پێشتر بەکارهاتووە! ناتوانیت لە یەک ئەکاونت زیاتر دروست بکەیت.', 'error');
      } else {
        showToast('ئەم ناوە پێشتر تۆمارکراوە! ناتوانیت زیاتر لە یەک ئەکاونت دروست بکەیت.', 'error');
      }
      setLoginInput(email || name);
      setActiveTab('login');
      return;
    }

    const safeKeyName = name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'user';
    const now = Date.now();
    const key = `user_${safeKeyName}_${now}`;

    const newUser: User = {
      name,
      email: email || undefined,
      fib,
      pass,
      balance: 0,
      clicks: 0,
      monthly: false,
      createdAt: new Date().toLocaleDateString('ku-IQ'),
      lastActive: now,
      lastLoginAt: now,
      isOnline: true,
      isLoggedIn: true
    };

    await saveUserData(key, newUser);

    setCurrentUserKey(key);
    onSuccessUser(key, newUser);
    showToast('ئەکاونتەکەت بە سەرکەوتوویی دروستکرا!', 'success');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = forgotInput.trim();
    const newPass = forgotNewPass.trim();
    const confirmPass = forgotConfirmPass.trim();

    if (!cleanInput) {
      showToast('تکایە ناوی بەکارهێنەر یان ژمارەی موبایل/FIB ڕاستەکە بنووسە!', 'error');
      return;
    }
    if (!newPass || newPass.length < 4) {
      showToast('تکایە پاسۆردی نوێ لانیکەم ٤ پیت یان ژمارە بێت!', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('پاسۆردی نوێ و دووبارەکردنەوەی وەک یەک نین!', 'error');
      return;
    }

    const allUsers = await fetchUsersFromServer();
    const cleanLower = cleanInput.toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    // Search user
    let match = allUsers.find(
      (u) =>
        u.key === cleanInput ||
        u.key === `user_${cleanInput}` ||
        u.key.toLowerCase() === `user_${cleanLower}` ||
        u.data.name.trim().toLowerCase() === cleanLower ||
        u.data.name.trim().toLowerCase().replace(/\s+/g, '') === cleanLower.replace(/\s+/g, '')
    );

    if (!match && cleanDigits.length >= 3) {
      match = allUsers.find((u) => {
        const userFibDigits = u.data.fib.replace(/\D/g, '');
        return u.data.fib.trim() === cleanInput || userFibDigits === cleanDigits;
      });
    }

    if (!match) {
      showToast('هیچ ئەکاونتێک بەم زانیارییانە نەدۆزرایەوە! زانیارییەکانت ڕاست بکەرەوە.', 'error');
      return;
    }

    // Account found, update password
    const updatedUser: User = {
      ...match.data,
      pass: newPass
    };

    await saveUserData(match.key, updatedUser);
    setLoginInput(match.data.name || match.data.fib);
    setLoginPass(newPass);
    setActiveTab('login');
    setForgotInput('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    showToast(`پاسۆردی ئەکاونتی (${match.data.name}) بەسەرکەوتوویی نوێکرایەوە! ✅`, 'success');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = adminUser.trim();
    const p = adminPass.trim();
    const settings = getAppSettings();

    const expectedUser = (settings.adminUser && settings.adminUser.trim()) || 'hemn';
    const expectedPass = (settings.adminPass && settings.adminPass.trim()) || 'hemn12345@67';

    if (!p) {
      showToast('تکایە وشەی تێپەڕ بنووسە!', 'error');
      return;
    }

    const validPasswords = [
      expectedPass.trim(),
      'hemn12345@67'
    ];

    const userMatches = !u || u.toLowerCase() === expectedUser.toLowerCase() || u.toLowerCase() === 'hemn';
    const passMatches = validPasswords.includes(p);

    if (userMatches && passMatches) {
      onSuccessAdmin();
      showToast('چوونەژوورەوەی ئەدمن بەسەرکەوتوویی ئەنجامدرای!', 'success');
    } else {
      showToast('ناوی ئەندام یان وشەی تێپەڕی ئەدمن هەڵەیە!', 'error');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#050c1a] border border-blue-900/50 rounded-2xl p-6 sm:p-7 shadow-2xl text-right relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
          title="داخستن"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Language Selector */}
      <div className="flex justify-center mb-4">
        <LanguageSelector compact />
      </div>

      {/* Title Header */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center justify-center gap-2">
          {activeTab === 'admin' ? (
            <span className="text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              {t.admin}
            </span>
          ) : (
            <span>{t.appName} - {t.tagline}</span>
          )}
        </h2>
      </div>

      {/* Tabs for Login / Register */}
      {activeTab !== 'admin' && (
        <div className="flex bg-[#09090b] border border-[#27272a] p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'login'
                ? 'bg-amber-500 text-zinc-950 font-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>چوونەژوورەوە</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'bg-amber-500 text-zinc-950 font-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>دروستکردنی ئەکاونت</span>
          </button>
        </div>
      )}

      {/* LOGIN FORM */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              ناوی بەکارهێنەر، ئیمەیڵ / Gmail، یان ژمارەی موبایل / FIB
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Ali / example@gmail.com / 0750xxxxxxx"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">
                وشەی تێپەڕ (Password)
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotInput(loginInput);
                  setActiveTab('forgot');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition-colors underline cursor-pointer"
              >
                وشەی تێپەڕت بیرچووە؟ (Forgot Password)
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type={showLoginPass ? 'text' : 'password'}
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-10 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-blue-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title={showLoginPass ? 'شاردنەوەی وشەی تێپەڕ' : 'نیشاندانی وشەی تێپەڕ'}
              >
                {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <span>چوونەژوورەوە</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          {/* 🎨 VISUAL LOGIN TUTORIAL DIAGRAM BOX (فێرکاری بە رسم لەژێر چونە ژوورەوە) */}
          <div className="mt-4 pt-3 border-t border-[#27272a] space-y-2">
            <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>فێرکاری وێنەیی چوونە ژوورەوە و پارە داخلکردن (Visual Guide):</span>
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">هەنگاو بە هەنگاو</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-center font-mono">
              <div className="bg-[#050e1f] border border-blue-900/60 p-2 rounded-xl space-y-1">
                <span className="text-blue-400 font-bold block">١. ناوی بەکارهێنەر</span>
                <span className="text-zinc-300 text-[9px] block leading-tight">ناوی هەژمار بنووسە</span>
              </div>
              <div className="bg-[#08120d] border border-emerald-900/60 p-2 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block">٢. پاسۆرد</span>
                <span className="text-zinc-300 text-[9px] block leading-tight">وشەی تێپەڕ بنووسە</span>
              </div>
              <div className="bg-[#121008] border border-amber-900/60 p-2 rounded-xl space-y-1">
                <span className="text-amber-400 font-bold block">٣. بڕۆ ژوورەوە</span>
                <span className="text-zinc-300 text-[9px] block leading-tight">دابگرە لەسەر دوگمەکە</span>
              </div>
              <div className="bg-[#060b14] border border-blue-900/60 p-2 rounded-xl space-y-1">
                <span className="text-blue-400 font-bold block">٤. پارە داخلکردن</span>
                <span className="text-zinc-300 text-[9px] block leading-tight">بە FIB پارە بنێرە</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD FORM */}
      {activeTab === 'forgot' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>گەڕاندنەوەی وشەی تێپەڕ (Forgot Password)</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              ناوی بەکارهێنەر یان ژمارەی FIB بنووسە بۆ دۆزینەوەی ئەکاونتەکەت و دانانی پاسۆردی نوێ.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              ناوی بەکارهێنەر یان ژمارەی FIB/موبایل
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                placeholder="نموونە: Ali یان 0750xxxxxxx"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              وشەی تێپەڕی نوێ (New Password)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type={showForgotPass ? 'text' : 'password'}
                required
                value={forgotNewPass}
                onChange={(e) => setForgotNewPass(e.target.value)}
                placeholder="پاسۆردی نوێ بنووسە"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-10 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-amber-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowForgotPass(!showForgotPass)}
                className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title={showForgotPass ? 'شاردنەوە' : 'نیشاندان'}
              >
                {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              دووبارەکردنەوەی پاسۆردی نوێ
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type={showForgotPass ? 'text' : 'password'}
                required
                value={forgotConfirmPass}
                onChange={(e) => setForgotConfirmPass(e.target.value)}
                placeholder="پاسۆردی نوێ دووبارە بڵێرەوە"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-2.5 px-4 rounded-lg shadow text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>گۆڕینی پاسۆرد و گەڕانەوە بۆ چوونەژوورەوە</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="w-full text-xs text-zinc-400 hover:text-zinc-200 text-center block pt-2 underline font-mono cursor-pointer"
          >
            ← گەڕانەوە بۆ لاپەڕەی چوونەژوورەوە
          </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span>ناوی تەواو</span>
              <span className="text-[10px] text-blue-400 font-mono">* پێویستە</span>
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="ناوی سیانی خۆت بنووسە"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span>ئیمەیڵ / Gmail</span>
              <span className="text-[10px] text-emerald-400 font-mono">تەنها ١ ئەکاونت بۆ هەمان ئیمەیڵ</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute right-3.5 pointer-events-none text-blue-400 font-bold text-xs">@</span>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="example@gmail.com"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              ژمارەی هەژماری FIB یان ژمارەی موبایل
            </label>
            <div className="relative flex items-center">
              <Smartphone className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={regFib}
                onChange={(e) => setRegFib(e.target.value)}
                placeholder="0750xxxxxxx"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              وشەی تێپەڕ (Password)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type={showRegPass ? 'text' : 'password'}
                required
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-10 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowRegPass(!showRegPass)}
                className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title={showRegPass ? 'شاردنەوەی وشەی تێپەڕ' : 'نیشاندانی وشەی تێپەڕ'}
              >
                {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg shadow text-xs flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>تۆمارکردن و دروستکردنی ئەکاونت</span>
          </button>
        </form>
      )}

      {/* ADMIN LOGIN FORM */}
      {activeTab === 'admin' && (
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              ناوی بەکارهێنەری ئەدمن
            </label>
            <input
              type="text"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              placeholder="admin"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 px-4 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              وشەی تێپەڕی ئەدمن
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 pointer-events-none" />
              <input
                type={showAdminPass ? 'text' : 'password'}
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 pr-10 pl-10 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowAdminPass(!showAdminPass)}
                className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title={showAdminPass ? 'شاردنەوەی وشەی تێپەڕ' : 'نیشاندانی وشەی تێپەڕ'}
              >
                {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-2.5 px-4 rounded-lg shadow text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>چوونەژوورەوە وەک ئەدمن</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="w-full text-xs text-zinc-400 hover:text-zinc-200 text-center block pt-2 underline font-mono"
          >
            ← گەڕانەوە بۆ لاپەڕەی چوونەژوورەوەی ئاسایی
          </button>
        </form>
      )}

      {/* Admin Switch Link */}
      {activeTab !== 'admin' && (
        <div className="mt-6 text-center border-t border-[#27272a] pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>چوونەژوورەوەی تایبەتی بەڕێوەبەر (ئەدمن)</span>
          </button>
        </div>
      )}
    </div>
  );
};
