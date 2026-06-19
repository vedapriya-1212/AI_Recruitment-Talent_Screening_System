// ─────────────────────────────────────────────────────────────────────────────
// backend/add-email-columns.cjs
// Adds last_notified_status to job_applications, and metadata columns to
// email_logs using the Supabase service-role REST API.
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPABASE_URL = 'https://bpljomioocweydydzctn.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGpvbWlvb2N3ZXlkeWR6Y3RuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY2NzE1OCwiZXhwIjoyMDk3MjQzMTU4fQ.-VUAdCe4Ej0hgy8Gg3WsLLY8Ew0TNyVrlmGYF0UzaDc';

const HEADERS = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
};

async function tryAddColumn(table, column, type) {
  // Try inserting a dummy row with only that column set to null to detect if column exists
  const sql = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type};`;
  console.log(`  → ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);

  // Use the RPC endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ sql }),
  });

  if (res.ok) {
    console.log(`    ✅ OK`);
  } else {
    const text = await res.text();
    console.warn(`    ⚠️  RPC not available (${res.status}): ${text.substring(0, 120)}`);
    console.log(`    ℹ️  Run manually in Supabase SQL Editor: ${sql}`);
  }
}

async function run() {
  console.log('\n🔧  Email Columns Migration\n' + '─'.repeat(45));

  // job_applications
  await tryAddColumn('job_applications', 'last_notified_status', 'VARCHAR(100)');

  // email_logs
  await tryAddColumn('email_logs', 'candidate_name',  'VARCHAR(255)');
  await tryAddColumn('email_logs', 'candidate_email', 'VARCHAR(255)');
  await tryAddColumn('email_logs', 'job_title',       'VARCHAR(255)');
  await tryAddColumn('email_logs', 'status_trigger',  'VARCHAR(100)');
  await tryAddColumn('email_logs', 'error_message',   'TEXT');

  console.log('\n🏁  Done. If any ALTER failed, paste the SQL into Supabase Dashboard → SQL Editor.\n');

  // Print SQL for manual run if needed
  const manualSQL = `
-- Run this in Supabase Dashboard → SQL Editor if the script above failed:
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS last_notified_status VARCHAR(100);

ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS candidate_name  VARCHAR(255);
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS candidate_email VARCHAR(255);
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS job_title       VARCHAR(255);
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS status_trigger  VARCHAR(100);
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS error_message   TEXT;
  `.trim();

  console.log('📋  Manual SQL (paste into Supabase if needed):');
  console.log('─'.repeat(60));
  console.log(manualSQL);
  console.log('─'.repeat(60));
}

run().catch(console.error);
