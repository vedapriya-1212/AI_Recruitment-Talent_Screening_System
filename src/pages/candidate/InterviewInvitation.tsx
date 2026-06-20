import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Clock, Video, CheckCircle, XCircle, CalendarPlus, Loader2, Bell, Briefcase } from 'lucide-react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function InterviewInvitation() {
  const { myInterviews, loading } = useApplication();
  const navigate = useNavigate();
  const [statusMap, setStatusMap] = useState<Record<string, 'Pending' | 'Accepted' | 'Declined'>>({});

  const getDisplayStatus = (ivId: string, dbStatus: string) => {
    if (statusMap[ivId]) return statusMap[ivId];
    if (dbStatus === 'Confirmed') return 'Accepted';
    if (dbStatus === 'Cancelled') return 'Declined';
    return 'Pending';
  };

  const handleAccept = (id: string) => {
    setStatusMap(prev => ({ ...prev, [id]: 'Accepted' }));
    toast.success('Interview Invitation Accepted!', {
      description: 'The recruiter has been notified and calendar coordinates synchronized.',
    });
  };

  const handleDecline = (id: string) => {
    setStatusMap(prev => ({ ...prev, [id]: 'Declined' }));
    toast.error('Interview Invitation Declined', {
      description: 'The slot has been released back into the scheduling pool.',
    });
  };

  const handleAddToCalendar = (jobTitle: string, date: string, time: string) => {
    toast.success('Added to Calendar', {
      description: `${jobTitle} interview on ${date} at ${time} synced to your calendar.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-primaryGlow animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">
          Loading Interviews...
        </p>
      </div>
    );
  }

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

      {/* Empty state */}
      {myInterviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-2xl glass-panel border border-white/5">
          <Bell className="w-12 h-12 text-mutedGray/40" />
          <div className="text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider font-space text-white">No Interview Invitations</h3>
            <p className="text-xs text-mutedGray font-outfit mt-1">
              You don't have any scheduled interviews yet. Keep applying and a recruiter will invite you.
            </p>
          </div>
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="px-5 py-2.5 rounded-xl bg-primaryGlow text-black text-xs font-bold uppercase tracking-wider font-space hover:scale-105 transition-transform cursor-pointer"
          >
            Browse Open Jobs
          </button>
        </div>
      )}

      {/* Interview Cards — one per scheduled interview */}
      <div className="space-y-6 max-w-2xl">
        <AnimatePresence>
          {myInterviews.map((iv, idx) => {
            const displayStatus = getDisplayStatus(iv.id, iv.status);
            return (
              <motion.div
                key={iv.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="p-7 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 space-y-6"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-5">
                  <div>
                    <span className="text-[9px] font-bold text-primaryGlow uppercase tracking-wider font-space block">
                      Stage: {iv.stage}
                    </span>
                    <h3 className="text-xl font-black text-white font-space uppercase mt-1.5">{iv.jobTitle}</h3>
                  </div>
                  <div>
                    {displayStatus === 'Pending' && (
                      <span className="bg-[#FFD166]/10 border border-[#FFD166]/20 text-[#FFD166] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space">
                        Awaiting Response
                      </span>
                    )}
                    {displayStatus === 'Accepted' && (
                      <span className="bg-success/15 border border-success/35 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space">
                        Confirmed
                      </span>
                    )}
                    {displayStatus === 'Declined' && (
                      <span className="bg-error/15 border border-error/35 text-error text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-space">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 font-outfit">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Interviewer</span>
                      <span className="text-sm text-white font-bold">Hiring Team</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Date</span>
                      <span className="text-sm text-white font-bold">{iv.date || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Time</span>
                      <span className="text-sm text-white font-bold">{iv.time || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-primaryGlow shrink-0">
                      <Video className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space block">Meeting Channel</span>
                      <span className="text-sm text-primaryGlow font-bold font-mono">
                        AI Interview Portal
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  {displayStatus === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleDecline(iv.id)}
                        className="flex-1 py-3.5 rounded-xl border border-error/20 hover:border-error/45 text-error text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-4.5 h-4.5" />
                        <span>Decline Slot</span>
                      </button>
                      <button
                        onClick={() => handleAccept(iv.id)}
                        className="flex-grow py-3.5 bg-primaryGlow hover:scale-[1.02] text-[#030712] rounded-xl text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(79,250,240,0.15)]"
                      >
                        <CheckCircle className="w-4.5 h-4.5" />
                        <span>Accept Interview</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setStatusMap(prev => ({ ...prev, [iv.id]: 'Pending' }))}
                        className="px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white uppercase tracking-wider font-space cursor-pointer transition-colors"
                      >
                        Change Response
                      </button>
                      {displayStatus === 'Accepted' && (
                        <div className="flex-grow flex gap-4">
                          <button
                            onClick={() => handleAddToCalendar(iv.jobTitle, iv.date, iv.time)}
                            className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <CalendarPlus className="w-4.5 h-4.5 text-primaryGlow" />
                            <span>Calendar</span>
                          </button>
                          <button
                            onClick={() => navigate(`/candidate/interview-room/${iv.id}`)}
                            className="flex-1 py-3.5 bg-secondaryGlow text-[#030712] rounded-xl text-xs font-bold uppercase tracking-wider font-space flex items-center justify-center gap-2 cursor-pointer hover:bg-[#ff8adb] transition-all shadow-[0_0_15px_rgba(255,94,181,0.2)]"
                          >
                            <Video className="w-4.5 h-4.5" />
                            <span>Start AI Interview</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
