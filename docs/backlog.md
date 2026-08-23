# 📋 DanceHut MVP Problem Tracker & Task Backlog

> **Tracked Issues, Fixes, and Implementation Status**

This document tracks all identified feedback items, UX friction points, and implementation progress for the DanceHut MVP.

---

## 🎯 Current Status Summary

| # | Issue / Requirement | Status | Scope / Resolution Plan |
|---|---|:---:|---|
| 1 | **Custom Email Sender on Signup** | 🟡 Queued | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Sendgrid) in Supabase Auth settings. |
| 2 | **Dynamic User Name Display** | 🟢 Resolved | Replaced hardcoded *"Aria Kapoor"* with dynamic user profile from Supabase `profiles` table + full name capture on signup. |
| 3 | **Google Maps Redirection for Booked Class** | 🔴 In Progress | Add Google Maps navigation link (`https://www.google.com/maps/search/?api=1&query=...`) using venue address across bookings list, calendar, and ticket modal. |
| 4 | **Interactive Profile Icons** | 🟢 Resolved | Made top-right avatar and top-left profile card open the dynamic Profile Modal with editing and sign out. |
| 5 | **Interactive Location Selector** | 🟡 Queued | Make location selector pill clickable with active city info ("Bengaluru") and "More cities coming soon" modal/dropdown. |
| 6 | **"Talk to our team" Support Action** | 🟡 Queued | Connect support card to direct email (`mailto:`) or WhatsApp support link. |
| 7 | **"Your Space" Navigation & Realtime Messages** | 🟢 Resolved | Built Supabase Realtime-powered MessagesModal with conversation threads, quick inquiry prompts, and direct workshop instructor questions from class cards. Connected Preferences to ProfileModal. |
| 8 | **Discover Page Top Hero Relevance** | 🟢 Resolved | Rendered dynamic current date with live pulse, real-time class & spot metrics from Supabase, active contextual copy, and 1-click style filter shortcuts. |
| 9 | **Explore Studios Placement & Action** | 🟡 Queued | Reposition Explore Studios CTA and connect to an informative studio discovery modal/section. |
| 10 | **Welcome Page Art Panel Scroll Issue** | 🟢 Resolved (2026-08-23) | Removed decorative `welcome-art` card collage (SUNDAY GROOVE, "move with us", etc.) from `WelcomeView` — caused overflow and scroll issues on mobile. |
| 11 | **Welcome Page Footer Scroll Issue** | 🟢 Resolved (2026-08-23) | Removed `welcome-footer` section ("Dance classes, reimagined." + "Scroll to explore") from `WelcomeView` — added unnecessary page height and scroll on smaller screens. |
| 12 | **Auth Modal Supabase Disclaimer Text** | 🟢 Resolved (2026-08-23) | Removed "Your email and password are securely managed by Supabase." text from `EmailAuthModal`. |
| 13 | **Smart Hero Subtitle + QR Check-in Takeover** | 🟢 Resolved (2026-08-23) | Replaced vanity stat metrics with contextual countdown/urgency subtitle. Hero section is dynamically replaced by a scannable QR ticket 15 minutes prior to class. |
| 14 | **Class Detail Social Proof Metrics** | 🟡 Queued | Display real-time urgency/social proof on class cards/modals (e.g., "8 dancers booked a class in the last hour"). |

---

## 🔍 Detailed Breakdown & Solutions

### 1. SignUp Confirmation Email Sender
* **Problem**: Verification emails arrive from Supabase's default sender (`noreply@mail.app.supabase.io`) rather than a custom domain.
* **Solution**: Configure custom SMTP (AWS SES, Resend, Brevo, or SendGrid) in the Supabase Dashboard under `Authentication -> Email Templates -> SMTP Settings`.

### 2. Dynamic User Profile Name [RESOLVED]
* **Resolution**: Captured full name at signup, synced with `profiles` table, generated dynamic initials, and added real-time profile editing modal.

### 3. Location Redirection to Google Maps
* **Problem**: Users cannot easily open directions to the workshop venue.
* **Solution**: Standardize venue address data and render a clickable Google Maps query link (`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue_address + ', ' + event.city)}`).

### 4. Interactive Profile Avatars [RESOLVED]
* **Resolution**: Connected all avatar buttons to `ProfileModal`, supporting display name updates, role switching, and session sign out.

### 5. Location Selector Pill
* **Problem**: Header location badge is currently static.
* **Solution**: Add interactive city picker dropdown with active city indicator and future expansion notification.

### 6. "Talk to our team" Support
* **Problem**: Sidebar support card has no click handler.
* **Solution**: Bind to `mailto:support@dancehut.com` or WhatsApp quick chat.

### 7. "Your Space" Quick Links & Realtime Messages [RESOLVED]
* **Resolution**: Implemented `MessagesModal` with full conversation split-pane view, search filter, unread indicators, and real-time message stream. Added quick-prompt inquiry buttons for common workshop questions and integrated a 1-click "Message Host" trigger on workshop cards. Connected Preferences directly to `ProfileModal`.

### 8. Discover Hero Refresh [RESOLVED]
* **Resolution**: Replaced static date and fixed copy with real-time dynamic date formatting (`Intl.DateTimeFormat`) and a glowing pulse live indicator. Computed dynamic upcoming sessions, total open spots, and unique partner studios count directly from active Supabase events. Added 1-click popular style shortcut tags under the search bar for effortless category discovery.

### 9. Explore Studios Button
* **Problem**: CTA button is unclickable and feels misplaced.
* **Solution**: Improve positioning within the Discover feed and open a studio preview modal highlighting featured partner studios.

### 10. Welcome Page Art Panel Scroll Issue [RESOLVED — 2026-08-23]
* **Problem**: The decorative art panel (`welcome-art`) on the login/welcome page — containing the card collage with "SUNDAY GROOVE", "move with us" circle, "01 — DISCOVER", etc. — caused overflow and scroll issues, especially on mobile devices.
* **Resolution**: Removed the entire `welcome-art` div from `WelcomeView.tsx`. The welcome page now shows only the functional auth content (role picker, login buttons).

### 11. Welcome Page Footer Scroll Issue [RESOLVED — 2026-08-23]
* **Problem**: The `welcome-footer` section ("Dance classes, reimagined." + "Scroll to explore →") added unnecessary page height and forced scrolling on smaller screens.
* **Resolution**: Removed the `<footer>` element from `WelcomeView.tsx`.

### 12. Auth Modal Supabase Disclaimer Text [RESOLVED — 2026-08-23]
* **Problem**: The subtext *"Your email and password are securely managed by Supabase."* at the bottom of the Email Auth Modal was redundant and cluttered the auth dialog.
* **Resolution**: Removed the `<span className="auth-legal">` element from `EmailAuthModal.tsx`.

---

## 🏢 Studio Portal Implementation Roadmap (Phase 2)

| # | Epic / Feature | Scope & Implementation Plan | Target View |
|---|---|---|---|
| S-1 | **Studio Workspace View Routing** | Conditionally render Studio-specific navigation & dashboard when `profile.role === 'studio'`. | `App.tsx` & `StudioLayout` |
| S-2 | **Studio Dashboard Overview** | Render key metrics cards (Active workshops, booked capacity, total revenue) and today's schedule timeline with live roster links. | `StudioOverviewTab.tsx` |
| S-3 | **Create Workshop Modal / Flow** | 4-step interactive event creator form linked directly to Supabase `events` table with `organizer_id`. | `CreateEventModal.tsx` |
| S-4 | **Workshop Management Feed** | List of hosted classes with Edit, Cancel, Duplicate, and Roster management triggers. | `StudioWorkshopsTab.tsx` |
| S-5 | **Live Attendee Roster & Manual Check-in** | Searchable roster of confirmed dancers with 1-click status toggle (`booked` -> `attended`). | `AttendeeRosterModal.tsx` |
| S-6 | **QR Ticket Scanner for Front Desk** | Camera QR barcode scanner verifying Supabase ticket payloads and confirming attendance. | `QRScannerModal.tsx` |
| S-7 | **Studio Announcements Broadcast** | Dispatch notifications to all enrolled dancers of a specific workshop via `notify_event_audience`. | `StudioBroadcastModal.tsx` |
| S-8 | **Studio Profile & Room Management** | Manage studio profile, Google Maps venue location, amenities checklist, and room capacities. | `StudioProfileTab.tsx` |

