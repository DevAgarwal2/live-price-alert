import { saveSnapshot, getSnapshotsForAlert, saveAlert, hasRecentAlert, getRecentAlerts, getLastDirectionForSymbol, saveDirection } from '../database';
import { fetchStockPrices, fetchGoldSilverPrices } from './realtime';
import { fetchPolymarketData } from './polymarket';
import { calculateValueAnalysis } from './analysis';
import type { PriceSnapshot, Alert } from '../types';

export async function checkAndRecordPrices(): Promise<void> {
  const [stocks, metals, polyData] = await Promise.all([
    fetchStockPrices(),
    fetchGoldSilverPrices(),
    fetchPolymarketData()
  ]);

  const timestamp = Date.now();

  // Process stocks
  for (const [symbol, stock] of stocks) {
    const poly = polyData.get(symbol);
    if (!poly) continue;

    const snapshot: PriceSnapshot = {
      symbol,
      changePerc: stock.todaysChangePerc,
      currentPrice: stock.currentPrice,
      polyYesPrice: poly.yesPrice,
      polyNoPrice: poly.noPrice,
      clobTokenIdYes: poly.clobTokenIdYes,
      clobTokenIdNo: poly.clobTokenIdNo,
      timestamp
    };

    saveSnapshot(snapshot);
  }

  // Process gold/silver
  for (const [symbol, metal] of metals) {
    const poly = polyData.get(symbol);
    if (!poly) continue;

    const snapshot: PriceSnapshot = {
      symbol,
      changePerc: metal.changePerc,
      currentPrice: metal.currentPrice,
      polyYesPrice: poly.yesPrice,
      polyNoPrice: poly.noPrice,
      clobTokenIdYes: poly.clobTokenIdYes,
      clobTokenIdNo: poly.clobTokenIdNo,
      timestamp
    };

    saveSnapshot(snapshot);
  }
}

export function checkForAlerts(): Alert[] {
  const symbols = ["AAPL", "GOOGL", "NFLX", "MSFT", "AMZN", "PLTR", "NVDA", "META", "TSLA", "GC", "SI"];
  const alerts: Alert[] = [];

  for (const symbol of symbols) {
    const snapshots = getSnapshotsForAlert(symbol);
    
    if (snapshots.length < 1) continue;

    const latest = snapshots[0];
    if (!latest) continue;

    // ═══════════════════════════════════════════════════════════
    // ALERT TYPE 1: DIRECTION CHANGE (UP vs DOWN from yesterday)
    // ═══════════════════════════════════════════════════════════
    const currentDirection = latest.changePerc >= 0 ? 'UP' : 'DOWN';
    const lastDirection = getLastDirectionForSymbol(symbol);
    
    // Alert on direction change OR first check of the day
    if (!lastDirection) {
      // First check today - send alert about current direction
      const analysis = calculateValueAnalysis(latest.changePerc, latest.polyYesPrice, latest.polyNoPrice);
      
      const directionAlert: Alert = {
        symbol,
        changePerc: latest.changePerc,
        realPrice: latest.currentPrice,
        polyYesPrice: latest.polyYesPrice,
        polyNoPrice: latest.polyNoPrice,
        clobTokenIdYes: latest.clobTokenIdYes || '',
        clobTokenIdNo: latest.clobTokenIdNo || '',
        analysis: analysis.yesStatus === 'UNDERPRICED' || analysis.noStatus === 'UNDERPRICED' ? 'UNDERPRICED' : 'PRICED_IN',
        sentAt: Date.now(),
        alertType: 'DIRECTION_CHANGE'
      };
      
      alerts.push(directionAlert);
      saveAlert(directionAlert);
      console.log(`[🔄 DIRECTION] ${symbol} opened ${currentDirection === 'UP' ? 'ABOVE' : 'BELOW'} yesterday's close: ${latest.changePerc.toFixed(2)}%`);
    } else if (lastDirection !== currentDirection) {
      // Direction changed during the day
      const analysis = calculateValueAnalysis(latest.changePerc, latest.polyYesPrice, latest.polyNoPrice);
      
      const directionAlert: Alert = {
        symbol,
        changePerc: latest.changePerc,
        realPrice: latest.currentPrice,
        polyYesPrice: latest.polyYesPrice,
        polyNoPrice: latest.polyNoPrice,
        clobTokenIdYes: latest.clobTokenIdYes || '',
        clobTokenIdNo: latest.clobTokenIdNo || '',
        analysis: analysis.yesStatus === 'UNDERPRICED' || analysis.noStatus === 'UNDERPRICED' ? 'UNDERPRICED' : 'PRICED_IN',
        sentAt: Date.now(),
        alertType: 'DIRECTION_CHANGE'
      };
      
      alerts.push(directionAlert);
      saveAlert(directionAlert);
      console.log(`[🔄 DIRECTION] ${symbol} crossed ${currentDirection === 'UP' ? 'ABOVE' : 'BELOW'} yesterday's close: ${latest.changePerc.toFixed(2)}%`);
    } else {
      // No direction change - just monitoring
      console.log(`[DEBUG] ${symbol}: Direction ${currentDirection} (${latest.changePerc >= 0 ? '+' : ''}${latest.changePerc.toFixed(2)}%) - no crossing`);
    }
    
    // Update direction tracking
    saveDirection(symbol, currentDirection);

    // ═══════════════════════════════════════════════════════════
    // ALERT TYPE 2: MOMENTUM (0.75%+ movement from last alert)
    // ═══════════════════════════════════════════════════════════
    
    // Check if movement is >= 0.75%
    if (Math.abs(latest.changePerc) < 0.75) continue;

    // Get all alerts for this symbol (ever sent)
    const allAlerts = getRecentAlerts.all(symbol, 0) as Alert[];
    
    if (allAlerts.length === 0) {
      // First alert ever for this symbol - send it!
      const analysis = calculateValueAnalysis(latest.changePerc, latest.polyYesPrice, latest.polyNoPrice);

      const alert: Alert = {
        symbol,
        changePerc: latest.changePerc,
        realPrice: latest.currentPrice,
        polyYesPrice: latest.polyYesPrice,
        polyNoPrice: latest.polyNoPrice,
        clobTokenIdYes: latest.clobTokenIdYes || '',
        clobTokenIdNo: latest.clobTokenIdNo || '',
        analysis: analysis.yesStatus === 'UNDERPRICED' || analysis.noStatus === 'UNDERPRICED' ? 'UNDERPRICED' : 'PRICED_IN',
        sentAt: Date.now(),
        alertType: 'MOMENTUM'
      };

      alerts.push(alert);
      try {
        saveAlert(alert);
        console.log(`[DEBUG] Saved first alert for ${symbol} at ${alert.changePerc.toFixed(2)}%`);
      } catch (error) {
        console.error(`[ERROR] Failed to save alert for ${symbol}:`, error);
      }
    } else {
      // Already sent alerts - only send if change is >= 0.75% from LAST alert
      const lastAlert = allAlerts[0];
      if (!lastAlert) continue; // Safety check
      
      // Round to 2 decimal places to avoid floating point precision issues
      const currentChangeRounded = Math.round(latest.changePerc * 100) / 100;
      const lastChangeRounded = Math.round(lastAlert.changePerc * 100) / 100;
      const changeSinceLastAlert = Math.round(Math.abs(currentChangeRounded - lastChangeRounded) * 100) / 100;
      
      console.log(`[DEBUG] ${symbol}: Current ${currentChangeRounded}% vs Last Alert ${lastChangeRounded}% = ${changeSinceLastAlert}% diff`);
      
      if (changeSinceLastAlert >= 0.75) {
        const analysis = calculateValueAnalysis(latest.changePerc, latest.polyYesPrice, latest.polyNoPrice);

        const alert: Alert = {
          symbol,
          changePerc: latest.changePerc,
          realPrice: latest.currentPrice,
          polyYesPrice: latest.polyYesPrice,
          polyNoPrice: latest.polyNoPrice,
          clobTokenIdYes: latest.clobTokenIdYes || '',
          clobTokenIdNo: latest.clobTokenIdNo || '',
          analysis: analysis.yesStatus === 'UNDERPRICED' || analysis.noStatus === 'UNDERPRICED' ? 'UNDERPRICED' : 'PRICED_IN',
          sentAt: Date.now(),
          alertType: 'MOMENTUM'
        };

        alerts.push(alert);
        try {
          saveAlert(alert);
          console.log(`[DEBUG] Saved follow-up alert for ${symbol}: ${lastAlert.changePerc.toFixed(2)}% -> ${alert.changePerc.toFixed(2)}% (diff: ${changeSinceLastAlert.toFixed(2)}%)`);
        } catch (error) {
          console.error(`[ERROR] Failed to save follow-up alert for ${symbol}:`, error);
        }
      }
    }
  }

  return alerts;
}
