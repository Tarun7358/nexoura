# 🏗️ Nexoura - Technical Architecture & Integration Guide

## System Architecture

```
┌─────────────────────────────────────────┐
│     Mobile Browser (React App)          │
│  - SPA (Single Page Application)        │
│  - Client-side Routing                  │
│  - Mobile-Optimized UI                  │
└────────────┬────────────────────────────┘
             │
             ├──► React Router 7.13.0
             ├──► React 18.3.1 + React-DOM
             ├──► Vite 6.3.5 (Build)
             └──► CSS3 + Gradients
```

## Project Structure (Detailed)

```
frontend/
├── src/
│   ├── main.jsx                          # App Entry Point
│   │   └── Mounts React to #root div
│   │
│   ├── app/
│   │   ├── AppRouter.tsx                 # Main Router
│   │   │   └── Manages 21+ Routes
│   │   │   └── Conditional Rendering
│   │   │
│   │   ├── components/                   # Reusable Components
│   │   │   ├── NeonButton.tsx            # Gradient Button
│   │   │   ├── NeonCard.tsx              # Card Container
│   │   │   ├── TournamentCard.tsx        # Tournament UI
│   │   │   ├── LeaderboardTable.tsx      # Table Component
│   │   │   ├── TeamCard.tsx              # Team Display
│   │   │   ├── BottomNav.tsx             # Mobile Nav Bar
│   │   │   ├── GlassPanel.tsx            # Glass Effect
│   │   │   ├── NotificationBanner.tsx    # Alert Banner
│   │   │   ├── MatchLobby.tsx            # Match Lobby UI
│   │   │   ├── GlowButton.tsx            # Animated Button
│   │   │   └── index.ts                  # Barrel Export
│   │   │
│   │   ├── screens/                      # 21+ Screen Components
│   │   │   ├── Auth
│   │   │   │   ├── Splash.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Signup.tsx
│   │   │   ├── Main
│   │   │   │   ├── Home.tsx
│   │   │   │   └── Profile.tsx
│   │   │   ├── Tournaments
│   │   │   │   ├── TournamentList.tsx
│   │   │   │   ├── TournamentDetail.tsx
│   │   │   │   ├── CreateTournament.tsx
│   │   │   │   └── ManageMatches.tsx
│   │   │   ├── Scrims
│   │   │   │   ├── ScrimsLobby.tsx
│   │   │   │   └── ScrimDetail.tsx
│   │   │   ├── Teams
│   │   │   │   ├── TeamManagement.tsx
│   │   │   │   ├── CreateTeam.tsx
│   │   │   │   └── TeamDetail.tsx
│   │   │   ├── Leaderboard
│   │   │   │   └── Leaderboard.tsx
│   │   │   ├── Admin
│   │   │   │   └── AdminDashboard.tsx
│   │   │   ├── Misc
│   │   │   │   ├── Wallet.tsx
│   │   │   │   ├── Announcements.tsx
│   │   │   │   ├── Notifications.tsx
│   │   │   │   ├── MatchResult.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── index.ts                  # Barrel Export
│   │   │
│   │   └── styles/
│   │       └── ui-kit.css                # Global Styles
│   │           ├── CSS Variables
│   │           ├── Glassmorphism
│   │           ├── Neon Effects
│   │           └── Layout Classes
│   │
│   └── public/
│       ├── index.html                   # Main HTML
│       ├── manifest.json                # PWA Manifest
│       ├── favicon.ico
│       └── ...other assets
│
├── index.html                            # Vite Entry HTML
├── vite.config.ts                        # Vite Config
├── package.json                          # Dependencies
├── postcss.config.mjs                    # PostCSS Config
├── tailwind.config.js                    # Tailwind Config
│
├── NEXOURA_README.md                     # Full Documentation
├── NEXOURA_COMPLETE.md                   # Implementation Summary
├── FEATURES_CHECKLIST.md                 # Feature List
└── dist/                                 # Production Build
    ├── index.html
    ├── assets/
    │   ├── index-*.css
    │   └── index-*.js
    └── ...
```

## Technology Stack

### Frontend Framework
- **React 18.3.1**
  - Hooks-based architecture
  - Functional components only
  - No class components

- **React Router 7.13.0**
  - Client-side routing
  - Nested routes (not implemented but possible)
  - Dynamic route params
  - Route guards (ready for implementation)

### Build & Dev Tools
- **Vite 6.3.5**
  - ES modules
  - Fast HMR (Hot Module Replacement)
  - Optimized production build
  - CSS preprocessing with PostCSS

- **@vitejs/plugin-react 4.7.0**
  - React JSX transform
  - Fast refresh

### Styling
- **CSS3**
  - Custom properties (variables)
  - Gradients (linear, radial)
  - Backdrop filter (glassmorphism)
  - Flexbox & CSS Grid
  - Transitions & animations

- **Tailwind CSS 4.1.12** (preprocessed)
  - Utility classes
  - Responsive design
  - Plugin support

- **PostCSS 8.x**
  - CSS transformation
  - Vendor prefixing (autoprefixer)

### Component Libraries
- **Lucide React 0.487.0**
  - Optimized SVG icons
  - 487+ icons
  - Tree-shakeable

- **Motion / Framer Motion 12.23.24**
  - Smooth animations
  - Gesture animations
  - Page transitions

### HTTP Client
- **Axios 1.13.6**
  - Promise-based
  - Request/response interceptors
  - Error handling

### UI Libraries (Pre-installed but Optional)
- **@mui/material 7.3.5**
- **Radix UI (Multiple Components)**
- **React Hook Form 7.55.0**
- **Sonner 2.0.3** (Toast notifications)

---

## State Management Architecture

### Current Implementation
- **Local Component State** via `React.useState()`
- **No global state library**

### Recommended for Scale-up
```javascript
// Option 1: Zustand (Lightweight)
import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Option 2: Redux Toolkit (Enterprise)
import { createSlice, configureStore } from '@reduxjs/toolkit';

// Option 3: Context API (No external library)
const AuthContext = React.createContext();
```

---

## Routing Architecture

### Main Router (`src/app/AppRouter.tsx`)

```typescript
<BrowserRouter>
  <Routes>
    {!isLoggedIn ? (
      <>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </>
    ) : (
      <>
        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<TournamentList />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        {/* ... 18 more routes */}
      </>
    )}
  </Routes>
</BrowserRouter>
```

### Route Groups

| Group | Routes | Count |
|-------|--------|-------|
| Auth | /, /login, /signup | 3 |
| Home | /, /profile, /announcements, /notifications | 4 |
| Tournaments | /tournaments, /tournaments/:id, /admin/tournament/create | 3 |
| Scrims | /scrims, /scrims/:id | 2 |
| Teams | /teams, /teams/create, /teams/:id | 3 |
| Admin | /admin, /admin/matches | 2 |
| Misc | /leaderboard, /wallet, /settings, /match-result | 4 |
| **Total** | | **21** |

---

## Component Hierarchy

### App Root
```
AppRouter (React Router wrapper)
├── Splash Screen
├── Login Screen
├── Signup Screen
└── Dashboard (if logged in)
    ├── Home Screen
    │   ├── Bottom Nav
    │   ├── Notification Banner
    │   ├── Tournament Cards
    │   └── Scrim Cards
    ├── Tournament Details
    │   └── Tournament Card
    ├── Leaderboard
    │   └── Leaderboard Table
    ├── Profile
    │   ├── Profile Avatar
    │   └── Stats Cards
    └── ... (18 more screens)
```

---

## Data Flow Architecture

### Current (Component State)
```
User Interaction
    ↓
Component Handler
    ↓
useState Update
    ↓
Component Re-render
    ↓
UI Update
```

### Recommended with Backend API
```
User Interaction
    ↓
Component Handler
    ↓
API Call (Axios)
    ↓
Backend Processing
    ↓
Response Received
    ↓
State Update (Zustand/Redux)
    ↓
Component Re-render
    ↓
UI Update
```

---

## Backend Integration Guide

### 1. Setup API Client

Create `src/app/api/client.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Create API Services

Create `src/app/api/tournaments.ts`:
```typescript
import { apiClient } from './client';

export const tournamentAPI = {
  list: () => apiClient.get('/tournaments'),
  detail: (id: string) => apiClient.get(`/tournaments/${id}`),
  join: (id: string) => apiClient.post(`/tournaments/${id}/join`),
  create: (data: any) => apiClient.post('/tournaments', data),
};
```

### 3. Use in Components

```typescript
import { useEffect, useState } from 'react';
import { tournamentAPI } from '../api/tournaments';

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tournamentAPI.list()
      .then((res) => setTournaments(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {tournaments.map((t) => (
        <TournamentCard key={t.id} t={t} />
      ))}
    </div>
  );
}
```

---

## Authentication Flow

### Login Implementation

```typescript
// src/app/screens/Login.tsx
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <NeonButton onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </NeonButton>
    </div>
  );
}
```

---

## Performance Optimization

### Current
- ✅ Vite code splitting
- ✅ CSS minification
- ✅ React fast refresh
- ✅ Tree-shaking enabled

### Recommended
- [ ] Implement lazy loading for screens
- [ ] Add React.memo for component optimization
- [ ] Use useMemo/useCallback for expensive operations
- [ ] Implement image optimization
- [ ] Add service worker for offline support

### Example: Lazy Loading Screens
```typescript
import { lazy, Suspense } from 'react';

const TournamentList = lazy(() => import('./screens/TournamentList'));

<Suspense fallback={<Loading />}>
  <Route path="/tournaments" element={<TournamentList />} />
</Suspense>
```

---

## Environment Configuration

### .env.local (Create this file)
```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Nexoura
VITE_DEBUG=false
```

### Access in Code
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

---

## Error Handling Strategy

### Global Error Handler
```typescript
// src/app/api/errorHandler.ts
export const handleError = (error: any) => {
  if (error.response?.status === 401) {
    // Logout user
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  } else if (error.response?.status === 404) {
    console.error('Resource not found');
  } else {
    console.error('API Error:', error.message);
  }
};
```

---

## Testing Setup (Optional)

### Install Testing Libraries
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import NeonButton from '../NeonButton';

describe('NeonButton', () => {
  it('renders correctly', () => {
    render(<NeonButton>Click me</NeonButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## Deployment Checklist

- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Authentication working
- [ ] Error handling tested
- [ ] Performance checked
- [ ] Mobile tested on real device
- [ ] Build optimized
- [ ] No console errors
- [ ] No console warnings
- [ ] Analytics configured

---

## Security Considerations

### Current
- ✅ No hardcoded secrets
- ✅ Uses localStorage for tokens (for demo)

### Recommended
- [ ] Move to Secure httpOnly cookies
- [ ] Implement CSRF protection
- [ ] Add Content Security Policy
- [ ] Validate user input
- [ ] Sanitize API responses
- [ ] Implement rate limiting
- [ ] Add request signing

---

## Monitoring & Analytics (Optional)

### Add Sentry for Error Tracking
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build & Deploy

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Recommended Next Steps

1. **Backend Setup**
   - [ ] Create API server (Node/Express, Django, etc.)
   - [ ] Setup database (MongoDB, PostgreSQL)
   - [ ] Implement authentication
   - [ ] Create API endpoints

2. **State Management**
   - [ ] Implement Zustand or Redux
   - [ ] Create global auth store
   - [ ] Add thunks for API calls

3. **Testing**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] E2E tests with Cypress

4. **PWA**
   - [ ] Add service worker
   - [ ] Implement offline support
   - [ ] Add install prompt

5. **Analytics**
   - [ ] Setup Google Analytics
   - [ ] Track user behavior
   - [ ] Monitor performance

---

## Support Resources

- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **React Router Docs:** https://reactrouter.com
- **Tailwind Docs:** https://tailwindcss.com
- **Axios Docs:** https://axios-http.com

---

**Version:** 1.0.0
**Last Updated:** March 4, 2026
**Status:** ✅ Production Ready for Backend Integration
