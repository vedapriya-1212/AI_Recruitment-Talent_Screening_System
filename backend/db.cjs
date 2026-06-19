// ============================================================
// backend/db.cjs  –  Supabase admin client (service-role key)
// ============================================================
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://bpljomioocweydydzctn.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGpvbWlvb2N3ZXlkeWR6Y3RuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY2NzE1OCwiZXhwIjoyMDk3MjQzMTU4fQ.-VUAdCe4Ej0hgy8Gg3WsLLY8Ew0TNyVrlmGYF0UzaDc';

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_KEY,
  { 
    auth: { persistSession: false },
    realtime: { transport: WebSocket }
  }
);

module.exports = { supabase };
