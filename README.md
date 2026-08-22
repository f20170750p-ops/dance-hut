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

## 🏗️ Architecture & Backend Design

DanceHut follows a modern **Backend-as-a-Service (BaaS)** architecture using **React + Vite** on the frontend and **Supabase (PostgreSQL)** as the backend engine.

* **Client**: React 18 with TypeScript, Tailwind CSS, Lucide icons, and the Supabase JavaScript SDK.
* **Backend**: Supabase provides automated PostgREST APIs, GoTrue authentication, S3-compatible storage, and PostgreSQL Row-Level Security (RLS).
* **Business Logic & Concurrency**: Critical operations (e.g. seat booking and capacity checking) run as atomic PostgreSQL stored procedures (`book_event`) to guarantee ACID transactions and eliminate race conditions.
* **Evolution Path**: As payments (Razorpay/Stripe) and transactional messaging are added, the architecture seamlessly expands via **Supabase Edge Functions** without requiring a full backend rewrite.

📖 **Read the complete design doc**: [Architecture & Backend Strategy](docs/architecture.md)

---

## 📋 Problem Tracker & Immediate MVP Backlog

Identified feedback items and UI improvements scoped for the current MVP iteration:

| # | Item | Status | Scope / Action Plan |
|---|---|:---:|---|
| 1 | **Custom Email Sender on Signup** | 🟡 Queued | Configure custom SMTP provider in Supabase Auth to replace default Supabase sender email. |
| 2 | **Dynamic User Profile** | 🟢 Resolved | Replaced hardcoded *"Aria Kapoor"* with dynamic user profile (full name input during signup, Supabase profiles table sync, initials generation, and role tags). |
| 3 | **Google Maps Venue Redirection** | 🔴 In Progress | Add clickable Google Maps directions link for workshop venues across bookings list, calendar, and ticket modal. |
| 4 | **Clickable Profile Avatars** | 🟢 Resolved | Made top-left profile card, top-right avatar, and sidebar Preferences open an interactive Profile Modal with real-time editing of display name, role switcher, activity stats, and sign out. |
| 5 | **Interactive Location Pill** | 🟡 Queued | Make "Bengaluru" location selector clickable with active city info & "More cities coming soon". |
| 6 | **"Talk to our team" Support Action** | 🟡 Queued | Connect support card to direct email (`mailto:`) or WhatsApp support. |
| 7 | **"Your Space" Navigation & Realtime Messages** | 🟢 Resolved | Integrated Supabase Realtime messaging modal with conversation threads, prompt chips, direct workshop instructor inquiries, and connected Preferences to profile management. |
| 8 | **Discover Hero Section Refresh** | 🟢 Resolved | Rendered dynamic current date with live pulse, real-time class & spot metrics from Supabase, active contextual copy, and 1-click style filter shortcuts. |
| 9 | **Explore Studios Placement & Action** | 🟡 Queued | Improve button positioning and connect to a partner studio preview section. |

📖 **Read the full problem breakdown**: [MVP Problem Tracker & Backlog](docs/backlog.md)

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
├── docs/
│   ├── architecture.md      # Backend strategy & scaling design doc
│   └── backlog.md           # Problem tracker & MVP issues status
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

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture & Backend Strategy](docs/architecture.md) | Comprehensive overview of the BaaS design, security model (RLS/RPC), and scaling roadmap. |
| [Problem Tracker & Backlog](docs/backlog.md) | Granular breakdown of identified issues, fixes, and current status. |

---

## 🛠️ Scripts

- `npm run dev` — Start local Vite dev server
- `npm run typecheck` — Run TypeScript compiler check
- `npm run lint` — Lint code with ESLint
- `npm run build` — Build production bundle to `dist/`
- `npm run preview` — Preview production build locally

