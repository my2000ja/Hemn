import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { User, PendingRequest, TradingSignal, AppSettings, ActivityLog, VisitorSession } from "./src/types";
import { INITIAL_SETTINGS, INITIAL_SIGNALS } from "./src/data/initialData";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "server_db.json");

interface DBData {
  users: Record<string, User>;
  pendingRequests: PendingRequest[];
  tradingSignals: TradingSignal[];
  appSettings: AppSettings;
  activities: Record<string, ActivityLog[]>;
  visitors: Record<string, VisitorSession>;
}

let db: DBData = {
  users: {},
  pendingRequests: [],
  tradingSignals: INITIAL_SIGNALS,
  appSettings: INITIAL_SETTINGS,
  activities: {},
  visitors: {}
};

// Load database from disk
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      db = {
        users: parsed.users || {},
        pendingRequests: parsed.pendingRequests || [],
        tradingSignals: parsed.tradingSignals && parsed.tradingSignals.length > 0 ? parsed.tradingSignals : INITIAL_SIGNALS,
        appSettings: parsed.appSettings ? { ...INITIAL_SETTINGS, ...parsed.appSettings } : INITIAL_SETTINGS,
        activities: parsed.activities || {},
        visitors: parsed.visitors || {}
      };
      
      // Ensure all user real balances are strictly reset to 0
      Object.keys(db.users).forEach((k) => {
        if (db.users[k]) {
          db.users[k].balance = 0;
        }
      });
      saveDB();
      console.log("Database successfully loaded and user balances reset to 0.");
    } else {
      saveDB();
    }
  } catch (err) {
    console.error("Error loading DB, starting with initial state:", err);
  }
}

// Save database to disk
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving DB:", err);
  }
}

loadDB();

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS middleware for safety
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", usersCount: Object.keys(db.users).length, requestsCount: db.pendingRequests.length });
  });

  // GET ALL USERS
  app.get("/api/users", (req, res) => {
    const now = Date.now();
    const list = Object.entries(db.users).map(([key, data]) => {
      const lastActive = data.lastActive || 0;
      const isOnline = (now - lastActive) <= 3 * 60 * 1000; // Active within 3 minutes
      return {
        key,
        data: {
          ...data,
          isOnline,
          lastActive
        }
      };
    });
    res.json(list);
  });

  // GET SINGLE USER
  app.get("/api/users/:key", (req, res) => {
    const key = req.params.key;
    if (db.users[key]) {
      const now = Date.now();
      const data = db.users[key];
      const lastActive = data.lastActive || 0;
      const isOnline = (now - lastActive) <= 3 * 60 * 1000;
      res.json({ ...data, isOnline, lastActive });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // POST/UPDATE USER
  app.post("/api/users", (req, res) => {
    const { key, data } = req.body;
    if (!key || !data) {
      res.status(400).json({ error: "Key and data required" });
      return;
    }
    const now = Date.now();
    const existing = db.users[key];
    db.users[key] = {
      ...existing,
      ...data,
      lastActive: data.lastActive || existing?.lastActive || now,
      lastLoginAt: data.lastLoginAt || existing?.lastLoginAt || now
    };
    saveDB();
    res.json({ success: true, user: db.users[key] });
  });

  // DELETE SINGLE USER
  app.delete("/api/users/:key", (req, res) => {
    const key = req.params.key;
    if (db.users[key]) {
      delete db.users[key];
      saveDB();
      res.json({ success: true, key });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // DELETE ALL OR BULK USERS
  app.delete("/api/users", (req, res) => {
    const scope = (req.query.scope as string) || "all";
    let deletedCount = 0;
    const now = Date.now();

    if (scope === "logged") {
      Object.keys(db.users).forEach((key) => {
        const u = db.users[key];
        const isOnline = (now - (u.lastActive || 0)) <= 3 * 60 * 1000;
        if (u.isLoggedIn || u.lastLoginAt || isOnline) {
          delete db.users[key];
          deletedCount++;
        }
      });
    } else if (scope === "banned") {
      Object.keys(db.users).forEach((key) => {
        if (db.users[key].isBanned) {
          delete db.users[key];
          deletedCount++;
        }
      });
    } else {
      deletedCount = Object.keys(db.users).length;
      db.users = {};
    }

    saveDB();
    res.json({ success: true, scope, deletedCount, remainingUsers: Object.keys(db.users).length });
  });

  // VISITOR / ONLINE TRACKING
  app.post("/api/visitors/ping", (req, res) => {
    const { id, userKey, userName, userPhone, userFib, page } = req.body;
    if (!id) {
      res.status(400).json({ error: "Session ID required" });
      return;
    }

    const isAdmin = Boolean(
      (userName && (userName.toLowerCase().includes("admin") || userName.includes("ئەدمین"))) ||
      (userKey && (userKey.toLowerCase() === "admin" || userKey.toLowerCase() === "user_admin")) ||
      page === "admin"
    );

    if (isAdmin) {
      if (db.visitors[id]) {
        delete db.visitors[id];
        saveDB();
      }
      res.json({ success: true, ignored: true });
      return;
    }

    const now = Date.now();
    const existing = db.visitors[id];
    const isLoggedIn = Boolean(userKey);

    db.visitors[id] = {
      id,
      userKey: userKey || existing?.userKey || "",
      userName: userName || existing?.userName || (isLoggedIn ? "بەکارهێنەر" : "سەردانیکەری مێوان"),
      userPhone: userPhone || existing?.userPhone || "",
      userFib: userFib || existing?.userFib || "",
      page: page || existing?.page || "home",
      lastActive: now,
      joinedAt: existing?.joinedAt || now,
      isLoggedIn: isLoggedIn || Boolean(existing?.isLoggedIn)
    };

    // If userKey is provided, update that user's active & online status in db.users
    if (userKey && db.users[userKey]) {
      db.users[userKey].lastActive = now;
      db.users[userKey].isLoggedIn = true;
      if (!db.users[userKey].lastLoginAt) {
        db.users[userKey].lastLoginAt = now;
      }
    }

    saveDB();
    res.json({ success: true, session: db.visitors[id] });
  });

  app.get("/api/visitors", (req, res) => {
    const now = Date.now();
    const isRealVisitor = (v: any) => {
      const name = (v.userName || "").toLowerCase();
      const key = (v.userKey || "").toLowerCase();
      const page = (v.page || "").toLowerCase();
      return !name.includes("admin") && !name.includes("ئەدمین") && key !== "admin" && page !== "admin";
    };

    // Clean up stale admin entries if any exist
    Object.keys(db.visitors).forEach((id) => {
      if (!isRealVisitor(db.visitors[id])) {
        delete db.visitors[id];
      }
    });

    const list = Object.values(db.visitors)
      .filter(isRealVisitor)
      .map(s => ({
        ...s,
        isOnline: (now - s.lastActive) <= 30 * 60 * 1000 // Active within last 30 minutes
      }))
      .sort((a, b) => b.lastActive - a.lastActive);

    res.json(list);
  });

  app.delete("/api/visitors", (req, res) => {
    db.visitors = {};
    saveDB();
    res.json({ success: true });
  });

  // GET PENDING REQUESTS
  app.get("/api/requests", (req, res) => {
    res.json(db.pendingRequests);
  });

  // CREATE NEW REQUEST
  app.post("/api/requests", (req, res) => {
    const request: PendingRequest = req.body;
    if (!request || !request.id) {
      res.status(400).json({ error: "Invalid request payload" });
      return;
    }
    // Prepend request
    db.pendingRequests = [request, ...db.pendingRequests.filter(r => r.id !== request.id)];
    saveDB();
    res.json({ success: true, request });
  });

  // UPDATE REQUEST STATUS (Approve or Reject)
  app.put("/api/requests/:id", (req, res) => {
    const reqId = Number(req.params.id);
    const { status } = req.body; // 'approved' | 'rejected'
    
    const target = db.pendingRequests.find(r => r.id === reqId);
    if (!target) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    target.status = status;

    // If approved, update user's account automatically on server
    if (status === 'approved' && target.userKey && db.users[target.userKey]) {
      const user = db.users[target.userKey];
      if (target.type === 'buy') {
        // ALWAYS add requested amount to user balance
        user.balance = (user.balance || 0) + (target.amount || 0);

        if (target.isMonthly) {
          const is30Min = target.title.includes('۳۰') || target.title.includes('30') || target.title.includes('خولەک') || target.title.includes('سەعات') || target.title.includes('Hourly');
          const isMonthly = target.title.includes('مانگ') || target.title.includes('Monthly');
          const initialClicks = target.clicks || 15;
          user.monthly = true;
          user.vipPlanType = is30Min ? 'min30' : isMonthly ? 'monthly' : 'yearly';
          user.vipInitialClicks = initialClicks;
          user.vipDailyClicks = initialClicks;
          const durationMs = is30Min ? 30 * 60 * 1000 : isMonthly ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
          user.vipNextResetTime = Date.now() + durationMs;
          user.vipExpiryDate = Date.now() + durationMs;
        } else if (target.clicks) {
          user.clicks = (user.clicks || 0) + target.clicks;
        }
      }
      db.users[target.userKey] = user;
    } else if (status === 'rejected' && target.userKey && db.users[target.userKey]) {
      // If withdrawal request is rejected, refund deducted money back to user balance
      const user = db.users[target.userKey];
      if (target.type === 'withdraw' && target.amount) {
        user.balance = (user.balance || 0) + target.amount;
      }
      db.users[target.userKey] = user;
    }

    saveDB();
    res.json({ success: true, request: target, users: Object.entries(db.users).map(([key, data]) => ({ key, data })) });
  });

  // GET SETTINGS
  app.get("/api/settings", (req, res) => {
    res.json(db.appSettings);
  });

  // SAVE SETTINGS
  app.post("/api/settings", (req, res) => {
    const newSettings = req.body;
    db.appSettings = { ...db.appSettings, ...newSettings };
    saveDB();
    res.json({ success: true, settings: db.appSettings });
  });

  // ADD TO ADMIN VAULT (RECORD USER GAME LOSSES)
  app.post("/api/admin/vault/add", (req, res) => {
    const { amount } = req.body;
    const loss = Number(amount);
    if (!isNaN(loss) && loss > 0) {
      const currentVault = db.appSettings.adminVaultBalance || 0;
      db.appSettings.adminVaultBalance = currentVault + loss;
      saveDB();
      res.json({ success: true, adminVaultBalance: db.appSettings.adminVaultBalance, settings: db.appSettings });
    } else {
      res.status(400).json({ error: "Invalid amount" });
    }
  });

  // GET SIGNALS
  app.get("/api/signals", (req, res) => {
    res.json(db.tradingSignals);
  });

  // SAVE SIGNALS
  app.post("/api/signals", (req, res) => {
    const signals = req.body;
    if (Array.isArray(signals)) {
      db.tradingSignals = signals;
      saveDB();
      res.json({ success: true, signals: db.tradingSignals });
    } else {
      res.status(400).json({ error: "Expected array of signals" });
    }
  });

  // GET ACTIVITIES
  app.get("/api/activities/:userKey", (req, res) => {
    const userKey = req.params.userKey;
    res.json(db.activities[userKey] || []);
  });

  // POST ACTIVITY
  app.post("/api/activities", (req, res) => {
    const { userKey, log } = req.body;
    if (!userKey || !log) {
      res.status(400).json({ error: "userKey and log required" });
      return;
    }
    const current = db.activities[userKey] || [];
    const updated = [log, ...current].slice(0, 30);
    db.activities[userKey] = updated;
    saveDB();
    res.json({ success: true, activities: updated });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
