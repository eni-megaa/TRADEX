import { Handshake, BarChart3, Globe, ShieldCheck } from 'lucide-react';

export const PartnersPage = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
          Grow Your Business with TRADE<span className="text-accent font-display uppercase ">X</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Join our global network of successful partners and leverage our institutional-grade infrastructure
          to earn industry-leading commissions and expand your reach.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Affiliate Program */}
        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-accent/30 transition-all group">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
            <Globe className="text-accent w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Affiliate Program</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed flex-grow">
            Ideal for digital marketers, social media influencers, and website owners looking to monetize
            their financial traffic through high-converting CPA or RevShare models.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-accent mr-2 shrink-0" />
              High CPA & Hybrid Models
            </li>
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-accent mr-2 shrink-0" />
              Real-time Performance Tracking
            </li>
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-accent mr-2 shrink-0" />
              Premium Marketing Creative
            </li>
          </ul>
          <button className="w-full bg-accent/10 border border-accent/20 text-accent font-bold py-3 rounded-2xl hover:bg-accent hover:text-white transition-all">
            Join as Affiliate
          </button>
        </div>

        {/* Introducing Broker */}
        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-accent-cyan/30 transition-all group lg:-translate-y-4">
          <div className="w-14 h-14 bg-accent-cyan/10 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
            <Handshake className="text-accent-cyan w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Introducing Broker</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed flex-grow">
            Specifically designed for professional traders, educators, and fund managers who want to build
            long-term recurring revenue by referring their community.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-accent-cyan mr-2 shrink-0" />
              Competitive Rebates Structure
            </li>
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-accent-cyan mr-2 shrink-0" />
              Advanced Multi-tier Commissions
            </li>
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-accent-cyan mr-2 shrink-0" />
              Custom Landing Pages
            </li>
          </ul>
          <button className="w-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-bold py-3 rounded-2xl hover:bg-accent-cyan hover:text-navy transition-all shadow-xl shadow-accent-cyan/10">
            Apply as IB
          </button>
        </div>

        {/* White Label */}
        <div className="bg-navy-light/30 border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-emerald-500/30 transition-all group">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BarChart3 className="text-emerald-500 w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">White Label</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed flex-grow">
            Launch your own multi-asset brokerage with our comprehensive turnkey solution, featuring
            our advanced trading terminal and back-end CRM.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
              Fully Branded Platform
            </li>
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
              Tier-1 Liquidity Access
            </li>
            <li className="flex items-center text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
              24/7 Technical Support
            </li>
          </ul>
          <button className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold py-3 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
            Contact Enterprise
          </button>
        </div>
      </div>

      <section className="bg-gradient-to-br from-navy-light/40 to-transparent border border-white/5 p-8 md:p-16 rounded-[3rem] mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-white mb-6">Why Partner with Us?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-accent font-bold text-sm">01</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Instant Payouts</h4>
                  <p className="text-gray-500 text-sm italic">Withdraw your commissions instantly via local bank transfers, crypto, or global electronic wallets.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-accent-cyan font-bold text-sm">02</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Dedicated Account Manager</h4>
                  <p className="text-gray-500 text-sm italic">Each partner is assigned a dedicated expert to help optimize campaigns and maximize conversion rates.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-emerald-500 font-bold text-sm">03</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Global Licensing</h4>
                  <p className="text-gray-500 text-sm italic">Leverage our multi-jurisdictional regulatory coverage to onboard clients from across the globe securely.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-navy p-8 rounded-[2.5rem] border border-white/5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-accent-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <h3 className="text-xl font-bold text-white mb-4">Start Earning Today</h3>
              <p className="text-gray-400 text-sm mb-8 italic">Our application process is fast and transparent. Most partners are approved within 24 hours.</p>
              <form className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full bg-navy-light/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40" />
                <input type="email" placeholder="Business Email" className="w-full bg-navy-light/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40" />
                <select className="w-full bg-navy-light/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 focus:outline-none">
                  <option>Select Program</option>
                  <option>Affiliate</option>
                  <option>Introducing Broker</option>
                  <option>White Label</option>
                </select>
                <button className="w-full bg-gradient-to-r from-accent to-accent-cyan text-white font-bold py-4 rounded-xl mt-4 shadow-xl shadow-accent/20">
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
