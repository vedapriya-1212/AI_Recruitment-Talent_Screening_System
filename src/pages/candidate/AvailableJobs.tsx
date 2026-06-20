import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Calendar, MapPin, DollarSign, Filter, ArrowRight, X, Sparkles, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { JobPost } from '../../api/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function AvailableJobs() {
  const { jobs, myApplications, candidates, applyForJob } = useApplication();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedJob, setSelectedJob] = useState<JobPost & { relevanceScore?: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingJob, setPendingJob] = useState<JobPost | null>(null);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [uploadFileForJob, setUploadFileForJob] = useState<File | null>(null);

  useEffect(() => {
    const p = localStorage.getItem('user_detailed_profile');
    if (p) setProfile(JSON.parse(p));

    const localSkills = localStorage.getItem('resume_uploaded_skills');
    if (localSkills) {
      try {
        setResumeSkills(JSON.parse(localSkills));
      } catch {}
    }

    apiClient.getResumeStatus().then(status => {
      if (status.hasResume && status.skills) {
        setResumeSkills(status.skills);
        localStorage.setItem('resume_uploaded_skills', JSON.stringify(status.skills));
      }
    }).catch(() => {});
  }, [myApplications]);

  const appliedJobIds = useMemo(() => myApplications.map(a => a.jobId), [myApplications]);

  const handleApplyClick = (job: JobPost) => {
    if (appliedJobIds.includes(job.id)) {
      toast.warning('Already Applied', { description: `You have already submitted an application for the ${job.title} position.` });
      return;
    }
    
    // Reset and open upload modal for this job
    setPendingJob(job);
    setUploadFileForJob(null);
    setShowResumeModal(true);
  };

  const proceedWithApplication = async (job: JobPost, resumeFile: File) => {
    if (!resumeFile) return;
    setApplyingId(job.id);
    try {
      const res = await applyForJob(job.id, resumeFile);
      toast.success('Application Submitted!', {
        description: `Your profile has been synced to the ${job.title} hiring funnel.`,
      });
      
      // Save the latest resume skills from response to trigger re-ranking
      if (res && res.application && res.application.detected_skills) {
        const skillsArray = res.application.detected_skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        localStorage.setItem('latest_resume_skills', JSON.stringify(skillsArray));
        setResumeSkills(skillsArray);
      }

      setShowResumeModal(false);
      setPendingJob(null);
      setUploadFileForJob(null);
      if (selectedJob?.id === job.id) setSelectedJob(null);
    } catch (err: any) {
      if (!err?.message?.includes('duplicate') && !err?.message?.includes('unique')) {
        toast.error(err.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const allSkills = Array.from(new Set(jobs.flatMap((j) => j.skills)));

  // Custom helper to normalize skill name to title casing / abbreviations
  const normalizeSkillName = (skill: string): string => {
    const s = skill.trim().toLowerCase();
    if (s === 'java') return 'Java';
    if (s === 'javascript' || s === 'js') return 'JavaScript';
    if (s === 'typescript' || s === 'ts') return 'TypeScript';
    if (s === 'mysql') return 'MySQL';
    if (s === 'aws') return 'AWS';
    if (s === 'git') return 'Git';
    if (s === 'rest api' || s === 'rest' || s === 'restful api') return 'REST API';
    if (s === 'css') return 'CSS';
    if (s === 'html') return 'HTML';
    if (s === 'spring boot') return 'Spring Boot';
    if (s === 'node.js' || s === 'nodejs') return 'Node.js';
    if (s === 'python') return 'Python';
    if (s === 'react') return 'React';
    if (s === 'docker') return 'Docker';
    if (s === 'kubernetes') return 'Kubernetes';
    if (s === 'sql') return 'SQL';
    
    return skill.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // ── Combined profile & resume skills list ──────────────────────────────────
  const candidateAllSkills = useMemo(() => {
    const skillsSet = new Set<string>();

    // 1. Candidate Profile Skills
    const profileStored = localStorage.getItem('user_detailed_profile');
    if (profileStored) {
      try {
        const parsed = JSON.parse(profileStored);
        if (parsed.skills) {
          parsed.skills.split(',').forEach((s: string) => {
            const norm = normalizeSkillName(s);
            if (norm) skillsSet.add(norm);
          });
        }
      } catch {}
    }

    const myProfile = candidates?.find(c => c.email.toLowerCase() === user?.email?.toLowerCase());
    if (myProfile && myProfile.skills) {
      myProfile.skills.forEach((s: string) => {
        const norm = normalizeSkillName(s);
        if (norm) skillsSet.add(norm);
      });
    }

    // 2. Latest Resume Skills
    const localSkills = localStorage.getItem('latest_resume_skills');
    if (localSkills) {
      try {
        const parsed = JSON.parse(localSkills);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: string) => {
            const norm = normalizeSkillName(s);
            if (norm) skillsSet.add(norm);
          });
        }
      } catch {}
    }

    // Include general resumeSkills
    resumeSkills.forEach(s => {
      const norm = normalizeSkillName(s);
      if (norm) skillsSet.add(norm);
    });

    return Array.from(skillsSet);
  }, [candidates, user, resumeSkills]);

  // Smart Ranking and Recommendation Logic
  const rankedJobs = useMemo(() => {
    // Calculate match score for all jobs first
    const calculated = jobs.map((job, index) => {
      const jobSkills = (job.skills || []).map(s => normalizeSkillName(s)).filter(Boolean);
      if (jobSkills.length === 0) {
        return {
          ...job,
          matchPercentage: 0,
          matchedSkills: [] as string[],
          isRecommended: false,
          originalIndex: index
        };
      }

      const matched = jobSkills.filter(skill =>
        candidateAllSkills.includes(skill)
      );

      // Match Percentage = (Matched Skills Count / Total Required Skills Count) * 100
      const matchPercentage = Math.round((matched.length / jobSkills.length) * 100);
      const isRecommended = matchPercentage >= 60;

      return {
        ...job,
        matchPercentage,
        matchedSkills: matched,
        isRecommended,
        originalIndex: index
      };
    });

    // Apply search and drop-down filters
    const filtered = calculated.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill = selectedSkill === '' || job.skills.map(s => normalizeSkillName(s)).includes(normalizeSkillName(selectedSkill));
      let matchesExp = true;
      if (selectedExp !== '') {
        const reqText = job.requirements.join(' ').toLowerCase();
        if (selectedExp === 'Junior') matchesExp = reqText.includes('1-2') || reqText.includes('junior') || reqText.includes('intern') || !reqText.includes('5+');
        else if (selectedExp === 'Mid') matchesExp = reqText.includes('3-4') || reqText.includes('mid') || (!reqText.includes('lead') && !reqText.includes('architect'));
        else if (selectedExp === 'Senior') matchesExp = reqText.includes('5+') || reqText.includes('senior') || reqText.includes('lead') || reqText.includes('architect');
      }
      return matchesSearch && matchesSkill && matchesExp;
    });

    // Sort: Recommended first, high percentage first, then original order
    return filtered.sort((a, b) => {
      // 1. Recommended jobs first
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      
      // 2. Highest match percentage first
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      
      // 3. Keep original stable sorting order
      return a.originalIndex - b.originalIndex;
    });
  }, [jobs, candidateAllSkills, searchTerm, selectedSkill, selectedExp]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left relative">
      
      {/* Job-Specific Resume Upload Modal */}
      <AnimatePresence>
        {showResumeModal && pendingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!applyingId) setShowResumeModal(false); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#071021] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 text-left space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider font-space">Apply for {pendingJob.title}</h3>
                <p className="text-mutedGray text-[10px] font-outfit mt-1">
                  Upload your resume tailored for this position. This will not overwrite your resumes for other applications.
                </p>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const f = e.dataTransfer?.files?.[0];
                  if (f && f.name.endsWith('.pdf')) {
                    setUploadFileForJob(f);
                  } else {
                    toast.error('Only PDF files are accepted.');
                  }
                }}
                className={`relative border border-dashed border-white/10 rounded-xl p-6 text-center bg-white/1 flex flex-col items-center justify-center gap-3 transition-colors ${
                  uploadFileForJob ? 'border-success/30 bg-success/5' : 'hover:border-primaryGlow/30'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.name.endsWith('.pdf')) {
                        setUploadFileForJob(f);
                      } else {
                        toast.error('Only PDF files are accepted.');
                      }
                    }
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {uploadFileForJob ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-success/15 border border-success/30 text-success flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block truncate max-w-[220px] mx-auto">
                        {uploadFileForJob.name}
                      </span>
                      <span className="text-[10px] text-mutedGray mt-0.5 block">
                        {(uploadFileForJob.size / 1024).toFixed(0)} KB · Ready to apply
                      </span>
                    </div>
                    <span className="text-[9px] text-primaryGlow font-space uppercase font-bold hover:underline block pt-1 cursor-pointer">
                      Click or drag to replace
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-white/3 border border-white/6 flex items-center justify-center text-mutedGray">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block uppercase tracking-wider font-space">
                        Select Resume PDF
                      </span>
                      <span className="text-[9px] text-mutedGray mt-0.5 block">
                        Drag & drop or click to browse (PDF only, max 10MB)
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  disabled={!!applyingId}
                  onClick={() => setShowResumeModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white uppercase tracking-wider font-space cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!uploadFileForJob || !!applyingId}
                  onClick={() => proceedWithApplication(pendingJob, uploadFileForJob!)}
                  className={`flex-1 py-3 rounded-xl text-black text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !uploadFileForJob || !!applyingId
                      ? 'bg-white/10 text-white/30 border border-transparent cursor-not-allowed'
                      : 'bg-primaryGlow hover:scale-105 shadow-[0_0_15px_rgba(79,250,240,0.2)]'
                  }`}
                >
                  {applyingId ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
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

            return (
              <motion.div
                key={job.id}
                layoutId={`card-${job.id}`}
                className={`p-6 rounded-2xl glass-panel bg-[#071021]/30 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  job.isRecommended
                    ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                    : 'border-white/6 hover:border-white/20'
                }`}
              >
                {job.isRecommended && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-bold uppercase font-space px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    ⭐ Recommended For You
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start mt-2">
                    <div>
                      <h4 className="text-base font-bold text-white font-space uppercase tracking-wide line-clamp-1">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-primaryGlow font-space uppercase tracking-wider">
                          {job.department}
                        </span>
                        <span className="text-[9px] text-white/40 font-outfit">•</span>
                        <span
                          className={`text-[10px] font-bold font-space uppercase ${
                            job.isRecommended ? 'text-emerald-400' : 'text-mutedGray'
                          }`}
                        >
                          Skill Match: {job.matchPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 text-[10px] text-mutedGray font-outfit">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primaryGlow shrink-0" /> {job.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-primaryGlow shrink-0" /> $
                      {job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">
                      Skills Needed
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {job.skills.map((s: string, idx: number) => {
                        const isSkillMatched = candidateAllSkills.includes(s.trim().toLowerCase());
                        return (
                          <span
                            key={idx}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-space uppercase ${
                              isSkillMatched
                                ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30'
                                : 'text-mutedGray bg-white/3 border border-white/5'
                            }`}
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 py-2.5 rounded-xl border border-white/6 hover:border-white/15 text-[10px] font-bold text-white uppercase tracking-wider font-space transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleApplyClick(job)}
                    disabled={hasApplied}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider font-space flex items-center justify-center gap-1 transition-all ${
                      hasApplied
                        ? 'bg-success/15 border border-success/20 text-success'
                        : 'bg-primaryGlow text-black hover:scale-103 shadow-[0_0_12px_rgba(79,250,240,0.15)] cursor-pointer'
                    }`}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" /> Apply
                      </>
                    )}
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
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-8 mb-6">
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
