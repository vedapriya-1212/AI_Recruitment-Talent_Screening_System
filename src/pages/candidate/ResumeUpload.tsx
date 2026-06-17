import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Cpu, Terminal, CheckCircle2, User, Mail, Star, GraduationCap, Briefcase, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Extracted details mock
  const [extractedData, setExtractedData] = useState<any>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const simulateIngestion = (fileName: string) => {
    setUploading(true);
    setProgress(0);
    setIsDone(false);
    setConsoleLogs([]);
    setExtractedData(null);

    const logs = [
      '⚡ CONNECTING ENGINE TO WEBSOCKET CHANNEL...',
      '🤖 CORE NEURAL ENGINE INITIALIZED',
      `📂 INGESTING DOCUMENT SOURCE: ${fileName}`,
      '🔍 EXTRACTING STRUCTURAL PDF COORDINATES...',
      '🛠️ PARSING WORD BLOCKS & TEXT SHAPES...',
      '📦 SKILLS EXTRACTED: React.js, TypeScript, Next.js, Node.js, Cloud Security, Supabase',
      '📈 ANALYZING PROJECTS & ACADEMIC CREDENTIALS...',
      '🎯 CALCULATING MATCH ACCURACY METRICS...',
      '✅ EVALUATION COMPLETE: OVERALL ALIGNMENT SCORE: 96%',
      '🧠 RECOMMENDATION GENERATED: Highly Suitable Candidate',
    ];

    // Increment progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Stream console logs sequentially
    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logs.length) {
        setConsoleLogs((prev) => [...prev, logs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logInterval);
        setUploading(false);
        setIsDone(true);
        setExtractedData({
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@devmail.com',
          skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'Node.js', 'Supabase', 'Cloud Security'],
          education: 'BS in Computer Science, Georgia Tech',
          experience: '6 Years as Frontend & UI Systems Engineer at Vercel Corp',
          projects: 'Designed modular UI dashboard frames, handled bundler updates, and deployed serverless analytics.',
        });
        toast.success('Resume Analysis Complete!', {
          description: 'Technical competencies registry and ranking status have been compiled.',
        });
      }
    }, 400);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      simulateIngestion(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateIngestion(file.name);
    }
  };

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Resume Core Analysis</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Upload your credentials to initialize AI mapping diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Drag & Drop + Decision Engine Console (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Ingestion Portal</h4>
          
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center bg-[#071021]/20 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
              dragActive ? 'border-primaryGlow bg-primaryGlow/5 scale-[0.99]' : 'border-white/10 hover:border-primaryGlow/30'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-mutedGray">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block uppercase tracking-wider font-space">Drag & Drop Resume</span>
              <span className="text-[10px] text-mutedGray mt-1 block font-outfit">PDF or DOCX files accepted</span>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 rounded-lg text-[10px] font-bold uppercase tracking-wider font-space text-white cursor-pointer transition-all">
              Choose File
            </button>
          </div>

          {/* AI Decision Engine Panel (Console) */}
          <div className="p-5.5 rounded-2xl border border-white/6 bg-[#030712] relative overflow-hidden space-y-4 shadow-2xl">
            {/* Header console tab */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primaryGlow shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider font-space text-white">AI Real-time Console</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-primaryGlow animate-ping" />
            </div>

            {/* Logging area */}
            <div className="h-44 overflow-y-auto bg-black/60 border border-white/5 rounded-lg p-3 font-mono text-[9px] text-[#4FFA00] space-y-2 select-text scrollbar-thin">
              {consoleLogs.length === 0 ? (
                <span className="text-mutedGray italic">Console idle. Awaiting document drop coordinates...</span>
              ) : (
                consoleLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-mutedGray">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))
              )}
              <div ref={consoleBottomRef} />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold text-primaryGlow uppercase font-space">
                  <span>AI Parsing Stream</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primaryGlow transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Resume Analysis Display (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">AI Screening Report</h4>

          <AnimatePresence mode="wait">
            {!isDone ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 text-center rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 py-20 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-primaryGlow/5 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center animate-pulse">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white uppercase tracking-wider font-space">Analysis Offline</h5>
                  <p className="text-xs text-mutedGray font-outfit mt-1 max-w-xs mx-auto">
                    Upload your technical resume in the Ingestion Portal to stream live capabilities audits.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Visual Summary Card */}
                <div className="p-6.5 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 space-y-6">
                  {/* Bio details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primaryGlow/15 border border-primaryGlow/30 text-primaryGlow flex items-center justify-center font-bold text-sm font-space uppercase">
                        {extractedData.name[0]}
                      </div>
                      <div>
                        <h5 className="text-base font-bold text-white font-space uppercase tracking-wide">{extractedData.name}</h5>
                        <span className="text-xs text-mutedGray block font-outfit flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-primaryGlow" /> {extractedData.email}
                        </span>
                      </div>
                    </div>
                    <span className="bg-success/15 border border-success/35 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ingested 96%
                    </span>
                  </div>

                  {/* Skills badges */}
                  <div className="space-y-3">
                    <h6 className="text-[10px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-primaryGlow" /> Extracted Skill Competencies
                    </h6>
                    <div className="flex gap-1.5 flex-wrap">
                      {extractedData.skills.map((skill: string, index: number) => (
                        <span key={index} className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-1 rounded-full font-space uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Visual Grid Sections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Experience Summary */}
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                      <h6 className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primaryGlow" /> Experience Summary
                      </h6>
                      <p className="text-xs text-white font-outfit leading-relaxed">{extractedData.experience}</p>
                    </div>

                    {/* Education Summary */}
                    <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                      <h6 className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primaryGlow" /> Education Summary
                      </h6>
                      <p className="text-xs text-white font-outfit leading-relaxed">{extractedData.education}</p>
                    </div>
                  </div>

                  {/* Projects Summary */}
                  <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                    <h6 className="text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-primaryGlow" /> Projects Summary
                    </h6>
                    <p className="text-xs text-white font-outfit leading-relaxed">{extractedData.projects}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
