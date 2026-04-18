import { Lightbulb, Users, Rocket, Heart } from 'lucide-react';

export const CareersPage = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
          Shape the Future of <span className="text-accent">Global Finance</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          At TradeX, we're merging fintech innovation with traditional market expertise. 
          We're looking for world-class talent to build the most advanced trading platform on the planet.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-navy-light/20 border border-white/5 p-6 rounded-[2rem] hover:bg-navy-light/40 transition-all text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Innovation</h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            We don't just follow fintech trends—we define them through constant iteration.
          </p>
        </div>
        <div className="bg-navy-light/20 border border-white/5 p-6 rounded-[2rem] hover:bg-navy-light/40 transition-all text-center">
          <div className="w-12 h-12 bg-accent-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="text-accent-cyan w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Inclusion</h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            A diverse team is a stronger team. We value unique perspectives from all backgrounds.
          </p>
        </div>
        <div className="bg-navy-light/20 border border-white/5 p-6 rounded-[2rem] hover:bg-navy-light/40 transition-all text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rocket className="text-emerald-500 w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Impact</h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Your work directly impacts thousands of traders and millions in transaction volume today.
          </p>
        </div>
        <div className="bg-navy-light/20 border border-white/5 p-6 rounded-[2rem] hover:bg-navy-light/40 transition-all text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="text-red-500 w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Growth</h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Comprehensive health, professional growth budgets, and generous equity programs.
          </p>
        </div>
      </div>

      <section className="bg-navy-light/30 border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
        <h2 className="text-3xl font-black text-white mb-10 text-center">Open Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-navy p-6 rounded-3xl border border-white/5">
            <h4 className="text-accent font-bold mb-2 uppercase tracking-widest text-[10px]">Engineering & Tech</h4>
            <h3 className="text-white text-xl font-bold mb-4">Full Stack & DevOps</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Help us scale our low-latency execution engines, maintain our cloud infrastructure, 
              and build stunning user experiences for our trading terminals.
            </p>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">4 Open Roles</span>
          </div>

          <div className="bg-navy p-6 rounded-3xl border border-white/5">
            <h4 className="text-accent-cyan font-bold mb-2 uppercase tracking-widest text-[10px]">Compliance & Risk</h4>
            <h3 className="text-white text-xl font-bold mb-4">Regulatory Analyst</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Ensure we stay ahead of global financial regulations and maintain institutional-grade risk controls. 
              Join a team that prioritizes transparency and security.
            </p>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">2 Open Roles</span>
          </div>

          <div className="bg-navy p-6 rounded-3xl border border-white/5">
            <h4 className="text-emerald-500 font-bold mb-2 uppercase tracking-widest text-[10px]">Trading Operations</h4>
            <h3 className="text-white text-xl font-bold mb-4">Market Specialist</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Manage liquidity relationships, monitor market depths, and ensure our users 
              always have access to the best pricing across all asset classes.
            </p>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">1 Open Role</span>
          </div>

          <div className="bg-navy p-6 rounded-3xl border border-white/5">
            <h4 className="text-orange-500 font-bold mb-2 uppercase tracking-widest text-[10px]">Support & Success</h4>
            <h3 className="text-white text-xl font-bold mb-4">Customer Experience</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Become the voice of TradeX. Assist our global user base with technical inquiries, 
              account setups, and platform education.
            </p>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">3 Open Roles</span>
          </div>
        </div>
      </section>

      <div className="text-center bg-accent/5 border border-accent/20 p-10 rounded-[2.5rem]">
        <h2 className="text-2xl font-black text-white mb-4">Don't see a fit?</h2>
        <p className="text-gray-400 text-sm mb-8">
          We're always looking for brilliant minds in software engineering, trading, and finance. 
          Send your details to our team and we'll be in touch!
        </p>
        <button className="bg-accent text-white font-bold py-3 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
          General Application
        </button>
      </div>
    </div>
  );
};
