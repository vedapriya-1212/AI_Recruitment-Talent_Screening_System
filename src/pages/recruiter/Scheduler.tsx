import React, { useState } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, UserCheck, CalendarPlus, XCircle, RefreshCw } from 'lucide-react';

export default function Scheduler() {
  const { candidates, interviews, scheduleInterview } = useApplication();
  
  // Form states
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [stage, setStage] = useState<'HR Screening' | 'Technical Review' | 'Final Panel'>('Technical Review');

  // Filter candidates who need scheduling (Applied/Shortlisted/Screening status)
  const schedulableCandidates = candidates.filter(c => c.status !== 'Interview' && c.status !== 'Rejected');

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !date || !time) return;

    const cand = candidates.find(c => c.id === selectedCandidate);
    if (!cand) return;

    await scheduleInterview(cand.id, cand.name, cand.jobTitle, date, time, stage);

    // Reset Form
    setSelectedCandidate('');
    setDate('');
    setTime('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Auto Scheduler</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Coordinate calendar slots, dispatch meeting invites, and log candidate pipeline stages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Book Interview Form (Col-span 5) */}
        <div className="lg:col-span-5">
          <div className="p-6.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-space flex items-center gap-2">
              <CalendarPlus className="w-4.5 h-4.5 text-primaryGlow" /> Schedule Pipeline Slot
            </h4>

            <form onSubmit={handleSchedule} className="space-y-5">
              {/* Select Candidate */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Candidate</label>
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  required
                  className="w-full bg-[#030712] border border-white/6 rounded-xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
                >
                  <option value="">Select Candidate...</option>
                  {schedulableCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Interview Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  required
                  className="w-full bg-[#030712] border border-white/6 rounded-xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
                >
                  <option value="HR Screening">HR Screening</option>
                  <option value="Technical Review">Technical Review</option>
                  <option value="Final Panel">Final Panel</option>
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Today / June 20"
                    required
                    className="w-full bg-white/3 border border-white/6 rounded-xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 2:00 PM"
                    required
                    className="w-full bg-white/3 border border-white/6 rounded-xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4.5 rounded-xl bg-primaryGlow text-[#030712] font-black text-xs uppercase tracking-widest font-space hover:scale-103 transition-all cursor-pointer shadow-[0_0_15px_rgba(79,250,240,0.15)]"
              >
                Send Invite
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Confirmed Slot Timeline (Col-span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Confirmed Meeting Timeline</h4>
          
          <div className="flex flex-col gap-4">
            {interviews.length === 0 ? (
              <div className="p-16 rounded-2xl glass-panel text-center bg-[#071021]/30 border border-white/5 flex flex-col items-center justify-center gap-4">
                <Calendar className="w-10 h-10 text-mutedGray" />
                <p className="text-xs text-mutedGray font-outfit">No slots scheduled yet.</p>
              </div>
            ) : (
              interviews.map((meet) => (
                <div
                  key={meet.id}
                  className="p-5.5 rounded-2xl glass-panel bg-white/2 border border-white/5 hover:border-white/9 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center shrink-0 mt-0.5">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h5 className="text-sm font-bold text-white font-space uppercase tracking-wide">{meet.candidateName}</h5>
                        <span className="text-[8px] bg-white/5 border border-white/8 px-2 py-0.2 rounded font-bold text-mutedGray uppercase font-space tracking-wider">
                          {meet.stage}
                        </span>
                      </div>
                      <span className="text-[10px] text-mutedGray font-outfit mt-1 block">
                        {meet.jobTitle}
                      </span>
                      <div className="flex items-center gap-3.5 text-[10px] text-primaryGlow font-space mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {meet.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {meet.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    <button
                      className="p-2.5 rounded-lg bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/10 text-mutedGray hover:text-white transition-colors cursor-pointer"
                      title="Reschedule slot"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2.5 rounded-lg bg-white/3 border border-white/6 hover:bg-error/15 hover:border-error/25 text-mutedGray hover:text-error transition-colors cursor-pointer"
                      title="Cancel slot"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
