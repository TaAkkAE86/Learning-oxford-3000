const CACHE_NAME = 'oxford-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './data.json',
  './manifest.json'
];

// ติดตั้ง Service Worker และบันทึกไฟล์ลง Cache (เครื่องมือถือ)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ดึงข้อมูลจาก Cache มาใช้เวลาไม่มีเน็ต
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // เจอใน Cache ให้โหลดจาก Cache
        }
        return fetch(event.request); // ไม่เจอให้โหลดจากเน็ต
      })
  );
});
