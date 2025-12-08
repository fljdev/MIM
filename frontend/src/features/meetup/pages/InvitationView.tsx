import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { useAuth } from '../../auth/contexts/AuthContext';
import LoginModal from '../../auth/components/LoginModal';
import RegisterModal from '../../auth/components/RegisterModal';

interface CreatorPreferences {
  budget_level: string;
  fairness_mode: string;
  transit_mode: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  } | null;
}

interface InvitationData {
  success: boolean;
  meetup_id: number;
  meetup_datetime: string;
  vibe: string;
  status: string;
  creator: {
    name: string;
  };
  creator_preferences: CreatorPreferences;
}

const InvitationView: React.FC = () => {
  const { shareableCode } = useParams<{ shareableCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!shareableCode) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/meetups/${shareableCode}/invitation`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This invitation doesn\'t exist');
          } else if (response.status === 400) {
            const data = await response.json();
            throw new Error(data.error || 'This invitation has already been accepted');
          } else {
            throw new Error('Failed to load invitation');
          }
        }

        const data: InvitationData = await response.json();
        setInvitation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invitation');
        console.error('Error fetching invitation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [shareableCode]);

  const handleAcceptInvitation = async (skipAuthCheck = false) => {
    if (!shareableCode || !invitation) return;

    // Only check authentication if not skipping (e.g., when called from login/register success)
    if (!skipAuthCheck && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setAccepting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/api/meetups/${shareableCode}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }

      const data = await response.json();
      // Redirect to preferences page
      navigate(`/meetup/${data.meetup_id}/preferences`);
    } catch (err: any) {
      alert(err.message || 'Failed to accept invitation');
      console.error('Error accepting invitation:', err);
    } finally {
      setAccepting(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After login, automatically accept the invitation
    // Use setTimeout to allow auth context to update
    setTimeout(() => {
      handleAcceptInvitation(true); // Skip auth check since we just logged in
    }, 100);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    // After registration, automatically accept the invitation
    // Use setTimeout to allow auth context to update
    setTimeout(() => {
      handleAcceptInvitation(true); // Skip auth check since we just registered
    }, 100);
  };

  const getVibeIcon = (vibe: string) => {
    const icons: { [key: string]: string } = {
      coffee: '☕',
      food: '🍽️',
      drinks: '🍺',
      walk: '🌳'
    };
    return icons[vibe.toLowerCase()] || '🎯';
  };

  const getBudgetLabel = (budget: string) => {
    const labels: { [key: string]: string } = {
      '€': 'Budget',
      '€€': 'Mid-range',
      '€€€': 'Treat'
    };
    return labels[budget] || budget;
  };

  const getFairnessLabel = (fairness: string) => {
    const labels: { [key: string]: string } = {
      fastest: 'Fastest',
      sustainable: 'Sustainable',
      accessible: 'Accessible'
    };
    return labels[fairness.toLowerCase()] || fairness;
  };

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      walking: '🚶',
      driving: '🚗',
      transit: '🚌',
      bicycling: '🚴'
    };
    return icons[mode.toLowerCase()] || '🚶';
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invitation Not Available</h1>
          <p className="text-gray-600 mb-6">{error || 'This invitation could not be loaded'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
          <div className="text-8xl mb-4">{getVibeIcon(invitation.vibe)}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {invitation.creator.name} invites you to {invitation.vibe.toLowerCase()}
          </h1>
          <p className="text-gray-600">{formatDateTime(invitation.meetup_datetime)}</p>
        </div>

        {/* Creator's Preferences */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Meetup Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Budget */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Budget</div>
              <div className="text-xl font-bold text-emerald-700">
                {invitation.creator_preferences.budget_level} {getBudgetLabel(invitation.creator_preferences.budget_level)}
              </div>
            </div>

            {/* Fairness Mode */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Fairness Mode</div>
              <div className="text-xl font-bold text-emerald-700">
                {getFairnessLabel(invitation.creator_preferences.fairness_mode)}
              </div>
            </div>

            {/* Transport Mode */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Transport</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTransitIcon(invitation.creator_preferences.transit_mode)}</span>
                <span className="text-xl font-bold text-emerald-700 capitalize">
                  {invitation.creator_preferences.transit_mode}
                </span>
              </div>
            </div>

            {/* Location (if available) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Starting Location</div>
              {invitation.creator_preferences.location ? (
                <div className="text-xl font-bold text-emerald-700">
                  {invitation.creator_preferences.location.name}
                </div>
              ) : (
                <div className="text-lg text-gray-500 italic">Location is private</div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
            <p className="text-emerald-800 text-center">
              These are the preferences set by {invitation.creator.name}. You'll set your own preferences after accepting.
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {isAuthenticated ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to join?</h3>
              <p className="text-gray-600 mb-6">
                You're logged in as <span className="font-semibold">{user?.name}</span>. 
                Accept this invitation to set your preferences and find a meeting spot.
              </p>
              <button
                onClick={() => handleAcceptInvitation()}
                disabled={accepting}
                className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? 'Accepting...' : 'Accept & Set My Preferences →'}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Want to join this meetup?</h3>
              <p className="text-gray-600 mb-6">
                You need to log in or create an account to accept this invitation and set your preferences.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg"
                >
                  Log In & Accept
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-600 transition-all shadow-lg"
                >
                  Create Account & Accept
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">
                After logging in or creating an account, you'll be able to set your preferences.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Powered by Meet in Middle • Find fair meeting spots
          </p>
        </div>
      </div>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};

export default InvitationView;
