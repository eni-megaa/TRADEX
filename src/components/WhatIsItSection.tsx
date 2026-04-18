import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export const WhatIsItSection = () => {
  return (
    <section className="py-10 bg-navy relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              What are <br />
              <span className="text-accent">Interactive Brokers?</span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              An interactive broker is your direct gateway to global financial markets. Unlike traditional brokers, modern interactive platforms provide millisecond-latency execution, deep liquidity pools, and institutional-grade trading tools designed for both beginners and professional traders.
            </p>

            <p className="text-gray-400 text-lg leading-relaxed">
              We empower you to take complete control of your financial future with transparent pricing, robust security, and an ecosystem built for seamless, high-performance trading.
            </p>

            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 w-max mt-4 group"
            >
              <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/50 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-navy transition-all duration-300 shadow-[0_0_20px_rgba(var(--accent),0.3)] group-hover:shadow-[0_0_30px_rgba(var(--accent),0.6)]">
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              </div>
              <span className="text-white font-medium text-lg tracking-wide group-hover:text-accent transition-colors">
                Watch Video
              </span>
            </motion.a>
          </motion.div>

          {/* Visual/UI Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-full min-h-[400px]"
          >
            {/* Glassmorphic card showcasing market connectivitity concept */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[80px] group-hover:bg-accent/30 transition-colors duration-700" />

              <div className="flex flex-col h-full justify-center space-y-8 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <div className="text-gray-400 text-sm font-medium mb-1">Trading Server</div>
                    <div className="text-white text-xl font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      London Equinix LD4
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg px-4 py-2 text-accent font-mono text-sm border border-white/5">
                    1.2ms latency
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Market Depth', value: 'Level II Complete', highlight: false },
                    { label: 'Execution Speed', value: '< 10ms', highlight: true },
                    { label: 'Uptime', value: '99.99%', highlight: false }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/20 rounded-xl p-4 border border-white/5">
                      <span className="text-gray-400">{stat.label}</span>
                      <span className={`font-bold ${stat.highlight ? 'text-accent' : 'text-white'}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-navy border border-white/10 rounded-xl p-4 shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Direct Market Access</div>
                <div className="text-gray-400 text-xs">Zero Middlemen</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
