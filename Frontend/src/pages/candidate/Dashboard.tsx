import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Cpu, Trophy, Activity, UserCheck, ArrowRight, ClipboardList, Calendar, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { candidates } = useApplication();
  const navigate = useNavigate();

  // Find candidate's application profile
  const myProfile = candidates.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || candidates[0];

  // Dashboard Stats matching checklist example
  const dashboardStats = {
    totalApplications: 12,
    shortlistedJobs: 4,
    upcomingInterviews: 2,
    highestMatchScore: 96,
  };

  // Recharts Visual Mock Data
  const statusDistribution = [
    { name: 'Applied', value: 4, fill: '#7C6BFF' },
    { name: 'Under Review', value: 3, fill: '#4FFAF0' },
    { name: 'Shortlisted', value: 3, fill: '#FF5EB5' },
    { name: 'Rejected', value: 1, fill: '#ef4444' },
    { name: 'Selected', value: 1, fill: '#10b981' },
  ];

  const matchScoreTrend = [
    { name: 'Run 1', score: 82 },
    { name: 'Run 2', score: 88 },
    { name: 'Run 3', score: 92 },
    { name: 'Run 4', score: 96 },
  ];

  const interviewActivity = [
    { week: 'Wk 1', sessions: 0 },
    { week: 'Wk 2', sessions: 1 },
    { week: 'Wk 3', sessions: 2 },
    { week: 'Wk 4', sessions: 1 },
  ];

  const applicationsOverTime = [
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 3 },
    { month: 'Mar', count: 5 },
    { month: 'Apr', count: 8 },
    { month: 'May', count: 10 },
    { month: 'Jun', count: 12 },
  ];

  if (!myProfile) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold font-space text-white uppercase">No Application Ingested</h3>
        <p className="text-xs text-mutedGray font-outfit mt-1">Visit the profile page to ingest your resume coordinates.</p>
        <button onClick={() => navigate('/candidate/profile')} className="mt-4 px-4.5 py-2.5 bg-primaryGlow text-black rounded font-bold text-xs uppercase tracking-wider font-space">Setup Profile</button>
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
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Candidate Core OS</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Welcome back, {user?.first_name}. Monitor your neural screening scores, rankings, and interview slots.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primaryGlow/5 border border-primaryGlow/25 text-primaryGlow text-[10px] font-bold font-space uppercase animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Engine Synchronized</span>
        </div>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Applications */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-primaryGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Total Applications</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{dashboardStats.totalApplications}</h3>
              <span className="text-[9px] text-mutedGray mt-1 block font-space uppercase">Active Pipelines</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 flex items-center justify-center text-primaryGlow">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Shortlisted Jobs */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-[#4FFAF0]/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Shortlisted Jobs</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{dashboardStats.shortlistedJobs}</h3>
              <span className="text-[9px] text-primaryGlow font-bold mt-1 block font-space uppercase">Proceeding Stage</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#4FFAF0]/10 border border-[#4FFAF0]/25 flex items-center justify-center text-[#4FFAF0]">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Interviews */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-[#FFD166]/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Upcoming Interviews</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{dashboardStats.upcomingInterviews}</h3>
              <span className="text-[9px] text-[#FFD166] font-bold mt-1 block font-space uppercase">Ready for Panels</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/25 flex items-center justify-center text-[#FFD166]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Highest Match Score */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 hover:border-accentGlow/25 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Highest Match Score</p>
              <h3 className="text-3xl font-black text-white mt-3 font-space">{dashboardStats.highestMatchScore}%</h3>
              <span className="text-[9px] text-accentGlow font-bold mt-1 block font-space uppercase">Qualified Peak</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accentGlow/10 border border-accentGlow/25 flex items-center justify-center text-accentGlow">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

      </div>

      {/* DASHBOARD CHARTS SECTION */}
      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">System Analytics</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Application Status Distribution (Pie) */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Status Distribution</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Match Score Trend (Line) */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Match Score Trend</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matchScoreTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Match %"
                    stroke="#4FFAF0"
                    strokeWidth={2.5}
                    dot={{ fill: '#7C6BFF', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Interview Activity (Bar) */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Interview Activity</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Bar dataKey="sessions" name="Interviews Scheduled" fill="#FFD166" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Applications Over Time (Area) */}
          <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-space">Applications Over Time</h5>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6BFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7C6BFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Total Submissions" 
                    stroke="#7C6BFF" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* CORE WORKSPACE TRIGGERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Summary card */}
        <div className="p-7 rounded-2xl glass-panel bg-white/2 border border-white/5 space-y-6 flex flex-col justify-between text-left">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Application Summary</h4>
            <span className="text-[10px] text-mutedGray uppercase font-space block mt-1.5">{myProfile.jobTitle}</span>
            <p className="text-xs text-mutedGray leading-relaxed font-outfit mt-4">
              Your resume coordinates have been indexed successfully by the neural screening core. Match accuracy is optimized, and interview slots have been requested.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/candidate/applications')}
            className="w-fit px-5 py-3 rounded-xl bg-primaryGlow text-black font-bold text-xs uppercase tracking-wider font-space flex items-center gap-2 hover:scale-103 transition-transform cursor-pointer shadow-[0_0_10px_rgba(79,250,240,0.15)]"
          >
            <span>Track Progress</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Right: Quick Links panel */}
        <div className="p-7 rounded-2xl glass-panel bg-white/2 border border-white/5 space-y-5 text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Workspace Quadrants</h4>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/candidate/match')}
              className="p-4 rounded-xl bg-[#071021]/30 border border-white/5 hover:bg-white/5 hover:border-white/10 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-primaryGlow" />
                <div>
                  <span className="text-xs font-bold text-white block uppercase tracking-wide font-space">AI Match Diagnostics</span>
                  <span className="text-[10px] text-mutedGray block font-outfit">Review strength scores and gaps</span>
                </div>
              </div>
              <ArrowRight className="w-4.5 h-4.5 text-mutedGray" />
            </button>

            <button
              onClick={() => navigate('/candidate/rankings')}
              className="p-4 rounded-xl bg-[#071021]/30 border border-white/5 hover:bg-white/5 hover:border-white/10 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-secondaryGlow" />
                <div>
                  <span className="text-xs font-bold text-white block uppercase tracking-wide font-space">Rank Leaderboard</span>
                  <span className="text-[10px] text-mutedGray block font-outfit">View comparison indices and stats</span>
                </div>
              </div>
              <ArrowRight className="w-4.5 h-4.5 text-mutedGray" />
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
