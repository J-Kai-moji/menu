const CACHE = 'family-menu-v8';
const ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

// Install: pre-cache static shells (NOT index.html or data.json — those stay fresh)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML & data, cache-first for static
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // index.html and data.json: network-first (always get latest)
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/data.json') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets: cache-first, network fallback
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
    )
  );
});
