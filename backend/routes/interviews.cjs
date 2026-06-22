// ============================================================
// backend/routes/interviews.cjs
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');

// ── GET /api/interviews ────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });

    // Candidates only see their own interviews
    if (req.user.role === 'candidate') {
      query = query.eq('candidate_id', req.user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Interviews GET] Supabase error:', error.message);
      return res.json([]);
    }

    if (!data || data.length === 0) {
      return res.json([]);
    }

    // Collect unique candidate IDs to resolve names
    const candidateIds = [...new Set(data.map(iv => iv.candidate_id).filter(Boolean))];

    // Batch-fetch candidate names
    let usersMap = {};
    if (candidateIds.length > 0) {
      try {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', candidateIds);
        if (usersData) {
          for (const u of usersData) {
            usersMap[u.id] = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Candidate';
          }
        }
      } catch (_) { /* graceful fallback */ }
    }

    // Batch-fetch job titles from job_applications for each candidate
    let jobTitleMap = {};
    if (candidateIds.length > 0) {
      try {
        const { data: appData } = await supabase
          .from('job_applications')
          .select('candidate_id, jobs(title, company)')
          .in('candidate_id', candidateIds);
        if (appData) {
          for (const app of appData) {
            if (app.jobs && !jobTitleMap[app.candidate_id]) {
              jobTitleMap[app.candidate_id] = {
                jobTitle: app.jobs.title || 'Position',
                company: app.jobs.company || ''
              };
            }
          }
        }
      } catch (_) { /* graceful fallback */ }
    }

    // Map rows to the InterviewEvent shape the frontend expects
    const mapped = data.map(iv => {
      const candidateName = usersMap[iv.candidate_id] || 'Candidate';
      const jobInfo = jobTitleMap[iv.candidate_id] || {};
      return {
        id:            iv.interview_id,
        candidateId:   iv.candidate_id,
        candidateName: candidateName,
        jobTitle:      jobInfo.jobTitle || 'Position',
        company:       jobInfo.company || '',
        date:          iv.interview_date || 'TBD',
        time:          'TBD',   // Not stored in Supabase schema
        stage:         'HR Screening', // Not stored in Supabase schema
        status:        iv.status || 'Scheduled',
      };
    });

    return res.json(mapped);
  } catch (err) {
    console.error('[Interviews GET] Unexpected error:', err.message);
    return res.json([]);
  }
});

// ── POST /api/interviews ───────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { candidateId, jobId, date, time, stage } = req.body;
  if (!candidateId || !date || !time || !stage) {
    return res.status(400).json({ error: 'candidateId, date, time, stage are required' });
  }

  // Normalize date to YYYY-MM-DD for Supabase date column
  let interviewDate = date;
  if (date === 'Today') {
    interviewDate = new Date().toISOString().split('T')[0];
  } else {
    // Try to parse human-readable dates like "June 25" into YYYY-MM-DD
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      interviewDate = parsed.toISOString().split('T')[0];
    }
    // Otherwise keep the raw string (Supabase will validate)
  }

  // Resolve job title
  let jobTitle = 'Position';
  let company = '';
  if (jobId) {
    try {
      const { data: job } = await supabase.from('jobs').select('title, company').eq('id', jobId).maybeSingle();
      jobTitle = job?.title || 'Position';
      company = job?.company || '';
    } catch (_) {}
  } else {
    try {
      const { data: app } = await supabase
        .from('job_applications').select('jobs(title, company)').eq('candidate_id', candidateId).limit(1).maybeSingle();
      jobTitle = app?.jobs?.title || 'Position';
      company = app?.jobs?.company || '';
    } catch (_) {}
  }

  // Get candidate name
  let candidateName = 'Candidate';
  try {
    const { data: cu } = await supabase.from('users').select('first_name,last_name').eq('id', candidateId).maybeSingle();
    candidateName = cu ? `${cu.first_name} ${cu.last_name}`.trim() : 'Candidate';
  } catch (_) {}

  // ── INSERT INTO SUPABASE ──────────────────────────────────────────────────
  console.log(`[Interviews POST] Inserting: candidate_id=${candidateId}, interview_date=${interviewDate}, status=Scheduled`);

  const { data: iv, error: ivErr } = await supabase
    .from('interviews')
    .insert({
      candidate_id:   candidateId,
      interview_date: interviewDate,
      status:         'Scheduled'
    })
    .select('*')
    .single();

  if (ivErr) {
    console.error('[Interviews POST] Supabase insert FAILED:', ivErr.message, ivErr.details);
    return res.status(500).json({ error: 'Failed to save interview: ' + ivErr.message });
  }

  console.log(`[Interviews POST] SUCCESS — interview_id=${iv.interview_id}`);

  // Update application status to "Interview Scheduled"
  try {
    await supabase
      .from('job_applications')
      .update({ status: 'Interview Scheduled' })
      .eq('candidate_id', candidateId);
  } catch (e) {
    console.warn('[Interviews POST] Failed to update application status:', e.message);
  }

  // Return the full InterviewEvent shape to the frontend
  return res.status(201).json({
    id:            iv.interview_id,
    candidateId:   iv.candidate_id,
    candidateName,
    jobTitle,
    company,
    date:          iv.interview_date,
    time,
    stage,
    status:        iv.status,
  });
});

// ── PATCH /api/interviews/:id ──────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  const { status, date } = req.body;
  
  // Build update payload — only include provided fields
  const updatePayload = {};
  if (status) updatePayload.status = status;
  if (date) updatePayload.interview_date = date;

  if (Object.keys(updatePayload).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const { data, error } = await supabase
      .from('interviews')
      .update(updatePayload)
      .eq('interview_id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('[Interviews PATCH] Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    // Resolve candidate name for the response
    let candidateName = 'Candidate';
    try {
      const { data: cu } = await supabase.from('users').select('first_name,last_name').eq('id', data.candidate_id).maybeSingle();
      candidateName = cu ? `${cu.first_name} ${cu.last_name}`.trim() : 'Candidate';
    } catch (_) {}

    return res.json({
      id:            data.interview_id,
      candidateId:   data.candidate_id,
      candidateName,
      date:          data.interview_date || 'TBD',
      status:        data.status || 'Scheduled',
    });
  } catch (err) {
    console.error('[Interviews PATCH] Unexpected error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/interviews/:id ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  try {
    const { error } = await supabase
      .from('interviews')
      .update({ status: 'Cancelled' })
      .eq('interview_id', req.params.id);

    if (error) {
      console.error('[Interviews DELETE] Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[Interviews DELETE] Unexpected error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
