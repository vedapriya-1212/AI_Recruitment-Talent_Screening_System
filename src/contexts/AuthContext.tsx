import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService, { UserProfile } from '../services/AuthService';

interface AuthContextType {
  user: UserProfile | null;
  role: 'candidate' | 'recruiter' | null;
  loading: boolean;
  login: (email: string, password_hash: string, selectedRole?: 'candidate' | 'recruiter') => Promise<UserProfile>;
  signup: (email: string, password_hash: string, first_name: string, last_name: string, role: 'candidate' | 'recruiter', otp?: string) => Promise<any>;
  resendOtp: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password_hash: string, selectedRole?: 'candidate' | 'recruiter') => {
    setLoading(true);
    try {
      const profile = await AuthService.login(email, password_hash, selectedRole);
      setUser(profile);
      setRole(profile.role);
      return profile;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password_hash: string,
    first_name: string,
    last_name: string,
    role: 'candidate' | 'recruiter',
    otp?: string
  ) => {
    setLoading(true);
    try {
      const result = await AuthService.signup(email, password_hash, first_name, last_name, role, otp);
      if (result && !result.otpRequired) {
        setUser(result);
        setRole(result.role);
      }
      return result;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    return await AuthService.resendOtp(email);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, resendOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
