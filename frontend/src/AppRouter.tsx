import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import CreateMeetup from './pages/CreateMeetup';
import MeetupCreated from './pages/MeetupCreated';
import JoinMeetup from './pages/JoinMeetup';
import MeetupLobby from './pages/MeetupLobby';
import MeetupResults from './pages/MeetupResults';
import MeetupConfirmed from './pages/MeetupConfirmed';
import ComingSoonLandingPage from './ComingSoonLandingPage';

const AppRouter: React.FC = () => {
  // Coming Soon mode check
  const isComingSoonMode = process.env.REACT_APP_COMING_SOON === 'true';
  const bypassKey = new URLSearchParams(window.location.search).get('dev');
  const hasDevAccess = bypassKey === 'mimdev2025';

  // Show Coming Soon page if enabled and no dev bypass
  if (isComingSoonMode && !hasDevAccess) {
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
        <Route path="/meetup/:code/lobby" element={<MeetupLobby />} />
        <Route path="/meetup/:code/results" element={<MeetupResults />} />
        <Route path="/meetup/:code/confirmed" element={<MeetupConfirmed />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;