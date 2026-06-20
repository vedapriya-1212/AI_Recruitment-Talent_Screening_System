-- AI Interview System Database Schema

-- 1. Interview Sessions (Core configuration and tracking)
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL, -- references auth.users
    candidate_id UUID NOT NULL, -- references auth.users
    job_id UUID NOT NULL, -- references jobs
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Scheduled, In Progress, Completed, Failed Verification
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INT DEFAULT 45,
    difficulty_level VARCHAR(20) DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Identity Verification (Pre-interview checks)
CREATE TABLE identity_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    document_url VARCHAR(255),
    live_selfie_url VARCHAR(255),
    face_match_score DECIMAL(5,2),
    liveness_status BOOLEAN DEFAULT false,
    verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Interview Questions (Bank and Dynamically generated)
CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    category VARCHAR(50), -- Technical, Behavioral, Situational, HR
    question_text TEXT NOT NULL,
    expected_keywords TEXT[],
    difficulty VARCHAR(20),
    order_index INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Interview Answers (Candidate responses)
CREATE TABLE interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES interview_questions(id) ON DELETE CASCADE,
    transcript TEXT,
    audio_url VARCHAR(255),
    video_url VARCHAR(255),
    technical_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    confidence_score DECIMAL(5,2),
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Coding Assessments (For technical roles)
CREATE TABLE coding_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    allowed_languages VARCHAR(50)[], -- ['Python', 'Java', 'JavaScript', 'C++']
    time_limit_minutes INT,
    test_cases JSONB, -- Array of { input, expected_output, is_hidden }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Coding Submissions (Candidate code)
CREATE TABLE coding_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES coding_assessments(id) ON DELETE CASCADE,
    language VARCHAR(50),
    code TEXT,
    execution_time DECIMAL(8,4),
    memory_used DECIMAL(8,4),
    passed_test_cases INT,
    total_test_cases INT,
    coding_score DECIMAL(5,2),
    ai_code_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Interview Recordings (Full session recording)
CREATE TABLE interview_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    full_video_url VARCHAR(255),
    full_audio_url VARCHAR(255),
    full_transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Violation Logs (Proctoring events)
CREATE TABLE violation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    violation_type VARCHAR(100), -- Tab Switched, Multiple Faces, No Face, Background Noise
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    severity VARCHAR(20), -- Low, Medium, High
    screenshot_url VARCHAR(255)
);

-- 9. Interview Reports (Final AI generation)
CREATE TABLE interview_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    hr_score DECIMAL(5,2),
    coding_score DECIMAL(5,2),
    integrity_score DECIMAL(5,2),
    ai_summary TEXT,
    recommendation VARCHAR(50), -- Strongly Recommend, Recommend, Consider, Reject
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Candidate Rankings (Overall leaderboard logic view/table)
CREATE TABLE candidate_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL,
    job_id UUID NOT NULL,
    resume_score DECIMAL(5,2),
    interview_score DECIMAL(5,2), -- Technical
    coding_score DECIMAL(5,2),
    hr_score DECIMAL(5,2),
    integrity_score DECIMAL(5,2),
    final_ranking_score DECIMAL(5,2), -- Calculated field (30% Resume + 40% Tech + 15% Coding + 10% HR + 5% Integrity)
    rank_position INT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
