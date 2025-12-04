import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../Config';

interface SavedLocation {
  id: number;
  label: string;
  address: string;
  place_id: string | null;
  latitude: number;
  longitude: number;
  use_count: number;
  last_used_at: string | null;
}

interface SavedLocationsListProps {
  onSelectLocation: (location: SavedLocation) => void;
  onDeleteLocation: (locationId: number) => void;
  refreshTrigger?: number;
}

const SavedLocationsList: React.FC<SavedLocationsListProps> = ({
  onSelectLocation,
  onDeleteLocation,
  refreshTrigger = 0,
}) => {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Icon mapping for different labels
  const getIcon = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return '🏠';
    if (lowerLabel.includes('work')) return '💼';
    if (lowerLabel.includes('gym')) return '🏋️';
    if (lowerLabel.includes('café') || lowerLabel.includes('cafe') || lowerLabel.includes('coffee')) return '☕';
    return '📍';
  };

  const fetchSavedLocations = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/saved-locations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
        setError(null);
      } else if (response.status === 401) {
        // Token invalid or expired
        localStorage.removeItem('token');
        setLocations([]);
      } else {
        setError('Failed to load saved locations');
      }
    } catch (err) {
      console.error('Error fetching saved locations:', err);
      setError('Failed to load saved locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedLocations();
  }, [refreshTrigger]);

  const handleSelectLocation = async (location: SavedLocation) => {
    const token = localStorage.getItem('token');

    if (!token) return;

    // Update usage tracking
    try {
      await fetch(`${API_BASE_URL}/api/saved-locations/${location.id}/use`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Error updating location usage:', err);
    }

    // Call parent callback
    onSelectLocation(location);
  };

  const handleDelete = async (locationId: number, event: React.MouseEvent) => {
    event.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) return;

    // Get the location details for better messaging
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    // Better confirmation message with location name
    if (!window.confirm(`Delete "${location.label}" from saved locations?\n\n${location.address}`)) return;

    setDeletingId(locationId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/saved-locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLocations(locations.filter(loc => loc.id !== locationId));
        onDeleteLocation(locationId);
        
        // Success message
        alert(`✔ ${location.label} removed from saved locations`);
      } else {
        alert('❌ Failed to delete location');
      }
    } catch (err) {
      console.error('Error deleting location:', err);
      alert('❌ Failed to delete location');
    } finally {
      setDeletingId(null);
    }
  };

  // Don't render if loading or no locations
  if (isLoading) return null;
  if (error) return null;
  if (locations.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex gap-2 flex-wrap mb-3">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => handleSelectLocation(location)}
            disabled={deletingId === location.id}
            className="group relative flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">{getIcon(location.label)}</span>
            <div className="text-left">
              <div className="font-semibold text-blue-900 text-sm">{location.label}</div>
              <div className="text-xs text-blue-600 max-w-[200px] truncate">{location.address}</div>
            </div>
            <span
              onClick={(e) => handleDelete(location.id, e)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Delete"
            >
              ×
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-sm text-gray-500 px-2">or enter new address</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  );
};

export default SavedLocationsList;