import { motion } from 'framer-motion';
import { Headset, Briefcase, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export const PlatformSection = () => {
  const offerings = [
    {
      id: "services",
      icon: Headset,
      iconColor: "#FFDE21",
      title: "Personalized Client Services",
      description: "Dedicated, round-the-clock support tailored to your specific trading needs and long-term goals.",
      features: ["24/7 Dedicated Support", "Multi-lingual Assistance", "Priority Routing", "One-on-One Consultations"],
    },
    {
      id: "management",
      icon: Briefcase,
      iconColor: "#4ade80",
      title: "Account Management",
      description: "Advanced administrative tools to help you organize, track, and optimize your investments seamlessly.",
      features: ["Portfolio Analytics", "Risk Management Tools", "Secure Funding", "Automated Reports"],
    },
    {
      id: "training",
      icon: GraduationCap,
      iconColor: "#60a5fa",
      title: "Basic Trading Training",
      description: "Comprehensive educational resources, interactive webinars, and beginner-friendly guides to build your foundation.",
      features: ["Video Tutorials", "Live Webinars", "Market Analysis", "Demo Accounts"],
    }
  ];

  return (
    <section className="py-16 bg-navy relative overflow-hidden border-t border-white/5">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-light border border-white/10 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Client First Approach</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            What we <span className="text-accent">offer</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Comprehensive services designed to support, educate, and elevate your trading journey from day one.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {offerings.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="group relative bg-bg-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col h-full"
              >
                {/* Top highlight bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

                <div className="mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-navy-dark border border-white/5">
                    <Icon className="w-6 h-6" style={{ color: item.iconColor }} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                  {item.description}
                </p>

                <div className="bg-navy-dark/50 -mx-2 -mb-2 p-4 rounded-lg border border-white/5 mt-auto">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Key Highlights</span>
                  <ul className="space-y-2 mb-4">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-gray-400 font-medium">
                        <div className="w-1 h-1 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="flex items-center gap-2 text-xs font-bold text-accent opacity-80 group-hover:opacity-100 transition-all w-fit">
                    Explore More <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
