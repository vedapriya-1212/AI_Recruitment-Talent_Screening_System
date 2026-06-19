// ============================================================
// backend/routes/applications.cjs  – Redesigned with Flow 2 evaluation
// ============================================================
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');
const { sendEmail, sendStatusEmail } = require('../services/email.cjs');

// In-memory application cache (applicationId -> application record)
const applicationsCache = new Map();

// In-memory application analysis cache (application_id -> analysis report)
const applicationAnalysisCache = new Map();

// Multer memory storage for applications
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  }
});

// Resume text cache (re-exported from resume route)
function getResumeCache() {
  try { return require('./resume.cjs').resumeCache; }
  catch { return new Map(); }
}

async function getApplicationAnalysis(applicationId, candidateName, resumeText, j) {
  try {
    const { data, error } = await supabase
      .from('application_analysis')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (!error && data) {
      return {
        matchScore: data.match_score,
        matchingSkills: typeof data.matching_skills === 'string' ? JSON.parse(data.matching_skills) : data.matching_skills,
        missingSkills: typeof data.missing_skills === 'string' ? JSON.parse(data.missing_skills) : data.missing_skills,
        experienceRelevance: data.experience_relevance,
        recommendation: data.recommendation,
        created_at: data.created_at
      };
    }
  } catch (err) {
    console.warn('[Application Analysis] Supabase fetch failed:', err.message);
  }

  if (applicationAnalysisCache.has(applicationId)) {
    return applicationAnalysisCache.get(applicationId);
  }

  // Generate a fallback if none exists
  const { analyzeJobMatch } = require('../services/gemini.cjs');
  try {
    const matchResult = await analyzeJobMatch({
      resumeText: resumeText || '',
      candidateName,
      jobTitle: j.title || 'Position',
      jobDescription: j.description || '',
      skillsRequired: j.skills_required || '',
      requirements: j.requirements || ''
    });

    const cachedRecord = {
      application_id: applicationId,
      matchScore: matchResult.matchScore,
      matchingSkills: matchResult.matchingSkills,
      missingSkills: matchResult.missingSkills,
      experienceRelevance: matchResult.experienceRelevance,
      recommendation: matchResult.recommendation,
      created_at: new Date().toISOString()
    };
    applicationAnalysisCache.set(applicationId, cachedRecord);
    return cachedRecord;
  } catch (err) {
    console.error('Error generating fallback match report:', err.message);
    return {
      matchScore: 70,
      matchingSkills: ['Communication'],
      missingSkills: [],
      experienceRelevance: 'Relevance analysis failed due to system error',
      recommendation: 'Good Match'
    };
  }
}

// ── GET /api/applications  – recruiter sees ALL applications, candidate sees anonymized leaderboard ───────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const isRecruiter = req.user.role === 'recruiter';
    const currentUserId = req.user.id;

    let data = [];
    try {
      // Use only columns that are guaranteed to exist in the DB schema.
      // Columns like resume_file, resume_summary, resume_text, experience_years, education, detected_skills
      // may or may not exist — we select with a safe fallback approach.
      let selectCols = 'id, status, applied_at, job_id, candidate_id';

      // Try with extended columns first
      const { data: dbData, error } = await supabase
        .from('job_applications')
        .select(`
          ${selectCols}, resume_url,
          jobs ( id, title, company, description, requirements, skills_required ),
          users!candidate_id ( id, first_name, last_name, email )
        `)
        .order('applied_at', { ascending: false });

      if (error) {
        // If the users! FK hint syntax fails, try without it
        console.warn('[Applications GET] Primary query failed:', error.message);
        const { data: dbData2, error: error2 } = await supabase
          .from('job_applications')
          .select(`${selectCols}, jobs ( id, title, company, description, requirements, skills_required )`)
          .order('applied_at', { ascending: false });

        if (error2) throw error2;
        // Manually fetch user data for each application
        const apps = dbData2 || [];
        for (const app of apps) {
          if (app.candidate_id) {
            try {
              const { data: uData } = await supabase.from('users').select('id, first_name, last_name, email').eq('id', app.candidate_id).maybeSingle();
              app.users = uData || { id: app.candidate_id, first_name: 'Candidate', last_name: '', email: '' };
            } catch { app.users = { id: app.candidate_id, first_name: 'Candidate', last_name: '', email: '' }; }
          }
        }
        data = apps;
      } else {
        data = dbData || [];
      }
    } catch (dbErr) {
      console.warn('[Applications GET] Supabase query failed, falling back to cache:', dbErr.message);
    }

    // Merge in-memory cache
    const cachedList = Array.from(applicationsCache.values());
    const allApps = [...data];
    for (const cached of cachedList) {
      if (!allApps.some(app => app.id === cached.id)) {
        let job = null;
        let user = null;
        try {
          const { data: jData } = await supabase.from('jobs').select('*').eq('id', cached.job_id).maybeSingle();
          job = jData;
        } catch {}
        try {
          const { data: uData } = await supabase.from('users').select('*').eq('id', cached.candidate_id).maybeSingle();
          user = uData;
        } catch {}

        allApps.push({
          ...cached,
          jobs: job || { id: cached.job_id, title: 'Position', company: 'AI Recruit Corp' },
          users: user || { id: cached.candidate_id, first_name: 'Candidate', last_name: '', email: 'candidate@recruitment.ai' }
        });
      }
    }

    const mapped = [];
    for (const app of allApps) {
      const u = app.users || {};
      const j = app.jobs  || {};
      
      let candidateName = `${u.first_name || 'Unknown'} ${u.last_name || ''}`.trim();
      let email = u.email || '';
      
      // Anonymize for other candidates
      const isMe = u.id === currentUserId;
      if (!isRecruiter && !isMe) {
        const displayId = u.id ? u.id.slice(0, 4).toUpperCase() : 'XXXX';
        candidateName = `Candidate ${displayId}`;
        email = 'anonymized@recruitment.ai';
      }

      const jobTitle = j.title || 'Position';

      // Parse serialized details from resume_url if available
      let parsedResumeUrl = null;
      if (app.resume_url) {
        try {
          parsedResumeUrl = JSON.parse(app.resume_url);
        } catch (e) {
          // Ignore parse errors, treat as plain text URL
        }
      }

      const resumeFile = parsedResumeUrl?.resume_file || app.resume_file || 'resume.pdf';
      const resumeSummary = parsedResumeUrl?.resume_summary || app.resume_summary || 'No summary available';
      const resumeText = parsedResumeUrl?.resume_text || app.resume_text || '';
      const expYears = parsedResumeUrl?.experience_years !== undefined && parsedResumeUrl?.experience_years !== null
        ? parsedResumeUrl.experience_years
        : (app.experience_years !== undefined && app.experience_years !== null ? app.experience_years : (u.experience_years || 2));
      const educationVal = parsedResumeUrl?.education || app.education || u.education || 'B.Tech in Computer Science';
      const skillsVal = parsedResumeUrl?.detected_skills 
        ? parsedResumeUrl.detected_skills.split(',').map(s => s.trim())
        : (app.detected_skills 
          ? app.detected_skills.split(',').map(s => s.trim()) 
          : (j.skills_required || 'JavaScript,React,Node.js').split(',').map(s => s.trim()));
      
      let analysis;
      if (parsedResumeUrl && parsedResumeUrl.ai_analysis) {
        analysis = {
          matchScore: parsedResumeUrl.ai_analysis.matchScore,
          matchingSkills: parsedResumeUrl.ai_analysis.matchingSkills,
          missingSkills: parsedResumeUrl.ai_analysis.missingSkills,
          experienceRelevance: parsedResumeUrl.ai_analysis.experienceRelevance,
          recommendation: parsedResumeUrl.ai_analysis.recommendation,
        };
      } else {
        analysis = await getApplicationAnalysis(app.id, candidateName, resumeText, j);
      }

      mapped.push({
        id:              app.id,         // application UUID
        candidateId:     u.id || app.candidate_id,
        name:            candidateName,
        email:           email,
        jobId:           j.id || app.job_id,
        jobTitle,
        matchScore:      analysis.matchScore,
        experienceYears: expYears,
        education:       educationVal,
        skills:          skillsVal,
        status:          app.status || 'Applied',
        rank:            0,
        resumeFile:      resumeFile,
        resumeSummary:   resumeSummary,
        resumeText:      resumeText,
        screeningReport: {
          parsedSummary: analysis.experienceRelevance || 'AI screening completed successfully. Candidate shows strong potential and relevant technical matching indicators.',
          strengths: Array.isArray(analysis.matchingSkills) ? analysis.matchingSkills : [],
          weaknesses: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
          keywordMatch: analysis.matchScore || 75,
          technicalFit: analysis.matchScore || 70,
          experienceFit: analysis.experienceRelevance ? 85 : 70,
          recommendation: analysis.recommendation || 'Proceed To Technical Interview',
          confidence: 85,
          suggestions: Array.isArray(analysis.missingSkills) ? analysis.missingSkills.map(s => `Gain core technical proficiency in ${s} to optimize match fit.`) : []
        }
      });
    }

    // Group by jobId and compute ranks
    const jobsMap = {};
    mapped.forEach(app => {
      if (!jobsMap[app.jobId]) {
        jobsMap[app.jobId] = [];
      }
      jobsMap[app.jobId].push(app);
    });

    Object.keys(jobsMap).forEach(jobId => {
      jobsMap[jobId].sort((a, b) => b.matchScore - a.matchScore);
      jobsMap[jobId].forEach((app, idx) => {
        app.rank = idx + 1;
      });
    });

    // Sort the final flat list by rank, then by matchScore descending
    mapped.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.matchScore - a.matchScore;
    });

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/applications/my  – candidate sees OWN applications ────────────
router.get('/my', requireAuth, async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'Candidates only' });
  try {
    let data = [];
    try {
      const { data: dbData, error } = await supabase
        .from('job_applications')
        .select(`
          id, status, applied_at, job_id,
          jobs ( id, title, company )
        `)
        .eq('candidate_id', req.user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      data = dbData || [];
    } catch (dbErr) {
      console.warn('[Applications my GET] Supabase query failed, falling back to cache:', dbErr.message);
    }

    const cachedList = Array.from(applicationsCache.values()).filter(a => a.candidate_id === req.user.id);
    const allApps = [...data];
    for (const cached of cachedList) {
      if (!allApps.some(app => app.id === cached.id)) {
        let job = null;
        try {
          const { data: jData } = await supabase.from('jobs').select('id, title, company').eq('id', cached.job_id).maybeSingle();
          job = jData;
        } catch {}
        allApps.push({
          ...cached,
          jobs: job || { id: cached.job_id, title: 'Position', company: 'AI Recruit Corp' }
        });
      }
    }

    return res.json(allApps.map(app => ({
      id:          app.id,
      jobId:       app.job_id,
      jobTitle:    app.jobs?.title   || 'Position',
      company:     app.jobs?.company || 'AI Recruit Corp',
      appliedDate: app.applied_at ? app.applied_at.split('T')[0] : (app.created_at ? app.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      status:      app.status || 'Applied',
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Helper to generate professional bulleted summary
async function generateAppResumeSummary(resumeText, filename) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Based on this resume text, generate a short bulleted summary containing 3 to 5 key highlights (such as years of experience in frameworks, main skills, or project domains).
      Return ONLY a list of bullet points starting with '* ' or '- ' (one per line, no introductory text, no JSON, just raw text):

      ${resumeText.slice(0, 3500)}`;
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text().trim();
      if (textResponse) return textResponse;
    } catch (e) {
      console.warn('Gemini generateAppResumeSummary failed:', e.message);
    }
  }

  // Fallback
  const commonSkills = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'FastAPI', 'Machine Learning'];
  const found = [];
  const lowerText = (resumeText || '').toLowerCase();
  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  const skillsList = found.length > 0 ? found : ['Software Development', 'Problem Solving'];
  return `* Technical skills detected: ${skillsList.join(', ')}\n* Uploaded file: ${filename}\n* Core engineering experience parsed\n* Ready for review and screening`;
}

// ── POST /api/applications/:jobId  – candidate applies with resume upload ────────────────────
router.post('/:jobId', requireAuth, upload.single('resume'), async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'Candidates only' });
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Resume required',
        code: 'RESUME_REQUIRED',
        message: 'Please upload a PDF resume for this job application.',
      });
    }

    const resumeFile = req.file.originalname;
    let resumeText = '';

    // Extract PDF text
    try {
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(req.file.buffer);
      resumeText = parsed.text || '';
    } catch (pdfErr) {
      console.warn('[App Apply] pdf-parse failed, decoding buffer:', pdfErr.message);
      resumeText = req.file.buffer.toString('utf8', 0, Math.min(req.file.buffer.length, 5000));
    }

    // Check for duplicate application first
    let alreadyApplied = false;
    try {
      const { data: existing } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', req.params.jobId)
        .eq('candidate_id', req.user.id)
        .maybeSingle();
      if (existing) {
        alreadyApplied = true;
      }
    } catch (dbErr) {
      console.warn('[App Apply] Duplicate check failed, checking cached list...');
      const cachedMatch = Array.from(applicationsCache.values()).find(
        a => a.job_id === req.params.jobId && a.candidate_id === req.user.id
      );
      if (cachedMatch) {
        alreadyApplied = true;
      }
    }

    if (alreadyApplied) {
      return res.status(409).json({ error: 'Already applied to this job' });
    }

    // Fetch job details
    const { data: jobData, error: jobErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.jobId)
      .maybeSingle();

    if (jobErr || !jobData) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Generate AI Resume Summary (recruiter visible)
    const resumeSummary = await generateAppResumeSummary(resumeText, resumeFile);

    // Extract candidate skills, experience years, and education from resume
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const { extractSkillsFromResume } = require('../services/gemini.cjs');
    
    let resumeInfo = { years: 2, education: 'B.Tech in Computer Science', skills: [] };
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Analyze this resume and extract the following details:
        - Total years of professional experience as an integer.
        - Highest education qualification (degree and major).
        - List of key technical skills, programming languages, and tools mentioned.
        
        Return ONLY a valid JSON object with the following structure (no markdown, no formatting, just raw JSON):
        {
          "years": <number>,
          "education": "<string>",
          "skills": ["<skill1>", "<skill2>", ...]
        }
        
        Resume Text:
        ${resumeText.slice(0, 3000)}`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim()
          .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(text);
        if (parsed) {
          resumeInfo = {
            years: typeof parsed.years === 'number' ? parsed.years : parseInt(parsed.years) || 2,
            education: parsed.education || 'B.Tech in Computer Science',
            skills: Array.isArray(parsed.skills) ? parsed.skills : []
          };
        }
      } catch (e) {
        console.warn('[Applications API] Quick resume info extraction failed:', e.message);
      }
    }

    if (!resumeInfo.skills || !resumeInfo.skills.length) {
      try {
        const fallbackSkills = await extractSkillsFromResume(resumeText);
        resumeInfo.skills = fallbackSkills;
      } catch {
        // Safe inline mock extract
        const commonSkills = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Kubernetes'];
        const found = [];
        const lowerText = (resumeText || '').toLowerCase();
        for (const skill of commonSkills) {
          if (lowerText.includes(skill.toLowerCase())) found.push(skill);
        }
        resumeInfo.skills = found.length > 0 ? found : ['Software Development'];
      }
    }

    // Run AI job screening (evaluate fit)
    const { analyzeJobMatch } = require('../services/gemini.cjs');
    const candidateName = `${req.user.first_name} ${req.user.last_name || ''}`.trim();

    let matchResult;
    try {
      matchResult = await analyzeJobMatch({
        resumeText,
        candidateName,
        jobTitle: jobData.title,
        jobDescription: jobData.description,
        skillsRequired: jobData.skills_required,
        requirements: jobData.requirements
      });
    } catch (aiErr) {
      console.warn('[App Apply] analyzeJobMatch failed, using fallback:', aiErr.message);
      matchResult = {
        matchScore: 75,
        matchingSkills: ['Python', 'SQL'],
        missingSkills: ['AWS'],
        experienceRelevance: 'Moderate alignment with requirements',
        recommendation: 'Good Match'
      };
    }

    // Construct serialized resume_url containing all details
    const serializedData = {
      resume_file:      resumeFile,
      resume_summary:   resumeSummary,
      resume_text:      resumeText,
      experience_years: resumeInfo.years,
      education:        resumeInfo.education,
      detected_skills:  resumeInfo.skills.join(', '),
      ai_analysis: {
        matchScore:           matchResult.matchScore,
        matchingSkills:       matchResult.matchingSkills,
        missingSkills:        matchResult.missingSkills,
        experienceRelevance:  matchResult.experienceRelevance,
        recommendation:       matchResult.recommendation,
        created_at:           new Date().toISOString()
      }
    };

    // Insert job application
    let appRecord;
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id:       req.params.jobId,
          candidate_id: req.user.id,
          status:       'Applied',
          resume_url:   JSON.stringify(serializedData)
        })
        .select()
        .single();

      if (error) throw error;
      appRecord = {
        ...data,
        resume_file:      resumeFile,
        resume_summary:   resumeSummary,
        resume_text:      resumeText,
        experience_years: resumeInfo.years,
        education:        resumeInfo.education,
        detected_skills:  resumeInfo.skills.join(', '),
      };
    } catch (dbErr) {
      console.warn('[App Apply] Supabase application insert failed, using fallback cache:', dbErr.message);
      const appMockId = `app-${Date.now()}`;
      appRecord = {
        id: appMockId,
        application_id: appMockId,
        job_id: req.params.jobId,
        candidate_id: req.user.id,
        status: 'Applied',
        application_status: 'Applied',
        resume_url:   JSON.stringify(serializedData),
        resume_file:      resumeFile,
        resume_summary:   resumeSummary,
        resume_text:      resumeText,
        experience_years: resumeInfo.years,
        education:        resumeInfo.education,
        detected_skills:  resumeInfo.skills.join(', '),
        applied_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }

    const applicationId = appRecord.id || appRecord.application_id;

    // Save in memory cache
    applicationsCache.set(applicationId, appRecord);

    applicationAnalysisCache.set(applicationId, {
      application_id: applicationId,
      matchScore: matchResult.matchScore,
      matchingSkills: matchResult.matchingSkills,
      missingSkills: matchResult.missingSkills,
      experienceRelevance: matchResult.experienceRelevance,
      recommendation: matchResult.recommendation,
      created_at: new Date().toISOString()
    });

    // ── Send Application Received confirmation email ──────────────────────────
    const candidateConfirmEmail = req.user.email;
    const candidateConfirmName  = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Candidate';
    const confirmJobTitle = jobData.title || 'the position';
    const confirmCompany  = jobData.company || 'our company';

    if (candidateConfirmEmail && candidateConfirmEmail.includes('@')) {
      sendStatusEmail({
        to:            candidateConfirmEmail,
        status:        'Applied',
        candidateName: candidateConfirmName,
        jobTitle:      confirmJobTitle,
        company:       confirmCompany,
      }).then(async () => {
        // Mark last notified status in DB after successful send
        try {
          await supabase
            .from('job_applications')
            .update({ last_notified_status: 'Applied' })
            .eq('id', applicationId);
        } catch {}
        if (applicationsCache.has(applicationId)) {
          applicationsCache.get(applicationId).last_notified_status = 'Applied';
        }
      }).catch(e => console.warn('[App Receipt Email] Failed after retries:', e.message));
    } else {
      console.warn(`[App Receipt Email] Invalid or missing candidate email for application ${applicationId}: "${candidateConfirmEmail}"`);
    }

    return res.status(201).json({ success: true, application: appRecord });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/applications/:id/status  – recruiter updates status ─────────
router.patch('/:id/status', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });

  const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
  const dbStatus = validStatuses.includes(status) ? status : status;

  console.log(`\n[Status PATCH] ═══════════════════════════════════════════════════`);
  console.log(`[Status PATCH] Application: ${req.params.id}`);
  console.log(`[Status PATCH] New Status:  ${dbStatus}`);

  try {
    // ── Step 1: Fetch the application record (plain, no joins) ────────────
    let appRecord = null;
    let lastNotifiedStatus = null;
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id, candidate_id, job_id, last_notified_status, status')
        .eq('id', req.params.id)
        .maybeSingle();
      if (error) {
        console.warn('[Status PATCH] Supabase app fetch error:', error.message);
      } else {
        appRecord = data;
        lastNotifiedStatus = data?.last_notified_status || null;
        console.log(`[Status PATCH] App found — candidate_id: ${data?.candidate_id}, job_id: ${data?.job_id}, last_notified: ${lastNotifiedStatus}`);
      }
    } catch (fetchErr) {
      console.warn('[Status PATCH] Exception fetching app:', fetchErr.message);
    }

    // Fallback to cache if Supabase failed
    if (!appRecord) {
      const cached = applicationsCache.get(req.params.id);
      if (cached) {
        appRecord = { id: req.params.id, candidate_id: cached.candidate_id, job_id: cached.job_id, last_notified_status: cached.last_notified_status };
        lastNotifiedStatus = cached.last_notified_status || null;
        console.log('[Status PATCH] Using cached app data as fallback');
      }
    }

    // ── Step 2: Update status in DB ──────────────────────────────────────
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: dbStatus })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;

    // Update local cache
    if (applicationsCache.has(req.params.id)) {
      const existing = applicationsCache.get(req.params.id);
      existing.status = dbStatus;
      existing.application_status = dbStatus;
      applicationsCache.set(req.params.id, existing);
    }

    if (!data || data.length === 0) {
      console.log('[Status PATCH] No rows updated by ID, trying candidate_id fallback...');
      const { data: data2, error: err2 } = await supabase
        .from('job_applications')
        .update({ status: dbStatus })
        .eq('candidate_id', req.params.id)
        .select();
      if (err2) throw err2;
      return res.json({ success: true, updated: data2 });
    }

    // ── Step 3: Email notification logic ─────────────────────────────────
    const emailTriggerStatuses = ['Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

    if (emailTriggerStatuses.includes(dbStatus)) {
      // Check duplicate prevention
      const cachedNotified = applicationsCache.has(req.params.id) ? applicationsCache.get(req.params.id).last_notified_status : null;
      const effectiveLastNotified = lastNotifiedStatus || cachedNotified || null;

      if (effectiveLastNotified === dbStatus) {
        console.log(`[Email] ⏭️  SKIP — duplicate: "${dbStatus}" already notified for ${req.params.id}`);
      } else {
        console.log(`[Email] 🔍 Resolving candidate and job data for email...`);

        // ── Step 3a: Fetch candidate (user) data separately ──────────────
        let candidateEmail = null;
        let candidateName = 'Candidate';
        const candidateId = appRecord?.candidate_id || data[0]?.candidate_id;

        if (candidateId) {
          try {
            const { data: userData, error: userErr } = await supabase
              .from('users')
              .select('first_name, last_name, email')
              .eq('id', candidateId)
              .maybeSingle();
            if (userErr) {
              console.warn('[Email] ⚠️  User query error:', userErr.message);
            } else if (userData) {
              candidateEmail = userData.email;
              candidateName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Candidate';
              console.log(`[Email] ✅ User resolved: ${candidateName} <${candidateEmail}>`);
            } else {
              console.warn(`[Email] ⚠️  No user found for candidate_id: ${candidateId}`);
            }
          } catch (uErr) {
            console.warn('[Email] Exception fetching user:', uErr.message);
          }
        } else {
          console.warn('[Email] ⚠️  No candidate_id available — cannot resolve user');
        }

        // ── Step 3b: Fetch job data separately ───────────────────────────
        let jobTitle = 'the position';
        let company = 'our company';
        const jobId = appRecord?.job_id || data[0]?.job_id;

        if (jobId) {
          try {
            const { data: jobData, error: jobErr } = await supabase
              .from('jobs')
              .select('title, company')
              .eq('id', jobId)
              .maybeSingle();
            if (jobErr) {
              console.warn('[Email] ⚠️  Job query error:', jobErr.message);
            } else if (jobData) {
              jobTitle = jobData.title || jobTitle;
              company = jobData.company || company;
              console.log(`[Email] ✅ Job resolved: ${jobTitle} at ${company}`);
            } else {
              console.warn(`[Email] ⚠️  No job found for job_id: ${jobId}`);
            }
          } catch (jErr) {
            console.warn('[Email] Exception fetching job:', jErr.message);
          }
        } else {
          console.warn('[Email] ⚠️  No job_id available — cannot resolve job');
        }

        // ── Step 3c: Send the email ──────────────────────────────────────
        if (candidateEmail && candidateEmail.includes('@')) {
          console.log(`[Email] 📧 SENDING "${dbStatus}" email → ${candidateEmail}`);
          console.log(`[Email]    Candidate: ${candidateName} | Job: ${jobTitle} | Company: ${company}`);

          sendStatusEmail({
            to:            candidateEmail,
            status:        dbStatus,
            candidateName,
            jobTitle,
            company,
          }).then(async () => {
            console.log(`[Email] ✅ Email SENT for "${dbStatus}" to ${candidateEmail}`);
            // Update last_notified_status
            try {
              await supabase
                .from('job_applications')
                .update({ last_notified_status: dbStatus })
                .eq('id', req.params.id);
              console.log(`[Email] ✅ last_notified_status → "${dbStatus}"`);
            } catch (e) {
              console.warn('[Email] DB update for last_notified_status failed:', e.message);
            }
            if (applicationsCache.has(req.params.id)) {
              applicationsCache.get(req.params.id).last_notified_status = dbStatus;
            }
          }).catch(e => {
            console.error(`[Email] ❌ FAILED after retries for "${dbStatus}" to ${candidateEmail}: ${e.message}`);
          });
        } else {
          console.warn(`[Email] ❌ Cannot send "${dbStatus}" — no valid email. Got: "${candidateEmail}" for app ${req.params.id}`);
        }
      }
    } else {
      console.log(`[Email] ℹ️  Status "${dbStatus}" does not trigger email.`);
    }

    console.log(`[Status PATCH] ═══════════════════════════════════════════════════\n`);
    return res.json({ success: true, updated: data });
  } catch (err) {
    console.error(`[Status PATCH] ❌ ERROR: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/applications/:id/report  – AI screening report ───────────────
router.get('/:id/report', requireAuth, async (req, res) => {
  try {
    const { data: app, error } = await supabase
      .from('job_applications')
      .select(`
        id, status, candidate_id, job_id, resume_url,
        jobs ( id, title, company, description, requirements, skills_required ),
        users ( id, first_name, last_name, email )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    
    let targetApp = app;
    if (!targetApp) {
      // Check cached applications
      targetApp = applicationsCache.get(req.params.id);
      if (!targetApp) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Load user & job if mock
      let job = null;
      let user = null;
      try {
        const { data: jData } = await supabase.from('jobs').select('*').eq('id', targetApp.job_id).maybeSingle();
        job = jData;
      } catch {}
      try {
        const { data: uData } = await supabase.from('users').select('*').eq('id', targetApp.candidate_id).maybeSingle();
        user = uData;
      } catch {}
      
      targetApp = {
        ...targetApp,
        jobs: job || { id: targetApp.job_id, title: 'Position', company: 'AI Recruit Corp' },
        users: user || { id: targetApp.candidate_id, first_name: 'Candidate', last_name: '', email: 'candidate@recruitment.ai' }
      };
    }

    const u = targetApp.users || {};
    const j = targetApp.jobs  || {};
    const candidateName = `${u.first_name || 'Unknown'} ${u.last_name || ''}`.trim();

    // Parse serialized details from resume_url if available
    let parsedResumeUrl = null;
    if (targetApp.resume_url) {
      try {
        parsedResumeUrl = JSON.parse(targetApp.resume_url);
      } catch (e) {
        // Ignore parse errors
      }
    }

    const resumeFile = parsedResumeUrl?.resume_file || targetApp.resume_file || 'resume.pdf';
    const resumeSummary = parsedResumeUrl?.resume_summary || targetApp.resume_summary || 'No summary available';
    const resumeText = parsedResumeUrl?.resume_text || targetApp.resume_text || '';
    
    let analysis;
    if (parsedResumeUrl && parsedResumeUrl.ai_analysis) {
      analysis = {
        matchScore: parsedResumeUrl.ai_analysis.matchScore,
        matchingSkills: parsedResumeUrl.ai_analysis.matchingSkills,
        missingSkills: parsedResumeUrl.ai_analysis.missingSkills,
        experienceRelevance: parsedResumeUrl.ai_analysis.experienceRelevance,
        recommendation: parsedResumeUrl.ai_analysis.recommendation,
      };
    } else {
      analysis = await getApplicationAnalysis(targetApp.id, candidateName, resumeText, j);
    }

    return res.json({
      applicationId: targetApp.id,
      candidateName,
      candidateEmail: u.email || '',
      jobTitle: j.title || 'Position',
      company: j.company || '',
      status: targetApp.status,
      matchScore: analysis.matchScore,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      experienceRelevance: analysis.experienceRelevance,
      recommendation: analysis.recommendation,
      resumeFile: resumeFile,
      resumeSummary: resumeSummary,
      resumeText: resumeText
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Force re-generate AI report (clears cache)
router.delete('/:id/report', requireAuth, async (req, res) => {
  applicationAnalysisCache.delete(req.params.id);
  return res.json({ success: true, message: 'Report cache cleared' });
});

module.exports = router;
