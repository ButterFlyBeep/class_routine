const CACHE_NAME = 'class-schedule-v4';
const urlsToCache = [
  './',
  './login.html',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Roboto:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache =>
        // Cache each URL independently — if one fails (e.g. a CDN hiccup),
        // it won't take the rest of the offline cache down with it.
        Promise.allSettled(urlsToCache.map(url => cache.add(url)))
      )
      // Take over immediately instead of waiting for a second reload —
      // important right after a fresh login, so offline works right away.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        // Offline and not in cache: for a page navigation, fall back to the
        // cached app shell instead of showing the browser's offline error.
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
