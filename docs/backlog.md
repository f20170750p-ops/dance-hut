# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-29*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P1** | **Single-Viewport No-Scroll Login Screen** | Welcome / Auth View | 🟡 Queued | Ensure the Login/Welcome screen fits strictly into a single viewport (`100dvh`) without any vertical page scrolling on both web and mobile screens. |
| 2 | **P1** | **Mobile Sidebar Outside-Click / Backdrop Dismiss** | Navigation / Mobile UI | 🟡 Queued | Automatically close the mobile sidebar drawer when tapping anywhere on the main page or backdrop, instead of requiring an explicit click on the `X` button. |
| 3 | **P1** | **Explore Studios Placement & Discovery Flow** | Discover Tab | 🟡 Queued | Connect the inactive "Explore studios" CTA in the Discover feed banner to a dedicated partner studio explorer modal or directory. |
| 4 | **P1** | **Class Detail Social Proof & Urgency Metrics** | Workshop Cards / Modals | 🟡 Queued | Display real-time urgency and social proof indicators (e.g., *"8 dancers booked recently"*, *"Only 2 spots left"*). |
| 5 | **P2** | **Human-Readable Ticket ID on Ticket Modal** | Ticket Modal | 🟡 Queued | Display a visible confirmation code (e.g., `DH-TKT-2026-X`) below the QR code for seamless front-desk manual check-in. |
| 6 | **P2** | **Search-Responsive Style Chip Counts** | Discover Tab | 🟡 Queued | Make style filter pill counts dynamic so they reflect the active search query rather than global totals. |
| 7 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 Queued | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. |

---

## 🔍 Detailed Breakdown & Solutions

### 2. Single-Viewport No-Scroll Login Screen
* **Status**: 🟡 Queued
* **Impacted Components**: `WelcomeView.tsx`, `index.css`
* **Problem**: The login/welcome page currently requires vertical scrolling on both mobile and desktop screens to view all auth actions and persona selector cards. It exceeds the viewport height.
* **Solution**:
  1. Constrain `.welcome-view` to `height: 100dvh; max-height: 100dvh; overflow: hidden;`.
  2. Optimize padding, typography scale, and card spacing across the persona switcher and auth buttons so the entire welcome interface fits cleanly in a single screen on both mobile devices (e.g., 384×824) and desktop displays.

---

### 3. Mobile Sidebar Outside-Click / Backdrop Dismiss
* **Status**: 🟡 Queued
* **Impacted Components**: `Sidebar.tsx`, `App.tsx`, `index.css`
* **Problem**: When the mobile navigation side drawer is opened, tapping on the main page content does nothing. The user is forced to find and explicitly click the small `X` close button at the top corner of the sidebar.
* **Solution**:
  1. Render a semi-transparent backdrop overlay (`.sidebar-backdrop`) behind the open mobile sidebar.
  2. Attach an `onClick={() => setShowMenu(false)}` handler to the backdrop / outside container so tapping anywhere outside the sidebar immediately dismisses it.

---

### 4. Explore Studios Placement & Discovery Flow
* **Status**: 🟡 Queued
* **Impacted Components**: `DiscoverTab.tsx` (lower grid banner)
* **Problem**: The "Explore studios" CTA button on the "Good energy lives here" banner has no `onClick` handler.
* **Solution**:
  1. Reposition the studio showcase block for better natural feed flow.
  2. Implement an interactive Studio Explorer modal / drawer previewing featured studios, their locations, amenities, and hosted workshops.

---

### 5. Class Detail Social Proof & Urgency Metrics
* **Status**: 🟡 Queued
* **Impacted Components**: `EventCard.tsx`, `EventModal.tsx`
* **Problem**: Class cards lack immediate urgency cues that drive ticket booking conversion.
* **Solution**: Compute and display dynamic social proof tags:
  * *"Selling fast · Only X spots left"*
  * *"X dancers booked in the last 24h"*
  * *"Trending in Indiranagar"*

---

### 6. Human-Readable Ticket ID on Ticket Modal
* **Status**: 🟡 Queued
* **Impacted Components**: `TicketModal.tsx`
* **Problem**: If front-desk camera scanning fails or user has screen brightness issues, studio staff need an immediate manual verification code.
* **Solution**: Display a formatted ticket ID badge (e.g., `DH-TKT-${bookingId ?? event.id}`) directly below the QR code frame with a 1-click copy action.

---

### 7. Search-Responsive Style Chip Counts
* **Status**: 🟡 Queued
* **Impacted Components**: `DiscoverTab.tsx`
* **Problem**: When a text search is active (e.g. "Groove"), style chips still show total unfiltered database counts (e.g. "All styles (7)"), confusing users when filtered results are fewer.
* **Solution**: Compute chip badge counts from the filtered event dataset matching the active search term.

---

### 8. Custom Email Sender on Signup
* **Status**: 🟡 Queued
* **Impacted Components**: Supabase Dashboard (Auth -> Email Templates -> SMTP Settings)
* **Problem**: Verification and welcome emails arrive from Supabase default sender (`noreply@mail.app.supabase.io`) rather than a branded address.
* **Solution**: Configure custom SMTP credentials via Resend, Brevo, or SendGrid in Supabase Auth settings to send from `noreply@dancehut.com`.
