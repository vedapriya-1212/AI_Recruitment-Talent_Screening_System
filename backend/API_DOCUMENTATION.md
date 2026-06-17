# AI Recruitment & Talent Screening System - API Documentation

The backend service is built using FastAPI, connecting to Supabase for data persistence and authentication. It includes a rule-based and NLP-based resume parsing service, an AI matching engine powered by semantic vector embeddings, and real-time WebSocket subscriptions.

## Getting Started

### 1. Prerequisites
- Python 3.9 or higher
- Pip (Python Package Installer)

### 2. Setup Environment Variables
Create a `.env` file in the `backend/` directory using the provided template:
```bash
cp .env.example .env
```
Fill in the configuration details:
```env
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_KEY="your-supabase-key"
JWT_SECRET="your-jwt-secret-key-here"
```

### 3. Install Dependencies
Run pip install from the `backend/` directory:
```bash
pip install -r requirements.txt
```
*(Note: spaCy NLP models and SentenceTransformer model weights will automatically be downloaded and cached locally on the first run).*

### 4. Running the Development Server
Start the server using `uvicorn`:
```bash
python app.py
# Or:
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
The server will run on [http://localhost:8000](http://localhost:8000). Interactive Swagger API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## API Reference

### 1. Authentication Endpoints

#### `POST /register`
Registers a new user candidate.
- **Request Body**:
  ```json
  {
    "first_name": "Sarah",
    "last_name": "Jenkins",
    "email": "sarah.jenkins@devmail.com",
    "password": "securedpassword123",
    "role": "candidate"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful"
  }
  ```

#### `POST /login`
Authenticates a user and returns a Bearer access token.
- **Request Body**:
  ```json
  {
    "email": "sarah.jenkins@devmail.com",
    "password": "securedpassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "role": "candidate"
  }
  ```

---

### 2. Candidate Dashboard

#### `GET /dashboard`
Retrieves aggregated metrics for the candidate.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "total_applications": 12,
    "shortlisted": 4,
    "interviews": 2,
    "highest_match_score": 96,
    "current_rank": 3
  }
  ```

---

### 3. Jobs Management

#### `GET /jobs`
Lists available active jobs with optional filtering and pagination.
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search` (string, optional)
  - `location` (string, optional)
  - `job_type` (string, optional)
  - `experience_level` (string, optional)
  - `page` (int, default=1)
  - `limit` (int, default=10)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "19563c98-4ebf-41bb-8632-39072e4ddce6",
      "title": "Senior Software Engineer",
      "department": "Engineering",
      "location": "Remote (India)",
      "description": "We are seeking...",
      "requirements": ["5+ years experience", "Expert in React"],
      "skills": ["React", "Node.js"],
      "status": "published",
      "optimizationScore": 92,
      "healthScore": 88,
      "completionPercentage": 100,
      "missingSkills": [],
      "salaryMin": 120000,
      "salaryMax": 150000,
      "applicationsCount": 4,
      "created_at": "2026-06-17T09:43:38"
    }
  ]
  ```

#### `GET /jobs/{job_id}`
Retrieves full details of a specific job.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  *(Same object model as job element above).*

#### `POST /jobs/apply`
Applies for a job. Automatically triggers background AI screening.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "job_id": "19563c98-4ebf-41bb-8632-39072e4ddce6"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "application_id": "416c29d3-84f8-49de-a2b9-1371aeb4d796",
    "message": "Application submitted successfully"
  }
  ```

---

### 4. Resume & Ingestion

#### `POST /resume/upload`
Uploads a resume PDF. Triggers background NLP parsing.
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data**:
  - `file`: (Select PDF File)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Resume uploaded successfully. Processing coordinates in real-time.",
    "file_name": "resume.pdf",
    "file_url": "/uploads/resumes/7e9f8939-04ac-4293-b58e-82a9cd8c4f4c_resume.pdf"
  }
  ```

#### `GET /resume/details`
Retrieves parsed profile attributes.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "name": "Sarah Jenkins",
    "email": "sarah.jenkins@devmail.com",
    "skills": ["React", "TypeScript", "Vite"],
    "education": [
      {
        "institution": "Georgia Tech",
        "degree": "BS in Computer Science",
        "field_of_study": "Computer Science",
        "start_date": "2018",
        "end_date": "2022"
      }
    ],
    "experience": [
      {
        "company": "Vercel",
        "title": "Software Engineer",
        "location": "Remote",
        "start_date": "2022-06",
        "end_date": null,
        "is_current": true,
        "description": "Building UI frameworks..."
      }
    ],
    "projects": [
      {
        "title": "Core Components Library",
        "description": "Created modular React systems.",
        "technologies": "React, Vite",
        "project_url": "https://example.com",
        "github_url": "https://github.com/example"
      }
    ]
  }
  ```

---

### 5. AI Match & Placement Ranking

#### `GET /match-score/{job_id}`
Retrieves semantic match scores compared against a job posting.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "skills_score": 92.0,
    "experience_score": 88.0,
    "education_score": 90.0,
    "overall_score": 91.0,
    "recommendation": "Strong Candidate Match"
  }
  ```

#### `GET /ranking/{job_id}`
Retrieves applicant leaderboard rank and percentile.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "rank": 5,
    "total_candidates": 120,
    "percentile": 95.0
  }
  ```

---

### 6. Application Tracker & Pipeline

#### `GET /applications`
Retrieves the candidate's active application records and statuses.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "416c29d3-84f8-49de-a2b9-1371aeb4d796",
      "job_id": "19563c98-4ebf-41bb-8632-39072e4ddce6",
      "job_title": "Senior Software Engineer",
      "company": "NeuroLogic Inc.",
      "location": "Remote (India)",
      "resume_url": "/uploads/resumes/resume.pdf",
      "status": "Applied",
      "applied_at": "2026-06-17T09:48:34"
    }
  ]
  ```

---

### 7. Notifications

#### `GET /notifications`
Retrieves candidate notifications.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "4b032548-6987-4604-adfc-bb79ae30dbbe",
      "title": "Application Submitted Successfully",
      "message": "Your application for Senior Software Engineer has been received.",
      "type": "application_status",
      "is_read": true,
      "created_at": "2026-06-17T09:48:34"
    }
  ]
  ```

#### `PATCH /notifications/{id}/read`
Updates read status.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "is_read": true
  }
  ```
- **Response (200 OK)**:
  *(Returns updated notification object).*

#### `DELETE /notifications/{id}`
Dismisses a notification.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `204 No Content`

---

### 8. Interview Scheduler

#### `GET /interviews`
Lists scheduled panels and meetings for the candidate.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "48e208b3-4e69-4d7f-abbb-1169fe06171e",
      "candidateId": "7e9f8939-04ac-4293-b58e-82a9cd8c4f4c",
      "candidateName": "Sarah Jenkins",
      "jobTitle": "Senior Software Engineer",
      "date": "2026-06-18",
      "time": "02:00 PM",
      "stage": "Technical Review",
      "status": "Scheduled"
    }
  ]
  ```

---

### 9. Profile Management

#### `GET /profile`
Gets the candidate's complete profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "first_name": "Sarah",
    "last_name": "Jenkins",
    "email": "sarah.jenkins@devmail.com",
    "phone": "+1-555-0199",
    "summary": "Senior UI Architect...",
    "photo_url": null,
    "skills": ["React", "TypeScript"],
    "education": [],
    "experience": [],
    "projects": []
  }
  ```

#### `PUT /profile`
Updates profile components.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  *(Similar schema to GET profile. Properties are optional).*
- **Response (200 OK)**:
  *(Returns updated complete profile).*

---

### 10. WebSocket Endpoint

#### `WS /ws/candidate-dashboard`
Subscribes the candidate to real-time events.
- **Query Parameter**: `token` (Bearer JWT Token)
- **Supported Broadcast Event Types**:
  - `CONNECTED`: Initial setup confirmation.
  - `RESUME_UPLOADED`: Stream upload state change.
  - `RESUME_PARSED`: Dispatched when NLP text parse completes.
  - `AI_SCORE_GENERATED`: Fired when job match score computation completes.
  - `APPLICATION_UPDATED`: Dispatched when application stage updates.
  - `NOTIFICATION_CREATED`: Dispatched when a new alert notification is added.
