const getCurrentDateISO = (): string => {
  const now = new Date();
  return now.toISOString();
};

const getFormattedDates = (): { today: string; tomorrow: string } => {
  const now = new Date();
  const today: string = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr: string = tomorrow.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  
  return { today, tomorrow: tomorrowStr };
};

const TARGET_TICKERS = ["TSLA", "AMZN", "GC", "AAPL", "GOOGL", "NFLX", "PLTR", "NVDA", "SI", "META", "MSFT"];

const parseClobTokenIds = (field: any): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return [];
};

const parseOutcomePrices = (field: any): number[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return parsed.map((p: string) => parseFloat(p));
    } catch {
      return [];
    }
  }
  return [];
};

const fetchMarkets = async () => {
  const currentDate = getCurrentDateISO();
  const encodedDate = encodeURIComponent(currentDate);
  const { today, tomorrow } = getFormattedDates();
  
  const url = `https://gamma-api.polymarket.com/events/pagination?tag_id=102281&limit=100&archived=false&order=volume24hr&ascending=false&offset=0&active=true&closed=false&end_date_min=${encodedDate}&exclude_tag_id=21`;
  
  console.log(`Fetching markets...\n`);
  
  const response = await fetch(url);
  const data = await response.json() as { data: Array<{ markets: any[] }> };
  
  const allMarkets: any[] = [];
  
  if (data.data && data.data.length > 0) {
    data.data.forEach((event) => {
      if (event.markets && event.markets.length > 0) {
        event.markets.forEach((market: any) => {
          allMarkets.push(market);
        });
      }
    });
  }
  
  const isTargetMarket = (question: string): boolean => {
    return TARGET_TICKERS.some(ticker => 
      question.includes(`(${ticker})`) && question.includes("Up or Down")
    );
  };
  
  const formatVolume = (volume: any): string => {
    if (!volume) return "N/A";
    const vol = typeof volume === "string" ? parseFloat(volume) : volume;
    if (isNaN(vol)) return "N/A";
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };
  
  const formatPrice = (price: any): string => {
    if (!price) return "N/A";
    const p = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(p)) return "N/A";
    return `$${(p * 100).toFixed(2)}`;
  };
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "N/A";
    }
  };
  
  const printMarketDetails = (market: any) => {
    const clobTokenIds = parseClobTokenIds(market.clobTokenIds);
    const outcomePrices = parseOutcomePrices(market.outcomePrices);
    const yesPrice = outcomePrices.length > 0 ? outcomePrices[0] : null;
    const noPrice = outcomePrices.length > 1 ? outcomePrices[1] : null;
    
    const marketLink = `https://polymarket.com/market/${market.slug || market.id}`;
    
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`📊 ${market.question}`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`🔗 Link:       ${marketLink}`);
    console.log(`💰 Yes Price:  ${formatPrice(yesPrice)}`);
    console.log(`💰 No Price:   ${formatPrice(noPrice)}`);
    console.log(`📈 Volume:     ${formatVolume(market.volume || market.volume24hr)}`);
    console.log(`💧 Liquidity:  ${formatVolume(market.liquidity)}`);
    console.log(`🔒 ClobToken 1: ${clobTokenIds[0] || "N/A"}`);
    console.log(`🔒 ClobToken 2: ${clobTokenIds[1] || "N/A"}`);
    console.log(`📅 End Date:   ${formatDate(market.endDate)}`);
    console.log(`📛 Status:     ${market.active ? "Active" : market.closed ? "Closed" : "Unknown"}`);
    console.log(`🆔 Market ID:  ${market.id || "N/A"}`);
    console.log();
  };
  
  console.log(`=== ${today} Markets ===\n`);
  
  const todayMarkets = allMarkets
    .filter(m => m.question?.includes(today) && isTargetMarket(m.question))
    .sort((a, b) => {
      const aIdx = TARGET_TICKERS.findIndex(t => a.question?.includes(`(${t})`));
      const bIdx = TARGET_TICKERS.findIndex(t => b.question?.includes(`(${t})`));
      return aIdx - bIdx;
    });
  
  todayMarkets.forEach(m => printMarketDetails(m));
  
  console.log(`\n=== ${tomorrow} Markets ===\n`);
  
  const tomorrowMarkets = allMarkets
    .filter(m => m.question?.includes(tomorrow) && isTargetMarket(m.question))
    .sort((a, b) => {
      const aIdx = TARGET_TICKERS.findIndex(t => a.question?.includes(`(${t})`));
      const bIdx = TARGET_TICKERS.findIndex(t => b.question?.includes(`(${t})`));
      return aIdx - bIdx;
    });
  
  tomorrowMarkets.forEach(m => printMarketDetails(m));
};

fetchMarkets().catch(console.error);
