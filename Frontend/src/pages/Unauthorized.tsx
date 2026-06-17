import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden bg-[#071021]/60">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-error to-transparent" />
        
        <div className="w-16 h-16 rounded-full bg-error/10 border border-error/25 flex items-center justify-center text-error mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-2.5xl font-black font-space tracking-tight mb-2 uppercase">Access Restricted</h3>
        <p className="text-mutedGray text-xs mb-8 font-outfit leading-relaxed">
          Your credentials do not carry clearance codes for this workspace quadrant. Recruiter coordinates are shielded from Candidate feeds, and vice versa.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 hover:border-white/15 transition-all text-xs font-bold uppercase tracking-widest font-space cursor-pointer"
        >
          Return to Previous Grid
        </button>
      </div>
    </div>
  );
}
