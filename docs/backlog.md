# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-29*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P1** | **Messages Tab Mobile Viewport & Header Fix** | Messages (`F-8`, `F-9`) | 🟡 Queued | Fix sticky topbar cutoff and excessive page scrolling on mobile by pinning conversation header and scrolling messages internally. |
| 2 | **P2** | **CheckInCard Polish & Default Collapsed State** | Discover / Check-in (`F-2`, `F-19`, `F-20`) | 🟡 Queued | Default QR check-in card to collapsed, align gradient theme with primary red, and optimize mobile QR frame height. |
| 3 | **P2** | **Notification Broadcaster Simulator Mobile & UX Polish** | Notifications (`F-13`, `F-14`, `F-15`) | 🟡 Queued | Fix mobile card overflow, auto-close simulator upon send, and scope class selector to booked workshops for dancers. |
| 4 | **P2** | **Discover Date Filter Interactive Calendar Picker** | Discover (`F-4`) | 🟡 Queued | Replace static date dropdown filter with an interactive calendar popover / date-picker modal. |
| 5 | **P2** | **"Next Up" Card Action Menu Implementation** | Discover (`F-11`) | 🟡 Queued | Connect three-dot `•••` action menu on Next Up card to View Ticket, Maps Navigation, and Booking Management. |
| 6 | **P3** | **Spotlight Multi-Item Carousel / Auto-Scroll** | Discover (`F-3`) | 🟡 Queued | Implement horizontal carousel indicators and auto-scrolling when multiple featured workshops are spotlighted. |
| 7 | **P3** | **Contact Support Modal Mobile Polish & In-App Submission** | Support / Modal (`F-17`) | 🟡 Queued | Improve mobile padding/alignment and streamline in-app feedback submission without relying solely on mailto links. |
| 8 | **P3** | **Maximum Booking Window Policy & Logic** | Booking Logic (`F-5`) | 🟡 Queued | Define maximum advance booking window (e.g. 14–30 days) and add boundary checks/badges. |
| 9 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 Queued | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. |

---

## 🔍 Detailed Breakdown & Solutions

### 1. Messages Tab Mobile Viewport & Header Fix
* **Status**: 🟡 Queued
* **Priority**: **P1 (Bug / UX)**
* **Feedback Refs**: `F-8`, `F-9`
* **Impacted Components**: `src/components/tabs/MessagesTab.tsx`, `src/styles/messages.css`
* **Problem**: On mobile screens, the sticky top bar overlaps and cuts off the active conversation header. Additionally, the outer page scrolls excessively instead of keeping the conversation frame fixed.
* **Solution**: Add proper mobile top offset (`calc(var(--topbar-height) + 12px)`) to conversation header, set fixed/flex viewport height on `.messages-layout-card`, and isolate scrolling to `.chat-messages-scroll`.

### 2. CheckInCard Polish & Default Collapsed State
* **Status**: 🟡 Queued
* **Priority**: **P2 (UI / UX)**
* **Feedback Refs**: `F-2`, `F-19`, `F-20`
* **Impacted Components**: `src/components/common/CheckInCard.tsx`, `src/styles/workshops.css`
* **Problem**: The pass card defaults to fully expanded on load, consuming heavy mobile vertical space; the QR container is overly tall on small screens; and the banner header gradient does not match the app's primary crimson theme.
* **Solution**: Default `isExpanded` state to `false` (header-only preview with expand toggle), reduce QR box padding/size on mobile viewports (`max-width: 600px`), and harmonize gradient tokens with `#e83b3b`.

### 3. Notification Broadcaster Simulator Mobile & UX Polish
* **Status**: 🟡 Queued
* **Priority**: **P2 (Bug / UX)**
* **Feedback Refs**: `F-13`, `F-14`, `F-15`
* **Impacted Components**: `src/components/tabs/NotificationsTab.tsx`, `src/styles/messages.css`
* **Problem**: Broadcaster simulator panel causes horizontal overflow on mobile screens; stays open after broadcasting; and lets dancers select workshops they are not enrolled in.
* **Solution**: Constrain form grid to single column on mobile (`max-width: 600px`), automatically collapse/hide panel upon successful dispatch, and filter selector options to user's booked workshops when in dancer mode.

### 4. Discover Date Filter Interactive Calendar Picker
* **Status**: 🟡 Queued
* **Priority**: **P2 (Feature)**
* **Feedback Refs**: `F-4`
* **Impacted Components**: `src/components/tabs/DiscoverTab.tsx`, `src/styles/discover.css`
* **Problem**: Date filter currently uses a static select dropdown with limited preset dates.
* **Solution**: Integrate a clean calendar popover/modal allowing dancers to pick specific dates or date ranges to filter workshops dynamically.

### 5. "Next Up" Card Action Menu Implementation
* **Status**: 🟡 Queued
* **Priority**: **P2 (Feature)**
* **Feedback Refs**: `F-11`
* **Impacted Components**: `src/components/tabs/DiscoverTab.tsx`, `src/App.tsx`
* **Problem**: The three-dot `•••` action button on the "Next up" upcoming class card is currently non-interactive.
* **Solution**: Attach a dropdown menu with active actions: View Ticket (opens `TicketModal`), Navigate (opens Google Maps location), and Manage Booking (Cancel/Reschedule).

### 6. Spotlight Multi-Item Carousel / Auto-Scroll
* **Status**: 🟡 Queued
* **Priority**: **P3 (Design / Enhancement)**
* **Feedback Refs**: `F-3`
* **Impacted Components**: `src/components/tabs/DiscoverTab.tsx`, `src/styles/discover.css`
* **Problem**: When multiple featured workshops are marked for Spotlight, only the first is shown or they stack vertically.
* **Solution**: Add horizontal carousel pagination with slide indicators and subtle auto-advancing timer that pauses on hover/touch.

### 7. Contact Support Modal Mobile Polish & In-App Submission
* **Status**: 🟡 Queued
* **Priority**: **P3 (UI / UX)**
* **Feedback Refs**: `F-17`
* **Impacted Components**: `src/components/modals/ContactModal.tsx`, `src/styles/modals.css`
* **Problem**: Modal padding is tight on small screens and submission relies primarily on client-side mailto links.
* **Solution**: Optimize responsive padding (`16px` on mobile), provide clean in-app confirmation state, and preserve mailto as secondary fallback.

### 8. Maximum Booking Window Policy & Logic
* **Status**: 🟡 Queued
* **Priority**: **P3 (Design / Logic)**
* **Feedback Refs**: `F-5`
* **Impacted Components**: `src/services/events.ts`, `src/components/modals/EventModal.tsx`
* **Problem**: No boundary limit exists for booking workshops months into the future.
* **Solution**: Establish booking window threshold (e.g., maximum 30 days in advance) and disable/badge booking actions for workshops beyond the allowable window.

### 9. Custom Email Sender on Signup
* **Status**: 🟡 Queued
* **Priority**: **P2**
* **Impacted Components**: Supabase Dashboard (Auth -> Email Templates -> SMTP Settings)
* **Problem**: Verification and welcome emails arrive from Supabase default sender (`noreply@mail.app.supabase.io`) rather than a branded address.
* **Solution**: Configure custom SMTP credentials via Resend, Brevo, or SendGrid in Supabase Auth settings to send from `noreply@dancehut.com`.
