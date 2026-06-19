import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Wifi, WifiOff, Send, ChevronDown, ChevronUp, Filter, Activity,
  Clock, User, Briefcase, Tag, Search
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { toast } from 'sonner';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body?: string;
  status: string;
  candidate_name?: string;
  candidate_email?: string;
  job_title?: string;
  status_trigger?: string;
  error_message?: string;
  sent_at: string;
}

interface SmtpStatus {
  configured: boolean;
  verified: boolean;
  error: string | null;
  host: string;
  port: string;
  user: string;
  mode: string;
}

const STATUS_TRIGGER_COLORS: Record<string, string> = {
  'Applied':            'text-primaryGlow bg-primaryGlow/10 border-primaryGlow/25',
  'Shortlisted':        'text-[#4FFAF0] bg-[#4FFAF0]/10 border-[#4FFAF0]/25',
  'Interview Scheduled':'text-[#FFD166] bg-[#FFD166]/10 border-[#FFD166]/25',
  'Selected':           'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  'Rejected':           'text-red-400 bg-red-400/10 border-red-400/25',
  'Test':               'text-orange-400 bg-orange-400/10 border-orange-400/25',
};

const EMAIL_STATUS_COLOR = (status: string) => {
  if (status?.startsWith('Sent (Mock)')) return 'text-yellow-400';
  if (status?.startsWith('Sent'))        return 'text-emerald-400';
  if (status?.startsWith('Failed'))      return 'text-red-400';
  return 'text-mutedGray';
};

const EMAIL_STATUS_DOT = (status: string) => {
  if (status?.startsWith('Sent (Mock)')) return 'bg-yellow-400';
  if (status?.startsWith('Sent'))        return 'bg-emerald-400';
  if (status?.startsWith('Failed'))      return 'bg-red-400';
  return 'bg-mutedGray';
};

export default function EmailLogs() {
  const [logs, setLogs]             = useState<EmailLog[]>([]);
  const [filtered, setFiltered]     = useState<EmailLog[]>([]);
  const [loading, setLoading]       = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [testEmail, setTestEmail]   = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  // Stats
  const totalSent    = logs.filter(l => l.status?.startsWith('Sent')).length;
  const totalFailed  = logs.filter(l => l.status?.startsWith('Failed')).length;
  const totalMock    = logs.filter(l => l.status === 'Sent (Mock)').length;
  const totalReal    = logs.filter(l => l.status === 'Sent').length;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getEmailLogs();
      setLogs(data || []);
      toast.success('Email logs refreshed');
    } catch {
      toast.error('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSmtpStatus = useCallback(async () => {
    setSmtpLoading(true);
    try {
      const res = await fetch('/api/email/smtp-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ats_token')}` }
      });
      const data = await res.json();
      setSmtpStatus(data);
    } catch {
      console.warn('SMTP status fetch failed');
    } finally {
      setSmtpLoading(false);
    }
  }, []);

  const verifySmtp = async () => {
    setSmtpLoading(true);
    try {
      const res = await fetch('/api/email/verify-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ats_token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('✅ SMTP connection verified successfully!');
      } else {
        toast.error(`❌ SMTP verification failed: ${data.message}`);
      }
      await fetchSmtpStatus();
    } catch {
      toast.error('Failed to verify SMTP connection');
    } finally {
      setSmtpLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setTestLoading(true);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ats_token')}`,
        },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ Test email sent to ${testEmail}`);
        setTestEmail('');
        setTimeout(fetchLogs, 1000);
      } else {
        toast.error(`❌ Test email failed: ${data.error || 'Unknown error'}`);
      }
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...logs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.recipient?.toLowerCase().includes(q) ||
        l.candidate_name?.toLowerCase().includes(q) ||
        l.subject?.toLowerCase().includes(q) ||
        l.job_title?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'sent')        result = result.filter(l => l.status === 'Sent');
      if (statusFilter === 'mock')        result = result.filter(l => l.status === 'Sent (Mock)');
      if (statusFilter === 'failed')      result = result.filter(l => l.status?.startsWith('Failed'));
    }
    if (triggerFilter !== 'all') {
      result = result.filter(l => l.status_trigger === triggerFilter);
    }
    setFiltered(result);
  }, [logs, search, statusFilter, triggerFilter]);

  useEffect(() => {
    fetchLogs();
    fetchSmtpStatus();
  }, [fetchLogs, fetchSmtpStatus]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-space tracking-tight text-white uppercase">Email Notification Logs</h2>
          <p className="text-mutedGray text-xs font-outfit mt-1">
            Monitor all candidate email notifications, SMTP status, and delivery results.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:bg-white/6 hover:border-primaryGlow/30 text-xs font-bold text-white uppercase tracking-wider font-space transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primaryGlow' : 'text-mutedGray'}`} />
          Refresh Logs
        </button>
      </div>

      {/* SMTP Status Panel */}
      <div className="p-6 rounded-2xl glass-panel bg-[#071021]/40 border border-white/8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white font-space flex items-center gap-2">
            <Wifi className="w-4 h-4 text-primaryGlow" />
            SMTP Connectivity & Reliability
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={verifySmtp}
              disabled={smtpLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primaryGlow/10 border border-primaryGlow/25 hover:bg-primaryGlow/20 text-xs font-bold text-primaryGlow uppercase tracking-wider font-space transition-all cursor-pointer disabled:opacity-50"
            >
              {smtpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
              Verify SMTP
            </button>
          </div>
        </div>

        {smtpStatus ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Mode */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-[9px] text-mutedGray uppercase tracking-wider font-space mb-1">Mode</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${smtpStatus.configured ? 'bg-primaryGlow' : 'bg-yellow-400'}`} />
                <span className="text-xs font-bold text-white font-space">{smtpStatus.mode}</span>
              </div>
            </div>
            {/* Connection */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-[9px] text-mutedGray uppercase tracking-wider font-space mb-1">Connection</p>
              <div className="flex items-center gap-2">
                {smtpStatus.verified
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  : smtpStatus.error
                  ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                }
                <span className={`text-xs font-bold font-space ${smtpStatus.verified ? 'text-emerald-400' : smtpStatus.error ? 'text-red-400' : 'text-yellow-400'}`}>
                  {smtpStatus.verified ? 'Verified' : smtpStatus.error ? 'Failed' : 'Not Tested'}
                </span>
              </div>
            </div>
            {/* Host */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-[9px] text-mutedGray uppercase tracking-wider font-space mb-1">Host : Port</p>
              <p className="text-xs font-bold text-white font-space truncate">{smtpStatus.host}:{smtpStatus.port}</p>
            </div>
            {/* User */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-[9px] text-mutedGray uppercase tracking-wider font-space mb-1">Sender</p>
              <p className="text-xs font-bold text-white font-outfit truncate">{smtpStatus.user || 'Not configured'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 text-mutedGray">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-outfit">Fetching SMTP status...</span>
          </div>
        )}

        {smtpStatus?.error && (
          <div className="p-3 rounded-xl bg-red-400/5 border border-red-400/20">
            <p className="text-[10px] font-bold text-red-400 font-space uppercase mb-1">SMTP Error</p>
            <p className="text-xs text-red-400/80 font-outfit">{smtpStatus.error}</p>
          </div>
        )}

        {/* Test Email */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-mutedGray" />
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendTestEmail()}
              placeholder="Send a test email to..."
              className="w-full bg-white/3 border border-white/6 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
            />
          </div>
          <button
            onClick={sendTestEmail}
            disabled={testLoading || !testEmail}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondaryGlow/10 border border-secondaryGlow/25 hover:bg-secondaryGlow/20 text-xs font-bold text-secondaryGlow uppercase tracking-wider font-space transition-all cursor-pointer disabled:opacity-40 shrink-0"
          >
            {testLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Send Test
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Logged',    value: logs.length,   color: 'text-white',         dot: 'bg-white/50' },
          { label: 'Delivered (Real)',value: totalReal,      color: 'text-emerald-400',   dot: 'bg-emerald-400' },
          { label: 'Mock (No SMTP)',  value: totalMock,      color: 'text-yellow-400',    dot: 'bg-yellow-400' },
          { label: 'Failed',          value: totalFailed,    color: 'text-red-400',       dot: 'bg-red-400' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl glass-panel bg-white/2 border border-white/5 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shrink-0 ${stat.dot}`} />
            <div>
              <div className={`text-2xl font-black font-space ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-mutedGray uppercase tracking-wider font-space mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-mutedGray" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, subject, or job..."
            className="w-full bg-white/3 border border-white/6 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-outfit"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#030712] border border-white/6 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
        >
          <option value="all">All Delivery Status</option>
          <option value="sent">Sent (Real)</option>
          <option value="mock">Sent (Mock)</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={triggerFilter}
          onChange={e => setTriggerFilter(e.target.value)}
          className="bg-[#030712] border border-white/6 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primaryGlow transition-colors font-space uppercase"
        >
          <option value="all">All Triggers</option>
          <option value="Applied">Applied</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
          <option value="Test">Test</option>
        </select>
        <span className="text-[10px] text-mutedGray font-space shrink-0">
          {filtered.length} / {logs.length} entries
        </span>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl glass-panel bg-[#071021]/30 border border-white/6 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 bg-white/2">
          {[
            { label: 'Candidate', cols: 3 },
            { label: 'Job Title', cols: 2 },
            { label: 'Subject', cols: 3 },
            { label: 'Trigger', cols: 1 },
            { label: 'Delivery', cols: 1 },
            { label: 'Time', cols: 2 },
          ].map(col => (
            <div key={col.label} className={`col-span-${col.cols} text-[9px] font-black uppercase tracking-wider text-mutedGray font-space`}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 text-primaryGlow animate-spin" />
            <span className="text-xs text-primaryGlow font-space uppercase tracking-widest animate-pulse">Loading logs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Mail className="w-10 h-10 text-mutedGray" />
            <p className="text-sm font-bold text-white font-space uppercase">No Email Logs Found</p>
            <p className="text-xs text-mutedGray font-outfit">
              {logs.length === 0
                ? 'No emails have been dispatched yet. Emails are sent automatically when candidate status changes.'
                : 'No logs match the current filters.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((log, idx) => (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                className="border-b border-white/4 last:border-0"
              >
                {/* Main Row */}
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-white/2 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === (log.id || String(idx)) ? null : (log.id || String(idx)))}
                >
                  {/* Candidate */}
                  <div className="md:col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${EMAIL_STATUS_DOT(log.status)}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate font-space">
                        {log.candidate_name || log.recipient?.split('@')[0] || '—'}
                      </p>
                      <p className="text-[9px] text-mutedGray truncate font-outfit">{log.candidate_email || log.recipient}</p>
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="md:col-span-2 flex items-center min-w-0">
                    <p className="text-xs text-mutedGray font-outfit truncate">{log.job_title || '—'}</p>
                  </div>

                  {/* Subject */}
                  <div className="md:col-span-3 flex items-center min-w-0">
                    <p className="text-xs text-white/80 font-outfit truncate">{log.subject}</p>
                  </div>

                  {/* Trigger Badge */}
                  <div className="md:col-span-1 flex items-center">
                    {log.status_trigger ? (
                      <span className={`text-[8px] font-bold font-space uppercase px-2 py-1 rounded border ${STATUS_TRIGGER_COLORS[log.status_trigger] || 'text-mutedGray bg-white/5 border-white/10'}`}>
                        {log.status_trigger}
                      </span>
                    ) : (
                      <span className="text-[9px] text-mutedGray font-outfit">—</span>
                    )}
                  </div>

                  {/* Delivery Status */}
                  <div className="md:col-span-1 flex items-center">
                    <span className={`text-[9px] font-bold font-space ${EMAIL_STATUS_COLOR(log.status)}`}>
                      {log.status === 'Sent' ? '✓ Sent' :
                       log.status === 'Sent (Mock)' ? '◎ Mock' :
                       log.status?.startsWith('Failed') ? '✕ Failed' : log.status}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="md:col-span-2 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-mutedGray font-outfit">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </span>
                    <span className="text-mutedGray shrink-0">
                      {expandedId === (log.id || String(idx))
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                      }
                    </span>
                  </div>
                </div>

                {/* Expanded Row */}
                <AnimatePresence>
                  {expandedId === (log.id || String(idx)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <p className="text-[9px] text-mutedGray uppercase font-space tracking-wider mb-1 flex items-center gap-1">
                                <User className="w-2.5 h-2.5" /> Candidate
                              </p>
                              <p className="text-[10px] text-white font-outfit">{log.candidate_name || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-mutedGray uppercase font-space tracking-wider mb-1 flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" /> Email
                              </p>
                              <p className="text-[10px] text-white font-outfit break-all">{log.candidate_email || log.recipient || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-mutedGray uppercase font-space tracking-wider mb-1 flex items-center gap-1">
                                <Briefcase className="w-2.5 h-2.5" /> Job
                              </p>
                              <p className="text-[10px] text-white font-outfit">{log.job_title || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-mutedGray uppercase font-space tracking-wider mb-1 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> Timestamp
                              </p>
                              <p className="text-[10px] text-white font-outfit">
                                {log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}
                              </p>
                            </div>
                          </div>

                          {/* Subject */}
                          <div>
                            <p className="text-[9px] text-mutedGray uppercase font-space tracking-wider mb-1">Subject</p>
                            <p className="text-[10px] text-white font-outfit">{log.subject}</p>
                          </div>

                          {/* Error (if failed) */}
                          {log.error_message && (
                            <div className="p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                              <p className="text-[9px] font-bold text-red-400 uppercase font-space tracking-wider mb-1">Error Details</p>
                              <p className="text-[10px] text-red-400/80 font-outfit">{log.error_message}</p>
                            </div>
                          )}

                          {/* Body preview */}
                          {log.body && (
                            <div>
                              <p className="text-[9px] text-mutedGray uppercase font-space tracking-wider mb-1">Message Preview</p>
                              <p className="text-[10px] text-mutedGray font-outfit leading-relaxed line-clamp-4">
                                {log.body.substring(0, 400)}{log.body.length > 400 ? '...' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
