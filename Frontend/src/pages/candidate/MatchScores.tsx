import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Award, HelpCircle, CheckCircle, BrainCircuit, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { JobPost } from '../../api/mockData';

export default function MatchScores() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  // Match statistics calculations based on selected job optimization scores
  const [scores, setScores] = useState({
    overall: 96,
    skills: 92,
    experience: 95,
    education: 90,
  });

  useEffect(() => {
    async function loadJobs() {
      const allJobs = await apiClient.getJobs();
      setJobs(allJobs);
      if (allJobs.length > 0) {
        setSelectedJobId(allJobs[0].id);
        setSelectedJob(allJobs[0]);
      }
    }
    loadJobs();
  }, []);

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedJobId(id);
    const job = jobs.find((j) => j.id === id) || null;
    setSelectedJob(job);
    
    // Vary scores based on job id to show dynamic matches
    if (job) {
      const seed = job.optimizationScore;
      setScores({
        overall: seed,
        skills: Math.max(70, seed - 4),
        experience: Math.max(70, seed - 2),
        education: Math.max(70, seed - 6),
      });
    }
  };

  // Circular Gauge Calculations
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scores.overall / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Neural Match Diagnostics</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Auditing match coefficients between your profile coordinates and active roles.
          </p>
        </div>

        {/* Job selector */}
        <div className="w-full sm:w-64">
          <select
            value={selectedJobId}
            onChange={handleJobChange}
            className="w-full bg-[#071021]/60 border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow cursor-pointer font-outfit"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Match Gauge circular wheel (Col span 5) */}
        <div className="lg:col-span-5 p-7 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 flex flex-col items-center justify-center gap-6">
          <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Overall Alignment Score</span>
          
          {/* SVG Ring */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-white/5"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress */}
              <motion.circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-primaryGlow"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-black text-white font-space">{scores.overall}%</span>
              <span className="text-[9px] font-bold text-primaryGlow uppercase tracking-wider block mt-0.5 font-space">Qualified Match</span>
            </div>
          </div>

          <div className="text-center w-full p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
            <h6 className="text-[10px] font-bold text-white uppercase tracking-wider font-space flex items-center justify-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-primaryGlow shrink-0" /> AI Recommendation
            </h6>
            <p className="text-xs text-mutedGray font-outfit leading-relaxed">
              "Strong semantic match for {selectedJob?.title || 'the selected'} role. Technical fit indices exceed pool average by 18%."
            </p>
          </div>
        </div>

        {/* Right Column: Match Breakdown Bars (Col span 7) */}
        <div className="lg:col-span-7 p-7 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Coefficients Breakdown</h4>
            
            {/* Progress Bars */}
            <div className="space-y-5">
              {/* Bar 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">
                  <span>Skills Match Score</span>
                  <span className="text-white">{scores.skills}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.skills}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primaryGlow"
                  />
                </div>
              </div>

              {/* Bar 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">
                  <span>Experience Match Score</span>
                  <span className="text-white">{scores.experience}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.experience}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-secondaryGlow"
                  />
                </div>
              </div>

              {/* Bar 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">
                  <span>Education Match Score</span>
                  <span className="text-white">{scores.education}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.education}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-accentGlow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Missing Checklist */}
          {selectedJob && selectedJob.missingSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-error/5 border border-error/20 space-y-2">
              <span className="text-[10px] font-bold text-error uppercase tracking-wider font-space flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Recommended Additions (Skills Gap)
              </span>
              <div className="flex gap-2 flex-wrap">
                {selectedJob.missingSkills.map((skill, index) => (
                  <span key={index} className="text-[9px] font-bold text-error bg-error/10 border border-error/20 px-2.5 py-0.5 rounded-full font-space uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
