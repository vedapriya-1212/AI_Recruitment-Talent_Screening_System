import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Calendar, Building, CheckCircle2, ChevronRight, XCircle, AlertCircle, Clock, Loader2, Briefcase } from 'lucide-react';
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

export default function MyApplications() {
  const { myApplications, loading } = useApplication();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Set first app as selected when data loads
  useEffect(() => {
    if (myApplications.length > 0 && !selectedApp) {
      setSelectedApp(myApplications[0] as ApplicationItem);
    }
  }, [myApplications]);

  const applications = myApplications as ApplicationItem[];

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Selected':
        return <span className="bg-success/10 border border-success/20 text-success text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space">Selected</span>;
      case 'Rejected':
        return <span className="bg-error/10 border border-error/20 text-error text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space">Rejected</span>;
      case 'Interview Scheduled':
        return <span className="bg-[#FFD166]/10 border border-[#FFD166]/20 text-[#FFD166] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space">Interview Booked</span>;
      case 'Shortlisted':
        return <span className="bg-[#4FFAF0]/10 border border-[#4FFAF0]/20 text-[#4FFAF0] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space">Shortlisted</span>;
      case 'Under Review':
        return <span className="bg-[#7C6BFF]/10 border border-[#7C6BFF]/20 text-[#7C6BFF] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space">Under Review</span>;
      default:
        return <span className="bg-white/5 border border-white/10 text-mutedGray text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-space">Applied</span>;
    }
  };

  // Timeline checkpoints mapping status to checkmarks
  const getTimelineSteps = (status: ApplicationItem['status']) => {
    const steps = [
      { key: 'Applied', label: 'Applied', desc: 'Application received in recruitment stream', done: true },
      { key: 'Screened', label: 'Resume Screened', desc: 'Extracted skills and qualifications index matches', done: false },
      { key: 'Evaluated', label: 'AI Evaluation Completed', desc: 'Screening models completed matching coefficients', done: false },
      { key: 'Review', label: 'Under Review', desc: 'Recruiter evaluating leaderboard rankings', done: false },
      { key: 'Shortlisted', label: 'Shortlisted', desc: 'Profile added to technical dashboard', done: false },
      { key: 'Interview', label: 'Interview Scheduled', desc: 'Calendar slot reserved for tech panels', done: false },
    ];

    if (status === 'Under Review') {
      steps[1].done = true;
      steps[2].done = true;
      steps[3].done = true;
    } else if (status === 'Shortlisted') {
      steps[1].done = true;
      steps[2].done = true;
      steps[3].done = true;
      steps[4].done = true;
    } else if (status === 'Interview Scheduled' || status === 'Selected') {
      steps[1].done = true;
      steps[2].done = true;
      steps[3].done = true;
      steps[4].done = true;
      steps[5].done = true;
    } else if (status === 'Rejected') {
      steps[1].done = true;
      steps[2].done = true;
    }

    return steps;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">My Applications</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Monitor active job pipelines and review real-time status tracker logs.
        </p>
      </div>

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
      ) : null}

      {!loading && applications.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Applications Table (Col span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Submission History</h4>
          
          <div className="rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">
                    <th className="p-4">Requirement</th>
                    <th className="p-4">Enterprise</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Status Badge</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-outfit">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-mutedGray">
                        No applications submitted yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => {
                      const isSelected = selectedApp?.id === app.id;
                      return (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`hover:bg-white/2 cursor-pointer transition-colors ${
                            isSelected ? 'bg-primaryGlow/5' : ''
                          }`}
                        >
                          <td className="p-4">
                            <span className="font-bold text-white block uppercase tracking-wide font-space">{app.jobTitle}</span>
                          </td>
                          <td className="p-4 text-mutedGray">{app.company}</td>
                          <td className="p-4 text-mutedGray">{app.appliedDate}</td>
                          <td className="p-4">{getStatusBadge(app.status)}</td>
                          <td className="p-4 text-right">
                            <ChevronRight className={`w-4 h-4 text-mutedGray transition-transform ${
                              isSelected ? 'translate-x-1 text-primaryGlow' : ''
                            }`} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Timeline Application Tracker (Col span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Application Tracker</h4>

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

              {/* Steps timeline list */}
              <div className="relative pl-6 border-l border-white/10 space-y-6">
                {getTimelineSteps(selectedApp.status).map((step, idx) => {
                  return (
                    <div key={idx} className="relative">
                      {/* Bullet point */}
                      <span className={`absolute -left-[30px] top-0 w-4 h-4 rounded-full flex items-center justify-center border ${
                        step.done 
                          ? 'bg-primaryGlow/20 border-primaryGlow text-primaryGlow shadow-[0_0_8px_rgba(79,250,240,0.4)]' 
                          : 'bg-[#071021] border-white/10 text-mutedGray'
                      }`}>
                        {step.done ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-2.5 h-2.5" />
                        )}
                      </span>

                      <div>
                        <span className={`text-xs font-bold font-space uppercase ${
                          step.done ? 'text-white' : 'text-mutedGray'
                        }`}>
                          {step.label}
                        </span>
                        <p className="text-[10px] text-mutedGray font-outfit mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-mutedGray rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 font-outfit">
              Select an application from the registry to track.
            </div>
          )}
        </div>
      </div>
      )}
    </motion.div>
  );
}
