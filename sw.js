/* Monetag push/Multitag worker (zone 11785465). Monetag also reads this file
   to verify the site, so its three lines are kept verbatim and first:
   importScripts only runs while the worker is being evaluated, never later.
   The remote script is fetched from 3nbf4.com at runtime, so that domain
   controls what runs here and can change it without a commit to this repo.
   Kept above, not instead of, the caching worker below -- a site has one
   service worker at this scope, so overwriting this file would have dropped
   offline support and app install. */
self.options = {
    "domain": "3nbf4.com",
    "zoneId": 11785465
};
self.lary = "";
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw');

/* Toolkit Pro service worker.
   Purpose: let the site install as an app and keep already-visited tools
   working with no network at all -- consistent with the "everything runs
   locally in your browser" promise. No analytics, no external caching,
   nothing beyond same-origin static files. */

const CACHE_VERSION = 'tp-v12';
/* Relative (no leading slash) so these resolve correctly whether the site
   is hosted at a domain root or under a GitHub Pages project subpath --
   relative URLs in a service worker resolve against the SW script's own
   location, not the page that registered it. */
const CORE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'favicon/favicon.ico',
  'favicon/favicon-16.png',
  'favicon/favicon-32.png',
  'favicon/icon-192.png',
  'favicon/icon-512.png',
  'favicon/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests -- never touch ad-network calls
  // or cross-origin font/script requests.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // HTML pages: network-first (so edits always show up when online),
  // falling back to cache, then to the cached homepage, when offline.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('index.html'))
        )
    );
    return;
  }

  // Static assets (css/js/images already inlined in HTML, plus icons):
  // cache-first, then update the cache in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
