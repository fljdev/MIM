import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';

interface TravelTime {
  personIndex: number;
  personName: string;
  mode: string;
  duration: number;
}

interface ConfirmedVenue {
  id: string;
  name: string;
  rating?: number;
  priceLevel?: number;
  latitude: number;
  longitude: number;
  address?: string;
  travelTimes?: TravelTime[];
  maxTravelTime?: number;
}

interface Participant {
  participant_name: string;
  location_name: string;
  transit_mode: string;
}

interface ConfirmedData {
  success: boolean;
  meetup: {
    code: string;
    title: string;
    vibe: string;
    confirmed_at: string;
  };
  confirmed_venue: ConfirmedVenue;
  participants: Participant[];
}

const MeetupConfirmed: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<ConfirmedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfirmedData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/confirmed`);
        if (!response.ok) {
          throw new Error('Failed to fetch confirmed venue');
        }
        const result: ConfirmedData = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching confirmed venue:', error);
        alert('Failed to load confirmed venue');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchConfirmedData();
    }
  }, [code]);

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      walking: '🚶',
      driving: '🚗',
      transit: '🚌',
      bicycling: '🚴'
    };
    return icons[mode?.toLowerCase()] || '🚶';
  };

  const getPriceSymbol = (level?: number) => {
    if (!level) return '';
    return '€'.repeat(level);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Confirmed venue not found</p>
        </div>
      </div>
    );
  }

  const venue = data.confirmed_venue;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce mb-4">
            <div className="text-8xl">✅</div>
          </div>
          <h1 className="text-5xl font-bold text-emerald-700 mb-3">
            Venue Confirmed!
          </h1>
          <p className="text-gray-600 text-xl">
            Everyone knows where to meet
          </p>
        </div>

        {/* Venue Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block bg-emerald-100 rounded-full p-4 mb-4">
              <span className="text-5xl">📍</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              {venue.name}
            </h2>
            <div className="flex items-center justify-center gap-4 text-lg text-gray-600">
              {venue.rating && (
                <span className="flex items-center gap-1">
                  ⭐ {venue.rating.toFixed(1)}
                </span>
              )}
              {venue.priceLevel && (
                <span>{getPriceSymbol(venue.priceLevel)}</span>
              )}
            </div>
            {venue.address && (
              <p className="text-gray-600 mt-2">{venue.address}</p>
            )}
          </div>

          {/* Travel Times */}
          {venue.travelTimes && venue.travelTimes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Travel Times for Everyone
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venue.travelTimes.map((time, idx) => (
                  <div
                    key={idx}
                    className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 flex items-center gap-3"
                  >
                    <span className="text-3xl">{getTransitIcon(time.mode)}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{time.personName}</div>
                      <div className="text-sm text-gray-600">{time.mode.toLowerCase()}</div>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {time.duration} min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Max Travel Time */}
          {venue.maxTravelTime && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white text-center mb-6">
              <div className="text-lg font-semibold mb-2">Fairest Travel Time</div>
              <div className="text-5xl font-bold">{venue.maxTravelTime} min</div>
              <div className="text-sm opacity-90 mt-2">Maximum time anyone travels</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-600 transition-all shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View on Map
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-emerald-600 transition-all shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Who's Coming ({data.participants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.participants.map((participant, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {participant.participant_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">
                    {participant.participant_name}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{getTransitIcon(participant.transit_mode)}</span>
                    <span className="truncate">{participant.location_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meetup Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6 text-center text-sm text-gray-600">
          <p>
            Confirmed on {formatDateTime(data.meetup.confirmed_at)}
          </p>
          <p className="mt-2">
            Meetup Code: <span className="font-mono font-bold text-emerald-600">{data.meetup.code}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetupConfirmed;
