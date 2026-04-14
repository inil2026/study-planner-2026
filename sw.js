// ✅ 버전 올릴 때마다 숫자만 바꾸세요 (v5 → v6 → v7...)
const CACHE_NAME = 'inil-planner-v6';
const ASSETS_TO_CACHE = [
  './index.html',
  './icon.png',
  './manifest.json'
];

// 설치: 새 버전 발견 즉시 설치
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      // 이전 캐시 삭제
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] 구버전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        )
      ),
      // 즉시 모든 클라이언트 제어 (새로고침 없이 적용)
      self.clients.claim()
    ])
  );
});

// ✅ 네트워크 우선 전략 (캐시 우선 X)
// 항상 서버에서 최신 파일을 받고, 실패 시에만 캐시 사용
self.addEventListener('fetch', (e) => {
  // GAS(구글 앱스 스크립트) 요청은 캐시하지 않음
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // index.html, icon, manifest는 네트워크 우선
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // 네트워크 응답 성공 시 캐시 업데이트
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 네트워크 실패 시에만 캐시 사용 (오프라인 대응)
        return caches.match(e.request);
      })
  );
});
