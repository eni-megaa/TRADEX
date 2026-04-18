import { Target, Globe, Cpu, Users } from 'lucide-react';

export const AboutUsPage = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Empowering the <span className="text-accent">Modern Trader</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Founded in 2018, TradeX was built on a simple premise: financial markets should be accessible,
          transparent, and technologically advanced for everyone.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-3xl hover:border-accent/20 transition-all group">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Target className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            To become the world's most trusted multi-asset brokerage by providing institutional-grade infrastructure
            and execution speeds to retail and professional traders alike.
          </p>
        </div>

        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-3xl hover:border-accent-cyan/20 transition-all group">
          <div className="w-12 h-12 bg-accent-cyan/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Cpu className="text-accent-cyan w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Technology First</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            We invest heavily in proprietary low-latency execution engines and real-time risk management systems,
            ensuring your trades are executed at the best possible prices.
          </p>
        </div>

        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-3xl hover:border-emerald-500/20 transition-all group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe className="text-emerald-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Global Presence</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            With regional hubs in London, Singapore, and New York, our 24/7 global support team is always
            ready to assist traders across every time zone.
          </p>
        </div>

        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-3xl hover:border-orange-500/20 transition-all group">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users className="text-orange-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Client Centric</h3>
          <p className="text-gray-400 leading-relaxed text-sm">
            Your success is our success. We provide comprehensive educational resources, advanced analytical
            tools, and unbiased market insights to help you navigate the markets with confidence.
          </p>
        </div>
      </div>

      <section className="bg-gradient-to-br from-navy-light/40 to-transparent border border-white/5 p-8 md:p-12 rounded-[2rem] mt-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10"></div>
        <h2 className="text-3xl font-black text-white mb-6">The Trade<span className="text-accent font-display uppercase ">X</span> Promise</h2>
        <div className="space-y-4 text-gray-400 max-w-3xl">
          <p>
            Operating since 2018, TradeX remains committed to the highest standards of regulatory compliance.
            We maintain segregated client accounts with top-tier financial institutions and utilize
            advanced encryption to guarantee the safety of your funds and data.
          </p>
          <p>
            Whether you are a retail trader just starting out or a professional fund manager requiring high-volume
            throughput, TradeX provides the scale and stability you need in the modern era of finance.
          </p>
        </div>
      </section>
    </div>
  );
};
