// 1. 앞으로 업데이트 하실 때마다 이 숫자를 v2, v3, v4... 로 올려주세요!
const CACHE_NAME = 'inil-planner-v3'; 
const ASSETS_TO_CACHE = [
  './index.html',
  './icon.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  // 새 버전이 발견되면 즉시 설치하도록 강제하는 코드 추가
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. 과거의 찌꺼기(예전 캐시)를 자동으로 지워주는 청소 코드 추가 (매우 중요!)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // 이름이 다른 옛날 캐시는 삭제
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
