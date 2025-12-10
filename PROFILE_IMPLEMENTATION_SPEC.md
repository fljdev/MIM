# User Profile Dashboard - Implementation Specification

## Overview
Build a comprehensive user profile dashboard that allows users to manage saved locations, favorite venues, view meetup history, and update profile settings.

## Database Schema (✅ COMPLETED)
- `favorite_venues` - User's saved favorite venues
- `meetup_messages` - Persisted chat history  
- `saved_locations` - Personal addresses (home, work, etc) - **ALREADY EXISTS**
- Extended `users` table with profile fields

## Backend Implementation Needed

### 1. Profile Routes (`backend/routes/profile.js`)
**GET /api/profile** - Returns user's full profile
**PUT /api/profile** - Update profile fields

### 2. Favorite Venues Routes (`backend/routes/favoriteVenues.js`)
**GET /api/favorite-venues** - List all favorites
**POST /api/favorite-venues** - Add to favorites
**PUT /api/favorite-venues/:id** - Update notes
**DELETE /api/favorite-venues/:id** - Remove from favorites

### 3. Meetup History (extend `backend/routes/meetups.js`)
**GET /api/meetups/history?filter=all|active|past** - User's meetup history
**GET /api/meetups/:id/messages** - Chat history (paginated)

### 4. Socket.io Update (`backend/server.js`)
- Persist chat messages to `meetup_messages` table when received

## Frontend Implementation Needed

### 1. Profile Dashboard Page (`frontend/src/features/profile/pages/ProfileDashboard.tsx`)
Main page with sections:
- Profile Info (edit name, bio, avatar, default transit mode)
- Saved Locations (list with edit/delete)
- Favorite Venues (grid view)
- Meetup History (timeline)
- Settings (notifications)

### 2. Components
- `ProfileHeader.tsx` - Avatar, name, bio
- `SavedLocationsList.tsx` - Manage saved addresses
- `FavoriteVenueCard.tsx` - Venue with notes
- `MeetupHistoryItem.tsx` - Past meetup summary
- `ChatHistory.tsx` - Load past messages

### 3. Update Navigation
- After login → redirect to `/profile` instead of create meetup
- Add profile route to AppRouter

## Implementation Order
1. ✅ Database migration (DONE)
2. Backend API routes
3. Socket.io message persistence
4. Frontend ProfileDashboard page
5. Individual components
6. Routing updates
7. Test & deploy

## Notes
- Use JWT from AuthContext for auth
- Follow patterns from existing `savedLocations.js` and `meetups.js`
- Use Tailwind teal theme
- Mobile responsive
