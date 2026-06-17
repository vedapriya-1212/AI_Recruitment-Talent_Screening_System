import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { PlusCircle, Users, Activity, FileText, ArrowRight } from 'lucide-react';

export default function RecruiterDashboard() {
  const { jobs, candidates, interviews } = useApplication();
  const navigate = useNavigate();

  // Metrics
  const totalJobs = jobs.length;
  const activeCandidates = candidates.length;
  const pendingInterviews = interviews.filter(i => i.status !== 'Completed' && i.status !== 'Cancelled').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Recruiter Workspace</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            System overview and autonomous workflow diagnostics.
          </p>
        </div>
        <button
          onClick={() => navigate('/recruiter/create-job')}
          className="px-5 py-3 rounded-xl bg-primaryGlow text-[#030712] font-bold text-xs uppercase tracking-wider font-space hover:scale-105 active:scale-97 hover:shadow-[0_0_20px_rgba(79,250,240,0.3)] transition-all duration-300 flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Publish Requirement</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-white/6 hover:border-primaryGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Open Requirements</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{totalJobs}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 flex items-center justify-center text-primaryGlow">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/6 hover:border-secondaryGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Active Candidates</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{activeCandidates}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondaryGlow/10 border border-secondaryGlow/25 flex items-center justify-center text-secondaryGlow">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/6 hover:border-accentGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Booked Slots</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{pendingInterviews}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accentGlow/10 border border-accentGlow/25 flex items-center justify-center text-accentGlow">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Jobs list & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Jobs List (Col-span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Active Requirements</h4>
          
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5.5 rounded-2xl glass-panel bg-white/2 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h5 className="text-base font-bold text-white font-space uppercase tracking-wide">{job.title}</h5>
                  <span className="text-[10px] text-mutedGray uppercase tracking-wider font-space mt-1 block">
                    {job.department} • {job.location}
                  </span>
                  
                  {/* Performance Indicators */}
                  <div className="flex gap-4 mt-3">
                    <span className="text-[10px] font-bold text-primaryGlow font-space uppercase">Score: {job.optimizationScore}%</span>
                    <span className="text-[10px] font-bold text-mutedGray font-space uppercase">Applications: {candidates.filter(c => c.jobId === job.id).length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/recruiter/applications"
                    className="px-4 py-2.5 rounded-lg border border-white/6 hover:border-primaryGlow/30 text-[10px] font-bold uppercase tracking-wider font-space text-white hover:text-primaryGlow transition-all"
                  >
                    View Pipeline
                  </Link>
                  <Link
                    to="/recruiter/rankings"
                    className="p-2.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 text-white transition-all"
                    title="Rankings"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Events Feed (Col-span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Recent Activity</h4>
          
          <div className="p-5 rounded-2xl glass-panel bg-white/2 border border-white/5 flex flex-col gap-4.5">
            {interviews.slice(0, 3).map((meet) => (
              <div key={meet.id} className="p-3 rounded-xl bg-white/2 border border-white/4 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white block">{meet.candidateName}</span>
                  <span className="text-[8px] bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {meet.stage}
                  </span>
                </div>
                <span className="text-[9px] text-mutedGray block">{meet.jobTitle}</span>
                <span className="text-[9px] text-primaryGlow block font-space">{meet.date} @ {meet.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
