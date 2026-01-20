export interface PolymarketData {
  symbol: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  marketLink: string;
  clobTokenIdYes: string;
  clobTokenIdNo: string;
}

export interface StockPrice {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  todaysChangePerc: number;
  timestamp: number;
}

export interface GoldSilverPrice {
  metal: 'GOLD' | 'SILVER';
  currentPrice: number;
  previousClose: number;
  changePerc: number;
  timestamp: number;
}

export interface PriceSnapshot {
  symbol: string;
  changePerc: number;
  currentPrice: number;
  polyYesPrice: number;
  polyNoPrice: number;
  clobTokenIdYes?: string;
  clobTokenIdNo?: string;
  timestamp: number;
}

export interface Alert {
  id?: number;
  symbol: string;
  changePerc: number;
  realPrice: number;
  polyYesPrice: number;
  polyNoPrice: number;
  clobTokenIdYes?: string;
  clobTokenIdNo?: string;
  analysis: 'UNDERPRICED' | 'PRICED_IN';
  sentAt: number;
}

export interface AssetData {
  symbol: string;
  name: string;
  realPrice: number;
  previousClose: number;
  changePerc: number;
  polyYesPrice: number;
  polyNoPrice: number;
  marketLink: string;
  priceHistory: Array<{ time: string; changePerc: number; price: number }>;
}
