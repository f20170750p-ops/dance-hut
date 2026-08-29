# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-29*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P2** | **Search-Responsive Style Chip Counts** | Discover Tab | 🟡 Queued | Make style filter pill counts dynamic so they reflect the active search query rather than global totals. |
| 2 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 Queued | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. |

---

## 🔍 Detailed Breakdown & Solutions

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
