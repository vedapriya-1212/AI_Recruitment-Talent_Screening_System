import { JobPost, CandidateProfile, InterviewEvent, initialJobs, initialCandidates, initialInterviews, mockAnalytics } from './mockData';

// Local storage state cache keys
const JOBS_KEY = 'ats_jobs';
const CANDIDATES_KEY = 'ats_candidates';
const INTERVIEWS_KEY = 'ats_interviews';

// Initialize local cache from mockData if empty
const getCachedData = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return initial;
  }
};

const setCachedData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const apiClient = {
  // JOBS ENDPOINTS
  async getJobs(): Promise<JobPost[]> {
    return getCachedData<JobPost[]>(JOBS_KEY, initialJobs);
  },

  async getJob(id: string): Promise<JobPost | undefined> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.id === id);
  },

  async createJob(jobData: Omit<JobPost, 'id' | 'created_at' | 'applicationsCount'>): Promise<JobPost> {
    const newJob: JobPost = {
      ...jobData,
      id: `job-${Math.random().toString(36).substr(2, 9)}`,
      applicationsCount: 0,
      created_at: new Date().toISOString(),
    };

    const jobs = await this.getJobs();
    const updated = [newJob, ...jobs];
    setCachedData(JOBS_KEY, updated);
    return newJob;
  },

  // CANDIDATES ENDPOINTS
  async getCandidates(jobId?: string): Promise<CandidateProfile[]> {
    const list = getCachedData<CandidateProfile[]>(CANDIDATES_KEY, initialCandidates);
    return jobId ? list.filter((c) => c.jobId === jobId) : list;
  },

  async getCandidate(id: string): Promise<CandidateProfile | undefined> {
    const candidates = await this.getCandidates();
    return candidates.find((c) => c.id === id);
  },

  async updateCandidateStatus(id: string, status: CandidateProfile['status']): Promise<CandidateProfile> {
    let updatedCandidate: CandidateProfile | null = null;
    const candidates = await this.getCandidates();
    
    const updatedList = candidates.map((c) => {
      if (c.id === id) {
        updatedCandidate = { ...c, status };
        return updatedCandidate;
      }
      return c;
    });

    if (!updatedCandidate) {
      throw new Error('Candidate not found');
    }

    setCachedData(CANDIDATES_KEY, updatedList);
    return updatedCandidate;
  },

  // INTERVIEWS ENDPOINTS
  async getInterviews(): Promise<InterviewEvent[]> {
    return getCachedData<InterviewEvent[]>(INTERVIEWS_KEY, initialInterviews);
  },

  async scheduleInterview(candidateId: string, candidateName: string, jobTitle: string, date: string, time: string, stage: InterviewEvent['stage']): Promise<InterviewEvent> {
    const newInterview: InterviewEvent = {
      id: `int-${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      candidateName,
      jobTitle,
      date,
      time,
      stage,
      status: 'Confirmed',
    };

    const list = await this.getInterviews();
    const updated = [newInterview, ...list];
    setCachedData(INTERVIEWS_KEY, updated);
    
    // Also update candidate status to 'Interview'
    await this.updateCandidateStatus(candidateId, 'Interview');
    return newInterview;
  },

  // ANALYTICS ENDPOINTS
  async getAnalytics(): Promise<typeof mockAnalytics> {
    return mockAnalytics;
  },
};
