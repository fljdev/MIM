import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';
import MultiMarkerMap from '../../../components/MultiMarkerMap';

// Types for accessible venues from the new API
export interface AccessibleVenue {
  id: number;
  venue_name: string;
  address: string;
  eircode?: string;
  latitude?: string | number;
  longitude?: string | number;
  venue_type: string;
  category?: string;
  phone?: string;
  website?: string;
  wheelchair_entrance?: boolean;
  wheelchair_bathroom?: boolean;
  accessible_parking_nearby?: boolean;
  level_access_internal?: boolean;
  elevator_available?: boolean;
  accessible_bar_counter?: boolean;
  hearing_loop?: boolean;
  braille_menu?: boolean;
  service_dog_friendly?: boolean;
  quiet_space_available?: boolean;
  wide_doorways?: boolean;
  low_height_tables?: boolean;
  wheelchair_space_at_tables?: boolean;
  booth_seating_transferable?: boolean;
  accessibility_notes?: string;
  entrance_notes?: string;
  bathroom_notes?: string;
  nearby_accessible_bathrooms?: string;
  accessibility_level: 'Fully Accessible' | 'Accessible Entrance' | 'Semi-Accessible' | 'Not Recommended' | string;
  data_source?: string;
  source_date?: string;
  last_verified_date?: string;
  verified_by?: string;
  verification_method?: string;
  opening_hours?: any;
  currently_operating: boolean;
  user_rating?: number;
  total_ratings?: number;
  created_at: string;
  updated_at: string;
  distance_km?: number; // Added when lat/lng provided
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface Filters {
  accessibility_level?: string;
  venue_type?: string;
  has_accessible_bathroom?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

const BrowseVenuesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [venues, setVenues] = useState<AccessibleVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState<Filters>({
    accessibility_level: '',
    venue_type: '',
    has_accessible_bathroom: '',
    radius: 5000 // 5km default
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<Set<string>>(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [mapView, setMapView] = useState(false); // New state for map view toggle

  // Fetch user location
  useEffect(() => {
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setFilters(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          setUseLocation(false);
        }
      );
    }
  }, [useLocation]);

  // Fetch favorite venue IDs when user is authenticated
  useEffect(() => {
    const fetchFavoriteVenueIds = async () => {
      if (!user) {
        setFavoriteVenueIds(new Set());
        return;
      }

      try {
        setFavoritesLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setFavoriteVenueIds(new Set());
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/venues/favourites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFavoriteVenueIds(new Set(data.venueIds || []));
        } else {
          console.error('Failed to fetch favorite venues:', response.status);
          setFavoriteVenueIds(new Set());
        }
      } catch (error) {
        console.error('Error fetching favorite venues:', error);
        setFavoriteVenueIds(new Set());
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavoriteVenueIds();
  }, [user]);

  // Fetch venues with current filters
  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', pagination.limit.toString());
      queryParams.append('offset', pagination.offset.toString());
      
      if (filters.accessibility_level) {
        queryParams.append('accessibility_level', filters.accessibility_level);
      }
      if (filters.venue_type) {
        queryParams.append('venue_type', filters.venue_type);
      }
      if (filters.has_accessible_bathroom) {
        queryParams.append('has_accessible_bathroom', filters.has_accessible_bathroom);
      }
      if (filters.lat && filters.lng) {
        queryParams.append('lat', filters.lat.toString());
        queryParams.append('lng', filters.lng.toString());
        if (filters.radius) {
          queryParams.append('radius', filters.radius.toString());
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/accessible-venues?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch venues: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Append venues when loading more (offset > 0), replace when offset is 0 (first page or filter change)
      setVenues(prev => {
        if (pagination.offset === 0) {
          // First page or filter change - replace all venues
          return data.venues;
        } else {
          // Loading more - append new venues to existing ones
          return [...prev, ...data.venues];
        }
      });
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venues');
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  };

  // Handle pagination
  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  // Handle venue click
  const handleVenueClick = (venueId: number) => {
    navigate(`/venues/${venueId}`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      accessibility_level: '',
      venue_type: '',
      has_accessible_bathroom: '',
      radius: 5000,
      lat: userLocation?.lat,
      lng: userLocation?.lng
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  // Get accessibility level color
  const getAccessibilityLevelColor = (level: string) => {
    switch (level) {
      case 'Fully Accessible': return 'bg-green-100 text-green-800';
      case 'Accessible Entrance': return 'bg-blue-100 text-blue-800';
      case 'Semi-Accessible': return 'bg-yellow-100 text-yellow-800';
      case 'Not Recommended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Unique venue types for dropdown
  const uniqueVenueTypes = Array.from(new Set(venues.map(v => v.venue_type).filter(Boolean)));

  // Toggle favorite status
  const handleToggleFavorite = async (venue: AccessibleVenue, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering venue card click
    e.preventDefault();

    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    const venueIdStr = venue.id.toString();
    const isCurrentlyFavorite = favoriteVenueIds.has(venueIdStr);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (isCurrentlyFavorite) {
        // Remove from favorites
        const response = await fetch(`${API_BASE_URL}/api/venues/favourite/${venueIdStr}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Update local state
          setFavoriteVenueIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(venueIdStr);
            return newSet;
          });
        } else {
          console.error('Failed to remove favorite:', response.status);
        }
      } else {
        // Add to favorites
        const response = await fetch(`${API_BASE_URL}/api/venues/favourite/${venueIdStr}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Update local state
          setFavoriteVenueIds(prev => {
            const newSet = new Set(prev);
            newSet.add(venueIdStr);
            return newSet;
          });
        } else {
          console.error('Failed to add favorite:', response.status);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading && venues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading accessible venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-white hover:opacity-80"
          >
            ← Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Accessible Venues</h1>
          <p className="text-lg opacity-90">
            Discover {pagination.total} accessible venues in Dublin with detailed accessibility information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-700">Filter Venues</h2>
                <button
                  onClick={() => setMapView(!mapView)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-all"
                >
                  {mapView ? (
                    <>
                      <span className="text-lg">📋</span>
                      <span>List View</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🗺️</span>
                      <span>Map View</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Location toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium text-gray-700">Use My Location</label>
                  <button
                    onClick={() => setUseLocation(!useLocation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${useLocation ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useLocation ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {useLocation && userLocation && (
                  <p className="text-sm text-gray-600 mb-3">
                    Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                )}
                {useLocation && !userLocation && (
                  <p className="text-sm text-yellow-600 mb-3">Getting your location...</p>
                )}
                {useLocation && userLocation && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Radius: {filters.radius ? filters.radius / 1000 : 5} km
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="20000"
                      step="500"
                      value={filters.radius || 5000}
                      onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.5km</span>
                      <span>5km</span>
                      <span>10km</span>
                      <span>20km</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accessibility Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Accessibility Level
                </label>
                <select
                  value={filters.accessibility_level || ''}
                  onChange={(e) => handleFilterChange('accessibility_level', e.target.value || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="Fully Accessible">Fully Accessible</option>
                  <option value="Accessible Entrance">Accessible Entrance</option>
                  <option value="Semi-Accessible">Semi-Accessible</option>
                  <option value="Not Recommended">Not Recommended</option>
                </select>
              </div>

              {/* Venue Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Venue Type
                </label>
                <select
                  value={filters.venue_type || ''}
                  onChange={(e) => handleFilterChange('venue_type', e.target.value || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {uniqueVenueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Accessible Bathroom Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Accessible Bathroom
                </label>
                <select
                  value={filters.has_accessible_bathroom || ''}
                  onChange={(e) => handleFilterChange('has_accessible_bathroom', e.target.value || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="true">Has Accessible Bathroom</option>
                  <option value="false">No Accessible Bathroom</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              <button
                onClick={handleResetFilters}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Reset Filters
              </button>

              {/* Results Count */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  Showing <span className="font-bold text-emerald-700">{venues.length}</span> of{' '}
                  <span className="font-bold text-emerald-700">{pagination.total}</span> venues
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Venue List or Map */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <button
                  onClick={fetchVenues}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* View Toggle Header (only shown in map view) */}
            {mapView && (
              <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-700 mb-1">Venue Map View</h2>
                    <p className="text-gray-600">
                      Click on markers to view venue details. Colors indicate accessibility levels.
                    </p>
                  </div>
                  <button
                    onClick={() => setMapView(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                  >
                    <span className="text-lg">📋</span>
                    <span>Switch to List View</span>
                  </button>
                </div>
              </div>
            )}

            {/* Map View */}
            {mapView ? (
              <div className="mb-8">
                <MultiMarkerMap
                  venues={venues}
                  height="600px"
                  width="100%"
                  zoom={userLocation ? 13 : 12}
                  center={userLocation || undefined}
                  className="rounded-xl"
                />
              </div>
            ) : (
              /* List View (Venue Cards Grid) */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {venues.map((venue) => (
                    <div
                      key={venue.id}
                      onClick={() => handleVenueClick(venue.id)}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer"
                    >
                      {/* Venue Header */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{venue.venue_name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">{getVenueTypeIcon(venue.venue_type)}</span>
                              <span className="text-gray-600">{venue.venue_type}</span>
                              {venue.distance_km !== undefined && (
                                <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                                  {venue.distance_km.toFixed(1)} km away
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleFavorite(venue, e)}
                              className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                              title={favoriteVenueIds.has(venue.id.toString()) ? "Remove from favorites" : "Add to favorites"}
                            >
                              {favoriteVenueIds.has(venue.id.toString()) ? (
                                <span className="text-yellow-500">★</span> // Filled star
                              ) : (
                                <span className="text-gray-400">☆</span> // Outlined star
                              )}
                            </button>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAccessibilityLevelColor(venue.accessibility_level)}`}>
                              {venue.accessibility_level}
                            </span>
                          </div>
                        </div>

                        {/* Address */}
                        <p className="text-gray-600 mb-4">
                          <span className="font-medium">📍</span> {venue.address || 'Address not available'}
                        </p>

                        {/* Accessibility Features */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">Accessibility Features:</h4>
                          <div className="flex flex-wrap gap-2">
                            {venue.wheelchair_entrance && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                                ♿ Entrance
                              </span>
                            )}
                            {venue.wheelchair_bathroom && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                                🚽 Bathroom
                              </span>
                            )}
                            {venue.accessible_parking_nearby && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                                🅿️ Parking
                              </span>
                            )}
                            {venue.level_access_internal && (
                              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-1">
                                📐 Level Access
                              </span>
                            )}
                            {venue.quiet_space_available && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center gap-1">
                                🤫 Quiet Space
                              </span>
                            )}
                            {!venue.wheelchair_entrance && !venue.wheelchair_bathroom && !venue.accessible_parking_nearby && !venue.level_access_internal && !venue.quiet_space_available && (
                              <span className="text-gray-500 text-sm">No specific features recorded</span>
                            )}
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <div>
                            {venue.data_source && (
                              <span>Source: {venue.data_source}</span>
                            )}
                          </div>
                          <div>
                            {venue.user_rating && (
                              <span className="flex items-center gap-1">
                                ⭐ {venue.user_rating.toFixed(1)} ({venue.total_ratings || 0})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {venue.currently_operating ? '✅ Currently Open' : '❌ Currently Closed'}
                          </span>
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Results */}
                {venues.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">😔</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No venues found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
                    <button
                      onClick={handleResetFilters}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

                {/* Load More Button */}
                {pagination.hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : `Load More (${pagination.total - pagination.offset - venues.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About This Data</h3>
              <p className="text-gray-300">
                This database contains 50+ accessible venues in Dublin sourced from Rosie Roaming, Irish Times, and user submissions.
                More venues and details will be added as we verify accessibility information.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Accessibility Levels</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Fully Accessible: No barriers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>Accessible Entrance: Some interior limitations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span>Semi-Accessible: Significant barriers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Not Recommended: Major accessibility issues</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Found incorrect information? Want to add a venue?
              </p>
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseVenuesPage;