import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Cpu, Trophy, Activity, ClipboardList, ArrowRight, Calendar, Sparkles, Briefcase, Loader2, Bell } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#7C6BFF',
  Screening: '#4FFAF0',
  Shortlisted: '#FF5EB5',
  Interview: '#FFD166',
  Selected: '#10b981',
  Rejected: '#ef4444',
  'Under Review': '#4FFAF0',
  'Interview Scheduled': '#FFD166',
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { myApplications, myInterviews, jobs, loading } = useApplication();
  const navigate = useNavigate();

  // ── Real computed stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = myApplications.length;
    const shortlisted = myApplications.filter(a =>
      ['Shortlisted', 'Interview', 'Interview Scheduled', 'Selected'].includes(a.status)
    ).length;
    const upcoming = myInterviews.filter(i =>
      i.status !== 'Completed' && i.status !== 'Cancelled'
    ).length;
    return { total, shortlisted, upcoming };
  }, [myApplications, myInterviews]);

  // ── Real chart data ──────────────────────────────────────────────────────
  const statusDistribution = useMemo(() => {
    if (myApplications.length === 0) {
      return [{ name: 'No Applications Yet', value: 1, fill: '#334155' }];
    }
    const counts: Record<string, number> = {};
    myApplications.forEach(a => {
      const key = a.status || 'Applied';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] || '#94A3B8',
    }));
  }, [myApplications]);

  // Applications over time (by month)
  const applicationsOverTime = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    myApplications.forEach(a => {
      const month = new Date(a.appliedDate).toLocaleString('default', { month: 'short' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    if (Object.keys(monthCounts).length === 0) {
      return [{ month: 'Now', count: 0 }];
    }
    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  }, [myApplications]);

  // Interview activity (by stage)
  const interviewActivity = useMemo(() => {
    const stageCounts: Record<string, number> = { 'HR Screening': 0, 'Technical Review': 0, 'Final Panel': 0 };
    myInterviews.forEach(i => { stageCounts[i.stage] = (stageCounts[i.stage] || 0) + 1; });
    return Object.entries(stageCounts).map(([stage, sessions]) => ({ week: stage.split(' ')[0], sessions }));
  }, [myInterviews]);

  // Recent jobs matching (top 4 newest jobs from DB)
  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-primaryGlow animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">
          Loading Your Workspace...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">
            Candidate Core OS
          </h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Welcome back, <span className="text-primaryGlow font-bold">{user?.first_name} {user?.last_name}</span>. Monitor your live application pipeline, scores, and interview slots.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primaryGlow/5 border border-primaryGlow/25 text-primaryGlow text-[10px] font-bold font-space uppercase animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Data</span>
        </div>
      </div>

      {/* TOP METRIC CARDS — all real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-primaryGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Total Applications</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{stats.total}</h3>
              <span className="text-[9px] text-mutedGray mt-1 block font-space uppercase">Active Pipelines</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 flex items-center justify-center text-primaryGlow">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-[#4FFAF0]/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Shortlisted</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{stats.shortlisted}</h3>
              <span className="text-[9px] text-primaryGlow font-bold mt-1 block font-space uppercase">Proceeding Stage</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#4FFAF0]/10 border border-[#4FFAF0]/25 flex items-center justify-center text-[#4FFAF0]">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-[#FFD166]/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Upcoming Interviews</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{stats.upcoming}</h3>
              <span className="text-[9px] text-[#FFD166] font-bold mt-1 block font-space uppercase">Ready for Panels</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/25 flex items-center justify-center text-[#FFD166]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-accentGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Open Jobs</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{jobs.filter(j => j.status === 'published').length}</h3>
              <span className="text-[9px] text-accentGlow font-bold mt-1 block font-space uppercase">Available Now</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accentGlow/10 border border-accentGlow/25 flex items-center justify-center text-accentGlow">
              <Briefcase className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS — driven by real application data */}
      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Live Application Analytics</h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie: Status Distribution */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Application Status Breakdown</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Legend
                    layout="horizontal" verticalAlign="bottom" align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area: Applications Over Time */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Applications Over Time</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6BFF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C6BFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Area type="monotone" dataKey="count" name="Submissions" stroke="#7C6BFF" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar: Interview Activity */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Interview Activity by Stage</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Bar dataKey="sessions" name="Sessions" fill="#FFD166" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Interviews Live Feed */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Upcoming Interviews</h5>
              <button
                onClick={() => navigate('/candidate/interviews')}
                className="text-[9px] text-primaryGlow hover:text-white font-space uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {myInterviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-44 gap-3">
                <Bell className="w-8 h-8 text-mutedGray/40" />
                <p className="text-[10px] text-mutedGray font-space uppercase tracking-wider">No scheduled interviews yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-44">
                {myInterviews.slice(0, 4).map(iv => (
                  <div key={iv.id} className="p-3 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white block font-space uppercase">{iv.jobTitle}</span>
                      <span className="text-[9px] text-mutedGray block font-outfit mt-0.5">{iv.stage}</span>
                      <span className="text-[9px] text-primaryGlow block font-space mt-0.5">{iv.date} @ {iv.time}</span>
                    </div>
                    <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider font-space ${
                      iv.status === 'Confirmed' ? 'border-primaryGlow/30 bg-primaryGlow/10 text-primaryGlow' :
                      iv.status === 'Completed' ? 'border-success/30 bg-success/10 text-success' :
                      'border-white/10 bg-white/5 text-mutedGray'
                    }`}>{iv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: Quick navigation + recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* My Recent Applications */}
        <div className="p-7 rounded-2xl glass-panel bg-white/2 border border-white/5 space-y-5 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Recent Applications</h4>
            <button
              onClick={() => navigate('/candidate/applications')}
              className="text-[9px] text-primaryGlow hover:text-white font-space uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Briefcase className="w-8 h-8 text-mutedGray/40" />
              <p className="text-[10px] text-mutedGray font-space uppercase">No applications yet</p>
              <button
                onClick={() => navigate('/candidate/jobs')}
                className="px-4 py-2 rounded-lg bg-primaryGlow text-black text-[10px] font-bold uppercase tracking-wider font-space cursor-pointer hover:scale-105 transition-transform"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myApplications.slice(0, 4).map(app => (
                <div key={app.id} className="p-3 rounded-xl bg-[#071021]/30 border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block font-space uppercase leading-tight">{app.jobTitle}</span>
                    <span className="text-[9px] text-mutedGray block font-outfit">{app.company} • {app.appliedDate}</span>
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider font-space whitespace-nowrap ${
                    app.status === 'Selected' ? 'border-success/30 bg-success/10 text-success' :
                    app.status === 'Rejected' ? 'border-error/30 bg-error/10 text-error' :
                    app.status === 'Shortlisted' ? 'border-[#FF5EB5]/30 bg-[#FF5EB5]/10 text-[#FF5EB5]' :
                    'border-primaryGlow/30 bg-primaryGlow/10 text-primaryGlow'
                  }`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="p-7 rounded-2xl glass-panel bg-white/2 border border-white/5 space-y-5 text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Workspace Quadrants</h4>

          <div className="flex flex-col gap-3">
            {[
              { path: '/candidate/jobs', icon: <Briefcase className="w-5 h-5 text-primaryGlow" />, label: 'Browse Open Jobs', desc: 'View and apply to live requirements' },
              { path: '/candidate/applications', icon: <ClipboardList className="w-5 h-5 text-secondaryGlow" />, label: 'My Applications', desc: 'Track all submitted applications' },
              { path: '/candidate/interviews', icon: <Calendar className="w-5 h-5 text-[#FFD166]" />, label: 'Interview Schedule', desc: 'View upcoming interview slots' },
              { path: '/candidate/rankings', icon: <Trophy className="w-5 h-5 text-accentGlow" />, label: 'Rank Leaderboard', desc: 'View comparison indices and stats' },
              { path: '/candidate/profile', icon: <Cpu className="w-5 h-5 text-[#FF5EB5]" />, label: 'My Profile', desc: 'Update your skills and resume' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="p-4 rounded-xl bg-[#071021]/30 border border-white/5 hover:bg-white/5 hover:border-white/10 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <span className="text-xs font-bold text-white block uppercase tracking-wide font-space">{item.label}</span>
                    <span className="text-[10px] text-mutedGray block font-outfit">{item.desc}</span>
                  </div>
                </div>
                <ArrowRight className="w-4.5 h-4.5 text-mutedGray" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
