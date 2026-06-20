import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, Users, Activity, FileText, ArrowRight, Loader2, Trophy, Mail, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  sent_at: string;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  status_trigger?: string;
  error_message?: string;
}

export default function RecruiterDashboard() {
  const { jobs, candidates, interviews, loading } = useApplication();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const totalJobs = jobs.filter(j => j.status === 'published').length;
  const activeCandidates = candidates.length;
  const pendingInterviews = interviews.filter(i => i.status !== 'Completed' && i.status !== 'Cancelled').length;
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted' || c.status === 'Interview Scheduled' || c.status === 'Selected');
  const topRanked = [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 5);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await apiClient.getEmailLogs();
      setEmailLogs(logs.slice(0, 8));
    } catch { /* ignore */ } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-primaryGlow animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  const statusColor = (s: string) => {
    if (s === 'Selected') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s === 'Shortlisted') return 'text-primaryGlow bg-primaryGlow/10 border-primaryGlow/20';
    if (s === 'Interview Scheduled') return 'text-[#FFD166] bg-[#FFD166]/10 border-[#FFD166]/20';
    return 'text-mutedGray bg-white/5 border-white/10';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Recruiter Workspace</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Welcome back, <span className="text-primaryGlow font-bold">{user?.first_name}</span>. System overview and autonomous workflow diagnostics.
          </p>
        </div>
        <button
          onClick={() => navigate('/recruiter/create-job')}
          className="px-5 py-3 rounded-xl bg-primaryGlow text-[#030712] font-bold text-xs uppercase tracking-wider font-space hover:scale-105 active:scale-97 hover:shadow-[0_0_20px_rgba(79,250,240,0.3)] transition-all duration-300 flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Publish Requirement</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Requirements', value: totalJobs, icon: FileText, color: 'primaryGlow', glow: 'border-primaryGlow/25 hover:border-primaryGlow/40' },
          { label: 'Active Candidates', value: activeCandidates, icon: Users, color: 'secondaryGlow', glow: 'border-secondaryGlow/25 hover:border-secondaryGlow/40' },
          { label: 'Booked Slots', value: pendingInterviews, icon: Activity, color: 'accentGlow', glow: 'border-accentGlow/25 hover:border-accentGlow/40' },
          { label: 'Shortlisted', value: shortlisted.length, icon: CheckCircle2, color: 'emerald-400', glow: 'border-emerald-400/25 hover:border-emerald-400/40' },
        ].map(({ label, value, icon: Icon, color, glow }) => (
          <div key={label} className={`p-5 rounded-2xl glass-panel border border-white/6 ${glow} transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">{label}</p>
                <h3 className={`text-3xl font-black text-${color} mt-3 font-space`}>{value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/25 flex items-center justify-center text-${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Active Jobs */}
        <div className="lg:col-span-8 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Active Requirements</h4>
          <div className="flex flex-col gap-4">
            {jobs.length === 0 ? (
              <div className="p-16 rounded-2xl glass-panel text-center bg-[#071021]/30 border border-white/5 flex flex-col items-center justify-center gap-4">
                <FileText className="w-10 h-10 text-mutedGray" />
                <h4 className="text-sm font-bold uppercase tracking-wider font-space text-white">No Active Requirements</h4>
                <p className="text-xs text-mutedGray font-outfit max-w-xs leading-relaxed">No job posts yet. Create your first requirement to start the hiring pipeline.</p>
                <button onClick={() => navigate('/recruiter/create-job')} className="px-5 py-2.5 rounded-xl bg-primaryGlow text-black text-xs font-bold uppercase tracking-wider font-space hover:scale-105 transition-transform cursor-pointer">
                  Publish First Job
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-5 rounded-2xl glass-panel bg-white/2 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-base font-bold text-white font-space uppercase tracking-wide">{job.title}</h5>
                    <span className="text-[10px] text-mutedGray uppercase tracking-wider font-space mt-1 block">{job.department} • {job.location}</span>
                    <div className="flex gap-4 mt-3">
                      <span className="text-[10px] font-bold text-primaryGlow font-space uppercase">Score: {job.optimizationScore}%</span>
                      <span className="text-[10px] font-bold text-mutedGray font-space uppercase">Applicants: {candidates.filter(c => c.jobId === job.id).length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to="/recruiter/applications" className="px-4 py-2.5 rounded-lg border border-white/6 hover:border-primaryGlow/30 text-[10px] font-bold uppercase tracking-wider font-space text-white hover:text-primaryGlow transition-all">
                      View Pipeline
                    </Link>
                    <Link to="/recruiter/rankings" className="p-2.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 text-white transition-all" title="Rankings">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Shortlisted Candidates */}
          {shortlisted.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-white font-space flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Shortlisted Candidates
                </h4>
                <Link to="/recruiter/applications" className="text-[10px] text-primaryGlow hover:text-white font-space uppercase tracking-wider transition-colors">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortlisted.slice(0, 4).map(c => (
                  <div key={c.id} className="p-4 rounded-xl glass-panel bg-emerald-400/3 border border-emerald-400/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/25 flex items-center justify-center text-emerald-400 font-black text-sm font-space">
                        {c.name?.[0] || 'C'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        <p className="text-[9px] text-mutedGray font-outfit">{c.jobTitle}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded border font-space ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Top Ranked + Email Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Ranked Candidates */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FFD166]" /> Top Ranked
            </h4>
            <div className="p-4 rounded-2xl glass-panel bg-white/2 border border-white/5 flex flex-col gap-3">
              {topRanked.length === 0 ? (
                <p className="text-xs text-mutedGray font-outfit text-center py-4">No candidates yet.</p>
              ) : (
                topRanked.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black font-space shrink-0 ${
                      i === 0 ? 'bg-[#FFD166]/20 text-[#FFD166]' : i === 1 ? 'bg-white/10 text-white' : i === 2 ? 'bg-orange-400/15 text-orange-400' : 'bg-white/5 text-mutedGray'
                    }`}>#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{c.name}</p>
                      <p className="text-[9px] text-mutedGray font-outfit truncate">{c.jobTitle}</p>
                    </div>
                    <span className="text-xs font-black text-primaryGlow font-space">{c.matchScore}%</span>
                  </div>
                ))
              )}
              {topRanked.length > 0 && (
                <Link to="/recruiter/rankings" className="w-full py-2 mt-1 text-[10px] font-bold uppercase tracking-wider font-space text-center text-primaryGlow border border-primaryGlow/20 rounded-lg hover:bg-primaryGlow/5 transition-all">
                  Full Leaderboard →
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Recent Activity</h4>
            <div className="p-4 rounded-2xl glass-panel bg-white/2 border border-white/5 flex flex-col gap-3">
              {interviews.slice(0, 3).map((meet) => (
                <div key={meet.id} className="p-3 rounded-xl bg-white/2 border border-white/4 space-y-1">
                  <div className="flex justify-between items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-white truncate">{meet.candidateName}</span>
                    <span className="text-[8px] bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">{meet.stage}</span>
                  </div>
                  <span className="text-[9px] text-mutedGray block truncate">{meet.jobTitle}</span>
                  <span className="text-[9px] text-primaryGlow block font-space">{meet.date} @ {meet.time}</span>
                </div>
              ))}
              {interviews.length === 0 && <p className="text-xs text-mutedGray text-center py-4 font-outfit">No recent activity.</p>}
            </div>
          </div>

          {/* Email Logs Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-white font-space flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondaryGlow" /> Email Dispatch Log
              </h4>
              <div className="flex items-center gap-2">
                <button onClick={fetchLogs} disabled={logsLoading} className="p-1.5 rounded-lg hover:bg-white/5 text-mutedGray hover:text-white transition-all cursor-pointer disabled:opacity-50">
                  <RefreshCw className={`w-3 h-3 ${logsLoading ? 'animate-spin' : ''}`} />
                </button>
                <Link to="/recruiter/email-logs" className="text-[9px] text-primaryGlow hover:text-white font-space uppercase tracking-wider transition-colors">
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel bg-white/2 border border-white/5 flex flex-col gap-2.5">
              {logsLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 text-primaryGlow animate-spin" /></div>
              ) : emailLogs.length === 0 ? (
                <p className="text-xs text-mutedGray text-center py-4 font-outfit">No emails dispatched yet.</p>
              ) : (
                emailLogs.map((log, i) => (
                  <div key={log.id || i} className="flex items-start gap-2.5 py-2 border-b border-white/4 last:border-0">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${log.status?.startsWith('Sent') ? 'bg-emerald-400' : log.status?.startsWith('Failed') ? 'bg-red-400' : 'bg-yellow-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white truncate">{log.candidate_name || log.recipient?.split('@')[0] || '—'}</p>
                      <p className="text-[9px] text-mutedGray truncate font-outfit">{log.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {log.status_trigger && (
                          <span className="text-[7px] font-bold font-space uppercase px-1.5 py-0.5 rounded bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/20">
                            {log.status_trigger}
                          </span>
                        )}
                        <span className={`text-[8px] font-bold font-space uppercase ${log.status?.startsWith('Sent') ? 'text-emerald-400' : 'text-red-400'}`}>{log.status}</span>
                        <span className="text-[8px] text-mutedGray font-outfit">{log.sent_at ? new Date(log.sent_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {emailLogs.length > 0 && (
                <Link to="/recruiter/email-logs" className="w-full py-2 mt-1 text-[10px] font-bold uppercase tracking-wider font-space text-center text-secondaryGlow border border-secondaryGlow/20 rounded-lg hover:bg-secondaryGlow/5 transition-all block">
                  Full Email Monitor →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
