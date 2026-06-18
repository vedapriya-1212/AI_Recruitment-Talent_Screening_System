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

  // Store in memory cache
  resumeCache.set(candidateId, {
    text: resumeText,
    filename: req.file.originalname,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
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

  return res.json({
    success: true,
    message: 'Resume uploaded and processed successfully',
    filename: req.file.originalname,
    size: req.file.size,
    textLength: resumeText.length,
    extractedInfo,
    cached: true,
  });
});

// ── GET /api/resume/status ────────────────────────────────────────────────
// Check if a candidate has a resume in cache
router.get('/status', requireAuth, async (req, res) => {
  const candidateId = req.user.id;
  const cached = resumeCache.get(candidateId);
  if (cached) {
    return res.json({
      hasResume: true,
      filename: cached.filename,
      uploadedAt: cached.uploadedAt,
      textLength: cached.text.length,
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

// Export cache so applications.cjs can access it
module.exports = { router, resumeCache };
