# Polymarket Momentum Alert Bot

Telegram bot that tracks real-time price movements and Polymarket betting odds. Sends alerts when assets move 0.75%+ and hold for 20 minutes.

## Features

- **Real-time Price Tracking**: Stocks (AAPL, GOOGL, NFLX, MSFT, AMZN, PLTR, NVDA, META, TSLA), Gold (GC), Silver (SI)
- **Polymarket Integration**: Live YES/NO bet prices from daily markets
- **Smart Value Analysis**: Identifies underpriced vs priced-in opportunities
- **Confirmed Alerts**: 20-minute hold confirmation before alerting
- **Interactive Dashboard**: Detailed price history, signal strength, and profit calculations
- **SQLite Database**: Tracks price history and alert history

## Setup

### 1. Create Telegram Bot
- Message [@BotFather](https://t.me/BotFather) on Telegram
- Send `/newbot` and follow instructions
- Copy the bot token

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your bot token:
```
BOT_TOKEN=your_bot_token_here
```

### 3. Install Dependencies
```bash
bun install
```

### 4. Run the Bot
```bash
bun run bot
```

## Usage

1. Start the bot on Telegram: `/start`
2. Browse assets by category:
   - 📈 STOCKS → View all 9 tracked stocks
   - 🟡 GOLD → Gold dashboard
   - ⚪ SILVER → Silver dashboard
3. Click any asset to see detailed dashboard with:
   - Real-time price & change %
   - Polymarket YES/NO prices
   - Value analysis (underpriced/priced in/fairly priced)
   - 30-minute price history
   - Signal strength & confidence
   - Profit calculations for betting
   - Direct link to Polymarket market
4. Receive automatic alerts when price moves 0.75%+ and holds for 20 minutes

## How It Works

### Data Sources
- **Stock Prices**: `https://polymarket.com/api/equity/ticker-snapshot`
- **Gold/Silver**: `https://data-asg.goldprice.org/dbXRates/USD`
- **Polymarket Markets**: `https://gamma-api.polymarket.com/events/pagination`

### Alert Logic
1. Bot checks prices every 5 minutes
2. If price moves ±0.75% or more, starts tracking
3. If movement holds for 20+ minutes (4+ consecutive snapshots), triggers alert
4. Alert shows:
   - Real price change with direction
   - Polymarket YES/NO prices
   - Value analysis (underpriced vs priced in)

### Value Analysis
```
Expected Price = 50% + (|price change %| × 10)

Example: Stock moves +1.2%
Expected YES price ≈ 62%

If market shows:
- 52% YES → ⚡ UNDERPRICED (10% gap)
- 62% YES → ⚖️ FAIRLY PRICED
- 75% YES → ⚠️ PRICED IN (13% gap)
```

## Commands

- `bun run bot` - Start the Telegram bot
- `bun run markets` - View current Polymarket markets in console

## Project Structure

```
daily-market/
├── bot.ts              # Main bot logic & interval jobs
├── database.ts         # SQLite setup & queries
├── types.ts            # TypeScript interfaces
├── services/
│   ├── polymarket.ts   # Polymarket API integration
│   ├── realtime.ts     # Stock/Gold/Silver price APIs
│   ├── alerts.ts       # Alert detection & price tracking
│   └── analysis.ts     # Value analysis calculations
├── handlers/
│   ├── menu.ts         # Main menu & button handlers
│   ├── dashboard.ts    # Dashboard formatting & display
│   └── alerts.ts       # Alert message formatting
└── data.db             # SQLite database (auto-created)
```

## Database Schema

**price_snapshots**: Stores 5-minute price snapshots for 20-minute confirmation
**alerts**: Tracks sent alerts to prevent duplicates
**users**: Registered bot users who receive alerts

## Configuration

Bot runs these background jobs:
- **Every 5 minutes**: Record current prices for all assets
- **Every 5 minutes**: Check for alert conditions (20-min hold)
- **Every 24 hours**: Clean up old snapshots

## Alert Example

```
🔔 GOLD UP +1.1% (CONFIRMED)

Real: $4,732 (+1.1%)
Market: 58¢ YES / 42¢ NO

Analysis: ⚡ UNDERPRICED - Market hasn't caught up yet
```

## Dashboard Example

```
🟡 Gold (GC)
━━━━━━━━━━━━━━━━━

📈 REAL PRICE
Current: $4,732.50
Previous Close: $4,678.00
Change: +$54.50 (+1.16% ⬆️)

📊 POLYMARKET BET PRICES
YES (UP): 68¢
NO (DOWN): 32¢
🔗 Market: https://polymarket.com/market/gc-up-or-down...

💡 MARKET STATUS
Real momentum: +1.16% UP
Market pricing: 68% UP
Analysis: ⚖️ FAIRLY PRICED

🕐 PRICE HISTORY (Last 30 min)
5:05 PM: +1.10% | YES 65¢
5:15 PM: +1.12% | YES 67¢
5:25 PM: +1.15% | YES 68¢
5:35 PM: +1.16% | YES 68¢

🎯 SIGNAL STRENGTH
Duration: 20 minutes
Confidence: MEDIUM
Momentum: STRENGTHENING

💰 IF YOU BET NOW
$100 on YES (68¢) → Win $147 if UP (+$47)
$100 on NO (32¢) → Win $312 if DOWN (+$212)

[📊 Place Bet] [🔄 Refresh] [⬅️ Back]
```

## Assets Tracked

**Stocks**: AAPL, GOOGL, NFLX, MSFT, AMZN, PLTR, NVDA, META, TSLA  
**Metals**: Gold (GC), Silver (SI)

## Development

Built with:
- **Runtime**: Bun
- **Language**: TypeScript
- **Bot Framework**: grammY
- **Database**: better-sqlite3

Created using `bun init` in bun v1.2.17.
