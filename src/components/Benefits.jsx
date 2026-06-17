import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export default function Benefits() {
  const leftCardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 50, damping: 12 },
    },
  };

  const rightCardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 50, damping: 12 },
    },
  };

  return (
    <section className="relative py-28 overflow-hidden bg-darkBg">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full glass-panel border-white/10 mb-4"
          >
            <span className="text-xs font-bold text-primaryCyan uppercase tracking-wider">
              Strategic Edge
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
          >
            Upgrade Your <span className="gradient-text-cyan-purple">Hiring Paradigm</span>
          </motion.h2>
          <p className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Quantify the upgrade in performance indicators across workflows, conversion velocities, and team qualities.
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
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-2xl glass-panel bg-white/3 border-white/5 flex flex-col justify-between hover:border-red-500/20 transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Traditional Hiring</h3>
              </div>
              <p className="text-mutedGray text-sm mb-8 leading-relaxed">
                Linear manual methodologies suffer from operational fatigue, bottlenecks, and inconsistent skill matching.
              </p>

              <hr className="border-white/5 mb-8" />

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Manual Screening</h4>
                    <p className="text-xs mt-0.5">Recruiters spend hours manually reading PDF resumes, missing keywords.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Slow Hiring Velocity</h4>
                    <p className="text-xs mt-0.5">Typical recruitment cycle drags on for 30 to 45 days, losing top talent.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Subjective Human Bias</h4>
                    <p className="text-xs mt-0.5">Unconscious bias compromises candidate quality and diversity indices.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Large Task Overload</h4>
                    <p className="text-xs mt-0.5">Recruiters are overwhelmed coordinating schedules and follow-up emails.</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* AI Hiring Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={rightCardVariants}
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-2xl glass-panel bg-white/5 border border-white/10 shadow-2xl flex flex-col justify-between neon-border-cyan hover:border-primaryCyan/40 transition-all duration-300 relative overflow-hidden"
          >
            {/* Top gradient glow overlay */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-primaryCyan/10 rounded-full filter blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg bg-primaryCyan/10 text-primaryCyan border border-primaryCyan/20">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI-Powered Recruit</h3>
              </div>
              <p className="text-mutedGray text-sm mb-8 leading-relaxed">
                Autonomous screening agents orchestrate candidate matches instantly, prioritizing accuracy and velocity.
              </p>

              <hr className="border-white/10 mb-8" />

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-5 h-5 text-primaryCyan shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Instant Automated Screening</h4>
                    <p className="text-xs mt-0.5">Semantics models ingest and screen resumes in less than 2 seconds.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-5 h-5 text-primaryCyan shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Smart Match Ranking</h4>
                    <p className="text-xs mt-0.5">Algorithmic scoring builds stacked leaderboards based on strict competence fit.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-5 h-5 text-primaryCyan shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Data-Driven Bias Reduction</h4>
                    <p className="text-xs mt-0.5">Blind profile screening models remove human indicators, evaluating only pure skill.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-mutedGray">
                  <CheckCircle className="w-5 h-5 text-primaryCyan shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Automated Calendar Coordination</h4>
                    <p className="text-xs mt-0.5">Coordination agents automatically align availability and dispatch meeting requests.</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
