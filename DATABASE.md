# 🗄️ SQLITE DATABASE SCHEMA

## 📋 TABLES

### 1. **price_snapshots** (Price History Tracking)
Stores real-time price snapshots every 5 minutes for 20-minute hold confirmation.

```sql
CREATE TABLE price_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,                -- AAPL, GC, SI, etc.
  changePerc REAL NOT NULL,            -- % change from previous close
  currentPrice REAL NOT NULL,          -- Current real price
  polyYesPrice REAL NOT NULL,          -- Polymarket YES price (0-1)
  polyNoPrice REAL NOT NULL,           -- Polymarket NO price (0-1)
  clobTokenIdYes TEXT,                 -- Polymarket YES token ID
  clobTokenIdNo TEXT,                  -- Polymarket NO token ID
  timestamp INTEGER NOT NULL           -- Unix timestamp (ms)
);

INDEX: idx_snapshots_symbol_time ON (symbol, timestamp)
```

**Purpose:**
- Track price movements over time
- 20-minute hold confirmation (need 4+ snapshots ≥ 0.75%)
- Dashboard price history (last 30 minutes)

**Retention:** Auto-deleted after 24 hours

**Example Data:**
```
id | symbol | changePerc | currentPrice | polyYesPrice | polyNoPrice | clobTokenIdYes | timestamp
1  | AAPL   | 1.2        | 252.50       | 0.68         | 0.32        | 12345...       | 1737415200000
2  | AAPL   | 1.3        | 252.75       | 0.70         | 0.30        | 12345...       | 1737415500000
3  | GC     | 0.9        | 4732.50      | 0.65         | 0.35        | 67890...       | 1737415200000
```

---

### 2. **alerts** (Alert History Tracking)
Stores all sent alerts to prevent duplicates and track alert history.

```sql
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,                -- AAPL, GC, SI, etc.
  changePerc REAL NOT NULL,            -- % change when alert sent
  realPrice REAL NOT NULL,             -- Real price when alert sent
  polyYesPrice REAL NOT NULL,          -- YES price when alert sent
  polyNoPrice REAL NOT NULL,           -- NO price when alert sent
  clobTokenIdYes TEXT,                 -- Polymarket YES token ID
  clobTokenIdNo TEXT,                  -- Polymarket NO token ID
  analysis TEXT NOT NULL,              -- UNDERPRICED or PRICED_IN
  sentAt INTEGER NOT NULL              -- Unix timestamp (ms)
);

INDEX: idx_alerts_symbol ON (symbol, sentAt)
```

**Purpose:**
- Prevent duplicate alerts (60-minute cooldown)
- Historical record of all alerts
- Analytics & tracking

**Retention:** Permanent

**Example Data:**
```
id | symbol | changePerc | realPrice | polyYesPrice | polyNoPrice | clobTokenIdYes | analysis     | sentAt
1  | AAPL   | 1.2        | 252.50    | 0.58         | 0.42        | 12345...       | UNDERPRICED  | 1737415800000
2  | GC     | 0.9        | 4732.50   | 0.75         | 0.25        | 67890...       | PRICED_IN    | 1737416100000
```

---

### 3. **users** (Telegram Users)
Stores all users who started the bot to send alerts.

```sql
CREATE TABLE users (
  chatId INTEGER PRIMARY KEY,          -- Telegram chat ID
  startedAt INTEGER NOT NULL           -- Unix timestamp when user started bot
);
```

**Purpose:**
- Track all registered users
- Send alerts to all users
- User management

**Retention:** Permanent

**Example Data:**
```
chatId      | startedAt
123456789   | 1737414000000
987654321   | 1737415000000
```

---

## 📊 DATA FLOW

### **Every 5 Minutes:**
```
1. Fetch APIs (stocks, gold/silver, polymarket)
   ↓
2. For each asset (11 total):
   ↓
3. Create PriceSnapshot
   ↓
4. INSERT INTO price_snapshots
   ↓
5. Check for alerts (checkForAlerts)
   ↓
6. Query last 20 min snapshots
   ↓
7. If 4+ snapshots >= 0.75%:
   ↓
8. Check no recent alert (60 min)
   ↓
9. INSERT INTO alerts
   ↓
10. Send Telegram alert to all users
```

---

## 🔍 KEY QUERIES

### **Get snapshots for 20-min confirmation:**
```sql
SELECT * FROM price_snapshots 
WHERE symbol = 'AAPL' 
  AND timestamp > (current_time - 20_minutes)
ORDER BY timestamp DESC;
```

### **Check if alert sent recently:**
```sql
SELECT * FROM alerts 
WHERE symbol = 'AAPL' 
  AND sentAt > (current_time - 60_minutes);
```

### **Get price history for dashboard:**
```sql
SELECT * FROM price_snapshots 
WHERE symbol = 'AAPL' 
  AND timestamp > (current_time - 30_minutes)
ORDER BY timestamp ASC
LIMIT 6;
```

### **Get all active users for alerts:**
```sql
SELECT chatId FROM users;
```

---

## 📈 DATA STORED

### **From Stock API:**
- ✅ `todaysChangePerc` → `changePerc`
- ✅ `currentPrice` → `currentPrice`
- ✅ `previousClose` → (used for calculations)

### **From Gold/Silver API:**
- ✅ `pcXau` / `pcXag` → `changePerc`
- ✅ `xauPrice` / `xagPrice` → `currentPrice`
- ✅ `xauClose` / `xagClose` → (used for calculations)

### **From Polymarket API:**
- ✅ `outcomePrices[0]` → `polyYesPrice`
- ✅ `outcomePrices[1]` → `polyNoPrice`
- ✅ `clobTokenIds[0]` → `clobTokenIdYes` ⭐ NEW
- ✅ `clobTokenIds[1]` → `clobTokenIdNo` ⭐ NEW
- ✅ `marketLink` → (stored in code, not DB)

---

## 🧹 CLEANUP

**Daily cleanup (every 24 hours):**
```sql
DELETE FROM price_snapshots 
WHERE timestamp < (current_time - 24_hours);
```

**Why:**
- Only need recent snapshots for alerts
- Prevents DB from growing too large
- Alerts table kept forever for history
