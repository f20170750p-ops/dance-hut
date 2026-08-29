# 🐛 E2E Testing Feedback Log (Dancer Flow)

> **Pending Active Feedback & Issues**  
> *Last updated: 2026-08-29*

| # | Section | Issue / Feedback | Device | Severity |
|---|---|---|---|---|
| F-2 | **CheckInCard (D-3)** | QR card should default to **collapsed** (header-only), user expands if they want. Currently defaults to expanded (`useState(false)`). | Mobile | Medium |
| F-3 | **Spotlight (D-10)** | **Design decision**: When multiple featured workshops exist, provide horizontal auto-scrolling or carousel indicators. | All | Design |
| F-4 | **Discover filters (D-15)** | Date filter should open a **calendar date picker** modal/popover instead of a static dropdown. | All | Medium |
| F-5 | **Booking logic** | **Design decision**: Define the maximum booking window — how far into the future can a dancer book a class? | All | Design |
| F-8 | **Messages Tab (M-2)** | When opening Messages from event modal, the **message header is getting cut off** behind the sticky topbar on mobile. | Mobile | Bug |
| F-9 | **Messages Tab (M-2)** | On mobile, fix **excessive scroll** in the messages view so conversation header stays sticky and chat scrolls internally. | Mobile | Bug |
| F-11 | **Discover (Next Up)** | Implement active actions for the three-dot `•••` button on the "Next up" card (e.g. View Ticket, Navigate, Cancel/Change). | All | Design |
| F-13 | **Notifications Tab (N-1)** | **Horizontal overflow/spill** in the Broadcaster simulator card on mobile screens. | Mobile | Bug |
| F-14 | **Notifications Tab (N-1)** | Broadcaster selector: For dancer role, only show booked classes, or hide the organizer broadcast simulator from standard dancer view. | All | Low/Design |
| F-15 | **Notifications Tab (N-1)** | Once a broadcast is sent, the broadcast simulator card/modal should **automatically close/collapse**. | All | UX |
| F-16 | **Notifications Tab (N-5)** | **Chat recipient mapping bug**: Clicking "Message Host" from a specific workshop notification must open the chat with that specific class instructor. | All | Critical Bug |
| F-17 | **Contact Modal (CT-1)** | Contact Support modal: Improve mobile padding/alignment and ensure clean in-app submission without breaking mailto links. | Mobile | UI/UX |
| F-19 | **CheckInCard / Ticket Modal** | Refine header gradient color to match vibrant primary red theme in CheckInCard. | Mobile / All | UI |
| F-20 | **CheckInCard (D-3)** | Shorten the QR box height and padding on mobile so it consumes less vertical viewport space when expanded. | Mobile | UI |