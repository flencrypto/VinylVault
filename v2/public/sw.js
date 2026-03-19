/**
 * VinylVault v2 Service Worker
 * Enables offline support and satisfies PWA install criteria.
 *
 * Strategy:
 *   - App shell & static assets → Cache-first with network fallback
 *   - Navigation requests      → Network-first with offline fallback
 *   - API / third-party        → Network-only (no caching)
 */

const CACHE_VERSION = "vinylvault-v2-1";

/** Assets to pre-cache on install */
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/static/favicon.ico",
  "/static/icon-192.png",
  "/static/icon-512.png",
  "/static/icon-512-maskable.png",
];

/* ─── Install ─────────────────────────────────────────────────── */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ─── Activate ────────────────────────────────────────────────── */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ─── Fetch ───────────────────────────────────────────────────── */

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API routes and Next.js internals
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    return;
  }

  // Navigation requests → network-first, offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful, same-origin (basic) responses
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Try the cached version of this exact page first, then /offline, then /
          caches.match(request).then((cached) =>
            cached || caches.match("/offline").then((offline) =>
              offline || caches.match("/")
            )
          )
        )
    );
    return;
  }

  // Static assets → cache-first
  if (
    url.pathname.startsWith("/static/") ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }
});
