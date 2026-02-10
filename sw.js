/* ============================================
   UHAS-HPI Service Worker
   Offline-first, caching for PWA
   ============================================ */

const CACHE_NAME = 'uhas-hpi-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './questions.js',
  './manifest.json',
  './assets/css/main.css',
  // JS files
  './assets/js/config.js',
  './assets/js/db.js',
  './assets/js/participant.js',
  './assets/js/offline.js',
  './assets/js/exchange.js',
  './assets/js/dashboard.js',
  './assets/js/pwa-install.js',
  './assets/js/auth.js',
  './assets/js/auth-guard.js',
  './assets/js/firebase-config.js',
  './assets/js/sw-updater.js',
  './assets/js/sync.js',
  // Vendor JS/CSS
  './vendor/bootstrap/bootstrap.bundle.min.js',
  './vendor/bootstrap/bootstrap.min.css',
  './vendor/bootstrap-icons/bootstrap-icons.min.css',
  './vendor/bootstrap-icons/fonts/space-grotesk.css',
  './vendor/firebase/firebase-app-compat.js',
  './vendor/firebase/firebase-auth-compat.js',
  './vendor/firebase/firebase-firestore-compat.js',
  './vendor/firebase/firebase-storage-compat.js',
  './vendor/tailwind/tailwind.min.css',
  // Icons
  './assets/icons/icon-192.svg',
  // Images
  './assets/img/uhas.jpg',
  './assets/img/hpi.png',
];

/**
 * Install event: Cache assets
 */
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('[SW] Some cache items are not available:', err);
        // Don't fail if some items don't exist
        return cache.addAll(urlsToCache.filter(url => {
          // Filter out URLs that might not be available
          return !url.includes('svg') && !url.includes('jpg') && !url.includes('png');
        }));
      });
    })
  );
  globalThis.skipWaiting();
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  globalThis.clients.claim();
});

/**
 * Fetch event: Network first, fallback to cache
 */
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page if available
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
