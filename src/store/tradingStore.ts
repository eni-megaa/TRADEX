import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type AssetClass = 'Crypto' | 'Forex' | 'Stock' | 'Index' | 'Commodity';

export interface Asset {
  id?: string;
  symbol: string;
  name: string;
  type: AssetClass;
  basePrice: number;
  base_price?: number;
  is_enabled?: boolean;
  logoid?: string;
  tvExchange?: string;
}

import { searchTradingViewAssets, fetchLivePrices } from '../lib/tradingView';
import { LOCAL_ASSETS } from '../lib/localAssets';

export const DEFAULT_ASSET: Asset = { 
  symbol: 'BTCUSDT', 
  name: 'Bitcoin', 
  type: 'Crypto', 
  basePrice: 0,
  logoid: 'crypto/BTC',
  tvExchange: 'BINANCE:BTCUSDT'
};

export interface TradeOrder {
  id: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  type: 'Market' | 'Limit';
  price: number;
  lotSize: number;
  status: 'Open' | 'Closed' | 'Pending';
  timestamp: string;
  pnl?: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface TradingState {
  selectedAsset: Asset;
  setSelectedAsset: (asset: Asset) => void;
  
  livePrices: Record<string, number>;
  livePriceChanges: Record<string, number>;
  
  recentInteractions: Asset[];
  addInteraction: (asset: Asset) => void;
  
  openTrades: TradeOrder[];
  balance: number;
  watchlist: Asset[];
  assets: Asset[];
  searchResults: Asset[];
  
  searchAssets: (query: string) => Promise<void>;
  
  fetchTrades: (userId: string) => Promise<void>;
  fetchBalance: (userId: string) => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchWatchlist: (userId: string) => Promise<void>;
  addTrade: (userId: string, trade: Omit<TradeOrder, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  closeTrade: (tradeId: string, currentPrice: number) => Promise<void>;
  addToWatchlist: (userId: string, asset: Asset) => Promise<void>;
  removeFromWatchlist: (userId: string, symbol: string) => Promise<void>;
  
  initRealtimePrices: () => void;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  selectedAsset: DEFAULT_ASSET,
  balance: 0,
  watchlist: [],
  assets: [],
  searchResults: [],

  searchAssets: async (query: string) => {
    if (!query) {
      set({ searchResults: LOCAL_ASSETS.slice(0, 20).map(a => ({ ...a, basePrice: 0 })) as Asset[] }); 
      return;
    }
    const results = await searchTradingViewAssets(query);
    set({ searchResults: results });
  },
  
  setSelectedAsset: (asset) => set((state) => {
    const filtered = state.recentInteractions.filter(a => a.symbol !== asset.symbol);
    return {
      selectedAsset: asset,
      recentInteractions: [asset, ...filtered].slice(0, 5)
    };
  }),
  
  livePrices: {},
  livePriceChanges: {},
  
  recentInteractions: [DEFAULT_ASSET],
  
  addInteraction: (asset) => set((state) => {
    const filtered = state.recentInteractions.filter(a => a.symbol !== asset.symbol);
    return { recentInteractions: [asset, ...filtered].slice(0, 5) };
  }),
  
  openTrades: [],
  
  fetchTrades: async (userId: string) => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['open', 'pending']);
      
    if (data) {
      const mapped: TradeOrder[] = data.map(t => ({
        id: t.id,
        symbol: t.symbol,
        side: (t.side === 'buy' ? 'Buy' : 'Sell') as "Buy" | "Sell",
        type: (t.order_type === 'market' ? 'Market' : 'Limit') as "Market" | "Limit",
        price: Number(t.entry_price),
        lotSize: Number(t.lot_size),
        status: t.status === 'open' ? 'Open' : t.status === 'pending' ? 'Pending' : 'Closed',
        timestamp: t.opened_at || t.created_at,
        pnl: Number(t.pnl),
        stopLoss: t.stop_loss ? Number(t.stop_loss) : undefined,
        takeProfit: t.take_profit ? Number(t.take_profit) : undefined
      }));

      set({ openTrades: mapped });
    }
  },

  fetchBalance: async (userId: string) => {
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
    if (data) set({ balance: Number(data.balance) });
  },

  fetchAssets: async () => {
    const assets = LOCAL_ASSETS.map(a => ({ ...a, basePrice: 0 })) as Asset[];
    set({ assets, searchResults: assets.slice(0, 20) });
  },

  fetchWatchlist: async (userId: string) => {
    const { data } = await supabase
      .from('watchlists')
      .select('symbol')
      .eq('user_id', userId);
      
    if (data) {
      const symbols = data.map(d => d.symbol);
      const matchedAssets = LOCAL_ASSETS
        .filter(a => symbols.includes(a.symbol))
        .map(a => ({ ...a, basePrice: 0 })) as Asset[];
      set({ watchlist: matchedAssets });
    }
  },

  addToWatchlist: async (userId: string, asset: Asset) => {
    if (get().watchlist.some(a => a.symbol === asset.symbol)) return;
    
    const { error } = await supabase
      .from('watchlists')
      .insert([{ user_id: userId, symbol: asset.symbol, asset_type: asset.type }]);
      
    if (!error) {
      set(state => ({ watchlist: [...state.watchlist, asset] }));
    }
  },

  removeFromWatchlist: async (userId: string, symbol: string) => {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);
      
    if (!error) {
      set(state => ({ watchlist: state.watchlist.filter(a => a.symbol !== symbol) }));
    }
  },

  addTrade: async (userId, tradeData) => {
    // If order type is Limit, status is pending, else open
    const status = tradeData.type === 'Limit' ? 'pending' : 'open';
    const { data, error } = await supabase
      .from('trades')
      .insert([{
        user_id: userId,
        asset: tradeData.symbol,
        side: tradeData.side.toLowerCase(),
        order_type: tradeData.type.toLowerCase(),
        entry_price: tradeData.price,
        current_price: tradeData.price,
        lot_size: tradeData.lotSize,
        stop_loss: (tradeData as any).stopLoss || null,
        take_profit: (tradeData as any).takeProfit || null,
        status: status
      }])
      .select()
      .single();
      
    if (!error && data) {
      const newTrade: TradeOrder = {
        id: data.id,
        symbol: data.asset,
        side: data.side === 'buy' ? 'Buy' : 'Sell',
        // default back appropriately
        type: data.order_type === 'limit' ? 'Limit' : 'Market',
        price: Number(data.entry_price),
        lotSize: Number(data.lot_size),
        status: status === 'open' ? 'Open' : 'Pending',
        timestamp: data.opened_at || data.created_at,
        pnl: 0,
        stopLoss: data.stop_loss ? Number(data.stop_loss) : undefined,
        takeProfit: data.take_profit ? Number(data.take_profit) : undefined
      };
      set(state => ({ openTrades: [newTrade, ...state.openTrades] }));
    }
  },

  closeTrade: async (tradeId, currentPrice) => {
    const trade = get().openTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const pnl = trade.side === 'Buy' 
      ? (currentPrice - trade.price) * trade.lotSize * 100 // Scale for lot size
      : (trade.price - currentPrice) * trade.lotSize * 100;

    const { error } = await supabase
      .from('trades')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        pnl: pnl,
        current_price: currentPrice
      })
      .eq('id', tradeId);

    if (!error) {
      set(state => ({
        openTrades: state.openTrades.filter(t => t.id !== tradeId),
        balance: state.balance + pnl
      }));
      
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        await supabase
          .from('wallets')
          .update({ balance: get().balance + pnl })
          .eq('user_id', authData.user.id);
      }
    }
  },

  initRealtimePrices: () => {
    if ((window as any).__priceScanner) return;
    
    get().fetchAssets(); // Ensure assets load immediately

    // Fetch live prices immediately and then every 4 seconds
    const updatePrices = async () => {
      const allSymbols = LOCAL_ASSETS.map(a => a.symbol);
      const freshPrices = await fetchLivePrices(allSymbols);
      
      if (Object.keys(freshPrices).length > 0) {
        set((state) => {
          // Merge old prices with new prices (so we don't zero out elements that temporarily failed)
          const livePrices = { ...state.livePrices };
          const livePriceChanges = { ...state.livePriceChanges };
          Object.entries(freshPrices).forEach(([symbol, data]) => {
            livePrices[symbol] = data.price;
            livePriceChanges[symbol] = data.change;
          });
          
          const updatedTrades = state.openTrades.map(trade => {
            const currentPrice = livePrices[trade.symbol];
            if (!currentPrice) return trade;
            
            const pnl = trade.side === 'Buy' 
              ? (currentPrice - trade.price) * trade.lotSize * 100
              : (trade.price - currentPrice) * trade.lotSize * 100;
              
            return { ...trade, pnl };
          });

          return { livePrices, livePriceChanges, openTrades: updatedTrades };
        });
      }
    };

    updatePrices(); // Fire once immediately
    (window as any).__priceScanner = setInterval(updatePrices, 4000); // Poll every 4s
  }
}));

