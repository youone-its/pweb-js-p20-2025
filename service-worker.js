const CACHE_NAME = "pweb-cache-v1";
const urlsToCache = [
  "/",
  "/form.html",
  "/recipes.html",
  "/form.css",
  "/styles.css",
  "/form.js",
  "/recipes.js",
  "/form.png"
];

// install & cache semua file
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// fetch handler
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // kembalikan dari cache kalau ada
      return response || fetch(event.request);
    })
  );
});
