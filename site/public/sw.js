// HELPINhex service worker — Phase 1 shell
// cache-first for same-origin GETs, offline fallback to the cached homepage.
const CACHE = 'hx-v1';
const SHELL = ['/', '/ask/', '/today/', '/glossary/', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      } catch {
        const home = await caches.match('/');
        return home || Response.error();
      }
    })()
  );
});
