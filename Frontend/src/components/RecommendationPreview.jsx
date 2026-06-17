import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, Terminal } from 'lucide-react';

export default function RecommendationPreview() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(0);

  const fullText = `[SYS LOG] INITIALIZING RESUME INGESTION MODULES...
[SYS LOG] FILE: Resume_LeadSoftwareEngineer.pdf
[SYS LOG] RUNNING DEEP COMPILING SCAN (SECTOR 4B)...
[SYS LOG] MATCH COEFFICIENTS SYNTHESIZED: 96%

[COMPILED EXPERTISE PROFILE]:
✦ React.js Framework Architecture - Expert Level
✦ Node.js & Distributed Systems - High Alignment
✦ Algorithmic Complexity Index - Top 4%
✦ Tech Leadership & Mentorship - Strong Metric

[DECISION RECOMMENDATION ENGINE]:
👉 DECISION: PROCEED TO TECHNICAL INTERVIEW IMMEDIATELY.`;

  // Typewriter effect triggered when in view
  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    const intervalId = setInterval(() => {
      setTypedText((prev) => prev + fullText[index]);
      index++;
      if (index >= fullText.length) {
        clearInterval(intervalId);
        setIsTypingComplete(true);
      }
    }, 12); // Speed of typing

    return () => clearInterval(intervalId);
  }, [isInView]);

  // Gauge animation triggered when in view
  useEffect(() => {
    if (!isInView) return;

    let currentValue = 0;
    const targetValue = 96;
    const timer = setInterval(() => {
      currentValue += 2;
      if (currentValue >= targetValue) {
        setGaugeValue(targetValue);
        clearInterval(timer);
      } else {
        setGaugeValue(currentValue);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section id="recommendation" className="relative py-28 overflow-hidden bg-bgDark border-b border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-[#4FFAF0]/5 filter blur-[120px] pointer-events-none" />

      <div ref={containerRef} className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 font-space"
          >
            <span className="text-xs font-bold text-primaryGlow uppercase tracking-wider">
              Talent Assessment Preview
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-white font-space uppercase"
          >
            Live AI <span className="gradient-text-cyan-purple">Decision Engine</span>
          </motion.h2>
          <p className="text-mutedGray mt-3 text-sm max-w-md mx-auto font-outfit">
            Witness active analysis as candidates pass through screening compiles and rank checks.
          </p>
        </div>

        {/* Console mockup */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
          
          {/* Header Bar */}
          <div className="bg-white/2 px-4 py-3.5 flex items-center justify-between border-b border-white/6">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primaryGlow animate-pulse" />
              <span className="text-[10px] font-bold font-space text-mutedGray uppercase tracking-widest">
                Talent Intelligence Console v2.05
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/10" />
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="w-2 h-2 rounded-full bg-primaryGlow/20" />
            </div>
          </div>

          {/* Console Content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch bg-[#071021]/50 backdrop-blur-md">
            
            {/* Left Column: Code logs */}
            <div className="md:col-span-8 flex flex-col justify-start text-left min-h-[300px]">
              <div className="font-mono text-xs sm:text-[13px] text-primaryGlow leading-relaxed whitespace-pre-line text-left flex-grow">
                {typedText}
                {!isTypingComplete && <span className="typing-cursor" />}
              </div>
            </div>

            {/* Right Column: Radial Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-white/2 border border-white/5">
              
              {/* Circular score gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="7"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="transparent"
                    stroke="#4FFAF0"
                    strokeWidth="7"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - gaugeValue / 100)}
                    className="glow-primary-filter"
                  />
                </svg>

                {/* Text inside ring */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white font-space">{gaugeValue}%</span>
                  <span className="text-[9px] font-black text-mutedGray uppercase tracking-widest font-space mt-0.5">
                    Match Index
                  </span>
                </div>
              </div>

              {/* Subdetails */}
              <div className="mt-6 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 text-[9px] font-black uppercase tracking-wider font-space">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Verified Match</span>
                </div>
                <p className="text-xs text-white font-bold font-space uppercase tracking-wide">Rahul Sharma</p>
                <p className="text-[10px] text-mutedGray font-outfit">Lead Software Engineer candidate</p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
