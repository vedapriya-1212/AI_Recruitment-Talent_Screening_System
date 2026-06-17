import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Code, UserCheck, FileText, Calendar } from 'lucide-react';

export default function Hero({ onOpenModal }) {
  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden grid-bg"
    >
      {/* Background Ambient Glows */}
      <div className="glow-orb w-[500px] h-[500px] bg-secondaryPurple/20 -top-40 -left-40 animate-pulse-slow" />
      <div className="glow-orb w-[600px] h-[600px] bg-primaryCyan/15 -bottom-20 right-0 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Side Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 flex flex-col justify-center text-left"
        >
          {/* Tag */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-white/10 w-fit mb-6"
          >
            <Sparkles className="w-4 h-4 text-primaryCyan animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-primaryCyan uppercase">
              The Future of Hiring is Here
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-white"
          >
            <span className="block">Hire Smarter With</span>
            <span className="gradient-text-cyan-purple font-black inline-block py-1">
              AI Recruit
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-mutedGray">
              Recruit The Best Talent In Seconds
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-mutedGray text-base sm:text-lg leading-relaxed max-w-xl mb-10"
          >
            An intelligent neural talent platform that automatically ingests resumes, analyzes expertise, ranks matches, and conducts scheduling—allowing you to build world-class teams in minutes instead of months.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={onOpenModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-primaryCyan text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,212,0.4)] active:scale-95 transition-all duration-300 relative group overflow-hidden"
              id="hero-cta-get-started"
            >
              <span className="relative z-10 text-base font-extrabold">Get Started Now</span>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </button>

            <a
              href="#recommendation"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white glass-panel hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
              id="hero-cta-watch-demo"
            >
              <span>Watch Demo</span>
              <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>

        {/* Right Side Column: holographic 3D sphere */}
        <div className="lg:col-span-6 flex justify-center items-center relative h-[450px] sm:h-[600px] w-full mt-8 lg:mt-0">
          {/* Main Sphere Outer Container */}
          <div className="relative w-[320px] sm:w-[450px] h-[320px] sm:h-[450px] flex items-center justify-center">
            {/* Ambient Purple Backdrop Glow */}
            <div className="absolute w-[220px] h-[220px] rounded-full bg-secondaryPurple/35 filter blur-[60px] animate-pulse-slow" />

            {/* Orbit Ring 1: Outer Slow Cyan */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-primaryCyan/20"
            />

            {/* Orbit Ring 2: Middle Reverse Purple */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
              className="absolute inset-[30px] rounded-full border border-dotted border-secondaryPurple/20"
            />

            {/* SVG Glowing Sphere Core & Connections */}
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_rgba(0,245,212,0.2)]"
            >
              {/* Central Sphere Core */}
              <defs>
                <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#7B61FF" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#050816" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="100" fill="url(#sphereGlow)" className="animate-pulse" />

              {/* Glowing Inner Ring */}
              <circle
                cx="200"
                cy="200"
                r="70"
                fill="none"
                stroke="rgba(0, 245, 212, 0.4)"
                strokeWidth="1"
                strokeDasharray="5,15"
                className="animate-spin-slow"
              />

              {/* Neural Net Coordinates / Nodes */}
              <g className="opacity-70">
                <circle cx="200" cy="90" r="4" fill="#00F5D4" />
                <circle cx="310" cy="200" r="4" fill="#00F5D4" />
                <circle cx="200" cy="310" r="4" fill="#7B61FF" />
                <circle cx="90" cy="200" r="4" fill="#7B61FF" />
                <circle cx="277" cy="123" r="3" fill="#FF4D8D" />
                <circle cx="123" cy="277" r="3" fill="#FF4D8D" />
                <circle cx="277" cy="277" r="3" fill="#00F5D4" />
                <circle cx="123" cy="123" r="3" fill="#7B61FF" />

                {/* Connection Lines */}
                <line x1="200" y1="90" x2="310" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="310" y1="200" x2="200" y2="310" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="200" y1="310" x2="90" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="90" y1="200" x2="200" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="123" y1="123" x2="277" y2="277" stroke="rgba(0, 245, 212, 0.15)" strokeWidth="1" />
                <line x1="277" y1="123" x2="123" y2="277" stroke="rgba(123, 97, 255, 0.15)" strokeWidth="1" />
              </g>
            </svg>

            {/* Sweep Laser Scan effect */}
            <motion.div
              animate={{
                y: ['-45%', '145%', '-45%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: 'easeInOut',
              }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primaryCyan to-transparent opacity-65 drop-shadow-[0_0_10px_#00F5D4]"
            />

            {/* Floating Glass Cards Orbiting (CSS & Framer Motion positioned) */}
            {/* Card 1: Candidate Profile */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'easeInOut',
              }}
              className="absolute -top-4 left-6 sm:-left-6 p-3 rounded-lg glass-panel text-left flex items-center gap-3 border-white/10 shadow-lg glow-cyan"
            >
              <div className="w-8 h-8 rounded-full bg-primaryCyan/20 flex items-center justify-center text-primaryCyan">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-mutedGray uppercase font-semibold">Candidate Match</p>
                <p className="text-xs font-bold text-white">Sarah Jenkins • 98%</p>
              </div>
            </motion.div>

            {/* Card 2: Resume Scanning */}
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute bottom-6 -right-4 sm:-right-8 p-3 rounded-lg glass-panel text-left flex items-center gap-3 border-white/10 shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-accentPink/20 flex items-center justify-center text-accentPink">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-mutedGray uppercase font-semibold">Neural Screening</p>
                <p className="text-xs font-bold text-white">Resume_SeniorDev.pdf</p>
              </div>
            </motion.div>

            {/* Card 3: Interview Scheduler */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
                ease: 'easeInOut',
                delay: 2,
              }}
              className="absolute -bottom-8 left-8 sm:left-4 p-3 rounded-lg glass-panel text-left flex items-center gap-3 border-white/10 shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-secondaryPurple/20 flex items-center justify-center text-secondaryPurple">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-mutedGray uppercase font-semibold">Auto Scheduler</p>
                <p className="text-xs font-bold text-white">Interview Booked 14:00</p>
              </div>
            </motion.div>

            {/* Holographic Data point indicator */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-primaryCyan shadow-[0_0_12px_#00F5D4]"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
              className="absolute bottom-1/3 left-16 w-2.5 h-2.5 rounded-full bg-accentPink shadow-[0_0_12px_#FF4D8D]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
