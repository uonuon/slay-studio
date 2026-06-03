# Slay Studio

Online booking for **Slay Studio** — braids in Fifth Settlement, New Cairo.
Live at **https://slay-studio.com**

Next.js (App Router) + React + Firebase (Firestore + Auth). Clients browse styles and
book a time slot; the owner manages everything from a built-in dashboard.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000  (LIVE Firebase; localhost is auto-authorised)
```
Add `?demo` to any URL to use **demo mode** (saves only in your browser, no Firebase).

## Deploy (Vercel)
1. Import this repo in Vercel → Framework preset **Next.js** (auto-detected) → Deploy.
2. Add the custom domain **slay-studio.com** in Vercel → Settings → Domains.
3. In **Firebase → Authentication → Settings → Authorised domains**, add:
   `slay-studio.com`, `www.slay-studio.com`, and your `*.vercel.app` URL.

## Firestore security rules
See `firestore.rules` — paste into Firebase → Firestore → Rules → Publish.
Client phone numbers stay private (only the signed-in owner can read bookings).

## Structure
```
app/         layout, global styles, page
components/  App, Hero, Home, Booking, Confirm, Login, Dashboard
lib/         config, util (+ availability logic), firebase, store
public/      icons, og-image, manifest
```

## Configuration
Studio details (services, prices, hours, WhatsApp, Instapay, rent) live in
`lib/config.js` as defaults, and are editable at runtime from the dashboard **Setup** tab.
