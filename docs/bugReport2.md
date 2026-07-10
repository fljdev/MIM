# Critical Bug Report: Stage 3 Integration Failures

## Executive Summary
After 10+ hours of debugging, the system is in a broken state where:
1. **Jimmy (organizer)** can create meetups but cannot access the lobby
2. **Zak (joiner)** can log in but fails to save preferences due to database constraint violation
3. **Previously working features** (lobby, preferences, venue selection) now fail after multiple branch merges

## 🔧 Environment Details
- **OS**: WSL Ubuntu (accessed via `/mnt/d/MIM`)
- **Frontend**: React/TypeScript with ESLint warnings
- **Backend**: Node.js/Express with PostgreSQL
- **Database**: PostgreSQL with check constraint `meetups_status_check`

## 🚨 Critical Error: Joiner Preferences Save Failure

### Error Stack Trace
```
🔧 Environment: development
Error saving joiner preferences: error: new row for relation "meetups" violates check constraint "meetups_status_check"
    at /mnt/d/MIM/backend/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async /mnt/d/MIM/backend/routes/meetups.js:727:5 {
  length: 392,
  severity: 'ERROR',
  code: '23514',
  detail: 'Failing row contains (47, HV5MSR, 8, preferences_set, 2025-12-07 17:26:32.766171, 2025-12-08 17:26:32.855, food, €€, fastest, 45, f, pending, null, null, Jimmy, sdfdsd, null, null, null, null, null, null).',
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'meetups',
  column: undefined,
  dataType: undefined,
  constraint: 'meetups_status_check',
  file: 'execMain.c',
  line: '2033',
  routine: 'ExecConstraints'
}
```

### Root Cause Analysis
1. **Line 727 in `backend/routes/meetups.js`**: `UPDATE meetups SET status = 'preferences_set' WHERE id = $1`
2. **Constraint Violation**: The `meetups_status_check` constraint does not allow status value `'preferences_set'`
3. **Database State**: The failing row shows `status = 'pending'` but the UPDATE tries to set it to `'preferences_set'`
4. **Missing Status Value**: The check constraint likely only allows: `['pending', 'active', 'accepted', 'confirmed']` but not `'preferences_set'`

## 🛠️ New Authentication Flow
- **Requirement**: Users must be logged in to see the "Create Meetup" button
- **Implementation**: Frontend conditionally shows button based on auth state
- **Status**: This flow is working correctly

## ⚠️ Frontend Code Quality Issues

### ESLint Warnings
```
[eslint]
src/features/meetup/pages/InvitationView.tsx
  Line 49:10:  'loadingMeetup' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

**Impact**: Minor code quality issue, does not affect functionality but indicates unused variable that should be removed.

## 📊 Historical Context
- **Yesterday**: All core functions (lobby, preferences, venue selection) were working
- **Today**: Multiple branch merges (`stage-3-integration`, `stage-2-frontend`, etc.) introduced regressions
- **Current State**: System is in "disarray" with previously working features now broken

## 🎯 Immediate Fixes Required

### 1. Database Constraint Fix
**Option A**: Alter the check constraint to include `'preferences_set'`
```sql
ALTER TABLE meetups DROP CONSTRAINT meetups_status_check;
ALTER TABLE meetups ADD CONSTRAINT meetups_status_check 
  CHECK (status IN ('pending', 'active', 'accepted', 'preferences_set', 'confirmed'));
```

**Option B**: Update backend to use an allowed status value (not recommended)

### 2. Lobby Access Fix for Jimmy
**Issue**: Frontend calls `/api/meetups/{code}/lobby` but backend provides `/api/meetup/{code}/lobby` (singular vs plural)

**Fix**: Update frontend `MeetupLobby.tsx` to use correct endpoint:
```typescript
// Change from:
const response = await fetch(`${API_BASE_URL}/api/meetups/${code}/lobby`);
// To:
const response = await fetch(`${API_BASE_URL}/api/meetup/${code}/lobby`);
```

### 3. Clean Up ESLint Warnings
Remove unused variable `loadingMeetup` from `InvitationView.tsx` line 49.

## 📋 Files Requiring Immediate Attention

### Backend
1. `backend/routes/meetups.js` - Line 727: Status update logic
2. Database: `meetups_status_check` constraint definition

### Frontend
1. `frontend/src/features/meetup/pages/MeetupLobby.tsx` - Incorrect API path
2. `frontend/src/features/meetup/pages/InvitationView.tsx` - Unused variable
3. `frontend/src/features/meetup/pages/JoinerPreferences.tsx` - Dependent on fix

## 🚀 Recommended Action Plan

### Priority 1 (Tonight/Tomorrow Morning)
1. **Fix database constraint** - Allow `'preferences_set'` status
2. **Test joiner preferences flow** - Verify Zak can save preferences
3. **Fix lobby endpoint path** - Enable Jimmy to access lobby

### Priority 2 (Follow-up)
1. **Clean up ESLint warnings**
2. **Add comprehensive logging** to catch constraint violations earlier
3. **Create database migration** to standardize status values across all environments

## 📝 Notes for Claude/Claude Code
- **Branch**: `stage-3-integration` (commit a364459)
- **Key Issue**: Database constraint mismatch with application logic
- **Testing Strategy**: 
  1. Jimmy creates meetup → shares link
  2. Zak logs in via incognito → accepts invitation → sets preferences
  3. Both users access lobby → confirm venue
- **Environment**: WSL Ubuntu, PostgreSQL may need restart if migration fails

## 🔍 Additional Investigation Needed
1. **Other check constraints** on `meetups` table that may cause similar issues
2. **Path inconsistencies** between `/api/meetup` and `/api/meetups` endpoints
3. **Database migration history** to understand when constraint was added

---
**Report Generated**: 2025-12-07 19:01 UTC  
**For**: Tomorrow's debugging session with Claude/Claude Code  
**Goal**: Restore all previously working functionality
