import { ShieldCheck, Eye, Lock, FileText } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
          Last Updated: April 2026
        </p>
      </section>

      <div className="bg-navy-light/20 border border-white/5 p-8 md:p-12 rounded-[3.5rem] relative shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10"></div>

        <div className="prose prose-invert prose-sm max-w-none space-y-12">
          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Eye className="text-accent w-5 h-5 shrink-0" />
              1. Information We Collect
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                To provide our services, TradeX collects several types of information from and about our users, including:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personal identification information (Name, Email, Phone, Address).</li>
                <li>Financial information for deposits, withdrawals, and suitability assessments.</li>
                <li>KYC documents (Passport, National ID, Bank Statements).</li>
                <li>Device information (IP address, Browser type, Operating System).</li>
                <li>Usage data (Trading activity, log files, platform interactions).</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-accent-cyan w-5 h-5 shrink-0" />
              2. How We Use Data
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-3">
              <p>We process your data for the following essential purposes:</p>
              <ul className="list-decimal pl-5 space-y-2">
                <li>Provision of trading services and account management.</li>
                <li>Compliance with Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) regulations.</li>
                <li>Fraud prevention and platform security monitoring.</li>
                <li>Marketing communications (if you have explicitly opted-in).</li>
                <li>Improving our UI/UX through aggregated analytical data.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Lock className="text-emerald-500 w-5 h-5 shrink-0" />
              3. Data Security & Storage
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                We implement industry-standard technical and organizational measures to protect your personal data
                against unauthorized access, alteration, or destruction.
              </p>
              <p>
                Your data is stored on secure, encrypted servers located in ISO-certified data centers.
                We retain your data for as long as necessary to fulfill the purposes outlined in this policy
                and to meet our regulatory and legal record-keeping obligations.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <FileText className="text-orange-500 w-5 h-5 shrink-0" />
              4. Your Privacy Rights
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-3">
              <p>Depending on your jurisdiction, you may have the following rights regarding your data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The right to a copy of the data we hold about you (Data Access).</li>
                <li>The right to correct inaccurate or incomplete data.</li>
                <li>The right to request deletion of your data (subject to regulatory holding periods).</li>
                <li>The right to object to or restrict processing for specific purposes.</li>
                <li>The right to withdraw any previously given consent for marketing.</li>
              </ul>
            </div>
          </section>

          <div className="bg-white/5 p-8 rounded-3xl mt-12 border border-white/5">
            <h3 className="text-white font-bold mb-4">Cookie Usage</h3>
            <p className="text-gray-500 text-xs leading-relaxed italic">
              TradeX uses cookies to enhance platform performance, security, and user experience.
              You can manage your cookie preferences through your browser settings at any time.
              Disabling certain cookies may impact platform functionality.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest italic font-sans">
        TradeX Brokerage Privacy Center. Protecting your digital assets and identity since 2018.
      </p>
    </div>
  );
};
