import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Fetch candidate-specific data (my applications & my interviews)
  const refreshMyData = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch candidate's own applications
      const apps = await apiClient.getCandidateApplications();
      setMyApplications(apps);

      // Fetch candidate's own interviews from the backend via API client
      const myInterviewData = await apiClient.getInterviews();
      setMyInterviews(myInterviewData);
    } catch (err) {
      console.warn('refreshMyData failed:', err);
    }
  }, [user]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [fetchedJobs, fetchedCandidates, fetchedInterviews] = await Promise.all([
        apiClient.getJobs(),
        apiClient.getCandidates(),
        apiClient.getInterviews(),
      ]);
      setJobs(fetchedJobs);
      setCandidates(fetchedCandidates);
      setInterviews(fetchedInterviews);
    } catch (err) {
      console.error('Failed to load application datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [user]);

  // After main data loads, fetch candidate-specific data
  useEffect(() => {
    if (!loading && user?.role === 'candidate') {
      refreshMyData();
    }
  }, [loading, user]);

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

  const updateCandidateStatus = async (id: string, status: CandidateProfile['status']) => {
    try {
      const updated = await apiClient.updateCandidateStatus(id, status);
      setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)));
      
      let notifyType: 'info' | 'success' | 'warning' | 'error' = 'info';
      if (status === 'Selected') notifyType = 'success';
      if (status === 'Rejected') notifyType = 'error';

      addNotification(
        'Candidate Status Updated',
        `Candidate "${updated.name}" is now in phase "${status}".`,
        notifyType
      );
      return updated;
    } catch (err) {
      addNotification('Status Update Failed', 'Failed to update candidate index.', 'error');
      throw err;
    }
  };

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

  const applyForJob = async (jobId: string) => {
    try {
      await apiClient.applyForJob(jobId);
      // Refresh candidate's applications
      const apps = await apiClient.getCandidateApplications();
      setMyApplications(apps);
      // Update job application count locally
      setJobs(prev => prev.map(j => j.id === jobId 
        ? { ...j, applicationsCount: (j.applicationsCount || 0) + 1 } 
        : j
      ));
      addNotification('Application Submitted', 'Your application has been recorded successfully.', 'success');
    } catch (err: any) {
      // Duplicate application error is OK
      if (err?.message?.includes('duplicate') || err?.message?.includes('unique')) {
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
