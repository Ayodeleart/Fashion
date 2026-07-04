const CACHE_NAME = "ariana-admin-v2";
const APP_SHELL = ["/admin-manifest.json", "/admin-icon-192.png", "/admin-icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Deliberately narrow: only serve the exact static app-shell files
// (manifest + icons) from cache-first, for offline install support.
// Everything else — page navigations, Next.js's RSC data fetches for
// client-side routing, all /api/admin/* calls — passes through
// completely untouched. The previous version intercepted anything
// with "/admin" in the URL (including POST requests and RSC payload
// fetches) and tried to cache all of it, which risked interfering
// with Next's fast client-side navigation between admin pages.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!APP_SHELL.includes(url.pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
