import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, HelpCircle } from 'lucide-react';

const phases = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected'];

export default function Tracker() {
  const { user } = useAuth();
  const { candidates } = useApplication();

  const myProfile = candidates.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || candidates[0];

  if (!myProfile) return null;

  // Determine current active phase index
  const currentIdx = phases.indexOf(myProfile.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left animate-fade-in"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Application Tracker</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Real-time status check and pipeline diagnostics for your application.
        </p>
      </div>

      {/* TRACKING TIMELINE PANEL */}
      <div className="p-8.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-12">
        <div className="border-b border-white/5 pb-4">
          <span className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-0.5 rounded font-space uppercase">Active Role</span>
          <h3 className="text-xl font-black text-white font-space mt-2.5 uppercase tracking-wide">{myProfile.jobTitle}</h3>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 md:px-10">
          
          {/* Timeline background connection line */}
          <div className="hidden md:block absolute top-[16px] left-[10%] right-[10%] h-[2px] bg-white/5 z-0" />

          {phases.map((phase, idx) => {
            const isCompleted = idx < currentIdx || myProfile.status === 'Selected';
            const isActive = idx === currentIdx && myProfile.status !== 'Selected';
            const isRejected = myProfile.status === 'Rejected' && idx === currentIdx;

            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-auto"
              >
                {/* Node circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primaryGlow/10 border-primaryGlow text-primaryGlow shadow-[0_0_15px_rgba(79,250,240,0.15)]'
                      : isActive
                      ? 'bg-secondaryGlow/20 border-secondaryGlow text-secondaryGlow shadow-[0_0_15px_rgba(124,107,255,0.2)]'
                      : isRejected
                      ? 'bg-error/10 border-error text-error shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-white/3 border-white/8 text-mutedGray'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isRejected ? (
                    <XCircleIcon />
                  ) : isActive ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-secondaryGlow animate-ping" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>

                {/* Text Labels */}
                <h4
                  className={`text-xs font-bold uppercase tracking-wider font-space mt-3 ${
                    isCompleted ? 'text-primaryGlow' : isActive ? 'text-white' : isRejected ? 'text-error' : 'text-mutedGray'
                  }`}
                >
                  {phase}
                </h4>
                <p className="text-[10px] text-mutedGray font-outfit mt-0.5 max-w-[120px]">
                  {idx === 0 && 'Credentials Ingested'}
                  {idx === 1 && 'Scanning Match Indexes'}
                  {idx === 2 && 'Added to Shortlist'}
                  {idx === 3 && 'Slot Scheduling'}
                  {idx === 4 && (myProfile.status === 'Selected' ? 'Offer Extended!' : 'Selection Finalizing')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-error">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);
