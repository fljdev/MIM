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
    // Redirect to MiM Town dashboard after registration
    navigate('/mim-town/dashboard');
  };

  const handleLoginSuccess = (loggedInUser: { id: number; email: string; name: string }) => {
    const token = localStorage.getItem('token') || '';
    login(loggedInUser, token);
    setIsLoginModalOpen(false);
    // Redirect to MiM Town dashboard after login
    navigate('/mim-town/dashboard');
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
    navigate('/profile');
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

  const updateTransitMode = (personIndex: number, mode: string) => {
    setTransitModes(prev => {
      const newModes = [...prev];
      newModes[personIndex] = mode;
      return newModes;
    });
  };

  // NEW: Handle Find Meeting Spot
  const handleFindMeetingSpot = async () => {
    setIsSearching(true);

    try {
      // Build params - only include actual locations with coordinates
      const validPeople = people.filter(p => p.coordinates);

      if (validPeople.length < 2) {
        alert('Please enter locations for at least two people');
        setIsSearching(false);
        return;
      }

      const locations = validPeople.map((person, idx) => ({
        address: person.location,
        coordinates: person.coordinates!,
        placeId: person.placeId,
        transitMode: transitModes[idx] || 'WALKING'
      }));

      // Build mode flags
      const modes = {
        sustainable: sustainableMode,
        accessible: accessibilityMode,
        private: privacyMode,
        budget: budgetMode
      };

      // Build request body
      const requestBody = {
        locations,
        modes,
        maxTravelTime,
        venueTypes: selectedVenueTypes.length > 0 ? selectedVenueTypes : undefined,
        priceLevels: budgetMode && selectedPriceLevels.length > 0 ? selectedPriceLevels : undefined
      };

      devLog('Making request to:', `${API_BASE_URL}/api/meetup/find-spot`);
      devLog('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/api/meetup/find-spot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        devLog('Error response:', errorText);
        throw new Error(`Failed to find meeting spot: ${response.status}`);
      }

      const data = await response.json();
      devLog('Response data:', data);

      setSearchResults(data);
    } catch (error) {
      console.error('Error finding meeting spot:', error);
      alert('Failed to find meeting spot. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search results to go back to input view
  const handleResetSearch = () => {
    setSearchResults(null);
  };

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
                  <span className="hidden md:inline text-brand-cream font-medium">
                    Hi, {user.name}!
                  </span>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-white text-brand-turquoise rounded-lg font-semibold hover:bg-brand-cream transition-all"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white text-brand-turquoise rounded-lg font-semibold hover:bg-brand-cream transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {searchResults ? (
              <ResultsView
                results={searchResults}
                onNewSearch={handleResetSearch}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 border-2 border-brand-turquoise">
                  <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-brand-turquoise">
                    Find Your Fair Meeting Spot
                  </h2>

                  {/* People Input Section */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Who's Meeting?</h3>
                    <div className="space-y-4">
                      {people.map((person, index) => (
                        <div key={person.id} className="space-y-2 md:space-y-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-brand-turquoise text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Name"
                              value={person.name}
                              onChange={(e) => updatePersonName(person.id, e.target.value)}
                              className="flex-1 md:flex-none md:w-48 px-3 md:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise text-sm md:text-base"
                            />
                            {index > 1 && (
                              <button
                                onClick={() => removePerson(person.id)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm md:text-base"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 ml-10 md:ml-12">
                            <LocationAutocomplete
                              onChange={(address, placeId, coordinates) =>
                                updatePersonLocation(person.id, address, placeId, coordinates)
                              }
                              value={person.location}
                              placeholder={`Where is ${person.name || 'this person'} starting from?`}
                            />
                          </div>

                          {/* Transit mode selector for this person */}
                          <div className="ml-10 md:ml-12 flex flex-wrap gap-2">
                            {['WALKING', 'BICYCLING', 'TRANSIT', 'DRIVING'].map((mode) => (
                              <button
                                key={mode}
                                onClick={() => updateTransitMode(index, mode)}
                                className={`px-3 py-1.5 text-xs md:text-sm rounded-lg border-2 font-semibold transition-all ${transitModes[index] === mode
                                  ? 'bg-brand-turquoise text-white border-brand-turquoise'
                                  : 'bg-white text-brand-brown border-gray-300 hover:border-brand-turquoise'
                                  }`}
                              >
                                {mode === 'WALKING' && '🚶 Walk'}
                                {mode === 'BICYCLING' && '🚴 Bike'}
                                {mode === 'TRANSIT' && '🚇 Transit'}
                                {mode === 'DRIVING' && '🚗 Drive'}
                              </button>
                            ))}
                          </div>

                          {/* Saved Locations for Person 1 (logged in user) */}
                          {index === 0 && user && (
                            <div className="ml-10 md:ml-12 space-y-2">
                              <SavedLocationsList
                                onSelectLocation={handleSelectSavedLocation}
                                refreshTrigger={savedLocationsRefresh}
                                onDeleteLocation={handleLocationDeleted}
                              />
                              {person.location && person.coordinates && (
                                <button
                                  onClick={handleSaveLocationClick}
                                  className="text-brand-turquoise text-sm hover:text-brand-turquoise-dark font-medium"
                                >
                                  💾 Save this location
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {people.length < 4 && (
                      <button
                        onClick={addPerson}
                        className="mt-4 w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-brand-cream text-brand-turquoise border-2 border-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all text-sm md:text-base"
                      >
                        ➕ Add Another Person
                      </button>
                    )}
                  </div>

                  {/* Mode Selection */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">Preferences</h3>
                    <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                      <button
                        onClick={() => setSustainableMode(!sustainableMode)}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${sustainableMode
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        🌱 Sustainable
                      </button>
                      <button
                        onClick={() => setAccessibilityMode(!accessibilityMode)}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${accessibilityMode
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        ♿ Accessible
                      </button>
                      <button
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${privacyMode
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        🔒 Private
                      </button>
                      <button
                        onClick={() => setBudgetMode(!budgetMode)}
                        className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${budgetMode
                          ? 'bg-brand-cream border-brand-turquoise text-brand-turquoise'
                          : 'border-gray-300 text-brand-brown hover:border-brand-turquoise-light'
                          }`}
                      >
                        💰 Budget
                      </button>
                    </div>
                  </div>

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
// Fri Apr 24 10:37:59 IST 2026
