# 🐛 E2E Testing Feedback Log

| # | Section | Issue | Device | Severity |
|---|---|---|---|---|
| F-1 | Welcome Page (A-1) | Page requires scroll on mobile to reach "Continue with email" button. Should fit in one viewport on S23 Ultra (384×824 CSS px). | S23 Ultra (mobile) | Medium |
| F-2 | CheckInCard (D-3) | QR card should default to **collapsed** (header-only), user expands if they want. Currently defaults to expanded. Reverse `useState(true)` → `useState(false)`. | Mobile | Medium |
| F-3 | Spotlight (D-10) | **Design decision**: Define max featured events. When multiple featured events exist, use a horizontal auto-scrolling carousel (slow continuous scroll). | All | Design |
| F-4 | Discover filters (D-15) | Date filter should open a **calendar date picker** instead of a dropdown. Decide: how far into the future can the calendar go? (edge case) | All | Medium |
| F-5 | Booking logic | **Design decision**: Define the maximum booking window — how far into the future can a dancer book a class? | All | Design |
| F-6 | Style chips (D-14) | When search is active (e.g. "Groove"), style chip counts still show total unfiltered counts (e.g. "All styles (7)"). Counts should reflect filtered results. **Misleading.** | All | Bug |
| F-7 | Event Modal (E-1) | Location in the details modal should be linked to Google Maps. **P2 — not MVP.** | All | P2 |
| F-8 | Messages Tab (M-2) | When opening Messages from event modal, the **message header is getting cut off** at the top on mobile. Content overlaps behind topbar. See screenshot. | Mobile | Bug |
| F-9 | Messages Tab (M-2) | On mobile, there is **excessive scroll** in the messages screen. The conversation header scrolls away instead of staying sticky. | Mobile | Bug |
| F-10 | Discover (lower grid) | "Explore studios" button in the "Good energy lives here" banner **does nothing** on click. Needs a handler or should be removed. | All | Bug |
| F-11 | Discover (Next Up) | The three-dot "•••" button on the "Next up" card **does nothing**. Decide: what should it do? (Edit booking? View all? Remove?) | All | Design |
| F-12 | Ticket Modal (T-2) | When booking is clicked in the "Your Week / Next up" card, the ticket modal should also have the **location linked to Google Maps** (same as CheckInCard's "Navigate to venue"). | All | Medium |
| F-13 | Notifications Tab (N-1) | **Horizontal spill/overflow** in the Broadcaster simulator card on mobile screen. Card width exceeds mobile viewport. See screenshot. | Mobile | Bug |
| F-14 | Notifications Tab (N-1) | Broadcaster dropdown shows all classes. For dancer role, only show booked classes, or remove the organizer broadcast simulator completely from dancer view. | All | Low/Design |
| F-15 | Notifications Tab (N-1) | Once a broadcast is sent, the broadcast simulator card/modal should **automatically close/collapse**. | All | UX |
| F-16 | Notifications Tab (N-5) | **Wrong chat mapping bug**: Clicking "Message Host" from the "Bollywood Foundation by Ananya Mehta" notification opened the chat for "Aria / Afro fusion" instead of Ananya Mehta. | All | Critical Bug |
| F-17 | Contact Modal (CT-1) | Contact Support modal is off-center on mobile. Text and labels need proper alignment. Remove "Open in Mail app" option and provide cleaner alternatives (e.g. WhatsApp / clean in-app submission). | Mobile | UI/UX |
| F-18 | Profile Modal / Role Switch (PR-3) | When switching role to "Studio", the app experience does not change immediately without a manual reload. Needs instant state sync or clean reload. | All | UX |
