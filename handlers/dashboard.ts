import { InlineKeyboard } from 'grammy';
import { fetchStockPrices, fetchGoldSilverPrices } from '../services/realtime';
import { fetchPolymarketData } from '../services/polymarket';
import { getHistoryForDashboard } from '../database';
import { calculateValueAnalysis, getAssetName, formatPrice, formatPercentage } from '../services/analysis';
import type { AssetData } from '../types';

export async function getAssetData(symbol: string): Promise<AssetData | null> {
  const [stocks, metals, polyData] = await Promise.all([
    fetchStockPrices(),
    fetchGoldSilverPrices(),
    fetchPolymarketData()
  ]);

  const poly = polyData.get(symbol);
  if (!poly) return null;

  let realPrice = 0;
  let previousClose = 0;
  let changePerc = 0;

  if (symbol === 'GC' || symbol === 'SI') {
    const metal = metals.get(symbol);
    if (!metal) return null;
    realPrice = metal.currentPrice;
    previousClose = metal.previousClose;
    changePerc = metal.changePerc;
  } else {
    const stock = stocks.get(symbol);
    if (!stock) return null;
    realPrice = stock.currentPrice;
    previousClose = stock.previousClose;
    changePerc = stock.todaysChangePerc;
  }

  const history = getHistoryForDashboard(symbol);
  
  // Remove duplicates - keep only one entry per minute
  const uniqueHistory = history.reduce((acc, curr) => {
    const time = new Date(curr.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const existing = acc.find(h => h.time === time);
    if (!existing) {
      const price = previousClose * (1 + curr.changePerc / 100);
      acc.push({
        time,
        changePerc: curr.changePerc,
        price: price
      });
    }
    return acc;
  }, [] as Array<{ time: string; changePerc: number; price: number }>);
  
  const priceHistory = uniqueHistory;

  return {
    symbol,
    name: getAssetName(symbol),
    realPrice,
    previousClose,
    changePerc,
    polyYesPrice: poly.yesPrice,
    polyNoPrice: poly.noPrice,
    marketLink: poly.marketLink,
    priceHistory
  };
}

export function formatDashboard(data: AssetData): string {
  const analysis = calculateValueAnalysis(data.changePerc, data.polyYesPrice, data.polyNoPrice);
  const arrow = data.changePerc >= 0 ? '⬆️' : '⬇️';
  const changeAmount = data.realPrice - data.previousClose;
  
  let message = `🟡 ${data.name} (${data.symbol})\n`;
  message += `━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `📈 REAL PRICE\n`;
  message += `Current: $${formatPrice(data.realPrice)}\n`;
  message += `Previous Close: $${formatPrice(data.previousClose)}\n`;
  message += `Change: $${formatPrice(changeAmount)} (${formatPercentage(data.changePerc)} ${arrow})\n\n`;
  
  message += `📊 POLYMARKET BET PRICES\n`;
  message += `YES (UP): ${formatPrice(data.polyYesPrice * 100)}¢ (${formatPrice(analysis.yesActual)}%)\n`;
  message += `NO (DOWN): ${formatPrice(data.polyNoPrice * 100)}¢ (${formatPrice(analysis.noActual)}%)\n`;
  message += `🔗 Market: ${data.marketLink}\n\n`;
  
  message += `💡 VALUE ANALYSIS\n`;
  message += `YES: Expected ~${formatPrice(analysis.yesExpected)}% | Actual ${formatPrice(analysis.yesActual)}%\n`;
  message += `Gap: ${formatPercentage(analysis.yesGap)} | ${analysis.yesStatus === 'UNDERPRICED' ? '⚡ UNDERPRICED' : analysis.yesStatus === 'PRICED_IN' ? '⚠️ PRICED IN' : '⚖️ FAIR'}\n\n`;
  
  message += `NO: Expected ~${formatPrice(analysis.noExpected)}% | Actual ${formatPrice(analysis.noActual)}%\n`;
  message += `Gap: ${formatPercentage(analysis.noGap)} | ${analysis.noStatus === 'UNDERPRICED' ? '⚡ UNDERPRICED' : analysis.noStatus === 'PRICED_IN' ? '⚠️ PRICED IN' : '⚖️ FAIR'}\n\n`;
  
  if (data.priceHistory.length > 0) {
    message += `🕐 PRICE HISTORY (Last 30 min)\n`;
    data.priceHistory.forEach(h => {
      const price = h.changePerc >= 0 
        ? `$${formatPrice(data.previousClose * (1 + h.changePerc / 100))}`
        : `$${formatPrice(data.previousClose * (1 + h.changePerc / 100))}`;
      message += `${h.time}: ${price} (${formatPercentage(h.changePerc)})\n`;
    });
    message += `\n`;
  }
  
  message += `🎯 SIGNAL STRENGTH\n`;
  const duration = Math.floor(data.priceHistory.length * 5);
  message += `Duration: ${duration} minutes\n`;
  message += `Confidence: ${Math.abs(data.changePerc) >= 1.5 ? 'HIGH' : Math.abs(data.changePerc) >= 0.75 ? 'MEDIUM' : 'LOW'}\n`;
  message += `Momentum: ${data.changePerc >= 0 ? 'STRENGTHENING' : 'WEAKENING'}\n\n`;
  
  message += `💰 IF YOU BET NOW\n`;
  const yesBet = 100;
  const yesWin = (yesBet / data.polyYesPrice).toFixed(2);
  const yesProfit = (parseFloat(yesWin) - yesBet).toFixed(2);
  
  const noBet = 100;
  const noWin = (noBet / data.polyNoPrice).toFixed(2);
  const noProfit = (parseFloat(noWin) - noBet).toFixed(2);
  
  message += `$100 on YES (${formatPrice(data.polyYesPrice * 100)}¢) → Win $${yesWin} if UP (+$${yesProfit})\n`;
  message += `$100 on NO (${formatPrice(data.polyNoPrice * 100)}¢) → Win $${noWin} if DOWN (+$${noProfit})\n\n`;
  
  message += `🎯 RECOMMENDATION: ${analysis.recommendation}`;
  
  return message;
}

export function getDashboardKeyboard(symbol: string, marketLink: string): InlineKeyboard {
  const isMetalOrGold = symbol === 'GC' || symbol === 'SI';
  
  return new InlineKeyboard()
    .url('📊 Place Bet', marketLink)
    .row()
    .text('🔄 Refresh', `asset_${symbol}`)
    .text('⬅️ Back', isMetalOrGold ? 'menu_main' : 'menu_stocks');
}
