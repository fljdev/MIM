import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibleVenue } from '../features/accessibility/pages/BrowseVenuesPage';

interface MultiMarkerMapProps {
  venues: AccessibleVenue[];
  height?: string;
  width?: string;
  zoom?: number;
  className?: string;
  center?: { lat: number; lng: number };
}

// Helper function to parse coordinates
const parseCoordinate = (coord: string | number | undefined): number | undefined => {
  if (coord === undefined || coord === null) return undefined;
  if (typeof coord === 'number') return coord;
  const parsed = parseFloat(coord);
  return isNaN(parsed) ? undefined : parsed;
};

const MultiMarkerMap: React.FC<MultiMarkerMapProps> = ({
  venues,
  height = '600px',
  width = '100%',
  zoom = 12,
  className = '',
  center,
}) => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
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

  // Calculate map center from venues if not provided
  const calculateCenter = (): { lat: number; lng: number } => {
    if (center) return center;
    
    const validVenues = venues.filter(v => {
      const lat = parseCoordinate(v.latitude);
      const lng = parseCoordinate(v.longitude);
      return lat !== undefined && lng !== undefined;
    });

    if (validVenues.length === 0) {
      // Default to Dublin center
      return { lat: 53.3498, lng: -6.2603 };
    }

    const avgLat = validVenues.reduce((sum, v) => {
      const lat = parseCoordinate(v.latitude);
      return sum + (lat || 0);
    }, 0) / validVenues.length;

    const avgLng = validVenues.reduce((sum, v) => {
      const lng = parseCoordinate(v.longitude);
      return sum + (lng || 0);
    }, 0) / validVenues.length;

    return { lat: avgLat, lng: avgLng };
  };

  // Get marker color based on accessibility level
  const getMarkerColor = (accessibilityLevel: string): string => {
    switch (accessibilityLevel) {
      case 'Fully Accessible': return 'green';
      case 'Accessible Entrance': return 'blue';
      case 'Semi-Accessible': return 'yellow';
      case 'Not Recommended': return 'red';
      default: return 'gray';
    }
  };

  // Get accessibility level icon
  const getAccessibilityIcon = (level: string): string => {
    switch (level) {
      case 'Fully Accessible': return '♿✅';
      case 'Accessible Entrance': return '♿🚪';
      case 'Semi-Accessible': return '♿⚠️';
      case 'Not Recommended': return '♿❌';
      default: return '♿';
    }
  };

  // Initialize map with markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || venues.length === 0) {
      return;
    }

    try {
      const mapCenter = calculateCenter();
      
      const mapOptions: google.maps.MapOptions = {
        center: mapCenter,
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

      // Clear existing markers and info windows
      markersRef.current.forEach(marker => marker.setMap(null));
      infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
      markersRef.current = [];
      infoWindowsRef.current = [];

      // Create markers for each venue
      venues.forEach((venue) => {
        const lat = parseCoordinate(venue.latitude);
        const lng = parseCoordinate(venue.longitude);

        if (lat === undefined || lng === undefined) {
          console.warn(`Skipping venue ${venue.venue_name} - invalid coordinates`);
          return;
        }

        const markerColor = getMarkerColor(venue.accessibility_level);
        const markerIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 10
        };

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: venue.venue_name,
          icon: markerIcon,
          animation: google.maps.Animation.DROP,
        });

        // Create info window content
        const infoWindowContent = `
          <div class="p-3 min-w-64">
            <h3 class="font-bold text-lg mb-1 text-gray-800">${venue.venue_name}</h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">${getAccessibilityIcon(venue.accessibility_level)}</span>
              <span class="px-2 py-1 text-xs font-semibold rounded-full bg-${markerColor}-100 text-${markerColor}-800">
                ${venue.accessibility_level}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              <span class="font-medium">📍</span> ${venue.address || 'Address not available'}
            </p>
            <div class="mb-3">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Type:</span> ${venue.venue_type || 'Not specified'}
              </p>
              ${venue.distance_km ? `<p class="text-sm text-gray-600"><span class="font-medium">Distance:</span> ${venue.distance_km.toFixed(1)} km</p>` : ''}
            </div>
            <div class="flex gap-2 mt-4">
              <button 
                onclick="window.dispatchEvent(new CustomEvent('viewVenueDetails', { detail: ${venue.id} }))"
                class="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors flex-1 text-center"
              >
                View Details
              </button>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}"
                target="_blank"
                class="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors text-center"
              >
                Open Maps
              </a>
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          maxWidth: 300,
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          // Close all other info windows
          infoWindowsRef.current.forEach(iw => iw.close());
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      });

      // Add event listener for custom "view venue details" event
      const handleViewVenueDetails = (event: CustomEvent) => {
        navigate(`/venues/${event.detail}`);
      };

      // @ts-ignore - Custom event handler
      window.addEventListener('viewVenueDetails', handleViewVenueDetails);

      setError(null);

      // Cleanup function
      return () => {
        // @ts-ignore - Remove event listener
        window.removeEventListener('viewVenueDetails', handleViewVenueDetails);
        
        markersRef.current.forEach(marker => marker.setMap(null));
        infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        markersRef.current = [];
        infoWindowsRef.current = [];
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current = null;
        }
      };

    } catch (err) {
      console.error('Error initializing multi-marker map:', err);
      setError('Failed to initialize map');
    }
  }, [mapLoaded, venues, zoom, center, navigate]);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height, width }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Unable to load map</h3>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please check your Google Maps API configuration
          </p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600">Loading map...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  const validVenues = venues.filter(v => {
    const lat = parseCoordinate(v.latitude);
    const lng = parseCoordinate(v.longitude);
    return lat !== undefined && lng !== undefined;
  });

  if (validVenues.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height, width }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No venue locations available</h3>
          <p className="text-gray-600">Map cannot be displayed without location data</p>
          <p className="text-sm text-gray-500 mt-2">
            {venues.length} venues loaded, but none have valid coordinates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg ${className}`}>
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-800">Venue Map</span>
            <span className="text-sm text-gray-600">
              Showing {validVenues.length} of {venues.length} venues
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Fully Accessible</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Accessible Entrance</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span>Semi-Accessible</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Not Recommended</span>
            </div>
          </div>
        </div>
      </div>
      
      <div
        ref={mapRef}
        style={{ height, width }}
        className="map-container"
      />
      
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Click on markers to view venue details</span>
          <span>Interactive Google Map • {validVenues.length} locations</span>
        </div>
      </div>
    </div>
  );
};

export default MultiMarkerMap;