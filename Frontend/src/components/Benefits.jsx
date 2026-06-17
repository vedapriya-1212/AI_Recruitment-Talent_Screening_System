import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export default function Benefits() {
  const leftCardVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 70, damping: 15 },
    },
  };

  const rightCardVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 70, damping: 15 },
    },
  };

  return (
    <section className="relative py-28 overflow-hidden bg-bgDark border-b border-white/5">
      {/* Glow Orbs */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accentGlow/5 filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 font-space"
          >
            <span className="text-xs font-bold text-primaryGlow uppercase tracking-wider">
              Strategic Edge
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space uppercase"
          >
            Upgrade Your <span className="gradient-text-cyan-purple">Hiring Paradigm</span>
          </motion.h2>
          <p className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base font-outfit">
            A side-by-side performance breakdown demonstrating the strategic improvements across operational metrics.
          </p>
        </div>

        {/* Side by Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Traditional Hiring Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={leftCardVariants}
            className="p-8 rounded-2xl glass-panel bg-[#071021]/10 border border-white/5 flex flex-col justify-between hover:border-error/20 transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-error/10 text-error border border-error/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white font-space uppercase">Traditional Hiring</h3>
              </div>
              <p className="text-mutedGray text-xs mb-8 leading-relaxed font-outfit">
                Linear manual methodologies suffer from operational fatigue, screening bottlenecks, and high costs.
              </p>

              <hr className="border-white/5 mb-8" />

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-4 h-4 text-error shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-space">Manual Screening</h4>
                    <p className="text-xs mt-0.5 font-outfit">Recruiters spend days reading PDF resumes manually, missing profiles.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-4 h-4 text-error shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-space">Slow Hiring Velocity</h4>
                    <p className="text-xs mt-0.5 font-outfit">Typical recruitment cycles drag on for 30 to 45 days, losing top engineers.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-4 h-4 text-error shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-space">Subjective Bias</h4>
                    <p className="text-xs mt-0.5 font-outfit">Unconscious human bias compromises screening consistency and candidate diversity.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Metrics Chart Mini */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <div>
                <div className="flex justify-between text-[10px] text-mutedGray uppercase font-bold font-space mb-1">
                  <span>Average Screening Time</span>
                  <span>45 Days</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-error rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-mutedGray uppercase font-bold font-space mb-1">
                  <span>Match Accuracy</span>
                  <span>58%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-error rounded-full" style={{ width: '58%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Hiring Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={rightCardVariants}
            className="p-8 rounded-2xl glass-panel bg-[#071021]/30 border border-white/10 shadow-2xl flex flex-col justify-between hover:border-primaryGlow/30 transition-all duration-300 relative overflow-hidden"
          >
            {/* Top gradient glow overlay */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-primaryGlow/5 rounded-full filter blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 shadow-[0_0_15px_rgba(79,250,240,0.15)]">
                  <Cpu className="w-5 h-5 animate-pulse text-primaryGlow" />
                </div>
                <h3 className="text-xl font-bold text-white font-space uppercase">AI-Powered Recruit</h3>
              </div>
              <p className="text-mutedGray text-xs mb-8 leading-relaxed font-outfit">
                Autonomous screening engines orchestrate candidate matches instantly, maximizing precision.
              </p>

              <hr className="border-white/8 mb-8" />

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-4 h-4 text-primaryGlow shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-space">Instant Automated Screening</h4>
                    <p className="text-xs mt-0.5 font-outfit">Semantics models ingest and score resumes in less than 2 seconds.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-4 h-4 text-primaryGlow shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-space">Smart Match Ranking</h4>
                    <p className="text-xs mt-0.5 font-outfit">High-precision score indexes stack candidate alignment board based on competency.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-4 h-4 text-primaryGlow shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-space">Data-Driven Neutrality</h4>
                    <p className="text-xs mt-0.5 font-outfit">Models evaluate raw technical skill variables, removing demographics indicator bias.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Metrics Chart Mini */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
              <div>
                <div className="flex justify-between text-[10px] text-mutedGray uppercase font-bold font-space mb-1">
                  <span>Average Screening Time</span>
                  <span>2 Days</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '4%' }}
                    viewport={{ once: true }}
                    className="h-full bg-primaryGlow rounded-full shadow-[0_0_8px_#4FFAF0]"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-mutedGray uppercase font-bold font-space mb-1">
                  <span>Match Accuracy</span>
                  <span>98%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '98%' }}
                    viewport={{ once: true }}
                    className="h-full bg-primaryGlow rounded-full shadow-[0_0_8px_#4FFAF0]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
