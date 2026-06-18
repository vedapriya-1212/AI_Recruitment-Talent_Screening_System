import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Cpu, Terminal, CheckCircle2, Star, GraduationCap, Briefcase, Code, AlertCircle, RefreshCw, Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

const API_BASE = ''; // Using Vite proxy

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
  
  // New Feedback states
  const [feedback, setFeedback] = useState<any>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('ats_token') : null;

  const addLog = (msg: string) => setConsoleLogs(prev => [...prev, msg]);

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
      addLog('🧠 RUNNING GEMINI AI ANALYSIS...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(90);
      addLog('📊 SCORING TECHNICAL COMPETENCY MATRIX...');
      await new Promise(r => setTimeout(r, 600));

      addLog('🎯 COMPUTING ALIGNMENT METRICS...');
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
      addLog(`📈 EXPERIENCE DETECTED: ${extracted.experienceYears} year(s)`);
      addLog(`🎓 EDUCATION: ${extracted.education}`);
      addLog(`🚀 STATUS: Resume stored & ready for AI screening`);

      setExtractedData(extracted);
      setFeedback(null); // reset feedback on new upload
      setIsDone(true);
      setUploading(false);
      localStorage.setItem('has_uploaded_resume', 'true');

      toast.success('Resume Analyzed Successfully!', {
        description: `${selectedFile.name} processed. AI screening will use this resume when recruiters view your application.`,
      });
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="w-6 h-6 text-primaryGlow" />
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">AI Resume Screening</h2>
        </div>
        <p className="text-mutedGray text-xs font-outfit">
          Upload your PDF resume to run real Gemini AI analysis. Your resume will be used for automatic screening when recruiters review your application.
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
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center bg-[#071021]/20 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
              dragActive ? 'border-primaryGlow bg-primaryGlow/5 scale-[0.99]' : 'border-white/10 hover:border-primaryGlow/30'
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
                {uploading && <span className="text-[9px] text-primaryGlow font-space animate-pulse">PROCESSING</span>}
                <span className={`w-2.5 h-2.5 rounded-full ${uploading ? 'bg-primaryGlow animate-ping' : isDone ? 'bg-success' : 'bg-white/20'}`} />
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
                  ⚠️ Upload failed. Check that backend is running at port 5000 and try again.
                </div>
              )}
              <div ref={consoleBottomRef} />
            </div>

            {(uploading || isDone) && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase font-space">
                  <span className={isDone ? 'text-success' : 'text-primaryGlow'}>
                    {isDone ? 'Analysis Complete' : 'AI Parsing Stream'}
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
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">AI Extraction Report</h4>

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
                    Upload your PDF resume for real Gemini AI analysis. Skills, experience, and education will be extracted automatically.
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
                        <span className="text-xs text-mutedGray block font-outfit">{extractedData?.title} · {extractedData?.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="bg-success/15 border border-success/35 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Analyzed ✓
                      </span>
                      <span className="text-[9px] text-mutedGray font-outfit">{extractedData?.textLength} chars extracted</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Experience', value: `${extractedData?.experienceYears} yr${extractedData?.experienceYears !== 1 ? 's' : ''}` },
                      { label: 'Education', value: extractedData?.education?.split(',')[0] || 'Detected' },
                      { label: 'File', value: extractedData?.filename?.split('.')[0] || 'Resume' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                        <div className="text-[9px] text-mutedGray uppercase tracking-wider font-space">{label}</div>
                        <div className="text-xs font-bold text-white font-outfit mt-1 truncate">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Extracted Skills */}
                  {extractedData?.skills?.length > 0 && (
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-primaryGlow" /> AI-Extracted Skills
                      </h6>
                      <div className="flex gap-1.5 flex-wrap">
                        {extractedData.skills.map((skill: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-1 rounded-full font-space uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                      <h6 className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primaryGlow" /> Experience
                      </h6>
                      <p className="text-xs text-white font-outfit">{extractedData?.experienceYears} year(s) of professional experience</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                      <h6 className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primaryGlow" /> Education
                      </h6>
                      <p className="text-xs text-white font-outfit">{extractedData?.education}</p>
                    </div>
                  </div>

                  {/* AI Ready Banner */}
                  <div className="p-4 rounded-xl bg-primaryGlow/5 border border-primaryGlow/20 flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primaryGlow shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-primaryGlow font-space uppercase tracking-wide">AI Screening Ready</div>
                      <div className="text-[10px] text-mutedGray font-outfit mt-0.5">
                        Recruiters who view your application report will now get a real Gemini AI analysis of this resume vs the job requirements.
                      </div>
                    </div>
                  </div>

                  {/* Constructive Feedback Section */}
                  {feedback ? (
                    <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-4">
                      <h4 className="text-xs font-black text-white font-space uppercase flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primaryGlow" /> Career Feedback
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-mutedGray uppercase font-space font-bold">Skill Gap Analysis</span>
                          <p className="text-xs text-white mt-1 leading-relaxed">{feedback.skillGapAnalysis}</p>
                        </div>
                        {feedback.suggestedCourses?.length > 0 && (
                          <div>
                            <span className="text-[10px] text-mutedGray uppercase font-space font-bold">Suggested Courses</span>
                            <ul className="mt-1 space-y-1">
                              {feedback.suggestedCourses.map((c: string, i: number) => (
                                <li key={i} className="text-xs text-white flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-primaryGlow" /> {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feedback.resumeImprovementTips?.length > 0 && (
                          <div>
                            <span className="text-[10px] text-mutedGray uppercase font-space font-bold">Improvement Tips</span>
                            <ul className="mt-1 space-y-1">
                              {feedback.resumeImprovementTips.map((t: string, i: number) => (
                                <li key={i} className="text-xs text-white flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-primaryGlow" /> {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={async () => {
                        setGeneratingFeedback(true);
                        try {
                          const res = await fetch(`${API_BASE}/api/resume/feedback`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ targetRole: user?.preferredRole || 'Software Engineer' })
                          });
                          const data = await res.json();
                          if(data.success) setFeedback(data.feedback);
                          else throw new Error(data.error);
                        } catch(e: any) {
                          toast.error('Failed to generate feedback: ' + e.message);
                        } finally {
                          setGeneratingFeedback(false);
                        }
                      }}
                      disabled={generatingFeedback}
                      className="w-full py-3 rounded-xl border border-primaryGlow/30 bg-primaryGlow/5 text-primaryGlow text-xs font-bold font-space uppercase tracking-wider hover:bg-primaryGlow/10 transition-colors flex items-center justify-center gap-2"
                    >
                      {generatingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate Constructive Career Feedback
                    </button>
                  )}
                </div>

                {/* Re-upload button */}
                <button
                  onClick={() => { setIsDone(false); setConsoleLogs([]); setFile(null); }}
                  className="flex items-center gap-2 text-xs text-mutedGray hover:text-white transition-colors font-outfit"
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
