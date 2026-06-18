import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually to avoid extra dependencies
const envPath = path.resolve('.env');
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
}

const supabaseUrl = env['VITE_SUPABASE_URL'] || '';
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'] || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_PASSWORD = 'password123';
const DEFAULT_HASH = '$2b$10$EPV6YVwV8zP/VpGk4v9BCOhK3N/JmY5lUvT6/p0H9Hw/4K5H/oK5y'; // bcrypt mock hash

async function seed() {
  console.log('Starting Supabase database seeding using Service Role Key...');

  try {
    // 1. Create Recruiter Auth Account
    console.log('Seeding Recruiter account...');
    let recruiterId = '';
    const { data: listRecruiters, error: listRecError } = await supabase.auth.admin.listUsers();
    if (listRecError) throw listRecError;

    const existingRecruiter = listRecruiters.users.find(u => u.email === 'recruiter@recruiter.com');
    if (existingRecruiter) {
      console.log('Recruiter auth user already exists.');
      recruiterId = existingRecruiter.id;
    } else {
      const { data: newRec, error: recError } = await supabase.auth.admin.createUser({
        email: 'recruiter@recruiter.com',
        password: DEFAULT_PASSWORD,
        email_confirm: true
      });
      if (recError) throw recError;
      recruiterId = newRec.user.id;
      console.log('Recruiter auth user created successfully.');
    }

    // Upsert public.users Recruiter profile
    const { error: recUserError } = await supabase
      .from('users')
      .upsert({
        id: recruiterId,
        first_name: 'Alex',
        last_name: 'Vance',
        email: 'recruiter@recruiter.com',
        role: 'recruiter',
        password_hash: DEFAULT_HASH
      });
    if (recUserError) throw recUserError;
    console.log('Recruiter database profile upserted.');


    // 2. Create Candidate Auth Account
    console.log('Seeding Candidate account...');
    let candidateId = '';
    const existingCandidate = listRecruiters.users.find(u => u.email === 'candidate@candidate.com');
    if (existingCandidate) {
      console.log('Candidate auth user already exists.');
      candidateId = existingCandidate.id;
    } else {
      const { data: newCand, error: candError } = await supabase.auth.admin.createUser({
        email: 'candidate@candidate.com',
        password: DEFAULT_PASSWORD,
        email_confirm: true
      });
      if (candError) throw candError;
      candidateId = newCand.user.id;
      console.log('Candidate auth user created successfully.');
    }

    // Upsert public.users Candidate profile
    const { error: candUserError } = await supabase
      .from('users')
      .upsert({
        id: candidateId,
        first_name: 'Sarah',
        last_name: 'Jenkins',
        email: 'candidate@candidate.com',
        role: 'candidate',
        password_hash: DEFAULT_HASH
      });
    if (candUserError) throw candUserError;
    console.log('Candidate database profile upserted.');

    // Upsert candidates general details
    await supabase.from('candidates').upsert({
      id: candidateId,
      phone: '+1 (555) 019-2834',
      summary: 'Senior React Architect with 6+ years designing design systems, custom state management contexts, and high-performance layout trees.'
    });

    // Upsert candidate profiles
    await supabase.from('candidate_profiles').upsert({
      candidate_id: candidateId,
      title: 'Senior React Architect',
      location: 'Remote, US',
      experience_years: 6,
      job_type: 'Full-time',
      expected_salary: '$150,000',
      completion_percentage: 95,
      views_count: 12
    }, { onConflict: 'candidate_id' });
    console.log('Candidate child profiles seeded.');


    // 3. Seed Jobs (Safely checking duplicates locally)
    console.log('Seeding jobs...');
    const jobList = [
      {
        title: 'Senior React Architect',
        company: 'AI Recruit Corp',
        description: 'We are seeking a Lead Frontend Architect to design core reusable modules, manage design tokens, and enforce layout parameters across enterprise components.',
        requirements: '5+ years writing production-grade React codebases\nExpert knowledge of TypeScript and bundler configs\nProven experience with CSS performance metrics',
        location: 'Remote, US',
        experience_level: 'Senior Level',
        job_type: 'Full-time',
        salary_range: '$140,000 - $180,000',
        skills_required: 'React,TypeScript,Tailwind CSS,Vite,Next.js,System Design',
        is_active: true,
        recruiter_id: recruiterId
      },
      {
        title: 'Lead Machine Learning Engineer',
        company: 'AI Core Labs',
        description: 'Join the intelligence squad deploying large transformer modules, embedding vector coordinates, and tuning hyperparameter coefficients.',
        requirements: 'MS/PhD in Computer Science or similar algorithmic focus\nDeep understanding of PyTorch or JAX framework engines\nExperience deploying containerized architectures',
        location: 'San Francisco, CA (Hybrid)',
        experience_level: 'Lead / Principal',
        job_type: 'Full-time',
        salary_range: '$180,000 - $220,000',
        skills_required: 'Python,PyTorch,Vector Databases,Transformers,Kubernetes,FastAPI',
        is_active: true,
        recruiter_id: recruiterId
      },
      {
        title: 'Security Operations Lead',
        company: 'ZeroTrust Inc',
        description: 'Deploy real-time vulnerability detection checkers, audit database credentials access logs, and fortify enterprise gateway boundaries.',
        requirements: 'Expert knowledge of zero-trust network modules\nExperience auditing cloud databases and Supabase policies\nBackground handling credential encryption keys',
        location: 'Remote, Europe',
        experience_level: 'Mid-Senior Level',
        job_type: 'Full-time',
        salary_range: '$130,000 - $160,000',
        skills_required: 'Rust,Go,Cloud Security,Kubernetes,Supabase,Zero Trust',
        is_active: true,
        recruiter_id: recruiterId
      }
    ];

    const { data: existingJobs } = await supabase.from('jobs').select('id, title');
    const existingJobsMap = new Map((existingJobs || []).map(j => [j.title, j.id]));

    const jobsToInsert = [];
    const jobsToUpdate = [];

    for (const job of jobList) {
      if (existingJobsMap.has(job.title)) {
        jobsToUpdate.push({
          id: existingJobsMap.get(job.title),
          ...job
        });
      } else {
        jobsToInsert.push(job);
      }
    }

    if (jobsToInsert.length > 0) {
      const { error: insErr } = await supabase.from('jobs').insert(jobsToInsert);
      if (insErr) throw insErr;
    }
    if (jobsToUpdate.length > 0) {
      const { error: updErr } = await supabase.from('jobs').upsert(jobsToUpdate);
      if (updErr) throw updErr;
    }

    const { data: dbJobs, error: jobsError } = await supabase.from('jobs').select('*');
    if (jobsError) throw jobsError;
    console.log(`Seeded/Synced ${dbJobs.length} active jobs.`);


    // 4. Seed Applications
    console.log('Seeding job applications...');
    const targetJob = dbJobs.find(j => j.title === 'Senior React Architect');
    if (targetJob) {
      const { error: appError } = await supabase
        .from('job_applications')
        .upsert({
          job_id: targetJob.id,
          candidate_id: candidateId,
          status: 'Interview Scheduled'
        }, { onConflict: 'job_id, candidate_id' });
      if (appError) throw appError;
      console.log('Candidate application seeded for Senior React Architect.');

      // 5. Seed Interviews
      console.log('Seeding scheduled interviews...');
      
      // Try to delete old ones first to prevent duplications
      await supabase.from('interviews').delete().eq('candidate_id', candidateId);

      const { error: meetError } = await supabase
        .from('interviews')
        .insert({
          candidate_id: candidateId,
          job_id: targetJob.id,
          interview_date: new Date().toISOString().split('T')[0],
          interview_time: '14:00:00',
          stage: 'Technical Review',
          status: 'Confirmed'
        });
      if (meetError) {
        console.warn('Interviews insert failed (table might not be created yet):', meetError.message);
      } else {
        console.log('Scheduled interview meeting seeded.');
      }
    }

    console.log('\n🚀 Supabase Seeding Completed Successfully! You can now log in with:');
    console.log('Recruiter: recruiter@recruiter.com / password123');
    console.log('Candidate: candidate@candidate.com / password123');

  } catch (err) {
    console.error('Error seeding Supabase database:', err);
  }
}

seed();
