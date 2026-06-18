// ============================================================
// backend/services/gemini.cjs
// Real AI screening using Google Gemini 1.5 Flash
// ============================================================
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

function getModel() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

/**
 * Analyze a resume against a job description using Gemini AI
 * @param {object} params
 * @param {string} params.resumeText - Extracted text from candidate's PDF resume
 * @param {string} params.candidateName - Candidate's name
 * @param {string} params.jobTitle - Job title
 * @param {string} params.jobDescription - Full job description
 * @param {string} params.skillsRequired - Comma-separated required skills
 * @param {string} params.requirements - Job requirements text
 * @returns {Promise<object>} AI screening report
 */
async function analyzeResumeWithGemini({ resumeText, candidateName, jobTitle, jobDescription, skillsRequired, requirements }) {
  const m = getModel();

  const prompt = `You are an expert AI recruitment screening assistant. Analyze the following resume against the job requirements and provide a detailed screening report.

## JOB DETAILS
**Title:** ${jobTitle}
**Description:** ${jobDescription || 'Not provided'}
**Required Skills:** ${skillsRequired || 'Not specified'}
**Requirements:** ${requirements || 'Not specified'}

## CANDIDATE RESUME TEXT
${resumeText || 'No resume uploaded yet'}

## INSTRUCTIONS
Analyze the candidate's resume carefully against the job requirements. Return ONLY a valid JSON object with the following structure (no markdown, no explanation, just raw JSON):

{
  "matchScore": <number 0-100, overall match percentage>,
  "technicalScore": <number 0-100, technical skills alignment>,
  "communicationScore": <number 0-100, based on resume clarity, writing quality>,
  "resumeScore": <number 0-100, resume quality and completeness>,
  "overallScore": <number 0-100, weighted average>,
  "experienceYears": <number, estimated years of experience>,
  "education": "<highest education qualification found>",
  "extractedSkills": ["skill1", "skill2", ...],
  "screeningReport": {
    "parsedSummary": "<2-3 sentence professional analysis of the candidate's profile vs this role>",
    "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
    "weaknesses": ["<specific gap 1>", "<specific gap 2>"],
    "keywordMatch": <number 0-100, percentage of required skills found in resume>,
    "technicalFit": <number 0-100>,
    "experienceFit": <number 0-100>,
    "recommendation": "<one of: STRONG HIRE | PROCEED TO INTERVIEW | REQUEST PORTFOLIO | HOLD FOR REVIEW | DO NOT PROCEED>",
    "confidence": <number 60-99, AI confidence in analysis>,
    "suggestions": ["<actionable suggestion for recruiter 1>", "<suggestion 2>", "<suggestion 3>"]
  }
}

Be specific and accurate. Base all scores on what's actually in the resume vs the job requirements.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up response - remove markdown code blocks if present
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error('Gemini API error:', err.message);
    throw new Error('AI analysis failed: ' + err.message);
  }
}

/**
 * Quick skill extraction from resume text (lightweight, no full analysis)
 */
async function extractSkillsFromResume(resumeText) {
  const m = getModel();
  const prompt = `Extract all technical skills, programming languages, frameworks, and tools mentioned in this resume text. Return ONLY a JSON array of strings, no explanation:

${resumeText.slice(0, 3000)}

Return format: ["skill1", "skill2", ...]`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

module.exports = { analyzeResumeWithGemini, extractSkillsFromResume };
