import type { Asset } from '../store/tradingStore';
import { LOCAL_ASSETS } from './localAssets';

export const searchTradingViewAssets = async (query: string): Promise<Asset[]> => {
  if (!query) return [];
  
  const q = query.toLowerCase();
  // Filter local assets securely and fast
  const results = LOCAL_ASSETS.filter(a => 
    a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
  );

  return results.slice(0, 50).map(item => ({
    symbol: item.symbol,
    name: item.name,
    type: item.type,
    basePrice: 0, // Will be hydrated by live polling immediately
    logoid: item.logoid,
    tvExchange: item.tvExchange
  }));
};

export const getTradingViewIconUrl = (logoid?: string) => {
  if (!logoid) return null;
  return `https://s3-symbol-logo.tradingview.com/${logoid}.svg`;
}

// Fetch authentic real-time close price and change data hitting TradingView scanner instantly
export const fetchLivePrices = async (symbols: string[]): Promise<Record<string, { price: number, change: number }>> => {
  if (!symbols || symbols.length === 0) return {};

  try {
    const localMap = LOCAL_ASSETS.filter(a => symbols.includes(a.symbol));
    const tickers = localMap.map(a => a.tvExchange);
    
    // Batch lookup all required symbols via proxied endpoint to avoid CORS
    const response = await fetch('/api/tv-scanner/global/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: { tickers },
        columns: ['close', 'change']
      })
    });

    if (!response.ok) return {};

    const data = await response.json();
    const priceDataMap: Record<string, { price: number, change: number }> = {};

    data.data.forEach((item: any) => {
      // Find which symbol matches this tvExchange
      const match = localMap.find(a => a.tvExchange === item.s);
      if (match && item.d[0] !== undefined) {
        priceDataMap[match.symbol] = {
          price: item.d[0],
          change: item.d[1] || 0
        };
      }
    });

    return priceDataMap;
  } catch (error) {
    console.error('Error fetching live prices:', error);
    return {};
  }
};
