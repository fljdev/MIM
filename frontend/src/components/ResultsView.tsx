import React, { useEffect, useState } from 'react';
import {
  getWeatherForLocation,
  getTrafficInfo,
  checkWeatherSuitability
} from '../utils/apiHelpers';
import {
  getTravelTime,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsLocationUrl
} from '../utils/travelTimeCalculator';

interface Venue {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  type: string[];
  openNow: boolean;
  accessible: boolean;
  sustainable: boolean;
  photos: string[];
  distance?: number;
  latitude?: number;
  longitude?: number;
  travelTimes?: Array<{
    personIndex: number;
    mode: string;
    duration: number;
  }>;
}

interface ResultsViewProps {
  results: {
    midpoint: { lat: number; lng: number };
    venues: Venue[];
    person1: {
      name: string;
      location: string;
      coordinates?: { lat: number; lng: number };
    };
    person2: {
      name: string;
      location: string;
      coordinates?: { lat: number; lng: number };
    };
    selectedTransitMode: string;
    transitModes?: string[];
  };
  onNewSearch: () => void;
}

// Weather data interface
interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  isGoodForOutdoors: boolean;
  main: string;
}

interface TravelTimes {
  person1: number;
  person2: number;
  maxTime: number;
}

// Helper function to get transit mode icon
const getTransitModeIcon = (mode: string): string => {
  const icons: { [key: string]: string } = {
    'WALKING': '🚶',
    'DRIVING': '🚗',
    'TRANSIT': '🚌',
    'BICYCLING': '🚴'
  };
  return icons[mode] || '🚶';
};

const ResultsView: React.FC<ResultsViewProps> = ({ results, onNewSearch }) => {
  const { midpoint, venues, person1, person2, selectedTransitMode, transitModes } = results;

  // State for weather data
  const [midpointWeather, setMidpointWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Fetch weather for midpoint when component mounts
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherData = await getWeatherForLocation(midpoint.lat, midpoint.lng);
        const temp = Math.round(weatherData.main.temp - 273.15); // Convert Kelvin to Celsius
        const isGoodForOutdoors = checkWeatherSuitability(weatherData);

        setMidpointWeather({
          temp,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          isGoodForOutdoors: isGoodForOutdoors && temp > 15,
          main: weatherData.weather[0].main
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [midpoint.lat, midpoint.lng]);

  // Calculate travel times for both people to midpoint (for display in header)
  const getMidpointTravelTimes = (): TravelTimes | null => {
    if (!person1.coordinates || !person2.coordinates) return null;

    const person1Time = getTravelTime(
      person1.coordinates.lat,
      person1.coordinates.lng,
      midpoint.lat,
      midpoint.lng,
      selectedTransitMode || 'walking'
    );

    const person2Time = getTravelTime(
      person2.coordinates.lat,
      person2.coordinates.lng,
      midpoint.lat,
      midpoint.lng,
      selectedTransitMode || 'walking'
    );

    return {
      person1: person1Time,
      person2: person2Time,
      maxTime: Math.max(person1Time, person2Time)
    };
  };

  const midpointTravelTimes = getMidpointTravelTimes();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-700">🎯 Meeting Spots Found!</h2>
        <button
          onClick={onNewSearch}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-md"
        >
          ← New Search
        </button>
      </div>

      {/* Midpoint Info with Weather */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl mb-6 border-2 border-emerald-200 shadow-sm">
        <h3 className="font-semibold text-lg mb-3 text-emerald-800">📍 Your Midpoint</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* People Info */}
          <div className="md:col-span-1">
            <p className="text-gray-600 mb-1">Between:</p>
            <p className="font-medium text-emerald-700">
              {person1.name || 'Person 1'}: {person1.location}
            </p>
            <p className="font-medium text-blue-700">
              {person2.name || 'Person 2'}: {person2.location}
            </p>
          </div>

          {/* Coordinates */}
          <div className="md:col-span-1">
            <p className="text-gray-600 mb-1">Coordinates:</p>
            <p className="font-mono text-sm text-gray-700">
              {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
            </p>
          </div>

          {/* Weather Info */}
          <div className="md:col-span-1">
            <p className="text-gray-600 mb-1">Weather:</p>
            {loadingWeather ? (
              <p className="text-sm text-gray-500">Loading weather...</p>
            ) : midpointWeather ? (
              <div className="flex items-center gap-2">
                <img
                  src={`https://openweathermap.org/img/wn/${midpointWeather.icon}.png`}
                  alt={midpointWeather.description}
                  className="w-10 h-10"
                />
                <div>
                  <p className="font-bold text-gray-800">{midpointWeather.temp}°C</p>
                  <p className="text-xs text-gray-600 capitalize">{midpointWeather.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Weather unavailable</p>
            )}
          </div>
        </div>

        {/* Weather Warning */}
        {midpointWeather && !midpointWeather.isGoodForOutdoors && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Weather Note:</strong> {midpointWeather.main === 'Rain'
                ? 'Rain expected - consider indoor venues'
                : 'Not ideal weather for outdoor seating'}
            </p>
          </div>
        )}

        {/* Travel Times to Midpoint */}
        {midpointTravelTimes && (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-gray-600 text-sm mb-2">Estimated Travel Times to Midpoint ({selectedTransitMode}):</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded">
                <p className="text-gray-700">
                  <strong>{person1.name || 'Person 1'}:</strong>
                </p>
                <p className="text-emerald-600 font-medium">
                  {transitModes && transitModes[0] ? getTransitModeIcon(transitModes[0]) : '🚶'} {midpointTravelTimes.person1} min
                </p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="text-gray-700">
                  <strong>{person2.name || 'Person 2'}:</strong>
                </p>
                <p className="text-blue-600 font-medium">
                  {transitModes && transitModes[1] ? getTransitModeIcon(transitModes[1]) : '🚶'} {midpointTravelTimes.person2} min
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Venues List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Found {venues.length} venue{venues.length !== 1 ? 's' : ''}:
        </h3>

        {venues.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium">No venues found matching your preferences.</p>
            <p className="text-yellow-600 text-sm mt-2">Try adjusting your filters or search area.</p>
          </div>
        ) : (
          venues.map((venue, index) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              index={index}
              person1={person1}
              person2={person2}
              transitMode={selectedTransitMode}
              transitModes={transitModes}
              midpointWeather={midpointWeather}
            />
          ))
        )}
      </div>

      {/* Footer tip */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Click on a venue to see directions!
        </p>
      </div>
    </div>
  );
};

// Separate VenueCard component
const VenueCard: React.FC<{
  venue: Venue;
  index: number;
  person1: any;
  person2: any;
  transitMode: string;
  transitModes?: string[];
  midpointWeather: WeatherData | null;
}> = ({ venue, index, person1, person2, transitMode, transitModes, midpointWeather }) => {
  // Use backend-calculated travel times from venue.travelTimes
  const travelTimes: TravelTimes | null = venue.travelTimes ? {
    person1: venue.travelTimes[0].duration,
    person2: venue.travelTimes[1].duration,
    maxTime: Math.max(venue.travelTimes[0].duration, venue.travelTimes[1].duration)
  } : null;

  // Generate Google Maps URL for directions from person1's location
  const mapsUrl = person1.coordinates && venue.latitude && venue.longitude
    ? getGoogleMapsDirectionsUrl(
        person1.coordinates.lat,
        person1.coordinates.lng,
        venue.latitude,
        venue.longitude,
        venue.name
      )
    : null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-emerald-300 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{index + 1}.</span>
            <h4 className="text-xl font-bold text-gray-800">{venue.name}</h4>
          </div>
          <p className="text-sm text-gray-600">{venue.address}</p>
        </div>
        <div className="text-right ml-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="font-bold text-gray-800">{venue.rating.toFixed(1)}</span>
          </div>
          <div className="text-xs text-gray-500">({venue.reviewCount} reviews)</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm mb-3">
        {venue.priceLevel !== undefined && venue.priceLevel > 0 && (
          <span className={`px-2 py-1 rounded font-medium ${
            venue.priceLevel <= 2 
              ? "bg-yellow-100 text-yellow-700" 
              : "bg-gray-100 text-gray-700"
          }`}>
            {'$'.repeat(venue.priceLevel)}
          </span>
        )}
        {venue.openNow && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
            • Open Now
          </span>
        )}
        {venue.accessible && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            ♿ Accessible
          </span>
        )}
        {venue.sustainable && (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
            🌱 Sustainable
          </span>
        )}
        {venue.type.includes('parks') && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            🌳 Park
          </span>
        )}
      </div>

      {/* Travel Times - NOW CALCULATED PER PERSON */}
      {travelTimes && (
        <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">Travel Times ({transitMode}):</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm">
              <p className="text-gray-700">
                <strong>{person1.name || 'Person 1'}</strong>
              </p>
              <p className="text-emerald-600 font-bold">
                {transitModes && transitModes[0] ? getTransitModeIcon(transitModes[0]) : '🚶'} {travelTimes.person1} min
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-700">
                <strong>{person2.name || 'Person 2'}</strong>
              </p>
              <p className="text-blue-600 font-bold">
                {transitModes && transitModes[1] ? getTransitModeIcon(transitModes[1]) : '🚶'} {travelTimes.person2} min
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-emerald-200">
            Max time: <strong>{travelTimes.maxTime} min</strong>
          </p>
        </div>
      )}

      {/* Google Maps Link */}
      {mapsUrl && (
        <div className="mt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
          >
            🗺️ Get Directions
          </a>
        </div>
      )}
    </div>
  );
};

export default ResultsView;