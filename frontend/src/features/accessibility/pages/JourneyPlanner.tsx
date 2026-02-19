import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { TransportService, JourneyOption } from '../../../types/Accessibility';
import LocationAutocomplete from '../../meetup/components/LocationAutocomplete';

const JourneyPlanner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // State for user's current location
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // State for destination (could be passed from venue detail page)
  const [destination, setDestination] = useState<string>('');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // State for accessibility preferences
  const [mobilityNeeds, setMobilityNeeds] = useState<string>('wheelchair'); // default
  const [sensoryNeeds, setSensoryNeeds] = useState<string[]>([]);
  const [transportPreference, setTransportPreference] = useState<string>('all');
  
  // State for results
  const [journeyOptions, setJourneyOptions] = useState<JourneyOption[]>([]);
  const [transportServices, setTransportServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'services' | 'saved'>('plan');

  // If venue data is passed from VenueDetailPage, pre-fill destination
  useEffect(() => {
    if (location.state?.destinationVenue) {
      const venue = location.state.destinationVenue;
      setDestination(venue.name);
      setDestinationCoords({ lat: venue.lat, lng: venue.lng });
    }
  }, [location.state]);

  // Fetch transport services on component mount
  useEffect(() => {
    const fetchTransportServices = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/transport-services');
        if (!response.ok) throw new Error('Failed to fetch transport services');
        const data = await response.json();
        setTransportServices(data.services || []);
      } catch (err) {
        console.error('Error fetching transport services:', err);
      }
    };
    fetchTransportServices();
  }, []);

  const handleCurrentLocationSelect = (address: string, placeId?: string, coordinates?: { lat: number; lng: number }) => {
    setCurrentLocation(address);
    if (coordinates) {
      setCurrentLocationCoords(coordinates);
    }
  };

  const handleDestinationSelect = (address: string, placeId?: string, coordinates?: { lat: number; lng: number }) => {
    setDestination(address);
    if (coordinates) {
      setDestinationCoords(coordinates);
    }
  };

  const toggleSensoryNeed = (need: string) => {
    setSensoryNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const handlePlanJourney = async () => {
    if (!currentLocationCoords || !destinationCoords) {
      setError('Please select both current location and destination');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would call the backend API to calculate journey options
      // For now, we'll mock some data
      const mockJourneyOptions: JourneyOption[] = [
        {
          id: '1',
          transportType: 'public',
          serviceName: 'Dublin Bus Route 46A + Luas',
          durationMinutes: 45,
          steps: [
            { instruction: 'Walk to bus stop (200m)', mode: 'walking', durationMinutes: 5 },
            { instruction: 'Take Dublin Bus 46A to St. Stephen\'s Green', mode: 'bus', durationMinutes: 25 },
            { instruction: 'Transfer to Luas Green Line', mode: 'tram', durationMinutes: 10 },
            { instruction: 'Walk to destination (100m)', mode: 'walking', durationMinutes: 5 }
          ],
          cost: 2.50,
          bookingRequired: false,
          accessibilityMatch: 85,
          warnings: ['Bus may be crowded during peak hours', 'Step-free access at all stations']
        },
        {
          id: '2',
          transportType: 'specialized',
          serviceName: 'Irish Wheelchair Association Accessible Transport',
          durationMinutes: 35,
          steps: [
            { instruction: 'IWA pick-up from your location', mode: 'specialized_vehicle', durationMinutes: 35 }
          ],
          cost: 15.00,
          bookingRequired: true,
          bookingUrl: 'https://iwa.ie/book',
          accessibilityMatch: 95,
          warnings: ['Advance booking required (48 hours)', 'Wheelchair accessible vehicle']
        },
        {
          id: '3',
          transportType: 'car_parking',
          serviceName: 'Drive + Disabled Parking',
          durationMinutes: 25,
          steps: [
            { instruction: 'Drive to destination', mode: 'driving', durationMinutes: 20 },
            { instruction: 'Park in disabled parking bay', mode: 'parking', durationMinutes: 5 }
          ],
          cost: 3.50, // parking cost
          bookingRequired: false,
          accessibilityMatch: 90,
          warnings: ['Limited disabled parking available', 'Check parking availability in advance']
        },
        {
          id: '4',
          transportType: 'taxi',
          serviceName: 'Accessible Taxi (Wheelchair Friendly)',
          durationMinutes: 20,
          steps: [
            { instruction: 'Taxi pick-up from your location', mode: 'taxi', durationMinutes: 20 }
          ],
          cost: 18.50,
          bookingRequired: true,
          bookingUrl: 'https://freenow.com/ie/',
          accessibilityMatch: 88,
          warnings: ['Advance booking recommended', 'Confirm wheelchair accessibility when booking']
        }
      ];

      // Filter based on preferences
      let filteredOptions = mockJourneyOptions;
      if (transportPreference !== 'all') {
        filteredOptions = mockJourneyOptions.filter(option => option.transportType === transportPreference);
      }

      setJourneyOptions(filteredOptions);
    } catch (err) {
      setError('Failed to plan journey. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJourney = (journeyId: string) => {
    // In a real app, this would save to user's profile
    alert(`Journey ${journeyId} saved to your profile!`);
  };

  const handleBookTransport = (serviceName: string, bookingUrl?: string) => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    } else {
      alert(`Please contact ${serviceName} directly to book.`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-white hover:opacity-80"
          >
            ← Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Accessible Journey Planner</h1>
          <p className="text-lg opacity-90">Plan your journey with specialized transport options and accessibility information</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Journey Planning Form */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto mb-6 border-b border-gray-300">
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'plan' ? 'border-b-2 border-brand-turquoise text-brand-turquoise' : 'text-gray-600 hover:text-brand-turquoise'}`}
              >
                Plan Journey
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'services' ? 'border-b-2 border-brand-turquoise text-brand-turquoise' : 'text-gray-600 hover:text-brand-turquoise'}`}
              >
                Transport Services
                <span className="ml-2 bg-brand-turquoise text-white text-xs px-2 py-1 rounded-full">
                  {transportServices.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'saved' ? 'border-b-2 border-brand-turquoise text-brand-turquoise' : 'text-gray-600 hover:text-brand-turquoise'}`}
              >
                Saved Journeys
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              {activeTab === 'plan' && (
                <div className="space-y-8">
                  {/* Current Location */}
                  <div>
                    <h3 className="text-xl font-bold text-brand-turquoise mb-4">1. Where are you starting from?</h3>
                    <div className="relative">
                      <LocationAutocomplete
                        value={currentLocation}
                        onChange={handleCurrentLocationSelect}
                        placeholder="Enter your current location or use current location"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
                      />
                      <button
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                setCurrentLocationCoords({
                                  lat: position.coords.latitude,
                                  lng: position.coords.longitude
                                });
                                setCurrentLocation('Current Location');
                              },
                              () => setError('Unable to retrieve your location')
                            );
                          }
                        }}
                        className="absolute right-2 top-2 px-4 py-2 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all"
                      >
                        📍 Use Current
                      </button>
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <h3 className="text-xl font-bold text-brand-turquoise mb-4">2. Where do you want to go?</h3>
                    <LocationAutocomplete
                      value={destination}
                      onChange={handleDestinationSelect}
                      placeholder="Enter destination address or venue name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate('/browse-venues')}
                        className="px-4 py-2 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all"
                      >
                        Browse Accessible Venues
                      </button>
                      {location.state?.destinationVenue && (
                        <button
                          onClick={() => {
                            const venue = location.state.destinationVenue;
                            setDestination(venue.name);
                            setDestinationCoords({ lat: venue.lat, lng: venue.lng });
                          }}
                          className="px-4 py-2 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all"
                        >
                          Use Selected Venue
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accessibility Preferences */}
                  <div>
                    <h3 className="text-xl font-bold text-brand-turquoise mb-4">3. Your Accessibility Needs</h3>
                    
                    {/* Mobility */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-700 mb-3">Mobility Needs</h4>
                      <div className="flex flex-wrap gap-3">
                        {['wheelchair', 'walker', 'crutches', 'mobility_scooter', 'none'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setMobilityNeeds(type)}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${mobilityNeeds === type ? 'bg-brand-turquoise text-white border-brand-turquoise' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-turquoise'}`}
                          >
                            {type === 'wheelchair' && '♿ Wheelchair'}
                            {type === 'walker' && '🦯 Walker'}
                            {type === 'crutches' && '🦯 Crutches'}
                            {type === 'mobility_scooter' && '🛴 Mobility Scooter'}
                            {type === 'none' && '🚶 No Mobility Aid'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sensory Needs */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-700 mb-3">Sensory Preferences (select all that apply)</h4>
                      <div className="flex flex-wrap gap-3">
                        {['quiet_environment', 'low_lighting', 'avoid_crowds', 'no_sudden_noises', 'clear_signage'].map((need) => (
                          <button
                            key={need}
                            onClick={() => toggleSensoryNeed(need)}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${sensoryNeeds.includes(need) ? 'bg-brand-cream text-brand-turquoise border-brand-turquoise' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-turquoise'}`}
                          >
                            {need === 'quiet_environment' && '🔇 Quiet Environment'}
                            {need === 'low_lighting' && '💡 Low Lighting'}
                            {need === 'avoid_crowds' && '👥 Avoid Crowds'}
                            {need === 'no_sudden_noises' && '🚫 No Sudden Noises'}
                            {need === 'clear_signage' && '📋 Clear Signage'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transport Preference */}
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3">Transport Preference</h4>
                      <div className="flex flex-wrap gap-3">
                        {['all', 'specialized', 'public', 'car_parking', 'taxi'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setTransportPreference(type)}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${transportPreference === type ? 'bg-brand-turquoise text-white border-brand-turquoise' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-turquoise'}`}
                          >
                            {type === 'all' && '🚦 All Options'}
                            {type === 'specialized' && '♿ Specialized Transport'}
                            {type === 'public' && '🚌 Public Transport'}
                            {type === 'car_parking' && '🚗 Drive & Park'}
                            {type === 'taxi' && '🚕 Accessible Taxi'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Plan Journey Button */}
                  <button
                    onClick={handlePlanJourney}
                    disabled={loading || !currentLocation || !destination}
                    className="w-full px-6 py-4 bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '🔍 Planning Your Journey...' : '🎯 Plan My Journey'}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Specialized Transport Services</h3>
                  <p className="text-gray-600">These services provide accessible transportation options in Ireland.</p>
                  
                  {transportServices.length > 0 ? (
                    <div className="space-y-6">
                      {transportServices.map(service => (
                        <div key={service.id} className="bg-brand-cream rounded-xl p-6 border-2 border-brand-turquoise">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">♿</span>
                                <h4 className="text-xl font-bold text-brand-turquoise">{service.serviceName}</h4>
                                {service.wheelchairAccessible && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    Wheelchair Accessible
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 mb-3">{service.organization}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <div className="font-bold text-gray-700">Coverage Areas</div>
                                  <div className="text-gray-600">
                                    {service.coverageAreas?.join(', ') || 'Nationwide'}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-700">Contact</div>
                                  <div className="text-gray-600">
                                    {service.contactPhone && <div>📞 {service.contactPhone}</div>}
                                    {service.contactEmail && <div>✉️ {service.contactEmail}</div>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {service.requiresMembership && (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Membership Required
                                  </span>
                                )}
                                {service.requiresAdvanceBooking && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    Advance Booking Required
                                  </span>
                                )}
                                {service.acceptsFreeTravelPass && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    Accepts Free Travel Pass
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                              {service.bookingUrl && (
                                <a
                                  href={service.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all text-center"
                                >
                                  Book Now
                                </a>
                              )}
                              {service.website && (
                                <a
                                  href={service.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-white text-brand-turquoise border-2 border-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all text-center"
                                >
                                  Visit Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🚌</div>
                      <h4 className="text-xl font-bold text-gray-700 mb-2">Loading transport services...</h4>
                      <p className="text-gray-600">Please wait while we load available transport options.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💾</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Saved Journeys Yet</h3>
                  <p className="text-gray-600 mb-6">Plan a journey and save it here for quick access later.</p>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className="px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
                  >
                    Plan Your First Journey
                  </button>
                </div>
              )}
            </div>

            {/* Journey Results */}
            {journeyOptions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-brand-turquoise mb-6">Your Journey Options</h3>
                <div className="space-y-6">
                  {journeyOptions.map(journey => (
                    <div key={journey.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">
                              {journey.transportType === 'public' && '🚌'}
                              {journey.transportType === 'specialized' && '♿'}
                              {journey.transportType === 'car_parking' && '🚗'}
                              {journey.transportType === 'taxi' && '🚕'}
                            </span>
                            <h4 className="text-xl font-bold text-gray-800">{journey.serviceName}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">⏱️</span>
                              <span className="font-bold">{journey.durationMinutes} minutes</span>
                            </div>
                            {journey.cost && (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">💰</span>
                                <span className="font-bold">€{journey.cost.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">♿</span>
                              <span className={`font-bold ${journey.accessibilityMatch >= 80 ? 'text-green-600' : journey.accessibilityMatch >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {journey.accessibilityMatch}% match
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSaveJourney(journey.id)}
                            className="px-4 py-2 bg-brand-cream text-brand-turquoise border-2 border-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all"
                          >
                            💾 Save
                          </button>
                          {journey.bookingRequired && journey.bookingUrl && (
                            <button
                              onClick={() => handleBookTransport(journey.serviceName, journey.bookingUrl)}
                              className="px-4 py-2 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Journey Steps */}
                      <div className="mb-6">
                        <h5 className="font-bold text-gray-700 mb-3">Journey Steps</h5>
                        <div className="space-y-3">
                          {journey.steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-brand-turquoise text-white rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{step.instruction}</div>
                                <div className="text-sm text-gray-600">
                                  {step.mode} • {step.durationMinutes} minutes
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warnings */}
                      {journey.warnings.length > 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">⚠️</span>
                            <h6 className="font-bold text-yellow-800">Important Notes</h6>
                          </div>
                          <ul className="list-disc pl-5 text-yellow-700">
                            {journey.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Help & Information */}
          <div className="space-y-6">
            {/* Quick Help */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Need Help?</h3>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>📞</span>
                  Contact Support
                </button>
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>📋</span>
                  Accessibility Tips
                </button>
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>🔔</span>
                  Set Reminders
                </button>
              </div>
            </div>

            {/* Recent Venues */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Recently Viewed Venues</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {/* Mock Dublin venues with accessibility info */}
                {[
                  {
                    id: '1',
                    name: 'The Clockwork Door',
                    location: 'Temple Bar, Dublin',
                    features: ['Step-free entrance', 'Accessible toilet', 'Quiet space']
                  },
                  {
                    id: '2',
                    name: 'National Gallery of Ireland',
                    location: 'Merrion Square, Dublin',
                    features: ['Step-free access', 'Lift available', 'Wheelchair rental']
                  },
                  {
                    id: '3',
                    name: 'Dublin Castle',
                    location: 'Dame Street, Dublin',
                    features: ['Step-free entrance', 'Accessible tours', 'Disabled parking']
                  },
                  {
                    id: '4',
                    name: 'Trinity College Library',
                    location: 'College Green, Dublin',
                    features: ['Step-free access', 'Lift to main hall', 'Assistance dogs welcome']
                  },
                  {
                    id: '5',
                    name: 'EPIC The Irish Emigration Museum',
                    location: 'CHQ Building, Dublin',
                    features: ['Fully accessible', 'Audio guides', 'Quiet hours available']
                  },
                  {
                    id: '6',
                    name: 'St. Stephen\'s Green Shopping Centre',
                    location: 'St. Stephen\'s Green, Dublin',
                    features: ['Step-free throughout', 'Accessible toilets', 'Wheelchair accessible lifts']
                  },
                  {
                    id: '7',
                    name: 'The Brazen Head',
                    location: 'Bridge Street Lower, Dublin',
                    features: ['Step-free entrance', 'Accessible seating', 'Quiet dining area']
                  },
                  {
                    id: '8',
                    name: 'Guinness Storehouse',
                    location: 'St. James\'s Gate, Dublin',
                    features: ['Fully wheelchair accessible', 'Accessible toilets', 'Sensory-friendly tours']
                  },
                  {
                    id: '9',
                    name: 'Phoenix Park Visitor Centre',
                    location: 'Phoenix Park, Dublin',
                    features: ['Step-free access', 'Disabled parking', 'Accessible nature trails']
                  },
                  {
                    id: '10',
                    name: 'Dublin Zoo',
                    location: 'Phoenix Park, Dublin',
                    features: ['Wheelchair accessible paths', 'Accessible toilets', 'Sensory maps']
                  }
                ].map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => navigate(`/venues/${venue.id}`)}
                    className="w-full p-4 bg-brand-cream rounded-lg hover:bg-brand-turquoise hover:text-white transition-all text-left group"
                  >
                    <div className="font-bold text-lg group-hover:text-white">{venue.name}</div>
                    <div className="text-sm text-gray-600 group-hover:text-white/90 mb-2">{venue.location}</div>
                    <div className="flex flex-wrap gap-1">
                      {venue.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/80 group-hover:bg-white/20 text-xs rounded-full border border-brand-turquoise/30 group-hover:border-white/50">
                          {feature}
                        </span>
                      ))}
                      {venue.features.length > 2 && (
                        <span className="px-2 py-1 bg-white/80 group-hover:bg-white/20 text-xs rounded-full border border-brand-turquoise/30 group-hover:border-white/50">
                          +{venue.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => navigate('/browse-venues')}
                  className="w-full p-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all text-center mt-4"
                >
                  Browse More Venues →
                </button>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-bold text-red-700">Emergency Services</div>
                  <div className="text-red-600">999 or 112</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-bold text-yellow-700">Irish Wheelchair Association</div>
                  <div className="text-yellow-600">01 818 6400</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-700">Enable Ireland</div>
                  <div className="text-green-600">1850 204 304</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyPlanner;