// ============================================================
// backend/db.cjs  –  Supabase admin client (service-role key)
// ============================================================
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { 
    auth: { persistSession: false },
    realtime: { transport: WebSocket }
  }
);

module.exports = { supabase };
