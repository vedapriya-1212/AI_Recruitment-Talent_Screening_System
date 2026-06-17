import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, CheckCircle, XCircle, Sparkles, Cpu } from 'lucide-react';

export default function ScreeningReport() {
  const { id } = useParams<{ id: string }>();
  const { candidates } = useApplication();
  const navigate = useNavigate();

  const candidate = candidates.find((c) => c.id === id);

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold font-space text-white uppercase">Candidate Index Missing</h3>
        <button onClick={() => navigate(-1)} className="mt-4 px-4.5 py-2 bg-white/5 rounded border border-white/8 text-xs font-bold text-white font-space uppercase">Go Back</button>
      </div>
    );
  }

  const report = candidate.screeningReport;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 text-left"
    >
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/12 text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">AI Screening Report</h2>
            <p className="text-mutedGray text-xs font-outfit mt-1">
              Deep semantic evaluation and competence alignment diagnostic for {candidate.name}.
            </p>
          </div>
        </div>

        {/* Confidence pill */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primaryGlow" />
          <div>
            <span className="text-base font-black text-white font-space block">{report.confidence}%</span>
            <span className="text-[8px] text-mutedGray uppercase font-black tracking-widest font-space">AI Confidence</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Summary & Strengths/Weaknesses (Col-span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* AI Parser Summary */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space flex items-center gap-2">
              <Brain className="w-4 h-4 text-primaryGlow animate-pulse" /> Semantic Parser Summary
            </h4>
            <p className="text-xs text-mutedGray leading-relaxed font-outfit">
              {report.parsedSummary}
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-success uppercase tracking-wider font-space flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Key Strengths
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

            {/* Weaknesses */}
            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-error uppercase tracking-wider font-space flex items-center gap-2">
                <XCircle className="w-4 h-4 text-error" /> Detected Gaps
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

          {/* AI Suggestions Checklist */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Structured Suggestions</h4>
            <ul className="space-y-3">
              {report.suggestions.map((sug, index) => (
                <li key={index} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow shrink-0 mt-1.5" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostics & Final Recommendation (Col-span 4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Alignment Indices */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Alignment Diagnostics</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Keyword match index</span>
                  <span>{report.keywordMatch}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primaryGlow" style={{ width: `${report.keywordMatch}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Technical capability fit</span>
                  <span>{report.technicalFit}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondaryGlow" style={{ width: `${report.technicalFit}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                  <span>Experience threshold fit</span>
                  <span>{report.experienceFit}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accentGlow" style={{ width: `${report.experienceFit}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Final Action Recommendation */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primaryGlow to-secondaryGlow" />
            
            <div className="w-12 h-12 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">AI Recommendation</h4>
            <h3 className="text-lg font-black text-white font-space uppercase leading-snug tracking-wide mt-2">
              {report.recommendation}
            </h3>

            <p className="text-[11px] text-mutedGray font-outfit mt-4 leading-relaxed">
              Matching models indicate {candidate.name} is in the top {100 - candidate.matchScore}% of developers matching requirements.
            </p>

            <button
              onClick={() => navigate('/recruiter/scheduler')}
              className="w-full py-3.5 mt-6 rounded-xl bg-primaryGlow text-[#030712] font-bold text-xs uppercase tracking-widest font-space hover:scale-103 transition-all cursor-pointer"
            >
              Dispatch Interview Invite
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
