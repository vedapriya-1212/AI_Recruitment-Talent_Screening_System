import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, LayoutDashboard, PlusCircle, Users, Trophy, 
  Calendar, BarChart3, UserCheck, Activity, LogOut, Bell, X, Menu,
  Briefcase, ClipboardList, Percent, Mail, Video
} from 'lucide-react';
import CandidateChatbot from '../components/CandidateChatbot';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, role } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [detailedProfile, setDetailedProfile] = useState<any>(null);
  const mainRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('user_detailed_profile');
    if (stored) {
      try {
        setDetailedProfile(JSON.parse(stored));
      } catch {}
    } else {
      setDetailedProfile(null);
    }
  }, [user]);

  // Reset scroll to top on every route navigation
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const recruiterItems: SidebarItem[] = [
    { label: 'Overview',    path: '/recruiter/dashboard',  icon: LayoutDashboard },
    { label: 'Create Job',  path: '/recruiter/create-job', icon: PlusCircle },
    { label: 'Applications',path: '/recruiter/applications',icon: Users },
    { label: 'Interview Center', path: '/recruiter/interviews', icon: Video },
    { label: 'Rankings',    path: '/recruiter/rankings',   icon: Trophy },
    { label: 'Scheduler',   path: '/recruiter/scheduler',  icon: Calendar },
    { label: 'Analytics',   path: '/recruiter/analytics',  icon: BarChart3 },
    { label: 'Email Logs',  path: '/recruiter/email-logs', icon: Mail },
  ];

  const candidateItems: SidebarItem[] = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Available Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'My Applications', path: '/candidate/applications', icon: ClipboardList },
    { label: 'My Interviews', path: '/candidate/interviews', icon: Video },
    { label: 'Resume Analysis', path: '/candidate/resume', icon: Cpu },
    { label: 'Match Scores', path: '/candidate/match', icon: Percent },
    { label: 'Ranking Status', path: '/candidate/rankings', icon: Trophy },
    { label: 'Notifications', path: '/candidate/notifications', icon: Bell },
    { label: 'Profile', path: '/candidate/profile', icon: UserCheck },
  ];

  const items = role === 'recruiter' ? recruiterItems : candidateItems;

  return (
    <div className="h-screen h-[100dvh] bg-[#030712] text-white flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black z-30 cursor-pointer backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Top Mobile Nav Bar */}
      <header className="lg:hidden w-full px-6 py-4 flex items-center justify-between glass-panel border-b border-white/6 z-30 bg-[#071021]/90 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primaryGlow" />
          <span className="text-sm font-black font-space uppercase tracking-wider text-white">AI Recruit</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Alert Bell */}
          <button onClick={() => setNotifPanelOpen(!notifPanelOpen)} className="relative p-1.5 text-mutedGray hover:text-white transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accentGlow shadow-[0_0_8px_#FF5EB5]" />
            )}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 text-mutedGray hover:text-white transition-colors cursor-pointer">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 z-40 bg-[#071021]/90 backdrop-blur-md border-r border-white/6 p-6 flex flex-col justify-between
        transform lg:translate-x-0 lg:static lg:h-screen lg:h-[100dvh] transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
          {/* Header Logo */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primaryGlow to-secondaryGlow p-[1px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primaryGlow animate-pulse" />
            </div>
            <span className="text-base font-black tracking-wider uppercase font-space text-white">AI Recruit</span>
          </div>

          <hr className="border-white/5" />

          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider font-space transition-all duration-300
                    ${isActive 
                      ? 'bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/20 shadow-[0_0_15px_rgba(79,250,240,0.05)]' 
                      : 'text-mutedGray hover:text-white hover:bg-white/3 border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Profile Box */}
        <div className="flex flex-col gap-4 mt-auto">
          <hr className="border-white/5" />
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondaryGlow/25 border border-secondaryGlow/40 flex items-center justify-center text-secondaryGlow font-space text-sm font-black uppercase">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
              </span>
              <span className="text-[10px] text-mutedGray block capitalize tracking-wide font-space">
                {role === 'recruiter' 
                  ? `${detailedProfile?.companyName || 'Enterprise'} • Recruiter` 
                  : `${detailedProfile?.preferredRole || 'Candidate'} Workspace`}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-xl bg-white/2 border border-white/6 hover:bg-error/10 hover:border-error/25 hover:text-error text-xs font-bold uppercase tracking-widest font-space flex items-center justify-center gap-2 group transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-mutedGray group-hover:text-error transition-colors" />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Floating Notifications Panel */}
      <AnimatePresence>
        {notifPanelOpen && (
          <>
            {/* Backdrop */}
            <div onClick={() => setNotifPanelOpen(false)} className="fixed inset-0 z-40 bg-black/40" />
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="fixed top-4 right-4 w-[340px] max-h-[480px] overflow-y-auto glass-panel border border-white/10 rounded-2xl p-5 shadow-2xl z-50 bg-[#071021]/90 backdrop-blur-md flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-black uppercase tracking-wider font-space">Workspace Logs</span>
                <button onClick={() => setNotifPanelOpen(false)} className="p-1 hover:bg-white/5 rounded text-mutedGray hover:text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-mutedGray text-center py-6 font-outfit">No active log notifications.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3 rounded-lg bg-white/2 border border-white/5 cursor-pointer hover:border-white/10 transition-colors ${!notif.read ? 'border-l-2 border-l-primaryGlow' : ''}`}
                    >
                      <h4 className="text-xs font-bold text-white font-space uppercase">{notif.title}</h4>
                      <p className="text-[11px] text-mutedGray mt-1 font-outfit">{notif.message}</p>
                      <span className="text-[9px] text-mutedGray block mt-2 text-right font-space">{notif.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dashboard Main Content Area */}
      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 z-10 relative">
        <div className="max-w-6xl mx-auto w-full pb-10">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>

      {/* AI Chatbot — only for candidates */}
      {role === 'candidate' && <CandidateChatbot />}
    </div>
  );
}
