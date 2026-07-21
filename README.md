# ShopsApp — Version 3

ShopsApp is a full-stack e-commerce demo application built with **Angular** on the frontend and **Laravel** on the backend. **Version 3** takes the Version 2 application and converts it into a fully installable, offline-capable **Progressive Web App (PWA)** — users can install it like a native app, keep browsing products without a connection, and safely make changes offline that sync automatically once they're back online.

## Tech Stack

- **Angular** (standalone components, signals) — frontend framework
- **Laravel** — backend REST API
- **SQLite** — data storage, accessed via Eloquent ORM

### Key libraries & packages

- **Laravel Sanctum** — token-based API authentication
- **ngx-translate** — internationalization (English/Arabic, RTL)
- **Angular Material** — UI components
- **Leaflet.js** — interactive store-locator map
- **@angular/service-worker (ngsw)** — Angular's built-in service worker for asset/data caching
- **IndexedDB** — client-side storage for the offline operation queue
- **Background Sync API** — used via a custom service worker to retry queued actions once back online

## What's New in Version 3

Version 3 is a PWA upgrade on top of the Version 2 app. Nothing about the core shopping/admin experience changed — the goal was to make the app work reliably regardless of connection quality, and to make it feel like an installed app rather than just a browser tab.

### Installable app

The app ships a web manifest (`manifest.webmanifest`) with `display: "standalone"`, so it can be installed to a device's home screen or desktop and launches in its own window, without browser chrome. A custom install prompt is built around the native `beforeinstallprompt` event (see the `Install` service): the browser's default install banner is suppressed, and the app instead exposes a `canInstall` signal the UI can use to show its own "Install" button, triggering the native prompt on demand.

### Update notifications

When a new version of the app is deployed, users aren't left silently running stale code. The `Update` service uses Angular's `SwUpdate` to listen for `VERSION_READY` events (checking every 30 minutes), and when a new version is detected, opens an Angular Material dialog (`UpdateDialog`) asking the user to reload. If they confirm, the new version is activated and the page reloads; if not, they keep working on the current version until they're ready.

### Offline browsing

Angular's service worker is configured via `ngsw-config.json` with separate caching rules for static assets and API data:

- **`assetGroups`** prefetch the app shell (HTML/CSS/JS/manifest) on install, and lazily cache images and i18n translation files as they're used.
- **`dataGroups`** cache API responses: product listings/details use a `freshness` strategy (try the network first, fall back to cache, 1-day max age), while product images use a `performance` strategy (serve from cache first, 7-day max age) for fast, reliable loading.

The practical effect: once a user has browsed the app, previously viewed products and their images remain viewable even with no internet connection.

### Offline actions with background sync

This is the standout feature of Version 3. Previously, adding, editing, or deleting a product while offline would simply fail. Now, if one of those requests can't reach the server, the action is saved into a local queue (stored in IndexedDB via the `OfflineQueue` service) instead of being lost. The app registers a background sync request with the browser, and as soon as the connection comes back — even if the app itself isn't open — the browser wakes up a custom service worker that replays each queued action against the API in order, removing it from the queue once it succeeds.

This means a user can keep managing products while offline, and trust that their changes will make it to the server without needing to remember to retry anything themselves.

Under the hood, this required a **custom service worker** (`custom-sw.js`) that `importScripts`s Angular's own generated `ngsw-worker.js` and layers a `sync` event listener on top of it, since Angular's built-in service worker doesn't natively support the Background Sync API.

## Setup / Installation Instructions

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

### PWA-specific notes

- **HTTPS or localhost required**: service workers only register in secure contexts. This is a browser requirement, not something specific to this project — `ng serve` on `localhost` works fine for development, but a real deployment needs HTTPS.
- **Service worker only runs in production builds**: Angular's service worker is disabled in `ng serve` (dev mode). To see PWA behavior (install prompts, offline caching, update notifications), you need a production build:

  ```bash
  ng build
  ```

- **Testing offline behavior locally**: after building, serve the compiled output with a static file server (the dev server won't do), for example:

  ```bash
  npx http-server dist/frontend/browser -p 8080
  ```

  Then open the app in Chrome and use **DevTools → Application → Service Workers** to confirm the service worker is registered and active, and the **Network tab's "Offline" checkbox** to simulate a dropped connection and verify cached browsing and queued offline actions.

## Usage

1. **Install the app** — visit the site, and when prompted (or via the in-app install button), add ShopsApp to your home screen or desktop for a native, standalone experience.
2. **Browse offline** — products and images you've already viewed stay available even without a connection.
3. **Make changes offline** — add, edit, or delete a product while offline; the change is queued locally instead of failing.
4. **Automatic sync** — once your connection returns, queued changes are sent to the server automatically, with no need to redo anything.
5. **Stay up to date** — when a new version of the app is deployed, you'll see a prompt offering to reload and pick up the latest version.

## Screenshots

### Home / Product Listing

### Store Locator Map

### Install Prompt

### Offline Mode

### Update Notification
