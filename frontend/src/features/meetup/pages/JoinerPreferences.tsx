import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { useAuth } from '../../auth/contexts/AuthContext';
import LocationAutocomplete from '../components/LocationAutocomplete';

const JoinerPreferences: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [budgetLevel, setBudgetLevel] = useState('€€');
  const [fairnessMode, setFairnessMode] = useState('fastest');
  const [userLocation, setUserLocation] = useState<{ name: string, lat: number, lng: number } | null>(null);
  const [transitMode, setTransitMode] = useState('walking');
  
  // Meetup info
  const [meetupInfo, setMeetupInfo] = useState<{
    vibe: string;
    meetup_datetime: string;
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/');
      return;
    }
    
    // In a real app, we might fetch meetup info here
    // For now, we'll use placeholder data
    setMeetupInfo({
      vibe: 'coffee', // This would come from API
      meetup_datetime: new Date().toISOString() // This would come from API
    });
    setLoading(false);
  }, [id, user, navigate]);

  const budgetOptions = [
    { value: '€', icon: '€', label: 'Budget', description: 'Save money' },
    { value: '€€', icon: '€€', label: 'Mid-range', description: 'Balanced' },
    { value: '€€€', icon: '€€€', label: 'Treat', description: 'Splurge' }
  ];

  const fairnessOptions = [
    { value: 'fastest', icon: '⚡', label: 'Fastest', description: 'Minimize travel time' },
    { value: 'sustainable', icon: '🌱', label: 'Sustainable', description: 'Eco-friendly priority' },
    { value: 'accessible', icon: '♿', label: 'Accessible', description: 'Accessible venues' }
  ];

  const transitOptions = [
    { value: 'walking', label: 'Walking' },
    { value: 'transit', label: 'Bus/Luas' },
    { value: 'bicycling', label: 'Bike' },
    { value: 'driving', label: 'Car' }
  ];

  const handleLocationChange = (address: string, placeId?: string, coordinates?: { lat: number; lng: number }) => {
    if (coordinates) {
      setUserLocation({
        name: address,
        lat: coordinates.lat,
        lng: coordinates.lng
      });
    }
  };

  const isFormValid = budgetLevel !== '' && fairnessMode !== '' && userLocation !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('Please fill in all required fields');
      return;
    }

    if (!id) {
      alert('Meetup ID is missing');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/${id}/joiner-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          budget: budgetLevel,
          fairness: fairnessMode.toLowerCase(),
          location: {
            name: userLocation.name,
            lat: userLocation.lat,
            lng: userLocation.lng
          },
          transport: transitMode.toLowerCase()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      const data = await response.json();
      
      // Redirect to lobby
      navigate(`/meetup/${id}/lobby`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setSubmitting(false);
    }
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
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-emerald-700 mb-2">
              Set Your Preferences
            </h1>
            {meetupInfo && (
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getVibeIcon(meetupInfo.vibe)}</span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Joining {meetupInfo.vibe} meetup
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(meetupInfo.meetup_datetime)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-gray-600">
              Tell us your preferences so we can find the perfect meeting spot
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Budget */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Your Budget Preference <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {budgetOptions.map((budget) => (
                  <button
                    key={budget.value}
                    type="button"
                    onClick={() => setBudgetLevel(budget.value)}
                    className={`p-5 rounded-lg border-2 font-semibold transition-all ${budgetLevel === budget.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-300 text-gray-700 hover:border-emerald-300'
                      }`}
                  >
                    <div className="text-2xl mb-2">{budget.icon}</div>
                    <div className="font-bold mb-1">{budget.label}</div>
                    <div className="text-sm opacity-75">{budget.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fairness Mode */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Your Fairness Preference <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fairnessOptions.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFairnessMode(mode.value)}
                    className={`p-5 rounded-lg border-2 font-semibold transition-all ${fairnessMode === mode.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-300 text-gray-700 hover:border-emerald-300'
                      }`}
                  >
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="font-bold mb-1">{mode.label}</div>
                    <div className="text-sm opacity-75">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Your Location */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Your Starting Location <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">Enter where you're coming from</p>
              <LocationAutocomplete
                value={userLocation?.name || ''}
                onChange={handleLocationChange}
                placeholder="🏠 Enter your Dublin location"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-lg mt-2"
              />
            </div>

            {/* Travel Mode */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                How are you traveling? <span className="text-red-500">*</span>
              </label>
              <select
                value={transitMode}
                onChange={(e) => setTransitMode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-lg"
              >
                {transitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Finding Meeting Spot...' : 'Find Meeting Spot →'}
            </button>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                Your preferences will be used to calculate the fairest meeting spot for everyone.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinerPreferences;
