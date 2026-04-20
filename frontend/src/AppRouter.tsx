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
import ChoiceSelectorPage from './features/landing/pages/ChoiceSelectorPage';
import LoginPage from './features/auth/pages/LoginPage';
import ProfileDashboard from './features/profile/pages/ProfileDashboard';
import { useAuth } from './features/auth/contexts/AuthContext';

// Import new accessibility components
import AccessibilityProfileWizard from './features/accessibility/components/AccessibilityProfileWizard';
import VenueDetailPage from './features/accessibility/pages/VenueDetailPage';
import JourneyPlanner from './features/accessibility/pages/JourneyPlanner';
import BrowseVenuesPage from './features/accessibility/pages/BrowseVenuesPage';


// Import ValuationCalculator
import ValuationCalculator from './features/valuation/pages/ValuationCalculator';

// Import Portfolio
import Portfolio from './pages/Portfolio';

// Import Marketplace
import Marketplace from './pages/Marketplace';

// Import Navbar
import Navbar from './components/Navbar';

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
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Main accessibility landing page */}
        <Route path="/" element={<ChoiceSelectorPage />} />

        {/* Accessibility features */}
        <Route path="/accessibility-profile" element={<ProtectedRoute><AccessibilityProfileWizard /></ProtectedRoute>} />
        <Route path="/journey-planner" element={<ProtectedRoute><JourneyPlanner /></ProtectedRoute>} />
        <Route path="/browse-venues" element={<BrowseVenuesPage />} />
        <Route path="/venues/:id" element={<ProtectedRoute><VenueDetailPage /></ProtectedRoute>} />


        {/* Valuation Calculator */}
        <Route path="/valuation" element={<ValuationCalculator />} />

        {/* Login/Signup page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Meetup flow routes */}
        <Route path="/create-meetup" element={<CreateMeetup />} />
        <Route path="/meetup/created" element={<MeetupCreated />} />
        <Route path="/meetup/created/:code" element={<MeetupCreated />} />
        <Route path="/join/:code" element={<JoinMeetup />} />
        <Route path="/invite/:shareableCode" element={<InvitationView />} />
        <Route path="/meetup/:id/preferences" element={<ProtectedRoute><JoinerPreferences /></ProtectedRoute>} />
        <Route path="/meetup/:code/lobby" element={<ProtectedRoute><MeetupLobby /></ProtectedRoute>} />
        <Route path="/meetup/:code/results" element={<ProtectedRoute><MeetupResults /></ProtectedRoute>} />
        <Route path="/meetup/:code/confirmed" element={<ProtectedRoute><MeetupConfirmed /></ProtectedRoute>} />

        {/* Profile route */}
        <Route path="/profile" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />

        {/* Portfolio route */}
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />

        {/* Marketplace route - public */}
        <Route path="/marketplace" element={<Marketplace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
