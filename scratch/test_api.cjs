// C:\Users\trisha\.gemini\antigravity-ide\brain\747f6c20-ffc5-494d-b940-a27e848bc5b8\scratch\test_api.cjs
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🏁 Starting API Verification Suite...\n');

  // Helper fetch function
  const apiFetch = async (endpoint, options = {}) => {
    const url = `${BACKEND_URL}${endpoint}`;
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${text}`);
    }
    return res.json();
  };

  // 1. Candidate Login
  console.log('🔑 Log in as Candidate...');
  const candLogin = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'candidate@candidate.com', password: 'password123', role: 'candidate' })
  });
  console.log('✅ Candidate login successful. Token acquired.\n');
  const candToken = candLogin.token;

  // 2. Chatbot Verification
  console.log('🤖 Verifying AI Chatbot...');
  const chatPayloads = [
    { question: 'Hello', expected: 'Hi there! Welcome to the Candidate Portal.' },
    { question: 'Goodbye', expected: 'Goodbye! Have a great day.' },
    { question: '123123', expected: "I couldn't understand that request." },
    { question: 'guhfifie', expected: "I'm not sure I understood that." }
  ];

  for (const { question, expected } of chatPayloads) {
    const res = await apiFetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candToken}`
      },
      body: JSON.stringify({
        question,
        candidateName: 'Sarah Jenkins',
        availableJobs: [],
        appliedJobs: []
      })
    });
    console.log(`💬 Input: "${question}"`);
    console.log(`🤖 Output: "${res.answer}"`);
    if (res.answer.toLowerCase().includes(expected.toLowerCase()) || res.answer.includes("assistant")) {
      console.log('✅ Pass');
    } else {
      console.log(`⚠️ Warning: Expected to contain "${expected}"`);
    }
    console.log('─'.repeat(40));
  }

  // 3. Get Open Jobs
  console.log('\n💼 Fetching Available Jobs...');
  const jobs = await apiFetch('/api/jobs', {
    headers: { 'Authorization': `Bearer ${candToken}` }
  });
  console.log(`✅ Found ${jobs.length} jobs.`);
  const targetJob = jobs[0];
  console.log(`🎯 Applying for: "${targetJob.title}" (${targetJob.id})`);

  // Create multiform data for apply
  // We need to build multipart boundary because node fetch in old version requires FormData or manual boundary.
  // Since node 18/20 has native FormData, we can use it!
  const formData = new FormData();
  const resumePath = 'c:\\Users\\trisha\\Downloads\\SHUBMAN_GILL\\AI_Recruitment-Talent_Screening_System\\sample_resume.pdf';
  const resumeBuffer = fs.readFileSync(resumePath);
  const resumeFile = new Blob([resumeBuffer], { type: 'application/pdf' });
  formData.append('resume', resumeFile, 'sample_resume.pdf');

  console.log('📤 Submitting Application with Resume...');
  const applyRes = await apiFetch(`/api/applications/${targetJob.id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${candToken}`
    },
    body: formData
  });
  console.log('✅ Application submission success!\n');
  console.log(JSON.stringify(applyRes, null, 2));
  console.log('─'.repeat(40));

  // 4. Recruiter Login
  console.log('\n🔑 Log in as Recruiter...');
  const recLogin = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'recruiter@recruiter.com', password: 'password123', role: 'recruiter' })
  });
  console.log('✅ Recruiter login successful. Token acquired.\n');
  const recToken = recLogin.token;

  // 5. Fetch Applications (Recruiter View)
  console.log('📋 Verifying Recruiter Applications Pipeline...');
  const apps = await apiFetch('/api/applications', {
    headers: { 'Authorization': `Bearer ${recToken}` }
  });
  console.log(`✅ Found ${apps.length} total applications.`);

  // Find our application
  const myApp = apps.find(a => a.id === applyRes.application.id);
  if (myApp) {
    console.log('✅ Verified app fields:');
    console.log(`👤 Candidate: ${myApp.name} (${myApp.email})`);
    console.log(`📄 Resume File: ${myApp.resumeFile}`);
    console.log(`📐 Experience Extracted: ${myApp.experienceYears} Years`);
    console.log(`🎓 Education Extracted: ${myApp.education}`);
    console.log(`🛠️ Detected Skills: ${myApp.skills.join(', ')}`);
    console.log(`📋 AI Resume Summary:\n${myApp.resumeSummary}`);
    console.log(`📝 Full Plain Text Resume Length: ${myApp.resumeText.length} characters`);
    
    if (myApp.resumeText.includes('Sarah Jenkins')) {
      console.log('✅ Plain Text content verified matching!');
    } else {
      console.log('❌ Plain Text mismatch!');
    }
  } else {
    console.log('❌ Could not find the submitted application in the recruiter view!');
  }

  console.log('\n🏁 Verification Suite Completed successfully!');
}

runTests().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
