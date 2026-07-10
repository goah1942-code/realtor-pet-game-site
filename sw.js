const CACHE_PREFIX = "realtor-pet-game";
const CACHE_NAME = `${CACHE_PREFIX}-v13`;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20260710-guaranteed-v21",
  "./app.js?v=20260710-guaranteed-v21",
  "./site.webmanifest",
  "./pet_content_manifest.json",
  "./assets/app-icon.svg",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./assets/share-card.svg",
  "./assets/share-card.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || isRuntimeFile(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheableAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

function isRuntimeFile(pathname) {
  return [
    "/index.html",
    "/app.js",
    "/styles.css",
    "/site.webmanifest",
    "/pet_content_manifest.json",
  ].some((suffix) => pathname.endsWith(suffix));
}

function isCacheableAsset(pathname) {
  return /\/assets\/.+\.(svg|png|jpe?g|webp|avif)$/i.test(pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match("./") || await cache.match("./index.html");
    if (fallback) return fallback;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}
