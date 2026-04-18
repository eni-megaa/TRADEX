import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-navy text-white">
      {/* Epic Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg-new.jpg" 
          alt="Hero Background" 
          className="w-full h-full object-cover object-center opacity-80 mix-blend-screen"
        />
      </div>
      {/* Cinematic Gradient Overlays for Seamless Blending */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-navy/90 via-transparent to-transparent" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(255,222,33,0.15)_0%,transparent_70%)]" />

      {/* Tech Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Floating Glowing Orbs (Epic Highlights) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[15%] w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40rem] h-[40rem] bg-[#FFD700]/10 rounded-full blur-[180px] mix-blend-screen animate-pulse duration-1000 delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center space-x-2 py-1.5 px-4 rounded-full bg-navy/40 backdrop-blur-md border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,222,33,0.2)]">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping mr-1"></span>
            Trusted by Trading experts
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-black tracking-tighter mb-6 drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Trade Forex, Crypto & <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-200 to-accent drop-shadow-[0_0_30px_rgba(255,222,33,0.5)]">
          Stocks 
          </span> with Confidence
        </motion.h1>

        <motion.p
          className="text-lg md:text-1xl text-gray-300 max-w-3xl mb-10 font-medium drop-shadow-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Elevate your trading journey with a platform designed for dedicated traders. Transform into the trader you want to be leveraging our cutting edge Next generation platform paired with personalized client services.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link
            to="/register"
            className="group flex w-full sm:w-auto items-center justify-center space-x-3 bg-accent text-navy px-8 py-4 rounded-xl font-black text-lg hover:bg-accent-hover hover:scale-105 hover:shadow-[0_0_40px_rgba(255,222,33,0.6)] transition-all duration-300"
          >
            <span>Start Trading</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>

          <Link
            to="/register?demo=true"
            className="flex w-full sm:w-auto items-center justify-center space-x-3 bg-navy-light/40 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,222,33,0.15)] transition-all duration-300"
          >
            <Play className="w-5 h-5 text-accent" />
            <span>Try Demo</span>
          </Link>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-10 pt-10 border-t border-white/5 w-full max-w-4xl"
        >
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold mb-8">Regulated & Secured by Industry Leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">FCA</div>
              <span className="text-sm font-bold tracking-tight">Financial Conduct Authority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">PCI</div>
              <span className="text-sm font-bold tracking-tight">PCI DSS Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">SSL</div>
              <span className="text-sm font-bold tracking-tight">SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">ASIC</div>
              <span className="text-sm font-bold tracking-tight">ASIC Regulated</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
