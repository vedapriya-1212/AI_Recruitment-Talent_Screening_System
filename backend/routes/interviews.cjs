// ============================================================
// backend/routes/interviews.cjs
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');

function mapInterview(iv) {
  return {
    id:            iv.id,
    candidateId:   iv.candidate_id,
    candidateName: iv.users
      ? `${iv.users.first_name} ${iv.users.last_name}`
      : 'Candidate',
    jobTitle:      iv.jobs?.title || 'Position',
    date:          iv.interview_date || 'TBD',
    time:          iv.interview_time || 'TBD',
    stage:         iv.stage || 'HR Screening',
    status:        iv.status || 'Scheduled',
  };
}

// ── GET /api/interviews  – recruiter sees all interviews ───────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabase
      .from('interviews')
      .select(`
        id, candidate_id, job_id,
        interview_date, interview_time, stage, status,
        users ( id, first_name, last_name ),
        jobs  ( id, title )
      `)
      .order('interview_date', { ascending: true });

    // Candidates only see their own
    if (req.user.role === 'candidate') {
      query = query.eq('candidate_id', req.user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json((data || []).map(mapInterview));
  } catch (err) {
    // interviews table might not exist yet
    console.warn('interviews query failed:', err.message);
    return res.json([]);
  }
});

// ── POST /api/interviews  – recruiter schedules interview ─────────────────
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { candidateId, jobId, date, time, stage } = req.body;
  if (!candidateId || !date || !time || !stage) {
    return res.status(400).json({ error: 'candidateId, date, time, stage are required' });
  }

  // Resolve jobId: if not provided, find from application
  let resolvedJobId = jobId;
  if (!resolvedJobId) {
    const { data: app } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('candidate_id', candidateId)
      .limit(1)
      .single();
    resolvedJobId = app?.job_id;
  }

  try {
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        candidate_id:   candidateId,
        job_id:         resolvedJobId,
        interview_date: date,
        interview_time: time,
        stage,
        status: 'Confirmed',
      })
      .select(`
        id, candidate_id, job_id,
        interview_date, interview_time, stage, status,
        users ( id, first_name, last_name ),
        jobs  ( id, title )
      `)
      .single();

    if (error) throw error;

    // Update candidate application status to 'Interview'
    await supabase
      .from('job_applications')
      .update({ status: 'Interview' })
      .eq('candidate_id', candidateId);

    return res.status(201).json(mapInterview(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/interviews/:id  – update interview status ──────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  try {
    const { data, error } = await supabase
      .from('interviews')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    return res.json(mapInterview(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/interviews/:id  – cancel ──────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  try {
    await supabase.from('interviews').update({ status: 'Cancelled' }).eq('id', req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
