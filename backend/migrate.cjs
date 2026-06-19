// ============================================================
// backend/migrate.cjs  –  Run all table creation + RLS disable
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPABASE_URL = 'https://bpljomioocweydydzctn.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGpvbWlvb2N3ZXlkeWR6Y3RuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY2NzE1OCwiZXhwIjoyMDk3MjQzMTU4fQ.-VUAdCe4Ej0hgy8Gg3WsLLY8Ew0TNyVrlmGYF0UzaDc';

const BASE_HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

// ─── Check if a table exists ────────────────────────────────────────────────
async function tableExists(name) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=id&limit=1`, {
    headers: BASE_HEADERS,
  });
  return res.ok;
}

// ─── Create table via RPC if the exec_sql function exists ──────────────────
async function tryRpcExec(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: BASE_HEADERS,
    body: JSON.stringify({ sql }),
  });
  return res.ok;
}

// ─── Main migration runner ──────────────────────────────────────────────────
async function run() {
  console.log('\n🚀  AI Recruit – Database Migration\n' + '─'.repeat(45));

  // List of tables to verify
  const tables = ['users', 'candidates', 'candidate_profiles', 'jobs', 'job_applications', 'interviews'];
  const missing = [];

  for (const t of tables) {
    const ok = await tableExists(t);
    console.log(`  ${ok ? '✅' : '❌'}  ${t}`);
    if (!ok) missing.push(t);
  }

  if (missing.length === 0) {
    console.log('\n✅  All tables are accessible – no migration needed.\n');
    return true;
  }

  console.log(`\n⚠️   Missing: ${missing.join(', ')}`);
  console.log('   Attempting to create via RPC exec_sql…\n');

  const sql = `
    CREATE TABLE IF NOT EXISTS jobs (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recruiter_id     UUID REFERENCES users(id),
      title            VARCHAR(255) NOT NULL,
      company          VARCHAR(255) DEFAULT 'AI Recruit Corp',
      description      TEXT,
      requirements     TEXT,
      location         VARCHAR(255),
      experience_level VARCHAR(100),
      job_type         VARCHAR(100),
      salary_range     VARCHAR(100),
      skills_required  TEXT,
      is_active        BOOLEAN DEFAULT true,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id               UUID REFERENCES jobs(id)  ON DELETE CASCADE,
      candidate_id         UUID REFERENCES users(id) ON DELETE CASCADE,
      status               VARCHAR(100) DEFAULT 'Applied',
      resume_url           TEXT,
      last_notified_status VARCHAR(100),
      applied_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(job_id, candidate_id)
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id   UUID REFERENCES users(id) ON DELETE CASCADE,
      job_id         UUID REFERENCES jobs(id)  ON DELETE CASCADE,
      interview_date DATE,
      interview_time VARCHAR(50),
      stage          VARCHAR(100),
      status         VARCHAR(100) DEFAULT 'Scheduled',
      created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pending_registrations (
      email            VARCHAR(255) PRIMARY KEY,
      otp_code         VARCHAR(6) NOT NULL,
      expires_at       TIMESTAMP WITH TIME ZONE NOT NULL,
      first_name       VARCHAR(255) NOT NULL,
      last_name        VARCHAR(255),
      role             VARCHAR(50) NOT NULL,
      password         VARCHAR(255) NOT NULL,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipient        VARCHAR(255) NOT NULL,
      subject          VARCHAR(255) NOT NULL,
      body             TEXT NOT NULL,
      status           VARCHAR(50) DEFAULT 'Sent',
      candidate_name   VARCHAR(255),
      candidate_email  VARCHAR(255),
      job_title        VARCHAR(255),
      status_trigger   VARCHAR(100),
      error_message    TEXT,
      sent_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS ai_summary JSONB;

    CREATE TABLE IF NOT EXISTS resume_analysis (
      analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
      resume_score INTEGER,
      ats_score INTEGER,
      strengths TEXT,
      missing_skills TEXT,
      suggestions TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS application_id UUID DEFAULT gen_random_uuid();
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS application_status VARCHAR(100) DEFAULT 'Applied';
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_file VARCHAR(255);
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_summary TEXT;
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_text TEXT;
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS experience_years INTEGER;
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS education VARCHAR(255);
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS detected_skills TEXT;
    ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS last_notified_status VARCHAR(100);

    -- email_logs enrichment columns (safe to add on existing tables)
    ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS candidate_name  VARCHAR(255);
    ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS candidate_email VARCHAR(255);
    ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS job_title       VARCHAR(255);
    ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS status_trigger  VARCHAR(100);
    ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS error_message   TEXT;

    CREATE OR REPLACE FUNCTION sync_job_applications()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        NEW.application_id := COALESCE(NEW.application_id, NEW.id);
        NEW.id := COALESCE(NEW.id, NEW.application_id);
        NEW.application_status := COALESCE(NEW.application_status, NEW.status);
        NEW.status := COALESCE(NEW.status, NEW.application_status);
        NEW.created_at := COALESCE(NEW.created_at, NEW.applied_at);
        NEW.applied_at := COALESCE(NEW.applied_at, NEW.created_at);
      ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.application_status IS DISTINCT FROM OLD.application_status THEN
          NEW.status := NEW.application_status;
        ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
          NEW.application_status := NEW.status;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_sync_job_applications ON job_applications;
    CREATE TRIGGER trigger_sync_job_applications
    BEFORE INSERT OR UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION sync_job_applications();

    CREATE TABLE IF NOT EXISTS application_analysis (
      analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID,
      match_score INTEGER,
      matching_skills TEXT,
      missing_skills TEXT,
      recommendation TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE jobs             DISABLE ROW LEVEL SECURITY;
    ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
    ALTER TABLE interviews       DISABLE ROW LEVEL SECURITY;
    ALTER TABLE users            DISABLE ROW LEVEL SECURITY;
    ALTER TABLE candidates       DISABLE ROW LEVEL SECURITY;
    ALTER TABLE candidate_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE pending_registrations DISABLE ROW LEVEL SECURITY;
    ALTER TABLE email_logs             DISABLE ROW LEVEL SECURITY;
    ALTER TABLE resume_analysis        DISABLE ROW LEVEL SECURITY;
    ALTER TABLE application_analysis   DISABLE ROW LEVEL SECURITY;
  `;

  const ok = await tryRpcExec(sql);
  if (ok) {
    console.log('✅  Created via RPC exec_sql.\n');
    return true;
  }

  // RPC not available – print SQL for manual run
  console.log('❌  RPC exec_sql not available.\n');
  console.log('▶  Please run this SQL in Supabase Dashboard → SQL Editor:\n');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  return false;
}

run().then(ok => {
  process.exit(ok ? 0 : 1);
}).catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
