export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'recruiter';
}

export interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  status: 'published' | 'draft';
  optimizationScore: number;
  healthScore: number;
  completionPercentage: number;
  missingSkills: string[];
  salaryMin: number;
  salaryMax: number;
  applicationsCount: number;
  created_at: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  matchScore: number;
  experienceYears: number;
  education: string;
  skills: string[];
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  avatar?: string;
  technicalScore: number;
  communicationScore: number;
  resumeScore: number;
  overallScore: number;
  interviewScore?: number;
  rank: number;
  previousRank?: number;
  screeningReport: {
    parsedSummary: string;
    strengths: string[];
    weaknesses: string[];
    keywordMatch: number;
    technicalFit: number;
    experienceFit: number;
    recommendation: 'Proceed To Technical Interview' | 'Proceed To Final Panel' | 'Keep on File' | 'Reject';
    confidence: number;
    suggestions: string[];
  };
}

export interface InterviewEvent {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  stage: 'HR Screening' | 'Technical Review' | 'Final Panel';
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
}
