import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Slider } from '@mui/material';
import RegisterModal from './features/auth/components/RegisterModal';
import LoginModal from './features/auth/components/LoginModal';
import LocationAutocomplete from './features/meetup/components/LocationAutocomplete';
import SavedLocationsList from './features/meetup/components/SavedLocationsList';
import SaveLocationModal from './features/meetup/components/SaveLocationModal';
import ResultsView from './features/meetup/components/ResultsView';
import LandingPage from './features/landing/pages/LandingPage';
import { calculateMidpoint } from './lib/calculations/midpointCalculator';
import { DEV_CONFIG, devLog } from './utils/devConfig';
import { API_BASE_URL } from './Config';
import { useAuth } from './features/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Person {
  id: number;
  name: string;
  location: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

function App() {
  const navigate = useNavigate();
  const { user, isLoading, login, logout } = useAuth();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);

  // State for modes
  const [sustainableMode, setSustainableMode] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [budgetMode, setBudgetMode] = useState(false);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([]);

  // State for people
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: '', location: '' },
    { id: 2, name: '', location: '' }
  ]);

  // State for transit modes - one per person, all default to WALKING
  const [transitModes, setTransitModes] = useState<string[]>(['WALKING', 'WALKING']);

  // State for venue types
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  // State for travel time slider
  const [maxTravelTime, setMaxTravelTime] = useState<number>(45); // 45 minutes default

  // State for saved locations
  const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);
  const [locationToSave, setLocationToSave] = useState<{
    address: string;
    placeId?: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [savedLocationsRefresh, setSavedLocationsRefresh] = useState(0);

  // NEW: State for search results
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Pre-fill Person 1 with logged-in user's name when user state changes
  useEffect(() => {
    if (user && user.name) {
      setPeople(prev => [
        { ...prev[0], name: user.name },
        ...prev.slice(1)
      ]);
    }
  }, [user]);

  const handleRegisterSuccess = (newUser: { id: number; email: string; name: string }) => {
    const token = localStorage.getItem('token') || '';
    login(newUser, token);
    setIsRegisterModalOpen(false);
  };

  const handleLoginSuccess = (loggedInUser: { id: number; email: string; name: string }) => {
    const token = localStorage.getItem('token') || '';
    login(loggedInUser, token);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    // Reset people array to default empty state
    setPeople([
      { id: 1, name: '', location: '' },
      { id: 2, name: '', location: '' }
    ]);
  };

  const handleGetStarted = () => {
    navigate('/create-meetup');
  };

  // Person management functions
  const addPerson = () => {
    if (people.length < 4) {
      const newId = Math.max(...people.map(p => p.id)) + 1;
      setPeople([...people, { id: newId, name: '', location: '' }]);
      // Add WALKING mode for new person
      setTransitModes([...transitModes, 'WALKING']);
    }
  };

  const removePerson = (id: number) => {
    if (people.length > 2) {
      const personIndex = people.findIndex(person => person.id === id);
      setPeople(people.filter(person => person.id !== id));
      // Remove transit mode at the same index
      setTransitModes(transitModes.filter((_, i) => i !== personIndex));
    }
  };

  const updatePersonName = (id: number, name: string) => {
    setPeople(people.map(person =>
      person.id === id ? { ...person, name } : person
    ));
  };

  const updatePersonLocation = (
    id: number,
    address: string,
    placeId?: string,
    coordinates?: { lat: number; lng: number }
  ) => {
    setPeople(people.map(person =>
      person.id === id
        ? { ...person, location: address, placeId, coordinates }
        : person
    ));
  };

  // Handle save location button click
  const handleSaveLocationClick = () => {
    const currentUserPerson = people[0];
    if (currentUserPerson.location && currentUserPerson.coordinates) {
      setLocationToSave({
        address: currentUserPerson.location,
        placeId: currentUserPerson.placeId,
        coordinates: currentUserPerson.coordinates,
      });
      setShowSaveLocationModal(true);
    }
  };

  // Handle selecting a saved location
  const handleSelectSavedLocation = (location: any) => {
    updatePersonLocation(
      people[0].id,
      location.address,
      location.place_id || undefined,
      {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      }
    );
  };

  // Handle location saved successfully
  const handleLocationSaved = () => {
    setSavedLocationsRefresh(prev => prev + 1);
  };

  // Handle location deleted
  const handleLocationDeleted = () => {
    setSavedLocationsRefresh(prev => prev + 1);
  };

  const toggleVenueType = (type: string) => {
    setSelectedVenueTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const togglePriceLevel = (level: number) => {
    setSelectedPriceLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  // NEW: Handle Find Meeting Spot button click
  const handleFindMeetingSpot = async () => {
    devLog('🎯 Find Meeting Spot clicked', {
      people,
      sustainableMode,
      accessibilityMode,
      selectedVenueTypes,
      transitModes,
      maxTravelTime
    });

    // Get first two people (basic version - can expand for 3-4 people later)
    const person1 = people[0];
    const person2 = people[1];

    // Validation
    if (!person1.coordinates || !person2.coordinates) {
      alert('Please enter locations for both people');
      return;
    }

    setIsSearching(true);

    try {
      // Calculate midpoint
      const person1Loc = {
        lat: person1.coordinates.lat,
        lng: person1.coordinates.lng,
        address: person1.location
      };

      const person2Loc = {
        lat: person2.coordinates.lat,
        lng: person2.coordinates.lng,
        address: person2.location
      };

      const midpoint = calculateMidpoint(person1Loc, person2Loc);
      devLog('📍 Midpoint calculated', midpoint);

      // Call backend API to get venues with proper travel time calculations
      devLog('📡 Calling backend API for venues');

      try {
        const response = await fetch(`${API_BASE_URL}/api/midpoint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locations: people.slice(0, 2).map(p => ({
              lat: p.coordinates!.lat,
              lng: p.coordinates!.lng,
              name: p.name || 'Unknown'
            })),
            transitModes: transitModes.slice(0, 2),
            maxTravelTime: maxTravelTime,
            venueType: selectedVenueTypes.length > 0 ? selectedVenueTypes : ['cafe', 'restaurant', 'bar', 'parks'],
            budgetMode: budgetMode,
            priceLevels: selectedPriceLevels
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch venues');
        }

        const data = await response.json();
        devLog(`✅ Found ${data.venues.length} venues from backend`, data);

        setSearchResults({
          midpoint,
          venues: data.venues,
          transitModes,
          sustainableMode,
          accessibilityMode,
          budgetMode,
          selectedVenueTypes,
          maxTravelTime,
          person1: {
            name: person1.name || 'You',
            location: person1.location,
            coordinates: person1.coordinates
          },
          person2: {
            name: person2.name || 'Friend',
            location: person2.location,
            coordinates: person2.coordinates
          }
        });
      } catch (apiError) {
        console.error('Backend API error:', apiError);
        alert('Error fetching venues from backend. Please try again.');
        throw apiError;
      }

    } catch (error) {
      console.error('❌ Error finding meeting spot:', error);
      alert('Error finding meeting spot. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // NEW: Handle going back to search form
  const handleNewSearch = () => {
    devLog('🔄 New search initiated');
    setSearchResults(null);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-turquoise mb-4"></div>
          <p className="text-brand-brown text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {showLandingPage ? (
        <LandingPage
          onGetStarted={handleGetStarted}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenSignup={() => setIsRegisterModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {/* Header */}
          <header className="bg-brand-turquoise text-white shadow-lg relative">
            <div className="container mx-auto px-4 py-4 flex items-center">
              <div className="flex-1 flex items-center gap-4">
                <button
                  onClick={() => setShowLandingPage(true)}
                  className="flex items-center gap-3 hover:opacity-80 transition-all cursor-pointer bg-transparent border-none p-0"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h1 className="text-2xl font-bold">Meet in Middle</h1>
                </button>
                <button
                  onClick={() => setShowLandingPage(true)}
                  className="hidden md:inline-block px-4 py-2 bg-brand-turquoise-dark text-white rounded-lg font-semibold hover:bg-opacity-80 transition-all border-2 border-white"
                >
                  🏠 Home
                </button>
                <Link
                  to="/create-meetup"
                  className="hidden md:inline-block px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                >
                  🎉 Create Group Meetup
                </Link>
              </div>

              {!user ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 bg-white text-brand-turquoise rounded-lg font-semibold hover:bg-brand-cream transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="px-4 py-2 bg-brand-turquoise-dark text-white rounded-lg font-semibold hover:bg-opacity-80 transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs opacity-75">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-brand-turquoise-dark text-white rounded-lg font-semibold hover:bg-opacity-80 transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mode Toggles */}
            <div className="bg-brand-turquoise-dark py-2 md:py-3 border-t border-brand-turquoise">
              <div className="container mx-auto px-2 md:px-4 flex flex-wrap justify-center gap-2 md:gap-4">
                {/* Sustainable Toggle */}
                <button
                  onClick={() => setSustainableMode(!sustainableMode)}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm md:text-base rounded-lg font-semibold transition-all ${sustainableMode
                    ? 'bg-white text-brand-turquoise-dark'
                    : 'bg-brand-turquoise text-white hover:bg-brand-turquoise-light'
                    }`}
                >
                  <span className="text-lg md:text-xl">🌱</span>
                  <span className="hidden sm:inline">Sustainable</span>
                  {sustainableMode && (
                    <span className="ml-1 text-xs bg-brand-turquoise text-white px-2 py-0.5 rounded-full">
                      ON
                    </span>
                  )}
                </button>

                {/* Accessibility Toggle */}
                <button
                  onClick={() => setAccessibilityMode(!accessibilityMode)}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm md:text-base rounded-lg font-semibold transition-all ${accessibilityMode
                    ? 'bg-white text-blue-700'
                    : 'bg-brand-turquoise text-white hover:bg-brand-turquoise-light'
                    }`}
                >
                  <span className="text-lg md:text-xl">♿</span>
                  <span className="hidden sm:inline">Accessible</span>
                  {accessibilityMode && (
                    <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      ON
                    </span>
                  )}
                </button>

                {/* Privacy Toggle */}
                <button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm md:text-base rounded-lg font-semibold transition-all ${privacyMode
                    ? 'bg-white text-purple-700'
                    : 'bg-brand-turquoise text-white hover:bg-brand-turquoise-light'
                    }`}
                >
                  <span className="text-lg md:text-xl">🔒</span>
                  <span className="hidden sm:inline">Private</span>
                  {privacyMode && (
                    <span className="ml-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      ON
                    </span>
                  )}
                </button>

                {/* Budget Toggle */}
                <button
                  onClick={() => setBudgetMode(!budgetMode)}
                  className={`px-2 md:px-4 py-2 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${budgetMode
                    ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                    : 'border-white/50 text-white hover:border-white'
                    }`}
                >
                  💰 Budget
                </button>

              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {/* NEW: Conditional rendering - show results or search form */}
            {searchResults ? (
              <ResultsView
                results={searchResults}
                onNewSearch={handleNewSearch}
              />
            ) : (
              <div className="w-full px-2 md:px-4 py-4 md:py-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-4 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-brand-turquoise">
                    Who's Meeting?
                  </h2>

                  {/* People Section */}
                  <div className="space-y-6 mb-8">
                    {/* Dublin City Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-center">
                      <p className="text-amber-800 text-sm font-medium">
                        📍 Currently only <span className="font-bold underline">Dublin City</span> locations are supported
                      </p>
                    </div>

                    {people.map((person, index) => {
                      const isCurrentUser = user && index === 0;
                      return (
                        <div key={person.id} className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-brand-brown">
                              {isCurrentUser ? 'You' : `Friend ${index}`}
                            </h3>
                            {index >= 2 && (
                              <button
                                onClick={() => removePerson(person.id)}
                                className="text-red-500 hover:text-red-600 text-sm font-semibold"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          {/* Name Input */}
                          <input
                            type="text"
                            value={person.name}
                            onChange={(e) => updatePersonName(person.id, e.target.value)}
                            placeholder={isCurrentUser ? user?.name : `Name (e.g., Sarah)`}
                            disabled={isCurrentUser}
                            className={`w-full px-4 py-2 mb-2 border-2 rounded-lg focus:outline-none focus:border-brand-turquoise ${isCurrentUser
                              ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                              : 'border-gray-300'
                              }`}
                          />

                          {/* Saved Locations List - Only for logged-in user */}
                          {isCurrentUser && user && (
                            <SavedLocationsList
                              onSelectLocation={handleSelectSavedLocation}
                              onDeleteLocation={handleLocationDeleted}
                              refreshTrigger={savedLocationsRefresh}
                            />
                          )}

                          {/* Location Autocomplete with Save Button */}
                          <div className="relative mb-3">
                            <LocationAutocomplete
                              value={person.location}
                              onChange={(address, placeId, coordinates) =>
                                updatePersonLocation(person.id, address, placeId, coordinates)
                              }
                              placeholder={isCurrentUser ? "📍 Your location (DUBLIN CITY ONLY)" : "📍 Their location (DUBLIN CITY ONLY)"}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
                            />
                            {/* Save Location Button - Only for logged-in user with a valid location */}
                            {isCurrentUser && user && person.location && person.coordinates && (
                              <button
                                onClick={handleSaveLocationClick}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-brand-turquoise hover:text-brand-turquoise-dark transition-colors"
                                title="Save this location"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Travel Mode Dropdown */}
                          <div>
                            <label htmlFor={`transit-mode-${person.id}`} className="block text-sm font-medium text-brand-brown mb-1">
                              Travel Mode
                            </label>
                            <select
                              id={`transit-mode-${person.id}`}
                              value={transitModes[index]}
                              onChange={(e) => {
                                const newModes = [...transitModes];
                                newModes[index] = e.target.value;
                                setTransitModes(newModes);
                              }}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise bg-white"
                            >
                              <option value="WALKING">🚶 Walking</option>
                              <option value="DRIVING">🚗 Driving</option>
                              <option value="TRANSIT">🚌 Transit</option>
                              <option value="BICYCLING">🚴 Bicycling</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Person Button */}
                  {people.length < 4 && (
                    <button
                      onClick={addPerson}
                      className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-brand-brown hover:border-brand-turquoise hover:text-brand-turquoise transition-all"
                    >
                      + Add Another Friend ({people.length} of 4)
                    </button>
                  )}

                  {people.length === 4 && (
                    <div className="mt-4 w-full py-3 bg-brand-cream border-2 border-brand-turquoise rounded-lg text-brand-turquoise text-center font-semibold">
                      ✓ Maximum 4 People
                    </div>
                  )}

                  {/* Vibe (Venue Type) */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Vibe</h3>
                    <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                      <button
                        onClick={() => toggleVenueType('cafe')}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${selectedVenueTypes.includes('cafe')
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        ☕ Coffee
                      </button>
                      <button
                        onClick={() => toggleVenueType('restaurant')}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${selectedVenueTypes.includes('restaurant')
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        🍽️ Food
                      </button>
                      <button
                        onClick={() => toggleVenueType('bar')}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${selectedVenueTypes.includes('bar')
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        🍺 Drinks
                      </button>
                      <button
                        onClick={() => toggleVenueType('parks')}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${selectedVenueTypes.includes('parks')
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        🌳 Parks
                      </button>
                    </div>
                  </div>

                  {/* Budget Price Level Filter - Only visible when Budget mode is active */}
                  {budgetMode && (
                    <div className="mb-6 md:mb-8 bg-brand-cream border-2 border-brand-turquoise rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 text-brand-turquoise text-center">Price Range</h3>
                      <p className="text-sm text-brand-turquoise text-center mb-4">Select one or more price levels (leave empty for all)</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPriceLevels.includes(1)}
                            onChange={() => togglePriceLevel(1)}
                            className="w-5 h-5 text-brand-turquoise border-brand-turquoise rounded focus:ring-brand-turquoise"
                          />
                          <span className="flex-1 font-medium text-brand-turquoise">
                            💵 Inexpensive (€0-10)
                          </span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPriceLevels.includes(2)}
                            onChange={() => togglePriceLevel(2)}
                            className="w-5 h-5 text-brand-turquoise border-brand-turquoise rounded focus:ring-brand-turquoise"
                          />
                          <span className="flex-1 font-medium text-brand-turquoise">
                            💵💵 Moderate (€10-25)
                          </span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPriceLevels.includes(3)}
                            onChange={() => togglePriceLevel(3)}
                            className="w-5 h-5 text-brand-turquoise border-brand-turquoise rounded focus:ring-brand-turquoise"
                          />
                          <span className="flex-1 font-medium text-brand-turquoise">
                            💵💵💵 Expensive (€25-50)
                          </span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPriceLevels.includes(4)}
                            onChange={() => togglePriceLevel(4)}
                            className="w-5 h-5 text-brand-turquoise border-brand-turquoise rounded focus:ring-brand-turquoise"
                          />
                          <span className="flex-1 font-medium text-brand-turquoise">
                            💵💵💵💵 Very Expensive (€50+)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}


                  {/* Travel Time Slider */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold">Max Travel Time</h3>
                      <span className="text-lg font-bold text-brand-turquoise">{maxTravelTime.toFixed(0)} min</span>
                    </div>
                    <Slider
                      value={maxTravelTime}
                      onChange={(e, newValue) => setMaxTravelTime(newValue as number)}
                      min={5}
                      max={60}
                      step={5}
                      marks={[
                        { value: 5, label: '5 min' },
                        { value: 30, label: '30 min' },
                        { value: 60, label: '60 min' }
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value.toFixed(0)} min`}
                      sx={{
                        color: '#14B8A6',
                        '& .MuiSlider-thumb': {
                          backgroundColor: '#14B8A6',
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(20, 184, 166, 0.16)'
                          }
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: '#14B8A6'
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#d1d5db'
                        }
                      }}
                    />
                    <p className="text-sm text-brand-brown mt-2">Find venues where both people arrive within this travel time</p>
                  </div>

                  {/* Find Meeting Spot Button */}
                  <button
                    onClick={handleFindMeetingSpot}
                    disabled={isSearching || !people[0].coordinates || !people[1].coordinates}
                    className="w-full bg-brand-turquoise text-white py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-brand-turquoise-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? '🔍 Searching...' : '🎯 Find Meeting Spot'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Save Location Modal */}
      {locationToSave && (
        <SaveLocationModal
          isOpen={showSaveLocationModal}
          onClose={() => setShowSaveLocationModal(false)}
          onSave={handleLocationSaved}
          address={locationToSave.address}
          placeId={locationToSave.placeId}
          coordinates={locationToSave.coordinates}
        />
      )}
      <footer className="text-center py-4 text-brand-brown text-sm border-t border-brand-turquoise/20 mt-8">
        <p>Meet in the Middle v1.0 | © 2025 Casa Flynn</p>
      </footer>
    </div>
  );
}

export default App;
