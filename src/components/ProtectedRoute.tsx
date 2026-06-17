import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Cpu } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'candidate' | 'recruiter';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white">
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border border-dashed border-primaryGlow/30 animate-spin-slow" />
          <div className="w-16 h-16 rounded-full bg-primaryGlow/10 flex items-center justify-center text-primaryGlow shadow-[0_0_20px_rgba(79,250,240,0.2)]">
            <Cpu className="w-8 h-8 animate-pulse text-primaryGlow" />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-primaryGlow font-space animate-pulse">
          Authenticating Workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect to public homepage/login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // User role is incorrect for this route path
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
