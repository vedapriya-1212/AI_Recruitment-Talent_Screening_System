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
  matchingSkills: string[];
  missingSkills: string[];
  experienceRelevance: string;
  recommendation: string;
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
          <p className="text-[10px] text-mutedGray font-outfit mt-2">Analyzing resume semantics and job description fit</p>
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

  const matchingSkills = report.matchingSkills || [];
  const missingSkills = report.missingSkills || [];

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
            <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Recruiter Match Report</h2>
            <p className="text-mutedGray text-xs font-outfit mt-1">
              Job Description Semantic Evaluation for <span className="text-white font-bold">{report.candidateName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] border px-2.5 py-1 rounded font-black uppercase tracking-wider font-space border-primaryGlow/30 bg-primaryGlow/10 text-primaryGlow">
            {report.status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Match Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Match Score Display */}
          <div className="p-8 rounded-2xl glass-panel border border-primaryGlow/20 bg-gradient-to-br from-primaryGlow/5 via-[#071021]/30 to-[#071021]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[9px] text-mutedGray uppercase tracking-widest font-space font-bold">Neural Matching Score</span>
              <h3 className="text-5xl font-black text-white font-space">{report.matchScore}%</h3>
              <p className="text-[11px] text-mutedGray font-outfit max-w-sm">
                Semantic model mapping of candidate profile vs job description requirements.
              </p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-primaryGlow/20 flex items-center justify-center p-2">
              <div className="w-full h-full rounded-full bg-primaryGlow/10 flex items-center justify-center">
                <Brain className="w-10 h-10 text-primaryGlow animate-pulse" />
              </div>
            </div>
          </div>

          {/* Matching & Missing Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-success uppercase tracking-wider font-space flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Matching Skills
              </h4>
              {matchingSkills.length === 0 ? (
                <p className="text-xs text-mutedGray font-outfit">No explicit skill match found in resume.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchingSkills.map((skill, i) => (
                    <span key={i} className="text-[9px] font-bold text-success bg-success/10 border border-success/25 px-2.5 py-1 rounded-full font-space uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
              <h4 className="text-xs font-black text-error uppercase tracking-wider font-space flex items-center gap-2">
                <XCircle className="w-4 h-4 text-error" /> Missing Skills
              </h4>
              {missingSkills.length === 0 ? (
                <p className="text-xs text-mutedGray font-outfit">No missing critical skills detected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, i) => (
                    <span key={i} className="text-[9px] font-bold text-error bg-error/10 border border-error/25 px-2.5 py-1 rounded-full font-space uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Experience Relevance */}
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Experience Relevance</h4>
            <p className="text-xs text-mutedGray leading-relaxed font-outfit">{report.experienceRelevance}</p>
          </div>

        </div>

        {/* RIGHT COLUMN: Recruiter Recommendations */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Final Recommendation */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primaryGlow to-[#FFD166]" />
            <div className="w-12 h-12 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">AI Recommendation</h4>
            <h3 className="text-base font-black text-primaryGlow font-space uppercase leading-snug tracking-wide mt-2">
              {report.recommendation}
            </h3>
            
            <button
              onClick={() => navigate('/recruiter/scheduler')}
              className="w-full py-3.5 mt-6 rounded-xl bg-primaryGlow text-[#030712] font-bold text-xs uppercase tracking-widest font-space hover:scale-103 transition-all cursor-pointer"
            >
              Dispatch Interview Invite
            </button>
          </div>

          {/* Candidate Info card */}
          <div className="p-5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-3">
            <h4 className="text-[10px] font-black text-mutedGray uppercase tracking-wider font-space">Candidate Metadata</h4>
            <div className="space-y-2 text-xs font-outfit">
              <div className="flex justify-between">
                <span className="text-mutedGray">Name</span>
                <span className="text-white font-bold">{report.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Email</span>
                <span className="text-white text-[10px] select-all">{report.candidateEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGray">Target Role</span>
                <span className="text-white font-bold">{report.jobTitle}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
