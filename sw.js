const CACHE_NAME = "morning-alchemist-v4";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* INSTALL: ذخیره فایل‌های اصلی در کش هنگام نصب */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching app shell...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* ACTIVATE: حذف کش‌های قدیمی نسخه‌های قبلی */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* FETCH: استراتژی Network First با Fallback به Cache */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // اگر پاسخ معتبر بود، یک کپی از آن را در کش ذخیره کن
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // اگر اینترنت قطع بود، از کش استفاده کن
        return caches.match(event.request);
      })
  );
});
