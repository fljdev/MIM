import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { API_BASE_URL } from '../../../Config';

interface MeetupInfo {
  vibe: string;
  budget_level: string;
  fairness_mode: string;
  created_by_name: string;
}

const JoinMeetup: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOrganizer = searchParams.get('organizer') === 'true';

  const [meetupInfo, setMeetupInfo] = useState<MeetupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [participantName, setParticipantName] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [transitMode, setTransitMode] = useState('walking');
  const [isPrivate, setIsPrivate] = useState(false);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  // Fetch meetup info
  useEffect(() => {
    const fetchMeetupInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/lobby`);
        if (!response.ok) {
          throw new Error('Meetup not found');
        }
        const data = await response.json();
        setMeetupInfo({
          vibe: data.meetup.vibe,
          budget_level: data.meetup.budget_level,
          fairness_mode: data.meetup.fairness_mode,
          created_by_name: data.meetup.created_by_name
        });

        // Pre-fill organizer name if applicable
        if (isOrganizer && data.meetup.created_by_name) {
          setParticipantName(data.meetup.created_by_name);
        }

        // Auto-check accessibility if meetup is in accessible mode
        if (data.meetup.fairness_mode === 'accessible') {
          setNeedsAccessibility(true);
        }

      } catch (error) {
        console.error('Error fetching meetup:', error);
        alert('Failed to load meetup. Please check the code and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchMeetupInfo();
    }
  }, [code, isOrganizer]);

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
      mid: '€€ Mid',
      treat: '€€€ Treat'
    };
    return labels[budget] || budget;
  };

  const getFairnessLabel = (mode: string) => {
    const labels: { [key: string]: string } = {
      fastest: '⚡ Fastest',
      sustainable: '🌱 Sustainable',
      accessible: '♿ Accessible'
    };
    return labels[mode] || mode;
  };

  const handleLocationChange = (address: string, placeId?: string, coordinates?: { lat: number; lng: number }) => {
    setLocation(address);
    setLocationError('');

    if (coordinates) {
      // Validate Dublin bounds
      const dublinBounds = {
        north: 53.4,
        south: 53.2,
        east: -6.0,
        west: -6.5
      };

      if (
        coordinates.lat >= dublinBounds.south &&
        coordinates.lat <= dublinBounds.north &&
        coordinates.lng >= dublinBounds.west &&
        coordinates.lng <= dublinBounds.east
      ) {
        setLocationCoords(coordinates);
      } else {
        setLocationError('Please select a location within Dublin City');
        setLocationCoords(null);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Validate Dublin bounds
        const dublinBounds = {
          north: 53.4,
          south: 53.2,
          east: -6.0,
          west: -6.5
        };

        if (
          coords.lat >= dublinBounds.south &&
          coords.lat <= dublinBounds.north &&
          coords.lng >= dublinBounds.west &&
          coords.lng <= dublinBounds.east
        ) {
          setLocationCoords(coords);

          // Reverse geocode to get address
          try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: coords }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                setLocation(results[0].formatted_address);
              }
            });
          } catch (err) {
            console.error('Geocoding error:', err);
            setLocation(`${coords.lat}, ${coords.lng}`);
          }
        } else {
          setLocationError('Your current location is outside Dublin City');
        }
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location. Please enter it manually.');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!location || !locationCoords) {
      alert('Please select a valid Dublin location');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participant_name: participantName,
          location: location,
          latitude: locationCoords.lat,
          longitude: locationCoords.lng,
          transit_mode: transitMode,
          is_private: isPrivate,
          needs_accessibility: needsAccessibility
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join meetup');
      }

      // Navigate to lobby
      navigate(`/meetup/${code}/lobby`);

    } catch (error) {
      console.error('Error joining meetup:', error);
      alert('Failed to join meetup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading meetup...</p>
        </div>
      </div>
    );
  }

  if (!meetupInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Meetup not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide opacity-90 mb-2">Joining meetup organized by</p>
            <h2 className="text-3xl font-bold mb-3">{meetupInfo.created_by_name}</h2>
            <div className="flex items-center justify-center gap-4 text-lg">
              <span>{getVibeIcon(meetupInfo.vibe)} {meetupInfo.vibe}</span>
              <span>•</span>
              <span>{getBudgetLabel(meetupInfo.budget_level)}</span>
              <span>•</span>
              <span>{getFairnessLabel(meetupInfo.fairness_mode)}</span>
            </div>
          </div>
        </div>

        {/* Join Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-emerald-700">
            Join the Meetup
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-lg"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-lg font-semibold text-gray-700 mb-2">
                Starting Location
              </label>
              <LocationAutocomplete
                value={location}
                onChange={handleLocationChange}
                placeholder="📍 Enter your Dublin location"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-lg"
              />
              {locationError && (
                <p className="text-red-600 text-sm mt-2">{locationError}</p>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gettingLocation}
                className="mt-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {gettingLocation ? 'Getting location...' : 'Use Current Location'}
              </button>
            </div>

            {/* Travel Mode */}
            <div>
              <label htmlFor="transit-mode" className="block text-lg font-semibold text-gray-700 mb-2">
                Travel Mode
              </label>
              <select
                id="transit-mode"
                value={transitMode}
                onChange={(e) => setTransitMode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-lg"
              >
                <option value="walking">🚶 Walking</option>
                <option value="driving">🚗 Driving</option>
                <option value="transit">🚌 Luas/Bus</option>
                <option value="bicycling">🚴 Cycling</option>
              </select>
            </div>

            {/* Personal Settings */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 mb-2">Personal Settings</h3>

              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Keep my exact location private</div>
                  <p className="text-sm text-gray-600">
                    Others will see you joined but not your exact location
                  </p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsAccessibility}
                  onChange={(e) => setNeedsAccessibility(e.target.checked)}
                  disabled={meetupInfo.fairness_mode === 'accessible'}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 disabled:opacity-50"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">I need wheelchair access</div>
                  {meetupInfo.fairness_mode === 'accessible' && (
                    <p className="text-sm text-blue-600">
                      ♿ This meetup is already in accessible mode
                    </p>
                  )}
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !location || !locationCoords}
              className="w-full bg-purple-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Meetup →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinMeetup;
