export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'recruiter';
}

const DEMO_RECRUITER: UserProfile = {
  id: 'demo-recruiter-uuid',
  email: 'recruiter@recruiter.com',
  first_name: 'Alex',
  last_name: 'Vance',
  role: 'recruiter',
};

const DEMO_CANDIDATE: UserProfile = {
  id: 'demo-candidate-uuid',
  email: 'candidate@candidate.com',
  first_name: 'Sarah',
  last_name: 'Jenkins',
  role: 'candidate',
};

class AuthService {
  private currentDemoUser: UserProfile | null = null;

  constructor() {
    const stored = localStorage.getItem('demo_user_session');
    if (stored) {
      try {
        this.currentDemoUser = JSON.parse(stored);
      } catch {
        this.currentDemoUser = null;
      }
    }
  }

  async login(email: string, password_hash: string): Promise<UserProfile> {
    const emailLower = email.toLowerCase();
    
    // Check if it is a demo credential or fallback
    if (emailLower === 'recruiter@recruiter.com') {
      this.currentDemoUser = DEMO_RECRUITER;
    } else if (emailLower === 'candidate@candidate.com') {
      this.currentDemoUser = DEMO_CANDIDATE;
    } else {
      // Create a mock user on the fly based on the email domain or contents
      const isRecruiter = emailLower.includes('recruiter') || emailLower.includes('admin') || emailLower.includes('hr');
      const role = isRecruiter ? 'recruiter' : 'candidate';
      this.currentDemoUser = {
        id: `mock-${role}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        first_name: email.split('@')[0] || 'User',
        last_name: 'Mock',
        role,
      };
    }

    localStorage.setItem('demo_user_session', JSON.stringify(this.currentDemoUser));
    return this.currentDemoUser;
  }

  async signup(email: string, password_hash: string, first_name: string, last_name: string, role: 'candidate' | 'recruiter'): Promise<UserProfile> {
    this.currentDemoUser = {
      id: `mock-${role}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      first_name,
      last_name,
      role,
    };
    
    localStorage.setItem('demo_user_session', JSON.stringify(this.currentDemoUser));
    return this.currentDemoUser;
  }

  async logout(): Promise<void> {
    this.currentDemoUser = null;
    localStorage.removeItem('demo_user_session');
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const stored = localStorage.getItem('demo_user_session');
    if (stored) {
      try {
        this.currentDemoUser = JSON.parse(stored);
        return this.currentDemoUser;
      } catch {
        return null;
      }
    }
    return null;
  }

  async getRole(userId: string): Promise<'candidate' | 'recruiter' | null> {
    if (this.currentDemoUser && this.currentDemoUser.id === userId) {
      return this.currentDemoUser.role;
    }
    return this.currentDemoUser?.role || null;
  }

  async refreshSession(): Promise<boolean> {
    return this.currentDemoUser !== null;
  }
}

export default new AuthService();
