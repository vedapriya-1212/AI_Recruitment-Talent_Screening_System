import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Cpu, Award } from 'lucide-react';

export default function ScreeningResults() {
  const { user } = useAuth();
  const { candidates } = useApplication();
  const navigate = useNavigate();

  const myProfile = candidates.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || candidates[0];

  if (!myProfile) {
    return (
      <div className="p-8 rounded-2xl glass-panel border border-[#FFD166]/30 bg-[#FFD166]/5 flex flex-col items-center justify-center text-center py-20 gap-4">
        <Brain className="w-12 h-12 text-[#FFD166] animate-pulse" />
        <h3 className="text-lg font-black uppercase tracking-wider font-space text-white">No AI Screening Report</h3>
        <p className="text-xs text-mutedGray max-w-md font-outfit leading-relaxed">
          You will receive a detailed AI feedback report once you upload your resume and apply for a position.
        </p>
        <button
          onClick={() => navigate('/candidate/resume')}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#FFD166] text-[#030712] text-xs font-bold uppercase tracking-wider font-space hover:scale-105 transition-all cursor-pointer"
        >
          Upload Your Resume
        </button>
      </div>
    );
  }

  const rawReport = myProfile?.screeningReport;
  const report = {
    parsedSummary: rawReport?.parsedSummary || 'Screening report processing in progress. Metrics will load once analysis completes.',
    strengths: Array.isArray(rawReport?.strengths) ? rawReport.strengths : [],
    weaknesses: Array.isArray(rawReport?.weaknesses) ? rawReport.weaknesses : [],
    suggestions: Array.isArray(rawReport?.suggestions) ? rawReport.suggestions : [],
    keywordMatch: rawReport?.keywordMatch ?? 0,
    technicalFit: rawReport?.technicalFit ?? 0,
    experienceFit: rawReport?.experienceFit ?? 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left animate-fade-in"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">AI Screening Report</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Diagnostic metrics returned by the matching core scanner.
          </p>
        </div>

        {/* Ingested Score */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primaryGlow animate-pulse" />
          <div>
            <span className="text-base font-black text-white font-space block">{myProfile.resumeScore}%</span>
            <span className="text-[8px] text-mutedGray uppercase font-black tracking-widest font-space">Resume Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Summary & Gaps (Col-span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Summary */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Competence Parsing Output</h4>
            <p className="text-xs text-mutedGray leading-relaxed font-outfit">
              {report.parsedSummary}
            </p>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-success uppercase tracking-wider font-space flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Strength Highlights
              </h4>
              <ul className="space-y-3">
                {report.strengths.map((str, index) => (
                  <li key={index} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-error uppercase tracking-wider font-space flex items-center gap-2">
                <XCircle className="w-4 h-4 text-error" /> Improvement Gaps
              </h4>
              <ul className="space-y-3">
                {report.weaknesses.map((weak, index) => (
                  <li key={index} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                    <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Skill Optimization Suggestions</h4>
            <ul className="space-y-3.5">
              {report.suggestions.map((sug, index) => (
                <li key={index} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow shrink-0 mt-1.5" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostics & Position (Col-span 4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Fit Metrics */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Match Diagnostics</h4>
            
            <div className="space-y-4.5">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Keyword match rate</span>
                  <span>{report.keywordMatch}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primaryGlow" style={{ width: `${report.keywordMatch}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Technical Alignment</span>
                  <span>{report.technicalFit}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondaryGlow" style={{ width: `${report.technicalFit}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Experience Threshold</span>
                  <span>{report.experienceFit}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accentGlow" style={{ width: `${report.experienceFit}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Rank Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/25 text-[#FFD166] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Pipeline Ranking</h4>
              <h3 className="text-3xl font-black text-white font-space mt-2">
                #0{myProfile.rank}
              </h3>
              <p className="text-[10px] text-mutedGray mt-2 font-outfit leading-relaxed">
                Rank position compared against other applicants in the screening pool.
              </p>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
