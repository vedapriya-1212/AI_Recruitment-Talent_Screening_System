import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Brain, Calendar } from 'lucide-react';

export default function Applications() {
  const { candidates, jobs, updateCandidateStatus } = useApplication();
  const navigate = useNavigate();

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'match' | 'exp' | 'overall'>('match');

  // Filter logic
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Applications Pipeline</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Review talent candidates, evaluate screening credentials, and trigger scheduling pipelines.
        </p>
      </div>

      {/* FILTER & SORT BAR */}
      <div className="p-5 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search & Job Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-grow">
          {/* Search bar */}
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

          {/* Job select */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
          >
            <option value="all">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
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
            <option value="match">Highest Match</option>
            <option value="exp">Experience</option>
            <option value="overall">Overall Index</option>
          </select>
        </div>

      </div>

      {/* CANDIDATE PROFILE LIST */}
      <div className="flex flex-col gap-5 text-left">
        {sortedCandidates.length === 0 ? (
          <div className="p-16 rounded-2xl glass-panel text-center bg-[#071021]/30 border border-white/5 flex flex-col items-center justify-center gap-4">
            <SlidersHorizontal className="w-12 h-12 text-mutedGray animate-pulse" />
            <h4 className="text-sm font-bold uppercase tracking-wider font-space text-white">No Matching Profiles</h4>
            <p className="text-xs text-mutedGray font-outfit max-w-xs leading-relaxed">
              No applicant files matched the requested filters or keywords inside current pipelines.
            </p>
          </div>
        ) : (
          sortedCandidates.map((cand) => (
            <div
              key={cand.id}
              className="p-6 rounded-2xl glass-panel bg-white/2 border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
            >
              {/* Outer Glow Indicator */}
              <div className={`absolute left-0 inset-y-0 w-1 ${
                cand.status === 'Selected' ? 'bg-success' : cand.status === 'Rejected' ? 'bg-error' : 'bg-primaryGlow'
              }`} />

              {/* Left Side: Avatar & Details */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondaryGlow/10 border border-secondaryGlow/25 text-secondaryGlow flex items-center justify-center font-space text-base font-black uppercase shrink-0 mt-1">
                  {cand.name.split(' ').map(n=>n[0]).join('')}
                </div>
                
                <div>
                  <div className="flex flex-wrap items-center gap-3.5">
                    <h4 className="text-lg font-bold text-white font-space uppercase tracking-wide">{cand.name}</h4>
                    <span className={`text-[8px] border px-2 py-0.5 rounded font-black uppercase tracking-wider font-space ${
                      cand.status === 'Selected' ? 'border-success/30 bg-success/10 text-success' :
                      cand.status === 'Rejected' ? 'border-error/30 bg-error/10 text-error' :
                      'border-primaryGlow/30 bg-primaryGlow/10 text-primaryGlow'
                    }`}>
                      {cand.status}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-mutedGray font-space uppercase block mt-1">
                    {cand.jobTitle} • {cand.experienceYears} Years Exp • {cand.education}
                  </span>

                  {/* Skills lists */}
                  <div className="flex gap-1.5 flex-wrap mt-3.5">
                    {cand.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-[8px] font-bold text-mutedGray bg-white/4 border border-white/6 px-2 py-0.5 rounded font-space uppercase"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Score Circle & Pipelines Trigger */}
              <div className="flex sm:flex-row flex-col items-start sm:items-center gap-6 w-full md:w-auto justify-end">
                {/* Score Widget */}
                <div className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2">
                  <Brain className="w-5 h-5 text-primaryGlow" />
                  <div>
                    <span className="text-base font-black text-white font-space block">{cand.matchScore}%</span>
                    <span className="text-[8px] text-mutedGray uppercase font-black tracking-widest font-space">AI Index</span>
                  </div>
                </div>

                {/* Dropdown status update */}
                <select
                  value={cand.status}
                  onChange={(e) => updateCandidateStatus(cand.id, e.target.value as any)}
                  className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4.5 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Direct Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/recruiter/screening/${cand.id}`)}
                    className="px-4.5 py-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/12 text-xs font-bold text-white uppercase tracking-wider font-space flex items-center gap-2 cursor-pointer"
                  >
                    <Brain className="w-4 h-4 text-primaryGlow" />
                    <span>AI Report</span>
                  </button>
                  <button
                    onClick={() => navigate('/recruiter/scheduler')}
                    className="p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/12 text-white cursor-pointer"
                    title="Schedule interview"
                  >
                    <Calendar className="w-4 h-4 text-secondaryGlow" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </motion.div>
  );
}
