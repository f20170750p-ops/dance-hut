# 🏢 Studio Flow Feedback & Bug Tracker

> **Source**: Manual E2E testing on mobile & desktop  
> **Date**: 2026-08-24  
> **Status**: Logged for review & prioritization  

---

## 1. 🛡️ Role Gating, Profiles & Multi-Persona Architecture

### 1.1 Role Switch Gating (Uncreated Profiles)
* **Issue**: Users can switch to `Studio` or `Choreographer` roles even if they have never created or set up a studio/choreo profile.
* **Expected**: If a user has not set up a Studio or Choreographer profile yet, that option in the role switcher should be **greyed out / disabled** with a prompt (e.g. *"Set up Studio Profile to unlock"*).
* **Severity**: High (Security & UX)

### 1.2 Multi-Profile Support per Email
* **Issue**: All roles currently share a single flat profile object and name.
* **Expected**: The same email account can hold up to **1 Dancer profile, 1 Choreographer profile, and 1 Studio profile**. Switching roles should switch context completely to that isolated persona without cross-contamination.
* **Severity**: High (Architecture)

### 1.3 Role Persistence & Initial Tab on Reload
* **Issue**: When logged in as Studio, reloading the app always defaults back to the Dancer flow (`Discover` tab) initially. Only clicking the `Dashboard` tab switches to the studio experience.
* **Expected**: If user is in `Studio` role, page reload should immediately load the **Studio Dashboard** (`activeTab: 'Dashboard'`) without showing or flashing the Dancer Discover tab.
* **Severity**: Medium (UX)

### 1.4 Studio Profile Page & Separation of Studio Name vs User Name
* **Issue**:
  1. Profile modal treats user's personal name as the studio name.
  2. Studio profile modal still displays dancer metrics (*"4 active bookings"*, *"Saved classes"*), which is irrelevant to a studio owner.
* **Expected**:
  1. Profile modal should have two separate fields: **Owner / Manager Name** and **Studio Name**.
  2. Remove active bookings and saved classes counters when in Studio mode.
  3. Provide a direct link in the profile modal to the **Studio Profile Tab** for editing rooms, amenities, and full venue details.
* **Severity**: High (UX & Branding)

### 1.5 Studio Onboarding Flow
* **Issue**: First-time sign up as a Studio does not capture essential studio information.
* **Expected**: When a user signs up as a Studio, show an initial onboarding step to capture required baseline info (Studio Name, Address / Locality, Contact Phone). All other details (Amenities, Room Capacities, Photos) remain optional and editable later.
* **Severity**: High (Onboarding)

---

## 2. 📊 Dashboard & UI Display Bugs

### 2.1 Hero Banner Name Display
* **Issue**: Studio Dashboard hero greeting says *"Good evening, [User's Personal Name]"* instead of the studio brand.
* **Expected**: Hero banner should prominently display the **Studio Name** (e.g., *"The Movement House"* or *"Welcome back, The Movement House"*).
* **Severity**: Medium (Branding)

### 2.2 Table Horizontal Scroll on Mobile
* **Issue**: In the **Upcoming Workshop Schedule** card on mobile, the table columns overflow and horizontal scroll does not work cleanly, clipping instructor and price/spots info (see screenshot).
* **Expected**: Table container should support smooth horizontal swipe with a subtle visual scroll hint, or collapse into responsive stacked cards on mobile screens (≤680px).
* **Severity**: High (Mobile Layout)

---

## 3. 🛠️ Workshop Creation & Management Bugs

### 3.1 Poster Presets Multi-Selection Bug
* **Issue**: In the Create Workshop modal, tapping the "Contemporary" tile also selects the "Studio Rehearsal" tile simultaneously.
* **Root Cause**: Selection logic compares image URLs (`selectedPoster === preset.image`). Since both presets share the same placeholder image URL, both highlight at once.
* **Fix**: Match presets by unique `preset.id` or `preset.title` instead of image URL.
* **Severity**: Medium (Bug)

### 3.2 Workshop Creation RLS Policy Error
* **Issue**: Clicking *"Publish Workshop"* fails with error:
  > `new row violates row-level security policy for table "events"`
* **Root Cause**: Supabase RLS policy on `events` table only allows inserts if the user is authenticated with appropriate studio role or user_id matching host ID, or `INSERT` policy is missing for authenticated users.
* **Fix**: Update Supabase RLS policy on `events` table to allow authenticated studio/choreographer accounts to insert new workshop rows.
* **Severity**: Critical (Blocker)

### 3.3 Workshop Deletion Not Persisting (Mock / In-Memory only)
* **Issue**: Deleting a workshop removes it from the UI temporarily, but it comes back on reload.
* **Root Cause**: `handleDeleteWorkshop` only filtered local React state `events.filter(...)` and never issued a Supabase `DELETE` query to the database.
* **Fix**: Implement `deleteEvent(eventId)` API in `src/services/events.ts` connected to Supabase `events` table.
* **Severity**: High (Data Integrity)

### 3.4 Single Studio Association in Workshop Creation
* **Issue**: Studio dropdown in the Create Workshop modal allows selecting from any studio in the database.
* **Expected**: A studio account only owns 1 studio. The Studio Name should be **auto-filled and locked** to their registered studio name, not a generic dropdown.
* **Severity**: Medium (Business Logic)

### 3.5 Verified Neighbourhood / Locality Input
* **Issue**: Primary neighbourhood / locality is currently a free-text input where users can type anything.
* **Expected**: Use a curated dropdown of verified city neighbourhoods (e.g. Koramangala, Indiranagar, HSR Layout, Whitefield, etc.) or integrate Google Places Autocomplete to ensure accurate location tagging.
* **Severity**: Medium (Data Quality)

---

## 4. 📷 Front-Desk QR Scanner & Attendance

### 4.1 Camera Not Working on Mobile Browsers
* **Issue**: Tap *"Scan Ticket"* shows black screen or fails to access camera on mobile browsers.
* **Root Cause**: `navigator.mediaDevices.getUserMedia` requires a **secure context (HTTPS)**. When accessing via local IP (`http://192.168.1.5:5173`), modern mobile browsers (Chrome, Safari) block camera access due to lack of SSL.
* **Fix**:
  1. Add Vite HTTPS plugin (`vite-plugin-mkcert` or local SSL) for local network testing.
  2. Ensure graceful fallback to manual ticket ID entry when camera is unavailable.
* **Severity**: High (Hardware / Environment)

---

## 5. 💬 Messages Tab Header Scroll Bug

### 5.1 Message Screen Sticky Header Overflow
* **Issue**: When scrolling up in Messages tab on mobile, the entire header banner (*"Your space - Messages & Inquiries..."*) scrolls up with the conversation and causes weird overlapping/clipping with the topbar.
* **Expected**: The conversation header should remain fixed/sticky at the top, with only the message thread area scrolling underneath.
* **Severity**: High (Mobile Layout)

---

## 📋 Summary Table

| ID | Title | Component | Priority | Status |
|---|---|---|:---:|:---:|
| S-1 | Role switch gating (grey out uncreated profiles) | `ProfileModal.tsx`, `App.tsx` | P0 | 🔴 Open |
| S-2 | Multi-profile architecture (1 per role per email) | `auth.ts`, `App.tsx` | P0 | 🔴 Open |
| S-3 | Studio reload loads Discover tab first | `App.tsx` | P1 | 🔴 Open |
| S-4 | Studio Name vs Personal Name in Profile & Hero | `ProfileModal.tsx`, `StudioOverviewTab.tsx` | P1 | 🔴 Open |
| S-5 | Studio first-time onboarding flow | `WelcomeView.tsx`, `auth.ts` | P1 | 🔴 Open |
| S-6 | Upcoming schedule table mobile scroll | `StudioOverviewTab.tsx`, `index.css` | P1 | 🔴 Open |
| S-7 | Poster presets multi-selection bug | `CreateWorkshopModal.tsx` | P1 | 🔴 Open |
| S-8 | Workshop publish RLS policy error | Supabase RLS / `CreateWorkshopModal.tsx` | P0 | 🔴 Open |
| S-9 | Workshop delete not persisting to Supabase | `events.ts`, `App.tsx` | P1 | 🔴 Open |
| S-10 | Lock studio name in workshop creation | `CreateWorkshopModal.tsx` | P2 | 🔴 Open |
| S-11 | QR Scanner camera HTTPS requirement & fallback | `QRScannerModal.tsx` | P1 | 🔴 Open |
| S-12 | Messages header sticky layout on mobile | `MessagesTab.tsx`, `index.css` | P1 | 🔴 Open |
| S-13 | Verified neighbourhood dropdown / Google Places | `CreateWorkshopModal.tsx`, `StudioProfileTab.tsx` | P2 | 🔴 Open |
