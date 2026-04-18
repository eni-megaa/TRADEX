import { UserPlus, ShieldCheck, Wallet, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: UserPlus,
    title: '1. Register',
    description: 'Create your account in under 60 seconds with our quick registration process.'
  },
  {
    icon: ShieldCheck,
    title: '2. Verify',
    description: 'Complete our secure KYC process to unlock all platform features and high limits.'
  },
  {
    icon: Wallet,
    title: '3. Deposit',
    description: 'Fund your wallet using multiple secure payment methods including fiat and crypto.'
  },
  {
    icon: LineChart,
    title: '4. Trade',
    description: 'Access global markets and start trading with our powerful, intuitive platform.'
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="pt-10 pb-24 bg-navy text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Start your trading journey with four simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-white/10 z-0"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-navy border-4 border-navy-light flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                  <Icon className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
