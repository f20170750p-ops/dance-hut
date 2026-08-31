# 📋 DanceHut MVP Task Backlog

> **Active Issues & Pending Features To Be Done**  
> *Last updated: 2026-08-31*

This document tracks all active, unresolved tasks and UX enhancements for the DanceHut MVP. Resolved items have been pruned to keep this backlog focused strictly on pending work.

---

## 🎯 Active Tasks Summary

| # | Priority | Issue / Feature | Area | Status | Description |
|---|:---:|---|---|:---:|---|
| 1 | **P2** | **Custom Email Sender on Signup** | Auth / Supabase Config | 🟡 External / Hold | Replace default Supabase confirmation email sender with custom SMTP provider (e.g. Resend, Brevo) in Supabase Auth settings. Requires external dashboard access. |
| 2 | **P2** | **Add "Mark as Unread" Option in Notifications** | Notifications | 🔴 Todo | Enable users to toggle a notification's status back to unread. |

---

## 🔍 Detailed Breakdown & Solutions

### 1. Custom Email Sender on Signup
* **Status**: 🟡 External / Hold (Requires external Supabase SMTP configuration)
* **Priority**: **P2**
* **Impacted Components**: Supabase Dashboard (Auth -> Email Templates -> SMTP Settings)
* **Problem**: Verification and welcome emails arrive from Supabase default sender (`noreply@mail.app.supabase.io`) rather than a branded address.
* **Solution**: Configure custom SMTP credentials via Resend, Brevo, or SendGrid in Supabase Auth settings to send from `noreply@dancehut.com`.

### 2. Add "Mark as Unread" Option in Notifications
* **Status**: 🔴 Todo
* **Priority**: **P2**
* **Impacted Components**: `src/components/tabs/NotificationsTab.tsx`
* **Problem**: Once a notification is viewed or marked read, there is no action allowing the user to mark it back as unread for later follow-up.
* **Solution**: Add a "Mark as unread" action button/menu option on each notification item and implement the corresponding state toggle.
