import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, ArrowRight, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export default function PortalModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [activePortal, setActivePortal] = useState(null); // 'recruiter' | 'candidate' | null
  const [isSignUp, setIsSignUp] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setActivePortal(null);
    setIsSignUp(false);
    setFullName('');
    setEmail('');
    setPassword('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAutofill = (portal) => {
    if (portal === 'recruiter') {
      setEmail('recruiter@recruiter.com');
      setPassword('NeuralRecruit2035!');
      setIsSignUp(false);
    } else {
      setEmail('candidate@candidate.com');
      setPassword('NeuralRecruit2035!');
      setIsSignUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const names = fullName.trim().split(/\s+/);
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';

        await signup(email, password, firstName, lastName, activePortal);
        toast.success(`Welcome to the ${activePortal} portal!`);
      } else {
        await login(email, password);
        toast.success('Access Unlocked successfully!');
      }

      handleClose();
      // Redirect based on the portal
      if (activePortal === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-bgDark/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full max-w-4xl glass-panel rounded-2xl overflow-hidden p-6 md:p-10 border border-white/10 shadow-2xl bg-[#071021]/80"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-mutedGray hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              aria-label="Close modal"
              id="close-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
              {activePortal === null ? (
                // Choice screen
                <motion.div
                  key="choice"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <h3 className="text-3xl font-black tracking-tight mb-2 text-white font-space uppercase">
                    Access <span className="gradient-text-cyan-purple">Talent Intelligence</span>
                  </h3>
                  <p className="text-mutedGray max-w-md mx-auto mb-10 text-xs font-outfit">
                    Select your gateway to interact with the neural hiring pipeline.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    
                    {/* Recruiter Card */}
                    <motion.div
                      onClick={() => setActivePortal('recruiter')}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="cursor-pointer text-left p-8 rounded-xl glass-panel bg-white/3 border border-white/6 hover:border-primaryGlow/30 relative group overflow-hidden transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primaryGlow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="w-14 h-14 rounded-lg bg-primaryGlow/10 border border-primaryGlow/25 flex items-center justify-center text-primaryGlow mb-6 group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primaryGlow transition-colors duration-200 font-space uppercase">
                        Recruiter Portal
                      </h4>
                      <p className="text-mutedGray text-xs mb-6 leading-relaxed font-outfit">
                        Source, screen, and schedule top-tier candidates with AI automation. Access executive dashboard and ranking panels.
                      </p>
                      <div className="flex items-center text-primaryGlow text-xs font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300 font-space">
                        Enter Workspace <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </div>
                    </motion.div>

                    {/* Candidate Card */}
                    <motion.div
                      onClick={() => setActivePortal('candidate')}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="cursor-pointer text-left p-8 rounded-xl glass-panel bg-white/3 border border-white/6 hover:border-secondaryGlow/30 relative group overflow-hidden transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-secondaryGlow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="w-14 h-14 rounded-lg bg-secondaryGlow/10 border border-secondaryGlow/25 flex items-center justify-center text-secondaryGlow mb-6 group-hover:scale-105 transition-transform duration-300">
                        <User className="w-7 h-7" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-secondaryGlow transition-colors duration-200 font-space uppercase">
                        Candidate Gateway
                      </h4>
                      <p className="text-mutedGray text-xs mb-6 leading-relaxed font-outfit">
                        Complete AI-generated assessments, optimize your skills profile, and connect with tech teams automatically.
                      </p>
                      <div className="flex items-center text-secondaryGlow text-xs font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300 font-space">
                        Track Application <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </div>
                    </motion.div>

                  </div>
                </motion.div>
              ) : (
                // Form screen (Recruiter or Candidate)
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-md mx-auto"
                >
                  <button
                    onClick={resetState}
                    className="text-xs text-mutedGray hover:text-white flex items-center mb-6 transition-all duration-200 cursor-pointer font-space uppercase tracking-wider"
                    id="back-to-portal-btn"
                  >
                    ← Back to selection
                  </button>

                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 rounded-lg mx-auto flex items-center justify-center mb-4 ${
                      activePortal === 'recruiter' 
                        ? 'bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25' 
                        : 'bg-secondaryGlow/10 text-secondaryGlow border border-secondaryGlow/25'
                    }`}>
                      {activePortal === 'recruiter' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <h3 className="text-2.5xl font-bold text-white capitalize font-space uppercase">
                      {activePortal} Portal
                    </h3>
                    <p className="text-mutedGray text-xs mt-1 mb-6 font-outfit">
                      {activePortal === 'recruiter'
                        ? 'Connect your enterprise to the neural pipeline'
                        : 'Submit details to let the AI match your profile'}
                    </p>

                    {/* Premium Sliding Segmented Switcher */}
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl max-w-[280px] mx-auto relative shadow-inner">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider font-space rounded-lg transition-all duration-300 relative z-10 cursor-pointer ${
                          !isSignUp 
                            ? 'text-[#030712]' 
                            : 'text-mutedGray hover:text-white'
                        }`}
                      >
                        Sign In
                        {!isSignUp && (
                          <motion.div
                            layoutId="activeTabGlow"
                            className={`absolute inset-0 rounded-lg -z-10 ${
                              activePortal === 'recruiter' ? 'bg-primaryGlow' : 'bg-secondaryGlow'
                            }`}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider font-space rounded-lg transition-all duration-300 relative z-10 cursor-pointer ${
                          isSignUp 
                            ? 'text-[#030712]' 
                            : 'text-mutedGray hover:text-white'
                        }`}
                      >
                        Sign Up
                        {isSignUp && (
                          <motion.div
                            layoutId="activeTabGlow"
                            className={`absolute inset-0 rounded-lg -z-10 ${
                              activePortal === 'recruiter' ? 'bg-primaryGlow' : 'bg-secondaryGlow'
                            }`}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {isSignUp && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-[13px] w-4 h-4 text-mutedGray" />
                          <input
                            type="text"
                            required
                            disabled={isLoading}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow focus:ring-1 focus:ring-primaryGlow transition-all duration-200 font-outfit disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-[13px] w-4 h-4 text-mutedGray" />
                        <input
                          type="email"
                          required
                          disabled={isLoading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={activePortal === 'recruiter' ? 'recruiter@recruiter.com' : 'candidate@candidate.com'}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow focus:ring-1 focus:ring-primaryGlow transition-all duration-200 font-outfit disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGray mb-1.5 font-space">Access Key / Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-mutedGray" />
                        <input
                          type="password"
                          required
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow focus:ring-1 focus:ring-primaryGlow transition-all duration-200 font-outfit disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Autofill Demo Credentials Helper */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleAutofill(activePortal)}
                        disabled={isLoading}
                        className="text-[10px] font-bold uppercase tracking-wider text-primaryGlow hover:text-white transition-all duration-200 cursor-pointer font-space bg-transparent border-none outline-none"
                      >
                        ⚡ Autofill Demo {activePortal === 'recruiter' ? 'Recruiter' : 'Candidate'} Credentials
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3.5 mt-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all duration-300 relative overflow-hidden group shadow-lg cursor-pointer font-space uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${
                        activePortal === 'recruiter'
                          ? 'bg-primaryGlow text-[#030712] shadow-primaryGlow/10 hover:shadow-primaryGlow/25'
                          : 'bg-secondaryGlow text-white shadow-secondaryGlow/10 hover:shadow-secondaryGlow/25'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <span>Authenticating...</span>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        </>
                      ) : (
                        <>
                          <span>{isSignUp ? 'Launch Workspace' : 'Unlock Access'}</span>
                          <ShieldCheck className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-6">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-mutedGray hover:text-white transition-all duration-200 cursor-pointer font-outfit"
                    >
                      {isSignUp ? 'Already connected? Unlock access' : 'Request gateway access / Register'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
