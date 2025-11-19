// sw.js

// A version for the cache. Increment this to force an update.
const CACHE_VERSION = 1;
const CACHE_NAME = `elv-assistente-cache-v${CACHE_VERSION}`;

// A list of files to cache on installation.
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// --- EVENT LISTENERS ---

// 1. Install the service worker and cache the app shell.
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache. Caching app shell.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker.
  );
});

// 2. Activate the service worker and clean up old caches.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients.
  );
});

// 3. Intercept network requests and serve from cache if available.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Always bypass cache for API calls to Supabase and non-GET requests.
  if (request.method !== 'GET' || request.url.includes('supabase.co')) {
    // For non-GET requests or API calls, just do a network request.
    event.respondWith(fetch(request));
    return;
  }

  // Network-first for HTML pages to get updates quickly.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If fetch is successful, cache the new response.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, return the cached page.
          return caches.match(request).then(response => response || caches.match('/index.html'));
        })
    );
    return;
  }
  
  // Cache-first for all other static assets (CSS, JS, images, fonts).
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Return from cache if found.
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from network, cache the response, and return it.
      return fetch(request).then(networkResponse => {
        // Check for valid, cacheable responses.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});


// --- PUSH NOTIFICATION LOGIC ---

self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  
  try {
    const data = event.data.json();
    const title = data.title || 'Novo Alerta';
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('Error parsing push data', e);
    const title = 'Novo Alerta';
    const options = {
      body: event.data.text(),
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: '/'
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus().then(c => c.navigate(urlToOpen));
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
