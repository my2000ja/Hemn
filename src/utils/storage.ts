import { User, PendingRequest, TradingSignal, AppSettings, ActivityLog } from '../types';
import { INITIAL_SETTINGS, INITIAL_SIGNALS } from '../data/initialData';

const SETTINGS_KEY = 'kurd_app_settings';
const SIGNALS_KEY = 'kurd_trading_signals';
const PENDING_KEY = 'kurd_pending';
const CURRENT_USER_KEY = 'kurd_current_user_key';
const ADMIN_LOGGED_KEY = 'kurd_admin_logged_in';
const VIEW_STATE_KEY = 'kurd_current_view';
const VISITOR_SESSION_KEY = 'kurd_visitor_session_id';
const ACTIVITY_PREFIX = 'kurd_activity_';

export const getAdminLoggedIn = (): boolean => {
  return localStorage.getItem(ADMIN_LOGGED_KEY) === 'true';
};

export const setAdminLoggedIn = (isLogged: boolean) => {
  if (isLogged) {
    localStorage.setItem(ADMIN_LOGGED_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_LOGGED_KEY);
  }
};

export const getSavedCurrentView = (): 'home' | 'signals' | 'history' | 'admin' => {
  const saved = localStorage.getItem(VIEW_STATE_KEY);
  if (saved === 'signals' || saved === 'history' || saved === 'admin') {
    return saved;
  }
  return 'home';
};

export const setSavedCurrentView = (view: 'home' | 'signals' | 'history' | 'admin') => {
  localStorage.setItem(VIEW_STATE_KEY, view);
};

export const getVisitorSessionId = (): string => {
  let id = localStorage.getItem(VISITOR_SESSION_KEY);
  if (!id) {
    id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(VISITOR_SESSION_KEY, id);
  }
  return id;
};

export const getActivityLogs = (userKey: string): ActivityLog[] => {
  if (!userKey) return [];
  const saved = localStorage.getItem(`${ACTIVITY_PREFIX}${userKey}`);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const addActivityLog = (
  userKey: string,
  log: Omit<ActivityLog, 'id' | 'userKey' | 'date'>
): ActivityLog[] => {
  if (!userKey) return [];
  const current = getActivityLogs(userKey);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newLog: ActivityLog = {
    ...log,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userKey,
    date: dateStr
  };
  const updated = [newLog, ...current].slice(0, 30);
  localStorage.setItem(`${ACTIVITY_PREFIX}${userKey}`, JSON.stringify(updated));

  // Sync to server asynchronously
  fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userKey, log: newLog })
  }).catch(() => {});

  return updated;
};

export const clearActivityLogs = (userKey: string) => {
  if (!userKey) return;
  localStorage.removeItem(`${ACTIVITY_PREFIX}${userKey}`);
};

export const getAppSettings = (): AppSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  try {
    return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }).catch(() => {});
};

export const getTradingSignals = (): TradingSignal[] => {
  const saved = localStorage.getItem(SIGNALS_KEY);
  if (!saved) {
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(INITIAL_SIGNALS));
    return INITIAL_SIGNALS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_SIGNALS;
  }
};

export const saveTradingSignals = (signals: TradingSignal[]) => {
  localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals));
  fetch('/api/signals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signals)
  }).catch(() => {});
};

export const getPendingRequests = (): PendingRequest[] => {
  const saved = localStorage.getItem(PENDING_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const savePendingRequests = (requests: PendingRequest[]) => {
  localStorage.setItem(PENDING_KEY, JSON.stringify(requests));
  // Send latest created request to server
  if (requests.length > 0) {
    const latest = requests[0];
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(latest)
    }).catch(() => {});
  }
};

export const ensureUserReferralCode = (_userKey: string, user: User): User => {
  return user;
};

export const getUserData = (userKey: string): User | null => {
  const saved = localStorage.getItem(userKey);
  if (!saved) return null;
  try {
    const parsed: User = JSON.parse(saved);
    return ensureUserReferralCode(userKey, parsed);
  } catch {
    return null;
  }
};

export const saveUserData = async (userKey: string, userData: User) => {
  const updatedUser = ensureUserReferralCode(userKey, userData);
  localStorage.setItem(userKey, JSON.stringify(updatedUser));
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: userKey, data: updatedUser })
    });
  } catch (err) {
    console.error('Failed to sync user data to server', err);
  }
};

export const getAllUsers = (): { key: string; data: User }[] => {
  const users: { key: string; data: User }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_')) {
      try {
        const raw = localStorage.getItem(key) || '';
        const data: User = JSON.parse(raw);
        users.push({ key, data: ensureUserReferralCode(key, data) });
      } catch {
        // ignore invalid entries
      }
    }
  }
  return users;
};

export const getCurrentUserKey = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const setCurrentUserKey = (key: string | null) => {
  if (key === null) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, key);
  }
};

// ================= API SYNC UTILITIES =================
export const fetchUsersFromServer = async (): Promise<{ key: string; data: User }[]> => {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const serverListRaw: { key: string; data: User }[] = await res.json();
      const serverList = serverListRaw.map((u) => ({
        key: u.key,
        data: ensureUserReferralCode(u.key, u.data)
      }));
      const serverKeySet = new Set(serverList.map((u) => u.key));

      // Update local storage with server list
      serverList.forEach((u) => {
        localStorage.setItem(u.key, JSON.stringify(u.data));
      });

      // Upload any local users missing from the server
      const localUsers = getAllUsers();
      for (const localUser of localUsers) {
        if (!serverKeySet.has(localUser.key)) {
          await saveUserData(localUser.key, localUser.data);
          serverList.push(localUser);
          serverKeySet.add(localUser.key);
        }
      }

      return serverList;
    }
  } catch {
    // Return local users as fallback without throwing console error
  }
  return getAllUsers();
};

export const fetchRequestsFromServer = async (): Promise<PendingRequest[]> => {
  try {
    const res = await fetch('/api/requests');
    if (res.ok) {
      const requests: PendingRequest[] = await res.json();
      localStorage.setItem(PENDING_KEY, JSON.stringify(requests));
      return requests;
    }
  } catch {
    // Return local pending requests as fallback
  }
  return getPendingRequests();
};

export const fetchSignalsFromServer = async (): Promise<TradingSignal[]> => {
  try {
    const res = await fetch('/api/signals');
    if (res.ok) {
      const signals: TradingSignal[] = await res.json();
      localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals));
      return signals;
    }
  } catch {
    // Return local trading signals as fallback
  }
  return getTradingSignals();
};

export const fetchSettingsFromServer = async (): Promise<AppSettings> => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const settings: AppSettings = await res.json();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    }
  } catch {
    // Return local app settings as fallback
  }
  return getAppSettings();
};

export const updateRequestStatusOnServer = async (
  id: number,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; requests: PendingRequest[]; users: { key: string; data: User }[] }> => {
  try {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.users) {
        data.users.forEach((u: { key: string; data: User }) => {
          localStorage.setItem(u.key, JSON.stringify(u.data));
        });
      }
      const updatedRequests = await fetchRequestsFromServer();
      return { success: true, requests: updatedRequests, users: data.users || getAllUsers() };
    }
  } catch {
    // Fallback
  }
  return { success: false, requests: getPendingRequests(), users: getAllUsers() };
};

export const deleteUserApi = async (userKey: string): Promise<boolean> => {
  localStorage.removeItem(userKey);
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userKey)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteAllUsersApi = async (scope: 'all' | 'logged' | 'banned' = 'all'): Promise<boolean> => {
  const keysToRemove: string[] = [];
  const now = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_')) {
      if (scope === 'all') {
        keysToRemove.push(key);
      } else {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const u: User = JSON.parse(raw);
            const isOnline = (now - (u.lastActive || 0)) <= 3 * 60 * 1000;
            if (scope === 'logged' && (u.isLoggedIn || u.lastLoginAt || isOnline)) {
              keysToRemove.push(key);
            } else if (scope === 'banned' && u.isBanned) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
  }

  keysToRemove.forEach((k) => localStorage.removeItem(k));

  try {
    const res = await fetch(`/api/users?scope=${scope}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const pingVisitorOnServer = async (payload: {
  userKey?: string;
  userName?: string;
  userPhone?: string;
  userFib?: string;
  page: string;
}) => {
  try {
    const id = getVisitorSessionId();
    await fetch('/api/visitors/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload })
    });
  } catch {
    // ignore network sync errors silently
  }
};

export const fetchVisitorsFromServer = async () => {
  try {
    const res = await fetch('/api/visitors');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return empty array fallback silently
  }
  return [];
};

export const clearVisitorsOnServer = async () => {
  try {
    await fetch('/api/visitors', { method: 'DELETE' });
  } catch {
    // ignore
  }
};
