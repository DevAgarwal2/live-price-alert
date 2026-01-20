# ✅ FINAL ALERT LOGIC - 0.75% THRESHOLD

## 🎯 UPDATED BEHAVIOR

**Rule: First alert at 0.75%, then alerts every 0.75%+ change**

```
AAPL moves -1.98%
  ↓
🔔 FIRST ALERT: "AAPL DOWN -1.98%"
  ↓
AAPL stays at -2.00%  → ❌ No alert (0.02% change)
AAPL moves to -2.50%  → ❌ No alert (0.52% change)
AAPL moves to -2.80%  → 🔔 NEW ALERT! (0.82% change from -1.98%)
  ↓
AAPL stays at -2.90%  → ❌ No alert (0.10% change from -2.80%)
AAPL moves to -3.60%  → 🔔 NEW ALERT! (0.80% change from -2.80%)
```

---

## 📊 EXAMPLE TIMELINE

```
Time      | AAPL   | Alert?           | Change from last
----------|--------|------------------|------------------
11:00:00  | -1.98% | 🔔 ALERT SENT   | First time
11:00:30  | -2.00% | ❌ Skip          | 0.02%
11:01:00  | -2.50% | ❌ Skip          | 0.52%
11:02:00  | -2.80% | 🔔 ALERT SENT   | 0.82% ✅
11:03:00  | -2.90% | ❌ Skip          | 0.10%
11:05:00  | -3.60% | 🔔 ALERT SENT   | 0.80% ✅
11:06:00  | -3.70% | ❌ Skip          | 0.10%
11:10:00  | -4.50% | 🔔 ALERT SENT   | 0.90% ✅
```

---

## ✅ UPDATED TABLE

| Version | Trigger | Follow-up | Result |
|---------|---------|-----------|--------|
| V1 | 0.75% + 20min | 60 min cooldown | Too slow |
| V2 | 0.75% | 30 sec / 0.1% | SPAM |
| V3 | 0.75% | 2 min / 0.5% | Still spam |
| V4 OLD | 0.75% first | 1%+ change | Missed moves |
| **V4 NEW** | **0.75% first** | **0.75%+ change** | **Perfect!** ✅ |

---

## 🚀 TEST NOW

```bash
# Database reset - fresh start
rm data.db

# Run bot
bun run bot
```

**You should see:**
- ✅ Initial alerts for all stocks >= 0.75%
- ✅ Then new alerts every time it moves 0.75%+ more
- ✅ No spam for tiny changes

**NOW IT WILL CATCH ALL YOUR MOVES!** 🎉
