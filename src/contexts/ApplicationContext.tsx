import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/apiClient';
import { JobPost, CandidateProfile, InterviewEvent } from '../api/mockData';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: string;
}

interface ApplicationContextType {
  jobs: JobPost[];
  candidates: CandidateProfile[];
  interviews: InterviewEvent[];
  myApplications: CandidateApplication[];
  myInterviews: InterviewEvent[];
  loading: boolean;
  createJob: (job: Omit<JobPost, 'id' | 'created_at' | 'applicationsCount'>) => Promise<JobPost>;
  updateCandidateStatus: (id: string, status: CandidateProfile['status']) => Promise<CandidateProfile>;
  scheduleInterview: (candidateId: string, candidateName: string, jobTitle: string, date: string, time: string, stage: InterviewEvent['stage']) => Promise<InterviewEvent>;
  applyForJob: (jobId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshMyData: () => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [myApplications, setMyApplications] = useState<CandidateApplication[]>([]);
  const [myInterviews, setMyInterviews] = useState<InterviewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Candidate-only: fetch own applications & interviews ──────────────────
  const refreshMyData = useCallback(async () => {
    if (!user || user.role !== 'candidate') return;
    try {
      const apps = await apiClient.getCandidateApplications();
      setMyApplications(apps);
    } catch (err) {
      console.warn('refreshMyData failed:', err);
    }
  }, [user]);

  // ── Recruiter-only: fetch all applications & interviews ──────────────────
  const refreshRecruiterData = useCallback(async () => {
    if (!user || user.role !== 'recruiter') return;
    try {
      const fetchedCandidates = await apiClient.getCandidates();
      setCandidates(fetchedCandidates);
    } catch (err) {
      console.warn('refreshRecruiterData failed:', err);
    }
  }, [user]);

  // ── Full refresh (jobs + role-specific data) ──────────────────────────────
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedJobs = await apiClient.getJobs();
      setJobs(fetchedJobs);

      if (user?.role === 'recruiter') {
        await refreshRecruiterData();
      } else if (user?.role === 'candidate') {
        await refreshMyData();
      }
    } catch (err) {
      console.error('Failed to load application datasets:', err);
    } finally {
      setLoading(false);
    }
  }, [user, refreshMyData, refreshRecruiterData]);

  // ── Initial load when user changes ───────────────────────────────────────
  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // ── Polling: candidates poll every 30s for status updates ────────────────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (user?.role === 'candidate') {
      pollRef.current = setInterval(() => {
        refreshMyData();
      }, 30000); // 30 seconds
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.id, user?.role, refreshMyData]);

  // ── CREATE JOB ────────────────────────────────────────────────────────────
  const createJob = async (jobData: Omit<JobPost, 'id' | 'created_at' | 'applicationsCount'>) => {
    try {
      const created = await apiClient.createJob(jobData);
      setJobs((prev) => [created, ...prev]);
      addNotification(
        'Job Requirement Published',
        `Job post for "${created.title}" is now active.`,
        'success'
      );
      return created;
    } catch (err) {
      addNotification('Job Creation Failed', 'Could not save the new requirement.', 'error');
      throw err;
    }
  };

  // ── UPDATE CANDIDATE STATUS (recruiter) ──────────────────────────────────
  const updateCandidateStatus = async (id: string, status: CandidateProfile['status']) => {
    try {
      const updated = await apiClient.updateCandidateStatus(id, status);
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

      let notifyType: 'info' | 'success' | 'warning' | 'error' = 'info';
      if (status === 'Selected') notifyType = 'success';
      if (status === 'Rejected') notifyType = 'error';
      if (status === 'Shortlisted') notifyType = 'info';

      addNotification(
        'Candidate Status Updated',
        `Candidate status updated to "${status}".`,
        notifyType
      );
      return updated;
    } catch (err) {
      addNotification('Status Update Failed', 'Failed to update candidate index.', 'error');
      throw err;
    }
  };

  // ── SCHEDULE INTERVIEW ────────────────────────────────────────────────────
  const scheduleInterview = async (
    candidateId: string,
    candidateName: string,
    jobTitle: string,
    date: string,
    time: string,
    stage: InterviewEvent['stage']
  ) => {
    try {
      const created = await apiClient.scheduleInterview(candidateId, candidateName, jobTitle, date, time, stage);
      setInterviews((prev) => [created, ...prev]);
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: 'Interview' } : c))
      );
      addNotification(
        'Interview Event Scheduled',
        `Meeting set for ${candidateName} (${stage}) on ${date} at ${time}.`,
        'success'
      );
      return created;
    } catch (err) {
      addNotification('Scheduling Failed', 'Failed to save meeting parameters.', 'error');
      throw err;
    }
  };

  // ── APPLY FOR JOB (candidate) ─────────────────────────────────────────────
  const applyForJob = async (jobId: string) => {
    try {
      await apiClient.applyForJob(jobId);
      // Immediately refresh candidate's application list from DB
      const apps = await apiClient.getCandidateApplications();
      setMyApplications(apps);
      // Bump job count locally for immediate UI feedback
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, applicationsCount: (j.applicationsCount || 0) + 1 } : j
        )
      );
      addNotification('Application Submitted', 'Your application has been recorded successfully.', 'success');
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.message?.includes('unique') || err?.message?.includes('already applied')) {
        addNotification('Already Applied', 'You have already applied for this position.', 'info');
      } else {
        addNotification('Application Failed', err?.message || 'Could not submit application.', 'error');
      }
      throw err;
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        jobs,
        candidates,
        interviews,
        myApplications,
        myInterviews,
        loading,
        createJob,
        updateCandidateStatus,
        scheduleInterview,
        applyForJob,
        refreshAll,
        refreshMyData,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};
