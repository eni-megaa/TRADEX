import { motion } from 'framer-motion';

export const CopyTradingSection = () => {
  return (
    <section className="py-8 bg-navy text-white overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Copy <span className="text-white">top investors</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-lg">
              With TRADEX's innovative <strong>CopyTrading feature</strong>, you can automatically copy the moves of top investors on the platform. Find the best investors you believe in and with the highest win rates and<strong>replicate their actions</strong> in real time.
            </p>

            <button className="px-8 py-3 rounded-full border-2 border-[#FFDE21] text-[#FFDE21] hover:bg-[#FFDE21] hover:text-black font-semibold transition-all duration-300 mb-8">
              Start Copying
            </button>

            <p className="text-sm text-gray-500 max-w-md">
              Copy Trading does not amount to investment advice. The value of your investments may go up or down. Your capital is at risk. Past performance is not an indication of future results.
            </p>
          </motion.div>

          {/* Right Column: Visual Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 relative flex justify-center lg:justify-end mt-8 lg:mt-0"
          >
            {/* Main Portrait Card */}
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
                alt="Top Investor"
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent opacity-90" />

              {/* Bottom Info Overlay */}
              <div className="absolute bottom-6 left-6 z-10">
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">Mila Moreau</h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[#10B981] drop-shadow-md">12.08%</span>
                </div>
                <p className="text-xs text-gray-300 uppercase tracking-wider mt-1 drop-shadow-md">Return (12M)</p>
              </div>
            </div>

            {/* Floating Stats Glassmorphism Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-6 -right-4 md:-right-6 w-60 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl"
            >
              <h4 className="text-white font-semibold mb-3 text-sm">Stats</h4>
              <div className="flex items-end justify-between h-20 gap-2 mb-2">
                {/* Fake Bar Chart */}
                <div className="w-[12%] bg-[#10B981] rounded-t-sm h-[30%]" />
                <div className="w-[12%] bg-[#10B981] rounded-t-sm h-[45%]" />
                <div className="w-[12%] bg-[#10B981] rounded-t-sm h-[80%]" />
                <div className="w-[12%] bg-[#10B981] rounded-t-sm h-[55%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" /> {/* Highlighted bar */}
                <div className="w-[12%] bg-[#10B981] rounded-t-sm h-[40%]" />
                <div className="w-[12%] bg-[#10B981] rounded-t-sm h-[65%]" />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>02</span>
                <span>04</span>
                <span>06</span>
                <span>08</span>
                <span>10</span>
                <span>12</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

