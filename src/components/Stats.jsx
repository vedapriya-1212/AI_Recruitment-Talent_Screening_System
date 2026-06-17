import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Zap, Building } from 'lucide-react';

const statsData = [
  {
    id: 1,
    value: '10,000+',
    label: 'Candidates Screened',
    icon: Users,
    color: 'text-primaryCyan',
    glow: 'shadow-primaryCyan/5 hover:border-primaryCyan/30',
  },
  {
    id: 2,
    value: '98%',
    label: 'Accuracy Rate',
    icon: ShieldCheck,
    color: 'text-secondaryPurple',
    glow: 'shadow-secondaryPurple/5 hover:border-secondaryPurple/30',
  },
  {
    id: 3,
    value: '75%',
    label: 'Faster Hiring',
    icon: Zap,
    color: 'text-accentPink',
    glow: 'shadow-accentPink/5 hover:border-accentPink/30',
  },
  {
    id: 4,
    value: '500+',
    label: 'Companies Trust AI',
    icon: Building,
    color: 'text-primaryCyan',
    glow: 'shadow-primaryCyan/5 hover:border-primaryCyan/30',
  },
];

export default function Stats() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative py-20 overflow-hidden bg-darkBg">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`p-6 sm:p-8 rounded-xl glass-panel bg-white/5 border border-white/10 shadow-xl transition-all duration-300 ${stat.glow}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${stat.color}`}>
                    {stat.value}
                  </span>
                  <div className={`p-2.5 rounded-lg bg-white/5 border border-white/10 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-mutedGray uppercase tracking-wider">
                  {stat.label}
                </h4>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
