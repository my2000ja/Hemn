export interface User {
  name: string;
  fib: string;
  pass: string;
  email?: string;
  balance: number;
  clicks: number;
  monthly: boolean;
  vipPlanType?: 'min30' | 'hourly' | 'monthly' | 'yearly';
  vipDailyClicks?: number;
  vipInitialClicks?: number;
  vipNextResetTime?: number | null;
  vipExpiryDate?: number | null;
  createdAt?: string;
  isBanned?: boolean;
  lastActive?: number;
  lastLoginAt?: number;
  isOnline?: boolean;
  isLoggedIn?: boolean;
  lastFreeGiftClaimedAt?: number;
  weeklyWithdrawalCount?: number;
  weeklyWithdrawalResetTime?: number;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  verificationPhone?: string;
  verificationIdNumber?: string;
  verificationNote?: string;
  rewardPerClick?: number;
}

export interface PendingRequest {
  id: number;
  userKey: string;
  userName: string;
  title: string;
  userFib: string;
  amount: number;
  clicks: number;
  isMonthly: boolean;
  type: 'buy' | 'withdraw';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  userPhone?: string;
  receiptRef?: string;
  receiptNote?: string;
}

export interface TradingSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: string;
  tp1: string;
  tp2: string;
  tp3: string;
  sl: string;
  winRate: string;
  status: 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_TP3' | 'STOP_LOSS' | 'CLOSED';
  isVip: boolean;
  createdAt: string;
  notes?: string;
}

export interface AppSettings {
  fibNumber: string;
  clickReward: number;
  adminUser: string;
  adminPass: string;
  adminVaultBalance?: number;
}

export interface ActivityLog {
  id: string;
  userKey: string;
  type: 'click' | 'signal' | 'buy_request' | 'withdraw_request' | 'approval';
  title: string;
  detail: string;
  date: string;
}

export interface VisitorSession {
  id: string;
  userKey?: string;
  userName?: string;
  userPhone?: string;
  userFib?: string;
  page: string;
  lastActive: number;
  joinedAt: number;
  isOnline?: boolean;
  isLoggedIn?: boolean;
}
