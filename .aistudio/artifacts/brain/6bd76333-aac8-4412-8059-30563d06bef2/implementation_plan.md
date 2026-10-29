# Active Mobile Preview Access & 404 Resolution Plan

Resolve the "Error: Page not found (The requested URL was not found on this server)" encountered when accessing `toolkit-pro-in-1.ai.studio`, provide the verified official AI Studio preview URLs, and ensure full mobile responsiveness and touch ergonomics across the suite of 218 tools.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Root Cause Identified**: The URL shown in the mobile browser screenshot (`toolkit-pro-in-1.ai.studio`) is an invalid address not provisioned by Google Cloud/AI Studio. The active, live-deployed shared preview URL for this project is:
> **`https://ais-pre-tt2qx6jtffuy6fxmpe2idc-660322268308.asia-east1.run.app`**
>
> All application code, 218 client-side tools, and assets are fully built and operational on this Cloud Run preview instance.

- **Confirmed Decision 1**: Use the official AI Studio shared Cloud Run preview link as the primary access point on mobile.
- **Confirmed Decision 2**: Verify and optimize mobile layout, touch targets ($\ge 44\text{px}$), and hash-based deep linking for mobile Chrome.

---

## 1. Overview & Core Concept

- **What It Does**: Toolkit Pro provides 218+ client-side, zero-AI, 100% private developer, text, image, calculator, and PDF tools that execute entirely in the browser.
- **Target Audience / Persona**: Mobile and desktop users needing quick, dependable utilities without signups, tracking, or server file uploads.
- **Key Value**: Instant, zero-latency execution directly on the user's device with complete client-side privacy.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. User opens the official preview link on mobile Chrome (`https://ais-pre-tt2qx6jtffuy6fxmpe2idc-660322268308.asia-east1.run.app`).
  2. Mobile header displays brand wordmark, quick search trigger, category chips with horizontal scrolling, and quick access to pinned/favorite tools.
  3. Selecting any tool opens the full-screen mobile tool runner with tactile action buttons, copy-to-clipboard feedback toasts, and a clean back navigation trigger.
- **Visual Identity & Theme**:
  - Clean neutral palette with high-contrast accent (`#2563EB` blue in light mode, `#5B9DFF` in dark mode).
  - Anti-slop typography pairing: `Poppins` display wordmark, `Inter` body prose, and `IBM Plex Mono` for tabular metrics and code blocks.
  - Generous touch hitboxes ($\ge 44 \times 44\text{px}$) across all mobile buttons, tabs, and inputs in compliance with mobile touch guidelines.
- **Interactive Feedback**:
  - Micro-animations ($\le 200\text{ms}$) on tap and copy actions.
  - Toast confirmation notifications for copied results and favorite toggles.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Addressing the 404 URL Mismatch**:
  - *Chosen Approach*: Document and direct mobile access to the official Cloud Run preview URL (`ais-pre-...run.app`), while ensuring internal 404 handling (`ToolNotFoundView`) cleanly handles any invalid tool hash slugs.
  - *Why*: Google AI Studio hosts preview containers on secure Google Cloud Run endpoints. Subdomains of `ai.studio` are not routing endpoints for applet preview instances.
  - *Alternatives Considered*: Attempting DNS rewrites (not supported inside the container runtime).
- **Decision 2: Mobile Viewport & Hash Navigation Hardening**:
  - *Chosen Approach*: Validate that deep-linked URLs (such as `#tool=word-counter` or `#category=pdf`) resolve instantaneously without full-page reloads, preventing server 404s even if a user refreshes on mobile.
  - *Why*: Client-side hash routing (`#tool=...`) never triggers a server-side 404 on static hosts or Cloud Run containers.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Mobile Browser                       │
│  Chrome on Android (URL: https://ais-pre-...run.app)   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Vite Client                        │
│   • Hash-based router (#tool=..., #all-tools)          │
│   • Theme & Language state (localStorage)              │
│   • 218 Deterministic Tool Engines                     │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     DOM / Canvas        │ │    Local Storage        │
│ • Client image resize   │ │ • Recent tools          │
│ • Client PDF operations │ │ • Pinned / Favorites    │
│ • Text diffing & format │ │ • Privacy preferences   │
└─────────────────────────┘ └─────────────────────────┘
```

- **Execution Steps**:
  1. Confirm build integrity with `compile_applet` (completed successfully).
  2. Inspect mobile navigation bars and touch targets to guarantee $\ge 44\text{px}$ touch hitboxes on mobile screens.
  3. Provide the verified live URL and step-by-step verification instructions to the user.
