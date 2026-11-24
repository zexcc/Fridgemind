# FridgeMind — Product prototype

## Run it
- Open `index.html` in a browser for local testing.
- For installable PWA/offline support, deploy the folder to an HTTPS static host (for example Cloudflare Pages, GitHub Pages, or Replit static hosting).
- On iPhone Safari, open the deployed URL, tap Share, then Add to Home Screen.

## Implemented in this prototype
- Food inventory with category, quantity, storage, dates, condition and nutrition fields
- Date-based status flags and manual condition flags
- Camera/photo selection and preview (not AI image analysis)
- Daily meal and macro log
- Basic ingredient-based meal suggestions
- Sensor integration placeholder (no hardware connection)
- Local browser persistence, JSON export/import and delete controls
- PWA manifest and service worker shell cache

## Not connected yet
- Actual AI image model for ingredient/visible-defect suggestions
- Trusted nutrition database and barcode lookup
- User accounts, cloud sync and multi-device sharing
- Real Bluetooth/Wi-Fi temperature sensors and push notifications
- Clinical-grade health recommendations or food-safety certification

## Production architecture recommendation
Frontend/PWA → authenticated API → database + object storage → AI vision service + verified nutrition provider → notification worker.
Keep image analysis as a *review assistant*: never label food safe or unsafe solely from a photo. Preserve confidence, model/version, user confirmation and source provenance. Use least-privilege access, encryption, consent, retention/deletion controls, backups and security testing. Healthcare-facing features require privacy/legal review and clinical validation in each launch market.

## Data note
This demo stores information in browser localStorage on one device. It is not encrypted cloud storage and should not be used for sensitive medical records.
