export type MobilityType = 'wheelchair' | 'walker' | 'crutches' | 'mobility_scooter' | 'none';
export type TransportAccess = 'own_car' | 'public_transport' | 'specialized_transport' | 'combination';
export type NoiseLevel = 'very_quiet' | 'quiet' | 'moderate' | 'loud' | 'very_loud';
export type CrowdLevel = 'low' | 'medium' | 'high';
export type EventType = 'autism_friendly_screening' | 'quiet_hour' | 'relaxed_performance' | 'sensory_friendly_time';

export interface Photo {
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TimeSlot {
  day: string;
  timeRange: string;
}

export interface UserAccessibilityProfile {
  id: string;
  userId: string;
  
  mobilityType?: MobilityType;
  transportAccess?: TransportAccess;
  
  autism: boolean;
  lightSensitivity: boolean;
  noiseSensitivity: boolean;
  crowdSensitivity: boolean;
  
  hearingImpaired: boolean;
  visionImpaired: boolean;
  serviceDog: boolean;
  cognitiveNeeds: boolean;
  
  preferredTransportServices: string[];
  avoidFeatures: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PhysicalAccessibility {
  id: string;
  venueId: string;
  
  stepFreeEntrance: boolean;
  entranceStepsCount?: number;
  rampAvailable: boolean;
  automaticDoor: boolean;
  doorWidthCm?: number;
  doorType?: string;
  
  disabledParkingBays: number;
  parkingDistanceToEntranceM?: number;
  parkingCovered: boolean;
  dropOffZone: boolean;
  dropOffLocation?: string;
  dropOffCurbHeightCm?: number;
  dropOffCovered: boolean;
  
  levelAccessThroughout: boolean;
  liftAvailable: boolean;
  liftWheelchairAccessible: boolean;
  corridorWidthCm?: number;
  narrowPassages: boolean;
  
  moveableChairs: boolean;
  wheelchairSpaceAvailable: boolean;
  tableHeightCm?: number;
  spaceBetweenTables?: string;
  
  accessibleToilet: boolean;
  toiletGrabRails: boolean;
  toiletSpaceForWheelchair: boolean;
  changingPlacesToilet: boolean;
  
  accessibilityNotes?: string;
  photos: Photo[];
  
  submittedBy: string;
  verified: boolean;
  verifiedBy?: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface SensoryAccessibility {
  id: string;
  venueId: string;
  
  noiseLevel: NoiseLevel;
  backgroundMusic: boolean;
  musicVolume?: string;
  liveMusic: boolean;
  
  lightingType: string;
  flickeringLights: boolean;
  adjustableLighting: boolean;
  
  typicalCrowdLevel: CrowdLevel;
  busyTimes: TimeSlot[];
  quietTimes: TimeSlot[];
  strongSmells: boolean;
  smellSources?: string;
  
  quietSpaceAvailable: boolean;
  sensoryOverloadEscapeRoute: boolean;
  staffAutismTrained: boolean;
  visualSupportsAvailable: boolean;
  
  sensoryNotes?: string;
  photos: Photo[];
  
  submittedBy: string;
  verified: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export interface SpecialEvent {
  id: string;
  venueId: string;
  eventName: string;
  eventType: EventType;
  description: string;
  
  recurring: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  nextOccurrence: Date;
  
  bookingRequired: boolean;
  bookingUrl?: string;
  bookingPhone?: string;
  advanceBookingDays?: number;
  
  maxCapacity?: number;
  costEuro?: number;
  specialNotes?: string;
  
  createdBy: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransportService {
  id: string;
  serviceName: string;
  serviceType: 'specialized' | 'public' | 'taxi' | 'community';
  organization: string;
  
  coverageAreas: string[];
  serviceRadiusKm?: number;
  
  requiresMembership: boolean;
  membershipCostEuro?: number;
  requiresAdvanceBooking: boolean;
  advanceBookingDays?: number;
  
  contactPhone?: string;
  contactEmail?: string;
  bookingUrl?: string;
  website?: string;
  
  wheelchairAccessible: boolean;
  vehicleTypes: string[];
  costStructure: string;
  acceptsFreeTravelPass: boolean;
  
  operatingDays: number[];
  operatingHours: string;
  
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JourneyOption {
  id: string;
  transportType: 'public' | 'specialized' | 'car_parking' | 'taxi';
  serviceName: string;
  
  durationMinutes: number;
  steps: JourneyStep[];
  
  cost?: number;
  bookingRequired: boolean;
  bookingUrl?: string;
  
  accessibilityMatch: number;
  warnings: string[];
}

export interface JourneyStep {
  instruction: string;
  mode: string;
  durationMinutes: number;
}

export interface VenueAccessibilityMatch {
  venueId: string;
  overallMatch: number;
  physicalMatch: number;
  sensoryMatch: number;
  transportMatch: number;
  
  meetsRequirements: boolean;
  warnings: string[];
  positives: string[];
}

export interface AccessibilityReview {
  id: string;
  venueId: string;
  userId: string;
  
  overallRating: number;
  reviewText: string;
  visitDate: Date;
  wouldRecommend: boolean;
  accessibilityNeedsMet: boolean;
  
  createdAt: Date;
}