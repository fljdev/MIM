import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';
import { BusinessProfile, BusinessType } from '../../../types/MimTown';
import { Search, MapPin, Star, PenLine } from 'lucide-react';
import LocationAutocomplete from '../../meetup/components/LocationAutocomplete';
import SimpleMap from '../../../components/SimpleMap';

const transformBusinessFromApi = (apiBusiness: any): BusinessProfile => {
  return {
    id: apiBusiness.id,
    name: apiBusiness.name,
    description: apiBusiness.description,
    registered_number: apiBusiness.registered_number,
    website: apiBusiness.website,
    phone: apiBusiness.phone,
    address: apiBusiness.address,
    latitude: apiBusiness.latitude,
    longitude: apiBusiness.longitude,
    owner_id: apiBusiness.owner_id,
    verified: apiBusiness.verified,
    business_type: apiBusiness.business_type,
    created_at: new Date(apiBusiness.created_at),
    updated_at: new Date(apiBusiness.updated_at),
    owner_name: apiBusiness.owner_name,
    owner_email: apiBusiness.owner_email,
    available_materials_count: apiBusiness.available_materials_count,
    completed_transactions_count: apiBusiness.completed_transactions_count
  };
};

interface BusinessProfileWizardProps {
  initialBusiness?: BusinessProfile | null;
  onSave?: (business: Partial<BusinessProfile>) => void;
  onCancel?: () => void;
}

const BusinessProfileWizard: React.FC<BusinessProfileWizardProps> = ({ 
  initialBusiness, 
  onSave, 
  onCancel 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Business fetching state
  const [isLoading, setIsLoading] = useState(false);
  const [existingBusiness, setExistingBusiness] = useState<BusinessProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [registeredNumber, setRegisteredNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [businessType, setBusinessType] = useState<BusinessType>('manufacturer');
  
  // Location method state
  const [locationMethod, setLocationMethod] = useState<'autocomplete' | 'current' | 'saved' | 'manual'>('manual');
  const [savedLocations, setSavedLocations] = useState<Array<any>>([]);
  const [savedLocationsLoading, setSavedLocationsLoading] = useState(false);
  const [savedLocationsError, setSavedLocationsError] = useState('');
  const [selectedSavedLocationId, setSelectedSavedLocationId] = useState<number | null>(null);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Registration modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [registrationError, setRegistrationError] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Fetch existing business on mount if user is authenticated
  useEffect(() => {
    const fetchExistingBusiness = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/businesses/my/business`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const transformedBusiness = transformBusinessFromApi(data.business);
          setExistingBusiness(transformedBusiness);
        } else if (response.status === 404) {
          setExistingBusiness(null);
        } else {
          console.error('Failed to fetch business:', response.status);
          setExistingBusiness(null);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
        setExistingBusiness(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingBusiness();
  }, [user]);

  // Initialize form with existing business
  useEffect(() => {
    if (initialBusiness) {
      setName(initialBusiness.name);
      setDescription(initialBusiness.description || '');
      setRegisteredNumber(initialBusiness.registered_number || '');
      setWebsite(initialBusiness.website || '');
      setPhone(initialBusiness.phone || '');
      setAddress(initialBusiness.address);
      setLatitude(initialBusiness.latitude);
      setLongitude(initialBusiness.longitude);
      setBusinessType(initialBusiness.business_type);
    } else if (existingBusiness && isEditMode) {
      setName(existingBusiness.name);
      setDescription(existingBusiness.description || '');
      setRegisteredNumber(existingBusiness.registered_number || '');
      setWebsite(existingBusiness.website || '');
      setPhone(existingBusiness.phone || '');
      setAddress(existingBusiness.address);
      setLatitude(existingBusiness.latitude);
      setLongitude(existingBusiness.longitude);
      setBusinessType(existingBusiness.business_type);
    }
  }, [initialBusiness, existingBusiness, isEditMode]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const businessData: Partial<BusinessProfile> = {
      name,
      description: description || undefined,
      registered_number: registeredNumber || undefined,
      website: website || undefined,
      phone: phone || undefined,
      address,
      latitude,
      longitude,
      business_type: businessType
    };

    try {
      if (user) {
        if (isEditMode && existingBusiness) {
          await handleSaveInEditMode(businessData);
        } else {
          await saveBusinessData(businessData);
        }
      } else {
        setShowRegistrationModal(true);
      }
    } catch (error) {
      console.error('Failed to save business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveBusinessData = async (businessData: Partial<BusinessProfile>) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = isEditMode && existingBusiness 
      ? `${API_BASE_URL}/api/businesses/${existingBusiness.id}`
      : `${API_BASE_URL}/api/businesses`;
    
    const method = isEditMode && existingBusiness ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(businessData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save business profile');
    }

    if (onSave) {
      onSave(businessData);
    }

    navigate('/mim-town/dashboard');
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationForm({
      ...registrationForm,
      [e.target.name]: e.target.value
    });
  };

  const validateRegistrationForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registrationForm.email || !emailRegex.test(registrationForm.email)) {
      setRegistrationError('Please enter a valid email address');
      return false;
    }

    if (!registrationForm.name || registrationForm.name.trim().length < 2) {
      setRegistrationError('Please enter your full name');
      return false;
    }

    if (!registrationForm.password || registrationForm.password.length < 6) {
      setRegistrationError('Password must be at least 6 characters');
      return false;
    }

    if (registrationForm.password !== registrationForm.confirmPassword) {
      setRegistrationError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');

    if (!validateRegistrationForm()) {
      return;
    }

    setRegistrationLoading(true);

    try {
      const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationForm.email,
          name: registrationForm.name,
          password: registrationForm.password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Registration failed');
      }

      if (registerData.token) {
        localStorage.setItem('token', registerData.token);
      }

      const businessData: Partial<BusinessProfile> = {
        name,
        description: description || undefined,
        registered_number: registeredNumber || undefined,
        website: website || undefined,
        phone: phone || undefined,
        address,
        latitude,
        longitude,
        business_type: businessType
      };

      const businessResponse = await fetch(`${API_BASE_URL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${registerData.token}`
        },
        body: JSON.stringify(businessData)
      });

      if (!businessResponse.ok) {
        const errorData = await businessResponse.json();
        throw new Error(errorData.error || 'Failed to save business profile');
      }

      setRegistrationForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      setShowRegistrationModal(false);
      navigate('/mim-town/dashboard');
    } catch (err: any) {
      setRegistrationError(err.message || 'An error occurred during registration');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationError('');
    setRegistrationForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setStep(1);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleSaveInEditMode = async (businessData: Partial<BusinessProfile>) => {
    try {
      await saveBusinessData(businessData);
      setIsEditMode(false);
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/api/businesses/my/business`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            const transformedBusiness = transformBusinessFromApi(data.business);
            setExistingBusiness(transformedBusiness);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save business:', error);
      throw error;
    }
  };

  // Fetch saved locations when user is authenticated and location method is 'saved'
  useEffect(() => {
    const fetchSavedLocations = async () => {
      if (!user || locationMethod !== 'saved') {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setSavedLocationsError('Authentication required');
        return;
      }

      setSavedLocationsLoading(true);
      setSavedLocationsError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/saved-locations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSavedLocations(data.locations || []);
        } else {
          setSavedLocationsError('Failed to load saved locations');
          setSavedLocations([]);
        }
      } catch (error) {
        console.error('Error fetching saved locations:', error);
        setSavedLocationsError('Network error loading saved locations');
        setSavedLocations([]);
      } finally {
        setSavedLocationsLoading(false);
      }
    };

    fetchSavedLocations();
  }, [user, locationMethod]);

  const handleAutocompleteChange = (address: string, placeId?: string, coordinates?: { lat: number; lng: number }) => {
    setAddress(address);
    if (coordinates) {
      setLatitude(coordinates.lat);
      setLongitude(coordinates.lng);
    }
    setLocationMethod('autocomplete');
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGeolocationLoading(true);
    setGeocodingLoading(true);
    setGeocodingError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setLatitude(coords.lat);
      setLongitude(coords.lng);

      // Reverse geocode using Google Maps Geocoding REST API
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Google Maps API key not configured in environment variables');
          throw new Error('Google Maps API key not configured');
        }
        
        // Debug: Log API call (mask key in production)
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey.substring(0, 10)}...`;
        console.log('Geocoding API call:', url);
        
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`
        );
        
        if (!response.ok) {
          console.error('Geocoding API HTTP error:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Geocoding API response:', { 
          status: data.status, 
          error_message: data.error_message,
          results_count: data.results ? data.results.length : 0
        });
        
        // Handle different Google Maps API statuses
        switch (data.status) {
          case 'OK':
            if (data.results && data.results[0]) {
              const formattedAddress = data.results[0].formatted_address;
              console.log('Geocoding success:', formattedAddress);
              setAddress(formattedAddress);
              setGeocodingError(null);
            } else {
              console.warn('Geocoding API returned OK but no results:', data);
              setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
              setGeocodingError('No address found for these coordinates. Using raw coordinates instead.');
            }
            break;
            
          case 'ZERO_RESULTS':
            console.warn('Geocoding API: No results found for coordinates:', coords);
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setGeocodingError('No address found for these coordinates. Using raw coordinates instead.');
            break;
            
          case 'OVER_QUERY_LIMIT':
            console.error('Geocoding API: Over query limit');
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setGeocodingError('Geocoding quota exceeded. Using raw coordinates.');
            break;
            
          case 'REQUEST_DENIED':
            console.error('Geocoding API: Request denied. Check API key permissions.');
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setGeocodingError('Geocoding API access denied. Check API key permissions.');
            break;
            
          case 'INVALID_REQUEST':
            console.error('Geocoding API: Invalid request');
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setGeocodingError('Invalid geocoding request. Using raw coordinates.');
            break;
            
          case 'UNKNOWN_ERROR':
            console.error('Geocoding API: Unknown error');
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setGeocodingError('Geocoding service error. Using raw coordinates.');
            break;
            
          default:
            console.error('Geocoding API: Unexpected status:', data.status);
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setGeocodingError(`Geocoding failed (${data.status}). Using raw coordinates.`);
            break;
        }
      } catch (geocodingErr) {
        console.error('Geocoding error:', geocodingErr);
        setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
        setGeocodingError('Geocoding failed. Using raw coordinates.');
      }
      
      setLocationMethod('current');
    } catch (error: any) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Failed to get your location';
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information unavailable.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out.';
      }
      setGeocodingError(errorMessage);
      alert(errorMessage);
    } finally {
      setGeolocationLoading(false);
      setGeocodingLoading(false);
    }
  };

  const handleSavedLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = parseInt(e.target.value);
    if (isNaN(locationId)) {
      setSelectedSavedLocationId(null);
      return;
    }

    setSelectedSavedLocationId(locationId);
    const selectedLocation = savedLocations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      setAddress(selectedLocation.address);
      // Parse coordinates to numbers to avoid InvalidValueError in map
      const lat = parseFloat(selectedLocation.latitude);
      const lng = parseFloat(selectedLocation.longitude);
      setLatitude(isNaN(lat) ? undefined : lat);
      setLongitude(isNaN(lng) ? undefined : lng);
      setLocationMethod('saved');
    }
  };

  const handleManualLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setLocationMethod('manual');
  };

  const renderSummaryView = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-turquoise mb-2">
            Your Business Profile
          </h2>
          <p className="text-brand-brown">
            View and manage your business information for the circular economy platform.
          </p>
        </div>
        <button
          type="button"
          onClick={handleEditClick}
          className="px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
        >
          Edit Profile
        </button>
      </div>

      <div className="bg-brand-cream rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-brand-turquoise mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Business Name</h4>
              <p className="text-brand-brown">{existingBusiness?.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Business Type</h4>
              <p className="text-brand-brown capitalize">{existingBusiness?.business_type}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium text-brand-brown mb-2">Description</h4>
              <p className="text-brand-brown">{existingBusiness?.description || 'No description provided'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-brand-turquoise mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Address</h4>
              <p className="text-brand-brown">{existingBusiness?.address}</p>
            </div>
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Phone</h4>
              <p className="text-brand-brown">{existingBusiness?.phone || 'Not provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Website</h4>
              <p className="text-brand-brown">
                {existingBusiness?.website ? (
                  <a href={existingBusiness.website} target="_blank" rel="noopener noreferrer" className="text-brand-turquoise hover:underline">
                    {existingBusiness.website}
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Registered Number</h4>
              <p className="text-brand-brown">{existingBusiness?.registered_number || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-brand-brown">
            Last updated: {existingBusiness?.updated_at ? new Date(existingBusiness.updated_at).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Business Information</h3>
      <p className="text-brand-brown">Tell us about your business for the circular economy platform.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
            placeholder="e.g., GreenTech Manufacturing Ltd."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Business Type *
          </label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as BusinessType)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
          >
            <option value="manufacturer">Manufacturer</option>
            <option value="distributor">Distributor</option>
            <option value="recycler">Recycler</option>
            <option value="retailer">Retailer</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="service">Service Provider</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Business Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
            placeholder="Describe your business, products, and circular economy focus..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Registered Business Number (if applicable)
          </label>
          <input
            type="text"
            value={registeredNumber}
            onChange={(e) => setRegisteredNumber(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
            placeholder="e.g., CRO number, VAT number"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Contact Information</h3>
      <p className="text-brand-brown">How can other businesses reach you?</p>
      
      <div className="space-y-4">
        {/* Location Method Selector */}
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Business Address *
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setLocationMethod('autocomplete')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                locationMethod === 'autocomplete'
                  ? 'bg-brand-turquoise text-white border-brand-turquoise'
                  : 'bg-white text-brand-brown border-gray-300 hover:border-brand-turquoise hover:text-brand-turquoise'
              }`}
            >
              <Search size={16} />
              Search Address
            </button>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geolocationLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                locationMethod === 'current'
                  ? 'bg-brand-turquoise text-white border-brand-turquoise'
                  : 'bg-white text-brand-brown border-gray-300 hover:border-brand-turquoise hover:text-brand-turquoise'
              } ${geolocationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MapPin size={16} />
              {geolocationLoading ? 'Getting Location...' : 'Use My Location'}
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setLocationMethod('saved')}
                disabled={savedLocationsLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  locationMethod === 'saved'
                    ? 'bg-brand-turquoise text-white border-brand-turquoise'
                    : 'bg-white text-brand-brown border-gray-300 hover:border-brand-turquoise hover:text-brand-turquoise'
                } ${savedLocationsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Star size={16} />
                {savedLocationsLoading ? 'Loading...' : 'Saved Locations'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setLocationMethod('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                locationMethod === 'manual'
                  ? 'bg-brand-turquoise text-white border-brand-turquoise'
                  : 'bg-white text-brand-brown border-gray-300 hover:border-brand-turquoise hover:text-brand-turquoise'
              }`}
            >
              <PenLine size={16} />
              Enter Manually
            </button>
          </div>

          {/* Address Input based on selected method */}
          {locationMethod === 'autocomplete' && (
            <div className="mb-4">
              <LocationAutocomplete
                value={address}
                onChange={handleAutocompleteChange}
                placeholder="📍 Enter business address"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
              />
              <p className="text-sm text-gray-500 mt-1">Search for your business address using Google Maps</p>
            </div>
          )}

          {locationMethod === 'current' && (
            <div className="mb-4">
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                {geolocationLoading || geocodingLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-brand-turquoise border-t-transparent rounded-full"></div>
                    <span className="text-gray-600">
                      {geocodingLoading ? 'Getting address from coordinates...' : 'Getting your current location...'}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-700">{address || 'Click "Use My Location" to get your address'}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Uses your browser's location services</p>
              {geocodingError && (
                <p className="text-sm text-amber-600 mt-1">{geocodingError}</p>
              )}
            </div>
          )}

          {locationMethod === 'saved' && user && (
            <div className="mb-4">
              {savedLocationsLoading ? (
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin h-4 w-4 border-2 border-brand-turquoise border-t-transparent rounded-full"></div>
                  <span className="text-gray-600">Loading saved locations...</span>
                </div>
              ) : savedLocationsError ? (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {savedLocationsError}
                </div>
              ) : savedLocations.length === 0 ? (
                <div className="mb-2 p-4 bg-gray-50 border border-gray-200 rounded text-center">
                  <p className="text-gray-600">No saved locations yet</p>
                  <p className="text-sm text-gray-500 mt-1">Save locations in the Meetup section to use them here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedSavedLocationId || ''}
                    onChange={handleSavedLocationChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise bg-white"
                  >
                    <option value="">Select a saved location</option>
                    {savedLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.label} - {location.address}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500">Choose from your previously saved locations</p>
                </div>
              )}
            </div>
          )}

          {locationMethod === 'manual' && (
            <div className="mb-4">
              <input
                type="text"
                value={address}
                onChange={handleManualLocationChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
                placeholder="Street address, city, county"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Enter your business address manually</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-brown mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
              placeholder="+353 1 234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown mb-2">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-turquoise"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Coordinates
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Latitude and longitude will be auto-filled when using location methods above.
            {locationMethod !== 'manual' && ' Fields are read-only when auto-populated.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                step="any"
                value={latitude || ''}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                readOnly={locationMethod !== 'manual' && latitude !== undefined}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                  locationMethod !== 'manual' && latitude !== undefined
                    ? 'border-gray-300 bg-gray-50 text-gray-600'
                    : 'border-gray-300 focus:border-brand-turquoise'
                }`}
                placeholder="Latitude (e.g., 53.3498)"
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                value={longitude || ''}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                readOnly={locationMethod !== 'manual' && longitude !== undefined}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                  locationMethod !== 'manual' && longitude !== undefined
                    ? 'border-gray-300 bg-gray-50 text-gray-600'
                    : 'border-gray-300 focus:border-brand-turquoise'
                }`}
                placeholder="Longitude (e.g., -6.2603)"
              />
            </div>
          </div>
          {locationMethod !== 'manual' && (latitude !== undefined || longitude !== undefined) && (
            <p className="text-sm text-brand-turquoise mt-2">
              ✓ Coordinates auto-populated from {locationMethod === 'autocomplete' ? 'address search' : 
                locationMethod === 'current' ? 'your current location' : 'saved location'}
            </p>
          )}

          {/* Inline Map */}
          {latitude !== undefined && longitude !== undefined && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Business Location Map
              </label>
              <SimpleMap
                latitude={latitude}
                longitude={longitude}
                height="200px"
                width="100%"
                markerTitle={address || "Business Location"}
                className="rounded-lg border border-gray-300"
              />
              <p className="text-sm text-gray-500 mt-1">
                Interactive map showing your business location. Click "Open in Google Maps ↗" for directions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Review Your Business Profile</h3>
      <p className="text-brand-brown">Please review your information before saving.</p>
      
      <div className="bg-brand-cream rounded-lg p-6 space-y-4">
        <div>
          <h4 className="font-bold text-brand-brown">Business Information</h4>
          <p className="text-brand-brown">
            <strong>Name:</strong> {name || 'Not provided'}
          </p>
          <p className="text-brand-brown">
            <strong>Type:</strong> {businessType ? businessType.charAt(0).toUpperCase() + businessType.slice(1) : 'Not specified'}
          </p>
          <p className="text-brand-brown">
            <strong>Description:</strong> {description || 'No description provided'}
          </p>
          <p className="text-brand-brown">
            <strong>Registered Number:</strong> {registeredNumber || 'Not provided'}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-brand-brown">Contact Information</h4>
          <p className="text-brand-brown">
            <strong>Address:</strong> {address || 'Not provided'}
          </p>
          <p className="text-brand-brown">
            <strong>Phone:</strong> {phone || 'Not provided'}
          </p>
          <p className="text-brand-brown">
            <strong>Website:</strong> {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-brand-turquoise hover:underline">
                {website}
              </a>
            ) : 'Not provided'}
          </p>
          {latitude && longitude && (
            <p className="text-brand-brown">
              <strong>Coordinates:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-turquoise"></div>
            <p className="mt-4 text-brand-brown">Loading your business profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user && existingBusiness && !isEditMode) {
    return (
      <>
        {renderSummaryView()}
        {showRegistrationModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeRegistrationModal}
          >
            <div 
              className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Registration modal - same as accessibility wizard */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-turquoise">Create Account & Save Profile</h2>
                <button
                  onClick={closeRegistrationModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  disabled={registrationLoading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleRegistrationSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={registrationForm.name}
                    onChange={handleRegistrationChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                    placeholder="John Doe"
                    disabled={registrationLoading}
                    autoComplete="name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={registrationForm.email}
                    onChange={handleRegistrationChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                    placeholder="your.email@example.com"
                    disabled={registrationLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={registrationForm.password}
                    onChange={handleRegistrationChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                    placeholder="Minimum 6 characters"
                    disabled={registrationLoading}
                    autoComplete="new-password"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={registrationForm.confirmPassword}
                    onChange={handleRegistrationChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                    placeholder="Re-enter password"
                    disabled={registrationLoading}
                    autoComplete="new-password"
                  />
                </div>

                {registrationError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {registrationError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={registrationLoading}
                  className={`w-full bg-brand-turquoise hover:bg-brand-turquoise-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    registrationLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {registrationLoading ? 'Creating Account & Saving Profile...' : 'Create Account & Save Profile'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  By creating an account, you'll be able to save your business profile and access the circular economy marketplace.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-turquoise mb-2">
            {isEditMode && existingBusiness ? 'Edit Business Profile' : 'Business Profile Setup'}
          </h2>
          <p className="text-brand-brown">
            {isEditMode && existingBusiness 
              ? 'Update your business information for the circular economy platform.' 
              : 'Set up your business profile to participate in the circular economy marketplace.'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= stepNumber ? 'bg-brand-turquoise text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {stepNumber}
                  </div>
                  <span className="text-xs mt-2 text-brand-brown">
                    {stepNumber === 1 && 'Business Info'}
                    {stepNumber === 2 && 'Contact Info'}
                    {stepNumber === 3 && 'Review'}
                  </span>
                </div>
                {stepNumber < 3 && (
                  <div className={`flex-1 h-1 ${step > stepNumber ? 'bg-brand-turquoise' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-brand-turquoise text-brand-turquoise rounded-lg font-semibold hover:bg-brand-cream transition-all"
              >
                ← Back
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={isEditMode ? handleCancelEdit : onCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                {isEditMode ? 'Cancel Edit' : 'Cancel'}
              </button>
            )}
            
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : step === 3 ? (isEditMode ? 'Update Profile' : 'Create Business') : 'Continue →'}
            </button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeRegistrationModal}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brand-turquoise">Create Account & Save Profile</h2>
              <button
                onClick={closeRegistrationModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={registrationLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegistrationSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={registrationForm.name}
                  onChange={handleRegistrationChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                  placeholder="John Doe"
                  disabled={registrationLoading}
                  autoComplete="name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={registrationForm.email}
                  onChange={handleRegistrationChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                  placeholder="your.email@example.com"
                  disabled={registrationLoading}
                  autoComplete="email"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={registrationForm.password}
                  onChange={handleRegistrationChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                  placeholder="Minimum 6 characters"
                  disabled={registrationLoading}
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={registrationForm.confirmPassword}
                  onChange={handleRegistrationChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise-light"
                  placeholder="Re-enter password"
                  disabled={registrationLoading}
                  autoComplete="new-password"
                />
              </div>

              {registrationError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {registrationError}
                </div>
              )}

              <button
                type="submit"
                disabled={registrationLoading}
                className={`w-full bg-brand-turquoise hover:bg-brand-turquoise-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  registrationLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {registrationLoading ? 'Creating Account & Saving Profile...' : 'Create Account & Save Profile'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                By creating an account, you'll be able to save your business profile and access the circular economy marketplace.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessProfileWizard;