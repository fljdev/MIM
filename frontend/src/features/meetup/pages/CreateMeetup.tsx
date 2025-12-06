import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { useAuth } from '../../auth/contexts/AuthContext';
import LocationAutocomplete from '../components/LocationAutocomplete';

const CreateMeetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [createdByName, setCreatedByName] = useState('');
  const [meetupTitle, setMeetupTitle] = useState('');
  const [meetupVibe, setMeetupVibe] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('€€');
  const [fairnessMode, setFairnessMode] = useState('fastest');
  const [userLocation, setUserLocation] = useState<{ name: string, lat: number, lng: number } | null>(null);
  const [transitMode, setTransitMode] = useState('walking');
  const [isPrivate, setIsPrivate] = useState(false);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);

  useEffect(() => {
    if (user && user.name) {
      setCreatedByName(user.name);
    }
  }, [user]);

  const vibeOptions = [
    { value: 'Coffee', icon: '☕', label: 'Coffee' },
    { value: 'Food', icon: '🍽️', label: 'Food' },
    { value: 'Drinks', icon: '🍺', label: 'Drinks' },
    { value: 'Walk', icon: '🌳', label: 'Walk' }
  ];

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

  const isFormValid = createdByName.trim() !== '' && meetupVibe !== '' && budgetLevel !== '' && userLocation !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetups/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: meetupTitle || null,
          vibe: meetupVibe,
          budget_level: budgetLevel,
          fairness_mode: fairnessMode,
          creator_location: {
            name: userLocation.name,
            lat: userLocation.lat,
            lng: userLocation.lng
          },
          transit_mode: transitMode,
          is_private: isPrivate,
          needs_accessibility: needsAccessibility
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create meetup');
      }

      const data = await response.json();

      // Store organizer name in localStorage for lobby detection
      localStorage.setItem(`meetup_organizer_${data.meetup.meetup_code}`, createdByName);

      //navigate(`/meetup/${data.meetup.meetup_code}/waiting`);
      navigate('/meetup/created', {
        state: {
          meetup_code: data.meetup.meetup_code,
          share_link: `https://mim.town/join/${data.meetup.meetup_code}`
        }
      });

    } catch (error) {
      console.error('Error creating meetup:', error);
      alert('Failed to create meetup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-emerald-700 mb-2">
                Plan a Meetup
              </h1>
              <p className="text-gray-600">Find the perfect meeting spot</p>
            </div>
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Your Name */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Your Name {user && <span className="text-sm text-emerald-600 font-normal">(Logged in)</span>}
              </label>
              <input
                type="text"
                value={createdByName}
                onChange={(e) => setCreatedByName(e.target.value)}
                disabled={!!user}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-emerald-500 text-lg ${user ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : 'border-gray-300'
                  }`}
                required
              />
            </div>

            {/* Meetup Title */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Meetup Title <span className="text-sm text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={meetupTitle}
                onChange={(e) => setMeetupTitle(e.target.value.slice(0, 50))}
                placeholder="Friday drinks"
                maxLength={50}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-lg"
              />
              <p className="text-sm text-gray-500 mt-1">{meetupTitle.length}/50 characters</p>
            </div>

            {/* Vibe */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Vibe <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {vibeOptions.map((vibe) => (
                  <button
                    key={vibe.value}
                    type="button"
                    onClick={() => setMeetupVibe(vibe.value)}
                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${meetupVibe === vibe.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-300 text-gray-700 hover:border-emerald-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">{vibe.icon}</div>
                    <div className="text-sm">{vibe.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Budget <span className="text-red-500">*</span>
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
                Fairness Mode <span className="text-red-500">*</span>
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
                Your Location <span className="text-red-500">*</span>
              </label>

              <p className="text-sm text-gray-500 mt-1">Enter where you're coming from</p>
            </div>
            <LocationAutocomplete
              value={userLocation?.name || ''}
              onChange={handleLocationChange}
              placeholder="🏠 Enter your Dublin location"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-lg"
            />
            
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
                  disabled={fairnessMode === 'accessible'}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 disabled:opacity-50"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">I need wheelchair access</div>
                  {fairnessMode === 'accessible' && (
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
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Meetup →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetup;