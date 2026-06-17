import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';

export default function CTA({ onOpenModal }) {
  return (
    <section className="relative py-32 overflow-hidden bg-[#040612] text-center border-t border-white/5">
      {/* Background Neon Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-secondaryPurple/15 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primaryCyan/10 rounded-full filter blur-[90px] pointer-events-none z-0" style={{ animationDelay: '3s' }} />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-white/10 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primaryCyan animate-pulse" />
          <span className="text-xs font-semibold uppercase text-primaryCyan tracking-wider">
            Ready to upgrade?
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 50, damping: 12 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-6"
        >
          Ready To Transform <br className="hidden sm:inline" />
          <span className="gradient-text-cyan-purple font-black">Recruitment?</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-mutedGray text-base sm:text-lg max-w-lg mx-auto mb-12"
        >
          Hire smarter. Hire faster. Hire with AI. Connect your enterprise workforce pipelines to our neural matching core.
        </motion.p>

        {/* Massive Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={onOpenModal}
            className="px-10 py-5 rounded-2xl font-black text-base text-[#050816] bg-primaryCyan shadow-[0_0_25px_rgba(0,245,212,0.4)] hover:shadow-[0_0_50px_rgba(0,245,212,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 relative group overflow-hidden"
            id="cta-launch-btn"
          >
            <span className="relative z-10 flex items-center gap-2.5 font-black">
              Launch Platform <Rocket className="w-5 h-5" />
            </span>
            {/* Sliding Gloss Effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
