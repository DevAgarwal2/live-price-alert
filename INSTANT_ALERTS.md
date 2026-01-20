# ⚡ INSTANT ALERTS - UPDATED LOGIC

## 🚀 NEW ALERT SYSTEM

### **Before (20-min hold):**
```
Price moves +1.2% → Wait 20 minutes → Still high? → Alert ✅
```

### **NOW (Instant):**
```
Price moves +1.2% → Alert sent within 5 minutes ⚡
```

---

## 📊 HOW IT WORKS NOW

### **Every 5 Minutes:**
```
1. Fetch all APIs (stocks, gold/silver, polymarket)
2. Record snapshot to database
3. Check IMMEDIATELY: Is |changePerc| >= 0.75%?
4. Check: No alert sent in last 60 minutes?
5. If YES to both → SEND ALERT NOW ⚡
```

---

## 🔔 NEW ALERT FORMAT

```
🔔 GOLD UP +1.1%
━━━━━━━━━━━━━━━━━

📈 MOMENTUM
Real: $4,732 (+1.1% ⬆️)

📊 POLYMARKET
YES: 58¢ (58%)
NO: 42¢ (42%)

💡 VALUE ANALYSIS
YES: Expected ~61% | Actual 58%
Status: ⚡ UNDERPRICED

NO: Expected ~39% | Actual 42%
Status: ⚖️ FAIR

🎯 RECOMMENDATION
⚡ BET YES - Underpriced opportunity
```

**No more "(CONFIRMED)" or "20 min hold"** - it's instant!

---

## ⏱️ TIMING EXAMPLE

```
5:00 PM - AAPL moves from $250 → $253 (+1.2%)
5:05 PM - Bot checks prices
          → Detects +1.2% movement
          → Sends alert IMMEDIATELY ⚡

You receive: "🔔 AAPL UP +1.2%"
```

---

## 🛡️ DUPLICATE PREVENTION

**60-minute cooldown:**
```
5:05 PM - Alert sent for AAPL
5:10 PM - AAPL still +1.2% → No alert (cooldown)
5:15 PM - AAPL still +1.2% → No alert (cooldown)
...
6:05 PM - AAPL moves +1.5% → New alert ✅
```

**Why 60 min?** 
- Prevents spam
- Allows new alerts if price moves again
- You won't get flooded

---

## 📈 ALERT TRIGGERS

**Instant alerts for:**
- ✅ Stock moves >= 0.75%
- ✅ Gold moves >= 0.75%
- ✅ Silver moves >= 0.75%

**Both directions:**
- ✅ UP movements (+0.75%+)
- ✅ DOWN movements (-0.75%+)

---

## 🎯 BENEFITS

✅ **FAST** - Alert within 5 minutes of movement  
✅ **MOMENTUM** - Catch moves early  
✅ **VALUE** - See if YES/NO is underpriced  
✅ **SMART** - 60-min cooldown prevents spam  

---

## ⚙️ CODE CHANGES

### **services/alerts.ts**
```typescript
// OLD: Need 4+ snapshots (20 min)
if (snapshots.length < 4) continue;

// NEW: Need 1 snapshot (instant)
if (snapshots.length < 1) continue;
```

### **handlers/alerts.ts**
```typescript
// OLD: "CONFIRMED (20 min hold)"
// NEW: Just shows the movement immediately
```

---

## 🚀 READY TO USE

Run: `bun run bot`

**Alert speed:** Within 5 minutes of price movement ⚡
