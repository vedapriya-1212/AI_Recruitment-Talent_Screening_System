import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';

export default function CTA({ onOpenModal }) {
  return (
    <section className="relative py-32 overflow-hidden bg-bgDark text-center border-t border-white/5">
      {/* Background Soft Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-secondaryGlow/10 rounded-full filter blur-[130px] pointer-events-none z-0 animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primaryGlow/5 rounded-full filter blur-[100px] pointer-events-none z-0" style={{ animationDelay: '2.5s' }} />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-primaryGlow animate-pulse" />
          <span className="text-xs font-bold uppercase text-primaryGlow tracking-widest font-space">
            Ready to upgrade?
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-6 font-space uppercase"
        >
          Ready To Transform <br className="hidden sm:inline" />
          <span className="gradient-text-cyan-purple font-black">Recruitment?</span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white text-lg sm:text-xl font-bold max-w-lg mx-auto mb-3 font-space uppercase tracking-wide"
        >
          Screen Faster. Rank Smarter. Hire Better.
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-mutedGray text-xs sm:text-sm max-w-md mx-auto mb-12 font-outfit"
        >
          Inject candidate data into the neural matching core and launch your high-performance enterprise dashboard.
        </motion.p>

        {/* Massive Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={onOpenModal}
            className="px-10 py-5 rounded-2xl font-black text-xs text-[#030712] bg-primaryGlow shadow-[0_0_20px_rgba(79,250,240,0.3)] hover:shadow-[0_0_40px_rgba(79,250,240,0.7)] hover:scale-105 active:scale-97 transition-all duration-300 relative group overflow-hidden cursor-pointer font-space uppercase tracking-widest"
            id="cta-launch-btn"
          >
            <span className="relative z-10 flex items-center gap-2.5 font-black">
              Launch AI Recruit <Rocket className="w-4 h-4 text-[#030712]" />
            </span>
            {/* Sliding Gloss */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
