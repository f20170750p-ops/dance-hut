# 🏗️ DanceHut Architecture & Backend Strategy

> **Design Rationale, Security Model, and Evolution Roadmap**

---

## 📌 Overview: Current Architecture (BaaS)

DanceHut currently operates on a **Backend-as-a-Service (BaaS)** model powered by **Supabase (PostgreSQL)** paired directly with a **React (TypeScript + Vite)** client.

```
┌─────────────────────────────────────────────────────────┐
│                    React Client (Vite)                  │
│       - UI Components, State, & Navigation              │
│       - Supabase JS Client SDK (@supabase/supabase-js)  │
└────────────┬───────────────────────────────┬────────────┘
             │                               │
       (PostgREST REST API)             (GoTrue Auth)
             │                               │
┌────────────▼───────────────────────────────▼────────────┐
│                    Supabase Backend                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │               PostgreSQL Database                 │  │
│  │  - Row Level Security (RLS) policies per table    │  │
│  │  - Relational Schema (profiles, events, bookings) │  │
│  │  - Stored Procedures (e.g. book_event atomic tx)  │  │
│  │  - Database Triggers & Foreign Keys               │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Storage & Auth Subsystems            │  │
│  │  - User JWT verification & session management     │  │
│  │  - S3-compatible media asset storage              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ Is This a Good Design for the MVP?

**Yes.** For early-stage and MVP products, a client-to-Supabase architecture is an industry-standard best practice.

### Key Advantages:
1. **Speed to Market**: Eliminates writing repetitive CRUD endpoints, serializers, and custom middleware for standard data operations.
2. **Built-in Security (RLS)**: Security is enforced at the database layer. Even if client code is modified or bypassed, Postgres rejects unauthorized reads/writes.
3. **Data Integrity & Concurrency**: Critical transactions (such as seat reservations) run as atomic PostgreSQL stored procedures (`book_event`), preventing race conditions and double-bookings.
4. **Zero DevOps Overhead**: Eliminates maintaining dedicated virtual machines, reverse proxies, and container orchestration during the validation phase.
5. **Cost Efficient**: Runs completely within free/starter tiers with high availability.

---

## 🔒 Security Model

### 1. Row Level Security (RLS)
Every table (`profiles`, `events`, `bookings`, `saved_events`) has RLS enabled:
- **`events`**: Publicly readable by any authenticated or anonymous user; writable only by authorized organizers/admins.
- **`bookings`**: Users can only read and query bookings where `user_id = auth.uid()`.
- **`profiles`**: Public profile data readable by all; updates restricted to the owning user (`id = auth.uid()`).
- **`saved_events`**: Strictly scoped to the bookmarking user (`user_id = auth.uid()`).

### 2. Atomic Stored Procedures
Instead of performing multi-step checks in frontend JavaScript (which could lead to race conditions), seat bookings execute via the server-side PostgreSQL function [book_event](file:///Users/mayank.mohindra/mayank/dance-hut/supabase/schema.sql#L110-L157):
- Acquires an exclusive row lock (`FOR UPDATE`) on the target event.
- Verifies seat availability (`booked_spots < total_spots`).
- Checks for existing duplicate bookings for the user.
- Creates the booking record and increments `booked_spots` within a single atomic transaction.

---

## 🚀 Evolution & Scaling Roadmap

As DanceHut expands beyond the MVP, the architecture evolves smoothly without throwing away existing code:

```
[Phase 1: Current MVP]
Frontend ────────────────────────────▶ Supabase (Postgres + RLS + RPC)

[Phase 2: MVP + Webhooks & Secrets]
Frontend ────────────────────────────▶ Supabase (Postgres + RLS)
Frontend / Webhooks ──▶ Edge Functions ──▶ 3rd-Party APIs (Razorpay, WhatsApp, Resend)

[Phase 3: Mature Enterprise / Custom Microservices]
Frontend ─────────────▶ API Gateway / Backend (Node/Nest/Go) ──▶ Supabase Postgres
```

### When to Introduce Server-Side Code:

| Need / Feature | Why Client-Only Isn't Sufficient | Recommended Approach |
| :--- | :--- | :--- |
| **Payment Gateway Integration** (Razorpay, Stripe) | Webhook HMAC verification and secret keys must remain private on the server. | **Supabase Edge Functions** (TypeScript/Deno) |
| **Transactional Email / SMS** (Resend, Twilio) | Private API tokens cannot be exposed in frontend JavaScript bundles. | **Supabase Edge Functions** or Database Webhooks |
| **Scheduled Background Tasks** | Nightly event reconciliation, reminders 2 hours before a class. | **pg_cron** (Postgres) or Scheduled Edge Functions |
| **Complex Multi-Service Orchestration** | Heavy compute, video processing, or proprietary recommendation algorithms. | **Dedicated Backend Service** (Node.js / FastAPI / Go) connecting to Supabase Postgres |

---

## 🛠️ Summary

The current architecture strikes the ideal balance between **rapid development speed**, **strong data consistency**, and **production-grade security**. It provides a solid foundation for the Dancer MVP and a clear, non-destructive migration path to serverless functions or dedicated backend microservices when payments and advanced features are introduced.
