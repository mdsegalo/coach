/* Coach service worker. Bump VERSION when you change index.html/program.js so phones pick it up. */
const VERSION = "coach-v1.5.0";
const SHELL = ["./", "index.html", "program.js", "coach.json", "history.json", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "vendor/zxing.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* Network first (2.5 s timeout) so coach.json / program updates arrive fast; cache when offline at the gym. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.url.split("?")[0];
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const net = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))]);
      if (net && net.ok) cache.put(key, net.clone());
      return net;
    } catch (err) {
      const hit = await cache.match(key) || await cache.match(req, { ignoreSearch: true }) || (req.mode === "navigate" ? await cache.match("index.html") : null);
      if (hit) return hit;
      throw err;
    }
  })());
});
