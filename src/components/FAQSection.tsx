import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Is TRADEX a regulated brokerage?",
    answer: "Yes, TRADEX is fully regulated by top-tier financial authorities. We maintain strict compliance with international financial standards to ensure the highest level of security for our clients' funds."
  },
  {
    question: "How fast are withdrawals processed?",
    answer: "We pride ourselves on lightning-fast withdrawals. Most requests are processed within 24 hours. Depending on your chosen method (Wire Transfer, Credit Card, or Crypto), funds typically arrive in 1-3 business days."
  },
  {
    question: "What is the minimum deposit to start trading?",
    answer: "You can start trading with as little as $100. We believe in making global markets accessible to everyone, while still providing institutional-grade tools and liquidity."
  },
  {
    question: "Are my funds safe with TRADEX?",
    answer: "Absolutely. All client funds are kept in segregated accounts at top-tier international banks, completely separate from the company's operational funds. We also provide negative balance protection for all retail clients."
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Frequently Asked <span className="text-[#FFDE21]">Questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Everything you need to know about trading with TRADEX. Can't find what you're looking for? Contact our 24/7 support team.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-white/5 rounded-2xl bg-bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#FFDE21] transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
