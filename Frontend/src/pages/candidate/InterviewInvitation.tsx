import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, Video, CheckCircle, XCircle, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewInvitation() {
  const [status, setStatus] = useState<'Pending' | 'Accepted' | 'Declined'>('Pending');

  const interviewDetails = {
    jobTitle: 'Senior React Architect',
    interviewerName: 'Dr. Evelyn Carter (Director of UI Engineering)',
    date: 'June 20, 2026',
    time: '10:00 AM - 11:00 AM EST',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  };

  const handleAccept = () => {
    setStatus('Accepted');
    toast.success('Interview Invitation Accepted!', {
      description: 'The recruiter has been notified and calendar coordinates synchronized.',
    });
  };

  const handleDecline = () => {
    setStatus('Declined');
    toast.error('Interview Invitation Declined', {
      description: 'The slot has been released back into the scheduling pool.',
    });
  };

  const handleAddToCalendar = () => {
    toast.success('Added to Calendar', {
      description: 'Synchronized with Google Calendar / Outlook.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Interview Portal</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Review, respond, and synchronize schedules for active candidate evaluations.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="p-7 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 space-y-6">
          <div className="flex justify-between items-start border-b border-white/5 pb-5">
            <div>
              <span className="text-[9px] font-bold text-primaryGlow uppercase tracking-wider font-space">Hiring Stage: Technical Review</span>
              <h3 className="text-2xl font-black text-white font-space uppercase mt-1.5">{interviewDetails.jobTitle}</h3>
            </div>
            
            {/* Status Badge */}
            <div>
              {status === 'Pending' && (
                <span className="bg-[#FFD166]/10 border border-[#FFD166]/20 text-[#FFD166] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space">
                  Awaiting Response
                </span>
              )}
              {status === 'Accepted' && (
                <span className="bg-success/15 border border-success/35 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space">
                  Confirmed
                </span>
              )}
              {status === 'Declined' && (
                <span className="bg-error/15 border border-error/35 text-error text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space">
                  Declined
                </span>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-4 font-outfit">
            
            {/* Interviewer */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Interviewer</span>
                <span className="text-sm text-white font-bold">{interviewDetails.interviewerName}</span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Date</span>
                <span className="text-sm text-white font-bold">{interviewDetails.date}</span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Time Frame</span>
                <span className="text-sm text-white font-bold">{interviewDetails.time}</span>
              </div>
            </div>

            {/* Meeting Link */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                <Video className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Meeting Channel</span>
                <a 
                  href={interviewDetails.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-primaryGlow hover:underline font-bold font-mono"
                >
                  {interviewDetails.meetingLink}
                </a>
              </div>
            </div>

          </div>

          <hr className="border-white/5" />

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {status === 'Pending' ? (
              <>
                <button
                  onClick={handleDecline}
                  className="flex-1 py-3.5 rounded-xl border border-error/20 hover:border-error/45 text-error text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <XCircle className="w-4.5 h-4.5" />
                  <span>Decline Slot</span>
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-grow py-3.5 bg-primaryGlow hover:scale-[1.02] text-[#030712] rounded-xl text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(79,250,240,0.15)]"
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>Accept Interview</span>
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setStatus('Pending')}
                  className="px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white uppercase tracking-wider font-space cursor-pointer transition-colors"
                >
                  Change Response
                </button>
                {status === 'Accepted' && (
                  <button
                    onClick={handleAddToCalendar}
                    className="flex-grow py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CalendarPlus className="w-4.5 h-4.5 text-primaryGlow" />
                    <span>Synchronize to Calendar</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
