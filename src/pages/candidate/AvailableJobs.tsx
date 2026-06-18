import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Calendar, MapPin, DollarSign, Filter, ArrowRight, X, Sparkles, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useApplication } from '../../contexts/ApplicationContext';
import { JobPost } from '../../api/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AvailableJobs() {
  const { jobs, myApplications, applyForJob } = useApplication();
  const navigate = useNavigate();
  
  const [selectedJob, setSelectedJob] = useState<JobPost & { relevanceScore?: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingJob, setPendingJob] = useState<JobPost | null>(null);

  useEffect(() => {
    const p = localStorage.getItem('user_detailed_profile');
    if (p) setProfile(JSON.parse(p));
  }, []);

  const appliedJobIds = useMemo(() => myApplications.map(a => a.jobId), [myApplications]);

  const handleApplyClick = (job: JobPost) => {
    if (appliedJobIds.includes(job.id)) {
      toast.warning('Already Applied', { description: `You have already submitted an application for the ${job.title} position.` });
      return;
    }
    
    // Check for Resume Upload (Enforced Workflow)
    const hasResume = localStorage.getItem('has_uploaded_resume') === 'true';
    if (!hasResume) {
      setPendingJob(job);
      setShowResumeModal(true);
      return;
    }

    proceedWithApplication(job);
  };

  const proceedWithApplication = async (job: JobPost) => {
    setApplyingId(job.id);
    try {
      await applyForJob(job.id);
      toast.success('Application Submitted!', {
        description: `Your profile has been synced to the ${job.title} hiring funnel.`,
      });
      setShowResumeModal(false);
      setPendingJob(null);
      if (selectedJob?.id === job.id) setSelectedJob(null);
    } catch (err: any) {
      if (!err?.message?.includes('duplicate') && !err?.message?.includes('unique')) {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const allSkills = Array.from(new Set(jobs.flatMap((j) => j.skills)));

  // Smart Ranking Logic
  const rankedJobs = useMemo(() => {
    let list = [...jobs];
    
    if (profile) {
      list = list.map(job => {
        let score = 0;
        const jobSkillsLow = job.skills.map(s => s.toLowerCase());
        const profSkillsLow = profile.skills?.map((s: string) => s.toLowerCase()) || [];
        const matchCount = profSkillsLow.filter((s: string) => jobSkillsLow.includes(s)).length;
        if (jobSkillsLow.length > 0) {
          score += (matchCount / jobSkillsLow.length) * 50; // up to 50 pts
        }
        
        const jobTitle = job.title.toLowerCase();
        const profRole = (profile.preferredRole || '').toLowerCase();
        if (profRole && jobTitle.includes(profRole)) score += 30; // up to 30 pts
        
        // Experience match 20 pts
        const reqText = job.requirements.join(' ').toLowerCase();
        const profExpStr = profile.experienceLevel || '';
        if (profExpStr) {
          if (reqText.includes('5+') && profExpStr.includes('5')) score += 20;
          else if ((reqText.includes('3-4') || reqText.includes('mid')) && profExpStr.includes('3-5')) score += 20;
          else if ((reqText.includes('1-2') || reqText.includes('junior')) && profExpStr.includes('1-2')) score += 20;
          else if (!reqText.includes('5+') && !reqText.includes('senior')) score += 10;
        }
        
        return { ...job, relevanceScore: Math.round(score) };
      }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    return list.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill = selectedSkill === '' || job.skills.includes(selectedSkill);
      let matchesExp = true;
      if (selectedExp !== '') {
        const reqText = job.requirements.join(' ').toLowerCase();
        if (selectedExp === 'Junior') matchesExp = reqText.includes('1-2') || reqText.includes('junior') || reqText.includes('intern') || !reqText.includes('5+');
        else if (selectedExp === 'Mid') matchesExp = reqText.includes('3-4') || reqText.includes('mid') || (!reqText.includes('lead') && !reqText.includes('architect'));
        else if (selectedExp === 'Senior') matchesExp = reqText.includes('5+') || reqText.includes('senior') || reqText.includes('lead') || reqText.includes('architect');
      }
      return matchesSearch && matchesSkill && matchesExp;
    });
  }, [jobs, profile, searchTerm, selectedSkill, selectedExp]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left relative">
      
      {/* Resume Intercept Modal */}
      <AnimatePresence>
        {showResumeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResumeModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#071021] border border-white/10 rounded-2xl p-8 shadow-2xl z-10 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 text-error flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-space">Resume Required</h3>
                <p className="text-mutedGray text-xs font-outfit mt-2">
                  You must upload your resume before applying to {pendingJob?.title}. The AI engine needs your resume to calculate your match score.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowResumeModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white uppercase tracking-wider font-space">Cancel</button>
                <button onClick={() => navigate('/candidate/resume')} className="flex-1 py-3 rounded-xl bg-primaryGlow text-black hover:scale-105 shadow-[0_0_15px_rgba(79,250,240,0.2)] transition-all text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2">
                  Go to Upload <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Available Requirements</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">Review active positions evaluated and ranked by the Neural Match Engine based on your profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-mutedGray" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by Job Title, Department, or Location..." className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-mutedGray focus:outline-none focus:border-primaryGlow transition-colors font-outfit" />
        </div>
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-4 top-3.5 w-4 h-4 text-mutedGray" />
          <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit cursor-pointer">
            <option value="">Filter by Skill</option>
            {allSkills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
          </select>
        </div>
        <div className="md:col-span-3 relative">
          <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-mutedGray" />
          <select value={selectedExp} onChange={(e) => setSelectedExp(e.target.value)} className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit cursor-pointer">
            <option value="">Filter by Experience</option>
            <option value="Junior">Junior (1-2 years)</option>
            <option value="Mid">Mid Level (3-5 years)</option>
            <option value="Senior">Senior / Architect (5+ years)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankedJobs.length === 0 ? (
          <div className="col-span-full text-center py-16 rounded-2xl glass-panel bg-white/2 border border-white/5">
            <Briefcase className="w-10 h-10 text-mutedGray mx-auto mb-4" />
            <p className="text-sm text-white font-space uppercase">No matched requirements found</p>
          </div>
        ) : (
          rankedJobs.map((job: any) => {
            const hasApplied = appliedJobIds.includes(job.id);
            const isTopMatch = (job.relevanceScore || 0) >= 60;

            return (
              <motion.div key={job.id} layoutId={`card-${job.id}`} className={`p-6 rounded-2xl glass-panel bg-[#071021]/30 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${isTopMatch ? 'border-primaryGlow/40 shadow-[0_0_20px_rgba(79,250,240,0.05)]' : 'border-white/6 hover:border-white/20'}`}>
                
                {isTopMatch && (
                  <div className="absolute top-0 right-0 bg-primaryGlow text-black text-[9px] font-bold uppercase font-space px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-[0_0_10px_rgba(79,250,240,0.5)]">
                    <Sparkles className="w-3 h-3" /> Recommended Match
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start mt-2">
                    <div>
                      <h4 className="text-base font-bold text-white font-space uppercase tracking-wide line-clamp-1">{job.title}</h4>
                      <span className="text-[10px] text-primaryGlow font-space uppercase tracking-wider block mt-1">{job.department}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-[10px] text-mutedGray font-outfit">
                    <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primaryGlow shrink-0" /> {job.location}</span>
                    <span className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-primaryGlow shrink-0" /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Skills Needed</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {job.skills.slice(0, 3).map((s: string, idx: number) => (
                        <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-space uppercase ${profile?.skills?.map((x:any)=>x.toLowerCase()).includes(s.toLowerCase()) ? 'text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/30' : 'text-mutedGray bg-white/3 border border-white/5'}`}>
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 3 && <span className="text-[9px] font-bold text-mutedGray bg-white/3 border border-white/5 px-2 py-0.5 rounded-full font-space">+{job.skills.length - 3} more</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                  <button onClick={() => setSelectedJob(job)} className="flex-1 py-2.5 rounded-xl border border-white/6 hover:border-white/15 text-[10px] font-bold text-white uppercase tracking-wider font-space transition-colors">Details</button>
                  <button onClick={() => handleApplyClick(job)} disabled={hasApplied} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider font-space flex items-center justify-center gap-1 transition-all ${hasApplied ? 'bg-success/15 border border-success/20 text-success' : 'bg-primaryGlow text-black hover:scale-103 shadow-[0_0_12px_rgba(79,250,240,0.15)] cursor-pointer'}`}>
                    {hasApplied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Applied</> : <><ArrowRight className="w-3.5 h-3.5" /> Apply</>}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedJob && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="fixed top-0 right-0 h-full w-full max-w-lg z-50 bg-[#071021] border-l border-white/10 p-6 md:p-10 flex flex-col justify-between text-left shadow-2xl">
              <div className="space-y-8 overflow-y-auto max-h-[85vh] pr-2 scrollbar-thin">
                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                  <div className="flex items-center gap-2 text-primaryGlow">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-space">AI Evaluated Opening</span>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-1.5 rounded-full text-mutedGray hover:text-white hover:bg-white/5 cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white font-space uppercase tracking-wide">{selectedJob.title}</h3>
                  <span className="text-xs text-primaryGlow font-space uppercase tracking-wider block mt-1.5">{selectedJob.department}</span>
                  <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-mutedGray font-outfit">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primaryGlow" />{selectedJob.location}</span>
                    <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-primaryGlow" />${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()} / yr</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Role Overview</h4>
                  <p className="text-xs text-mutedGray leading-relaxed font-outfit">{selectedJob.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Required Tech Stack</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedJob.skills.map((skill, index) => (
                      <span key={index} className="text-[10px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-3 py-1 rounded-full font-space uppercase">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 mt-6 flex gap-4">
                <button onClick={() => setSelectedJob(null)} className="flex-1 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white uppercase font-space cursor-pointer">Close Details</button>
                <button onClick={() => handleApplyClick(selectedJob as JobPost)} disabled={appliedJobIds.includes(selectedJob.id)} className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase font-space flex items-center justify-center gap-1 cursor-pointer ${appliedJobIds.includes(selectedJob.id) ? 'bg-success/15 border-success/20 text-success' : 'bg-primaryGlow text-black hover:scale-105'}`}>
                  {appliedJobIds.includes(selectedJob.id) ? "Already Applied" : "Apply For Position"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
