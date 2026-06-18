import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, CheckCircle, XCircle, Sparkles, Cpu, Loader2, RefreshCw } from 'lucide-react';

interface AIReport {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  status: string;
  matchScore: number;
  technicalScore: number;
  communicationScore: number;
  resumeScore: number;
  overallScore: number;
  experienceYears: number;
  education: string;
  screeningReport: {
    parsedSummary: string;
    strengths: string[];
    weaknesses: string[];
    keywordMatch: number;
    technicalFit: number;
    experienceFit: number;
    recommendation: string;
    confidence: number;
    suggestions: string[];
  };
}

export default function ScreeningReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAIReport(id);
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-primaryGlow/30 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="w-16 h-16 rounded-full bg-primaryGlow/10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primaryGlow animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">Running AI Screening Engine...</p>
          <p className="text-[10px] text-mutedGray font-outfit mt-2">Analyzing resume semantics and skill alignment</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold font-space text-white uppercase">Report Unavailable</h3>
        <p className="text-xs text-mutedGray font-outfit mt-2">{error || 'Application data not found.'}</p>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => fetchReport()} className="px-4.5 py-2 bg-primaryGlow/10 border border-primaryGlow/20 text-primaryGlow rounded border text-xs font-bold uppercase font-space flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
          <button onClick={() => navigate(-1)} className="px-4.5 py-2 bg-white/5 rounded border border-white/8 text-xs font-bold text-white font-space uppercase">Go Back</button>
        </div>
      </div>
    );
  }

  const r = report.screeningReport;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 text-left">
      {/* Header */}
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
              Deep semantic evaluation for <span className="text-white font-bold">{report.candidateName}</span> → {report.jobTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span className="text-[9px] border px-2.5 py-1 rounded font-black uppercase tracking-wider font-space border-primaryGlow/30 bg-primaryGlow/10 text-primaryGlow">
            {report.status}
          </span>
          {/* Confidence pill */}
          <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-primaryGlow" />
            <div>
              <span className="text-base font-black text-white font-space block">{r.confidence}%</span>
              <span className="text-[8px] text-mutedGray uppercase font-black tracking-widest font-space">AI Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'AI Match', value: report.matchScore, color: 'text-primaryGlow', bg: 'bg-primaryGlow/10 border-primaryGlow/20' },
          { label: 'Technical', value: report.technicalScore, color: 'text-secondaryGlow', bg: 'bg-secondaryGlow/10 border-secondaryGlow/20' },
          { label: 'Communication', value: report.communicationScore, color: 'text-[#FFD166]', bg: 'bg-[#FFD166]/10 border-[#FFD166]/20' },
          { label: 'Overall', value: report.overallScore, color: 'text-success', bg: 'bg-success/10 border-success/20' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl glass-panel border ${s.bg} text-center`}>
            <div className={`text-3xl font-black font-space ${s.color}`}>{s.value}%</div>
            <div className="text-[9px] text-mutedGray uppercase tracking-wider font-space mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Summary */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space flex items-center gap-2">
              <Brain className="w-4 h-4 text-primaryGlow animate-pulse" /> Semantic Parser Summary
            </h4>
            <p className="text-xs text-mutedGray leading-relaxed font-outfit">{r.parsedSummary}</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-success uppercase tracking-wider font-space flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Key Strengths
              </h4>
              <ul className="space-y-3">
                {r.strengths.map((str, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-error uppercase tracking-wider font-space flex items-center gap-2">
                <XCircle className="w-4 h-4 text-error" /> Detected Gaps
              </h4>
              <ul className="space-y-3">
                {r.weaknesses.map((weak, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                    <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Recruiter Action Items</h4>
            <ul className="space-y-3">
              {r.suggestions.map((sug, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs text-mutedGray font-outfit leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow shrink-0 mt-1.5" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          {/* Alignment Diagnostics */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Alignment Diagnostics</h4>
            <div className="space-y-4">
              {[
                { label: 'Keyword Match Index', value: r.keywordMatch, color: 'bg-primaryGlow' },
                { label: 'Technical Capability Fit', value: r.technicalFit, color: 'bg-secondaryGlow' },
                { label: 'Experience Threshold Fit', value: r.experienceFit, color: 'bg-accentGlow' },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space mb-1">
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full ${bar.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Recommendation */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primaryGlow to-secondaryGlow" />
            <div className="w-12 h-12 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">AI Recommendation</h4>
            <h3 className="text-base font-black text-primaryGlow font-space uppercase leading-snug tracking-wide mt-2">
              {r.recommendation}
            </h3>
            <p className="text-[11px] text-mutedGray font-outfit mt-4 leading-relaxed">
              Neural matching models indicate <span className="text-white font-bold">{report.candidateName}</span> has a {r.confidence}% confidence alignment for this role.
            </p>
            <button
              onClick={() => navigate('/recruiter/scheduler')}
              className="w-full py-3.5 mt-6 rounded-xl bg-primaryGlow text-[#030712] font-bold text-xs uppercase tracking-widest font-space hover:scale-103 transition-all cursor-pointer"
            >
              Dispatch Interview Invite
            </button>
          </div>

          {/* Candidate Info */}
          <div className="p-5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-3">
            <h4 className="text-[10px] font-black text-mutedGray uppercase tracking-wider font-space">Candidate Info</h4>
            <div className="space-y-2 text-xs font-outfit">
              <div className="flex justify-between">
                <span className="text-mutedGray">Name</span>
                <span className="text-white font-bold">{report.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Email</span>
                <span className="text-white text-[10px]">{report.candidateEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Experience</span>
                <span className="text-white font-bold">{report.experienceYears} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Education</span>
                <span className="text-white text-[10px] text-right max-w-[140px]">{report.education}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
