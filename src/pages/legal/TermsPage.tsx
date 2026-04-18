import { ShieldAlert, BookOpen, AlertTriangle, Scale } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
          Last Updated: April 2026
        </p>
      </section>

      <div className="bg-navy-light/20 border border-white/5 p-8 md:p-12 rounded-[3.5rem] relative shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10"></div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10">
          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <BookOpen className="text-accent w-5 h-5 shrink-0" />
              1. Introduction
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                These Terms of Service ("Terms") govern your access to and use of the TradeX Brokerage platform, including our website,
                mobile applications, and trading terminals. By creating an account or using our services, you agree to be bound
                by these Terms and all applicable laws and regulations.
              </p>
              <p>
                Please read these terms carefully. If you do not agree with any part of these Terms, you must immediately
                cease all use of our platform and close any active accounts.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <ShieldAlert className="text-accent-cyan w-5 h-5 shrink-0" />
              2. Eligibility & Account Use
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-3">
              <p>To use TradeX, you must be at least 18 years of age and reside in a jurisdiction where our services are legally permitted.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your credentials (password, 2FA).</li>
                <li>You agree to provide accurate, current, and complete information during the KYC (Know Your Customer) process.</li>
                <li>Trading accounts are personal and cannot be shared, leased, or sold to third parties.</li>
                <li>TradeX reserves the right to suspend or terminate accounts suspected of fraudulent activity without prior notice.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Scale className="text-emerald-500 w-5 h-5 shrink-0" />
              3. Trading & Execution
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                TradeX provides execution-only services. We do not provide financial, investment, or legal advice.
                All trading decisions made on our platform are yours alone, and you bear the full responsibility
                for the consequences of those decisions.
              </p>
              <p>
                Market data provided on the platform is for informational purposes only. While we strive for accuracy,
                TradeX is not liable for any delays, errors, or omissions in market pricing or data feeds.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <AlertTriangle className="text-orange-500 w-5 h-5 shrink-0" />
              4. Prohibited Activities
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-3">
              <p>Users are strictly prohibited from engaging in the following activities:</p>
              <ul className="list-decimal pl-5 space-y-2">
                <li>Arbitrage or exploitation of system latencies ("lat-arb").</li>
                <li>Market manipulation or "spoofing" of order books.</li>
                <li>Using automated scripts to overload platform infrastructure.</li>
                <li>Conducting trades for unauthorized third parties.</li>
                <li>Using funds derived from illegal or criminal activities.</li>
              </ul>
            </div>
          </section>

          <div className="bg-white/5 p-8 rounded-3xl mt-12 border border-white/5">
            <h3 className="text-white font-bold mb-4">Contact Legal</h3>
            <p className="text-gray-500 text-xs leading-relaxed italic">
              If you have any questions regarding these Terms of Service or our operational framework,
              please contact our legal department at <span className="text-accent underline font-bold cursor-pointer">legal@tradex.com</span>.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose">
        TradeX Brokerage is a registered trademark. All rights reserved.
        Registration No: TX-2018-9941. Licensed by the Global Markets Authority.
      </p>
    </div>
  );
};
