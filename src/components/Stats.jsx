import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, ChevronRight, User, CircleDot, ArrowUpRight } from 'lucide-react';

const pipelineColumns = [
  {
    title: 'Screening',
    count: 4,
    color: 'border-primaryGlow text-primaryGlow',
    candidates: [
      { name: 'Sarah Jenkins', role: 'React Architect', match: '98%' },
      { name: 'David Miller', role: 'DevOps Specialist', match: '91%' },
    ],
  },
  {
    title: 'Technical Review',
    count: 3,
    color: 'border-secondaryGlow text-secondaryGlow',
    candidates: [
      { name: 'Rahul Sharma', role: 'Lead Backend Dev', match: '96%' },
    ],
  },
  {
    title: 'Final Panel',
    count: 2,
    color: 'border-accentGlow text-accentGlow',
    candidates: [
      { name: 'Sophia Chen', role: 'AI Researcher', match: '95%' },
    ],
  },
  {
    title: 'Offered',
    count: 1,
    color: 'border-rareAccent text-rareAccent',
    candidates: [
      { name: 'Marcus Vance', role: 'Security Engineer', match: '97%' },
    ],
  },
];

const topTalent = [
  { name: 'Sarah Jenkins', score: 98, skills: ['React', 'TypeScript', 'Next.js'] },
  { name: 'Marcus Vance', score: 97, skills: ['Rust', 'K8s', 'Cryptography'] },
  { name: 'Rahul Sharma', score: 96, skills: ['Node.js', 'Go', 'System Design'] },
];

export default function Stats() {
  return (
    <section className="relative py-28 overflow-hidden bg-bgDark border-y border-white/5">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-[-10%] w-[400px] h-[400px] rounded-full bg-secondaryGlow/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-primaryGlow/5 filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
          >
            <span className="text-xs font-bold text-secondaryGlow uppercase tracking-wider font-space">
              SYSTEM COMMAND PREVIEW
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-space uppercase"
          >
            Recruiter <span className="gradient-text-cyan-purple">Dashboard Preview</span>
          </motion.h2>
          <p className="text-mutedGray mt-4 max-w-xl mx-auto text-sm sm:text-base font-outfit">
            A control center simulating autonomous pipelines, resume indexing, and interactive team coordinates.
          </p>
        </div>

        {/* Mockup Dashboard Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="w-full glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#071021]/50 backdrop-blur-md"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-primaryGlow/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow animate-ping" />
              </div>
              <span className="text-xs font-bold tracking-widest text-[#94A3B8] font-space uppercase">
                COGNITIVE WORKSPACE : LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/40" />
            </div>
          </div>

          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Metrics & Pipeline (Col-span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Core metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Metric 1: Candidate Count */}
                <div className="p-5 rounded-xl glass-panel bg-white/3 border border-white/6 flex items-center justify-between hover:border-primaryGlow/20 transition-all duration-300">
                  <div>
                    <p className="text-xs font-bold text-mutedGray uppercase tracking-wider font-space">Candidate Index</p>
                    <h3 className="text-3xl font-black text-white mt-2 font-space">1,482</h3>
                    <p className="text-[10px] text-success font-bold mt-1 flex items-center gap-1">
                      <span className="text-xs font-black">+14.2%</span> from last cycle
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* Metric 2: Open Jobs */}
                <div className="p-5 rounded-xl glass-panel bg-white/3 border border-white/6 flex items-center justify-between hover:border-secondaryGlow/20 transition-all duration-300">
                  <div>
                    <p className="text-xs font-bold text-mutedGray uppercase tracking-wider font-space">Open Requirements</p>
                    <h3 className="text-3xl font-black text-white mt-2 font-space">12 Active</h3>
                    <p className="text-[10px] text-mutedGray mt-1">
                      8 Tech, 4 Design positions
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-secondaryGlow/10 border border-secondaryGlow/25 text-secondaryGlow flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Pipeline Kanban */}
              <div className="flex flex-col">
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-space mb-4 flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-primaryGlow" /> Interview Pipeline
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {pipelineColumns.map((col, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-3"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">
                          {col.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border ${col.color}`}>
                          {col.count}
                        </span>
                      </div>

                      {/* Column Cards */}
                      <div className="flex flex-col gap-2.5">
                        {col.candidates.map((cand, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg glass-panel bg-white/3 border border-white/6 hover:border-white/12 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-white block">{cand.name}</span>
                              <span className="text-[9px] font-black text-primaryGlow">{cand.match}</span>
                            </div>
                            <span className="text-[9px] text-mutedGray block mt-0.5">{cand.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Top Talent & Metric Charts (Col-span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Top Talent Leaderboard */}
              <div className="p-5 rounded-xl glass-panel bg-white/2 border border-white/6 flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accentGlow shadow-[0_0_8px_#FF5EB5]" /> Top Rated Talent
                  </h4>

                  <div className="flex flex-col gap-4">
                    {topTalent.map((cand, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-lg bg-white/2 border border-white/5 flex flex-col gap-2 group hover:bg-white/4 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primaryGlow/10 flex items-center justify-center text-primaryGlow text-[10px] font-bold">
                              {cand.name.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span className="text-xs font-bold text-white">{cand.name}</span>
                          </div>
                          <span className="text-xs font-black text-primaryGlow">{cand.score}%</span>
                        </div>

                        {/* Skill badges */}
                        <div className="flex gap-1.5 flex-wrap">
                          {cand.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[8px] font-semibold text-mutedGray bg-white/5 border border-white/8 px-1.5 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-6 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 group transition-colors cursor-pointer">
                  <span>Open Full Ranks</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
