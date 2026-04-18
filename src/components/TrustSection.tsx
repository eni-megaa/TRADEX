import { ShieldCheck, Users, Globe, RefreshCcw, UserPlus } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* Left Column: Stats Visual */}
          <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center">
            {/* World Map Dotted Pattern (simplified SVG) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg viewBox="0 0 1000 600" className="w-full h-auto max-h-[80%] fill-white" preserveAspectRatio="xMidYMid meet">
                <path d="M220,150 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0 M450,120 a15,15 0 1,1 30,0 a15,15 0 1,1 -30,0 M700,180 a18,18 0 1,1 36,0 a18,18 0 1,1 -36,0 M150,300 a22,22 0 1,1 44,0 a22,22 0 1,1 -44,0 M380,350 a16,16 0 1,1 32,0 a16,16 0 1,1 -32,0 M620,400 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0 M850,320 a25,25 0 1,1 50,0 a25,25 0 1,1 -50,0 M300,500 a14,14 0 1,1 28,0 a14,14 0 1,1 -28,0 M550,550 a12,12 0 1,1 24,0 a12,12 0 1,1 -24,0 M780,480 a16,16 0 1,1 32,0 a16,16 0 1,1 -32,0" />
              </svg>
            </div>

            {/* Orbit Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[60%] h-[60%] border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute w-[90%] h-[90%] border border-white/10 rounded-full border-dashed animate-[spin_80s_reverse_linear_infinite]"></div>
            </div>

            {/* Stat Cards */}
            {/* 198+ Countries (Top Left) */}
            <div className="absolute top-[15%] left-[5%] py-4 px-6 bg-bg-card/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl z-10 animate-float-delayed text-left min-w-[180px] hover:border-accent/40 transition-colors">
              <div className="flex items-center space-x-2 mb-1">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span className="text-3xl font-bold text-teal-400 leading-none tracking-tight">198+</span>
              </div>
              <div className="text-base text-gray-400 font-medium ml-7">Countries</div>
            </div>

            {/* 350+ Trading Pairs (Middle Right) */}
            <div className="absolute top-[45%] right-0 py-4 px-6 bg-bg-card/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl z-10 animate-float text-left min-w-[190px] hover:border-accent/40 transition-colors">
              <div className="flex items-center space-x-2 mb-1">
                <RefreshCcw className="w-5 h-5 text-emerald-500" />
                <span className="text-3xl font-bold text-teal-400 leading-none tracking-tight">350+</span>
              </div>
              <div className="text-base text-gray-400 font-medium ml-7">Trading Pairs</div>
            </div>

            {/* 20 million+ Traders (Bottom Left) */}
            <div className="absolute bottom-[20%] left-[10%] py-4 px-6 bg-bg-card/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl z-10 animate-float-slow text-left min-w-[220px] hover:border-accent/40 transition-colors">
              <div className="flex items-center space-x-2 mb-1">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                <span className="text-3xl font-bold text-teal-400 leading-none tracking-tight">20M+</span>
              </div>
              <div className="text-base text-gray-400 font-medium ml-7">Global Traders</div>
            </div>

            {/* Floating Icons */}
            <div className="absolute w-full h-full pointer-events-none">
              {/* Bitcoin (top right on outer orbit) */}
              <div className="absolute top-[20%] right-[15%] w-14 h-14 bg-navy-light/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-md animate-float-delayed">
                <div className="w-10 h-10 rounded-full bg-[#f7931a] flex items-center justify-center text-white font-bold text-2xl leading-none pt-0.5 shadow-[0_0_15px_rgba(247,147,26,0.4)]">₿</div>
              </div>

              {/* Ethereum (bottom left large) */}
              <div className="absolute bottom-[5%] left-[2%] w-24 h-24 bg-navy-light/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg animate-float">
                <div className="w-18 h-18 rounded-full bg-gradient-to-br from-[#8a92b2] to-[#627eea] flex items-center justify-center shadow-[0_0_20px_rgba(98,126,234,0.4)]">
                  <svg viewBox="0 0 32 32" className="w-12 h-12 fill-white"><path d="M15.925 23.969L15.875 24v7.419l.05.147 7.025-9.884zM16.075 23.969l-7.019-9.828L16.075 31.566v-7.597zM16.075 0l-.05.172v16.14l.05.047 6.984-3.116zM15.925 0L8.941 13.244l6.984 3.116V0z" /></svg>
                </div>
              </div>

              {/* Tether (bottom right) */}
              <div className="absolute bottom-[18%] right-[25%] w-12 h-12 bg-navy-light/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-sm animate-float-slow">
                <div className="w-8 h-8 rounded-full bg-[#26A17B] flex items-center justify-center text-white font-bold text-base leading-none pt-0.5">₮</div>
              </div>

              {/* Blue Dollar (top left) */}
              <div className="absolute top-[28%] left-[12%] w-10 h-10 bg-navy-light/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-sm animate-float">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm leading-none pt-0.5">$</div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full lg:max-w-lg lg:ml-auto flex flex-col justify-center">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Why use TRADE<span className="text-accent">X</span>
            </h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed md:pr-10">
              We empower millions of traders worldwide with a platform that is secure, transparent, and built on the foundation of institutional-grade security.
            </p>

            <div className="space-y-6">
              {/* Feature 1: Clarity */}
              <div className="flex items-start space-x-5 group">
                <div className="w-14 h-14 rounded-2xl bg-bg-card border border-white/5 flex items-center justify-center flex-shrink-0 shadow-md group-hover:border-accent/40 transition-all">
                  <div className="w-6 h-6 rounded-full border border-orange-500/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full border border-orange-500 flex items-center justify-center">
                      <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Total Clarity</h3>
                  <p className="text-gray-400 text-sm leading-relaxed pr-6">
                    We help you make sense of the markets, the terms, the dense charts and price changes with full transparency.
                  </p>
                </div>
              </div>

              {/* Feature 2: Confidence */}
              <div className="flex items-start space-x-5 group">
                <div className="w-14 h-14 rounded-2xl bg-bg-card border border-white/5 flex items-center justify-center flex-shrink-0 shadow-md group-hover:border-accent/40 transition-all">
                  <div className="flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Maximum Confidence</h3>
                  <p className="text-gray-400 text-sm leading-relaxed pr-6">
                    Regulated environment with negative balance protection and segregated accounts for your peace of mind.
                  </p>
                </div>
              </div>

              {/* Feature 3: Community */}
              <div className="flex items-start space-x-5 group">
                <div className="w-14 h-14 rounded-2xl bg-bg-card border border-white/5 flex items-center justify-center flex-shrink-0 shadow-md group-hover:border-accent/40 transition-all">
                  <div className="flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-500" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Global Community</h3>
                  <p className="text-gray-400 text-sm leading-relaxed pr-6">
                    Join a community of over 20 million traders worldwide sharing insights and growing together.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite 2s;
        }
      `}</style>
    </section>
  );
};
