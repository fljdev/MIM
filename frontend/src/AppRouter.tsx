import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import CreateMeetup from './features/meetup/pages/CreateMeetup';
import MeetupCreated from './features/meetup/pages/MeetupCreated';
import JoinMeetup from './features/meetup/pages/JoinMeetup';
import MeetupLobby from './features/meetup/pages/MeetupLobby';
import MeetupResults from './features/meetup/pages/MeetupResults';
import MeetupConfirmed from './features/meetup/pages/MeetupConfirmed';
import InvitationView from './features/meetup/pages/InvitationView';
import JoinerPreferences from './features/meetup/pages/JoinerPreferences';
import ComingSoonLandingPage from './features/landing/pages/ComingSoonLandingPage';
import ProfileDashboard from './features/profile/pages/ProfileDashboard';
import { useAuth } from './features/auth/contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  // Coming Soon mode check
  const isComingSoonMode = process.env.REACT_APP_COMING_SOON === 'true';
  const bypassKey = new URLSearchParams(window.location.search).get('dev');
  const hasDevAccess = bypassKey === 'mimdev2025';
  
    // Allow meetup-related paths to bypass Coming Soon
    const currentPath = window.location.pathname;
    const isMeetupPath = currentPath.startsWith('/meetup/') || 
                       currentPath.startsWith('/join/') ||
                       currentPath.startsWith('/invite/') ||
                       currentPath.startsWith('/create-meetup');

  // Show Coming Soon page ONLY for homepage, not meetup paths
  if (isComingSoonMode && !hasDevAccess && !isMeetupPath) {
    return <ComingSoonLandingPage />;
  }

  return (
    <Router>
      <Routes>
        {/* Main app route */}
        <Route path="/" element={<App />} />

        {/* Meetup flow routes */}
        <Route path="/create-meetup" element={<CreateMeetup />} />
        <Route path="/meetup/created" element={<MeetupCreated />} />
        <Route path="/meetup/created/:code" element={<MeetupCreated />} />
        <Route path="/join/:code" element={<JoinMeetup />} />
        <Route path="/invite/:shareableCode" element={<InvitationView />} />
        <Route path="/meetup/:id/preferences" element={<JoinerPreferences />} />
        <Route path="/meetup/:code/lobby" element={<MeetupLobby />} />
        <Route path="/meetup/:code/results" element={<MeetupResults />} />
        <Route path="/meetup/:code/confirmed" element={<MeetupConfirmed />} />

        {/* Profile route */}
        <Route path="/profile" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
