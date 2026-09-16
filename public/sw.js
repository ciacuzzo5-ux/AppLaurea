const CACHE_NAME = 'laurea-gallery-v19';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // CRITICAL: NEVER intercept POST/PUT/DELETE or API calls.
  // In iOS Safari/WebKit, intercepting POST multipart streams breaks chunked video uploads
  // and causes the connection to close prematurely ("Unexpected end of form").
  if (event.request.method !== 'GET') {
    return;
  }
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Always fetch static files from network first so users get the latest updates immediately
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
