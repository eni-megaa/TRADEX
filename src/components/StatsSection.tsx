import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

const StatCard = ({ title, value, suffix = '', prefix = '' }: { title: string, value: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const incrementTime = Math.abs(Math.floor(duration / end));

      let timer = setInterval(() => {
        start += Math.ceil(end / 50); // Jump steps based on value size
        if (start > end) {
          start = end;
          clearInterval(timer);
        }
        setCount(start);
      }, incrementTime > 0 ? incrementTime : 10);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col items-center p-4 bg-navy-light/50 backdrop-blur-sm rounded-xl border border-white/5">
      <span className="text-3xl md:text-4xl font-extrabold text-white mb-1 font-mono">
        {prefix}{count}{suffix}
      </span>
      <span className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">{title}</span>
    </div>
  );
};

export const StatsSection = () => {
  return (
    <section className="py-5 bg-navy border-t border-white/5 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard title="Active Traders" value={150} suffix="K+" />
          <StatCard title="Daily Volume" value={1} prefix="$" suffix="B+" />
          <StatCard title="Countries Supported" value={120} suffix="+" />
          <StatCard title="Execution Speed" value={12} suffix="ms" />
        </div>
      </div>
    </section>
  );
};
