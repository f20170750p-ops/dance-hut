# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-29*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P3** | **Maximum Booking Window Policy & Logic** | Booking Logic (`F-5`) | 🟡 Queued | Define maximum advance booking window (e.g. 14–30 days) and add boundary checks/badges. |
| 2 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 Queued | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. |

---

## 🔍 Detailed Breakdown & Solutions

### 1. Maximum Booking Window Policy & Logic
* **Status**: 🟡 Queued
* **Priority**: **P3 (Design / Logic)**
* **Feedback Refs**: `F-5`
* **Impacted Components**: `src/services/events.ts`, `src/components/modals/EventModal.tsx`
* **Problem**: No boundary limit exists for booking workshops months into the future.
* **Solution**: Establish booking window threshold (e.g., maximum 30 days in advance) and disable/badge booking actions for workshops beyond the allowable window.

### 2. Custom Email Sender on Signup
* **Status**: 🟡 Queued
* **Priority**: **P2**
* **Impacted Components**: Supabase Dashboard (Auth -> Email Templates -> SMTP Settings)
* **Problem**: Verification and welcome emails arrive from Supabase default sender (`noreply@mail.app.supabase.io`) rather than a branded address.
* **Solution**: Configure custom SMTP credentials via Resend, Brevo, or SendGrid in Supabase Auth settings to send from `noreply@dancehut.com`.
