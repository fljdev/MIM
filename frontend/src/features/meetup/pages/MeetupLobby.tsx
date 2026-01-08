import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { 
  getTrafficDisplayInfo, 
  getTrafficEmoji, 
  getCurrentTrafficCondition,
  isRushHour
} from '../../../lib/mocks/mockTrafficData';
import { 
  getMockWeather, 
  getWeatherWarning 
} from '../../../lib/mocks/mockWeatherData';
import VenueDisplayTiers from './VenueDisplayTiers';
import { TimeSuggestionForm } from '../components/TimeSuggestionForm';

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
  latitude?: number;
  longitude?: number;
  rating?: number;
  review_count?: number;
  accessible?: boolean;
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
  proposed_date?: string;
  proposed_time_start?: string;
  proposed_time_end?: string;
  is_time_flexible?: boolean;
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
  const [showSuggestTime, setShowSuggestTime] = useState(false);
  
  // NEW: Voting state
  const [votes, setVotes] = useState<{[venueId: string]: Array<{voter_name: string, voter_id: number}>}>({});
  const [showAllVenues, setShowAllVenues] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);

  // Ref to track previous status for navigation
  const prevStatusRef = useRef<string | undefined>(undefined);

  // Auto-navigate to confirmed page when meetup status becomes 'confirmed'
  useEffect(() => {
    const currentStatus = lobbyData?.meetup?.status;
    console.log('🔍 Effect running - Current:', currentStatus, 'Previous:', prevStatusRef.current);
    
    if (currentStatus === 'confirmed' && prevStatusRef.current !== 'confirmed' && code) {
      console.log('✅ Status changed to confirmed - NAVIGATING');
      navigate(`/meetup/${code}/confirmed`);
    }
    
    prevStatusRef.current = currentStatus;
  }, [lobbyData, code, navigate]);

  // Fetch lobby data
  const fetchLobbyData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(`[Frontend Debug] Fetching lobby for code: ${code}`);
      console.log(`[Frontend Debug] API Base URL: ${API_BASE_URL}`);
      console.log(`[Frontend Debug] Token present: ${!!token}`);
      
      const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/lobby`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`[Frontend Debug] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Frontend Debug] Response not OK: ${errorText}`);
        throw new Error(`Failed to fetch lobby data: ${response.status} ${errorText}`);
      }
      
      const data: LobbyData = await response.json();
      console.log(`[Frontend Debug] Received lobby data:`, data);
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

  // Fetch votes for the meetup
  const fetchVotes = async () => {
    if (!code) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/votes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[VOTES] Fetched votes:', data.votes);
        
        // Convert array to object with ARRAYS of voters per venue (don't overwrite!)
        const votesMap: {[key: string]: Array<{voter_name: string, voter_id: number}>} = {};
        data.votes.forEach((vote: any) => {
          if (!votesMap[vote.venue_id]) {
            votesMap[vote.venue_id] = [];
          }
          votesMap[vote.venue_id].push({
            voter_name: vote.voter_name,
            voter_id: vote.voter_id
          });
        });
        setVotes(votesMap);
      } else {
        console.error('[VOTES] Failed to fetch votes:', response.status);
      }
    } catch (error) {
      console.error('[VOTES] Error fetching votes:', error);
    }
  };

  // Handle voting for a venue
  const handleVote = async (venueId: string) => {
    if (!code || votingInProgress) return;

    setVotingInProgress(true);
    console.log('[VOTE] Voting for venue:', venueId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ venue_id: venueId })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[VOTE] Vote recorded successfully', data);
        
        // Check if meetup was auto-confirmed
        if (data.auto_confirmed) {
          console.log('[VOTE] Meetup auto-confirmed! Navigating to confirmed page...');
          navigate(`/meetup/${code}/confirmed`);
          return;
        }
        
        // Refresh votes immediately
        await fetchVotes();
      } else {
        const error = await response.json();
        console.error('[VOTE] Failed to record vote:', error);
        alert('Failed to record vote: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[VOTE] Error voting:', error);
      alert('Failed to record vote. Please try again.');
    } finally {
      setVotingInProgress(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchLobbyData();
      fetchVotes();
    }
  }, [code]);

  // Poll every 5 seconds for real-time updates
  useEffect(() => {
    if (!code) return;

    const interval = setInterval(() => {
      fetchLobbyData();
      fetchVotes();
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

  // Helper function to get vote info for a venue
  const getVoteInfo = (venueId: number | string) => {
    const venueIdStr = venueId.toString();
    const votersForVenue = votes[venueIdStr] || [];
    
    return {
      count: votersForVenue.length,
      voters: votersForVenue.map(v => v.voter_name),
      voter_ids: votersForVenue.map(v => v.voter_id)
    };
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

  const formatProposedTime = (meetup: MeetupInfo) => {
    if (!meetup.proposed_date) {
      return null;
    }

    const date = new Date(meetup.proposed_date);
    const dateString = date.toLocaleDateString('en-IE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const startTime = formatTime(meetup.proposed_time_start!);
    
    if (meetup.is_time_flexible && meetup.proposed_time_end) {
      const endTime = formatTime(meetup.proposed_time_end);
      return `${dateString} between ${startTime} - ${endTime}`;
    } else {
      return `${dateString} at ${startTime}`;
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Core Value Proposition */}
          <div className="text-center mb-4 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Meet in the Middle
            </h1>
            <p className="text-sm text-gray-600 italic">
              Fair meetups based on <span className="font-semibold text-emerald-600">travel time</span>, not distance
            </p>
          </div>

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

        {/* Proposed Time Section */}
        {lobbyData.meetup.proposed_date && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Proposed Meeting Time</p>
              <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                <p className="text-xl font-bold text-teal-900">
                  {formatProposedTime(lobbyData.meetup)}
                </p>
              </div>
            </div>

            {/* Can't Make It? Section */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowSuggestTime(!showSuggestTime)}
                className="w-full text-left flex items-center justify-between text-gray-700 hover:text-teal-600 transition-colors"
              >
                <span className="font-medium">Can't make this time?</span>
                <span className="text-sm text-teal-600">
                  {showSuggestTime ? 'Hide ↑' : 'Suggest alternative →'}
                </span>
              </button>
              
              {showSuggestTime && (
                <TimeSuggestionForm
                  meetupId={lobbyData.meetup.id}
                  onSuccess={() => {
                    setShowSuggestTime(false);
                  }}
                  onCancel={() => setShowSuggestTime(false)}
                />
              )}
            </div>
          </div>
        )}

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
                      {index === 1 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Joiner</span>}
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

        {/* Venues Section with Voting - INTEGRATED WITH NEW COMPONENT */}
        {lobbyData.top_venues && lobbyData.top_venues.length > 0 && (() => {
          // Get current user ID from JWT token
          const token = localStorage.getItem('token');
          let currentUserId = 0;
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              currentUserId = payload.userId;
            } catch (e) {
              console.error('Failed to parse token');
            }
          }

          return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              {/* Fairness Mode Banner */}
              <div className="mb-6 flex items-center justify-between text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div>
                  <span className="font-semibold text-blue-900">
                    {getFairnessIcon(lobbyData.preferences.fairness)} {lobbyData.preferences.fairness.toUpperCase()} MODE
                  </span>
                  <span className="text-blue-700 ml-2">
                    {lobbyData.preferences.fairness === 'fastest' && '• Minimizing max travel time'}
                    {lobbyData.preferences.fairness === 'sustainable' && '• Promoting green transport'}
                    {lobbyData.preferences.fairness === 'accessible' && '• Wheelchair accessible only'}
                  </span>
                </div>
                <div className="text-xs text-blue-700">
                  {getTrafficEmoji()} {getCurrentTrafficCondition().description}
                </div>
              </div>

              {/* THE NEW COMPONENT! */}
              <VenueDisplayTiers
                venues={lobbyData.top_venues}
                participants={participantsList}
                getTransitIcon={getTransitIcon}
                votes={votes}
                getVoteInfo={getVoteInfo}
                handleVote={handleVote}
                votingInProgress={votingInProgress}
                currentUserId={currentUserId}
              />
            </div>
          );
        })()}

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

        {/* Confirm Button - Only show when BOTH users voted for SAME venue */}
        {lobbyData.meetup.status === 'preferences_set' && lobbyData.top_venues && lobbyData.top_venues.length > 0 && (() => {
          // Check if both users voted for the same venue
          // Find a venue that has 2 votes
          let agreedVenueId: string | null = null;
          let totalVotes = 0;
          
          Object.entries(votes).forEach(([venueId, voters]) => {
            totalVotes += voters.length;
            if (voters.length === 2) {
              agreedVenueId = venueId;
            }
          });
          
          if (agreedVenueId) {
            // Both voted for SAME venue - show confirm button!
            const agreedVenue = lobbyData.top_venues.find(v => v.id.toString() === agreedVenueId);
            if (agreedVenue) {
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <button
                    onClick={handleConfirmVenue}
                    disabled={confirming}
                    className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirming ? 'Confirming...' : `✅ Confirm ${agreedVenue.name}`}
                  </button>
                  <p className="text-sm text-green-700 text-center mt-2 font-semibold">
                    🎉 Both participants agreed on this venue!
                  </p>
                </div>
              );
            }
          } else if (totalVotes === 2) {
            // Both voted but for DIFFERENT venues
            return (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Waiting for Agreement</h3>
                <p className="text-yellow-700 text-sm">
                  Both participants need to vote for the same venue before confirming.
                </p>
              </div>
            );
          } else {
            // Less than 2 votes total
            return (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🗳️</div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">Cast Your Votes</h3>
                <p className="text-blue-700 text-sm">
                  Both participants need to vote for the same venue to confirm the meetup.
                </p>
              </div>
            );
          }
          
          return null;
        })()}

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
