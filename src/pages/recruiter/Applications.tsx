import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Brain, Calendar, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Applications() {
  const { candidates, jobs, updateCandidateStatus, refreshAll, loading } = useApplication();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'match' | 'exp' | 'overall'>('match');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewingCandidate, setReviewingCandidate] = useState<any | null>(null);
  
  const { addNotification } = useNotifications();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
    toast.success('Applications refreshed from database');
  };

  const handleStatusChange = async (candId: string, newStatus: string) => {
    setUpdatingId(candId);
    try {
      await updateCandidateStatus(candId, newStatus as any);
      toast.success(`Status updated to "${newStatus}"`);
      
      const candidate = candidates.find(c => c.id === candId);
      const job = jobs.find(j => j.id === candidate?.jobId);
      
      // Dispatch notification to Candidate via shared localStorage
      let nType: 'info' | 'success' | 'warning' | 'error' = 'info';
      if (newStatus === 'Selected' || newStatus === 'Shortlisted') nType = 'success';
      if (newStatus === 'Rejected') nType = 'error';
      if (newStatus === 'Interview Scheduled') nType = 'warning'; // warning color is usually yellow/gold
      
      addNotification(
        `Application ${newStatus}`,
        `Your application for ${job?.title || 'a role'} has been updated to ${newStatus}.`,
        nType
      );
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesJob = jobFilter === 'all' || c.jobId === jobFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesJob && matchesStatus;
  });

  // Sort logic
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'exp') return b.experienceYears - a.experienceYears;
    return b.overallScore - a.overallScore;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'border-success/30 bg-success/10 text-success';
      case 'Rejected': return 'border-error/30 bg-error/10 text-error';
      case 'Shortlisted': return 'border-[#4FFAF0]/30 bg-[#4FFAF0]/10 text-[#4FFAF0]';
      case 'Interview Scheduled':
      case 'Interview': return 'border-[#FFD166]/30 bg-[#FFD166]/10 text-[#FFD166]';
      default: return 'border-primaryGlow/30 bg-primaryGlow/10 text-primaryGlow';
    }
  };

  const leftBarColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'bg-success';
      case 'Rejected': return 'bg-error';
      case 'Shortlisted': return 'bg-[#4FFAF0]';
      case 'Interview Scheduled':
      case 'Interview': return 'bg-[#FFD166]';
      default: return 'bg-primaryGlow';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Applications Pipeline</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Review talent candidates, run AI screening reports, and manage hiring stages.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:bg-white/6 hover:border-primaryGlow/30 text-xs font-bold text-white uppercase tracking-wider font-space transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primaryGlow' : 'text-mutedGray'}`} />
          Refresh
        </button>
      </div>

      {/* FILTER & SORT BAR */}
      <div className="p-5 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-grow">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-mutedGray" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by candidate name or skill..."
              className="w-full bg-white/3 border border-white/6 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
            />
          </div>

          {/* Job filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
          >
            <option value="all">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <ArrowUpDown className="w-4 h-4 text-mutedGray" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
          >
            <option value="match">Highest AI Match</option>
            <option value="exp">Experience</option>
            <option value="overall">Overall Score</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: candidates.length, color: 'text-white' },
          { label: 'Shortlisted', value: candidates.filter(c => c.status === 'Shortlisted').length, color: 'text-[#4FFAF0]' },
          { label: 'Interviewing', value: candidates.filter(c => ['Interview', 'Interview Scheduled'].includes(c.status)).length, color: 'text-[#FFD166]' },
          { label: 'Selected', value: candidates.filter(c => c.status === 'Selected').length, color: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl glass-panel bg-white/2 border border-white/5 text-center">
            <div className={`text-2xl font-black font-space ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-mutedGray uppercase tracking-wider font-space mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CANDIDATE LIST */}
      <div className="flex flex-col gap-5 text-left">
        {loading ? (
          <div className="p-16 rounded-2xl glass-panel text-center bg-[#071021]/30 border border-white/5 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primaryGlow animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">Loading Applications...</p>
          </div>
        ) : sortedCandidates.length === 0 ? (
          <div className="p-16 rounded-2xl glass-panel text-center bg-[#071021]/30 border border-white/5 flex flex-col items-center gap-4">
            <SlidersHorizontal className="w-12 h-12 text-mutedGray animate-pulse" />
            <h4 className="text-sm font-bold uppercase tracking-wider font-space text-white">No Matching Applications</h4>
            <p className="text-xs text-mutedGray font-outfit max-w-xs leading-relaxed">
              {candidates.length === 0
                ? 'No candidates have applied yet. Share your job posting to attract talent.'
                : 'No candidates matched the current filters. Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {sortedCandidates.map((cand, index) => (
              <motion.div
                key={cand.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="p-6 rounded-2xl glass-panel bg-[#071021]/30 border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start justify-between gap-6 relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`absolute left-0 inset-y-0 w-1 ${leftBarColor(cand.status)}`} />

                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-4 flex-grow max-w-full md:max-w-[70%]">
                  <div className="w-12 h-12 rounded-xl bg-secondaryGlow/10 border border-secondaryGlow/25 text-secondaryGlow flex items-center justify-center font-space text-base font-black uppercase shrink-0 mt-1">
                    {cand.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>

                  <div className="space-y-3 w-full">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-bold text-white font-space uppercase tracking-wide">{cand.name}</h4>
                        <span className={`text-[8px] border px-2 py-0.5 rounded font-black uppercase tracking-wider font-space ${statusColor(cand.status)}`}>
                          {cand.status}
                        </span>
                      </div>
                      <span className="text-xs text-mutedGray font-outfit block mt-0.5">{cand.email}</span>
                      <span className="text-[10px] text-mutedGray font-space uppercase block mt-1.5">
                        {cand.jobTitle} • {cand.experienceYears}y Exp • {cand.education}
                      </span>
                      
                      {/* Submitted Resume File Link/Button */}
                      <button
                        onClick={() => setReviewingCandidate(cand)}
                        className="text-xs text-primaryGlow font-space hover:underline flex items-center gap-1.5 mt-2 bg-transparent border-none p-0 cursor-pointer text-left"
                      >
                        <span>📄</span>
                        <span>{cand.resumeFile || 'resume.pdf'}</span>
                        <span className="text-[9px] bg-primaryGlow/10 text-primaryGlow px-1.5 py-0.5 rounded uppercase font-bold ml-1 font-space">
                          Click to Review Text
                        </span>
                      </button>
                    </div>

                    {/* AI Resume Summary */}
                    <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 text-xs text-mutedGray font-outfit max-w-full">
                      <span className="font-bold text-white font-space block mb-1.5 uppercase tracking-wider text-[10px]">AI Resume Summary</span>
                      <div className="whitespace-pre-line leading-relaxed">{cand.resumeSummary || 'No summary generated.'}</div>
                    </div>

                    {/* Detected Skills */}
                    <div>
                      <span className="text-[10px] text-mutedGray font-space uppercase font-bold block mb-1.5">Detected Skills</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {cand.skills.map((skill, i) => (
                          <span key={i} className="text-[9px] font-bold text-[#4FFAF0] bg-[#4FFAF0]/10 border border-[#4FFAF0]/20 px-2.5 py-1 rounded-lg font-space uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Score + Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-4 w-full md:w-auto shrink-0 justify-end md:self-stretch md:justify-between">
                  <div className="flex flex-col gap-4 w-full">
                    {/* AI Score */}
                    <div className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primaryGlow" />
                        <div>
                          <span className="text-base font-black text-white font-space block">{cand.matchScore}%</span>
                          <span className="text-[8px] text-mutedGray uppercase font-black tracking-widest font-space">AI Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative w-full">
                      {updatingId === cand.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#030712]/80 rounded-xl z-10">
                          <Loader2 className="w-4 h-4 text-primaryGlow animate-spin" />
                        </div>
                      )}
                      <select
                        value={cand.status}
                        onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                        disabled={updatingId === cand.id}
                        className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase cursor-pointer w-full text-center"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => navigate(`/recruiter/screening/${cand.id}`)}
                        className="flex-1 px-3 py-3 rounded-xl bg-primaryGlow/10 border border-primaryGlow/20 hover:bg-primaryGlow/20 text-xs font-bold text-primaryGlow uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Brain className="w-4 h-4" />
                        <span>AI Report</span>
                      </button>
                      <button
                        onClick={() => navigate('/recruiter/scheduler')}
                        className="p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/12 text-white cursor-pointer transition-all flex items-center justify-center"
                        title="Schedule interview"
                      >
                        <Calendar className="w-4 h-4 text-secondaryGlow" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Slide-over Drawer for Resume Plain Text */}
      <AnimatePresence>
        {reviewingCandidate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingCandidate(null)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0b1528] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-space uppercase tracking-wide text-white">
                    Resume Plain Text
                  </h3>
                  <p className="text-xs text-mutedGray font-outfit mt-1">
                    {reviewingCandidate.name} — {reviewingCandidate.email}
                  </p>
                </div>
                <button
                  onClick={() => setReviewingCandidate(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-space text-xs font-bold hover:bg-white/10 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
              {/* Drawer Content */}
              <div className="flex-1 p-6 overflow-y-auto font-outfit text-sm text-mutedGray leading-relaxed space-y-4">
                <div className="p-4 rounded-xl bg-white/2 border border-white/5 font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed select-text bg-[#030712]/50">
                  {reviewingCandidate.resumeText || 'No resume text parsed.'}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
