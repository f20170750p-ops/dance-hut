# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-31*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 External / Hold | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. Requires external dashboard access. |
| 2 | **P1** | **Home Top Banner: Upcoming Booking & QR Code Trigger** | Discover / Bookings | 🔴 Todo | Update the top hero banner on Discover to feature the user's next upcoming booking instead of a generic class, opening the ticket QR code directly on click. |
| 3 | **P1** | **Sync "My Bookings" Count Indicator with Bookings Tab List** | State Management / Bookings | 🔴 Todo | Resolve data inconsistency where badge/popup shows 4 booked classes but the Bookings tab only renders 3. |
| 4 | **P2** | **Add "Mark as Unread" Option in Notifications** | Notifications | 🔴 Todo | Enable users to toggle a notification's status back to unread. |

---

## 🔍 Detailed Breakdown & Solutions

### 1. Custom Email Sender on Signup
* **Status**: 🟡 External / Hold (Requires external Supabase SMTP configuration)
* **Priority**: **P2**
* **Impacted Components**: Supabase Dashboard (Auth -> Email Templates -> SMTP Settings)
* **Problem**: Verification and welcome emails arrive from Supabase default sender (`noreply@mail.app.supabase.io`) rather than a branded address.
* **Solution**: Configure custom SMTP credentials via Resend, Brevo, or SendGrid in Supabase Auth settings to send from `noreply@dancehut.com`.

### 2. Home Top Banner: Upcoming Booking & QR Code Trigger
* **Status**: 🔴 Todo
* **Priority**: **P1**
* **Impacted Components**: `src/components/tabs/DiscoverTab.tsx`, `src/components/modals/TicketModal.tsx`, `src/components/modals/EventModal.tsx`
* **Problem**: The top home banner opens a featured class modal instead of showcasing the user's imminent booking with easy check-in access.
* **Solution**: If the user has active bookings, adapt the top banner to display their next upcoming booking. Clicking the banner should directly open the Ticket modal with the ticket QR code for entry.

### 3. Sync "My Bookings" Count Indicator with Bookings Tab List
* **Status**: 🔴 Todo
* **Priority**: **P1**
* **Impacted Components**: `src/components/layout/Sidebar.tsx`, `src/components/tabs/BookingsTab.tsx`, `src/context/` or booking data hooks
* **Problem**: The indicator/popup for "My Bookings" displays a count of 4 booked classes, but only 3 classes render inside the Bookings tab due to state or filter discrepancies.
* **Solution**: Audit the bookings query/state source across the Sidebar badge and BookingsTab to ensure both reference the exact same booking dataset and filtering criteria (e.g. status = 'confirmed' / upcoming).

### 4. Add "Mark as Unread" Option in Notifications
* **Status**: 🔴 Todo
* **Priority**: **P2**
* **Impacted Components**: `src/components/tabs/NotificationsTab.tsx`
* **Problem**: Once a notification is viewed or marked read, there is no action allowing the user to mark it back as unread for later follow-up.
* **Solution**: Add a "Mark as unread" action button/menu option on each notification item and implement the corresponding state toggle.
