import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const goToDashboard = () => {
    if (user?.role === 'recruiter') navigate('/recruiter/dashboard');
    else if (user?.role === 'candidate') navigate('/candidate/dashboard');
    else navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden bg-[#071021]/60">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-error via-error/50 to-transparent" />

        <div className="w-16 h-16 rounded-full bg-error/10 border border-error/25 flex items-center justify-center text-error mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-2xl font-black font-space tracking-tight mb-2 uppercase">Access Restricted</h3>
        <p className="text-mutedGray text-xs mb-6 font-outfit leading-relaxed">
          Your credentials do not carry clearance for this workspace quadrant. Recruiter and Candidate portals are separated.
        </p>

        {user && (
          <div className="mb-6 p-3 rounded-xl bg-white/3 border border-white/6 text-xs font-outfit">
            <span className="text-mutedGray">Logged in as </span>
            <span className="text-white font-bold">{user.first_name} {user.last_name}</span>
            <span className="text-mutedGray"> · Role: </span>
            <span className={`font-bold uppercase ${user.role === 'recruiter' ? 'text-primaryGlow' : 'text-secondaryGlow'}`}>
              {user.role}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {user && (
            <button
              onClick={goToDashboard}
              className="w-full py-3.5 rounded-xl bg-primaryGlow text-[#030712] font-bold text-xs uppercase tracking-widest font-space hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to My Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 hover:border-white/15 transition-all text-xs font-bold uppercase tracking-widest font-space cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-mutedGray" />
            Sign In as Different Role
          </button>
        </div>
      </div>
    </div>
  );
}
