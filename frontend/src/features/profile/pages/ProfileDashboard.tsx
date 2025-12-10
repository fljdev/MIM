import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import ProfileEditModal from '../components/ProfileEditModal';
import FavoriteVenueCard from '../components/FavoriteVenueCard';
import MeetupHistoryItem from '../components/MeetupHistoryItem';
import SavedLocationCard from '../components/SavedLocationCard';

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

  useEffect(() => {
    fetchProfileData();
  }, [activeFilter]);

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
        // Update stats
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

  const getTransitIcon = (mode: string) => {
    const icons: { [key: string]: string } = {
      walking: '🚶',
      driving: '🚗',
      transit: '🚇',
      bicycling: '🚴'
    };
    return icons[mode?.toLowerCase()] || '🚶';
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getColorForName = (name: string) => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold ${getColorForName(profile.name)}`}>
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.bio && (
                    <p className="text-gray-700 mt-2">{profile.bio}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
                >
                  Edit Profile
                </button>
              </div>

              {/* Stats and Badges */}
              <div className="flex flex-wrap items-center gap-4">
                {profile.default_transit_mode && (
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    <span className="text-xl">{getTransitIcon(profile.default_transit_mode)}</span>
                    <span className="font-medium capitalize">{profile.default_transit_mode}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <span>📱</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  <span>👤</span>
                  <span className="capitalize">{profile.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => document.getElementById('meetup-history')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Active Meetups</h3>
              <div className="text-3xl">👥</div>
            </div>
            <div className="text-4xl font-bold text-emerald-600">{stats?.activeMeetups || 0}</div>
            <p className="text-gray-500 text-sm mt-2">Meetups in progress</p>
          </div>
        </div>

        {/* Saved Locations Section */}
        <div id="saved-locations" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Saved Locations</h2>
            <button
              onClick={() => navigate('/create-meetup')}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
            >
              Add Location
            </button>
          </div>

          {savedLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLocations.map((location) => (
                <SavedLocationCard
                  key={location.id}
                  location={location}
                  onEdit={() => {/* TODO: Implement edit */}}
                  onDelete={() => {/* TODO: Implement delete */}}
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
              <p className="text-gray-500">Star venues during meetup planning to save them here.</p>
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
            <div className="space-y-4">
              {meetupHistory.map((meetup) => (
                <MeetupHistoryItem
                  key={meetup.id}
                  meetup={meetup}
                  onClick={() => navigate(`/meetup/${meetup.meetup_code}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No meetups yet</h3>
              <p className="text-gray-500">Create your first meetup to get started!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/create-meetup')}
              className="bg-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">➕</span>
              <span>Create New Meetup</span>
            </button>
            
            {stats && stats.activeMeetups > 0 && (
              <button
                onClick={() => navigate('/meetups')}
                className="bg-blue-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">👥</span>
                <span>View Active Meetups ({stats.activeMeetups})</span>
              </button>
            )}
          </div>
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
    </div>
  );
};

export default ProfileDashboard;
