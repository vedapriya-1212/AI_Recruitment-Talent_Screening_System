import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, ChevronRight, Clock, Loader2,
  Briefcase, Star, RefreshCw, Bell, Trophy
} from 'lucide-react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useNavigate } from 'react-router-dom';

interface ApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'Selected':           { label: 'Selected',            color: 'text-success',    bg: 'bg-success/10',     border: 'border-success/20' },
  'Rejected':           { label: 'Rejected',            color: 'text-error',      bg: 'bg-error/10',       border: 'border-error/20' },
  'Interview Scheduled':{ label: 'Interview Booked',    color: 'text-[#FFD166]',  bg: 'bg-[#FFD166]/10',   border: 'border-[#FFD166]/20' },
  'Interview':          { label: 'Interview Booked',    color: 'text-[#FFD166]',  bg: 'bg-[#FFD166]/10',   border: 'border-[#FFD166]/20' },
  'Shortlisted':        { label: 'Shortlisted ★',       color: 'text-[#4FFAF0]',  bg: 'bg-[#4FFAF0]/10',   border: 'border-[#4FFAF0]/20' },
  'Under Review':       { label: 'Under Review',        color: 'text-[#7C6BFF]',  bg: 'bg-[#7C6BFF]/10',   border: 'border-[#7C6BFF]/20' },
  'Applied':            { label: 'Applied',             color: 'text-mutedGray',  bg: 'bg-white/5',        border: 'border-white/10' },
};

const getStatusBadge = (status: string) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Applied'];
  return (
    <span className={`${cfg.bg} ${cfg.border} ${cfg.color} border text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space`}>
      {cfg.label}
    </span>
  );
};

const getTimelineSteps = (status: string) => {
  const steps = [
    { label: 'Applied',                desc: 'Application received in recruitment stream',            done: true },
    { label: 'Resume Screened',        desc: 'AI extracted skills and qualifications index',          done: false },
    { label: 'AI Evaluation Completed',desc: 'Screening models completed matching coefficients',     done: false },
    { label: 'Under Review',           desc: 'Recruiter evaluating leaderboard rankings',            done: false },
    { label: 'Shortlisted',            desc: 'Profile added to shortlist pipeline ★',               done: false },
    { label: 'Interview Scheduled',    desc: 'Calendar slot reserved for tech panels',               done: false },
  ];

  const idx = ['Applied','Under Review','Shortlisted','Interview Scheduled','Interview','Selected'].indexOf(status);
  if (status === 'Under Review') { steps[1].done = true; steps[2].done = true; steps[3].done = true; }
  else if (status === 'Shortlisted') { steps[1].done = true; steps[2].done = true; steps[3].done = true; steps[4].done = true; }
  else if (['Interview Scheduled','Interview','Selected'].includes(status)) {
    steps[1].done = true; steps[2].done = true; steps[3].done = true; steps[4].done = true; steps[5].done = true;
  } else if (status === 'Rejected') { steps[1].done = true; steps[2].done = true; }
  return steps;
};

export default function MyApplications() {
  const { myApplications, loading, refreshMyData } = useApplication();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const applications = myApplications as ApplicationItem[];

  // Shortlisted & featured apps
  const shortlisted = applications.filter(a =>
    ['Shortlisted', 'Interview Scheduled', 'Interview', 'Selected'].includes(a.status)
  );

  useEffect(() => {
    if (applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0]);
    }
  }, [applications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMyData();
    setRefreshing(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">My Applications</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Monitor active job pipelines and review real-time status updates.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:bg-white/6 hover:border-primaryGlow/30 text-xs font-bold text-white uppercase tracking-wider font-space transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primaryGlow' : 'text-mutedGray'}`} />
          Refresh
        </button>
      </div>

      {/* ── SHORTLISTED BANNER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {shortlisted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl border border-[#4FFAF0]/20 bg-[#4FFAF0]/5 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#4FFAF0] to-transparent" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4FFAF0]/15 border border-[#4FFAF0]/25 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-[#4FFAF0]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#4FFAF0] uppercase tracking-widest font-space">
                    🎉 You've been Shortlisted!
                  </p>
                  <p className="text-[10px] text-mutedGray font-outfit mt-0.5">
                    {shortlisted.length} application{shortlisted.length > 1 ? 's' : ''} have advanced in the hiring pipeline.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {shortlisted.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1.5 rounded-lg bg-[#4FFAF0]/10 border border-[#4FFAF0]/20 text-[#4FFAF0] text-[9px] font-bold uppercase tracking-wider font-space hover:bg-[#4FFAF0]/20 transition-all cursor-pointer"
                  >
                    {app.jobTitle}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-primaryGlow animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">Loading Applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-2xl glass-panel border border-white/5">
          <Briefcase className="w-12 h-12 text-mutedGray/40" />
          <div className="text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider font-space text-white">No Applications Yet</h3>
            <p className="text-xs text-mutedGray font-outfit mt-1">You haven't applied to any jobs. Start by browsing available positions.</p>
          </div>
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="px-5 py-2.5 rounded-xl bg-primaryGlow text-black text-xs font-bold uppercase tracking-wider font-space hover:scale-105 transition-transform cursor-pointer"
          >
            Browse Open Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Applications Table */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primaryGlow" />
              Submission History ({applications.length})
            </h4>

            <div className="rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">
                      <th className="p-4">Role</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">Applied</th>
                      <th className="p-4">Status</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-outfit">
                    {applications.map((app) => {
                      const isSelected = selectedApp?.id === app.id;
                      const isShortlisted = ['Shortlisted','Interview Scheduled','Interview','Selected'].includes(app.status);
                      return (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`hover:bg-white/2 cursor-pointer transition-colors ${isSelected ? 'bg-primaryGlow/5' : ''}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {isShortlisted && <Star className="w-3 h-3 text-[#4FFAF0] shrink-0" />}
                              <span className="font-bold text-white block uppercase tracking-wide font-space text-[11px]">{app.jobTitle}</span>
                            </div>
                          </td>
                          <td className="p-4 text-mutedGray">{app.company}</td>
                          <td className="p-4 text-mutedGray">{app.appliedDate}</td>
                          <td className="p-4">{getStatusBadge(app.status)}</td>
                          <td className="p-4 text-right">
                            <ChevronRight className={`w-4 h-4 text-mutedGray transition-transform ${isSelected ? 'translate-x-1 text-primaryGlow' : ''}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Timeline Tracker */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space flex items-center gap-2">
              <Bell className="w-4 h-4 text-primaryGlow" />
              Application Tracker
            </h4>

            {selectedApp ? (
              <div className="p-6.5 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-primaryGlow uppercase tracking-wider font-space">Live Pipeline</span>
                  <h5 className="text-base font-black text-white uppercase tracking-wide font-space mt-1">{selectedApp.jobTitle}</h5>
                  <div className="flex justify-between items-center mt-2.5">
                    <span className="text-xs text-mutedGray font-outfit">{selectedApp.company}</span>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-6 border-l border-white/10 space-y-6">
                  {getTimelineSteps(selectedApp.status).map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[30px] top-0 w-4 h-4 rounded-full flex items-center justify-center border ${
                        step.done
                          ? 'bg-primaryGlow/20 border-primaryGlow text-primaryGlow shadow-[0_0_8px_rgba(79,250,240,0.4)]'
                          : 'bg-[#071021] border-white/10 text-mutedGray'
                      }`}>
                        {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-2.5 h-2.5" />}
                      </span>
                      <div>
                        <span className={`text-xs font-bold font-space uppercase ${step.done ? 'text-white' : 'text-mutedGray'}`}>
                          {step.label}
                        </span>
                        <p className="text-[10px] text-mutedGray font-outfit mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA if shortlisted */}
                {['Shortlisted','Interview Scheduled','Interview'].includes(selectedApp.status) && (
                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={() => navigate('/candidate/interviews')}
                      className="w-full py-3 rounded-xl bg-primaryGlow/10 border border-primaryGlow/20 text-primaryGlow text-xs font-bold uppercase tracking-wider font-space hover:bg-primaryGlow/20 transition-all cursor-pointer"
                    >
                      View Interview Details →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-mutedGray rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 font-outfit">
                Select an application from the table to track its pipeline status.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
