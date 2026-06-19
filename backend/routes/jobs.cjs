// ============================================================
// backend/routes/jobs.cjs
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');

// ── helpers ────────────────────────────────────────────────────────────────
function mapJob(j) {
  const range = (j.salary_range || '100000-150000').replace(/[$,]/g, '').split('-').map(Number);
  const reqs  = j.requirements ? j.requirements.split('\n').filter(Boolean) : [];
  const skills = j.skills_required ? j.skills_required.split(',').map(s => s.trim()).filter(Boolean) : [];
  return {
    id: j.id,
    title: j.title,
    department: j.experience_level || 'Technology',
    location: j.location || 'Remote',
    description: j.description || '',
    requirements: reqs,
    skills,
    status: j.is_active ? 'published' : 'draft',
    optimizationScore: 90,
    healthScore: 85,
    completionPercentage: 100,
    missingSkills: [],
    salaryMin: range[0] || 100000,
    salaryMax: range[1] || 150000,
    applicationsCount: j.applications_count || 0,
    created_at: j.created_at,
    company: j.company || 'AI Recruit Corp',
  };
}

// GET /api/jobs/recommendations  – personalised job matches for a candidate
router.get('/recommendations', async (req, res) => {
  try {
    // Get candidate's resume from cache to extract their skills
    let candidateSkills = [];
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (token) {
      try {
        const { supabase: sb } = require('../db.cjs');
        const { data: { user } } = await sb.auth.getUser(token);
        if (user) {
          const { resumeCache } = require('./resume.cjs');
          const resumeData = resumeCache.get(user.id);
          if (resumeData?.text) {
            // Extract skills from resume text via simple keyword matching
            const knownSkills = ['javascript','typescript','react','node','python','java','go','rust','aws','docker',
              'kubernetes','sql','postgresql','mongodb','graphql','vue','angular','next','fastapi','django','spring',
              'machine learning','deep learning','tensorflow','pytorch','data science','devops','ci/cd','git'];
            const resumeLower = resumeData.text.toLowerCase();
            candidateSkills = knownSkills.filter(s => resumeLower.includes(s));
          }
        }
      } catch { /* ignore auth errors */ }
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const jobs = (data || []).map(mapJob);

    // Score each job by skill overlap with candidate
    const scored = jobs.map(job => {
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const matchCount = candidateSkills.filter(cs => jobSkills.some(js => js.includes(cs) || cs.includes(js))).length;
      const total = Math.max(jobSkills.length, 1);
      const relevanceScore = candidateSkills.length > 0
        ? Math.round((matchCount / total) * 100)
        : Math.floor(50 + Math.random() * 40); // Random 50-90% if no resume
      return { ...job, relevanceScore };
    });

    // Sort by relevance descending, return top 5
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return res.json(scored.slice(0, 5));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs  – public, returns all active jobs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json((data || []).map(mapJob));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id  – single job
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Job not found' });
    return res.json(mapJob(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs  – recruiter creates a job
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { title, department, location, description, requirements, skills, salaryMin, salaryMax } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const { data, error } = await supabase.from('jobs').insert({
      recruiter_id: req.user.id,
      title,
      experience_level: department || 'Technology',
      location: location || 'Remote',
      description,
      requirements: Array.isArray(requirements) ? requirements.join('\n') : requirements,
      skills_required: Array.isArray(skills) ? skills.join(',') : skills,
      salary_range: `${salaryMin || 100000}-${salaryMax || 150000}`,
      company: 'AI Recruit Corp',
      is_active: true,
    }).select().single();

    if (error) throw error;
    return res.status(201).json(mapJob(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/jobs/:id  – recruiter updates a job
router.put('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const { title, location, description, requirements, skills, salaryMin, salaryMax, is_active } = req.body;
  try {
    const updateData = {};
    if (title)        updateData.title = title;
    if (location)     updateData.location = location;
    if (description)  updateData.description = description;
    if (requirements) updateData.requirements = Array.isArray(requirements) ? requirements.join('\n') : requirements;
    if (skills)       updateData.skills_required = Array.isArray(skills) ? skills.join(',') : skills;
    if (salaryMin && salaryMax) updateData.salary_range = `${salaryMin}-${salaryMax}`;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('jobs').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json(mapJob(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/:id  – recruiter deactivates a job
router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  try {
    await supabase.from('jobs').update({ is_active: false }).eq('id', req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
