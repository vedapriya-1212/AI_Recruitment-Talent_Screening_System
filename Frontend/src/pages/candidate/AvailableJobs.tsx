import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Calendar, MapPin, DollarSign, Filter, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { JobPost } from '../../api/mockData';
import { toast } from 'sonner';

export default function AvailableJobs() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadJobs() {
      const data = await apiClient.getJobs();
      setJobs(data);
    }
    loadJobs();

    // Load already applied jobs from local storage or memory
    const saved = localStorage.getItem('applied_jobs_list');
    if (saved) {
      try {
        setAppliedJobIds(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleApply = (job: JobPost) => {
    if (appliedJobIds.includes(job.id)) {
      toast.warning('Already Applied', {
        description: `You have already submitted an application for the ${job.title} position.`,
      });
      return;
    }

    const updated = [...appliedJobIds, job.id];
    setAppliedJobIds(updated);
    localStorage.setItem('applied_jobs_list', JSON.stringify(updated));

    // Simulate appending to the applications store
    toast.success('Application Submitted!', {
      description: `Your profile and parsed resume have been synced to the ${job.title} hiring funnel.`,
    });

    if (selectedJob?.id === job.id) {
      setSelectedJob(null);
    }
  };

  // Filter skills list aggregated from all jobs
  const allSkills = Array.from(new Set(jobs.flatMap((j) => j.skills)));

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === '' || job.skills.includes(selectedSkill);
    
    // Simple experience checks matching requirements
    let matchesExp = true;
    if (selectedExp !== '') {
      const reqText = job.requirements.join(' ').toLowerCase();
      if (selectedExp === 'Junior') {
        matchesExp = reqText.includes('1-2') || reqText.includes('junior') || reqText.includes('intern') || !reqText.includes('5+');
      } else if (selectedExp === 'Mid') {
        matchesExp = reqText.includes('3-4') || reqText.includes('mid') || (!reqText.includes('lead') && !reqText.includes('architect'));
      } else if (selectedExp === 'Senior') {
        matchesExp = reqText.includes('5+') || reqText.includes('senior') || reqText.includes('lead') || reqText.includes('architect');
      }
    }
    return matchesSearch && matchesSkill && matchesExp;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Available Requirements</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Review and apply to active positions evaluated by the Neural Match Engine.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-mutedGray" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Job Title, Department, or Location..."
            className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-mutedGray focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
          />
        </div>

        {/* Skill Filter */}
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-4 top-3.5 w-4 h-4 text-mutedGray" />
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit cursor-pointer"
          >
            <option value="">Filter by Skill</option>
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        {/* Experience Filter */}
        <div className="md:col-span-3 relative">
          <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-mutedGray" />
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit cursor-pointer"
          >
            <option value="">Filter by Experience</option>
            <option value="Junior">Junior (1-2 years)</option>
            <option value="Mid">Mid Level (3-5 years)</option>
            <option value="Senior">Senior / Architect (5+ years)</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-16 rounded-2xl glass-panel bg-white/2 border border-white/5">
            <Briefcase className="w-10 h-10 text-mutedGray mx-auto mb-4" />
            <p className="text-sm text-white font-space uppercase">No matched requirements found</p>
            <p className="text-xs text-mutedGray font-outfit mt-1">Try resetting search filters.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.includes(job.id);
            return (
              <motion.div
                key={job.id}
                layoutId={`card-${job.id}`}
                className="p-6 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 hover:border-primaryGlow/25 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-white font-space uppercase tracking-wide line-clamp-1">{job.title}</h4>
                      <span className="text-[10px] text-primaryGlow font-space uppercase tracking-wider block mt-1">
                        {job.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-[10px] text-mutedGray font-outfit">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primaryGlow shrink-0" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-primaryGlow shrink-0" />
                      <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primaryGlow shrink-0" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Skills Needed</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {job.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[9px] font-bold text-mutedGray bg-white/3 border border-white/5 px-2 py-0.5 rounded-full font-space uppercase">
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-[9px] font-bold text-mutedGray bg-white/3 border border-white/5 px-2 py-0.5 rounded-full font-space">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 py-2.5 rounded-xl border border-white/6 hover:border-white/15 text-[10px] font-bold text-white uppercase tracking-wider font-space cursor-pointer transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApply(job)}
                    disabled={hasApplied}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider font-space flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      hasApplied 
                        ? 'bg-success/15 border border-success/20 text-success' 
                        : 'bg-primaryGlow text-[#030712] hover:scale-103 shadow-[0_0_12px_rgba(79,250,240,0.15)]'
                    }`}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Side Slide-Over Job Details Panel */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg z-50 bg-[#071021] border-l border-white/10 p-6 md:p-10 flex flex-col justify-between text-left shadow-2xl"
            >
              <div className="space-y-8 overflow-y-auto max-h-[85vh] pr-2 scrollbar-thin">
                {/* Header Actions */}
                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                  <div className="flex items-center gap-2 text-primaryGlow">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-space">AI Evaluated Opening</span>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1.5 rounded-full text-mutedGray hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Job Summary */}
                <div>
                  <h3 className="text-2xl font-black text-white font-space uppercase tracking-wide">{selectedJob.title}</h3>
                  <span className="text-xs text-primaryGlow font-space uppercase tracking-wider block mt-1.5">{selectedJob.department}</span>
                  
                  <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-mutedGray font-outfit">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primaryGlow shrink-0" />
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-primaryGlow shrink-0" />
                      ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()} / yr
                    </span>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Description */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Role Overview</h4>
                  <p className="text-xs text-mutedGray leading-relaxed font-outfit">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Technical Guidelines</h4>
                  <ul className="space-y-2.5">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-mutedGray font-outfit leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills badges */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Required Tech Stack</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedJob.skills.map((skill, index) => (
                      <span key={index} className="text-[10px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-3 py-1 rounded-full font-space uppercase">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Benefits Placeholder */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Strategic Benefits</h4>
                  <p className="text-xs text-mutedGray leading-relaxed font-outfit">
                    • 100% remote workspace optimization<br />
                    • Health insurance index matching parameters<br />
                    • Yearly learning budgets & continuous neural updates
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-white/5 pt-5 mt-6 flex gap-4">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white uppercase tracking-wider font-space cursor-pointer transition-colors text-center"
                >
                  Close Details
                </button>
                <button
                  onClick={() => handleApply(selectedJob)}
                  disabled={appliedJobIds.includes(selectedJob.id)}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    appliedJobIds.includes(selectedJob.id)
                      ? 'bg-success/15 border border-success/20 text-success'
                      : 'bg-primaryGlow text-black hover:scale-103 shadow-[0_0_15px_rgba(79,250,240,0.2)]'
                  }`}
                >
                  {appliedJobIds.includes(selectedJob.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Already Applied</span>
                    </>
                  ) : (
                    <>
                      <span>Apply For Position</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
