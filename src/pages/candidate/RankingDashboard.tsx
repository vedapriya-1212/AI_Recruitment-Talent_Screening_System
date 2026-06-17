import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Trophy, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';

const rankHistory = [
  { checkpoint: 'Ingestion', position: 5 },
  { checkpoint: 'Keyword Match', position: 3 },
  { checkpoint: 'Semantic Scan', position: 2 },
  { checkpoint: 'Tech Review', position: 1 },
];

export default function RankingDashboard() {
  const { user } = useAuth();
  const { candidates } = useApplication();

  const myProfile = candidates.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || candidates[0];

  if (!myProfile) return null;

  // Comparison metrics Candidate vs Average
  const comparisonData = [
    { metric: 'Tech Fit', candidate: myProfile.technicalScore, average: 74 },
    { metric: 'Resume Score', candidate: myProfile.resumeScore, average: 65 },
    { metric: 'Comm Score', candidate: myProfile.communicationScore, average: 81 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 text-left animate-fade-in"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Ranking Diagnostics</h2>
        <p className="text-mutedGray text-xs font-outfit mt-1">
          Historical rank tracks, percentile position indicators, and competence gap checklists.
        </p>
      </div>

      {/* OVERVIEW METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Current Position</span>
            <h3 className="text-2.5xl font-black text-white font-space mt-2">#0{myProfile.rank}</h3>
            <span className="text-[9px] text-[#FFD166] font-bold mt-1 block font-space uppercase">Top Tier</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/25 text-[#FFD166] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Previous Position</span>
            <h3 className="text-2.5xl font-black text-white font-space mt-2">
              #0{myProfile.previousRank || myProfile.rank + 1}
            </h3>
            <span className="text-[9px] text-success font-bold mt-1 block font-space uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Upgraded
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/25 text-success flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5.5 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-mutedGray uppercase tracking-wider font-space block">Percentile Index</span>
            <h3 className="text-2.5xl font-black text-white font-space mt-2">
              {Math.max(90, 100 - myProfile.rank * 2)}th
            </h3>
            <span className="text-[9px] text-primaryGlow font-bold mt-1 block font-space uppercase">Outperforming pool</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primaryGlow/10 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>

      </div>

      {/* CHARTS GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Rank Trajectory Chart (Col-span 7) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Rank Trajectory</h4>
          
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="checkpoint" stroke="#94A3B8" fontSize={9} fontFamily="sans-serif" />
                <YAxis stroke="#94A3B8" fontSize={9} fontFamily="sans-serif" reversed />
                <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                <Line
                  type="monotone"
                  dataKey="position"
                  stroke="#4FFAF0"
                  strokeWidth={2.5}
                  dot={{ fill: '#7C6BFF', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Peer Comparison Chart (Col-span 5) */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-space">Peer Comparison</h4>
          
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="metric" stroke="#94A3B8" fontSize={9} fontFamily="sans-serif" />
                <YAxis stroke="#94A3B8" fontSize={9} fontFamily="sans-serif" />
                <Tooltip contentStyle={{ backgroundColor: '#071021', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                <Bar dataKey="candidate" name="You" fill="#4FFAF0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" name="Pool Average" fill="#7C6BFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* GAPS & SKILL ALIGNMENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Top Competencies */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Matched Competencies</h4>
          <div className="flex gap-2 flex-wrap">
            {myProfile.skills.map((skill, index) => (
              <span key={index} className="text-[9px] font-bold text-primaryGlow bg-primaryGlow/10 border border-primaryGlow/25 px-2.5 py-1 rounded-full font-space uppercase">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skill gaps */}
        <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 space-y-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-space">Identified Gaps</h4>
          <div className="flex gap-2 flex-wrap">
            {myProfile.screeningReport.weaknesses.length === 0 ? (
              <p className="text-xs text-mutedGray font-outfit">No core capability gaps detected.</p>
            ) : (
              myProfile.screeningReport.weaknesses.map((weak, index) => (
                <span key={index} className="text-[9px] font-bold text-error bg-error/10 border border-error/25 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-space uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-error" />
                  <span>{weak}</span>
                </span>
              ))
            )}
          </div>
        </div>

      </div>

    </motion.div>
  );
}
