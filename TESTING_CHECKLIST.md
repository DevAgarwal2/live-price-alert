# ✅ TESTING CHECKLIST

## 📋 WHAT TO TEST IN TELEGRAM

### **1. BOT START**
```
Action: Send /start to bot
Expected:
  ✅ Get welcome message
  ✅ See 3 buttons:
     - 📈 STOCKS
     - 🟡 GOLD  
     - ⚪ SILVER
```

---

### **2. STOCKS MENU**
```
Action: Click "📈 STOCKS"
Expected:
  ✅ See 9 stock buttons:
     AAPL, GOOGL, NFLX
     MSFT, AMZN, PLTR
     NVDA, META, TSLA
  ✅ See "⬅️ Back" button
```

---

### **3. STOCK DASHBOARD**
```
Action: Click "AAPL" (or any stock)
Expected:
  ✅ Show dashboard with:
     - Real price & % change
     - Previous close
     - YES/NO prices (in cents)
     - Polymarket link
     - Value analysis for YES
     - Value analysis for NO
     - Price history (if available)
     - Signal strength
     - Profit calculations
  ✅ See buttons:
     - 📊 Place Bet (link)
     - 🔄 Refresh
     - ⬅️ Back
```

---

### **4. GOLD DASHBOARD**
```
Action: Click "🟡 GOLD" from main menu
Expected:
  ✅ Show Gold (GC) dashboard
  ✅ Current gold price
  ✅ % change
  ✅ YES/NO polymarket prices
  ✅ Value analysis
  ✅ Buttons: 📊 Place Bet, 🔄 Refresh, ⬅️ Back
```

---

### **5. SILVER DASHBOARD**
```
Action: Click "⚪ SILVER" from main menu
Expected:
  ✅ Show Silver (SI) dashboard
  ✅ Current silver price
  ✅ % change
  ✅ YES/NO polymarket prices
  ✅ Value analysis
  ✅ Buttons: 📊 Place Bet, 🔄 Refresh, ⬅️ Back
```

---

### **6. REFRESH BUTTON**
```
Action: Click "🔄 Refresh" on any dashboard
Expected:
  ✅ Dashboard reloads
  ✅ Shows updated prices
  ✅ Updated analysis
```

---

### **7. BACK NAVIGATION**
```
Action: Click "⬅️ Back" buttons
Expected:
  ✅ From stock → Stocks menu
  ✅ From stocks menu → Main menu
  ✅ From gold/silver → Main menu
```

---

### **8. PLACE BET LINK**
```
Action: Click "📊 Place Bet"
Expected:
  ✅ Opens Polymarket website
  ✅ Shows correct market (if available)
```

---

### **9. ALERTS (Wait for movement)**
```
Scenario: Stock/Gold/Silver moves >= 0.75%
Timing: Within 5 minutes of movement

Expected alert message:
  ✅ "🔔 [ASSET] UP/DOWN +X.X%"
  ✅ Shows momentum (real price + %)
  ✅ Shows Polymarket YES/NO prices
  ✅ Shows value analysis for YES
  ✅ Shows value analysis for NO  
  ✅ Shows recommendation

Alert behavior:
  ✅ Only sent once per hour per asset
  ✅ Sent to all users who used /start
```

---

### **10. NO DUPLICATE ALERTS**
```
Scenario: Same asset stays above 0.75%
Expected:
  ✅ Alert sent at 5:05 PM
  ✅ NO alert at 5:10 PM (cooldown)
  ✅ NO alert at 5:15 PM (cooldown)
  ✅ NO alert at 5:20 PM (cooldown)
  ✅ New alert at 6:05 PM (if still moving)
```

---

## 🐛 WHAT TO LOOK FOR (BUGS)

### **Dashboard Issues:**
- ❌ "Unable to fetch data" → API issue
- ❌ Missing prices → Check API endpoints
- ❌ Wrong calculations → Check analysis logic
- ❌ Buttons don't work → Check callback handlers

### **Alert Issues:**
- ❌ No alerts received → Check bot logs
- ❌ Duplicate alerts → Check cooldown logic
- ❌ Wrong analysis → Check value calculation
- ❌ Missing data in alert → Check API fetch

### **Navigation Issues:**
- ❌ Back button goes wrong place
- ❌ Stuck in menu
- ❌ Buttons don't respond

---

## 📊 CONSOLE LOGS TO WATCH

When bot is running, you'll see:

```bash
🤖 Bot started successfully!
[✓] Initial prices recorded

# Every 5 minutes:
[✓] Prices recorded at 5:05:00 PM
[ℹ] No new alerts at 5:05:00 PM

# When alert triggers:
[✓] Prices recorded at 5:10:00 PM
[✓] Alert sent for AAPL: +1.20%

# If error:
[✗] Error recording prices: [error details]
[✗] Error checking alerts: [error details]
```

---

## 🔍 DATABASE CHECK (Optional)

After running for a while, you can check:

```bash
# Open database
bun run -e "const db = require('better-sqlite3')('data.db'); console.log(db.prepare('SELECT COUNT(*) as count FROM price_snapshots').get()); process.exit()"

# Expected: Shows number of snapshots
# Should increase every 5 minutes
```

---

## ✅ SUCCESS CRITERIA

**Foundation is correct if:**

1. ✅ Dashboard shows live data
2. ✅ All buttons work (no errors)
3. ✅ Navigation flows correctly
4. ✅ Alerts send within 5 min of movement
5. ✅ No duplicate alerts (60 min cooldown)
6. ✅ Value analysis shows for YES and NO
7. ✅ Console shows regular updates
8. ✅ No crashes or errors in console

---

## 🚀 NEXT STEPS AFTER TESTING

If everything works:
- ✅ Foundation is solid
- ✅ Ready to add features
- ✅ Can optimize as needed

If issues found:
- Send screenshot of error
- Copy console logs
- Describe what happened
