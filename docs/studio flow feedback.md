# 🏢 Studio Flow Feedback & Bug Tracker

> **Source**: Manual E2E testing on mobile & desktop  
> **Date**: 2026-08-24  
> **Status**: Logged for review & prioritization  

---

---


## 3. 🛠️ Workshop Creation & Management Bugs

### 3.2 Workshop Creation RLS Policy Error
* **Issue**: Clicking *"Publish Workshop"* fails with error:
  > `new row violates row-level security policy for table "events"`
* **Root Cause**: Supabase RLS policy on `events` table only allows inserts if the user is authenticated with appropriate studio role or user_id matching host ID, or `INSERT` policy is missing for authenticated users.
* **Fix**: Update Supabase RLS policy on `events` table to allow authenticated studio/choreographer accounts to insert new workshop rows.
* **Severity**: Critical (Blocker)

## 📋 Summary Table

| ID | Title | Component | Priority | Status |
|---|---|---|:---:|:---:|
| S-8 | Workshop publish RLS policy error | Supabase RLS / `CreateWorkshopModal.tsx` | P0 | 🔴 Open |

