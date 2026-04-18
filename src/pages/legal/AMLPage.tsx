import { ShieldCheck, Search, Landmark } from 'lucide-react';

export const AMLPage = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">
          AML & KYC Policy
        </h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Committed to preventing financial crime and ensuring the integrity of our platform.
        </p>
      </section>

      <div className="bg-navy-light/20 border border-white/5 p-8 md:p-12 rounded-[3.5rem] relative shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10"></div>

        <div className="prose prose-invert prose-sm max-w-none space-y-12">
          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Landmark className="text-accent w-5 h-5 shrink-0" />
              1. Anti-Money Laundering (AML)
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                TradeX Brokerage adheres to the strictest global Anti-Money Laundering (AML) and
                Counter-Terrorism Financing (CTF) standards. We've implemented a comprehensive
                risk-based approach to monitor and report suspicious financial activities.
              </p>
              <p>
                Our internal compliance team uses advanced monitoring tools to verify the source of
                funds and identify any irregular transaction patterns. We cooperate fully with
                global financial intelligence units and law enforcement agencies.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Search className="text-accent-cyan w-5 h-5 shrink-0" />
              2. Customer Verification (KYC)
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-3">
              <p>To comply with regulatory standards, all TradeX users must complete our Know Your Customer (KYC) process:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Proof of Identity: High-resolution copy of a valid Passport or National ID card.</li>
                <li>Proof of Residence: Recent utility bill or bank statement (issued within the last 3 months).</li>
                <li>Selfie Verification: Biometric facial recognition to prevent identity theft and "deep-fakes".</li>
                <li>Source of Wealth: Declarations may be required for high-volume accounts.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 w-5 h-5 shrink-0" />
              3. Sanctions & Prohibited Jurisdictions
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                TradeX does not provide services to individuals or entities on global sanctions lists (OFAC, EU, UN).
                Additionally, we do not onboard clients residing in "high-risk" jurisdictions or
                countries listed as non-cooperative by the Financial Action Task Force (FATF).
              </p>
              <p>
                Prohibited jurisdictions include, but are not limited to: North Korea, Iran, Syria,
                and certain other restricted regions. Users must confirm their primary residency
                during account creation.
              </p>
            </div>
          </section>

          <div className="bg-white/5 p-8 rounded-3xl mt-12 border border-white/5">
            <h3 className="text-white font-bold mb-4">Reporting & Compliance</h3>
            <p className="text-gray-500 text-xs leading-relaxed italic italic">
              Any attempt to circumvent our AML/KYC controls will result in the immediate closure of
              all associated accounts and reporting to relevant authorities. For compliance-related
              questions, contact our DPO at <span className="text-accent underline font-bold cursor-pointer">compliance@tradex.com</span>.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest italic font-sans">
        TradeX Brokerage. Global Financial Integrity & Compliance. 2026.
      </p>
    </div>
  );
};
