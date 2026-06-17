import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, Terminal, CheckCircle2, User, RefreshCw } from 'lucide-react';

export default function RecommendationPreview() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(0);

  const fullText = `[AI ENGINE INITIALIZED]...
[INGESTING CORE DATA] Candidate: Rahul Sharma
[PROCESSING MATCH SCORES] Core Alignment: 96%

[IDENTIFYING CANDIDATE STRENGTHS]:
✓ React.js Developer - Expert level component architecture
✓ Node.js Backend - Robust microservice development
✓ Problem Solving - Top 4% algorithmic test score
✓ Communication - Strong leadership & collaboration metrics

[DECISION RECOMMENDATION]:
👉 PROCEED TO TECHNICAL INTERVIEW IMMEDIATELY.`;

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
    <section id="recommendation" className="relative py-28 overflow-hidden bg-darkBg">
      {/* Glow */}
      <div className="glow-orb w-[450px] h-[450px] bg-primaryCyan/10 top-10 right-10" />

      <div ref={containerRef} className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full glass-panel border-white/10 mb-4"
          >
            <span className="text-xs font-bold text-primaryCyan uppercase tracking-wider">
              Talent Assessment Preview
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-white"
          >
            Live AI <span className="gradient-text-cyan-purple">Decision Engine</span>
          </motion.h2>
          <p className="text-mutedGray mt-3 text-sm max-w-md mx-auto">
            Experience real-time candidate synthesis as raw resume files pass through the evaluation core.
          </p>
        </div>

        {/* Console Container */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
          
          {/* Console Top Header Bar */}
          <div className="bg-white/3 px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primaryCyan" />
              <span className="text-[11px] font-mono text-mutedGray uppercase tracking-widest">
                Talent Intelligence Console v2.05
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-primaryCyan/20" />
            </div>
          </div>

          {/* Console Content Area */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#070b21]/80">
            
            {/* Left side: Terminal Output (ChatGPT typing) */}
            <div className="md:col-span-8 flex flex-col justify-start text-left min-h-[300px]">
              <div className="font-mono text-xs sm:text-sm text-primaryCyan leading-relaxed whitespace-pre-line text-left flex-grow">
                {typedText}
                {!isTypingComplete && <span className="typing-cursor" />}
              </div>
            </div>

            {/* Right side: Match score metric visual */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-white/3 border border-white/5">
              
              {/* Circular gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Ring Background */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeWidth="8"
                  />
                  {/* Active SVG Ring */}
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="transparent"
                    stroke="#00F5D4"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - gaugeValue / 100)}
                    className="glow-cyan-filter"
                  />
                </svg>

                {/* Score Number inside ring */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{gaugeValue}%</span>
                  <span className="text-[9px] font-bold text-mutedGray uppercase tracking-widest">
                    Match Index
                  </span>
                </div>
              </div>

              {/* Match Card Sub-details */}
              <div className="mt-6 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primaryCyan/10 text-primaryCyan border border-primaryCyan/20 text-[10px] font-bold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Verified Match</span>
                </div>
                <p className="text-xs text-white font-semibold">Rahul Sharma</p>
                <p className="text-[10px] text-mutedGray">Lead Software Engineer candidate</p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
