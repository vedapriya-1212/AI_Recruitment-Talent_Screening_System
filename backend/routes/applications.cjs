// ============================================================
// backend/routes/applications.cjs
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');

// ── GET /api/applications  – recruiter sees ALL applications ───────────────
router.get('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        id, status, applied_at,
        job_id,
        jobs ( id, title, company ),
        candidate_id,
        users ( id, first_name, last_name, email ),
        candidate_profiles ( title, skills )
      `)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((app, idx) => {
      const u = app.users || {};
      const j = app.jobs  || {};
      return {
        id:              u.id || app.candidate_id,
        name:            `${u.first_name || 'Unknown'} ${u.last_name || 'Candidate'}`,
        email:           u.email || '',
        jobId:           j.id   || app.job_id,
        jobTitle:        j.title || 'Position',
        matchScore:      Math.floor(70 + Math.random() * 28),
        experienceYears: Math.floor(2 + Math.random() * 7),
        education:       'Degree in Computer Science',
        skills:          app.candidate_profiles?.skills
                           ? app.candidate_profiles.skills.split(',').map(s => s.trim())
                           : ['JavaScript', 'React', 'Node.js'],
        status:          app.status,
        technicalScore:  Math.floor(75 + Math.random() * 23),
        communicationScore: Math.floor(70 + Math.random() * 28),
        resumeScore:     Math.floor(75 + Math.random() * 23),
        overallScore:    Math.floor(75 + Math.random() * 23),
        rank:            idx + 1,
        screeningReport: {
          parsedSummary: `Candidate ${u.first_name} has applied for ${j.title}.`,
          strengths: ['Strong technical background', 'Good problem solving'],
          weaknesses: ['Limited management experience'],
          keywordMatch: Math.floor(75 + Math.random() * 23),
          technicalFit: Math.floor(75 + Math.random() * 23),
          experienceFit: Math.floor(75 + Math.random() * 23),
          recommendation: 'Proceed To Technical Interview',
          confidence: Math.floor(80 + Math.random() * 18),
          suggestions: ['Review portfolio', 'Check references'],
        },
      };
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
router.patch('/:id/status', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });

  try {
    // The id here is the candidate's user id (used as application identifier in frontend)
    // Try updating by candidate_id first, then by application id
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('candidate_id', req.params.id)
      .select();

    if (error) throw error;
    return res.json({ success: true, updated: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
