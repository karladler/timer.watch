var CACHE_NAME = 'static-cache';

var urlsToCache = [
    '.',
    './NoSleep.min.js',
    './zingtouch.min.js',
    './main.js',
    './styles.css',
    './index.html',
    './images/icon256x256.png',
    './manifest.json'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// fetch and update for next time
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                var fetchPromise = fetch(event.request).then(function (networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                })
                return response || fetchPromise;
            })
        })
    );
});
