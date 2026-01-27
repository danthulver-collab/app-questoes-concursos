const CACHE_NAME = 'quiz-app-v2-clean'; // 🔥 Atualizado para forçar limpeza
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/og-image.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch com estratégia Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 🔥 NÃO CACHEAR: APIs, dados dinâmicos, autenticação
  const noCachePatterns = [
    '/api/',
    'supabase.co',
    '/auth/',
    '/login',
    '/logout',
    'graph.facebook.com',
    'accounts.google.com'
  ];
  
  const shouldNotCache = noCachePatterns.some(pattern => 
    event.request.url.includes(pattern)
  );
  
  // Se for POST/PUT/DELETE, não cachear
  if (event.request.method !== 'GET' || shouldNotCache) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone da resposta
        const responseToCache = response.clone();
        
        // Só cachear se for sucesso (200-299)
        if (response.status >= 200 && response.status < 300) {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Se falhar, tenta buscar do cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Se não tiver no cache, retorna página offline
            return caches.match('/index.html');
          });
      })
  );
});
