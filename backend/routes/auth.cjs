// ============================================================
// backend/routes/auth.cjs
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase } = require('../db.cjs');

// In-memory pending registrations cache: email -> { otp_code, expires_at, first_name, last_name, role, password }
const pendingRegistrations = new Map();

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
  const { email, password, first_name, last_name, role, otp } = req.body;
  if (!email || !password || !first_name || !role) {
    return res.status(400).json({ error: 'Email, password, first name, and role are required' });
  }
  const safeLastName = last_name || '';

  try {
    // 1. Check if user already exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // 2. If OTP is NOT provided, generate it and send it
    /*if (!otp) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Save to pendingRegistrations map
      pendingRegistrations.set(email.toLowerCase(), {
        otp_code: otpCode,
        expires_at: expiresAt,
        first_name,
        last_name: safeLastName,
        role,
        password
      });

      // Send OTP via SMTP
      const { sendEmail } = require('../services/email.cjs');
      await sendEmail({
        to: email,
        subject: 'Your AI Recruit Verification Code',
        text: `Hello ${first_name},\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.`,
        html: `<p>Hello ${first_name},</p><p>Your 6-digit verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 5 minutes.</p>`
      });

      return res.json({ otpRequired: true, message: 'OTP sent to email' });
    }*/
   if (!otp) {
  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email,
      password,
    });

  if (authError) {
    return res.status(400).json({
      error: authError.message,
    });
  }

  const userId = authData.user.id;

  const { error: dbError } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email,
        first_name,
        last_name: safeLastName,
        role,
        password_hash: 'managed_by_supabase_auth',
      },
      { onConflict: 'id' }
    );

  if (dbError) {
    console.warn(dbError.message);
  }

  if (role === 'candidate') {
    try {
      await supabase
        .from('candidate_profiles')
        .upsert(
          {
            candidate_id: userId,
            completion_percentage: 0,
            views_count: 0,
          },
          { onConflict: 'candidate_id' }
        );
    } catch (e) {
      console.warn(e.message);
    }
  }

  return res.json({
    token: authData.session?.access_token || null,
    user: {
      id: userId,
      email,
      first_name,
      last_name: safeLastName,
      role,
    },
  });
}

    // 3. OTP is provided - verify it
    const pending = pendingRegistrations.get(email.toLowerCase());

    if (!pending) {
      return res.status(400).json({ error: 'No pending registration found for this email. Please request a new OTP.' });
    }

    // Check expiration
    if (new Date() > new Date(pending.expires_at)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
    }

    // Verify code
    if (pending.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    // OTP matches! Complete registration
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // Upsert profile
    const { error: dbError } = await supabase.from('users').upsert({
      id: userId, email, first_name, last_name: safeLastName, role,
      password_hash: 'managed_by_supabase_auth',
    }, { onConflict: 'id' });
    if (dbError) console.warn('Profile upsert warning:', dbError.message);

    // Seed candidate profile if needed
    if (role === 'candidate') {
      try {
        await supabase.from('candidate_profiles').upsert({
          candidate_id: userId, completion_percentage: 0, views_count: 0,
        }, { onConflict: 'candidate_id' });
      } catch (e) { console.warn('candidate_profiles seed:', e.message); }
    }

    // Delete pending registration
    pendingRegistrations.delete(email.toLowerCase());

    // Auto-login to return session token
    let token = authData.session?.access_token;
    if (!token) {
      try {
        const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
        token = loginData?.session?.access_token;
      } catch (e) { /* fallback if auto-login not possible */ }
    }

    return res.json({
      token: token || null,
      emailConfirmationRequired: !token,
      user: { id: userId, email, first_name, last_name: safeLastName, role },
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const pending = pendingRegistrations.get(email.toLowerCase());

    if (!pending) {
      return res.status(400).json({ error: 'No pending registration found for this email.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Update pending record
    pending.otp_code = otpCode;
    pending.expires_at = expiresAt;
    pendingRegistrations.set(email.toLowerCase(), pending);

    // Send OTP via SMTP
    const { sendEmail } = require('../services/email.cjs');
    await sendEmail({
      to: email,
      subject: 'Your AI Recruit Verification Code (Resent)',
      text: `Hello ${pending.first_name},\n\nYour new 6-digit verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.`,
      html: `<p>Hello ${pending.first_name},</p><p>Your new 6-digit verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 5 minutes.</p>`
    });

    return res.json({ success: true, message: 'OTP code has been resent to your email.' });
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
