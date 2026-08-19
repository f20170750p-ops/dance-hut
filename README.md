# 🎵 DanceHut MVP - Status Report

> **Streamline Your Workshop Management**
> 
> DanceHut is a 3-party event management platform connecting Dancers, Choreographers, and Dance Studios in Bengaluru (extensible to other cities).

---

## 📋 Project Overview

DanceHut enables:
- **Users/Dancers**: Discover, book, and manage dance classes across multiple studios
- **Choreographers**: Manage their availability and book slots at studios
- **Auth**: Supabase email/password sign-up and sign-in (integrated); Instagram OAuth pending
- **Backend**: Supabase events, saved events, bookings, RLS policies, and atomic booking RPC integrated
- **Payment**: Stripe (planned)

- [x] Login prompts (Instagram & Phone - UI only)

### 2. **User/Dancer Dashboard**
- [x] Home screen with featured events
- [x] Event discovery/search (UI with local filter logic)
- [x] Event cards with details (title, time, location, price, available spots)
- [x] Event details modal
- [x] Booking flow
- [x] Booking confirmation with QR code ticket
- [x] "Saved events" functionality
- [x] My Bookings tab (shows upcoming booked events)
- [x] Calendar view of bookings
- [x] Sidebar navigation (Discover, Calendar, My Bookings, Saved)
- [x] Profile mini-view with user info
- [x] Toast notifications for booking confirmation
- [x] Mobile-responsive design

### 3. **UI/UX**
- [x] Colorful gradient design with brushstroke elements
- [x] Responsive layout (desktop & mobile)
- [x] Navigation hamburger menu
- [x] City/location selector
- [x] Filter panel UI (non-functional)
- [x] Top navigation bar with notifications

---

## ❌ Pending Features

### 🔴 **Critical (Blocking MVP)**

#### **1. Backend & Database**
- [x] Supabase setup and configuration
- [x] Initial database schema for:
- [x] Real event, saved-event, and booking persistence

#### **2. Authentication**
- [ ] Instagram OAuth integration
- [x] Email/password sign-up and sign-in
- [ ] Phone number authentication (OTP)
- [x] Session management
- [x] User state persistence
- [x] Initial profile RLS / role persistence

#### **3. Search & Filters**
- [ ] Working search across events
- [ ] Filter by date range
- [ ] Filter by dance style
- [ ] Filter by location/neighborhood
- [ ] Filter by experience level

#### **4. Booking System**
- [x] Save bookings to database
- [x] Retrieve user's bookings
- [ ] Booking cancellation
- [ ] Booking confirmation emails
- [ ] Payment integration (Stripe/Razorpay)

#### **5. QR Code Generation**
- [x] QR code generation for booking tickets
- [ ] QR code scanning at venue (admin feature)
- [ ] Attendance marking via QR code

---

### 🟡 **Choreographer Dashboard (Complete Missing)**
- [ ] Dashboard layout and navigation
- [ ] Explore feature (search studios and opportunities)
- [ ] Management: Calendar view of workshops
- [ ] Availability: Submit time slots to studios
- [ ] Transparency: View contracts and registrations
- [ ] Direct messaging with studios
- [ ] Commission/payment tracking

---

### 🟡 **Studio Dashboard (Complete Missing)**
- [ ] Admin login system
- [ ] Employee login system
- [ ] Event creation form (multi-step)
- [ ] Event management calendar
- [ ] Event search with filters (Past/Ongoing/Upcoming)
- [ ] Attendance: Registered student list per workshop
- [ ] Attendance marking (scan QR codes)
- [ ] Event promotions and marketing tools
- [ ] Notification system for event changes
- [ ] Analytics dashboard:
  - Revenue analytics
  - Visitor insights
  - Popular dance styles
  - Popular choreographers
  - Attendance comparison
  - Customer metrics

---

### 🟠 **Feature-Specific Items**

#### **Notifications & Reminders**
- [ ] Push notifications for upcoming classes
- [ ] Event modification alerts
- [ ] Cancellation notifications
- [ ] Payment receipts
- [ ] Booking reminders (24hr, 1hr before)

#### **User Features**
- [ ] Edit profile/preferences
- [ ] Save favorite choreographers
- [ ] Follow studios
- [ ] Wishlist management
- [ ] Booking history
- [ ] Reviews and ratings
- [ ] Referral system

#### **Choreographer Features**
- [ ] Profile creation and management
- [ ] Portfolio/bio
- [ ] Schedule management
- [ ] Earnings tracking
- [ ] Reviews from users
- [ ] Direct messaging

#### **Studio Features**
- [ ] Studio profile management
- [ ] Promotions and discounts
- [ ] Bulk event creation
- [ ] Batch registration/enrollment
- [ ] Revenue reports
- [ ] Customer segmentation
- [ ] Refund management

#### **AI & Smart Features**
- [ ] AI-powered event recommendations for users
- [ ] Smart scheduling suggestions for choreographers
- [ ] Dynamic pricing suggestions
- [ ] Demand forecasting

---

## 🚀 Quick Start

### **Local Development**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# App runs at http://localhost:5173
```

### **Mobile Testing**

#### Option 1: Local Network
```bash
# Get your PC IP address
ipconfig  # Windows

# Run with --host flag
npm run dev -- --host

# On phone (same WiFi):
# http://<YOUR_PC_IP>:5173
```

#### Option 2: Using ngrok (Remote Access)
```bash
# Install ngrok from https://ngrok.com
ngrok http 5173

# Use the provided URL on any device
```

### **Code Quality**
```bash
npm run lint          # Run ESLint
npm run typecheck     # Check TypeScript types
npm run build         # Production build
npm run preview       # Preview production build
```

### Supabase Dancer Flow Setup

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor. It creates or updates the `profiles`, `events`, `saved_events`, and `bookings` tables, RLS policies, and the atomic `book_event` function. Then run [supabase/seed.sql](supabase/seed.sql) to add the MVP demo events.

After authentication, the app loads events and saved events from Supabase. Bookings are created through `book_event`, which prevents duplicate bookings and overselling. Each confirmed booking displays a real QR code containing a booking reference.

The seed file adds six upcoming Bengaluru events, including one sold-out event for testing. It is safe to run repeatedly because events are matched by title and date. The app shows loading, error, and empty states when appropriate.

The app requires these local variables in `.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

---

## 📁 Project Structure

```
dance-hut/
├── src/
│   ├── App.tsx              # Main app with role selection & navigation
│   ├── main.tsx             # Entry point
│   ├── index.css            # Tailwind + custom styles
│   └── vite-env.d.ts        # Vite type definitions
├── supabase/
│   └── schema.sql           # Initial tables and RLS policies
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── eslint.config.js         # ESLint rules
```

---

## 🔄 Current Data Structure

Events are loaded from the Supabase `events` table through [src/services/events.ts](src/services/events.ts). Bookings and saved events are loaded per authenticated user through [src/services/bookings.ts](src/services/bookings.ts) and [src/services/savedEvents.ts](src/services/savedEvents.ts).

```typescript
const events: EventItem[] = [
  { 
    id: 1, 
    title: 'Sunday Groove Lab', 
    style: 'Hip-hop', 
    date: 'Sun, 18 Aug', 
    time: '5:30 PM', 
    location: 'Koramangala', 
    studio: 'The Movement House', 
    host: 'Maya Joseph', 
    price: '₹850', 
    spots: 8, 
    image: '...',
    featured: true 
  },
  // ... more events
]
```

The database schema and RLS policies are defined in [supabase/schema.sql](supabase/schema.sql).

---

## 📊 Implementation Progress

| Component | Status | Notes |
|-----------|--------|-------|
| User Dashboard | ✅ 90% | Missing: real data, notifications |
| Choreographer Dashboard | ❌ 0% | Not started |
| Studio Dashboard | ❌ 0% | Not started |
| Authentication | ❌ 0% | UI exists, logic missing |
| Database | ❌ 0% | Not set up |
| Search/Filters | ⚠️ 20% | UI exists, filters don't work |
| Bookings | ⚠️ 30% | Flow works, not persisted |
| Payments | ❌ 0% | Not started |
| QR Codes | ❌ 0% | Not started |
| Analytics | ❌ 0% | UI designed, no backend |
| Notifications | ❌ 0% | Not started |

---

## 🎯 Recommended Implementation Order

### **Phase 1: Backend Foundation** (Week 1)
1. Set up Supabase project and database schema
2. Implement phone + Instagram authentication
3. Create events table and basic API
4. Connect app to real events data

### **Phase 2: Core Dashboards** (Week 2-3)
1. Build Choreographer dashboard
2. Build Studio dashboard (MVP version)
3. Implement booking save/retrieval
4. QR code generation

### **Phase 3: Features & Polish** (Week 4)
1. Working search and filters
2. Notifications system
3. Basic analytics for studios
4. Payment integration

### **Phase 4: Scale** (Post-MVP)
1. AI recommendations
2. Advanced analytics
3. Referral system
4. Mobile app version

---

## 🔧 Known Issues & TODOs

### Code
- [ ] Refactor App.tsx (too large, needs component splitting)
- [ ] Move hardcoded events to context/state management
- [ ] Add TypeScript interfaces for API responses
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add proper error handling

### UX
- [ ] Add loading skeletons for image-heavy components
- [ ] Add animations for smoother transitions
- [ ] Improve mobile layout for larger screens
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

### Security
- [ ] Implement row-level security (RLS) in Supabase
- [ ] Secure API keys
- [ ] Validate all inputs server-side
- [ ] Rate limiting for APIs

---

## 📦 Dependencies

### Production
- `react` (18.3.1) - UI framework
- `react-dom` (18.3.1) - DOM rendering
- `lucide-react` (0.446.0) - Icon library
- `@supabase/supabase-js` (2.57.4) - Backend as a service
- `qrcode.react` - Real QR code ticket rendering

### Development
- `typescript` (5.5.3) - Type safety
- `vite` (5.4.2) - Build tool
- `tailwindcss` (3.4.1) - CSS framework
- `eslint` (9.9.1) - Code linting

---

## 🤝 Contributing

To add features:
1. Create a new branch: `git checkout -b feature/feature-name`
2. Make changes
3. Test locally on mobile
4. Commit with clear messages
5. Push and create PR

---

## 📝 Notes for Development

### Component Organization
```
Future structure (recommended):
src/
  ├── components/
  │   ├── User/
  │   ├── Choreographer/
  │   ├── Studio/
  │   └── Shared/
  ├── pages/
  ├── services/
  │   ├── api.ts
  │   ├── auth.ts
  │   └── supabase.ts
  ├── hooks/
  ├── types/
  └── utils/
```

### Environment Variables Needed
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
```

---

## 🎨 Design Reference

- Figma designs: [Check Figma for detailed UI specs]
- Vision slide deck: AlignHut presentation (PDF provided)
- Color palette: Pinks (#FF6B9D), Teals (#00D4D4), Yellows (#FFD93D), Purples

---

## 📞 Support

For blockers or questions:
1. Check existing issues
2. Review the design deck for specifications
3. Check Supabase documentation for backend queries
4. Review TypeScript/React docs for implementation questions

---

## 📅 Timeline

- **MVP Target**: 2-3 weeks of development
- **Current Date**: August 16, 2026
- **Target Launch**: Early September 2026

---

## ✨ Future Enhancements

- [ ] Mobile app (React Native/Flutter)
- [ ] Video tutorials for choreographers
- [ ] Live streaming of events
- [ ] Social features (follow, comment, share)
- [ ] Subscription plans for studios
- [ ] Advanced scheduling with AI
- [ ] Multi-city expansion
- [ ] Instructor training program
- [ ] Integration with payment gateways
- [ ] Offline mode for bookings

---

**Last Updated**: August 16, 2026  
**Status**: In Active Development
