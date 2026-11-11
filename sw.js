/* GymRat – praca offline. Plik generowany przez narzedzia/build.js – nie edytuj ręcznie. */
var CACHE = 'gymrat-v3';
var PREFIX = 'gymrat-v';
var ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

/* Usuwa tylko własne stare wersje – inne aplikacje GymRat pod tym samym adresem mają osobne pamięci. */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Najpierw kopia z telefonu (działa bez zasięgu), w tle odświeżenie z sieci. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function () { return hit || cache.match('index.html'); });
        return hit || net;
      });
    })
  );
});
