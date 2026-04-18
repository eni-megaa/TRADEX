import { useState } from 'react';
import { Users, TrendingUp, Trophy, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const TOP_TRADERS = [
  { id: '1', handle: '@CryptoKing', winRate: 84.5, roi: 450.2, aum: '$1.2M', followers: '15.4K', avatar: 'bg-orange-500' },
  { id: '2', handle: '@ForexSniper', winRate: 92.1, roi: 310.8, aum: '$850K', followers: '8.2K', avatar: 'bg-emerald-500' },
  { id: '3', handle: '@AlphaQuant', winRate: 78.4, roi: 215.4, aum: '$2.4M', followers: '22.1K', avatar: 'bg-accent-cyan' },
  { id: '4', handle: '@SafeHaven', winRate: 96.0, roi: 85.5, aum: '$5.1M', followers: '45.0K', avatar: 'bg-accent' },
  { id: '5', handle: '@MacroPlays', winRate: 65.8, roi: 154.2, aum: '$400K', followers: '3.1K', avatar: 'bg-pink-500' },
  { id: '6', handle: '@AlgoTradeX', winRate: 88.2, roi: 620.1, aum: '$900K', followers: '12.8K', avatar: 'bg-accent-cyan' }
];

export const CopyTradingPage = () => {
  const [copiedTrader, setCopiedTrader] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    if (copiedTrader === id) setCopiedTrader(null);
    else setCopiedTrader(id);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 shrink-0">
        <div>
          <div className="inline-block px-3 py-1 bg-[#FFDE21] text-black text-[9px] font-black tracking-widest uppercase rounded-md mb-3 shadow-[0_0_15px_rgba(255,222,33,0.3)]">
            TRADEX SOCIAL
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-white">Copy Trading</h1>
          <p className="text-sm font-medium text-gray-500">Mirror the strategies of top-performing professionals automatically.</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="border rounded-2xl px-6 py-4 flex flex-col min-w-[140px] bg-bg-card border-white/5 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest mb-2 text-gray-500">COPIED CAPITAL</span>
            <span className="text-2xl font-black text-white">$0.00</span>
          </div>
          <div className="border rounded-2xl px-6 py-4 flex flex-col min-w-[140px] bg-bg-card border-white/5 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest mb-2 text-gray-500">TOTAL ROI</span>
            <span className="text-2xl font-black text-gray-500">--</span>
          </div>
        </div>
      </div>

      <div className="space-y-8 pb-12">
        {/* Featured / How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 lg:grid">
          <div className="border border-white/5 p-6 rounded-3xl flex items-center space-x-5 hover:border-white/10 transition-colors bg-bg-card shadow-sm">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent"><Users className="w-6 h-6" /></div>
            <div><h4 className="font-black text-lg text-white">Choose a Pro</h4><p className="text-xs mt-1 font-medium text-gray-500">Filter by ROI & Risk.</p></div>
          </div>
           <div className="border border-white/5 p-6 rounded-3xl flex items-center space-x-5 hover:border-white/10 transition-colors bg-bg-card shadow-sm">
            <div className="w-12 h-12 bg-accent-cyan/10 rounded-2xl flex items-center justify-center text-accent-cyan"><Activity className="w-6 h-6" /></div>
            <div><h4 className="font-black text-lg text-white">Allocate Funds</h4><p className="text-xs mt-1 font-medium text-gray-500">Set your stop losses.</p></div>
          </div>
           <div className="border border-white/5 p-6 rounded-3xl flex items-center space-x-5 hover:border-white/10 transition-colors bg-bg-card shadow-sm">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500"><Trophy className="w-6 h-6" /></div>
            <div><h4 className="font-black text-lg text-white">Automate Profit</h4><p className="text-xs mt-1 font-medium text-gray-500">Trades mirror instantly.</p></div>
          </div>
        </div>

        {/* Leaderboard Table Grid */}
        <div className="border border-white/5 bg-navy rounded-3xl overflow-hidden shadow-xl flex flex-col shrink-0 min-h-0">
          <div className="p-5 border-b border-white/5 shrink-0 flex items-center justify-between">
             <h2 className="text-base font-black tracking-wide text-white">Verified Leaderboard</h2>
             <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors flex items-center">
               View All Time <ArrowRight className="w-3.5 h-3.5 ml-1" />
             </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {TOP_TRADERS.map((trader) => {
                const isCopied = copiedTrader === trader.id;

                return (
                  <div key={trader.id} className="border border-white/5 bg-bg-card p-6 rounded-3xl transition-all group flex flex-col hover:border-white/20 hover:shadow-lg">
                    
                    {/* Trader Info */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-2xl ${trader.avatar} bg-opacity-90 flex items-center justify-center border border-white/10 shadow-xl`}>
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black flex items-center leading-none text-white">
                            {trader.handle}
                            <div className="w-4 h-4 ml-2 bg-[#FFDE21]/20 rounded-full flex items-center justify-center">
                              <ShieldCheck className="w-2.5 h-2.5 text-[#FFDE21]" />
                            </div>
                          </h3>
                          <p className="text-[11px] font-bold tracking-widest uppercase mt-2 text-gray-500">
                            {trader.followers} COPIERS
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopy(trader.id)}
                        className={`px-6 py-2.5 rounded-lg font-black tracking-widest text-[11px] transition-all uppercase shadow-[0_0_15px_rgba(255,222,33,0.2)] ${
                          isCopied 
                          ? 'bg-white/5 border border-white/10 text-white cursor-default'
                          : 'bg-[#FFDE21] hover:bg-[#FFDE21]/90 text-black hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                      >
                        {isCopied ? 'COPIED' : 'COPY'}
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-6 mt-auto">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">RETURN</span>
                        <p className="text-lg font-black text-[#4ADE80] mt-3 flex items-center tracking-tight">
                          <TrendingUp className="w-4 h-4 mr-1.5" />
                          +{trader.roi}%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">WIN RATE</span>
                        <p className="text-lg font-black mt-3 tracking-tight text-white">
                          {trader.winRate}%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">AUM</span>
                        <p className="text-lg font-black mt-3 tracking-tight text-white">
                          {trader.aum}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

