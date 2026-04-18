# MiM MVP Implementation Plan

## Overview
Migrate from MiM (wheelchair accessibility journey planner) to MiM (Metals in Motion - B2B circular economy platform for Irish SMEs). Database schema migration completed successfully.

## Completed Milestones
✅ **Database Schema Migration** (009, 010, 011)
- Core tables: businesses, waste_streams, materials, transactions, saved_materials
- Users updated: business_profile_id, role CHECK constraint
- Legacy tables archived with legacy_ prefix
- All foreign key dependencies resolved

## MVP1 Features (Business Profile & Material Listing Portal)
Based on existing codebase analysis, implement:

### 1. **Business Profile & Onboarding**
- Reuse: AccessibilityProfileWizard → BusinessProfileWizard
- Repurpose: User profile flows → Business registration
- Build: Business verification, CRO number validation

### 2. **Material Marketplace**
- Reuse: BrowseVenuesPage → BrowseMaterialsPage  
- Repurpose: VenueDetailPage → MaterialDetailPage
- Reuse: Saved materials functionality (from favorite_venues)
- Build: Material search/filter by waste stream, location, price

### 3. **Carbon Tracking Dashboard**
- Reuse: Existing carbon calculator utilities
- Enhance: Circular economy carbon savings calculations
- Build: Business sustainability reporting dashboard

### 4. **Authentication & User Management**  
- Reuse: Existing JWT auth, login, registration
- Enhance: Business user role support
- Reuse: AuthContext, modals, routes

### 5. **Geolocation & Mapping**
- Reuse: Google Maps integration, location autocomplete
- Repurpose: Journey planner logic → Supply chain distance calculations
- Build: Material collection point mapping

## Implementation Phases

### Phase 1: Backend Routes & Controllers
1. Create `/api/businesses/*` routes
2. Create `/api/materials/*` routes  
3. Create `/api/transactions/*` routes
4. Update auth middleware for business roles
5. Create data models/validation

### Phase 2: Frontend Components
1. BusinessProfileWizard (from AccessibilityProfileWizard)
2. BrowseMaterialsPage (from BrowseVenuesPage)
3. MaterialDetailPage (from VenueDetailPage)
4. MaterialListingForm (new)
5. Dashboard with carbon metrics

### Phase 3: Integration & Testing
1. Connect frontend to backend APIs
2. Test business registration flow
3. Test material listing/posting
4. Test search/filter functionality
5. Test saved materials functionality

### Phase 4: Polish & Launch
1. Update branding/UI for MiM Town
2. Add circular economy messaging
3. Create Irish SME-focused content
4. Deploy and verify

## Tech Stack Reuse Analysis

### Direct Reuse
- **Authentication**: JWT, login, signup, auth context (100% reuse)
- **Database**: PostgreSQL, connection pooling, ORM setup
- **Email**: Existing infrastructure
- **UI Components**: Navbar, modals, forms, buttons, Toast
- **Maps**: Google Maps integration, location autocomplete
- **Waitlist**: Existing newsletter signup

### Repurpose with Modifications  
- **Profile/Wizard flows**: Accessibility → Business onboarding
- **Browse/Filter pages**: Venues → Materials directory
- **Detail pages**: Venue → Material/Business listing
- **Journey planner**: Accessibility routes → Supply chain planning
- **Favorites**: Venues → Saved materials
- **Carbon calculator**: Direct relevance, expand for materials

### Build from Scratch
- **Business verification system**
- **Material transaction workflow**
- **Circular economy reporting**
- **Waste stream categorization UI**
- **Business dashboard with sustainability metrics**

## Quick Wins (First 24 Hours)
1. **Business registration wizard** (reuse AccessibilityProfileWizard)
2. **Material listing form** (simple CRUD with location picker)
3. **Browse materials page** (reuse BrowseVenuesPage with filters)
4. **Saved materials** (already migrated from favorite_venues)
5. **Basic carbon calculation** (reuse existing utilities)

## Database Schema (Already Implemented)

### Core Tables
1. `businesses` - Registered Irish SMEs with CRO numbers
2. `waste_streams` - 10 pre-populated material categories  
3. `materials` - Listings posted by businesses
4. `transactions` - Material exchanges with carbon tracking
5. `saved_materials` - User-saved materials (from favorite_venues)

### Key Relationships
- User → Business (one-to-one via business_profile_id)
- Business → Materials (one-to-many)
- Material → WasteStream (foreign key)
- Transaction → Material + Buyer/Seller businesses

## Next Immediate Actions
1. Create backend route skeletons
2. Create frontend component directories
3. Update App.tsx to include MiM Town routes
4. Test database connectivity with new schema
5. Build BusinessProfileWizard component