import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, Calendar, BarChart3 } from 'lucide-react';

function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const factor = 8; // Max 8 degrees tilt
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
        transition: 'transform 0.15s ease-out',
      }}
      className={`glass-panel rounded-2xl bg-[#071021]/30 border border-white/6 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col h-full relative group ${className}`}
    >
      {children}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden bg-bgDark">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[5%] w-[450px] h-[450px] rounded-full bg-primaryGlow/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-accentGlow/5 filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 font-space"
          >
            <span className="text-xs font-bold text-primaryGlow uppercase tracking-wider">
              OPERATIONAL MODULES
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space uppercase"
          >
            Engineered For <span className="gradient-text-cyan-purple">Talent Acquisition</span>
          </motion.h2>
          <p className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base font-outfit">
            Next-generation modules replacing manually intensive legacy tasks with automated workflows.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: AI Resume Screening */}
          <TiltCard className="hover:border-primaryGlow/30 hover:shadow-[0_10px_35px_rgba(0,0,0,0.5),_0_0_20px_rgba(79,250,240,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primaryGlow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primaryGlow transition-colors duration-300 font-space uppercase">
                  AI Resume Screening
                </h3>
                <p className="text-mutedGray text-xs max-w-sm font-outfit">
                  Analyze technical background coordinates and index expertise semantically in real time.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 shadow-[0_0_10px_rgba(79,250,240,0.1)]">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Mini Demo */}
            <div className="relative flex-grow bg-bgDark/80 rounded-xl p-5 border border-white/5 h-48 overflow-hidden flex flex-col justify-between">
              {/* Scan sweep laser */}
              <motion.div
                animate={{
                  y: [-10, 190, -10],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3.5,
                  ease: 'easeInOut',
                }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primaryGlow to-transparent opacity-90 z-20 pointer-events-none"
                style={{ boxShadow: '0 0 8px #4FFAF0' }}
              />

              {/* Ingested File Details */}
              <div className="space-y-3 opacity-90 relative z-10 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white font-space">
                    CV
                  </div>
                  <div>
                    <div className="h-2.5 w-24 bg-white/20 rounded" />
                    <div className="h-1.5 w-16 bg-white/10 rounded mt-1.5" />
                  </div>
                </div>
                <hr className="border-white/5" />
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/15 rounded" />
                  <div className="h-1.5 w-5/6 bg-white/10 rounded" />
                  <div className="h-1.5 w-4/5 bg-white/10 rounded" />
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex gap-2 relative z-10 mt-4 flex-wrap">
                <span className="text-[9px] bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 px-2 py-0.5 rounded font-black font-space uppercase">
                  React.js • Expert
                </span>
                <span className="text-[9px] bg-secondaryGlow/10 text-secondaryGlow border border-secondaryGlow/25 px-2 py-0.5 rounded font-black font-space uppercase">
                  Node.js • Senior
                </span>
                <span className="text-[9px] bg-white/5 text-mutedGray border border-white/10 px-2 py-0.5 rounded">
                  Kubernetes
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: Candidate Ranking */}
          <TiltCard className="hover:border-secondaryGlow/30 hover:shadow-[0_10px_35px_rgba(0,0,0,0.5),_0_0_20px_rgba(124,107,255,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-secondaryGlow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-secondaryGlow transition-colors duration-300 font-space uppercase">
                  Candidate Ranking
                </h3>
                <p className="text-mutedGray text-xs max-w-sm font-outfit">
                  Leaderboard systems stack potential hires according to precision alignment algorithms.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondaryGlow/10 text-secondaryGlow border border-secondaryGlow/25 shadow-[0_0_10px_rgba(124,107,255,0.1)]">
                <Award className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Mini Demo */}
            <div className="relative flex-grow bg-bgDark/80 rounded-xl p-4 border border-white/5 h-48 overflow-hidden flex flex-col justify-between text-left">
              <div className="space-y-2">
                {/* #1 Candidate */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primaryGlow font-space">#01</span>
                    <span className="text-xs font-bold text-white">Sarah Jenkins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '98%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full bg-primaryGlow"
                      />
                    </div>
                    <span className="text-[9px] font-black text-primaryGlow font-space">98%</span>
                  </div>
                </div>

                {/* #2 Candidate */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-secondaryGlow font-space">#02</span>
                    <span className="text-xs font-bold text-white">Rahul Sharma</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '96%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="h-full bg-secondaryGlow"
                      />
                    </div>
                    <span className="text-[9px] font-black text-secondaryGlow font-space">96%</span>
                  </div>
                </div>

                {/* #3 Candidate */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-mutedGray font-space">#03</span>
                    <span className="text-xs font-bold text-white">David Miller</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '91%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-mutedGray"
                      />
                    </div>
                    <span className="text-[9px] font-black text-mutedGray font-space">91%</span>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 3: Interview Scheduler */}
          <TiltCard className="hover:border-accentGlow/30 hover:shadow-[0_10px_35px_rgba(0,0,0,0.5),_0_0_20px_rgba(255,94,181,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-accentGlow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accentGlow transition-colors duration-300 font-space uppercase">
                  Interview Scheduler
                </h3>
                <p className="text-mutedGray text-xs max-w-sm font-outfit">
                  Coordinate corporate availability and dispatch interview paths automatically.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accentGlow/10 text-accentGlow border border-accentGlow/25 shadow-[0_0_10px_rgba(255,94,181,0.1)]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Mini Demo */}
            <div className="relative flex-grow bg-bgDark/80 rounded-xl p-4 border border-white/5 h-48 overflow-hidden flex flex-col justify-between text-left">
              <div className="grid grid-cols-7 gap-1 text-center text-[8px] text-mutedGray font-bold font-space">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                <span className="opacity-20">26</span><span className="opacity-20">27</span><span className="opacity-20">28</span>
                <span>1</span><span className="text-accentGlow font-black">2</span><span>3</span><span>4</span>
                <span>5</span><span className="bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/20 rounded p-0.5">6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                <span>12</span><span>13</span><span>14</span><span className="bg-secondaryGlow/10 text-secondaryGlow border border-secondaryGlow/20 rounded p-0.5">15</span><span>16</span><span>17</span><span>18</span>
              </div>
              <hr className="border-white/5" />
              <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow animate-ping" />
                  <span className="font-bold text-white font-space text-[10px] uppercase">Slot Confirmed</span>
                </div>
                <span className="text-[9px] text-mutedGray font-outfit">Sarah J. • Today 2:00 PM</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 4: Recruiter Analytics */}
          <TiltCard className="hover:border-primaryGlow/30 hover:shadow-[0_10px_35px_rgba(0,0,0,0.5),_0_0_20px_rgba(79,250,240,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primaryGlow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primaryGlow transition-colors duration-300 font-space uppercase">
                  Recruiter Analytics
                </h3>
                <p className="text-mutedGray text-xs max-w-sm font-outfit">
                  Track performance indices, screening velocity, and pipeline conversions.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 shadow-[0_0_10px_rgba(79,250,240,0.1)]">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Mini Demo */}
            <div className="relative flex-grow bg-bgDark/80 rounded-xl p-4 border border-white/5 h-48 overflow-hidden flex flex-col justify-end">
              <svg viewBox="0 0 300 110" className="w-full h-[95px] overflow-visible">
                <defs>
                  <linearGradient id="glowChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4FFAF0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7C6BFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="55" x2="300" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                {/* Line Background Area */}
                <path
                  d="M 0 90 L 0 70 Q 50 35 100 55 T 200 20 T 300 35 L 300 90 Z"
                  fill="url(#glowChartGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 0 70 Q 50 35 100 55 T 200 20 T 300 35"
                  fill="none"
                  stroke="#4FFAF0"
                  strokeWidth="2"
                  className="glow-primary-filter"
                />

                {/* Nodes */}
                <circle cx="100" cy="55" r="4.5" fill="#7C6BFF" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="200" cy="20" r="4.5" fill="#4FFAF0" stroke="#FFFFFF" strokeWidth="1" />

                {/* Tooltip Tag */}
                <g transform="translate(165, -5)">
                  <rect width="65" height="18" rx="4" fill="#030712" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <text x="32.5" y="11.5" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
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
