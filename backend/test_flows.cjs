// ============================================================
// backend/test_flows.cjs
// Automated test script to verify Flow 1 & Flow 2 structures
// ============================================================
const assert = require('assert');
const { analyzeResumeSelf, analyzeJobMatch } = require('./services/gemini.cjs');

const mockResumeText = `
John Doe
Software Engineer
Contact: john.doe@email.com
Experience:
- Senior Software Engineer at TechCorp (2022 - Present)
  Built React applications, optimized frontend performance by 40%, and managed state with Zustand.
  Wrote Python APIs using FastAPI and deployed microservices.
- Web Developer at StartupCo (2020 - 2022)
  Developed interactive user interfaces using JavaScript, TypeScript, and CSS.
Skills: React, TypeScript, JavaScript, Python, FastAPI, SQL, Git, HTML, CSS.
`;

const mockJobTitle = "Senior React Developer";
const mockJobDescription = "We are looking for a Senior React Developer who has experience with React, TypeScript, state management, and deploying code. Exposure to AWS and Docker is a big plus.";
const mockSkillsRequired = "React, TypeScript, AWS, Docker, Git";
const mockRequirements = "3+ years of frontend experience, B.S. in Computer Science or equivalent.";

async function runTests() {
  console.log("🚀 Starting Flow 1 and Flow 2 AI Analysis Verification Tests...\n");

  try {
    // ── TEST FLOW 1: Candidate Self Resume Analysis (Private) ────────────────
    console.log("🧪 Testing Flow 1: Candidate Self Resume Analysis...");
    const selfAnalysis = await analyzeResumeSelf({
      resumeText: mockResumeText,
      candidateName: "John Doe"
    });

    console.log("   Output fields:");
    console.log("   - resumeScore:", selfAnalysis.resumeScore);
    console.log("   - atsScore:", selfAnalysis.atsScore);
    console.log("   - strengths:", selfAnalysis.strengths);
    console.log("   - missingSkills:", selfAnalysis.missingSkills);
    console.log("   - suggestions:", selfAnalysis.suggestions);

    assert.ok(typeof selfAnalysis.resumeScore === 'number', "resumeScore must be a number");
    assert.ok(selfAnalysis.resumeScore >= 0 && selfAnalysis.resumeScore <= 100, "resumeScore must be between 0 and 100");
    assert.ok(typeof selfAnalysis.atsScore === 'number', "atsScore must be a number");
    assert.ok(selfAnalysis.atsScore >= 0 && selfAnalysis.atsScore <= 100, "atsScore must be between 0 and 100");
    assert.ok(Array.isArray(selfAnalysis.strengths), "strengths must be an array");
    assert.ok(Array.isArray(selfAnalysis.missingSkills), "missingSkills must be an array");
    assert.ok(Array.isArray(selfAnalysis.suggestions), "suggestions must be an array");
    console.log("✅ Flow 1 verification passed!\n");

    // ── TEST FLOW 2: Job Application Resume Analysis (Recruiter Evaluation) ────
    console.log("🧪 Testing Flow 2: Job Application Resume Analysis...");
    const jobMatch = await analyzeJobMatch({
      resumeText: mockResumeText,
      candidateName: "John Doe",
      jobTitle: mockJobTitle,
      jobDescription: mockJobDescription,
      skillsRequired: mockSkillsRequired,
      requirements: mockRequirements
    });

    console.log("   Output fields:");
    console.log("   - matchScore:", jobMatch.matchScore);
    console.log("   - matchingSkills:", jobMatch.matchingSkills);
    console.log("   - missingSkills:", jobMatch.missingSkills);
    console.log("   - experienceRelevance:", jobMatch.experienceRelevance);
    console.log("   - recommendation:", jobMatch.recommendation);

    assert.ok(typeof jobMatch.matchScore === 'number', "matchScore must be a number");
    assert.ok(jobMatch.matchScore >= 0 && jobMatch.matchScore <= 100, "matchScore must be between 0 and 100");
    assert.ok(Array.isArray(jobMatch.matchingSkills), "matchingSkills must be an array");
    assert.ok(Array.isArray(jobMatch.missingSkills), "missingSkills must be an array");
    assert.ok(typeof jobMatch.experienceRelevance === 'string', "experienceRelevance must be a string");
    assert.ok(typeof jobMatch.recommendation === 'string', "recommendation must be a string");
    console.log("✅ Flow 2 verification passed!\n");

    console.log("🎉 All Flow 1 & Flow 2 verification tests PASSED successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Test failed with error:", err.message);
    process.exit(1);
  }
}

runTests();
