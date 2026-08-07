import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'sorani' | 'badini' | 'en';

export interface Translations {
  // Common
  appName: string;
  tagline: string;
  login: string;
  register: string;
  logout: string;
  admin: string;
  balance: string;
  games: string;
  requests: string;
  deposit: string;
  withdraw: string;
  tutorial: string;
  visualTutorialTitle: string;
  visualTutorialSub: string;
  success: string;
  error: string;
  cancel: string;
  submit: string;
  save: string;
  close: string;
  user: string;
  password: string;
  username: string;
  fibNumber: string;
  phone: string;
  createAccount: string;
  welcome: string;
  
  // Tutorial Steps
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Games & Hub
  spinWheel: string;
  headOrTail: string;
  diceRoll: string;
  dominoes: string;
  konkan: string;
  playAndWin: string;
  doubleBalance: string;
  
  // Deposit & Withdraw
  depositTitle: string;
  depositDesc: string;
  withdrawTitle: string;
  withdrawDesc: string;
  amount: string;
  sendReceipt: string;
  receiptNote: string;
  approved: string;
  pending: string;
  rejected: string;

  // Language Names
  soraniName: string;
  badiniName: string;
  englishName: string;
}

export const translations: Record<Language, Translations> = {
  sorani: {
    appName: 'mrpocket',
    tagline: 'گیرفانی زیرەک، ژیانی ئاسان',
    login: 'چوونە ژوورەوە',
    register: 'دروستکردنی ئەکاونت',
    logout: 'دەرچوون',
    admin: 'ئەدمن',
    balance: 'باڵانس',
    games: 'داشبۆرد و یارییەکان',
    requests: 'داواکارییەکان',
    deposit: 'پارە داخلکردن (FIB)',
    withdraw: 'ڕاکێشانی پارە',
    tutorial: 'فێرکاریی وێنەیی',
    visualTutorialTitle: 'فێرکاری ڕوون بە وێنە و ڕەسم',
    visualTutorialSub: 'چۆن تۆمار بوبیت، پارە داخل بکەیت و قازانج ببه‌یته‌وە؟',
    success: 'سەرکەوتوو بوو',
    error: 'هەڵەیەک ڕوویدا',
    cancel: 'پەشیمانبوونەوە',
    submit: 'ناردن',
    save: 'پاشەکەوتکردن',
    close: 'داخستن',
    user: 'بەکارهێنەر',
    password: 'وشەی تێپەڕ',
    username: 'ناوی بەکارهێنەر',
    fibNumber: 'ژمارەی هەژماری FIB',
    phone: 'ژمارەی مۆبایل',
    createAccount: 'تۆماربوونی نوێ',
    welcome: 'بەخێربێیت',

    step1Title: 'چوونە ژوورەوە / تۆماربوون',
    step1Desc: 'ناوی بەکارهێنەر و پاسۆرد بنووسە و دابگرە لەسەر چوونە ژوورەوە.',
    step2Title: 'پارە داخلکردن بە FIB',
    step2Desc: 'لە ئەپڵیکەیشنی FIB پارە بنێرە بۆ 07512189730 و زانیاری بنێرە.',
    step3Title: 'ئەنجامدانی یاری و دووقاتکردن',
    step3Desc: 'یاری بکە و باڵانسی سەرەکیی خۆت بەردەوام زیاد بکە.',
    step4Title: 'ڕاکێشانی پارە بۆ FIB',
    step4Desc: 'ژمارەی FIB خۆت بنووسە و داواکاری ڕاکێشانی قازانج بنێرە.',

    spinWheel: 'چەرخی شانس',
    headOrTail: 'شیر و خەت',
    diceRoll: 'یاری زار',
    dominoes: 'دۆمینۆ',
    konkan: 'کۆنکان',
    playAndWin: 'یاری بکە و بەدەستی بهێنە',
    doubleBalance: 'دووقاتکردنی باڵانس',

    depositTitle: 'پارە داخلکردن بۆ هەژمار',
    depositDesc: 'لە ڕێگەی FIB Bank یان ژمارەی حساب پارە زێدە بکە',
    withdrawTitle: 'داواکاری ڕاکێشانی پارە',
    withdrawDesc: 'قازانجەکانت بکێشەوە بۆ هەژماری FIB',
    amount: 'بڕی پارە (دۆلار - $)',
    sendReceipt: 'ناردنی زانیاری پسولە',
    receiptNote: 'تێبینی پسولە / کۆدی ناردن',
    approved: 'پەسەندکراو',
    pending: 'چاوەڕوانکراو',
    rejected: 'ڕەتکرایەوە',

    soraniName: 'کوردی (سۆرانی)',
    badiniName: 'کوردی (بادینی)',
    englishName: 'English'
  },

  badini: {
    appName: 'mrpocket',
    tagline: 'گیرفانێ زیرەک، ژیانەکا ب ساناهی',
    login: 'چوونا ژوورڤە',
    register: 'چێکرنا ئەکاونتی',
    logout: 'دەرکەوتن',
    admin: 'ئەدمن / ڕێڤەبەر',
    balance: 'باڵانس',
    games: 'داشبۆرد و یاری',
    requests: 'داخازی',
    deposit: 'ئینا ژوور یا پارەی (FIB)',
    withdraw: 'ڕاکێشانا پارەی',
    tutorial: 'فێرکارییا وێنەیی',
    visualTutorialTitle: 'فێرکارییا ڕوون بە وێنە و ڕەسم',
    visualTutorialSub: 'چەوا تۆمار ببی، پارەی بینیە ژوور و قازانج بکەی؟',
    success: 'سەرکەفتی بوو',
    error: 'خەلەتیەک چێبوو',
    cancel: 'پەشیمانبوون',
    submit: 'فرێکرن',
    save: 'پاراستن',
    close: 'گرتن',
    user: 'بەکارهێنەر',
    password: 'پاسۆرد / کلیل',
    username: 'ناڤێ بەکارهێنەری',
    fibNumber: 'ژمارا هەژمارا FIB',
    phone: 'ژمارا تەلەفۆنێ',
    createAccount: 'تۆماربوونا نوو',
    welcome: 'بخێر بێی',

    step1Title: 'چوونا ژوورڤە / تۆماربوون',
    step1Desc: 'ناڤێ بەکارهێنەری و پاسۆردی بنڤێسە و کلیک بکە سەر چوونا ژوورڤە.',
    step2Title: 'داغڵکرنا پارەی بە FIB',
    step2Desc: 'ژ ئەپا FIB پارەی فرێکە بۆ 07512189730 و زانیارییا فرێکە.',
    step3Title: 'ئەنجامدانا یارییا و دوو جار کرن',
    step3Desc: 'یارییا بکە و باڵانسێ خۆ یێ سەرەکی بەردەوام زێدە بکە.',
    step4Title: 'ڕاکێشانا پارەی بۆ FIB',
    step4Desc: 'ژمارا ژمارا خۆ یا FIB بنڤێسە و داخازیا ڕاکێشانا قازانجی فرێکە.',

    spinWheel: 'چەرخێ شانسێ',
    headOrTail: 'شێر و خەت',
    diceRoll: 'یارییا زاری',
    dominoes: 'دۆمینۆ',
    konkan: 'کۆنکان',
    playAndWin: 'یاری بکە و بدەستخۆڤە بینە',
    doubleBalance: 'دوو جار کرنا باڵانسی',

    depositTitle: 'ئینا ژوور یا پارەی بۆ هەژمارێ',
    depositDesc: 'ب ڕێکا کارت یان بانک یا FIB پارەی زێدە بکە',
    withdrawTitle: 'داخازیا ڕاکێشانا پارەی',
    withdrawDesc: 'قازانجێن خۆ ڕابکێشە بۆ کارتێ FIB',
    amount: 'بڕێ پارەی (دۆلار - $)',
    sendReceipt: 'فرێکرنا زانیاریێن وەسڵێ',
    receiptNote: 'تێبینییا وەسڵێ / کۆدێ ناردنێ',
    approved: 'هاتیە پەسەندکرن',
    pending: 'ل هیڤیێ',
    rejected: 'هاتیە ڕەتکرن',

    soraniName: 'کوردی (سۆرانی)',
    badiniName: 'کوردی (بادینی)',
    englishName: 'English'
  },

  en: {
    appName: 'mrpocket',
    tagline: 'Smart Pocket, Easy Life',
    login: 'Login',
    register: 'Create Account',
    logout: 'Logout',
    admin: 'Admin Panel',
    balance: 'Balance',
    games: 'Dashboard & Games',
    requests: 'Requests',
    deposit: 'Deposit Money (USD $)',
    withdraw: 'Withdraw Cash ($)',
    tutorial: 'Visual Tutorial',
    visualTutorialTitle: 'Illustrated Step-by-Step Guide',
    visualTutorialSub: 'How to register, deposit funds, play games & withdraw earnings',
    success: 'Success',
    error: 'An error occurred',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    close: 'Close',
    user: 'User',
    password: 'Password',
    username: 'Username',
    fibNumber: 'FIB Account Number',
    phone: 'Phone Number',
    createAccount: 'New Registration',
    welcome: 'Welcome',

    step1Title: 'Login / Register',
    step1Desc: 'Enter your username and password, then click Login.',
    step2Title: 'Deposit Funds via FIB',
    step2Desc: 'Transfer money via FIB app to 07512189730 & submit receipt.',
    step3Title: 'Play Games & Double Earnings',
    step3Desc: 'Play interactive games to continuously multiply your main balance.',
    step4Title: 'Withdraw to FIB Account',
    step4Desc: 'Enter your FIB number to submit your withdrawal request for review.',

    spinWheel: 'Spin Wheel',
    headOrTail: 'Coin Flip',
    diceRoll: 'Dice Game',
    dominoes: 'Dominoes',
    konkan: 'Konkan Card Game',
    playAndWin: 'Play & Win Real Earnings',
    doubleBalance: 'Double Your Balance',

    depositTitle: 'Deposit Money to Account',
    depositDesc: 'Add funds easily using FIB Bank account number',
    withdrawTitle: 'Withdrawal Request',
    withdrawDesc: 'Submit withdrawal request for your profits to FIB',
    amount: 'Amount (USD $)',
    sendReceipt: 'Submit Receipt Info',
    receiptNote: 'Receipt Note / Transfer Ref',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',

    soraniName: 'کوردی (سۆرانی)',
    badiniName: 'کوردی (بادینی)',
    englishName: 'English'
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'sorani',
  setLang: () => {},
  t: translations.sorani
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language;
    return saved === 'sorani' || saved === 'badini' || saved === 'en' ? saved : 'sorani';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
  };

  useEffect(() => {
    // Set document direction: RTL for Sorani and Badini, LTR for English
    if (lang === 'en') {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    } else {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ckb';
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
