import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TickerTapeWidget } from './TickerTapeWidget';

type MarketType = 'forex' | 'crypto' | 'stocks' | 'commodities';

const marketData = {
  forex: [
    { symbol: 'EUR/USD', price: '1.0845', change: 0.15 },
    { symbol: 'GBP/USD', price: '1.2630', change: -0.08 },
    { symbol: 'USD/JPY', price: '149.80', change: 0.45 },
    { symbol: 'AUD/USD', price: '0.6520', change: -0.22 },
  ],
  crypto: [
    { symbol: 'BTC/USD', price: '64,230.00', change: 2.50 },
    { symbol: 'ETH/USD', price: '3,450.20', change: 1.80 },
    { symbol: 'SOL/USD', price: '145.60', change: -1.20 },
    { symbol: 'XRP/USD', price: '0.58', change: 0.05 },
  ],
  stocks: [
    { symbol: 'AAPL', price: '173.50', change: 1.20 },
    { symbol: 'MSFT', price: '410.30', change: -0.40 },
    { symbol: 'TSLA', price: '190.20', change: 3.10 },
    { symbol: 'NVDA', price: '850.10', change: 4.50 },
  ],
  commodities: [
    { symbol: 'XAU/USD', price: '2,150.30', change: 0.85 },
    { symbol: 'XAG/USD', price: '24.50', change: -0.15 },
    { symbol: 'WTI Oil', price: '82.40', change: 1.10 },
    { symbol: 'Brent', price: '86.20', change: 0.90 },
  ],
};

export const MarketsSection = () => {
  const [activeTab, setActiveTab] = useState<MarketType>('forex');
  const tabs: { id: MarketType; label: string }[] = [
    { id: 'forex', label: 'Forex' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'commodities', label: 'Commodities' },
  ];

  return (
    <section id="markets" className="py-14 bg-navy-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Explore the Markets
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Access 1000+ global markets and trade the world's most popular assets with ultra-low spreads.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-base md:text-lg font-semibold transition-all border-b-2 ${activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ticker Tape */}
        <div className="mb-12 w-full mx-auto overflow-hidden relative z-10 pt-2">
          <TickerTapeWidget />
        </div>

        {/* Market Data Grid */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 pb-6 pt-2 px-2 -mx-2 snap-x snap-mandatory [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
          {marketData[activeTab].map((item, index) => (
            <motion.div
              key={`${activeTab}-${item.symbol}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-navy-light p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group flex-shrink-0 w-[80vw] sm:w-[45vw] lg:w-auto snap-center"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">{item.symbol}</span>
                <div className={`flex items-center space-x-1 text-sm font-bold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(item.change)}%</span>
                </div>
              </div>
              <div className="text-3xl font-mono font-bold font-light group-hover:text-accent transition-colors">
                {item.price}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button at the bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-[#FFDE21] text-[#FFDE21] hover:bg-[#FFDE21] hover:text-black font-semibold transition-all duration-300"
          >
            View Live Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
