// ============================================================
// backend/routes/auth.cjs
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    // 1. Sign in via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return res.status(401).json({ error: authError.message });

    const userId = authData.user.id;
    const sessionToken = authData.session.access_token;

    // 2. Get or create user profile in public.users
    let { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      // Self-heal: insert missing profile
      const assignedRole = role || 'candidate';
      const parts = email.split('@')[0].split('.');
      const { data: newProfile, error: insertErr } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email,
          first_name: parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'User',
          last_name:  parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Account',
          role: assignedRole,
          password_hash: 'managed_by_supabase_auth',
        }, { onConflict: 'id' })
        .select()
        .single();
      if (insertErr) return res.status(500).json({ error: insertErr.message });
      profile = newProfile;
    } else if (role && profile.role !== role) {
      // Role correction: user logged in via different portal
      const { data: updated } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      if (updated) profile = updated;
    }

    return res.json({
      token: sessionToken,
      user: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;
  if (!email || !password || !first_name || !role) {
    return res.status(400).json({ error: 'Email, password, first name, and role are required' });
  }
  const safeLastName = last_name || '';
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    const { error: dbError } = await supabase.from('users').insert({
      id: userId, email, first_name, last_name: safeLastName, role,
      password_hash: 'managed_by_supabase_auth',
    });
    if (dbError) return res.status(500).json({ error: dbError.message });

    // Seed candidate profile if needed
    if (role === 'candidate') {
      await supabase.from('candidates').upsert({ id: userId });
      await supabase.from('candidate_profiles').upsert({
        candidate_id: userId, completion_percentage: 0, views_count: 0,
      }, { onConflict: 'candidate_id' });
    }

    return res.json({
      token: authData.session?.access_token,
      user: { id: userId, email, first_name, last_name, role },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  (verify token, return profile)
router.get('/me', async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    return res.json({
      id: profile.id, email: profile.email,
      first_name: profile.first_name, last_name: profile.last_name, role: profile.role,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
