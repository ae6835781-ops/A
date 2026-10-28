const CACHE_NAME = 'tasks-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. تثبيت خدمة العامل (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] تم تخزين ملفات التطبيق بنجاح');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. تنشيط الخدمة وحذف النسخ القديمة (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] حذف النسخة القديمة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. اعتراض الطلبات وتقديم النسخة المخزنة أوفلاين (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجدنا الملف في الذاكرة، نعيده فوراً
      if (response) {
        return response;
      }
      // إذا لم يوجد، نحاول جلبه من الإنترنت
      return fetch(event.request).catch(() => {
        // إذا فشل الإنترنت، نعيد صفحة التطبيق الرئيسية كاحتياط
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// 4. دعم تحديث التطبيق في الخلفية
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
