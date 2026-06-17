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

export const initialJobs: JobPost[] = [
  {
    id: 'job-1',
    title: 'Senior React Architect',
    department: 'Engineering',
    location: 'Remote, US',
    description: 'We are seeking a Lead Frontend Architect to design core reusable modules, manage design tokens, and enforce layout parameters across enterprise components.',
    requirements: ['5+ years writing production-grade React codebases', 'Expert knowledge of TypeScript and bundler configs', 'Proven experience with CSS performance metrics'],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'System Design'],
    status: 'published',
    optimizationScore: 92,
    healthScore: 88,
    completionPercentage: 100,
    missingSkills: [],
    salaryMin: 140000,
    salaryMax: 180000,
    applicationsCount: 4,
    created_at: '2026-06-10T10:00:00Z',
  },
  {
    id: 'job-2',
    title: 'Lead Machine Learning Engineer',
    department: 'AI Core',
    location: 'San Francisco, CA (Hybrid)',
    description: 'Join the intelligence squad deploying large transformer modules, embedding vector coordinates, and tuning hyperparameter coefficients.',
    requirements: ['MS/PhD in Computer Science or similar algorithmic focus', 'Deep understanding of PyTorch or JAX framework engines', 'Experience deploying containerized architectures'],
    skills: ['Python', 'PyTorch', 'Vector Databases', 'Transformers', 'Kubernetes', 'FastAPI'],
    status: 'published',
    optimizationScore: 82,
    healthScore: 75,
    completionPercentage: 85,
    missingSkills: ['Kubernetes', 'FastAPI'],
    salaryMin: 180000,
    salaryMax: 220000,
    applicationsCount: 3,
    created_at: '2026-06-12T10:00:00Z',
  },
  {
    id: 'job-3',
    title: 'Security Operations Lead',
    department: 'Infrastructure',
    location: 'Remote, Europe',
    description: 'Deploy real-time vulnerability detection checkers, audit database credentials access logs, and fortify enterprise gateway boundaries.',
    requirements: ['Expert knowledge of zero-trust network modules', 'Experience auditing cloud databases and Supabase policies', 'Background handling credential encryption keys'],
    skills: ['Rust', 'Go', 'Cloud Security', 'Kubernetes', 'Supabase', 'Zero Trust'],
    status: 'published',
    optimizationScore: 96,
    healthScore: 92,
    completionPercentage: 100,
    missingSkills: [],
    salaryMin: 130000,
    salaryMax: 160000,
    applicationsCount: 2,
    created_at: '2026-06-14T10:00:00Z',
  },
];

export const initialCandidates: CandidateProfile[] = [
  {
    id: 'candidate-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    jobId: 'job-1',
    jobTitle: 'Senior React Architect',
    matchScore: 98,
    experienceYears: 6,
    education: 'BS in Computer Science, Georgia Tech',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'System Design'],
    status: 'Interview',
    technicalScore: 97,
    communicationScore: 95,
    resumeScore: 98,
    overallScore: 97.5,
    interviewScore: 94,
    rank: 1,
    previousRank: 2,
    screeningReport: {
      parsedSummary: 'Senior UI developer with expert architectural insights deploying design systems and micro-frontends.',
      strengths: [
        'Extensive production React 19 knowledge',
        'Expert-level TypeScript state modules design',
        'Strong component-driven performance track record',
      ],
      weaknesses: [
        'Minimal backend SQL schema experience',
      ],
      keywordMatch: 99,
      technicalFit: 98,
      experienceFit: 96,
      recommendation: 'Proceed To Technical Interview',
      confidence: 97,
      suggestions: [
        'Request vector design samples from their portfolio',
        'Verify experience handling large-scale bundler configurations',
      ],
    },
  },
  {
    id: 'candidate-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@yahoo.com',
    jobId: 'job-3',
    jobTitle: 'Security Operations Lead',
    matchScore: 97,
    experienceYears: 7,
    education: 'MS in Cybersecurity, Stanford University',
    skills: ['Rust', 'Go', 'Cloud Security', 'Kubernetes', 'Supabase', 'Zero Trust'],
    status: 'Shortlisted',
    technicalScore: 98,
    communicationScore: 89,
    resumeScore: 96,
    overallScore: 96.2,
    rank: 2,
    previousRank: 1,
    screeningReport: {
      parsedSummary: 'Systems security lead with deep experience orchestrating threat modeling networks and cryptographic keys.',
      strengths: [
        'Expertise writing low-level secure Rust packages',
        'Experience building enterprise zero-trust gateways',
        'Familiarity with Supabase Row Level Security configurations',
      ],
      weaknesses: [
        'Prefers low-level command tools over graphical analytics platforms',
      ],
      keywordMatch: 95,
      technicalFit: 99,
      experienceFit: 94,
      recommendation: 'Proceed To Final Panel',
      confidence: 95,
      suggestions: [
        'Evaluate depth of cloud containerization experience',
        'Review code contributions in secure open-source repos',
      ],
    },
  },
  {
    id: 'candidate-3',
    name: 'Rahul Sharma',
    email: 'rahul.dev@outlook.com',
    jobId: 'job-1',
    jobTitle: 'Senior React Architect',
    matchScore: 96,
    experienceYears: 5,
    education: 'B.Tech in CS, IIT Delhi',
    skills: ['React', 'Node.js', 'System Design', 'TypeScript', 'Tailwind CSS'],
    status: 'Screening',
    technicalScore: 96,
    communicationScore: 92,
    resumeScore: 95,
    overallScore: 95.8,
    rank: 3,
    previousRank: 3,
    screeningReport: {
      parsedSummary: 'Lead software engineer Candidate showing highly aligned React components and robust microservice APIs.',
      strengths: [
        'Deep React hook state configurations design',
        'Strong problem-solving algorithmic indices',
        'Excellent collaborator and system designer',
      ],
      weaknesses: [
        'Familiar with Tailwind CSS but has less custom CSS custom tokens knowledge',
      ],
      keywordMatch: 94,
      technicalFit: 96,
      experienceFit: 95,
      recommendation: 'Proceed To Technical Interview',
      confidence: 96,
      suggestions: [
        'Verify depth of client-side caching setups using TanStack Query',
      ],
    },
  },
];

export const initialInterviews: InterviewEvent[] = [
  {
    id: 'interview-1',
    candidateId: 'candidate-1',
    candidateName: 'Sarah Jenkins',
    jobTitle: 'Senior React Architect',
    date: 'Today',
    time: '2:00 PM',
    stage: 'Technical Review',
    status: 'Confirmed',
  },
  {
    id: 'interview-2',
    candidateId: 'candidate-3',
    candidateName: 'Rahul Sharma',
    jobTitle: 'Senior React Architect',
    date: 'Tomorrow',
    time: '11:00 AM',
    stage: 'HR Screening',
    status: 'Scheduled',
  },
];

export const mockAnalytics = {
  funnel: [
    { stage: 'Ingested', count: 1482, fill: '#7C6BFF' },
    { stage: 'AI Screened', count: 320, fill: '#4FFAF0' },
    { stage: 'Shortlisted', count: 45, fill: '#FF5EB5' },
    { stage: 'Interviewed', count: 18, fill: '#FFD166' },
    { stage: 'Offered', count: 4, fill: '#22C55E' },
  ],
  sources: [
    { name: 'GitHub Profiles', value: 35 },
    { name: 'LinkedIn Recruiter', value: 40 },
    { name: 'Careers Portal', value: 15 },
    { name: 'Referral Pipeline', value: 10 },
  ],
  metrics: {
    avgTime: '2 Days',
    timeSaved: '95%',
    screeningAccuracy: '99.2%',
    hiringConversion: '22%',
  },
};
