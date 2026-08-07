import React, { useState, useEffect, useRef } from 'react';
import botAvatarImg from '../assets/images/bot_avatar_1785317028015.jpg';
import {
  X,
  Send,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Gamepad2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Award,
  Lock,
  MessageSquare
} from 'lucide-react';
import { User, AppSettings } from '../types';
import { OKXDepositModal } from './OKXDepositModal';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actions?: { label: string; actionKey: string; icon?: React.ReactNode }[];
  isDiagnostics?: boolean;
}

interface SupportBotProps {
  user: User | null;
  settings: AppSettings;
  onOpenBuyModal?: () => void;
  onNavigateView?: (view: 'home' | 'history' | 'admin') => void;
  onRequestAuth?: (tab?: 'login' | 'register') => void;
}

export const SupportBot: React.FC<SupportBotProps> = ({
  user,
  settings,
  onOpenBuyModal,
  onNavigateView,
  onRequestAuth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadBadge, setUnreadBadge] = useState(true);
  const [isOKXModalOpen, setIsOKXModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting message
  const getInitialBotGreeting = (): Message => {
    const userName = user?.name ? user.name : 'هاوڕێی بەڕێز';
    return {
      id: 'init-1',
      sender: 'bot',
      text: `سڵاو ${userName} 👋! من **بۆتی یارمەتیدەری فەرمی mrpocket** م.\n\nچۆن دەتوانم یارمەتیت بدەم؟ دەتوانیت لە ڕێگەی کلیککردن لەسەر دوگمەکانی خوارەوە، وەڵامی فەرمی بابەتە گرنگەکان دەستبەجێ وەربگریت:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '🪙 چۆن بە کریپتۆ و OKX پارە بنێرم؟', actionKey: 'crypto_okx_deposit' },
        { label: '🔑 چۆن ئەکاونت دروست بکەم؟', actionKey: 'account_creation_help' },
        { label: '💳 چۆن بە (FIB / FastPay) ڕەسید بکڕم؟', actionKey: 'deposit_help' },
        { label: '📥 ڕێنمایی بەکارهێنانی IQcode', actionKey: 'iqcode_deposit_help' },
        { label: '🛡️ چۆن ئەکاونتم باند نەبێت؟ (یاساکان)', actionKey: 'antiban_rules' },
        { label: '🔍 پشکنینی پاراستنی ئەکاونتم (Anti-Ban Check)', actionKey: 'run_diagnostics' }
      ]
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialBotGreeting()]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadBadge(false);
    }
  };

  // Automated System Safety Diagnostics for User
  const runAccountDiagnostics = (): Message => {
    if (!user) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `⚠️ **سیستەمی پشکنین:** تۆ لە ئێستادا وەک میوان (Visitor) پەیوەست بوویت.\n\nتکایە سەرەتا **تۆماربکە یان بچۆ ژوورەوە** تاوەکو پشکنینی پاراستنی ئەکاونتەکەت ئەنجام بدەین.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '🔑 چوونەژوورەوە / تۆماربوون', actionKey: 'open_auth' }
        ]
      };
    }

    // Calculate Safety Score
    let score = 50;
    const checks: { title: string; status: 'ok' | 'warn' | 'fail'; detail: string }[] = [];

    // Check 1: Ban Status
    if (user.isBanned) {
      checks.push({
        title: 'دۆخی ئەکاونت',
        status: 'fail',
        detail: 'ئەکاونتەکەت سزادراوە / باندکراوە!'
      });
      score = 0;
    } else {
      checks.push({
        title: 'دۆخی ئەکاونت',
        status: 'ok',
        detail: 'ئەکاونتەکەت چالاکە و هیچ سزایەکی لەسەر نییە.'
      });
      score += 20;
    }

    // Check 2: Verification Status
    if (user.verificationStatus === 'verified') {
      checks.push({
        title: 'ڤێریفیکەیشنی ناسنامە',
        status: 'ok',
        detail: 'ناسنامە و تەلەفۆنەکەت بە سەرکەوتوویی پشتڕاستکراوەتەوە (100% پارێزراوە).'
      });
      score += 20;
    } else if (user.verificationStatus === 'pending') {
      checks.push({
        title: 'ڤێریفیکەیشنی ناسنامە',
        status: 'warn',
        detail: 'داواکاری ڤێریفیکەیشنەکەت لەژێر چاوێری ئەدمیندایە.'
      });
      score += 10;
    } else {
      checks.push({
        title: 'ڤێریفیکەیشنی ناسنامە',
        status: 'warn',
        detail: 'ئەکاونتەکەت تائێستا پشتڕاست نەکراوەتەوە. پێشنیار دەکەین لە داپۆڕد لە بەشی Profile پشتڕاستی بکەیتەوە.'
      });
    }

    // Check 3: FIB / Payment Account binding
    if (user.fib && user.fib.length > 3) {
      checks.push({
        title: 'بەستنەوەی FIB/حساب',
        status: 'ok',
        detail: `ژمارەی حسابەکەت: ${user.fib} (بۆ ڕاکێشان ئامادەیە).`
      });
      score += 10;
    } else {
      checks.push({
        title: 'بەستنەوەی FIB/حساب',
        status: 'warn',
        detail: 'ژمارەی FIB نەنوسراوە. لە بەشی پرۆفایل ژمارەی حساب بنووسە.'
      });
    }

    const is100Safe = score >= 90;

    let responseText = `🛡️ **ئەنجامی پشکنینی ئۆتۆماتیکی پاراستنی ئەکاونت (Anti-Ban Safety Diagnostics):**\n\n`;
    responseText += `📊 **نمرەی پاراستنی ئەکاونت:** ${score}% ${is100Safe ? '🟢 (زۆر بەرز & پارێزراو)' : '🟡 (پێویستی بە ڕێکخستنە)'}\n\n`;

    checks.forEach((c) => {
      const icon = c.status === 'ok' ? '✅' : c.status === 'warn' ? '⚠️' : '❌';
      responseText += `${icon} **${c.title}:** ${c.detail}\n`;
    });

    responseText += `\n💡 **ئامۆژگاری بۆ ڕێگری لە باندبوون:**\n- هەمیشە تەنها ۱ ئەکاونت بەکاربهێنە.\n- لەکاتی داواکاری پارە، وەسل بە ناوی خۆت ڕەوانە بکە.\n- لە بەرنامەی ئۆتۆ-کلیک یان بوت دووربکەوەرەوە.`;

    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDiagnostics: true,
      actions: [
        { label: '💳 چۆن پارە داخل بکەم؟', actionKey: 'deposit_help' },
        { label: '📜 بینینی هەموو یاساکان', actionKey: 'antiban_rules' }
      ]
    };
  };

  // Action / Bot Answer Handler
  const handleBotResponse = (actionKey: string, customQuery?: string) => {
    let replyText = '';
    let replyActions: { label: string; actionKey: string }[] | undefined = undefined;

    const queryLower = (customQuery || actionKey).toLowerCase();

    // NEW ACTIONS: CRYPTO DEPOSIT & OKX GUIDE
    if (
      actionKey === 'crypto_okx_deposit' ||
      queryLower.includes('crypto') ||
      queryLower.includes('okx') ||
      queryLower.includes('کریپتۆ') ||
      queryLower.includes('0xeb25') ||
      queryLower.includes('ethereum') ||
      queryLower.includes('eth') ||
      queryLower.includes('ئەدرێس') ||
      queryLower.includes('جزدان')
    ) {
      replyText = `🪙 **ڕێنمایی گواستنەوەی کریپتۆ لەڕێگەی ئەپی OKX:**\n\n` +
        `بۆ دەپۆزیتکردن و بارکردنی حسابەکەت بە کریپتۆ، ئەم مەرج و هەنگاوانە جێبەجێ بکە:\n\n` +
        `1️⃣ ئەپی **OKX** بکەرەوە و لە خوارەوە بچۆ بەشی **Assets** و پاشان کلیک لەسەر **Withdraw** بکە.\n` +
        `2️⃣ بژاردەی **Withdraw crypto** هەڵبژێرە.\n` +
        `3️⃣ لە نێوان دراوەکاندا دراوی **ETH (Ethereum)** دیاری بکە.\n` +
        `4️⃣ شێوازی گواستنەوەکە بە **On-chain** هەڵبژێرە.\n` +
        `5️⃣ لە بەشی Network، تۆڕی **Ethereum (ERC20)** بە ڕاستی هەڵبژێرە (تۆڕی هەڵە مەبژێرە تا پارەکەت نەفەوتێت).\n` +
        `6️⃣ ناونیشانی فەرمی جزدانی ئێمە کۆپی بکە و لێی بدە:\n` +
        `   📍 **ETH Address:** \`0xeb25b42a2116799a749f636cb7f40eb23075dd43\`\n\n` +
        `📸 بۆ دڵنیایی زیاتر و بینینی سکرین شۆتی هەموو هەنگاوەکان، کلیک لەسەر دوگمەی خوارەوە بکە بۆ کردنەوەی ڕێنمایی فۆتۆکان:`;

      replyActions = [
        { label: '📸 بینینی ڕێنمایی وێنەیی OKX', actionKey: 'open_okx_visual' },
        { label: '🔑 دروستکردنی ئەکاونت', actionKey: 'account_creation_help' },
        { label: '📥 ڕێنمایی IQcode', actionKey: 'iqcode_deposit_help' },
        { label: '💳 داخلکردن بە FIB / FastPay', actionKey: 'deposit_help' }
      ];
    }
    else if (
      actionKey === 'account_creation_help' ||
      queryLower.includes('account') ||
      queryLower.includes('دروست') ||
      queryLower.includes('ئەکاونت') ||
      queryLower.includes('حساب') ||
      queryLower.includes('تۆمار')
    ) {
      replyText = `🔑 **ڕێنمایی تەواوی دروستکردنی ئەکاونت (Sign Up Guide):**\n\n` +
        `دروستکردنی ئەکاونتی نوێ لە پلاتفۆرمی mrpocket زۆر ئاسانە:\n` +
        `1️⃣ بچۆ بۆ پەڕەی سەرەکی و کلیک لەسەر دوگمەی **دروستکردنی ئەکاونتی نوێ (Sign Up)** بکە.\n` +
        `2️⃣ **ناوی بەکارهێنەر (Username)** دڵخواز بە ئینگلیزی بنووسە (بۆ نموونە: \`Saman_Kurd\`).\n` +
        `3️⃣ **ژمارەی مۆبایل** یان ژمارەی FIB ی خۆت داخل بکە تاوەکو حسابەکەت بە فەرمی ببەسرێتەوە.\n` +
        `4️⃣ **وشەی نهێنی (Password)** پارێزراو دابنێ و لای خۆت بینووسە بۆ بیرنەچوونەوە.\n` +
        `5️⃣ پاشان کلیک لەسەر دوگمەی دروستکردن بکە و دەستبەجێ دەتوانیت دەست بە کڕینی پاکێج یان یاری بکەیت!\n\n` +
        `⛔ **گرنگ:** بە هیچ شێوەیەک زیاتر لە یەک ئەکاونت لەسەر یەک تەلەفۆن دروست مەکە بۆ ئەوەی ڕێگری لە باندبوونی حسابەکەت بکەیت.`;

      replyActions = [
        { label: '🔑 دروستکردنی حساب', actionKey: 'open_auth_register' },
        { label: '🪙 چۆن بە کریپتۆ پارە بنێرم؟', actionKey: 'crypto_okx_deposit' }
      ];
    }
    else if (
      actionKey === 'iqcode_deposit_help' ||
      queryLower.includes('iqcode') ||
      queryLower.includes('کۆد') ||
      queryLower.includes('qr')
    ) {
      replyText = `📥 **ڕێنمایی بەکارهێنانی کۆدی IQcode بۆ پارە داخلکردن:**\n\n` +
        `شێوازی IQcode (سکانکردنی کۆدی QR فەرمی) یەکێکە لە سەلامەتترین ڕێگاکان:\n` +
        `1️⃣ لە پەڕەی وەرگرتنی کریپتۆ، دەتوانیت **کۆدی IQcode (QR)** کە لە کۆتا فۆتۆی ڕێنماییەکەدا هەیە سکان بکەیت.\n` +
        `2️⃣ ئەم کۆدە ڕاستەوخۆ ئەدرێسی وەرگرتنی فەرمی ئێمە (\`0xeb25b42a2116799a749f636cb7f40eb23075dd43\`) چالاک دەکات بەبێ ئەوەی پێویست بکات بە دەست ئەدرێسەکە کۆپی و لێبدەیت، کە ئەمەش ڕێگری دەکات لە هەر جۆرە هەڵەیەکی پیتەکان لە کاتی گواستنەوەدا.\n` +
        `3️⃣ دوای ئەوەی کۆدەکەت سکان کرد یان ئەدرێسەکەت دا، بڕی دڵخواز ڕەوانە بکە و ژمارەی مۆبایلی خۆت بنووسە تا باڵانسەکەت بەرز بکرێتەوە.`;

      replyActions = [
        { label: '📸 بینینی ڕێنمایی وێنەیی OKX', actionKey: 'open_okx_visual' },
        { label: '🪙 چۆن بە کریپتۆ پارە بنێرم؟', actionKey: 'crypto_okx_deposit' }
      ];
    }
    else if (actionKey === 'open_okx_visual') {
      setIsOKXModalOpen(true);
      replyText = `📸 **ڕێنمایی وێنەیی و کارۆسێلی OKX کرایەوە!**\n\nتکایە سەیری مۆبایلە نمایشکراوە کارلێککارەکەی ناو پەڕەکە بکە تاوەکو هەموو هەنگاوەکانت وەک سکرین شۆتە ڕاستەقینەکانی OKX بۆ ڕوون بێتەوە. دەتوانیت بۆ هەر هەنگاوێک بگەڕێیتەوە یان بچیتە پێشەوە.`;
      replyActions = [
        { label: '🪙 ڕێنمایی ناردنی کریپتۆ', actionKey: 'crypto_okx_deposit' },
        { label: '🛡️ ڕێگری لە باندبوون', actionKey: 'antiban_rules' }
      ];
    }
    else if (actionKey === 'open_auth_register') {
      if (onRequestAuth) onRequestAuth('register');
      replyText = `🔑 **پەنجەرەی دروستکردنی ئەکاونت (Sign Up) کرایەوە.**`;
    }
    // 1. DEPOSIT / CHARGING HELP
    else if (
      actionKey === 'deposit_help' ||
      queryLower.includes('داخل') ||
      queryLower.includes('دەپۆزیت') ||
      queryLower.includes('fib') ||
      queryLower.includes('fastpay') ||
      queryLower.includes('پارە') ||
      queryLower.includes('کڕین')
    ) {
      replyText = `💳 **ڕێنمایی تەواوی داخلکردن و کڕینی ڕەسید:**\n\n` +
        `1️⃣ **کلیک لەسەر دوگمەی (کڕین / شارژکردن)** بکه لە داشبۆرد یان لە دوگمەی خوارەوە.\n` +
        `2️⃣ **پاکێجی دڵخوازت هەڵبژێرە** (پاکێجە ڕۆژانە یان مانگانەکان).\n` +
        `3️⃣ **پارەکە ڕەوانەی ژمارەی FIB بکە:**\n` +
        `   📍 **ژمارەی FIB ی فەرمی سیستەم:** \`${settings.fibNumber || '0750 000 0000'}\`\n` +
        `4️⃣ لە داواکارییەکەدا **ژمارەی تەلەفۆن و ژمارەی وەسل (Receipt Ref)** بنووسە.\n` +
        `5️⃣ تیمی پشتگیری لە نێوان ٥ بۆ ۱۵ خولەکدا داواکارییەکەت دەپەسەندکات و هاوسەنگیت بەرز دەبێتەوە.\n\n` +
        `⚠️ **گرنگ:** هەمیشە وێنە یان ژمارەی وەسلەکەت لای خۆت هەڵبگرە.`;

      replyActions = [
        { label: '📲 کردنەوەی بەشی کڕین و داخلکردن', actionKey: 'open_buy_modal' },
        { label: '🛡️ چۆن ئەکاونتم باند نەبێت؟', actionKey: 'antiban_rules' }
      ];
    }
    // 2. GAMES HELP
    else if (
      actionKey === 'games_help' ||
      queryLower.includes('چۆن یاری') ||
      queryLower.includes('yari') ||
      queryLower.includes('یاریی')
    ) {
      replyText = `🎮 **ڕێنمایی یارییە ڕاستەوخۆکان لە MONEY ONLINE:**\n\n` +
        `📈 **۱. ترەیدینگی زێڕ (TradingView Live XAU/USD):**\n` +
        `  - چارتی ڕاستەوخۆی جیهانی زێڕ دەبینیت.\n` +
        `  - پێشبینی بەرزبوونەوە (BUY) یان دابەزین (SELL) دەکەیت.\n` +
        `  - ترەیدەکە بۆ ماوەی ۱۰ چرکە کاردەکات.\n\n` +
        `🎲 **۲. یاری دۆمینۆ (Dominoes Live):**\n` +
        `  - یاری دۆمینۆ لەگەڵ سیستەمی بەرامبەر دەکەیت.\n` +
        `  - یەکەم کەس بەردەکانی تەواو بێت قازانج دەکات.\n\n` +
        `🃏 **۳. یاری کۆنکان (Konkan Card Game):**\n` +
        `  - کاتێک کۆمەڵە (Set/Run) دروست دەکەیت، دەتوانیت سەرکەوتن بەدەستبهێنیت.`;

      replyActions = [
        { label: '🚀 چوون بۆ بەشی یارییەکان', actionKey: 'open_games_hub' },
        { label: '📜 یاساکانی یارییەکان', actionKey: 'game_rules' }
      ];
    }
    // 3. ANTI-BAN RULES & SAFETY
    else if (
      actionKey === 'antiban_rules' ||
      queryLower.includes('باند') ||
      queryLower.includes('حظر') ||
      queryLower.includes('کۆنتڕۆڵ') ||
      queryLower.includes('پاراستن') ||
      queryLower.includes('مەنع') ||
      queryLower.includes('سزا')
    ) {
      replyText = `🛡️ **یاساکانی پاراستنی ئەکاونت (ڕێگری لە باندبوون):**\n\n` +
        `⛔ **۱. قەدەغەبوونی زۆربوونی ئەکاونت (Single Account Rule):**\n` +
        `   هەر بەکارهێنەرێک تەنها مافی هەبوونی ۱ ئەکاونتی هەیە. دروستکردنی چەند ئەکاونتێک لەسەر یەک مۆبایل دەبێتە هۆی باندبوونی ئۆتۆماتیکی هەموویان.\n\n` +
        `🤖 **۲. قەدەغەبوونی بوت و ئۆتۆ-کلیکەر:**\n` +
        `   بەکارهێنانی بەرنامەی ئۆتۆماتیک یان سکریپت بە ڕەقێتی دەستبەسەر دەکرێت.\n\n` +
        `🧾 **۳. دروستێتی وەسل و زانیاری:**\n` +
        `   ناردنی وەسل یان تێپەڕاندنی فێڵاوی ڕاستەوخۆ ئەکاونتەکە دەخاتە لیستی ڕەش (Blacklist).\n\n` +
        `📱 **۴. ڤێریفیکەیشنی فەرمی:**\n` +
        `   بۆ ئەوەی لەکاتی ڕاکێشانی پارە تووشی هیچ ئاستەنگێک نەبیتەوە، لە بەشی Profile ناسنامە و تەلەفۆنت پشتڕاست بکەرەوە.`;

      replyActions = [
        { label: '🔍 پشکنینی ئۆتۆماتیکی ئەکاونتم', actionKey: 'run_diagnostics' },
        { label: '💳 چۆن پارە داخل بکەم؟', actionKey: 'deposit_help' }
      ];
    }
    // 4. GAME RULES & POLICIES
    else if (
      actionKey === 'game_rules' ||
      queryLower.includes('یاسا') ||
      queryLower.includes('مەرج') ||
      queryLower.includes('ڕێسا')
    ) {
      replyText = `📜 **یاساکانی فەرمی یاری و ترەیدینگ:**\n\n` +
        `1️⃣ **دادپەروەری یاری (Fair Play):** سەرجەم ئەنجامەکانی ترەیدینگ و دۆمینۆ و کۆنکان لەسەر چارتی ڕاستەوخۆ و ئەلگۆریتمی سەربەخۆ کاردەکەن.\n` +
        `2️⃣ **سنووری بەشداربوون:** دەتوانیت بە بڕی دیاریکراوی هاوسەنگییەکەت یاری بکەیت.\n` +
        `3️⃣ **پەیوەندی ئینتەرنێت:** لەکاتی بەستنی ترەیدینگ یان یاری، دڵنیابەرەوە ئینتەرنێتەکەت جێگیرە.\n` +
        `4️⃣ **ڕاکێشانی پارە:** دەتوانیت لە هەر کاتێکدا داواکاری ڕاکێشانی قازانجەکەت بۆ FIB یان FastPay بنێریت.`;

      replyActions = [
        { label: '🎮 چوون بۆ یارییەکان', actionKey: 'open_games_hub' },
        { label: '🔍 پشکنینی پاراستنی ئەکاونت', actionKey: 'run_diagnostics' }
      ];
    }
    // 5. DIAGNOSTICS
    else if (actionKey === 'run_diagnostics' || queryLower.includes('پشکنین')) {
      const diagMsg = runAccountDiagnostics();
      setMessages((prev) => [...prev, diagMsg]);
      return;
    }
    // DIRECT COMPONENT MODAL TRIGGERS
    else if (actionKey === 'open_buy_modal') {
      if (onOpenBuyModal) onOpenBuyModal();
      replyText = `📲 **بەشی کڕین و داخلکردن کرایەوە.** تکایە پاکێجەکەت هەڵبژێرە و ڕێنماییەکان جێبەجێ بکە.`;
    } else if (actionKey === 'open_games_hub') {
      if (onNavigateView) onNavigateView('home');
      replyText = `🚀 **ڕوانرایت بۆ بەشی یارییەکان.** دەتوانیت یاری دڵخوازت هەڵبژێریت!`;
    } else if (actionKey === 'open_auth') {
      if (onRequestAuth) onRequestAuth('login');
      replyText = `🔑 **پەنجەرەی چوونەژوورەوە کرایەوە.**`;
    }
    // FALLBACK CUSTOM QUESTION ANSWERING ENGINE
    else {
      replyText = `🤖 **وەڵامی یارمەتیدەر:**\n\n` +
        `سەبارەت بە پرسیارەکەت ("${customQuery}"):\n` +
        `بۆ پاراستنی ئەکاونتەکەت و ئاسانکاری یاری، تکایە ڕێنماییە سەرەکییەکان ڕەچاو بکە:\n\n` +
        `1️⃣ **داخلکردنی پارە:** لەڕێگەی FIB ڕەوانەی ژمارەی \`${settings.fibNumber || '0750 000 0000'}\` بکە.\n` +
        `2️⃣ **باندنەبوون:** تەنها ۱ ئەکاونت بەکاربهێنە و بە هیچ شێوەیەک بەرنامەی ئۆتۆ-کلیکەر مەکەرەوە.\n` +
        `3️⃣ **دەستپێکردنی یاری:** بچۆ بۆ داشبۆرد و یەکێک لە یارییەکانی (ترەیدینگی زێڕ، دۆمینۆ، کۆنکان) بپەڕێنەرەوە.\n\n` +
        `دەتوانیت دوگمەکانی خوارەوە هەڵبژێریت بۆ زانیاری وردتر:`;

      replyActions = [
        { label: '💳 ڕێنمایی داخلکردنی پارە', actionKey: 'deposit_help' },
        { label: '🛡️ ياكانی ڕێگری لە باندبوون', actionKey: 'antiban_rules' },
        { label: '🎮 چۆن یاریی بکەم؟', actionKey: 'games_help' },
        { label: '🔍 پشکنینی پاراستنی ئەکاونت', actionKey: 'run_diagnostics' }
      ];
    }

    const newBotMsg: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: replyActions
    };

    setMessages((prev) => [...prev, newBotMsg]);
  };

  // Submit User Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');

    // Simulate natural thinking delay
    setTimeout(() => {
      handleBotResponse('custom_user_query', userMsgText);
    }, 400);
  };

  return (
    <>
      {/* Floating Bot Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={toggleBot}
          className="relative group bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 p-1 rounded-full shadow-2xl shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-amber-300 cursor-pointer overflow-hidden"
          title="بۆتی یارمەتیدەر & پاراستنی ئەکاونت"
        >
          <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-300/80 shadow-inner">
            <img src={botAvatarImg} alt="Bot Avatar" className="w-full h-full object-cover" />
          </div>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-black px-2 font-mono">
            پشتیوانی & Anti-Ban Bot
          </span>

          {unreadBadge && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-[9px] font-black text-white items-center justify-center">
                1
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[420px] max-h-[82vh] h-[580px] bg-[#0c0c10] border-2 border-amber-500/40 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#18181f] via-[#221c10] to-[#18181f] p-3.5 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md">
                <img src={botAvatarImg} alt="Bot Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">بۆتی یارمەتیدەر & Anti-Ban Bot</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                    چالاکە
                  </span>
                </div>
                <p className="text-[10px] text-amber-400/90 font-mono">
                  ڕێنمایی داخلکردن • یاساکان • ڕێگری لە باندبوون
                </p>
              </div>
            </div>

            <button
              onClick={toggleBot}
              className="p-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#09090d] to-[#0d0d14] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse items-end' : 'items-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-amber-400/60 shrink-0 mt-0.5">
                    <img src={botAvatarImg} alt="Bot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div
                    className={`p-3 rounded-2xl shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-zinc-950 font-bold rounded-tr-none'
                        : 'bg-[#16161c] text-zinc-100 border border-zinc-800 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>

                    <span
                      className={`text-[9px] block text-left mt-1.5 font-mono ${
                        msg.sender === 'user' ? 'text-amber-950/70' : 'text-zinc-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Quick Action Buttons rendered beneath bot responses */}
                  {msg.sender === 'bot' && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleBotResponse(act.actionKey)}
                          className="px-3 py-1.5 rounded-xl bg-[#1d1d26] hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 text-right cursor-pointer"
                        >
                          {act.icon}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Diagnostics Quick Launcher Button */}
          <div className="px-3 py-1.5 bg-[#121217] border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <button
              onClick={() => handleBotResponse('run_diagnostics')}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>پشکنینی دۆخی پاراستنی ئەکاونتەکەت (Anti-Ban Check)</span>
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#15151c] border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="پرسیارەکەت بنووسە (دیپۆزیت، باند، یاسا...)"
              className="flex-1 bg-[#09090d] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <OKXDepositModal isOpen={isOKXModalOpen} onClose={() => setIsOKXModalOpen(false)} />
    </>
  );
};
