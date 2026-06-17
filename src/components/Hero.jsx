import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, User, FileText, CalendarCheck, ShieldCheck, Cpu } from 'lucide-react';

export default function Hero({ onOpenModal }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 90, damping: 15 },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden"
    >
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primaryGlow/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondaryGlow/5 filter blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Copy & Call-To-Action */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 flex flex-col justify-center text-left"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mb-6 shadow-[0_0_15px_rgba(79,250,240,0.05)]"
          >
            <Sparkles className="w-4 h-4 text-primaryGlow animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-primaryGlow uppercase font-space">
              THE FUTURE OF AI HIRING
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-[54px] font-black tracking-tight leading-[1.08] mb-6 text-white font-space uppercase"
          >
            <span className="block mb-2">Hire Smarter With AI</span>
            <span className="gradient-text-rainbow font-black block mb-2">
              Recruit Exceptional Talent Instantly
            </span>
            <span className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold tracking-wide text-[#94A3B8] block capitalize">
              Powered By Intelligent Screening
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-mutedGray text-sm sm:text-base leading-relaxed max-w-xl mb-10 font-outfit"
          >
            AI-powered recruitment intelligence platform that automatically screens resumes, ranks candidates, schedules interviews, and helps recruiters discover top talent faster than ever.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            {/* Get Started Button */}
            <motion.button
              onClick={onOpenModal}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-primaryGlow text-[#030712] shadow-[0_0_20px_rgba(79,250,240,0.3)] hover:shadow-[0_0_35px_rgba(79,250,240,0.6)] transition-all duration-300 relative group overflow-hidden cursor-pointer font-space uppercase tracking-wider"
              id="hero-cta-get-started"
            >
              <span className="relative z-10 text-xs font-black">Get Started</span>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </motion.button>

            {/* Watch Demo Button */}
            <motion.a
              href="#recommendation"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-white/3 border border-white/8 hover:bg-white/7 hover:border-white/15 transition-all duration-300 flex items-center justify-center gap-2 group font-space text-xs uppercase tracking-wider"
              id="hero-cta-watch-demo"
            >
              <span>Watch Demo</span>
              <Play className="w-3.5 h-3.5 fill-white text-white group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: 3D AI Core (Floating Neural Engine) */}
        <div className="lg:col-span-6 flex justify-center items-center relative h-[500px] sm:h-[600px] w-full mt-12 lg:mt-0 preserve-3d">
          
          {/* Main Visual Core Container */}
          <div className="relative w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] flex items-center justify-center">
            
            {/* Ambient Purple/Pink Background Glow */}
            <div className="absolute w-[240px] h-[240px] rounded-full bg-secondaryGlow/20 filter blur-[80px] animate-pulse-slow" />
            <div className="absolute w-[180px] h-[180px] rounded-full bg-accentGlow/10 filter blur-[60px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

            {/* Orbit Ring 1: Outer Holographic Ring (Slow Rotate) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-primaryGlow/20 shadow-[0_0_20px_rgba(79,250,240,0.05)]"
            />

            {/* Orbit Ring 2: Inner Ring (Reverse Rotate) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="absolute inset-[40px] rounded-full border border-dotted border-secondaryGlow/25"
            />

            {/* Core Neural Connections SVG */}
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(79,250,240,0.2)]"
            >
              {/* Radial Gradients */}
              <defs>
                <radialGradient id="aiCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4FFAF0" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#7C6BFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Center Glowing AI Orb */}
              <circle cx="200" cy="200" r="85" fill="url(#aiCoreGlow)" className="animate-pulse" />

              {/* Pulsing Scanning Radar Rings */}
              <motion.circle
                cx="200"
                cy="200"
                r="60"
                fill="none"
                stroke="rgba(79, 250, 240, 0.4)"
                strokeWidth="1.5"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              />

              <motion.circle
                cx="200"
                cy="200"
                r="75"
                fill="none"
                stroke="rgba(124, 107, 255, 0.3)"
                strokeWidth="1"
                animate={{ scale: [1.3, 0.9, 1.3], opacity: [0.2, 0.6, 0.2] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              />

              {/* Neural Paths (Static & Animated) */}
              <g className="opacity-60">
                {/* Node coordinates: candidate (200, 70), resume (320, 200), company (200, 330), recruiter (80, 200) */}
                {/* Connecting Lines */}
                <line x1="200" y1="70" x2="320" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="320" y1="200" x2="200" y2="330" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="200" y1="330" x2="80" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="80" y1="200" x2="200" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Diagonal links */}
                <line x1="115" y1="115" x2="285" y2="285" stroke="rgba(79, 250, 240, 0.15)" strokeWidth="1" />
                <line x1="285" y1="115" x2="115" y2="285" stroke="rgba(124, 107, 255, 0.15)" strokeWidth="1" />

                {/* Animated impulses flowing between nodes */}
                <motion.circle cx="200" cy="70" r="3" fill="#4FFAF0" />
                <motion.circle cx="320" cy="200" r="3" fill="#7C6BFF" />
                <motion.circle cx="200" cy="330" r="3" fill="#FF5EB5" />
                <motion.circle cx="80" cy="200" r="3" fill="#FFD166" />
              </g>
            </svg>

            {/* Sweep Laser Scan line */}
            <motion.div
              animate={{
                y: ['-45%', '145%', '-45%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: 'easeInOut',
              }}
              className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primaryGlow to-transparent opacity-85 pointer-events-none shadow-[0_0_8px_#4FFAF0]"
            />

            {/* Floating ORB Core Icon */}
            <div className="absolute z-10 w-24 h-24 rounded-full bg-bgDark/80 border border-primaryGlow/30 shadow-[0_0_25px_rgba(79,250,240,0.25)] flex items-center justify-center group cursor-pointer hover:border-primaryGlow transition-colors duration-300">
              <Cpu className="w-10 h-10 text-primaryGlow animate-pulse-slow" />
            </div>

            {/* FOUR SATELLITE NODES */}
            {/* Candidate Node */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute top-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-primaryGlow/10 border border-primaryGlow/30 flex items-center justify-center text-primaryGlow shadow-[0_0_10px_rgba(79,250,240,0.15)]">
                <User className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Resume Node */}
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute right-[8%] top-1/2 -translate-y-1/2 flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-secondaryGlow/10 border border-secondaryGlow/30 flex items-center justify-center text-secondaryGlow shadow-[0_0_10px_rgba(124,107,255,0.15)]">
                <FileText className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Company Node */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
              className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-accentGlow/10 border border-accentGlow/30 flex items-center justify-center text-accentGlow shadow-[0_0_10px_rgba(255,94,181,0.15)]">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Recruiter Node */}
            <motion.div
              animate={{ x: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
              className="absolute left-[8%] top-1/2 -translate-y-1/2 flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFD166]/10 border border-[#FFD166]/30 flex items-center justify-center text-[#FFD166] shadow-[0_0_10px_rgba(255,209,102,0.15)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </motion.div>

            {/* 4 FLOATING GLASS CARDS */}
            {/* Card 1: Candidate Match */}
            <motion.div
              animate={{ y: [0, -12, 0], x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute -top-4 -left-12 p-3.5 rounded-xl glass-panel text-left flex items-start gap-3 border-white/8 shadow-2xl max-w-[170px]"
            >
              <div className="w-7 h-7 rounded-lg bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] text-mutedGray uppercase tracking-widest font-black font-space">Candidate Match</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">Sarah Jenkins</p>
                <p className="text-[10px] text-primaryGlow font-black mt-0.5">98% Match</p>
                <div className="flex gap-1 flex-wrap mt-1.5">
                  <span className="text-[8px] bg-white/5 border border-white/8 px-1 py-0.2 rounded text-mutedGray">React</span>
                  <span className="text-[8px] bg-white/5 border border-white/8 px-1 py-0.2 rounded text-mutedGray">Node.js</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Resume Analysis */}
            <motion.div
              animate={{ y: [0, 12, 0], x: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-4 -right-12 p-3.5 rounded-xl glass-panel text-left flex items-start gap-3 border-white/8 shadow-2xl max-w-[170px]"
            >
              <div className="w-7 h-7 rounded-lg bg-secondaryGlow/10 border border-secondaryGlow/25 text-secondaryGlow flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] text-mutedGray uppercase tracking-widest font-black font-space">Resume Analysis</p>
                <p className="text-xs font-bold text-white mt-0.5">Skills Detected</p>
                <p className="text-[9px] text-mutedGray mt-0.5 truncate">React, Python, SQL, ML</p>
                <p className="text-[10px] text-secondaryGlow font-black mt-1">Score: 94%</p>
              </div>
            </motion.div>

            {/* Card 3: Interview Scheduled */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -left-8 p-3.5 rounded-xl glass-panel text-left flex items-start gap-3 border-white/8 shadow-2xl max-w-[170px]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FFD166]/10 border border-[#FFD166]/25 text-[#FFD166] flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] text-mutedGray uppercase tracking-widest font-black font-space">Interview</p>
                <p className="text-xs font-bold text-white mt-0.5">Date: Today</p>
                <p className="text-[10px] text-mutedGray mt-0.5">Time: 2:00 PM</p>
                <span className="inline-block mt-1 text-[8px] bg-success/10 text-success border border-success/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                  Confirmed
                </span>
              </div>
            </motion.div>

            {/* Card 4: AI Recommendation */}
            <motion.div
              animate={{ y: [0, 8, 0], x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 6.8, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-0 -right-10 p-3.5 rounded-xl glass-panel text-left flex items-start gap-3 border-white/8 shadow-2xl max-w-[180px]"
            >
              <div className="w-7 h-7 rounded-lg bg-accentGlow/10 border border-accentGlow/25 text-accentGlow flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] text-mutedGray uppercase tracking-widest font-black font-space">AI Recommendation</p>
                <p className="text-[11px] font-bold text-white mt-0.5 leading-snug">Proceed To Technical Interview</p>
                <p className="text-[10px] text-accentGlow font-black mt-1">Confidence: 97%</p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
