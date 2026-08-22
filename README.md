# 🎵 DanceHut MVP - Status & Roadmap

> **Streamline Your Dance Workshop Discovery & Management**
> 
> DanceHut is an event management and workshop discovery platform connecting Dancers, Choreographers, and Dance Studios in Bengaluru (extensible to other cities).

---

## 🎯 Narrowed MVP Scope (Dancer Experience First)

To deliver a high-quality, fully functional product quickly, the MVP is focused on **delivering a seamless end-to-end Dancer experience**:

```
[Email/Pass Auth] ──▶ [Discover & Filter Workshops] ──▶ [Instant Booking] ──▶ [QR Code Ticket & Calendar Sync]
```

### ✅ What is In-Scope for MVP:
1. **Authentication & Session**:
   - Supabase email/password sign-up and sign-in.
   - User profile association with dynamic user details (name/email and role).
   - Session persistence and secure sign-out.
2. **Workshop Discovery & Search**:
   - Live events list loaded from Supabase.
   - Dynamic Discover hero with live session counts.
   - Real-time search and multi-criteria filters (date, dance style, location/neighbourhood).
3. **Booking & Ticketing Flow**:
   - Atomic bookings via Supabase stored procedure `book_event` (prevents overselling & duplicate bookings).
   - Instant booking confirmation with a real, scannable QR ticket.
   - Saved/bookmarked workshops per user.
4. **Workspace / My Space**:
   - **My Bookings tab**: View all upcoming confirmed workshops with complete venue & time details.
   - **Calendar view**: Monthly calendar highlighting booked sessions and available workshops.
   - **Saved tab**: Access bookmarked classes for quick booking.
5. **Core UI Polish**:
   - Interactive profile avatar with user details and sign out.
   - Working city/location selector pill.
   - Direct support access ("Talk to our team").
   - Responsive desktop and mobile layout.

---

## 📋 Problem Tracker & Immediate MVP Backlog

Identified bugs and UI improvements scoped for the current MVP iteration:

| # | Item | Status | Scope / Action Plan |
|---|---|:---:|---|
| 1 | **Dynamic User Profile** | 🟢 Resolved | Replaced hardcoded *"Aria Kapoor"* with dynamic user profile (full name input during signup, Supabase profiles table sync, initials generation, and role tags). |
| 2 | **Clickable Profile Avatars** | 🟢 Resolved | Made top-left profile card, top-right avatar, and sidebar Preferences open an interactive Profile Modal with real-time editing of display name, role switcher, activity stats, and sign out. |
| 3 | **Complete Booking Location Info** | 🔴 In Progress | Ensure studio name, neighbourhood, and full venue details appear consistently across bookings list, calendar, and ticket modal. |
| 4 | **Discover Hero Section Refresh** | 🔴 In Progress | Update hero row to show dynamic current date, live upcoming class count, and active copy. |
| 5 | **Interactive Location Pill** | 🟡 Queued | Make "Bengaluru" location selector clickable with active city info & "More cities coming soon". |
| 6 | **"Talk to our team" Support Action** | 🟡 Queued | Connect support card to direct email (`mailto:`) or WhatsApp support. |
| 7 | **Search & Filter Refinements** | 🟡 Queued | Ensure multi-filter combinations (date, style, location) sync cleanly with active event list. |

---

## 🚀 Future Scope (Post-MVP / Phase 2 & 3)

The following advanced features are intentionally kept out of the MVP to ensure focused and stable delivery:

### 🟡 **Phase 2: Choreographer & Studio Dashboards**
- **Choreographer Portal**:
  - Profile & portfolio showcase (bio, videos, experience).
  - Workshop proposal & slot booking at partner studios.
  - Workshop registrations list and commission tracking.
- **Studio Management Portal**:
  - Studio dashboard for listing and managing studio rooms.
  - Multi-step event creation and batch scheduling.
  - QR code ticket scanner for venue check-in & attendance marking.
  - Studio revenue, attendance, and popular style analytics.

### 🔵 **Phase 3: Communication, Social & Expansion**
- **"Your Space" Communication Tools**:
  - In-app direct messaging between dancers, choreographers, and studios.
  - User notification center for class updates, schedule changes, and reminders.
  - Granular user preferences (favourite dance styles, notification channels).
- **Studio Exploration Directory**:
  - Dedicated "Explore Studios" directory page with studio facilities, photos, and reviews.
- **Advanced Auth & Payments**:
  - Instagram OAuth & Phone OTP authentication.
  - Custom branded SMTP setup for confirmation/transactional emails.
  - Online payments via Stripe / Razorpay.
- **AI Features**:
  - Smart workshop recommendations and dancer matching.
  - Dynamic pricing and studio demand forecasting.

---

## 💻 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the root folder:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

### 3. Run Database Migrations
In your Supabase SQL Editor:
1. Run [supabase/schema.sql](supabase/schema.sql) (tables, RLS policies, `book_event` function).
2. Run [supabase/seed.sql](supabase/seed.sql) (demo Bengaluru dance workshops).

### 4. Start Development Server
```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 📁 Project Structure

```
dance-hut/
├── src/
│   ├── App.tsx              # Main UI & Navigation
│   ├── main.tsx             # React entry point
│   ├── index.css            # Tailwind + design tokens
│   └── services/
│       ├── auth.ts          # Supabase Auth methods
│       ├── bookings.ts      # Booking creation & query functions
│       ├── events.ts        # Events fetch & detail services
│       ├── savedEvents.ts   # Saved events persistence
│       └── supabase.ts      # Supabase client initialization
├── supabase/
│   ├── schema.sql           # Database schema, RLS, stored procedures
│   └── seed.sql             # Demo events data
├── .env.example             # Environment variable template
├── package.json             # Dependencies & scripts
└── vite.config.ts           # Vite build configuration
```

---

## 🛠️ Scripts

- `npm run dev` — Start local Vite dev server
- `npm run typecheck` — Run TypeScript compiler check
- `npm run lint` — Lint code with ESLint
- `npm run build` — Build production bundle to `dist/`
- `npm run preview` — Preview production build locally
