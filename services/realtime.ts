import type { StockPrice, GoldSilverPrice } from '../types';

const STOCKS = ["AAPL", "GOOGL", "NFLX", "MSFT", "AMZN", "PLTR", "NVDA", "META", "TSLA"];

export async function fetchStockPrices(): Promise<Map<string, StockPrice>> {
  const result = new Map<string, StockPrice>();
  
  await Promise.all(STOCKS.map(async (symbol) => {
    try {
      const res = await fetch(`https://polymarket.com/api/equity/ticker-snapshot?symbol=${symbol}`);
      const data: any = await res.json();
      
      result.set(symbol, {
        symbol,
        currentPrice: data.currentPrice || data.fmv,
        previousClose: data.previousClose || data.currentPrice,
        todaysChangePerc: data.todaysChangePerc || 0,
        timestamp: data.timestamp || Date.now()
      });
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
    }
  }));
  
  return result;
}

export async function fetchGoldSilverPrices(): Promise<Map<string, GoldSilverPrice>> {
  const result = new Map<string, GoldSilverPrice>();
  
  try {
    const res = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
    const data: any = await res.json();
    const item = data.items?.[0];
    
    if (item) {
      result.set('GC', {
        metal: 'GOLD',
        currentPrice: item.xauPrice,
        previousClose: item.xauClose,
        changePerc: item.pcXau,
        timestamp: item.ts
      });
      
      result.set('SI', {
        metal: 'SILVER',
        currentPrice: item.xagPrice,
        previousClose: item.xagClose,
        changePerc: item.pcXag,
        timestamp: item.ts
      });
    }
  } catch (err) {
    console.error('Error fetching gold/silver:', err);
  }
  
  return result;
}
