import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { 
  PhysicalAccessibility, 
  SensoryAccessibility, 
  SpecialEvent,
  AccessibilityReview 
} from '../../../types/Accessibility';

interface Venue {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  venue_type: string;
  google_places_id: string;
}

const VenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [physicalAccessibility, setPhysicalAccessibility] = useState<PhysicalAccessibility | null>(null);
  const [sensoryAccessibility, setSensoryAccessibility] = useState<SensoryAccessibility | null>(null);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [reviews, setReviews] = useState<AccessibilityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'physical' | 'sensory' | 'events' | 'reviews'>('overview');

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/venues/${id}`);
        if (!response.ok) {
          throw new Error('Venue not found');
        }
        const data = await response.json();
        setVenue(data.venue);
        setPhysicalAccessibility(data.physicalAccessibility);
        setSensoryAccessibility(data.sensoryAccessibility);
        setSpecialEvents(data.specialEvents || []);
        
        // Fetch reviews separately
        const reviewsResponse = await fetch(`http://localhost:5001/api/venues/${id}/reviews`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData.reviews || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load venue details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenueDetails();
    }
  }, [id]);

  const handlePlanJourney = () => {
    navigate('/journey-planner', { state: { destinationVenue: venue } });
  };

  const handleAddReview = () => {
    navigate(`/venues/${id}/review`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-turquoise border-t-transparent mx-auto mb-4"></div>
          <p className="text-brand-turquoise">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-brand-turquoise mb-2">Venue Not Found</h2>
          <p className="text-brand-brown">{error || 'The requested venue could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const calculateAccessibilityScore = () => {
    let score = 50; // Base score
    
    if (physicalAccessibility) {
      if (physicalAccessibility.stepFreeEntrance) score += 10;
      if (physicalAccessibility.accessibleToilet) score += 15;
      if (physicalAccessibility.wheelchairSpaceAvailable) score += 10;
      if (physicalAccessibility.liftAvailable) score += 5;
      if (physicalAccessibility.disabledParkingBays > 0) score += 5;
    }
    
    if (sensoryAccessibility) {
      if (sensoryAccessibility.quietSpaceAvailable) score += 5;
      if (sensoryAccessibility.staffAutismTrained) score += 5;
      if (sensoryAccessibility.noiseLevel === 'quiet' || sensoryAccessibility.noiseLevel === 'very_quiet') score += 5;
    }
    
    return Math.min(score, 100);
  };

  const accessibilityScore = calculateAccessibilityScore();
  const scoreColor = accessibilityScore >= 80 ? 'text-green-600' : 
                     accessibilityScore >= 60 ? 'text-yellow-600' : 
                     'text-red-600';

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-white hover:opacity-80"
          >
            ← Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{venue.name}</h1>
          <p className="text-lg opacity-90">{venue.address}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <span className="text-2xl">🏪</span>
              <span>{venue.venue_type || 'Venue'}</span>
            </div>
            <div className={`flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full ${scoreColor}`}>
              <span className="text-2xl">♿</span>
              <span className="font-bold">{accessibilityScore}% Accessibility</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto mb-6 border-b border-gray-300">
              {['overview', 'physical', 'sensory', 'events', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-brand-turquoise text-brand-turquoise' : 'text-gray-600 hover:text-brand-turquoise'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'reviews' && reviews.length > 0 && (
                    <span className="ml-2 bg-brand-turquoise text-white text-xs px-2 py-1 rounded-full">
                      {reviews.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Overview</h3>
                  <p className="text-brand-brown">
                    This venue has been evaluated for accessibility features. Below is a summary of what's available.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Physical Features */}
                    <div className="bg-brand-cream p-4 rounded-lg">
                      <h4 className="font-bold text-brand-turquoise mb-3">♿ Physical Accessibility</h4>
                      <ul className="space-y-2">
                        {physicalAccessibility?.stepFreeEntrance && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Step-free entrance</span>
                          </li>
                        )}
                        {physicalAccessibility?.accessibleToilet && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Accessible toilet</span>
                          </li>
                        )}
                        {physicalAccessibility?.wheelchairSpaceAvailable && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Wheelchair space</span>
                          </li>
                        )}
                        {physicalAccessibility?.disabledParkingBays > 0 && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Disabled parking ({physicalAccessibility.disabledParkingBays} bays)</span>
                          </li>
                        )}
                        {!physicalAccessibility && (
                          <li className="text-gray-500">No physical accessibility data available</li>
                        )}
                      </ul>
                    </div>

                    {/* Sensory Features */}
                    <div className="bg-brand-cream p-4 rounded-lg">
                      <h4 className="font-bold text-brand-turquoise mb-3">🎵 Sensory Environment</h4>
                      <ul className="space-y-2">
                        {sensoryAccessibility?.noiseLevel && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Noise level: {sensoryAccessibility.noiseLevel.replace('_', ' ')}</span>
                          </li>
                        )}
                        {sensoryAccessibility?.quietSpaceAvailable && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Quiet space available</span>
                          </li>
                        )}
                        {sensoryAccessibility?.staffAutismTrained && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Autism-trained staff</span>
                          </li>
                        )}
                        {!sensoryAccessibility && (
                          <li className="text-gray-500">No sensory accessibility data available</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Special Events */}
                  {specialEvents.length > 0 && (
                    <div className="bg-brand-cream p-4 rounded-lg">
                      <h4 className="font-bold text-brand-turquoise mb-3">🎬 Upcoming Special Events</h4>
                      <div className="space-y-3">
                        {specialEvents.slice(0, 3).map(event => (
                          <div key={event.id} className="bg-white p-3 rounded-lg border border-brand-turquoise">
                            <div className="font-bold text-brand-turquoise">{event.eventName}</div>
                            <div className="text-sm text-brand-brown">
                              {new Date(event.nextOccurrence).toLocaleDateString()} • {event.eventType.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'physical' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Physical Accessibility Details</h3>
                  {physicalAccessibility ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Entrance & Access</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Step-free entrance:</span>
                            <span className={physicalAccessibility.stepFreeEntrance ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.stepFreeEntrance ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Ramp available:</span>
                            <span className={physicalAccessibility.rampAvailable ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.rampAvailable ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Automatic door:</span>
                            <span className={physicalAccessibility.automaticDoor ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.automaticDoor ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Door width:</span>
                            <span>{physicalAccessibility.doorWidthCm || 'Unknown'} cm</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Parking & Drop-off</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Disabled parking bays:</span>
                            <span>{physicalAccessibility.disabledParkingBays}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Drop-off zone:</span>
                            <span className={physicalAccessibility.dropOffZone ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.dropOffZone ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Covered parking:</span>
                            <span className={physicalAccessibility.parkingCovered ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.parkingCovered ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Interior</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Level access throughout:</span>
                            <span className={physicalAccessibility.levelAccessThroughout ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.levelAccessThroughout ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Lift available:</span>
                            <span className={physicalAccessibility.liftAvailable ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.liftAvailable ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Wheelchair-accessible lift:</span>
                            <span className={physicalAccessibility.liftWheelchairAccessible ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.liftWheelchairAccessible ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Toilets</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Accessible toilet:</span>
                            <span className={physicalAccessibility.accessibleToilet ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.accessibleToilet ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Grab rails:</span>
                            <span className={physicalAccessibility.toiletGrabRails ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.toiletGrabRails ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Changing Places toilet:</span>
                            <span className={physicalAccessibility.changingPlacesToilet ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {physicalAccessibility.changingPlacesToilet ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No physical accessibility data available for this venue.</p>
                  )}
                </div>
              )}

              {activeTab === 'sensory' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Sensory Environment Details</h3>
                  {sensoryAccessibility ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Noise & Music</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Noise level:</span>
                            <span>{sensoryAccessibility.noiseLevel?.replace('_', ' ') || 'Unknown'}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Background music:</span>
                            <span className={sensoryAccessibility.backgroundMusic ? 'text-yellow-600 font-bold' : 'text-green-600'}>
                              {sensoryAccessibility.backgroundMusic ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Live music:</span>
                            <span className={sensoryAccessibility.liveMusic ? 'text-yellow-600 font-bold' : 'text-green-600'}>
                              {sensoryAccessibility.liveMusic ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Lighting</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Lighting type:</span>
                            <span>{sensoryAccessibility.lightingType || 'Unknown'}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Flickering lights:</span>
                            <span className={sensoryAccessibility.flickeringLights ? 'text-red-600 font-bold' : 'text-green-600'}>
                              {sensoryAccessibility.flickeringLights ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Adjustable lighting:</span>
                            <span className={sensoryAccessibility.adjustableLighting ? 'text-green-600 font-bold' : 'text-gray-600'}>
                              {sensoryAccessibility.adjustableLighting ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Environment</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Typical crowd level:</span>
                            <span>{sensoryAccessibility.typicalCrowdLevel || 'Unknown'}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Strong smells:</span>
                            <span className={sensoryAccessibility.strongSmells ? 'text-red-600 font-bold' : 'text-green-600'}>
                              {sensoryAccessibility.strongSmells ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-brand-turquoise mb-3">Autism-Friendly Features</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Quiet space available:</span>
                            <span className={sensoryAccessibility.quietSpaceAvailable ? 'text-green-600 font-bold' : 'text-gray-600'}>
                              {sensoryAccessibility.quietSpaceAvailable ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Staff autism-trained:</span>
                            <span className={sensoryAccessibility.staffAutismTrained ? 'text-green-600 font-bold' : 'text-gray-600'}>
                              {sensoryAccessibility.staffAutismTrained ? 'Yes' : 'No'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Visual supports:</span>
                            <span className={sensoryAccessibility.visualSupportsAvailable ? 'text-green-600 font-bold' : 'text-gray-600'}>
                              {sensoryAccessibility.visualSupportsAvailable ? 'Yes' : 'No'}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No sensory accessibility data available for this venue.</p>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Special Events</h3>
                  {specialEvents.length > 0 ? (
                    <div className="space-y-4">
                      {specialEvents.map(event => (
                        <div key={event.id} className="bg-brand-cream p-6 rounded-lg border-2 border-brand-turquoise">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xl font-bold text-brand-turquoise">{event.eventName}</h4>
                              <p className="text-brand-brown mt-2">{event.description}</p>
                              <div className="flex flex-wrap gap-3 mt-3">
                                <span className="px-3 py-1 bg-white text-brand-turquoise rounded-full text-sm">
                                  {event.eventType.replace('_', ' ')}
                                </span>
                                <span className="px-3 py-1 bg-white text-brand-turquoise rounded-full text-sm">
                                  {new Date(event.nextOccurrence).toLocaleDateString()}
                                </span>
                                {event.bookingRequired && (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Booking required
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              {event.bookingUrl && (
                                <a
                                  href={event.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
                                >
                                  Book Now
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No special events scheduled for this venue.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-brand-turquoise">Accessibility Reviews</h3>
                  {user && (
                    <button
                      onClick={handleAddReview}
                      className="px-6 py-3 bg-brand-turquoise text-white rounded-lg font-semibold hover:bg-brand-turquoise-dark transition-all"
                    >
                      + Add Your Review
                    </button>
                  )}
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="bg-white border border-gray-300 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-2xl ${i < review.overallRating ? 'text-yellow-500' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                {new Date(review.visitDate).toLocaleDateString()} • 
                                {review.wouldRecommend ? ' Would recommend' : ' Would not recommend'}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {review.accessibilityNeedsMet && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                  Needs met ✓
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-800">{review.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Map */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Plan Your Journey</h3>
              <button
                onClick={handlePlanJourney}
                className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🚶‍♀️</span>
                Plan Journey to This Venue
              </button>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>📞</span>
                  Call Venue
                </button>
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>🌐</span>
                  Visit Website
                </button>
                <button className="w-full px-4 py-3 bg-brand-cream text-brand-turquoise rounded-lg font-semibold hover:bg-brand-turquoise hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>📋</span>
                  Report Incorrect Info
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Accessibility Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Score</span>
                    <span className={`text-2xl font-bold ${scoreColor}`}>{accessibilityScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${accessibilityScore >= 80 ? 'bg-green-500' : accessibilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${accessibilityScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-brand-cream rounded-lg">
                    <div className="text-2xl">♿</div>
                    <div className="font-bold text-brand-turquoise">Physical</div>
                    <div className="text-sm">
                      {physicalAccessibility ? 
                        (physicalAccessibility.stepFreeEntrance && physicalAccessibility.accessibleToilet ? 'Good' : 'Basic') : 
                        'No data'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-brand-cream rounded-lg">
                    <div className="text-2xl">🎵</div>
                    <div className="font-bold text-brand-turquoise">Sensory</div>
                    <div className="text-sm">
                      {sensoryAccessibility ? 
                        (sensoryAccessibility.quietSpaceAvailable ? 'Good' : 'Basic') : 
                        'No data'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-turquoise">
              <h3 className="text-xl font-bold text-brand-turquoise mb-4">Nearby Transport</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                  <span className="text-2xl">🚌</span>
                  <div>
                    <div className="font-bold">Dublin Bus Route 46A</div>
                    <div className="text-sm text-gray-600">Accessible bus - 200m away</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                  <span className="text-2xl">🚕</span>
                  <div>
                    <div className="font-bold">Accessible Taxi</div>
                    <div className="text-sm text-gray-600">Local companies available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                  <span className="text-2xl">🅿️</span>
                  <div>
                    <div className="font-bold">Disabled Parking</div>
                    <div className="text-sm text-gray-600">
                      {physicalAccessibility?.disabledParkingBays || '0'} bays on-site
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;