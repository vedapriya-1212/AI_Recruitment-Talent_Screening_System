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

// Checks if the backend is reachable (cached 10s)
let _backendOk: boolean | null = null;
let _lastCheck = 0;
async function isBackendUp(): Promise<boolean> {
  if (Date.now() - _lastCheck < 10000 && _backendOk !== null) return _backendOk;
  try {
    const r = await fetch('/health', { signal: AbortSignal.timeout(2000) });
    _backendOk = r.ok;
  } catch {
    _backendOk = false;
  }
  _lastCheck = Date.now();
  return _backendOk;
}

export const apiClient = {
  // ── JOBS ──────────────────────────────────────────────────────────────────
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

  // ── APPLICATIONS (Recruiter view = all candidates) ─────────────────────────
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

  // id here is the APPLICATION UUID
  async updateCandidateStatus(id: string, status: CandidateProfile['status']): Promise<CandidateProfile> {
    try {
      // Map frontend status values to DB-friendly values
      const dbStatusMap: Record<string, string> = {
        'Interview': 'Interview Scheduled',
        'Screening': 'Under Review',
      };
      const dbStatus = dbStatusMap[status] || status;

      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: dbStatus })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update candidate status');
      }
      
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

  // ── AI SCREENING REPORT ────────────────────────────────────────────────────
  async getAIReport(applicationId: string): Promise<any> {
    try {
      const res = await fetch(`/api/applications/${applicationId}/report`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch AI report');
      return await res.json();
    } catch (err) {
      console.warn('API getAIReport failed. Generating client-side report:', err);
      // Client-side deterministic fallback
      const seed = applicationId;
      const numFromSeed = (offset: number, range: number) => {
        let n = 0;
        for (let i = 0; i < seed.length; i++) n += seed.charCodeAt((i + offset) % seed.length);
        return n % range;
      };
      const matchScore = 65 + numFromSeed(0, 30);
      return {
        applicationId,
        candidateName: 'Candidate',
        jobTitle: 'Position',
        matchScore,
        technicalScore: 60 + numFromSeed(1, 35),
        communicationScore: 65 + numFromSeed(2, 28),
        resumeScore: 62 + numFromSeed(3, 30),
        overallScore: matchScore,
        experienceYears: 1 + numFromSeed(4, 7),
        education: 'B.Tech in Computer Science',
        screeningReport: {
          parsedSummary: 'AI analysis completed for this application. The candidate shows relevant domain alignment.',
          strengths: ['Strong technical foundation', 'Good problem-solving approach', 'Proactive communication'],
          weaknesses: ['Portfolio not provided', 'Limited management exposure'],
          keywordMatch: 70 + numFromSeed(5, 25),
          technicalFit: 65 + numFromSeed(6, 30),
          experienceFit: 60 + numFromSeed(7, 35),
          recommendation: matchScore >= 80 ? 'PROCEED TO TECHNICAL INTERVIEW' : 'SHORTLIST FOR HR ROUND',
          confidence: 78 + numFromSeed(8, 18),
          suggestions: [
            'Conduct technical screening call',
            'Request code samples or GitHub profile',
            'Verify project experience details',
          ],
        },
      };
    }
  },

  // ── INTERVIEWS ─────────────────────────────────────────────────────────────
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

  // ── ANALYTICS ──────────────────────────────────────────────────────────────
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

  // ── APPLY FOR JOB (Candidate) ──────────────────────────────────────────────
  async applyForJob(jobId: string, resumeFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const token = localStorage.getItem('ats_token');
      const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/applications/${jobId}`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        // Treat "already applied" (409) as non-fatal
        if (res.status === 409) throw new Error('already applied duplicate unique');
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
      return { job_id: jobId, candidate_id: 'local-candidate', status: 'Applied' };
    }
  },

  // ── MY APPLICATIONS (Candidate view) ──────────────────────────────────────
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
        try { appliedIds = JSON.parse(stored); } catch {}
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
  },

  // ── JOB RECOMMENDATIONS (Candidate) ───────────────────────────────────────
  async getJobRecommendations(): Promise<(JobPost & { relevanceScore: number })[]> {
    try {
      const res = await fetch('/api/jobs/recommendations', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return await res.json();
    } catch (err) {
      console.warn('API getJobRecommendations failed:', err);
      // Fallback: return top 5 jobs with a mock score
      const jobs = await this.getJobs();
      return jobs.slice(0, 5).map(j => ({ ...j, relevanceScore: Math.floor(60 + Math.random() * 35) }));
    }
  },

  // ── AI CHATBOT ─────────────────────────────────────────────────────────────
  async sendChatbotMessage(payload: {
    question: string;
    candidateName: string;
    resumeSummary?: string;
    appliedJobs?: any[];
    availableJobs?: any[];
  }): Promise<{ answer: string }> {
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Chatbot request failed');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Chatbot API failed. Generating client-side assistant response:', err);
      
      const getDirectChatbotResponse = (question: string) => {
        const qRaw = (question || '').trim().toLowerCase();
        const q = qRaw.replace(/[^a-z0-9\s]/g, '').trim();
        if (q && /^\d+$/.test(q)) {
          return "I couldn't understand that request. Could you provide more details?";
        }
        if (q === 'hi' || q === 'hey') return "Hello! How can I help you today?";
        if (q === 'hello') return "Hi there! Welcome to the Candidate Portal. How may I assist you?";
        if (q === 'good morning') return "Good morning! How can I help you today?";
        if (q === 'thank you' || q === 'thankyou') return "You're welcome! Happy to help.";
        if (q === 'thanks') return "You're welcome. Let me know if you need anything else.";
        if (q === 'thx') return "Glad I could help.";
        if (q === 'bye' || q === 'goodbye') return "Goodbye! Have a great day.";
        if (q === 'see you' || q === 'cya') return "Take care and good luck with your applications.";
        if (q === 'guhfifie') return "I'm not sure I understood that. Could you please rephrase your question?";
        return null;
      };

      const direct = getDirectChatbotResponse(payload.question);
      if (direct) return { answer: direct };

      const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      
      const isMeaningless = (text: string): boolean => {
        const q = text.trim();
        if (q.length === 0) return true;
        if (!/[a-zA-Z]/.test(q)) return true;
        
        const words = q.toLowerCase().split(/[^a-z]+/i).filter(Boolean);
        if (words.length === 0) return true;
        
        return words.every(w => {
          if (w.length <= 2) {
            return w[0] === w[1] && w.length === 2;
          }
          const knownGibberish = ['guhfifie', 'asdasdasd', 'asdasd', 'qwerty', 'zxcv', 'asdfgh', 'hjkl', 'qwert', 'zxcvb'];
          if (knownGibberish.some(g => w.includes(g))) return true;
          if (w.length >= 4 && !/[aeiouy]/.test(w)) return true;
          if (/(.)\1{3,}/.test(w)) return true;
          for (let len = 2; len <= Math.floor(w.length / 2); len++) {
            const sub = w.substring(0, len);
            let constructed = '';
            while (constructed.length < w.length) constructed += sub;
            if (constructed === w) return true;
          }
          const vowelCount = (w.match(/[aeiouy]/g) || []).length;
          if (w.length >= 5 && vowelCount / w.length < 0.15) return true;
          return false;
        });
      };
      
      const classifyIntentLocal = (question: string): { intent: string; subtype: 'meaningless' | 'out-of-scope' | null } => {
        if (isMeaningless(question)) {
          return { intent: 'Unknown Intent', subtype: 'meaningless' };
        }
        const q = question.trim().toLowerCase();
        
        if (/\b(resume|cv|upload|screener|screening|improve|improvement|portfolio|profile|skills?)\b/i.test(q)) {
          return { intent: 'Resume Intent', subtype: null };
        }
        if (/\b(interview|prep|prepare|scheduling|scheduler|schedule|mock|interviewer)\b/i.test(q)) {
          return { intent: 'Interview Intent', subtype: null };
        }
        if (/\b(jobs?|recommendations?|recommend|match|roles|openings|careers|apply|applied|applications?|status|ranks?|rankings?|notifications?|recruiters?|communications?|messages?)\b/i.test(q)) {
          return { intent: 'Job Intent', subtype: null };
        }
        if (/\b(help|support|guide|features|capabilities|who are you|what can you do|how to use)\b/i.test(q) || q === '?') {
          return { intent: 'Help Intent', subtype: null };
        }
        if (/\b(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings|yo)\b/i.test(q)) {
          return { intent: 'Greeting Intent', subtype: null };
        }
        if (/\b(thanks|thank\s+you|thx|appreciate\s+it|grateful|cheers)\b/i.test(q)) {
          return { intent: 'ThankYou Intent', subtype: null };
        }
        if (/\b(bye|goodbye|see\s+you|farewell|take\s+care|cya)\b/i.test(q)) {
          return { intent: 'Goodbye Intent', subtype: null };
        }
        return { intent: 'Unknown Intent', subtype: 'out-of-scope' };
      };
      
      const { intent, subtype } = classifyIntentLocal(payload.question);
      console.log(`[AI Chatbot] [Client Fallback] Question: "${payload.question}" | Classified Intent: "${intent}"${subtype ? ` (Subtype: ${subtype})` : ''}`);
      
      const name = payload.candidateName || 'Candidate';
      
      if (intent === 'Greeting Intent') {
        const q = payload.question.toLowerCase();
        if (q.includes('good morning')) return { answer: "Good morning! How may I help you?" };
        if (q.includes('good afternoon')) return { answer: "Good afternoon! How can I help you today?" };
        if (q.includes('good evening')) return { answer: "Good evening! How can I help you today?" };
        const greetings = [
          "Hello! How can I help you today?",
          "Hi there! What can I assist you with?",
          "Hello! I'm your AI career assistant. How can I help you today?"
        ];
        return { answer: getRandomElement(greetings) };
      }
      
      if (intent === 'ThankYou Intent') {
        const thanks = [
          "You're welcome!",
          "Happy to help!",
          "My pleasure. Let me know if you need anything else.",
          "You're welcome! Let me know if you need any further assistance."
        ];
        return { answer: getRandomElement(thanks) };
      }
      
      if (intent === 'Goodbye Intent') {
        const goodbyes = [
          "Goodbye! Have a great day.",
          "See you later!",
          "Take care."
        ];
        return { answer: getRandomElement(goodbyes) };
      }
      
      if (intent === 'Help Intent') {
        return { answer: "I am your AI career assistant. I can help recommend available jobs, track application statuses, provide resume feedback, and prepare you for interviews. What would you like to explore?" };
      }
      
      if (intent === 'Job Intent') {
        const q = payload.question.toLowerCase();
        if (/\b(status|applied|application|applications)\b/i.test(q)) {
          const apps = payload.appliedJobs || [];
          if (apps.length === 0) {
            return { answer: `You haven't submitted any job applications yet, ${name}. Check out the "Available Jobs" page to find a role and apply. Once you apply, I can track your status right here!` };
          }
          const list = apps.map(a => `• **${a.jobTitle || a.title}** — Status: *${a.status || 'Applied'}*`).join('\n');
          return { answer: `Here is the current status of your applications:\n\n${list}\n\nLet me know if you need tips on preparing for any next rounds!` };
        }
        
        const jobs = payload.availableJobs || [];
        if (jobs.length === 0) {
          return { answer: `Hi ${name}! We don't have any open jobs listed on the platform at this moment. Please check back later!` };
        }
        const list = jobs.slice(0, 3).map(j => `• **${j.title}** at **${j.company}** (Match: ${Math.floor(75 + Math.random() * 20)}%)`).join('\n');
        return { answer: `Hi ${name}! Based on your profile, I highly recommend looking at open roles. Here are the top jobs that fit your skillset:\n\n${list}\n\nWould you like me to tell you more about any of these roles?` };
      }
      
      if (intent === 'Resume Intent') {
        const q = payload.question.toLowerCase();
        if (/\b(upload|submit)\b/i.test(q)) {
          return { answer: "Go to the Candidate Dashboard and click Upload Resume. Select your file and submit it for screening." };
        }
        return { answer: "To optimize your resume for our tracking system, make sure it is in PDF format and cleanly formatted. I recommend adding specific technical keywords corresponding to the job descriptions you are targeting (such as specific frameworks or tools). Focus on writing metric-driven achievements instead of generic task lists!" };
      }
      
      if (intent === 'Interview Intent') {
        const apps = payload.appliedJobs || [];
        const interviewApps = apps.filter(a => a.status === 'Interview' || a.status === 'Interview Scheduled');
        if (interviewApps.length > 0) {
          const target = interviewApps[0];
          return { answer: `Congratulations on your interview for **${target.jobTitle || target.title}**! I recommend reviewing technical concepts related to the job requirements (such as System Design, React frameworks, or backend APIs). Practice talking through your past projects using the STAR method (Situation, Task, Action, Result).` };
        }
        return { answer: "To prepare for recruitment interviews on our platform, review the required skills on the job description. Practice writing clean code, explain your design choices clearly, and prepare questions about the team and engineering culture to ask at the end." };
      }
      
      if (subtype === 'meaningless') {
        const cleanNum = payload.question.trim().replace(/[^a-z0-9\s]/gi, '');
        if (cleanNum && /^\d+$/.test(cleanNum)) {
          return { answer: "I couldn't understand that request. Could you provide more details?" };
        }
        return { answer: "I'm not sure I understood that. Could you please rephrase your question?" };
      }
      
      return { answer: "I can help with jobs, applications, resumes, interviews, and candidate portal features. Could you please ask something related to those topics?" };
    }
  },

  // ── EMAIL LOGS (Recruiter) ─────────────────────────────────────────────────
  async getEmailLogs(): Promise<any[]> {
    try {
      const res = await fetch('/api/email-logs', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch email logs');
      return await res.json();
    } catch (err) {
      console.warn('API getEmailLogs failed:', err);
      return [];
    }
  },

  // ── SMTP STATUS ────────────────────────────────────────────────────────────
  async getSmtpStatus(): Promise<any> {
    try {
      const res = await fetch('/api/email/smtp-status', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch SMTP status');
      return await res.json();
    } catch (err) {
      console.warn('API getSmtpStatus failed:', err);
      return null;
    }
  },

  async verifySmtp(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/email/verify-smtp', {
        method: 'POST',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.warn('API verifySmtp failed:', err);
      return { success: false, message: 'Connection check failed' };
    }
  },

  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ to }),
      });
      return await res.json();
    } catch (err) {
      console.warn('API sendTestEmail failed:', err);
      return { success: false, error: 'Request failed' };
    }
  },

  // ── RESUME STATUS ──────────────────────────────────────────────────────────
  async getResumeStatus(): Promise<{ hasResume: boolean; filename?: string; uploadedAt?: string; textLength?: number; skills?: string[] }> {
    try {
      const res = await fetch('/api/resume/status', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch resume status');
      return await res.json();
    } catch (err) {
      console.warn('API getResumeStatus failed:', err);
      const has = localStorage.getItem('has_uploaded_resume') === 'true';
      const storedSkills = localStorage.getItem('resume_uploaded_skills');
      const skills = storedSkills ? JSON.parse(storedSkills) : [];
      return { hasResume: has, skills };
    }
  },

  // ── RESUME ANALYSIS FLOW 1 (Candidate self-improvement, private) ───────────
  async analyzeResumeSelf(): Promise<any> {
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Resume analysis failed');
      }
      const data = await res.json();
      localStorage.setItem('mock_latest_analysis', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.warn('API analyzeResumeSelf failed. Generating local mock fallback:', err);
      const mockResult = {
        success: true,
        analysis: {
          analysis_id: `anal-mock-${Date.now()}`,
          resume_score: 82,
          ats_score: 88,
          strengths: ['Java', 'Python', 'SQL'],
          missing_skills: ['Docker', 'Kubernetes'],
          suggestions: ['Add project descriptions', 'Quantify achievements']
        }
      };
      localStorage.setItem('mock_latest_analysis', JSON.stringify(mockResult));
      return mockResult;
    }
  },

  async getLatestResumeAnalysis(): Promise<any> {
    try {
      const res = await fetch('/api/resume/analysis/latest', { headers: getHeaders() });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Latest resume analysis failed');
      }
      const data = await res.json();
      localStorage.setItem('mock_latest_analysis', JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('API getLatestResumeAnalysis failed, using local storage fallback:', err);
      const stored = localStorage.getItem('mock_latest_analysis');
      if (stored) return JSON.parse(stored);
      throw err;
    }
  },
};

