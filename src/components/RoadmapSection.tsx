import { motion } from 'framer-motion';
import { Rocket, Trophy, Briefcase, Globe, Smartphone, CheckCircle2, ExternalLink } from 'lucide-react';

const partners = [
  { name: "Bloomberg", url: "#" },
  { name: "Reuters", url: "#" },
  { name: "Financial Times", url: "#" },
  { name: "Forbes", url: "#" },
  { name: "Wall Street Journal", url: "#" },
  { name: "TechCrunch", url: "#" },
];

const milestones = [
  {
    id: 1,
    quarter: "Q1 2024",
    title: "Platform Launch",
    description: "Launched TRADEX with core trading functionalities.",
    icon: Rocket,
    status: "completed"
  },
  {
    id: 2,
    quarter: "Q3 2024",
    title: "Global Partnerships",
    description: "Partnered with Tier-1 liquidity providers.",
    icon: Briefcase,
    status: "completed"
  },
  {
    id: 3,
    quarter: "Q1 2025",
    title: "Industry Recognition",
    description: "Awarded 'Best New Broker 2025'.",
    icon: Trophy,
    status: "completed"
  },
  {
    id: 4,
    quarter: "Q4 2025",
    title: "Market Expansion",
    description: "Expanding across major Asian markets.",
    icon: Globe,
    status: "current"
  },
  {
    id: 5,
    quarter: "Q2 2026",
    title: "Mobile App V2",
    description: "Next-gen mobile app with AI charting.",
    icon: Smartphone,
    status: "upcoming"
  }
];

export const RoadmapSection = () => {
  const radius = 140;
  const centerX = 160;
  const centerY = 160;
  const totalSize = 320;

  const getPosition = (index: number) => {
    const angleStep = (2 * Math.PI) / milestones.length;
    const startAngle = -Math.PI / 2;
    const angle = startAngle + index * angleStep;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    };
  };

  const buildArcPath = (i: number) => {
    const from = getPosition(i);
    const to = getPosition((i + 1) % milestones.length);
    return `M ${from.x} ${from.y} A ${radius} ${radius} 0 0 1 ${to.x} ${to.y}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#4ade80';
    if (status === 'current') return '#FFDE21';
    return '#6b7280';
  };

  const q3Pos = getPosition(1);

  // Orbit circumference for dash animation
  const orbitCircumference = 2 * Math.PI * radius;

  return (
    <section className="py-16 bg-navy relative overflow-hidden border-t border-white/5">
      {/* Ambient background glow */}
      <motion.div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered heading */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Our Journey & <span className="text-[#FFDE21]">Roadmap</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base text-gray-400 max-w-xl mx-auto"
          >
            Track our progress as we build the future of online trading.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row items-center justify-center gap-0 relative"
        >
          {/* Circular Orbit */}
          <div className="relative" style={{ width: totalSize, height: totalSize, flexShrink: 0 }}>
            <svg
              width={totalSize}
              height={totalSize}
              className="absolute inset-0"
              viewBox={`0 0 ${totalSize} ${totalSize}`}
            >
              {/* Dashed orbit ring — draws itself in */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ strokeDashoffset: orbitCircumference }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />

              {/* Spinning accent ring — slow continuous rotation */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={radius + 6}
                fill="none"
                stroke="rgba(74,222,128,0.08)"
                strokeWidth="0.5"
                strokeDasharray="20 60"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              />

              {/* Arc segments between nodes */}
              {milestones.map((m, i) => (
                <motion.path
                  key={`arc-${m.id}`}
                  d={buildArcPath(i)}
                  fill="none"
                  stroke={m.status === 'completed' ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.2, ease: 'easeOut' }}
                />
              ))}
            </svg>

            {/* Center hub */}
            <motion.div
              className="absolute rounded-full bg-bg-card border border-white/10 flex items-center justify-center"
              style={{
                width: 80,
                height: 80,
                left: centerX - 40,
                top: centerY - 40,
              }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 12 }}
            >
              {/* Pulsing ring around hub */}
              <motion.div
                className="absolute inset-[-4px] rounded-full border border-[#FFDE21]/20"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="text-center">
                <span className="text-[#FFDE21] text-xs font-bold tracking-widest uppercase block">TRADEX</span>
                <span className="text-gray-500 text-[10px]">Roadmap</span>
              </div>
            </motion.div>

            {/* Milestone nodes */}
            {milestones.map((milestone, index) => {
              const pos = getPosition(index);
              const Icon = milestone.icon;
              const color = getStatusColor(milestone.status);
              const nodeSize = 40;

              return (
                <motion.div
                  key={milestone.id}
                  className="absolute group"
                  style={{
                    left: pos.x - nodeSize / 2,
                    top: pos.y - nodeSize / 2,
                    width: nodeSize,
                    height: nodeSize,
                    zIndex: 10,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 200, damping: 14 }}
                >
                  {/* Pulse ring for "current" milestone */}
                  {milestone.status === 'current' && (
                    <motion.div
                      className="absolute inset-[-6px] rounded-full border-2 border-[#FFDE21]/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  <motion.div
                    className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                      border: `2px solid ${color}`,
                    }}
                    whileHover={{ scale: 1.2, boxShadow: `0 0 20px ${color}40` }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon style={{ color, width: 16, height: 16 }} />
                  </motion.div>

                  {/* Quarter label */}
                  <motion.span
                    className="absolute whitespace-nowrap text-[10px] font-semibold tracking-wider uppercase"
                    style={{
                      color: 'rgba(156,163,175,0.7)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: nodeSize + 4,
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    {milestone.quarter}
                  </motion.span>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 scale-90 group-hover:scale-100">
                    <div className="bg-bg-card border border-white/10 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap backdrop-blur-sm">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase" style={{ color }}>{milestone.quarter}</span>
                        {milestone.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white">{milestone.title}</p>
                      <p className="text-[10px] text-gray-400 max-w-[160px]">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Connector line from Q3 2024 node to partners panel */}
          <div className="hidden lg:block relative" style={{ width: 60, height: totalSize }}>
            <svg width="60" height={totalSize} className="absolute inset-0" viewBox={`0 0 60 ${totalSize}`}>
              <motion.line
                x1="0"
                y1={q3Pos.y}
                x2="60"
                y2={totalSize / 2}
                stroke="rgba(74,222,128,0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1.6 }}
              />
              {/* Animated travelling dot along the connector */}
              <motion.circle
                r="2"
                fill="#4ade80"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2.4 }}
              >
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={`M 0,${q3Pos.y} L 60,${totalSize / 2}`}
                />
              </motion.circle>
              {/* Endpoint dots */}
              <motion.circle
                cx="0" cy={q3Pos.y} r="3" fill="#4ade80"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6, type: 'spring' }}
              />
              <motion.circle
                cx="60" cy={totalSize / 2} r="3" fill="#4ade80"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                viewport={{ once: true }}
                transition={{ delay: 2.2, type: 'spring' }}
              />
            </svg>
          </div>

          {/* Partners Constellation — clean scattered modal boxes with precise connector lines */}
          {(() => {
            // ── Layout constants (single source of truth) ──
            const W = 380;           // SVG / container viewBox width
            const H = 420;           // SVG / container viewBox height
            const hubX = W / 2;      // 190  — exact center
            const hubY = H / 2;      // 210  — exact center
            const cardW = 150;       // card width px
            const cardH = 44;        // card height px (py-2.5 + content)

            // Card positions – 3 symmetric rows, left & right aligned at same y.
            const rowY1 = 30;                    // top row
            const rowY2 = hubY - cardH / 2;      // middle row (centered with hub)
            const rowY3 = H - cardH - 30;        // bottom row
            const leftX = 5;                     // left column x
            const rightX = W - cardW - 5;        // right column x

            const cardPositions = [
              { x: leftX,  y: rowY1 },   // Bloomberg        — top-left
              { x: rightX, y: rowY1 },   // Reuters          — top-right
              { x: leftX,  y: rowY2 },   // Financial Times  — mid-left
              { x: rightX, y: rowY2 },   // Forbes           — mid-right
              { x: leftX,  y: rowY3 },   // WSJ              — bottom-left
              { x: rightX, y: rowY3 },   // TechCrunch       — bottom-right
            ];

            // Center point of each card (for line endpoints)
            const cardCenters = cardPositions.map(p => ({
              x: p.x + cardW / 2,
              y: p.y + cardH / 2,
            }));

            // Uniform navy color for all cards
            const cardStyle = {
              bg: '#151F32',
              border: 'rgba(255,255,255,0.08)',
              text: '#4ade80',
              dot: '#4ade80',
            };

            return (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="w-full max-w-md lg:max-w-sm flex-shrink-0 relative"
                style={{ height: H }}
              >
                {/* SVG connector lines — hub center → each card center */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {cardCenters.map((c, i) => (
                    <g key={`line-${i}`}>
                      <motion.line
                        x1={hubX} y1={hubY}
                        x2={c.x} y2={c.y}
                        stroke="rgba(74,222,128,0.12)"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 2.0 + i * 0.1 }}
                      />
                      {/* Small endpoint dot on the card side */}
                      <motion.circle
                        cx={c.x} cy={c.y} r="2.5"
                        fill={cardStyle.dot}
                        fillOpacity="0.4"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.3 + i * 0.1, type: 'spring' }}
                      />
                      {/* Travelling dot */}
                      <motion.circle
                        r="1.5"
                        fill="#4ade80"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.6 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.6 + i * 0.1 }}
                      >
                        <animateMotion
                          dur={`${3.5 + i * 0.4}s`}
                          repeatCount="indefinite"
                          path={`M ${hubX},${hubY} L ${c.x},${c.y}`}
                        />
                      </motion.circle>
                    </g>
                  ))}
                </svg>

                {/* Central hub node — exactly centered */}
                <motion.div
                  className="absolute z-20"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: 56,
                    height: 56,
                    marginLeft: -28,
                    marginTop: -28,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.9, type: 'spring', stiffness: 150, damping: 12 }}
                >
                  {/* Single subtle pulse ring */}
                  <motion.div
                    className="absolute inset-[-6px] rounded-full border border-green-400/15"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="w-14 h-14 rounded-full bg-bg-card border border-green-400/25 flex items-center justify-center">
                    <div className="text-center">
                      <Briefcase className="w-3.5 h-3.5 text-green-400 mx-auto mb-0.5" />
                      <span className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">Partners</span>
                    </div>
                  </div>
                </motion.div>

                {/* Partner cards — positioned to match SVG line endpoints */}
                {partners.map((partner, i) => {
                  const pos = cardPositions[i];
                  const color = cardStyle;

                  // Convert viewBox coords to percentage for CSS positioning
                  const leftPct = (pos.x / W) * 100;
                  const topPct = (pos.y / H) * 100;

                  return (
                    <motion.a
                      key={partner.name}
                      href={partner.url}
                      className="absolute z-10 group/card cursor-pointer"
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: cardW,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 2.2 + i * 0.1,
                        type: 'spring',
                        stiffness: 140,
                        damping: 16,
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -3,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div
                        className="rounded-lg px-3 py-2.5 transition-all duration-200 bg-bg-card"
                        style={{
                          border: `1px solid ${color.border}`,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Letter badge */}
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ border: `1px solid ${color.border}` }}
                          >
                            <span className="text-xs font-bold" style={{ color: color.text }}>
                              {partner.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-white/85 group-hover/card:text-white transition-colors block truncate">
                              {partner.name}
                            </span>
                          </div>
                          <ExternalLink
                            className="w-3 h-3 text-gray-600 group-hover/card:text-gray-400 transition-colors flex-shrink-0"
                          />
                        </div>
                      </div>
                    </motion.a>
                  );
                })}

                {/* Header label */}
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-center z-20"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.0 }}
                >
                  <div className="flex items-center gap-2 justify-center mb-0.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-green-400">Q3 2024</span>
                    <span className="flex items-center text-[9px] font-semibold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                      Done
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white/70 tracking-tight">Trusted Partners</span>
                </motion.div>
              </motion.div>
            );
          })()}
        </motion.div>
      </div>
    </section>
  );
};
