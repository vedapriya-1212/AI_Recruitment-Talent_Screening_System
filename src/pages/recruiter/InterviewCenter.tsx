import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Search, Filter, Calendar, Clock, BrainCircuit, UserCheck, ShieldAlert, ChevronRight, PlayCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Data for demonstration
const mockInterviews = [
  { id: '1', candidate: 'Alice Chen', role: 'Senior React Developer', status: 'Pending', score: null, scheduledAt: null },
  { id: '2', candidate: 'David Kumar', role: 'Backend Engineer', status: 'Scheduled', score: null, scheduledAt: '2026-06-25T10:00:00Z' },
  { id: '3', candidate: 'Sarah Miller', role: 'AI/ML Engineer', status: 'In Progress', score: null, scheduledAt: '2026-06-20T10:00:00Z' },
  { id: '4', candidate: 'James Wilson', role: 'Frontend Architect', status: 'Completed', score: 92, scheduledAt: '2026-06-18T14:00:00Z' },
  { id: '5', candidate: 'Emily Davis', role: 'Data Scientist', status: 'Failed Verification', score: null, scheduledAt: '2026-06-19T09:00:00Z' },
];

export default function InterviewCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartInterviewConfig = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsConfigModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-space uppercase tracking-wider text-white">AI Interview Center</h1>
          <p className="text-sm text-mutedGray mt-1 font-outfit">Manage automated AI interviews, proctoring, and evaluation reports.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl glass-panel">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider font-space transition-all ${activeTab === 'overview' ? 'bg-primaryGlow/20 text-primaryGlow' : 'text-mutedGray hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider font-space transition-all ${activeTab === 'reports' ? 'bg-secondaryGlow/20 text-secondaryGlow' : 'text-mutedGray hover:text-white'}`}
          >
            Reports
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending Invites', value: '12', icon: Clock, color: 'text-yellow-400' },
              { label: 'Scheduled', value: '5', icon: Calendar, color: 'text-blue-400' },
              { label: 'Completed', value: '28', icon: CheckCircle2, color: 'text-green-400' },
              { label: 'Flagged', value: '2', icon: ShieldAlert, color: 'text-error' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-5 border border-white/10 rounded-2xl flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-mutedGray font-bold uppercase tracking-wider font-space">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interview List */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase font-space text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-primaryGlow" /> Interview Pipeline
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search candidates..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primaryGlow w-64" />
                </div>
                <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-mutedGray hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/2 border-b border-white/10">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Candidate</th>
                    <th className="p-4 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Role</th>
                    <th className="p-4 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Status</th>
                    <th className="p-4 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space">Score</th>
                    <th className="p-4 text-[10px] font-bold text-mutedGray uppercase tracking-wider font-space text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-white/2 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primaryGlow to-secondaryGlow flex items-center justify-center text-xs font-black text-[#030712]">
                            {interview.candidate.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-white">{interview.candidate}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-mutedGray">{interview.role}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          interview.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          interview.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          interview.status === 'Failed Verification' ? 'bg-red-500/10 text-error border border-red-500/20' :
                          'bg-white/10 text-mutedGray border border-white/10'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-white">{interview.score ? `${interview.score}/100` : '-'}</td>
                      <td className="p-4 text-right">
                        {interview.status === 'Pending' && (
                          <button onClick={() => handleStartInterviewConfig(interview)} className="px-4 py-1.5 rounded-lg bg-primaryGlow/20 text-primaryGlow text-xs font-bold font-space hover:bg-primaryGlow hover:text-[#030712] transition-colors">
                            Configure AI
                          </button>
                        )}
                        {interview.status === 'Completed' && (
                          <button className="px-4 py-1.5 rounded-lg bg-secondaryGlow/20 text-secondaryGlow text-xs font-bold font-space hover:bg-secondaryGlow hover:text-[#030712] transition-colors flex items-center gap-1 ml-auto">
                            <FileText className="w-3.5 h-3.5" /> View Report
                          </button>
                        )}
                         {interview.status === 'Scheduled' && (
                          <span className="text-xs text-mutedGray flex items-center justify-end gap-1"><Calendar className="w-3 h-3"/> Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Config Modal */}
      <AnimatePresence>
        {isConfigModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfigModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#071021] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden glass-panel">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-black uppercase font-space text-white">Configure AI Interview</h2>
                <button onClick={() => setIsConfigModalOpen(false)} className="text-mutedGray hover:text-white"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-6">
                
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-primaryGlow/20 flex items-center justify-center text-primaryGlow font-black text-xl">
                    {selectedCandidate.candidate.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedCandidate.candidate}</p>
                    <p className="text-xs text-mutedGray">{selectedCandidate.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-mutedGray font-bold uppercase tracking-wider font-space">Duration (Mins)</label>
                    <select className="w-full bg-[#030712] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primaryGlow outline-none">
                      <option>30 Minutes</option>
                      <option>45 Minutes</option>
                      <option>60 Minutes</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-mutedGray font-bold uppercase tracking-wider font-space">Difficulty</label>
                    <select className="w-full bg-[#030712] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primaryGlow outline-none">
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] text-mutedGray font-bold uppercase tracking-wider font-space">Interview Modules</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-primaryGlow/30 bg-primaryGlow/5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primaryGlow w-4 h-4" />
                      <span className="text-sm font-bold text-white">Identity Verification</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-primaryGlow/30 bg-primaryGlow/5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primaryGlow w-4 h-4" />
                      <span className="text-sm font-bold text-white">Technical Q&A</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-primaryGlow/30 bg-primaryGlow/5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primaryGlow w-4 h-4" />
                      <span className="text-sm font-bold text-white">Live Coding Assessment</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-primaryGlow/30 bg-primaryGlow/5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primaryGlow w-4 h-4" />
                      <span className="text-sm font-bold text-white">Behavioral / HR</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setIsConfigModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold font-space uppercase text-xs hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={() => { setIsConfigModalOpen(false); alert('Invitation Sent!'); }} className="px-6 py-2.5 rounded-xl bg-primaryGlow text-[#030712] font-black font-space uppercase text-xs hover:bg-[#3ceae0] transition-colors flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Send Invite & Start
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
