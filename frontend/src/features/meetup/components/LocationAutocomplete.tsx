import React, { useState, useEffect, useRef } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (address: string, placeId?: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // PlacesService needs a DOM element (we'll use a hidden div)
      const div = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(div);
    } else {
      console.error('Google Maps API not loaded');
    }
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlacePredictions = async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    if (!autocompleteService.current) {
      console.error('AutocompleteService not initialized');
      return;
    }

    setIsLoading(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: input,
          types: ['geocode', 'establishment'],
        },
        (predictions, status) => {
          setIsLoading(false);

          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions as any);
            setShowDropdown(true);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setPredictions([]);
            setShowDropdown(false);
          } else {
            console.error('Places API error:', status);
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string): Promise<{ address: string; coordinates: { lat: number; lng: number } } | null> => {
    if (!placesService.current) {
      console.error('PlacesService not initialized');
      return null;
    }

    return new Promise((resolve) => {
      placesService.current!.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'geometry'],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              address: place.formatted_address || '',
              coordinates: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
            });
          } else {
            console.error('Place details error:', status);
            resolve(null);
          }
        }
      );
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchPlacePredictions(newValue);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    setPredictions([]);

    // Fetch full place details including coordinates
    const details = await fetchPlaceDetails(prediction.place_id);

    if (details) {
      onChange(details.address, prediction.place_id, details.coordinates);
    } else {
      onChange(prediction.description, prediction.place_id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handleSelectPrediction(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowDropdown(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-emerald-50' : ''
              }`}
            >
              <div className="font-semibold text-gray-900">
                {prediction.structured_formatting.main_text}
              </div>
              <div className="text-sm text-gray-600">
                {prediction.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
