const CACHE_NAME = 'pwa-tasks-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل الـ Service Worker الجديد فوراً
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // حذف النسخ القديمة من الذاكرة
          }
        })
      );
    }).then(() => self.clients.claim()) // السيطرة على جميع الصفحات المفتوحة فوراً
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // إذا نجح الاتصال بالإنترنت، قم بحفظ النسخة الجديدة في الذاكرة للمستقبل
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا لم يكن هناك إنترنت (Offline)، استخدم النسخة المحفوظة في الذاكرة
        return caches.match(event.request);
      })
  );
});
