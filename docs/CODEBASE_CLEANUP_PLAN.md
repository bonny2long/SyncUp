# SyncUp Codebase Cleanup Plan

**Created:** 2026-05-04  
**Purpose:** Remove unused code, dead files, and unused dependencies from SyncUp codebase after Auth Revamp + Brand Implementation completion.

---

## Executive Summary

After thorough exploration of both client and server directories, the codebase is well-structured but contains some remnants from before the auth revamp and unused functionality. This plan identifies what can be safely removed without breaking anything.

---

## 1. CLIENT-SIDE CLEANUP

### 1.1 Unused Files (Safe to Delete)

| File Path | Evidence | Action |
|-----------|----------|--------|
| `client/src/hooks/useErrorHandler.js` | Hook exported but never imported anywhere in codebase | **DELETE** |
| `client/src/pages/MentorshipBridge/shared/SessionChat.jsx` | File exists but no imports found from any other file | **DELETE** |
| `client/src/pages/MentorshipBridge/shared/SessionCard.jsx` | File exists but no imports found from any other file | **DELETE** |

### 1.2 Unused Exports in `utils/api.js` (12 functions)

These functions are exported but never imported anywhere:

| Function Name | Line in api.js | Action |
|---------------|----------------|--------|
| `fetchActiveProjectsAnalytics()` | 159 | Comment out or delete |
| `fetchWeeklyUpdatesAnalytics()` | 167 | Comment out or delete |
| `fetchMentorshipGrowthCorrelation()` | 187 | Comment out or delete |
| `fetchEffectivePairings()` | 196 | Comment out or delete |
| `fetchEngagementLoops()` | 205 | Comment out or delete |
| `getRecentSkills(userId)` | 454 | Comment out or delete |
| `fetchUserGovernance(userId)` | 1148 | Comment out or delete |
| `createChannel(name, description, userId, isPrivate)` | 782 | Comment out or delete |
| `joinChannel(channelId, userId)` | 797 | Comment out or delete |
| `deleteAvatar(userId)` | 1083 | Comment out or delete |
| `getSkillValidations(signalId)` | 650 | Comment out or delete |
| `attachProjectSkills(projectId, skillIds)` | 508 | Comment out or delete |

**Recommendation:** Comment out first, test build, then delete if no errors.

### 1.3 Unused Exports in Utility Files

| File | Export | Evidence | Action |
|------|--------|----------|--------|
| `utils/logger.js` | `logger` object | Only `reportToServer` is used; `logger` never imported | **Remove `logger` export** |
| `utils/errorHandler.js` | `ERROR_MESSAGES` | Never imported in any other file | **DELETE** |
| `utils/errorHandler.js` | `fetchWithTimeout()` | Never imported in any other file | **DELETE** |
| `utils/errorHandler.js` | `retryWithBackoff()` | Never imported in any other file | **DELETE** |

### 1.4 Duplicate ErrorBoundary

**File:** `client/src/components/shared/ErrorBoundary.jsx`

- Contains default export `ErrorBoundary` AND named export `ChartError`
- `ChartError` is imported by UserProfile, ProjectPortfolio, etc.
- The default `ErrorBoundary` export appears unused (App.jsx uses `components/ErrorBoundary.jsx`)

**Action:** Remove default `ErrorBoundary` export from this file, keep `ChartError` export.

---

## 2. SERVER-SIDE CLEANUP

### 2.1 Unused Files (Safe to Delete)

| File Path | Evidence | Action |
|-----------|----------|--------|
| `server/src/services/authService_fixed.js` | Never imported; duplicate of `authService.js` which IS used | **DELETE** |
| `server/src/middleware/auth.js` | Never imported by any route or server.js; old auth middleware | **DELETE** |

### 2.2 Unused npm Packages (Server)

| Package | Evidence | Action |
|---------|----------|--------|
| `axios` | No imports found in any server files | **`npm uninstall axios`** |
| `mssql` | Code in server.js lines 25, 182-191 is COMMENTED OUT; project uses `mysql2` | **`npm uninstall mssql`** |

### 2.3 Standalone Scripts (Review Before Deleting)

| File | Purpose | Recommendation |
|------|---------|----------------|
| `server/src/debug_users.js` | Personal debug script | **DELETE** if not needed |
| `server/src/debug_skills.js` | Personal debug script | **DELETE** if not needed |
| `server/src/scripts/runMigration.js` | DB migration script | **KEEP** — useful for maintenance |
| `server/src/scripts/seed.js` | DB seed script | **KEEP** — useful for testing |
| `server/src/scripts/add_indexes.js` | Add DB indexes | **KEEP** — useful for maintenance |
| `server/src/scripts/query_performance_test.js` | Performance testing | **KEEP** if used |
| `server/src/scripts/create_skill_validations.js` | Create validations | **KEEP** if used |

### 2.4 SQL Files in `database/` (Archive, Don't Delete)

These are schema documentation/migration records:

| File | Status | Action |
|------|--------|--------|
| `auth_revamp.sql` | Already executed | Move to `database/archive/` |
| `run_auth_migration.js` | Already run | Move to `database/archive/` |
| `init_maintenance.sql` | Not used by JS code | Move to `database/archive/` |

**Action:** Create `database/archive/` folder and move executed SQL files there.

---

## 3. FILES THAT ARE USED (Verified Active)

✅ **Client:**
- All controllers — imported by routes  
- All routes — registered in server.js  
- `authService.js` — used by authController.js, invitationController.js  
- `notificationService.js` — used by multiple controllers  
- `UserContext.jsx` — used by 30+ files  
- `ErrorBoundary.jsx` (components/) — used by App.jsx  
- All dynamic imports in App.jsx — verified correct  
- All routes in App.jsx — have corresponding components  

✅ **Server:**
- All controllers — imported by route files ✓
- All routes — registered in server.js ✓
- `config/db.js` — used by most files ✓
- `config/rateLimit.js` — used in server.js ✓
- `config/swagger.js` — used in server.js ✓
- `middleware/maintenanceMode.js` — used in server.js ✓
- `validators/index.js` — used by route files ✓

---

## 4. EXECUTION ORDER (Safe Removal)

```
Step 1: Delete unused client files
rm client/src/hooks/useErrorHandler.js
rm client/src/pages/MentorshipBridge/shared/SessionChat.jsx
rm client/src/pages/MentorshipBridge/shared/SessionCard.jsx

Step 2: Clean unused exports from utils/api.js
- Comment out or remove 12 unused functions
- Test build afterwards: cd client && npm run build

Step 3: Clean utils/logger.js and utils/errorHandler.js
- Remove unused exports
- Keep functions that ARE used

Step 4: Fix duplicate ErrorBoundary
- Remove default ErrorBoundary export from shared/ErrorBoundary.jsx
- Keep ChartError export

Step 5: Delete unused server files
rm server/src/services/authService_fixed.js
rm server/src/middleware/auth.js

Step 6: Uninstall unused npm packages
cd server && npm uninstall axios mssql

Step 7: Archive old SQL files
mkdir server/src/database/archive/
mv server/src/database/auth_revamp.sql server/src/database/archive/
mv server/src/database/run_auth_migration.js server/src/database/archive/
mv server/src/config/init_maintenance.sql server/src/database/archive/

Step 8: Verify builds
cd client && npm run build
cd server && npm start
```

---

## 5. VERIFICATION CHECKLIST

After cleanup, verify:

- [ ] Client builds without errors: `cd client && npm run build`
- [ ] Server starts without errors: `cd server && npm start`
- [ ] All routes work (login, register, chat, admin, etc.)
- [ ] No console errors in browser
- [ ] All auth flows still work (login, register, verification, password reset)
- [ ] Admin dashboard accessible
- [ ] SyncChat, Member Directory, Opportunities, Mentorship Bridge all functional

---

## 6. RULES FOR FUTURE DEVELOPMENT

1. **Delete unused files immediately** — don't let dead code accumulate
2. **Use ESLint `no-unused-exports` rule** to catch unused exports automatically
3. **Consider consolidating** the two `ErrorBoundary.jsx` files into one
4. **Add a `scripts/` vs `src/` convention** — keep standalone scripts separate from main code
5. **Use tools like `knip`** to automatically detect unused exports

---

*Plan created: 2026-05-04*  
*Based on thorough codebase exploration of SyncUp project*  
*Next: Execute cleanup → Receive next steps MD file from user*
