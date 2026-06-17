import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileSearch, Award, CalendarClock } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Job Posting',
    description: 'Configure and dispatch role parameters. Let the AI generate core competence coordinates.',
    icon: Briefcase,
    color: 'text-primaryGlow',
    bg: 'bg-primaryGlow/5',
    border: 'border-primaryGlow/20 hover:border-primaryGlow/40',
    shadow: 'shadow-[0_0_15px_rgba(79,250,240,0.05)]',
  },
  {
    id: 2,
    title: 'Resume Screening',
    description: 'AI core analyzes hundreds of files, semantic screening, and parsing skills in seconds.',
    icon: FileSearch,
    color: 'text-secondaryGlow',
    bg: 'bg-secondaryGlow/5',
    border: 'border-secondaryGlow/20 hover:border-secondaryGlow/40',
    shadow: 'shadow-[0_0_15px_rgba(124,107,255,0.05)]',
  },
  {
    id: 3,
    title: 'Candidate Ranking',
    description: 'Models evaluate score indices, generating a clean developer leaderboard based on skill.',
    icon: Award,
    color: 'text-accentGlow',
    bg: 'bg-accentGlow/5',
    border: 'border-accentGlow/20 hover:border-accentGlow/40',
    shadow: 'shadow-[0_0_15px_rgba(255,94,181,0.05)]',
  },
  {
    id: 4,
    title: 'Interview Booking',
    description: 'Calendar coordination agents interact with top talent, arranging schedules autonomously.',
    icon: CalendarClock,
    color: 'text-[#FFD166]',
    bg: 'bg-[#FFD166]/5',
    border: 'border-[#FFD166]/20 hover:border-[#FFD166]/40',
    shadow: 'shadow-[0_0_15px_rgba(255,209,102,0.05)]',
  },
];

export default function Workflow() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 90, damping: 15 },
    },
  };

  return (
    <section id="workflow" className="relative py-28 overflow-hidden bg-bgDark">
      {/* Background Orbs */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-secondaryGlow/5 filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 font-space"
          >
            <span className="text-xs font-bold text-primaryGlow uppercase tracking-wider">
              PIPELINE MECHANICS
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space uppercase"
          >
            How the <span className="gradient-text-cyan-purple">AI Hiring Engine</span> Works
          </motion.h2>
          <p className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base font-outfit">
            A linear progression of high-velocity automation driving candidates from source files to confirmed calendars.
          </p>
        </div>

        {/* Timeline Horizontal Layout */}
        <div className="relative mt-12">
          
          {/* Animated Connecting Neon Line */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] z-0 pointer-events-none">
            <svg className="w-full h-[6px] overflow-visible" fill="none">
              <path
                d="M 0 3 L 900 3"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1.5"
                id="workflow-connector-line"
              />
              <motion.path
                d="M 0 3 L 900 3"
                stroke="url(#workflowNeonGradient)"
                strokeWidth="2.5"
                strokeDasharray="50, 400"
                animate={{
                  strokeDashoffset: [-450, 450],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: 'linear',
                }}
              />
              <defs>
                <linearGradient id="workflowNeonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4FFAF0" />
                  <stop offset="40%" stopColor="#7C6BFF" />
                  <stop offset="70%" stopColor="#FF5EB5" />
                  <stop offset="100%" stopColor="#FFD166" />
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
                  whileHover={{ y: -6 }}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left group cursor-pointer"
                >
                  {/* Step Badge & Icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${step.bg} ${step.border} ${step.color} ${step.shadow} group-hover:scale-105 transition-all duration-300 relative mb-6`}
                  >
                    <Icon className="w-8 h-8" />
                    {/* Number Badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bgDark border border-white/10 text-[9px] font-black font-space flex items-center justify-center text-mutedGray group-hover:text-white group-hover:border-primaryGlow transition-all duration-300">
                      0{step.id}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primaryGlow transition-colors duration-300 font-space uppercase">
                    {step.title}
                  </h3>
                  <p className="text-mutedGray text-xs leading-relaxed max-w-xs font-outfit">
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
