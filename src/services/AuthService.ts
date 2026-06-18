export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'recruiter';
  avatar_url?: string;
}

class AuthService {
  async login(email: string, password_hash: string, selectedRole?: 'candidate' | 'recruiter'): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password_hash, role: selectedRole })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.error || 'Authentication failed.');
        (err as any).isApiResponse = true;
        throw err;
      }

      const { token, user } = await res.json();
      
      // Save token and user profile
      localStorage.setItem('ats_token', token);
      localStorage.setItem('demo_user_session', JSON.stringify(user));
      
      return user;
    } catch (err: any) {
      // Proactively propagate real validation/auth errors to the UI
      if (err.isApiResponse) {
        throw err;
      }

      console.warn('API login connection failed, running demo fallback:', err);
      // Run fallback for offline/demo environments
      const emailLower = email.toLowerCase();
      let userProfile: UserProfile;
      if (emailLower === 'recruiter@recruiter.com') {
        userProfile = {
          id: 'demo-recruiter-uuid',
          email: 'recruiter@recruiter.com',
          first_name: 'Alex',
          last_name: 'Vance',
          role: 'recruiter',
        };
      } else if (emailLower === 'candidate@candidate.com') {
        userProfile = {
          id: 'demo-candidate-uuid',
          email: 'candidate@candidate.com',
          first_name: 'Sarah',
          last_name: 'Jenkins',
          role: 'candidate',
        };
      } else {
        const isRecruiter = selectedRole === 'recruiter' ||
          (!selectedRole && (emailLower.includes('recruiter') || emailLower.includes('admin') || emailLower.includes('hr')));
        const role = isRecruiter ? 'recruiter' : 'candidate';
        const nameParts = emailLower.split('@')[0].split('.');
        userProfile = {
          id: `mock-${role}-${Math.random().toString(36).substr(2, 9)}`,
          email,
          first_name: nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User',
          last_name: nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User',
          role,
        };
      }
      localStorage.setItem('ats_token', 'mock_offline_token');
      localStorage.setItem('demo_user_session', JSON.stringify(userProfile));
      return userProfile;
    }
  }

  async signup(
    email: string,
    password_hash: string,
    first_name: string,
    last_name: string,
    role: 'candidate' | 'recruiter'
  ): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password_hash, first_name, last_name, role })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.error || 'Registration failed.');
        (err as any).isApiResponse = true;
        throw err;
      }

      const result = await res.json();
      const { token, user, emailConfirmationRequired } = result;
      
      // Store token if we have one; otherwise use a special marker
      if (token) {
        localStorage.setItem('ats_token', token);
      } else if (emailConfirmationRequired) {
        // No session yet — Supabase needs email confirmation
        // Store a temp token so getCurrentUser() falls back to demo_user_session
        localStorage.setItem('ats_token', 'pending_email_confirmation');
      }
      localStorage.setItem('demo_user_session', JSON.stringify(user));
      
      return user;
    } catch (err: any) {
      // Proactively propagate real validation/auth errors to the UI
      if (err.isApiResponse) {
        throw err;
      }

      console.warn('API signup connection failed, running demo fallback:', err);
      const userProfile: UserProfile = {
        id: `mock-${role}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        first_name,
        last_name,
        role,
      };
      localStorage.setItem('ats_token', 'mock_offline_token');
      localStorage.setItem('demo_user_session', JSON.stringify(userProfile));
      return userProfile;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('ats_token');
    localStorage.removeItem('demo_user_session');
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const token = localStorage.getItem('ats_token');
    // Treat offline/pending tokens as demo session fallback
    if (!token || token === 'mock_offline_token' || token === 'pending_email_confirmation') {
      const stored = localStorage.getItem('demo_user_session');
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.error || 'Token verification failed');
        (err as any).isApiResponse = true;
        throw err;
      }

      const user = await res.json();
      localStorage.setItem('demo_user_session', JSON.stringify(user));
      return user;
    } catch (err: any) {
      if (err.isApiResponse) {
        // Clear token if invalid on server
        localStorage.removeItem('ats_token');
        localStorage.removeItem('demo_user_session');
        return null;
      }
      console.warn('API getCurrentUser failed, running cache fallback:', err);
      const stored = localStorage.getItem('demo_user_session');
      return stored ? JSON.parse(stored) : null;
    }
  }

  async getRole(userId: string): Promise<'candidate' | 'recruiter' | null> {
    const stored = localStorage.getItem('demo_user_session');
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        if (profile.id === userId) return profile.role;
      } catch {}
    }
    return null;
  }

  async refreshSession(): Promise<boolean> {
    const token = localStorage.getItem('ats_token');
    return token !== null;
  }
}

export default new AuthService();
