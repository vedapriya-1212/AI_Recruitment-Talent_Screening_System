import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, CheckCircle2, Eye, XCircle, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { notifications, markAsRead, deleteNotification, markAllAsRead, clearAll } = useNotifications();

  const getIcon = (title: string, type: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('interview')) {
      return <Calendar className="w-5 h-5 text-[#FFD166]" />;
    }
    if (titleLower.includes('shortlisted')) {
      return <CheckCircle2 className="w-5 h-5 text-[#4FFAF0]" />;
    }
    if (titleLower.includes('viewed')) {
      return <Eye className="w-5 h-5 text-[#7C6BFF]" />;
    }
    if (titleLower.includes('rejected')) {
      return <XCircle className="w-5 h-5 text-error" />;
    }
    return <Bell className="w-5 h-5 text-primaryGlow" />;
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success/5 border-success/20';
      case 'error': return 'bg-error/5 border-error/20';
      case 'warning': return 'bg-warning/5 border-warning/20';
      default: return 'bg-white/2 border-white/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Workspace Logs</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Real-time status updates from the neural recruitment core and hiring panels.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider font-space cursor-pointer transition-colors"
            >
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-error/10 border border-error/20 hover:bg-error/20 text-error rounded-xl text-[10px] font-bold uppercase tracking-wider font-space cursor-pointer transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notifications Cards Container */}
      <div className="max-w-3xl space-y-4">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 py-20 flex flex-col items-center justify-center gap-4"
            >
              <Bell className="w-10 h-10 text-mutedGray animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-space">All Clear</h4>
                <p className="text-xs text-mutedGray font-outfit mt-1">
                  You have no pending notification alerts.
                </p>
              </div>
            </motion.div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  !notif.read ? 'bg-primaryGlow/5 border-primaryGlow/30 shadow-[0_0_15px_rgba(79,250,240,0.02)]' : 'bg-[#071021]/30 border-white/6'
                }`}
              >
                {/* Visual Type Indicator */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/3 border border-white/5`}>
                  {getIcon(notif.title, notif.type)}
                </div>

                <div className="flex-grow space-y-1 overflow-hidden">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-white font-space uppercase tracking-wide truncate">{notif.title}</h4>
                    <span className="text-[9px] text-mutedGray font-space shrink-0 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-mutedGray font-outfit leading-relaxed">{notif.message}</p>
                  
                  {/* Action Link for Interview invitations */}
                  {notif.title.toLowerCase().includes('interview') && (
                    <div className="pt-2">
                      <Link
                        to="/candidate/interviews"
                        className="text-[10px] font-bold text-primaryGlow uppercase tracking-wider font-space hover:underline flex items-center gap-1"
                      >
                        Review Interview Details & Calendar Options &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1 self-center shrink-0 ml-2">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      title="Mark as read"
                      className="p-2 rounded-lg hover:bg-white/5 text-mutedGray hover:text-primaryGlow transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete alert"
                    className="p-2 rounded-lg hover:bg-white/5 text-mutedGray hover:text-error transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
