# 🎮 Nexoura - Mobile Esports Management App

A modern, futuristic mobile esports platform where gamers and tournament organizers join scrims, participate in tournaments, manage teams, and track match results.

## 🎨 Design Features

- **Dark Theme UI** - Neon Blue, Purple, and Black color scheme
- **Futuristic Esports Aesthetic** - Sleek, gaming-inspired design
- **Glassmorphism Panels** - Modern frosted glass effect with blur
- **Neon Glowing Buttons** - Interactive gradient buttons with glow effects
- **Mobile-First Design** - Optimized for Android and iOS devices
- **Responsive Layout** - Adapts to all mobile screen sizes

## 📱 Included Screens (21+)

### Authentication
- **Splash Screen** - Animated Nexoura logo with tagline
- **Login** - Email/Phone login with Google OAuth
- **Signup** - Account creation flow

### Player Features
- **Home Dashboard** - Live scrims, tournaments, announcements, wallet balance
- **Tournament List** - Browse and filter tournaments by mode (Solo/Duo/Squad)
- **Tournament Detail** - Join tournament with entry fee and prize pool info
- **Scrims Lobby** - Match ID, password, participants, ready button
- **Scrim Detail** - Room info with participant list
- **Leaderboard** - Ranked player stats with top 3 trophy icons
- **Profile** - Player stats (matches, wins, K/D ratio, earnings)
- **Wallet** - Coin balance and transaction history
- **Match Result** - Post-match results and rewards
- **Announcements** - In-app announcements and updates
- **Notifications** - Real-time alerts and messages
- **Settings** - User preferences and account settings

### Team Management
- **My Teams** - View all user teams
- **Create Team** - Team setup with logo upload
- **Team Detail** - Team members and stats

### Admin Panel (Tournament Organizers)
- **Admin Dashboard** - Organizer feature hub
- **Create Tournament** - Setup new tournament
- **Manage Matches** - View, reschedule, and adjudicate matches
- **Announcements Management** - Post and manage announcements

## 🛠️ Tech Stack

- **Frontend Framework:** React 18.3.1
- **Build Tool:** Vite 6.3.5
- **Routing:** React Router 7.13.0
- **Styling:** CSS3 with Modern Features (Glassmorphism, Gradients, Animations)
- **State Management:** React Hooks
- **UI Components:** Custom Nexoura Component Library
- **Responsive Design:** Mobile-first CSS Grid and Flexbox

## 📦 UI Component Library

### Core Components
- `NeonButton` - Gradient neon buttons with glow effects
- `NeonCard` - Glassmorphism cards with borders
- `TournamentCard` - Tournament info cards with join action
- `LeaderboardTable` - Ranked player table with trophy icons
- `TeamCard` - Team info with member count
- `BottomNav` - Mobile navigation bar (Home, Tournaments, Teams, Leaderboard, Profile)
- `GlassPanel` - Frosted glass container
- `NotificationBanner` - Alert/notification display
- `MatchLobby` - Esports match lobby UI
- `GlowButton` - Animated button with glow effect

## 🚀 Quick Start

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
pnpm install
```

### Development Server

```bash
# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.jsx                 # App entry point
│   ├── app/
│   │   ├── AppRouter.tsx        # Main router configuration
│   │   ├── components/          # Reusable UI components
│   │   │   ├── NeonButton.tsx
│   │   │   ├── NeonCard.tsx
│   │   │   ├── TournamentCard.tsx
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── NotificationBanner.tsx
│   │   │   ├── MatchLobby.tsx
│   │   │   └── index.ts
│   │   ├── screens/             # All screen components
│   │   │   ├── Splash.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── TournamentList.tsx
│   │   │   ├── TournamentDetail.tsx
│   │   │   ├── ScrimsLobby.tsx
│   │   │   ├── ScrimDetail.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── TeamManagement.tsx
│   │   │   ├── CreateTeam.tsx
│   │   │   ├── TeamDetail.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CreateTournament.tsx
│   │   │   ├── ManageMatches.tsx
│   │   │   ├── Announcements.tsx
│   │   │   ├── Wallet.tsx
│   │   │   ├── MatchResult.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── ui-kit.css       # Global neon/glass styles
│   └── public/
│       ├── index.html           # HTML entry point
│       ├── favicon.ico
│       ├── manifest.json        # PWA manifest
│       └── ...
├── package.json
├── vite.config.ts
├── postcss.config.mjs
├── tailwind.config.js
└── README.md
```

## 🎨 Design System

### Color Palette
- **Background:** `#07060a` (Deep Black)
- **Neon Blue:** `#00d4ff` (Cyan)
- **Neon Purple:** `#9b59ff` (Vivid Purple)
- **Text Primary:** `#e6e6f0` (Light Gray)
- **Text Muted:** `rgba(230,230,240,0.6)` (Dimmed Gray)
- **Glass:** `rgba(255,255,255,0.04)` (Semi-transparent white)

### Typography
- **Font Family:** Inter, system-ui, -apple-system, 'Segoe UI', Roboto
- **Font Weight:** 600 (buttons), 700 (headings), 400 (body)

### Effects
- **Glassmorphism:** Backdrop blur with subtle borders
- **Neon Glow:** Drop shadows with neon colors
- **Gradients:** Linear gradients for buttons and backgrounds
- **Shadows:** Soft box-shadows for depth

## 🔄 Navigation

The app uses React Router for client-side routing:

```
/ → Splash Screen (if not logged in)
/login → Login page
/signup → Signup page
/ → Home (if logged in)
/tournaments → Tournament list
/tournaments/:id → Tournament detail
/scrims → Scrims lobby
/scrims/:id → Scrim detail
/leaderboard → Leaderboard
/teams → Team management
/teams/create → Create team
/teams/:id → Team detail
/profile → Player profile
/admin → Admin dashboard
/admin/tournament/create → Create tournament
/admin/matches → Manage matches
/wallet → Wallet/coins
/announcements → Announcements
/notifications → Notifications
/settings → Settings
/match-result → Match results
```

## 🛣️ Roadmap

- [ ] Backend API integration
- [ ] Real-time WebSocket support
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] In-app chat
- [ ] Video streaming integration
- [ ] Desktop responsive view
- [ ] Dark/Light theme toggle
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA) features

## 📝 License

Nexoura © 2026. All rights reserved.

## 🤝 Contributing

For feature requests or bug reports, please open an issue on the repository.

---

**Compete. Conquer. Connect.** 🎮⚡
