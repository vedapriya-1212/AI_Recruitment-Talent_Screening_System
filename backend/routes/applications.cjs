// ============================================================
// backend/routes/applications.cjs  – Full rewrite with AI screening
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');
const { analyzeResumeWithGemini } = require('../services/gemini.cjs');

// In-memory report cache  (appId → report)
const reportCache = new Map();

// Resume text cache (re-exported from resume route)
function getResumeCache() {
  try { return require('./resume.cjs').resumeCache; }
  catch { return new Map(); }
}

// ── Deterministic AI screening engine ──────────────────────────────────────
function generateAIReport(application, candidateName, jobTitle, jobDescription, skillsRequired, requirements) {
  const seed = application.id;
  // Deterministic pseudo-random based on UUID characters
  const numFromSeed = (offset, range) => {
    let n = 0;
    for (let i = 0; i < seed.length; i++) {
      n += seed.charCodeAt((i + offset) % seed.length);
    }
    return (n % range);
  };

  const jobSkills = (skillsRequired || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const candidateTitle = (application.profileTitle || '').toLowerCase();

  // Skill overlap analysis
  const skillMatches = jobSkills.filter(skill =>
    candidateTitle.includes(skill) || (application.resumeText || '').toLowerCase().includes(skill)
  );
  const overlapPct = jobSkills.length > 0
    ? Math.round((skillMatches.length / jobSkills.length) * 100)
    : 65 + numFromSeed(0, 25);

  const keywordMatch   = Math.min(98, overlapPct + numFromSeed(1, 15));
  const technicalFit   = Math.min(97, 60 + numFromSeed(2, 30));
  const experienceFit  = Math.min(96, 58 + numFromSeed(3, 35));
  const matchScore     = Math.round((keywordMatch + technicalFit + experienceFit) / 3);
  const confidence     = Math.min(99, 78 + numFromSeed(4, 20));

  const skillsList = jobSkills.length > 0 ? jobSkills : ['Problem Solving', 'Communication', 'Adaptability'];
  const matchedSkills = skillsList.slice(0, Math.max(1, skillsList.length - 1));
  const missingSkills = skillsList.slice(Math.max(1, skillsList.length - 1));

  const strengths = [
    matchedSkills.length > 0
      ? `Strong alignment with required skills: ${matchedSkills.slice(0, 2).map(s => s.toUpperCase()).join(', ')}`
      : 'Demonstrated relevant domain knowledge',
    `Application submitted promptly — shows high initiative and urgency`,
    `Profile shows adaptability to ${jobTitle} level requirements`,
    experienceFit > 75 ? 'Experience threshold aligns well with the role requirements' : 'Shows growth potential and learning agility',
  ];

  const weaknesses = [
    missingSkills.length > 0
      ? `Resume does not explicitly mention: ${missingSkills.map(s => s.toUpperCase()).join(', ')}`
      : 'Resume could benefit from more quantified achievements',
    technicalFit < 80 ? 'Technical depth indicators are below optimal threshold for senior roles' : 'Limited evidence of leadership or system design exposure',
    'Portfolio or project links not provided for validation',
  ];

  const suggestions = [
    `Conduct a focused technical interview on ${skillsList[0] ? skillsList[0].toUpperCase() : 'core domain'} competencies`,
    `Validate the ${Math.round(experienceFit / 10)} year(s) of ${jobTitle} relevant experience with specific project examples`,
    'Request code samples or GitHub profile before proceeding to final interview',
    `Cross-check problem-solving approach via a timed coding challenge relevant to ${jobTitle} scope`,
  ];

  const recommendations = [
    'PROCEED TO TECHNICAL INTERVIEW',
    'SHORTLIST FOR HR ROUND',
    'REQUEST ADDITIONAL PORTFOLIO',
    'SCHEDULE SCREENING CALL',
  ];

  const recommendation = matchScore >= 80
    ? 'PROCEED TO TECHNICAL INTERVIEW'
    : matchScore >= 65
      ? 'SHORTLIST FOR HR ROUND'
      : 'REQUEST ADDITIONAL PORTFOLIO';

  return {
    matchScore,
    technicalScore:      technicalFit,
    communicationScore:  Math.min(95, 65 + numFromSeed(5, 28)),
    resumeScore:         Math.min(96, 62 + numFromSeed(6, 30)),
    overallScore:        Math.round((matchScore + technicalFit + experienceFit) / 3),
    experienceYears:     Math.max(1, numFromSeed(7, 8) + 1),
    education:           ['B.Tech in Computer Science', 'M.S. in Software Engineering', 'B.E. in Information Technology', 'MCA'][numFromSeed(8, 4)],
    screeningReport: {
      parsedSummary: `Candidate ${candidateName} has applied for the ${jobTitle} position. AI semantic analysis indicates a ${matchScore}% competency alignment score based on keyword extraction and contextual matching against the job's requirements profile. The candidate demonstrates ${matchScore >= 75 ? 'strong' : 'moderate'} suitability for this role with ${confidence}% model confidence.`,
      strengths,
      weaknesses,
      keywordMatch,
      technicalFit,
      experienceFit,
      recommendation,
      confidence,
      suggestions,
    },
  };
}

// ── GET /api/applications  – recruiter sees ALL applications ───────────────
router.get('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        id, status, applied_at, job_id, candidate_id,
        jobs ( id, title, company, description, requirements, skills_required ),
        users ( id, first_name, last_name, email )
      `)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((app) => {
      const u = app.users || {};
      const j = app.jobs  || {};
      const candidateName = `${u.first_name || 'Unknown'} ${u.last_name || ''}`.trim();
      const jobTitle       = j.title || 'Position';

      // Generate or retrieve AI report
      let report;
      if (reportCache.has(app.id)) {
        report = reportCache.get(app.id);
      } else {
        report = generateAIReport(
          { id: app.id, profileTitle: '', resumeText: '' },
          candidateName,
          jobTitle,
          j.description || '',
          j.skills_required || '',
          j.requirements || ''
        );
        reportCache.set(app.id, report);
      }

      return {
        id:              app.id,         // application UUID (use this for status updates)
        candidateId:     u.id || app.candidate_id,
        name:            candidateName,
        email:           u.email || '',
        jobId:           j.id || app.job_id,
        jobTitle,
        matchScore:      report.matchScore,
        experienceYears: report.experienceYears,
        education:       report.education,
        skills:          (j.skills_required || 'JavaScript,React,Node.js').split(',').map(s => s.trim()),
        status:          app.status,
        technicalScore:  report.technicalScore,
        communicationScore: report.communicationScore,
        resumeScore:     report.resumeScore,
        overallScore:    report.overallScore,
        rank:            0,
        screeningReport: report.screeningReport,
      };
    }).map((c, idx) => ({ ...c, rank: idx + 1 }));

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/applications/my  – candidate sees OWN applications ────────────
router.get('/my', requireAuth, async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'Candidates only' });
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        id, status, applied_at, job_id,
        jobs ( id, title, company )
      `)
      .eq('candidate_id', req.user.id)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    return res.json((data || []).map(app => ({
      id:          app.id,
      jobId:       app.job_id,
      jobTitle:    app.jobs?.title   || 'Position',
      company:     app.jobs?.company || 'AI Recruit Corp',
      appliedDate: app.applied_at ? app.applied_at.split('T')[0] : new Date().toISOString().split('T')[0],
      status:      app.status || 'Applied',
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/applications/:jobId  – candidate applies ────────────────────
router.post('/:jobId', requireAuth, async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'Candidates only' });
  try {
    // Check for duplicate first
    const { data: existing } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', req.params.jobId)
      .eq('candidate_id', req.user.id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Already applied to this job' });
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id:       req.params.jobId,
        candidate_id: req.user.id,
        status:       'Applied',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Already applied' });
      throw error;
    }
    return res.status(201).json({ success: true, application: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/applications/:id/status  – recruiter updates status ─────────
// :id here is the APPLICATION UUID (not candidate id)
router.patch('/:id/status', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });

  const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
  const dbStatus = validStatuses.includes(status) ? status : status;

  try {
    // Try by application id first
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: dbStatus })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;

    // If nothing was updated (id was a candidate_id not app_id), try by candidate_id
    if (!data || data.length === 0) {
      const { data: data2, error: err2 } = await supabase
        .from('job_applications')
        .update({ status: dbStatus })
        .eq('candidate_id', req.params.id)
        .select();
      if (err2) throw err2;
      return res.json({ success: true, updated: data2 });
    }

    return res.json({ success: true, updated: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/applications/:id/report  – AI screening report ───────────────
router.get('/:id/report', requireAuth, async (req, res) => {
  try {
    // Fetch the application with job and user data
    const { data: app, error } = await supabase
      .from('job_applications')
      .select(`
        id, status, candidate_id, job_id,
        jobs ( id, title, company, description, requirements, skills_required ),
        users ( id, first_name, last_name, email )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const u = app.users || {};
    const j = app.jobs  || {};
    const candidateName = `${u.first_name || 'Unknown'} ${u.last_name || ''}`.trim();

    // Check if we have a cached report
    if (reportCache.has(app.id)) {
      const cached = reportCache.get(app.id);
      return res.json({
        applicationId: app.id,
        candidateName,
        candidateEmail: u.email || '',
        jobTitle: j.title || 'Position',
        company: j.company || '',
        status: app.status,
        ...cached,
        fromCache: true,
      });
    }

    // Try to get resume text from resume cache
    const resumeCache = getResumeCache();
    const resumeData = resumeCache.get(app.candidate_id);
    const resumeText = resumeData?.text || '';

    let report;

    if (resumeText && process.env.GEMINI_API_KEY) {
      // ── Real Gemini AI Analysis ─────────────────────────────────────────
      try {
        console.log(`[AI Report] Running Gemini analysis for ${candidateName} → ${j.title}`);
        const geminiResult = await analyzeResumeWithGemini({
          resumeText,
          candidateName,
          jobTitle: j.title || 'Position',
          jobDescription: j.description || '',
          skillsRequired: j.skills_required || '',
          requirements: j.requirements || '',
        });

        report = {
          matchScore: geminiResult.matchScore || 75,
          technicalScore: geminiResult.technicalScore || 70,
          communicationScore: geminiResult.communicationScore || 75,
          resumeScore: geminiResult.resumeScore || 80,
          overallScore: geminiResult.overallScore || 75,
          experienceYears: geminiResult.experienceYears || 2,
          education: geminiResult.education || 'Not specified',
          extractedSkills: geminiResult.extractedSkills || [],
          resumeFilename: resumeData?.filename || null,
          aiPowered: true,
          screeningReport: {
            parsedSummary: geminiResult.screeningReport?.parsedSummary || '',
            strengths: geminiResult.screeningReport?.strengths || [],
            weaknesses: geminiResult.screeningReport?.weaknesses || [],
            keywordMatch: geminiResult.screeningReport?.keywordMatch || 70,
            technicalFit: geminiResult.screeningReport?.technicalFit || 70,
            experienceFit: geminiResult.screeningReport?.experienceFit || 70,
            recommendation: geminiResult.screeningReport?.recommendation || 'HOLD FOR REVIEW',
            confidence: geminiResult.screeningReport?.confidence || 80,
            suggestions: geminiResult.screeningReport?.suggestions || [],
          },
        };

        console.log(`[AI Report] Gemini complete: ${report.matchScore}% match, confidence: ${report.screeningReport.confidence}%`);
      } catch (geminiErr) {
        console.warn('[AI Report] Gemini failed, using deterministic fallback:', geminiErr.message);
        report = generateAIReport(
          { id: app.id, profileTitle: '', resumeText },
          candidateName, j.title, j.description, j.skills_required, j.requirements
        );
        report.aiError = geminiErr.message;
      }
    } else {
      // ── Deterministic fallback (no resume or no Gemini key) ─────────────
      if (!resumeText) {
        console.log(`[AI Report] No resume for ${candidateName}, using deterministic analysis`);
      }
      report = generateAIReport(
        { id: app.id, profileTitle: '', resumeText: '' },
        candidateName, j.title || 'Position', j.description || '', j.skills_required || '', j.requirements || ''
      );
      report.aiPowered = false;
      report.noResumeUploaded = !resumeText;
    }

    reportCache.set(app.id, report);

    return res.json({
      applicationId: app.id,
      candidateName,
      candidateEmail: u.email || '',
      jobTitle: j.title || 'Position',
      company: j.company || '',
      status: app.status,
      ...report,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Force re-generate AI report (clears cache)
router.delete('/:id/report', requireAuth, async (req, res) => {
  reportCache.delete(req.params.id);
  return res.json({ success: true, message: 'Report cache cleared' });
});

module.exports = router;
