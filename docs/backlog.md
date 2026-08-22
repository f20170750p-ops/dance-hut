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
| 7 | **"Your Space" Sub-links Navigation** | 🟡 Queued | Add clean tab/modal navigation for Messages, Notifications, and Preferences in workspace view. |
| 8 | **Discover Page Top Hero Relevance** | 🟢 Resolved | Rendered dynamic current date with live pulse, real-time class & spot metrics from Supabase, active contextual copy, and 1-click style filter shortcuts. |
| 9 | **Explore Studios Placement & Action** | 🟡 Queued | Reposition Explore Studios CTA and connect to an informative studio discovery modal/section. |

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

### 7. "Your Space" Quick Links
* **Problem**: Messages, Notifications, and Preferences links do not navigate or perform actions.
* **Solution**: Connect Preferences directly to the Profile Modal and provide contextual in-page views/toasts for Notifications & Messages.

### 8. Discover Hero Refresh [RESOLVED]
* **Resolution**: Replaced static date and fixed copy with real-time dynamic date formatting (`Intl.DateTimeFormat`) and a glowing pulse live indicator. Computed dynamic upcoming sessions, total open spots, and unique partner studios count directly from active Supabase events. Added 1-click popular style shortcut tags under the search bar for effortless category discovery.

### 9. Explore Studios Button
* **Problem**: CTA button is unclickable and feels misplaced.
* **Solution**: Improve positioning within the Discover feed and open a studio preview modal highlighting featured partner studios.
