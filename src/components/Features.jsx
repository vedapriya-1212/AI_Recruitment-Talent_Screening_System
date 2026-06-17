import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, Calendar, BarChart2, Star, CheckCircle2 } from 'lucide-react';

// Reusable 3D Tilt Card Wrapper
function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Limit rotation to max 10 degrees
    const factor = 10;
    const rx = -(y / (rect.height / 2)) * factor;
    const ry = (x / (rect.width / 2)) * factor;
    setTilt({ x: rx, y: ry });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      className={`glass-panel rounded-xl bg-white/5 border border-white/10 shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col h-full relative group ${className}`}
    >
      {children}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden bg-darkBg">
      {/* Glow Orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-primaryCyan/10 -top-20 left-10" />
      <div className="glow-orb w-[500px] h-[500px] bg-accentPink/10 -bottom-20 right-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full glass-panel border-white/10 mb-4"
          >
            <span className="text-xs font-bold text-primaryCyan uppercase tracking-wider">
              Advanced Modules
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
          >
            Engineered For <span className="gradient-text-cyan-purple">Talent Acquisition</span>
          </motion.h2>
          <p className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Futuristic screening mechanisms designed to eliminate bias and compress hiring cycles down to seconds.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: AI Resume Screening */}
          <TiltCard className="hover:border-primaryCyan/30">
            {/* Ambient hover light */}
            <div className="absolute inset-0 bg-gradient-to-br from-primaryCyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primaryCyan transition-colors">
                  AI Resume Screening
                </h3>
                <p className="text-mutedGray text-sm max-w-sm">
                  Screen resumes in real time with high-velocity semantic scanners that evaluate competencies.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primaryCyan/10 text-primaryCyan border border-primaryCyan/20">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Visual: Screen Scan Animation */}
            <div className="relative flex-grow bg-[#0c102b]/60 rounded-lg p-5 border border-white/5 h-48 overflow-hidden flex flex-col justify-between">
              {/* Scan sweep line */}
              <motion.div
                animate={{
                  y: [-10, 190, -10],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primaryCyan to-transparent opacity-80 z-20 pointer-events-none"
                style={{ boxShadow: '0 0 10px #00F5D4' }}
              />

              {/* Fake Resume Layout */}
              <div className="space-y-3 opacity-80 relative z-10 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                    RS
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-white/20 rounded" />
                    <div className="h-2 w-16 bg-white/10 rounded mt-1" />
                  </div>
                </div>
                <hr className="border-white/5" />
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded" />
                  <div className="h-2 w-5/6 bg-white/10 rounded" />
                  <div className="h-2 w-4/5 bg-white/10 rounded" />
                </div>
              </div>

              {/* Verified Badges */}
              <div className="flex gap-2 relative z-10 mt-4">
                <span className="text-[10px] bg-primaryCyan/15 text-primaryCyan border border-primaryCyan/30 px-2.5 py-1 rounded font-bold">
                  React.js • 4 yrs
                </span>
                <span className="text-[10px] bg-secondaryPurple/15 text-secondaryPurple border border-secondaryPurple/30 px-2.5 py-1 rounded font-bold">
                  Node.js • 3 yrs
                </span>
                <span className="text-[10px] bg-white/5 text-mutedGray border border-white/10 px-2.5 py-1 rounded">
                  System Design
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: Candidate Ranking */}
          <TiltCard className="hover:border-secondaryPurple/30">
            <div className="absolute inset-0 bg-gradient-to-br from-secondaryPurple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-secondaryPurple transition-colors">
                  Candidate Ranking
                </h3>
                <p className="text-mutedGray text-sm max-w-sm">
                  Neural ranking engines construct leaderboard indices matching engineers directly to job roles.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondaryPurple/10 text-secondaryPurple border border-secondaryPurple/20">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Visual: Leaderboard Animation */}
            <div className="relative flex-grow bg-[#0c102b]/60 rounded-lg p-4 border border-white/5 h-48 overflow-hidden flex flex-col justify-between text-left">
              <div className="space-y-2">
                {/* Row 1 */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primaryCyan">#01</span>
                    <span className="text-xs font-semibold text-white">Sarah Jenkins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '98%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full bg-primaryCyan"
                      />
                    </div>
                    <span className="text-[10px] font-black text-primaryCyan">98%</span>
                  </div>
                </motion.div>

                {/* Row 2 */}
                <div className="flex items-center justify-between p-2 rounded bg-white/3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-secondaryPurple">#02</span>
                    <span className="text-xs font-semibold text-white">Rahul Sharma</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '96%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-secondaryPurple"
                      />
                    </div>
                    <span className="text-[10px] font-black text-secondaryPurple">96%</span>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between p-2 rounded bg-white/2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-mutedGray">#03</span>
                    <span className="text-xs font-semibold text-white">David Miller</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '89%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-mutedGray"
                      />
                    </div>
                    <span className="text-[10px] font-black text-mutedGray">89%</span>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 3: Smart Scheduler */}
          <TiltCard className="hover:border-accentPink/30">
            <div className="absolute inset-0 bg-gradient-to-br from-accentPink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accentPink transition-colors">
                  Smart Interview Scheduler
                </h3>
                <p className="text-mutedGray text-sm max-w-sm">
                  Autonomous agents coordinate calendars, check availability, and send links automatically.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accentPink/10 text-accentPink border border-accentPink/20">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Visual: Calendar Interface */}
            <div className="relative flex-grow bg-[#0c102b]/60 rounded-lg p-4 border border-white/5 h-48 overflow-hidden flex flex-col justify-between text-left">
              <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] text-mutedGray font-semibold mb-2">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                <span className="opacity-30">28</span><span className="opacity-30">29</span><span className="opacity-30">30</span>
                <span>1</span><span className="text-accentPink font-bold">2</span><span>3</span><span>4</span>
                <span>5</span><span className="bg-primaryCyan/20 text-primaryCyan border border-primaryCyan/30 rounded p-0.5">6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                <span>12</span><span>13</span><span>14</span><span className="bg-secondaryPurple/20 text-secondaryPurple border border-secondaryPurple/30 rounded p-0.5">15</span><span>16</span><span>17</span><span>18</span>
              </div>
              <hr className="border-white/5" />
              <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primaryCyan animate-ping" />
                  <span className="font-semibold text-white">Interview Booked</span>
                </div>
                <span className="text-[10px] text-mutedGray">Sarah J. • Today 15:30</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 4: Recruiter Analytics */}
          <TiltCard className="hover:border-primaryCyan/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primaryCyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primaryCyan transition-colors">
                  Recruiter Analytics
                </h3>
                <p className="text-mutedGray text-sm max-w-sm">
                  Review hiring performance, channel conversions, and pipelines through high-fidelity dashboards.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primaryCyan/10 text-primaryCyan border border-primaryCyan/20">
                <BarChart2 className="w-6 h-6" />
              </div>
            </div>

            {/* Visual: Holographic SVG Chart */}
            <div className="relative flex-grow bg-[#0c102b]/60 rounded-lg p-4 border border-white/5 h-48 overflow-hidden flex flex-col justify-end">
              <svg viewBox="0 0 300 120" className="w-full h-[100px] overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="110" x2="300" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Filled Area */}
                <path
                  d="M 0 110 L 0 85 Q 50 40 100 65 T 200 25 T 300 45 L 300 110 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 0 85 Q 50 40 100 65 T 200 25 T 300 45"
                  fill="none"
                  stroke="#00F5D4"
                  strokeWidth="2.5"
                  className="glow-cyan-filter"
                />

                {/* Pulsing Nodes */}
                <circle cx="100" cy="65" r="4.5" fill="#7B61FF" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="200" cy="25" r="4.5" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="1" />

                {/* Tooltip */}
                <g transform="translate(165, 5)">
                  <rect width="70" height="18" rx="3" fill="#050816" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <text x="35" y="12" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                    Conversions: +42%
                  </text>
                </g>
              </svg>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
