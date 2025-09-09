# AOG Conference Asia 2025 — Multi-GMS QR Check-In System (Overview)

A unified QR check-in system used across multiple GMS locations for AOG Conference Asia 2025.  
It provides a streamlined on-site flow for scanning attendee QR codes, verifying details, and recording attendance with instant, reliable feedback.  
The same system also powers automated pre-event emails that deliver each registrant’s personalized QR code.

---

## What it does

- **On-site check-in**
  - Live camera scanning or image upload (mobile + desktop).
  - Human-readable review panel before updating.
  - Writes “Checked In” to the appropriate status column (Toolkit / Event).
  - Detects and blocks mismatched or mistaken payment entries.
  - Clear success, duplicate, and not-found messages for volunteers.

- **Multi-location support**
  - Volunteers must first choose their **GMS location** (KL, Taiwan, ROSC Singapore, Hongkong).
  - A Google Sheet ID or link is entered to bind the check-in session to the correct dataset.
  - The system then locks to that configuration before scanning is enabled.

- **Email delivery**
  - On form submission, attendees receive a branded HTML email.
  - The email body is managed as a Google Doc template with merge tags.
  - A QR image (encodes the attendee’s key fields) is embedded in the message.

- **Resilience & diagnostics**
  - Health endpoint to verify deployment status.
  - Locking + retry to reduce transient storage errors.
  - Graceful handling of camera permissions, slow networks, and repeated scans.

---

## High-level architecture

```
Browser UI (QR scan / upload + setup gate)
        │
        └─> Serverless API (Vercel)
               │
               └─> Google Apps Script Web App
                        ├─ Validates request & payload
                        ├─ Resolves correct GMS + Sheet ID
                        ├─ Finds attendee row in Google Sheets (email-first)
                        └─ Updates status & returns JSON
```

- **Frontend**: Zero-framework HTML/CSS with `html5-qrcode`. Includes a **setup gate** (GMS selector + sheet ID input) before scanning is allowed.
- **API layer**: Serverless proxy ensures secrets are kept off the client, prevents direct GAS exposure, and avoids CORS issues.
- **Backend**: Google Apps Script (Web App) reads/writes the appropriate country-specific sheet. A trigger handles email workflows.

> All identifiers (sheet IDs, deployment URLs, secrets) are kept private and not included here.

---

## Data flow (simplified)

1. **Email phase (pre-event):**  
   Registration triggers an email merge, sending personalized QR codes to attendees.

2. **Check-in setup:**  
   Volunteers select their **GMS location** and paste the relevant **Google Sheet link/ID**. The system extracts the ID and confirms setup before unlocking scanning.

3. **Check-in phase (on-site):**  
   QR is scanned or uploaded. The UI displays parsed info. On confirmation, the backend updates the correct sheet’s row.

4. **Feedback:**  
   JSON response is shown in the UI: “Checked in row …”, “Already checked in …”, “QR not found …”, or “Check in blocked, Payment mismatch”.

---

## Matching strategy (row resolution)

- **Primary key:** Email (case-insensitive).
- **Fallback:** Name + phone for disambiguation.
- **Goal:** Consistent matches across all GMS locations with minimal false positives.

---

## UX highlights

- **Setup gate:** Users cannot access scanning until GMS and sheet are chosen.
- **Review panel:** Displays name, phone, university, CG info, allergies, receipt, and payment field.
- **Volunteer-friendly controls:** Sticky action bar, big buttons, optimistic toasts.
- **Mobile ready:** Works on device cameras or via file upload.

---

## Reliability & security

- **Multi-org isolation:** Each GMS maintains its own sheet; setup step prevents accidental cross-event updates.
- **No secrets in browser:** API handles authentication with backend.
- **Lock + retry:** Reduces Apps Script concurrency errors.
- **Timeout guards:** Proxy cancels stalled backend requests.

---

## Accessibility & performance

- Focus states, color contrast, and large hit targets built in.
- Favors rear-facing camera, with fallback to environment mode.
- Lightweight, single-page architecture with minimal dependencies.

---

## Operational notes

- **Healthcheck:** Returns version, timestamp, and available methods per deployment.
- **Observability:** Messages clearly indicate the outcome for volunteers.
- **Extensibility:** More GMS entries or dashboards can be added without redesign.

---

## Limitations (by design)

- **Manual setup required:** Volunteers must paste the correct Sheet ID per location.
- **Portfolio redactions:** Identifiers and URLs are omitted here.
- **QR payload contract:** Requires consistent registration form structure across all GMS.

---

## Roadmap ideas

- Pre-filled sheet ID per GMS to reduce setup friction.  
- Multi-event dashboard with live stats across all GMS.  
- Role-based volunteer logins.  
- SMS fallback for email delivery issues.

---

## Credits

- **html5-qrcode** for in-browser scanning.  
- **Google Apps Script** for backend logic.  
- **Vercel** for serverless API proxy.  

---

## License & ownership

This implementation, configuration, and content are internal to the organization.  
This document is an **overview for portfolio purposes** and intentionally excludes sensitive details.
