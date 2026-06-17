import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Cpu, Trophy, Activity, UserCheck, ArrowRight } from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { candidates } = useApplication();
  const navigate = useNavigate();

  // Find candidate's application profile
  const myProfile = candidates.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || candidates[0];

  if (!myProfile) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold font-space text-white uppercase">No Application Ingested</h3>
        <p className="text-xs text-mutedGray font-outfit mt-1">Visit the profile page to ingest your resume coordinates.</p>
        <button onClick={() => navigate('/candidate/profile')} className="mt-4 px-4.5 py-2.5 bg-primaryGlow text-black rounded font-bold text-xs uppercase tracking-wider font-space">Setup Profile</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Career Core OS</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Welcome back, {user?.first_name}. Monitor your neural screening scores, rankings, and interview slots.
        </p>
      </div>

      {/* QUICK STATUS METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1: AI Match Score */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-primaryGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">AI Match Score</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{myProfile.matchScore}%</h3>
              <span className="text-[9px] text-primaryGlow font-bold mt-1 block font-space uppercase">Qualified</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 flex items-center justify-center text-primaryGlow">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Metric 2: Rank */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-secondaryGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Current Rank Position</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">#0{myProfile.rank}</h3>
              <span className="text-[9px] text-mutedGray mt-1 block font-space uppercase">In Pipeline</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondaryGlow/10 border border-secondaryGlow/25 flex items-center justify-center text-secondaryGlow">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 3: Application Stage */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-accentGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Pipeline Phase</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space uppercase tracking-wider">{myProfile.status}</h3>
              <span className="text-[9px] text-mutedGray mt-1 block font-space uppercase">Next Step: Interview</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accentGlow/10 border border-accentGlow/25 flex items-center justify-center text-accentGlow">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* CORE WORKSPACE TRIGGERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Summary card */}
        <div className="p-7 rounded-2xl glass-panel bg-white/2 border border-white/5 space-y-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Application Summary</h4>
            <span className="text-[10px] text-mutedGray uppercase font-space block mt-1.5">{myProfile.jobTitle}</span>
            <p className="text-xs text-mutedGray leading-relaxed font-outfit mt-4">
              Your resume coordinates have been indexed successfully by the neural screening core. Match accuracy is optimized, and interview slots have been requested.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/candidate/tracker')}
            className="w-fit px-5 py-3 rounded-xl bg-primaryGlow text-black font-bold text-xs uppercase tracking-wider font-space flex items-center gap-2 hover:scale-103 transition-transform cursor-pointer shadow-[0_0_10px_rgba(79,250,240,0.15)]"
          >
            <span>Track Progress</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Right: Quick Links panel */}
        <div className="p-7 rounded-2xl glass-panel bg-white/2 border border-white/5 space-y-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Workspace Quadrants</h4>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/candidate/screening-results')}
              className="p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-primaryGlow" />
                <div>
                  <span className="text-xs font-bold text-white block uppercase tracking-wide font-space">AI Screening Results</span>
                  <span className="text-[10px] text-mutedGray block font-outfit">Review strength scores and gaps</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-mutedGray" />
            </button>

            <button
              onClick={() => navigate('/candidate/rankings')}
              className="p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-secondaryGlow" />
                <div>
                  <span className="text-xs font-bold text-white block uppercase tracking-wide font-space">Rank Diagnostics</span>
                  <span className="text-[10px] text-mutedGray block font-outfit">View comparison indices and stats</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-mutedGray" />
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
