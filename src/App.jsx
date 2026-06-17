import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import FuturisticBackground from './components/FuturisticBackground';
import AppRoutes from './routes/AppRoutes';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { ApplicationProvider } from './contexts/ApplicationContext';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <RoleProvider>
                <ApplicationProvider>
                  <FuturisticBackground>
                    {/* Floating Notification Alerts */}
                    <Toaster 
                      theme="dark" 
                      position="bottom-right" 
                      toastOptions={{
                        style: {
                          background: 'rgba(7, 16, 33, 0.9)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#FFFFFF',
                          fontFamily: 'sans-serif',
                        }
                      }}
                    />
                    
                    {/* Route Paths Navigation */}
                    <AppRoutes />
                  </FuturisticBackground>
                </ApplicationProvider>
              </RoleProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
