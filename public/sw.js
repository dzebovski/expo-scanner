const CACHE = "expo-scanner-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/manifest.json", "/icon-192.png"])
    )
  );
  self.skipWaiting();
});
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match("/").then((r) => r || caches.match(e.request))
    )
  );
});
