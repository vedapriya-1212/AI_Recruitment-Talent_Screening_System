// ============================================================
// backend/middleware/auth.cjs
// ============================================================
const { supabase } = require('../db.cjs');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the Supabase access token (JWT)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Fetch the detailed user profile containing the role
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(401).json({ error: 'Unauthorized: User profile not found' });
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: ' + err.message });
  }
}

module.exports = { requireAuth };
