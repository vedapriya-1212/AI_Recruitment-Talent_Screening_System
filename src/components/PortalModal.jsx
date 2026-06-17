import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function PortalModal({ isOpen, onClose }) {
  const [activePortal, setActivePortal] = useState(null); // 'recruiter' | 'candidate' | null
  const [isSignUp, setIsSignUp] = useState(false);

  const resetState = () => {
    setActivePortal(null);
    setIsSignUp(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
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
            className="absolute inset-0 bg-[#050816]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-4xl glass-panel rounded-2xl overflow-hidden p-6 md:p-10 border border-white/10 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-mutedGray hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Close modal"
              id="close-modal-btn"
            >
              <X className="w-6 h-6" />
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
                  <h3 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
                    Access <span className="gradient-text-cyan-purple">Talent Intelligence</span>
                  </h3>
                  <p className="text-mutedGray max-w-md mx-auto mb-10 text-sm">
                    Select your gateway to interact with the neural hiring pipeline.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Recruiter Card */}
                    <motion.div
                      onClick={() => setActivePortal('recruiter')}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="cursor-pointer text-left p-8 rounded-xl glass-panel neon-border-cyan bg-white/5 relative group overflow-hidden transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primaryCyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-14 h-14 rounded-lg bg-primaryCyan/10 border border-primaryCyan/20 flex items-center justify-center text-primaryCyan mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-primaryCyan transition-colors duration-200">
                        Recruiter Portal
                      </h4>
                      <p className="text-mutedGray text-sm mb-6 leading-relaxed">
                        Source, screen, and schedule top-tier candidates with AI automation. Access executive dashboard and ranking panels.
                      </p>
                      <div className="flex items-center text-primaryCyan text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        Enter Workspace <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </motion.div>

                    {/* Candidate Card */}
                    <motion.div
                      onClick={() => setActivePortal('candidate')}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="cursor-pointer text-left p-8 rounded-xl glass-panel neon-border-purple bg-white/5 relative group overflow-hidden transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-secondaryPurple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-14 h-14 rounded-lg bg-secondaryPurple/10 border border-secondaryPurple/20 flex items-center justify-center text-secondaryPurple mb-6 group-hover:scale-110 transition-transform duration-300">
                        <User className="w-7 h-7" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-secondaryPurple transition-colors duration-200">
                        Candidate Gateway
                      </h4>
                      <p className="text-mutedGray text-sm mb-6 leading-relaxed">
                        Complete AI-generated assessments, optimize your skills profile, and connect with $100M+ tech teams automatically.
                      </p>
                      <div className="flex items-center text-secondaryPurple text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        Track Application <ArrowRight className="w-4 h-4 ml-2" />
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
                    className="text-xs text-mutedGray hover:text-white flex items-center mb-6 transition-all duration-200"
                    id="back-to-portal-btn"
                  >
                    ← Back to selection
                  </button>

                  <div className="text-center mb-8">
                    <div className={`w-12 h-12 rounded-lg mx-auto flex items-center justify-center mb-4 ${
                      activePortal === 'recruiter' ? 'bg-primaryCyan/10 text-primaryCyan border border-primaryCyan/20' : 'bg-secondaryPurple/10 text-secondaryPurple border border-secondaryPurple/20'
                    }`}>
                      {activePortal === 'recruiter' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    </div>
                    <h3 className="text-2xl font-bold text-white capitalize">
                      {activePortal} {isSignUp ? 'Registration' : 'Authorization'}
                    </h3>
                    <p className="text-mutedGray text-xs mt-1">
                      {activePortal === 'recruiter'
                        ? 'Connect your enterprise to the neural pipeline'
                        : 'Submit details to let the AI match your profile'}
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleClose(); }} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <label className="block text-xs font-semibold text-mutedGray mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primaryCyan focus:ring-1 focus:ring-primaryCyan transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-mutedGray mb-1">Corporate Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primaryCyan focus:ring-1 focus:ring-primaryCyan transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-mutedGray mb-1">Secret Key / Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-mutedGray" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primaryCyan focus:ring-1 focus:ring-primaryCyan transition-all duration-200"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-2.5 rounded-lg font-bold text-sm text-black flex items-center justify-center transition-all duration-300 relative overflow-hidden group shadow-lg ${
                        activePortal === 'recruiter'
                          ? 'bg-primaryCyan shadow-primaryCyan/20 hover:shadow-primaryCyan/35'
                          : 'bg-secondaryPurple text-white shadow-secondaryPurple/20 hover:shadow-secondaryPurple/35'
                      }`}
                    >
                      <span>{isSignUp ? 'Launch Workspace' : 'Unlock Access'}</span>
                      <ShieldCheck className="w-4 h-4 ml-2" />
                    </button>
                  </form>

                  <div className="text-center mt-6">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-mutedGray hover:text-white transition-all duration-200"
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
