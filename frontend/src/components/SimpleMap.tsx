import React, { useEffect, useRef, useState } from 'react';

interface SimpleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  width?: string;
  markerTitle?: string;
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  height = '300px',
  width = '100%',
  markerTitle = 'Venue Location',
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        setMapLoaded(true);
      } else {
        // Load Google Maps API if not already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement('script');
          const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            setError('Google Maps API key not configured');
            return;
          }
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.onload = () => setMapLoaded(true);
          script.onerror = () => setError('Failed to load Google Maps API');
          document.head.appendChild(script);
        } else {
          // Script already exists, wait for it to load
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.Map) {
              setMapLoaded(true);
              clearInterval(checkInterval);
            }
          }, 100);
        }
      }
    };

    checkGoogleMaps();
  }, []);

  // Initialize map when Google Maps API is loaded and coordinates are available
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !latitude || !longitude) {
      return;
    }

    try {
      // Check for valid coordinates
      if (!isFinite(latitude) || !isFinite(longitude)) {
        setError('Invalid coordinates provided');
        return;
      }

      const mapOptions: google.maps.MapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      // Create map instance
      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: markerTitle,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      markerRef.current = marker;

      setError(null);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        // Google Maps doesn't have a proper destroy method, just clear the container
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, latitude, longitude, zoom, markerTitle]);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height, width }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600">Unable to load map</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height, width }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-gray-600">Location data not available</p>
          <p className="text-sm text-gray-500 mt-1">Map cannot be displayed</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-300 shadow-sm ${className}`}>
      <div
        ref={mapRef}
        style={{ height, width }}
        className="map-container"
      />
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 border-t border-gray-300">
        <div className="flex justify-between items-center">
          <span>Interactive Google Map</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;