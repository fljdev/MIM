# Bug Report: Stage 3 Integration Issues

## Overview
After 10 hours of debugging, two critical bugs have been identified in the stage-3-integration branch:
1. **Zak's preferences save failure** - When Zak logs in via incognito and attempts to save preferences, the request fails.
2. **Jimmy cannot get into the lobby** - The meetup organizer (Jimmy) is unable to access the lobby after creating a meetup.

## Root Cause Analysis

### 1. Missing Backend Endpoints
The frontend expects several API endpoints that do not exist in the backend:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/meetups/{shareableCode}/invitation` | GET | Fetch invitation details | ❌ Missing |
| `/api/meetups/{shareableCode}/accept` | POST | Accept invitation | ❌ Missing |
| `/api/meetups/{id}/joiner-preferences` | POST | Save joiner preferences | ❌ Missing |
| `/api/meetups/{code}/lobby` | GET | Fetch lobby data | ⚠️ Exists but path mismatch (see below) |
| `/api/meetups/{code}/comments` | POST | Add comment to lobby | ❌ Missing |
| `/api/meetups/{code}/confirm` | POST | Confirm venue selection | ⚠️ Exists but path mismatch |

### 2. Path Mismatch Issues
The backend mounts routes under different base paths:
- **Organizer-led meetups**: `/api/meetup` (singular)
- **Two-person meetups**: `/api/meetups` (plural)

Frontend components incorrectly use plural paths for endpoints that exist under singular paths:
- Lobby endpoint: Frontend calls `/api/meetups/{code}/lobby` but backend provides `/api/meetup/{code}/lobby`
- Confirm endpoint: Frontend calls `/api/meetups/{code}/confirm` but backend provides `/api/meetup/{code}/confirm`

### 3. Database Schema Concerns
- The `meetups` and `meetup_participants` tables may not exist in the local database (migration failed due to PostgreSQL not running).
- However, remote database (Railway) likely has these tables since other endpoints work.

### 4. Authentication Flow Issues
- The invitation acceptance flow requires authentication, but the `accept` endpoint is missing.
- The joiner preferences endpoint requires authentication but doesn't exist.

## Technical Details

### Frontend Components Affected
1. **InvitationView.tsx** - Calls missing `/invitation` and `/accept` endpoints
2. **JoinerPreferences.tsx** - Calls missing `/joiner-preferences` endpoint
3. **MeetupLobby.tsx** - Uses incorrect path for lobby endpoint (`/api/meetups/{code}/lobby` instead of `/api/meetup/{code}/lobby`)

### Backend Route Analysis
- **Existing routes** (in `backend/routes/meetupOrganized.js`):
  - `GET /api/meetup/:code/lobby`
  - `POST /api/meetup/:code/calculate`
  - `POST /api/meetup/:code/confirm`
  - `GET /api/meetup/:code/results`
  - `GET /api/meetup/:code/confirmed`
- **Missing routes** needed for stage-3:
  - Invitation management endpoints
  - Joiner preferences endpoint
  - Comments endpoint

## Reproduction Steps

### Bug 1: Zak's Preferences Save Failure
1. Jimmy creates a meetup using the organizer flow
2. Jimmy shares the meetup link with Zak
3. Zak opens link in incognito browser
4. Zak logs in (or creates account)
5. Zak attempts to set preferences
6. **FAILURE**: Network request to `/api/meetups/{id}/joiner-preferences` returns 404

### Bug 2: Jimmy Cannot Access Lobby
1. Jimmy creates a meetup
2. Jimmy tries to access the lobby
3. **FAILURE**: Network request to `/api/meetups/{code}/lobby` returns 404 (wrong path)

## Proposed Solutions

### Immediate Fixes (Quick Wins)
1. **Create missing endpoints** in `backend/routes/meetups.js`:
   - `GET /api/meetups/:code/invitation`
   - `POST /api/meetups/:code/accept`
   - `POST /api/meetups/:id/joiner-preferences`
   - `POST /api/meetups/:code/comments`

2. **Fix path mismatches**:
   - Option A: Update frontend to use `/api/meetup/{code}/lobby` and `/api/meetup/{code}/confirm`
   - Option B: Create proxy routes in backend that redirect from plural to singular

3. **Ensure database tables exist**:
   - Run migration script when PostgreSQL is available
   - Verify tables `meetups`, `meetup_participants`, `meetup_comments` exist

### Long-term Improvements
1. **Standardize API path convention** (choose singular or plural consistently)
2. **Add comprehensive error logging** to capture missing endpoint issues earlier
3. **Implement API contract testing** to ensure frontend/backend compatibility
4. **Create API documentation** with OpenAPI/Swagger

## Files Requiring Changes

### Backend
1. `backend/routes/meetups.js` - Add missing endpoints
2. `backend/server.js` - Potentially add route aliases for path consistency

### Frontend
1. `frontend/src/features/meetup/pages/MeetupLobby.tsx` - Update API paths
2. `frontend/src/features/meetup/pages/InvitationView.tsx` - Ensure endpoints exist
3. `frontend/src/features/meetup/pages/JoinerPreferences.tsx` - Ensure endpoint exists

## Next Steps
1. **Priority 1**: Implement missing endpoints to unblock Zak's preference saving
2. **Priority 2**: Fix lobby path mismatch to allow Jimmy access
3. **Priority 3**: Verify database schema and run migrations if needed
4. **Priority 4**: Add error handling and logging for better debugging

## Notes for Tomorrow's Developer
- The codebase is in a transitional state between two meetup flows (organizer-led vs two-person)
- Pay attention to path conventions: `/api/meetup` vs `/api/meetups`
- Check network requests in browser DevTools to identify 404 errors
- Consider using a more capable model (like Claude 3.5 Sonnet or Opus 4.5) for complex backend/frontend integration debugging

---
**Report Generated**: 2025-12-07 17:49 UTC  
**Branch**: stage-3-integration  
**Commit**: a364459ee54a24d9650380ea24ab63623d069b41  
**Environment**: Windows 11, Node.js, PostgreSQL (remote)
