import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Briefcase, Users, Building } from 'lucide-react';

export default function BrainShowcase() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        color: Math.random() > 0.5 ? '#4FFAF0' : '#7C6BFF',
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        const driftX = mousePos.x * 20;
        const driftY = mousePos.y * 20;

        ctx.beginPath();
        ctx.arc(p.x + driftX, p.y + driftY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  const driftBrain = {
    x: mousePos.x * 10,
    y: mousePos.y * 10,
  };

  const driftNodes = {
    x: mousePos.x * 25,
    y: mousePos.y * 25,
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[650px] sm:min-h-[750px] flex items-center justify-center py-20 overflow-hidden bg-bgDark cursor-crosshair border-b border-white/5"
    >
      {/* Canvas Particle Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 neural-grid-bg opacity-20 pointer-events-none z-0" />

      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-secondaryGlow/5 filter blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-center justify-center relative z-10 text-center">
        
        {/* Title */}
        <div className="mb-14 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 font-space"
          >
            <span className="text-xs font-bold text-accentGlow uppercase tracking-wider">
              Talent Synapse
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space uppercase"
          >
            The Neural <span className="gradient-text-cyan-purple">Recruitment Core</span>
          </motion.h2>
          <p className="text-mutedGray text-sm sm:text-base mt-4 font-outfit">
            A centralized AI engine that continuously analyzes candidates, resumes, recruiters, and company requirements.
          </p>
        </div>

        {/* 3D Neural Map */}
        <div className="relative w-full max-w-[320px] sm:max-w-[550px] h-[350px] sm:h-[450px] flex items-center justify-center">
          
          {/* Bezier connector lines SVG */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 500 400">
            {/* Bezier Pathways to Satellite Nodes (Center is cx=250, cy=200) */}
            {/* Top Left: Resumes (70, 70) */}
            <path d="M 250 200 Q 150 120 70 70" stroke="rgba(79, 250, 240, 0.15)" strokeWidth="1.5" fill="none" />
            <motion.path
              d="M 250 200 Q 150 120 70 70"
              stroke="#4FFAF0"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10, 80"
              animate={{ strokeDashoffset: [0, 180] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />

            {/* Top Right: Recruiters (430, 70) */}
            <path d="M 250 200 Q 350 120 430 70" stroke="rgba(124, 107, 255, 0.15)" strokeWidth="1.5" fill="none" />
            <motion.path
              d="M 250 200 Q 350 120 430 70"
              stroke="#7C6BFF"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10, 80"
              animate={{ strokeDashoffset: [0, -180] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />

            {/* Bottom Left: Candidates (70, 330) */}
            <path d="M 250 200 Q 150 280 70 330" stroke="rgba(255, 94, 181, 0.15)" strokeWidth="1.5" fill="none" />
            <motion.path
              d="M 250 200 Q 150 280 70 330"
              stroke="#FF5EB5"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10, 80"
              animate={{ strokeDashoffset: [0, 180] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />

            {/* Bottom Right: Companies (430, 330) */}
            <path d="M 250 200 Q 350 280 430 330" stroke="rgba(79, 250, 240, 0.15)" strokeWidth="1.5" fill="none" />
            <motion.path
              d="M 250 200 Q 350 280 430 330"
              stroke="#4FFAF0"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10, 80"
              animate={{ strokeDashoffset: [0, -180] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />
          </svg>

          {/* Central AI Processor Core (Drifts slightly) */}
          <div
            style={{
              transform: `translate(${driftBrain.x}px, ${driftBrain.y}px)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="absolute z-20 w-28 h-28 sm:w-36 sm:h-36 rounded-full glass-panel neon-border-primary flex items-center justify-center bg-white/4 shadow-2xl relative"
          >
            {/* Spinning background rings */}
            <div className="absolute inset-[-10px] rounded-full border border-dashed border-primaryGlow/25 animate-spin-slow pointer-events-none" />
            <div className="absolute inset-[-20px] rounded-full border border-dotted border-secondaryGlow/20 animate-spin-reverse pointer-events-none" />

            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primaryGlow/15 to-secondaryGlow/15 flex items-center justify-center text-primaryGlow drop-shadow-[0_0_20px_rgba(79,250,240,0.35)]">
              <Brain className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-primaryGlow" />
            </div>
          </div>

          {/* Satellite Node 1: Resumes (Top Left) */}
          <div
            style={{
              transform: `translate(${driftNodes.x - 120}px, ${driftNodes.y - 120}px)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl glass-panel-hover glass-panel bg-white/4 border-white/6 flex items-center justify-center text-primaryGlow group-hover:scale-110 group-hover:border-primaryGlow/40 transition-all duration-300 shadow-xl">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[9px] font-black uppercase text-mutedGray tracking-widest mt-2 bg-[#071021]/80 px-2.5 py-1 rounded border border-white/5 group-hover:text-primaryGlow transition-colors duration-300 font-space">
              Resumes
            </span>
          </div>

          {/* Satellite Node 2: Recruiters (Top Right) */}
          <div
            style={{
              transform: `translate(${driftNodes.x + 120}px, ${driftNodes.y - 120}px)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl glass-panel-hover glass-panel bg-white/4 border-white/6 flex items-center justify-center text-secondaryGlow group-hover:scale-110 group-hover:border-secondaryGlow/40 transition-all duration-300 shadow-xl">
              <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[9px] font-black uppercase text-mutedGray tracking-widest mt-2 bg-[#071021]/80 px-2.5 py-1 rounded border border-white/5 group-hover:text-secondaryGlow transition-colors duration-300 font-space">
              Recruiters
            </span>
          </div>

          {/* Satellite Node 3: Candidates (Bottom Left) */}
          <div
            style={{
              transform: `translate(${driftNodes.x - 120}px, ${driftNodes.y + 120}px)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl glass-panel-hover glass-panel bg-white/4 border-white/6 flex items-center justify-center text-accentGlow group-hover:scale-110 group-hover:border-accentGlow/40 transition-all duration-300 shadow-xl">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[9px] font-black uppercase text-mutedGray tracking-widest mt-2 bg-[#071021]/80 px-2.5 py-1 rounded border border-white/5 group-hover:text-accentGlow transition-colors duration-300 font-space">
              Candidates
            </span>
          </div>

          {/* Satellite Node 4: Companies (Bottom Right) */}
          <div
            style={{
              transform: `translate(${driftNodes.x + 120}px, ${driftNodes.y + 120}px)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl glass-panel-hover glass-panel bg-white/4 border-white/6 flex items-center justify-center text-primaryGlow group-hover:scale-110 group-hover:border-primaryGlow/40 transition-all duration-300 shadow-xl">
              <Building className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[9px] font-black uppercase text-mutedGray tracking-widest mt-2 bg-[#071021]/80 px-2.5 py-1 rounded border border-white/5 group-hover:text-primaryGlow transition-colors duration-300 font-space">
              Companies
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
