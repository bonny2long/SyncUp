# Supabase Authentication Implementation Plan

## Overview
Replace current localStorage-based auth with Supabase Auth for production-ready security.

---

## Phase 1: Supabase Setup

### 1.1 Configure Supabase Project
- [ ] Create Supabase project at supabase.com
- [ ] Enable Authentication provider (Email/Password)
- [ ] Configure auth settings:
  - Site URL: `https://your-domain.com`
  - Redirect URLs: `https://your-domain.com/auth/callback`
  - Enable email confirmations

### 1.2 Environment Variables
Add to `server/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

Add to `client/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Phase 2: Client Changes

### 2.1 Install Supabase JS
```bash
cd client
npm install @supabase/supabase-js
```

### 2.2 Create Supabase Client
Create `client/src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2.3 Update UserContext
Modify `client/src/context/UserContext.jsx`:

```javascript
import { supabase } from '../lib/supabase';

// Replace login function:
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  // Fetch user profile from your API
  const user = {
    id: data.user.id,
    email: data.user.email,
    role: data.user.user_metadata?.role || 'user',
    ...data.user.user_metadata
  };
  
  localStorage.setItem('syncup_user', JSON.stringify(user));
  setUser(user);
};

// Add session handling:
useEffect(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      // Update user context
    } else {
      logout();
    }
  });
}, []);
```

### 2.4 Create Login Page
Create `client/src/pages/Auth/Login.jsx`:
- Use Supabase auth UI or custom form
- Call `supabase.auth.signInWithPassword()`
- Handle OAuth providers (GitHub, Google)

### 2.5 Update API Calls
All API calls must include Supabase token:

```javascript
// In api.js - replace getUserHeaders()
async function getSupabaseHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'x-user': session ? JSON.stringify({
      id: session.user.id,
      email: session.user.email
    }) : null
  };
}
```

---

## Phase 3: Server Changes

### 3.1 Install Dependencies
```bash
cd server
npm install @supabase/supabase-js jsonwebtoken
```

### 3.2 Add Auth Middleware
Create `server/src/middleware/auth.js`:

```javascript
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Optional: Role-based middleware
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 3.3 Protect Routes
Update routes to use auth middleware:

```javascript
// Example: usersRoutes.js
import { verifyToken, requireRole } from '../middleware/auth.js';

router.get('/:userId/profile', verifyToken, userValidators.getProfile, getUserProfile);
router.put('/:userId/profile', verifyToken, updateUserProfile);
router.delete('/:userId', verifyToken, requireRole('admin'), deleteUser);
```

### 3.4 Remove Old Auth Logic
- Delete `x-user` header parsing from `server.js`
- Remove client-side localStorage user creation

---

## Phase 4: Database Schema

### 4.1 User Table Mapping
Your existing `users` table maps to Supabase `auth.users`:

```sql
-- Add Supabase user ID as primary key
ALTER TABLE users ADD COLUMN supabase_id UUID UNIQUE;

-- Populate from existing users (if any)
UPDATE users SET supabase_id = gen_random_uuid() WHERE supabase_id IS NULL;
```

### 4.2 Row Level Security (Optional)
If using Supabase Database:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = supabase_id);
```

---

## Phase 5: OAuth Providers (Optional)

### 5.1 GitHub OAuth
1. Create GitHub OAuth App
2. Add credentials to Supabase Dashboard
3. Enable in Authentication > Providers

### 5.2 Usage
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://your-app.com/auth/callback'
  }
});
```

---

## Phase 6: Security Hardening

### 6.1 Token Management
- [ ] Access tokens: 1 hour expiry
- [ ] Refresh tokens: 30 day expiry  
- [ ] Store refresh token securely (httpOnly cookies)

### 6.2 Server-Side Validation
- [ ] Verify user exists in your `users` table
- [ ] Check user role permissions
- [ ] Log auth events

### 6.3 Production Checklist
- [ ] Enable SSL/HTTPS
- [ ] Configure CORS properly
- [ ] Add rate limiting on auth endpoints
- [ ] Set up auth webhooks for sync

---

## Migration Strategy

1. **Parallel Auth** - Run Supabase auth alongside existing (gradual)
2. **New Users First** - New users use Supabase, existing migrate on login
3. **Big Bang** - Migrate all at once (requires user re-authentication)

---

## Testing Checklist

- [ ] Email/password login works
- [ ] OAuth (GitHub/Google) login works  
- [ ] Token refresh works
- [ ] Logout clears session
- [ ] Protected routes reject unauthenticated requests
- [ ] Role-based access works
- [ ] Password reset works

---

## Rollback Plan

Keep old auth code commented for 30 days:
- Old `UserContext.jsx` → `UserContext.old.jsx`
- Old auth middleware → `middleware/auth.old.js`

---

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/start)
- [Auth Helpers for Next.js](https://github.com/supabase/auth-helpers)
