import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

interface Participant {
  id: number;
  participant_name: string;
  location_name: string;
  location_lat: number | null;
  location_lng: number | null;
  transit_mode: string;
  joined_at: string;
}

interface MeetupData {
  code: string;
  title: string;
  vibe: string;
  budget_level: string;
  fairness_mode: string;
  max_travel_time: number;
  created_by_name: string;
  status: string;
  calculation_status: string;
}

interface LobbyData {
  meetup: MeetupData;
  participants: Participant[];
  participant_count: number;
  ready_to_calculate: boolean;
  is_organizer: boolean;
}

const MeetupLobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [organizerName, setOrganizerName] = useState('');

  // Fetch lobby data
  const fetchLobbyData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/lobby`);
      if (!response.ok) {
        throw new Error('Failed to fetch lobby data');
      }
      const data: LobbyData = await response.json();
      setLobbyData(data);

      // Check if calculation is ready and navigate
      if (data.meetup.calculation_status === 'ready') {
        navigate(`/meetup/${code}/results`);
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

  // Poll every 5 seconds
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

  const handleCalculate = async () => {
    if (!lobbyData || !organizerName) {
      alert('Please enter your name to calculate');
      return;
    }

    setCalculating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizer_name: organizerName || lobbyData.meetup.created_by_name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate venues');
      }

      // Navigate to results
      navigate(`/meetup/${code}/results`);

    } catch (error: any) {
      console.error('Error calculating:', error);
      alert(error.message || 'Failed to calculate venues. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const getVibeIcon = (vibe: string) => {
    const icons: { [key: string]: string } = {
      coffee: '☕',
      food: '🍽️',
      drinks: '🍺',
      walk: '🌳'
    };
    return icons[vibe] || '🎯';
  };

  const getBudgetLabel = (budget: string) => {
    const labels: { [key: string]: string } = {
      budget: '€ Budget',
      mid: '€€ Mid-range',
      treat: '€€€ Treat'
    };
    return labels[budget] || budget;
  };

  const getFairnessIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      fastest: '⚡',
      sustainable: '🌱',
      accessible: '♿'
    };
    return icons[mode] || '🎯';
  };

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      walking: '🚶',
      driving: '🚗',
      transit: '🚌',
      bicycling: '🚴'
    };
    return icons[mode?.toLowerCase()] || '🚶';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const joined = new Date(timestamp);
    const diffMs = now.getTime() - joined.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForName = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (!lobbyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Lobby not found</p>
        </div>
      </div>
    );
  }

  const isOrganizer = lobbyData.meetup.created_by_name === organizerName || organizerName === '';

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Meetup Code */}
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
                {getBudgetLabel(lobbyData.meetup.budget_level)}
              </span>
              <span className="text-gray-400">·</span>
              <span className="font-semibold">
                {getFairnessIcon(lobbyData.meetup.fairness_mode)} {lobbyData.meetup.fairness_mode}
              </span>
              <span className="text-gray-400">·</span>
              <span className="font-semibold">
                Max {lobbyData.meetup.max_travel_time} min
              </span>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Participants ({lobbyData.participant_count})
          </h2>

          {lobbyData.participant_count < 2 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-yellow-800">
                Waiting for more people... ({lobbyData.participant_count}/
                <span className="font-bold text-2xl animate-pulse">2</span> minimum needed)
              </p>
            </div>
          )}

          {/* Participants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lobbyData.participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
              >
                {/* Avatar */}
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getColorForName(
                      participant.participant_name
                    )}`}
                  >
                    {getInitials(participant.participant_name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {participant.participant_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getTimeAgo(participant.joined_at)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate">{participant.location_name}</span>
                </div>

                {/* Transit Mode */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTransitIcon(participant.transit_mode)}</span>
                  <span className="text-sm text-gray-600">{participant.transit_mode.toLowerCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Section */}
        {lobbyData.ready_to_calculate && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Enter your name (organizer)"
                className="w-full max-w-md px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 mb-4"
              />
            </div>

            {organizerName === lobbyData.meetup.created_by_name ? (
              <button
                onClick={handleCalculate}
                disabled={calculating}
                className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
              >
                {calculating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding fair spots...
                  </span>
                ) : (
                  '🎯 Find Fair Spots'
                )}
              </button>
            ) : (
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-600 text-lg">
                  Waiting for <span className="font-bold">{lobbyData.meetup.created_by_name}</span> to find spots...
                </p>
              </div>
            )}
          </div>
        )}

        {calculating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Finding Fair Spots...</h3>
              <p className="text-gray-600">This may take a few seconds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetupLobby;
