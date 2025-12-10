import React from 'react';

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

interface SavedLocationCardProps {
  location: SavedLocation;
  onEdit: (location: SavedLocation) => void;
  onDelete: (locationId: number) => void;
}

const SavedLocationCard: React.FC<SavedLocationCardProps> = ({ location, onEdit, onDelete }) => {
  const getIcon = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return '🏠';
    if (lowerLabel.includes('work')) return '💼';
    if (lowerLabel.includes('gym')) return '🏋️';
    if (lowerLabel.includes('café') || lowerLabel.includes('cafe') || lowerLabel.includes('coffee')) return '☕';
    if (lowerLabel.includes('school') || lowerLabel.includes('university') || lowerLabel.includes('college')) return '🎓';
    if (lowerLabel.includes('park')) return '🌳';
    if (lowerLabel.includes('restaurant') || lowerLabel.includes('food')) return '🍽️';
    if (lowerLabel.includes('bar') || lowerLabel.includes('pub')) return '🍺';
    if (lowerLabel.includes('store') || lowerLabel.includes('shop') || lowerLabel.includes('mall')) return '🛍️';
    return '📍';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(location);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${location.label}" from saved locations?\n\n${location.address}`)) {
      onDelete(location.id);
    }
  };

  const handleViewOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-emerald-200 transition-all overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">
              {getIcon(location.label)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{location.label}</h3>
              <p className="text-gray-600 text-sm mt-1">{location.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-emerald-500 transition-colors p-1"
              title="Edit location"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Delete location"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-500">Times Used</div>
            <div className="text-2xl font-bold text-emerald-600">{location.use_count}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-500">Last Used</div>
            <div className="font-medium text-gray-700">
              {formatDate(location.last_used_at)}
              {location.last_used_at && (
                <div className="text-sm text-gray-500">{formatTime(location.last_used_at)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Added {formatDate(location.created_at)}
          </div>
          <button
            onClick={handleViewOnMap}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedLocationCard;
