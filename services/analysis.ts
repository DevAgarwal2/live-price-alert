export function calculateValueAnalysis(realChangePerc: number, polyYesPrice: number, polyNoPrice: number): {
  yesExpected: number;
  noExpected: number;
  yesActual: number;
  noActual: number;
  yesGap: number;
  noGap: number;
  yesStatus: 'UNDERPRICED' | 'PRICED_IN' | 'FAIRLY_PRICED';
  noStatus: 'UNDERPRICED' | 'PRICED_IN' | 'FAIRLY_PRICED';
  recommendation: string;
} {
  const absChange = Math.abs(realChangePerc);
  
  // Expected price calculation: 50% + (price change * 10)
  const expectedYes = 50 + (absChange * 10);
  const expectedNo = 100 - expectedYes;
  
  const actualYes = polyYesPrice * 100;
  const actualNo = polyNoPrice * 100;
  
  const yesGap = actualYes - expectedYes;
  const noGap = actualNo - expectedNo;
  
  // Determine YES status
  let yesStatus: 'UNDERPRICED' | 'PRICED_IN' | 'FAIRLY_PRICED';
  if (yesGap < -8) {
    yesStatus = 'UNDERPRICED';
  } else if (yesGap > 8) {
    yesStatus = 'PRICED_IN';
  } else {
    yesStatus = 'FAIRLY_PRICED';
  }
  
  // Determine NO status
  let noStatus: 'UNDERPRICED' | 'PRICED_IN' | 'FAIRLY_PRICED';
  if (noGap < -8) {
    noStatus = 'UNDERPRICED';
  } else if (noGap > 8) {
    noStatus = 'PRICED_IN';
  } else {
    noStatus = 'FAIRLY_PRICED';
  }
  
  // Generate recommendation
  let recommendation = '';
  if (yesStatus === 'UNDERPRICED') {
    recommendation = '⚡ BET YES - Underpriced opportunity';
  } else if (noStatus === 'UNDERPRICED') {
    recommendation = '⚡ BET NO - Underpriced opportunity';
  } else if (yesStatus === 'FAIRLY_PRICED' && noStatus === 'FAIRLY_PRICED') {
    recommendation = '⚖️ FAIRLY PRICED - Follow momentum';
  } else {
    recommendation = '⚠️ ALREADY PRICED IN - Low value';
  }
  
  return {
    yesExpected: expectedYes,
    noExpected: expectedNo,
    yesActual: actualYes,
    noActual: actualNo,
    yesGap,
    noGap,
    yesStatus,
    noStatus,
    recommendation
  };
}

export function formatPrice(price: number, decimals: number = 2): string {
  return price.toFixed(decimals);
}

export function formatPercentage(perc: number): string {
  const sign = perc >= 0 ? '+' : '';
  return `${sign}${perc.toFixed(2)}%`;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

export function getAssetName(symbol: string): string {
  const names: Record<string, string> = {
    'AAPL': 'Apple',
    'GOOGL': 'Google',
    'NFLX': 'Netflix',
    'MSFT': 'Microsoft',
    'AMZN': 'Amazon',
    'PLTR': 'Palantir',
    'NVDA': 'NVIDIA',
    'META': 'Meta',
    'TSLA': 'Tesla',
    'GC': 'Gold',
    'SI': 'Silver'
  };
  return names[symbol] || symbol;
}
