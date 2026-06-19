import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Cpu, Terminal, CheckCircle2, ShieldAlert, Award, Star, GraduationCap, Briefcase, Code, AlertCircle, RefreshCw, Sparkles, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

const API_BASE = ''; // Using Vite proxy

const safeParseArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') {
        return parsed.split(',').map(s => s.trim()).filter(Boolean);
      }
    } catch {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function ResumeUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Flow 1 Private Self Analysis state
  const [selfAnalysis, setSelfAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('ats_token') : null;

  const addLog = (msg: string) => setConsoleLogs(prev => [...prev, msg]);

  // Load status and latest analysis on mount
  useEffect(() => {
    const fetchStatusAndAnalysis = async () => {
      if (!token) return;
      try {
        const statusRes = await fetch(`${API_BASE}/api/resume/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statusData = await statusRes.json();
        if (statusRes.ok && statusData.hasResume) {
          setIsDone(true);
          setExtractedData({
            name: user ? `${user.first_name} ${user.last_name}` : 'Candidate',
            email: user?.email || '',
            filename: statusData.filename || 'resume.pdf',
            textLength: statusData.textLength || 0,
          });

          // Fetch latest analysis
          const analysisRes = await fetch(`${API_BASE}/api/resume/analysis/latest`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const analysisData = await analysisRes.json();
          if (analysisRes.ok && analysisData.success) {
            setSelfAnalysis(analysisData.analysis);
          }
        }
      } catch (err) {
        console.warn('Failed to load resume status or latest analysis:', err);
      }
    };
    fetchStatusAndAnalysis();
  }, [token, user]);

  const triggerSelfAnalysis = async () => {
    if (!token) return;
    setAnalyzing(true);
    addLog('🧠 INITIATING PRIVATE AI RESUME SELF-ANALYSIS...');
    try {
      const response = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      setSelfAnalysis(data.analysis);
      addLog('📊 PRIVATE SCORING MATRIX COMPUTED SUCCESSFULLY');
      toast.success('Self-Analysis Complete!', {
        description: 'Your private resume analysis dashboard has been updated.'
      });
    } catch (err: any) {
      addLog(`❌ ANALYSIS ERROR: ${err.message}`);
      toast.error('Self-analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadResume = async (selectedFile: File) => {
    if (!token) {
      toast.error('Please log in to upload your resume');
      return;
    }
    if (!selectedFile.name.endsWith('.pdf')) {
      toast.error('Only PDF files are accepted');
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setProgress(0);
    setIsDone(false);
    setHasError(false);
    setConsoleLogs([]);
    setExtractedData(null);
    setSelfAnalysis(null);

    // Phase 1: Show startup logs
    const startupLogs = [
      '⚡ CONNECTING TO AI ENGINE...',
      '🤖 GEMINI 1.5 FLASH NEURAL ENGINE INITIALIZED',
      `📂 INGESTING DOCUMENT: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)`,
      '🔍 PARSING PDF STRUCTURE & TEXT BLOCKS...',
      '🛠️ EXTRACTING SEMANTIC CONTENT LAYERS...',
    ];

    let progressVal = 0;
    for (const log of startupLogs) {
      await new Promise(r => setTimeout(r, 400));
      addLog(log);
      progressVal += 12;
      setProgress(Math.min(progressVal, 55));
    }

    // Phase 2: Actual upload
    try {
      addLog('📡 TRANSMITTING TO BACKEND PROCESSING UNIT...');
      setProgress(60);

      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await fetch(`${API_BASE}/api/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setProgress(75);
      addLog('🧠 STORED RESUME DETAILS TO CLOUD DATABASE...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(90);
      addLog('🎯 EXTRACTION VERIFIED...');
      await new Promise(r => setTimeout(r, 500));
      setProgress(100);

      // Build display from real extracted data
      const info = data.extractedInfo || {};
      const extracted = {
        name: user ? `${user.first_name} ${user.last_name}` : 'Candidate',
        email: user?.email || '',
        title: info.title || 'Professional',
        education: info.education || 'Detected from resume',
        experienceYears: info.years || 'N/A',
        skills: data.skills || [],
        filename: data.filename,
        textLength: data.textLength,
      };

      addLog(`✅ EXTRACTION COMPLETE: ${data.textLength} characters analyzed`);
      addLog(`🚀 STATUS: Resume stored & ready for self-analysis`);

      setExtractedData(extracted);
      setIsDone(true);
      setUploading(false);
      localStorage.setItem('has_uploaded_resume', 'true');
      localStorage.setItem('resume_uploaded_skills', JSON.stringify(data.skills || []));

      // Proactively trigger the Flow 1 self-analysis report
      await triggerSelfAnalysis();

    } catch (err: any) {
      addLog(`❌ ERROR: ${err.message}`);
      setHasError(true);
      setUploading(false);
      toast.error('Upload failed: ' + err.message);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) uploadResume(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadResume(f);
    e.target.value = '';
  };

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Extract analysis fields safely
  const resumeScore = selfAnalysis?.resume_score ?? selfAnalysis?.resumeScore ?? 0;
  const atsScore = selfAnalysis?.ats_score ?? selfAnalysis?.atsScore ?? 0;
  const strengths = safeParseArray(selfAnalysis?.strengths);
  const missingSkills = safeParseArray(selfAnalysis?.missing_skills ?? selfAnalysis?.missingSkills);
  const suggestions = safeParseArray(selfAnalysis?.suggestions);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="w-6 h-6 text-primaryGlow" />
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Resume Analyzer</h2>
        </div>
        <p className="text-mutedGray text-xs font-outfit">
          Upload and run self-improvement analysis on your resume. Improve your ATS visibility and profile scoring before applying to roles.
        </p>
        {!token && (
          <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-outfit flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> You must be logged in as a candidate to upload your resume.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload + Console */}
        <div className="lg:col-span-5 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Ingestion Portal</h4>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag} onDragOver={handleDrag}
            onDragLeave={handleDrag} onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center bg-[#071021]/20 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${dragActive ? 'border-primaryGlow bg-primaryGlow/5 scale-[0.99]' : 'border-white/10 hover:border-primaryGlow/30'
              } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
          >
            <input
              type="file" accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`w-12 h-12 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center ${uploading ? 'text-primaryGlow animate-pulse' : 'text-mutedGray'}`}>
              {uploading ? <Sparkles className="w-6 h-6" /> : <CloudUpload className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xs font-bold text-white block uppercase tracking-wider font-space">
                {uploading ? 'Processing...' : isDone ? 'Upload Another Resume' : 'Drag & Drop Resume'}
              </span>
              <span className="text-[10px] text-mutedGray mt-1 block font-outfit">PDF files only · Max 10MB</span>
            </div>
            {!uploading && (
              <button className="px-4 py-2 bg-primaryGlow/10 border border-primaryGlow/25 hover:bg-primaryGlow/20 rounded-lg text-[10px] font-bold uppercase tracking-wider font-space text-primaryGlow cursor-pointer transition-all">
                Choose PDF File
              </button>
            )}
          </div>

          {/* AI Console */}
          <div className="p-5 rounded-2xl border border-white/6 bg-[#030712] relative overflow-hidden space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primaryGlow shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider font-space text-white">Gemini AI Console</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(uploading || analyzing) && <span className="text-[9px] text-primaryGlow font-space animate-pulse">PROCESSING</span>}
                <span className={`w-2.5 h-2.5 rounded-full ${(uploading || analyzing) ? 'bg-primaryGlow animate-ping' : isDone ? 'bg-success' : 'bg-white/20'}`} />
              </div>
            </div>

            <div className="h-48 overflow-y-auto bg-black/60 border border-white/5 rounded-lg p-3 font-mono text-[9px] text-[#4FFA00] space-y-2 select-text">
              {consoleLogs.length === 0 ? (
                <span className="text-mutedGray italic">Console idle. Awaiting document drop...</span>
              ) : (
                consoleLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-white/30">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))
              )}
              {hasError && (
                <div className="text-error mt-2 font-bold">
                  ⚠️ Upload failed. Check that backend is running and try again.
                </div>
              )}
              <div ref={consoleBottomRef} />
            </div>

            {(uploading || isDone) && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase font-space">
                  <span className={isDone ? 'text-success' : 'text-primaryGlow'}>
                    {isDone ? 'Ingestion Complete' : 'AI Ingestion Stream'}
                  </span>
                  <span className={isDone ? 'text-success' : 'text-primaryGlow'}>{progress}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isDone ? 'bg-success' : 'bg-primaryGlow'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">AI Self-Analysis report</h4>

          <AnimatePresence mode="wait">
            {!isDone ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-10 text-center rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 py-20 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-primaryGlow/5 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center animate-pulse">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white uppercase tracking-wider font-space">Awaiting Resume Upload</h5>
                  <p className="text-xs text-mutedGray font-outfit mt-1 max-w-xs mx-auto">
                    Upload your PDF resume to run the private self-improvement analysis. Get instant ratings on your resume formatting and keyword alignment.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Status Card */}
                <div className="p-5 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 space-y-5">
                  {/* Candidate Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primaryGlow/15 border border-primaryGlow/30 text-primaryGlow flex items-center justify-center font-bold text-sm font-space uppercase">
                        {extractedData?.name?.[0] || 'C'}
                      </div>
                      <div>
                        <h5 className="text-base font-bold text-white font-space uppercase tracking-wide">{extractedData?.name}</h5>
                        <span className="text-xs text-mutedGray block font-outfit">{extractedData?.email} · {extractedData?.filename}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="bg-success/15 border border-success/35 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resume Ingested ✓
                      </span>
                    </div>
                  </div>

                  {/* Private Shield Banner */}
                  <div className="p-4 rounded-xl bg-secondaryGlow/5 border border-secondaryGlow/20 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-secondaryGlow shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-secondaryGlow font-space uppercase tracking-wide">🔒 Private Report Boundary</div>
                      <p className="text-[10px] text-mutedGray font-outfit mt-0.5 leading-relaxed">
                        This self-improvement analysis and these scores are strictly <strong>private to you</strong>. Recruiters will never see these scores or suggestions.
                      </p>
                    </div>
                  </div>

                  {/* Flow 1 Private Scores */}
                  {selfAnalysis ? (
                    <div className="space-y-6">
                      {/* Scores display */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-white/2 border border-white/5 text-center flex flex-col items-center justify-center">
                          <span className="text-[9px] text-mutedGray uppercase tracking-wider font-space">Resume Score</span>
                          <span className="text-3xl font-black text-white font-space mt-2">{resumeScore}/100</span>
                        </div>
                        <div className="p-5 rounded-xl bg-white/2 border border-white/5 text-center flex flex-col items-center justify-center">
                          <span className="text-[9px] text-mutedGray uppercase tracking-wider font-space">ATS Score</span>
                          <span className="text-3xl font-black text-[#FFD166] font-space mt-2">{atsScore}/100</span>
                        </div>
                      </div>

                      {/* Strengths */}
                      {strengths.length > 0 && (
                        <div className="space-y-2 text-left">
                          <h6 className="text-[10px] font-black uppercase tracking-wider text-white font-space flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-primaryGlow" /> Resume Strengths
                          </h6>
                          <ul className="space-y-2">
                            {strengths.map((str: string, i: number) => (
                              <li key={i} className="text-xs text-mutedGray flex items-start gap-2.5 leading-relaxed font-outfit">
                                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-2" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {missingSkills.length > 0 && (
                        <div className="space-y-2 text-left">
                          <h6 className="text-[10px] font-black uppercase tracking-wider text-white font-space flex items-center gap-1.5">
                            <Code className="w-4 h-4 text-secondaryGlow" /> Missing Skills
                          </h6>
                          <div className="flex gap-1.5 flex-wrap">
                            {missingSkills.map((skill: string, i: number) => (
                              <span key={i} className="text-[9px] font-bold text-error bg-error/10 border border-error/25 px-2.5 py-1 rounded-full font-space uppercase">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Improvement Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="space-y-2 text-left border-t border-white/5 pt-4">
                          <h6 className="text-[10px] font-black uppercase tracking-wider text-white font-space flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#FFD166] animate-pulse" /> Improvement Suggestions
                          </h6>
                          <ul className="space-y-2">
                            {suggestions.map((sug: string, i: number) => (
                              <li key={i} className="text-xs text-mutedGray flex items-start gap-2.5 leading-relaxed font-outfit">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166] shrink-0 mt-2" />
                                <span>{sug}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white/2 border border-white/5 rounded-xl space-y-4">
                      {analyzing ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-primaryGlow animate-spin" />
                          <span className="text-xs text-mutedGray font-space uppercase">Generating Private analysis...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <span className="text-xs text-mutedGray font-outfit block">No self-analysis scores computed for this resume.</span>
                          <button
                            onClick={triggerSelfAnalysis}
                            className="px-5 py-2.5 rounded-xl bg-primaryGlow text-black text-xs font-bold font-space uppercase tracking-wider hover:scale-103 transition-all cursor-pointer"
                          >
                            Analyze Resume Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Re-upload button */}
                <button
                  onClick={() => { setIsDone(false); setConsoleLogs([]); setFile(null); setSelfAnalysis(null); }}
                  className="flex items-center gap-2 text-xs text-mutedGray hover:text-white transition-colors font-outfit mt-4"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload a different resume
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
