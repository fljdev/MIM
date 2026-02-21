import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';
import { AccessibleVenue } from './BrowseVenuesPage';

const VenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [venue, setVenue] = useState<AccessibleVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'physical' | 'sensory'>('overview');

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/accessible-venues/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Venue not found');
          }
          throw new Error(`Failed to load venue: ${response.status}`);
        }
        
        const venueData = await response.json();
        setVenue(venueData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load venue details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenueDetails();
    }
  }, [id]);

  const handlePlanJourney = () => {
    if (venue) {
      navigate('/journey-planner', { 
        state: { 
          destinationVenue: {
            name: venue.venue_name,
            lat: venue.latitude,
            lng: venue.longitude,
            address: venue.address
          }
        } 
      });
    }
  };

  // Calculate accessibility score based on real venue data
  const calculateAccessibilityScore = (venue: AccessibleVenue) => {
    let score = 50; // Base score
    
    // Physical accessibility points
    if (venue.wheelchair_entrance) score += 15;
    if (venue.wheelchair_bathroom) score += 15;
    if (venue.accessible_parking_nearby) score += 10;
    if (venue.level_access_internal) score += 10;
    if (venue.elevator_available) score += 5;
    if (venue.quiet_space_available) score += 5;
    
    // Deductions based on accessibility level
    if (venue.accessibility_level === 'Not Recommended') score -= 20;
    else if (venue.accessibility_level === 'Semi-Accessible') score -= 10;
    else if (venue.accessibility_level === 'Accessible Entrance') score += 5;
    else if (venue.accessibility_level === 'Fully Accessible') score += 20;
    
    return Math.min(Math.max(score, 0), 100);
  };

  // Get accessibility level color
  const getAccessibilityLevelColor = (level: string) => {
    switch (level) {
      case 'Fully Accessible': return 'text-green-600';
      case 'Accessible Entrance': return 'text-blue-600';
      case 'Semi-Accessible': return 'text-yellow-600';
      case 'Not Recommended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-turquoise border-t-transparent mx-auto mb-4"></div>
          <p className="text-brand-turquoise">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-brand-turquoise mb-2">Venue Not Found</h2>
          <p className="text-brand-brown">{error || 'The requested venue could not be found.'}</p>
          <button
            onClick={() => navigate('/browse-venues')}
            className="mt-4 px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
          >
            ← Browse All Venues
          </button>
        </div>
      </div>
    );
  }

  const accessibilityScore = calculateAccessibilityScore(venue);
  const scoreColor = getAccessibilityLevelColor(venue.accessibility_level);

  // Get venue type icon
  const getVenueTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pub': return '🍺';
      case 'restaurant': return '🍽️';
      case 'cafe': return '☕';
      case 'hotel': return '🏨';
      case 'shop': return '🛍️';
      case 'museum': return '🏛️';
      default: return '🏢';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{venue.venue_name}</h1>
          <p className="text-lg opacity-90">{venue.address || 'Address not available'}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <span className="text-2xl">{getVenueTypeIcon(venue.venue_type)}</span>
              <span>{venue.venue_type || 'Venue'}</span>
            </div>
            <div className={`flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full ${scoreColor}`}>
              <span className="text-2xl">♿</span>
              <span className="font-bold">{venue.accessibility_level}</span>
            </div>
            {venue.user_rating && (
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-2xl">⭐</span>
                <span>{venue.user_rating.toFixed(1)} ({venue.total_ratings || 0} ratings)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto mb-6 border-b border-gray-300">
              {['overview', 'physical', 'sensory'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-brand-turquoise text-brand-turquoise' : 'text-gray-600 hover:text-brand-turquoise'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Accessibility Overview</h3>
                  <p className="text-brand-brown">
                    {venue.accessibility_notes || 'This venue has been evaluated for accessibility features.'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Physical Accessibility */}
                    <div className="bg-brand-cream p-4 rounded-lg">
                      <h4 className="font-bold text-brand-turquoise mb-3">♿ Physical Accessibility</h4>
                      <ul className="space-y-2">
                        {venue.wheelchair_entrance && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Wheelchair accessible entrance</span>
                          </li>
                        )}
                        {venue.wheelchair_bathroom && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Accessible bathroom</span>
                          </li>
                        )}
                        {venue.accessible_parking_nearby && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Accessible parking nearby</span>
                          </li>
                        )}
                        {venue.level_access_internal && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Level access throughout</span>
                          </li>
                        )}
                        {venue.elevator_available && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Elevator available</span>
                          </li>
                        )}
                        {!venue.wheelchair_entrance && !venue.wheelchair_bathroom && !venue.accessible_parking_nearby && !venue.level_access_internal && !venue.elevator_available && (
                          <li className="text-gray-500">No physical accessibility features recorded</li>
                        )}
                      </ul>
                    </div>

                    {/* Additional Features */}
                    <div className="bg-brand-cream p-4 rounded-lg">
                      <h4 className="font-bold text-brand-turquoise mb-3">🎵 Additional Features</h4>
                      <ul className="space-y-2">
                        {venue.quiet_space_available && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Quiet space available</span>
                          </li>
                        )}
                        {venue.service_dog_friendly && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Service dog friendly</span>
                          </li>
                        )}
                        {venue.hearing_loop && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Hearing loop available</span>
                          </li>
                        )}
                        {venue.braille_menu && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Braille menu available</span>
                          </li>
                        )}
                        {!venue.quiet_space_available && !venue.service_dog_friendly && !venue.hearing_loop && !venue.braille_menu && (
                          <li className="text-gray-500">No additional features recorded</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {(venue.phone || venue.website) && (
                    <div className="bg-brand-cream p-4 rounded-lg">
                      <h4 className="font-bold text-brand-turquoise mb-3">📞 Contact Information</h4>
                      <div className="space-y-2">
                        {venue.phone && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Phone:</span>
                            <a href={`tel:${venue.phone}`} className="text-brand-turquoise hover:underline">
                              {venue.phone}
                            </a>
                          </div>
                        )}
                        {venue.website && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Website:</span>
                            <a 
                              href={venue.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-turquoise hover:underline"
                            >
                              {venue.website.replace('https://', '').replace('http://', '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'physical' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Detailed Physical Accessibility</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Entrance & Access */}
                    <div>
                      <h4 className="font-bold text-brand-turquoise mb-3">Entrance & Access</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Wheelchair entrance:</span>
                          <span className={venue.wheelchair_entrance ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.wheelchair_entrance ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Level access internal:</span>
                          <span className={venue.level_access_internal ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.level_access_internal ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Wide doorways:</span>
                          <span className={venue.wide_doorways ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.wide_doorways ? 'Yes' : 'No'}
                          </span>
                        </li>
                        {venue.entrance_notes && (
                          <li className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Notes:</span> {venue.entrance_notes}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Bathroom Facilities */}
                    <div>
                      <h4 className="font-bold text-brand-turquoise mb-3">Bathroom Facilities</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Wheelchair bathroom:</span>
                          <span className={venue.wheelchair_bathroom ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.wheelchair_bathroom ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Grab rails:</span>
                          <span className={venue.wheelchair_bathroom ? 'text-green-600 font-bold' : 'text-gray-600'}>
                            {venue.wheelchair_bathroom ? 'Assumed' : 'Unknown'}
                          </span>
                        </li>
                        {venue.bathroom_notes && (
                          <li className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Notes:</span> {venue.bathroom_notes}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Seating & Tables */}
                    <div>
                      <h4 className="font-bold text-brand-turquoise mb-3">Seating & Tables</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Wheelchair space at tables:</span>
                          <span className={venue.wheelchair_space_at_tables ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.wheelchair_space_at_tables ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Low height tables:</span>
                          <span className={venue.low_height_tables ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.low_height_tables ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Accessible bar counter:</span>
                          <span className={venue.accessible_bar_counter ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.accessible_bar_counter ? 'Yes' : 'No'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Mobility & Transport */}
                    <div>
                      <h4 className="font-bold text-brand-turquoise mb-3">Mobility & Transport</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Accessible parking nearby:</span>
                          <span className={venue.accessible_parking_nearby ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.accessible_parking_nearby ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Elevator available:</span>
                          <span className={venue.elevator_available ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.elevator_available ? 'Yes' : 'No'}
                          </span>
                        </li>
                        {venue.nearby_accessible_bathrooms && (
                          <li className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Nearby accessible bathrooms:</span> {venue.nearby_accessible_bathrooms}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sensory' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Sensory Environment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sensory Features */}
                    <div>
                      <h4 className="font-bold text-brand-turquoise mb-3">Sensory Features</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Quiet space available:</span>
                          <span className={venue.quiet_space_available ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.quiet_space_available ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Hearing loop:</span>
                          <span className={venue.hearing_loop ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.hearing_loop ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Service dog friendly:</span>
                          <span className={venue.service_dog_friendly ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.service_dog_friendly ? 'Yes' : 'No'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h4 className="font-bold text-brand-turquoise mb-3">Additional Information</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Braille menu:</span>
                          <span className={venue.braille_menu ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.braille_menu ? 'Yes' : 'No'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Booth seating transferable:</span>
                          <span className={venue.booth_seating_transferable ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {venue.booth_seating_transferable ? 'Yes' : 'No'}
                          </span>
                        </li>
                        {venue.accessibility_notes && (
                          <li className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">General notes:</span> {venue.accessibility_notes}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Verification Information */}
                  <div className="bg-brand-cream p-4 rounded-lg">
                    <h4 className="font-bold text-brand-turquoise mb-3">📋 Verification Information</h4>
                    <div className="space-y-2 text-sm">
                      {venue.data_source && (
                        <div className="flex justify-between">
                          <span className="font-medium">Data source:</span>
                          <span>{venue.data_source}</span>
                        </div>
                      )}
                      {venue.last_verified_date && (
                        <div className="flex justify-between">
                          <span className="font-medium">Last verified:</span>
                          <span>{new Date(venue.last_verified_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {venue.verified_by && (
                        <div className="flex justify-between">
                          <span className="font-medium">Verified by:</span>
                          <span>{venue.verified_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Map */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Plan Your Journey</h3>
              <button
                onClick={handlePlanJourney}
                className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🚶‍♀️</span>
                Plan Journey to This Venue
              </button>
              
              <div className="space-y-3">
                {venue.phone && (
                  <a
                    href={`tel:${venue.phone}`}
                    className="w-full block px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>📞</span>
                    Call Venue
                  </a>
                )}
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>🌐</span>
                    Visit Website
                  </a>
                )}
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>📋</span>
                  Report Incorrect Info
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Accessibility Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Accessibility Level</span>
                    <span className={`text-xl font-bold ${scoreColor}`}>{venue.accessibility_level}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${scoreColor.replace('text-', 'bg-')}`}
                      style={{ 
                        width: venue.accessibility_level === 'Fully Accessible' ? '100%' :
                               venue.accessibility_level === 'Accessible Entrance' ? '75%' :
                               venue.accessibility_level === 'Semi-Accessible' ? '50%' : '25%'
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-brand-cream rounded-lg">
                    <div className="text-2xl">♿</div>
                    <div className="font-bold text-brand-turquoise">Physical Access</div>
                    <div className="text-sm">
                      {venue.wheelchair_entrance && venue.wheelchair_bathroom ? 'Good' : 
                       venue.wheelchair_entrance ? 'Basic' : 'Limited'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-brand-cream rounded-lg">
                    <div className="text-2xl">🎵</div>
                    <div className="font-bold text-brand-turquoise">Sensory</div>
                    <div className="text-sm">
                      {venue.quiet_space_available ? 'Good' : 'Basic'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Venue Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <div className="font-bold">Type</div>
                    <div className="text-sm text-gray-600">{venue.venue_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="font-bold">Address</div>
                    <div className="text-sm text-gray-600">{venue.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                  <span className="text-2xl">🕒</span>
                  <div>
                    <div className="font-bold">Status</div>
                    <div className="text-sm text-gray-600">
                      {venue.currently_operating ? '✅ Currently Open' : '❌ Currently Closed'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;