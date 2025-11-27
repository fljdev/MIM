import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@mui/material';
import { API_BASE_URL } from '../Config';
import { useAuth } from '../contexts/AuthContext';

const CreateMeetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [createdByName, setCreatedByName] = useState('');
  const [meetupTitle, setMeetupTitle] = useState('');
  const [meetupVibe, setMeetupVibe] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('mid');
  const [fairnessMode, setFairnessMode] = useState('fastest');
  const [maxTravelTime, setMaxTravelTime] = useState(45);
  const [globalPrivacy, setGlobalPrivacy] = useState(true);

  // Auto-populate name if user is logged in
  useEffect(() => {
    if (user && user.name) {
      setCreatedByName(user.name);
    }
  }, [user]);

  const vibeOptions = [
    { value: 'coffee', icon: '☕', label: 'Coffee' },
    { value: 'food', icon: '🍽️', label: 'Food' },
    { value: 'drinks', icon: '🍺', label: 'Drinks' },
    { value: 'walk', icon: '🌳', label: 'Walk' }
  ];

  const budgetOptions = [
    { value: 'budget', icon: '€', label: 'Budget', description: 'Save money' },
    { value: 'mid', icon: '€€', label: 'Mid-range', description: 'Balanced' },
    { value: 'treat', icon: '€€€', label: 'Treat', description: 'Splurge' }
  ];

  const fairnessOptions = [
    { value: 'fastest', icon: '⚡', label: 'Fastest', description: 'Minimize travel time' },
    { value: 'sustainable', icon: '🌱', label: 'Sustainable', description: 'Eco-friendly priority' },
    { value: 'accessible', icon: '♿', label: 'Accessible', description: 'Wheelchair-friendly only' }
  ];

  const isFormValid = createdByName.trim() !== '' && meetupVibe !== '' && budgetLevel !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('Please fill in your name and select a vibe');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetup/create-organized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          created_by_name: createdByName,
          meetup_title: meetupTitle || null,
          meetup_vibe: meetupVibe,
          budget_level: budgetLevel,
          fairness_mode: fairnessMode,
          max_travel_time: maxTravelTime,
          global_privacy: globalPrivacy
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create meetup');
      }

      const data = await response.json();

      // Navigate to success page with meetup code
      navigate('/meetup/created', {
        state: {
          meetup_code: data.meetup_code,
          share_link: data.share_link
        }
      });

    } catch (error) {
      console.error('Error creating meetup:', error);
      alert('Failed to create meetup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-emerald-700 mb-2">
              Create Group Meetup
            </h1>
            <p className="text-gray-600">Set up your meetup preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Organizer Name */}
            <div>
              <label htmlFor="organizer-name" className="block text-lg font-semibold text-gray-700 mb-2">
                Your Name {user && <span className="text-sm text-emerald-600 font-normal">(Logged in)</span>}
              </label>
              <input
                id="organizer-name"
                type="text"
                value={createdByName}
                onChange={(e) => setCreatedByName(e.target.value)}
                placeholder="Enter your name"
                disabled={!!user}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-emerald-500 text-lg ${
                  user
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300'
                    : 'border-gray-300'
                }`}
                required
              />
              {user && (
                <p className="text-sm text-emerald-600 mt-1">
                  ✓ Your name is locked because you're logged in
                </p>
              )}
            </div>

            {/* Meetup Title (Optional) */}
            <div>
              <label htmlFor="meetup-title" className="block text-lg font-semibold text-gray-700 mb-2">
                Meetup Title <span className="text-sm text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                id="meetup-title"
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
                What are we doing? <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {vibeOptions.map((vibe) => (
                  <button
                    key={vibe.value}
                    type="button"
                    onClick={() => setMeetupVibe(vibe.value)}
                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                      meetupVibe === vibe.value
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
                    className={`p-5 rounded-lg border-2 font-semibold transition-all ${
                      budgetLevel === budget.value
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
                    className={`p-5 rounded-lg border-2 font-semibold transition-all ${
                      fairnessMode === mode.value
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

            {/* Max Travel Time */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-700">Max Travel Time</h3>
                <span className="text-lg font-bold text-emerald-600">{maxTravelTime} min</span>
              </div>
              <Slider
                value={maxTravelTime}
                onChange={(e, newValue) => setMaxTravelTime(newValue as number)}
                min={15}
                max={60}
                step={5}
                marks={[
                  { value: 15, label: '15' },
                  { value: 30, label: '30' },
                  { value: 45, label: '45' },
                  { value: 60, label: '60' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} min`}
                sx={{
                  color: '#059669',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#059669',
                    '&:hover': {
                      boxShadow: '0 0 0 8px rgba(5, 150, 105, 0.16)'
                    }
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#059669'
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#d1d5db'
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Everyone arrives within {maxTravelTime} minutes
              </p>
            </div>

            {/* Privacy */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
              <label className="flex items-start cursor-pointer">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={globalPrivacy}
                    onChange={(e) => setGlobalPrivacy(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                  />
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-purple-900">
                    🔒 Auto-delete after 24 hours
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    No data harvesting - meetup deleted automatically
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Meetup →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetup;
