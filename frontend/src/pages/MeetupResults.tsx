import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

interface TravelTime {
  personIndex: number;
  personName: string;
  mode: string;
  duration: number;
}

interface Venue {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  latitude: number;
  longitude: number;
  address?: string;
  travelTimes: TravelTime[];
  maxTravelTime: number;
  fairnessScore: number;
}

interface ResultsData {
  success: boolean;
  midpoint: {
    lat: number;
    lng: number;
  };
  venues: Venue[];
  fairness_summary: {
    mode: string;
    max_travel_time: number;
    participants_summary: Array<{
      name: string;
      time: number;
      mode: string;
    }>;
  };
}

const MeetupResults: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [organizerName, setOrganizerName] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/results`);
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data: ResultsData = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error fetching results:', error);
        alert('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchResults();
    }
  }, [code]);

  const handleConfirm = async (venue: Venue) => {
    if (!organizerName.trim()) {
      alert('Please enter your name to confirm venue');
      return;
    }

    setConfirming(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizer_name: organizerName,
          venue_id: venue.id,
          venue_name: venue.name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm venue');
      }

      // Navigate to confirmed page
      navigate(`/meetup/${code}/confirmed`);

    } catch (error: any) {
      console.error('Error confirming venue:', error);
      alert(error.message || 'Failed to confirm venue');
    } finally {
      setConfirming(false);
    }
  };

  const getPriceSymbol = (level: number) => {
    return '€'.repeat(level || 1);
  };

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      WALKING: '🚶',
      DRIVING: '🚗',
      TRANSIT: '🚌',
      BICYCLING: '🚴'
    };
    return icons[mode] || '🚶';
  };

  const getFairnessIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      fastest: '⚡',
      sustainable: '🌱',
      accessible: '♿'
    };
    return icons[mode] || '🎯';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Results not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-4xl font-bold text-emerald-700 mb-2">
              Fair Spots Found!
            </h1>
            <p className="text-gray-600 text-lg">Here are the most equitable venues</p>
          </div>

          {/* Travel-Time Equity Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">{getFairnessIcon(results.fairness_summary.mode)}</span>
              <h2 className="text-2xl font-bold capitalize">
                {results.fairness_summary.mode} Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.fairness_summary.participants_summary.map((person, index) => (
                <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTransitIcon(person.mode)}</span>
                    <span className="font-bold">{person.name}</span>
                  </div>
                  <div className="text-3xl font-bold">{person.time} min</div>
                  <div className="text-sm opacity-90">travel time</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Organizer Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="max-w-md mx-auto">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Organizer Name (to confirm venue)
            </label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Venues List */}
        <div className="space-y-4">
          {results.venues.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">
                No venues found matching your criteria. Try adjusting your settings.
              </p>
            </div>
          ) : (
            results.venues.map((venue, index) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Rank Badge */}
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-orange-600'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {venue.rating && (
                            <span className="flex items-center gap-1">
                              ⭐ {venue.rating.toFixed(1)}
                            </span>
                          )}
                          <span>{getPriceSymbol(venue.priceLevel)}</span>
                          {venue.address && <span className="text-xs">{venue.address}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Travel Times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {venue.travelTimes.map((time, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg p-3 flex items-center gap-2"
                        >
                          <span className="text-xl">{getTransitIcon(time.mode)}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-700">
                              {time.personName}
                            </div>
                            <div className="text-lg font-bold text-emerald-600">
                              {time.duration} min
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Max Travel Time */}
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 inline-block">
                      <div className="text-sm text-emerald-700 font-semibold">
                        Fairest time: <span className="text-2xl">{venue.maxTravelTime}</span> minutes
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div>
                    <button
                      onClick={() => handleConfirm(venue)}
                      disabled={!organizerName.trim() || confirming}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      ✓ Confirm
                    </button>
                  </div>
                </div>

                {/* Map Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirming Overlay */}
      {confirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirming Venue...</h3>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetupResults;
