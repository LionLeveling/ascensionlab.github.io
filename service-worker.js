const CACHE_NAME = 'ascensum-lab-v9';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.png?v=6', './icon-192.png?v=1', './icon-512.png?v=1', './apple-touch-icon.png?v=1'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone()));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.pathname.endsWith('/ascensum-intro.mp4')) {
    event.respondWith(
      caches.match(request).then(async cached => {
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }
  if (url.pathname.endsWith('/favicon.png')) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
