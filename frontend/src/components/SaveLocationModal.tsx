import React, { useState } from 'react';
import { API_BASE_URL } from '../Config';

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  address: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
}

const SaveLocationModal: React.FC<SaveLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  address,
  placeId,
  coordinates,
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelOptions = [
    { label: 'Home', icon: '🏠' },
    { label: 'Work', icon: '💼' },
    { label: 'Gym', icon: '🏋️' },
    { label: 'Café', icon: '☕' },
    { label: 'Other', icon: '📍' },
  ];

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('You must be logged in to save locations');
      return;
    }

    // Determine the label to use
    const labelToSave = selectedLabel === 'Other' ? customLabel.trim() : selectedLabel;

    // Validation
    if (!labelToSave) {
      setError('Please select or enter a label');
      return;
    }

    if (labelToSave.length > 50) {
      setError('Label must be 50 characters or less');
      return;
    }

    if (!coordinates) {
      setError('Location coordinates are missing');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/saved-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: labelToSave,
          address: address,
          place_id: placeId || null,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        }),
      });

      if (response.ok) {
        // Success!
        setSelectedLabel('');
        setCustomLabel('');
        setError(null);
        onSave(); // Notify parent to refresh
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save location');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedLabel('');
    setCustomLabel('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Location</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Save this location for quick access later
        </p>

        {/* Address Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-blue-600 font-semibold mb-1">Address:</div>
          <div className="text-sm text-blue-900">{address}</div>
        </div>

        {/* Label Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Choose a label:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {labelOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  setSelectedLabel(option.label);
                  if (option.label !== 'Other') {
                    setCustomLabel('');
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedLabel === option.label
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="text-xs font-semibold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Label Input (shown when "Other" is selected) */}
        {selectedLabel === 'Other' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom label:
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g., Parents' House, School, etc."
              maxLength={50}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1">
              {customLabel.length}/50 characters
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedLabel || (selectedLabel === 'Other' && !customLabel.trim())}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveLocationModal;