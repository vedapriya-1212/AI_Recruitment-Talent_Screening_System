import { 
  JobPost, 
  CandidateProfile, 
  InterviewEvent, 
  initialJobs, 
  initialCandidates, 
  initialInterviews, 
  mockAnalytics 
} from './mockData';

const getHeaders = () => {
  const token = localStorage.getItem('ats_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiClient = {
  // JOBS ENDPOINTS
  async getJobs(): Promise<JobPost[]> {
    try {
      const res = await fetch('/api/jobs', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch jobs from server');
      return await res.json();
    } catch (err) {
      console.warn('API getJobs failed. Falling back to local cache:', err);
      const stored = localStorage.getItem('ats_jobs');
      return stored ? JSON.parse(stored) : initialJobs;
    }
  },

  async getJob(id: string): Promise<JobPost | undefined> {
    try {
      const res = await fetch(`/api/jobs/${id}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch job');
      return await res.json();
    } catch (err) {
      console.warn(`API getJob for ${id} failed. Falling back to local cache:`, err);
      const jobs = await this.getJobs();
      return jobs.find((j) => j.id === id);
    }
  },

  async createJob(jobData: Omit<JobPost, 'id' | 'created_at' | 'applicationsCount'>): Promise<JobPost> {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(jobData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create job');
      }
      return await res.json();
    } catch (err) {
      console.warn('API createJob failed. Storing to local cache:', err);
      const newJob: JobPost = {
        ...jobData,
        id: `job-${Math.random().toString(36).substr(2, 9)}`,
        applicationsCount: 0,
        created_at: new Date().toISOString(),
      };
      const jobs = await this.getJobs();
      localStorage.setItem('ats_jobs', JSON.stringify([newJob, ...jobs]));
      return newJob;
    }
  },

  // CANDIDATES ENDPOINTS
  async getCandidates(jobId?: string): Promise<CandidateProfile[]> {
    try {
      const res = await fetch('/api/applications', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch candidates');
      const list: CandidateProfile[] = await res.json();
      return jobId ? list.filter((c) => c.jobId === jobId) : list;
    } catch (err) {
      console.warn('API getCandidates failed. Falling back to local cache:', err);
      const stored = localStorage.getItem('ats_candidates');
      const list: CandidateProfile[] = stored ? JSON.parse(stored) : initialCandidates;
      return jobId ? list.filter((c) => c.jobId === jobId) : list;
    }
  },

  async getCandidate(id: string): Promise<CandidateProfile | undefined> {
    const candidates = await this.getCandidates();
    return candidates.find((c) => c.id === id);
  },

  async updateCandidateStatus(id: string, status: CandidateProfile['status']): Promise<CandidateProfile> {
    try {
      let dbStatus: string = status;
      if (status === 'Interview') dbStatus = 'Interview Scheduled';
      if (status === 'Screening') dbStatus = 'Under Review';

      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: dbStatus })
      });
      if (!res.ok) throw new Error('Failed to update candidate status');
      
      const candidate = await this.getCandidate(id);
      if (!candidate) throw new Error('Candidate not found');
      return { ...candidate, status };
    } catch (err) {
      console.warn('API updateCandidateStatus failed. Writing to local cache:', err);
      const candidates = await this.getCandidates();
      let updatedCandidate: CandidateProfile | null = null;
      const updatedList = candidates.map((c) => {
        if (c.id === id) {
          updatedCandidate = { ...c, status };
          return updatedCandidate;
        }
        return c;
      });
      if (!updatedCandidate) throw new Error('Candidate not found');
      localStorage.setItem('ats_candidates', JSON.stringify(updatedList));
      return updatedCandidate;
    }
  },

  // INTERVIEWS ENDPOINTS
  async getInterviews(): Promise<InterviewEvent[]> {
    try {
      const res = await fetch('/api/interviews', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch interviews');
      return await res.json();
    } catch (err) {
      console.warn('API getInterviews failed. Falling back to local cache:', err);
      const stored = localStorage.getItem('ats_interviews');
      return stored ? JSON.parse(stored) : initialInterviews;
    }
  },

  async scheduleInterview(
    candidateId: string, 
    candidateName: string, 
    jobTitle: string, 
    date: string, 
    time: string, 
    stage: InterviewEvent['stage']
  ): Promise<InterviewEvent> {
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          candidateId,
          date: date === 'Today' ? new Date().toISOString().split('T')[0] : date,
          time,
          stage,
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to schedule interview');
      }
      return await res.json();
    } catch (err) {
      console.warn('API scheduleInterview failed. Saving to local cache:', err);
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
      localStorage.setItem('ats_interviews', JSON.stringify([newInterview, ...list]));
      await this.updateCandidateStatus(candidateId, 'Interview');
      return newInterview;
    }
  },

  // ANALYTICS ENDPOINTS
  async getAnalytics(): Promise<typeof mockAnalytics> {
    try {
      const res = await fetch('/api/analytics', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch (err) {
      console.warn('API getAnalytics failed. Returning static mocks:', err);
      return mockAnalytics;
    }
  },

  async applyForJob(jobId: string): Promise<any> {
    try {
      const res = await fetch(`/api/applications/${jobId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to apply for job');
      }
      return await res.json();
    } catch (err) {
      console.warn('API applyForJob failed. Writing to local cache:', err);
      const saved = localStorage.getItem('applied_jobs_list');
      const list = saved ? JSON.parse(saved) : [];
      if (!list.includes(jobId)) {
        list.push(jobId);
        localStorage.setItem('applied_jobs_list', JSON.stringify(list));
      }
      return { job_id: jobId, candidate_id: 'demo-candidate-uuid', status: 'Applied' };
    }
  },

  async getCandidateApplications(): Promise<any[]> {
    try {
      const res = await fetch('/api/applications/my', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch candidate applications');
      return await res.json();
    } catch (err) {
      console.warn('API getCandidateApplications failed. Falling back to local storage list:', err);
      const stored = localStorage.getItem('applied_jobs_list');
      let appliedIds: string[] = [];
      if (stored) {
        try {
          appliedIds = JSON.parse(stored);
        } catch {}
      }
      const allJobs = await this.getJobs();
      return appliedIds.map((jobId, idx) => {
        const job = allJobs.find((j) => j.id === jobId);
        return {
          id: `app-dynamic-${idx}`,
          jobId,
          jobTitle: job?.title || 'Custom Requirement',
          company: 'AI Recruitment Partner',
          appliedDate: new Date().toISOString().split('T')[0],
          status: 'Applied',
        };
      });
    }
  }
};
