import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Unauthorized from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/Dashboard';
import CreateJob from '../pages/recruiter/CreateJob';
import Applications from '../pages/recruiter/Applications';
import ScreeningReport from '../pages/recruiter/ScreeningReport';
import RankingLeaderboard from '../pages/recruiter/RankingLeaderboard';
import Scheduler from '../pages/recruiter/Scheduler';
import Analytics from '../pages/recruiter/Analytics';

// Candidate Pages
import CandidateDashboard from '../pages/candidate/Dashboard';
import CandidateProfile from '../pages/candidate/Profile';
import Tracker from '../pages/candidate/Tracker';
import ScreeningResults from '../pages/candidate/ScreeningResults';
import RankingDashboard from '../pages/candidate/RankingDashboard';
import AvailableJobs from '../pages/candidate/AvailableJobs';
import MyApplications from '../pages/candidate/MyApplications';
import ResumeUpload from '../pages/candidate/ResumeUpload';
import MatchScores from '../pages/candidate/MatchScores';
import Notifications from '../pages/candidate/Notifications';
import InterviewInvitation from '../pages/candidate/InterviewInvitation';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Recruiter Workspace Routes */}
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <RecruiterDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/create-job"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <CreateJob />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applications"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <Applications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/screening/:id"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <ScreeningReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/rankings"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <RankingLeaderboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/scheduler"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <Scheduler />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/analytics"
        element={
          <ProtectedRoute allowedRole="recruiter">
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Candidate Workspace Routes */}
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <CandidateDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/jobs"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <AvailableJobs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/applications"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <MyApplications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/resume"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <ResumeUpload />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/match"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <MatchScores />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <CandidateProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/tracker"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <Tracker />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/screening-results"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <ScreeningResults />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/rankings"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <RankingDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/notifications"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/interviews"
        element={
          <ProtectedRoute allowedRole="candidate">
            <DashboardLayout>
              <InterviewInvitation />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
