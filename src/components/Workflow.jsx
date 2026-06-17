import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileSearch, Trophy, CalendarCheck } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Job Posting',
    description: 'Inject your custom profile requirements and create high-converting job parameters in seconds.',
    icon: Briefcase,
    color: 'text-primaryCyan',
    bg: 'bg-primaryCyan/10',
    border: 'border-primaryCyan/20',
  },
  {
    id: 2,
    title: 'Resume Screening',
    description: 'AI core instantly analyzes hundreds of CV structures, screening skills and experience semantic matching.',
    icon: FileSearch,
    color: 'text-secondaryPurple',
    bg: 'bg-secondaryPurple/10',
    border: 'border-secondaryPurple/20',
  },
  {
    id: 3,
    title: 'Candidate Ranking',
    description: 'Neural models calculate score indices and generate clean stack leaderboards based on actual technical fit.',
    icon: Trophy,
    color: 'text-accentPink',
    bg: 'bg-accentPink/10',
    border: 'border-accentPink/20',
  },
  {
    id: 4,
    title: 'Interview Scheduling',
    description: 'Calendar coordination agents interact directly with top matches, arranging calendars completely autonomously.',
    icon: CalendarCheck,
    color: 'text-primaryCyan',
    bg: 'bg-primaryCyan/10',
    border: 'border-primaryCyan/20',
  },
];

export default function Workflow() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 },
    },
  };

  return (
    <section id="workflow" className="relative py-28 overflow-hidden bg-darkBg">
      {/* Background glow orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-secondaryPurple/10 top-1/4 left-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Title */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full glass-panel border-white/10 mb-4"
          >
            <span className="text-xs font-bold text-secondaryPurple uppercase tracking-wider">
              Operation Pipeline
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
          >
            How The <span className="gradient-text-cyan-purple">AI Hiring Engine</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base"
          >
            Four intelligent automated phases connecting your job requirements directly to high-performing technical hires.
          </motion.p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Connecting Glowing Lines for Desktop (SVG path animation) */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] z-0 pointer-events-none">
            <svg className="w-full h-[6px] overflow-visible" fill="none">
              <path
                d="M 0 3 L 800 3"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2"
                id="workflow-connector-line"
              />
              <motion.path
                d="M 0 3 L 800 3"
                stroke="url(#neonGradient)"
                strokeWidth="3"
                strokeDasharray="40, 360"
                animate={{
                  strokeDashoffset: [-400, 400],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: 'linear',
                }}
              />
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7B61FF" />
                  <stop offset="50%" stopColor="#00F5D4" />
                  <stop offset="100%" stopColor="#FF4D8D" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  variants={cardVariants}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left group"
                >
                  {/* Step Icon Node */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${step.bg} ${step.border} ${step.color} shadow-lg mb-6 group-hover:shadow-[0_0_20px_rgba(0,245,212,0.15)] transition-all duration-300 relative`}
                  >
                    <Icon className="w-9 h-9" />
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-darkBg border border-white/10 text-[10px] font-bold flex items-center justify-center text-mutedGray group-hover:text-white group-hover:border-primaryCyan transition-colors">
                      0{step.id}
                    </div>
                  </motion.div>

                  {/* Step Text Info */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primaryCyan transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-mutedGray text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
