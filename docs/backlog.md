# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-29*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P2** | **Human-Readable Ticket ID on Ticket Modal** | Ticket Modal | 🟡 Queued | Display a visible confirmation code (e.g., `DH-TKT-2026-X`) below the QR code for seamless front-desk manual check-in. |
| 2 | **P2** | **Search-Responsive Style Chip Counts** | Discover Tab | 🟡 Queued | Make style filter pill counts dynamic so they reflect the active search query rather than global totals. |
| 3 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 Queued | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. |

---

## 🔍 Detailed Breakdown & Solutions

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
