// ============================================================
// backend/routes/resume.cjs
// PDF Resume Upload + AI Screening Integration
// ============================================================
const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { supabase } = require('../db.cjs');
const { requireAuth } = require('../middleware/auth.cjs');
const { analyzeResumeWithGemini } = require('../services/gemini.cjs');

// In-memory store: candidateId → { text, uploadedAt, filename }
const resumeCache = new Map();

// Multer: memory storage for PDF processing
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

// ── POST /api/resume/upload ────────────────────────────────────────────────
// Candidate uploads their resume PDF
router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Only candidates can upload resumes' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file provided. Send file as form-data field "resume"' });
  }

  let resumeText = '';
  const candidateId = req.user.id;

  // Try extracting PDF text
  try {
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(req.file.buffer);
    resumeText = parsed.text || '';
    console.log(`[Resume] Extracted ${resumeText.length} chars from ${req.file.originalname} for candidate ${candidateId}`);
  } catch (pdfErr) {
    console.warn('[Resume] pdf-parse failed, using raw buffer text:', pdfErr.message);
    // Fallback: decode PDF buffer as text (partial content)
    resumeText = req.file.buffer.toString('utf8', 0, Math.min(req.file.buffer.length, 5000));
  }

  // Extract candidate skills
  const { extractSkillsFromResume } = require('../services/gemini.cjs');
  let skills = [];
  try {
    skills = await extractSkillsFromResume(resumeText);
  } catch (err) {
    console.warn('[Resume] Skills extraction failed:', err.message);
  }

  // Store in memory cache
  resumeCache.set(candidateId, {
    text: resumeText,
    filename: req.file.originalname,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
    skills: skills || [],
  });

  // Do a quick AI extraction to get experience years and title
  let extractedInfo = {};
  try {
    const { analyzeResumeWithGemini: analyze } = require('../services/gemini.cjs');
    // Only do a lightweight extraction
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `From this resume, extract: total years of experience (as a number), current/latest job title, highest education. Return ONLY JSON like: {"years":3,"title":"Software Engineer","education":"B.Tech Computer Science"}
      
Resume text (first 2000 chars):
${resumeText.slice(0, 2000)}`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      extractedInfo = JSON.parse(text);
      console.log('[Resume] Quick extraction:', extractedInfo);
    }
  } catch (aiErr) {
    console.warn('[Resume] Quick AI extraction failed:', aiErr.message);
  }

  // Update candidate_profiles with extracted info
  const updateData = { updated_at: new Date().toISOString() };
  if (extractedInfo.years)    updateData.experience_years = extractedInfo.years;
  if (extractedInfo.title)    updateData.title = extractedInfo.title;
  
  await supabase
    .from('candidate_profiles')
    .upsert({ candidate_id: candidateId, ...updateData }, { onConflict: 'candidate_id' });

  // Fire-and-forget: generate AI summary and store in cache
  if (resumeText && process.env.GEMINI_API_KEY) {
    const { generateResumeSummary } = require('../services/gemini.cjs');
    generateResumeSummary(resumeText).then(summaryData => {
      const entry = resumeCache.get(candidateId);
      if (entry) {
        entry.aiSummary = summaryData;
        resumeCache.set(candidateId, entry);
      }
      // Persist headline to DB profile (best-effort)
      if (summaryData.headline) {
        supabase.from('candidate_profiles')
          .upsert({ candidate_id: candidateId, title: summaryData.headline }, { onConflict: 'candidate_id' })
          .then(() => {}).catch(() => {});
      }
    }).catch(() => {});
  }

  return res.json({
    success: true,
    message: 'Resume uploaded and processed successfully',
    filename: req.file.originalname,
    size: req.file.size,
    textLength: resumeText.length,
    extractedInfo,
    skills: skills || [],
    cached: true,
  });

});

// ── GET /api/resume/status ────────────────────────────────────────────────
// Check if a candidate has a resume in cache
router.get('/status', requireAuth, async (req, res) => {
  const candidateId = req.user.id;
  const cached = resumeCache.get(candidateId);
  if (cached) {
    if (!cached.skills) {
      const { extractSkillsFromResume } = require('../services/gemini.cjs');
      try {
        cached.skills = await extractSkillsFromResume(cached.text);
      } catch {
        cached.skills = [];
      }
      resumeCache.set(candidateId, cached);
    }
    return res.json({
      hasResume: true,
      filename: cached.filename,
      uploadedAt: cached.uploadedAt,
      textLength: cached.text.length,
      skills: cached.skills || [],
    });
  }
  return res.json({ hasResume: false });
});

// ── GET /api/resume/candidate/:id ─────────────────────────────────────────
// Recruiter fetches a candidate's resume text (for AI analysis)
router.get('/candidate/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Recruiters only' });
  const cached = resumeCache.get(req.params.id);
  if (cached) {
    return res.json({ text: cached.text, filename: cached.filename, uploadedAt: cached.uploadedAt });
  }
  return res.json({ text: null, filename: null });
});

// In-memory store: candidateId -> Array of self-analysis records
const selfAnalysisCache = new Map();

// ── POST /api/resume/analyze ──────────────────────────────────────────────
router.post('/analyze', requireAuth, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Only candidates can trigger resume analysis' });
  }

  const candidateId = req.user.id;
  const cached = resumeCache.get(candidateId);
  if (!cached || !cached.text) {
    return res.status(404).json({ error: 'No resume found. Please upload a resume first.' });
  }

  const { analyzeResumeSelf } = require('../services/gemini.cjs');

  try {
    const analysis = await analyzeResumeSelf({
      resumeText: cached.text,
      candidateName: `${req.user.first_name} ${req.user.last_name || ''}`.trim()
    });

    const dbRecord = {
      candidate_id: candidateId,
      resume_score: analysis.resumeScore,
      ats_score: analysis.atsScore,
      strengths: JSON.stringify(analysis.strengths),
      missing_skills: JSON.stringify(analysis.missingSkills),
      suggestions: JSON.stringify(analysis.suggestions),
      created_at: new Date().toISOString()
    };

    let analysisId = `anal-${Date.now()}`;
    try {
      const { data, error } = await supabase
        .from('resume_analysis')
        .insert(dbRecord)
        .select()
        .single();
      if (!error && data) {
        analysisId = data.analysis_id || data.id || analysisId;
      }
    } catch (dbErr) {
      console.warn('[Resume Analysis] Supabase insert failed, using fallback cache:', dbErr.message);
    }

    const newRecord = {
      analysis_id: analysisId,
      ...dbRecord,
      strengths: analysis.strengths,
      missing_skills: analysis.missingSkills,
      suggestions: analysis.suggestions
    };

    if (!selfAnalysisCache.has(candidateId)) {
      selfAnalysisCache.set(candidateId, []);
    }
    selfAnalysisCache.get(candidateId).push(newRecord);

    return res.json({ success: true, analysis: newRecord });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/resume/analysis/latest ─────────────────────────────────────────
router.get('/analysis/latest', requireAuth, async (req, res) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Access denied: private candidate report' });
  }

  const candidateId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('resume_analysis')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return res.json({
        success: true,
        analysis: {
          ...data,
          strengths: typeof data.strengths === 'string' ? JSON.parse(data.strengths) : data.strengths,
          missing_skills: typeof data.missing_skills === 'string' ? JSON.parse(data.missing_skills) : data.missing_skills,
          suggestions: typeof data.suggestions === 'string' ? JSON.parse(data.suggestions) : data.suggestions,
        }
      });
    }

    const records = selfAnalysisCache.get(candidateId) || [];
    if (records.length > 0) {
      const latest = records[records.length - 1];
      return res.json({ success: true, analysis: latest });
    }

    return res.status(404).json({ error: 'No resume analysis found. Run analyze first.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/resume/feedback ─────────────────────────────────────────────
// Candidate fetches their own constructive AI feedback
router.post('/feedback', requireAuth, async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'Candidates only' });
  
  const candidateId = req.user.id;
  const cached = resumeCache.get(candidateId);
  if (!cached || !cached.text) {
    return res.status(404).json({ error: 'No resume found. Please upload a resume first.' });
  }

  const { targetRole } = req.body;
  const { generateCandidateFeedback } = require('../services/gemini.cjs');

  try {
    const feedback = await generateCandidateFeedback(cached.text, targetRole || 'Software Engineer');
    return res.json({ success: true, feedback });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Export cache so applications.cjs can access it
module.exports = { router, resumeCache, selfAnalysisCache };
