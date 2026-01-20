# 🚀 QUICK START GUIDE

## ✅ BOT IS WORKING!

The crash was fixed - we switched from `better-sqlite3` to Bun's native SQLite.

---

## 🔧 SETUP STEPS

### **1. Create Telegram Bot**

Open Telegram and message [@BotFather](https://t.me/BotFather):

```
You: /newbot
BotFather: Alright, a new bot. How are we going to call it?

You: Polymarket Alert Bot
BotFather: Good. Now let's choose a username for your bot.

You: polymarket_alert_bot
BotFather: Done! Here's your token:
         123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Copy the token!**

---

### **2. Add Token to .env**

```bash
cd /Users/devagarwal/Documents/polymarket-proj/daily-market

# Create .env file
echo "BOT_TOKEN=YOUR_TOKEN_HERE" > .env

# Replace YOUR_TOKEN_HERE with actual token
```

**Example:**
```
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

### **3. Run Bot**

```bash
bun run bot
```

You should see:
```
🤖 Bot started successfully!
[✓] Initial prices recorded
[✓] Alert sent for AAPL: -2.03%
[✓] Alert sent for GOOGL: -1.19%
...
```

**Leave it running!**

---

### **4. Use Bot in Telegram**

1. **Find your bot** - Search for the name you chose (e.g., `@polymarket_alert_bot`)
2. **Send** `/start`
3. **You're registered!** - Now you'll receive alerts

**Main menu appears:**
```
📈 STOCKS
🟡 GOLD
⚪ SILVER
⚙️ SETTINGS
```

---

## 🔔 TESTING ALERTS

**Console output when bot is running:**
```bash
[✓] Prices recorded at 5:00:10 PM
[✓] Alert sent for AAPL: +1.20%

[✓] Prices recorded at 5:00:20 PM
[ℹ] No new alerts at 5:00:20 PM
```

**Your phone (Telegram):**
```
🔔 AAPL UP +1.20%
━━━━━━━━━━━━━━━━━

📈 MOMENTUM
Real: $253.50 (+1.20% ⬆️)

📊 POLYMARKET
YES: 58¢ (58%)
NO: 42¢ (42%)

💡 VALUE ANALYSIS
YES: Expected ~62% | Actual 58%
Status: ⚡ UNDERPRICED

NO: Expected ~38% | Actual 42%
Status: ⚖️ FAIR

🎯 RECOMMENDATION
⚡ BET YES - Underpriced opportunity
```

---

## 📱 USING THE BOT

### **View Dashboard:**
1. Click `📈 STOCKS`
2. Click any stock (e.g., `AAPL`)
3. See full dashboard with analysis
4. Click `🔄 Refresh` to update
5. Click `📊 Place Bet` to open Polymarket

### **Mute Assets:**
1. Click `⚙️ SETTINGS`
2. Click `🔇 Mute Assets`
3. Toggle any asset to mute/unmute
4. Muted assets won't send alerts

---

## ⚠️ IMPORTANT

**Keep bot running:**
- Bot must be running to send alerts
- Use `screen` or `tmux` to keep it running in background
- Or run on a server

**Example with screen:**
```bash
screen -S polymarket-bot
bun run bot
# Press Ctrl+A then D to detach
# Bot keeps running!

# To reattach later:
screen -r polymarket-bot
```

---

## 🐛 TROUBLESHOOTING

### **"BOT_TOKEN is required"**
→ Add token to `.env` file

### **No alerts received**
→ Did you send `/start` to the bot?
→ Is bot still running?

### **"Unable to fetch data"**
→ Check internet connection
→ APIs might be down

### **Bot crashes**
→ Check console for error
→ Make sure Bun is updated: `bun upgrade`

---

## 📊 WHAT HAPPENS NOW

**Every 10 seconds:**
- ✅ Fetches 11 asset prices
- ✅ Checks for >= 0.75% movement
- ✅ Sends alerts to all registered users
- ✅ Respects mute settings

**When you click buttons:**
- ✅ Fetches live data
- ✅ Shows full dashboard
- ✅ Calculates value analysis

---

## ✅ YOU'RE READY!

1. Add BOT_TOKEN to `.env`
2. Run `bun run bot`
3. Send `/start` in Telegram
4. Wait for alerts!

**Bot will monitor prices 24/7 and send you instant alerts!** 🚀
