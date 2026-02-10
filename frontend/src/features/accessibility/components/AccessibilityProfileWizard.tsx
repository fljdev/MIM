import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { 
  MobilityType, 
  TransportAccess, 
  UserAccessibilityProfile 
} from '../../../types/Accessibility';

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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Initialize form with existing profile
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
    }
  }, [initialProfile]);

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
    if (!user) return;
    
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
      // In a real implementation, you would call your API here
      // For now, we'll just call the onSave callback
      if (onSave) {
        onSave(profileData);
      }
    } catch (error) {
      console.error('Failed to save accessibility profile:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-turquoise">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-turquoise mb-2">
          Accessibility Profile Setup
        </h2>
        <p className="text-brand-brown">
          Help us personalize your experience by sharing your accessibility needs and preferences.
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
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          )}
          
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : step === 4 ? 'Save Profile' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityProfileWizard;