// VenueDisplayTiers.tsx - The ULTIMATE venue display with 3-tier layout
// Top 3 (HERO) → Middle 10 (Semi-Prominent) → Remaining 7 (Compact/Expandable)

import React from 'react';
import {
  getTrafficDisplayInfo,
  getTrafficEmoji,
  getCurrentTrafficCondition,
  isRushHour
} from '../../../lib/mockTrafficData';
import {
  getMockWeather,
  getWeatherWarning
} from '../../../lib/mockWeatherData';
import {
  calculateTravelTime
} from '../../../lib/calculations/travelTimeCalculator';

interface Participant {
  id: number;
  name: string;
  transport: string;
  location: {
    name: string;
    lat: number | null;
    lng: number | null;
  };
}

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

interface VenueDisplayTiersProps {
  venues: Venue[];
  participants: Participant[];
  getTransitIcon: (mode: string) => string;
  votes: {[venueId: string]: Array<{voter_name: string, voter_id: number}>};
  getVoteInfo: (venueId: number) => {count: number, voters: string[], voter_ids: number[]};
  handleVote: (venueId: string) => void;
  votingInProgress: boolean;
  currentUserId: number;
}

// Helper: Get weather display properties
const getWeatherDisplay = (weatherMain: string) => {
  switch(weatherMain) {
    case 'Clear': return { emoji: '☀️', color: 'yellow', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-300' };
    case 'Clouds': return { emoji: '☁️', color: 'gray', bgClass: 'bg-gray-50', borderClass: 'border-gray-300' };
    case 'Rain': return { emoji: '🌧️', color: 'blue', bgClass: 'bg-blue-50', borderClass: 'border-blue-300' };
    case 'Drizzle': return { emoji: '🌦️', color: 'blue', bgClass: 'bg-blue-50', borderClass: 'border-blue-300' };
    case 'Thunderstorm': return { emoji: '⛈️', color: 'purple', bgClass: 'bg-purple-50', borderClass: 'border-purple-300' };
    case 'Snow': return { emoji: '❄️', color: 'blue', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' };
    default: return { emoji: '🌤️', color: 'gray', bgClass: 'bg-gray-50', borderClass: 'border-gray-300' };
  }
};

// Helper: Get Google Maps directions URL
const getGoogleMapsDirectionsUrl = (lat?: number, lng?: number, name?: string) => {
  if (!lat || !lng) return null;
  const destination = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${encodeURIComponent(name || '')}`;
};

// HERO CARD - Top 3 Venues (MASSIVE)
const HeroVenueCard: React.FC<{
  venue: Venue;
  rank: number;
  participants: Participant[];
  getTransitIcon: (mode: string) => string;
  voteInfo: {count: number, voters: string[], voter_ids: number[]};
  handleVote: (venueId: string) => void;
  votingInProgress: boolean;
  isCurrentUserVote: boolean;
}> = ({ venue, rank, participants, getTransitIcon, voteInfo, handleVote, votingInProgress, isCurrentUserVote }) => {
  
  // Calculate travel data ON THE FLY using calculator
  const travelData = participants.map((participant) => {
    // Calculate base travel time from participant location to venue
    const baseTime = (participant.location.lat && participant.location.lng && venue.latitude && venue.longitude)
      ? calculateTravelTime(
          participant.location.lat,
          participant.location.lng,
          venue.latitude,
          venue.longitude,
          participant.transport.toLowerCase()
        )
      : 0;
    
    // Apply traffic conditions
    const trafficInfo = getTrafficDisplayInfo(baseTime, participant.transport.toLowerCase());
    
    return { participant, trafficInfo };
  });

  // Fairness metrics
  const times = travelData.map(d => d.trafficInfo.totalTime);
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  const timeDifference = maxTime - minTime;
  const isSuperFair = timeDifference <= 3;
  const isFair = timeDifference <= 7;

  // Weather
  const weather = getMockWeather(venue.latitude || 53.35, venue.longitude || -6.26);
  const weatherWarning = getWeatherWarning(weather);
  const tempC = Math.round(weather.main.temp - 273.15);
  const weatherMain = weather.weather[0].main;
  const weatherDesc = weather.weather[0].description;
  const weatherDisplay = getWeatherDisplay(weatherMain);

  // Medal colors (rank is 1-3, but array is 0-indexed)
  const medalColors = [
    { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-400', medal: '🥇', badgeBg: 'bg-yellow-500' },
    { bg: 'from-gray-50 to-gray-100', border: 'border-gray-400', medal: '🥈', badgeBg: 'bg-gray-400' },
    { bg: 'from-amber-50 to-amber-100', border: 'border-amber-400', medal: '🥉', badgeBg: 'bg-amber-700' }
  ];
  const colors = medalColors[rank - 1]; // rank is 1-based, array is 0-based!

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border-4 ${colors.border} shadow-2xl ${isCurrentUserVote ? 'ring-4 ring-green-500' : ''} transition-all hover:scale-[1.02]`}>
      {/* Header with Rank */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-3xl ${colors.badgeBg} shadow-lg`}>
          {colors.medal}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-1">
            {'€'.repeat(venue.priceLevel || 2)}
          </div>
          {venue.rating && (
            <div className="flex items-center gap-1 justify-end">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="font-bold text-lg">{venue.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Venue Name & Address */}
      <h3 className="text-2xl font-black text-gray-900 mb-2">{venue.name}</h3>
      <p className="text-sm text-gray-700 mb-4 font-medium">{venue.address}</p>

      {/* HERO: MASSIVE TRAVEL TIMES */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl p-5 mb-4 border-3 border-emerald-300 shadow-lg">
        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-wide mb-4 text-center">
          ⏱️ TRAVEL TIMES
        </h4>
        
        <div className="space-y-3 mb-4">
          {travelData.map(({ participant, trafficInfo }) => (
            <div key={participant.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getTransitIcon(participant.transport)}</span>
                <span className="font-black text-gray-900 text-xl">{participant.name}</span>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-emerald-600">
                  {trafficInfo.totalTime}
                  <span className="text-xl text-gray-500 ml-1">min</span>
                </div>
                {trafficInfo.delay > 0 && (
                  <div className="text-sm text-orange-600 font-bold">
                    +{trafficInfo.delay} traffic
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MASSIVE FAIRNESS BADGE */}
        <div className={`p-4 rounded-xl text-center shadow-lg ${
          isSuperFair 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : isFair
              ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white'
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900'
        }`}>
          <div className="text-3xl font-black uppercase tracking-wider">
            {isSuperFair ? '⭐ SUPER FAIR ⭐' : isFair ? '✅ FAIR' : '⚖️ OK'}
          </div>
          <div className="text-base font-bold mt-2 opacity-95">
            {timeDifference === 0 
              ? 'Exactly the same time!' 
              : `Only ${timeDifference} min difference`
            }
          </div>
        </div>
      </div>

      {/* WEATHER - BIG */}
      <div className={`${weatherDisplay.bgClass} rounded-xl p-4 mb-4 border-2 ${weatherDisplay.borderClass}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{weatherDisplay.emoji}</span>
            <div>
              <div className="text-3xl font-black text-gray-800">{tempC}°C</div>
              <div className="text-sm text-gray-700 capitalize font-bold">{weatherDesc}</div>
            </div>
          </div>
        </div>
        {weatherWarning && (
          <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-orange-900">{weatherWarning}</div>
          </div>
        )}
      </div>

      {/* TRAFFIC - BIG */}
      <div className={`rounded-xl p-4 mb-4 border-2 ${
        getTrafficEmoji() === '🟢' ? 'bg-green-50 border-green-400' :
        getTrafficEmoji() === '🟡' ? 'bg-yellow-50 border-yellow-400' :
        'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{getTrafficEmoji()}</span>
            <div>
              <div className="text-lg font-black text-gray-900">
                {getCurrentTrafficCondition().description}
              </div>
              {isRushHour() && (
                <div className="text-sm font-black text-orange-600 flex items-center gap-1">
                  🚨 RUSH HOUR
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Get Directions Button */}
      {venue.latitude && venue.longitude && (
        <a
          href={getGoogleMapsDirectionsUrl(venue.latitude, venue.longitude, venue.name) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mb-3 text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-base font-bold shadow-md"
        >
          🗺️ Get Directions
        </a>
      )}

      {/* Vote Button & Count */}
      <button
        onClick={() => handleVote(venue.id.toString())}
        disabled={votingInProgress}
        className={`w-full px-6 py-3 rounded-lg font-bold text-lg transition-all shadow-md ${
          isCurrentUserVote
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        } ${votingInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isCurrentUserVote ? '✓ Your Vote' : 'Vote for This Venue'}
      </button>
      
      <div className="text-center text-sm font-bold mt-2">
        {voteInfo.count === 0 ? (
          <span className="text-gray-500">No votes yet</span>
        ) : voteInfo.count === 1 ? (
          <span className="text-blue-700">{voteInfo.voters[0]} voted</span>
        ) : (
          <span className="text-green-700">✓ Both voted! ({voteInfo.voters.join(' & ')})</span>
        )}
      </div>
    </div>
  );
};

// MEDIUM CARD - Venues 4-13 (Semi-Prominent)
const MediumVenueCard: React.FC<{
  venue: Venue;
  rank: number;
  participants: Participant[];
  getTransitIcon: (mode: string) => string;
  voteInfo: {count: number, voters: string[], voter_ids: number[]};
  handleVote: (venueId: string) => void;
  votingInProgress: boolean;
  isCurrentUserVote: boolean;
}> = ({ venue, rank, participants, getTransitIcon, voteInfo, handleVote, votingInProgress, isCurrentUserVote }) => {
  
  // Calculate travel times on the fly
  const travelData = participants.map((participant) => {
    const baseTime = (participant.location.lat && participant.location.lng && venue.latitude && venue.longitude)
      ? calculateTravelTime(
          participant.location.lat,
          participant.location.lng,
          venue.latitude,
          venue.longitude,
          participant.transport.toLowerCase()
        )
      : 0;
    const trafficInfo = getTrafficDisplayInfo(baseTime, participant.transport.toLowerCase());
    return { participant, trafficInfo };
  });

  const times = travelData.map(d => d.trafficInfo.totalTime);
  const timeDifference = Math.max(...times) - Math.min(...times);
  const isFair = timeDifference <= 7;

  const weather = getMockWeather(venue.latitude || 53.35, venue.longitude || -6.26);
  const tempC = Math.round(weather.main.temp - 273.15);
  const weatherDisplay = getWeatherDisplay(weather.weather[0].main);

  return (
    <div className={`bg-white rounded-xl p-4 border-2 border-gray-300 hover:border-emerald-400 hover:shadow-xl transition-all ${isCurrentUserVote ? 'ring-2 ring-green-500' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-gray-400">#{rank}</span>
            <h4 className="text-lg font-bold text-gray-900">{venue.name}</h4>
          </div>
          <p className="text-xs text-gray-600">{venue.address}</p>
        </div>
        <div className="text-xl font-bold ml-2">
          {'€'.repeat(venue.priceLevel || 2)}
        </div>
      </div>

      {/* Travel Times - Compact */}
      <div className="bg-emerald-50 rounded-lg p-3 mb-2 border border-emerald-200">
        <div className="space-y-1.5">
          {travelData.map(({ participant, trafficInfo }) => (
            <div key={participant.id} className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                <span className="text-lg">{getTransitIcon(participant.transport)}</span>
                <span className="font-semibold">{participant.name}:</span>
              </span>
              <span className="font-bold text-emerald-600">{trafficInfo.totalTime} min</span>
            </div>
          ))}
        </div>
        <div className={`mt-2 pt-2 border-t border-emerald-200 text-center text-xs font-bold ${isFair ? 'text-green-700' : 'text-yellow-700'}`}>
          {isFair ? '✅ Fair' : '⚖️ OK'} - {timeDifference} min diff
        </div>
      </div>

      {/* Weather & Traffic - Compact */}
      <div className="flex gap-2 mb-3 text-xs">
        <div className={`flex-1 ${weatherDisplay.bgClass} rounded px-2 py-1 text-center font-semibold`}>
          {weatherDisplay.emoji} {tempC}°C
        </div>
        <div className="flex-1 bg-gray-50 rounded px-2 py-1 text-center font-semibold">
          {getTrafficEmoji()} Traffic
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {venue.latitude && venue.longitude && (
          <a
            href={getGoogleMapsDirectionsUrl(venue.latitude, venue.longitude, venue.name) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all"
          >
            🗺️ Directions
          </a>
        )}
        <button
          onClick={() => handleVote(venue.id.toString())}
          disabled={votingInProgress}
          className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-all ${
            isCurrentUserVote
              ? 'bg-green-600 text-white'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          } ${votingInProgress ? 'opacity-50' : ''}`}
        >
          {isCurrentUserVote ? '✓ Voted' : 'Vote'}
        </button>
      </div>
      
      <div className="text-center text-xs mt-2">
        {voteInfo.count === 2 && <span className="text-green-700 font-bold">✓ Both voted</span>}
        {voteInfo.count === 1 && <span className="text-blue-600 font-semibold">{voteInfo.voters[0]}</span>}
      </div>
    </div>
  );
};

// COMPACT CARD - Remaining venues (Expandable list)
const CompactVenueCard: React.FC<{
  venue: Venue;
  rank: number;
  participants: Participant[];
  getTransitIcon: (mode: string) => string;
  voteInfo: {count: number, voters: string[], voter_ids: number[]};
  handleVote: (venueId: string) => void;
  votingInProgress: boolean;
  isCurrentUserVote: boolean;
}> = ({ venue, rank, participants, getTransitIcon, voteInfo, handleVote, votingInProgress, isCurrentUserVote }) => {
  
  // Calculate travel times on the fly
  const travelData = participants.map((participant) => {
    const baseTime = (participant.location.lat && participant.location.lng && venue.latitude && venue.longitude)
      ? calculateTravelTime(
          participant.location.lat,
          participant.location.lng,
          venue.latitude,
          venue.longitude,
          participant.transport.toLowerCase()
        )
      : 0;
    const trafficInfo = getTrafficDisplayInfo(baseTime, participant.transport.toLowerCase());
    return { participant, trafficInfo };
  });

  return (
    <div className={`bg-gray-50 rounded-lg p-3 border border-gray-300 hover:border-emerald-300 transition-all ${isCurrentUserVote ? 'ring-2 ring-green-400 bg-green-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-400">#{rank}</span>
            <h5 className="font-bold text-gray-900">{venue.name}</h5>
          </div>
          <p className="text-xs text-gray-600 mb-1">{venue.address} • {'€'.repeat(venue.priceLevel || 2)}</p>
          <div className="flex gap-3 text-xs text-gray-700">
            {travelData.map(({ participant, trafficInfo }) => (
              <span key={participant.id}>
                {getTransitIcon(participant.transport)} {participant.name}: <span className="font-bold">{trafficInfo.totalTime}min</span>
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          <div className="text-xs text-center min-w-[70px]">
            {voteInfo.count === 2 ? (
              <span className="text-green-700 font-bold">✓ Both</span>
            ) : voteInfo.count === 1 ? (
              <span className="text-blue-600 font-semibold">{voteInfo.voters[0]}</span>
            ) : (
              <span className="text-gray-500">No votes</span>
            )}
          </div>
          <button
            onClick={() => handleVote(venue.id.toString())}
            disabled={votingInProgress}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              isCurrentUserVote
                ? 'bg-green-600 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            } ${votingInProgress ? 'opacity-50' : ''}`}
          >
            {isCurrentUserVote ? '✓' : 'Vote'}
          </button>
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT - 3-Tier Display
const VenueDisplayTiers: React.FC<VenueDisplayTiersProps> = ({
  venues,
  participants,
  getTransitIcon,
  votes,
  getVoteInfo,
  handleVote,
  votingInProgress,
  currentUserId
}) => {
  const [showRemaining, setShowRemaining] = React.useState(false);

  const top3 = venues.slice(0, 3);
  const middle10 = venues.slice(3, 13);
  const remaining = venues.slice(13);

  return (
    <div>
      {/* TOP 3 - HERO CARDS */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-4">🏆 Top 3 Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((venue, index) => {
            const voteInfo = getVoteInfo(venue.id);
            const isCurrentUserVote = voteInfo.voter_ids.includes(currentUserId);
            
            return (
              <HeroVenueCard
                key={venue.id}
                venue={venue}
                rank={index + 1}
                participants={participants}
                getTransitIcon={getTransitIcon}
                voteInfo={voteInfo}
                handleVote={handleVote}
                votingInProgress={votingInProgress}
                isCurrentUserVote={isCurrentUserVote}
              />
            );
          })}
        </div>
      </div>

      {/* MIDDLE 10 - SEMI-PROMINENT */}
      {middle10.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">More Great Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {middle10.map((venue, index) => {
              const voteInfo = getVoteInfo(venue.id);
              const isCurrentUserVote = voteInfo.voter_ids.includes(currentUserId);
              
              return (
                <MediumVenueCard
                  key={venue.id}
                  venue={venue}
                  rank={index + 4}
                  participants={participants}
                  getTransitIcon={getTransitIcon}
                  voteInfo={voteInfo}
                  handleVote={handleVote}
                  votingInProgress={votingInProgress}
                  isCurrentUserVote={isCurrentUserVote}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* REMAINING - COMPACT/EXPANDABLE */}
      {remaining.length > 0 && (
        <div>
          <button
            onClick={() => setShowRemaining(!showRemaining)}
            className="w-full mb-4 py-3 px-4 bg-white rounded-lg font-bold text-gray-800 hover:bg-gray-50 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{showRemaining ? '▲' : '▼'}</span>
            <span>{showRemaining ? 'Hide' : 'Show'} {remaining.length} More Venues</span>
          </button>
          
          {showRemaining && (
            <div className="space-y-2">
              {remaining.map((venue, index) => {
                const voteInfo = getVoteInfo(venue.id);
                const isCurrentUserVote = voteInfo.voter_ids.includes(currentUserId);
                
                return (
                  <CompactVenueCard
                    key={venue.id}
                    venue={venue}
                    rank={index + 14}
                    participants={participants}
                    getTransitIcon={getTransitIcon}
                    voteInfo={voteInfo}
                    handleVote={handleVote}
                    votingInProgress={votingInProgress}
                    isCurrentUserVote={isCurrentUserVote}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueDisplayTiers;