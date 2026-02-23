import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import Navbar from '../../../components/Navbar';
import ProfileEditModal from '../components/ProfileEditModal';
import FavoriteVenueCard from '../components/FavoriteVenueCard';
import MeetupHistoryItem from '../components/MeetupHistoryItem';
import SavedLocationCard from '../components/SavedLocationCard';
import SaveLocationModal from '../../meetup/components/SaveLocationModal';
import LocationAutocomplete from '../../meetup/components/LocationAutocomplete';
import { UserAccessibilityProfile } from '../../../types/Accessibility';

// Types
interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  is_premium: boolean;
  default_transit_mode: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  notification_email: boolean;
  notification_sms: boolean;
  last_active_at: string;
  profile_updated_at: string;
  created_at: string;
}

interface ProfileStats {
  savedLocations: number;
  favoriteVenues: number;
  activeMeetups: number;
}

interface FavoriteVenue {
  id: number;
  user_id: number;
  venue_id: string;
  venue_name: string;
  venue_address: string;
  venue_lat: number | null;
  venue_lng: number | null;
  venue_type: string | null;
  notes: string | null;
  created_at: string;
}

interface SavedLocation {
  id: number;
  user_id: number;
  label: string;
  address: string;
  place_id: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  use_count: number;
}

interface MeetupHistoryItemType {
  id: number;
  meetup_code: string;
  title: string | null;
  vibe: string;
  budget_level: string;
  fairness_mode: string;
  status: string;
  created_at: string;
  expires_at: string;
  proposed_date: string | null;
  proposed_time_start: string | null;
  proposed_time_end: string | null;
  is_time_flexible: boolean;
  participant_count: number;
  user_role: 'organizer' | 'participant';
}

interface CarbonStats {
  distanceKm: number;
  carbonKg: number;
}

  const LOCATION_LABELS = ['Home', 'Work', 'Gym', 'Café', 'Other'];
  const MEETUP_HISTORY_LIMIT = 5;

  // Transform snake_case API response to camelCase
  const transformProfileFromApi = (apiProfile: any): UserAccessibilityProfile => {
    return {
      id: apiProfile.id,
      userId: apiProfile.user_id,
      mobilityType: apiProfile.mobility_type,
      transportAccess: apiProfile.transport_access,
      autism: apiProfile.autism,
      lightSensitivity: apiProfile.light_sensitivity,
      noiseSensitivity: apiProfile.noise_sensitivity,
      crowdSensitivity: apiProfile.crowd_sensitivity,
      hearingImpaired: apiProfile.hearing_impaired,
      visionImpaired: apiProfile.vision_impaired,
      serviceDog: apiProfile.service_dog,
      cognitiveNeeds: apiProfile.cognitive_needs,
      preferredTransportServices: apiProfile.preferred_transport_services || [],
      avoidFeatures: apiProfile.avoid_features || [],
      createdAt: new Date(apiProfile.created_at),
      updatedAt: new Date(apiProfile.updated_at)
    };
  };

  const ProfileDashboard: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [favoriteVenues, setFavoriteVenues] = useState<FavoriteVenue[]>([]);
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [meetupHistory, setMeetupHistory] = useState<MeetupHistoryItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'past'>('all');
    
    // Accessibility profile state
    const [accessibilityProfile, setAccessibilityProfile] = useState<UserAccessibilityProfile | null>(null);
    const [accessibilityLoading, setAccessibilityLoading] = useState(true);
    const [accessibilityError, setAccessibilityError] = useState<string | null>(null);
    
    // Carbon tracking state
    const [carbonStats, setCarbonStats] = useState<CarbonStats | null>(null);
    const [carbonError, setCarbonError] = useState<string | null>(null);
    
    // Meetup history expansion
    const [showAllMeetups, setShowAllMeetups] = useState(false);
  
  // Save Location Modal state
  const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);
  const [locationToSave, setLocationToSave] = useState<{
    address: string;
    placeId?: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [savedLocationsRefresh, setSavedLocationsRefresh] = useState(0);
  
  // Edit Location state
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [editError, setEditError] = useState('');
  
  // Add Venue state
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [venueToAdd, setVenueToAdd] = useState<{
    address: string;
    placeId?: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [venueNotes, setVenueNotes] = useState('');
  const [addingVenue, setAddingVenue] = useState(false);
  
  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch profile and stats
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setProfile(profileData.user);
      setStats(profileData.stats);

      // Fetch favorite venues
      const venuesResponse = await fetch(`${API_BASE_URL}/api/favorite-venues`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (venuesResponse.ok) {
        const venuesData = await venuesResponse.json();
        setFavoriteVenues(venuesData);
      }

      // Fetch saved locations
      const locationsResponse = await fetch(`${API_BASE_URL}/api/saved-locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        setSavedLocations(locationsData.locations || []);
      }

      // Fetch meetup history
      const historyResponse = await fetch(`${API_BASE_URL}/api/meetups/history?filter=${activeFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setMeetupHistory(historyData);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch carbon stats
  const fetchCarbonStats = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      console.log('[Carbon Debug] Token from localStorage:', token ? 'Present' : 'Missing');
      console.log('[Carbon Debug] User ID:', userId);
      console.log('[Carbon Debug] API URL:', `${API_BASE_URL}/api/carbon/user/${userId}`);
      
      if (!token) {
        console.log('[Carbon Debug] No token, skipping carbon API call');
        return;
      }

      setCarbonError(null);
      console.log('[Carbon Debug] Making carbon API request...');
      const response = await fetch(`${API_BASE_URL}/api/carbon/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[Carbon Debug] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        // Map backend response to front-end interface
        setCarbonStats({
          distanceKm: data.total_distance_km || 0,
          carbonKg: data.total_carbon_kg || 0
        });
      } else if (response.status === 403) {
        setCarbonError('Unauthorized to view carbon data');
      } else if (response.status === 404) {
        setCarbonError('Carbon stats unavailable');
      } else if (response.status === 503) {
        setCarbonError('Carbon service temporarily unavailable');
      } else {
        setCarbonError('Failed to load carbon stats');
      }
    } catch (error) {
      console.error('Error fetching carbon stats:', error);
      setCarbonError('Failed to load carbon stats');
    }
  };

  // Fetch accessibility profile
  const fetchAccessibilityProfile = async () => {
    setAccessibilityLoading(true);
    setAccessibilityError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAccessibilityLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/accessibility-profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const transformedProfile = transformProfileFromApi(data.profile);
        setAccessibilityProfile(transformedProfile);
      } else if (response.status === 404) {
        // No profile exists - this is expected
        setAccessibilityProfile(null);
      } else {
        // Other error
        setAccessibilityError('Failed to load accessibility profile');
        console.error('Failed to fetch accessibility profile:', response.status);
        setAccessibilityProfile(null);
      }
    } catch (error) {
      console.error('Error fetching accessibility profile:', error);
      setAccessibilityError('Failed to load accessibility profile');
      setAccessibilityProfile(null);
    } finally {
      setAccessibilityLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [activeFilter, savedLocationsRefresh]);

  // Fetch carbon stats when profile is available
  useEffect(() => {
    if (profile?.id) {
      fetchCarbonStats(profile.id);
    }
  }, [profile]);

  // Fetch accessibility profile when profile is available
  useEffect(() => {
    if (profile?.id) {
      fetchAccessibilityProfile();
    }
  }, [profile]);

  const handleRemoveFavorite = async (venueId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/favorite-venues/${venueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavoriteVenues(prev => prev.filter(venue => venue.id !== venueId));
        if (stats) {
          setStats({
            ...stats,
            favoriteVenues: stats.favoriteVenues - 1
          });
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleUpdateNotes = async (venueId: number, notes: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/favorite-venues/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        const updatedVenue = await response.json();
        setFavoriteVenues(prev => 
          prev.map(venue => venue.id === venueId ? updatedVenue : venue)
        );
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleProfileUpdate = (updatedUser: UserProfile) => {
    setProfile(updatedUser);
  };

  // Handle location save
  const handleLocationSave = () => {
    setSavedLocationsRefresh(prev => prev + 1);
    setLocationToSave(null);
  };

  // Handle delete location
  const handleDeleteLocation = async (locationId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/saved-locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
        if (stats) {
          setStats({
            ...stats,
            savedLocations: stats.savedLocations - 1
          });
        }
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  // Handle edit location - open modal
  const handleEditLocation = (location: SavedLocation) => {
    setEditingLocation(location);
    if (LOCATION_LABELS.includes(location.label)) {
      setEditLabel(location.label);
      setCustomLabel('');
    } else {
      setEditLabel('Other');
      setCustomLabel(location.label);
    }
    setEditError('');
  };

  // Handle save edited location
  const handleSaveEditedLocation = async () => {
    if (!editingLocation) return;
    
    const finalLabel = editLabel === 'Other' ? customLabel.trim() : editLabel;
    
    if (!finalLabel) {
      setEditError('Please enter a label');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/saved-locations/${editingLocation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ label: finalLabel })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedLocations(prev => 
          prev.map(loc => loc.id === editingLocation.id ? data.location : loc)
        );
        setEditingLocation(null);
        setEditLabel('');
        setCustomLabel('');
        setEditError('');
      } else {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setEditError('Failed to update location');
    }
  };

  // Handle add favorite venue
  const handleAddFavoriteVenue = async () => {
    if (!venueToAdd || !venueName.trim()) return;
    
    setAddingVenue(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/favorite-venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venue_id: venueToAdd.placeId || `manual-${Date.now()}`,
          venue_name: venueName.trim(),
          venue_address: venueToAdd.address,
          venue_lat: venueToAdd.coordinates?.lat || null,
          venue_lng: venueToAdd.coordinates?.lng || null,
          venue_type: 'other',
          notes: venueNotes.trim() || null
        })
      });

      if (response.ok) {
        const newVenue = await response.json();
        setFavoriteVenues(prev => [...prev, newVenue]);
        if (stats) {
          setStats({
            ...stats,
            favoriteVenues: stats.favoriteVenues + 1
          });
        }
        // Reset modal
        setShowAddVenueModal(false);
        setVenueToAdd(null);
        setVenueName('');
        setVenueNotes('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add venue');
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      alert('Failed to add venue');
    } finally {
      setAddingVenue(false);
    }
  };

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      driving: '🚗',
      transit: '🚇',
      walking: '🚶',
      bicycling: '🚴',
    };
    return icons[mode] || '🚶';
  };

  // Get meetups to display (limited or all)
  const displayedMeetups = showAllMeetups 
    ? meetupHistory 
    : meetupHistory.slice(0, MEETUP_HISTORY_LIMIT);
  
  const hasMoreMeetups = meetupHistory.length > MEETUP_HISTORY_LIMIT;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Failed to load profile</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Navbar */}
      <Navbar 
        userName={profile.name}
        avatarUrl={profile.avatar_url}
        activeMeetupsCount={stats?.activeMeetups || 0}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 mt-1">Here's your MiM dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => document.getElementById('saved-locations')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Saved Locations</h3>
              <div className="text-3xl">📍</div>
            </div>
            <div className="text-4xl font-bold text-emerald-600">{stats?.savedLocations || 0}</div>
            <p className="text-gray-500 text-sm mt-2">Your frequently used locations</p>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => document.getElementById('favorite-venues')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Favorite Venues</h3>
              <div className="text-3xl">⭐</div>
            </div>
            <div className="text-4xl font-bold text-emerald-600">{stats?.favoriteVenues || 0}</div>
            <p className="text-gray-500 text-sm mt-2">Venues you've starred</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full border-4 border-emerald-100 shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 shadow-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.bio && (
                    <p className="text-gray-700 mt-2">{profile.bio}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {profile.default_transit_mode && (
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                    <span>{getTransitIcon(profile.default_transit_mode)}</span>
                    <span className="font-medium capitalize">{profile.default_transit_mode}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>📱</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  <span>👤</span>
                  <span className="capitalize">{profile.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Accessibility Profile</h2>
          </div>
          
          {accessibilityLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading accessibility profile...</p>
            </div>
          ) : accessibilityProfile ? (
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4">Mobility & Transportation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Mobility Type</h4>
                    <p className="text-gray-900">
                      {accessibilityProfile.mobilityType ? (
                        <span className="capitalize">
                          {accessibilityProfile.mobilityType === 'mobility_scooter' ? 'Mobility Scooter' : accessibilityProfile.mobilityType}
                        </span>
                      ) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Transport Access</h4>
                    <p className="text-gray-900">
                      {accessibilityProfile.transportAccess ? (
                        <span className="capitalize">
                          {accessibilityProfile.transportAccess.replace('_', ' ')}
                        </span>
                      ) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4">Sensory & Environmental Needs</h3>
                <div className="flex flex-wrap gap-2">
                  {accessibilityProfile.autism && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Autism</span>}
                  {accessibilityProfile.lightSensitivity && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Light Sensitivity</span>}
                  {accessibilityProfile.noiseSensitivity && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Noise Sensitivity</span>}
                  {accessibilityProfile.crowdSensitivity && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Crowd Sensitivity</span>}
                  {accessibilityProfile.hearingImpaired && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Hearing Impaired</span>}
                  {accessibilityProfile.visionImpaired && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Vision Impaired</span>}
                  {accessibilityProfile.serviceDog && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Service Dog</span>}
                  {accessibilityProfile.cognitiveNeeds && <span className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">Cognitive Needs</span>}
                  {!accessibilityProfile.autism && !accessibilityProfile.lightSensitivity && !accessibilityProfile.noiseSensitivity && 
                   !accessibilityProfile.crowdSensitivity && !accessibilityProfile.hearingImpaired && !accessibilityProfile.visionImpaired &&
                   !accessibilityProfile.serviceDog && !accessibilityProfile.cognitiveNeeds && (
                    <span className="text-gray-500">No sensory needs specified</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4">Preferred Transport Services</h3>
                <div className="flex flex-wrap gap-2">
                  {accessibilityProfile.preferredTransportServices && accessibilityProfile.preferredTransportServices.length > 0 ? (
                    accessibilityProfile.preferredTransportServices.map(service => (
                      <span key={service} className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No preferred services specified</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4">Features to Avoid</h3>
                <div className="flex flex-wrap gap-2">
                  {accessibilityProfile.avoidFeatures && accessibilityProfile.avoidFeatures.length > 0 ? (
                    accessibilityProfile.avoidFeatures.map(feature => (
                      <span key={feature} className="px-3 py-1 bg-white text-emerald-800 rounded-full text-sm border border-emerald-200">
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No features to avoid specified</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Last updated: {accessibilityProfile.updatedAt ? new Date(accessibilityProfile.updatedAt).toLocaleDateString() : 'Never'}
                </p>
                <button
                  onClick={() => navigate('/accessibility-profile')}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">♿</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No accessibility profile yet</h3>
              <p className="text-gray-500 mb-6">Set up your accessibility profile to get personalized venue recommendations.</p>
              <button
                onClick={() => navigate('/accessibility-profile')}
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
              >
                Set up your accessibility profile
              </button>
            </div>
          )}
        </div>

        {/* Saved Locations Section */}
        <div id="saved-locations" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Saved Locations</h2>
            <button
              onClick={() => setShowSaveLocationModal(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Location
            </button>
          </div>

          {savedLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLocations.map((location) => (
                <SavedLocationCard
                  key={location.id}
                  location={location}
                  onEdit={handleEditLocation}
                  onDelete={handleDeleteLocation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved locations yet</h3>
              <p className="text-gray-500">Save your home, work, or other frequent locations for faster meetup planning.</p>
            </div>
          )}
        </div>

        {/* Favorite Venues Section */}
        <div id="favorite-venues" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Favorite Venues</h2>
            <button
              onClick={() => setShowAddVenueModal(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Venue
            </button>
          </div>

          {favoriteVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteVenues.map((venue) => (
                <FavoriteVenueCard
                  key={venue.id}
                  venue={venue}
                  onRemove={handleRemoveFavorite}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorite venues yet</h3>
              <p className="text-gray-500">Star venues during meetup planning or add them here.</p>
            </div>
          )}
        </div>

        {/* Carbon Tracking Section */}
        <div id="carbon-tracking" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Carbon Tracking</h2>
          </div>
          
          {carbonError ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Carbon stats unavailable</h3>
              <p className="text-gray-500">We're unable to load your carbon tracking data at the moment.</p>
            </div>
          ) : carbonStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🚗</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Distance Traveled</h3>
                    <p className="text-gray-600">Total distance from all meetups</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-700">{carbonStats.distanceKm.toFixed(2)} km</div>
              </div>
              
              <div className="bg-teal-50 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🌍</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Carbon Emitted</h3>
                    <p className="text-gray-600">Total carbon emissions</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-teal-700">{carbonStats.carbonKg.toFixed(1)} kg CO₂</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No carbon data yet</h3>
              <p className="text-gray-500">Your carbon statistics will appear here after you participate in meetups.</p>
            </div>
          )}
        </div>

        {/* Meetup History Section */}
        <div id="meetup-history" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Meetup History</h2>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${activeFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium ${activeFilter === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('past')}
                className={`px-4 py-2 rounded-lg font-medium ${activeFilter === 'past' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Past
              </button>
            </div>
          </div>

          {meetupHistory.length > 0 ? (
            <>
              <div className="space-y-4">
                {displayedMeetups.map((meetup) => (
                  <MeetupHistoryItem
                    key={meetup.id}
                    meetup={meetup}
                    onClick={() => navigate(`/meetup/${meetup.meetup_code}`)}
                  />
                ))}
              </div>
              
              {/* Show More/Less Button */}
              {hasMoreMeetups && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllMeetups(!showAllMeetups)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                  >
                    {showAllMeetups ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Show Less
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Show All ({meetupHistory.length - MEETUP_HISTORY_LIMIT} more)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No meetups yet</h3>
              <p className="text-gray-500">Create your first meetup to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <ProfileEditModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}

      {/* Add Location Modal - Step 1: Search */}
      {showSaveLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSaveLocationModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Location</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Search for and save a location you use frequently
            </p>
            <LocationAutocomplete
              value=""
              onChange={(address, placeId, coordinates) => {
                setLocationToSave({ address, placeId, coordinates });
              }}
              placeholder="Search for an address..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 mb-4"
            />
            {locationToSave && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <div className="text-xs text-emerald-600 font-semibold mb-1">Selected:</div>
                <div className="text-sm text-emerald-900">{locationToSave.address}</div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveLocationModal(false);
                  setLocationToSave(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (locationToSave) {
                    setShowSaveLocationModal(false);
                  }
                }}
                disabled={!locationToSave}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Location Modal - Step 2: Choose Label */}
      {locationToSave && !showSaveLocationModal && (
        <SaveLocationModal
          isOpen={true}
          onClose={() => setLocationToSave(null)}
          onSave={handleLocationSave}
          address={locationToSave.address}
          placeId={locationToSave.placeId}
          coordinates={locationToSave.coordinates}
        />
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setEditingLocation(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Location</h2>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-500 font-semibold mb-1">Address</div>
              <div className="text-sm text-gray-800">{editingLocation.address}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {LOCATION_LABELS.map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      setEditLabel(label);
                      if (label !== 'Other') setCustomLabel('');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      editLabel === label
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {editLabel === 'Other' && (
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Enter custom label"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  maxLength={50}
                />
              )}
            </div>
            
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {editError}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingLocation(null);
                  setEditLabel('');
                  setCustomLabel('');
                  setEditError('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedLocation}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Venue Modal */}
      {showAddVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowAddVenueModal(false);
              setVenueToAdd(null);
              setVenueName('');
              setVenueNotes('');
            }}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Favorite Venue</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Search for a venue to add to your favorites
            </p>
            
            {/* Venue Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., Two Pups, The Brazen Head..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                maxLength={100}
              />
            </div>
            
            {/* Address Search */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Address <span className="text-red-500">*</span>
              </label>
              <LocationAutocomplete
                value=""
                onChange={(address, placeId, coordinates) => {
                  setVenueToAdd({ address, placeId, coordinates });
                }}
                placeholder="Search for venue address..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            {venueToAdd && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <div className="text-xs text-emerald-600 font-semibold mb-1">Selected Address:</div>
                <div className="text-sm text-emerald-900">{venueToAdd.address}</div>
              </div>
            )}
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={venueNotes}
                onChange={(e) => setVenueNotes(e.target.value)}
                placeholder="e.g., Great for group meetups, Quiet atmosphere..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                rows={3}
                maxLength={200}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddVenueModal(false);
                  setVenueToAdd(null);
                  setVenueName('');
                  setVenueNotes('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFavoriteVenue}
                disabled={!venueToAdd || !venueName.trim() || addingVenue}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingVenue ? 'Adding...' : 'Add Venue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDashboard;
