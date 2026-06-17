import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface RoleContextType {
  role: 'candidate' | 'recruiter' | null;
  setRole: (role: 'candidate' | 'recruiter' | null) => void;
  switchRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role: authRole } = useAuth();
  const [role, setRoleState] = useState<'candidate' | 'recruiter' | null>(null);

  useEffect(() => {
    setRoleState(authRole);
  }, [authRole]);

  const setRole = (newRole: 'candidate' | 'recruiter' | null) => {
    setRoleState(newRole);
  };

  const switchRole = () => {
    setRoleState((prev) => (prev === 'candidate' ? 'recruiter' : 'candidate'));
  };

  return (
    <RoleContext.Provider value={{ role, setRole, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
