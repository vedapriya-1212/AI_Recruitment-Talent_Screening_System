import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { JobPost, CandidateProfile, InterviewEvent } from '../api/mockData';
import { useNotifications } from './NotificationContext';

interface ApplicationContextType {
  jobs: JobPost[];
  candidates: CandidateProfile[];
  interviews: InterviewEvent[];
  loading: boolean;
  createJob: (job: Omit<JobPost, 'id' | 'created_at' | 'applicationsCount'>) => Promise<JobPost>;
  updateCandidateStatus: (id: string, status: CandidateProfile['status']) => Promise<CandidateProfile>;
  scheduleInterview: (candidateId: string, candidateName: string, jobTitle: string, date: string, time: string, stage: InterviewEvent['stage']) => Promise<InterviewEvent>;
  refreshAll: () => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

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
      
      // Send notification based on status
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
      
      // Update local candidate status as well
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

  return (
    <ApplicationContext.Provider
      value={{
        jobs,
        candidates,
        interviews,
        loading,
        createJob,
        updateCandidateStatus,
        scheduleInterview,
        refreshAll,
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
