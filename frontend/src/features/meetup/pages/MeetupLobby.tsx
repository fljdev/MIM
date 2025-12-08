import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';

// Participant structure from backend
interface Participant {
  id: number;
  name: string;
  email?: string;
  location: {
    name: string;
    lat: number | null;
    lng: number | null;
  };
  transport: string;
}

// Venue structure from backend
interface Venue {
  id: number;
  name: string;
  address: string;
  priceLevel?: number;
  travel_times?: {
    [key: string]: number;
  };
}

// Comment structure from backend
interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

// Meetup info from backend
interface MeetupInfo {
  id: number;
  code: string;
  title?: string;
  vibe: string;
  status: string;
}

// Preferences from backend
interface Preferences {
  budget: string;
  fairness: string;
}

// Full lobby response from backend
interface LobbyData {
  success: boolean;
  meetup: MeetupInfo;
  participants: {
    creator: Participant;
    joiner: Participant;
  };
  preferences: Preferences;
  top_venues: Venue[];
  comments: Comment[];
}

const MeetupLobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Fetch lobby data
  const fetchLobbyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/lobby`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lobby data');
      }
      
      const data: LobbyData = await response.json();
      setLobbyData(data);

      // Check if current user is organizer
      const storedOrganizerName = localStorage.getItem(`meetup_organizer_${code}`);
      if (storedOrganizerName && storedOrganizerName === data.participants.creator.name) {
        setIsOrganizer(true);
      }
    } catch (error) {
      console.error('Error fetching lobby:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchLobbyData();
    }
  }, [code]);

  // Poll every 5 seconds for real-time updates
  useEffect(() => {
    if (!code) return;

    const interval = setInterval(() => {
      fetchLobbyData();
    }, 5000);

    return () => clearInterval(interval);
  }, [code]);

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !code) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: newComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      fetchLobbyData();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleConfirmVenue = async () => {
    if (!code || !lobbyData || !lobbyData.top_venues.length) return;

    setConfirming(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to confirm venue');
      }

      fetchLobbyData();
      alert('Venue confirmed! Meetup is now finalized.');
    } catch (error) {
      console.error('Error confirming venue:', error);
      alert('Failed to confirm venue');
    } finally {
      setConfirming(false);
    }
  };

  const getVibeIcon = (vibe: string) => {
    const icons: { [key: string]: string } = {
      coffee: '☕',
      food: '🍽️',
      drinks: '🍺',
      walk: '🌳'
    };
    return icons[vibe?.toLowerCase()] || '🎯';
  };

  const getBudgetLabel = (budget: string) => {
    const labels: { [key: string]: string } = {
      '€': '€ Budget',
      '€€': '€€ Mid-range',
      '€€€': '€€€ Treat'
    };
    return labels[budget] || budget;
  };

  const getFairnessIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      fastest: '⚡',
      sustainable: '🌱',
      accessible: '♿'
    };
    return icons[mode?.toLowerCase()] || '⚖️';
  };

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      walking: '🚶',
      driving: '🚗',
      transit: '🚇',
      bicycling: '🚴'
    };
    return icons[mode?.toLowerCase()] || '🚶';
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getColorForName = (name: string) => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (!lobbyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lobby Not Found</h2>
          <p className="text-gray-600 mb-6">This meetup lobby doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Get participants as array for easier mapping
  const participantsList = [lobbyData.participants.creator, lobbyData.participants.joiner];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Meetup Code</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-bold text-emerald-600 font-mono tracking-wider">
                {lobbyData.meetup.code}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                title="Copy code"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            {copied && <p className="text-sm text-emerald-600 mt-1">Copied!</p>}
          </div>

          {/* Settings Summary */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
              <span className="font-semibold">
                {getVibeIcon(lobbyData.meetup.vibe)} {lobbyData.meetup.vibe}
              </span>
              <span className="text-gray-400">·</span>
              <span className="font-semibold">
                {getBudgetLabel(lobbyData.preferences.budget)}
              </span>
              <span className="text-gray-400">·</span>
              <span className="font-semibold">
                {getFairnessIcon(lobbyData.preferences.fairness)} {lobbyData.preferences.fairness}
              </span>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Participants (2)
          </h2>

          {/* Participants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participantsList.map((participant, index) => (
              <div
                key={participant.id || index}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
              >
                {/* Avatar */}
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getColorForName(participant.name)}`}
                  >
                    {getInitials(participant.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {participant.name}
                      {index === 0 && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Creator</span>}
                    </h3>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate">{participant.location?.name || 'Location not set'}</span>
                </div>

                {/* Transit Mode */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTransitIcon(participant.transport)}</span>
                  <span className="text-sm text-gray-600 capitalize">{participant.transport}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Venues Section */}
        {lobbyData.top_venues && lobbyData.top_venues.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Meeting Spots</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lobbyData.top_venues.slice(0, 3).map((venue, index) => (
                <div
                  key={venue.id || index}
                  className={`rounded-lg p-5 border-2 ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg'
                      : index === 1
                        ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                        : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
                  }`}
                >
                  {/* Ranking Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-amber-700'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="text-2xl font-bold">
                      {'€'.repeat(venue.priceLevel || 2)}
                    </div>
                  </div>

                  {/* Venue Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{venue.name}</h3>

                  {/* Address */}
                  <p className="text-sm text-gray-600 mb-4">{venue.address}</p>

                  {/* Travel Times */}
                  {venue.travel_times && (
                    <div className="space-y-2">
                      {participantsList.map((participant) => (
                        <div key={participant.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{participant.name}</span>
                          <span className="font-semibold">
                            {venue.travel_times?.[participant.id] || '?'} min
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments</h2>

          {/* Comments List */}
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
            {lobbyData.comments && lobbyData.comments.length > 0 ? (
              lobbyData.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800">{comment.user_name}</span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Start the conversation!
              </div>
            )}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submittingComment}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Confirm Button - Only show for organizer when status is preferences_set */}
        {isOrganizer && lobbyData.meetup.status === 'preferences_set' && lobbyData.top_venues && lobbyData.top_venues.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={handleConfirmVenue}
              disabled={confirming}
              className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? 'Confirming...' : '✅ Confirm Venue #1'}
            </button>
            <p className="text-sm text-gray-500 text-center mt-2">
              This will finalize the meetup at {lobbyData.top_venues[0].name}
            </p>
          </div>
        )}

        {/* Status indicator for confirmed meetups */}
        {lobbyData.meetup.status === 'confirmed' && (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-xl font-bold text-green-800">Meetup Confirmed!</h3>
            <p className="text-green-700">See you at {lobbyData.top_venues?.[0]?.name || 'the venue'}!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetupLobby;