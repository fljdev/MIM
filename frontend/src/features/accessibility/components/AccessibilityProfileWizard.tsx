import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';
import { 
  MobilityType, 
  TransportAccess, 
  UserAccessibilityProfile 
} from '../../../types/Accessibility';

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

interface AccessibilityProfileWizardProps {
  initialProfile?: UserAccessibilityProfile | null;
  onSave?: (profile: Partial<UserAccessibilityProfile>) => void;
  onCancel?: () => void;
}

const AccessibilityProfileWizard: React.FC<AccessibilityProfileWizardProps> = ({ 
  initialProfile, 
  onSave, 
  onCancel 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Profile fetching state
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<UserAccessibilityProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [mobilityType, setMobilityType] = useState<MobilityType | undefined>(undefined);
  const [transportAccess, setTransportAccess] = useState<TransportAccess | undefined>(undefined);
  const [autism, setAutism] = useState(false);
  const [lightSensitivity, setLightSensitivity] = useState(false);
  const [noiseSensitivity, setNoiseSensitivity] = useState(false);
  const [crowdSensitivity, setCrowdSensitivity] = useState(false);
  const [hearingImpaired, setHearingImpaired] = useState(false);
  const [visionImpaired, setVisionImpaired] = useState(false);
  const [serviceDog, setServiceDog] = useState(false);
  const [cognitiveNeeds, setCognitiveNeeds] = useState(false);
  const [preferredTransportServices, setPreferredTransportServices] = useState<string[]>([]);
  const [avoidFeatures, setAvoidFeatures] = useState<string[]>([]);

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

  // Fetch existing profile on mount if user is authenticated
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!user) {
        // Not authenticated - no profile to fetch
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
          setExistingProfile(transformedProfile);
        } else if (response.status === 404) {
          // No profile exists - this is expected
          setExistingProfile(null);
        } else {
          // Other error - silently fall through
          console.error('Failed to fetch profile:', response.status);
          setExistingProfile(null);
        }
      } catch (error) {
        // Network or other error - silently fall through
        console.error('Error fetching profile:', error);
        setExistingProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingProfile();
  }, [user]);

  // Initialize form with existing profile (when editing or from props)
  useEffect(() => {
    if (initialProfile) {
      setMobilityType(initialProfile.mobilityType);
      setTransportAccess(initialProfile.transportAccess);
      setAutism(initialProfile.autism);
      setLightSensitivity(initialProfile.lightSensitivity);
      setNoiseSensitivity(initialProfile.noiseSensitivity);
      setCrowdSensitivity(initialProfile.crowdSensitivity);
      setHearingImpaired(initialProfile.hearingImpaired);
      setVisionImpaired(initialProfile.visionImpaired);
      setServiceDog(initialProfile.serviceDog);
      setCognitiveNeeds(initialProfile.cognitiveNeeds);
      setPreferredTransportServices(initialProfile.preferredTransportServices);
      setAvoidFeatures(initialProfile.avoidFeatures);
    } else if (existingProfile && isEditMode) {
      // When switching to edit mode with existing profile
      setMobilityType(existingProfile.mobilityType);
      setTransportAccess(existingProfile.transportAccess);
      setAutism(existingProfile.autism);
      setLightSensitivity(existingProfile.lightSensitivity);
      setNoiseSensitivity(existingProfile.noiseSensitivity);
      setCrowdSensitivity(existingProfile.crowdSensitivity);
      setHearingImpaired(existingProfile.hearingImpaired);
      setVisionImpaired(existingProfile.visionImpaired);
      setServiceDog(existingProfile.serviceDog);
      setCognitiveNeeds(existingProfile.cognitiveNeeds);
      setPreferredTransportServices(existingProfile.preferredTransportServices);
      setAvoidFeatures(existingProfile.avoidFeatures);
    }
  }, [initialProfile, existingProfile, isEditMode]);

  const handleNext = () => {
    if (step < 4) {
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
    
    const profileData: Partial<UserAccessibilityProfile> = {
      mobilityType,
      transportAccess,
      autism,
      lightSensitivity,
      noiseSensitivity,
      crowdSensitivity,
      hearingImpaired,
      visionImpaired,
      serviceDog,
      cognitiveNeeds,
      preferredTransportServices,
      avoidFeatures
    };

    try {
      // If user is authenticated, save profile directly
      if (user) {
        if (isEditMode && existingProfile) {
          // Editing existing profile - use edit mode handler
          await handleSaveInEditMode(profileData);
        } else {
          // Creating new profile
          await saveProfileData(profileData);
        }
      } else {
        // Show registration modal for unauthenticated users
        setShowRegistrationModal(true);
      }
    } catch (error) {
      console.error('Failed to save accessibility profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save profile data for authenticated users
  const saveProfileData = async (profileData: Partial<UserAccessibilityProfile>) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/accessibility-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save profile');
    }

    // If onSave prop is provided (for backward compatibility), call it
    if (onSave) {
      onSave(profileData);
    }

    // Redirect to profile page
    navigate('/profile');
  };

  // Handle registration form changes
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationForm({
      ...registrationForm,
      [e.target.name]: e.target.value
    });
  };

  // Validate registration form
  const validateRegistrationForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registrationForm.email || !emailRegex.test(registrationForm.email)) {
      setRegistrationError('Please enter a valid email address');
      return false;
    }

    // Name validation
    if (!registrationForm.name || registrationForm.name.trim().length < 2) {
      setRegistrationError('Please enter your full name');
      return false;
    }

    // Password validation
    if (!registrationForm.password || registrationForm.password.length < 6) {
      setRegistrationError('Password must be at least 6 characters');
      return false;
    }

    // Confirm password validation
    if (registrationForm.password !== registrationForm.confirmPassword) {
      setRegistrationError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle registration and profile save
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');

    if (!validateRegistrationForm()) {
      return;
    }

    setRegistrationLoading(true);

    try {
      // Step 1: Register user
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

      // Store JWT token in localStorage
      if (registerData.token) {
        localStorage.setItem('token', registerData.token);
      }

      // Step 2: Save profile data with the new token
      const profileData: Partial<UserAccessibilityProfile> = {
        mobilityType,
        transportAccess,
        autism,
        lightSensitivity,
        noiseSensitivity,
        crowdSensitivity,
        hearingImpaired,
        visionImpaired,
        serviceDog,
        cognitiveNeeds,
        preferredTransportServices,
        avoidFeatures
      };

      const profileResponse = await fetch(`${API_BASE_URL}/api/accessibility-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${registerData.token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      // Reset registration form
      setRegistrationForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Close modal
      setShowRegistrationModal(false);

      // Redirect to profile page
      navigate('/profile');
    } catch (err: any) {
      setRegistrationError(err.message || 'An error occurred during registration');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Close registration modal
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

  const toggleTransportService = (service: string) => {
    setPreferredTransportServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const toggleAvoidFeature = (feature: string) => {
    setAvoidFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditMode(true);
    setStep(1); // Reset to first step
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Handle save in edit mode
  const handleSaveInEditMode = async (profileData: Partial<UserAccessibilityProfile>) => {
    try {
      await saveProfileData(profileData);
      setIsEditMode(false);
      // Refresh the profile after saving
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
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
            setExistingProfile(transformedProfile);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  // Summary view component
  const renderSummaryView = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-turquoise mb-2">
            Your Accessibility Profile
          </h2>
          <p className="text-brand-brown">
            View and manage your accessibility needs and preferences.
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
          <h3 className="text-xl font-bold text-brand-turquoise mb-4">Mobility & Transportation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Mobility Type</h4>
              <p className="text-brand-brown">
                {existingProfile?.mobilityType ? (
                  <span className="capitalize">
                    {existingProfile.mobilityType === 'mobility_scooter' ? 'Mobility Scooter' : existingProfile.mobilityType}
                  </span>
                ) : 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-brand-brown mb-2">Transport Access</h4>
              <p className="text-brand-brown">
                {existingProfile?.transportAccess ? (
                  <span className="capitalize">
                    {existingProfile.transportAccess.replace('_', ' ')}
                  </span>
                ) : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-brand-turquoise mb-4">Sensory & Environmental Needs</h3>
          <div className="flex flex-wrap gap-2">
            {existingProfile?.autism && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Autism</span>}
            {existingProfile?.lightSensitivity && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Light Sensitivity</span>}
            {existingProfile?.noiseSensitivity && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Noise Sensitivity</span>}
            {existingProfile?.crowdSensitivity && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Crowd Sensitivity</span>}
            {existingProfile?.hearingImpaired && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Hearing Impaired</span>}
            {existingProfile?.visionImpaired && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Vision Impaired</span>}
            {existingProfile?.serviceDog && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Service Dog</span>}
            {existingProfile?.cognitiveNeeds && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Cognitive Needs</span>}
            {!existingProfile?.autism && !existingProfile?.lightSensitivity && !existingProfile?.noiseSensitivity && 
             !existingProfile?.crowdSensitivity && !existingProfile?.hearingImpaired && !existingProfile?.visionImpaired &&
             !existingProfile?.serviceDog && !existingProfile?.cognitiveNeeds && (
              <span className="text-brand-brown">No sensory needs specified</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-brand-turquoise mb-4">Preferred Transport Services</h3>
          <div className="flex flex-wrap gap-2">
            {existingProfile?.preferredTransportServices && existingProfile.preferredTransportServices.length > 0 ? (
              existingProfile.preferredTransportServices.map(service => (
                <span key={service} className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">
                  {service}
                </span>
              ))
            ) : (
              <span className="text-brand-brown">No preferred services specified</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-brand-turquoise mb-4">Features to Avoid</h3>
          <div className="flex flex-wrap gap-2">
            {existingProfile?.avoidFeatures && existingProfile.avoidFeatures.length > 0 ? (
              existingProfile.avoidFeatures.map(feature => (
                <span key={feature} className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">
                  {feature}
                </span>
              ))
            ) : (
              <span className="text-brand-brown">No features to avoid specified</span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-brand-brown">
            Last updated: {existingProfile?.updatedAt ? new Date(existingProfile.updatedAt).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>
    </div>
  );

  // Step 1: Mobility
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Mobility & Transportation</h3>
      <p className="text-brand-brown">Tell us about your mobility needs and how you typically get around.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            What best describes your mobility needs?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['wheelchair', 'walker', 'crutches', 'mobility_scooter', 'none'] as MobilityType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMobilityType(type)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${mobilityType === type ? 'border-brand-turquoise bg-brand-cream' : 'border-gray-300 hover:border-brand-turquoise-light'}`}
              >
                <div className="font-medium text-brand-brown capitalize">
                  {type === 'mobility_scooter' ? 'Mobility Scooter' : type}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            How do you typically access transportation?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['own_car', 'public_transport', 'specialized_transport', 'combination'] as TransportAccess[]).map((access) => (
              <button
                key={access}
                type="button"
                onClick={() => setTransportAccess(access)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${transportAccess === access ? 'border-brand-turquoise bg-brand-cream' : 'border-gray-300 hover:border-brand-turquoise-light'}`}
              >
                <div className="font-medium text-brand-brown capitalize">
                  {access.replace('_', ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Sensory
  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Sensory & Environmental Needs</h3>
      <p className="text-brand-brown">Help us understand your sensory preferences and sensitivities.</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={autism}
              onChange={(e) => setAutism(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Autism/Autistic</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={lightSensitivity}
              onChange={(e) => setLightSensitivity(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Light Sensitivity</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={noiseSensitivity}
              onChange={(e) => setNoiseSensitivity(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Noise Sensitivity</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={crowdSensitivity}
              onChange={(e) => setCrowdSensitivity(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Crowd Sensitivity</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={hearingImpaired}
              onChange={(e) => setHearingImpaired(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Hearing Impaired</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={visionImpaired}
              onChange={(e) => setVisionImpaired(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Vision Impaired</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={serviceDog}
              onChange={(e) => setServiceDog(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Service Dog</span>
          </label>

          <label className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-300 hover:border-brand-turquoise-light cursor-pointer">
            <input
              type="checkbox"
              checked={cognitiveNeeds}
              onChange={(e) => setCognitiveNeeds(e.target.checked)}
              className="w-5 h-5 text-brand-turquoise"
            />
            <span className="font-medium text-brand-brown">Cognitive Needs</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Step 3: Preferences
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Preferences & Services</h3>
      <p className="text-brand-brown">Tell us about your preferred services and features to avoid.</p>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-brand-brown mb-3">Preferred Transport Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['IWA (Irish Wheelchair Association)', 'Enable Ireland', 'Dublin Bus Accessible', 'TFI Accessible', 'Taxi with ramp'].map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleTransportService(service)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${preferredTransportServices.includes(service) ? 'border-brand-turquoise bg-brand-cream' : 'border-gray-300 hover:border-brand-turquoise-light'}`}
              >
                <div className="font-medium text-brand-brown">{service}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-brand-brown mb-3">Features to Avoid</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Steps without ramps', 'Loud music', 'Bright flashing lights', 'Crowded spaces', 'Strong smells', 'Narrow corridors'].map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleAvoidFeature(feature)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${avoidFeatures.includes(feature) ? 'border-brand-turquoise bg-brand-cream' : 'border-gray-300 hover:border-brand-turquoise-light'}`}
              >
                <div className="font-medium text-brand-brown">{feature}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Review
  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-brand-turquoise">Review Your Profile</h3>
      <p className="text-brand-brown">Please review your information before saving.</p>
      
      <div className="bg-brand-cream rounded-lg p-6 space-y-4">
        <div>
          <h4 className="font-bold text-brand-brown">Mobility & Transportation</h4>
          <p className="text-brand-brown">
            {mobilityType ? `Mobility: ${mobilityType}` : 'Not specified'} • 
            {transportAccess ? ` Transport: ${transportAccess.replace('_', ' ')}` : ' Not specified'}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-brand-brown">Sensory Needs</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {autism && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Autism</span>}
            {lightSensitivity && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Light Sensitivity</span>}
            {noiseSensitivity && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Noise Sensitivity</span>}
            {crowdSensitivity && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Crowd Sensitivity</span>}
            {hearingImpaired && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Hearing Impaired</span>}
            {visionImpaired && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Vision Impaired</span>}
            {serviceDog && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Service Dog</span>}
            {cognitiveNeeds && <span className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">Cognitive Needs</span>}
            {!autism && !lightSensitivity && !noiseSensitivity && !crowdSensitivity && 
             !hearingImpaired && !visionImpaired && !serviceDog && !cognitiveNeeds && 
             <span className="text-brand-brown">No sensory needs specified</span>}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-brand-brown">Preferred Services</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {preferredTransportServices.map(service => (
              <span key={service} className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">
                {service}
              </span>
            ))}
            {preferredTransportServices.length === 0 && (
              <span className="text-brand-brown">No preferred services specified</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-brand-brown">Features to Avoid</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {avoidFeatures.map(feature => (
              <span key={feature} className="px-3 py-1 bg-white text-brand-brown rounded-full text-sm">
                {feature}
              </span>
            ))}
            {avoidFeatures.length === 0 && (
              <span className="text-brand-brown">No features to avoid specified</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Conditional rendering logic
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-turquoise"></div>
            <p className="mt-4 text-brand-brown">Loading your accessibility profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show summary view if user is authenticated and has an existing profile and not in edit mode
  if (user && existingProfile && !isEditMode) {
    return (
      <>
        {renderSummaryView()}
        {/* Registration Modal (still available if needed) */}
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
                  By creating an account, you'll be able to save your accessibility profile and access personalized features.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Otherwise show the wizard (for unauthenticated users, users without profile, or edit mode)
  return (
    <>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-turquoise mb-2">
            {isEditMode && existingProfile ? 'Edit Accessibility Profile' : 'Accessibility Profile Setup'}
          </h2>
          <p className="text-brand-brown">
            {isEditMode && existingProfile 
              ? 'Update your accessibility needs and preferences.' 
              : 'Help us personalize your experience by sharing your accessibility needs and preferences.'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= stepNumber ? 'bg-brand-turquoise text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {stepNumber}
                  </div>
                  <span className="text-xs mt-2 text-brand-brown">
                    {stepNumber === 1 && 'Mobility'}
                    {stepNumber === 2 && 'Sensory'}
                    {stepNumber === 3 && 'Preferences'}
                    {stepNumber === 4 && 'Review'}
                  </span>
                </div>
                {stepNumber < 4 && (
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
          {step === 4 && renderStep4()}
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
              {isSubmitting ? 'Saving...' : step === 4 ? (isEditMode ? 'Update Profile' : 'Save Profile') : 'Continue →'}
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
                By creating an account, you'll be able to save your accessibility profile and access personalized features.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityProfileWizard;