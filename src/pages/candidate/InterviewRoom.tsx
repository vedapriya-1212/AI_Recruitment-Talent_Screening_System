import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Video, Mic, CheckCircle2, AlertTriangle, Play, SquareTerminal, TerminalSquare } from 'lucide-react';

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'verification' | 'interview' | 'coding' | 'completed'>('verification');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock Request Permissions
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
    } catch (err) {
      alert("Camera and Microphone permissions are required.");
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black font-space uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primaryGlow" /> 
            {step === 'verification' ? 'Identity Verification' : step === 'interview' ? 'Live AI Interview' : step === 'coding' ? 'Coding Assessment' : 'Session Completed'}
          </h1>
          <p className="text-sm text-mutedGray mt-1">Session ID: {id}</p>
        </div>
        <div className="flex gap-2">
           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${step === 'verification' ? 'bg-primaryGlow/20 text-primaryGlow border-primaryGlow/30' : 'bg-white/5 text-mutedGray border-white/10'}`}>1. Verify</span>
           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${step === 'interview' ? 'bg-secondaryGlow/20 text-secondaryGlow border-secondaryGlow/30' : 'bg-white/5 text-mutedGray border-white/10'}`}>2. Interview</span>
           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${step === 'coding' ? 'bg-accentGlow/20 text-accentGlow border-accentGlow/30' : 'bg-white/5 text-mutedGray border-white/10'}`}>3. Code</span>
        </div>
      </div>

      <div className="flex-1 glass-panel border border-white/10 rounded-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {step === 'verification' && (
            <motion.div key="verification" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
               <div className="w-20 h-20 rounded-full bg-primaryGlow/10 flex items-center justify-center mb-6 border border-primaryGlow/20">
                 <Video className="w-10 h-10 text-primaryGlow" />
               </div>
               <h2 className="text-2xl font-black text-white font-space uppercase mb-4">System Check & Verification</h2>
               <p className="text-mutedGray max-w-md mb-8">Before we begin, we need to verify your identity and ensure your camera and microphone are working correctly. This session will be recorded and proctored.</p>
               
               <div className="bg-[#030712] p-4 rounded-xl border border-white/10 w-full max-w-sm aspect-video mb-8 overflow-hidden relative">
                 {permissionsGranted ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-mutedGray text-sm">Camera Preview</div>
                 )}
               </div>

               {!permissionsGranted ? (
                 <button onClick={requestPermissions} className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold font-space uppercase hover:bg-white/20 transition-all">Grant Permissions</button>
               ) : (
                 <button onClick={() => setStep('interview')} className="px-8 py-3 rounded-xl bg-primaryGlow text-[#030712] font-black font-space uppercase flex items-center gap-2 hover:bg-[#3ceae0] transition-all shadow-[0_0_20px_rgba(79,250,240,0.3)]">
                   <Play className="w-5 h-5" /> Start Interview
                 </button>
               )}
            </motion.div>
          )}

          {step === 'interview' && (
             <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex">
               {/* Main Stage - AI Avatar / Question */}
               <div className="flex-1 p-8 flex flex-col relative">
                 
                 <div className="absolute top-6 left-6 flex items-center gap-2 bg-error/20 border border-error/30 text-error px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                   <span className="w-2 h-2 rounded-full bg-error" /> Recording & Proctoring Active
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-secondaryGlow to-accentGlow p-[2px] animate-[spin_10s_linear_infinite]">
                       <div className="w-full h-full rounded-full bg-[#071021] flex items-center justify-center text-white font-black text-4xl">AI</div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-secondaryGlow text-sm font-bold uppercase tracking-wider font-space">Technical Round</p>
                      <h3 className="text-2xl text-white font-medium leading-relaxed">Can you explain the differences between React's useMemo and useCallback hooks? When would you choose one over the other?</h3>
                    </div>

                    {/* Listening Indicator */}
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full mt-10">
                      <Mic className="w-5 h-5 text-primaryGlow animate-pulse" />
                      <span className="text-mutedGray text-sm">Listening to your response...</span>
                    </div>
                 </div>

                 <div className="absolute bottom-6 right-6">
                    <button onClick={() => setStep('coding')} className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-space uppercase text-xs transition-colors flex items-center gap-2 border border-white/20">
                      Skip to Coding <TerminalSquare className="w-4 h-4"/>
                    </button>
                 </div>
               </div>
               
               {/* Sidebar - Candidate Camera */}
               <div className="w-80 border-l border-white/10 bg-black/20 p-4 flex flex-col gap-4">
                 <div className="bg-[#030712] rounded-xl border border-white/10 aspect-[3/4] overflow-hidden relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white">Live Feed</div>
                 </div>
                 <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
                   <h4 className="text-xs font-bold uppercase font-space text-white">Proctoring Status</h4>
                   <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircle2 className="w-4 h-4"/> Face Detected</div>
                   <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircle2 className="w-4 h-4"/> Audio Clear</div>
                   <div className="flex items-center gap-2 text-xs text-mutedGray"><AlertTriangle className="w-4 h-4 text-yellow-500"/> Do not switch tabs</div>
                 </div>
               </div>
             </motion.div>
          )}

          {step === 'coding' && (
            <motion.div key="coding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-space uppercase">Algorithm Challenge</h3>
                <div className="text-accentGlow font-space font-bold tracking-widest text-xl">14:59</div>
              </div>
              <div className="flex-1 flex gap-4">
                <div className="w-1/3 bg-[#030712] rounded-xl border border-white/10 p-5 overflow-y-auto">
                  <h4 className="text-white font-bold mb-2">Two Sum</h4>
                  <p className="text-sm text-mutedGray mb-4">Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
                  <p className="text-sm text-mutedGray">You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                </div>
                <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-white/10 p-4 font-mono text-sm text-[#d4d4d4] flex flex-col">
                  {/* Mock Editor */}
                  <div className="border-b border-white/10 pb-2 mb-2 flex gap-4">
                    <span className="text-accentGlow">solution.js</span>
                  </div>
                  <pre className="flex-1 outline-none" contentEditable suppressContentEditableWarning>
{`function twoSum(nums, target) {
    // Write your code here
    
};`}
                  </pre>
                  <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold text-xs uppercase hover:bg-white/20">Run Code</button>
                    <button onClick={() => setStep('completed')} className="px-4 py-2 rounded-lg bg-accentGlow text-[#030712] font-bold text-xs uppercase hover:bg-[#ff8adb]">Submit Final</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'completed' && (
            <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
               <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                 <CheckCircle2 className="w-10 h-10 text-green-400" />
               </div>
               <h2 className="text-2xl font-black text-white font-space uppercase mb-4">Interview Completed</h2>
               <p className="text-mutedGray max-w-md mb-8">Thank you for your time. Your responses and code have been successfully submitted. The recruiter will review your AI analysis report and get back to you shortly.</p>
               <button onClick={() => navigate('/candidate/dashboard')} className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold font-space uppercase hover:bg-white/20 transition-all">Return to Dashboard</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
