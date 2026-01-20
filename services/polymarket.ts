import type { PolymarketData } from '../types';

const TARGET_TICKERS = ["TSLA", "AMZN", "GC", "AAPL", "GOOGL", "NFLX", "PLTR", "NVDA", "SI", "META", "MSFT"];

export async function fetchPolymarketData(): Promise<Map<string, PolymarketData>> {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const currentDate = new Date().toISOString();
  const url = `https://gamma-api.polymarket.com/events/pagination?tag_id=102281&limit=100&archived=false&order=volume24hr&ascending=false&offset=0&active=true&closed=false&end_date_min=${encodeURIComponent(currentDate)}&exclude_tag_id=21`;
  
  try {
    const response = await fetch(url);
    const data = await response.json() as { data: Array<{ markets: any[] }> };
    
    const result = new Map<string, PolymarketData>();
    
    data.data?.forEach(event => {
      event.markets?.forEach((market: any) => {
        if (!market.question?.includes(today) || !market.question?.includes("Up or Down")) return;
        
        const ticker = TARGET_TICKERS.find(t => market.question.includes(`(${t})`));
        if (!ticker) return;
        
        const outcomePrices = JSON.parse(market.outcomePrices || '[]').map((p: string) => parseFloat(p));
        const clobTokenIds = JSON.parse(market.clobTokenIds || '[]');
        
        result.set(ticker, {
          symbol: ticker,
          question: market.question,
          yesPrice: outcomePrices[0] || 0,
          noPrice: outcomePrices[1] || 0,
          volume: parseFloat(market.volume || market.volume24hr || 0),
          liquidity: parseFloat(market.liquidity || 0),
          marketLink: `https://polymarket.com/market/${market.slug || market.id}`,
          clobTokenIdYes: clobTokenIds[0] || '',
          clobTokenIdNo: clobTokenIds[1] || ''
        });
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    return new Map();
  }
}
