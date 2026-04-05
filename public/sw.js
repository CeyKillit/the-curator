const CACHE_NAME = "curator-v1";

// Recursos estáticos para cache offline
const STATIC_ASSETS = [
  "/",
  "/home",
  "/offline",
];

// Instala e faz cache dos assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Limpa caches antigos ao ativar
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, cache como fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora requests não-GET e chamadas de API
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.url.includes("supabase.co")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Guarda no cache se for um request de navegação ou asset estático
        if (response.ok && (request.mode === "navigate" || request.destination === "style" || request.destination === "script" || request.destination === "font")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        // Sem rede: tenta o cache, ou retorna página offline
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("/offline");
          return new Response("", { status: 503 });
        })
      )
  );
});
