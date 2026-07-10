const CACHE_NAME = "ariana-shell-v3";
const SHELL_URLS = ["/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation requests. On failure, fall back to a
// static, hash-independent offline page — NOT a cached copy of the app
// shell itself. A cached app-shell HTML references that deploy's hashed
// CSS/JS filenames; once a newer deploy ships, those exact files no
// longer exist on the server, so the stale cached page tries to load
// CSS/JS that 404s — unstyled, half-broken page, intermittently,
// whenever a request happens to fail right after a new deploy. This
// static page has zero dependency on any build hash, so it can never go
// stale this way.
self.addEventListener("push", (event) => {
  let data = { title: "Ariana Fashion", body: "", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON push payload — fall back to defaults above.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
  const { request } = event;
  if (request.method !== "GET" || request.url.includes("/admin") || request.url.includes("/api/")) {
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html").then((res) => res || fetch(request)))
    );
  }
});
