import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Quote, X } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Josh Stones",
    role: "Proprietary Trader",
    profit: "+$142,500",
    quote: "The execution speed on this platform is unmatched. For high-frequency strategies, it's absolutely game-changing.",
    videoThumb: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop",
    videoUrl: "", // Add actual video path here later
  },
  {
    id: 2,
    name: "",
    role: "Institutional Investor",
    profit: "+28.4% YTD",
    quote: "Finally, a clean interface with institutional-grade tools. The liquidity depth allows me to enter large positions without slippage.",
    videoThumb: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600&auto=format&fit=crop",
    videoUrl: "", // Add actual video path here later
  },
  {
    id: 3,
    name: "Logan Moreno",
    role: "Forex Specialist",
    profit: "+$89,200",
    quote: "Their raw spreads and transparent fee structure gave my automated algorithms the edge they needed to become consistently profitable.",
    videoThumb: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=600&auto=format&fit=crop",
    videoUrl: "", // Add actual video path here later
  }
];

export const TestimonialsSection = () => {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <section className="py-10 bg-navy relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full" />

      <div className="max-w-6xl mx-auto px- sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Hear from Our <span className="text-[#FFDE21]">Top Performers</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Don't just take our word for it. Watch how our platform has transformed the trading strategies of professionals worldwide.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group relative rounded-2xl bg-bg-card border border-white/5 hover:border-accent/30 transition-all duration-300 overflow-hidden shadow-xl"
            >
              {/* Video Thumbnail Area */}
              <div
                className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer"
                onClick={() => setActiveVideo(testimonial.id)}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                <img
                  src={testimonial.videoThumb}
                  alt={testimonial.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />

                {/* Play Button Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-16 h-16 rounded-full bg-[#FFDE21]/90 flex items-center justify-center shadow-[0_0_30px_rgba(255,222,33,0.5)] group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
                    <Play className="w-6 h-6 text-black ml-1 fill-black" />
                  </div>
                </div>

                {/* Profit Badge Overlay */}
                <div className="absolute top-4 right-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {testimonial.profit}
                </div>
              </div>

              {/* Text Content */}
              <div className="p-8 relative">
                <Quote className="absolute top-6 right-8 w-12 h-12 text-white/5 transform -rotate-12" />

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFDE21] text-[#FFDE21]" />
                  ))}
                </div>

                <p className="text-gray-300 text-base leading-relaxed mb-6 h-24 overflow-hidden relative">
                  "{testimonial.quote}"
                  {/* Fade out text if too long */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg-card to-transparent" />
                </p>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-[#FFDE21] text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal Placeholder */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-4xl aspect-video bg-bg-dark rounded-xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 hover:bg-[#FFDE21] rounded-full flex items-center justify-center text-white hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center p-8">
                <Play className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">Video Testimonial Placeholder</h3>
                <p className="text-gray-400">Replace with actual &lt;video&gt; or iframe implementation.</p>
                <p className="text-sm text-[#FFDE21] mt-4">ID: {activeVideo}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
