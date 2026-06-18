// Migration check script using plain fetch (no realtime/ws needed)
const SUPABASE_URL = 'https://bpljomioocweydydzctn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGpvbWlvb2N3ZXlkeWR6Y3RuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY2NzE1OCwiZXhwIjoyMDk3MjQzMTU4fQ.-VUAdCe4Ej0hgy8Gg3WsLLY8Ew0TNyVrlmGYF0UzaDc';

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

async function checkTable(name) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=id&limit=1`, { headers });
  if (res.ok) {
    const ct = res.headers.get('content-range');
    return { exists: true, count: ct };
  }
  const err = await res.text();
  return { exists: false, error: err };
}

async function runSQL(sql) {
  // Use PostgREST's rpc endpoint if available, otherwise try the pg endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  console.log('🔍 Checking Supabase tables...\n');
  
  const tables = ['users', 'candidates', 'candidate_profiles', 'jobs', 'job_applications', 'interviews'];
  const missing = [];
  
  for (const t of tables) {
    const result = await checkTable(t);
    if (result.exists) {
      console.log(`  ✅ ${t} — accessible (range: ${result.count})`);
    } else {
      console.log(`  ❌ ${t} — MISSING or inaccessible`);
      if (!['users','candidates','candidate_profiles'].includes(t)) missing.push(t);
    }
  }
  
  if (missing.length > 0) {
    console.log('\n⚠️  Missing tables:', missing.join(', '));
    console.log('\n📋 Copy and run this SQL in Supabase Dashboard → SQL Editor → New Query:\n');
    console.log('=' .repeat(60));
    console.log(`CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) DEFAULT 'AI Recruit Corp',
    description TEXT, requirements TEXT,
    location VARCHAR(255), experience_level VARCHAR(100),
    job_type VARCHAR(100), salary_range VARCHAR(100),
    skills_required TEXT, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(100) DEFAULT 'Applied', resume_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    interview_date DATE, interview_time VARCHAR(50),
    stage VARCHAR(100), status VARCHAR(100) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles DISABLE ROW LEVEL SECURITY;`);
    console.log('=' .repeat(60));
  } else {
    console.log('\n✅ All tables exist and are accessible!');
  }
}

main().catch(console.error);
