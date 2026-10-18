// Buhísimo service worker: offline app shell + audio.
// Strategy
//   * code and data (HTML, JS, CSS, JSON, manifest): NETWORK FIRST (4 s timeout), cache as
//     fallback, so an online student always gets the newest version;
//   * audio, pictures, icons: CACHE FIRST (they never change under the same name);
//   * Google Fonts and the confetti library (other sites): stale-while-revalidate.
// Updates: bump VERSION (and APP_VERSION in js/app.js) on every release. The new worker
// installs in the background, then the page tells it to take over (SKIP_WAITING) as
// soon as no lesson is running (js/app.js); old caches are deleted on activate.
const VERSION = "2026-10-18.l2";
const SHELL = `buhisimo-shell-${VERSION}`;
const MEDIA = `buhisimo-media-${VERSION}`;
const RUNTIME = "buhisimo-runtime";

const CODE = [
  "./", "index.html", "manifest.webmanifest",
  "css/tokens.css", "css/base.css", "css/components.css", "css/app.css", "css/layout.css", "css/unit.css",
  "js/app.js", "js/fonts.js", "js/icons.js", "js/lesson.js", "js/radio.js", "js/review.js", "js/shell.js",
  "js/sound.js", "js/speech.js", "js/store.js", "js/ui.js", "js/worldmap.js", "js/worldmap-data.js",
  "lesson-1-1.js", "unit-1-1.js", "path-data.js",
  "audio/manifest.json", "audio/manifest-extra.json", "radio/episodes.json", "radio/demo-1-1.json",
];
const PICTURES = [
  "assets/map-background.webp", "assets/salento-street.webp", "assets/family.webp",
  "assets/owl-explaining.webp", "assets/owl-celebrating.webp", "assets/owl-encouraging.webp", "assets/owl-thinking.webp",
  "assets/matilda.webp", "assets/matilda-wave.webp", "assets/matilda-surprised.webp", "assets/matilda-celebrate.webp", "assets/matilda-thinking.webp",
  "assets/max.webp", "assets/max-wave.webp", "assets/max-jump.webp", "assets/max-surprised.webp", "assets/max-celebrate.webp", "assets/max-thinking.webp",
  "assets/noun-mapa.webp", "assets/noun-mundo.webp", "assets/noun-capital.webp", "assets/noun-monumento.webp",
  "assets/flags/au.svg", "assets/flags/co.svg", "assets/flags/es.svg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png", "icons/apple-touch-icon.png",
  "radio/demo-1-1.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await shell.addAll(CODE.map((u) => new Request(u, { cache: "reload" })));
    const media = await caches.open(MEDIA);
    await media.addAll(PICTURES);
    // Every recorded clip listed in the audio manifests.
    const clips = new Set();
    for (const m of ["audio/manifest.json", "audio/manifest-extra.json"]) {
      try {
        const data = await (await shell.match(m)).json();
        for (const byVoice of Object.values(data.clips || {})) for (const p of Object.values(byVoice)) clips.add(p);
      } catch { /* a missing manifest just means fewer clips offline */ }
    }
    await Promise.all([...clips].map((p) => media.add(p).catch(() => {})));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith("buhisimo-") && key !== SHELL && key !== MEDIA && key !== RUNTIME) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "VERSION") event.source?.postMessage({ type: "VERSION", version: VERSION });
});

const isMedia = (url) => /\.(mp3|webp|png|svg|jpg|woff2?)$/i.test(url.pathname);

async function networkFirst(request) {
  const cache = await caches.open(SHELL);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request, { ignoreSearch: true }) || (request.mode === "navigate" && await cache.match("index.html"));
    if (hit) return hit;
    throw new Error("offline and not cached");
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request, { ignoreSearch: true });
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok && response.status === 200) (await caches.open(MEDIA)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  const fresh = fetch(request).then((r) => { if (r.ok || r.type === "opaque") cache.put(request, r.clone()); return r; }).catch(() => hit);
  return hit || fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.headers.has("range")) return; // let the browser stream media ranges itself
    event.respondWith(isMedia(url) ? cacheFirst(request) : networkFirst(request));
  } else if (/fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
