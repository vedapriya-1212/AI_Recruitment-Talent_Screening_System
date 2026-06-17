import React, { useState } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { motion } from 'framer-motion';
import { Trophy, ArrowUpRight, Search, Award } from 'lucide-react';

export default function RankingLeaderboard() {
  const { candidates, jobs } = useApplication();
  const [selectedJob, setSelectedJob] = useState<string>('all');

  // Filter candidates by job
  const filtered = candidates.filter((c) => selectedJob === 'all' || c.jobId === selectedJob);

  // Sort by match score to compute leaderboard ranks
  const sorted = [...filtered].sort((a, b) => b.matchScore - a.matchScore);

  // Identify top 3 for the podium
  const firstPlace = sorted[0];
  const secondPlace = sorted[1];
  const thirdPlace = sorted[2];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Neural Leaderboard</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Precision applicant indexing rankings and overall talent stack index scoring.
          </p>
        </div>

        {/* Job selector */}
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="bg-[#030712] border border-white/6 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
        >
          <option value="all">All Jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 sm:gap-6 items-end max-w-3xl mx-auto pt-10">
          
          {/* SECOND PLACE (SILVER PODIUM) - Left */}
          {secondPlace && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-3">
                <span className="text-[10px] font-bold text-mutedGray bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-space">#02</span>
                <h4 className="text-xs font-bold text-white font-space mt-1.5 truncate max-w-[90px] sm:max-w-none">{secondPlace.name}</h4>
                <p className="text-[10px] text-secondaryGlow font-black font-space mt-0.5">{secondPlace.matchScore}% Match</p>
              </div>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-[#94A3B8]/25 to-white/2 border border-white/10 flex flex-col items-center justify-center relative shadow-[0_-5px_20px_rgba(148,163,184,0.08)]">
                <Trophy className="w-8 h-8 text-[#94A3B8]" />
                <span className="text-sm font-black font-space text-[#94A3B8] mt-2">SILVER</span>
              </div>
            </motion.div>
          )}

          {/* FIRST PLACE (GOLD PODIUM) - Center (Taller & Glowing) */}
          {firstPlace && (
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center z-10"
            >
              <div className="text-center mb-3">
                <span className="text-[10px] font-bold text-[#FFD166] bg-[#FFD166]/10 border border-[#FFD166]/25 px-2.5 py-0.5 rounded font-space shadow-[0_0_8px_rgba(255,209,102,0.1)]">#01</span>
                <h4 className="text-sm font-black text-white font-space mt-2.5 truncate max-w-[100px] sm:max-w-none">{firstPlace.name}</h4>
                <p className="text-xs text-[#FFD166] font-black font-space mt-0.5">{firstPlace.matchScore}% Match</p>
              </div>
              <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-b from-[#FFD166]/20 to-white/2 border border-[#FFD166]/30 flex flex-col items-center justify-center relative shadow-[0_-8px_25px_rgba(255,209,102,0.12)]">
                {/* Floating gold orb */}
                <div className="absolute top-[-10px] w-2.5 h-2.5 rounded-full bg-[#FFD166] shadow-[0_0_10px_#FFD166]" />
                <Award className="w-10 h-10 text-[#FFD166] animate-pulse" />
                <span className="text-base font-black font-space text-[#FFD166] mt-2">GOLD</span>
              </div>
            </motion.div>
          )}

          {/* THIRD PLACE (BRONZE PODIUM) - Right */}
          {thirdPlace && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-3">
                <span className="text-[10px] font-bold text-accentGlow bg-accentGlow/10 border border-accentGlow/25 px-2.5 py-0.5 rounded font-space">#03</span>
                <h4 className="text-xs font-bold text-white font-space mt-1.5 truncate max-w-[90px] sm:max-w-none">{thirdPlace.name}</h4>
                <p className="text-[10px] text-accentGlow font-black font-space mt-0.5">{thirdPlace.matchScore}% Match</p>
              </div>
              <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-b from-[#FF5EB5]/20 to-white/2 border border-[#FF5EB5]/10 flex flex-col items-center justify-center relative shadow-[0_-5px_20px_rgba(255,94,181,0.08)]">
                <Trophy className="w-7 h-7 text-[#FF5EB5]" />
                <span className="text-xs font-bold font-space text-[#FF5EB5] mt-1.5">BRONZE</span>
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* FULL LEADERBOARD DATA GRID */}
      <div className="p-6 rounded-2xl glass-panel border border-white/6 bg-[#071021]/30 overflow-hidden shadow-xl">
        <h4 className="text-xs font-black uppercase tracking-wider text-white font-space mb-6">Stacked Ranks Registry</h4>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-wider text-mutedGray font-space pb-3">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">AI Match</th>
                <th className="py-3 px-4 text-center">Exp</th>
                <th className="py-3 px-4 text-center">Resume</th>
                <th className="py-3 px-4 text-center">Technical</th>
                <th className="py-3 px-4 text-center">Overall Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4 text-xs font-outfit text-mutedGray">
              {sorted.map((cand, index) => (
                <tr
                  key={cand.id}
                  className="hover:bg-white/1 hover:text-white transition-colors"
                >
                  {/* Rank */}
                  <td className="py-4 px-4 font-bold text-white font-space">
                    {index + 1 <= 3 ? (
                      <span className={`px-2 py-0.5 rounded ${
                        index === 0 ? 'bg-[#FFD166]/10 text-[#FFD166] border border-[#FFD166]/25' :
                        index === 1 ? 'bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/25' :
                        'bg-accentGlow/10 text-accentGlow border border-accentGlow/25'
                      }`}>
                        0{index + 1}
                      </span>
                    ) : (
                      `0${index + 1}`
                    )}
                  </td>
                  {/* Name */}
                  <td className="py-4 px-4 font-bold text-white font-space uppercase tracking-wide">
                    {cand.name}
                  </td>
                  {/* AI Match */}
                  <td className="py-4 px-4 text-primaryGlow font-bold font-space">
                    {cand.matchScore}%
                  </td>
                  {/* Exp */}
                  <td className="py-4 px-4 text-center">
                    {cand.experienceYears} yrs
                  </td>
                  {/* Resume Score */}
                  <td className="py-4 px-4 text-center">
                    {cand.resumeScore}%
                  </td>
                  {/* Tech Score */}
                  <td className="py-4 px-4 text-center font-bold text-white">
                    {cand.technicalScore}%
                  </td>
                  {/* Overall Index */}
                  <td className="py-4 px-4 text-center font-black text-primaryGlow font-space">
                    {cand.overallScore}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}
