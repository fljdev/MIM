import React, { useState } from 'react';

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

interface FavoriteVenueCardProps {
  venue: FavoriteVenue;
  onRemove: (venueId: number) => void;
  onUpdateNotes: (venueId: number, notes: string) => void;
}

const FavoriteVenueCard: React.FC<FavoriteVenueCardProps> = ({ venue, onRemove, onUpdateNotes }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(venue.notes || '');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSaveNotes = () => {
    if (notes !== venue.notes) {
      onUpdateNotes(venue.id, notes);
    }
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(venue.notes || '');
    setIsEditingNotes(false);
  };

  const handleRemoveClick = () => {
    setShowConfirmDelete(true);
  };

  const confirmRemove = () => {
    onRemove(venue.id);
    setShowConfirmDelete(false);
  };

  const getVenueTypeIcon = (type: string | null) => {
    if (!type) return '🏢';
    
    const icons: { [key: string]: string } = {
      restaurant: '🍽️',
      cafe: '☕',
      bar: '🍺',
      park: '🌳',
      museum: '🏛️',
      cinema: '🎬',
      shopping: '🛍️',
      hotel: '🏨',
      gym: '💪',
      library: '📚'
    };
    
    return icons[type.toLowerCase()] || '🏢';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-emerald-200 transition-all overflow-hidden">
      {/* Venue Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">
              {getVenueTypeIcon(venue.venue_type)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{venue.venue_name}</h3>
              <p className="text-gray-600 text-sm mt-1">{venue.venue_address}</p>
            </div>
          </div>
          <button
            onClick={handleRemoveClick}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove from favorites"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Venue Type */}
        {venue.venue_type && (
          <div className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {venue.venue_type}
          </div>
        )}

        {/* Notes Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Your Notes</label>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                placeholder="Add your notes about this venue..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelNotes}
                  className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="min-h-[60px]">
              {venue.notes ? (
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{venue.notes}</p>
              ) : (
                <p className="text-gray-400 italic">No notes added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Added {formatDate(venue.created_at)}
          </span>
          {venue.venue_lat && venue.venue_lng && (
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${venue.venue_lat},${venue.venue_lng}`, '_blank')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View on Map
            </button>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Remove from Favorites?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <span className="font-semibold">{venue.venue_name}</span> from your favorites?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteVenueCard;
