import { Bot } from 'grammy';
import 'dotenv/config';
import { registerUser, getUserMutedAssets, muteAssetForUser, unmuteAssetForUser } from './database';
import { getMainMenu, getStocksMenu, getSettingsMenu, getMuteMenu } from './handlers/menu';
import { getAssetData, formatDashboard, getDashboardKeyboard } from './handlers/dashboard';
import { checkAndRecordPrices, checkForAlerts } from './services/alerts';
import { sendAlert } from './handlers/alerts';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required in .env file');
}

const bot = new Bot(BOT_TOKEN);

// Error handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  
  // Ignore "message not modified" errors (happens when refresh with same data)
  if (e.message.includes('message is not modified')) {
    ctx.answerCallbackQuery({ text: 'Data is already up to date!' }).catch(() => {});
    return;
  }
  
  console.error('Error details:', e);
});

// Command: /start
bot.command('start', async (ctx) => {
  registerUser(ctx.chat.id);
  
  await ctx.reply(
    '👋 Welcome to Polymarket Momentum Alert Bot!\n\n' +
    '📊 Get real-time price movements and value analysis\n' +
    '🔔 Receive INSTANT alerts when assets move 0.75%+ (checked every 10 seconds)\n\n' +
    'Select a category:',
    { reply_markup: getMainMenu() }
  );
});

// Callback: Main menu
bot.callbackQuery('menu_main', async (ctx) => {
  await ctx.editMessageText(
    'Select a category:',
    { reply_markup: getMainMenu() }
  );
  await ctx.answerCallbackQuery();
});

// Callback: Stocks menu
bot.callbackQuery('menu_stocks', async (ctx) => {
  await ctx.editMessageText(
    '📈 Select a stock:',
    { reply_markup: getStocksMenu() }
  );
  await ctx.answerCallbackQuery();
});

// Callback: Settings menu
bot.callbackQuery('menu_settings', async (ctx) => {
  await ctx.editMessageText(
    '⚙️ Settings:',
    { reply_markup: getSettingsMenu() }
  );
  await ctx.answerCallbackQuery();
});

// Callback: Mute menu
bot.callbackQuery('settings_mute', async (ctx) => {
  const mutedAssets = getUserMutedAssets(ctx.chat!.id);
  await ctx.editMessageText(
    '🔇 Mute/Unmute Assets\n\n' +
    '🔔 = Alerts enabled\n' +
    '🔇 = Alerts muted\n\n' +
    'Click to toggle:',
    { reply_markup: getMuteMenu(mutedAssets) }
  );
  await ctx.answerCallbackQuery();
});

// Callback: Toggle mute for asset
bot.callbackQuery(/^mute_toggle_(.+)$/, async (ctx) => {
  const symbol = ctx.match?.[1];
  if (!symbol) return;
  
  const mutedAssets = getUserMutedAssets(ctx.chat!.id);
  const isMuted = mutedAssets.includes(symbol);
  
  if (isMuted) {
    unmuteAssetForUser(ctx.chat!.id, symbol);
    await ctx.answerCallbackQuery({ text: `🔔 ${symbol} alerts enabled` });
  } else {
    muteAssetForUser(ctx.chat!.id, symbol);
    await ctx.answerCallbackQuery({ text: `🔇 ${symbol} alerts muted` });
  }
  
  // Refresh menu
  const updatedMuted = getUserMutedAssets(ctx.chat!.id);
  await ctx.editMessageReplyMarkup({ reply_markup: getMuteMenu(updatedMuted) });
});

// Callback: Asset dashboard
bot.callbackQuery(/^asset_(.+)$/, async (ctx) => {
  const symbol = ctx.match?.[1];
  if (!symbol) return;
  
  await ctx.answerCallbackQuery({ text: 'Loading...' });
  
  const data = await getAssetData(symbol);
  
  if (!data) {
    await ctx.editMessageText('❌ Unable to fetch data for this asset. Try again later.');
    return;
  }
  
  const message = formatDashboard(data);
  const keyboard = getDashboardKeyboard(symbol, data.marketLink);
  
  try {
    await ctx.editMessageText(message, { reply_markup: keyboard });
  } catch (error: any) {
    // Ignore if message is not modified
    if (!error.message?.includes('message is not modified')) {
      throw error;
    }
  }
});

// Background job: Record prices every 10 seconds
setInterval(async () => {
  try {
    await checkAndRecordPrices();
    console.log('[✓] Prices recorded at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('[✗] Error recording prices:', error);
  }
}, 10 * 1000); // 10 seconds

// Background job: Check for alerts every 10 seconds
setInterval(async () => {
  try {
    const alerts = checkForAlerts();
    
    for (const alert of alerts) {
      await sendAlert(bot, alert);
      console.log(`[✓] Alert sent for ${alert.symbol}: ${alert.changePerc.toFixed(2)}%`);
    }
    
    if (alerts.length === 0) {
      console.log('[ℹ] No new alerts at', new Date().toLocaleTimeString());
    }
  } catch (error) {
    console.error('[✗] Error checking alerts:', error);
  }
}, 10 * 1000); // 10 seconds

// Cleanup old snapshots daily
setInterval(async () => {
  try {
    const { clearOldSnapshots } = await import('./database');
    clearOldSnapshots(24);
    console.log('[✓] Cleaned old snapshots');
  } catch (error) {
    console.error('[✗] Error cleaning snapshots:', error);
  }
}, 24 * 60 * 60 * 1000);

// Initial price recording
checkAndRecordPrices().then(() => {
  console.log('[✓] Initial prices recorded');
});

console.log('🤖 Bot started successfully!');
bot.start();
