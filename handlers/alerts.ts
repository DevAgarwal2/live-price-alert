import { Bot } from 'grammy';
import { getActiveUsers, isAssetMutedForUser } from '../database';
import { getAssetName, formatPrice, formatPercentage, calculateValueAnalysis } from '../services/analysis';
import type { Alert } from '../types';

export async function sendAlert(bot: Bot, alert: Alert): Promise<void> {
  const users = getActiveUsers();
  const arrow = alert.changePerc >= 0 ? '⬆️' : '⬇️';
  const direction = alert.changePerc >= 0 ? 'UP' : 'DOWN';
  
  const analysis = calculateValueAnalysis(alert.changePerc, alert.polyYesPrice, alert.polyNoPrice);
  
  let message = '';
  
  // Different header for direction change alerts
  if (alert.alertType === 'DIRECTION_CHANGE') {
    const crossed = alert.changePerc >= 0 ? 'ABOVE ⬆️' : 'BELOW ⬇️';
    message = `🔄 ${getAssetName(alert.symbol)} crossed **${crossed}** yesterday's close!\n`;
  } else {
    message = `🔔 ${getAssetName(alert.symbol)} ${direction} ${formatPercentage(alert.changePerc)}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `📈 MOMENTUM\n`;
  message += `Real: $${formatPrice(alert.realPrice)} (${formatPercentage(alert.changePerc)} ${arrow})\n\n`;
  
  message += `📊 POLYMARKET\n`;
  message += `YES: ${formatPrice(alert.polyYesPrice * 100)}¢ (${formatPrice(analysis.yesActual)}%)\n`;
  message += `NO: ${formatPrice(alert.polyNoPrice * 100)}¢ (${formatPrice(analysis.noActual)}%)\n\n`;
  
  message += `💡 VALUE ANALYSIS\n`;
  message += `YES: Expected ~${formatPrice(analysis.yesExpected)}% | Actual ${formatPrice(analysis.yesActual)}%\n`;
  message += `Status: ${analysis.yesStatus === 'UNDERPRICED' ? '⚡ UNDERPRICED' : analysis.yesStatus === 'PRICED_IN' ? '⚠️ PRICED IN' : '⚖️ FAIR'}\n\n`;
  
  message += `NO: Expected ~${formatPrice(analysis.noExpected)}% | Actual ${formatPrice(analysis.noActual)}%\n`;
  message += `Status: ${analysis.noStatus === 'UNDERPRICED' ? '⚡ UNDERPRICED' : analysis.noStatus === 'PRICED_IN' ? '⚠️ PRICED IN' : '⚖️ FAIR'}\n\n`;
  
  message += `🎯 RECOMMENDATION\n`;
  message += `${analysis.recommendation}`;
  
  for (const chatId of users) {
    try {
      // Check if user has muted this asset
      if (isAssetMutedForUser(chatId, alert.symbol)) {
        console.log(`[ℹ] Skipping alert for ${alert.symbol} - muted by user ${chatId}`);
        continue;
      }
      
      await bot.api.sendMessage(chatId, message);
    } catch (error) {
      console.error(`Failed to send alert to ${chatId}:`, error);
    }
  }
}
